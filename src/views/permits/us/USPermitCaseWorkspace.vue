<template>
    <div class="us-permit-workspace" data-testid="permits-workspace">
        <div class="workspace-header">
            <div class="header-left">
                <button class="btn-back" @click="$router.back()">
                    <i class="bi bi-arrow-left"></i>
                </button>
                <div class="header-info">
                    <h1 data-testid="permits-case-title">{{ caseData?.title || 'Loading...' }}</h1>
                    <div class="header-meta" v-if="caseData">
                        <span class="meta-item">
                            <i class="bi bi-geo-alt"></i>
                            {{ states.join(', ') || 'No states' }}
                        </span>
                        <span class="meta-item">
                            <i class="bi bi-calendar"></i>
                            {{ formatDate(caseData.updated_at) }}
                        </span>
                    </div>
                    <!-- Phase 2.0: Engineering Integration Badge -->
                    <div v-if="engineeringStatus?.is_linked" class="engineering-badge">
                        <i class="bi bi-cpu"></i>
                        <span>Engineering Linked</span>
                    </div>
                </div>
            </div>
            <div class="header-actions">
                <!-- Phase 2.0: Link Engineering Action -->
                <button
                    v-if="!engineeringStatus?.is_linked && caseData"
                    class="btn btn-outline"
                    @click="handleLinkEngineering"
                    title="Link transport engineering calculation"
                >
                    <i class="bi bi-link-45deg"></i>
                    Link Engineering
                </button>
                <ReadinessScoreWidget
                    v-if="caseData"
                    data-testid="permits-readiness-score"
                    :score="caseData.readiness_score"
                    :rollup="caseData.rollup_json"
                />
                <div class="status-badge" data-testid="permits-status-badge" :class="`status-${caseData?.status || 'draft'}`">
                    {{ (caseData?.status || 'draft').toUpperCase() }}
                </div>
                <button
                    data-testid="permits-export-btn"
                    class="btn btn-primary"
                    :disabled="isExportDisabled"
                    @click="handleExport"
                    :title="exportTooltip"
                >
                    <i class="bi bi-download"></i>
                    Export Bundle
                </button>
            </div>
        </div>

        <div class="workspace-body">
            <!-- Left: Block List (simplified for Phase 1) -->
            <aside class="block-list-panel">
                <h3>Document Sections</h3>
                <div class="block-list" data-testid="permits-block-list">
                    <div
                        v-for="block in blocks"
                        :key="block.id"
                        :data-testid="`permits-block-item-${block.id}`"
                        class="block-list-item"
                        :class="{
                            active: selectedBlockId === block.id,
                            required: block.required,
                            'not-implemented': !isBlockImplemented(block.type)
                        }"
                        @click="handleBlockSelect(block)"
                    >
                        <div class="block-title">
                            <i v-if="block.required" class="bi bi-lock-fill lock-icon"></i>
                            {{ block.title }}
                        </div>
                        <span v-if="!isBlockImplemented(block.type)" class="not-impl-badge">
                            WIP
                        </span>
                    </div>
                </div>
            </aside>

            <!-- Center: Block Editor -->
            <main class="block-editor-panel">
                <div v-if="loading" class="loading-state">
                    <div class="spinner-border"></div>
                    <p>Loading permit case...</p>
                </div>

                <div v-else-if="error" class="error-state">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p>{{ error }}</p>
                    <button class="btn btn-secondary" @click="loadCase">Retry</button>
                </div>

                <div v-else-if="caseData" class="block-editor" data-testid="permits-block-editor">
                    <!-- Render selected block -->
                    <component
                        :is="selectedBlockComponent"
                        v-if="selectedBlockComponent"
                        :payload="caseData.payload_json"
                        :rollup="caseData.rollup_json"
                        :case-id="caseData.id"
                        @update="handlePayloadUpdate"
                        @update-title="handleTitleUpdate"
                        @sync="handleEngineeringSync"
                    />
                </div>
            </main>

            <!-- Right: Requirements Panel -->
            <aside class="requirements-sidebar" data-testid="permits-requirements-panel">
                <!-- Authority Cards -->
                <div v-if="authorityCards.length > 0" class="authority-cards-section">
                    <h3>Jurisdictions</h3>
                    <div class="authority-cards-grid">
                        <AuthorityCard
                            v-for="card in authorityCards"
                            :key="card.authority.jurisdiction"
                            :authority="card.authority"
                            :decision="card.decision"
                            :conflicts="caseData.rollup_json?.conflicts || []"
                        />
                    </div>
                </div>

                <!-- Next Actions -->
                <NextActionsPanel
                    v-if="caseData"
                    :rollup="caseData.rollup_json"
                    @action-click="handleActionClick"
                />

                <!-- Requirements Panel -->
                <RequirementsPanel
                    v-if="caseData"
                    :rollup="caseData.rollup_json"
                    @item-click="handleItemClick"
                />
            </aside>
        </div>

        <!-- Link Engineering Modal -->
        <LinkEngineeringModal
            v-if="showLinkModal"
            :project-id="caseData?.project_id"
            @close="showLinkModal = false"
            @link="handleLinkConfirm"
        />

        <!-- Sync Notification Toast -->
        <SyncNotificationToast
            :visible="showSyncNotification"
            title="Engineering Data Updated"
            message="The linked calculation has new data. Sync to get the latest."
            type="warning"
            @sync="handleSyncFromNotification"
            @view-changes="showDiffViewer = true"
            @dismiss="showSyncNotification = false"
        />

        <!-- Phase 2.3: Engineering Diff Viewer -->
        <EngineeringDiffViewer
            v-if="showDiffViewer && engineeringStatus"
            :case-id="caseId"
            :current-data="caseData?.payload_json"
            :calc-job-id="engineeringStatus.engineering_job_id"
            @close="showDiffViewer = false"
            @sync="handleDiffSync"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { debounce } from 'lodash-es';
import RequirementsPanel from '@/components/permits/RequirementsPanel.vue';
import AuthorityCard from '@/components/permits/AuthorityCard.vue';
import NextActionsPanel from '@/components/permits/NextActionsPanel.vue';
import ReadinessScoreWidget from '@/components/permits/ReadinessScoreWidget.vue';
import LinkEngineeringModal from '@/components/permits/LinkEngineeringModal.vue';
import SyncNotificationToast from '@/components/permits/SyncNotificationToast.vue';
import EngineeringDiffViewer from '@/components/permits/EngineeringDiffViewer.vue';
import { getBlockComponent, isBlockImplemented } from '@/components/permits/blocks/blockRegistry';
import { useEngineeringIntegration } from '@/composables/useEngineeringIntegration';
import { useSyncDetection } from '@/composables/useSyncDetection';
import template from '@/features/permits/us/templates/us_permit_template_v1.json';

const route = useRoute();
const caseId = route.params.id;

// State
const loading = ref(true);
const error = ref(null);
const caseData = ref(null);
const selectedBlockId = ref('vehicle_load');

// Phase 2.0: Engineering Integration
const showLinkModal = ref(false);
const showSyncNotification = ref(false);
const showDiffViewer = ref(false); // Phase 2.3
const engineeringStatus = ref(null);
const { getEngineeringStatus, linkEngineering, syncEngineering } = useEngineeringIntegration();

// Real-time Sync Detection
const { isOutOfSync, startPolling, stopPolling } = useSyncDetection(caseId, {
    intervalMs: 30000 // 30 seconds
});

// Load template blocks
const blocks = ref(template.blocks);

// Computed
const states = computed(() => {
    return caseData.value?.payload_json?.route?.statesInRoute || [];
});

const isExportDisabled = computed(() => {
    const rollup = caseData.value?.rollup_json;
    if (!rollup) return true;
    
    const validation = rollup.validation || {};
    const blockingIssues = validation.blockingIssues || [];
    const conflicts = rollup.conflicts || [];
    const blockingConflicts = conflicts.filter(c => c.severity === 'block');
    
    return blockingIssues.length > 0 || blockingConflicts.length > 0;
});

const exportTooltip = computed(() => {
    return isExportDisabled.value
        ? 'Cannot export: blocking issues or conflicts present'
        : 'Export permit application bundle';
});

const selectedBlockComponent = computed(() => {
    const selectedBlock = blocks.value.find(b => b.id === selectedBlockId.value);
    if (!selectedBlock) return null;
    
    return getBlockComponent(selectedBlock.type);
});

const authorityCards = computed(() => {
    const decisions = caseData.value?.rollup_json?.decisions || [];
    
    return decisions.map(decision => ({
        authority: {
            jurisdiction: decision.jurisdiction,
            name: decision.jurisdictionName || decision.jurisdiction,
            authorityLabel: decision.authorityLabel || 'DOT'
        },
        decision
    }));
});

// Methods
const loadCase = async () => {
    loading.value = true;
    error.value = null;
    
    try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/v1/permit-cases/${caseId.value}`);
        
        if (!response.ok) {
            throw new Error('Failed to load permit case');
        }
        
        caseData.value = await response.json();
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};

const debouncedUpdate = debounce(async (payload) => {
    try {
        const response = await fetch(`/api/v1/permit-cases/${caseId.value}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload_json: payload })
        });
        
        if (response.ok) {
            const updated = await response.json();
            caseData.value = updated;
        }
    } catch (err) {
        console.error('Failed to update permit case:', err);
    }
}, 400);

const handlePayloadUpdate = (payload) => {
    // Optimistic update
    caseData.value.payload_json = payload;
    
    // Debounced save
    debouncedUpdate(payload);
};

const handleExport = () => {
    alert('Bundle export not implemented in Phase 1');
};

const handleItemClick = (item) => {
    // TODO: Jump to relevant field based on item.path
    console.log('Item clicked:', item);
};

const handleActionClick = (action) => {
    // Handle next action click (jump to context)
    console.log('Action clicked:', action);
    
    if (action.type === 'missing_field' || action.type === 'missing_attachment') {
        handleItemClick(action.context);
    }
};

const handleBlockSelect = (block) => {
    if (!isBlockImplemented(block.type)) {
        console.log('Block not yet implemented:', block.type);
        return;
    }
    selectedBlockId.value = block.id;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString();
};

// Phase 2.0: Handle engineering data sync
const handleEngineeringSync = async () => {
    try {
        const result = await syncEngineering(caseId);
        // Reload case to reflect synced data
        await loadCase();
        console.log('Engineering sync complete:', result);
    } catch (err) {
        console.error('Engineering sync failed:', err);
    }
};

// Phase 2.0: Handle link engineering action
const handleLinkEngineering = () => {
    showLinkModal.value = true;
};

const handleLinkConfirm = async (calcJobId) => {
    showLinkModal.value = false;
    
    try {
        await linkEngineering(caseId, calcJobId);
        
        // Reload case and status
        await loadCase();
        engineeringStatus.value = await getEngineeringStatus(caseId);
        
        // Start polling now that engineering is linked
        if (engineeringStatus.value?.is_linked) {
            startPolling();
        }
        
        console.log('Engineering calculation linked successfully');
    } catch (err) {
        console.error('Link engineering failed:', err);
    }
};

// Phase 2.0: Handle sync from notification
const handleSyncFromNotification = async () => {
    showSyncNotification.value = false;
    await handleEngineeringSync();
};

// Phase 2.3: Handle selective sync from diff viewer
const handleDiffSync = async ({ fields, updates }) => {
    try {
        // PATCH the case with selective updates
        const response = await fetch(`/api/v1/permit-cases/${caseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                payload_json: updates
            })
        });

        if (!response.ok) {
            throw new Error('Failed to sync selected fields');
        }

        // Reload case and hide diff viewer
        await loadCase();
        showDiffViewer.value = false;
        showSyncNotification.value = false;
        
        console.log(`Synced ${fields.length} field(s) successfully`);
    } catch (err) {
        console.error('Diff sync failed:', err);
    }
};

// Lifecycle
onMounted(async () => {
    await loadCase();
    // Phase 2.0: Load engineering status
    if (caseId) {
        try {
            engineeringStatus.value = await getEngineeringStatus(caseId);
            
            // Start sync detection if linked
            if (engineeringStatus.value?.is_linked) {
                startPolling();
            }
        } catch (err) {
            console.error('Failed to load engineering status:', err);
        }
    }
});

// Watch for out-of-sync state changes
watch(isOutOfSync, (newVal, oldVal) => {
    if (newVal && !oldVal) {
        // Just became out of sync - show notification
        showSyncNotification.value = true;
    }
});
</script>

<style scoped>
.us-permit-workspace {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg-base);
}

.workspace-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
}

.header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.btn-back {
    background: none;
    border: none;
    font-size: 20px;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: 4px;
    transition: all 0.2s;
}

.btn-back:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
}

.header-info h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
}

.header-meta {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xs);
    font-size: 13px;
    color: var(--text-secondary);
}

/* Phase 2.0: Engineering Integration Badge */
.engineering-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: var(--spacing-xs);
    padding: 4px 10px;
    background: var(--info-bg);
    color: var(--info);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.engineering-badge i {
    font-size: 14px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.status-badge {
    padding: 6px 16px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 700;
}

.status-badge.status-draft {
    background: var(--secondary-bg);
    color: var(--text-secondary);
}

.status-badge.status-blocked {
    background: var(--danger-bg);
    color: var(--danger);
}

.status-badge.status-ready {
    background: var(--success-bg);
    color: var(--success);
}

.workspace-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.block-list-panel {
    width: 250px;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    padding: var(--spacing-md);
    overflow-y: auto;
}

.block-list-panel h3 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.block-list-item {
    padding: var(--spacing-sm) var(--spacing-md);
    margin-bottom: var(--spacing-xs);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.block-list-item:hover {
    background: var(--bg-elevated);
}

.block-list-item.active {
    background: var(--accent-bg);
    border-color: var(--accent);
}

.block-list-item.required {
    border-left: 3px solid var(--accent);
}

.block-list-item.not-implemented {
    opacity: 0.6;
    cursor: not-allowed;
}

.not-impl-badge {
    font-size: 9px;
    padding: 2px 6px;
    background: var(--secondary-bg);
    color: var(--text-secondary);
    border-radius: 4px;
    font-weight: 700;
}

.block-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}

.lock-icon {
    font-size: 10px;
    color: var(--text-tertiary);
}

.block-editor-panel {
    flex: 1;
    background: var(--bg-base);
    overflow-y: auto;
    padding: var(--spacing-lg);
}

.requirements-sidebar {
    width: 380px;
    background: var(--bg-base);
    border-left: 1px solid var(--border);
    overflow-y: auto;
    padding: var(--spacing-md);
}

.authority-cards-section {
    margin-bottom: var(--spacing-lg);
}

.authority-cards-section h3 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.authority-cards-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: var(--spacing-md);
}

.spinner-border {
    width: 3rem;
    height: 3rem;
    border: 0.25rem solid currentcolor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
    to { transform: rotate(360deg); }
}
</style>
