<template>
    <div class="validation-feedback" :class="feedbackClass">
        <div class="validation-icon">
            <i :class="iconClass"></i>
        </div>
        <div class="validation-content">
            <span class="validation-message">{{ message }}</span>
            <span v-if="hint" class="validation-hint">{{ hint }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        required: true,
        validator: (value) => ['valid', 'invalid', 'warning', 'pending'].includes(value)
    },
    message: {
        type: String,
        default: ''
    },
    hint: {
        type: String,
        default: ''
    },
    inline: {
        type: Boolean,
        default: false
    }
});

const feedbackClass = computed(() => ({
    [`validation-${props.status}`]: true,
    'inline': props.inline
}));

const iconClass = computed(() => {
    switch (props.status) {
        case 'valid':
            return 'bi bi-check-circle-fill';
        case 'invalid':
            return 'bi bi-x-circle-fill';
        case 'warning':
            return 'bi bi-exclamation-triangle-fill';
        case 'pending':
            return 'bi bi-clock-fill';
        default:
            return 'bi bi-circle-fill';
    }
});
</script>

<style scoped>
.validation-feedback {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
    transition: all var(--transition-fast);
}

.validation-feedback.inline {
    display: inline-flex;
    padding: var(--spacing-xs);
    margin-top: 0;
    margin-left: var(--spacing-xs);
}

.validation-icon {
    flex-shrink: 0;
    font-size: 1.1em;
    margin-top: 2px;
}

.validation-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.validation-message {
    font-weight: var(--font-weight-medium);
}

.validation-hint {
    font-size: var(--font-size-xs);
    opacity: 0.8;
}

/* Valid State */
.validation-valid {
    background-color: rgba(var(--success-rgb), 0.1);
    border: 1px solid rgba(var(--success-rgb), 0.3);
}

.validation-valid .validation-icon {
    color: var(--success);
}

.validation-valid .validation-message {
    color: var(--success);
}

/* Invalid State */
.validation-invalid {
    background-color: rgba(var(--error-rgb), 0.1);
    border: 1px solid rgba(var(--error-rgb), 0.3);
}

.validation-invalid .validation-icon {
    color: var(--error);
}

.validation-invalid .validation-message {
    color: var(--error);
}

/* Warning State */
.validation-warning {
    background-color: rgba(var(--warning-rgb), 0.1);
    border: 1px solid rgba(var(--warning-rgb), 0.3);
}

.validation-warning .validation-icon {
    color: var(--warning);
}

.validation-warning .validation-message {
    color: var(--warning);
}

/* Pending State */
.validation-pending {
    background-color: rgba(var(--info-rgb), 0.1);
    border: 1px solid rgba(var(--info-rgb), 0.3);
}

.validation-pending .validation-icon {
    color: var(--info);
}

.validation-pending .validation-message {
    color: var(--info);
}
</style>
