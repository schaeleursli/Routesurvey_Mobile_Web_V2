<template>
    <div class="imperial-dimension-input">
        <label v-if="label" class="input-label">{{ label }}</label>
        <div class="dimension-fields">
            <div class="field-group">
                <input
                    type="number"
                    v-model.number="localFeet"
                    @input="handleInput"
                    :placeholder="placeholder"
                    class="form-control"
                    min="0"
                    step="1"
                />
                <span class="unit-label">ft</span>
            </div>
            <div class="field-group">
                <input
                    type="number"
                    v-model.number="localInches"
                    @input="handleInput"
                    placeholder="0"
                    class="form-control"
                    min="0"
                    max="11"
                    step="1"
                />
                <span class="unit-label">in</span>
            </div>
        </div>
        <div v-if="showFormatted && modelValue" class="formatted-value">
            {{ formattedValue }}
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { metersToFeetInches, feetInchesToMeters, formatDimension } from '@/utils/imperialUnits';

const props = defineProps({
    modelValue: {
        type: Number, // meters
        default: null
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: '0'
    },
    showFormatted: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const localFeet = ref(null);
const localInches = ref(null);

// Initialize from modelValue (meters)
const initializeFromMeters = (meters) => {
    if (meters === null || meters === undefined) {
        localFeet.value = null;
        localInches.value = null;
        return;
    }
    
    const { feet, inches } = metersToFeetInches(meters);
    localFeet.value = feet;
    localInches.value = inches;
};

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
    initializeFromMeters(newVal);
}, { immediate: true });

// Handle user input
const handleInput = () => {
    const feet = localFeet.value ?? 0;
    const inches = localInches.value ?? 0;
    
    if (feet === 0 && inches === 0) {
        emit('update:modelValue', null);
    } else {
        const meters = feetInchesToMeters(feet, inches);
        emit('update:modelValue', meters);
    }
};

const formattedValue = computed(() => {
    return props.modelValue ? formatDimension(props.modelValue) : '—';
});
</script>

<style scoped>
.imperial-dimension-input {
    margin-bottom: var(--spacing-md);
}

.input-label {
    display: block;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
}

.dimension-fields {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
}

.field-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex: 1;
}

.field-group input {
    flex: 1;
    max-width: 100px;
}

.unit-label {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-secondary);
    min-width: 20px;
}

.formatted-value {
    margin-top: var(--spacing-xs);
    font-size: 13px;
    color: var(--text-secondary);
    font-style: italic;
}

.form-control {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: var(--accent);
}

/* Remove spinner arrows in Chrome, Safari, Edge, Opera */
.form-control::-webkit-outer-spin-button,
.form-control::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
}

/* Remove spinner arrows in Firefox */
.form-control[type="number"] {
    appearance: textfield;
}
</style>
