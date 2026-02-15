<template>
    <div 
        class="kpi-badge" 
        :class="[kpiType, { active: isActive }]"
        @click="$emit('click', $event)"
    >
        <div class="kpi-icon-wrapper">
            <i :class="iconClass"></i>
        </div>
        <div class="kpi-content">
            <span class="kpi-label">{{ label }}</span>
            <span class="kpi-value">{{ value }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    kpiType: {
        type: String,
        required: true,
        validator: (value) => ['planned', 'surveyed', 'reported', 'shared'].includes(value)
    },
    value: {
        type: [Number, String],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: ''
    }
})

defineEmits(['click'])

const iconClass = computed(() => {
    switch (props.kpiType) {
        case 'planned': return 'bi bi-calendar-event'
        case 'surveyed': return 'bi bi-clipboard-check'
        case 'reported': return 'bi bi-file-earmark-check'
        case 'shared': return 'bi bi-share'
        default: return 'bi bi-circle'
    }
})
</script>

<style scoped>
.kpi-badge {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-md);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    cursor: pointer;
    transition: all var(--transition-normal);
    user-select: none;
    min-width: 130px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
}

.kpi-badge:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--border-hover);
}

.kpi-badge:active {
    transform: translateY(0);
}

/* Icon Wrapper */
.kpi-icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    background: var(--bg-elevated);
    color: var(--text-secondary);
    transition: all var(--transition-normal);
}

/* Content */
.kpi-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: 1.2;
}

.kpi-label {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 2px;
}

.kpi-value {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
    transition: color var(--transition-normal);
}

/* Status variants */

/* Planned - Blue */
.kpi-badge.planned:hover {
    border-color: var(--info);
    background: var(--bg-surface);
}

.kpi-badge.planned.active {
    background: var(--info-bg);
    border-color: var(--info);
    box-shadow: var(--shadow-colored);
}

.kpi-badge.planned .kpi-icon-wrapper {
    color: var(--info);
    background: var(--info-bg);
}

.kpi-badge.planned.active .kpi-value {
    color: var(--info);
}

/* Surveyed - Orange */
.kpi-badge.surveyed:hover {
    border-color: var(--warning);
    background: var(--bg-surface);
}

.kpi-badge.surveyed.active {
    background: var(--warning-bg);
    border-color: var(--warning);
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);
}

.kpi-badge.surveyed .kpi-icon-wrapper {
    color: var(--warning);
    background: var(--warning-bg);
}

.kpi-badge.surveyed.active .kpi-value {
    color: var(--warning);
}

/* Reported - Green */
.kpi-badge.reported:hover {
    border-color: var(--success);
    background: var(--bg-surface);
}

.kpi-badge.reported.active {
    background: var(--success-bg);
    border-color: var(--success);
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.kpi-badge.reported .kpi-icon-wrapper {
    color: var(--success);
    background: var(--success-bg);
}

.kpi-badge.reported.active .kpi-value {
    color: var(--success);
}

/* Shared - Purple */
.kpi-badge.shared:hover {
    border-color: var(--accent);
    background: var(--bg-surface);
}

.kpi-badge.shared.active {
    background: var(--accent-surface);
    border-color: var(--accent);
    box-shadow: var(--shadow-colored);
}

.kpi-badge.shared .kpi-icon-wrapper {
    color: var(--accent);
    background: var(--accent-surface);
}

.kpi-badge.shared.active .kpi-value {
    color: var(--accent);
}

</style>
