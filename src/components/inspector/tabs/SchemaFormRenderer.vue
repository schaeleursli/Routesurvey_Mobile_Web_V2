<template>
  <div class="schema-form">
    <!-- Classification Section -->
    <div class="schema-form__section">
      <h4 class="schema-form__section-title">Classification</h4>

      <!-- Type -->
      <div class="schema-form__field">
        <label class="schema-form__label">Type</label>
        <select
          v-model="typeValue"
          class="schema-form__select"
          @change="handleTypeChange"
        >
          <option :value="null">Select type...</option>
          <option v-for="t in types" :key="t.id" :value="t.id">
            {{ t.label }}
          </option>
        </select>
      </div>

      <!-- Subtype (if applicable) -->
      <div v-if="subtypes.length > 0" class="schema-form__field">
        <label class="schema-form__label">Subtype</label>
        <select
          v-model="subtypeValue"
          class="schema-form__select"
          @change="handleSubtypeChange"
        >
          <option :value="null">Select subtype...</option>
          <option v-for="s in subtypes" :key="s.id" :value="s.id">
            {{ s.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Dimensions Section -->
    <div v-if="dimensionFields.length > 0" class="schema-form__section">
      <h4 class="schema-form__section-title">Dimensions</h4>

      <div class="schema-form__dimensions-grid">
        <DimensionField
          v-for="field in dimensionFields"
          :key="field.key"
          :field="field"
          :value="getDimensionValue(field.key)"
          @update="handleDimensionUpdate(field.key, $event)"
        />
      </div>
    </div>

    <!-- No dimensions message -->
    <div v-else-if="typeValue" class="schema-form__no-dims">
      <p class="text-secondary">No dimension fields for this type/subtype.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';
import DimensionField from './DimensionField.vue';

const store = useSurveyReviewStore();

// Local state synced with store
const typeValue = ref<string | null>(null);
const subtypeValue = ref<string | null>(null);

// Computed from store
const types = computed(() => store.availableTypes);
const subtypes = computed(() => store.availableSubtypes);
const dimensionFields = computed(() => store.selectedVisibleDimensionFields);

// Sync from selected point
watch(
  () => store.selectedPoint,
  (point) => {
    typeValue.value = point?.type || null;
    subtypeValue.value = point?.subtype || null;
  },
  { immediate: true }
);

function getDimensionValue(key: string): number | string | null {
  const dims = store.selectedPoint?.dimensions || {};
  return dims[key] ?? null;
}

function handleTypeChange() {
  // Reset subtype when type changes
  subtypeValue.value = null;
  store.updateDraft({
    type: typeValue.value || undefined,
    subtype: undefined,
  });
}

function handleSubtypeChange() {
  store.updateDraft({
    subtype: subtypeValue.value || undefined,
  });
}

function handleDimensionUpdate(key: string, value: number | string | boolean | null) {
  store.updateDraft({
    dimensions: { [key]: value },
  });
}
</script>

<style scoped>
.schema-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.schema-form__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.schema-form__section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-light);
}

.schema-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.schema-form__label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.schema-form__select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-input);
  font-size: 0.9rem;
  color: var(--text-primary);
  cursor: pointer;
}

.schema-form__select:focus {
  outline: none;
  border-color: var(--primary);
}

.schema-form__dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.schema-form__no-dims {
  padding: 1rem;
  background: var(--bg-surface-2);
  border-radius: 6px;
  text-align: center;
}
</style>
