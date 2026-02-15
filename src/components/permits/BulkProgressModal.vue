<template>
    <div v-if="visible" class="bulk-progress-modal">
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>{{ operation }}</h3>
                <button
                    v-if="!isProcessing"
                    class="btn-close"
                    @click="$emit('close')"
                >
                    <PhX :size="20" />
                </button>
            </div>

            <div class="modal-body">
                <!-- Progress Bar -->
                <div class="progress-section">
                    <div class="progress-bar-container">
                        <div
                            class="progress-bar-fill"
                            :style="{ width: `${progressPercent}%` }"
                        ></div>
                    </div>
                    <div class="progress-text">
                        {{ progress.current }} / {{ progress.total }} completed
                    </div>
                </div>

                <!-- Results List -->
                <div v-if="results.length > 0" class="results-list">
                    <div
                        v-for="(result, index) in results"
                        :key="result.case_id || index"
                        class="result-item"
                        :class="`status-${result.status}`"
                    >
                        <div class="result-icon">
                            <component :is="getStatusIcon(result.status)" :size="20" weight="fill" />
                        </div>
                        <div class="result-content">
                            <div class="result-case-id">{{ result.case_id }}</div>
                            <div class="result-message">{{ result.message }}</div>
                        </div>
                    </div>
                </div>

                <!-- Summary (when complete) -->
                <div v-if="!isProcessing && summary" class="summary-section">
                    <div class="summary-stats">
                        <div v-if="summary.succeeded > 0" class="stat success">
                            <PhCheckCircle :size="18" weight="fill" />
                            <span>{{ summary.succeeded }} succeeded</span>
                        </div>
                        <div v-if="summary.failed > 0" class="stat error">
                            <PhXCircle :size="18" weight="fill" />
                            <span>{{ summary.failed }} failed</span>
                        </div>
                        <div v-if="summary.skipped > 0" class="stat warning">
                            <PhWarningCircle :size="18" weight="fill" />
                            <span>{{ summary.skipped }} skipped</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button
                    v-if="!isProcessing"
                    class="btn-primary"
                    @click="$emit('close')"
                >
                    Done
                </button>
                <div v-else class="processing-indicator">
                    <div class="spinner"></div>
                    <span>Processing...</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { PhX, PhCheckCircle, PhXCircle, PhWarningCircle, PhMinusCircle, PhHourglass } from '@phosphor-icons/vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    operation: {
        type: String,
        default: 'Bulk Operation'
    },
    progress: {
        type: Object,
        default: () => ({ current: 0, total: 0 })
    },
    results: {
        type: Array,
        default: () => []
    },
    isProcessing: {
        type: Boolean,
        default: false
    },
    summary: {
        type: Object,
        default: null
    }
});

defineEmits(['close']);

const progressPercent = computed(() => {
    if (props.progress.total === 0) return 0;
    return Math.round((props.progress.current / props.progress.total) * 100);
});

const getStatusIcon = (status) => {
    switch (status) {
        case 'success':
            return PhCheckCircle;
        case 'error':
            return PhXCircle;
        case 'skipped':
            return PhMinusCircle;
        default:
            return PhHourglass;
    }
};
</script>

<style scoped>
.bulk-progress-modal {
    position: fixed;
    inset: 0;
    z-index: 1001;
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
    border-radius: 12px;
    width: 600px;
    max-width: 90vw;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgb(0 0 0 / 30%);
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
    transition: all 0.2s;
}

.btn-close:hover {
    background: var(--bg-surface);
}

.modal-body {
    padding: var(--spacing-lg);
    overflow-y: auto;
    flex: 1;
}

.progress-section {
    margin-bottom: var(--spacing-lg);
}

.progress-bar-container {
    height: 8px;
    background: var(--bg-surface);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: var(--spacing-xs);
}

.progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-hover));
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 13px;
    color: var(--text-secondary);
    text-align: center;
}

.results-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    max-height: 300px;
    overflow-y: auto;
}

.result-item {
    display: flex;
    align-items: start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--bg-surface);
    border-radius: 6px;
    border-left: 3px solid;
}

.result-item.status-success {
    border-left-color: var(--success);
}

.result-item.status-error {
    border-left-color: var(--danger);
}

.result-item.status-skipped {
    border-left-color: var(--warning);
}

.result-icon {
    font-size: 20px;
    margin-top: 2px;
}

.result-item.status-success .result-icon {
    color: var(--success);
}

.result-item.status-error .result-icon {
    color: var(--danger);
}

.result-item.status-skipped .result-icon {
    color: var(--warning);
}

.result-content {
    flex: 1;
}

.result-case-id {
    font-size: 12px;
    font-family: monospace;
    color: var(--text-secondary);
    margin-bottom: 2px;
}

.result-message {
    font-size: 13px;
    color: var(--text-primary);
}

.summary-section {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--bg-surface);
    border-radius: 8px;
}

.summary-stats {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
}

.stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
}

.stat i {
    font-size: 18px;
}

.stat.success {
    color: var(--success);
}

.stat.error {
    color: var(--danger);
}

.stat.warning {
    color: var(--warning);
}

.modal-footer {
    display: flex;
    justify-content: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border);
}

.btn-primary {
    padding: var(--spacing-xs) var(--spacing-lg);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--accent);
    border: none;
    color: white;
}

.btn-primary:hover {
    background: var(--accent-hover);
}

.processing-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
    font-size: 14px;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
