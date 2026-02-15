<template>
    <div class="workflow-stepper">
        <label class="stepper-label" v-if="label">{{ label }}</label>
        
        <div class="steps-container">
            <!-- Step 1: Surveyed -->
            <div class="step-item" :class="getStepClass('surveyed')">
                <button 
                    class="step-indicator" 
                    @click="handleStepClick('surveyed')"
                    :disabled="isBlocked('surveyed')"
                >
                    <i class="bi bi-check" v-if="isComplete('surveyed')"></i>
                    <span v-else>1</span>
                </button>
                <span class="step-label">Surveyed</span>
                <div class="step-line"></div>
            </div>

            <!-- Step 2: Reviewed -->
            <div class="step-item" :class="getStepClass('reviewed')">
                <div class="step-line-start"></div>
                <button 
                    class="step-indicator" 
                    @click="handleStepClick('reviewed')"
                    :disabled="isBlocked('reviewed')"
                >
                    <i class="bi bi-check" v-if="isComplete('reviewed')"></i>
                    <span v-else>2</span>
                </button>
                <span class="step-label">Reviewed</span>
                <div class="step-line"></div>
            </div>

            <!-- Step 3: Ready -->
            <div class="step-item" :class="getStepClass('ready')">
                <div class="step-line-start"></div>
                <button 
                    class="step-indicator" 
                    @click="handleStepClick('ready')"
                    :disabled="isBlocked('ready')"
                >
                    <i class="bi bi-check" v-if="isComplete('ready')"></i>
                    <span v-else>3</span>
                </button>
                <span class="step-label">Ready</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: String, // 'draft', 'surveyed', 'reviewed', 'ready'
        default: 'draft'
    },
    label: {
        type: String,
        default: 'Workflow Status'
    },
    isCategorySet: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

// Helper to determining rank of status
const getRank = (status) => {
    const map = { 'draft': 0, 'surveyed': 1, 'reviewed': 2, 'ready': 3 };
    return map[status] || 0;
};

const currentRank = computed(() => getRank(props.modelValue));

const isComplete = (step) => {
    return currentRank.value >= getRank(step);
};

const isBlocked = (step) => {
    // Can't mark reviewed if not surveyed
    if (step === 'surveyed') return !props.isCategorySet;
    if (step === 'reviewed') return currentRank.value < 1; 
    if (step === 'ready') return currentRank.value < 2;
    return false;
};

const getStepClass = (step) => {
    const rank = getRank(step);
    if (currentRank.value >= rank) return 'completed';
    if (currentRank.value === rank - 1 && !isBlocked(step)) return 'active'; // Next available step
    return 'pending';
};

const handleStepClick = (step) => {
    if (isBlocked(step)) return;
    
    // Toggle off? No, usually we just set to this step.
    // If clicking current step, maybe do nothing.
    // If clicking a future step, advance.
    emit('update:modelValue', step);
};
</script>

<style scoped>
.workflow-stepper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.stepper-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
}

.steps-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
    z-index: 1;
}

.step-item:first-child {
    align-items: flex-start;
}

.step-item:last-child {
    align-items: flex-end;
}

/* Indicators */
.step-indicator {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: var(--bg-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 2;
}

/* Step Lines */
.step-line, .step-line-start {
    position: absolute;
    top: 14px;
    height: 2px;
    background-color: var(--border);
    width: 50%;
    z-index: 0;
}

.step-item:first-child .step-line {
    right: 0;
    left: 14px;
    width: calc(100% - 14px);
}

.step-item:last-child .step-line-start {
    left: 0;
    right: 14px;
    width: calc(100% - 14px);
}

.step-item:not(:first-child, :last-child) .step-line {
    right: 0;
    left: 50%;
    width: 50%;
}

.step-item:not(:first-child, :last-child) .step-line-start {
    left: 0;
    right: 50%;
    width: 50%;
}

.step-label {
    font-size: 0.7rem;
    margin-top: 4px;
    color: var(--text-secondary);
    font-weight: 500;
}

/* States */
.step-item.completed .step-indicator {
    background-color: var(--success);
    border-color: var(--success);
    color: white;
}

.step-item.completed .step-label {
    color: var(--success);
    font-weight: 600;
}

.step-item.active .step-indicator {
    border-color: var(--primary);
    color: var(--primary);
    background-color: var(--bg-surface);
    box-shadow: 0 0 0 3px var(--primary-light);
}

.step-item.active .step-label {
    color: var(--primary);
    font-weight: 600;
}

button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.step-item.completed .step-line, 
.step-item.completed .step-line-start {
    background-color: var(--success); /* Or primary */
}
</style>
