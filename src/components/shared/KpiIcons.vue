<template>
  <div class="kpi-icons">
    <span
      class="kpi-icon"
      :class="kpiClass(kpis.photos)"
      :title="`Photos: ${kpis.photos}`"
    >
      <PhCamera :size="size" :weight="iconWeight(kpis.photos)" />
    </span>
    <span
      class="kpi-icon"
      :class="kpiClass(kpis.data)"
      :title="`Data: ${kpis.data}`"
    >
      <PhClipboardText :size="size" :weight="iconWeight(kpis.data)" />
    </span>
    <span
      class="kpi-icon"
      :class="kpiClass(kpis.notes)"
      :title="`Notes: ${kpis.notes}`"
    >
      <PhNote :size="size" :weight="iconWeight(kpis.notes)" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { PhCamera, PhClipboardText, PhNote } from '@phosphor-icons/vue';
import type { Kpis, KpiStatus } from '@routesurvey/survey-core';

const props = withDefaults(
  defineProps<{
    kpis: Kpis;
    size?: number;
  }>(),
  {
    size: 16,
  }
);

function kpiClass(status: KpiStatus): string {
  return `kpi-icon--${status}`;
}

function iconWeight(status: KpiStatus): 'fill' | 'regular' | 'light' {
  switch (status) {
    case 'complete':
      return 'fill';
    case 'partial':
      return 'regular';
    case 'empty':
      return 'regular';
    default:
      return 'light';
  }
}
</script>

<style scoped>
.kpi-icons {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 150ms;
}

.kpi-icon--empty {
  color: var(--kpi-empty);
}

.kpi-icon--partial {
  color: var(--kpi-partial);
}

.kpi-icon--complete {
  color: var(--kpi-complete);
}

.kpi-icon--na {
  color: var(--kpi-na);
}
</style>
