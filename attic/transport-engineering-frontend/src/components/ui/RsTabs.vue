<template>
  <div class="rs-tabs">
    <div class="tabs-header">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-button', { active: modelValue === index }]"
        @click="$emit('update:modelValue', index)"
      >
        {{ tab }}
      </button>
    </div>
    <div class="tabs-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs: string[]
  modelValue: number
}>()

defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<style scoped>
.rs-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-header {
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.tab-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-button:hover {
  color: var(--color-text);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tabs-content {
  flex: 1;
  overflow-y: auto;
}
</style>
