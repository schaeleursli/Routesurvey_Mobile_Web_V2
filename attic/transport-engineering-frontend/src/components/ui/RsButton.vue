<template>
  <button
    :class="['rs-button', variant, size, { loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loader"></span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.rs-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 14px;
}

.rs-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.primary {
  background: var(--color-primary);
  color: white;
}

.primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.secondary:hover:not(:disabled) {
  background: var(--color-border);
}

.ghost {
  background: transparent;
  color: var(--color-text);  
}

.ghost:hover:not(:disabled) {
  background: var(--color-surface);
}

.danger {
  background: var(--color-error);
  color: white;
}

/* Sizes */
.sm {
  padding: 6px 12px;
  font-size: 12px;
}

.md {
  padding: 8px 16px;
  font-size: 14px;
}

.lg {
  padding: 12px 24px;
  font-size: 16px;
}

/* Loading */
.loading {
  position: relative;
  color: transparent;
}

.loader {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgb(255 255 255 / 30%);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
