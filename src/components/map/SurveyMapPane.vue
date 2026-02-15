<template>
  <div class="survey-map-pane">
    <!-- Map Viewer -->
    <RouteMapViewer
      ref="mapRef"
      :route-points="mapPoints"
      :selected-marker="selectedMarker"
      :map-center="mapCenter"
      :zoom="zoom"
      :edit-mode="false"
      :show-point-actions="false"
      @map-ready="onMapReady"
      @marker-click="onMarkerClick"
    />

    <!-- Map Toolbar -->
    <div class="survey-map-pane__toolbar">
      <button
        v-if="showCenterButton && store.selectedPoint"
        class="map-toolbar-btn"
        title="Center on selected point"
        @click="centerOnSelected"
      >
        <PhCrosshairSimple :size="20" />
      </button>
      <button class="map-toolbar-btn" title="Zoom in" @click="zoomIn">
        <PhPlus :size="20" />
      </button>
      <button class="map-toolbar-btn" title="Zoom out" @click="zoomOut">
        <PhMinus :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { PhCrosshairSimple, PhPlus, PhMinus } from '@phosphor-icons/vue';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';
import RouteMapViewer from '@/components/map/RouteMapViewer.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Polyfill for legacy dependence
if (!window.L) {
  window.L = L;
}

const props = defineProps<{
  showCenterButton?: boolean;
}>();

const emit = defineEmits<{
  (e: 'center-on-selected'): void;
}>();

const store = useSurveyReviewStore();

// ---------------------------------------------------------------------------
// Refs
// ---------------------------------------------------------------------------

const mapRef = ref<InstanceType<typeof RouteMapViewer> | null>(null);
const zoom = ref(13);
const mapCenter = ref<[number, number]>([0, 0]);

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

/** Transform points with KPI-based styling */
const mapPoints = computed(() => {
  return store.visiblePoints.map((p) => {
    const kpis = store.kpisById[p.id];
    let color = '#6b7280'; // Default gray

    // Color based on data KPI
    if (kpis) {
      switch (kpis.data) {
        case 'empty':
          color = '#dc2626'; // Red
          break;
        case 'partial':
          color = '#f59e0b'; // Amber
          break;
        case 'complete':
          color = '#22c55e'; // Green
          break;
      }
    }

    // Icon based on type
    let icon = 'info-circle';
    const type = p.type?.toLowerCase() || '';
    if (['intersection', 'roundabout', 'sharp_turn', 'ramp'].includes(type)) {
      icon = 'sign-intersection';
    } else if (type === 'rail_crossing') {
      icon = 'train-front';
    } else if (['bridge', 'tunnel', 'gantry', 'underpass'].includes(type)) {
      icon = 'building';
    } else if (['powerlines', 'overhead_obstruction', 'traffic_signal', 'powerline'].includes(type)) {
      icon = 'lightning-charge';
    } else if (p.category === 'obstruction') {
      icon = 'exclamation-triangle';
    } else if (p.category === 'observation') {
      icon = 'search';
    }

    return {
      ...p,
      color,
      icon,
    };
  });
});

/** Selected marker for map highlighting */
const selectedMarker = computed(() => {
  if (!store.selectedPointId) return null;
  const index = store.visiblePoints.findIndex((p) => p.id === store.selectedPointId);
  if (index === -1) return null;
  return {
    point: store.selectedPoint,
    index,
  };
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function onMapReady() {
  // Auto-fit bounds if we have points
  if (store.visiblePoints.length > 0) {
    const first = store.visiblePoints[0];
    if (first.lat && first.lng) {
      mapCenter.value = [first.lat, first.lng];
    }
  }
}

function onMarkerClick(payload: { point?: { id: string }; id?: string }) {
  const pointId = payload.point?.id || payload.id;
  if (pointId) {
    const success = store.selectPoint(pointId);
    if (!success) {
      // User has unsaved changes - layout will handle modal
    }
  }
}

function centerOnSelected() {
  if (store.selectedPoint?.lat && store.selectedPoint?.lng) {
    mapCenter.value = [store.selectedPoint.lat, store.selectedPoint.lng];
    emit('center-on-selected');
  }
}

function zoomIn() {
  zoom.value = Math.min(zoom.value + 1, 18);
}

function zoomOut() {
  zoom.value = Math.max(zoom.value - 1, 5);
}

// Note: We do NOT auto-pan on selection change (per spec - it's nauseating)
</script>

<style scoped>
.survey-map-pane {
  position: relative;
  width: 100%;
  height: 100%;
}

.survey-map-pane__toolbar {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1000;
}

.map-toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 150ms;
}

.map-toolbar-btn:hover {
  background: var(--bg-hover);
}

.map-toolbar-btn:active {
  transform: scale(0.95);
}
</style>
