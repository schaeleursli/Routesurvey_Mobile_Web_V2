<template>
    <div class="engineering-summary-block">
        <div v-if="!isLinked" class="not-linked-state">
            <PhLink :size="48" />
            <p>No engineering calculation linked to this permit case.</p>
            <p class="hint">Link a transport engineering calculation to auto-populate dimensions and axle loads.</p>
        </div>

        <div v-else class="linked-state">
            <div class="summary-header">
                <div class="header-left">
                    <PhCpu :size="20" />
                    <h4>Linked Engineering Calculation</h4>
                </div>
                <button class="btn-sync" @click="handleSync" :disabled="syncing">
                    <PhArrowsClockwise :size="14" :class="{ 'spinning': syncing }" />
                    {{ syncing ? 'Syncing...' : 'Sync Data' }}
                </button>
            </div>

             <div class="summary-content">
                <div class="info-grid">
                    <div class="info-item">
                        <label>Job ID</label>
                        <span class="value mono">{{ jobId.slice(0, 8) }}...</span>
                    </div>
                    <div class="info-item">
                        <label>Last Sync</label>
                        <span class="value">{{ formatTimestamp(lastSync) }}</span>
                    </div>
                </div>

                <div class="dimensions-summary">
                    <h5>Overall Dimensions</h5>
                    <div class="dim-grid">
                        <div class="dim-card">
                            <label>Width</label>
                            <span class="dim-value">{{ formatDimension(width) }}</span>
                        </div>
                        <div class="dim-card">
                            <label>Height</label>
                            <span class="dim-value">{{ formatDimension(height) }}</span>
                        </div>
                        <div class="dim-card">
                            <label>Length</label>
                            <span class="dim-value">{{ formatDimension(length) }}</span>
                        </div>
                        <div class="dim-card">
                            <label>Gross Weight</label>
                            <span class="dim-value">{{ formatWeight(grossKg) }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="axleCount" class="axle-summary">
                    <h5>Axle Configuration</h5>
                    <p>{{ axleCount }} axle groups configured</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { PhLink, PhCpu, PhArrowsClockwise } from '@phosphor-icons/vue';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['sync', 'update']);

const syncing = ref(false);

// Computed properties
const isLinked = computed(() => {
    const meta = props.payload?.transport?.overall?._meta;
    return meta?.source === 'ENGINEERING' && meta?.sourceRef?.calcJobId;
});

const jobId = computed(() => {
    return props.payload?.transport?.overall?._meta?.sourceRef?.calcJobId || '';
});

const lastSync = computed(() => {
    return props.payload?.transport?.overall?._meta?.updatedAt;
});

const width = computed(() => props.payload?.transport?.overall?.width_m);
const height = computed(() => props.payload?.transport?.overall?.height_m);
const length = computed(() => props.payload?.transport?.overall?.length_m);
const grossKg = computed(() => props.payload?.transport?.overall?.gross_kg);

const axleCount = computed(() => {
    return props.payload?.transport?.axleConfig?.groups?.length || 0;
});

// Methods
function formatDimension(meters) {
    if (!meters) return 'N/A';
    
    // Convert to feet and inches
    const totalInches = meters * 39.3701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    
    return `${feet}'-${inches}"`;
}

function formatWeight(kg) {
    if (!kg) return 'N/A';
    
    // Convert to pounds
    const lbs = Math.round(kg * 2.20462);
    return `${lbs.toLocaleString()} lb`;
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
}

async function handleSync() {
    syncing.value = true;
    
    try {
        emit('sync');
    } finally {
        setTimeout(() => {
            syncing.value = false;
        }, 1000);
    }
}
</script>

<style scoped>
.engineering-summary-block {
    padding: var(--spacing-md);
}

.not-linked-state {
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--bg-elevated);
    border: 2px dashed var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
}

.not-linked-state i {
    font-size: 48px;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
}

.not-linked-state p {
    margin: var(--spacing-xs) 0;
}

.not-linked-state .hint {
    font-size: 13px;
    color: var(--text-tertiary);
}

.linked-state {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
}

.summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
}

.header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.header-left i {
    font-size: 20px;
    color: var(--accent);
}

.header-left h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
}

.btn-sync {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
}

.btn-sync:hover:not(:disabled) {
    background: var(--bg-elevated);
    border-color: var(--accent);
}

.btn-sync:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-sync i.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.summary-content {
    padding: var(--spacing-md);
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--border);
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-item label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-item .value {
    font-size: 14px;
    color: var(--text-primary);
}

.info-item .value.mono {
    font-family: Monaco, 'Courier New', monospace;
    font-size: 13px;
}

.dimensions-summary h5,
.axle-summary h5 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.dim-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-sm);
}

.dim-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--spacing-sm);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.dim-card label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
}

.dim-card .dim-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.axle-summary {
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border);
}

.axle-summary p {
    margin: 0;
    font-size: 14px;
    color: var(--text-primary);
}
</style>
