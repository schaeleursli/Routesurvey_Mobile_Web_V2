<template>
    <div class="document-detail">
        <!-- Header -->
        <div class="detail-header">
            <div class="header-left">
                <BaseButton variant="ghost" icon="bi bi-arrow-left" @click="$emit('back')" class="me-3" />
                <div class="header-titles">
                    <h1 class="document-title">{{ route?.title || 'Loading Document...' }}</h1>
                    <div class="document-meta">
                        <span class="meta-item"><i class="bi bi-geo-alt"></i>
                            {{
                                route?.start
                                || 'Unknown Location'
                            }}
                        </span>
                        <!-- <span class="meta-item"><i class="bi bi-clock"></i> Updated {{ formatDate(route?.dateUpdated) }}</span> -->
                    </div>
                </div>
            </div>
            <div class="header-right">
                <BaseButton variant="secondary" icon="bi bi-eye" @click="toggleClientView">
                    View as Client
                </BaseButton>
            </div>
        </div>

        <div class="detail-layout">
            <!-- Left Panel: Version History -->
            <div class="panel-versions">
                <div class="panel-header">
                    <h3>Version History</h3>
                </div>

                <div v-if="loadingGenerations" class="p-4 text-center">
                    <BaseLoadingIndicator size="small" />
                </div>
                <div v-else-if="versions.length === 0" class="empty-versions">
                    <p>No reports generated yet.</p>
                    <BaseButton size="small" variant="text" @click="navigateToReports">Go to Reports</BaseButton>
                </div>
                <div v-else class="versions-list">
                    <div v-for="(ver, index) in versions" :key="ver.id" class="version-item"
                        :class="{ 'active': selectedVersion?.id === ver.id }" @click="selectVersion(ver)">
                        <div class="version-badge-col">
                            <span class="v-badge">v{{ versions.length - index }}.0</span>
                        </div>
                        <div class="version-info">
                            <div class="v-date">{{ formatDate(ver.dateAdded) }}</div>
                            <div class="v-note">Generated Report</div>
                        </div>
                        <div class="version-status">
                            <i class="bi bi-check-circle-fill text-success" v-if="ver.id === publishedVersionId"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Center Panel: Preview -->
            <div class="panel-preview">
                <div v-if="!selectedVersion" class="preview-placeholder">
                    <i class="bi bi-file-earmark-pdf"></i>
                    <p>Select a version to preview</p>
                </div>
                <div v-else class="preview-container">
                    <div class="preview-toolbar">
                        <span class="current-file">{{ selectedVersion.fileName || 'Report.pdf' }}</span>
                        <div class="preview-actions">
                            <BaseButton size="small" icon="bi bi-download" variant="ghost"
                                @click="downloadReport(selectedVersion)" />
                            <BaseButton size="small" icon="bi bi-box-arrow-up-right" variant="ghost"
                                @click="openInNewTab(selectedVersion)" />
                        </div>
                    </div>
                    <iframe :src="getPdfUrl(selectedVersion)" class="pdf-frame" title="Report Preview"></iframe>
                </div>
            </div>

            <!-- Right Panel: Distribution -->
            <div class="panel-distribution">
                <div class="panel-header">
                    <h3>Distribution</h3>
                    <BaseButton size="small" icon="bi bi-plus" @click="showCreateLinkModal = true">New Link</BaseButton>
                </div>

                <div v-if="loadingShares" class="p-4 text-center">
                    <BaseLoadingIndicator size="small" />
                </div>

                <div v-else-if="activeShares.length === 0" class="empty-shares">
                    <BaseEmptyState icon="bi bi-share" title="Not Shared"
                        message="create a link to share this document." />
                </div>

                <div v-else class="shares-list">
                    <div v-for="share in activeShares" :key="share.id" class="share-card">
                        <div class="share-header">
                            <span class="share-label">Public Link</span>
                            <div class="share-actions">
                                <button class="btn-icon" @click="copyLink(share)" title="Copy Link"><i
                                        class="bi bi-clipboard"></i></button>
                                <button class="btn-icon text-danger" @click="revokeLink(share)" title="Revoke"><i
                                        class="bi bi-trash"></i></button>
                            </div>
                        </div>
                        <div class="share-details">
                            <div class="detail-row">
                                <i class="bi bi-link-45deg"></i>
                                <span class="detail-text text-truncate">{{ getShareLink(share) }}</span>
                            </div>
                            <div class="detail-row">
                                <i class="bi bi-eye"></i>
                                <span class="detail-text">{{ share.viewCount || 0 }} Views</span>
                            </div>
                            <div class="detail-row" v-if="share.reportGenerationId">
                                <i class="bi bi-clock-history"></i>
                                <span class="detail-text">Linked to version from {{ formatDate(share.dateCreated)
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create Link Modal (Simplified) -->
        <div v-if="showCreateLinkModal" class="modal-overlay">
            <div class="modal-card">
                <h3>Share Document</h3>
                <p class="mb-4">You are about to share <strong>
                        {{
                            selectedVersion
                                ? 'Selected Version'
                                : 'Latest Version'
                        }}
                    </strong>.</p>

                <div class="form-group mb-4">
                    <label class="form-label">Link Expiry</label>
                    <select v-model="newLinkExpiry" class="form-select">
                        <option value="7">7 Days</option>
                        <option value="30">30 Days</option>
                        <option value="90">90 Days</option>
                        <option value="0">Never</option>
                    </select>
                </div>

                <div class="modal-actions">
                    <BaseButton variant="ghost" @click="showCreateLinkModal = false">Cancel</BaseButton>
                    <BaseButton variant="primary" @click="createLink" :disabled="!selectedVersion">Create Link
                    </BaseButton>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import RoutesController from '@/controllers/routes/routes_controller'
import ReportGenerationsController from '@/controllers/report_generations/report_generations_controller'
import ShareCenterController from '@/controllers/share_center/share_center_controller'
import { BaseButton, BaseLoadingIndicator, BaseEmptyState } from '@/components/ui'

const props = defineProps({
    routeId: {
        type: [String, Number],
        required: true
    }
})

const emit = defineEmits(['back'])
const router = useRouter()

// State
const route = ref(null)
const versions = ref([])
const activeShares = ref([])
const selectedVersion = ref(null)
const publishedVersionId = ref(null) // Conceptually the "Live" one

const loadingGenerations = ref(false)
const loadingShares = ref(false)
const showCreateLinkModal = ref(false)
const newLinkExpiry = ref(30)

// Fetch Data
const fetchRouteDetails = async () => {
    try {
        const res = await RoutesController.getRoute(props.routeId)
        if (res && res.result) {
            route.value = res.data
        }
    } catch (error) {
        console.error("Error fetching route:", error)
    }
}

const fetchGenerations = async () => {
    loadingGenerations.value = true
    try {
        const res = await ReportGenerationsController.getReportGenerations(props.routeId)
        versions.value = Array.isArray(res) ? res.reverse() : [] // Latest first

        if (versions.value.length > 0) {
            selectVersion(versions.value[0])
        }
    } catch (error) {
        console.error("Error fetching generations:", error)
    } finally {
        loadingGenerations.value = false
    }
}

const fetchShares = async () => {
    loadingShares.value = true
    try {
        const res = await ShareCenterController.getReportRouteShares(Number(props.routeId))
        if (res && res.result) {
            activeShares.value = res.data
        }
    } catch (error) {
        console.error("Error fetching shares:", error)
    } finally {
        loadingShares.value = false
    }
}

// Actions
const selectVersion = (ver) => {
    selectedVersion.value = ver
}

const createLink = async () => {
    if (!selectedVersion.value) return

    try {
        const payload = {
            ReportGenerationId: Number(selectedVersion.value.id),
            RouteId: Number(props.routeId),
            Password: "",
            RequirePassword: false,
            ExpireDays: Number(newLinkExpiry.value)
        }

        const res = await ShareCenterController.generateReportRouteShare(payload)
        if (res.result) {
            showCreateLinkModal.value = false
            fetchShares()
        } else {
            alert("Failed to create link: " + res.message)
        }
    } catch (error) {
        console.error(error)
    }
}

const revokeLink = async (share) => {
    if (!confirm("Are you sure you want to revoke this link? The client will lose access immediately.")) return

    try {
        await ShareCenterController.deleteReportRouteShare(share.id)
        fetchShares()
    } catch (error) {
        console.error(error)
    }
}

const copyLink = async (share) => {
    const url = getShareLink(share)
    try {
        await navigator.clipboard.writeText(url)
        alert("Link copied!")
    } catch (err) {
        console.error("Failed to copy", err)
    }
}

// Helpers
const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

const getPdfUrl = (version) => {
    if (!version) return ''
    return import.meta.env.VITE_MASL_API_BASE_URL + "/" + version.filePath
}

const downloadReport = (version) => {
    window.open(getPdfUrl(version), '_blank')
}

const openInNewTab = (version) => {
    window.open(getPdfUrl(version), '_blank')
}

const getShareLink = (share) => {
    // Construct public link based on current domain + share path
    return `${window.location.origin}/share/report?code=${share.uniqueId || 'placeholder'}&id=${share.id}`
}

const toggleClientView = () => {
    alert("This feature simulates what the client sees. (Coming soon)")
}

const navigateToReports = () => {
    router.push({ name: 'Reporting' }) // Or specific route reporting page
}

onMounted(() => {
    fetchRouteDetails()
    fetchGenerations()
    fetchShares()
})

watch(() => props.routeId, () => {
    fetchRouteDetails()
    fetchGenerations()
    fetchShares()
})
</script>

<style scoped>
.document-detail {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-base);
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
}

.header-left {
    display: flex;
    align-items: center;
}

.document-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
}

.document-meta {
    font-size: 0.85rem;
    color: var(--text-secondary);
    display: flex;
    gap: 1rem;
    margin-top: 0.25rem;
}

.detail-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
}

/* Left Panel */
.panel-versions {
    width: 300px;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
}

.panel-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-header h3 {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.5px;
}

.versions-list {
    flex: 1;
    overflow-y: auto;
}

.version-item {
    display: flex;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.2s;
}

.version-item:hover {
    background: var(--bg-elevated);
}

.version-item.active {
    background: rgba(var(--primary-rgb), 0.05);
    border-left: 3px solid var(--primary);
}

.version-badge-col {
    width: 60px;
}

.v-badge {
    background: var(--bg-elevated);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid var(--border);
}

.version-info {
    flex: 1;
}

.v-date {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
}

.v-note {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

/* Center Panel */
.panel-preview {
    flex: 1;
    background: var(--bg-base);
    /* Slightly darker/different than surface */
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.preview-toolbar {
    padding: 0.5rem 1rem;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.current-file {
    font-weight: 500;
    color: var(--text-primary);
}

.preview-container {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.pdf-frame {
    flex: 1;
    width: 100%;
    border: none;
}

.preview-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--text-secondary);
    gap: 1rem;
}

.preview-placeholder i {
    font-size: 3rem;
    opacity: 0.5;
}

/* Right Panel */
.panel-distribution {
    width: 320px;
    background: var(--bg-surface);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
}

.shares-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.share-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
}

.share-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.share-label {
    font-weight: 600;
    font-size: 0.9rem;
}

.share-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 2px;
}

.btn-icon:hover {
    color: var(--primary);
}

.detail-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
}

.detail-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-card {
    background: var(--bg-surface);
    padding: 2rem;
    border-radius: 12px;
    width: 400px;
    box-shadow: 0 10px 25px rgb(0 0 0 / 10%);
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg-base);
    color: var(--text-primary);
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
}
</style>
