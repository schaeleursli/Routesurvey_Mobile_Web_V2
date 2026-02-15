<template>
    <button :class="[
        'base-button',
        `base-button--${variant}`,
        `base-button--${size}`,
        { 'base-button--disabled': disabled }
    ]" :disabled="disabled" @click="handleClick">
        <i v-if="leftIcon" :class="leftIcon" class="base-button__icon base-button__icon--left"
            style="padding-right: 8px;"></i>
        <span v-if="$slots.default" class="base-button__text">
            <slot></slot>
        </span>
        <i v-if="rightIcon" :class="rightIcon" class="base-button__icon base-button__icon--right"
            style="padding-left: 8px;"></i>
    </button>
</template>

<script setup>
const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value)
    },
    size: {
        type: String,
        default: 'medium',
        validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
        type: Boolean,
        default: false
    },
    leftIcon: {
        type: String,
        default: null
    },
    rightIcon: {
        type: String,
        default: null
    },
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
    if (!props.disabled) {
        emit('click', event)
    }
}
</script>

<style scoped>
/* Design System variables are now global - see /src/assets/css/design-system.css */

.base-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    white-space: nowrap;
}

/* Button Variants */
.base-button--primary {
    background: var(--accent);
    color: white;
}

.base-button--primary:hover:not(.base-button--disabled) {
    background: var(--accent-hover);
}

.base-button--secondary {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border);
}

.base-button--secondary:hover:not(.base-button--disabled) {
    background: var(--bg-elevated);
}

.base-button--ghost {
    background: transparent;
    color: var(--accent);
}

.base-button--ghost:hover:not(.base-button--disabled) {
    background: rgb(0 167 225 / 10%);
}

.base-button--danger {
    background: var(--error);
    color: white;
}

.base-button--danger:hover:not(.base-button--disabled) {
    opacity: 0.9;
}

/* Button Sizes */
.base-button--small {
    padding: 0.375rem 0.625rem;
    font-size: 12px;
    min-height: 1.75rem;
    gap: 0.25rem;
}

.base-button--medium {
    padding: 0.75rem 1rem;
    font-size: 14px;
    min-height: 2.5rem;
}

.base-button--large {
    padding: 1rem 1.5rem;
    font-size: 16px;
    min-height: 3rem;
}

/* Button States */
.base-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.base-button__icon {
    font-size: 1em;
}

.base-button__icon--left {
    margin-right: -0.25rem;
}

.base-button__icon--right {
    margin-left: -0.25rem;
}

.base-button__text {
    flex: 1;
}
</style>
