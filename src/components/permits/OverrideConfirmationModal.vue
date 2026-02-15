<template>
    <div class="override-modal">
        <div class="modal-overlay" @click="$emit('close')"></div>
        <div class="modal-content">
            <div class="modal-header">
                <PhWarning :size="24" class="warning-icon" />
                <h3>Override Engineering Data</h3>
                <button class="btn-close" @click="$emit('close')">
                    <PhX :size="24" />
                </button>
            </div>

            <div class="modal-body">
                <p class="warning-message">
                    You are about to manually override data that was automatically populated from
                    engineering calculations.
                </p>

                <div class="field-info">
                    <div class="info-row">
                        <span class="label">Field:</span>
                        <span class="value">{{ fieldLabel }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Engineering Value:</span>
                        <span class="value engineering">{{ engineeringValue }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Your Value:</span>
                        <span class="value manual">{{ manualValue }}</span>
                    </div>
                    <div v-if="calcJobId" class="info-row">
                        <span class="label">Source:</span>
                        <span class="value">Calc Job {{ calcJobId.substring(0, 8) }}</span>
                    </div>
                </div>

                <div class="impact-box">
                    <PhInfo :size="20" />
                    <div>
                        <strong>Impact:</strong>
                        <ul>
                            <li>This field will be marked as manually overridden</li>
                            <li>Future engineering syncs will preserve your value</li>
                            <li>Override will be logged in audit trail</li>
                            <li>Permit status may change based on new value</li>
                        </ul>
                    </div>
                </div>

                <div class="checkbox-container">
                    <input 
                        type="checkbox" 
                        id="confirm-override" 
                        v-model="confirmed"
                    />
                    <label for="confirm-override">
                        I understand this will override engineering-sourced data
                    </label>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-secondary" @click="$emit('close')">
                    Cancel
                </button>
                <button
                    class="btn-warning"
                    @click="handleConfirm"
                    :disabled="!confirmed"
                >
                    <PhPencil :size="16" />
                    Confirm Override
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { PhWarning, PhX, PhInfo, PhPencil } from '@phosphor-icons/vue';

const props = defineProps({
    fieldLabel: {
        type: String,
        required: true
    },
    engineeringValue: {
        type: [String, Number],
        required: true
    },
    manualValue: {
        type: [String, Number],
        required: true
    },
    calcJobId: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['close', 'confirm']);

const confirmed = ref(false);

const handleConfirm = () => {
    if (confirmed.value) {
        emit('confirm');
    }
};
</script>

<style scoped>
.override-modal {
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
    border-radius: 8px;
    width: 550px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
}

.modal-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border);
}

.warning-icon {
    color: var(--warning);
    font-size: 24px;
}

.modal-header h3 {
    margin: 0;
    flex: 1;
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
    max-height: calc(90vh - 180px);
    overflow-y: auto;
}

.warning-message {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
}

.field-info {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 13px;
}

.info-row .label {
    color: var(--text-secondary);
    font-weight: 500;
}

.info-row .value {
    color: var(--text-primary);
    font-weight: 600;
}

.info-row .value.engineering {
    color: #2196F3;
}

.info-row .value.manual {
    color: #9C27B0;
}

.impact-box {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--warning-bg);
    border: 1px solid var(--warning);
    border-radius: 6px;
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

.impact-box i {
    font-size: 20px;
    color: var(--warning);
    flex-shrink: 0;
    margin-top: 2px;
}

.impact-box strong {
    display: block;
    margin-bottom: 4px;
    color: var(--warning);
}

.impact-box ul {
    margin: 4px 0 0;
    padding-left: 20px;
}

.impact-box li {
    margin: 2px 0;
    color: var(--text-secondary);
}

.checkbox-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    background: var(--bg-base);
    border-radius: 4px;
}

.checkbox-container input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.checkbox-container label {
    margin: 0;
    font-size: 13px;
    color: var(--text-primary);
    cursor: pointer;
    user-select: none;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border);
    background: var(--bg-surface);
}

.btn-secondary,
.btn-warning {
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
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    color: var(--text-primary);
}

.btn-secondary:hover {
    background: var(--bg-base);
}

.btn-warning {
    background: var(--warning);
    border: 1px solid var(--warning);
    color: white;
}

.btn-warning:hover:not(:disabled) {
    background: var(--warning-hover);
}

.btn-warning:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
