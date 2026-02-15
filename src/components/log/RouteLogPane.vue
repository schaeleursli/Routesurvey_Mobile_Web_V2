<template>
  <div class="route-log-pane">
    <!-- Header -->
    <div class="route-log-pane__header">
      <div class="route-log-pane__header-row">
        <span class="route-log-pane__col route-log-pane__col--distance">Dist</span>
        <span class="route-log-pane__col route-log-pane__col--type">Type</span>
        <span class="route-log-pane__col route-log-pane__col--road">Road</span>
        <span class="route-log-pane__col route-log-pane__col--kpi">Status</span>
      </div>
    </div>

    <!-- Virtualized List -->
    <div ref="scrollContainer" class="route-log-pane__scroll">
      <div
        :style="{ height: `${totalHeight}px`, position: 'relative' }"
      >
        <div
          v-for="virtualRow in virtualRows"
          :key="store.visiblePoints[virtualRow.index]?.id"
          :style="{
            position: 'absolute',
            top: `${virtualRow.start}px`,
            left: 0,
            right: 0,
            height: `${ROW_HEIGHT}px`,
          }"
        >
          <RouteLogRow
            v-if="store.visiblePoints[virtualRow.index]"
            :point="store.visiblePoints[virtualRow.index]"
            :kpis="store.kpisById[store.visiblePoints[virtualRow.index].id]"
            :is-selected="store.visiblePoints[virtualRow.index].id === store.selectedPointId"
            @click="handleRowClick(store.visiblePoints[virtualRow.index].id)"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="store.visiblePoints.length === 0" class="route-log-pane__empty">
      <PhMagnifyingGlass :size="32" weight="light" />
      <p>No points match your filters</p>
      <button class="route-log-pane__reset-btn" @click="store.resetFilters()">
        Reset Filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { PhMagnifyingGlass } from '@phosphor-icons/vue';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';
import RouteLogRow from './RouteLogRow.vue';

const store = useSurveyReviewStore();

// ---------------------------------------------------------------------------
// Virtualization Setup
// ---------------------------------------------------------------------------

const ROW_HEIGHT = 48;
const scrollContainer = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer({
  count: computed(() => store.visiblePoints.length),
  getScrollElement: () => scrollContainer.value,
  estimateSize: () => ROW_HEIGHT,
  overscan: 5,
});

const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalHeight = computed(() => virtualizer.value.getTotalSize());

// ---------------------------------------------------------------------------
// Selection Handling
// ---------------------------------------------------------------------------

function handleRowClick(pointId: string) {
  const success = store.selectPoint(pointId);
  if (!success) {
    // Dirty state - layout handles modal
  }
}

// Scroll selected row into view when selection changes
watch(
  () => store.selectedPointId,
  (newId) => {
    if (!newId || !scrollContainer.value) return;
    const index = store.visiblePoints.findIndex((p) => p.id === newId);
    if (index >= 0) {
      virtualizer.value.scrollToIndex(index, { align: 'auto' });
    }
  }
);
</script>

<style scoped>
.route-log-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.route-log-pane__header {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface-2);
}

.route-log-pane__header-row {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.route-log-pane__col {
  flex-shrink: 0;
}

.route-log-pane__col--distance {
  width: 60px;
}

.route-log-pane__col--type {
  width: 140px;
}

.route-log-pane__col--road {
  flex: 1;
  min-width: 80px;
}

.route-log-pane__col--kpi {
  width: 80px;
  text-align: center;
}

.route-log-pane__scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.route-log-pane__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
}

.route-log-pane__reset-btn {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 150ms;
}

.route-log-pane__reset-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
</style>
