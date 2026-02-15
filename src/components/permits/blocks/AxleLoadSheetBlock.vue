<template>
    <div class="axle-load-sheet-block">
        <div v-if="!hasAxleData" class="no-data-state">
            <PhTreeStructure :size="48" />
            <p>No axle configuration data available.</p>
            <p class="hint">Link an engineering calculation to auto-populate axle loads.</p>
        </div>

        <div v-else class="axle-sheet">
            <div class="sheet-header">
                <h4>Axle Load Distribution</h4>
                <div class="source-badge" :class="`source-${dataSource.toLowerCase()}`">
                    <component :is="sourceIcon" :size="14" />
                    Source: {{ dataSource }}
                </div>
            </div>

            <div class="axle-table-container">
                <table class="axle-table">
                    <thead>
                        <tr>
                            <th>Axle Group</th>
                            <th>Spacing to Next</th>
                            <th>Load</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(group, index) in axleGroups" :key="index">
                            <td class="group-name">{{ group.name }}</td>
                            <td class="spacing-cell">
                                {{ group.spacing ? formatSpacing(group.spacing) : 'N/A' }}
                            </td>
                            <td class="load-cell">
                                {{ formatLoad(group.load) }}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="2"><strong>Total GVW</strong></td>
                            <td class="total-load"><strong>{{ formatLoad(totalLoad) }}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div v-if="dataSource === 'MANUAL'" class="manual-override-warning">
                <PhWarning :size="16" />
                <span>This data has been manually overridden and will not be updated from engineering calculations.</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, markRaw } from 'vue';
import { PhTreeStructure, PhWarning, PhCpu, PhPencil } from '@phosphor-icons/vue';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update']);

// Computed properties
const hasAxleData = computed(() => {
    const config = props.payload?.transport?.axleConfig;
    return config && config.groups && config.groups.length > 0;
});

const dataSource = computed(() => {
    return props.payload?.transport?.axleConfig?._meta?.source || 'MANUAL';
});

const sourceIcon = computed(() => {
    return dataSource.value === 'ENGINEERING' ? markRaw(PhCpu) : markRaw(PhPencil);
});

const axleGroups = computed(() => {
    const config = props.payload?.transport?.axleConfig;
    if (!config) return [];
    
    const groups = config.groups || [];
    const spacings = config.spacings_m || [];
    const loads = config.loads_kg || [];
    
    return groups.map((name, index) => ({
        name,
        spacing: spacings[index] || null,
        load: loads[index] || 0
    }));
});

const totalLoad = computed(() => {
    return axleGroups.value.reduce((sum, group) => sum + (group.load || 0), 0);
});

// Methods
function formatSpacing(meters) {
    if (!meters) return 'N/A';
    
    // Convert to feet and inches
    const totalInches = meters * 39.3701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    
    return `${feet}' ${inches}"`;
}

function formatLoad(kg) {
    if (!kg) return '0 lb';
    
    // Convert to pounds
    const lbs = Math.round(kg * 2.20462);
    return `${lbs.toLocaleString()} lb`;
}
</script>

<style scoped>
.axle-load-sheet-block {
    padding: var(--spacing-md);
}

.no-data-state {
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--bg-elevated);
    border: 2px dashed var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
}

.no-data-state i {
    font-size: 48px;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
}

.no-data-state p {
    margin: var(--spacing-xs) 0;
}

.no-data-state .hint {
    font-size: 13px;
    color: var(--text-tertiary);
}

.axle-sheet {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
}

.sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
}

.sheet-header h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
}

.source-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.source-badge.source-engineering {
    background: var(--info-bg);
    color: var(--info);
}

.source-badge.source-manual {
    background: var(--warning-bg);
    color: var(--warning);
}

.axle-table-container {
    overflow-x: auto;
}

.axle-table {
    width: 100%;
    border-collapse: collapse;
}

.axle-table thead th {
    background: var(--bg-base);
    padding: var(--spacing-sm) var(--spacing-md);
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid var(--border);
}

.axle-table tbody tr {
    border-bottom: 1px solid var(--border);
}

.axle-table tbody tr:hover {
    background: var(--bg-elevated);
}

.axle-table tbody td {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 14px;
}

.group-name {
    font-weight: 500;
    color: var(--text-primary);
}

.spacing-cell,
.load-cell {
    color: var(--text-primary);
    font-family: Monaco, 'Courier New', monospace;
    font-size: 13px;
}

.axle-table tfoot .total-row {
    background: var(--bg-base);
    border-top: 2px solid var(--border);
}

.axle-table tfoot td {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 14px;
}

.total-load {
    font-family: Monaco, 'Courier New', monospace;
    font-size: 15px;
    color: var(--accent);
}

.manual-override-warning {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--warning-bg);
    color: var(--warning);
    font-size: 13px;
    border-top: 1px solid var(--warning);
}

.manual-override-warning i {
    font-size: 16px;
}
</style>
