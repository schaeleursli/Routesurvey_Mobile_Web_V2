<template>
    <button 
        class="base-fab" 
        :class="[`base-fab--${variant}`, { 'base-fab--disabled': disabled }]"
        :disabled="disabled"
        @click="handleClick"
        :title="title"
    >
        <slot name="icon">
            <PhPlus :size="24" weight="bold" class="base-fab__icon" />
        </slot>
        <slot></slot>
    </button>
</template>

<script setup>
import { PhPlus } from '@phosphor-icons/vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'secondary', 'danger', 'success'].includes(value)
    },
    disabled: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ''
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
.base-fab {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 1000;
}

.base-fab:hover:not(.base-fab--disabled) {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 8px 16px rgb(0 0 0 / 20%);
}

.base-fab:active:not(.base-fab--disabled) {
    transform: scale(0.95);
    box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
}

.base-fab__icon {
    font-size: 1.5rem;
}

/* Variants */
.base-fab--primary {
    background: var(--accent);
    color: white;
}

.base-fab--secondary {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border);
}

.base-fab--danger {
    background: var(--error);
    color: white;
}

.base-fab--success {
    background: var(--success, #22c55e); 
    color: white;
}

.base-fab--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
}
</style>
