<template>
    <div class="report-share-portal">
        <!-- Professional Header -->
        <header class="portal-header">
            <div class="header-container">
                <div class="brand">
                    <img src="@/assets/logo-small.png" alt="Logo" class="brand-logo" v-if="hasLogo" />
                    <span class="brand-name">RouteSurvey<span class="brand-suffix">Secure</span></span>
                </div>
                <div class="header-status">
                    <span class="status-badge" v-if="!isExpired && isAccessible">
                        <i class="bi bi-shield-check"></i> Official Record
                    </span>
                </div>
            </div>
        </header>

        <!-- Access Control: Password -->
        <div v-if="requiresPassword && !passwordEntered" class="portal-body center-content">
            <div class="auth-card">
                <div class="icon-circle lock">
                    <i class="bi bi-lock-fill"></i>
                </div>
                <h3>Secure Document</h3>
                <p>This report is password protected. Please enter your credentials to view.</p>
                <div class="input-group">
                    <input type="password" v-model="password" placeholder="Enter Password" class="auth-input" @keyup.enter="submitPassword" />
                    <button class="auth-btn" @click="submitPassword" :disabled="!password">Acces</button>
                </div>
                <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
            </div>
        </div>

        <!-- Access Control: Expired -->
        <div v-else-if="isExpired" class="portal-body center-content">
            <div class="status-card">
                <div class="icon-circle error">
                    <i class="bi bi-hourglass-bottom"></i>
                </div>
                <h3>Link Expired</h3>
                <p>This secure link is no longer active. Please contact the sender for a new link.</p>
            </div>
        </div>

        <!-- Access Control: Denied -->
        <div v-else-if="!isAccessible" class="portal-body center-content">
            <div class="status-card">
                 <div class="icon-circle error">
                    <i class="bi bi-slash-circle"></i>
                </div>
                <h3>Access Denied</h3>
                <p>You do not have permission to view this document.</p>
            </div>
        </div>

        <!-- Main Content: Document Viewer -->
        <div v-else class="portal-body">
            <div class="document-container">
                <!-- Document Header -->
                <div class="doc-header">
                    <div class="doc-title-row">
                        <h1>{{ currentReportGeneration?.fileName || 'Survey Report' }}</h1>
                        <span class="version-tag">Version {{ currentReportVersion || '1.0' }}</span>
                    </div>
                    <div class="doc-meta-row">
                        <span><i class="bi bi-calendar3"></i> Published {{ formatDate(currentReportGeneration?.dateAdded) }}</span>
                        <span class="separator">•</span>
                        <span><i class="bi bi-geo-alt"></i> {{ currentRoute?.title }}</span>
                    </div>
                </div>

                <!-- PDF Viewer Envelope -->
                <div class="doc-envelope">
                    <div v-if="loading" class="loading-state">
                        <div class="spinner"></div>
                        <span>Loading secure document...</span>
                    </div>

                    <div v-else-if="pdfUrl" class="pdf-wrapper">
                         <div class="pdf-toolbar">
                             <span>Page 1 of 1</span> <!-- Placeholder for real page count -->
                             <div class="pdf-actions">
                                 <button class="action-btn" @click="downloadPdf">
                                     <i class="bi bi-download"></i> Download PDF
                                 </button>
                             </div>
                         </div>
                         <iframe :src="pdfUrl" class="pdf-viewer" title="Secure Report Viewer"></iframe>
                    </div>

                    <div v-else class="error-state">
                        <i class="bi bi-file-earmark-x"></i>
                        <p>Document content unavailable.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Professional Footer -->
        <footer class="portal-footer">
            <p>Secured by RouteSurvey Console &copy; {{ new Date().getFullYear() }}</p>
            <div class="footer-links">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Support</a>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import ShareCenterController from "@/controllers/share_center/share_center_controller";

const currentRoute = ref(null);
const currentReportGeneration = ref(null);
const shareData = ref(null);
const isExpired = ref(false);
const isAccessible = ref(false);
const requiresPassword = ref(false);
const passwordEntered = ref(false);
const password = ref("");
const passwordError = ref("");
const loading = ref(false);
const pdfUrl = ref("");

// Computed-ish
const hasLogo = ref(false) // Check if asset exists in real impl
const currentReportVersion = ref('1.0') // Placeholder until backend sends version number

const getDataFromUrl = async () => {
    loading.value = true;
    try {
        const res = await ShareCenterController.getReportRouteShareFromUrl(window.location.href);
        if (res.result) {
            currentRoute.value = res.route;
            currentReportGeneration.value = res.reportGeneration;
            shareData.value = res.data;
            isExpired.value = res.isExpired;
            requiresPassword.value = shareData.value.requirePassword;

            if (!requiresPassword.value) {
                isAccessible.value = true;
                await loadPdf();
                await ShareCenterController.incrementReportRouteShareView(shareData.value.id);
            }
        } else {
            // Handle invalid link broadly
            isAccessible.value = false
        }
    } catch (error) {
        console.error(error);
        isAccessible.value = false;
    }
    loading.value = false;
}

const loadPdf = async () => {
    if (!currentReportGeneration.value?.filePath) return;
    const baseUrl = import.meta.env.VITE_MASL_API_BASE_URL;
    pdfUrl.value = `${baseUrl}/${currentReportGeneration.value.filePath}`;
}

const submitPassword = async () => {
    if (!password.value) return;
    if (password.value === shareData.value.password) {
        passwordEntered.value = true;
        isAccessible.value = true;
        await loadPdf();
        await ShareCenterController.incrementReportRouteShareView(shareData.value.id);
    } else {
        passwordError.value = "Incorrect password.";
    }
}

const downloadPdf = () => {
    window.open(pdfUrl.value, '_blank');
}

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

onMounted(() => {
    getDataFromUrl();
});
</script>

<style scoped>
.report-share-portal {
    background: var(--bg-base); /* Light grey enterprise background */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--text-primary);
}

/* Header */
.portal-header {
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    padding: 0 1rem;
    height: 64px;
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.brand-name {
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--text-primary);
}

.brand-suffix {
    color: var(--text-tertiary);
    font-weight: 400;
}

.status-badge {
    background: #f0fdf4;
    color: #15803d;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid #bbf7d0;
}

/* Body */
.portal-body {
    flex: 1;
    padding: 2rem 1rem;
}

.center-content {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Auth / Status Cards */
.auth-card, .status-card {
    background: var(--bg-surface);
    padding: 3rem;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%), 0 2px 4px -1px rgb(0 0 0 / 6%);
    text-align: center;
    max-width: 420px;
    width: 100%;
}

.icon-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 1.5rem;
}

.icon-circle.lock { background: var(--accent-surface); color: var(--accent); }
.icon-circle.error { background: #fef2f2; color: var(--status-blocking); }

.input-group {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
}

.auth-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    outline: none;
}

.auth-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-focus-ring);
}

.auth-btn {
    background: var(--text-primary);
    color: white;
    border: none;
    padding: 0 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }

/* Document Viewer */
.document-container {
    max-width: 1000px;
    margin: 0 auto;
}

.doc-header {
    margin-bottom: 2rem;
}

.doc-title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
}

h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.version-tag {
    background: var(--border);
    color: var(--text-secondary);
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
}

.doc-meta-row {
    color: var(--text-secondary);
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.doc-envelope {
    background: var(--bg-surface);
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 10%), 0 10px 10px -5px rgb(0 0 0 / 4%);
    overflow: hidden;
    height: 80vh;
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
}

.pdf-toolbar {
    height: 50px;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.action-btn {
    background: transparent;
    border: 1px solid var(--text-tertiary);
    color: var(--text-secondary);
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.action-btn:hover {
    background: var(--bg-surface);
    color: var(--text-primary);
    border-color: var(--text-tertiary);
}

.pdf-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.pdf-viewer {
    flex: 1;
    border: none;
    width: 100%;
}

.loading-state, .error-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--text-secondary);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Footer */
.portal-footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-tertiary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    background: var(--bg-surface);
}

.footer-links {
    margin-top: 0.5rem;
    display: flex;
    justify-content: center;
    gap: 1.5rem;
}

.footer-links a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s;
}

.footer-links a:hover { color: var(--text-primary); }

@media (width <= 640px) {
    .header-container { flex-direction: column; gap: 0.5rem; }
    .doc-title-row { flex-direction: column; align-items: flex-start; }
}
</style>