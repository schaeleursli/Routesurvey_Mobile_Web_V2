<template>
    <div class="map-viewer">
        <template v-if="loading">
            <div class="loading-container">
                <BaseLoadingIndicator size="large" message="Loading map..." />
            </div>
        </template>
        <template v-else-if="routePoints.length > 0">
            <l-map ref="mapRef" v-model:zoom="zoom" :center="mapCenter" :min-zoom="minZoom" :max-zoom="maxZoom"
                :options="mapOptions" style="height: 100%; width: 100%;" @ready="onMapReady">
                <l-tile-layer :url="tileLayerUrl" :options="tileLayerOptions" />

                <!-- Route segments - optimized rendering -->
                <l-polyline v-if="routeCoordinates.length > 0" :lat-lngs="routeCoordinates" :color="routeColor"
                    :weight="routeWeight" :opacity="routeOpacity" :options="polylineOptions" />

                <!-- Point markers with popups - virtualized for performance -->
                <template v-for="(point, index) in visiblePoints" :key="`${point.id}-${index}`">
                    <l-marker :lat-lng="{ lat: point.lat, lng: point.lng }" :options="markerOptions"
                        @dblclick="handlePointDoubleClick(point, index)"
                        @contextmenu="handlePointRightClick($event, point, index)">

                        <!-- Start/End markers -->
                        <l-icon v-if="index === 0 || index === visiblePoints.length - 1" :icon-anchor="[16, 16]"
                            :icon-size="[24, 24]">
                            <div class="custom-icon start-end">
                                <img src="@/assets/img/marker_location.png" width="24" height="24" loading="lazy">
                            </div>
                        </l-icon>


                        <!-- Survey point markers -->
                        <l-icon v-else-if="point.type !== 'route_point'" :icon-anchor="[15, 15]" :icon-size="[30, 30]">
                            <div class="custom-icon survey-point">
                                <img v-if="point.type === 'bridge'" width="18" height="18" src="@/assets/img/bridge.png"
                                    loading="lazy">
                                <img v-else-if="point.type === 'powerline'" width="18" height="18"
                                    src="@/assets/img/electric-tower_old_delete.png" loading="lazy">
                                <img v-else-if="point.type === 'intersection'" width="18" height="18"
                                    src="@/assets/img/intersection.png" loading="lazy">
                                <img v-else-if="point.type === 'road'" width="18" height="18"
                                    src="@/assets/img/road.png" loading="lazy">
                                <img v-else-if="point.type === 'overhead'" width="18" height="18"
                                    src="@/assets/img/overhead.png" loading="lazy">
                                <i v-else-if="point.type === 'railroad'" class="fas fa-train"></i>
                                <i v-else-if="point.type === 'custom'" class="far fa-question-circle"></i>
                                <i v-else class="bi bi-geo-alt"></i>
                            </div>
                        </l-icon>

                        <!-- Popup content - lazy loaded -->
                        <l-popup v-if="showPopups" :options="popupOptions">
                            <div class="point-popup">
                                <div class="popup-header">
                                    <h6 v-if="index === 0">Start Point</h6>
                                    <h6 v-else-if="index === visiblePoints.length - 1">End Point</h6>
                                    <h6 v-else>{{ (Number(point.distance) / 1000).toFixed(2) }} km - {{
                                        getPointTypeLabel(point.type) }}</h6>
                                </div>
                                <div class="popup-content">
                                    <div class="popup-info">
                                        <strong>Coordinates:</strong>
                                        <a :href="`https://maps.google.com/?q=${point.lat},${point.lng}`"
                                            target="_blank" class="coordinates-link">
                                            {{ point.lat.toFixed(6) }}, {{ point.lng.toFixed(6) }}
                                        </a>
                                    </div>
                                    <div v-if="point.data" class="popup-info">
                                        <strong>Address:</strong> {{ getPointAddress(point) }}
                                    </div>
                                    <div v-if="point.notes" class="popup-info">
                                        <strong>Notes:</strong> {{ point.notes }}
                                    </div>
                                    <div v-if="point.type !== 'route_point' && showPointActions" class="popup-actions">
                                        <BaseButton size="small" variant="primary" @click="handlePointInfo(point)">
                                            <i class="fas fa-info-circle"></i> View Details
                                        </BaseButton>
                                    </div>
                                </div>
                            </div>
                        </l-popup>
                    </l-marker>
                </template>
            </l-map>
        </template>
        <template v-else>
            <div class="map-placeholder">
                <i class="fas fa-map"></i>
                <span>No points to display</span>
            </div>
        </template>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { LMap, LTileLayer, LMarker, LIcon, LPolyline, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BaseButton, BaseLoadingIndicator } from '@/components/ui'
import { useI18n } from 'vue-i18n'

export default {
    name: 'MapViewer',
    components: {
        LMap,
        LTileLayer,
        LMarker,
        LIcon,
        LPolyline,
        LPopup,
        BaseButton
    },
    props: {
        routePoints: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        },
        routeColor: {
            type: String,
            default: '#333B56'
        },
        routeWeight: {
            type: Number,
            default: 6
        },
        routeOpacity: {
            type: Number,
            default: 0.8
        },
        showPointActions: {
            type: Boolean,
            default: true
        },
        minZoom: {
            type: Number,
            default: 1
        },
        maxZoom: {
            type: Number,
            default: 18
        },
    },
    emits: ['point-double-click', 'point-right-click', 'point-info'],
    setup(props, { emit }) {
        const { t } = useI18n()
        const mapRef = ref(null)
        const zoom = ref(13)
        const isMapReady = ref(false)
        const showPopups = ref(true) // Enable popups

        // Map options
        const mapOptions = {
            zoomControl: true,
            attributionControl: true,
            dragging: true,
            touchZoom: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            boxZoom: true,
            keyboard: true,
            preferCanvas: true
        }

        const tileLayerOptions = {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            subdomains: ['a', 'b', 'c']
        }

        const polylineOptions = {
            smoothFactor: 1.0,
            color: props.routeColor,
            weight: props.routeWeight,
            opacity: props.routeOpacity
        }

        const markerOptions = {
            riseOnHover: true,
            interactive: true
        }

        const popupOptions = {
            closeButton: true,
            autoClose: true,
            keepInView: true,
            maxWidth: 300,
            className: 'custom-popup'
        }

        // Map configuration
        const tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

        // Computed properties with performance optimizations
        const mapCenter = computed(() => {
            if (props.routePoints.length === 0) {
                return [0, 0]
            }
            const lats = props.routePoints.map(p => p.lat)
            const lngs = props.routePoints.map(p => p.lng)
            return [
                (Math.min(...lats) + Math.max(...lats)) / 2,
                (Math.min(...lngs) + Math.max(...lngs)) / 2
            ]
        })

        const filteredRoutePoints = computed(() => {
            return props.routePoints.filter(point => point.lat && point.lng)
        })

        // Show all points without clustering
        const visiblePoints = computed(() => {
            return filteredRoutePoints.value
        })


        // Pre-computed route coordinates for better performance
        const routeCoordinates = computed(() => {
            return props.routePoints.map(p => [p.lat, p.lng])
        })

        // Methods
        const getPointTypeLabel = (type) => {
            const typeLabels = {
                'bridge': t('bridge'),
                'powerline': t('powerline'),
                'intersection': t('intersection'),
                'road': t('road'),
                'overhead': t('overhead'),
                'railroad': t('railroad'),
                'custom': t('custom'),
                'route_point': t('routePoint')
            }
            return typeLabels[type] || type
        }

        const getPointAddress = (point) => {
            if (!point.data) return 'N/A'
            return point.data.address || point.data.formatted_address || 'N/A'
        }

        const handlePointDoubleClick = (point, index) => {
            emit('point-double-click', { point, index })
        }

        const handlePointRightClick = (event, point, index) => {
            event.preventDefault()
            emit('point-right-click', { event, point, index })
        }

        const handlePointInfo = (point) => {
            emit('point-info', point)
        }


        // Performance-optimized map initialization
        const onMapReady = () => {
            isMapReady.value = true
            setupCanvasRenderer()
            fitMapToRoute()
        }

        const setupCanvasRenderer = () => {
            if (mapRef.value && mapRef.value.leafletObject) {
                const map = mapRef.value.leafletObject
                // Use canvas renderer for better performance with many markers
                const canvasRenderer = L.canvas()
                map.options.renderer = canvasRenderer
            }
        }

        // Auto-fit map to route bounds with performance optimization
        const fitMapToRoute = () => {
            if (mapRef.value && props.routePoints.length > 0) {
                nextTick(() => {
                    const map = mapRef.value.leafletObject
                    if (map) {
                        const group = new L.featureGroup()

                        // Only add visible points to avoid performance issues
                        visiblePoints.value.forEach(point => {
                            if (point.lat && point.lng) {
                                group.addLayer(L.marker([point.lat, point.lng]))
                            }
                        })

                        if (group.getLayers().length > 0) {
                            map.fitBounds(group.getBounds(), {
                                padding: [20, 20],
                                maxZoom: 16 // Prevent over-zooming
                            })
                        }
                    }
                })
            }
        }

        // Normal zoom handler
        const handleZoom = () => {
            // Show popups at reasonable zoom levels
            showPopups.value = zoom.value >= 10
        }

        // Watch for route points changes
        watch(() => props.routePoints, () => {
            if (props.routePoints.length > 0 && isMapReady.value) {
                fitMapToRoute()
            }
        }, { deep: true })

        // Watch zoom changes
        watch(zoom, handleZoom)

        onMounted(() => {
            if (props.routePoints.length > 0) {
                nextTick(() => {
                    setTimeout(fitMapToRoute, 200)
                })
            }
        })

        return {
            mapRef,
            zoom,
            tileLayerUrl,
            mapCenter,
            filteredRoutePoints,
            visiblePoints,
            routeCoordinates,
            showPopups,
            mapOptions,
            tileLayerOptions,
            polylineOptions,
            markerOptions,
            popupOptions,
            getPointTypeLabel,
            getPointAddress,
            handlePointDoubleClick,
            handlePointRightClick,
            handlePointInfo,
            onMapReady
        }
    }
}
</script>

<style scoped>
.map-viewer {
    height: 100%;
    width: 100%;
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.map-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
    font-size: var(--font-size-xl);
    gap: var(--spacing-md);
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* Custom marker styles - following RouteViewerNew structure */
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
    border: 3px solid #333B56;
    background-color: #f8f9fa;
}

.start-end {
    background-color: #333B56 !important;
    border: 2px solid #333B56 !important;
    color: white !important;
    width: 32px !important;
    height: 32px !important;
    padding: 3px !important;
}

.start-end img {
    filter: brightness(0) invert(1);
    padding: 2px !important;
    border-radius: 2px !important;
}

.survey-point {
    background-color: #f8f9fa !important;
    border: 3px solid #333B56 !important;
    color: #333B56 !important;
    padding: 3px !important;
}


.survey-point img {
    max-width: 18px !important;
    max-height: 18px !important;
    object-fit: contain !important;
    background: transparent !important;
    padding: 2px !important;
    border-radius: 2px !important;
}

.custom-icon i {
    color: #333B56 !important;
    font-size: 12px !important;
    position: relative !important;
    z-index: 1 !important;
    padding: 2px !important;
    border-radius: 2px !important;
}

/* Hide default Leaflet marker styling */
:deep(.leaflet-marker-icon) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

:deep(.leaflet-marker-shadow) {
    display: none !important;
}

:deep(.leaflet-marker) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

/* Ensure our custom icons don't inherit any unwanted backgrounds */
:deep(.leaflet-marker-icon) div {
    background: transparent !important;
}

.custom-icon:not(.route-point) {
    background-color: #f8f9fa !important;
    border-radius: 50% !important;
    width: 30px !important;
    height: 30px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%) !important;
    border: 3px solid #333B56 !important;
}

/* Popup styles - always black text for better readability */
.point-popup {
    min-width: 200px;
    max-width: 300px;
    color: #000 !important;
}

.popup-header {
    margin-bottom: var(--spacing-xs);
    border-bottom: 1px solid #ccc;
    padding-bottom: var(--spacing-xs);
}

.popup-header h6 {
    margin: 0;
    color: #000 !important;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
}

.popup-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    color: #000 !important;
}

.popup-info {
    font-size: var(--font-size-sm);
    line-height: 1.4;
    color: #000 !important;
}

.popup-info strong {
    color: #000 !important;
    font-weight: var(--font-weight-semibold);
}

.popup-actions {
    margin-top: var(--spacing-xs);
    padding-top: var(--spacing-xs);
    border-top: 1px solid #ccc;
}


.coordinates-link {
    color: #06c !important;
    text-decoration: none;
    transition: color var(--transition-fast);
}

.coordinates-link:hover {
    color: #049 !important;
    text-decoration: underline;
}


/* Responsive adjustments */
@media (width <= 700px) {
    .popup-header h6 {
        font-size: var(--font-size-sm);
    }

    .popup-info {
        font-size: var(--font-size-xs);
    }
}
</style>