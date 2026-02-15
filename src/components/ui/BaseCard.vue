<template>
    <div :class="[
        'base-card',
        `base-card--${variant}`,
        { 'base-card--interactive': interactive },
        { 'base-card--hover': hover },
        { 'base-card--fixed-footer': fixedFooter },
        $attrs.class
    ]" @click="handleClick">
        <div v-if="$slots.header" class="base-card__header">
            <slot name="header"></slot>
        </div>

        <div class="base-card__content">
            <slot></slot>
        </div>

        <div v-if="$slots.footer" class="base-card__footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    variant: {
        type: String,
        default: 'default',
        validator: (value) => ['default', 'success', 'warning', 'error'].includes(value)
    },
    interactive: {
        type: Boolean,
        default: false
    },
    hover: {
        type: Boolean,
        default: true
    },
    fixedFooter: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
    if (props.interactive) {
        emit('click', event)
    }
}
</script>

<style scoped>
/* Design System variables are now global - see /src/assets/css/design-system.css */

.base-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-sm);
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* Glassmorphism Variant */
.base-card.glass {
    background: var(--bg-glass);
    backdrop-filter: var(--backdrop-blur);
    border-color: rgba(255, 255, 255, 0.5);
}

.base-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid var(--accent);
    border-radius: var(--radius-lg);
    pointer-events: none;
    transition: opacity var(--transition-fast);
    opacity: 0;
    z-index: 10;
}

.base-card:hover::before {
    opacity: 0; /* Disabled default blue border on hover for cleaner look */
}

/* Interactive State */
.base-card--interactive {
    cursor: pointer;
}

.base-card--interactive:hover {
    border-color: var(--accent-light);
}

/* Hover Lift Effect */
.base-card--hover:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
    border-color: var(--border-hover);
}

/* Variants */
.base-card--success {
    border-left: 4px solid var(--success);
}

.base-card--warning {
    border-left: 4px solid var(--warning);
}

.base-card--error {
    border-left: 4px solid var(--error);
}

/* Structure */
.base-card__header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border);
    background: transparent;
}

.base-card__content {
    padding: var(--spacing-lg);
    flex: 1;
    display: flex;
    flex-direction: column;
}

.base-card__footer {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
    margin-top: auto;
}

/* Fixed Footer Styles */
.base-card--fixed-footer {
    position: relative;
    overflow: hidden;
}

.base-card--fixed-footer .base-card__content {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.base-card--fixed-footer .base-card__content::-webkit-scrollbar {
    display: none;
}

.base-card--fixed-footer .base-card__footer {
    position: sticky;
    bottom: 0;
    z-index: 10;
    margin-top: 0;
    flex-shrink: 0;
}

/* Responsive adjustments */
@media (width <= 768px) {
    .base-card__header,
    .base-card__content,
    .base-card__footer {
        padding: var(--spacing-md);
    }
}
</style>
