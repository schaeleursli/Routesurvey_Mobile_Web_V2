<template>
    <div :class="['status-indicator', `status-indicator--${status}`]">
        <div class="status-indicator__icon">
            <component :is="iconComponent" :size="16" weight="fill" />
        </div>
        <div class="status-indicator__content">
            <div class="status-indicator__title">{{ title }}</div>
            <div v-if="description" class="status-indicator__description">{{ description }}</div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { PhCheckCircle, PhWarning, PhXCircle, PhQuestion } from '@phosphor-icons/vue';

const props = defineProps({
    status: {
        type: String,
        required: true,
        validator: (value) => ['verified', 'caution', 'blocked'].includes(value)
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    }
})

const iconComponent = computed(() => {
    switch (props.status) {
        case 'verified':
            return PhCheckCircle
        case 'caution':
            return PhWarning
        case 'blocked':
            return PhXCircle
        default:
            return PhQuestion
    }
})
</script>

<style scoped>
/* Design System variables are now global - see /src/assets/css/design-system.css */

.status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
}

.status-indicator__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-indicator__content {
    flex: 1;
    min-width: 0;
}

.status-indicator__title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0;
}

.status-indicator__description {
    font-size: 11px;
    color: var(--text-secondary);
    line-height: 1.2;
}

/* Status Variants */
.status-indicator--verified .status-indicator__icon {
    background: var(--success);
    color: white;
}

.status-indicator--caution .status-indicator__icon {
    background: var(--warning);
    color: white;
}

.status-indicator--blocked .status-indicator__icon {
    background: var(--error);
    color: white;
}

/* Responsive adjustments */
@media (width <= 768px) {
    .status-indicator {
        padding: 0.25rem 0.5rem;
        gap: 0.375rem;
    }

    .status-indicator__icon {
        width: 1rem;
        height: 1rem;
    }

    .status-indicator__title {
        font-size: 11px;
    }

    .status-indicator__description {
        font-size: 10px;
    }
}
</style>
