<template>
    <div class="planned-route-map">
        <!-- Map Container -->
        <div class="map-container" :data-editing="editing">
            <l-map ref="mapRef" v-model:zoom="zoom" :center="mapCenter" :use-global-leaflet="false" :min-zoom="minZoom"
                :max-zoom="maxZoom" @ready="onMapReadyEnhanced" :options="{ zoomControl: false }"
                @dblclick="onMapClickWithPoi" @moveend="onMapMoveEnd">
                <l-tile-layer :url="tileLayerUrl" layer-type="base" :name="mapStyleLabel"
                    :class="{ 'map-theme-blue': mapStyle === 'blue' }" />

                <!-- Start Marker -->
                <l-marker v-if="startPoint" :lat-lng="{ lat: startPoint.lat, lng: startPoint.lng }" :draggable="editing"
                    @dragend="onStartMarkerDragEnd">
                    <l-icon :icon-anchor="[16, 16]" :icon-size="[32, 32]">
                        <div class="custom-marker-icon">
                            <div class="custom-icon start-end start-icon" :class="{ 'loading': loadingStartPoint }">
                                <div class="purple-circle"></div>
                                <img v-if="!loadingStartPoint" src="/media/marker_location.png" width="24" height="24"
                                    alt="Start">
                                <span v-if="!loadingStartPoint" class="inner-dot"></span>
                                <div v-else class="loading-spinner"></div>
                            </div>
                        </div>
                    </l-icon>
                </l-marker>

                <!-- End Marker -->
                <l-marker v-if="endPoint" :lat-lng="{ lat: endPoint.lat, lng: endPoint.lng }" :draggable="editing"
                    @dragend="onEndMarkerDragEnd">
                    <l-icon :icon-anchor="[16, 16]" :icon-size="[32, 32]">
                        <div class="custom-marker-icon">
                            <div class="custom-icon start-end end-icon" :class="{ 'loading': loadingEndPoint }">
                                <div class="purple-circle"></div>
                                <img v-if="!loadingEndPoint" src="/media/marker_location.png" width="24" height="24"
                                    alt="End">
                                <span v-if="!loadingEndPoint" class="inner-dot"></span>
                                <div v-else class="loading-spinner"></div>
                            </div>
                        </div>
                    </l-icon>
                </l-marker>

                <!-- Waypoint Markers -->
                <l-marker v-for="(waypoint, index) in waypoints" :key="`waypoint-${index}`"
                    :lat-lng="{ lat: waypoint.lat, lng: waypoint.lng }" :draggable="editing"
                    @dragend="onWaypointDragEnd($event, index)"
                    @contextmenu="editing ? onWaypointContextMenu($event, index) : null"
                    @click="editing ? onWaypointClick(index) : null"
                    :class="{ 'selected': selectedWaypoint === index }">
                    <l-icon :icon-anchor="[12, 24]" :icon-size="[24, 24]">
                        <div class="custom-icon waypoint-icon"
                            :class="{ 'loading': loadingWaypoints[index], 'selected': selectedWaypoint === index }">
                            <div v-if="!loadingWaypoints[index]" class="waypoint-content">
                                <span class="waypoint-index">{{ index + 1 }}</span>
                            </div>
                            <div v-else class="loading-spinner"></div>
                        </div>
                    </l-icon>
                </l-marker>

                <!-- POI Markers -->
                <l-marker v-for="(poi, index) in pois" :key="`poi-${index}`" :lat-lng="{ lat: poi.lat, lng: poi.lng }"
                    :draggable="editing" @dragend="onPoiDragEnd($event, index)"
                    @contextmenu="editing ? onPoiContextMenu($event, index) : null"
                    @click="editing ? onPoiClick(index) : null" :class="{ 'selected': selectedPoi === index }">
                    <l-icon :icon-anchor="[12, 24]" :icon-size="[24, 24]">
                        <div class="custom-icon poi-icon" :class="{ 'selected': selectedPoi === index, [`type-${poi.type}`]: true }">
                            <i :class="getPoiIcon(poi.type)"></i>
                        </div>
                    </l-icon>
                </l-marker>

                <!-- Route Segments -->
                <l-polyline v-for="segment in segments" :key="segment.id" :lat-lngs="segment.coordinates"
                    :color="getSegmentColor(segment)" :weight="getSegmentWeight(segment)" :opacity="0.8"
                    @click="(event) => onSegmentClick(event, waypoints, routePath, updateModelValue, loadingWaypoints)"
                    @contextmenu="(event) => onSegmentRightClick(event, segment)" @mouseover="onSegmentHover(segment)"
                    @mouseout="onSegmentLeave" class="route-segment" :class="{
                        'selected': selectedSegment?.id === segment.id,
                        'hovered': hoveredSegment?.id === segment.id,
                        'snapped': segment.isSnapped
                    }" />

                <!-- Fallback single route path for when no segments are available -->
                <l-polyline v-if="routePath.length > 1 && segments.length === 0" :lat-lngs="routePath"
                    :color="'#333B56'" :weight="6" @click="editing ? onRouteClick : null" />
            </l-map>

            <!-- Minimap -->
            <div v-if="editing" class="minimap-container">
                <l-map ref="minimapRef" v-model:zoom="minimapZoom" :center="minimapCenter" :use-global-leaflet="false"
                    :min-zoom="minZoom" :max-zoom="maxZoom" @ready="onMinimapReady" :options="{
                        zoomControl: false,
                        dragging: false,
                        touchZoom: false,
                        doubleClickZoom: false,
                        scrollWheelZoom: false,
                        boxZoom: false,
                        keyboard: false,
                        attributionControl: false
                    }">
                    <l-tile-layer :url="tileLayerUrl" layer-type="base" :name="mapStyleLabel"
                        :class="{ 'map-theme-blue': mapStyle === 'blue' }" />

                    <!-- Start Marker -->
                    <l-marker v-if="startPoint" :lat-lng="{ lat: startPoint.lat, lng: startPoint.lng }"
                        :draggable="false">
                        <l-icon :icon-anchor="[16, 16]" :icon-size="[32, 32]">
                            <div class="custom-marker-icon">
                                <div class="custom-icon start-end start-icon" :class="{ 'loading': loadingStartPoint }">
                                    <div class="purple-circle"></div>
                                    <img v-if="!loadingStartPoint" src="/media/marker_location.png" width="24"
                                        height="24" alt="Start">
                                    <span v-if="!loadingStartPoint" class="inner-dot"></span>
                                    <div v-else class="loading-spinner"></div>
                                </div>
                            </div>
                        </l-icon>
                    </l-marker>

                    <!-- End Marker -->
                    <l-marker v-if="endPoint" :lat-lng="{ lat: endPoint.lat, lng: endPoint.lng }" :draggable="false">
                        <l-icon :icon-anchor="[16, 16]" :icon-size="[32, 32]">
                            <div class="custom-marker-icon">
                                <div class="custom-icon start-end end-icon" :class="{ 'loading': loadingEndPoint }">
                                    <div class="purple-circle"></div>
                                    <img v-if="!loadingEndPoint" src="/media/marker_location.png" width="24" height="24"
                                        alt="End">
                                    <span v-if="!loadingEndPoint" class="inner-dot"></span>
                                    <div v-else class="loading-spinner"></div>
                                </div>
                            </div>
                        </l-icon>
                    </l-marker>

                    <!-- Waypoint Markers -->
                    <l-marker v-for="(waypoint, index) in waypoints" :key="`minimap-waypoint-${index}`"
                        :lat-lng="{ lat: waypoint.lat, lng: waypoint.lng }" :draggable="false"
                        :class="{ 'selected': selectedWaypoint === index }">
                        <l-icon :icon-anchor="[12, 24]" :icon-size="[24, 24]">
                            <div class="custom-icon waypoint-icon"
                                :class="{ 'loading': loadingWaypoints[index], 'selected': selectedWaypoint === index }">
                                <div v-if="!loadingWaypoints[index]" class="waypoint-content">
                                    <span class="waypoint-index">{{ index + 1 }}</span>
                                </div>
                                <div v-else class="loading-spinner"></div>
                            </div>
                        </l-icon>
                    </l-marker>

                    <!-- POI Markers -->
                    <l-marker v-for="(poi, index) in pois" :key="`minimap-poi-${index}`"
                        :lat-lng="{ lat: poi.lat, lng: poi.lng }" :draggable="false"
                        :class="{ 'selected': selectedPoi === index }">
                        <l-icon :icon-anchor="[12, 24]" :icon-size="[24, 24]">
                            <div class="custom-icon poi-icon"
                                :class="{ 'selected': selectedPoi === index, [`type-${poi.type}`]: true }">
                                <i :class="getPoiIcon(poi.type)"></i>
                            </div>
                        </l-icon>
                    </l-marker>

                    <!-- Route Segments -->
                    <l-polyline v-for="segment in segments" :key="`minimap-segment-${segment.id}`"
                        :lat-lngs="segment.coordinates" :color="getSegmentColor(segment)" :weight="2" :opacity="0.6" />

                    <!-- Fallback single route path -->
                    <l-polyline v-if="routePath.length > 1 && segments.length === 0" :lat-lngs="routePath"
                        :color="'#333B56'" :weight="2" :opacity="0.6" />
                </l-map>
            </div>

            <!-- Map Controls Container -->
            <div class="map-controls">
                <!-- Map Style Controls -->
                <!-- Map Style Controls (Collapsible) -->
                <div class="map-controls-top-right collapsible-controls">
                    <div class="collapsible-trigger">
                        <button type="button" class="style-btn active-trigger" :title="t('changeMapStyle')">
                            <i v-if="mapStyle === 'blue'" class="bi bi-droplet-fill" style="color: #00bcd4;"></i>
                            <i v-else-if="mapStyle === 'dark'" class="bi bi-moon-stars-fill"></i>
                            <i v-else-if="mapStyle === 'light'" class="bi bi-brightness-high-fill"></i>
                            <i v-else-if="mapStyle === 'satellite'" class="bi bi-image"></i>
                            <i v-else-if="mapStyle === 'osm'" class="bi bi-map"></i>
                        </button>
                    </div>
                    <div class="collapsible-content">
                        <button type="button" class="style-btn" :class="{ active: mapStyle === 'blue' }"
                            @click="setMapStyle('blue')" :title="t('brandBlue') || 'Brand Blue'">
                            <i class="bi bi-droplet-fill" style="color: #00bcd4;"></i>
                        </button>
                        <button type="button" class="style-btn" :class="{ active: mapStyle === 'dark' }"
                            @click="setMapStyle('dark')" :title="t('darkMode') || 'Dark Mode'">
                            <i class="bi bi-moon-stars-fill"></i>
                        </button>
                        <button type="button" class="style-btn" :class="{ active: mapStyle === 'light' }"
                            @click="setMapStyle('light')" :title="t('lightMode') || 'Light Mode'">
                            <i class="bi bi-brightness-high-fill"></i>
                        </button>
                        <button type="button" class="style-btn" :class="{ active: mapStyle === 'satellite' }"
                            @click="setMapStyle('satellite')" :title="t('satellite') || 'Satellite'">
                            <i class="bi bi-image"></i>
                        </button>
                        <button type="button" class="style-btn" :class="{ active: mapStyle === 'osm' }"
                            @click="setMapStyle('osm')" :title="t('openStreetMap') || 'OpenStreetMap'">
                            <i class="bi bi-map"></i>
                        </button>
                    </div>
                </div>

                <!-- Map Controls -->
                <div class="map-controls-top-left">
                    <button type="button" class="control-btn" @click="toggleSearchField"
                        :class="{ active: showSearchField }">
                        <i class="bi bi-search"></i>
                    </button>
                    <button type="button" class="control-btn" @click="handleZoomIn">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                    <button type="button" class="control-btn" @click="handleZoomOut">
                        <i class="bi bi-dash-lg"></i>
                    </button>
                    <!-- <button type="button" class="control-btn" @click="centerMap">
                        <i class="bi bi-geo-alt"></i>
                    </button> -->
                    <button v-if="hasRoute" type="button" class="control-btn zoom-to-route-btn" @click="handleCenterMap"
                        :title="t('zoomToRoute')">
                        <i class="bi bi-arrows-angle-contract"></i>
                    </button>
                </div>

                <!-- Undo/Redo Controls -->
                <div v-if="editing && (canUndo || canRedo)" class="undo-redo-controls">
                    <button v-if="canUndo" type="button" class="control-btn undo-btn"
                        @click="() => { console.log('Undo button clicked'); performUndo(); }" :title="undoTitle">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button v-if="canRedo" type="button" class="control-btn redo-btn"
                        @click="() => { console.log('Redo button clicked'); performRedo(); }" :title="redoTitle">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                    <!-- <BaseButton v-if="routeMarkers.length > 0" variant="danger" size="small"
                        class="action-btn clear-route-markers-btn" @click="clearRouteMarkers">
                        <i class="bi bi-x-circle"></i> {{ t('clearRouteMarkers') }}
                    </BaseButton>
                    <BaseButton variant="danger" size="small" class="control-btn clear-route-btn"
                        @click="clearRouteWithState">
                        <i class="bi bi-trash"></i> {{ t('clearRoute') }}
                    </BaseButton> -->
                </div>
            </div>

            <!-- Route Actions -->
            <!-- <div v-if="editing" class="route-actions">
                <button type="button" v-if="routeMarkers.length > 0" class="action-btn clear-route-markers-btn"
                    @click="clearRouteMarkers">
                    <i class="bi bi-x-circle"></i> {{ t('clearRouteMarkers') }}
                </button>
                <button type="button" class="action-btn clear-route-btn" @click="clearRouteWithState">
                    <i class="bi bi-trash"></i> {{ t('clearRoute') }}
                </button>
            </div> -->

            <!-- POI Controls -->
            <div v-if="editing" class="poi-controls">
                <!-- <button type="button" class="action-btn poi-mode-btn"
                    :class="{ active: poiMode, disabled: !isRouteEstablished() }" @click="togglePoiMode"
                    :disabled="!isRouteEstablished()">
                    <i class="bi bi-geo-alt"></i>
                    <span v-if="!isRouteEstablished()">POI Mode (Route Required)</span>
                    <span v-else>{{ poiMode ? 'Disable POI Mode' : 'Enable POI Mode' }}</span>
                </button> -->
                <button type="button" v-if="pois.length > 0" class="action-btn clear-pois-btn" @click="clearPois">
                    <i class="bi bi-x-circle"></i> Clear POIs
                </button>
            </div>
        </div>

        <!-- Route Information -->
        <!-- <div v-if="routeInfo || loadingRoute" class="route-info">
            <div v-if="loadingRoute" class="loading-route">
                <div class="loading-spinner"></div>
                <span>{{ t('calculatingRoute') }}</span>
            </div>
            <div v-else class="info-items">
                <div class="info-item">
                    <strong>{{ t('totalDistance') }}:</strong> {{ formatDistance(routeInfo.distance) }}
                </div>
                <div class="info-item">
                    <strong>{{ t('estimatedTime') }}:</strong> {{ formatTime(routeInfo.duration) }}
                </div>
                <div class="info-item">
                    <strong>{{ t('waypoints') }}:</strong> {{ waypoints.length }}
                </div>
            </div>
        </div> -->

        <!-- Selected Segment Information -->
        <div v-if="(selectedSegment || hoveredSegment) && editing" class="segment-info">
            <div class="segment-info-content">
                <div class="segment-info-header">
                    <strong>{{ selectedSegment ? 'Selected' : 'Hovered' }} Segment {{ (selectedSegment ||
                        hoveredSegment).index + 1 }}</strong>
                    <button v-if="selectedSegment" type="button" class="close-btn" @click="clearSegmentSelection">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="segment-info-details">
                    <div class="segment-detail">
                        <strong>From:</strong>
                        {{ (selectedSegment || hoveredSegment).startPoint.type === 'start' ? 'Start Point' :
                            (selectedSegment || hoveredSegment).startPoint.type === 'waypoint' ? `Waypoint
                        ${(selectedSegment || hoveredSegment).startPoint.index}` : 'End Point' }}
                    </div>
                    <div class="segment-detail">
                        <strong>To:</strong>
                        {{ (selectedSegment || hoveredSegment).endPoint.type === 'start' ? 'Start Point' :
                            (selectedSegment || hoveredSegment).endPoint.type === 'waypoint' ? `Waypoint ${(selectedSegment
                                || hoveredSegment).endPoint.index}` : 'End Point' }}
                    </div>
                    <div class="segment-detail">
                        <strong>Distance:</strong> {{ formatDistance((selectedSegment || hoveredSegment).distance) }}
                    </div>
                    <div class="segment-detail">
                        <strong>Type:</strong>
                        <span
                            :class="{ 'snapped': (selectedSegment || hoveredSegment).isSnapped, 'straight': !(selectedSegment || hoveredSegment).isSnapped }">
                            {{ (selectedSegment || hoveredSegment).isSnapped ? 'OSRM Route' : 'Straight Line' }}
                        </span>
                    </div>
                    <div v-if="!selectedSegment" class="segment-detail">
                        <em>Click to add waypoint • Right-click to select segment</em>
                    </div>
                    <div v-if="selectedSegment" class="segment-detail">
                        <em>Right-click to deselect • Click to add waypoint</em>
                    </div>
                </div>

                <!-- Segment Actions (only for selected segments) -->
                <div v-if="selectedSegment" class="segment-actions">
                    <button v-if="!selectedSegment.isSnapped" @click="snapSelectedSegment"
                        class="segment-action-btn snap-btn" :disabled="snappingSegment" type="button">
                        <i class="bi bi-arrow-right-circle"></i>
                        {{ snappingSegment ? 'Snapping...' : 'Snap to Route' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Waypoint Mode Indicator -->
        <div v-if="editing && waypointMode" class="waypoint-mode-indicator">
            <i class="bi bi-plus-circle"></i>
            {{ t('clickToAddWaypoint') }}
        </div>

        <!-- POI Mode Indicator -->
        <div v-if="editing && poiMode" class="poi-mode-indicator"
            :class="{ 'route-not-established': !isRouteEstablished() }">
            <i class="bi bi-geo-alt"></i>
            <span v-if="isRouteEstablished()">
                Click outside the route to add POI, on route for normal behavior
            </span>
            <span v-else>
                Please set start point, end point, and draw route first
            </span>
        </div>


        <!-- Waypoint Addition Indicator -->
        <div v-if="editing && addingWaypoint" class="waypoint-addition-indicator">
            <i class="bi bi-plus-circle"></i>
            {{ t('addingWaypoint') }}
        </div>

        <!-- Delete Waypoint Confirmation Modal -->
        <BaseConfirmationModal :visible="showDeleteWaypointModal" title="Delete Waypoint"
            :message="waypointToDelete !== null ? `Are you sure you want to delete waypoint ${waypointToDelete + 1}?` : 'Are you sure you want to delete this waypoint?'"
            :details="waypointToDelete !== null && waypoints[waypointToDelete] ? `Waypoint ${waypointToDelete + 1} at ${waypoints[waypointToDelete].lat?.toFixed(6)}, ${waypoints[waypointToDelete].lng?.toFixed(6)}` : ''"
            details-label="Waypoint" icon="bi bi-exclamation-triangle" icon-color="var(--error)"
            :show-danger-button="true" :show-primary-button="false" danger-text="Delete" danger-icon="bi bi-trash"
            @close="showDeleteWaypointModal = false; waypointToDelete = null"
            @cancel="showDeleteWaypointModal = false; waypointToDelete = null" @confirm="confirmDeleteWaypoint" />

        <!-- Location Search -->
        <div v-if="showSearchField" class="location-search">
            <div class="search-container">
                <input v-model="searchQuery" @input="handleSearchInput" @keyup.enter="searchLocation"
                    :placeholder="t('searchForLocation')" class="search-input" type="text" />
                <button type="button" @click="searchLocation" class="search-btn" :disabled="searching">
                    <i class="bi bi-search"></i>
                </button>
            </div>

            <!-- Search Results -->
            <div v-if="searchResults.length > 0 && showResults" class="search-results">
                <div v-for="result in searchResults" :key="result.place_id" @click="selectSearchResult(result)"
                    class="search-result-item">
                    <div class="result-name">{{ result.display_name }}</div>
                    <div class="result-type">{{ result.type }}</div>
                </div>
            </div>
        </div>

        <!-- Context Menu -->
        <div v-if="contextMenu.visible" class="context-menu"
            :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
            <div v-if="contextMenu.targetType === 'poi'" class="context-menu-item" @click="editPoi">
                <i class="bi bi-pencil"></i>
                Edit POI
            </div>
            <div class="context-menu-item" @click="deleteSelectedItem">
                <i class="bi bi-trash"></i>
                {{ t('delete') }}
            </div>
            <div class="context-menu-item" @click="hideContextMenu">
                <i class="bi bi-x"></i>
                {{ t('cancel') }}
            </div>
        </div>

        <!-- Selection Indicator -->
        <div v-if="editing && selectedWaypoint !== null" class="selection-indicator">
            <span>{{ t('waypointSelected') }} {{ selectedWaypoint + 1 }}</span>
            <button type="button" class="delete-btn" @click="deleteSelectedWaypoint">
                <i class="bi bi-trash"></i>
            </button>
        </div>

        <!-- POI Form Modal -->
        <div v-if="showPoiForm" class="modal-backdrop" @click="closePoiForm">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">{{ editingPoi ? 'Edit POI' : 'Add POI' }}</h5>
                    <button type="button" class="btn-close" @click="closePoiForm"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="savePoi">
                        <div class="mb-3">
                            <label for="poi-title" class="form-label">Title *</label>
                            <input v-model="poiForm.title" id="poi-title" type="text" required
                                placeholder="Enter POI title" class="form-control" />
                        </div>
                        <div class="mb-3">
                            <label for="poi-description" class="form-label">Description</label>
                            <textarea v-model="poiForm.description" id="poi-description" rows="3"
                                placeholder="Enter POI description" class="form-control"></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="poi-type" class="form-label">Type</label>
                            <select v-model="poiForm.type" id="poi-type" class="form-control">
                                <option value="info">Information</option>
                                <option value="warning">Warning</option>
                                <option value="danger">Danger</option>
                                <option value="fuel">Fuel Station</option>
                                <option value="rest">Rest Area</option>
                                <option value="food">Food</option>
                                <option value="hospital">Hospital</option>
                                <option value="police">Police</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary text-white" @click="closePoiForm">Cancel</button>
                    <button type="button" class="btn btn-primary text-white" @click="savePoi">
                        {{ editingPoi ? 'Update POI' : 'Add POI' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { LMap, LTileLayer, LMarker, LPolyline, LIcon } from '@vue-leaflet/vue-leaflet';
import "leaflet/dist/leaflet.css";
import '@/utils/leaflet-icon-fix';

// Import composables
import { useMapState } from './composables/useMapState.js';
import { useRouteState } from './composables/useRouteState.js';
import { useSearchState } from './composables/useSearchState.js';
import { useWaypointMode } from './composables/useWaypointMode.js';
import { useContextMenu } from './composables/useContextMenu.js';
import { useMapControls } from './composables/useMapControls.js';
import { useRouteActions } from './composables/useRouteActions.js';
import { useMapInteractions } from './composables/useMapInteractions.js';
import { useKeyboardEvents } from './composables/useKeyboardEvents.js';
import { useRouteSegments } from './composables/useRouteSegments.js';
import { useUndoRedo } from './composables/useUndoRedo.js';
import { useCursorRadius } from './composables/useCursorRadius.js';

// Import utilities
import { formatDistance, formatTime } from './utils/calculations.js';
import { calculateRoute } from './utils/routeCalculations.js';

// Import UI components
import { BaseConfirmationModal } from '@/components/ui';

const { t } = useI18n();

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({
            startPoint: null,
            endPoint: null,
            waypoints: [],
            routePath: [],
            routeInfo: null
        })
    },
    height: {
        type: String,
        default: '500px'
    },
    editing: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

// Flag to track internal updates
const isInternalUpdate = ref(false);
const isInitialRouteLoad = ref(true); // Track if this is the initial load of route data

// Initialize composables
const {
    zoom,
    minZoom,
    maxZoom,
    mapCenter,
    mapStyle,
    tileLayerUrl,
    mapStyleLabel,
    setMapStyle,
    saveMapCenter,
    updateStateFromStorage
} = useMapState();

const {
    startPoint,
    endPoint,
    waypoints,
    routePath,
    routeInfo,
    routeMarkers,
    loadingStartPoint,
    loadingEndPoint,
    loadingWaypoints,
    loadingRoute,
    clearRoute,
    clearWaypoints,
    clearRouteMarkers
} = useRouteState();

// POI state
const pois = ref([]);
const selectedPoi = ref(null);
const poiMode = ref(false);
const showPoiForm = ref(false);
const editingPoi = ref(null);
const poiForm = ref({
    title: '',
    description: '',
    type: 'info'
});

// Delete waypoint confirmation state
const showDeleteWaypointModal = ref(false);
const waypointToDelete = ref(null);

const {
    searchQuery,
    searchResults,
    showResults,
    searching,
    searchLocation,
    handleSearchInput,
    selectSearchResult: selectSearchResultBase
} = useSearchState();

// Search field visibility state
const showSearchField = ref(false);

// Toggle search field visibility
const toggleSearchField = () => {
    showSearchField.value = !showSearchField.value;
};

const {
    waypointMode,
    selectedWaypoint,
    enableWaypointMode,
    disableWaypointMode,
    onWaypointClick,
    clearSelection
} = useWaypointMode();

const {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    onWaypointContextMenu
} = useContextMenu();

const {
    mapRef,
    onMapReady,
    setMapCenter,
    centerMap: centerMapBase,
    handleResize,
    triggerResize,
    zoomIn,
    zoomOut,
    setCursor,
    cleanupResizeObserver
} = useMapControls();

// Minimap ref and state
const minimapRef = ref(null);
const minimapZoom = ref(zoom.value - 5); // Minimap is zoomed out by 5 levels
const minimapCenter = ref(mapCenter.value);

// Initialize route segments
const {
    selectedSegment,
    hoveredSegment,
    segments,
    getRouteSegments,
    onSegmentClick: onSegmentClickBase,
    onSegmentRightClick,
    onSegmentHover,
    onSegmentLeave,
    clearSegmentSelection,
    snapSegmentToRoute,
    unsnapSegmentToRoute,
    getSegmentColor,
    getSegmentWeight
} = useRouteSegments();

// Function to get current state for undo/redo
const getCurrentState = () => {
    return {
        startPoint: startPoint.value ? {
            lat: startPoint.value.lat,
            lng: startPoint.value.lng,
            ...(startPoint.value.address && { address: startPoint.value.address })
        } : null,
        endPoint: endPoint.value ? {
            lat: endPoint.value.lat,
            lng: endPoint.value.lng,
            ...(endPoint.value.address && { address: endPoint.value.address })
        } : null,
        waypoints: waypoints.value.map(wp => ({
            lat: wp.lat,
            lng: wp.lng,
            ...(wp.address && { address: wp.address })
        })),
        routePath: routePath.value.map(point => [...point]),
        routeInfo: routeInfo.value ? {
            distance: routeInfo.value.distance,
            duration: routeInfo.value.duration
        } : null
    };
};

// Initialize undo/redo functionality
const {
    canUndo,
    canRedo,
    saveState,
    forceSaveState,
    undo,
    redo,
    clearHistory,
    setGetCurrentStateFunction,
    isUndoRedoOperation,
    undoStack,
    redoStack
} = useUndoRedo();

// Set up the getCurrentState function for the undo/redo composable
setGetCurrentStateFunction(getCurrentState);

// Computed properties for undo/redo button titles
const undoTitle = computed(() => {
    return canUndo.value ? `${t('undo')} (${undoStack.value.length})` : t('undo');
});

const redoTitle = computed(() => {
    return canRedo.value ? `${t('redo')} (${redoStack.value.length})` : t('redo');
});

// Computed property to check if there's a route
const hasRoute = computed(() => {
    return (startPoint.value && endPoint.value) ||
        waypoints.value.length > 0 ||
        (routePath.value && routePath.value.length > 0);
});

// Computed property to check if route summary should be visible
const hasRouteSummary = computed(() => {
    return routeInfo.value || startPoint.value || endPoint.value;
});

// State for waypoint addition feedback
const addingWaypoint = ref(false);

// State for segment snapping
const snappingSegment = ref(false);

// Default radius for waypoint placement visualization (in meters)
const waypointRadius = ref(100);

// Initialize cursor radius for waypoint mode
const {
    initializeRadius,
    cleanup: cleanupRadius,
    refresh: refreshRadius
} = useCursorRadius(mapRef, waypointMode, waypointRadius, {
    fillColor: '#ff8c00',
    color: '#ff8c00',
    fillOpacity: 0.1,
    opacity: 0.8
});

// Function to update segments when route changes
const updateSegments = () => {
    // console.log("=== SEGMENT UPDATE DEBUG ===");
    // console.log("Updating segments - waypoints count:", waypoints.value.length);
    // console.log("Route path length:", routePath.value.length);
    getRouteSegments(routePath.value, waypoints.value, startPoint.value, endPoint.value);
    // console.log("Segments updated - total segments:", segments.value.length);
    // console.log("=== END SEGMENT UPDATE DEBUG ===");
};

// Wrapper function for segment click to handle waypoint addition
const onSegmentClick = async (event, waypoints, routePath, updateModelValue, loadingWaypoints) => {
    if (!props.editing) return;
    addingWaypoint.value = true;
    try {
        await onSegmentClickBase(event, waypoints, routePath, updateModelValue, loadingWaypoints);
    } finally {
        // Hide the indicator after a short delay
        setTimeout(() => {
            addingWaypoint.value = false;
        }, 1000);
    }
};

// Function to snap a selected segment to the route
const snapSelectedSegment = async () => {
    if (!props.editing) return;
    if (selectedSegment.value && !snappingSegment.value) {
        snappingSegment.value = true;
        try {
            console.log('Starting snap for segment:', selectedSegment.value.id);

            // Force save state before snapping
            if (!isUndoRedoOperation.value) {
                forceSaveState();
            }

            await snapSegmentToRoute(
                selectedSegment.value,
                routePath,
                waypoints,
                startPoint,
                endPoint,
                updateModelValue
            );
        } catch (error) {
            console.error('Error in snapSelectedSegment:', error);
        } finally {
            snappingSegment.value = false;
        }
    }
};

// Function to perform undo
const performUndo = () => {
    console.log('=== PERFORMING UNDO ===');
    console.log('Can undo:', canUndo.value);
    console.log('Undo stack size:', undoStack.value.length);

    const previousState = undo();
    console.log('Previous state received:', previousState ? 'yes' : 'no');

    if (previousState) {
        console.log('Applying previous state...');
        applyState(previousState);
        console.log('Undo completed successfully');
    } else {
        console.log('No previous state to apply');
    }

    console.log('=== END PERFORMING UNDO ===');
};

// Function to perform redo
const performRedo = () => {
    const nextState = redo();
    if (nextState) {
        applyState(nextState);
    }
};

// Function to apply state from undo/redo
const applyState = (state) => {
    if (!state) {
        console.warn('applyState called with null/undefined state');
        return;
    }

    console.log('=== APPLYING STATE ===');
    console.log('Applying state:', state);

    // Set the flag to prevent saving during state application
    isUndoRedoOperation.value = true;

    try {
        startPoint.value = state.startPoint;
        endPoint.value = state.endPoint;
        waypoints.value = state.waypoints;
        routePath.value = state.routePath;
        routeInfo.value = state.routeInfo;

        console.log('State applied successfully');

        // Update segments
        updateSegments();

        // Update model value without saving state
        updateModelValueWithoutSaving();

    } catch (error) {
        console.error('Error applying state:', error);
    } finally {
        // Reset the flag after state application
        isUndoRedoOperation.value = false;
    }

    console.log('=== END APPLYING STATE ===');
};

// Function to update model value without saving state (for undo/redo operations)
const updateModelValueWithoutSaving = () => {
    console.log('updateModelValueWithoutSaving called');
    isInternalUpdate.value = true;

    const newValue = {
        startPoint: startPoint.value ? {
            ...startPoint.value,
            loading: loadingStartPoint.value
        } : null,
        endPoint: endPoint.value ? {
            ...endPoint.value,
            loading: loadingEndPoint.value
        } : null,
        waypoints: waypoints.value.map((waypoint, index) => ({
            ...waypoint,
            loading: loadingWaypoints.value[index] || false
        })),
        routePath: routePath.value,
        routeInfo: routeInfo.value,
        loadingRoute: loadingRoute.value,
        pois: pois.value
    };

    emit('update:modelValue', newValue);

    nextTick(() => {
        isInternalUpdate.value = false;
    });
    console.log('updateModelValueWithoutSaving completed');
};

// Update model value function
const updateModelValue = () => {
    console.log('updateModelValue called');
    isInternalUpdate.value = true;

    const newValue = {
        startPoint: startPoint.value ? {
            ...startPoint.value,
            loading: loadingStartPoint.value
        } : null,
        endPoint: endPoint.value ? {
            ...endPoint.value,
            loading: loadingEndPoint.value
        } : null,
        waypoints: waypoints.value.map((waypoint, index) => ({
            ...waypoint,
            loading: loadingWaypoints.value[index] || false
        })),
        routePath: routePath.value,
        routeInfo: routeInfo.value,
        loadingRoute: loadingRoute.value,
        pois: pois.value
    };

    emit('update:modelValue', newValue);

    nextTick(() => {
        isInternalUpdate.value = false;
    });
    console.log('updateModelValue completed');
};

// Initialize route actions
const {
    setStartPoint,
    setEndPoint,
    addWaypoint,
    calculateFullRoute,
    onStartMarkerDragEnd,
    onEndMarkerDragEnd,
    onWaypointDragEnd,
    deleteWaypoint
} = useRouteActions(
    startPoint,
    endPoint,
    waypoints,
    routePath,
    routeInfo,
    loadingStartPoint,
    loadingEndPoint,
    loadingWaypoints,
    loadingRoute,
    updateModelValue,
    centerMapBase,
    forceSaveState
);

// Initialize map interactions
const {
    onMapClick: onMapClickBase,
    onRouteClick: onRouteClickBase,
    selectSearchResult: selectSearchResultInteraction
} = useMapInteractions(
    startPoint,
    endPoint,
    waypoints,
    waypointMode,
    loadingStartPoint,
    loadingEndPoint,
    loadingWaypoints,
    setStartPoint,
    setEndPoint,
    addWaypoint,
    setMapCenter
);

// Initialize keyboard events
useKeyboardEvents(selectedWaypoint, deleteWaypoint, hideContextMenu, clearSelection, clearSegmentSelection, performUndo, performRedo, () => props.editing);

// Wrapper functions for map interactions
const onMapClick = (event) => {
    if (!props.editing) return;
    onMapClickBase(event);
};

const onRouteClick = (event) => {
    if (!props.editing) return;
    onRouteClickBase(event, routePath, updateModelValue);
};

const selectSearchResult = (result) => {
    const resultData = selectSearchResultBase(result);
    selectSearchResultInteraction(resultData, setMapCenter);
};

const centerMap = () => {
    // Only center on route if there's a route to center on
    if (startPoint.value || endPoint.value || waypoints.value.length > 0 || (routePath.value && routePath.value.length > 0)) {
        centerMapBase(startPoint.value, endPoint.value, waypoints.value, routePath.value);
    }
    // Otherwise, the map will use the default center (Atlantic or saved center)
};

// Save map state to localStorage (only called on user input or map load)
const saveMapState = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
        const currentCenter = mapRef.value.leafletObject.getCenter();
        const currentZoom = mapRef.value.leafletObject.getZoom();

        // Update the reactive center
        mapCenter.value = [currentCenter.lat, currentCenter.lng];
        zoom.value = currentZoom;

        // Save to localStorage
        saveMapCenter([currentCenter.lat, currentCenter.lng], currentZoom);
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

// Debounce timer for map move end event
let mapMoveEndTimeout = null;

// Handle map move end event to save the current map center (only in view mode to preserve position for edit mode)
const onMapMoveEnd = () => {
    // Only save automatically in view mode to preserve position when switching to edit mode
    // In edit mode, we only save on explicit user actions (zoom buttons, center button)
    if (!props.editing) {
        // Clear existing timeout
        if (mapMoveEndTimeout) {
            clearTimeout(mapMoveEndTimeout);
        }

        // Debounce the save operation
        mapMoveEndTimeout = setTimeout(() => {
            saveMapState();
        }, 500); // 500ms debounce
    }
};

// Context menu actions
const deleteSelectedItem = () => {
    if (!props.editing) return;
    if (contextMenu.value.targetType === 'waypoint') {
        // Show confirmation modal instead of deleting directly
        waypointToDelete.value = contextMenu.value.targetIndex;
        showDeleteWaypointModal.value = true;
    } else if (contextMenu.value.targetType === 'poi') {
        deletePoi(contextMenu.value.targetIndex);
    }
    hideContextMenu();
};

const deleteSelectedWaypoint = () => {
    if (!props.editing) return;
    if (selectedWaypoint.value !== null) {
        // Show confirmation modal instead of deleting directly
        waypointToDelete.value = selectedWaypoint.value;
        showDeleteWaypointModal.value = true;
    }
};

const confirmDeleteWaypoint = () => {
    if (waypointToDelete.value === null) return;

    const index = waypointToDelete.value;

    // Clear selection if it was the deleted waypoint, or adjust index if selection is after deleted waypoint
    if (selectedWaypoint.value === index) {
        selectedWaypoint.value = null;
    } else if (selectedWaypoint.value !== null && selectedWaypoint.value > index) {
        // Adjust selected waypoint index if it was after the deleted one
        selectedWaypoint.value = selectedWaypoint.value - 1;
    }

    // Perform the deletion
    deleteWaypoint(index);

    // Close modal and reset
    showDeleteWaypointModal.value = false;
    waypointToDelete.value = null;
};

// Wrapper function for clear route with state saving
const clearRouteWithState = () => {
    if (!props.editing) return;
    // Force save state before clearing
    if (!isUndoRedoOperation.value) {
        forceSaveState();
    }
    clearRoute();

    // After clearing route, restore saved/default center
    nextTick(() => {
        if (mapRef.value && mapRef.value.leafletObject) {
            mapRef.value.leafletObject.setView(mapCenter.value, zoom.value);
        }
    });
};

// Watch for route changes and update segments
watch([routePath, waypoints, startPoint, endPoint], () => {
    updateSegments();
}, { immediate: true });

// Watch for waypoint mode changes to refresh cursor radius
watch(waypointMode, () => {
    refreshRadius();
});

// Watch for editing mode changes to clear selection when switching to view mode
watch(() => props.editing, (isEditing) => {
    if (!isEditing) {
        // Clear all selections when switching to view mode
        clearSelection();
        selectedPoi.value = null;
        clearSegmentSelection();
        hideContextMenu();
    }
});

// Function to update minimap view
const updateMinimap = () => {
    if (!minimapRef.value || !minimapRef.value.leafletObject) return;

    const minimap = minimapRef.value.leafletObject;

    // Update minimap zoom (always 5 levels zoomed out from main map)
    const newZoom = Math.max(minZoom.value, zoom.value - 5);
    minimapZoom.value = newZoom;

    // If there's a route, fit bounds to show the entire route
    if (routePath.value && routePath.value.length > 0) {
        // Collect all points (route path + markers)
        const allPoints = [...routePath.value];

        if (startPoint.value) {
            allPoints.push([startPoint.value.lat, startPoint.value.lng]);
        }
        if (endPoint.value) {
            allPoints.push([endPoint.value.lat, endPoint.value.lng]);
        }
        waypoints.value.forEach(wp => {
            allPoints.push([wp.lat, wp.lng]);
        });
        pois.value.forEach(poi => {
            allPoints.push([poi.lat, poi.lng]);
        });

        // Calculate bounds
        const lats = allPoints.map(p => p[0]);
        const lngs = allPoints.map(p => p[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Use Leaflet's LatLngBounds if available, otherwise use setView with calculated center
        try {
            const L = window.L || (minimap.constructor && minimap.constructor.L);
            if (L && L.latLngBounds) {
                const bounds = L.latLngBounds(
                    [minLat, minLng],
                    [maxLat, maxLng]
                );
                minimap.fitBounds(bounds, { padding: [20, 20] });
            } else {
                // Fallback: center on route with appropriate zoom
                const centerLat = (minLat + maxLat) / 2;
                const centerLng = (minLng + maxLng) / 2;
                minimap.setView([centerLat, centerLng], newZoom);
            }
        } catch (error) {
            // Fallback: center on route with appropriate zoom
            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;
            minimap.setView([centerLat, centerLng], newZoom);
        }
    } else {
        // Otherwise, follow the main map center but with zoomed out view
        minimapCenter.value = mapCenter.value;
        minimap.setView(mapCenter.value, newZoom);
    }
};

// Watch main map zoom and center to update minimap
watch([zoom, mapCenter], () => {
    updateMinimap();
}, { deep: true });

// Watch route path to update minimap bounds
watch([routePath, startPoint, endPoint, waypoints], () => {
    nextTick(() => {
        updateMinimap();
    });
}, { deep: true });

// Watch map style to update minimap tile layer
watch(mapStyle, () => {
    nextTick(() => {
        updateMinimap();
    });
});

// Removed reactive watcher for mapCenter and zoom changes
// Map state is now only loaded on mount, not reactively updated
// This prevents unwanted map updates when reactive values change

// Watch for map style changes from external sources
watch(mapStyle, (newStyle, oldStyle) => {
    if (newStyle !== oldStyle && mapRef.value && mapRef.value.leafletObject) {
        // The tile layer URL is computed and will update automatically via Vue Leaflet
        // but we need to ensure the map refreshes the tiles
        nextTick(() => {
            if (mapRef.value && mapRef.value.leafletObject) {
                // Force the map to refresh by invalidating size and redrawing
                mapRef.value.leafletObject.invalidateSize();
                // Also trigger a redraw of the tile layer
                const layers = mapRef.value.leafletObject._layers;
                Object.keys(layers).forEach(layerId => {
                    const layer = layers[layerId];
                    if (layer._url && (layer._url.includes('openstreetmap') || layer._url.includes('arcgisonline'))) {
                        layer.redraw();
                    }
                });
            }
        });
    }
});

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        startPoint.value = newValue.startPoint || null;
        endPoint.value = newValue.endPoint || null;
        waypoints.value = newValue.waypoints || [];
        routePath.value = newValue.routePath || [];
        routeInfo.value = newValue.routeInfo || null;
        pois.value = newValue.pois || [];

        // Center map to fit the loaded route data only if this is an external update and route exists
        if (newValue.routePath && newValue.routePath.length > 0 && !isInternalUpdate.value) {
            nextTick(() => {
                // Wait for the map to be ready
                const checkMapReady = () => {
                    if (mapRef.value && mapRef.value.leafletObject) {
                        // On initial load
                        if (isInitialRouteLoad.value) {
                            // In View mode, always fit to route on initial load
                            if (!props.editing) {
                                centerMap();
                            } else {
                                // In Edit mode on initial load, use saved position - never fit to route
                                if (mapCenter.value && zoom.value) {
                                    // Use the saved position that was loaded from localStorage
                                    mapRef.value.leafletObject.setView(mapCenter.value, zoom.value);
                                }
                                // If no saved position exists, map uses default center/zoom from useMapState
                            }
                            isInitialRouteLoad.value = false; // Mark that initial load is complete
                            return;
                        }

                        // After initial load - route data changed
                        // In View mode (editing=false), always zoom to fit the route
                        if (!props.editing) {
                            centerMap();
                            return;
                        }

                        // In Edit mode (editing=true), preserve current map position - never fit to route
                        // Don't change the map view - keep the current position
                        return;
                    } else {
                        // Retry after a short delay
                        setTimeout(checkMapReady, 100);
                    }
                };
                checkMapReady();
            });
        }
        // If no route exists, ensure map uses saved/default center (already set in useMapState)
    }
}, { immediate: true });

// Enhanced onMapReady to load saved center and zoom from localStorage (only on map load)
const onMapReadyEnhanced = () => {
    onMapReady();

    // Load saved state from localStorage only when map loads
    // This ensures we have the most recent state saved by user actions
    // The route data watcher will handle setting the view based on mode (view vs edit)
    updateStateFromStorage();
};

// Handler for minimap ready
const onMinimapReady = () => {
    nextTick(() => {
        updateMinimap();
    });
};

// Lifecycle hooks
onMounted(() => {
    // Refresh state from localStorage on mount to ensure we have latest values
    // This is important when navigating to planned routes after using RouteMapViewer
    updateStateFromStorage();

    nextTick(() => {
        // Add window resize listener with passive option for better performance
        window.addEventListener('resize', handleResize, { passive: true });

        // Initialize cursor radius functionality
        setTimeout(() => {
            initializeRadius();
        }, 100);

        // Save initial state for undo/redo
        if (startPoint.value || endPoint.value || waypoints.value.length > 0) {
            // console.log('Saving initial state on mount');
            saveState(getCurrentState());
        }
    });
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    // Cleanup cursor radius
    cleanupRadius();
    // Cleanup resize observer
    cleanupResizeObserver();
    // Cleanup map move end timeout
    if (mapMoveEndTimeout) {
        clearTimeout(mapMoveEndTimeout);
    }
});

// POI functionality methods
const togglePoiMode = () => {
    if (!props.editing) return;
    poiMode.value = !poiMode.value;
    if (poiMode.value) {
        disableWaypointMode();
        clearSelection();
        clearSegmentSelection();
    }
};

const onPoiClick = (index) => {
    selectedPoi.value = index;
    selectedWaypoint.value = null;
    clearSegmentSelection();
};

const onPoiDragEnd = (event, index) => {
    if (!props.editing) return;
    const { lat, lng } = event.target.getLatLng();
    pois.value[index].lat = lat;
    pois.value[index].lng = lng;
    updateModelValue();
};

const onPoiContextMenu = (event, index) => {
    if (!props.editing) return;
    showContextMenu(event, 'poi', index);
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

const openPoiForm = (lat, lng, poi = null) => {
    if (!props.editing) return;
    if (poi) {
        editingPoi.value = poi;
        poiForm.value = {
            title: poi.title,
            description: poi.description,
            type: poi.type
        };
    } else {
        editingPoi.value = null;
        poiForm.value = {
            title: '',
            description: '',
            type: 'info'
        };
    }

    // Store the coordinates for the new POI
    if (!poi) {
        poiForm.value.lat = lat;
        poiForm.value.lng = lng;
    }

    showPoiForm.value = true;
};

const closePoiForm = () => {
    showPoiForm.value = false;
    editingPoi.value = null;
    poiForm.value = {
        title: '',
        description: '',
        type: 'info'
    };
};

const savePoi = () => {
    if (!props.editing) return;
    if (!poiForm.value.title.trim()) return;

    const poiData = {
        id: editingPoi.value ? editingPoi.value.id : Date.now(),
        title: poiForm.value.title.trim(),
        description: poiForm.value.description.trim(),
        type: poiForm.value.type,
        lat: editingPoi.value ? editingPoi.value.lat : poiForm.value.lat,
        lng: editingPoi.value ? editingPoi.value.lng : poiForm.value.lng
    };

    if (editingPoi.value) {
        // Update existing POI
        const index = pois.value.findIndex(p => p.id === editingPoi.value.id);
        if (index !== -1) {
            pois.value[index] = poiData;
        }
    } else {
        // Add new POI
        pois.value.push(poiData);
    }

    updateModelValue();
    closePoiForm();
};

const clearPois = () => {
    if (!props.editing) return;
    pois.value = [];
    selectedPoi.value = null;
    updateModelValue();
};

const deletePoi = (index) => {
    if (!props.editing) return;
    pois.value.splice(index, 1);
    if (selectedPoi.value === index) {
        selectedPoi.value = null;
    } else if (selectedPoi.value > index) {
        selectedPoi.value--;
    }
    updateModelValue();
};

const editPoi = () => {
    if (!props.editing) return;
    if (contextMenu.value.targetType === 'poi' && contextMenu.value.targetIndex !== null) {
        const poi = pois.value[contextMenu.value.targetIndex];
        openPoiForm(poi.lat, poi.lng, poi);
    }
    hideContextMenu();
};

// Update map click handler to handle POI mode
const onMapClickWithPoi = (event) => {
    // If editing is disabled, don't handle clicks for adding markers
    if (!props.editing) {
        return;
    }

    const { lat, lng } = event.latlng;

    // Check if route is properly established before allowing POI creation
    if (!isRouteEstablished()) {
        // If route is not established, use normal map behavior
        onMapClickBase(event);
        return;
    }

    // Check if click is on route path or too close to existing markers
    if (isClickOnRoute(event) || isClickNearExistingMarkers(lat, lng)) {
        // If click is on route or near markers, use normal map behavior
        onMapClickBase(event);
        return;
    }

    // If click is outside route and not near markers, create POI
    openPoiForm(lat, lng);
};

// Check if click is on or very close to the route path
const isClickOnRoute = (event) => {
    if (!routePath.value || routePath.value.length < 2) return false;

    const clickPoint = event.latlng;
    const tolerance = 0.0001; // ~11 meters tolerance

    // Check distance to route path
    for (let i = 0; i < routePath.value.length - 1; i++) {
        const point1 = routePath.value[i];
        const point2 = routePath.value[i + 1];

        // Calculate distance from click point to line segment
        const distance = distanceToLineSegment(
            clickPoint.lat, clickPoint.lng,
            point1[0], point1[1],
            point2[0], point2[1]
        );

        if (distance < tolerance) {
            return true;
        }
    }

    return false;
};

// Check if click is too close to existing markers (start, end, waypoints)
const isClickNearExistingMarkers = (lat, lng) => {
    const tolerance = 0.0001; // ~11 meters tolerance

    // Check distance to start point
    if (startPoint.value) {
        const distance = getDistance(lat, lng, startPoint.value.lat, startPoint.value.lng);
        if (distance < tolerance) return true;
    }

    // Check distance to end point
    if (endPoint.value) {
        const distance = getDistance(lat, lng, endPoint.value.lat, endPoint.value.lng);
        if (distance < tolerance) return true;
    }

    // Check distance to waypoints
    for (const waypoint of waypoints.value) {
        const distance = getDistance(lat, lng, waypoint.lat, waypoint.lng);
        if (distance < tolerance) return true;
    }

    // Check distance to existing POIs
    for (const poi of pois.value) {
        const distance = getDistance(lat, lng, poi.lat, poi.lng);
        if (distance < tolerance) return true;
    }

    return false;
};

// Calculate distance between two points in degrees
const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c / 1000; // Convert to degrees (approximate)
};

// Calculate distance from point to line segment
const distanceToLineSegment = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

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

// Check if route is properly established (start point, end point, and route path)
const isRouteEstablished = () => {
    return startPoint.value &&
        endPoint.value &&
        routePath.value &&
        routePath.value.length >= 2;
};

// Method to set map view with specific center and zoom
const setMapView = (center, zoomLevel) => {
    if (mapRef.value && mapRef.value.leafletObject) {
        mapRef.value.leafletObject.setView(center, zoomLevel);
    }
};

// Expose methods to parent component
defineExpose({
    centerMap: handleCenterMap, // Expose handler that saves state
    triggerResize,
    setMapView
});
</script>

<style scoped>
/* Blue Map Theme Filter */

/* This transforms the black/grey CARTO Dark Matter tiles into a deep "Logo Blue" */
:deep(.map-theme-blue) {
    filter: sepia(100%) hue-rotate(180deg) saturate(300%) brightness(0.7) contrast(1.2);
}

/* Ensure map controls and markers stay on top and aren't affected by the filter if they were inside (they aren't, but good practice) */
.map-container {
    background-color: #0b1121;

    /* Match deep blue background */
}

/* POI Icons Styling */
.custom-icon.poi-icon {
    background-color: var(--primary);
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
    border: 2px solid white;
    transition: all 0.2s ease;
}

.custom-icon.poi-icon.selected {
    transform: scale(1.2);
    box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.4);
    z-index: 1000;
}

/* Danger / Critical POI Styling */
.custom-icon.poi-icon.type-danger,
.custom-icon.poi-icon.type-warning {
    background-color: #dc3545;

    /* Bootstrap Danger Red */
    border-color: #fff;
}

.custom-icon.poi-icon.type-danger.selected,
.custom-icon.poi-icon.type-warning.selected {
    box-shadow: 0 0 0 4px rgb(220 53 69 / 40%);
}

/* Map Style Buttons Update */
.map-controls-top-right {
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: white;
    padding: 5px;
    border-radius: 4px;
    box-shadow: 0 1px 5px rgb(0 0 0 / 20%);
}

.style-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    color: #6c757d;
    transition: all 0.2s;
}

.style-btn:hover {
    background-color: #f8f9fa;
    color: #333;
}

.style-btn.active {
    background-color: var(--primary);
    color: white;
}

.style-btn.active i {
    color: white !important;
}

/* Minimap container fix */
.minimap-container {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 200px;
    height: 150px;
    z-index: 400;
    border: 2px solid white;
    box-shadow: 0 4px 6px rgb(0 0 0 / 30%);
    border-radius: 8px;
    overflow: hidden;
}
</style>

<style scoped>
.planned-route-map {
    width: 100%;
    height: v-bind(height);
    position: relative;
}

.map-container {
    width: 100%;
    height: 100%;
    position: relative;

    /* border-radius: 12px 12px 0 0; */
    overflow: hidden;
    box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
    border: 1px solid var(--bs-border-color);

    /* Ensure proper resize handling */
    min-height: 200px;
    min-width: 200px;

    /* Enable touch scrolling on mobile */
    touch-action: manipulation;
}

.l-map {
    height: 100% !important;
    width: 100% !important;
    z-index: 1;
}

:deep(.leaflet-container) {
    height: 100%;
    width: 100%;
    z-index: 1;
    cursor: crosshair;
}

.map-container:not([data-editing="true"]) :deep(.leaflet-container) {
    cursor: default !important;
}

:deep(.leaflet-marker-icon) {
    background: transparent !important;
    border: none !important;
}

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

/* Global styles for Leaflet markers - matching RouteMapViewer.vue */
:global(.leaflet-marker-icon) {
    background: transparent !important;
    border: none !important;
}

:global(.leaflet-marker-icon .custom-icon:not(.start-end)) {
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* Force background colors for marker types - matching RouteMapViewer.vue */
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
    border: 5px solid var(--success) !important;
}

:global(.leaflet-marker-icon .custom-icon.start-end::before) {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 18px;
    height: 18px;
    background-color: #333B56;
    border-radius: 50%;
    z-index: 10;
    pointer-events: none;
}

:global(.leaflet-marker-icon .custom-icon.start-end img) {
    border: none !important;
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
    width: 24px !important;
    height: 24px !important;
    position: relative;
    z-index: 2;
}

:deep(.leaflet-marker-shadow) {
    display: none !important;
}

.custom-icon:not(.start-end) {
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


/* Start point has green border to differentiate from end point */
.custom-marker-icon .custom-icon.start-end.start-icon,
.custom-marker-icon .start-icon.start-end {
    border: 3px solid var(--success) !important;
}

.custom-marker-icon .custom-icon.start-end {
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

.purple-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 18px;
    height: 18px;

    /* background-color: #333B56; */
    background-color: white;

    /* color: #333B56; */
    border-radius: 50%;
    z-index: 10;
    pointer-events: none;

    /* border: 5px solid #333B56; */
    border: 3px solid white;
}

.custom-marker-icon .custom-icon.start-end img {
    filter: brightness(0) invert(1);
    border: none !important;
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
    width: 24px !important;
    height: 24px !important;
    position: relative;
    z-index: 2;
}

.inner-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;

    /* background-color: white; */
    background-color: #333B56;
    border-radius: 50%;
    z-index: 10;
    pointer-events: none;
}

.inner-dot.minimap-dot {
    width: 4px;
    height: 4px;
}

.waypoint-icon {
    background: var(--accent);
}

.waypoint-icon.selected {
    background: var(--warning);
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%);
}

.poi-icon {
    background: #6f42c1;
}

.poi-icon.selected {
    background: var(--warning);
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%);
}

.route-marker-icon {
    background: #6c757d;
}

.custom-icon i {
    color: white;
    font-size: 12px;
    transform: rotate(45deg);
    position: relative;
    z-index: 1;
}

.waypoint-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    transform: rotate(45deg);
}

.waypoint-index {
    color: white;
    font-size: 11px;
    font-weight: 900;
    line-height: 1;
    text-shadow: 1px 1px 2px rgb(0 0 0 / 50%);
    position: relative;
    z-index: 1;
}

.custom-icon.loading {
    opacity: 0.7;
    animation: pulse 1.5s ease-in-out infinite;
}

.custom-icon.loading .loading-spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgb(255 255 255 / 30%);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    transform: rotate(45deg);
}

.start-icon.loading .loading-spinner,
.end-icon.loading .loading-spinner {
    width: 16px;
    height: 16px;
    border: 3px solid rgb(255 255 255 / 30%);
    border-top: 3px solid white;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 0.7;
    }

    50% {
        opacity: 1;
    }
}

@keyframes spin {
    0% {
        transform: rotate(45deg) rotate(0deg);
    }

    100% {
        transform: rotate(45deg) rotate(360deg);
    }
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

.map-controls {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1000;
    padding: 5px;
}

.map-controls>div {
    position: absolute;
    display: flex;
    gap: 0.5rem;
    pointer-events: all;
}

.map-controls-top-left {
    top: 1rem;
    left: 1rem;
    flex-direction: column;
}

.map-controls-top-right {
    top: 1rem;
    right: 1rem;
}

.map-controls-bottom-left {
    bottom: 1rem;
    left: 1rem;
}

/* Control button styles - now using design system variables */
.control-btn {
    width: 40px;
    height: 40px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: all;
    cursor: pointer;
    color: var(--text-primary);
    transition: all var(--transition-normal);
    margin: 1px;
}

.control-btn:hover {
    background: var(--bg-elevated);
    transform: translateY(-1px);
}

.control-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

/* Map style controls */
.map-style-controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
    z-index: 1000;
}

/* Style button styles - now using design system variables */
.style-btn {
    padding: 0.5rem 0.75rem;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-normal);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 4px;
}

.style-btn:hover {
    background: var(--bg-elevated);
}

.style-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

.route-actions {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    z-index: 1000;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.action-btn {
    padding: 0.5rem 0.75rem;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all var(--transition-normal);
    white-space: nowrap;
    color: var(--text-primary);
}

.action-btn:hover {
    background: var(--bg-elevated);
    transform: translateY(-1px);
}

.clear-route-markers-btn {
    background: var(--bg-surface);
    color: var(--text-primary);
    border-color: var(--border);
}

.clear-route-markers-btn:hover {
    background: var(--bg-elevated);
}

.clear-route-btn {
    background: var(--danger);
    color: white;
    border-color: var(--danger);
}

.clear-route-btn:hover {
    background: var(--danger-dark);
    border-color: var(--danger-dark);
}

/* POI Controls */
.poi-controls {
    position: absolute;
    bottom: calc(150px + 1rem + 0.5rem);
    right: 1rem;
    z-index: 1000;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.poi-mode-btn {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all var(--transition-normal);
    white-space: nowrap;
}

.poi-mode-btn:hover {
    background: var(--bg-elevated);
    transform: translateY(-1px);
}

.poi-mode-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

.poi-mode-btn.active:hover {
    background: var(--accent-dark);
    border-color: var(--accent-dark);
}

.poi-mode-btn.disabled {
    background: var(--bg-disabled);
    color: var(--text-disabled);
    border-color: var(--border-disabled);
    cursor: not-allowed;
    opacity: 0.6;
}

.poi-mode-btn.disabled:hover {
    background: var(--bg-disabled);
    color: var(--text-disabled);
    border-color: var(--border-disabled);
    transform: none;
}

.clear-pois-btn {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all var(--transition-normal);
    white-space: nowrap;
}

.clear-pois-btn:hover {
    background: var(--bg-elevated);
    transform: translateY(-1px);
}

.undo-btn,
.redo-btn {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-normal);
    font-size: 14px;
    color: var(--text-primary);
    margin: 5px;
}

.undo-btn:hover:not(:disabled),
.redo-btn:hover:not(:disabled) {
    background: var(--bg-elevated);
    transform: translateY(-1px);
}

.undo-btn:disabled,
.redo-btn:disabled {
    background: var(--bg-disabled);
    color: var(--text-disabled);
    border-color: var(--border-disabled);
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
}

.undo-btn i,
.redo-btn i {
    color: inherit;
}

.undo-btn:hover:not(:disabled) i,
.redo-btn:hover:not(:disabled) i {
    color: var(--accent);
}

.route-info {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 1000;
    background: rgb(255 255 255 / 95%);
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    gap: 20px;
    font-size: 12px;
}

.info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.info-item strong {
    color: #666;
}

.loading-route {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 12px;
}

.loading-spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 15px;
    height: 15px;
    animation: spin 1s linear infinite;
}

.waypoint-mode-indicator {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgb(0 0 0 / 70%);
    color: white;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
}

.waypoint-addition-indicator {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgb(0 0 0 / 70%);
    color: white;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
}

.poi-mode-indicator {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgb(111 66 193 / 90%);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
    border: 2px solid #6f42c1;
    animation: poiModePulse 2s ease-in-out infinite;
}

@keyframes poiModePulse {
    0%,
    100% {
        background: rgb(111 66 193 / 90%);
        border-color: #6f42c1;
    }

    50% {
        background: rgb(111 66 193 / 100%);
        border-color: var(--warning);
        box-shadow: 0 0 10px rgb(255 193 7 / 50%);
    }
}

.poi-mode-indicator.route-not-established {
    background: rgb(220 53 69 / 90%);
    border-color: var(--error);
    animation: none;
}

.poi-mode-indicator.route-not-established i {
    color: #fff;
}


.location-search {
    position: absolute;
    top: 1rem;
    left: calc(1rem + 40px + 0.5rem);
    z-index: 1000;
    width: 300px;
    max-width: calc(100% - 20px);
}

.search-container {
    display: flex;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.search-input {
    flex: 1;
    padding: 8px 12px;
    border: none;
    outline: none;
    font-size: 14px;
    background: transparent;
    color: var(--text-primary);
}

.search-input::placeholder {
    color: var(--text-secondary, var(--text-disabled));
}

.search-btn {
    background: var(--accent);
    color: white;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    transition: all var(--transition-normal);
}

.search-btn:hover:not(:disabled) {
    background: var(--accent-dark, var(--accent));
    opacity: 0.9;
}

.search-btn:disabled {
    background: var(--bg-disabled);
    color: var(--text-disabled);
    cursor: not-allowed;
    opacity: 0.6;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-top: none;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1001;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.search-result-item {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--border);
    transition: background var(--transition-normal);
    color: var(--text-primary);
}

.search-result-item:hover {
    background: var(--bg-elevated);
}

.search-result-item:last-child {
    border-bottom: none;
}

.result-name {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 2px;
    color: var(--text-primary);
}

.result-type {
    font-size: 12px;
    color: var(--text-secondary, var(--text-disabled));
}

/* Context Menu Styles - Design System */
.context-menu {
    position: absolute;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    padding: var(--spacing-2xs) 0;
    min-width: 120px;
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
    transition: background-color var(--transition-fast);
    border-bottom: 1px solid var(--border);
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

.selection-indicator {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgb(0 0 0 / 70%);
    color: white;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
}

.delete-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
}

.delete-btn:hover {
    color: var(--error);
}

.segment-info {
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgb(0 0 0 / 70%);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
    border: 1px solid #fff;
}

.segment-info-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.segment-info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.segment-info-header strong {
    color: white;
    font-size: 14px;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
}

.close-btn:hover {
    color: var(--error);
}

.segment-info-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.segment-detail {
    color: #eee;
    font-size: 12px;
}

.route-segment {
    transition: all 0.2s ease;
    cursor: pointer;
}

.route-segment:hover {
    opacity: 1 !important;
}

.route-segment.selected {
    border: 3px solid var(--warning);
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%);
    opacity: 1 !important;
}

.route-segment.hovered {
    opacity: 1 !important;
    border: 3px solid var(--accent);
    box-shadow: 0 0 0 2px var(--accent), 0 2px 8px rgb(0 0 0 / 30%);
}

/* Add a subtle animation for segment selection */
@keyframes segmentPulse {
    0% {
        opacity: 0.8;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0.8;
    }
}

.route-segment.selected {
    animation: segmentPulse 2s ease-in-out infinite;
}

/* Improve click feedback */
.route-segment:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
}

/* Add a subtle glow effect for better visibility */
.route-segment {
    filter: drop-shadow(0 0 2px rgb(0 0 0 / 10%));
}

.route-segment:hover {
    filter: drop-shadow(0 0 4px rgb(0 123 255 / 30%));
}

.route-segment.selected {
    filter: drop-shadow(0 0 6px rgb(255 107 53 / 40%));
}

/* Special styling for snapped segments */
.route-segment.snapped {
    filter: drop-shadow(0 0 4px rgb(40 167 69 / 30%));
}

.route-segment.snapped:hover {
    filter: drop-shadow(0 0 6px rgb(40 167 69 / 50%));
}

.segment-actions {
    display: flex;
    gap: 5px;
    margin-top: 10px;
}

.segment-action-btn {
    background: rgb(255 255 255 / 90%);
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: background 0.2s;
    white-space: nowrap;
}

.segment-action-btn:hover {
    background: rgb(255 255 255 / 100%);
}

.segment-action-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.snap-btn {
    background: rgb(40 167 69 / 90%);
    color: white;
    border-color: var(--success);
}

.snap-btn:hover {
    background: rgb(40 167 69 / 100%);
}

.snapped {
    color: var(--success);
    font-weight: bold;
}

.straight {
    color: #6c757d;
    font-weight: bold;
}

/* Modal styles */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.modal-content {
    background: var(--bs-body-bg);
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--bs-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    margin: 0;
    color: var(--bs-body-color);
    font-size: 1.25rem;
    font-weight: 600;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--bs-secondary-color);
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
}

.btn-close:hover {
    background: var(--bs-tertiary-bg);
    color: var(--bs-body-color);
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--bs-border-color);
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

/* Undo/Redo Controls - positioned at same level as minimap */
.undo-redo-controls {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: all;
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

    /* Ensure bottom and right padding match */
    margin-bottom: 0;
    margin-right: 0;
}


.minimap-container :deep(.l-map) {
    width: 100% !important;
    height: 100% !important;
    pointer-events: none !important;
}

.minimap-container :deep(.leaflet-container) {
    width: 100% !important;
    height: 100% !important;
    pointer-events: none !important;
    cursor: default !important;
    background: var(--bg-surface);
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

.minimap-icon .waypoint-index {
    font-size: 8px !important;
}

.minimap-icon i {
    font-size: 8px !important;
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

@media (width <= 768px) {
    .location-search {
        left: calc(0.5rem + 40px + 0.5rem);
        top: 0.5rem;
        width: calc(100% - 0.5rem - 40px - 0.5rem - 0.5rem);
        max-width: none;
    }

    .route-info {
        flex-direction: column;
        gap: 5px;
        font-size: 11px;
    }

    .route-actions {
        flex-direction: column;
    }

    .action-btn {
        font-size: 11px;
        padding: 4px 8px;
    }

    /* Ensure mobile scrolling works properly */
    .planned-route-map {
        overflow: visible;
        touch-action: manipulation;
        -webkit-overflow-scrolling: touch;
    }

    .map-container {
        overflow: visible;
        touch-action: manipulation;
        -webkit-overflow-scrolling: touch;
    }

    /* Allow scrolling on mobile for the map */
    :deep(.leaflet-container) {
        touch-action: manipulation;
        overflow: visible;
        -webkit-overflow-scrolling: touch;
    }

    /* Ensure parent containers don't prevent scrolling */
    :deep(.base-panel__content) {
        overflow: visible;
        -webkit-overflow-scrolling: touch;
    }

    /* Fix for mobile viewport issues */
    :deep(.leaflet-map-pane) {
        touch-action: manipulation;
    }

    :deep(.leaflet-tile-pane) {
        touch-action: manipulation;
    }

    /* Override layout constraints on mobile for better scrolling */
    :deep(.content) {
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        height: auto !important;
        min-height: calc(100vh - 60px) !important;
    }

    :deep(.main-content) {
        overflow: visible !important;
        height: auto !important;
    }

    :deep(.layout-wrapper) {
        overflow: visible !important;
        height: auto !important;
    }

    /* Undo/Redo Controls responsive styles */
    .undo-redo-controls {
        bottom: 0.5rem;
        left: 0.5rem;
    }


    /* Minimap responsive styles */
    .minimap-container {
        width: 150px;
        height: 112px;
        bottom: 0.5rem;
        right: 0.5rem;
    }

    /* POI Controls responsive - position above minimap on mobile */
    .poi-controls {
        bottom: calc(112px + 0.5rem + 0.5rem);
        right: 0.5rem;
    }
}
</style>

<style scoped>
/* Collapsible Map Controls */
.collapsible-controls {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    position: relative;
    pointer-events: auto; /* Ensure interaction */
}

.collapsible-trigger {
    z-index: 20;
    transition: all 0.2s ease;
}

.collapsible-content {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--bg-surface);
    padding: 4px;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);
    opacity: 0;
    visibility: hidden;
    transform: scale(0.95);
    transform-origin: top right;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 10;
    width: 40px; /* Match button width */
}

/* Show content on hover over container or focus within */
.collapsible-controls:hover .collapsible-content,
.collapsible-controls:focus-within .collapsible-content {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    padding-top: 44px; /* Space for the trigger button */
}

/* Hide trigger background when expanded to blend with content */

/* .collapsible-controls:hover .collapsible-trigger .style-btn {
    box-shadow: none;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
} */
</style>