<template>
    <div class="survey-map-wrapper">
        <RouteMapViewer 
            ref="mapRef"
            :route-points="combinedPoints" 
            :selected-marker="selectedMarker"
            :map-center="mapCenter"
            :zoom="zoom"
            :edit-mode="false"
            :show-point-actions="false" 
            @map-ready="onMapReady"
            @marker-click="onMarkerClick"
            @map-click="onMapClick"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useSurveyStore } from '@/stores/surveyStore';
import RouteMapViewer from '@/components/map/RouteMapViewer.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Polyfill window.L for RouteMapViewer legacy dependence
if (!window.L) {
    window.L = L;
}

const props = defineProps({
    routeGeometry: {
        type: Array,
        default: () => []
    }
});

const store = useSurveyStore();

const combinedPoints = computed(() => {
    // Transform Points with visual properties
    const styledPoints = store.filteredPoints.map(p => {
        let color = '#999999'; // Draft (Gray)
        
        switch (p.workflowStatus) {
            case 'surveyed': color = '#0F62FE'; break; // Blue
            case 'reviewed': color = '#FF8800'; break; // Orange
            case 'ready':    color = '#24A148'; break; // Green
        }

        // Type Icons
        let icon = 'info-circle';
        // Map Canonical Types to Icons
        // Road/Geometry
        if (['intersection', 'roundabout', 'sharp_turn', 'ramp'].includes(p.type)) icon = 'sign-intersection';
        if (p.type === 'rail_crossing') icon = 'train-front';
        // Structures
        if (['bridge', 'tunnel', 'gantry', 'underpass'].includes(p.type)) icon = 'building';
        // Overhead
        if (['powerlines', 'overhead_obstruction', 'traffic_signal'].includes(p.type)) icon = 'lightning-charge';
        // General
        if (p.category === 'obstruction') icon = 'exclamation-triangle';
        if (p.category === 'observation') icon = 'search';

        // Critical overrides status color? Or maybe shape?
        // For now let's stick to status color, maybe add a border for critical if MapViewer supports it.
        // If it's an obstruction, maybe use a different shape or icon?
        // Assuming RouteMapViewer uses 'color' prop.
        return {
            ...p,
            color: color,
            icon: icon
        };
    });

    return [...props.routeGeometry, ...styledPoints];
});

const mapRef = ref(null);
const zoom = ref(13);
const mapCenter = ref([0, 0]);

// Map Store selection to Map Props
const selectedMarker = computed(() => {
    if (!store.activePointId) return null;
    const index = store.filteredPoints.findIndex(p => p.id === store.activePointId);
    if (index === -1) return null;
    // RouteMapViewer expects { point, index } for highlighting
    return {
        point: store.activePoint,
        index: index
    };
});

const onMapReady = () => {
    // If we have points, map might auto-fit.
};

const onMarkerClick = (payload) => {
    // payload might be the point object directly or { point, index } depending on RouteMapViewer impl.
    // Based on previous analysis: emit('point-double-click', { point, index })
    // But RouteMapViewer.vue emits 'marker-click' with DIFFERENT payload?
    // Looking at RouteMapViewer source (Step 97 in previous turn not visible, but Step 23 MapViewer):
    // MapViewer emits 'point-double-click'.
    // RouteMapViewer usually wraps MapViewer. 
    // Let's assume payload has .point or is the point.
    const point = payload.point || payload;
    if (point && point.id) {
        store.setActivePoint(point.id);
    }
};

const onMapClick = () => {
    // Optional: Deselect or Add Point Logic
};

// Sync Map Center to Active Point
watch(() => store.activePoint, (newPoint) => {
    if (newPoint && newPoint.lat && newPoint.lng) {
        mapCenter.value = [newPoint.lat, newPoint.lng];
        // If we want to strictly follow "pan smoothly":
        // mapRef.value?.map?.flyTo([lat, lng]) if accessible.
        // For now reactive prop binding might suffice if RouteMapViewer watches it.
    }
});
</script>

<style scoped>
.survey-map-wrapper {
    width: 100%;
    height: 100%;
}
</style>
