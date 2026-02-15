<template>
    <div :class="[
        'base-panel',
        `base-panel--${elevation}`,
        { 'base-panel--scrollable': scrollable }
    ]">
        <div v-if="$slots.header || title || $slots['actions-view']" class="base-panel__header">
            <div class="base-panel__header-main">
                <div v-if="title" class="base-panel__title">
                    <h4>{{ title }}</h4>
                    <span v-if="subtitle" class="base-panel__subtitle">{{ subtitle }}</span>
                </div>
                <div v-if="$slots.header" class="base-panel__header-content">
                    <slot name="header"></slot>
                </div>
            </div>
            <div v-if="$slots['actions-view']" class="base-panel__actions-view">
                <slot name="actions-view"></slot>
            </div>
        </div>

        <div class="base-panel__content">
            <slot></slot>
        </div>

        <div v-if="$slots.footer" class="base-panel__footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    title: {
        type: String,
        default: null
    },
    subtitle: {
        type: String,
        default: null
    },
    elevation: {
        type: String,
        default: 'level1',
        validator: (value) => ['level0', 'level1', 'level2', 'level3'].includes(value)
    },
    scrollable: {
        type: Boolean,
        default: false
    }
})
</script>

<style scoped>
/* Design System variables are now global - see /src/assets/css/design-system.css */

/* Theme-aware panel styles */
.base-panel {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: background-color var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.base-panel__header {
    background: transparent;
    border-bottom: 1px solid var(--border);
    transition: background-color var(--transition-normal), border-color var(--transition-normal);
    display: flex;
    flex-direction: column;
    padding: var(--spacing-lg);
}

.base-panel__header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
}

.base-panel__actions-view {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--border);
    margin-top: var(--spacing-sm);
}

.base-panel__title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.base-panel__title h4 {
    margin: 0;
    font-size: 20px; /* Refined size */
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    transition: color var(--transition-normal);
}

.base-panel__subtitle {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    background: var(--bg-elevated);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-weight: 600;
    letter-spacing: 0.02em;
    border: 1px solid var(--border);
    text-transform: uppercase;
}

.base-panel__header-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.base-panel__content {
    background: var(--bg-surface);
    transition: background-color var(--transition-normal);
    padding: var(--spacing-lg);
}

.base-panel__footer {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
    transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

/* Scrollable Panel Styles */
.base-panel--scrollable {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;
}

.base-panel--scrollable .base-panel__content {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.base-panel--scrollable .base-panel__content::-webkit-scrollbar {
    display: none;
}

/* Elevation Levels - Design System */
.base-panel--level0 {
    box-shadow: none;
    border-color: transparent;
    background: transparent;
}

.base-panel--level1 {
    box-shadow: var(--shadow-sm);
}

.base-panel--level2 {
    box-shadow: var(--shadow-md);
    border-color: transparent; /* Cleaner look for elevated panels */
}

.base-panel--level3 {
    box-shadow: var(--shadow-xl);
    border-color: transparent;
}

/* Responsive adjustments */
@media (width <= 768px) {
    .base-panel__header {
        padding: var(--spacing-md);
    }

    .base-panel__header-main {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xs);
    }

    .base-panel__title {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
    }

    .base-panel__subtitle {
        align-self: flex-start;
        margin-left: 0;
    }

    .base-panel__actions-view {
        justify-content: center;
        padding-top: var(--spacing-xs);
    }

    .base-panel__content {
        padding: var(--spacing-md);
    }

    .base-panel__footer {
        padding: var(--spacing-sm) var(--spacing-md);
    }
}
</style>
