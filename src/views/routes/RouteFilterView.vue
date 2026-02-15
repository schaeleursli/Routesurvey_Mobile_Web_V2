<template>
    <div class="route-filter-view">
        <!-- Main Panel -->
        <BasePanel title="Route Drawing Tools" elevation="level1" class="main-panel">
            <template #actions-view>
                <div class="actions-container">
                    <!-- First Row: Drawing Mode and Threshold Controls -->
                    <div class="action-row">
                        <div class="action-group">
                            <BaseButton variant="secondary" size="small" @click="toggleDrawingMode"
                                :class="{ 'drawing-mode-active': drawingMode }" left-icon="bi bi-pencil">
                                {{ drawingMode ? t('stopDrawing') : t('drawRoute') }}
                            </BaseButton>

                            <div class="threshold-control">
                                <label for="threshold-input" class="threshold-label">
                                    {{ t('threshold') }}:
                                </label>
                                <input id="threshold-input" v-model.number="interpolationThreshold" type="number"
                                    min="50" max="10000" step="50" class="threshold-input"
                                    title="Lower values = more precise, Higher values = more points found" />
                                <span class="threshold-unit">m</span>
                            </div>
                        </div>

                        <div class="action-group">
                            <div class="threshold-presets">
                                <BaseButton v-for="preset in thresholdPresets" :key="preset.value" variant="secondary"
                                    size="small" @click="interpolationThreshold = preset.value"
                                    :class="{ 'preset-active': interpolationThreshold === preset.value }">
                                    {{ preset.label }}
                                </BaseButton>
                            </div>
                        </div>
                    </div>

                    <!-- Second Row: Route Actions -->
                    <div class="action-row">
                        <div class="action-group">
                            <BaseButton v-if="drawnRoute.length > 0" variant="primary" size="small"
                                @click="interpolateRoute" left-icon="bi bi-magic">
                                {{ t('interpolateRoute') }}
                            </BaseButton>

                            <BaseButton v-if="drawnRoute.length > 0" variant="secondary" size="small"
                                @click="clearDrawnRoute" left-icon="bi bi-trash">
                                {{ t('clearDrawnRoute') }}
                            </BaseButton>

                            <BaseButton v-if="interpolatedPoints.length > 0" variant="primary" size="small"
                                @click="showSaveDialog" left-icon="bi bi-save">
                                {{ t('saveRoute') }}
                            </BaseButton>
                        </div>

                        <div class="action-group">
                            <BaseButton v-if="canUndo" variant="ghost" size="small" @click="undoDrawing"
                                title="Undo last point" left-icon="bi bi-arrow-counterclockwise" />

                            <BaseButton v-if="canRedo" variant="ghost" size="small" @click="redoDrawing"
                                title="Redo last undone point" left-icon="bi bi-arrow-clockwise" />
                        </div>
                    </div>

                    <!-- Third Row: Routes Toggle -->
                    <div class="action-row"
                        v-if="selectedRoutesData.length > 0 || drawnRoute.length > 0 || interpolatedPoints.length > 0">
                        <div class="action-group">
                            <BaseButton variant="secondary" size="small" @click="toggleRoutes"
                                :left-icon="routesExpanded ? 'bi bi-chevron-up' : 'bi bi-chevron-down'">
                                {{ t('routesOnMap') }} ({{ selectedRoutesData.length }})
                            </BaseButton>
                        </div>
                    </div>
                </div>
            </template>



            <!-- Routes Section (like screenshots in RouteViewerNew) -->
            <div v-if="routesExpanded" class="routes-section">
                <div v-if="selectedRoutesData.length === 0 && drawnRoute.length === 0 && interpolatedPoints.length === 0"
                    class="no-routes">
                    <div class="text-center py-4">
                        <i class="bi bi-route text-muted" style="font-size: 3rem;"></i>
                        <p class="text-muted mt-2">No routes selected</p>
                        <p class="text-muted small">Select routes from the main routes page to get started</p>
                    </div>
                </div>

                <div v-else class="routes-list">
                    <!-- Selected Routes -->
                    <ListItem v-for="(routeData, index) in selectedRoutesData" :key="routeData.id"
                        :title="routeData.title" :subtitle="`${routeData.start} → ${routeData.end}`"
                        :description="`${formatDistance(routeData.distance)} • ${routeData.points} ${t('points')}`"
                        class="route-list-item">
                        <template #icon>
                            <div class="route-color-indicator" :style="{ backgroundColor: getRouteColor(index) }"></div>
                        </template>
                        <template #content v-if="routeData.notes">
                            <div class="route-notes">
                                <i class="bi bi-chat-text"></i>
                                <span>{{ routeData.notes }}</span>
                            </div>
                        </template>
                    </ListItem>

                    <!-- Drawing Routes -->
                    <ListItem v-if="drawnRoute.length > 0" :title="t('drawnRoute')"
                        :subtitle="`${drawnRoute.length} ${t('points')}`"
                        :description="formatDistance(calculateDrawnRouteDistance())"
                        class="route-list-item drawing-route">
                        <template #icon>
                            <div class="route-color-indicator" style="background-color: #ff1493;"></div>
                        </template>
                    </ListItem>

                    <!-- Interpolated Routes -->
                    <ListItem v-if="interpolatedPoints.length > 0" :title="t('interpolatedPoints')"
                        :subtitle="`${interpolatedPoints.length} ${t('points')}`"
                        :description="formatDistance(calculateInterpolatedRouteDistance())"
                        class="route-list-item interpolated-route">
                        <template #icon>
                            <div class="route-color-indicator" style="background-color: #4ecdc4;"></div>
                        </template>
                    </ListItem>
                </div>
            </div>

            <!-- Map Section -->
            <div class="map-section">
                <div class="map-container" :class="{ 'drawing-mode-active': drawingMode }">
                    <l-map ref="mapRef" v-model:zoom="zoom" :center="mapCenter" :use-global-leaflet="false"
                        :min-zoom="minZoom" :max-zoom="maxZoom" @ready="onMapReady" :options="mapOptions"
                        @click="onMapClick">
                        <l-tile-layer :url="tileLayerUrl" layer-type="base" :name="mapStyleLabel" />

                        <!-- Render all selected routes -->
                        <template v-if="!interpolatedPoints.length">
                            <template v-for="(routeData, routeIndex) in selectedRoutesData" :key="routeData.id">
                                <!-- Route polyline -->
                                <l-polyline v-if="routeData.pointsData && routeData.pointsData.length > 1"
                                    :lat-lngs="routeData.pointsData.map(point => [point.lat, point.lng])"
                                    :color="getRouteColor(routeIndex)" :weight="4" :opacity="0.8" :fill="false"
                                    :class="`route-polyline route-${routeIndex}`" />

                                <!-- Route markers - only show start/end and important survey points -->
                                <l-marker v-for="point in getVisibleMarkers(routeData.pointsData)"
                                    :key="`${routeData.id}-${point.originalIndex}`"
                                    :lat-lng="{ lat: point.lat, lng: point.lng }" :class="{
                                        'transparent-marker': true,
                                        'route-marker': true
                                    }">
                                    <l-icon v-if="point.isStartEnd" :icon-anchor="[16, 16]" :icon-size="[24, 24]">
                                        <div class="custom-icon start-end">
                                            <img src="@/assets/img/marker_location.png" width="24" height="24">
                                        </div>
                                    </l-icon>
                                    <l-icon v-else-if="point.type !== 'route_point' && isImportantPoint(point)"
                                        :icon-anchor="[15, 15]" :icon-size="[30, 30]">
                                        <div class="custom-icon survey-point">
                                            <img v-if="point.type === 'bridge'" width="18" height="18"
                                                src="@/assets/img/bridge.png">
                                            <img v-else-if="point.type === 'powerline'" width="18" height="18"
                                                src="@/assets/img/electric-tower_old_delete.png">
                                            <img v-else-if="point.type === 'intersection'" width="18" height="18"
                                                src="@/assets/img/intersection.png">
                                            <img v-else-if="point.type === 'road'" width="18" height="18"
                                                src="@/assets/img/road.png">
                                            <img v-else-if="point.type === 'overhead'" width="18" height="18"
                                                src="@/assets/img/overhead.png">
                                            <i v-else-if="point.type === 'railroad'" class="fas fa-train"></i>
                                            <i v-else-if="point.type === 'custom'" class="far fa-question-circle"></i>
                                            <i v-else class="bi bi-geo-alt"></i>
                                        </div>
                                    </l-icon>

                                    <!-- Popup for route info -->
                                    <!-- <l-popup :options="{ closeButton: true, maxWidth: 300 }">
                                <div class="route-popup">
                                    <h4>{{ routeData.title }}</h4>
                                    <p><strong>{{ t('start') }}:</strong> {{ routeData.start }}</p>
                                    <p><strong>{{ t('end') }}:</strong> {{ routeData.end }}</p>
                                    <p><strong>{{ t('distance') }}:</strong> {{ formatDistance(routeData.distance) }}
                                    </p>
                                    <p><strong>{{ t('points') }}:</strong> {{ routeData.points }}</p>
                                    <p v-if="routeData.notes"><strong>{{ t('notes') }}:</strong> {{ routeData.notes }}
                                    </p>
                                </div>
                            </l-popup> -->
                                </l-marker>
                            </template>
                        </template>

                        <!-- Interpolated route polyline -->
                        <l-polyline v-if="interpolatedPoints.length > 1"
                            :lat-lngs="interpolatedPoints.map(point => [point.lat, point.lng])" color="#4ecdc4"
                            :weight="4" :opacity="0.9" :fill="false" />

                        <!-- Interpolated route markers -->
                        <l-marker v-for="(point, index) in visibleInterpolatedMarkers" :key="`interpolated-${index}`"
                            :lat-lng="{ lat: point.lat, lng: point.lng }">
                            <l-icon v-if="index === 0 || index === interpolatedPoints.length - 1"
                                :icon-anchor="[16, 16]" :icon-size="[24, 24]">
                                <div class="custom-icon start-end">
                                    <img src="@/assets/img/marker_location.png" width="24" height="24">
                                </div>
                            </l-icon>
                            <l-icon v-else :icon-anchor="[15, 15]" :icon-size="[30, 30]">
                                <div class="custom-icon interpolated-point">
                                    <img v-if="point.type === 'bridge'" width="18" height="18"
                                        src="@/assets/img/bridge.png">
                                    <img v-else-if="point.type === 'powerline'" width="18" height="18"
                                        src="@/assets/img/electric-tower_old_delete.png">
                                    <img v-else-if="point.type === 'intersection'" width="18" height="18"
                                        src="@/assets/img/intersection.png">
                                    <img v-else-if="point.type === 'road'" width="18" height="18"
                                        src="@/assets/img/road.png">
                                    <img v-else-if="point.type === 'overhead'" width="18" height="18"
                                        src="@/assets/img/overhead.png">
                                    <i v-else-if="point.type === 'railroad'" class="fas fa-train"></i>
                                    <i v-else-if="point.type === 'custom'" class="far fa-question-circle"></i>
                                    <i v-else class="bi bi-geo-alt"></i>
                                </div>
                            </l-icon>
                            <l-popup :options="{ closeButton: true, maxWidth: 200 }">
                                <div class="interpolated-popup">
                                    <h5>{{ index === 0 ? t('start') : (index === interpolatedPoints.length - 1 ?
                                        t('end') :
                                        t('interpolatedPoint')) }}</h5>
                                    <p><strong>{{ t('type') }}:</strong> {{ point.type }}</p>
                                    <p><strong>{{ t('fromRoute') }}:</strong> {{ point.routeTitle }}</p>
                                    <p><strong>{{ t('distance') }}:</strong> {{ point.distance.toFixed(2) }}m</p>
                                </div>
                            </l-popup>
                        </l-marker>

                        <!-- Drawn route polyline -->
                        <l-polyline v-if="drawnRoute.length > 1" :lat-lngs="drawnRoute" color="#00bfff" :weight="3"
                            :opacity="0.9" :fill="false" dash-array="10,5" />

                        <!-- Performance indicator -->
                        <div v-if="drawnRoute.length > 0"
                            style="position: absolute; top: 10px; left: 10px; background: rgb(255 255 255 / 90%); padding: var(--spacing-xs); border-radius: var(--radius-sm); font-size: 12px; z-index: 1000;">
                            Drawing: {{ drawnRoute.length }} points
                        </div>

                        <!-- Save Route Dialog -->
                        <div v-if="showSaveModal" class="modal-overlay" @click="handleModalOverlayClick">
                            <BasePanel title="Save New Route" elevation="level3" class="save-route-modal">
                                <template #actions-view>
                                    <BaseButton variant="ghost" size="medium" @click="cancelSaveRoute"
                                        left-icon="bi bi-x" />
                                </template>

                                <div class="form-group">
                                    <label for="route-name" class="form-label">{{ t('routeName') }}:</label>
                                    <input id="route-name" v-model="newRouteName" type="text" class="form-input"
                                        :placeholder="t('enterRouteName')" maxlength="100" />
                                </div>

                                <div class="form-group">
                                    <label for="route-notes" class="form-label">{{ t('notes') }}:</label>
                                    <textarea id="route-notes" v-model="newRouteNotes" class="form-textarea"
                                        :placeholder="t('enterRouteNotes')" rows="3" maxlength="500"></textarea>
                                </div>

                                <template #footer>
                                    <div class="modal-actions">
                                        <BaseButton variant="secondary" size="medium" @click="cancelSaveRoute">
                                            {{ t('cancel') }}
                                        </BaseButton>

                                        <BaseButton variant="primary" size="medium" @click="saveNewRoute"
                                            :disabled="!newRouteName.trim()" left-icon="bi bi-save">
                                            {{ t('saveRoute') }}
                                        </BaseButton>
                                    </div>
                                </template>
                            </BasePanel>
                        </div>

                        <!-- Drawn route markers -->
                        <l-marker v-for="(point, index) in drawnRoute" :key="`drawn-${index}`"
                            :lat-lng="{ lat: point[0], lng: point[1] }">
                            <l-icon :icon-anchor="[8, 8]" :icon-size="[16, 16]">
                                <div class="custom-icon drawn-point">
                                    <i class="bi bi-dot"></i>
                                </div>
                            </l-icon>
                        </l-marker>
                    </l-map>
                </div>
            </div>

            <!-- Save Route Modal -->
            <!-- This modal is now inside the map container -->
        </BasePanel>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, inject, nextTick, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LMap, LTileLayer, LMarker, LPolyline, LIcon, LPopup } from '@vue-leaflet/vue-leaflet';
import "leaflet/dist/leaflet.css";
import '@/utils/leaflet-icon-fix';
import RoutesController from '@/controllers/routes/routes_controller';
import { useI18n } from 'vue-i18n';
import { useCursorRadius } from '@/components/planned_routes/composables/useCursorRadius.js';
import BasePanel from '@/components/ui/BasePanel.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import ListItem from '@/components/ui/ListItem.vue';

const { t } = useI18n();
const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

const route = useRoute();
const router = useRouter();
const mapRef = ref(null);

// Map settings
const zoom = ref(12);
const minZoom = ref(2);
const maxZoom = ref(22);
const mapCenter = ref([0, 0]);
const mapStyle = ref('osm');

// Route data
const selectedRoutesData = ref([]);
const selectedRouteIds = ref([]);

// Route colors for differentiation
const routeColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#e67e22', '#34495e', '#f1c40f', '#e91e63'
];

const mapOptions = computed(() => ({
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    dragging: true,
    touchZoom: true,
    tap: true,
    interactive: true
}));

const tileLayerUrl = computed(() => {
    if (mapStyle.value === 'satellite') {
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
});

const mapStyleLabel = computed(() => {
    if (mapStyle.value === 'satellite') return 'Satellite';
    return 'OpenStreetMap';
});

const drawnRoutePolyline = computed(() => {
    return drawnRoute.value.length > 1 ? drawnRoute.value : [];
});

const visibleInterpolatedMarkers = computed(() => {
    return interpolatedPoints.value.filter((point, index) =>
        index === 0 ||
        index === interpolatedPoints.value.length - 1 ||
        (point.type !== 'route_point' && isImportantPoint(point))
    );
});

// Undo/Redo computed properties
const canUndo = computed(() => drawingHistory.value.length > 0);
const canRedo = computed(() => redoHistory.value.length > 0);

// Threshold presets for the drawing controls
const thresholdPresets = computed(() => [
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' }
]);

const getRouteColor = (index) => {
    return routeColors[index % routeColors.length];
};

const formatDistance = (distance) => {
    const distanceInKm = Number(distance) / 1000.0;
    return `${distanceInKm.toFixed(2)} km`;
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

const onMapReady = async () => {
    nextTick();

    await loadSelectedRoutes();
    // If routes are already loaded, fit bounds immediately
    // console.log('onMapReady');
    // console.log('selectedRoutesData.value.length', selectedRoutesData.value.length);
    if (selectedRoutesData.value.length > 0) {
        fitMapToRoutes();
    }
    // If routes are still loading, fitBounds will be called when they're loaded

    // Ensure map is properly set up for drawing interactions
    if (mapRef.value && mapRef.value.leafletObject) {
        const map = mapRef.value.leafletObject;

        // Ensure the map container is properly sized
        map.invalidateSize();

        // Set up proper event handling for drawing
        map.on('click', (event) => {
            if (drawingMode.value) {
                console.log('Map clicked in drawing mode:', event.latlng);
            }
        });

        // Force polyline updates on zoom to ensure proper rendering
        map.on('zoomend', () => {
            if (drawnRoute.value.length > 0) {
                // Force a re-render by triggering reactivity
                drawnRoute.value = [...drawnRoute.value];
            }
        });

        // Initialize cursor radius functionality
        setTimeout(() => {
            console.log('Initializing cursor radius in RouteFilterView');
            initializeRadius();
        }, 200);
    }
};

const fitMapToRoutes = () => {
    if (!mapRef.value || !mapRef.value.leafletObject || selectedRoutesData.value.length === 0) return;

    const allPoints = [];
    selectedRoutesData.value.forEach(routeData => {
        if (routeData.pointsData && routeData.pointsData.length > 0) {
            routeData.pointsData.forEach(point => {
                allPoints.push([point.lat, point.lng]);
            });
        }
    });

    if (allPoints.length > 0) {
        try {
            const bounds = allPoints;
            mapRef.value.leafletObject.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 18
            });
        } catch (e) {
            console.warn('Error fitting map bounds:', e);
        }
    }
};

const loadSelectedRoutes = async () => {
    const routesParam = route.query.routes;
    if (!routesParam) {
        showMessage({ status: 'error', message: t('noRoutesSelected') });
        return;
    }

    selectedRouteIds.value = routesParam.split(',').map(id => id.trim());

    setGlobalLoading(true);
    try {
        const routePromises = selectedRouteIds.value.map(routeId =>
            RoutesController.getRoute(routeId)
        );

        const results = await Promise.all(routePromises);
        selectedRoutesData.value = results.filter(res => res.result).map(res => res.data);

        if (selectedRoutesData.value.length === 0) {
            showMessage({ status: 'error', message: t('noValidRoutesFound') });
            return;
        }

        // Fit bounds after routes are loaded
        // if (mapRef.value) {
        //     fitMapToRoutes();
        // }

    } catch (error) {
        console.error('Error loading routes:', error);
        showMessage({ status: 'error', message: t('errorLoadingRoutes') });
    } finally {
        setGlobalLoading(false);
    }
};

const goBack = () => {
    // Navigate to Dashboard as the home/navigation root
    router.push({ name: 'Dashboard' });
};

const drawingMode = ref(false);
const drawnRoute = ref([]);
const interpolatedPoints = ref([]);
const interpolationThreshold = ref(1000); // Default threshold in meters

// Undo/Redo functionality
const drawingHistory = ref([]);
const redoHistory = ref([]);
const maxHistorySize = 50; // Maximum number of states to keep in history

// Save route modal
const showSaveModal = ref(false);
const newRouteName = ref('');
const newRouteNotes = ref('');

// Initialize cursor radius for drawing mode
const {
    initializeRadius,
    cleanup: cleanupRadius,
    refresh: refreshRadius
} = useCursorRadius(mapRef, drawingMode, interpolationThreshold, {
    fillColor: '#00bfff',
    color: '#00bfff',
    fillOpacity: 0.1,
    opacity: 0.8
});

// Convert degrees to meters (approximate)
const degreesToMeters = (degrees) => {
    return Math.round(degrees * 111000); // 1 degree ≈ 111km
};

// Convert meters to degrees
const metersToDegrees = (meters) => {
    return meters / 111000;
};

const onMapClick = async (event) => {
    if (!drawingMode.value) return;

    // Ensure we get the correct coordinates from the click event
    const latlng = event.latlng;
    const newPoint = [latlng.lat, latlng.lng];

    // Debug logging to verify coordinates
    console.log('Map click event:', event);
    console.log('Raw latlng:', latlng);
    console.log('New point coordinates:', newPoint);

    // Save current state before adding new point
    saveState();

    // Create a new array to ensure reactivity
    drawnRoute.value = [...drawnRoute.value, newPoint];

    // Clear redo history when new action is performed
    redoHistory.value = [];

    console.log('Added point to drawn route:', newPoint);
    console.log('Drawn route now has', drawnRoute.value.length, 'points');
    console.log('Full drawn route:', JSON.stringify(drawnRoute.value));

    // Force DOM update
    await nextTick();
};

// Save current drawing state to history
const saveState = () => {
    const currentState = JSON.parse(JSON.stringify(drawnRoute.value));
    drawingHistory.value.push(currentState);

    // Limit history size
    if (drawingHistory.value.length > maxHistorySize) {
        drawingHistory.value.shift();
    }
};

// Undo last drawing action
const undoDrawing = () => {
    if (drawingHistory.value.length === 0) return;

    // Save current state to redo history
    const currentState = JSON.parse(JSON.stringify(drawnRoute.value));
    redoHistory.value.push(currentState);

    // Restore previous state
    const previousState = drawingHistory.value.pop();
    drawnRoute.value = previousState;

    // showMessage({ status: 'info', message: t('undoCompleted') });
};

// Redo last undone action
const redoDrawing = () => {
    if (redoHistory.value.length === 0) return;

    // Save current state to undo history
    const currentState = JSON.parse(JSON.stringify(drawnRoute.value));
    drawingHistory.value.push(currentState);

    // Restore next state
    const nextState = redoHistory.value.pop();
    drawnRoute.value = nextState;

    // showMessage({ status: 'info', message: t('redoCompleted') });
};

const interpolateRoute = () => {
    if (drawnRoute.value.length < 2) {
        showMessage({ status: 'warning', message: t('notEnoughPointsForInterpolation') });
        return;
    }

    // Collect all existing survey points (not route points)
    const allSurveyPoints = [];
    selectedRoutesData.value.forEach(routeData => {
        if (routeData.pointsData && routeData.pointsData.length > 0) {
            routeData.pointsData.forEach(point => {
                if (point.type !== 'route_point') { // Only survey points
                    allSurveyPoints.push({
                        ...point, // Include ALL original point data
                        routeTitle: routeData.title,
                        routeId: routeData.id
                    });
                }
            });
        }
    });

    console.log('Total survey points:', allSurveyPoints.length);
    console.log('Drawn route segments:', drawnRoute.value.length - 1);

    // Create a sparse path along the drawn route (much fewer points)
    const sparsePath = createSparsePath(drawnRoute.value, 50); // Fixed 50m intervals for path generation
    console.log('Sparse path points:', sparsePath.length);

    // Convert threshold from meters to degrees for distance comparison
    const thresholdInDegrees = metersToDegrees(interpolationThreshold.value);

    // For each point in the sparse path, find nearby survey points
    const nearbyPoints = new Map(); // Use Map to avoid duplicates
    let totalChecks = 0;
    let totalMatches = 0;

    sparsePath.forEach((pathPoint, index) => {
        if (index % 10 === 0) { // Log every 10th point (much less frequent)
            console.log(`Checking sparse path point ${index}/${sparsePath.length}`);
        }

        allSurveyPoints.forEach(surveyPoint => {
            totalChecks++;
            const distance = calculateSimpleDistance(pathPoint.lat, pathPoint.lng, surveyPoint.lat, surveyPoint.lng);
            if (distance <= thresholdInDegrees) { // Use converted threshold
                totalMatches++;
                const key = `${surveyPoint.lat},${surveyPoint.lng}`;
                if (!nearbyPoints.has(key)) {
                    nearbyPoints.set(key, {
                        ...surveyPoint,
                        distance: distance,
                        pathDistance: pathPoint.distance
                    });
                }
            }
        });
    });

    console.log(`Total checks: ${totalChecks}, Total matches: ${totalMatches}`);

    // Convert to array and sort by distance along the path
    const selectedPoints = Array.from(nearbyPoints.values());
    selectedPoints.sort((a, b) => a.pathDistance - b.pathDistance);

    interpolatedPoints.value = selectedPoints;
    console.log('Selected points:', selectedPoints.length);

    // Fit map to interpolated points
    if (selectedPoints.length > 0) {
        fitMapToInterpolatedPoints();
        // Stop drawing mode
        drawingMode.value = false;

        console.log('Interpolation completed with', selectedPoints.length, 'points');
        console.log('Save dialog can be triggered manually');
    } else {
        console.log('No points found for interpolation');
    }

    showMessage({
        status: 'success',
        message: t('interpolationComplete', { count: selectedPoints.length })
    });
};

const createSparsePath = (drawnRoute, intervalMeters) => {
    const sparsePath = [];
    let totalDistance = 0;

    for (let i = 0; i < drawnRoute.length - 1; i++) {
        const startPoint = drawnRoute[i];
        const endPoint = drawnRoute[i + 1];

        const segmentDistance = calculateDistance(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
        const numIntervals = Math.max(1, Math.ceil(segmentDistance / intervalMeters)); // At least 1 interval

        for (let j = 0; j <= numIntervals; j++) {
            const t = j / numIntervals;
            const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * t;
            const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * t;

            sparsePath.push({
                lat: lat,
                lng: lng,
                distance: totalDistance + (segmentDistance * t)
            });
        }

        totalDistance += segmentDistance;
    }

    return sparsePath;
};

const calculateSimpleDistance = (lat1, lng1, lat2, lng2) => {
    // Simple distance calculation in degrees
    const deltaLat = Math.abs(lat1 - lat2);
    const deltaLng = Math.abs(lng1 - lng2);
    return Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
};

const clearDrawnRoute = () => {
    drawnRoute.value = [];
    interpolatedPoints.value = [];

    // Clear undo/redo history
    drawingHistory.value = [];
    redoHistory.value = [];

    // Refit map to show all original routes
    if (mapRef.value && selectedRoutesData.value.length > 0) {
        fitMapToRoutes();
    }

    showMessage({ status: 'info', message: t('drawnRouteCleared') });
};

const toggleDrawingMode = () => {
    drawingMode.value = !drawingMode.value;
    if (drawingMode.value) {
        // Clear redo history when starting drawing mode
        redoHistory.value = [];

        // Ensure map is properly prepared for drawing
        if (mapRef.value) {
            // Force a map refresh to ensure proper coordinate capture
            const map = mapRef.value.leafletObject;
            map.invalidateSize();

            // Ensure the map is properly focused for drawing
            setTimeout(() => {
                map.getContainer().focus();
                // Re-initialize cursor radius when drawing mode is enabled
                console.log('Re-initializing cursor radius after drawing mode toggle');
                initializeRadius();

                // Test: Add a simple test circle to verify Leaflet is working
                try {
                    const testCircle = window.L.circle([map.getCenter().lat, map.getCenter().lng], {
                        radius: 1000,
                        fillColor: 'red',
                        fillOpacity: 0.2,
                        color: 'red',
                        weight: 2
                    }).addTo(map);

                    console.log('Test circle added successfully');

                    // Remove test circle after 1 second
                    setTimeout(() => {
                        map.removeLayer(testCircle);
                        console.log('Test circle removed');
                    }, 1000);
                } catch (error) {
                    console.error('Test circle failed:', error);
                }
            }, 100);
        }

        showMessage({ status: 'info', message: t('drawingModeEnabled') });
    } else {
        showMessage({ status: 'info', message: t('drawingModeDisabled') });
    }
};

const shouldShowMarker = (point, index, totalPoints) => {
    // Always show start/end points
    if (index === 0 || index === totalPoints - 1) {
        return true;
    }

    // Show important survey points (e.g., bridges, powerlines, intersections)
    return isImportantPoint(point);
};

const isImportantPoint = (point) => {
    return point.type === 'bridge' || point.type === 'powerline' || point.type === 'intersection' ||
        point.type === 'road' || point.type === 'overhead' || point.type === 'railroad' ||
        point.type === 'custom';
};

const getVisibleMarkers = (pointsData) => {
    const visibleMarkers = [];
    const currentZoom = zoom.value;

    // Only show markers when zoomed in enough
    if (currentZoom < 12) {
        // At low zoom, only show start/end points
        for (let i = 0; i < pointsData.length; i++) {
            const point = pointsData[i];
            if (i === 0 || i === pointsData.length - 1) {
                visibleMarkers.push({
                    ...point,
                    originalIndex: i,
                    isStartEnd: true
                });
            }
        }
    } else {
        // At high zoom, show start/end points and survey points (not route_points)
        for (let i = 0; i < pointsData.length; i++) {
            const point = pointsData[i];
            if (i === 0 || i === pointsData.length - 1 || (point.type !== 'route_point' && isImportantPoint(point))) {
                visibleMarkers.push({
                    ...point,
                    originalIndex: i,
                    isStartEnd: i === 0 || i === pointsData.length - 1
                });
            }
        }
    }

    return visibleMarkers;
};

const calculateDrawnRouteDistance = () => {
    let totalDistance = 0;
    for (let i = 0; i < drawnRoute.value.length - 1; i++) {
        const startPoint = drawnRoute.value[i];
        const endPoint = drawnRoute.value[i + 1];
        totalDistance += calculateDistance(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
    }
    return totalDistance;
};

const calculateInterpolatedRouteDistance = () => {
    let totalDistance = 0;
    for (let i = 0; i < interpolatedPoints.value.length - 1; i++) {
        const startPoint = interpolatedPoints.value[i];
        const endPoint = interpolatedPoints.value[i + 1];
        totalDistance += calculateDistance(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
    }
    return totalDistance;
};

const legendExpanded = ref(false);
const toggleLegend = () => {
    legendExpanded.value = !legendExpanded.value;
};

// Routes section toggle
const routesExpanded = ref(false);
const toggleRoutes = () => {
    routesExpanded.value = !routesExpanded.value;
};

const fitMapToInterpolatedPoints = () => {
    if (!mapRef.value || !mapRef.value.leafletObject || interpolatedPoints.value.length === 0) return;

    const allPoints = [];
    interpolatedPoints.value.forEach(point => {
        allPoints.push([point.lat, point.lng]);
    });

    if (allPoints.length > 0) {
        try {
            const bounds = allPoints;
            mapRef.value.leafletObject.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 18
            });
        } catch (e) {
            console.warn('Error fitting map to interpolated points:', e);
        }
    }
};

const saveNewRoute = async () => {
    if (!newRouteName.value.trim()) return;

    setGlobalLoading(true);
    try {
        // Prepare route data
        const firstPoint = interpolatedPoints.value[0];
        const firstPointData = JSON.parse(firstPoint.data);
        let firstPointAddress = "";
        if (firstPointData.roadAddress) {
            firstPointAddress = firstPointData.roadAddress;
        }

        if (firstPointData.primaryRoadAddress) {
            firstPointAddress = firstPointData.primaryRoadAddress;
        }

        const lastPoint = interpolatedPoints.value[interpolatedPoints.value.length - 1];
        const lastPointData = JSON.parse(lastPoint.data);
        let lastPointAddress = "";
        if (lastPointData.roadAddress) {
            lastPointAddress = lastPointData.roadAddress;
        }

        if (lastPointData.primaryRoadAddress) {
            lastPointAddress = lastPointData.primaryRoadAddress;
        }

        const routeData = {
            Distance: calculateInterpolatedRouteDistance(),
            Points: interpolatedPoints.value.filter(point => point.type !== 'route_point').length,
            Title: newRouteName.value.trim(),
            Note: newRouteNotes.value.trim(),
            Start: firstPointAddress,
            End: lastPointAddress,
            PlannedRouteId: -1,
            PointsData: interpolatedPoints.value.map((point) => {
                return {
                    Lat: point.lat,
                    Lng: point.lng,
                    Alt: point.alt,
                    Head: point.head,
                    Distance: point.pathDistance,
                    Type: point.type,
                    Data: point.data,
                    DateAdded: new Date().toISOString(),
                };
            }),
        };

        // console.log('Route data:', routeData);

        const res = await RoutesController.addRoute(routeData);
        if (res.result) {
            showMessage({
                status: 'success',
                message: t('routeSavedSuccessfully')
            });

            // Close modal and reset
            showSaveModal.value = false;
            newRouteName.value = '';
            newRouteNotes.value = '';

            // Show message that drawing mode is disabled
            // showMessage({ status: 'info', message: t('drawingModeDisabled') });

            // clearDrawnRoute();

            goBack();
        } else {
            showMessage({
                status: 'error',
                message: t('errorSavingRoute')
            });
        }

    } catch (error) {
        console.error('Error saving route:', error);
        showMessage({
            status: 'error',
            message: t('errorSavingRoute')
        });
    } finally {
        setGlobalLoading(false);
    }
};

const cancelSaveRoute = () => {
    showSaveModal.value = false;
    newRouteName.value = '';
    newRouteNotes.value = '';
    // Don't restart drawing mode - user needs to manually restart if needed
    showMessage({ status: 'info', message: t('drawingModeDisabled') });
};

// Handle escape key and click outside
const handleModalKeydown = (event) => {
    if (event.key === 'Escape' && showSaveModal.value) {
        cancelSaveRoute();
    }
};

const handleModalOverlayClick = (event) => {
    if (event.target.classList.contains('modal-overlay')) {
        cancelSaveRoute();
    }
};

// Handle keyboard shortcuts for undo/redo
const handleKeydown = (event) => {
    // Only handle shortcuts when not in a modal and drawing mode is active
    if (showSaveModal.value || !drawingMode.value) return;

    if (event.ctrlKey || event.metaKey) { // Ctrl on Windows/Linux, Cmd on Mac
        if (event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            if (canUndo.value) {
                undoDrawing();
            }
        } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
            event.preventDefault();
            if (canRedo.value) {
                redoDrawing();
            }
        }
    }
};

const showSaveDialog = () => {
    showSaveModal.value = true;
    newRouteName.value = `Interpolated Route ${new Date().toLocaleDateString()}`;
    newRouteNotes.value = `Created from ${interpolatedPoints.value.length} interpolated points using ${interpolationThreshold.value}m threshold`;
};

// Watch for drawing mode changes to refresh cursor radius
watch(drawingMode, (newValue, oldValue) => {
    console.log('Drawing mode changed:', oldValue, '->', newValue);
    refreshRadius();
});

// Watch for threshold changes to update radius
watch(interpolationThreshold, (newValue, oldValue) => {
    console.log('Threshold changed:', oldValue, '->', newValue);
    refreshRadius();
});

onMounted(() => {
    // loadSelectedRoutes();

    // Add keyboard event listener for undo/redo shortcuts
    document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
    // Cleanup cursor radius
    cleanupRadius();

    // Clean up map and layers
    if (mapRef.value) {
        try {
            // Clear all layers before removing the map
            if (mapRef.value.leafletObject) {
                mapRef.value.leafletObject.eachLayer((layer) => {
                    if (layer && typeof layer.remove === 'function') {
                        try {
                            layer.remove();
                        } catch (e) {
                            console.warn('Error removing layer:', e);
                        }
                    }
                });
            }
            mapRef.value.remove();
        } catch (e) {
            console.warn('Error cleaning up map:', e);
        }
    }
});
</script>

<style scoped>
.route-filter-view {
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;

    /* background: var(--bg-base); */
    gap: 1rem;
    padding: 1rem;
}

/* Main Panel */
.main-panel {
    margin-bottom: 0;
    overflow: visible;
}

.main-panel :deep(.base-panel__header) {
    padding: 1.25rem;
    overflow: visible;
}

.main-panel :deep(.base-panel__actions-view) {
    padding: 0;
    overflow: visible;
    min-height: auto;
}

.main-panel :deep(.base-panel__content) {
    padding: 1.25rem;
    overflow: visible;
    min-height: auto;
}

.main-panel :deep(.base-panel__body) {
    overflow: visible;
}

/* Ensure routes section is not constrained by panel */
.main-panel :deep(.base-panel__content) {
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
}

.main-panel :deep(.base-panel__content) .routes-section {
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
    position: relative !important;
}

.main-panel :deep(.base-panel__content) .routes-grid {
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
}

.actions-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
}

.action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    width: 100%;
    flex-wrap: wrap;
    min-height: auto;
}

.action-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    min-width: 0;
}

.threshold-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg-elevated);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-lg);

    /* border: 1px solid var(--border); */
}

.threshold-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    white-space: nowrap;
}

.threshold-input {
    width: 70px;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    background: var(--bg-surface);
    color: var(--text-primary);
    text-align: center;
    transition: border-color 0.2s ease;
}

.threshold-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgb(0 167 225 / 25%);
}

.threshold-unit {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 600;
}

.threshold-presets {
    display: flex;
    gap: 0.5rem;
    margin-left: 0.5rem;
}

.preset-active {
    background-color: var(--accent) !important;
    color: white !important;
    border-color: var(--accent) !important;
}

.threshold-help {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

/* Routes Section */
.routes-section {
    margin-top: 1.5rem;

    /* border-top: 1px solid var(--border); */
    padding: 1.5rem 0;
    overflow: visible;
    max-height: none;
    min-height: 200px;
}

/* Routes List */
.routes-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    overflow: visible;
    max-height: none;
    min-height: auto;
    width: 100%;
}

.route-list-item {
    width: 100%;
}

.route-color-indicator {
    width: 4px;
    height: 40px;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
}

.route-notes {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-style: italic;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.route-notes i {
    margin-top: 0.125rem;
    color: var(--text-muted);
}

/* Special route types */
.drawing-route {
    border-left: 4px solid #ff1493;
}

.interpolated-route {
    border-left: 4px solid #4ecdc4;
}

/* Map Section */
.map-section {
    margin-top: 1.5rem;

    /* border-top: 1px solid var(--border); */
    padding-top: 1.5rem;
    overflow: visible;
}

.map-section .map-container {
    height: 500px;
    width: 100%;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--bg-surface);
}

.map-section .map-container :deep(.leaflet-container) {
    height: 100%;
    width: 100%;
    border-radius: var(--radius-lg);
}

.no-routes {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
}



.drawing-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.drawing-mode-active {
    background-color: var(--accent) !important;
    color: white !important;
}

/* Map Container */
.map-container {
    flex: 1;
    position: relative;
    min-height: 400px;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%);
}

.map-container:focus {
    outline: none;
}

/* Override for map inside panel */
.map-section .map-container {
    height: 500px !important;
    min-height: 500px !important;
    flex: none;
}

.l-map {
    height: 100% !important;
    width: 100% !important;
}

/* Ensure map renders properly inside panel */
.map-section .l-map {
    height: 500px !important;
    width: 100% !important;
}

.l-map:focus {
    outline: none;
}

.drawing-mode-active .l-map {
    outline: none;
    box-shadow: none;
}

/* Legend Card Styles */
.legend-card {
    margin-bottom: 1rem;
}

.legend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.legend-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--text-primary);
}

.legend-title i {
    color: var(--accent);
    font-size: 1.1rem;
}

.legend-toggle-icon {
    color: var(--text-secondary);
    font-size: 1rem;
    transition: transform 0.2s ease;
}

.legend-content {
    margin-top: 1rem;
}

.legend-section {
    margin-bottom: 1.5rem;
}

.legend-section h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.legend-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.legend-item-card {
    margin-bottom: 0.5rem;
}

.legend-item-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem;
}

.legend-color {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgb(0 0 0 / 20%);
    flex-shrink: 0;
    margin-top: 2px;
}

.legend-info {
    flex: 1;
    min-width: 0;
}

.legend-info .legend-title {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.legend-info .legend-title i {
    color: var(--accent);
    font-size: 0.9rem;
}

.legend-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.detail-item {
    color: var(--text-secondary);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.detail-item i {
    color: var(--accent);
    font-size: 0.8rem;
    width: 12px;
}

.legend-notes {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    padding: 0.5rem;
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--accent);
}

.legend-notes i {
    color: var(--accent);
    font-size: 0.8rem;
    margin-top: 1px;
}

/* Custom marker styles - following PlannedRouteMapRefactored structure */
.custom-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;

    /* Circular instead of teardrop */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333B56;
    font-weight: bold;
    font-size: 12px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
    border: 2px solid #333B56;
    background-color: #f8f9fa;

    /* Light gray background */
}

/* Start and end point markers - solid dark blue */
.custom-icon.start-end {
    background-color: #333B56 !important;

    /* Solid dark blue background */
    border: 1px solid #333B56 !important;
    color: white !important;
    width: 32px !important;
    height: 32px !important;
}

.custom-icon.start-end img {
    filter: brightness(0) invert(1);

    /* Make the image white */
}

/* Survey point markers */
.custom-icon.survey-point {
    background-color: #f8f9fa !important;

    /* Light gray background */
    border: 1px solid #333B56 !important;

    /* Dark blue border */
    color: #333B56 !important;
}

.custom-icon.survey-point img {
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
    background: transparent !important;
}

.custom-icon i {
    color: #333B56;
    font-size: 12px;
    position: relative;
    z-index: 1;
}

.transparent-marker {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

.transparent-marker img {
    background: transparent !important;
}

/* Override Leaflet's default marker styling using :deep() like PlannedRouteMapRefactored */
:deep(.leaflet-marker-icon) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

:deep(.leaflet-marker-shadow) {
    display: none !important;
}

/* Additional comprehensive overrides */
:deep(.leaflet-marker) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

:deep(.leaflet-marker-icon),
:deep(.leaflet-marker-shadow),
:deep(.leaflet-marker-icon::before),
:deep(.leaflet-marker-icon::after) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

:deep(.leaflet-marker div),
:deep(.leaflet-marker-icon div) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

:deep(.leaflet-marker *),
:deep(.leaflet-marker-icon *) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

/* Target any potential white backgrounds */
:deep(.leaflet-marker-icon) img {
    background: transparent !important;
}

:deep(.leaflet-marker-icon) div {
    background: transparent !important;
}

/* Ensure our custom icons don't inherit any unwanted backgrounds */
.custom-icon {
    background-color: #f8f9fa !important;

    /* Light gray background */
    border-radius: 50% !important;

    /* Circular instead of teardrop */
    width: 30px !important;
    height: 30px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: #333B56 !important;
    font-weight: bold !important;
    font-size: 12px !important;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%) !important;
    border: 1px solid #333B56 !important;
}

/* Start and end point markers - solid dark blue */
.custom-icon.start-end {
    background-color: #333B56 !important;

    /* Solid dark blue background */
    border: 0.25px solid #333B56 !important;
    color: white !important;
    width: 32px !important;
    height: 32px !important;
}

.route-popup {
    padding: 0.5rem;
}

.route-popup h4 {
    margin: 0 0 0.5rem;
    color: var(--bs-body-color);
    font-size: 1.1rem;
}

.route-popup p {
    margin: 0.3rem 0;
    color: var(--bs-secondary-color);
    font-size: 0.9rem;
}



/* Drawn point markers */
.custom-icon.drawn-point {
    background-color: #ff1493 !important;
    border: 1px solid #ff1493 !important;
    color: white !important;
    width: 16px !important;
    height: 16px !important;
    font-size: 8px !important;
}

.custom-icon.drawn-point i {
    color: white !important;
    font-size: 8px !important;
}

/* Interpolated point markers */
.custom-icon.interpolated-point {
    background-color: #4ecdc4 !important;
    border: 2px solid #4ecdc4 !important;
    color: white !important;
    width: 30px !important;
    height: 30px !important;
    font-size: 12px !important;
    box-shadow: 0 2px 8px rgb(78 205 196 / 40%) !important;
}

.custom-icon.interpolated-point i {
    color: white !important;
    font-size: 12px !important;
}

.custom-icon.interpolated-point img {
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
    background: transparent !important;
}

.interpolated-popup {
    padding: 0.8rem;
}

.interpolated-popup h5 {
    margin: 0 0 0.5rem;
    color: var(--bs-body-color);
    font-size: 1rem;
    font-weight: 600;
}

.interpolated-popup p {
    margin: 0.3rem 0;
    color: var(--bs-secondary-color);
    font-size: 0.9rem;
}

/* Drawing mode active button */
.btn.active {
    background-color: var(--bs-primary) !important;
    color: white !important;
}

/* Responsive adjustments */
@media (width <= 768px) {
    .route-filter-view {
        padding: 0.75rem;
        gap: 0.75rem;
    }

    .actions-container {
        gap: 1rem;
    }

    .action-row {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
        justify-content: flex-start;
    }

    .action-group {
        justify-content: center;
        flex-wrap: wrap;
        width: 100%;
    }

    .threshold-control {
        justify-content: center;
        flex-wrap: wrap;
    }

    .threshold-presets {
        justify-content: center;
        margin-left: 0;
        flex-wrap: wrap;
    }

    .legend-item-content {
        padding: 0.75rem;
    }

    .save-route-modal {
        width: 95vw;
        max-width: none;
    }
}

/* Additional responsive adjustments for very small screens */
@media (width <= 480px) {
    .action-group {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }

    .threshold-control {
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .threshold-presets {
        flex-direction: column;
        align-items: center;
    }

    .routes-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    .route-card {
        border-radius: var(--radius-md);
    }

    .route-preview {
        padding: 0.75rem;
        gap: 0.75rem;
    }

    .route-title {
        font-size: 0.875rem;
    }

    .detail-item {
        font-size: 0.8rem;
    }
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.save-route-modal {
    max-width: 500px;
    width: 90vw;
    position: relative;
    z-index: 10000;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.875rem;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    font-size: 0.875rem;
    background: var(--bg-surface);
    color: var(--text-primary);
    transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgb(0 167 225 / 25%);
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

/* Cursor radius circle styling */
:deep(.cursor-radius-circle) {
    pointer-events: none !important;
    z-index: 500 !important;
}

:deep(.cursor-radius-circle path) {
    pointer-events: none !important;
    transition: opacity 0.2s ease-in-out;
}

/* Custom cursor radius overlay styling */
:deep(.cursor-radius-circle-overlay) {
    pointer-events: none !important;
    z-index: 1000 !important;
    transition: opacity 0.1s ease-in-out;
}

/* New styles for map-save-dialog */
.map-save-dialog {
    position: absolute;
    z-index: 9999;

    /* Ensure it's above all map layers */
    padding: var(--spacing-md);
    border-radius: var(--radius-xl);
    box-shadow: 0 8px 25px rgb(0 0 0 / 30%);
    border: 1px solid var(--bs-border-color);
    max-width: 350px;
    width: 90%;
    backdrop-filter: blur(10px);
    transform: translateY(-10px);

    /* Position slightly above */

    /* Add subtle background overlay */
    background: linear-gradient(135deg,
            var(--bs-body-bg) 0%,
            rgba(var(--bs-body-bg-rgb), 0.95) 100%);
}

.save-dialog-content {
    padding: 10px;
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid var(--bs-border-color);
    padding-bottom: 10px;
}

.dialog-header h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--bs-body-color);
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
    padding-top: 10px;

    /* border-top: 1px solid var(--bs-border-color); */
}

.dialog-actions .btn {
    padding: var(--spacing-xs) 15px;
    font-size: 0.9rem;
    border-radius: var(--radius-md);
    transition: all 0.2s;
}

.dialog-actions .btn-secondary {
    background: var(--bs-tertiary-bg);
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
}

.dialog-actions .btn-secondary:hover {
    background: var(--bs-secondary-bg);
}

.dialog-actions .btn-primary {
    background: var(--bs-primary);
    color: white;
    border: 1px solid var(--bs-primary);
}

.dialog-actions .btn-primary:hover {
    background: var(--bs-primary-dark);
}

.dialog-actions .btn-primary:disabled {
    background: var(--bs-secondary-color);
    border-color: var(--bs-secondary-color);
    opacity: 0.6;
    cursor: not-allowed;
}
</style>