<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in appStore.toasts"
          :key="toast.id"
          :class="['toast', toast.type]"
          @click="appStore.removeToast(toast.id)"
        >
          <span class="toast-icon">
            <template v-if="toast.type === 'success'">✓</template>
            <template v-else-if="toast.type === 'error'">✕</template>
            <template v-else-if="toast.type === 'warning'">⚠</template>
            <template v-else>ℹ</template>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  min-width: 300px;
  max-width: 500px;
  pointer-events: auto;
  cursor: pointer;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
}

.toast-message {
  flex: 1;
  font-size: 14px;
}

.success {
  border-left: 4px solid var(--color-success);
}

.success .toast-icon {
  background: var(--color-success);
  color: white;
}

.error {
  border-left: 4px solid var(--color-error);
}

.error .toast-icon {
  background: var(--color-error);
  color: white;
}

.warning {
  border-left: 4px solid var(--color-warning);
}

.warning .toast-icon {
  background: var(--color-warning);
  color: white;
}

.info {
  border-left: 4px solid var(--color-primary);
}

.info .toast-icon {
  background: var(--color-primary);
  color: white;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}
</style>
