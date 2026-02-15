<template>
    <div class="engineering-diff-modal">
        <div class="modal-overlay" @click="handleClose"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>
                    <PhArrowsLeftRight :size="20" />
                    Engineering Data Comparison
                </h3>
                <button class="btn-close" @click="handleClose">
                    <PhX :size="20" />
                </button>
            </div>

            <div class="modal-body">
                <!-- Loading State -->
                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading latest engineering data...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="error-state">
                    <PhWarning :size="48" />
                    <p>{{ error }}</p>
                    <button class="btn-secondary" @click="fetchDiff">Retry</button>
                </div>

                <!-- Diff Display -->
                <div v-else>
                    <div v-if="!hasChanges" class="no-changes-state">
                        <PhCheckCircle :size="64" weight="fill" />
                        <p>All fields are up to date</p>
                        <small>No changes detected in linked engineering calculation</small>
                    </div>

                    <div v-else>
                        <!-- Summary -->
                        <div class="diff-summary">
                            <div class="summary-item">
                                <PhArrowsClockwise :size="16" />
                                <span><strong>{{ changedFieldsCount }}</strong> field(s) changed</span>
                            </div>
                            <div v-if="overrideFieldsCount > 0" class="summary-item warning">
                                <PhWarning :size="16" />
                                <span><strong>{{ overrideFieldsCount }}</strong> manual override(s)</span>
                            </div>
                        </div>

                        <!-- Comparison Table -->
                        <div class="diff-table-wrapper">
                            <table class="diff-table">
                                <thead>
                                    <tr>
                                        <th class="col-select">
                                            <input
                                                type="checkbox"
                                                v-model="selectAll"
                                                @change="handleSelectAll"
                                                :disabled="changedFields.length === 0"
                                            />
                                        </th>
                                        <th class="col-field">Field</th>
                                        <th class="col-current">Current Value</th>
                                        <th class="col-latest">Latest Engineering</th>
                                        <th class="col-status">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="field in allFields"
                                        :key="field.path"
                                        :class="{ 
                                            'row-changed': field.changed,
                                            'row-override': field.isOverride 
                                        }"
                                    >
                                        <td class="col-select">
                                            <input
                                                v-if="field.changed"
                                                type="checkbox"
                                                v-model="selectedFields"
                                                :value="field.path"
                                            />
                                        </td>
                                        <td class="col-field">
                                            <div class="field-name">{{ field.label }}</div>
                                            <div class="field-path">{{ field.path }}</div>
                                        </td>
                                        <td class="col-current">
                                            <div class="value-cell">
                                                <span class="value">{{ formatValue(field.currentValue) }}</span>
                                                <FieldSourceChip 
                                                    v-if="field.currentMeta"
                                                    :meta="field.currentMeta"
                                                />
                                            </div>
                                        </td>
                                        <td class="col-latest">
                                            <div class="value-cell">
                                                <span 
                                                    class="value" 
                                                    :class="{ 'value-changed': field.changed }"
                                                >
                                                    {{ formatValue(field.latestValue) }}
                                                </span>
                                                <span v-if="field.changed" class="change-indicator">
                                                    <PhArrowLeft :size="16" />
                                                </span>
                                            </div>
                                        </td>
                                        <td class="col-status">
                                            <span v-if="!field.changed" class="status-badge status-synced">
                                                <PhCheck :size="12" /> Synced
                                            </span>
                                            <span v-else-if="field.isOverride" class="status-badge status-override">
                                                <PhWarning :size="12" /> Override
                                            </span>
                                            <span v-else class="status-badge status-outdated">
                                                <PhArrowsClockwise :size="12" /> Outdated
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Override Warning -->
                        <div v-if="hasSelectedOverrides" class="override-warning">
                            <PhWarning :size="20" />
                            <div>
                                <strong>Warning:</strong> You have selected fields with manual overrides.
                                Syncing will replace your manual edits with engineering data.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-secondary" @click="handleClose">
                    Cancel
                </button>
                <button
                    v-if="hasChanges"
                    class="btn-primary"
                    @click="handleSync"
                    :disabled="selectedFields.length === 0 || syncing"
                >
                    <PhArrowsClockwise :size="16" />
                    {{ syncing ? 'Syncing...' : `Sync ${selectedFields.length} Field(s)` }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { PhArrowsLeftRight, PhX, PhWarning, PhCheckCircle, PhArrowsClockwise, PhArrowLeft, PhCheck } from '@phosphor-icons/vue';
import FieldSourceChip from '@/components/permits/FieldSourceChip.vue';

const props = defineProps({
    caseId: {
        type: String,
        required: true
    },
    currentData: {
        type: Object,
        required: true
    },
    calcJobId: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['close', 'sync']);

const loading = ref(false);
const error = ref(null);
const syncing = ref(false);
const latestData = ref(null);
const selectedFields = ref([]);
const selectAll = ref(false);

// Field definitions with labels
const FIELD_DEFINITIONS = [
    { path: 'transport.overall.width_m', label: 'Width (m)', unit: 'm' },
    { path: 'transport.overall.height_m', label: 'Height (m)', unit: 'm' },
    { path: 'transport.overall.length_m', label: 'Length (m)', unit: 'm' },
    { path: 'transport.overall.gross_kg', label: 'Gross Weight (kg)', unit: 'kg' }
];

const allFields = computed(() => {
    if (!latestData.value) return [];
    
    return FIELD_DEFINITIONS.map(def => {
        const currentValue = getNestedValue(props.currentData, def.path);
        const latestValue = getNestedValue(latestData.value, def.path);
        const currentMeta = getNestedValue(props.currentData, def.path.replace(/\.[^.]+$/, '._meta'));
        
        const changed = currentValue !== latestValue;
        const isOverride = currentMeta?.source === 'MANUAL';
        
        return {
            ...def,
            currentValue,
            latestValue,
            currentMeta,
            changed,
            isOverride
        };
    });
});

const changedFields = computed(() => allFields.value.filter(f => f.changed));
const changedFieldsCount = computed(() => changedFields.value.length);
const overrideFieldsCount = computed(() => changedFields.value.filter(f => f.isOverride).length);
const hasChanges = computed(() => changedFieldsCount.value > 0);
const hasSelectedOverrides = computed(() => 
    selectedFields.value.some(path => {
        const field = allFields.value.find(f => f.path === path);
        return field?.isOverride;
    })
);

const fetchDiff = async () => {
    loading.value = true;
    error.value = null;
    
    try {
        // Fetch latest engineering data from calc job
        const response = await fetch(`/api/v1/calc-jobs/${props.calcJobId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load engineering data');
        }
        
        const calcJob = await response.json();
        latestData.value = calcJob.outputs || {};
        
        // Auto-select all changed fields (except overrides by default)
        selectedFields.value = changedFields.value
            .filter(f => !f.isOverride)
            .map(f => f.path);
        
    } catch (err) {
        error.value = err.message;
        console.error('Failed to fetch diff:', err);
    } finally {
        loading.value = false;
    }
};

const handleSelectAll = () => {
    if (selectAll.value) {
        selectedFields.value = changedFields.value.map(f => f.path);
    } else {
        selectedFields.value = [];
    }
};

const handleSync = async () => {
    if (selectedFields.value.length === 0) return;
    
    syncing.value = true;
    
    try {
        // Build partial update payload
        const updates = {};
        selectedFields.value.forEach(path => {
            const field = allFields.value.find(f => f.path === path);
            if (field) {
                setNestedValue(updates, path, field.latestValue);
            }
        });
        
        emit('sync', {
            fields: selectedFields.value,
            updates
        });
        
        handleClose();
    } catch (err) {
        error.value = err.message;
    } finally {
        syncing.value = false;
    }
};

const handleClose = () => {
    emit('close');
};

const formatValue = (value) => {
    if (value == null) return '—';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
};

// Helper: Get nested object value by path
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

// Helper: Set nested object value by path
const setNestedValue = (obj, path, value) => {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => {
        if (!acc[part]) acc[part] = {};
        return acc[part];
    }, obj);
    target[last] = value;
};

onMounted(() => {
    fetchDiff();
});
</script>

<style scoped>
.engineering-diff-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 50%);
}

.modal-content {
    position: relative;
    background: var(--bg-elevated);
    border-radius: 8px;
    width: 900px;
    max-width: 95vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 24px;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.btn-close:hover {
    background: var(--bg-surface);
}

.modal-body {
    padding: var(--spacing-lg);
    overflow-y: auto;
    flex: 1;
}

.loading-state,
.error-state,
.no-changes-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl) 0;
    gap: var(--spacing-md);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.error-state i {
    font-size: 48px;
    color: var(--danger);
}

.no-changes-state i {
    font-size: 64px;
    color: var(--success);
}

.diff-summary {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-surface);
    border-radius: 6px;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-primary);
}

.summary-item i {
    color: var(--accent);
    font-size: 16px;
}

.summary-item.warning i {
    color: var(--warning);
}

.diff-table-wrapper {
    overflow-x: auto;
    margin-bottom: var(--spacing-md);
}

.diff-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.diff-table thead {
    background: var(--bg-surface);
    border-bottom: 2px solid var(--border);
}

.diff-table th {
    padding: var(--spacing-xs) var(--spacing-sm);
    text-align: left;
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 12px;
    text-transform: uppercase;
}

.diff-table td {
    padding: var(--spacing-sm);
    border-bottom: 1px solid var(--border);
}

.col-select {
    width: 40px;
    text-align: center;
}

.col-field {
    width: 25%;
}

.col-current,
.col-latest {
    width: 25%;
}

.col-status {
    width: 120px;
}

.row-changed {
    background: rgb(255 193 7 / 5%);
}

.row-override {
    background: rgb(244 67 54 / 5%);
}

.field-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
}

.field-path {
    font-size: 11px;
    color: var(--text-tertiary);
    font-family: monospace;
}

.value-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.value {
    font-family: monospace;
    color: var(--text-primary);
}

.value-changed {
    color: var(--warning);
    font-weight: 600;
}

.change-indicator {
    color: var(--accent);
    font-size: 16px;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}

.status-synced {
    background: rgb(76 175 80 / 10%);
    color: #4CAF50;
}

.status-outdated {
    background: rgb(255 193 7 / 10%);
    color: #FFC107;
}

.status-override {
    background: rgb(244 67 54 / 10%);
    color: #F44336;
}

.override-warning {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgb(244 67 54 / 10%);
    border: 1px solid #F44336;
    border-radius: 6px;
    font-size: 13px;
    color: #F44336;
}

.override-warning i {
    font-size: 20px;
    flex-shrink: 0;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border);
}

.btn-secondary,
.btn-primary {
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.btn-secondary {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
}

.btn-secondary:hover {
    background: var(--bg-base);
}

.btn-primary {
    background: var(--accent);
    border: 1px solid var(--accent);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--accent-hover);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
