<template>
  <Drawer 
    v-model:visible="helpStore.isOpen" 
    position="right" 
    class="help-drawer"
    :modal="false"
    :dismissable="true"
    :showCloseIcon="true"
    style="width: 400px; max-width: 90vw;"
    append-to="body"
  >
    <template #header>
        <div class="help-header">
            <div class="ai-avatar">
                <PhRobot :size="20" weight="fill" />
            </div>
            <div class="header-text">
                <h3>Help Assistant</h3>
                <span class="context-badge" v-if="helpStore.currentContext !== 'global'">
                    {{ formatContext(helpStore.currentContext) }}
                </span>
            </div>
        </div>
    </template>

    <div class="help-content">
        <!-- Search Section -->
        <div class="search-section">
            <IconField iconPosition="left" class="w-100">
                <PhMagnifyingGlass :size="16" />
                <InputText 
                    v-model="helpStore.searchQuery" 
                    placeholder="Search help articles..." 
                    class="w-100 search-input"
                    autofocus
                />
            </IconField>
        </div>

        <!-- Search Results (if searching) -->
        <div v-if="helpStore.searchQuery.length >= 2" class="results-section">
            <div v-if="helpStore.searchResults.length > 0">
                <h6 class="section-title">Search Results</h6>
                <div 
                    v-for="article in helpStore.searchResults" 
                    :key="article.id" 
                    class="help-card"
                    @click="helpStore.openArticle(article.id)"
                >
                    <i :class="['bi', article.icon]"></i>
                    <div class="card-content">
                        <h5>{{ article.title }}</h5>
                        <p>{{ truncate(article.content, 60) }}</p>
                    </div>
                    <PhCaretRight :size="16" class="arrow" />
                </div>
            </div>
            <div v-else class="no-results">
                <PhSmileyMeh :size="32" />

                <p>I couldn't find an answer for that.</p>
                <Button label="Contact Support" link size="small" />
            </div>
        </div>

        <!-- Default View (Context Aware) -->
        <div v-else class="default-view">
            <!-- Suggested for this page -->
            <div class="section mb-4" v-if="helpStore.activeContextArticles.length > 0">
                <h6 class="section-title">
                    <PhSparkle :size="18" class="text-primary me-2" />
                    Suggested for This Page
                </h6>
                <div class="cards-list">
                    <div 
                        v-for="article in helpStore.activeContextArticles" 
                        :key="article.id" 
                        class="help-card featured"
                        @click="helpStore.openArticle(article.id)"
                    >
                        <div class="card-icon-wrapper">
                            <i :class="['bi', article.icon]"></i>
                        </div>
                        <div class="card-content">
                            <h5>{{ article.title }}</h5>
                            <p v-if="article.summary">{{ article.summary }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
             <div class="section mb-4">
                <h6 class="section-title">Quick Actions</h6>
                <div class="quick-actions-grid">
                    <button class="action-btn" aria-label="Contact Support">
                        <PhEnvelope :size="20" />
                        <span>Contact</span>
                    </button>
                    <button class="action-btn" aria-label="View Guides">
                        <PhBook :size="20" />
                        <span>Guides</span>
                    </button>
                    <button class="action-btn" aria-label="Report a Bug">
                        <PhBug :size="20" />
                        <span>Report Bug</span>
                    </button>
                    <router-link to="/help-center" class="action-btn link-btn" aria-label="Open Full Help Center">
                        <PhArrowsOut :size="20" />
                        <span>Full Help</span>
                    </router-link>
                </div>
             </div>

             <!-- Did you know? -->
             <div v-if="!tipDismissed" class="did-you-know">
                <div class="bulb-icon">
                    <PhLightbulb :size="20" weight="fill" />
                </div>
                <div class="tip-content">
                    <strong>Did you know?</strong>
                    <p>You can use <kbd>Cmd+K</kbd> to open the global search bar from anywhere.</p>
                </div>
                <button class="dismiss-tip-btn" @click="dismissTip" aria-label="Dismiss tip">
                    <PhX :size="16" />
                </button>
             </div>
        </div>
    </div>

    <!-- Footer -->
    <template #footer>
        <div class="help-footer">
            <span>Powered by RouteSurvey Knowledge</span>
        </div>
    </template>
  </Drawer>
</template>

<script setup>
import { useHelpStore } from '@/stores/help';
import Drawer from 'primevue/drawer';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import {
    PhRobot, PhMagnifyingGlass, PhCaretRight, PhSmileyMeh, PhSparkle,
    PhEnvelope, PhBook, PhBug, PhArrowsOut, PhLightbulb, PhX
} from '@phosphor-icons/vue';

const helpStore = useHelpStore();

// Tip dismissal state
const tipDismissed = ref(localStorage.getItem('helpTipDismissed') === 'true');

function dismissTip() {
    tipDismissed.value = true;
    localStorage.setItem('helpTipDismissed', 'true');
}

function formatContext(ctx) {
    if (ctx === 'plan-route') return 'Planning';
    if (ctx === 'route-viewer') return 'Survey';
    if (ctx === 'reporting') return 'Reporting';
    return 'General';
}

function truncate(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// Global Shortcut for Help
import { ref, onMounted, onUnmounted } from 'vue';

function handleKeydown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        helpStore.toggle();
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Ensure the drawer sits above navbar (z-index: 2000) and covers full viewport */
.help-drawer {
    z-index: 10000 !important;
}

/* Override PrimeVue Drawer positioning and z-index */
:deep(.p-drawer) {
    z-index: 10000 !important;
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    height: 100vh !important;
    max-height: 100vh !important;
}

:deep(.p-drawer-mask) {
    z-index: 9999 !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
}

:deep(.p-drawer-content) {
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
}

.help-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 0.5rem;
}

.ai-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--primary-color, #007bff), #00d2ff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
    box-shadow: 0 4px 10px rgb(0 0 0 / 10%);
}

.header-text h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
}

.context-badge {
    font-size: 0.75rem;
    background: #e9ecef;
    padding: 2px 8px;
    border-radius: 12px;
    color: #6c757d;
}

.search-section {
    position: sticky;
    top: 0;
    background: white; /* or var(--surface-card) */
    z-index: 10;
    padding-bottom: 1rem;
}

.search-input {
    border-radius: 20px;
    padding-left: 2.5rem;
}

.section-title {
    font-size: 0.8rem;
    text-transform: none;
    letter-spacing: 0.3px;
    color: var(--text-secondary, #888);
    margin-bottom: 1rem;
    font-weight: 600;
}

.cards-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.help-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.help-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgb(0 0 0 / 5%);
    border-color: var(--primary-color-light, #cce5ff);
}

.help-card.featured {
    background: linear-gradient(to right bottom, #fff, #f8f9fa);
    border-left: 4px solid var(--primary-color, #007bff);
}

.card-icon-wrapper {
    width: 32px;
    height: 32px;
    background: #eef2ff;
    color: var(--primary-color, #007bff);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-content h5 {
    margin: 0 0 0.25rem;
    font-size: 0.95rem;
    font-weight: 600;
}

.card-content p {
    margin: 0;
    font-size: 0.85rem;
    color: #666;
    line-height: 1.4;
}

.arrow {
    margin-left: auto;
    color: #ccc;
}

.quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
}

.action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.75rem 0.5rem;
    min-height: 64px;
    min-width: 64px;
    background: var(--bg-elevated, #f8f9fa);
    border: 1px solid var(--border, #e9ecef);
    border-radius: 10px;
    color: var(--text-secondary, #555);
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    text-align: center;
}

.action-btn:hover {
    background: var(--bg-surface, #e9ecef);
    color: var(--accent, #007bff);
    border-color: var(--accent, #007bff);
    transform: translateY(-2px);
}

.action-btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgb(0 167 225 / 20%);
    border-color: var(--accent, #007bff);
}

.action-btn i {
    font-size: 1.25rem;
    line-height: 1;
}

.action-btn span {
    line-height: 1.2;
    white-space: nowrap;
}

.did-you-know {
    margin-top: 2rem;
    background: #fff8e1;
    padding: 1rem;
    border-radius: 10px;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    position: relative;
    border: 1px solid #ffe082;
}

.bulb-icon {
    color: #f9a825;
    font-size: 1.3rem;
    flex-shrink: 0;
}

.tip-content {
    flex: 1;
}

.tip-content strong {
    font-size: 0.9rem;
    color: #5d4037;
}

.tip-content p {
    font-size: 0.85rem;
    margin: 0.35rem 0 0;
    color: #6d4c41;
    line-height: 1.5;
}

.tip-content kbd {
    background: #fff3e0;
    border: 1px solid #ffe0b2;
    border-radius: 4px;
    padding: 2px 6px;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    color: #e65100;
}

.dismiss-tip-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    color: #bcaaa4;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: color 0.2s;
}

.dismiss-tip-btn:hover {
    color: #5d4037;
}

.help-footer {
    text-align: center;
    font-size: 0.75rem;
    color: #aaa;
}

/* Dark Mode Overrides */
[data-bs-theme="dark"] .search-section {
    background: var(--bg-surface, #1e2125);
}

[data-bs-theme="dark"] .help-card {
    background: #2b3035;
    border-color: #373b3e;
    color: #f8f9fa;
}

[data-bs-theme="dark"] .help-card p {
    color: #adb5bd;
}

[data-bs-theme="dark"] .action-btn {
    background: #2b3035;
    border-color: #373b3e;
    color: #adb5bd;
}

[data-bs-theme="dark"] .action-btn:hover {
    background: #343a40;
    color: var(--accent, #00a7e1);
    border-color: var(--accent, #00a7e1);
}

[data-bs-theme="dark"] .did-you-know {
    background: #3d3200;
    border-color: #5c4b00;
}

[data-bs-theme="dark"] .tip-content strong {
    color: #ffd54f;
}

[data-bs-theme="dark"] .tip-content p {
    color: #ffecb3;
}

[data-bs-theme="dark"] .tip-content kbd {
    background: #4a3f00;
    border-color: #6d5c00;
    color: #ffc107;
}

[data-bs-theme="dark"] .dismiss-tip-btn {
    color: #8d6e63;
}

[data-bs-theme="dark"] .dismiss-tip-btn:hover {
    color: #ffecb3;
}
</style>
