<template>
    <div class="imperial-weight-input">
        <label v-if="label" class="input-label">{{ label }}</label>
        <div class="weight-field">
            <input
                type="number"
                v-model.number="localLbs"
                @input="handleInput"
                :placeholder="placeholder"
                class="form-control"
                min="0"
                step="100"
            />
            <span class="unit-label">lb</span>
        </div>
        <div v-if="showFormatted && modelValue" class="formatted-value">
            {{ formattedValue }}
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { kgToLbs, lbsToKg, formatWeight } from '@/utils/imperialUnits';

const props = defineProps({
    modelValue: {
        type: Number, // kilograms
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

const localLbs = ref(null);

// Initialize from modelValue (kg)
const initializeFromKg = (kg) => {
    if (kg === null || kg === undefined) {
        localLbs.value = null;
        return;
    }
    
    localLbs.value = kgToLbs(kg);
};

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
    initializeFromKg(newVal);
}, { immediate: true });

// Handle user input
const handleInput = () => {
    if (localLbs.value === null || localLbs.value === 0) {
        emit('update:modelValue', null);
    } else {
        const kg = lbsToKg(localLbs.value);
        emit('update:modelValue', kg);
    }
};

const formattedValue = computed(() => {
    return props.modelValue ? formatWeight(props.modelValue) : '—';
});
</script>

<style scoped>
.imperial-weight-input {
    margin-bottom: var(--spacing-md);
}

.input-label {
    display: block;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
}

.weight-field {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.weight-field input {
    flex: 1;
    max-width: 200px;
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

/* Remove spinner arrows */
.form-control::-webkit-outer-spin-button,
.form-control::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
}

.form-control[type="number"] {
    appearance: textfield;
}
</style>
