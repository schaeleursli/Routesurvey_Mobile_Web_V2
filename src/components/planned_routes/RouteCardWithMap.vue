<template>
    <div class="route-card-with-map">
        <!-- Route Status Badge -->
        <div class="route-status">
            <span class="status-badge" :class="getStatusClass(route.status)">
                {{ route.status }}
            </span>
        </div>

        <!-- Route Title -->
        <h3 class="route-title">{{ route.name }}</h3>

        <!-- Mini Map -->
        <div class="mini-map-container">
            <div class="map-placeholder" v-if="!mapLoaded">
                <div class="loading-spinner"></div>
                <span>Loading map...</span>
            </div>
            <div v-else class="mini-map">
                <l-map ref="mapRef" :zoom="zoom" :center="mapCenter" :use-global-leaflet="false" :min-zoom="minZoom"
                    :max-zoom="maxZoom" @ready="onMapReady"
                    :options="{ zoomControl: false, dragging: false, touchZoom: false, doubleClickZoom: false, scrollWheelZoom: false, boxZoom: false, keyboard: false }">

                    <l-tile-layer :url="tileLayerUrl" layer-type="base" />

                    <!-- Route Path -->
                    <l-polyline v-if="routePath.length > 1" :lat-lngs="routePath" :color="'#333B56'" :weight="4"
                        :opacity="0.8" />

                    <!-- Start Marker -->
                    <l-marker v-if="startPoint" :lat-lng="startPoint">
                        <l-icon :icon-anchor="[16, 32]" :icon-size="[32, 32]">
                            <div class="custom-icon start-icon">
                                <span class="marker-label">S</span>
                            </div>
                        </l-icon>
                    </l-marker>

                    <!-- End Marker -->
                    <l-marker v-if="endPoint" :lat-lng="endPoint">
                        <l-icon :icon-anchor="[16, 32]" :icon-size="[32, 32]">
                            <div class="custom-icon end-icon">
                                <span class="marker-label">E</span>
                            </div>
                        </l-icon>
                    </l-marker>

                    <!-- Waypoint Markers -->
                    <l-marker v-for="(waypoint, index) in waypoints" :key="`waypoint-${index}`"
                        :lat-lng="{ lat: waypoint.lat, lng: waypoint.lng }">
                        <l-icon :icon-anchor="[12, 24]" :icon-size="[24, 24]">
                            <div class="custom-icon waypoint-icon">
                                <i class="bi bi-geo-alt-fill"></i>
                            </div>
                        </l-icon>
                    </l-marker>

                    <!-- POI Markers -->
                    <l-marker v-for="(poi, index) in pois" :key="`poi-${index}`"
                        :lat-lng="{ lat: poi.lat, lng: poi.lng }">
                        <l-icon :icon-anchor="[12, 24]" :icon-size="[24, 24]">
                            <div class="custom-icon poi-icon">
                                <i :class="getPoiIcon(poi.type)"></i>
                            </div>
                        </l-icon>
                    </l-marker>
                </l-map>
            </div>
        </div>

        <!-- Route Details -->
        <div class="route-details">
            <div class="detail-item">
                <i class="bi bi-geo-alt-fill start-icon"></i>
                <span class="detail-text">{{ route.startLocation }}</span>
            </div>
            <div class="detail-item">
                <i class="bi bi-geo-alt-fill end-icon"></i>
                <span class="detail-text">{{ route.endLocation }}</span>
            </div>
            <div class="detail-item">
                <i class="bi bi-rulers"></i>
                <span class="detail-text">{{ route.distance }}</span>
            </div>
            <div class="detail-item">
                <i class="bi bi-truck"></i>
                <span class="detail-text">{{ route.vehicleType }}</span>
            </div>
        </div>

        <!-- Route Description -->
        <div class="route-description">
            {{ route.description }}
        </div>


        <!-- Route Footer -->
        <div class="route-footer">
            <div class="client-info">
                <div class="client-avatar">{{ getClientInitial(route.client) }}</div>
                <span class="client-name">{{ route.client }}</span>
            </div>
            <div class="route-meta">
                <span class="update-date">{{ formatDate(route.updatedAt) }}</span>
                <button class="edit-btn" @click="$emit('editRoute', route.id)" title="Edit Route">
                    <i class="bi bi-pencil"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { LMap, LTileLayer, LMarker, LPolyline, LIcon } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import '@/utils/leaflet-icon-fix';

const props = defineProps({
    route: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['editRoute']);

// Map state
const mapRef = ref(null);
const mapLoaded = ref(false);
const zoom = ref(13);
const minZoom = ref(3);
const maxZoom = ref(18);
const tileLayerUrl = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

// Route data
const routePath = ref([]);
const waypoints = ref([]);
const pois = ref([]);
const startPoint = ref(null);
const endPoint = ref(null);
const mapCenter = ref([30.0444, 31.2357]); // Default center (Cairo)

// Methods
const getStatusClass = (status) => {
    const statusMap = {
        'Planned': 'status-planned',
        'In Progress': 'status-progress',
        'Completed': 'status-completed',
        'Reported': 'status-reported'
    };
    return statusMap[status] || 'status-default';
};

const getClientInitial = (client) => {
    return client.charAt(0).toUpperCase();
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const getPoiIcon = (type) => {
    const iconMap = {
        info: 'bi bi-info-circle-fill',
        warning: 'bi bi-exclamation-triangle-fill',
        danger: 'bi bi-exclamation-octagon-fill',
        fuel: 'bi bi-fuel-pump-fill',
        rest: 'bi bi-house-fill',
        food: 'bi bi-cup-hot-fill',
        hospital: 'bi bi-hospital-fill',
        police: 'bi bi-shield-fill'
    };
    return iconMap[type] || 'bi bi-geo-alt-fill';
};


const initializeMap = () => {
    try {
        console.log('Initializing map for route:', props.route.id);

        // Extract route data from real data
        const routeData = extractRouteData(props.route);
        console.log('Extracted route data:', routeData);

        if (routeData.startPoint && routeData.endPoint) {
            // Set start and end points
            startPoint.value = [routeData.startPoint.lat, routeData.startPoint.lng];
            endPoint.value = [routeData.endPoint.lat, routeData.endPoint.lng];

            // Set waypoints (excluding start and end)
            waypoints.value = routeData.waypoints || [];

            // Set POIs
            pois.value = routeData.pois || [];

            // Set route path for polyline
            routePath.value = routeData.routePath || [];

            // Calculate map center
            const centerLat = (routeData.startPoint.lat + routeData.endPoint.lat) / 2;
            const centerLng = (routeData.startPoint.lng + routeData.endPoint.lng) / 2;
            mapCenter.value = [centerLat, centerLng];
        } else {
            // No route data, use default
            waypoints.value = [];
            routePath.value = [];
            startPoint.value = null;
            endPoint.value = null;
            mapCenter.value = [30.0444, 31.2357];
        }

        mapLoaded.value = true;
        console.log('Map initialization completed');

        // Center map to route after data is loaded
        nextTick(() => {
            centerMapToRoute();
        });
    } catch (error) {
        console.error('Error initializing map:', error);
        mapLoaded.value = true; // Show placeholder even if map fails
    }
};

const onMapReady = () => {
    console.log('Map is ready');
    if (mapRef.value) {
        // Fit map to route bounds using all points (start, end, waypoints, route path)
        nextTick(() => {
            try {
                const map = mapRef.value.leafletObject;
                if (map) {
                    centerMapToRoute();
                }
            } catch (error) {
                console.warn('Error fitting bounds:', error);
            }
        });
    }
};

const centerMapToRoute = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
        const points = [];

        // Add start and end points
        if (startPoint.value) points.push(startPoint.value);
        if (endPoint.value) points.push(endPoint.value);

        // Add waypoints
        waypoints.value.forEach((waypoint) => {
            points.push([waypoint.lat, waypoint.lng]);
        });

        // Add route path points (sampled to avoid too many points)
        if (routePath.value && routePath.value.length > 0) {
            const step = Math.max(1, Math.floor(routePath.value.length / 20)); // Include ~20 points from the route
            for (let i = 0; i < routePath.value.length; i += step) {
                points.push(routePath.value[i]);
            }
            // Always include the last point of the route
            if (routePath.value.length > 0) {
                points.push(routePath.value[routePath.value.length - 1]);
            }
        }

        if (points.length > 0) {
            try {
                // console.log("Fitting bounds to points:", points.length, "points");
                mapRef.value.leafletObject.fitBounds(points, { padding: [10, 10], maxZoom: 15 });
            } catch (error) {
                console.warn("Error fitting bounds:", error);
            }
        }
    }
};

const extractRouteData = (route) => {
    console.log('Extracting route data for route:', route);

    // Try to use real route data if available
    if (route.RouteData) {
        try {
            const routeData = typeof route.RouteData === 'string' ? JSON.parse(route.RouteData) : route.RouteData;
            console.log('Parsed route data:', routeData);

            // Extract waypoints, route path, and POIs from RouteData
            const waypoints = routeData.waypoints || [];
            const routePath = routeData.routePath || [];
            const pois = routeData.pois || [];

            // Extract start and end points from the main route object
            // These might be stored as coordinates or as location objects
            let startPoint = null;
            let endPoint = null;

            // Try to extract coordinates from SurveyStart and SurveyEnd
            if (route.SurveyStart) {
                if (typeof route.SurveyStart === 'string') {
                    // If it's a string, we need to geocode it or use fallback
                    console.log('SurveyStart is string:', route.SurveyStart);
                } else if (route.SurveyStart.lat && route.SurveyStart.lng) {
                    startPoint = { lat: route.SurveyStart.lat, lng: route.SurveyStart.lng };
                }
            }

            if (route.SurveyEnd) {
                if (typeof route.SurveyEnd === 'string') {
                    // If it's a string, we need to geocode it or use fallback
                    console.log('SurveyEnd is string:', route.SurveyEnd);
                } else if (route.SurveyEnd.lat && route.SurveyEnd.lng) {
                    endPoint = { lat: route.SurveyEnd.lat, lng: route.SurveyEnd.lng };
                }
            }

            // If we have route path but no start/end points, extract them from the path
            if (routePath.length > 0 && (!startPoint || !endPoint)) {
                if (!startPoint && routePath.length > 0) {
                    startPoint = { lat: routePath[0][0], lng: routePath[0][1] };
                }
                if (!endPoint && routePath.length > 0) {
                    endPoint = { lat: routePath[routePath.length - 1][0], lng: routePath[routePath.length - 1][1] };
                }
            }

            console.log('Extracted points:', { startPoint, endPoint, waypoints: waypoints.length, routePath: routePath.length });

            return {
                startPoint,
                endPoint,
                waypoints,
                routePath,
                pois
            };
        } catch (e) {
            console.warn('Error parsing route data:', e);
        }
    }

    // Fallback: Generate sample route data
    console.log('Using fallback route generation for route:', route.id);
    const seed = (route.id || 1) * 0.1;
    const startLat = 30.0444 + Math.sin(seed) * 0.1;
    const startLng = 31.2357 + Math.cos(seed) * 0.1;
    const endLat = startLat + Math.sin(seed * 2) * 0.05;
    const endLng = startLng + Math.cos(seed * 2) * 0.05;

    // Generate intermediate waypoints
    const numWaypoints = 3;
    const waypoints = [];
    for (let i = 1; i <= numWaypoints; i++) {
        const t = i / (numWaypoints + 1);
        const lat = startLat + (endLat - startLat) * t + Math.sin(t * Math.PI * 2) * 0.01;
        const lng = startLng + (endLng - startLng) * t + Math.cos(t * Math.PI * 2) * 0.01;
        waypoints.push({
            lat: lat,
            lng: lng
        });
    }

    // Generate route path
    const routePath = [];
    const numPathPoints = 20;
    for (let i = 0; i <= numPathPoints; i++) {
        const t = i / numPathPoints;
        const lat = startLat + (endLat - startLat) * t + Math.sin(t * Math.PI) * 0.01;
        const lng = startLng + (endLng - startLng) * t + Math.cos(t * Math.PI) * 0.01;
        routePath.push([lat, lng]);
    }

    return {
        startPoint: { lat: startLat, lng: startLng },
        endPoint: { lat: endLat, lng: endLng },
        waypoints,
        routePath
    };
};


// Watch for route changes
watch(() => props.route, (newRoute) => {
    if (newRoute) {
        console.log('Route changed, reinitializing map');
        initializeMap();
    }
}, { deep: true });

// Watch for route data changes to re-center map
watch([startPoint, endPoint, waypoints, routePath], () => {
    if (mapLoaded.value && mapRef.value) {
        nextTick(() => {
            centerMapToRoute();
        });
    }
}, { deep: true });

// Lifecycle
onMounted(() => {
    console.log('Component mounted, initializing map for route:', props.route);
    initializeMap();
});

onUnmounted(() => {
    console.log('Component unmounting');
    // Clean up any resources if needed
});
</script>

<style scoped>
.route-card-with-map {
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.route-card-with-map:hover {
    box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
    transform: translateY(-2px);
}

.route-status {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 10;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-planned {
    background: #e3f2fd;
    color: #1976d2;
}

.status-progress {
    background: #fff3e0;
    color: #f57c00;
}

.status-completed {
    background: #e8f5e8;
    color: #2e7d32;
}

.status-reported {
    background: #f3e5f5;
    color: #7b1fa2;
}

.route-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--bs-body-color);
    margin: 0 0 0.75rem;
    padding-right: 3.5rem;
    line-height: 1.3;
}

.mini-map-container {
    height: 150px;
    margin-bottom: 0.75rem;
    border-radius: 6px;
    overflow: hidden;
    background: var(--bs-tertiary-bg);
    position: relative;
}

.map-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--bs-secondary);
    gap: 0.5rem;
}

.map-placeholder .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--bs-border-color);
    border-top: 3px solid var(--bs-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.mini-map {
    height: 100%;
    width: 100%;
}

.route-details {
    margin-bottom: 0.75rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
    color: var(--bs-body-color);
}

.start-icon {
    color: var(--success);
}

.end-icon {
    color: var(--error);
}

.detail-text {
    font-weight: 500;
}

.route-description {
    font-size: 0.85rem;
    color: var(--bs-secondary);
    line-height: 1.3;
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    background: var(--bs-tertiary-bg);
    border-radius: 4px;
    flex-grow: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}


.route-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bs-border-color);
    margin-top: auto;
}

.client-info {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.client-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--bs-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
}

.client-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--bs-body-color);
}

.route-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.update-date {
    font-size: 0.75rem;
    color: var(--bs-secondary);
}

.edit-btn {
    background: none;
    border: none;
    color: var(--bs-secondary);
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 3px;
    transition: all 0.2s;
    font-size: 0.8rem;
}

.edit-btn:hover {
    color: var(--bs-primary);
    background: var(--bs-tertiary-bg);
}

/* Custom marker styles - matching PlannedRouteMapRefactored */
.custom-icon {
    width: 24px;
    height: 24px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
    border: 2px solid #fff;
}

.start-icon {
    background: var(--success);
    width: 32px;
    height: 32px;
    font-size: 16px;
    font-weight: 900;
}

.end-icon {
    background: var(--error);
    width: 32px;
    height: 32px;
    font-size: 16px;
    font-weight: 900;
}

.waypoint-icon {
    background: var(--accent);
}

.poi-icon {
    background: #6f42c1;
}

.custom-icon i {
    color: white;
    font-size: 12px;
    transform: rotate(45deg);
    position: relative;
    z-index: 1;
}

.marker-label {
    color: white;
    font-size: 16px;
    font-weight: 900;
    transform: rotate(45deg);
    position: relative;
    z-index: 1;
    text-shadow: 1px 1px 2px rgb(0 0 0 / 50%);
}

/* Leaflet map styling */
:deep(.leaflet-container) {
    height: 100%;
    width: 100%;
    z-index: 1;
}

:deep(.leaflet-marker-icon) {
    background: transparent !important;
    border: none !important;
}

:deep(.leaflet-marker-shadow) {
    display: none !important;
}

/* Additional styling improvements */
.route-card-with-map {
    box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
    border: 1px solid var(--bs-border-color);
}

.route-card-with-map:hover {
    box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
    border-color: var(--bs-primary);
}

.mini-map-container {
    border: 1px solid var(--bs-border-color);
    box-shadow: inset 0 2px 4px rgb(0 0 0 / 6%);
}

.start-survey-btn {
    box-shadow: 0 2px 8px rgba(var(--bs-primary-rgb), 0.3);
    transition: all 0.2s;
}

.start-survey-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--bs-primary-rgb), 0.4);
}

.route-description {
    border-left: 3px solid var(--bs-primary);
    background: linear-gradient(135deg, var(--bs-tertiary-bg) 0%, var(--bs-body-bg) 100%);
}

.status-badge {
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
    font-weight: 700;
}

/* Responsive Design */
@media (width <= 768px) {
    .route-card-with-map {
        padding: 0.75rem;
    }

    .route-title {
        font-size: 1rem;
        margin-bottom: 0.5rem;
        padding-right: 3rem;
    }

    .mini-map-container {
        height: 120px;
        margin-bottom: 0.5rem;
    }

    .route-details {
        margin-bottom: 0.5rem;
    }

    .detail-item {
        font-size: 0.8rem;
        margin-bottom: 0.3rem;
    }

    .route-description {
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
        padding: 0.4rem;
    }

    .route-footer {
        padding-top: 0.5rem;
    }

    .client-avatar {
        width: 18px;
        height: 18px;
        font-size: 0.65rem;
    }

    .client-name {
        font-size: 0.75rem;
    }

    .update-date {
        font-size: 0.7rem;
    }

    .edit-btn {
        font-size: 0.75rem;
        padding: 0.15rem;
    }
}

@media (width <= 480px) {
    .route-card-with-map {
        padding: 0.5rem;
    }

    .route-title {
        font-size: 0.95rem;
        padding-right: 2.5rem;
    }

    .mini-map-container {
        height: 100px;
    }

    .route-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.3rem;
        margin-bottom: 0.5rem;
    }

    .detail-item {
        font-size: 0.75rem;
        margin-bottom: 0.2rem;
    }

    .route-description {
        font-size: 0.75rem;
        -webkit-line-clamp: 1;
        line-clamp: 1;
    }
}
</style>
