<template>
    <div class="base-dropdown" ref="dropdownRef">
        <div class="base-dropdown__selected" @click="toggleDropdown">
            <div class="base-dropdown__content">
                <div v-if="$slots.selected" class="base-dropdown__selected-content">
                    <slot name="selected"></slot>
                </div>
                <div v-else class="base-dropdown__placeholder">
                    {{ placeholder }}
                </div>
            </div>
            <i :class="[
                'base-dropdown__arrow',
                open ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
            ]"></i>
        </div>

        <div v-if="open" class="base-dropdown__list">
            <div v-if="loading" class="base-dropdown__loading">
                <div class="base-dropdown__spinner"></div>
                <span>{{ loadingText }}</span>
            </div>
            <div v-else-if="empty" class="base-dropdown__empty">
                <span>{{ emptyText }}</span>
            </div>
            <div v-else class="base-dropdown__options">
                <slot name="options"></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    placeholder: {
        type: String,
        default: 'Select an option'
    },
    loading: {
        type: Boolean,
        default: false
    },
    loadingText: {
        type: String,
        default: 'Loading...'
    },
    empty: {
        type: Boolean,
        default: false
    },
    emptyText: {
        type: String,
        default: 'No options found'
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['toggle', 'close'])

const dropdownRef = ref(null)
const open = ref(false)

const toggleDropdown = () => {
    if (props.disabled) return

    open.value = !open.value
    emit('toggle', open.value)

    if (!open.value) {
        emit('close')
    }
}

const closeDropdown = () => {
    open.value = false
    emit('close')
}

const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        closeDropdown()
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

// Expose methods for parent components
defineExpose({
    close: closeDropdown,
    open: () => {
        open.value = true
        emit('toggle', true)
    }
})
</script>

<style scoped>
.base-dropdown {
    position: relative;
    min-width: 260px;
    font-size: var(--font-size-lg);
}

.base-dropdown__selected {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-sm) var(--spacing-lg);
    cursor: pointer;
    min-width: 220px;
    gap: var(--spacing-lg);
    transition: border-color var(--transition-normal);
}

.base-dropdown__selected:hover {
    border-color: var(--accent);
}

.base-dropdown__content {
    flex: 1;
}

.base-dropdown__selected-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
}

.base-dropdown__placeholder {
    color: var(--text-secondary);
    font-style: italic;
}

.base-dropdown__arrow {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-left: var(--spacing-md);
    transition: transform var(--transition-normal);
}

.base-dropdown__list {
    position: absolute;
    top: 110%;
    left: 0;
    right: 0;
    background: var(--bg-surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 10;
    max-height: 320px;
    overflow-y: auto;
    margin-top: var(--spacing-2xs);
}

.base-dropdown__options {
    display: flex;
    flex-direction: column;
}

.base-dropdown__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
    color: var(--text-secondary);
}

.base-dropdown__spinner {
    border: 2px solid var(--bg-elevated);
    border-top: 2px solid var(--accent);
    border-radius: 50%;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
}

.base-dropdown__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    color: var(--text-secondary);
    font-style: italic;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Responsive adjustments */
@media (width <= 700px) {
    .base-dropdown {
        min-width: 200px;
        width: 100%;
    }

    .base-dropdown__selected {
        min-width: 180px;
        padding: var(--spacing-sm) var(--spacing-md);
    }
}
</style>
