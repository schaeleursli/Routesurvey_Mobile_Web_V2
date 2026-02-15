<template>
    <div class="route-viewer-example">
        <h3>RouteMapViewer with Edit Mode Example</h3>

        <!-- Edit Mode Toggle -->
        <div class="edit-controls">
            <BaseButton :variant="editMode ? 'primary' : 'secondary'" @click="toggleEditMode" left-icon="bi bi-pencil">
                {{ editMode ? 'Exit Edit Mode' : 'Enter Edit Mode' }}
            </BaseButton>
        </div>

        <!-- RouteMapViewer Component -->
        <div class="map-container">
            <RouteMapViewer :route-points="routePoints" :edit-mode="editMode" :selected-marker="selectedMarker"
                :map-center="mapCenter" :zoom="zoom" @marker-click="onMarkerClick" @marker-drag="onMarkerDrag"
                @marker-move="onMarkerMove" @marker-add="onMarkerAdd" @marker-remove="onMarkerRemove"
                @point-info="onPointInfo" @point-edit="onPointEdit" @map-click="onMapClick" @map-ready="onMapReady" />
        </div>

        <!-- Points List -->
        <div class="points-list">
            <h4>Route Points ({{ routePoints.length }})</h4>
            <div v-for="(point, index) in routePoints" :key="point.id || index" class="point-item"
                :class="{ selected: selectedMarker?.index === index }" @click="selectMarker(index)">
                <div class="point-info">
                    <strong>{{ getPointLabel(point, index) }}</strong>
                    <small>{{ point.lat?.toFixed(6) }}, {{ point.lng?.toFixed(6) }}</small>
                </div>
                <div class="point-actions" v-if="editMode">
                    <BaseButton size="small" variant="secondary" @click.stop="editPoint(point)">
                        <i class="bi bi-pencil"></i>
                    </BaseButton>
                    <BaseButton size="small" variant="danger" @click.stop="removePoint(index)">
                        <i class="bi bi-trash"></i>
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import RouteMapViewer from './RouteMapViewer.vue';
import { BaseButton } from '@/components/ui';

// Component state
const editMode = ref(false);
const selectedMarker = ref(null);
const mapCenter = ref([40.7128, -74.0060]); // New York City
const zoom = ref(13);

// Sample route points
const routePoints = ref([
    {
        id: 1,
        lat: 40.7128,
        lng: -74.0060,
        type: 'start',
        name: 'Start Point'
    },
    {
        id: 2,
        lat: 40.7589,
        lng: -73.9851,
        type: 'bridge',
        name: 'Bridge Point'
    },
    {
        id: 3,
        lat: 40.7505,
        lng: -73.9934,
        type: 'intersection',
        name: 'Intersection'
    },
    {
        id: 4,
        lat: 40.7614,
        lng: -73.9776,
        type: 'end',
        name: 'End Point'
    }
]);

// Computed properties
const getPointLabel = (point, index) => {
    if (point.name) return point.name;
    if (point.type === 'start') return 'Start Point';
    if (point.type === 'end') return 'End Point';
    return `Point ${index + 1}`;
};

// Event handlers
const toggleEditMode = () => {
    editMode.value = !editMode.value;
    if (!editMode.value) {
        selectedMarker.value = null;
    }
};

const onMarkerClick = (point, index) => {
    if (editMode.value) {
        selectedMarker.value = { point, index };
    }
};

const onMarkerDrag = (data) => {
    console.log('Marker dragging:', data);
    // Update point position in real-time
    const pointIndex = routePoints.value.findIndex(p => p.id === data.point.id);
    if (pointIndex !== -1) {
        routePoints.value[pointIndex].lat = data.newPos.lat;
        routePoints.value[pointIndex].lng = data.newPos.lng;
    }
};

const onMarkerMove = (data) => {
    console.log('Marker moved:', data);
    // Final position update
    const pointIndex = routePoints.value.findIndex(p => p.id === data.point.id);
    if (pointIndex !== -1) {
        routePoints.value[pointIndex].lat = data.newPos.lat;
        routePoints.value[pointIndex].lng = data.newPos.lng;
    }
};

const onMarkerAdd = (latlng) => {
    console.log('Adding marker at:', latlng);
    const newPoint = {
        id: Date.now(),
        lat: latlng.lat,
        lng: latlng.lng,
        type: 'survey',
        name: `New Point ${routePoints.value.length + 1}`
    };
    routePoints.value.push(newPoint);
};

const onMarkerRemove = (index) => {
    console.log('Removing marker at index:', index);
    if (index >= 0 && index < routePoints.value.length) {
        routePoints.value.splice(index, 1);
        if (selectedMarker.value?.index === index) {
            selectedMarker.value = null;
        }
    }
};

const onPointInfo = (point) => {
    console.log('Point info requested:', point);
    // Show point information modal
};

const onPointEdit = (point) => {
    console.log('Edit point:', point);
    // Show point edit modal
};

const onMapClick = (latlng) => {
    if (editMode.value) {
        console.log('Map clicked at:', latlng);
        // Could add a new point here
    }
};

const onMapReady = () => {
    console.log('Map is ready');
};

const selectMarker = (index) => {
    if (editMode.value) {
        selectedMarker.value = {
            point: routePoints.value[index],
            index
        };
    }
};

const editPoint = (point) => {
    console.log('Edit point:', point);
    // Show edit modal
};

const removePoint = (index) => {
    onMarkerRemove(index);
};
</script>

<style scoped>
.route-viewer-example {
    display: flex;
    flex-direction: column;
    height: 100vh;
    gap: 1rem;
}

.edit-controls {
    padding: 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.map-container {
    flex: 1;
    min-height: 400px;
}

.points-list {
    max-height: 200px;
    overflow-y: auto;
    border-top: 1px solid #dee2e6;
    background: white;
}

.points-list h4 {
    padding: 1rem;
    margin: 0;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.point-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
}

.point-item:hover {
    background-color: #f8f9fa;
}

.point-item.selected {
    background-color: #e3f2fd;
    border-left: 3px solid #2196f3;
}

.point-info {
    flex: 1;
}

.point-info strong {
    display: block;
    margin-bottom: 0.25rem;
}

.point-info small {
    color: #666;
    font-size: 0.875rem;
}

.point-actions {
    display: flex;
    gap: 0.5rem;
}
</style>
