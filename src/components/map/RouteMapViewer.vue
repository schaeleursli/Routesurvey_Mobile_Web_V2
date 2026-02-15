<template>
    <div class="route-map-container">
        <div ref="mapWrapper" class="map-wrapper" style="width: 100%; height: 100%;">
            <MapLibreViewer
                v-if="useMapLibre"
                ref="mapRef"
                :route-points="routePoints"
                :map-style="mapStyle"
                :zoom="zoom"
                :center="mapCenter"
                @map-ready="onMapReady"
                @move-end="onMapMoveEnd"
                @click="onMapClick"
            />
             <div v-else ref="leafletMapRef" :id="mapId" class="leaflet-map" @click="hideContextMenu"></div>
        </div>

        <!-- Map Style Controls -->
        <div class="map-style-controls">
            <BaseButton :variant="mapStyle === 'standard' ? 'primary' : 'secondary'" size="small" @click="setMapStyle('standard')"
                left-icon="bi bi-map">
                Standard
            </BaseButton>
            <BaseButton :variant="mapStyle === 'dark' ? 'primary' : 'secondary'" size="small" @click="setMapStyle('dark')"
                left-icon="bi bi-moon">
                Dark
            </BaseButton>
             <BaseButton :variant="mapStyle === 'light' ? 'primary' : 'secondary'" size="small" @click="setMapStyle('light')"
                left-icon="bi bi-sun">
                Light
            </BaseButton>
            <BaseButton :variant="mapStyle === 'satellite' ? 'primary' : 'secondary'" size="small"
                @click="setMapStyle('satellite')" left-icon="bi bi-image">
                Satellite
            </BaseButton>
        </div>

        <!-- Map Controls -->
        <div class="map-controls">
            <BaseButton variant="secondary" size="small" @click="handleZoomIn" class="control-btn">
                <i class="bi bi-plus-lg"></i>
            </BaseButton>
            <BaseButton variant="secondary" size="small" @click="handleZoomOut" class="control-btn">
                <i class="bi bi-dash-lg"></i>
            </BaseButton>
            <BaseButton variant="secondary" size="small" @click="handleCenterMap" class="control-btn"
                left-icon="bi bi-geo-alt">
            </BaseButton>
        </div>

        <!-- Minimap -->
        <div class="minimap-container">
            <div ref="minimapRef" :id="minimapId" class="minimap-leaflet-map"></div>
        </div>

        <!-- Context Menu - moved outside map container -->
        <Teleport to="body">
            <div v-if="contextMenu.visible" class="context-menu" :style="{
                position: 'fixed',
                left: contextMenu.x + 'px',
                top: contextMenu.y + 'px',
                zIndex: 999999
            }" @click.stop>
                <div v-if="contextMenu.targetType === 'marker' && contextMenu.targetPoint?.type !== 'route_point'"
                    class="context-menu-item" @click="editPoint">
                    <i class="bi bi-pencil"></i> Edit Point
                </div>
                <div v-if="contextMenu.targetType === 'marker' && contextMenu.targetPoint?.type !== 'route_point'"
                    class="context-menu-item" @click="deletePoint">
                    <i class="bi bi-trash"></i> Delete Point
                </div>
                <div v-if="contextMenu.targetType === 'marker' && contextMenu.targetPoint?.type === 'route_point'"
                    class="context-menu-item context-menu-item-with-submenu" @mouseenter="showObstructionSubmenu = true"
                    @mouseleave="handleSubmenuLeave">
                    <i class="bi bi-arrow-repeat"></i> Convert to Obstruction
                    <i class="bi bi-chevron-right submenu-indicator"></i>
                    <!-- Obstruction Types Submenu -->
                    <div v-if="showObstructionSubmenu" class="context-submenu"
                        @mouseenter="showObstructionSubmenu = true" @mouseleave="handleSubmenuLeave"
                        :style="getSubmenuStyle()">
                        <div class="context-menu-item" v-for="obstructionType in obstructionTypes"
                            :key="obstructionType.key" @click="convertRoutePointToObstruction(obstructionType.key)">
                            <img v-if="obstructionType.key === 'bridge'" width="16" height="16" src="/media/bridge.png"
                                style="margin-right: 8px; filter: brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(2000%) hue-rotate(200deg) brightness(0.9) contrast(0.9);">
                            <img v-else-if="obstructionType.key === 'powerline'" width="16" height="16"
                                src="/media/electric-tower_old_delete.png"
                                style="margin-right: 8px; filter: brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(2000%) hue-rotate(200deg) brightness(0.9) contrast(0.9);">
                            <img v-else-if="obstructionType.key === 'intersection'" width="16" height="16"
                                src="/media/intersection.png"
                                style="margin-right: 8px; filter: brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(2000%) hue-rotate(200deg) brightness(0.9) contrast(0.9);">
                            <img v-else-if="obstructionType.key === 'road'" width="16" height="16" src="/media/road.png"
                                style="margin-right: 8px; filter: brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(2000%) hue-rotate(200deg) brightness(0.9) contrast(0.9);">
                            <img v-else-if="obstructionType.key === 'overhead'" width="16" height="16"
                                src="/media/overhead.png"
                                style="margin-right: 8px; filter: brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(2000%) hue-rotate(200deg) brightness(0.9) contrast(0.9);">
                            <i v-else-if="obstructionType.key === 'railroad'" class="fas fa-train"
                                style="font-size: 12px; margin-right: 8px; color: #333B56; width: 16px; display: inline-block; text-align: center;"></i>
                            <i v-else-if="obstructionType.key === 'custom'" class="far fa-question-circle"
                                style="font-size: 12px; margin-right: 8px; color: #333B56; width: 16px; display: inline-block; text-align: center;"></i>
                            <i v-else class="bi bi-circle"
                                style="font-size: 12px; margin-right: 8px; color: #333B56; width: 16px; display: inline-block; text-align: center;"></i>
                            {{ obstructionType.label }}
                        </div>
                    </div>
                </div>
                <div v-if="contextMenu.targetType === 'marker' && contextMenu.targetPoint?.type === 'route_point'"
                    class="context-menu-item" @click="deletePoint">
                    <i class="bi bi-trash"></i> Delete Point
                </div>
                <div v-if="contextMenu.targetType === 'segment'" class="context-menu-item" @click="snapSegment">
                    <i class="bi bi-route"></i> Snap to Route
                </div>
                <div v-if="contextMenu.targetType === 'segment'" class="context-menu-item" @click="addPointToSegment">
                    <i class="bi bi-plus"></i> Add Point to Segment
                </div>
                <div v-if="contextMenu.targetType === 'segment'"
                    class="context-menu-item context-menu-item-with-submenu" @mouseenter="showObstructionSubmenu = true"
                    @mouseleave="handleSubmenuLeave">
                    <i class="bi bi-sign-stop"></i> Add Obstruction
                    <i class="bi bi-chevron-right submenu-indicator"></i>
                    <!-- Obstruction Types Submenu -->
                    <div v-if="showObstructionSubmenu" class="context-submenu"
                        @mouseenter="showObstructionSubmenu = true" @mouseleave="handleSubmenuLeave"
                        :style="getSubmenuStyle()">
                        <div class="context-menu-item" v-for="obstructionType in obstructionTypes"
                            :key="obstructionType.key" @click="addObstructionToSegment(obstructionType.key)">
                            <img v-if="obstructionType.key === 'bridge'" width="16" height="16" src="/media/bridge.png"
                                style="margin-right: 8px; filter: brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(2000%) hue-rotate(200deg) brightness(0.9) contrast(0.9);">
                            <img v-else-if="obstructionType.key === 'powerline'" width="16" height="16"
                                src="/media/electric-tower_old_delete.png"
                                style="margin-right: 8px; filter: brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(2000%) hue-rotate(200deg) brightness(0.9) contrast(0.9);">
                            <img v-else-if="obstructionType.key === 'intersection'" width="16" height="16"
                                src="/media/intersection.png"
                                style="margin-right: 8px; filter: brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(2000%) hue-rotate(200deg) brightness(0.9) contrast(0.9);">
                            <img v-else-if="obstructionType.key === 'road'" width="16" height="16" src="/media/road.png"
                                style="margin-right: 8px; filter: brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(2000%) hue-rotate(200deg) brightness(0.9) contrast(0.9);">
                            <img v-else-if="obstructionType.key === 'overhead'" width="16" height="16"
                                src="/media/overhead.png"
                                style="margin-right: 8px; filter: brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(2000%) hue-rotate(200deg) brightness(0.9) contrast(0.9);">
                            <i v-else-if="obstructionType.key === 'railroad'" class="fas fa-train"
                                style="font-size: 12px; margin-right: 8px; color: #333B56; width: 16px; display: inline-block; text-align: center;"></i>
                            <i v-else-if="obstructionType.key === 'custom'" class="far fa-question-circle"
                                style="font-size: 12px; margin-right: 8px; color: #333B56; width: 16px; display: inline-block; text-align: center;"></i>
                            <i v-else class="bi bi-circle"
                                style="font-size: 12px; margin-right: 8px; color: #333B56; width: 16px; display: inline-block; text-align: center;"></i>
                            {{ obstructionType.label }}
                        </div>
                    </div>
                </div>
                <div v-if="contextMenu.targetType === 'map'" class="context-menu-item" @click="addPoint">
                    <i class="bi bi-plus"></i> Add Point
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted, watch } from 'vue';
import { BaseButton } from '@/components/ui';
import { getAddressFromCoordinates } from '@/components/planned_routes/utils/geocoding.js';
import MapLibreViewer from './MapLibreViewer.vue';

// Props
const props = defineProps({
    routePoints: {
        type: Array,
        default: () => []
    },
    editMode: {
        type: Boolean,
        default: false
    },
    selectedMarker: {
        type: Object,
        default: null
    },
    mapCenter: {
        type: Array,
        default: () => [0, 0]
    },
    zoom: {
        type: Number,
        default: 15
    }
});

// Emits
const emit = defineEmits([
    'marker-click',
    'marker-drag',
    'marker-drag-end',
    'segment-click',
    'segment-hover',
    'segment-leave',
    'segment-snap',
    'point-info',
    'point-edit',
    'map-ready',
    'marker-add',
    'marker-remove',
    'marker-move',
    'segment-add',
    'segment-remove',
    'map-click',
    'obstruction-add',
    'route-point-convert'
]);

// Map state
const mapWrapper = ref(null);
const mapRef = ref(null);
const map = ref(null);
const tileLayer = ref(null);
const markers = ref([]);
const polylines = ref([]);
const segments = ref([]);

// Minimap state
const minimapRef = ref(null);
const minimap = ref(null);
const minimapTileLayer = ref(null);
const minimapMarkers = ref([]);
const minimapPolylines = ref([]);

// Generate unique map ID
const mapId = computed(() => `map-${Math.random().toString(36).substr(2, 9)}`);
const minimapId = computed(() => `minimap-${Math.random().toString(36).substr(2, 9)}`);

const markersRemoved = ref([]);

// Local storage keys for route map - separate from planned routes map
const ROUTE_MAP_CENTER_STORAGE_KEY = "routeMapCenter";
const ROUTE_MAP_ZOOM_STORAGE_KEY = "routeMapZoom";
const ROUTE_MAP_STYLE_STORAGE_KEY = "routeMapStyle";

// Custom event name for cross-component communication
const MAP_STATE_CHANGED_EVENT = "mapStateChanged";

// Flag to prevent updating when we're the ones saving
let isSavingState = false;

// Default values
const DEFAULT_MAP_CENTER = [0, 0];
const DEFAULT_ZOOM = 15;
const DEFAULT_MAP_STYLE = 'osm';

// Load map state from localStorage
const loadRouteMapStateFromStorage = () => {
    try {
        const savedCenter = localStorage.getItem(ROUTE_MAP_CENTER_STORAGE_KEY);
        const savedZoom = localStorage.getItem(ROUTE_MAP_ZOOM_STORAGE_KEY);
        const savedStyle = localStorage.getItem(ROUTE_MAP_STYLE_STORAGE_KEY);

        const state = {
            center: DEFAULT_MAP_CENTER,
            zoom: DEFAULT_ZOOM,
            style: DEFAULT_MAP_STYLE,
        };

        if (savedCenter) {
            const center = JSON.parse(savedCenter);
            if (Array.isArray(center) && center.length === 2) {
                state.center = center;
            }
        }

        if (savedZoom) {
            const zoom = parseInt(savedZoom, 10);
            if (!isNaN(zoom)) {
                state.zoom = zoom;
            }
        }

        // Update validation to include new styles
        if (savedStyle && ['osm', 'standard', 'satellite', 'dark', 'light'].includes(savedStyle)) {
             // map old 'osm' to 'standard' if desired, or keep as alias
            state.style = savedStyle;
        }

        return state;
    } catch (error) {
        console.warn("Error loading route map state from localStorage:", error);
        return {
            center: DEFAULT_MAP_CENTER,
            zoom: DEFAULT_ZOOM,
            style: DEFAULT_MAP_STYLE,
        };
    }
};

// Save map state to localStorage
const saveRouteMapStateToStorage = (center, zoom, style) => {
    isSavingState = true;
    try {
        if (center && Array.isArray(center) && center.length === 2) {
            localStorage.setItem(ROUTE_MAP_CENTER_STORAGE_KEY, JSON.stringify(center));
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent(MAP_STATE_CHANGED_EVENT, {
                detail: { type: 'center', value: center }
            }));
        }
        if (zoom !== undefined && zoom !== null && !isNaN(zoom)) {
            localStorage.setItem(ROUTE_MAP_ZOOM_STORAGE_KEY, zoom.toString());
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent(MAP_STATE_CHANGED_EVENT, {
                detail: { type: 'zoom', value: zoom }
            }));
        }
        if (style && (style === 'osm' || style === 'satellite')) {
            localStorage.setItem(ROUTE_MAP_STYLE_STORAGE_KEY, style);
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent(MAP_STATE_CHANGED_EVENT, {
                detail: { type: 'style', value: style }
            }));
        }
    } catch (error) {
        console.warn("Error saving route map state to localStorage:", error);
    } finally {
        // Reset flag after a short delay
        setTimeout(() => {
            isSavingState = false;
        }, 100);
    }
};

// Load initial map state
const savedMapState = loadRouteMapStateFromStorage();

// Map configuration
const minZoom = ref(4);
const maxZoom = ref(18);
const mapStyle = ref(savedMapState.style);
const showPointsList = ref(false);

const useMapLibre = computed(() => ['dark', 'light', 'standard', 'osm', 'satellite'].includes(mapStyle.value));


// Map initialization state
const isMapReady = ref(false);
const isMapInitialized = ref(false);

// Route styling properties - matching RouteViewerNew.vue
const routeColor = ref('#333B56'); // Default dark blue color
const routeWeight = ref(6); // Default weight
const routeOpacity = ref(0.8); // Default opacity

// Segment state for highlighting and manipulation
const selectedSegment = ref(null);
const hoveredSegment = ref(null);

// Context menu state
const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    targetType: null,
    targetIndex: null,
    latlng: null,
    targetPoint: null // Store the point object for route_point conversion
});

// Obstruction submenu state
const showObstructionSubmenu = ref(false);

// Obstruction types
const obstructionTypes = ref([
    { key: 'bridge', label: 'Bridge' },
    { key: 'powerline', label: 'Powerline' },
    { key: 'overhead', label: 'Overhead' },
    { key: 'intersection', label: 'Intersection' },
    { key: 'road', label: 'Road' },
    { key: 'railroad', label: 'Railroad' },
    { key: 'custom', label: 'Custom' },
    // { key: 'other', label: 'Other' }
]);

// Edit mode state
const isDragging = ref(false);
const dragStartPosition = ref(null);
const isUpdatingMarkers = ref(false);
const draggedPointId = ref(null);
let markerUpdateTimeout = null;

// Computed properties
const tileLayerUrl = computed(() => {
    const tileLayers = {
        'osm': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'satellite': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    };
    return tileLayers[mapStyle.value];
});

const mapStyleLabel = computed(() => {
    const labels = {
        'osm': 'OpenStreetMap',
        'satellite': 'Satellite'
    };
    return labels[mapStyle.value];
});

// Handle map state change from other components
const handleMapStateChange = (event) => {
    // Only update if we're not the ones saving (prevent infinite loop)
    if (!isSavingState && event.detail) {
        // Implementation for syncing state across components
        /*
        if (event.detail.type === 'center' && map.value) {
            const center = event.detail.value;
            map.value.setView(center, map.value.getZoom());
        }
        */
    }
    // Reset flag
    isSavingState = false;
};

// Debounce timer for map move end event (declared at module level)
let mapMoveEndTimeout = null;

// Initialize native Leaflet map
// Initialize Map
const initializeMap = () => {
    if (useMapLibre.value) {
        // MapLibre is initialized by the child component's mounted hook
        // We just need to handle the ready event
        return;
    }
    
    // Fallback to Leaflet initialization
    initializeLeafletMap();
}

const initializeLeafletMap = () => {
    if (!window.L) {
        console.error('Leaflet not loaded');
        return;
    }

    // Fix for default markers in Leaflet
    delete window.L.Icon.Default.prototype._getIconUrl;
    window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Initialize map
    map.value = window.L.map(mapId.value, {
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        markerZoomAnimation: false,
        worldCopyJump: false,
        fadeAnimation: false,
        zoomAnimation: true
    });

    // In Edit mode, always use saved state if available
    // In View mode, use saved state if available, but route fitting will override it
    const hasValidSavedCenter = savedMapState.center && 
        Array.isArray(savedMapState.center) && 
        savedMapState.center.length === 2 &&
        (savedMapState.center[0] !== 0 || savedMapState.center[1] !== 0);
    
    const hasValidSavedZoom = savedMapState.zoom !== undefined && 
        !isNaN(savedMapState.zoom) && 
        savedMapState.zoom !== DEFAULT_ZOOM;
    
    // In Edit mode, prefer saved state; in View mode, prefer saved state but route will fit
    const initialCenter = hasValidSavedCenter ? savedMapState.center : props.mapCenter;
    const initialZoom = hasValidSavedZoom ? savedMapState.zoom : props.zoom;

    // Set initial view - route fitting in onMapReady will handle view mode
    map.value.setView(initialCenter, initialZoom);
    map.value.setMinZoom(minZoom.value);
    map.value.setMaxZoom(maxZoom.value);

    // Add tile layer
    tileLayer.value = window.L.tileLayer(tileLayerUrl.value, {
        attribution: '© OpenStreetMap contributors'
    });
    tileLayer.value.addTo(map.value);

    // Add click handler
    map.value.on('click', (e) => {
        // Deselect any selected segment when clicking on the map
        if (selectedSegment.value) {
            selectedSegment.value = null;
            emit('segment-click', null, null);
            updateSegmentStyling();
        }

        if (props.editMode) {
            // In edit mode, allow adding new points
            hideContextMenu();
            // Emit map click for potential new point addition
            emit('map-click', e.latlng);
        } else {
            // In view mode, just hide context menu
            hideContextMenu();
        }
    });

    // Add right-click handler for context menu
    map.value.on('contextmenu', (e) => {
        if (props.editMode) {
            e.originalEvent.preventDefault();
            showContextMenu(e.originalEvent, 'map', null, e.latlng);
        }
    });

    // Add viewport change handlers for marker filtering
    map.value.on('zoomend', updateMapContent);
    map.value.on('moveend', updateMapContent);
    map.value.on('resize', updateMapContent);

    // Update minimap on zoom/move
    map.value.on('zoomend', () => {
        if (minimap.value) {
            updateMinimap();
        }
        // Save state in view mode to preserve position when switching to edit mode
        if (!props.editMode) {
            saveMapState();
        }
    });
    
    map.value.on('moveend', () => {
        if (minimap.value) {
            updateMinimap();
        }
        // Save state in view mode to preserve position when switching to edit mode
        // Note: mapMoveEndTimeout is declared at module level
        if (!props.editMode) {
            // Clear existing timeout
            if (mapMoveEndTimeout) {
                clearTimeout(mapMoveEndTimeout);
            }
            // Debounce the save operation
            mapMoveEndTimeout = setTimeout(() => {
                saveMapState();
            }, 500); // 500ms debounce
        }
    });

    // Note: Click handler for deselection is already added above

    // Call onMapReady after initialization
    onMapReady();
};

// Map methods
const onMapReady = (mapInstance) => {
    console.log('Map is ready');
    isMapReady.value = true;
    
    // If MapLibre, store the instance (though logic is mainly in child component)
    if (useMapLibre.value) {
        // Logic for MapLibre ready
        emit('map-ready');
        return; 
    }
    
    // Leaflet specific logic

    emit('map-ready');

    if (props.routePoints.length > 0) {
        setTimeout(() => {
            const hasValidPoints = props.routePoints.some(p =>
                p.lat && p.lng &&
                !isNaN(p.lat) && !isNaN(p.lng) &&
                p.lat >= -90 && p.lat <= 90 &&
                p.lng >= -180 && p.lng <= 180
            );

            if (hasValidPoints) {
                // In Edit mode, always use saved params - don't fit to route
                if (props.editMode) {
                    const savedZoom = localStorage.getItem(ROUTE_MAP_ZOOM_STORAGE_KEY);
                    const savedCenter = localStorage.getItem(ROUTE_MAP_CENTER_STORAGE_KEY);
                    
                    if (savedCenter && savedZoom) {
                        try {
                            const center = JSON.parse(savedCenter);
                            const zoomLevel = parseInt(savedZoom, 10);
                            if (Array.isArray(center) && center.length === 2 && !isNaN(zoomLevel)) {
                                // Use saved position - don't fit to route
                                map.value.setView(center, zoomLevel);
                                return;
                            }
                        } catch (e) {
                            // Fall through - will keep current position
                        }
                    }
                    // If no saved params, keep current position - don't call centerMap
                    return;
                }

                // In View mode, center map to fit route
                centerMap();
            }
        }, 500);
    }

    // Mobile-specific map initialization
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            if (map.value) {
                map.value.invalidateSize();
                console.log('Map resized for mobile');
            }
        }, 100);
    }

    // Add a small delay to ensure map is fully initialized
    setTimeout(() => {
        isMapInitialized.value = true;
        console.log('Map fully initialized');

        // Add markers to map
        addMarkersToMap();

        // Add polyline to map
        addPolylineToMap();

        // Add segments to map
        addSegmentsToMap();

        // Initialize minimap after map is fully initialized
        setTimeout(() => {
            initializeMinimap();
        }, 100);
    }, 500);
};

// Calculate route segments
const calculateRouteSegments = () => {
    if (props.routePoints.length < 2) return [];

    const segments = [];
    // Include start and end points, and filter out route points for the middle
    const nonRoutePoints = props.routePoints.filter(p =>
        p.type !== 'route_point' || p === props.routePoints[0] || p === props.routePoints[props.routePoints.length - 1]
    );

    for (let i = 0; i < nonRoutePoints.length - 1; i++) {
        const currentPoint = nonRoutePoints[i];
        const nextPoint = nonRoutePoints[i + 1];

        // Find indices in the full routePoints array
        const currentIndex = props.routePoints.findIndex(p => p.id === currentPoint.id);
        const nextIndex = props.routePoints.findIndex(p => p.id === nextPoint.id);

        if (currentIndex === -1 || nextIndex === -1) {
            console.warn(`Could not find point indices for segment ${i}`);
            continue;
        }

        // Get all points between current and next (including route points)
        const segmentCoordinates = [];
        for (let j = currentIndex; j <= nextIndex; j++) {
            const point = props.routePoints[j];
            segmentCoordinates.push([point.lat, point.lng]);
        }

        segments.push({
            id: `segment-${i}`,
            index: i,
            startPoint: currentPoint,
            endPoint: nextPoint,
            coordinates: segmentCoordinates,
            isSnapped: false // Default to straight line
        });
    }

    return segments;
};

// Add markers to the map
const addMarkersToMap = () => {
    if (!map.value) return;

    // Don't add markers if we're currently dragging - the marker is handled manually
    if (isDragging.value) {
        return;
    }

    // Clear existing markers
    markers.value.forEach(marker => map.value.removeLayer(marker));
    markers.value = [];

    // IMPORTANT: Add route points FIRST so they appear below other markers
    // This ensures proper z-index layering
    if (props.editMode) {
        const visibleRoutePoints = getVisibleRoutePoints();
        visibleRoutePoints.forEach((point, index) => {
            const marker = createMarker(point, 'route', index);
            if (marker) {
                markers.value.push(marker);
                map.value.addLayer(marker);
            }
        });
    }

    // Add start/end markers
    if (props.routePoints.length > 0) {
        const startPoint = props.routePoints[0];
        const startMarker = createMarker(startPoint, 'start', 0);
        if (startMarker) {
            markers.value.push(startMarker);
            map.value.addLayer(startMarker);
        }

        if (props.routePoints.length > 1) {
            const endPoint = props.routePoints[props.routePoints.length - 1];
            const endMarker = createMarker(endPoint, 'end', props.routePoints.length - 1);
            if (endMarker) {
                markers.value.push(endMarker);
                map.value.addLayer(endMarker);
            }
        }
    }

    // Add survey points (obstruction types) - these should appear on top
    const visibleSurveyPoints = getVisibleSurveyPoints();
    visibleSurveyPoints.forEach((point, index) => {
        const marker = createMarker(point, 'survey', index);
        if (marker) {
            markers.value.push(marker);
            map.value.addLayer(marker);
        }
    });

};

// Add segments to map
const addSegmentsToMap = () => {
    if (!map.value) return;

    // Clear existing segments
    segments.value.forEach(segment => {
        if (segment.polyline) {
            map.value.removeLayer(segment.polyline);
        }
    });
    segments.value = [];

    // Calculate segments
    const routeSegments = calculateRouteSegments();

    routeSegments.forEach((segment, index) => {
        const polyline = window.L.polyline(segment.coordinates, {
            color: getSegmentColor(segment),
            weight: getSegmentWeight(segment),
            opacity: getSegmentOpacity(segment),
            interactive: true,
            bubblingMouseEvents: false
        });

        // Add event handlers
        polyline.on('click', (e) => {
            // Stop event propagation to prevent map click handler from firing
            e.originalEvent?.stopPropagation();
            // Toggle selection: if clicking the same segment, deselect it
            if (selectedSegment.value?.id === segment.id) {
                selectedSegment.value = null;
                emit('segment-click', null, index);
            } else {
                selectedSegment.value = segment;
                emit('segment-click', segment, index);
            }
            // Update segment styling immediately
            updateSegmentStyling();
        });

        polyline.on('mouseover', (e) => {
            hoveredSegment.value = segment;
            emit('segment-hover', segment, index);
            updateSegmentStyling();
        });

        polyline.on('mouseout', (e) => {
            hoveredSegment.value = null;
            emit('segment-leave', segment, index);
            updateSegmentStyling();
        });

        polyline.on('contextmenu', (e) => {
            if (!props.editMode) return;
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
            selectedSegment.value = segment;
            showContextMenu(e.originalEvent, 'segment', index, e.latlng);
        });

        // Store reference to polyline
        segment.polyline = polyline;
        segments.value.push(segment);
        polyline.addTo(map.value);
    });
};

// Get segment color based on state
const getSegmentColor = (segment) => {
    if (selectedSegment.value?.id === segment.id) {
        return 'var(--warning)'; // Yellow for selected
    } else if (hoveredSegment.value?.id === segment.id) {
        return 'var(--accent)'; // Blue for hovered
    } else if (segment.isSnapped) {
        return 'var(--success)'; // Green for snapped
    }
    return '#333B56'; // Default color
};

// Get segment weight based on state
const getSegmentWeight = (segment) => {
    if (selectedSegment.value?.id === segment.id) {
        return 8; // Thicker for selected
    } else if (hoveredSegment.value?.id === segment.id) {
        return 7; // Slightly thicker for hovered
    }
    return 6; // Default weight
};

// Get segment opacity based on state
const getSegmentOpacity = (segment) => {
    if (selectedSegment.value?.id === segment.id) {
        return 1.0; // Full opacity for selected
    } else if (hoveredSegment.value?.id === segment.id) {
        return 0.9; // Slightly transparent for hovered
    }
    return 0.8; // Default opacity
};

// Update segment styling when selection changes
const updateSegmentStyling = () => {
    if (!map.value) return;

    segments.value.forEach(segment => {
        if (segment.polyline) {
            segment.polyline.setStyle({
                color: getSegmentColor(segment),
                weight: getSegmentWeight(segment),
                opacity: getSegmentOpacity(segment)
            });
        }
    });
};

// Create a marker with custom icon
const createMarker = (point, type, index) => {
    if (!point.lat || !point.lng || isNaN(point.lat) || isNaN(point.lng)) {
        return null;
    }

    // Set z-index offset based on marker type
    // Route points should have lower z-index than other markers
    let zIndexOffset = 0;
    if (point.type === 'route_point') {
        zIndexOffset = -1000; // Lower z-index for route points
    } else {
        zIndexOffset = 0; // Default z-index for other markers (start, end, survey)
    }

    const marker = window.L.marker([point.lat, point.lng], {
        interactive: true,
        draggable: props.editMode,
        pointId: point.id,
        dragState: false,
        zIndexOffset: zIndexOffset
    });

    // Create custom icon based on type
    let iconHtml = '';
    let iconSize = [24, 24];
    let iconAnchor = [16, 16];
    
    // Get dynamic color or default
    const borderColor = point.color || '#333B56';

    if (type === 'start' || type === 'end') {
        // Use standardized marker location image
        iconHtml = `<img src="/media/marker_location.png" width="32" height="32" alt="${type}">`;
        iconSize = [32, 32];
        iconAnchor = [16, 32]; // Anchor at bottom center
    } else if (type === 'survey') {
        iconSize = [32, 32];
        iconAnchor = [16, 32]; // Anchor at bottom center
        
        if (point.type === 'bridge') {
            iconHtml = `<img width="32" height="32" src="/media/marker_bridge.png">`;
        } else if (point.type === 'powerline') {
            iconHtml = `<img width="32" height="32" src="/media/marker_powerline.png">`;
        } else if (point.type === 'intersection') {
            iconHtml = `<img width="32" height="32" src="/media/marker_intersection.png">`;
        } else if (point.type === 'road') {
            iconHtml = `<img width="32" height="32" src="/media/marker_road.png">`;
        } else if (point.type === 'overhead') {
            iconHtml = `<img width="32" height="32" src="/media/marker_overhead.png">`;
        } else if (point.type === 'railroad') {
            // Fallback for railroad if no specific marker exists
             iconHtml = `<img width="32" height="32" src="/media/marker_other.png">`;
        } else if (point.type === 'custom') {
             iconHtml = `<img width="32" height="32" src="/media/marker_other.png">`;
        } else {
             iconHtml = `<img width="32" height="32" src="/media/marker_other.png">`;
        }
    } else if (type === 'route') {
        iconSize = [12, 12];
        iconAnchor = [6, 6];
        iconHtml = '<div class="custom-icon route-point"><i class="bi bi-dot"></i></div>';
    }

    // Add a class to route point markers for CSS targeting
    let iconClassName = point.type === 'route_point'
        ? 'custom-marker-icon route-point-marker'
        : 'custom-marker-icon';

    // check if point is draft
    const isDraft = !point.type || (point.status && point.status === 'draft');
    if (isDraft) {
        iconClassName += ' status-draft';
    }

    const customIcon = window.L.divIcon({
        html: iconHtml,
        className: iconClassName,
        iconSize: iconSize,
        iconAnchor: iconAnchor
    });
    
    marker.setIcon(customIcon);

    // Track if double-click was detected to prevent single click from firing
    let isDoubleClick = false;
    let clickTimeout = null;

    // Add event handlers
    marker.on('dblclick', () => {
        isDoubleClick = true;
        // Clear any pending single click
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }
        emit('point-info', point);
        // Reset flag after a short delay
        setTimeout(() => {
            isDoubleClick = false;
        }, 300);
    });

    // Add edit mode functionality
    if (props.editMode) {
        // Drag functionality is enabled via marker options

        marker.on('dragstart', (e) => {
            isDragging.value = true;
            draggedPointId.value = point.id;
            // Use the marker's current position as start position
            dragStartPosition.value = marker.getLatLng();
        });

        marker.on('drag', (e) => {
            // Update marker position during drag
            const newPos = e.latlng;
            const actualIndex = props.routePoints.findIndex(p => p.id === point.id);
            emit('marker-drag', {
                point: point,
                index: actualIndex,
                newPos: newPos,
                oldPos: dragStartPosition.value
            });
        });

        marker.on('dragend', (e) => {
            if (isDragging.value) {
                // Use the marker's current position instead of event latlng
                const newPos = marker.getLatLng();
                const actualIndex = props.routePoints.findIndex(p => p.id === point.id);

                // Validate the new position
                if (newPos && typeof newPos.lat === 'number' && typeof newPos.lng === 'number') {
                    // Emit marker-drag-end event instead of marker-move
                    emit('marker-drag-end', {
                        point: point,
                        index: actualIndex,
                        newPos: newPos,
                        oldPos: dragStartPosition.value
                    });
                } else {
                    console.error('Invalid new position after drag:', newPos);
                }

                // Reset dragging state first
                isDragging.value = false;
                draggedPointId.value = null;
                dragStartPosition.value = null;

                // Don't remove the marker here - let the watcher handle recreation
                // The data update in RouteViewerNew will trigger the watcher
                // which will recreate the marker at the new position

                // Temporarily commented out marker removal to test context menu
                setTimeout(() => {
                    if (point.type !== 'route_point') {
                        if (!markersRemoved.value.includes(point.id)) {
                            // Check if the previous point is of type route_point
                            if (props.routePoints[actualIndex - 1].type === 'route_point') {
                                emit('marker-remove', actualIndex - 1);
                                markersRemoved.value.push(point.id);
                            }
                        }
                    }
                }, 500);
            }
        });

        // Add right-click context menu
        marker.on('contextmenu', (e) => {
            if (!props.editMode) return;
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();

            // Find the actual index in the full routePoints array
            const actualIndex = props.routePoints.findIndex(p => p.id === point.id);
            showContextMenu(e.originalEvent, 'marker', actualIndex, null, point);
        });

        // Add click handler for selection
        marker.on('click', (e) => {
            // Prevent single click if double-click was just detected
            if (isDoubleClick) {
                return;
            }
            
            // Delay single click to allow double-click detection
            if (clickTimeout) {
                clearTimeout(clickTimeout);
            }
            
            clickTimeout = setTimeout(() => {
                if (!isDoubleClick) {
                    // Find the actual index in the full routePoints array
                    const actualIndex = props.routePoints.findIndex(p => p.id === point.id);
                    emit('marker-click', point, actualIndex);
                }
                clickTimeout = null;
            }, 250);
        });
    } else {
        // View mode - only click handler
        marker.on('click', (e) => {
            // Prevent single click if double-click was just detected
            if (isDoubleClick) {
                return;
            }
            
            // Delay single click to allow double-click detection
            if (clickTimeout) {
                clearTimeout(clickTimeout);
            }
            
            clickTimeout = setTimeout(() => {
                if (!isDoubleClick) {
                    // Find the actual index in the full routePoints array
                    const actualIndex = props.routePoints.findIndex(p => p.id === point.id);
                    emit('marker-click', point, actualIndex);
                }
                clickTimeout = null;
            }, 250);
        });
    }

    return marker;
};

// Get visible survey points with proper filtering
const getVisibleSurveyPoints = () => {
    if (!map.value) return [];

    try {
        const bounds = map.value.getBounds();
        const currentZoom = map.value.getZoom();

        // Filter out invalid coordinates
        const validPoints = props.routePoints.filter(point => {
            if (!point.lat || !point.lng || isNaN(point.lat) || isNaN(point.lng)) return false;
            if (point.type === 'route_point') return false; // Exclude route points
            if (point.lat < -90 || point.lat > 90 || point.lng < -180 || point.lng > 180) return false;
            return true;
        });

        // Apply zoom-based limits
        let maxMarkers;
        if (currentZoom < 8) maxMarkers = 20;
        else if (currentZoom < 10) maxMarkers = 40;
        else if (currentZoom < 12) maxMarkers = 60;
        else if (currentZoom < 14) maxMarkers = 80;
        else maxMarkers = 100;

        // Filter by viewport bounds
        const viewportPoints = validPoints.filter(point => {
            try {
                return bounds.contains([point.lat, point.lng]);
            } catch (error) {
                return false;
            }
        });

        return viewportPoints.slice(0, maxMarkers);
    } catch (error) {
        console.warn('Error filtering survey points:', error);
        return props.routePoints.filter(point =>
            point.type !== 'route_point' &&
            point.lat && point.lng &&
            !isNaN(point.lat) && !isNaN(point.lng)
        ).slice(0, 50);
    }
};

onMounted(() => {
    nextTick(() => {
        // Delay slightly to ensure DOM is ready
        setTimeout(() => {
             initializeMap();
        }, 100);
    });
});

// Watch for changes in useMapLibre to re-initialize if switching engines
watch(useMapLibre, (newValue) => {
    nextTick(() => {
        if (!newValue) {
            // Switching back to Leaflet
            initializeLeafletMap();
        } else {
            // Switching to MapLibre - component handles it
        }
    });
});

// Watchers for mapState from other components
onMounted(() => {
    window.addEventListener(MAP_STATE_CHANGED_EVENT, handleMapStateChange);
});

onUnmounted(() => {
    window.removeEventListener(MAP_STATE_CHANGED_EVENT, handleMapStateChange);
});

// Get visible route points with proper filtering
const getVisibleRoutePoints = () => {
    if (!map.value) return [];

    try {
        const bounds = map.value.getBounds();
        const currentZoom = map.value.getZoom();

        // Filter out invalid coordinates
        const validPoints = props.routePoints.filter(point => {
            if (!point.lat || !point.lng || isNaN(point.lat) || isNaN(point.lng)) return false;
            if (point.type !== 'route_point') return false; // Only route points
            if (point.lat < -90 || point.lat > 90 || point.lng < -180 || point.lng > 180) return false;
            return true;
        });

        // Apply zoom-based limits
        let maxMarkers;
        if (currentZoom < 12) maxMarkers = 30;
        else if (currentZoom < 14) maxMarkers = 40;
        else maxMarkers = 50;

        // Filter by viewport bounds
        const viewportPoints = validPoints.filter(point => {
            try {
                return bounds.contains([point.lat, point.lng]);
            } catch (error) {
                return false;
            }
        });

        return viewportPoints.slice(0, maxMarkers);
    } catch (error) {
        console.warn('Error filtering route points:', error);
        return props.routePoints.filter(point =>
            point.type === 'route_point' &&
            point.lat && point.lng &&
            !isNaN(point.lat) && !isNaN(point.lng)
        ).slice(0, 50);
    }
};

// Add polyline to the map
const addPolylineToMap = () => {
    if (!map.value || !props.routePoints.length) return;

    // Clear existing polylines
    polylines.value.forEach(polyline => map.value.removeLayer(polyline));
    polylines.value = [];

    try {
        // Create route path from route points
        const routePath = props.routePoints
            .filter(point => point.lat && point.lng && !isNaN(point.lat) && !isNaN(point.lng))
            .map(point => [point.lat, point.lng]);

        if (routePath.length < 2) {
            console.log('Not enough valid coordinates for polyline');
            return;
        }

        // Create polyline with route styling
        const polyline = window.L.polyline(routePath, {
            color: routeColor.value,
            weight: routeWeight.value,
            opacity: routeOpacity.value,
            interactive: false,
            bubblingMouseEvents: false,
            smoothFactor: 0
        });

        // Add to map
        polyline.addTo(map.value);
        polylines.value.push(polyline);

        console.log('Polyline added successfully with', routePath.length, 'points');
    } catch (error) {
        console.error('Error adding polyline:', error);
    }
};

// Update map content when viewport changes
const updateMapContent = () => {
    if (!map.value || !isMapInitialized.value) return;

    try {
        // Update markers based on new viewport
        addMarkersToMap();
    } catch (error) {
        console.warn('Error updating map content:', error);
    }
};

// OSRM route calculation function
const calculateSegmentRoute = async (startPoint, endPoint) => {
    if (!startPoint || !endPoint) return null;

    try {
        // Build coordinates string for OSRM (just start and end)
        const coordinates = `${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}`;

        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
        );

        if (response.ok) {
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const routePath = route.geometry.coordinates.map((coord) => [
                    coord[1], // lat
                    coord[0], // lng
                ]);
                const routeInfo = {
                    distance: route.distance,
                    duration: route.duration,
                };

                return { routePath, routeInfo };
            }
        }
        return null;
    } catch (error) {
        console.error("Error calculating segment route:", error);
        return null;
    }
};

// Snap segment to route function
const snapSegmentToRoute = async (segment) => {
    if (!segment) return;

    try {
        console.log("Snapping segment to route:", segment.id);
        console.log("Route points before snapping:", props.routePoints.length);

        // Get the start and end points from the segment
        const startPoint = segment.startPoint;
        const endPoint = segment.endPoint;

        // Calculate OSRM route between these points
        const result = await calculateSegmentRoute(startPoint, endPoint);

        if (result && result.routePath) {
            // Find the indices of start and end points in the original routePoints array
            const startIndex = props.routePoints.findIndex(p => p.id === startPoint.id);
            const endIndex = props.routePoints.findIndex(p => p.id === endPoint.id);

            console.log("Start index:", startIndex, "End index:", endIndex);

            if (startIndex !== -1 && endIndex !== -1) {
                // Remove all route points between start and end (exclusive)
                const pointsToRemove = [];
                for (let i = startIndex + 1; i < endIndex; i++) {
                    if (props.routePoints[i].type === 'route_point') {
                        pointsToRemove.push(i);
                    }
                }

                console.log("Points to remove:", pointsToRemove.length);

                // Generate unique IDs for new route points
                const generateUniqueId = () => {
                    const timestamp = Date.now();
                    const random = Math.random().toString(36).substr(2, 9);
                    return `snapped_route_${timestamp}_${random}`;
                };

                // Insert the snapped route coordinates as new route points with unique IDs
                const newRoutePoints = result.routePath.slice(1, -1).map((coord, index) => {
                    const newPoint = {
                        id: generateUniqueId(),
                        lat: coord[0],
                        lng: coord[1],
                        type: 'route_point',
                        data: JSON.stringify({}),
                        distance: 0,
                        alt: 0,
                        head: 0,
                        dateUpdated: new Date().toISOString()
                    };
                    console.log(`Created new route point ${index + 1}:`, newPoint.id);
                    return newPoint;
                });

                console.log(`Will replace ${pointsToRemove.length} old route points with ${newRoutePoints.length} new snapped route points`);

                // Emit the segment snap event with the route data
                emit('segment-snap', {
                    segment,
                    startIndex,
                    endIndex,
                    pointsToRemove,
                    newRoutePoints,
                    routePath: result.routePath
                });
            }

            // Update the segment coordinates with the OSRM route
            const segmentIndex = segments.value.findIndex(s => s.id === segment.id);
            if (segmentIndex !== -1) {
                segments.value[segmentIndex].coordinates = result.routePath;
                segments.value[segmentIndex].isSnapped = true;

                // Update the polyline on the map
                if (segments.value[segmentIndex].polyline) {
                    map.value.removeLayer(segments.value[segmentIndex].polyline);
                }

                // Create new polyline with snapped route
                const newPolyline = window.L.polyline(result.routePath, {
                    color: getSegmentColor(segments.value[segmentIndex]),
                    weight: getSegmentWeight(segments.value[segmentIndex]),
                    opacity: getSegmentOpacity(segments.value[segmentIndex]),
                    interactive: true,
                    bubblingMouseEvents: false
                });

                // Re-add event handlers
                newPolyline.on('click', (e) => {
                    // Stop event propagation to prevent map click handler from firing
                    e.originalEvent?.stopPropagation();
                    // Toggle selection: if clicking the same segment, deselect it
                    if (selectedSegment.value?.id === segments.value[segmentIndex].id) {
                        selectedSegment.value = null;
                        emit('segment-click', null, segmentIndex);
                    } else {
                        selectedSegment.value = segments.value[segmentIndex];
                        emit('segment-click', segments.value[segmentIndex], segmentIndex);
                    }
                    updateSegmentStyling();
                });

                newPolyline.on('mouseover', (e) => {
                    hoveredSegment.value = segments.value[segmentIndex];
                    emit('segment-hover', segments.value[segmentIndex], segmentIndex);
                    updateSegmentStyling();
                });

                newPolyline.on('mouseout', (e) => {
                    hoveredSegment.value = null;
                    emit('segment-leave', segments.value[segmentIndex], segmentIndex);
                    updateSegmentStyling();
                });

                newPolyline.on('contextmenu', (e) => {
                    if (!props.editMode) return;
                    e.originalEvent.preventDefault();
                    e.originalEvent.stopPropagation();
                    selectedSegment.value = segments.value[segmentIndex];
                    showContextMenu(e.originalEvent, 'segment', segmentIndex, e.latlng);
                });

                segments.value[segmentIndex].polyline = newPolyline;
                newPolyline.addTo(map.value);

                // Update the selected segment reference
                if (selectedSegment.value?.id === segment.id) {
                    selectedSegment.value = segments.value[segmentIndex];
                }

                console.log("Segment snapped successfully:", segment.id);
            }
        } else {
            console.warn("No route result received for segment:", segment.id);
        }
    } catch (error) {
        console.error("Error snapping segment to route:", error);
    }
};

// Helper function to calculate distance from a point to a line segment
const distanceToLineSegment = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
        // Line segment is actually a point
        return Math.sqrt(A * A + B * B);
    }

    const param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
};

// Context menu functions
const showContextMenu = (event, targetType, targetIndex, latlng = null, targetPoint = null) => {
    // Get the viewport coordinates
    const x = event.clientX;
    const y = event.clientY;

    contextMenu.value = {
        visible: true,
        x: x,
        y: y,
        targetType: targetType,
        targetIndex: targetIndex,
        latlng: latlng,
        targetPoint: targetPoint
    };
};

const hideContextMenu = () => {
    contextMenu.value.visible = false;
    contextMenu.value.targetType = null;
    contextMenu.value.targetIndex = null;
    contextMenu.value.latlng = null;
    contextMenu.value.targetPoint = null;
    showObstructionSubmenu.value = false;
};

// Handle submenu leave with slight delay to allow moving to submenu
const handleSubmenuLeave = () => {
    setTimeout(() => {
        // Check if mouse is still over submenu
        const submenu = document.querySelector('.context-submenu');
        if (!submenu || !submenu.matches(':hover')) {
            showObstructionSubmenu.value = false;
        }
    }, 100);
};

// Calculate submenu position to prevent off-screen
const getSubmenuStyle = () => {
    if (!contextMenu.value.visible) return {};

    const menuWidth = 200; // Approximate width of submenu
    const screenWidth = window.innerWidth;
    const menuRight = contextMenu.value.x + menuWidth;

    // If submenu would go off-screen, position it to the left instead
    if (menuRight + menuWidth > screenWidth) {
        return { left: 'auto', right: '100%', marginLeft: '0', marginRight: '4px' };
    }

    return {};
};

// Context menu action handlers
const snapSegment = async () => {
    if (contextMenu.value.targetType === 'segment') {
        const segmentIndex = contextMenu.value.targetIndex;
        const segment = segments.value.find(s => s.index === segmentIndex);

        if (segment) {
            await snapSegmentToRoute(segment);
        }
    }
    hideContextMenu();
};

const addPointToSegment = () => {
    if (contextMenu.value.targetType === 'segment') {
        const segmentIndex = contextMenu.value.targetIndex;
        const segment = segments.value.find(s => s.index === segmentIndex);
        const clickCoords = contextMenu.value.latlng;

        if (segment && clickCoords) {
            console.log("=== ADDING POINT TO SEGMENT ===");
            console.log("Segment:", segment.id);
            console.log("Click coordinates:", clickCoords);

            // Find the indices of start and end points in the original routePoints array
            const startIndex = props.routePoints.findIndex(p => p.id === segment.startPoint.id);
            const endIndex = props.routePoints.findIndex(p => p.id === segment.endPoint.id);

            console.log("Start index:", startIndex, "End index:", endIndex);

            if (startIndex !== -1 && endIndex !== -1) {
                // Generate unique ID for new route point
                const generateUniqueId = () => {
                    const timestamp = Date.now();
                    const random = Math.random().toString(36).substr(2, 9);
                    return `inserted_route_${timestamp}_${random}`;
                };

                // Create new route point at clicked location
                const newRoutePoint = {
                    id: generateUniqueId(),
                    lat: clickCoords.lat,
                    lng: clickCoords.lng,
                    type: 'route_point',
                    data: JSON.stringify({}),
                    distance: 0,
                    alt: 0,
                    head: 0,
                    dateUpdated: new Date().toISOString()
                };

                // Find the best insertion position along the segment
                let insertIndex = endIndex; // Default to just before end point

                if (endIndex > startIndex + 1) {
                    let minDistance = Infinity;
                    let bestIndex = startIndex + 1;

                    for (let i = startIndex; i < endIndex; i++) {
                        const pointA = props.routePoints[i];
                        const pointB = props.routePoints[i + 1];

                        // Calculate distance from click point to the line segment between pointA and pointB
                        const distance = distanceToLineSegment(
                            clickCoords.lat, clickCoords.lng,
                            pointA.lat, pointA.lng,
                            pointB.lat, pointB.lng
                        );

                        if (distance < minDistance) {
                            minDistance = distance;
                            bestIndex = i + 1;
                        }
                    }
                    insertIndex = bestIndex;
                } else {
                    // No intermediate points, insert between start and end
                    insertIndex = startIndex + 1;
                }

                console.log(`Will insert new route point at index ${insertIndex}:`, newRoutePoint.id);

                // Emit the segment add event with the route data
                emit('segment-add', {
                    segment,
                    startIndex,
                    endIndex,
                    insertIndex,
                    newRoutePoint,
                    clickCoords
                });
            }
        }
    }
    hideContextMenu();
};

const editPoint = () => {
    if (contextMenu.value.targetType === 'marker') {
        const pointIndex = contextMenu.value.targetIndex;
        const point = props.routePoints[pointIndex];
        emit('point-edit', point);
    }
    hideContextMenu();
};

const deletePoint = () => {
    if (contextMenu.value.targetType === 'marker') {
        const pointIndex = contextMenu.value.targetIndex;
        emit('marker-remove', pointIndex);
    }
    hideContextMenu();
};

const addPoint = () => {
    if (contextMenu.value.targetType === 'map' && contextMenu.value.latlng) {
        emit('marker-add', contextMenu.value.latlng);
    }
    hideContextMenu();
};

const addObstructionToSegment = async (obstructionType) => {
    if (contextMenu.value.targetType === 'segment') {
        const segmentIndex = contextMenu.value.targetIndex;
        const segment = segments.value.find(s => s.index === segmentIndex);
        const clickCoords = contextMenu.value.latlng;

        if (segment && clickCoords) {
            console.log("=== ADDING OBSTRUCTION TO SEGMENT ===");
            console.log("Segment:", segment.id);
            console.log("Obstruction type:", obstructionType);
            console.log("Click coordinates:", clickCoords);

            // Find the indices of start and end points in the original routePoints array
            const startIndex = props.routePoints.findIndex(p => p.id === segment.startPoint.id);
            const endIndex = props.routePoints.findIndex(p => p.id === segment.endPoint.id);

            console.log("Start index:", startIndex, "End index:", endIndex);

            if (startIndex !== -1 && endIndex !== -1) {
                // Generate unique ID for new obstruction point
                const generateUniqueId = () => {
                    const timestamp = Date.now();
                    const random = Math.random().toString(36).substr(2, 9);
                    return `obstruction_${timestamp}_${random}`;
                };

                // Find the best insertion position along the segment
                let insertIndex = endIndex; // Default to just before end point

                if (endIndex > startIndex + 1) {
                    let minDistance = Infinity;
                    let bestIndex = startIndex + 1;

                    for (let i = startIndex; i < endIndex; i++) {
                        const pointA = props.routePoints[i];
                        const pointB = props.routePoints[i + 1];

                        // Calculate distance from click point to the line segment between pointA and pointB
                        const distance = distanceToLineSegment(
                            clickCoords.lat, clickCoords.lng,
                            pointA.lat, pointA.lng,
                            pointB.lat, pointB.lng
                        );

                        if (distance < minDistance) {
                            minDistance = distance;
                            bestIndex = i + 1;
                        }
                    }
                    insertIndex = bestIndex;
                } else {
                    // No intermediate points, insert between start and end
                    insertIndex = startIndex + 1;
                }

                // Fetch address from coordinates
                let roadAddress = '';
                let primaryAddressAddress = '';

                try {
                    const addressInfo = await getAddressFromCoordinates(clickCoords.lat, clickCoords.lng);
                    if (addressInfo) {
                        // Extract primary address (full address string)
                        primaryAddressAddress = addressInfo.display_name || '';

                        // Extract road address from the address object
                        if (addressInfo.address) {
                            // Try to get road name from various possible fields
                            roadAddress = addressInfo.address.road ||
                                addressInfo.address.highway ||
                                addressInfo.address.street ||
                                addressInfo.address.footway ||
                                addressInfo.address.pedestrian ||
                                addressInfo.address.path ||
                                addressInfo.address.cycleway ||
                                '';

                            // If no road name found, try to extract from display_name
                            if (!roadAddress && primaryAddressAddress) {
                                // Try to extract first part of display_name (often contains road name)
                                const parts = primaryAddressAddress.split(',');
                                if (parts.length > 0) {
                                    roadAddress = parts[0].trim();
                                }
                            }
                        } else if (primaryAddressAddress) {
                            // If no address object but we have display_name, use first part as road
                            const parts = primaryAddressAddress.split(',');
                            if (parts.length > 0) {
                                roadAddress = parts[0].trim();
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching address:", error);
                }

                // Create new obstruction point with address data
                const newObstructionPoint = {
                    id: generateUniqueId(),
                    lat: clickCoords.lat,
                    lng: clickCoords.lng,
                    type: obstructionType,
                    data: JSON.stringify({
                        typeOfObstruction: obstructionType,
                        descriptionOfObstruction: '',
                        primaryRoadAddress: primaryAddressAddress,
                        roadAddress: roadAddress
                    }),
                    distance: 0,
                    alt: 0,
                    head: 0,
                    dateUpdated: new Date().toISOString()
                };

                console.log(`Will insert new obstruction point at index ${insertIndex}:`, newObstructionPoint.id);
                console.log("Address data:", { primaryAddressAddress, roadAddress });

                // Emit the obstruction add event
                emit('obstruction-add', {
                    segment,
                    startIndex,
                    endIndex,
                    insertIndex,
                    newObstructionPoint,
                    clickCoords,
                    obstructionType
                });
            }
        }
    }
    hideContextMenu();
};

const convertRoutePointToObstruction = async (obstructionType) => {
    if (contextMenu.value.targetType === 'marker' && contextMenu.value.targetPoint?.type === 'route_point') {
        const routePoint = contextMenu.value.targetPoint;
        const pointIndex = contextMenu.value.targetIndex;

        console.log("=== CONVERTING ROUTE POINT TO OBSTRUCTION ===");
        console.log("Route point:", routePoint.id);
        console.log("Obstruction type:", obstructionType);
        console.log("Point index:", pointIndex);

        // Fetch address from coordinates
        let roadAddress = '';
        let primaryAddressAddress = '';

        try {
            const addressInfo = await getAddressFromCoordinates(routePoint.lat, routePoint.lng);
            if (addressInfo) {
                // Extract primary address (full address string)
                primaryAddressAddress = addressInfo.display_name || '';

                // Extract road address from the address object
                if (addressInfo.address) {
                    // Try to get road name from various possible fields
                    roadAddress = addressInfo.address.road ||
                        addressInfo.address.highway ||
                        addressInfo.address.street ||
                        addressInfo.address.footway ||
                        addressInfo.address.pedestrian ||
                        addressInfo.address.path ||
                        addressInfo.address.cycleway ||
                        '';

                    // If no road name found, try to extract from display_name
                    if (!roadAddress && primaryAddressAddress) {
                        // Try to extract first part of display_name (often contains road name)
                        const parts = primaryAddressAddress.split(',');
                        if (parts.length > 0) {
                            roadAddress = parts[0].trim();
                        }
                    }
                } else if (primaryAddressAddress) {
                    // If no address object but we have display_name, use first part as road
                    const parts = primaryAddressAddress.split(',');
                    if (parts.length > 0) {
                        roadAddress = parts[0].trim();
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }

        // Parse existing data or create new object
        let pointData = {};
        try {
            if (routePoint.data && routePoint.data !== '') {
                pointData = JSON.parse(routePoint.data);
            }
        } catch (error) {
            console.error("Error parsing existing point data:", error);
        }

        // Update the data object with obstruction information
        pointData.typeOfObstruction = obstructionType;
        pointData.descriptionOfObstruction = pointData.descriptionOfObstruction || '';
        pointData.primaryRoadAddress = primaryAddressAddress;
        pointData.roadAddress = roadAddress;

        // Create updated point object
        const updatedPoint = {
            ...routePoint,
            type: obstructionType,
            data: JSON.stringify(pointData),
            dateUpdated: new Date().toISOString()
        };

        console.log("Converted point data:", {
            type: obstructionType,
            primaryRoadAddress: primaryAddressAddress,
            roadAddress: roadAddress
        });

        // Emit the conversion event
        emit('route-point-convert', {
            point: updatedPoint,
            index: pointIndex,
            obstructionType: obstructionType,
            originalPoint: routePoint
        });
    }
    hideContextMenu();
};

// Initialize minimap
const initializeMinimap = () => {
    if (!window.L || !minimapRef.value) {
        return;
    }

    // Wait for DOM element to be ready
    nextTick(() => {
        if (!minimapRef.value) {
            return;
        }

        try {
            // Initialize minimap
            minimap.value = window.L.map(minimapId.value, {
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                touchZoom: false,
                doubleClickZoom: false,
                scrollWheelZoom: false,
                boxZoom: false,
                keyboard: false,
                preferCanvas: true
            });

            // Add tile layer to minimap
            minimapTileLayer.value = window.L.tileLayer(tileLayerUrl.value, {
                attribution: ''
            });
            minimapTileLayer.value.addTo(minimap.value);

            // Update minimap view
            updateMinimap();
        } catch (error) {
            console.warn('Error initializing minimap:', error);
        }
    });
};

// Function to update minimap view
const updateMinimap = () => {
    if (!minimap.value || !map.value) return;

    // Update minimap zoom (always 5 levels zoomed out from main map)
    const currentZoom = map.value.getZoom();
    const newZoom = Math.max(minZoom.value, currentZoom - 5);

    // If there's a route, fit bounds to show the entire route
    if (props.routePoints && props.routePoints.length > 0) {
        // Collect all valid points
        const validPoints = props.routePoints.filter(p =>
            p.lat && p.lng &&
            !isNaN(p.lat) && !isNaN(p.lng) &&
            p.lat >= -90 && p.lat <= 90 &&
            p.lng >= -180 && p.lng <= 180
        );

        if (validPoints.length > 0) {
            // Calculate bounds
            const lats = validPoints.map(p => p.lat);
            const lngs = validPoints.map(p => p.lng);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            try {
                const bounds = window.L.latLngBounds(
                    [minLat, minLng],
                    [maxLat, maxLng]
                );
                minimap.value.fitBounds(bounds, { padding: [20, 20] });
            } catch (error) {
                // Fallback: center on route with appropriate zoom
                const centerLat = (minLat + maxLat) / 2;
                const centerLng = (minLng + maxLng) / 2;
                minimap.value.setView([centerLat, centerLng], newZoom);
            }
        } else {
            // Otherwise, follow the main map center but with zoomed out view
            const center = map.value.getCenter();
            minimap.value.setView([center.lat, center.lng], newZoom);
        }
    } else {
        // Otherwise, follow the main map center but with zoomed out view
        const center = map.value.getCenter();
        minimap.value.setView([center.lat, center.lng], newZoom);
    }

    // Update minimap markers and polylines
    updateMinimapContent();
};

// Update minimap content (markers and polylines)
const updateMinimapContent = () => {
    if (!minimap.value) return;

    // Clear existing minimap markers and polylines
    minimapMarkers.value.forEach(marker => minimap.value.removeLayer(marker));
    minimapPolylines.value.forEach(polyline => minimap.value.removeLayer(polyline));
    minimapMarkers.value = [];
    minimapPolylines.value = [];

    // Add start/end markers to minimap
    if (props.routePoints.length > 0) {
        const startPoint = props.routePoints[0];
        if (startPoint.lat && startPoint.lng) {
            const startMarker = createMinimapMarker(startPoint, 'start');
            if (startMarker) {
                minimapMarkers.value.push(startMarker);
                minimap.value.addLayer(startMarker);
            }
        }

        if (props.routePoints.length > 1) {
            const endPoint = props.routePoints[props.routePoints.length - 1];
            if (endPoint.lat && endPoint.lng) {
                const endMarker = createMinimapMarker(endPoint, 'end');
                if (endMarker) {
                    minimapMarkers.value.push(endMarker);
                    minimap.value.addLayer(endMarker);
                }
            }
        }
    }

    // Add route polyline to minimap
    if (props.routePoints.length > 1) {
        const routePath = props.routePoints
            .filter(point => point.lat && point.lng && !isNaN(point.lat) && !isNaN(point.lng))
            .map(point => [point.lat, point.lng]);

        if (routePath.length > 1) {
            const polyline = window.L.polyline(routePath, {
                color: routeColor.value,
                weight: 2,
                opacity: 0.6,
                interactive: false
            });
            polyline.addTo(minimap.value);
            minimapPolylines.value.push(polyline);
        }
    }
};

// Create a minimap marker
const createMinimapMarker = (point, type) => {
    if (!point.lat || !point.lng || isNaN(point.lat) || isNaN(point.lng)) {
        return null;
    }

    const marker = window.L.marker([point.lat, point.lng], {
        interactive: false,
        draggable: false
    });

    // Create custom icon based on type - matching main map markers exactly
    let iconHtml = '';
    let iconSize = [32, 32];
    let iconAnchor = [16, 16];

    if (type === 'start' || type === 'end') {
        // Start/end markers with dark blue background and white image - identical to main map
        const startEndClass = type === 'start' ? 'custom-icon start-end start-icon' : 'custom-icon start-end end-icon';
        iconHtml = `<div class="${startEndClass}"><img src="/media/marker_location.png" width="24" height="24" alt="${type === 'start' ? 'Start' : 'End'}"><span class="inner-dot"></span></div>`;
        iconSize = [32, 32];
        iconAnchor = [16, 16];
    }

    const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon',
        iconSize: iconSize,
        iconAnchor: iconAnchor
    });

    marker.setIcon(customIcon);
    return marker;
};

// Map control methods
const setMapStyle = (style) => {
    mapStyle.value = style;
    saveRouteMapStateToStorage(null, null, style);

    if (['osm', 'satellite', 'standard'].includes(style) && !useMapLibre.value) {
        // Leaflet logic
        if (map.value && tileLayer.value) {
            map.value.removeLayer(tileLayer.value);
            tileLayer.value = window.L.tileLayer(tileLayerUrl.value, {
                attribution: '© OpenStreetMap contributors'
            });
            tileLayer.value.addTo(map.value);
        }
        
        // Update minimap tile layer
        if (minimap.value && minimapTileLayer.value) {
            minimap.value.removeLayer(minimapTileLayer.value);
            minimapTileLayer.value = window.L.tileLayer(tileLayerUrl.value, {
                attribution: ''
            });
            minimapTileLayer.value.addTo(minimap.value);
        }
    }
    // MapLibre logic is handled via watcher on mapStyle
};

// Internal zoom/center functions (don't save state - used for programmatic actions)
const zoomIn = () => {
    if (map.value) {
        map.value.zoomIn();
    }
};

const zoomOut = () => {
    if (map.value) {
        map.value.zoomOut();
    }
};

// Internal centerMap function (doesn't save state - used for programmatic centering)
const centerMap = () => {
    if (map.value && props.routePoints.length > 0) {
        try {
            const validPoints = props.routePoints.filter(p => {
                if (!p.lat || !p.lng) return false;
                if (isNaN(p.lat) || isNaN(p.lng)) return false;
                if (p.lat < -90 || p.lat > 90) return false;
                if (p.lng < -180 || p.lng > 180) return false;
                return true;
            });

            if (validPoints.length === 0) {
                console.warn('No valid coordinates found for centering map');
                return;
            }

            // In View mode (editMode=false), always zoom to fit the route
            if (!props.editMode) {
                // Calculate bounds to fit all points
                const bounds = window.L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
                map.value.fitBounds(bounds, { padding: [20, 20] });
            } else {
                // In Edit mode, always use saved params - never fit to route
                const savedZoom = localStorage.getItem(ROUTE_MAP_ZOOM_STORAGE_KEY);
                const savedCenter = localStorage.getItem(ROUTE_MAP_CENTER_STORAGE_KEY);

                if (savedCenter && savedZoom) {
                    try {
                        const center = JSON.parse(savedCenter);
                        const zoomLevel = parseInt(savedZoom, 10);
                        if (Array.isArray(center) && center.length === 2 && !isNaN(zoomLevel)) {
                            // Use saved position - don't fit to route
                            map.value.setView(center, zoomLevel);
                            return;
                        }
                    } catch (e) {
                        // Fall through - will keep current position
                    }
                }

                // If no saved params, keep current map position - don't change it
                // This preserves the position when switching from view to edit mode
                return;
            }

        } catch (error) {
            console.error('Error centering map:', error);
            try {
                map.value.setView([0, 0], 2);
            } catch (fallbackError) {
                console.error('Fallback centering also failed:', fallbackError);
            }
        }
    }
};

// Save map state to localStorage (only called on user input or map load)
const saveMapState = () => {
    if (map.value) {
        const currentZoom = map.value.getZoom();
        const currentCenter = map.value.getCenter();
        saveRouteMapStateToStorage([currentCenter.lat, currentCenter.lng], currentZoom, null);
    }
};

// Wrapper functions for user input actions that save state
const handleZoomIn = () => {
    zoomIn();
    // Save after user zooms in
    setTimeout(() => {
        saveMapState();
    }, 100);
};

const handleZoomOut = () => {
    zoomOut();
    // Save after user zooms out
    setTimeout(() => {
        saveMapState();
    }, 100);
};

const handleCenterMap = () => {
    centerMap();
    // Save after user centers map
    setTimeout(() => {
        saveMapState();
    }, 100);
};

// Watch for route points changes
watch(() => props.routePoints, () => {
    if (isMapInitialized.value) {
        // Don't update markers if we're currently dragging - marker is handled manually
        if (isDragging.value) {
            return;
        }

        // Clear any existing timeout
        if (markerUpdateTimeout) {
            clearTimeout(markerUpdateTimeout);
        }

        // Debounce marker updates to prevent rapid recreation
        markerUpdateTimeout = setTimeout(() => {
            if (!isDragging.value) {
                addMarkersToMap();
                addPolylineToMap();
                addSegmentsToMap();
                // Update minimap
                if (minimap.value) {
                    updateMinimap();
                }
            }
        }, 200);
    }
}, { deep: true });

// Watch for selected marker changes
watch(() => props.selectedMarker, (newMarker) => {
    if (newMarker && map.value) {
        const point = newMarker.point;
        map.value.setView([point.lat, point.lng], Math.max(props.zoom, 16));
    }
});

// Watch map style to update minimap
watch(() => mapStyle.value, () => {
    if (minimap.value) {
        nextTick(() => {
            updateMinimap();
        });
    }
});

// Removed reactive watcher for map state changes
// Map state is now only loaded on mount, not reactively updated
// This prevents unwanted map updates when reactive values change

// Note: Storage event listeners are kept for cross-tab synchronization but won't trigger reactive updates

// Lifecycle
let resizeObserver = null;

onMounted(() => {
    nextTick(() => {
        initializeMap();
        
        // Setup ResizeObserver for robust map resizing (fixes Firefox/SplitPane issues)
        // Use mapWrapper instead of mapRef since mapRef can be a Vue component instance
        if (mapWrapper.value && mapWrapper.value instanceof Element) {
            resizeObserver = new ResizeObserver(() => {
                if (map.value) {
                    map.value.invalidateSize();
                }
            });
            resizeObserver.observe(mapWrapper.value);
        }
    });

    // Add global click handler to hide context menu
    document.addEventListener('click', hideContextMenu);
    
    // Add event listener for map state changes
    window.addEventListener(MAP_STATE_CHANGED_EVENT, handleMapStateChange);
});

onUnmounted(() => {
    // Disconnect resize observer
    if (resizeObserver) {
        resizeObserver.disconnect();
    }

    // Clear any pending marker updates
    if (markerUpdateTimeout) {
        clearTimeout(markerUpdateTimeout);
    }

    // Remove global click handler
    document.removeEventListener('click', hideContextMenu);
    
    // Cleanup map move end timeout if it exists
    if (mapMoveEndTimeout) {
        clearTimeout(mapMoveEndTimeout);
    }

    if (map.value) {
        try {
            // Remove all markers
            markers.value.forEach(marker => {
                map.value.removeLayer(marker);
            });
            markers.value = [];

            // Remove all polylines
            polylines.value.forEach(polyline => {
                map.value.removeLayer(polyline);
            });
            polylines.value = [];

            // Clear the map completely
            map.value.remove();
            map.value = null;
        } catch (mapError) {
            console.warn('Error during map cleanup:', mapError);
        }
    }

    // Cleanup minimap
    if (minimap.value) {
        try {
            // Remove all minimap markers
            minimapMarkers.value.forEach(marker => {
                minimap.value.removeLayer(marker);
            });
            minimapMarkers.value = [];

            // Remove all minimap polylines
            minimapPolylines.value.forEach(polyline => {
                minimap.value.removeLayer(polyline);
            });
            minimapPolylines.value = [];

    // Clear the minimap completely
            minimap.value.remove();
            minimap.value = null;
        } catch (minimapError) {
            console.warn('Error during minimap cleanup:', minimapError);
        }
    }
    window.removeEventListener(MAP_STATE_CHANGED_EVENT, handleMapStateChange);
});

// Expose map instance to parent components
defineExpose({
    get leafletObject() {
        return useMapLibre.value ? null : map.value; // todo maplibre instance support
    },
    get map() {
        return map.value;
    },
    // Expose mapRef for resize observer
    mapRef
});
</script>

<style scoped>
.route-map-container {
    position: relative;
    height: 100%;
    width: 100%;

    /* Top corners are rectangular (no border radius) */
    border-radius: 0;
    overflow: hidden;
}

.leaflet-map {
    height: 100%;
    width: 100%;
    z-index: 1;
}

.route-map-container :deep(.leaflet-container) {
    border-radius: 0 !important;
}

.route-map-container :deep(.leaflet-map-pane),
.route-map-container :deep(.leaflet-tile-pane),
.route-map-container :deep(.leaflet-overlay-pane) {
    border-radius: 0;
}

.route-map-container :deep(.leaflet-control-container) {
    border-radius: 0;
}

.map-style-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    display: flex;
    gap: 5px;
}

.map-controls {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.control-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Custom marker styles - following PlannedRouteMapRefactored structure */
.custom-icon:not(.route-point) {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333B56;
    font-weight: bold;
    font-size: 12px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
    background-color: #f8f9fa;
}

/* Start and end point markers - solid dark blue */
.custom-icon.start-end {
    background-color: #333B56 !important;
    border: 3px solid #333B56 !important;
    color: white !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    transform: none !important;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%) !important;
    padding: 0 !important;
    margin: 0 !important;
    outline: none !important;
    position: relative !important;
}

/* Start point has green border to differentiate from end point */
.custom-icon.start-end.start-icon,
.start-icon.start-end {
    border: 3px solid var(--success) !important;
}

.custom-icon.start-end img {
    filter: brightness(0) invert(1);
    border: none !important;
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
    width: 24px !important;
    height: 24px !important;
}

.inner-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background-color: white;
    border-radius: 50%;
    z-index: 10;
    pointer-events: none;
}

.inner-dot.minimap-dot {
    width: 4px;
    height: 4px;
}

/* Survey point markers */
.custom-icon.survey-point {
    background-color: #f8f9fa !important;
    border: 3px solid #333B56 !important;
    color: #333B56 !important;
}

.custom-icon.survey-point img {
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
    background: transparent !important;
}

/* Route point markers */
.custom-icon.route-point {
    background-color: #6c757d !important;
    border: 3px solid #495057 !important;
    color: white !important;
    width: 16px !important;
    height: 16px !important;
    font-size: 8px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%) !important;
}

.custom-icon.route-point i {
    color: white !important;
    font-size: 8px !important;
    position: relative !important;
    z-index: 1 !important;
}

.custom-icon i {
    color: #333B56;
    font-size: 12px;
    position: relative;
    z-index: 1;
}

/* Ensure Leaflet markers get proper styling */
.custom-marker-icon {
    background: transparent !important;
    border: none !important;
}

.custom-marker-icon .custom-icon {
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* Global styles for Leaflet markers */
:global(.leaflet-marker-icon) {
    background: transparent !important;
    border: none !important;
}

:global(.leaflet-marker-icon .custom-icon) {
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* Force background colors for marker types */
:global(.leaflet-marker-icon .custom-icon.start-end) {
    background-color: #333B56 !important;
    border: 3px solid #333B56 !important;
    color: white !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    transform: none !important;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%) !important;
    padding: 0 !important;
    margin: 0 !important;
    outline: none !important;
}

/* Start point has green border */
:global(.leaflet-marker-icon .custom-icon.start-end.start-icon) {
    border: 3px solid var(--success) !important;
}

:global(.leaflet-marker-icon .custom-icon.start-end img) {
    border: none !important;
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
    width: 24px !important;
    height: 24px !important;
}

:global(.leaflet-marker-icon .custom-icon.survey-point) {
    background-color: #f8f9fa !important;
    border: 3px solid #333B56 !important;
    color: #333B56 !important;
    width: 30px !important;
    height: 30px !important;
    border-radius: 50% !important;
}

:global(.leaflet-marker-icon .custom-icon.route-point) {
    background-color: #6c757d !important;
    border: 3px solid #495057 !important;
    color: white !important;
    width: 16px !important;
    height: 16px !important;
    border-radius: 50% !important;
}

/* Ensure route point markers have lower z-index than other markers */

/* Target route point markers using the class we added */
:deep(.leaflet-marker-pane .leaflet-marker-icon.route-point-marker) {
    z-index: 100 !important;
}

/* Other marker types (start, end, survey/obstruction) should have higher z-index */
:deep(.leaflet-marker-pane .leaflet-marker-icon:not(.route-point-marker)) {
    z-index: 1000 !important;
}

/* Context Menu Styles - Design System */
.context-menu {
    position: fixed;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    min-width: 150px;
    pointer-events: auto;
    padding: var(--spacing-2xs) 0;
}

.context-menu-item {
    padding: var(--spacing-xs) var(--spacing-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-normal);
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    transition: background-color var(--transition-fast);
}

.context-menu-item:last-child {
    border-bottom: none;
}

.context-menu-item:hover {
    background-color: var(--bg-elevated);
}

.context-menu-item:active {
    background-color: var(--bg-elevated);
}

.context-menu-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.context-menu-item.disabled:hover {
    background-color: transparent;
}

.context-menu-item i {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    flex-shrink: 0;
}

.context-menu-item-with-submenu {
    position: relative;
}

.submenu-indicator {
    margin-left: auto;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
}

.context-submenu {
    position: absolute;
    left: 100%;
    top: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    min-width: 180px;
    z-index: 10001;
    margin-left: var(--spacing-2xs);
    padding: var(--spacing-2xs) 0;
}

.context-submenu .context-menu-item {
    padding: var(--spacing-xs) var(--spacing-sm);
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
}

.context-submenu .context-menu-item:last-child {
    border-bottom: none;
}

.context-submenu .context-menu-item img {
    vertical-align: middle;
    flex-shrink: 0;
}

/* Dark mode: Make icons white */
[data-bs-theme="dark"] .context-submenu .context-menu-item img {
    filter: brightness(0) invert(1) !important;
}

[data-bs-theme="dark"] .context-submenu .context-menu-item i {
    color: white !important;
}

/* Minimap styling */
.minimap-container {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    width: 200px;
    height: 150px;
    z-index: 1001;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    border: 2px solid var(--border);
    background: var(--bg-surface);
    pointer-events: all;
}

.minimap-leaflet-map {
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.minimap-container :deep(.leaflet-container) {
    width: 100% !important;
    height: 100% !important;
    pointer-events: none !important;
    cursor: default !important;
    background: #fff;
}

.minimap-container :deep(.leaflet-control-container) {
    display: none !important;
}

.minimap-container :deep(.leaflet-marker-icon) {
    pointer-events: none !important;
}

.minimap-container :deep(.leaflet-interactive) {
    pointer-events: none !important;
}

.minimap-icon {
    font-size: 8px !important;
}

.minimap-icon .marker-label {
    font-size: 10px !important;
}

@media (width <= 768px) {
    .route-map-container {
        height: 100%;
        min-height: 250px;
    }

    .leaflet-map {
        height: 100% !important;
        min-height: 250px !important;
    }

    .route-map-container :deep(.leaflet-container) {
        height: 100% !important;
        min-height: 250px !important;
    }

    .minimap-container {
        width: 150px;
        height: 112px;
        bottom: 0.5rem;
        right: 0.5rem;
    }
}
</style>
