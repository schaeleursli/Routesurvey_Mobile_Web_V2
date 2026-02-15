<template>
    <aside class="requirements-panel">
        <div class="panel-header">
            <h3>Requirements</h3>
            <div class="status-badge" :class="`status-${status}`">
                {{ statusLabel }}
            </div>
        </div>

        <!-- Status Summary -->
        <div class="status-summary">
            <div class="summary-item">
                <span class="label">Blocking Issues:</span>
                <span class="value" :class="{ error: blockingIssues.length > 0 }">
                    {{ blockingIssues.length }}
                </span>
            </div>
            <div class="summary-item">
                <span class="label">Warnings:</span>
                <span class="value" :class="{ warning: warnings.length > 0 }">
                    {{ warnings.length }}
                </span>
            </div>
            <div class="summary-item">
                <span class="label">Conflicts:</span>
                <span class="value" :class="{ error: blockingConflicts.length > 0 }">
                    {{ conflicts.length }}
                </span>
            </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
            <button
                class="tab"
                :class="{ active: activeTab === 'rolled' }"
                @click="activeTab = 'rolled'"
            >
                Rolled-up
            </button>
            <button
                class="tab"
                :class="{ active: activeTab === 'byJurisdiction' }"
                @click="activeTab = 'byJurisdiction'"
            >
                By Jurisdiction
            </button>
        </div>

        <!-- Content -->
        <div class="panel-content">
            <!-- Conflicts Section -->
            <section v-if="conflicts.length > 0" class="section">
                <h4>Conflicts</h4>
                <div
                    v-for="conflict in conflicts"
                    :key="conflict.id"
                    class="conflict-item"
                    :class="`severity-${conflict.severity}`"
                >
                    <div class="conflict-header">
                        <span class="severity-badge">{{ conflict.severity }}</span>
                        <span class="conflict-message">{{ conflict.message }}</span>
                    </div>
                </div>
            </section>

            <!-- Required Items Section -->
            <section class="section">
                <h4>Required Items ({{ filteredRequiredItems.length }})</h4>
                <div
                    v-for="item in filteredRequiredItems"
                    :key="item.id"
                    class="required-item"
                    :class="{ missing: isItemMissing(item) }"
                    @click="handleItemClick(item)"
                >
                    <div class="item-header">
                        <div class="item-title">
                            <span class="status-icon" :class="{ missing: isItemMissing(item) }">
                                <i :class="isItemMissing(item) ? 'bi bi-x-circle' : 'bi bi-check-circle'"></i>
                            </span>
                            <span>{{ item.message }}</span>
                        </div>
                        <span class="severity-badge" :class="`level-${item.level}`">
                            {{ item.level }}
                        </span>
                    </div>

                    <div class="item-meta">
                        <span class="required-by">
                            Required by: {{ formatRequiredBy(item) }}
                        </span>
                    </div>

                    <!-- Rationale (Why) -->
                    <div v-if="item.rationale && item.rationale.length > 0" class="item-rationale">
                        <button
                            class="rationale-toggle"
                            @click.stop="toggleRationale(item.id)"
                        >
                            <i :class="expandedRationale.has(item.id) ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"></i>
                            Why
                        </button>
                        <div v-if="expandedRationale.has(item.id)" class="rationale-content">
                            <ul>
                                <li v-for="(reason, idx) in item.rationale" :key="idx">{{ reason }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </aside>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    rollup: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['item-click']);

const activeTab = ref('rolled');
const expandedRationale = ref(new Set());

// Computed properties
const status = computed(() => {
    if (!props.rollup) return 'draft';
    
    const validation = props.rollup.validation || {};
    const conflicts = props.rollup.conflicts || [];
    
    const blockingIssues = validation.blockingIssues || [];
    const blockingConflicts = conflicts.filter(c => c.severity === 'block');
    
    if (blockingIssues.length > 0 || blockingConflicts.length > 0) {
        return 'blocked';
    }
    
    const rollupData = props.rollup.rollup || {};
    const requiredItems = rollupData.requiredItems || [];
    if (requiredItems.length > 0) {
        return 'ready';
    }
    
    return 'draft';
});

const statusLabel = computed(() => {
    return status.value.toUpperCase();
});

const validation = computed(() => props.rollup?.validation || {});
const blockingIssues = computed(() => validation.value.blockingIssues || []);
const warnings = computed(() => validation.value.warnings || []);
const conflicts = computed(() => props.rollup?.conflicts || []);
const blockingConflicts = computed(() => conflicts.value.filter(c => c.severity === 'block'));

const requiredItems = computed(() => {
    if (!props.rollup?.rollup) return [];
    return props.rollup.rollup.requiredItems || [];
});

const filteredRequiredItems = computed(() => {
    if (activeTab.value === 'rolled') {
        return requiredItems.value;
    } else {
        // TODO: Filter/group by jurisdiction
        return requiredItems.value;
    }
});

// Methods
const formatRequiredBy = (item) => {
    if (Array.isArray(item.requiredBy)) {
        return item.requiredBy.join(', ');
    }
    return item.requiredBy || 'Unknown';
};

const isItemMissing = (item) => {
    // Check if item is in blocking issues
    return blockingIssues.value.some(issue => issue.itemId === item.id);
};

const toggleRationale = (itemId) => {
    if (expandedRationale.value.has(itemId)) {
        expandedRationale.value.delete(itemId);
    } else {
        expandedRationale.value.add(itemId);
    }
};

const handleItemClick = (item) => {
    emit('item-click', item);
};
</script>

<style scoped>
.requirements-panel {
    width: 350px;
    background: var(--bg-surface);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.panel-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
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

.status-summary {
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
}

.summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-xs);
    font-size: 13px;
}

.summary-item .label {
    color: var(--text-secondary);
}

.summary-item .value {
    font-weight: 600;
    color: var(--text-primary);
}

.summary-item .value.error {
    color: var(--danger);
}

.summary-item .value.warning {
    color: var(--warning);
}

.tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
}

.tab {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    transition: all 0.2s;
}

.tab.active {
    border-bottom-color: var(--accent);
    color: var(--accent);
}

.panel-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
}

.section {
    margin-bottom: var(--spacing-lg);
}

.section h4 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.conflict-item {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
    border-radius: 4px;
    border-left: 3px solid;
}

.conflict-item.severity-block {
    background: var(--danger-bg);
    border-color: var(--danger);
}

.conflict-item.severity-warn {
    background: var(--warning-bg);
    border-color: var(--warning);
}

.conflict-header {
    display: flex;
    gap: var(--spacing-xs);
    align-items: flex-start;
}

.severity-badge {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    background: var(--accent-bg);
    color: var(--accent);
}

.severity-badge.level-block {
    background: var(--danger-bg);
    color: var(--danger);
}

.severity-badge.level-warn {
    background: var(--warning-bg);
    color: var(--warning);
}

.conflict-message {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
}

.required-item {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.required-item:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
}

.required-item.missing {
    background: rgba(var(--danger-rgb), 0.05);
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xs);
}

.item-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
}

.status-icon {
    font-size: 16px;
    color: var(--success);
}

.status-icon.missing {
    color: var(--danger);
}

.item-meta {
    font-size: 11px;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
}

.rationale-toggle {
    background: none;
    border: none;
    padding: var(--spacing-xs) 0;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    display: flex;
    align-items: center;
    gap: 4px;
}

.rationale-content {
    margin-top: var(--spacing-xs);
    padding: var(--spacing-xs);
    background: var(--bg-elevated);
    border-radius: 4px;
    font-size: 12px;
}

.rationale-content ul {
    margin: 0;
    padding-left: 20px;
}

.rationale-content li {
    margin-bottom: 4px;
    color: var(--text-secondary);
}
</style>
