<template>
  <div class="inspector-header">
    <!-- Row 1: Distance + Type + Category -->
    <div class="inspector-header__row1">
      <span class="inspector-header__distance" v-if="point?.distance != null">
        {{ formattedDistance }} km
      </span>

      <div class="inspector-header__type">
        <TypeIcon :type="point?.type" :size="18" />
        <span class="inspector-header__type-label">
          {{ point?.type || '—' }}
          <span v-if="point?.subtype" class="text-secondary">
            · {{ point.subtype }}
          </span>
        </span>
      </div>

      <CategoryPill :category="point?.category" />
    </div>

    <!-- Row 2: Road Name (editable) + Status -->
    <div class="inspector-header__row2">
      <input
        v-model="roadNameValue"
        class="inspector-header__road-input"
        placeholder="Road name..."
        @input="handleRoadNameChange"
      />
      <StatusBadge :status="point?.workflowStatus" />
    </div>

    <!-- Row 3: Actions -->
    <div class="inspector-header__actions">
      <!-- Navigation -->
      <div class="inspector-header__nav">
        <button
          class="inspector-header__nav-btn"
          :disabled="!store.prevPointId"
          title="Previous point (↑)"
          @click="$emit('prev')"
        >
          <PhCaretUp :size="16" />
        </button>
        <span class="inspector-header__nav-index">
          {{ store.selectedIndex + 1 }} / {{ store.visiblePoints.length }}
        </span>
        <button
          class="inspector-header__nav-btn"
          :disabled="!store.nextPointId"
          title="Next point (↓)"
          @click="$emit('next')"
        >
          <PhCaretDown :size="16" />
        </button>
      </div>

      <div class="inspector-header__spacer" />

      <!-- Dirty Indicator -->
      <span v-if="store.isDirty" class="inspector-header__dirty">
        Unsaved
      </span>

      <!-- Save Button -->
      <button
        class="inspector-header__save-btn"
        :disabled="!store.isDirty"
        @click="$emit('save')"
      >
        <PhFloppyDisk :size="16" />
        Save
      </button>

      <!-- Overflow Menu -->
      <button
        class="inspector-header__overflow-btn"
        title="More actions"
        @click="showOverflow = !showOverflow"
      >
        <PhDotsThreeVertical :size="18" />
      </button>

      <!-- Overflow Dropdown -->
      <div v-if="showOverflow" class="inspector-header__overflow-menu">
        <button class="overflow-item overflow-item--danger" @click="handleDelete">
          <PhTrash :size="16" />
          Delete Point
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  PhCaretUp,
  PhCaretDown,
  PhFloppyDisk,
  PhDotsThreeVertical,
  PhTrash,
} from '@phosphor-icons/vue';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';
import TypeIcon from '@/components/shared/TypeIcon.vue';
import CategoryPill from '@/components/shared/CategoryPill.vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';

const emit = defineEmits<{
  (e: 'save'): void;
  (e: 'delete'): void;
  (e: 'prev'): void;
  (e: 'next'): void;
}>();

const store = useSurveyReviewStore();

const showOverflow = ref(false);
const roadNameValue = ref('');

const point = computed(() => store.selectedPoint);

const formattedDistance = computed(() => {
  if (point.value?.distance == null) return '0';
  return (point.value.distance / 1000).toFixed(2);
});

// Sync road name from point
watch(
  () => point.value?.roadName,
  (val) => {
    roadNameValue.value = val || '';
  },
  { immediate: true }
);

function handleRoadNameChange() {
  store.updateDraft({ roadName: roadNameValue.value });
}

function handleDelete() {
  showOverflow.value = false;
  emit('delete');
}

// Close overflow on outside click
function handleClickOutside(e: MouseEvent) {
  if (showOverflow.value) {
    showOverflow.value = false;
  }
}
</script>

<style scoped>
.inspector-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.inspector-header__row1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.inspector-header__distance {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-surface-2);
  padding: 2px 6px;
  border-radius: 4px;
}

.inspector-header__type {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.inspector-header__type-label {
  font-weight: 500;
  text-transform: capitalize;
}

.inspector-header__row2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.inspector-header__road-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-input);
  font-size: 0.9rem;
  color: var(--text-primary);
}

.inspector-header__road-input:focus {
  outline: none;
  border-color: var(--primary);
}

.inspector-header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.inspector-header__nav {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px;
}

.inspector-header__nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 150ms;
}

.inspector-header__nav-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.inspector-header__nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.inspector-header__nav-index {
  font-size: 0.8rem;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: center;
}

.inspector-header__spacer {
  flex: 1;
}

.inspector-header__dirty {
  font-size: 0.75rem;
  color: var(--kpi-partial);
  padding: 2px 6px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 4px;
}

.inspector-header__save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: var(--primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms;
}

.inspector-header__save-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.inspector-header__save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inspector-header__overflow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 150ms;
}

.inspector-header__overflow-btn:hover {
  background: var(--bg-hover);
}

.inspector-header__overflow-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 160px;
}

.overflow-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 150ms;
}

.overflow-item:hover {
  background: var(--bg-hover);
}

.overflow-item--danger {
  color: var(--kpi-empty);
}

.overflow-item--danger:hover {
  background: rgba(220, 38, 38, 0.1);
}
</style>
