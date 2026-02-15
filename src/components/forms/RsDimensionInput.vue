<template>
    <div class="rs-dimension-input">
        <label v-if="label" class="form-label">{{ label }}</label>
        
        <!-- Edit Mode -->
        <div v-if="!disabled" class="input-group">
            <input 
                ref="inputRef"
                :value="displayValue" 
                :disabled="disabled" 
                type="text" 
                inputmode="decimal"
                class="form-control" 
                @input="handleInput" 
                @blur="formatOnBlur"
            />
            <span class="input-group-text">{{ unitLabel }}</span>
        </div>

        <!-- View Mode (Read Only) -->
        <div v-else class="read-only-value">
            <span class="value-text">{{ displayValue || '-' }}</span>
            <span class="unit-text">{{ unitLabel }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    isImperial: {
        type: Boolean,
        default: false
    },
    maxIntegerDigits: {
        type: Number,
        default: 2 
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const inputRef = ref(null);
const displayValue = ref(props.modelValue);

const unitLabel = computed(() => {
    return props.isImperial ? t('feet') : t('meters');
});

// Watch modelValue to update internal state if changed externally
watch(() => props.modelValue, (newVal) => {
    displayValue.value = newVal;
});

const handleInput = (event) => {
    const value = event.target.value;
    
    // Allow typing only numbers and dot
    // Regex allows partial inputs like "12." or ".5" while typing
    const regex = new RegExp(`^\\d{0,${props.maxIntegerDigits}}(\\.\\d{0,2})?$`);
    
    if (value === '' || regex.test(value)) {
        displayValue.value = value;
        emit('update:modelValue', value);
    } else {
        // If invalid keypress, force update back to previous valid displayValue
        // This visual trick ensures invalid chars don't appear
        event.target.value = displayValue.value;
    }
};

const formatOnBlur = () => {
    if (!displayValue.value) return;

    const val = parseFloat(displayValue.value);
    if (isNaN(val)) {
        displayValue.value = '';
        emit('update:modelValue', '');
        return;
    }

    // Split integer and decimal parts
    let [integer, decimal] = displayValue.value.toString().split('.');

    // Truncate integer part if needed (though input handler prevents this mostly)
    if (integer.length > props.maxIntegerDigits) {
        integer = integer.slice(0, props.maxIntegerDigits);
    }

    // Fix decimal to 2 places if it exists, or add it
    if (decimal && decimal.length > 2) {
        decimal = decimal.slice(0, 2);
    } else if (!decimal) {
        decimal = '00';
    } else if (decimal.length === 1) {
        decimal = decimal + '0';
    }

    const formatted = `${integer}.${decimal}`;
    displayValue.value = formatted;
    emit('update:modelValue', formatted);
};
</script>

<style scoped>
.rs-dimension-input {
    margin-bottom: var(--spacing-sm, 0.75rem);
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
}

.form-control {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border-radius: 12px;
    border: 1px solid #444857;
    font-size: 1rem;
    transition: border 0.18s;
}

.form-control:focus {
    border: 1.5px solid #09f;
    outline: none;
}

.input-group {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
}

.input-group .form-control {
    flex: 1;
    width: auto;
    min-width: 0;
    border-radius: 6px 0 0 6px;
    border-right: none;
}

.input-group-text {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    font-size: 14px;
    font-weight: 400; /* RsTypography body2 weight generally */
    color: var(--text-primary);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-left: none;
    border-radius: 0 6px 6px 0;
    white-space: nowrap;
    flex-shrink: 0;
    text-transform: uppercase;
}

.input-group .form-control:focus + .input-group-text {
    border-color: var(--accent);
}

/* Disabled state */
.form-control:disabled {
    background-color: var(--bg-elevated, #2d3748);
    opacity: 0.6;
    cursor: not-allowed;
}

/* Read Only View */
.read-only-value {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border);
}

.value-text {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.unit-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-transform: uppercase;
}
</style>
