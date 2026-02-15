<template>
    <div class="route-card-with-map" @click="viewRoute">
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

                    <!-- Route Points Markers -->
                    <template v-if="routePoints.length > 0">
                        <l-marker v-for="(point, index) in routePoints" :key="`${point.id || index}-${index}`"
                            :lat-lng="[point.lat, point.lng]">
                            <l-icon :icon-anchor="[10, 20]" :icon-size="[16, 16]">
                                <div class="custom-icon" :class="getPointIconClass(point, index)">
                                    <span class="marker-label">{{ getPointLabel(point, index) }}</span>
                                </div>
                            </l-icon>
                        </l-marker>
                    </template>

                    <!-- Fallback: Start and End Markers (if no route points) -->
                    <template v-else>
                        <l-marker v-if="startPoint" :lat-lng="startPoint">
                            <l-icon :icon-anchor="[10, 20]" :icon-size="[20, 20]">
                                <div class="custom-icon start-icon">
                                    <span class="marker-label">S</span>
                                </div>
                            </l-icon>
                        </l-marker>

                        <l-marker v-if="endPoint" :lat-lng="endPoint">
                            <l-icon :icon-anchor="[10, 20]" :icon-size="[20, 20]">
                                <div class="custom-icon end-icon">
                                    <span class="marker-label">E</span>
                                </div>
                            </l-icon>
                        </l-marker>
                    </template>
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

        <br />
        <br />
        <br />
        <br />


        <!-- Route Footer -->
        <div class="route-footer-container">
            <!-- Edit Button -->
            <div class="edit-description-section">
                <button class="edit-description-btn" @click.stop="$emit('editRoute', route.id)" title="Edit Route">
                    <i class="bi bi-pencil-square"></i>
                    <span>Edit</span>
                </button>
            </div>
            <div class="route-footer">
                <div class="client-info">
                    <div class="client-avatar">{{ getClientInitial(route.client) }}</div>
                    <span class="client-name">{{ route.client }}</span>
                </div>
                <div class="route-meta">
                    <span class="update-date">{{ formatDate(route.updatedAt) }}</span>
                    <div class="action-buttons">
                        <button class="remove-btn" @click.stop="$emit('removeRoute', route.id)" title="Remove Route">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { LMap, LTileLayer, LMarker, LPolyline, LIcon } from '@vue-leaflet/vue-leaflet';
import { normalizeRoutePoints } from '@/utils/routeDataNormalizer';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
    route: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['editRoute', 'removeRoute']);

// Methods
const viewRoute = () => {
    // Navigate to view-only route page
    window.location.href = `/routes/${props.route.id}/view`;
};

// Map state
const mapRef = ref(null);
const mapLoaded = ref(false);
const zoom = ref(13);
const minZoom = ref(3);
const maxZoom = ref(18);
const tileLayerUrl = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

// Route data
const routePath = ref([]);
const routePoints = ref([]);
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

const getPointIconClass = (point, index) => {
    // Determine icon class based on point type or position
    if (point.type) {
        switch (point.type) {
            case 'start':
                return 'start-icon';
            case 'end':
                return 'end-icon';
            case 'bridge':
                return 'bridge-icon';
            case 'intersection':
                return 'intersection-icon';
            case 'overhead':
                return 'overhead-icon';
            case 'powerline':
                return 'powerline-icon';
            case 'road':
                return 'road-icon';
            default:
                return 'default-icon';
        }
    }

    // Fallback: use position-based logic
    if (index === 0) return 'start-icon';
    if (index === routePoints.value.length - 1) return 'end-icon';
    return 'default-icon';
};

const getPointLabel = (point, index) => {
    // Determine label based on point type or position
    if (point.type) {
        switch (point.type) {
            case 'start':
                return 'S';
            case 'end':
                return 'E';
            case 'bridge':
                return 'B';
            case 'intersection':
                return 'I';
            case 'overhead':
                return 'O';
            case 'powerline':
                return 'P';
            case 'road':
                return 'R';
            default:
                return index + 1;
        }
    }

    // Fallback: use position-based logic
    if (index === 0) return 'S';
    if (index === routePoints.value.length - 1) return 'E';
    return index + 1;
};

const initializeMap = () => {
    try {
        console.log('Initializing map for regular survey route:', props.route.id);

        // Extract route points from real data
        const extractedPoints = extractRoutePoints(props.route);
        console.log('Extracted route points:', extractedPoints);

        if (extractedPoints.length > 0) {
            // Set route points for markers
            routePoints.value = extractedPoints;

            // Set route path for polyline
            routePath.value = extractedPoints.map(point => [point.lat, point.lng]);

            // Set start and end points for fallback
            startPoint.value = [extractedPoints[0].lat, extractedPoints[0].lng];
            endPoint.value = [extractedPoints[extractedPoints.length - 1].lat, extractedPoints[extractedPoints.length - 1].lng];

            // Calculate map center
            const centerLat = (extractedPoints[0].lat + extractedPoints[extractedPoints.length - 1].lat) / 2;
            const centerLng = (extractedPoints[0].lng + extractedPoints[extractedPoints.length - 1].lng) / 2;
            mapCenter.value = [centerLat, centerLng];
        } else {
            // No route data, use default
            routePoints.value = [];
            routePath.value = [];
            startPoint.value = null;
            endPoint.value = null;
            mapCenter.value = [30.0444, 31.2357];
        }

        mapLoaded.value = true;
        console.log('Map initialization completed');
    } catch (error) {
        console.error('Error initializing map:', error);
        mapLoaded.value = true; // Show placeholder even if map fails
    }
};

const onMapReady = () => {
    console.log('Map is ready');
    if (mapRef.value && routePath.value.length > 0) {
        // Fit map to route bounds
        nextTick(() => {
            try {
                const map = mapRef.value.leafletObject;
                if (map && routePath.value.length > 0) {
                    const bounds = L.latLngBounds(routePath.value);
                    map.fitBounds(bounds, { padding: [10, 10], maxZoom: 15 });
                }
            } catch (error) {
                console.warn('Error fitting bounds:', error);
            }
        });
    }
};

const extractRoutePoints = (route) => {
    console.log('Extracting route points for regular survey:', route);

    // For regular surveys, the route data structure is different
    // Check if we have pointsData directly on the route object
    if (route.pointsData && Array.isArray(route.pointsData) && route.pointsData.length > 0) {
        console.log('Using pointsData from route:', route.pointsData.length, 'points');
        return normalizeRoutePoints(route.pointsData).map(point => ({
            id: point.id || `point_${Math.random()}`,
            lat: point.lat,
            lng: point.lng,
            type: point.type || 'default',
            alt: point.alt || 0
        }));
    }

    // Check if we have RouteData with pointsData
    if (route.RouteData) {
        try {
            const routeData = typeof route.RouteData === 'string' ? JSON.parse(route.RouteData) : route.RouteData;
            console.log('Route data for regular survey:', routeData);

            // Check if we have pointsData (like in RouteViewer)
            if (routeData.pointsData && Array.isArray(routeData.pointsData) && routeData.pointsData.length > 0) {
                console.log('Using pointsData from RouteData:', routeData.pointsData.length, 'points');
                return normalizeRoutePoints(routeData.pointsData).map(point => ({
                    id: point.id || `point_${Math.random()}`,
                    lat: point.lat,
                    lng: point.lng,
                    type: point.type || 'default',
                    alt: point.alt || 0
                }));
            }
        } catch (e) {
            console.warn('Error parsing route data:', e);
        }
    }

    return [];
};

// Watch for route changes
watch(() => props.route, (newRoute) => {
    if (newRoute) {
        console.log('Route changed, reinitializing map');
        initializeMap();
    }
}, { deep: true });

// Lifecycle
onMounted(() => {
    console.log('Component mounted, initializing map for regular survey route:', props.route);
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
    cursor: pointer;
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
    text-align: left;
}

.mini-map-container {
    height: 100px;
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

.edit-description-section {
    margin-bottom: 0.75rem;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.edit-description-btn {
    background: var(--bs-primary);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    justify-content: center;
}

.edit-description-btn:hover {
    background: var(--bs-primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(var(--bs-primary-rgb), 0.3);
}

.edit-description-btn i {
    font-size: 0.9rem;
}

.route-footer-container {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-top: 1px solid var(--bs-border-color);
    padding-top: 0.75rem;
}

.route-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

.action-buttons {
    display: flex;
    gap: 0.2rem;
    align-items: center;
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

.remove-btn {
    /* background: var(--bs-danger); */

    /* border: 1px solid var(--bs-danger); */
    color: var(--bs-danger);
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 3px;
    transition: all 0.2s;
    font-size: 1.2rem;
}

.remove-btn:hover {
    background: #c82333;
    border-color: #c82333;
    color: white;
}

/* Custom marker styles */
.custom-icon {
    width: 16px;
    height: 16px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 8px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
    border: 2px solid #fff;
}

.custom-icon.start-icon {
    background: var(--success);
}

.custom-icon.end-icon {
    background: var(--error);
}

.custom-icon.bridge-icon {
    background: #6f42c1;
}

.custom-icon.intersection-icon {
    background: #fd7e14;
}

.custom-icon.overhead-icon {
    background: #20c997;
}

.custom-icon.powerline-icon {
    background: var(--warning);
    color: #000;
}

.custom-icon.road-icon {
    background: #6c757d;
}

.custom-icon.default-icon {
    background: var(--accent);
}

.custom-icon .marker-label {
    transform: rotate(45deg);
    font-size: 8px;
    font-weight: bold;
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
        height: 80px;
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
        height: 70px;
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
