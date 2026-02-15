<template>
  <div class="notes-tab">
    <label class="notes-tab__label">Global Notes</label>
    <textarea
      v-model="notesValue"
      class="notes-tab__textarea"
      placeholder="Add notes for this point..."
      rows="8"
      @input="handleInput"
    />
    <p class="notes-tab__hint">
      Notes are visible to all team members and included in reports.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';

const store = useSurveyReviewStore();

const notesValue = ref('');

// Sync from selected point
watch(
  () => store.selectedPoint?.notes,
  (val) => {
    notesValue.value = val || '';
  },
  { immediate: true }
);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function handleInput() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    store.updateDraft({ notes: notesValue.value });
  }, 300);
}
</script>

<style scoped>
.notes-tab {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notes-tab__label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.notes-tab__textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-input);
  font-size: 0.9rem;
  color: var(--text-primary);
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.notes-tab__textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.notes-tab__textarea::placeholder {
  color: var(--text-tertiary);
}

.notes-tab__hint {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin: 0;
}
</style>
