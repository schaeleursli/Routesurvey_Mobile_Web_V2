<template>
  <span class="category-pill" :class="`category-pill--${category}`">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    category?: string | null;
  }>(),
  {
    category: null,
  }
);

const label = computed(() => {
  switch (props.category) {
    case 'obstruction':
      return 'Obstruction';
    case 'observation':
      return 'Observation';
    case 'info':
      return 'Info';
    default:
      return props.category || 'Unknown';
  }
});
</script>

<style scoped>
.category-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.category-pill--obstruction {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.category-pill--observation {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.category-pill--info {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

/* Default fallback */
.category-pill:not(.category-pill--obstruction):not(.category-pill--observation):not(.category-pill--info) {
  background: var(--bg-surface-2);
  color: var(--text-secondary);
}
</style>
