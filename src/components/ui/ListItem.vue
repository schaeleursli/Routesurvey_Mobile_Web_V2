<template>
    <div :class="[
        'list-item',
        { 'list-item--clickable': clickable },
        { 'list-item--active': active }
    ]" @click="handleClick">
        <div v-if="$slots.icon" class="list-item__icon">
            <slot name="icon"></slot>
        </div>

        <div class="list-item__content">
            <div v-if="title" class="list-item__title">{{ title }}</div>
            <div v-if="subtitle" class="list-item__subtitle">{{ subtitle }}</div>
            <div v-if="description" class="list-item__description">{{ description }}</div>
            <div v-if="$slots.content" class="list-item__custom-content">
                <slot name="content"></slot>
            </div>
        </div>

        <div v-if="$slots.actions || status" class="list-item__actions">
            <div v-if="status" class="list-item__status">
                <span :class="['status-badge', `status-badge--${status}`]">
                    {{ statusText }}
                </span>
            </div>
            <div v-if="$slots.actions" class="list-item__action-buttons">
                <slot name="actions"></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    title: {
        type: String,
        default: null
    },
    subtitle: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: null,
        validator: (value) => !value || ['surveyed', 'reported', 'planned', 'shared'].includes(value)
    },
    clickable: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['click'])

const statusText = computed(() => {
    if (!props.status) return ''
    return props.status.charAt(0).toUpperCase() + props.status.slice(1)
})

const handleClick = (event) => {
    if (props.clickable) {
        emit('click', event)
    }
}
</script>

<style scoped>
/* Design System variables are now global - see /src/assets/css/design-system.css */

.list-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    transition: all 0.2s ease;
}

.list-item--clickable {
    cursor: pointer;
}

.list-item--clickable:hover {
    background: rgb(0 167 225 / 5%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.list-item--active {
    background: rgb(0 167 225 / 10%);
    border-left: 3px solid var(--accent);
}

.list-item__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.list-item__content {
    flex: 1;
    min-width: 0;
}

.list-item__title {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    line-height: 1.3;
}

.list-item__subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
    line-height: 1.3;
}

.list-item__description {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.3;
    margin-bottom: 0.5rem;
}

.list-item__custom-content {
    margin-bottom: 0.5rem;
}

.list-item__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
}

.list-item__status {
    display: flex;
    align-items: center;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.2%;
}

.status-badge--surveyed {
    background: rgb(0 179 134 / 20%);
    color: var(--success);
}

.status-badge--reported {
    background: rgb(0 167 225 / 20%);
    color: var(--accent);
}

.status-badge--planned {
    background: rgb(243 156 18 / 20%);
    color: var(--warning);
}

.status-badge--shared {
    background: rgb(232 62 140 / 20%);
    color: var(--error);
}

.list-item__action-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Responsive adjustments */
@media (width <= 768px) {
    .list-item {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
        padding: 1rem;
    }

    .list-item__actions {
        justify-content: space-between;
        width: 100%;
    }

    .list-item__icon {
        width: 1.5rem;
        height: 1.5rem;
    }
}
</style>
