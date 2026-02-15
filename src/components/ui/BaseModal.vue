<template>
    <Teleport to="body">
        <div v-if="visible" class="base-modal-backdrop" @click="handleBackdropClick">
            <div :class="['base-modal-content', `base-modal--${size}`]" @click.stop>
                <div v-if="title || $slots.header || showClose" class="base-modal-header">
                    <div v-if="title || $slots.header" class="base-modal-header-content">
                        <h3 v-if="title" class="base-modal-title">{{ title }}</h3>
                        <slot name="header"></slot>
                    </div>
                    <button v-if="showClose" class="base-modal-close" @click="handleClose" aria-label="Close modal">
                        <PhX :size="18" />
                    </button>
                </div>

                <div class="base-modal-body">
                    <slot></slot>
                </div>

                <div v-if="$slots.footer" class="base-modal-footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { PhX } from '@phosphor-icons/vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: null
    },
    size: {
        type: String,
        default: 'medium',
        validator: (value) => ['small', 'medium', 'large', 'xlarge', 'fullscreen'].includes(value)
    },
    showClose: {
        type: Boolean,
        default: true
    },
    closeOnBackdrop: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['close', 'update:visible']);

const handleClose = () => {
    emit('close');
    emit('update:visible', false);
};

const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
        handleClose();
    }
};

// Close on Escape key
const handleKeydown = (event) => {
    if (event.key === 'Escape' && props.visible && props.closeOnBackdrop) {
        handleClose();
    }
};

onMounted(() => {
    if (typeof window !== 'undefined') {
        document.addEventListener('keydown', handleKeydown);
    }
});

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        document.removeEventListener('keydown', handleKeydown);
    }
});
</script>

<style scoped>
/* Design System variables are now global - see /src/assets/css/design-system.css */

.base-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    animation: fadeIn var(--transition-normal) ease;
}

.base-modal-backdrop:has(.base-modal--fullscreen) {
    padding: var(--spacing-lg);
}

.base-modal-content {
    background: var(--bg-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    /* Use the global standard slideUp with a nice spring-like easing */
    animation: slideUp var(--transition-slow) cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid var(--border);
}

.base-modal--small {
    width: 100%;
    max-width: 400px;
}

.base-modal--medium {
    width: 100%;
    max-width: 600px;
}

.base-modal--large {
    width: 100%;
    max-width: 900px;
}

.base-modal--xlarge {
    width: 100%;
    max-width: 1200px;
}

.base-modal--fullscreen {
    width: calc(100vw - 2 * var(--spacing-lg));
    height: calc(100vh - 2 * var(--spacing-lg));
    max-width: none;
    max-height: none;
    border-radius: var(--radius-lg);
}

.base-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-shrink: 0;
}

.base-modal-header-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.base-modal-title {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    line-height: 1.2;
}

.base-modal-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--spacing-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
}

.base-modal-close:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
}

.base-modal-close i {
    font-size: 18px;
}

.base-modal-body {
    padding: var(--spacing-lg);
    overflow-y: auto;
    flex: 1;
    min-height: 0;
}

.base-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-2xs);
    padding: var(--spacing-xs) var(--spacing-md);
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-shrink: 0;
}

/* Responsive adjustments */
@media (width <= 768px) {
    .base-modal-backdrop {
        padding: var(--spacing-sm);
    }

    .base-modal-backdrop:has(.base-modal--fullscreen) {
        padding: var(--spacing-md);
    }

    .base-modal-content {
        max-height: 95vh;
    }

    .base-modal--small,
    .base-modal--medium,
    .base-modal--large {
        max-width: 100%;
    }

    .base-modal--fullscreen {
        width: calc(100vw - 2 * var(--spacing-md));
        height: calc(100vh - 2 * var(--spacing-md));
    }

    .base-modal-header,
    .base-modal-body {
        padding: var(--spacing-md);
    }

    .base-modal-footer {
        padding: var(--spacing-xs) var(--spacing-sm);
        gap: var(--spacing-2xs);
    }
}

@media (width <= 480px) {
    .base-modal-backdrop:has(.base-modal--fullscreen) {
        padding: var(--spacing-sm);
    }

    .base-modal--fullscreen {
        width: calc(100vw - 2 * var(--spacing-sm));
        height: calc(100vh - 2 * var(--spacing-sm));
    }

    .base-modal-header,
    .base-modal-body {
        padding: var(--spacing-sm);
    }

    .base-modal-footer {
        padding: var(--spacing-2xs) var(--spacing-xs);
        gap: var(--spacing-2xs);
    }

    .base-modal-title {
        font-size: var(--font-size-lg);
    }
}
</style>
