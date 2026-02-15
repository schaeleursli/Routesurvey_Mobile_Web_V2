<template>
    <div class="base-form-field">
        <label v-if="label" class="base-form-field__label" :for="fieldId">
            {{ label }}
        </label>
        <div class="base-form-field__input-wrapper">
            <i v-if="startIcon" :class="[startIcon, 'base-form-field__start-icon']"></i>
            <input v-if="type !== 'textarea' && type !== 'select' && type !== 'checkbox'" :id="fieldId" :type="type"
                :value="modelValue" :placeholder="placeholder" :readonly="readonly" :disabled="disabled" :class="[
                    'base-form-field__input',
                    { 'base-form-field__input--readonly': readonly },
                    { 'base-form-field__input--disabled': disabled },
                    { 'base-form-field__input--with-start-icon': startIcon },
                    { 'base-form-field__input--with-end-icon': endIcon }
                ]" @input="handleInput" @blur="handleBlur" @focus="handleFocus" />
            <textarea v-else-if="type === 'textarea'" :id="fieldId" :value="modelValue" :placeholder="placeholder"
                :readonly="readonly" :disabled="disabled" :rows="rows" :class="[
                    'base-form-field__textarea',
                    { 'base-form-field__textarea--readonly': readonly },
                    { 'base-form-field__textarea--disabled': disabled }
                ]" @input="handleInput" @blur="handleBlur" @focus="handleFocus"></textarea>
            <select v-else-if="type === 'select'" :id="fieldId" :value="modelValue" :disabled="disabled" :class="[
                'base-form-field__select',
                { 'base-form-field__select--disabled': disabled }
            ]" @change="handleInput" @blur="handleBlur" @focus="handleFocus">
                <option v-for="option in options" :key="option.value" :value="option.value">
                    {{ option.label }}
                </option>
            </select>
            <input v-else-if="type === 'checkbox'" :id="fieldId" type="checkbox" :checked="modelValue"
                :disabled="disabled" :class="[
                    'base-form-field__checkbox',
                    { 'base-form-field__checkbox--disabled': disabled }
                ]" @change="handleCheckboxChange" @blur="handleBlur" @focus="handleFocus" />
            <i v-if="endIcon" :class="[
                endIcon, 
                'base-form-field__end-icon',
                { 'base-form-field__end-icon--clickable': endIconClickable }
            ]" @click="handleEndIconClick"></i>
            <span v-if="suffix" class="base-form-field__suffix">{{ suffix }}</span>
        </div>
        <div v-if="error" class="base-form-field__error">
            {{ error }}
        </div>
        <div v-if="help" class="base-form-field__help">
            {{ help }}
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: [String, Number, Boolean],
        default: ''
    },
    type: {
        type: String,
        default: 'text',
        validator: (value) => ['text', 'email', 'password', 'number', 'tel', 'url', 'textarea', 'select', 'checkbox'].includes(value)
    },
    label: {
        type: String,
        default: null
    },
    placeholder: {
        type: String,
        default: null
    },
    readonly: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: null
    },
    help: {
        type: String,
        default: null
    },
    rows: {
        type: Number,
        default: 3
    },
    options: {
        type: Array,
        default: () => []
    },
    startIcon: {
        type: String,
        default: null
    },
    endIcon: {
        type: String,
        default: null
    },
    endIconClickable: {
        type: Boolean,
        default: false
    },
    suffix: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'click:endIcon'])

const fieldId = computed(() => `field-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (event) => {
    emit('update:modelValue', event.target.value)
}

const handleCheckboxChange = (event) => {
    emit('update:modelValue', event.target.checked)
}

const handleBlur = (event) => {
    emit('blur', event)
}

const handleFocus = (event) => {
    emit('focus', event)
}

const handleEndIconClick = (event) => {
    if (props.endIconClickable) {
        emit('click:endIcon', event)
    }
}
</script>

<style scoped>
.base-form-field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.base-form-field__label {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    letter-spacing: var(--letter-spacing-wide);
    margin-bottom: var(--spacing-xs);
}

.base-form-field__input,
.base-form-field__textarea,
.base-form-field__select {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-base);
    color: var(--text-primary);
    transition: all var(--transition-normal);
    outline: none;
    width: 100%;
}

.base-form-field__input:focus,
.base-form-field__textarea:focus,
.base-form-field__select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-focus-ring);
}

.base-form-field__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.base-form-field__start-icon {
    position: absolute;
    left: var(--spacing-md);
    color: var(--text-secondary);
    pointer-events: none;
    z-index: 1;
}

.base-form-field__end-icon {
    position: absolute;
    right: 1rem;
    color: var(--text-secondary);
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.base-form-field__end-icon--clickable {
    cursor: pointer;
}

.base-form-field__end-icon--clickable:hover {
    color: var(--text-primary);
    transform: scale(1.1);
}

.base-form-field__end-icon--clickable:active {
    transform: scale(0.9);
}

.base-form-field__input--with-start-icon {
    padding-left: 2.5rem;
}

.base-form-field__input--with-end-icon {
    padding-right: 2.5rem;
}

.base-form-field__suffix {
    position: absolute;
    right: 1px;
    height: calc(100% - 2px);
    display: flex;
    align-items: center;
    padding: 0 var(--spacing-md);
    background-color: var(--bg-elevated);
    border-left: 1px solid var(--border);
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    pointer-events: none;
}

.base-form-field__input:has(+ .base-form-field__suffix),
.base-form-field__input:has(+ * + .base-form-field__suffix) {
    padding-right: 3.5rem; /* Adjust based on suffix width roughly */
}

.base-form-field__input--readonly,
.base-form-field__textarea--readonly {
    color: var(--text-secondary);
    background: var(--bg-elevated);
    cursor: not-allowed;
}

.base-form-field__input--disabled,
.base-form-field__textarea--disabled,
.base-form-field__select--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--bg-elevated);
}

.base-form-field__textarea {
    resize: vertical;
    min-height: 80px;
    font-family: var(--font-family-base);
    line-height: 1.5;
}

.base-form-field__select {
    cursor: pointer;
}

.base-form-field__checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--accent);
}

.base-form-field__checkbox--disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.base-form-field__error {
    color: var(--error);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
}

.base-form-field__help {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}
</style>
