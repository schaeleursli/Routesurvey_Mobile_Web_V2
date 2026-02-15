<template>
    <div class="table-config-panel">
        <div class="config-header">
            <span class="config-title">Table Configuration</span>
            <BaseButton variant="ghost" size="small" @click="showConfig = !showConfig">
                <i class="bi" :class="showConfig ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </BaseButton>
        </div>

        <div v-if="showConfig" class="config-content">
            <!-- Column Visibility -->
            <div class="config-section">
                <div class="section-title">Visible Columns</div>
                <div class="column-checkboxes">
                    <label v-for="column in availableColumns" :key="column.key" class="checkbox-label">
                        <input type="checkbox" :checked="isColumnVisible(column.key)"
                            @change="toggleColumn(column.key)" />
                        <span>{{ column.label }}</span>
                    </label>
                </div>
            </div>

            <!-- Sort Options -->
            <div class="config-section">
                <div class="section-title">Sort By</div>
                <select v-model="localConfig.sortBy" @change="updateConfig" class="config-select">
                    <option value="">None</option>
                    <option v-for="column in availableColumns" :key="column.key" :value="column.key">
                        {{ column.label }}
                    </option>
                </select>
            </div>

            <!-- Sort Order -->
            <div v-if="localConfig.sortBy" class="config-section">
                <div class="section-title">Sort Order</div>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" value="asc" v-model="localConfig.sortOrder" @change="updateConfig" />
                        <span>Ascending (A-Z)</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" value="desc" v-model="localConfig.sortOrder" @change="updateConfig" />
                        <span>Descending (Z-A)</span>
                    </label>
                </div>
            </div>

            <!-- Filters -->
            <div class="config-section">
                <div class="section-title">Filters</div>
                <div class="filter-inputs">
                    <div v-for="column in filterableColumns" :key="column.key" class="filter-item">
                        <label>{{ column.label }}</label>
                        <input type="text" v-model="localConfig.filters[column.key]" @input="updateConfig"
                            :placeholder="`Filter by ${column.label}...`" class="filter-input" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Table Preview -->
        <div class="table-preview">
            <div class="preview-note">
                <i class="bi bi-info-circle"></i>
                <span>Table will be generated from route data</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { BaseButton } from '@/components/ui';

const props = defineProps({
    block: {
        type: Object,
        required: true,
    },
    config: {
        type: Object,
        default: () => ({}),
    },
});

const emit = defineEmits(['update-config']);

const showConfig = ref(false);

const localConfig = ref({
    visibleColumns: props.config.visibleColumns || [],
    sortBy: props.config.sortBy || '',
    sortOrder: props.config.sortOrder || 'asc',
    filters: props.config.filters || {},
});

watch(() => props.config, (newConfig) => {
    localConfig.value = {
        visibleColumns: newConfig.visibleColumns || [],
        sortBy: newConfig.sortBy || '',
        sortOrder: newConfig.sortOrder || 'asc',
        filters: newConfig.filters || {},
    };
}, { deep: true });

// Define available columns based on table type
const availableColumns = computed(() => {
    const tableType = props.block.config?.type;

    if (tableType === 'obstructions') {
        return [
            { key: 'type', label: 'Type' },
            { key: 'location', label: 'Location' },
            { key: 'height', label: 'Height' },
            { key: 'clearance', label: 'Clearance' },
            { key: 'notes', label: 'Notes' },
        ];
    }

    if (tableType === 'clearance') {
        return [
            { key: 'point', label: 'Point' },
            { key: 'clearance', label: 'Clearance' },
            { key: 'height', label: 'Height' },
            { key: 'distance', label: 'Distance' },
        ];
    }

    if (tableType === 'notes') {
        return [
            { key: 'point', label: 'Point' },
            { key: 'note', label: 'Note' },
            { key: 'date', label: 'Date' },
            { key: 'image', label: 'Image' },
        ];
    }

    return [];
});

const filterableColumns = computed(() => {
    return availableColumns.value.filter(col =>
        ['type', 'location', 'point'].includes(col.key)
    );
});

function isColumnVisible(columnKey) {
    return localConfig.value.visibleColumns.includes(columnKey);
}

function toggleColumn(columnKey) {
    const index = localConfig.value.visibleColumns.indexOf(columnKey);
    if (index > -1) {
        localConfig.value.visibleColumns.splice(index, 1);
    } else {
        localConfig.value.visibleColumns.push(columnKey);
    }
    updateConfig();
}

function updateConfig() {
    emit('update-config', { ...localConfig.value });
}
</script>

<style scoped>
.table-config-panel {
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-elevated);
}

.config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--border);
}

.config-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
}

.config-content {
    padding: var(--spacing-md);
}

.config-section {
    margin-bottom: var(--spacing-md);
}

.config-section:last-child {
    margin-bottom: 0;
}

.section-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.column-checkboxes {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 13px;
    color: var(--text-primary);
    cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
    cursor: pointer;
}

.config-select {
    width: 100%;
    padding: var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 13px;
}

.radio-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.radio-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 13px;
    color: var(--text-primary);
    cursor: pointer;
}

.radio-label input[type="radio"] {
    cursor: pointer;
}

.filter-inputs {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.filter-item label {
    font-size: 12px;
    color: var(--text-secondary);
}

.filter-input {
    width: 100%;
    padding: var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 13px;
}

.table-preview {
    padding: var(--spacing-md);
    border-top: 1px solid var(--border);
}

.preview-note {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--bg-surface);
    border-radius: 6px;
    font-size: 12px;
    color: var(--text-secondary);
}

.preview-note i {
    color: var(--accent);
}
</style>
