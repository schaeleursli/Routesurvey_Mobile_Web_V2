<template>
  <div class="dimension-field">
    <label class="dimension-field__label">
      {{ field.label }}
      <span v-if="field.unit" class="dimension-field__unit">({{ field.unit }})</span>
    </label>

    <!-- Number input -->
    <div v-if="field.type === 'number'" class="dimension-field__input-wrapper">
      <input
        v-model.number="localValue"
        type="number"
        class="dimension-field__input"
        :min="field.min"
        :max="field.max"
        :step="field.step || 0.1"
        :placeholder="field.placeholder || '—'"
        @input="handleInput"
      />
    </div>

    <!-- Text input -->
    <div v-else-if="field.type === 'text'" class="dimension-field__input-wrapper">
      <input
        v-model="localValue"
        type="text"
        class="dimension-field__input"
        :placeholder="field.placeholder || '—'"
        @input="handleInput"
      />
    </div>

    <!-- Select input -->
    <div v-else-if="field.type === 'select'" class="dimension-field__input-wrapper">
      <select
        v-model="localValue"
        class="dimension-field__select"
        @change="handleInput"
      >
        <option :value="null">Select...</option>
        <option v-for="opt in field.options" :key="opt" :value="opt">
          {{ opt }}
        </option>
      </select>
    </div>

    <!-- Boolean toggle -->
    <div v-else-if="field.type === 'boolean'" class="dimension-field__toggle">
      <button
        class="toggle-btn"
        :class="{ active: localValue === true }"
        @click="setBoolean(true)"
      >
        Yes
      </button>
      <button
        class="toggle-btn"
        :class="{ active: localValue === false }"
        @click="setBoolean(false)"
      >
        No
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { SchemaField } from '@routesurvey/survey-core';

const props = defineProps<{
  field: SchemaField;
  value: number | string | boolean | null;
}>();

const emit = defineEmits<{
  (e: 'update', value: number | string | boolean | null): void;
}>();

const localValue = ref(props.value);

watch(
  () => props.value,
  (val) => {
    localValue.value = val;
  }
);

function handleInput() {
  emit('update', localValue.value);
}

function setBoolean(val: boolean) {
  localValue.value = val;
  emit('update', val);
}
</script>

<style scoped>
.dimension-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dimension-field__label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.dimension-field__unit {
  color: var(--text-tertiary);
  font-weight: 400;
}

.dimension-field__input-wrapper {
  position: relative;
}

.dimension-field__input,
.dimension-field__select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-input);
  font-size: 0.9rem;
  color: var(--text-primary);
}

.dimension-field__input:focus,
.dimension-field__select:focus {
  outline: none;
  border-color: var(--primary);
}

.dimension-field__input::placeholder {
  color: var(--text-tertiary);
}

/* Hide number spinners */
.dimension-field__input[type='number']::-webkit-inner-spin-button,
.dimension-field__input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.dimension-field__input[type='number'] {
  -moz-appearance: textfield;
}

.dimension-field__toggle {
  display: flex;
  gap: 4px;
}

.toggle-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  background: transparent;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 150ms;
}

.toggle-btn:first-child {
  border-radius: 6px 0 0 6px;
}

.toggle-btn:last-child {
  border-radius: 0 6px 6px 0;
}

.toggle-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.toggle-btn:hover:not(.active) {
  background: var(--bg-hover);
}
</style>
