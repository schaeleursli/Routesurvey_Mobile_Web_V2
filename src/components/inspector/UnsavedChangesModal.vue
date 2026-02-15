<template>
  <Teleport to="body">
    <div class="unsaved-modal-overlay" @click.self="$emit('cancel')">
      <div class="unsaved-modal" role="dialog" aria-modal="true">
        <div class="unsaved-modal__header">
          <PhWarning :size="24" class="unsaved-modal__icon" />
          <h3 class="unsaved-modal__title">Unsaved Changes</h3>
        </div>

        <p class="unsaved-modal__message">
          You have unsaved changes. What would you like to do?
        </p>

        <div class="unsaved-modal__actions">
          <button
            class="unsaved-modal__btn unsaved-modal__btn--secondary"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          <button
            class="unsaved-modal__btn unsaved-modal__btn--danger"
            @click="$emit('discard')"
          >
            Discard
          </button>
          <button
            ref="saveBtn"
            class="unsaved-modal__btn unsaved-modal__btn--primary"
            @click="$emit('save')"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PhWarning } from '@phosphor-icons/vue';

defineEmits<{
  (e: 'save'): void;
  (e: 'discard'): void;
  (e: 'cancel'): void;
}>();

const saveBtn = ref<HTMLButtonElement | null>(null);

onMounted(() => {
  // Focus save button by default (per spec)
  saveBtn.value?.focus();
});

// Handle Escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
  }
}
</script>

<style scoped>
.unsaved-modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  animation: fadeIn 100ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.unsaved-modal {
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 150ms ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.unsaved-modal__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.unsaved-modal__icon {
  color: var(--kpi-partial);
}

.unsaved-modal__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.unsaved-modal__message {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.unsaved-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.unsaved-modal__btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms;
}

.unsaved-modal__btn--secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.unsaved-modal__btn--secondary:hover {
  background: var(--bg-hover);
}

.unsaved-modal__btn--danger {
  background: transparent;
  border: 1px solid var(--kpi-empty);
  color: var(--kpi-empty);
}

.unsaved-modal__btn--danger:hover {
  background: var(--kpi-empty);
  color: white;
}

.unsaved-modal__btn--primary {
  background: var(--primary);
  border: 1px solid var(--primary);
  color: white;
}

.unsaved-modal__btn--primary:hover {
  background: var(--primary-dark);
}

.unsaved-modal__btn--primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-light);
}
</style>
