<template>
    <div class="point-metadata">
        <h5 class="metadata-title">Metadata</h5>
        <div class="metadata-grid">
            <!-- Severity -->
            <div class="metadata-item">
                <label>Severity</label>
                <select v-if="isEdit" :value="modelValue.severity" @input="updateField('severity', $event.target.value)" class="form-control" :class="getSeverityClass(modelValue.severity)">
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                    <option value="info">Info</option>
                </select>
                <div v-else class="info-value" :class="getSeverityClass(modelValue.severity)">
                    {{ formatSeverity(modelValue.severity) }}
                </div>
            </div>

            <!-- Status -->
            <div class="metadata-item">
                <label>Status</label>
                <select v-if="isEdit" :value="modelValue.status" @input="updateField('status', $event.target.value)" class="form-control">
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
                <div v-else class="info-value">
                    {{ formatStatus(modelValue.status) }}
                </div>
            </div>

            <!-- GPS Accuracy (Read Only) -->
            <div class="metadata-item">
                <label>GPS Accuracy</label>
                <div class="info-value readonly">
                    {{ pointData.gpsAccuracy ? pointData.gpsAccuracy + ' m' : 'N/A' }}
                </div>
            </div>

            <!-- Capture Time (Read Only) -->
            <div class="metadata-item">
                <label>Capture Time</label>
                <div class="info-value readonly">
                    {{ pointData.timestamp ? new Date(pointData.timestamp).toLocaleString() : 'N/A' }}
                </div>
            </div>

            <!-- Created By (Read Only) -->
            <div class="metadata-item full-width">
                <label>Created By</label>
                <div class="info-value readonly">
                    {{ pointData.createdBy || 'Unknown User' }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    },
    point: {
        type: Object,
        default: () => ({})
    },
    isEdit: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

// Parse point data for read-only fields that might not be in the form model
const pointData = computed(() => {
    if (!props.point || !props.point.data) return {};
    try {
        if (typeof props.point.data === 'string') {
            return JSON.parse(props.point.data);
        }
        return props.point.data;
    } catch (e) {
        return {};
    }
});

const updateField = (field, value) => {
    emit('update:modelValue', {
        ...props.modelValue,
        [field]: value
    });
};

const getSeverityClass = (severity) => {
    if (!severity) return 'severity-info';
    return `severity-${severity.toLowerCase()}`;
};

const formatSeverity = (severity) => {
    if (!severity) return 'Info';
    return severity.charAt(0).toUpperCase() + severity.slice(1);
};

const formatStatus = (status) => {
    if (!status) return 'Open';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};
</script>

<style scoped>
.point-metadata {
    background: var(--bs-tertiary-bg);
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid var(--bs-border-color);
    padding: 1rem;
}

.metadata-title {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--bs-secondary);
    margin-bottom: 1rem;
    font-weight: 600;
}

.metadata-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.metadata-item {
    display: flex;
    flex-direction: column;
}

.metadata-item.full-width {
    grid-column: 1 / -1;
}

.metadata-item label {
    font-size: 0.75rem;
    color: var(--bs-secondary);
    margin-bottom: 0.25rem;
}

.form-control, .info-value {
    padding: 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.9rem;
}

.info-value {
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    min-height: 2.5rem;
    display: flex;
    align-items: center;
}

.info-value.readonly {
    background: transparent;
    border: none;
    padding-left: 0;
    color: var(--bs-body-color);
}

/* Severity Colors */
.severity-critical { color: #dc3545; border-color: #dc3545; }
.severity-major { color: #fd7e14; border-color: #fd7e14; }
.severity-minor { color: #ffc107; border-color: #ffc107; }
.severity-info { color: #0dcaf0; border-color: #0dcaf0; }
</style>
