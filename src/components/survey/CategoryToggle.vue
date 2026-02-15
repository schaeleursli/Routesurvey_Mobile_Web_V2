<template>
    <div class="category-toggle">
        <label class="toggle-label" v-if="label">{{ label }}</label>
        <div class="toggle-container">
            <button 
                type="button"
                class="toggle-option obstruction"
                :class="{ active: modelValue === 'obstruction' }"
                @click="updateValue('obstruction')"
            >
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span>Obstruction</span>
            </button>
            <button 
                type="button"
                class="toggle-option observation"
                :class="{ active: modelValue === 'observation' }"
                @click="updateValue('observation')"
            >
                <i class="bi bi-eye-fill"></i>
                <span>Observation</span>
            </button>
        </div>
        <div v-if="error" class="error-message">
            <i class="bi bi-exclamation-circle"></i> {{ error }}
        </div>
    </div>
</template>

<script setup>
defineProps({
    modelValue: {
        type: String,
        default: null
    },
    label: {
        type: String,
        default: ''
    },
    error: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (val) => {
    emit('update:modelValue', val);
};
</script>

<style scoped>
.category-toggle {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.toggle-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
}

.toggle-container {
    display: flex;
    background-color: var(--bg-surface-2);
    border-radius: 8px;
    padding: 4px;
    gap: 4px;
    border: 1px solid var(--border);
}

.toggle-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.toggle-option:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
}

/* Active States */
.toggle-option.active {
    background-color: var(--bg-surface);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
    font-weight: 600;
}

.toggle-option.obstruction.active {
    color: var(--error); /* Red/Orange for obstruction */
    background-color: #fff1f0; /* Light red tint */
    border: 1px solid var(--error-light);
}

.toggle-option.observation.active {
    color: var(--primary); /* Blue/Green for observation */
    background-color: #f0f7ff; /* Light blue tint */
    border: 1px solid var(--primary-light);
}

.error-message {
    font-size: 0.8rem;
    color: var(--error);
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>
