<template>
  <div
    class="route-log-row"
    :class="{ 'route-log-row--selected': isSelected }"
    @click="$emit('click')"
  >
    <!-- Distance -->
    <span class="route-log-row__col route-log-row__col--distance">
      {{ formattedDistance }}
    </span>

    <!-- Type with Icon -->
    <span class="route-log-row__col route-log-row__col--type">
      <TypeIcon :type="point.type" :size="16" />
      <span class="route-log-row__type-label">
        {{ point.subtype || point.type || '—' }}
      </span>
    </span>

    <!-- Road Name -->
    <span class="route-log-row__col route-log-row__col--road">
      {{ point.road?.display || point.roadName || '—' }}
    </span>

    <!-- KPI Icons -->
    <span class="route-log-row__col route-log-row__col--kpi">
      <KpiIcons v-if="kpis" :kpis="kpis" :size="14" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SurveyPoint, Kpis } from '@routesurvey/survey-core';
import TypeIcon from '@/components/shared/TypeIcon.vue';
import KpiIcons from '@/components/shared/KpiIcons.vue';

const props = defineProps<{
  point: SurveyPoint;
  kpis?: Kpis;
  isSelected: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
}>();

const formattedDistance = computed(() => {
  if (props.point.distance == null) return '—';
  const km = props.point.distance / 1000;
  return km < 10 ? km.toFixed(2) : km.toFixed(1);
});
</script>

<style scoped>
.route-log-row {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background-color 150ms;
}

.route-log-row:hover {
  background: var(--bg-hover);
}

.route-log-row--selected {
  background: var(--bg-selected);
  border-left: 3px solid var(--primary);
  padding-left: calc(0.75rem - 3px);
}

.route-log-row__col {
  flex-shrink: 0;
  font-size: 0.875rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-log-row__col--distance {
  width: 60px;
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.route-log-row__col--type {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 140px;
}

.route-log-row__type-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: capitalize;
}

.route-log-row__col--road {
  flex: 1;
  min-width: 80px;
  color: var(--text-secondary);
}

.route-log-row__col--kpi {
  width: 80px;
  display: flex;
  justify-content: center;
}
</style>
