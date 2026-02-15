<template>
    <div class="planned-route-map">
        <!-- Map Container -->
        <div class="map-container">
            <l-map ref="mapRef" v-model:zoom="zoom" :center="mapCenter" :use-global-leaflet="false" :min-zoom="minZoom"
                :max-zoom="maxZoom" @ready="onMapReady" :options="{ zoomControl: false }" @click="onMapClick">
                <l-tile-layer :url="tileLayerUrl" layer-type="base" :name="mapStyleLabel" />

                <!-- Start Marker -->
                <l-marker v-if="startPoint" :lat-lng="{ lat: startPoint.lat, lng: startPoint.lng }" :draggable="true"
                    @dragend="onStartMarkerDragEnd">
                    <l-icon :icon-anchor="[16, 32]" :icon-size="[32, 32]">
                        <div class="custom-icon start-icon" :class="{ 'loading': loadingStartPoint }">
                            <span v-if="!loadingStartPoint" class="marker-label">S</span>
                            <div v-else class="loading-spinner"></div>
                        </div>
                    </l-icon>
                </l-marker>

                <!-- End Marker -->
                <l-marker v-if="endPoint" :lat-lng="{ lat: endPoint.lat, lng: endPoint.lng }" :draggable="true"
                    @dragend="onEndMarkerDragEnd">
                    <l-icon :icon-anchor="[16, 32]" :icon-size="[32, 32]">
                        <div class="custom-icon end-icon" :class="{ 'loading': loadingEndPoint }">
                            <span v-if="!loadingEndPoint" class="marker-label">E</span>
                            <div v-else class="loading-spinner"></div>
                        </div>
                    </l-icon>
                </l-marker>

                <!-- Waypoint Markers -->
                <l-marker v-for="(waypoint, index) in waypoints" :key="`waypoint-${index}`"
                    :lat-lng="{ lat: waypoint.lat, lng: waypoint.lng }" :draggable="true"
                    @dragend="onWaypointDragEnd($event, index)" @contextmenu="onWaypointContextMenu($event, index)"
                    @click="onWaypointClick(index)" :class="{ 'selected': selectedWaypoint === index }">
                    <l-icon :icon-anchor="[12, 24]" :icon-size="[24, 24]">
                        <div class="custom-icon waypoint-icon"
                            :class="{ 'loading': loadingWaypoints[index], 'selected': selectedWaypoint === index }">
                            <i v-if="!loadingWaypoints[index]" class="bi bi-geo-alt-fill"></i>
                            <div v-else class="loading-spinner"></div>
                        </div>
                    </l-icon>
                </l-marker>

                <!-- Route Path Markers (user-added) -->
                <!-- <l-marker v-for="(marker, index) in routeMarkers" :key="`route-marker-${index}`"
                    :lat-lng="{ lat: marker.lat, lng: marker.lng }" :draggable="true"
                    @dragend="onRouteMarkerDragEnd($event, index)">
                    <l-icon :icon-anchor="[12, 24]" :icon-size="[24, 24]">
                        <div class="custom-icon route-marker-icon">
                            <i class="bi bi-geo-alt-fill"></i>
                        </div>
                    </l-icon>
                </l-marker> -->

                <!-- Route Path -->
                <l-polyline v-if="routePath.length > 1" :lat-lngs="routePath" :color="'#333B56'" :weight="6"
                    @click="onRouteClick" />
            </l-map>

            <!-- Map Style Controls -->
            <div class="map-style-controls">
                <button type="button" class="style-btn" :class="{ active: mapStyle === 'osm' }"
                    @click="setMapStyle('osm')">
                    <i class="bi bi-map"></i> OSM
                </button>
                <button type="button" class="style-btn" :class="{ active: mapStyle === 'satellite' }"
                    @click="setMapStyle('satellite')">
                    <i class="bi bi-image"></i> Satellite
                </button>
            </div>

            <!-- Map Controls -->
            <div class="map-controls">
                <button type="button" class="control-btn" @click="zoomIn">
                    <i class="bi bi-plus-lg"></i>
                </button>
                <button type="button" class="control-btn" @click="zoomOut">
                    <i class="bi bi-dash-lg"></i>
                </button>
                <button type="button" class="control-btn" @click="centerMap">
                    <i class="bi bi-geo-alt"></i>
                    <!-- {{ t('centerMap') }} -->
                </button>
            </div>

            <!-- Route Actions -->
            <div class="route-actions">
                <!-- <button type="button" v-if="startPoint && endPoint" class="action-btn calculate-route-btn"
                    @click="calculateRoute">
                    <i class="bi bi-arrow-right-circle"></i> {{ t('calculateRoute') }}
                </button> -->
                <!-- <button type="button" class="action-btn add-waypoint-btn" @click="enableWaypointMode">
                    <i class="bi bi-plus-circle"></i> {{ t('addWaypoint') }}
                </button> -->
                <!-- <button type="button" v-if="waypoints.length > 0" class="action-btn clear-waypoints-btn"
                    @click="clearWaypoints">
                    <i class="bi bi-x-circle"></i> {{ t('clearWaypoints') }}
                </button> -->
                <button type="button" v-if="routeMarkers.length > 0" class="action-btn clear-route-markers-btn"
                    @click="clearRouteMarkers">
                    <i class="bi bi-x-circle"></i> {{ t('clearRouteMarkers') }}
                </button>
                <button type="button" class="action-btn clear-route-btn" @click="clearRoute">
                    <i class="bi bi-trash"></i> {{ t('clearRoute') }}
                </button>
            </div>
        </div>

        <!-- Route Information -->
        <div v-if="routeInfo || loadingRoute" class="route-info">
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
        </div>

        <!-- Waypoint Mode Indicator -->
        <div v-if="waypointMode" class="waypoint-mode-indicator">
            <i class="bi bi-plus-circle"></i>
            {{ t('clickToAddWaypoint') }}
        </div>

        <!-- Location Search -->
        <div class="location-search">
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
        <div v-if="selectedWaypoint !== null" class="selection-indicator">
            <span>{{ t('waypointSelected') }} {{ selectedWaypoint + 1 }}</span>
            <button type="button" class="delete-btn" @click="deleteSelectedWaypoint">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { LMap, LTileLayer, LMarker, LPolyline, LIcon } from '@vue-leaflet/vue-leaflet';
import "leaflet/dist/leaflet.css";
import '@/utils/leaflet-icon-fix';

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
    }
});

const emit = defineEmits(['update:modelValue']);

// Map state
const mapRef = ref(null);
const zoom = ref(13);
const minZoom = ref(4);
const maxZoom = ref(18);
const mapCenter = ref([30.0444, 31.2357]); // Cairo, Egypt
const mapStyle = ref('osm');

// Route state
const startPoint = ref(null);
const endPoint = ref(null);
const waypoints = ref([]);
const routePath = ref([]);
const routeInfo = ref(null);
const routeMarkers = ref([]); // User-added markers on the route

// Flag to track internal updates
const isInternalUpdate = ref(false);

// Search state
const searchQuery = ref('');
const searchResults = ref([]);
const showResults = ref(false);
const searching = ref(false);

// Loading states
const loadingStartPoint = ref(false);
const loadingEndPoint = ref(false);
const loadingWaypoints = ref({}); // Object to track loading state for each waypoint
const loadingRoute = ref(false);

// Waypoint mode state
const waypointMode = ref(false);

// Context menu state
const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    targetType: null, // 'waypoint', 'start', 'end'
    targetIndex: null
});

// Selected waypoint state
const selectedWaypoint = ref(null);

// Computed
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

// Methods
const onMapReady = () => {
    if (mapRef.value) {
        mapRef.value.leafletObject.invalidateSize();
    }
};

const setMapCenter = (lat, lng, shouldChangeZoom = true) => {
    mapCenter.value = [lat, lng];
    if (mapRef.value) {
        if (shouldChangeZoom) {
            mapRef.value.leafletObject.setView([lat, lng], zoom.value);
        } else {
            mapRef.value.leafletObject.setView([lat, lng], mapRef.value.leafletObject.getZoom());
        }
    }
};

const centerMap = () => {
    // console.log('centerMap called');
    if (mapRef.value && mapRef.value.leafletObject) {
        const points = [];

        // Add start and end points
        if (startPoint.value) points.push([startPoint.value.lat, startPoint.value.lng]);
        if (endPoint.value) points.push([endPoint.value.lat, endPoint.value.lng]);

        // Add waypoints
        waypoints.value.forEach(waypoint => {
            points.push([waypoint.lat, waypoint.lng]);
        });

        // Add route path points to ensure the entire route is visible
        if (routePath.value && routePath.value.length > 0) {
            // Add key points from the route path (every nth point to avoid too many points)
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
                // console.log('Fitting bounds to points:', points.length, 'points');
                mapRef.value.leafletObject.fitBounds(points, { padding: [20, 20] });
            } catch (error) {
                console.warn('Error fitting bounds:', error);
            }
        }
    }
};

const handleResize = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
        mapRef.value.leafletObject.invalidateSize();
    }
};

const zoomIn = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
        mapRef.value.leafletObject.zoomIn();
    }
};

const zoomOut = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
        mapRef.value.leafletObject.zoomOut();
    }
};

const setMapStyle = (style) => {
    mapStyle.value = style;
};

const onMapClick = (event) => {
    const { lat, lng } = event.latlng;

    // Get address information for the clicked location
    if (waypointMode.value) {
        // Add waypoint with loading state
        loadingWaypoints.value[waypoints.value.length] = true;
        getAddressFromCoordinates(lat, lng).then(addressInfo => {
            addWaypoint(lat, lng, addressInfo, false);
            waypointMode.value = false; // Exit waypoint mode after adding
            loadingWaypoints.value[waypoints.value.length - 1] = false;
        }).catch(() => {
            loadingWaypoints.value[waypoints.value.length] = false;
        });
        return;
    }

    // If no start point, set as start
    if (!startPoint.value) {
        loadingStartPoint.value = true;
        getAddressFromCoordinates(lat, lng).then(addressInfo => {
            setStartPoint(lat, lng, addressInfo, false);
            loadingStartPoint.value = false;
        }).catch(() => {
            loadingStartPoint.value = false;
        });
    }
    // If no end point, set as end
    else if (!endPoint.value) {
        loadingEndPoint.value = true;
        getAddressFromCoordinates(lat, lng).then(addressInfo => {
            setEndPoint(lat, lng, addressInfo, false);
            loadingEndPoint.value = false;
        }).catch(() => {
            loadingEndPoint.value = false;
        });
    }
    // If both start and end points are set, don't add waypoints automatically
    // Waypoints will be extracted from route joints when route is calculated
};

const onRouteClick = (event) => {
    console.log('onRouteClick triggered');
    const { lat, lng } = event.latlng;

    // Find the nearest point on the route path to the clicked point
    let nearestRoutePointIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < routePath.value.length; i++) {
        const routePoint = routePath.value[i];
        const distance = calculateDistance(routePoint[0], routePoint[1], lat, lng);
        if (distance < minDistance) {
            minDistance = distance;
            nearestRoutePointIndex = i;
        }
    }

    // Find the insertion index by checking existing waypoints
    let insertIndex = 0;
    while (insertIndex < waypoints.value.length) {
        const waypoint = waypoints.value[insertIndex];
        // Find this waypoint's position in the route path
        let waypointRouteIndex = 0;
        let minWaypointDistance = Infinity;
        for (let i = 0; i < routePath.value.length; i++) {
            const distance = calculateDistance(
                routePath.value[i][0],
                routePath.value[i][1],
                waypoint.lat,
                waypoint.lng
            );
            if (distance < minWaypointDistance) {
                minWaypointDistance = distance;
                waypointRouteIndex = i;
            }
        }

        if (nearestRoutePointIndex < waypointRouteIndex) {
            break;
        }
        insertIndex++;
    }

    console.log('About to add waypoint at index:', insertIndex);
    // Get address information for the new waypoint with loading state
    loadingWaypoints.value[insertIndex] = true;
    getAddressFromCoordinates(lat, lng).then(addressInfo => {
        console.log('Address info received, adding waypoint');
        const newWaypoint = {
            lat,
            lng,
            ...(addressInfo && { address: addressInfo })
        };

        waypoints.value.splice(insertIndex, 0, newWaypoint);
        console.log('Waypoint added, calling updateModelValue');
        updateModelValue();
        loadingWaypoints.value[insertIndex] = false;
        console.log('onRouteClick completed');
    }).catch(() => {
        loadingWaypoints.value[insertIndex] = false;
    });
};

const enableWaypointMode = () => {
    waypointMode.value = true;
    // Change cursor to indicate waypoint mode
    if (mapRef.value && mapRef.value.leafletObject) {
        mapRef.value.leafletObject.getContainer().style.cursor = 'crosshair';
    }
};

const disableWaypointMode = () => {
    waypointMode.value = false;
    // Reset cursor
    if (mapRef.value && mapRef.value.leafletObject) {
        mapRef.value.leafletObject.getContainer().style.cursor = 'crosshair';
    }
};

const setStartPoint = (lat, lng, addressInfo = null, shouldCenterMap = true) => {
    startPoint.value = {
        lat,
        lng,
        ...(addressInfo && { address: addressInfo })
    };
    updateModelValue();

    // Calculate full route if we have both start and end points
    if (startPoint.value && endPoint.value) {
        calculateRoute(shouldCenterMap);
    }
};

const setEndPoint = (lat, lng, addressInfo = null, shouldCenterMap = true) => {
    endPoint.value = {
        lat,
        lng,
        ...(addressInfo && { address: addressInfo })
    };
    updateModelValue();

    // Calculate full route if we have both start and end points
    if (startPoint.value && endPoint.value) {
        calculateRoute(shouldCenterMap);
    }
};

const addWaypoint = (lat, lng, addressInfo = null, shouldCenterMap = true) => {
    waypoints.value.push({
        lat,
        lng,
        ...(addressInfo && { address: addressInfo })
    });
    updateModelValue();

    // Calculate full route if we have start and end points
    if (startPoint.value && endPoint.value) {
        calculateRoute(shouldCenterMap);
    }
};

const onStartMarkerDragEnd = (event) => {
    const { lat, lng } = event.target.getLatLng();

    // Get address information for the new location
    loadingStartPoint.value = true;
    getAddressFromCoordinates(lat, lng).then(addressInfo => {
        startPoint.value = {
            lat,
            lng,
            ...(addressInfo && { address: addressInfo })
        };
        updateModelValue();
        if (startPoint.value && endPoint.value) {
            calculateRoute(false);
        }
        loadingStartPoint.value = false;
    }).catch(() => {
        loadingStartPoint.value = false;
    });
};

const onEndMarkerDragEnd = (event) => {
    const { lat, lng } = event.target.getLatLng();

    // Get address information for the new location
    loadingEndPoint.value = true;
    getAddressFromCoordinates(lat, lng).then(addressInfo => {
        endPoint.value = {
            lat,
            lng,
            ...(addressInfo && { address: addressInfo })
        };
        updateModelValue();
        if (startPoint.value && endPoint.value) {
            calculateRoute(false);
        }
        loadingEndPoint.value = false;
    }).catch(() => {
        loadingEndPoint.value = false;
    });
};

const calculateRoute = async (shouldCenterMap = true) => {
    console.log('calculateRoute called with shouldCenterMap:', shouldCenterMap);
    if (!startPoint.value || !endPoint.value) return;

    loadingRoute.value = true;

    try {
        // Build coordinates string for OSRM
        let coordinates = `${startPoint.value.lng},${startPoint.value.lat}`;

        // Add existing waypoints
        waypoints.value.forEach(waypoint => {
            coordinates += `;${waypoint.lng},${waypoint.lat}`;
        });

        // Add route markers as additional waypoints
        routeMarkers.value.forEach(marker => {
            coordinates += `;${marker.lng},${marker.lat}`;
        });

        // Add end point
        coordinates += `;${endPoint.value.lng},${endPoint.value.lat}`;

        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
        );

        if (response.ok) {
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                routePath.value = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                routeInfo.value = {
                    distance: route.distance,
                    duration: route.duration
                };

                // Extract waypoints from route joints (turns) - but preserve user-added route markers
                if (routePath.value.length > 2) {
                    const extractedWaypoints = await extractWaypointsFromRoute(routePath.value);
                    waypoints.value = extractedWaypoints;
                    // Keep the route markers as they are user-added
                }

                updateModelValue();

                // Center and zoom the map to fit the route only if requested
                if (shouldCenterMap) {
                    console.log('Centering map after route calculation');
                    centerMap();
                } else {
                    console.log('Skipping map centering after route calculation');
                }
            }
        }
    } catch (error) {
        console.error('Error calculating route:', error);
    } finally {
        loadingRoute.value = false;
    }
};

// Function to generate markers along the route path
const generateRouteMarkers = () => {
    if (!routePath.value || routePath.value.length < 2) {
        routeMarkers.value = [];
        return;
    }

    const markers = [];
    const interval = Math.max(1, Math.floor(routePath.value.length / 10)); // Show ~10 markers along the route

    for (let i = 0; i < routePath.value.length; i += interval) {
        const point = routePath.value[i];
        markers.push({
            lat: point[0],
            lng: point[1]
        });
    }

    // Always include the last point
    if (routePath.value.length > 0) {
        const lastPoint = routePath.value[routePath.value.length - 1];
        const lastMarker = {
            lat: lastPoint[0],
            lng: lastPoint[1]
        };

        // Only add if it's not already included
        const isLastMarkerDuplicate = markers.some(marker =>
            Math.abs(marker.lat - lastMarker.lat) < 0.0001 &&
            Math.abs(marker.lng - lastMarker.lng) < 0.0001
        );

        if (!isLastMarkerDuplicate) {
            markers.push(lastMarker);
        }
    }

    routeMarkers.value = markers;
};

// Function to extract waypoints from route joints
const extractWaypointsFromRoute = async (routeCoordinates) => {
    const waypoints = [];
    const minDistance = 0.0001; // Very small minimum distance to detect more turns
    const minAngle = 10; // Reduced minimum angle to detect more turns
    const maxWaypoints = 20; // Increased maximum number of waypoints

    // Always add the first significant point after start
    if (routeCoordinates.length > 2) {
        const firstWaypoint = {
            lat: routeCoordinates[1][0],
            lng: routeCoordinates[1][1]
        };

        // Get address information for this waypoint
        const addressInfo = await getAddressFromCoordinates(firstWaypoint.lat, firstWaypoint.lng);
        if (addressInfo) {
            firstWaypoint.address = addressInfo;
        }

        waypoints.push(firstWaypoint);
    }

    for (let i = 2; i < routeCoordinates.length - 2 && waypoints.length < maxWaypoints; i++) {
        const prev = routeCoordinates[i - 1];
        const current = routeCoordinates[i];
        const next = routeCoordinates[i + 1];

        // Calculate angle between segments
        const angle = calculateAngle(prev, current, next);
        const distance = calculateDistance(prev[0], prev[1], current[0], current[1]);

        // If there's a significant turn, add as waypoint
        if (angle > minAngle && distance > minDistance) {
            // Check if this point is not too close to existing waypoints
            const isDuplicate = waypoints.some(wp =>
                Math.abs(wp.lat - current[0]) < 0.0005 &&
                Math.abs(wp.lng - current[1]) < 0.0005
            );

            if (!isDuplicate) {
                const waypoint = {
                    lat: current[0],
                    lng: current[1]
                };

                // Get address information for this waypoint
                const addressInfo = await getAddressFromCoordinates(waypoint.lat, waypoint.lng);
                if (addressInfo) {
                    waypoint.address = addressInfo;
                }

                waypoints.push(waypoint);
            }
        }
    }

    // Always add the last significant point before end
    if (routeCoordinates.length > 2) {
        const lastPoint = routeCoordinates[routeCoordinates.length - 2];
        const isDuplicate = waypoints.some(wp =>
            Math.abs(wp.lat - lastPoint[0]) < 0.0005 &&
            Math.abs(wp.lng - lastPoint[1]) < 0.0005
        );

        if (!isDuplicate) {
            const lastWaypoint = {
                lat: lastPoint[0],
                lng: lastPoint[1]
            };

            // Get address information for this waypoint
            const addressInfo = await getAddressFromCoordinates(lastWaypoint.lat, lastWaypoint.lng);
            if (addressInfo) {
                lastWaypoint.address = addressInfo;
            }

            waypoints.push(lastWaypoint);
        }
    }

    return waypoints;
};

// Function to calculate angle between three points
const calculateAngle = (p1, p2, p3) => {
    const angle1 = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
    const angle2 = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]);
    let angle = Math.abs(angle2 - angle1) * 180 / Math.PI;

    // Normalize angle to 0-180 degrees
    if (angle > 180) {
        angle = 360 - angle;
    }

    return angle;
};

// Function to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const onRouteMarkerDragEnd = (event, index) => {
    const { lat, lng } = event.target.getLatLng();
    routeMarkers.value[index] = { lat, lng };
    updateModelValue();

    // Update only the route segment affected by this route marker
    if (startPoint.value && endPoint.value) {
        updateRouteSegmentForMarker(index);
    }
};

// Function to update route segment when a route marker is dragged
const updateRouteSegmentForMarker = (markerIndex) => {
    if (!routePath.value || routePath.value.length === 0) return;

    const marker = routeMarkers.value[markerIndex];

    // Find the closest point in the route path to this marker
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < routePath.value.length; i++) {
        const point = routePath.value[i];
        const distance = calculateDistance(point[0], point[1], marker.lat, marker.lng);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
        }
    }

    // Update the route path to go through the dragged marker
    const newPath = [...routePath.value];

    // Find the position of this route marker in the overall route sequence
    // Route sequence: Start -> Waypoints -> Route Markers -> End
    const routeMarkerPosition = waypoints.value.length + markerIndex;

    // Find the previous and next points in the route sequence
    let prevPoint = null;
    let nextPoint = null;

    // Find previous point (could be a waypoint or start point)
    if (routeMarkerPosition > 0) {
        if (routeMarkerPosition <= waypoints.value.length) {
            // Previous point is a waypoint
            prevPoint = waypoints.value[routeMarkerPosition - 1];
        } else {
            // Previous point is the last waypoint or start point
            prevPoint = waypoints.value.length > 0 ? waypoints.value[waypoints.value.length - 1] : startPoint.value;
        }
    } else {
        // First route marker, previous point is start
        prevPoint = startPoint.value;
    }

    // Find next point (could be a waypoint, route marker, or end point)
    if (routeMarkerPosition < waypoints.value.length + routeMarkers.value.length - 1) {
        const nextIndex = routeMarkerPosition + 1;
        if (nextIndex < waypoints.value.length) {
            // Next point is a waypoint
            nextPoint = waypoints.value[nextIndex];
        } else {
            // Next point is a route marker
            const routeMarkerIndex = nextIndex - waypoints.value.length;
            nextPoint = routeMarkers.value[routeMarkerIndex];
        }
    } else {
        // Last route marker, next point is end
        nextPoint = endPoint.value;
    }

    let segmentStart = 0;
    let segmentEnd = newPath.length - 1;

    // Find segment start (previous point)
    if (prevPoint) {
        for (let i = 0; i < newPath.length; i++) {
            const distance = calculateDistance(newPath[i][0], newPath[i][1], prevPoint.lat, prevPoint.lng);
            if (distance < 0.001) {
                segmentStart = i;
                break;
            }
        }
    }

    // Find segment end (next point)
    if (nextPoint) {
        for (let i = newPath.length - 1; i >= 0; i--) {
            const distance = calculateDistance(newPath[i][0], newPath[i][1], nextPoint.lat, nextPoint.lng);
            if (distance < 0.001) {
                segmentEnd = i;
                break;
            }
        }
    }

    // Create a new segment that goes through the dragged marker
    const newSegment = [];

    // Get the start and end points of the segment
    const segmentStartPoint = newPath[segmentStart];
    const segmentEndPoint = newPath[segmentEnd];

    // Create a path that goes from start to the dragged marker to end
    newSegment.push(segmentStartPoint);

    // Add intermediate points to create a smooth path to the dragged marker
    const steps = 5; // Number of intermediate points
    for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 1);
        const lat = segmentStartPoint[0] + (marker.lat - segmentStartPoint[0]) * t;
        const lng = segmentStartPoint[1] + (marker.lng - segmentStartPoint[1]) * t;
        newSegment.push([lat, lng]);
    }

    // Add the dragged marker
    newSegment.push([marker.lat, marker.lng]);

    // Add intermediate points to create a smooth path from marker to end
    for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 1);
        const lat = marker.lat + (segmentEndPoint[0] - marker.lat) * t;
        const lng = marker.lng + (segmentEndPoint[1] - marker.lng) * t;
        newSegment.push([lat, lng]);
    }

    newSegment.push(segmentEndPoint);

    // Replace the entire segment in the path
    newPath.splice(segmentStart, segmentEnd - segmentStart + 1, ...newSegment);

    routePath.value = newPath;

    // Update distance and time
    if (newPath.length > 1) {
        const distance = calculateTotalDistance(newPath);
        const averageSpeed = 50; // km/h
        const estimatedTime = (distance / 1000) / averageSpeed * 3600;

        routeInfo.value = {
            distance: distance,
            duration: estimatedTime
        };
    }

    updateModelValue();
};

const onWaypointDragEnd = (event, index) => {
    const { lat, lng } = event.target.getLatLng();

    // Get address information for the new location
    loadingWaypoints.value[index] = true;
    getAddressFromCoordinates(lat, lng).then(addressInfo => {
        waypoints.value[index] = {
            lat,
            lng,
            ...(addressInfo && { address: addressInfo })
        };
        updateModelValue();

        // Update only the route segments affected by this waypoint
        if (startPoint.value && endPoint.value) {
            updateRouteSegment(index);
        }
        loadingWaypoints.value[index] = false;
    }).catch(() => {
        loadingWaypoints.value[index] = false;
    });
};

const onWaypointContextMenu = (event, index) => {
    event.originalEvent.preventDefault();

    // Get the map container position
    const mapContainer = mapRef.value.leafletObject.getContainer();
    const rect = mapContainer.getBoundingClientRect();

    // Calculate position relative to the map container
    const x = event.originalEvent.clientX - rect.left;
    const y = event.originalEvent.clientY - rect.top;

    contextMenu.value = {
        visible: true,
        x: x,
        y: y,
        targetType: 'waypoint',
        targetIndex: index
    };

    // Select the waypoint when context menu is opened
    selectedWaypoint.value = index;
};

const onWaypointClick = (index) => {
    // If context menu is visible, hide it
    if (contextMenu.value.visible) {
        hideContextMenu();
        return;
    }

    // Toggle selection
    if (selectedWaypoint.value === index) {
        selectedWaypoint.value = null;
    } else {
        selectedWaypoint.value = index;
    }
};

const hideContextMenu = () => {
    contextMenu.value.visible = false;
    contextMenu.value.targetType = null;
    contextMenu.value.targetIndex = null;
};

const deleteSelectedItem = () => {
    if (contextMenu.value.targetType === 'waypoint') {
        deleteWaypoint(contextMenu.value.targetIndex);
    }
    hideContextMenu();
};

const deleteSelectedWaypoint = () => {
    if (selectedWaypoint.value !== null) {
        deleteWaypoint(selectedWaypoint.value);
        selectedWaypoint.value = null;
    }
};

const deleteWaypoint = (index) => {
    if (index >= 0 && index < waypoints.value.length) {
        // Store the waypoint being deleted for reference
        const deletedWaypoint = waypoints.value[index];

        // Remove the waypoint from the array
        waypoints.value.splice(index, 1);

        // Clear loading state for this waypoint
        if (loadingWaypoints.value[index]) {
            delete loadingWaypoints.value[index];
        }

        // Only update the route segment around the deleted waypoint
        if (startPoint.value && endPoint.value && routePath.value.length > 0) {
            updateRouteSegmentAfterDeletion(index, deletedWaypoint);
        }

        updateModelValue();
    }
};

// Function to update only the route segment around the deleted waypoint
const updateRouteSegmentAfterDeletion = (deletedIndex, deletedWaypoint) => {
    // Find the positions of the previous and next points in the route path
    let prevPoint = null;
    let nextPoint = null;

    // Determine previous point
    if (deletedIndex === 0) {
        // First waypoint deleted, previous point is start point
        prevPoint = startPoint.value;
    } else {
        // Previous point is the waypoint before the deleted one
        prevPoint = waypoints.value[deletedIndex - 1];
    }

    // Determine next point
    if (deletedIndex >= waypoints.value.length) {
        // Last waypoint deleted, next point is end point
        nextPoint = endPoint.value;
    } else {
        // Next point is the waypoint after the deleted one
        nextPoint = waypoints.value[deletedIndex];
    }

    // Find the positions of these points in the current route path
    let prevPointIndex = -1;
    let nextPointIndex = -1;

    // Find previous point position in route path
    for (let i = 0; i < routePath.value.length; i++) {
        const point = routePath.value[i];
        const distance = calculateDistance(point[0], point[1], prevPoint.lat, prevPoint.lng);
        if (distance < 0.001) { // Very close to previous point
            prevPointIndex = i;
            break;
        }
    }

    // Find next point position in route path
    for (let i = routePath.value.length - 1; i >= 0; i--) {
        const point = routePath.value[i];
        const distance = calculateDistance(point[0], point[1], nextPoint.lat, nextPoint.lng);
        if (distance < 0.001) { // Very close to next point
            nextPointIndex = i;
            break;
        }
    }

    // If we found both points, replace the segment between them with a straight line
    if (prevPointIndex !== -1 && nextPointIndex !== -1 && prevPointIndex < nextPointIndex) {
        const newPath = [...routePath.value];

        // Create a straight line segment between previous and next points
        const straightLineSegment = [];
        const steps = 5; // Number of intermediate points for smooth line

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lat = prevPoint.lat + (nextPoint.lat - prevPoint.lat) * t;
            const lng = prevPoint.lng + (nextPoint.lng - prevPoint.lng) * t;
            straightLineSegment.push([lat, lng]);
        }

        // Replace the segment between prevPointIndex and nextPointIndex
        newPath.splice(prevPointIndex + 1, nextPointIndex - prevPointIndex - 1, ...straightLineSegment.slice(1, -1));

        routePath.value = newPath;

        // Update distance and time
        if (newPath.length > 1) {
            const distance = calculateTotalDistance(newPath);
            const averageSpeed = 50; // km/h
            const estimatedTime = (distance / 1000) / averageSpeed * 3600;

            routeInfo.value = {
                distance: distance,
                duration: estimatedTime
            };
        }
    }
};

// Keyboard event handler for delete key
const handleKeyDown = (event) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedWaypoint.value !== null) {
            deleteSelectedWaypoint();
        }
    } else if (event.key === 'Escape') {
        // Clear selection and hide context menu
        selectedWaypoint.value = null;
        hideContextMenu();
    }
};

// Click outside to hide context menu and clear selection
const handleClickOutside = (event) => {
    // Check if click is outside the context menu
    const contextMenuElement = document.querySelector('.context-menu');
    if (contextMenuElement && !contextMenuElement.contains(event.target)) {
        hideContextMenu();
    }

    // Check if click is outside waypoint markers (on map)
    const isMapClick = event.target.closest('.leaflet-container') &&
        !event.target.closest('.leaflet-marker-icon') &&
        !event.target.closest('.leaflet-marker-shadow');

    if (isMapClick) {
        selectedWaypoint.value = null;
    }
};

// Function to update only the route segments affected by a specific waypoint
const updateRouteSegment = (waypointIndex) => {
    if (!routePath.value || routePath.value.length === 0) return;

    const waypoint = waypoints.value[waypointIndex];

    // Find the waypoint positions in the route path
    const waypointPositions = findWaypointPositionsInRoute();

    if (waypointPositions[waypointIndex] !== undefined) {
        // Update the entire route segment that goes through this waypoint
        const newPath = [...routePath.value];
        const waypointPos = waypointPositions[waypointIndex];

        // Find the previous and next waypoints to determine the segment boundaries
        const prevWaypointIndex = waypointIndex - 1;
        const nextWaypointIndex = waypointIndex + 1;

        let segmentStart = 0;
        let segmentEnd = newPath.length - 1;

        // Find segment start (previous waypoint or start point)
        if (prevWaypointIndex >= 0 && waypointPositions[prevWaypointIndex] !== undefined) {
            segmentStart = waypointPositions[prevWaypointIndex];
        } else if (startPoint.value) {
            // Find start point position
            for (let i = 0; i < newPath.length; i++) {
                const distance = calculateDistance(newPath[i][0], newPath[i][1], startPoint.value.lat, startPoint.value.lng);
                if (distance < 0.001) { // Very close to start point
                    segmentStart = i;
                    break;
                }
            }
        }

        // Find segment end (next waypoint or end point)
        if (nextWaypointIndex < waypoints.value.length && waypointPositions[nextWaypointIndex] !== undefined) {
            segmentEnd = waypointPositions[nextWaypointIndex];
        } else if (endPoint.value) {
            // Find end point position
            for (let i = newPath.length - 1; i >= 0; i--) {
                const distance = calculateDistance(newPath[i][0], newPath[i][1], endPoint.value.lat, endPoint.value.lng);
                if (distance < 0.001) { // Very close to end point
                    segmentEnd = i;
                    break;
                }
            }
        }

        // Create a new segment that actually follows the dragged waypoint
        const newSegment = [];

        // Get the start and end points of the segment
        const segmentStartPoint = newPath[segmentStart];
        const segmentEndPoint = newPath[segmentEnd];

        // Create a path that goes from start to the dragged waypoint to end
        newSegment.push(segmentStartPoint);

        // Add intermediate points to create a smooth path to the dragged waypoint
        const steps = 5; // Number of intermediate points
        for (let i = 1; i <= steps; i++) {
            const t = i / (steps + 1);
            const lat = segmentStartPoint[0] + (waypoint.lat - segmentStartPoint[0]) * t;
            const lng = segmentStartPoint[1] + (waypoint.lng - segmentStartPoint[1]) * t;
            newSegment.push([lat, lng]);
        }

        // Add the dragged waypoint
        newSegment.push([waypoint.lat, waypoint.lng]);

        // Add intermediate points to create a smooth path from waypoint to end
        for (let i = 1; i <= steps; i++) {
            const t = i / (steps + 1);
            const lat = waypoint.lat + (segmentEndPoint[0] - waypoint.lat) * t;
            const lng = waypoint.lng + (segmentEndPoint[1] - waypoint.lng) * t;
            newSegment.push([lat, lng]);
        }

        newSegment.push(segmentEndPoint);

        // Replace the entire segment in the path
        newPath.splice(segmentStart, segmentEnd - segmentStart + 1, ...newSegment);

        routePath.value = newPath;

        // Update distance and time
        if (newPath.length > 1) {
            const distance = calculateTotalDistance(newPath);
            const averageSpeed = 50; // km/h
            const estimatedTime = (distance / 1000) / averageSpeed * 3600;

            routeInfo.value = {
                distance: distance,
                duration: estimatedTime
            };
        }
    }

    updateModelValue();
};

// Function to find the positions of waypoints in the route path
const findWaypointPositionsInRoute = () => {
    const positions = {};

    waypoints.value.forEach((waypoint, index) => {
        let closestIndex = 0;
        let minDistance = Infinity;

        for (let i = 0; i < routePath.value.length; i++) {
            const point = routePath.value[i];
            const distance = calculateDistance(point[0], point[1], waypoint.lat, waypoint.lng);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }

        positions[index] = closestIndex;
    });

    return positions;
};

// Function to create a simple route path from points
const updateRoutePath = () => {
    const path = [];

    // Add start point
    if (startPoint.value) {
        path.push([startPoint.value.lat, startPoint.value.lng]);
    }

    // Add waypoints in order
    waypoints.value.forEach(waypoint => {
        path.push([waypoint.lat, waypoint.lng]);
    });

    // Add end point
    if (endPoint.value) {
        path.push([endPoint.value.lat, endPoint.value.lng]);
    }

    routePath.value = path;

    // Calculate simple distance and time estimates
    if (path.length > 1) {
        const distance = calculateTotalDistance(path);
        const averageSpeed = 50; // km/h - average urban driving speed
        const estimatedTime = (distance / 1000) / averageSpeed * 3600; // Convert to seconds

        routeInfo.value = {
            distance: distance,
            duration: estimatedTime
        };
    }

    updateModelValue();
};

// Function to calculate total distance of a path
const calculateTotalDistance = (path) => {
    let totalDistance = 0;

    for (let i = 0; i < path.length - 1; i++) {
        const point1 = path[i];
        const point2 = path[i + 1];
        totalDistance += calculateDistance(point1[0], point1[1], point2[0], point2[1]);
    }

    return totalDistance * 1000; // Convert to meters
};

const clearWaypoints = () => {
    waypoints.value = [];
    updateModelValue();
    if (startPoint.value && endPoint.value) {
        calculateRoute();
    }
};

const clearRouteMarkers = () => {
    routeMarkers.value = [];
    updateModelValue();
};

const clearRoute = () => {
    startPoint.value = null;
    endPoint.value = null;
    waypoints.value = [];
    routePath.value = [];
    routeInfo.value = null;
    routeMarkers.value = []; // Clear route markers
    waypointMode.value = false; // Reset waypoint mode
    selectedWaypoint.value = null; // Clear selection
    hideContextMenu(); // Hide context menu
    updateModelValue();
};

const searchLocation = async () => {
    if (!searchQuery.value.trim()) return;

    searching.value = true;
    showResults.value = true;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5`
        );
        const data = await response.json();
        searchResults.value = data;
    } catch (error) {
        console.error('Error searching for location:', error);
        searchResults.value = [];
    } finally {
        searching.value = false;
    }
};

const handleSearchInput = () => {
    if (searchQuery.value.trim()) {
        showResults.value = true;
    } else {
        showResults.value = false;
    }
};

const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Get the full address information from the search result
    const addressInfo = {
        lat: lat,
        lng: lng,
        display_name: result.display_name,
        type: result.type,
        place_id: result.place_id,
        address: {
            house_number: result.address?.house_number,
            road: result.address?.road,
            suburb: result.address?.suburb,
            city: result.address?.city,
            state: result.address?.state,
            postcode: result.address?.postcode,
            country: result.address?.country
        }
    };

    // If no start point, set as start
    if (!startPoint.value) {
        loadingStartPoint.value = true;
        setStartPoint(lat, lng, addressInfo, false);
        loadingStartPoint.value = false;
    }
    // If no end point, set as end
    else if (!endPoint.value) {
        loadingEndPoint.value = true;
        setEndPoint(lat, lng, addressInfo, false);
        loadingEndPoint.value = false;
    }
    // If both start and end points are set, don't add waypoints automatically
    // Waypoints will be extracted from route joints when route is calculated

    searchQuery.value = result.display_name;
    showResults.value = false;
    setMapCenter(lat, lng, false);
};

const updateModelValue = () => {
    console.log('updateModelValue called');
    isInternalUpdate.value = true;
    emit('update:modelValue', {
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
        loadingRoute: loadingRoute.value
    });
    nextTick(() => {
        isInternalUpdate.value = false;
    });
    console.log('updateModelValue completed');
};

const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    } else {
        return `${(meters / 1000).toFixed(1)}km`;
    }
};

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
};

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        startPoint.value = newValue.startPoint || null;
        endPoint.value = newValue.endPoint || null;
        waypoints.value = newValue.waypoints || [];
        routePath.value = newValue.routePath || [];
        routeInfo.value = newValue.routeInfo || null;

        // Center map to fit the loaded route data only if this is an external update
        if (newValue.routePath && newValue.routePath.length > 0 && !isInternalUpdate.value) {
            nextTick(() => {
                // Wait for the map to be ready
                const checkMapReady = () => {
                    if (mapRef.value && mapRef.value.leafletObject) {
                        centerMap();
                    } else {
                        // Retry after a short delay
                        setTimeout(checkMapReady, 100);
                    }
                };
                checkMapReady();
            });
        }
    }
}, { immediate: true });

// Lifecycle hooks
onMounted(() => {
    nextTick(() => {
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
    });
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleKeyDown);
});

// Expose methods to parent component
defineExpose({
    centerMap
});

// Function to get address information from coordinates using reverse geocoding
const getAddressFromCoordinates = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();

        if (data && data.display_name) {
            return {
                display_name: data.display_name,
                type: data.type,
                place_id: data.place_id,
                address: data.address || {}
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting address from coordinates:', error);
        return null;
    }
};
</script>

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
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
    border: 1px solid var(--bs-border-color);
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

:deep(.leaflet-marker-icon) {
    background: transparent !important;
    border: none !important;
}

:deep(.leaflet-marker-shadow) {
    display: none !important;
}

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

    /* Remove margin positioning since icon-anchor handles it */
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

.waypoint-icon.selected {
    background: var(--warning);
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%);
}

.route-marker-icon {
    background: #6c757d;

    /* A different color for route markers */
}

.custom-icon i {
    color: white;
    font-size: 12px;
    transform: rotate(45deg);
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

.map-style-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    display: flex;
    gap: 5px;
}

.style-btn {
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
}

.style-btn:hover {
    background: rgb(255 255 255 / 100%);
}

.style-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
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
    background: rgb(255 255 255 / 90%);
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
}

.control-btn:hover {
    background: rgb(255 255 255 / 100%);
}

.route-actions {
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 1000;
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
}

.action-btn {
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

.action-btn:hover {
    background: rgb(255 255 255 / 100%);
}

.calculate-route-btn {
    background: rgb(40 167 69 / 90%);
    color: white;
    border-color: var(--success);
}

.calculate-route-btn:hover {
    background: rgb(40 167 69 / 100%);
}

.add-waypoint-btn {
    background: rgb(0 123 255 / 90%);
    color: white;
    border-color: var(--accent);
}

.add-waypoint-btn:hover {
    background: rgb(0 123 255 / 100%);
}

.clear-waypoints-btn {
    background: rgb(255 193 7 / 90%);
    color: white;
    border-color: var(--warning);
}

.clear-waypoints-btn:hover {
    background: rgb(255 193 7 / 100%);
}

.clear-route-markers-btn {
    background: rgb(108 117 125 / 90%);
    color: white;
    border-color: #6c757d;
}

.clear-route-markers-btn:hover {
    background: rgb(108 117 125 / 100%);
}

.clear-route-btn {
    background: rgb(220 53 69 / 90%);
    color: white;
    border-color: var(--error);
}

.clear-route-btn:hover {
    background: rgb(220 53 69 / 100%);
}

.route-info {
    position: absolute;
    bottom: 10px;
    right: 10px;

    /* transform: translateX(-50%); */
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

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
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

.location-search {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: 300px;
    max-width: calc(100% - 20px);
}

.search-container {
    display: flex;
    background: rgb(255 255 255 / 95%);
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
}

.search-input {
    flex: 1;
    padding: 8px 12px;
    border: none;
    outline: none;
    font-size: 14px;
    background: transparent;
}

.search-btn {
    background: var(--accent);
    color: white;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.2s;
}

.search-btn:hover {
    background: #0056b3;
}

.search-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    border-top: none;
    border-radius: 0 0 8px 8px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1001;
}

.search-result-item {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    transition: background 0.2s;
}

.search-result-item:hover {
    background: #f8f9fa;
}

.search-result-item:last-child {
    border-bottom: none;
}

.result-name {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 2px;
}

.result-type {
    font-size: 12px;
    color: #666;
}

.context-menu {
    position: absolute;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 0;
    min-width: 120px;
}

.context-menu-item {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #333;
    transition: background 0.2s;
}

.context-menu-item:hover {
    background: #f0f0f0;
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

@media (width <= 768px) {
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
}
</style>