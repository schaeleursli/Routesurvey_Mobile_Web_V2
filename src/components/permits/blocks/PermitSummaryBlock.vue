<template>
    <div class="permit-summary-block">
        <div class="summary-header">
            <h3>Permit Application Summary</h3>
            <div class="case-id">Case: {{ caseId || 'Draft' }}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-item">
                <label>Application Title</label>
                <input
                    type="text"
                    v-model="localTitle"
                    @input="handleUpdate"
                    class="form-control"
                    placeholder="Enter permit title"
                />
            </div>

            <div class="summary-item">
                <label>Prepared By</label>
                <input
                    type="text"
                    v-model="payload.compliance.preparedBy"
                    @input="handleUpdate"
                    class="form-control"
                    placeholder="Name"
                />
            </div>

            <div class="summary-item">
                <label>Survey Date</label>
                <input
                    type="date"
                    v-model="payload.compliance.surveyDate"
                    @input="handleUpdate"
                    class="form-control"
                />
            </div>

            <div class="summary-item">
                <label>States in Route</label>
                <div class="states-chips">
                    <span
                        v-for="state in states"
                        :key="state"
                        class="state-chip"
                    >
                        {{ state }}
                    </span>
                </div>
            </div>
        </div>

        <div class="summary-section">
            <h4>Route Information</h4>
            <div class="route-info">
                <div class="info-item">
                    <span class="label">Route ID:</span>
                    <span class="value">{{ payload.route.id }}</span>
                </div>
                <div class="info-item">
                    <span class="label">Route Name:</span>
                    <input
                        type="text"
                        v-model="payload.route.name"
                        @input="handleUpdate"
                        class="form-control inline"
                        placeholder="Route name"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    },
    caseId: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['update', 'update-title']);

const localTitle = ref('');

const states = computed(() => {
    return props.payload.route?.statesInRoute || [];
});

watch(() => props.payload.title, (newVal) => {
    localTitle.value = newVal || '';
}, { immediate: true });

const handleUpdate = () => {
    emit('update', props.payload);
    
    if (localTitle.value) {
        emit('update-title', localTitle.value);
    }
};
</script>

<style scoped>
.permit-summary-block {
    padding: var(--spacing-md);
}

.summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 2px solid var(--border);
}

.summary-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.case-id {
    font-size: 12px;
    color: var(--text-secondary);
    font-family: monospace;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.summary-item label {
    display: block;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
}

.states-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
}

.state-chip {
    padding: 4px 12px;
    background: var(--accent-bg);
    color: var(--accent);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.summary-section {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border);
}

.summary-section h4 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
}

.route-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.info-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 14px;
}

.info-item .label {
    color: var(--text-secondary);
    font-weight: 500;
    min-width: 100px;
}

.info-item .value {
    color: var(--text-primary);
    font-family: monospace;
}

.form-control {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color 0.2s;
    width: 100%;
}

.form-control.inline {
    flex: 1;
}

.form-control:focus {
    outline: none;
    border-color: var(--accent);
}
</style>
