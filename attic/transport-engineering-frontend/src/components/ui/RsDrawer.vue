<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="drawer-overlay" @click="$emit('update:modelValue', false)">
        <div
          :class="['drawer-content', position]"
          :style="{ width: width }"
          @click.stop
        >
          <div class="drawer-header">
            <h3>{{ title }}</h3>
            <button class="close-button" @click="$emit('update:modelValue', false)">
              ✕
            </button>
          </div>
          <div class="drawer-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  position?: 'left' | 'right'
  width?: string
}>(), {
  position: 'right',
  width: '600px'
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  z-index: 1000;
  display: flex;
  align-items: stretch;
}

.drawer-content {
  background: var(--color-background);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 12px rgb(0 0 0 / 10%);
}

.drawer-content.right {
  margin-left: auto;
}

.drawer-content.left {
  margin-right: auto;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--spacing-sm);
  line-height: 1;
  transition: color var(--transition-fast);
}

.close-button:hover {
  color: var(--color-text);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

/* Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .drawer-content,
.drawer-leave-active .drawer-content {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-content.right,
.drawer-leave-to .drawer-content.right {
  transform: translateX(100%);
}

.drawer-enter-from .drawer-content.left,
.drawer-leave-to .drawer-content.left {
  transform: translateX(-100%);
}
</style>
