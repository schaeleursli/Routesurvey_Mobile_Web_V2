<template>
  <span class="status-badge" :class="`status-badge--${status}`">
    <component :is="statusIcon" :size="12" weight="bold" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  PhPencilSimple,
  PhCamera,
  PhCheckCircle,
  PhRocket,
} from '@phosphor-icons/vue';

const props = withDefaults(
  defineProps<{
    status?: string | null;
  }>(),
  {
    status: 'draft',
  }
);

const statusConfig: Record<string, { label: string; icon: any }> = {
  draft: { label: 'Draft', icon: PhPencilSimple },
  surveyed: { label: 'Surveyed', icon: PhCamera },
  reviewed: { label: 'Reviewed', icon: PhCheckCircle },
  ready: { label: 'Ready', icon: PhRocket },
};

const config = computed(() => {
  return statusConfig[props.status || 'draft'] || statusConfig.draft;
});

const label = computed(() => config.value.label);
const statusIcon = computed(() => config.value.icon);
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge--draft {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.status-badge--surveyed {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge--reviewed {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge--ready {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}
</style>
