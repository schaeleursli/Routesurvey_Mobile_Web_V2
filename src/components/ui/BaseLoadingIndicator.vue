<template>
    <div :class="['loading-indicator', size, variant, { 'inline': inline }]">
        <div class="spinner" :class="spinnerClass"></div>
        <span v-if="message" class="loading-message">{{ message }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    // Size variants
    size: {
        type: String,
        default: 'medium',
        validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
    },
    // Visual variants
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(value)
    },
    // Display mode
    inline: {
        type: Boolean,
        default: false
    },
    // Loading message
    message: {
        type: String,
        default: ''
    },
    // Spinner type
    type: {
        type: String,
        default: 'spinner',
        validator: (value) => ['spinner', 'dots', 'pulse'].includes(value)
    }
});

const spinnerClass = computed(() => {
    return {
        'spinner': props.type === 'spinner',
        'dots': props.type === 'dots',
        'pulse': props.type === 'pulse'
    };
});
</script>

<style scoped>
/* Design System CSS Variables */
:root {
    --bg-base: #F9FAFB;
    --bg-surface: #FFF;
    --bg-elevated: #F4F5F6;
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --accent: #00A7E1;
    --accent-hover: #0090C9;
    --border: #E5E7EB;
    --success: #00B386;
    --warning: #F39C12;
    --error: #E83E8C;
    --info: #3B82F6;

    /* Spacing Scale */
    --spacing-2xs: 4px;
    --spacing-xs: 8px;
    --spacing-sm: 12px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
}

/* Dark mode overrides */
[data-bs-theme="dark"] {
    --bg-base: #0F172A;
    --bg-surface: #1E293B;
    --bg-elevated: #334155;
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --border: #475569;
}

.loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
}

.loading-indicator.inline {
    flex-direction: row;
    gap: var(--spacing-sm);
}

.loading-message {
    color: var(--text-secondary);
    font-size: inherit;
    font-weight: inherit;
    text-align: center;
}

/* Size variants */
.loading-indicator.small {
    gap: var(--spacing-xs);
    font-size: 12px;
}

.loading-indicator.medium {
    gap: var(--spacing-md);
    font-size: 14px;
}

.loading-indicator.large {
    gap: var(--spacing-lg);
    font-size: 16px;
}

.loading-indicator.xlarge {
    gap: var(--spacing-xl);
    font-size: 18px;
}

/* Spinner Styles */
.spinner {
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.spinner.spinner {
    border: 3px solid var(--border);
    border-top-color: var(--accent);
}

.spinner.dots {
    width: 8px;
    height: 8px;
    background: var(--accent);
    border-radius: 50%;
    animation: dots 1.4s ease-in-out infinite both;
}

.spinner.pulse {
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
}

/* Size-specific spinner dimensions */
.loading-indicator.small .spinner.spinner {
    width: 16px;
    height: 16px;
    border-width: 2px;
}

.loading-indicator.medium .spinner.spinner {
    width: 24px;
    height: 24px;
    border-width: 3px;
}

.loading-indicator.large .spinner.spinner {
    width: 32px;
    height: 32px;
    border-width: 4px;
}

.loading-indicator.xlarge .spinner.spinner {
    width: 40px;
    height: 40px;
    border-width: 4px;
}

/* Dots animation */
@keyframes dots {
    0%,
    80%,
    100% {
        transform: scale(0);
        opacity: 0.5;
    }

    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Pulse animation */
@keyframes pulse {
    0% {
        transform: scale(0.95);
        opacity: 0.7;
    }

    70% {
        transform: scale(1);
        opacity: 1;
    }

    100% {
        transform: scale(0.95);
        opacity: 0.7;
    }
}

/* Spin animation */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Color variants */
.loading-indicator.primary .spinner.spinner {
    border-top-color: var(--accent);
}

.loading-indicator.secondary .spinner.spinner {
    border-top-color: var(--text-secondary);
}

.loading-indicator.success .spinner.spinner {
    border-top-color: var(--success);
}

.loading-indicator.warning .spinner.spinner {
    border-top-color: var(--warning);
}

.loading-indicator.error .spinner.spinner {
    border-top-color: var(--error);
}

.loading-indicator.info .spinner.spinner {
    border-top-color: var(--info);
}

/* Dots and pulse color variants */
.loading-indicator.primary .spinner.dots,
.loading-indicator.primary .spinner.pulse {
    background: var(--accent);
}

.loading-indicator.secondary .spinner.dots,
.loading-indicator.secondary .spinner.pulse {
    background: var(--text-secondary);
}

.loading-indicator.success .spinner.dots,
.loading-indicator.success .spinner.pulse {
    background: var(--success);
}

.loading-indicator.warning .spinner.dots,
.loading-indicator.warning .spinner.pulse {
    background: var(--warning);
}

.loading-indicator.error .spinner.dots,
.loading-indicator.error .spinner.pulse {
    background: var(--error);
}

.loading-indicator.info .spinner.dots,
.loading-indicator.info .spinner.pulse {
    background: var(--info);
}

/* Inline specific styles */
.loading-indicator.inline .loading-message {
    text-align: left;
}

/* Responsive adjustments */
@media (width <= 768px) {
    .loading-indicator {
        font-size: 13px;
    }

    .loading-indicator.small {
        font-size: 11px;
    }

    .loading-indicator.large {
        font-size: 15px;
    }

    .loading-indicator.xlarge {
        font-size: 16px;
    }
}
</style>
