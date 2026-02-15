<template>
    <div :class="[
        'base-tab',
        { 'base-tab--active': active },
        { 'base-tab--disabled': disabled }
    ]" @click="handleClick">
        <i v-if="icon" :class="icon" class="base-tab__icon"></i>
        <span v-if="$slots.default" class="base-tab__text">
            <slot></slot>
        </span>
    </div>
</template>

<script setup>
const props = defineProps({
    active: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    icon: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
    if (!props.disabled) {
        emit('click', event)
    }
}
</script>

<style scoped>
.base-tab {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    background: none;
    border: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    cursor: pointer;
    transition: all var(--transition-normal);
    white-space: nowrap;
    min-width: fit-content;
    position: relative;
}

.base-tab--active {
    background: var(--bg-surface);
    color: var(--accent);
    border-bottom: 3px solid var(--accent);
}

.base-tab:not(.base-tab--active):hover:not(.base-tab--disabled) {
    background: var(--bg-elevated);
    color: var(--accent);
}

.base-tab--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.base-tab__icon {
    font-size: 1em;
}

.base-tab__text {
    flex: 1;
}

/* Responsive adjustments */
@media (width <= 700px) {
    .base-tab {
        font-size: var(--font-size-base);
        padding: var(--spacing-xs) var(--spacing-md);
        gap: var(--spacing-xs);
    }
}

@media (width <= 480px) {
    .base-tab {
        font-size: var(--font-size-sm);
        padding: var(--spacing-xs) var(--spacing-sm);
        gap: var(--spacing-xs);
    }

    .base-tab__icon {
        font-size: 0.9em;
    }
}
</style>
