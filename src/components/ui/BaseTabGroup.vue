<template>
    <div class="base-tab-group">
        <div class="base-tab-group__tabs">
            <BaseTab v-for="tab in tabs" :key="tab.id" :active="activeTab === tab.id" :disabled="tab.disabled"
                :icon="tab.icon" @click="selectTab(tab.id)">
                {{ tab.label }}
            </BaseTab>
        </div>

        <div class="base-tab-group__content" :class="{ 'base-tab-group__content--scrollable': scrollable }"
            :style="scrollable ? { maxHeight: maxHeight } : {}">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import BaseTab from './BaseTab.vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: null
    },
    tabs: {
        type: Array,
        required: true,
        validator: (tabs) => {
            return tabs.every(tab =>
                typeof tab === 'object' &&
                tab.id &&
                tab.label
            )
        }
    },
    scrollable: {
        type: Boolean,
        default: false
    },
    maxHeight: {
        type: String,
        default: '400px'
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

const activeTab = ref(props.modelValue || (props.tabs.length > 0 ? props.tabs[0].id : null))

const selectTab = (tabId) => {
    const tab = props.tabs.find(t => t.id === tabId)
    if (tab && !tab.disabled) {
        activeTab.value = tabId
        emit('update:modelValue', tabId)
        emit('change', tabId)
    }
}

// Provide active tab to child components
provide('activeTab', activeTab)
</script>

<style scoped>
.base-tab-group {
    width: 100%;
}

.base-tab-group__tabs {
    display: flex;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    border-bottom: 1.5px solid var(--border);
    flex-wrap: wrap;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--text-secondary) transparent;
}

.base-tab-group__tabs::-webkit-scrollbar {
    height: 4px;
}

.base-tab-group__tabs::-webkit-scrollbar-track {
    background: transparent;
}

.base-tab-group__tabs::-webkit-scrollbar-thumb {
    background-color: var(--text-secondary);
    border-radius: 2px;
}

.base-tab-group__tabs::-webkit-scrollbar-thumb:hover {
    background-color: var(--accent);
}

.base-tab-group__content {
    width: 100%;
}

.base-tab-group__content--scrollable {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--text-secondary) transparent;
}

.base-tab-group__content--scrollable::-webkit-scrollbar {
    width: 8px;
}

.base-tab-group__content--scrollable::-webkit-scrollbar-track {
    background: var(--bg-elevated);
    border-radius: var(--radius-full);
}

.base-tab-group__content--scrollable::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: var(--radius-full);
}

.base-tab-group__content--scrollable::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
}

/* Responsive adjustments */
@media (width <= 700px) {
    .base-tab-group__tabs {
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-sm);
    }
}

@media (width <= 480px) {
    .base-tab-group__tabs {
        gap: var(--spacing-xs);
        justify-content: center;
    }
}
</style>
