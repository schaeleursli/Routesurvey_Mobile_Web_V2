<template>
  <div class="dashboard-route-card" :class="{ 'selected': isSelected }">
    <!-- Mini Map Preview -->
    <div class="card-map-preview" @click.stop="emit('navigate', route)">
      <div class="map-placeholder" v-if="!mapReady">
        <div class="map-loading-pulse"></div>
      </div>
      <div v-else class="mini-map">
        <l-map 
          ref="mapRef" 
          :zoom="mapZoom" 
          :center="mapCenter" 
          :use-global-leaflet="false"
          :options="{ 
            zoomControl: false, 
            dragging: false, 
            touchZoom: false, 
            doubleClickZoom: false, 
            scrollWheelZoom: false, 
            boxZoom: false, 
            keyboard: false,
            attributionControl: false
          }"
          @ready="onMapReady"
        >
          <l-tile-layer 
            :url="tileUrl" 
            layer-type="base"
          />
          
          <!-- Route Polyline -->
          <l-polyline 
            v-if="routePath.length > 1" 
            :lat-lngs="routePath" 
            :color="'#00A7E1'" 
            :weight="3"
            :opacity="0.9"
          />
          
          <!-- Start Marker -->
          <l-marker v-if="startPoint" :lat-lng="startPoint">
            <l-icon :icon-anchor="[12, 12]" :icon-size="[24, 24]">
              <div class="map-marker start-marker">A</div>
            </l-icon>
          </l-marker>
          
          <!-- End Marker -->
          <l-marker v-if="endPoint" :lat-lng="endPoint">
            <l-icon :icon-anchor="[12, 12]" :icon-size="[24, 24]">
              <div class="map-marker end-marker">B</div>
            </l-icon>
          </l-marker>
        </l-map>
      </div>
      <div class="map-overlay">
        <i class="bi bi-arrows-fullscreen"></i>
      </div>
    </div>

    <!-- Card Header -->
    <div class="card-header">
      <div class="route-info">
        <h4 class="route-title" :title="route.name">{{ route.name }}</h4>
        <div class="route-meta">
          <span class="route-date">
            <i class="bi bi-clock"></i> {{ formatTimeAgo(route.updatedAt) }}
          </span>
        </div>
      </div>
      <div class="header-actions">
        <!-- Distance Pill Moved Here -->
        <div class="distance-pill" v-if="displayDistance !== '—'">
           <i class="bi bi-signpost-split"></i>
           {{ displayDistance }}
        </div>

        <button v-if="isSelected" class="select-btn active" @click.stop="emit('release', route)" title="Release Selection">
           <i class="bi bi-x-circle-fill"></i>
        </button>
        <button v-else class="select-btn" @click.stop="emit('select', route)" title="Select Route Context">
           <i class="bi bi-circle"></i>
        </button>
        <div class="status-badge" :class="statusClass">
          {{ formattedStatus }}
        </div>
      </div>
    </div>

    <!-- Card Body: Enhanced Location Timeline -->
    <div class="card-body">
      <div class="location-timeline">
        <!-- Start Row -->
        <div class="timeline-marker">
          <div class="point-badge start-badge">A</div>
        </div>
        <div class="timeline-content">
          <span class="location-address" :title="getTooltip(route.startLocation)">
            {{ formatAddress(route.startLocation) }}
          </span>
        </div>
        
        <!-- Connector Only (Distance Removed) -->
        <div class="timeline-connector">
          <div class="connector-line"></div>
        </div>
        <!-- Spacer for grid alignment where distance used to be -->
        <div class="timeline-spacer"></div>
        
        <!-- End Row -->
        <div class="timeline-marker">
          <div class="point-badge end-badge">B</div>
        </div>
        <div class="timeline-content">
          <span class="location-address" :title="getTooltip(route.endLocation)">
            {{ formatAddress(route.endLocation) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Card Actions -->
    <div class="card-actions">
      <div class="action-steps">
        <!-- Planned Step -->
        <button 
          class="action-step" 
          :class="getStepClass('planned')"
          @click.stop="handleAction('planned')"
          title="Planned Route"
        >
          <div class="step-icon"><i class="bi bi-map"></i></div>
          <span class="step-label">Planned</span>
        </button>

        <div class="step-connector" :class="{ 'active': isStepComplete('surveyed') }"></div>

        <!-- Surveyed Step -->
        <button 
          class="action-step" 
          :class="getStepClass('surveyed')"
          @click.stop="handleAction('surveyed')"
          title="Survey Route"
        >
          <div class="step-icon"><i class="bi bi-clipboard-check"></i></div>
          <span class="step-label">Surveyed</span>
        </button>

        <div class="step-connector" :class="{ 'active': isStepComplete('reported') }"></div>

        <!-- Report Step -->
        <button 
          class="action-step" 
          :class="getStepClass('reported')"
          @click.stop="handleAction('reported')"
          title="Route Report"
        >
          <div class="step-icon"><i class="bi bi-file-earmark-text"></i></div>
          <span class="step-label">Report</span>
        </button>

        <div class="step-connector" :class="{ 'active': isStepComplete('shared') }"></div>

        <!-- Share Step -->
        <button 
          class="action-step" 
          :class="getStepClass('shared')"
          @click.stop="handleAction('shared')"
          title="Share Route"
        >
          <div class="step-icon"><i class="bi bi-share"></i></div>
          <span class="step-label">Share</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { LMap, LTileLayer, LMarker, LPolyline, LIcon } from '@vue-leaflet/vue-leaflet'
import { useUnits } from '@/composables/useUnits'
import routeUtils from '@/utils/route_utils'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  route: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['navigate', 'action', 'select', 'release'])

const { formatDistance } = useUnits()

// Map state
const mapRef = ref(null)
const mapReady = ref(false)
const mapZoom = ref(12)
const mapCenter = ref([30.0444, 31.2357]) // Default: Cairo
const routePath = ref([])
const startPoint = ref(null)
const endPoint = ref(null)
const tileUrl = ref('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')

// -- Computed Properties --

const displayDistance = computed(() => {
  if (props.route.distance && props.route.distance > 0) {
    return formatDistance(props.route.distance)
  }
  return '—'
})

const statusClass = computed(() => {
  const s = String(props.route.status).toLowerCase();
  switch (s) {
    case 'planned': return 'status-planned';
    case 'surveyed': return 'status-surveyed';
    case 'manual': return 'status-manual';
    case 'reported': return 'status-reported';
    case 'completed': return 'status-reported';
    case 'shared': return 'status-shared';
    default: return 'status-planned';
  }
})

const formattedStatus = computed(() => {
  if (!props.route.status) return 'Planned';
  return props.route.status.charAt(0).toUpperCase() + props.route.status.slice(1);
})

const currentStepIndex = computed(() => {
  const s = String(props.route.status).toLowerCase();
  switch (s) {
    case 'planned': return 0;
    case 'manual':
    case 'surveyed': return 1;
    case 'reported': 
    case 'completed': return 2;
    case 'shared': return 3;
    default: return 0;
  }
})

// -- Methods --

const formatAddress = (addr) => {
  const address = routeUtils.getShortAddress(addr)
  return address || 'Unknown Location'
}

const formatTimeAgo = (dateLink) => {
    if (!dateLink) return 'Recently';
    const date = new Date(dateLink);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString(); 
}

const getTooltip = (addr) => {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  if (addr.display_name) return addr.display_name;
  return '';
}

const isStepComplete = (stepName) => {
  const stepMap = { 'planned': 0, 'surveyed': 1, 'reported': 2, 'shared': 3 };
  return currentStepIndex.value >= stepMap[stepName];
}

const getStepClass = (stepName) => {
  const stepMap = { 'planned': 0, 'surveyed': 1, 'reported': 2, 'shared': 3 };
  const stepIdx = stepMap[stepName];
  
  if (currentStepIndex.value > stepIdx) return 'completed';
  if (currentStepIndex.value === stepIdx) return 'active';
  if (currentStepIndex.value === stepIdx - 1) return 'next';
  return 'pending';
}

const handleAction = (stepName) => {
  emit('action', { route: props.route, step: stepName });
}

// Map initialization
const initializeMap = () => {
  try {
    // Extract coordinates from route data
    const coordinates = extractRouteCoordinates(props.route)
    
    if (coordinates.length > 0) {
      routePath.value = coordinates
      startPoint.value = coordinates[0]
      endPoint.value = coordinates[coordinates.length - 1]
      
      // Calculate center
      const centerLat = (coordinates[0][0] + coordinates[coordinates.length - 1][0]) / 2
      const centerLng = (coordinates[0][1] + coordinates[coordinates.length - 1][1]) / 2
      mapCenter.value = [centerLat, centerLng]
    } else {
      // Fallback: generate sample points based on route ID
      generateFallbackRoute()
    }
    
    mapReady.value = true
  } catch (error) {
    console.warn('Map init error:', error)
    generateFallbackRoute()
    mapReady.value = true
  }
}

const extractRouteCoordinates = (route) => {
  // Try routePath first (array of [lat, lng] arrays)
  if (route.routePath && Array.isArray(route.routePath) && route.routePath.length > 0) {
    return route.routePath.map(p => [p[0], p[1]])
  }
  
  // Try coordinates array (objects with lat/lng)
  if (route.coordinates && Array.isArray(route.coordinates) && route.coordinates.length > 0) {
    return route.coordinates.map(c => [c.lat || c[0], c.lng || c[1]])
  }
  
  // Try pointsData  
  if (route.pointsData && Array.isArray(route.pointsData) && route.pointsData.length > 0) {
    return route.pointsData.map(p => [p.lat, p.lng])
  }
  
  // Try RouteData JSON field
  if (route.RouteData) {
    try {
      const data = typeof route.RouteData === 'string' ? JSON.parse(route.RouteData) : route.RouteData
      if (data.pointsData && Array.isArray(data.pointsData)) {
        return data.pointsData.map(p => [p.lat, p.lng])
      }
    } catch (e) { /* ignore parse errors */ }
  }
  
  // Try start/end coordinates
  if (route.startCoords && route.endCoords) {
    return [
      [route.startCoords.lat, route.startCoords.lng],
      [route.endCoords.lat, route.endCoords.lng]
    ]
  }
  
  return []
}


const generateFallbackRoute = () => {
  // Generate deterministic sample route based on route ID
  const seed = (props.route.id || 1) * 0.01
  const baseLat = 30.0444 + Math.sin(seed) * 0.05
  const baseLng = 31.2357 + Math.cos(seed) * 0.05
  
  const points = [
    [baseLat, baseLng],
    [baseLat + 0.02, baseLng + 0.01],
    [baseLat + 0.03, baseLng + 0.025],
    [baseLat + 0.04, baseLng + 0.04]
  ]
  
  routePath.value = points
  startPoint.value = points[0]
  endPoint.value = points[points.length - 1]
  mapCenter.value = [(baseLat + baseLat + 0.04) / 2, (baseLng + baseLng + 0.04) / 2]
}

const onMapReady = () => {
  nextTick(() => {
    if (mapRef.value && routePath.value.length > 1) {
      try {
        const map = mapRef.value.leafletObject
        if (map) {
          const L = window.L
          if (L) {
            const bounds = L.latLngBounds(routePath.value)
            map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 })
          }
        }
      } catch (e) { /* ignore bounds errors */ }
    }
  })
}

// Watch for route changes
watch(() => props.route, () => {
  initializeMap()
}, { deep: true })

// Lifecycle
onMounted(() => {
  initializeMap()
})

</script>

<style scoped>
.dashboard-route-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 0;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
  height: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.dashboard-route-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--border-hover);
}

.dashboard-route-card.selected {
  border: 2px solid var(--accent);
  box-shadow: 0 0 0 4px var(--accent-focus-ring);
}

/* Mini Map Preview */
.card-map-preview {
  height: 140px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
}

.map-placeholder {
  height: 100%;
  background: linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-loading-pulse {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.3;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(0.8); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.6; }
}

.mini-map {
  height: 100%;
  width: 100%;
}

.mini-map :deep(.leaflet-container) {
  background: var(--bg-elevated);
}

.map-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgb(0 0 0 / 60%);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.card-map-preview:hover .map-overlay {
  opacity: 1;
  transform: scale(1);
}

/* Map Markers */
.map-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
  border: 2px solid white;
}

.start-marker {
  background: linear-gradient(135deg, #00B48A 0%, #00A7E1 100%);
}

.end-marker {
  background: linear-gradient(135deg, #DC3545 0%, #FF6B6B 100%);
}

/* Header */
.card-header {
  padding: 1rem 1.25rem 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1.1rem;
}

.select-btn:hover {
  background: var(--bg-elevated);
  color: var(--accent);
}

.select-btn.active {
  color: var(--accent);
  background: rgb(0 167 225 / 10%);
}

.route-info {
  flex: 1;
  min-width: 0;
}

.route-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.35rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.route-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.route-date {
  display: flex;
  align-items: center;
}

.route-date i {
  margin-right: 0.4rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* Status Badge */
.status-badge {
  font-size: 0.70rem; /* Slightly larger for readability */
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  height: 24px;
}

.status-planned { background: var(--bg-elevated); color: var(--text-secondary); border: 1px solid var(--border); }
.status-surveyed { background: var(--accent-surface); color: var(--accent); border: 1px solid var(--accent-focus-ring); }
.status-manual { background: var(--warning-bg); color: var(--warning); border: 1px solid rgba(217, 119, 6, 0.2); }
.status-reported { background: var(--success-bg); color: var(--success); border: 1px solid rgba(5, 150, 105, 0.2); }
.status-shared { background: #F3E8FF; color: #7C3AED; border: 1px solid rgba(124, 58, 237, 0.2); } /* Violet for shared */

/* Body - Grid Layout */
.card-body {
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
  flex: 1;
}

.location-timeline {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 0.25rem 0.75rem;
  align-items: center;
}

.timeline-marker {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px;
}

.timeline-content {
  min-width: 0;
  display: flex;
  align-items: center;
  height: 28px;
}

.timeline-connector {
  display: flex;
  justify-content: center;
  height: 24px;
}

/* Spacer replaces timeline distance */
.timeline-spacer {
  height: 24px;
}

.point-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 4px rgb(0 0 0 / 15%);
}

.start-badge {
  background: linear-gradient(135deg, #00B48A 0%, #00A7E1 100%);
}

.end-badge {
  background: linear-gradient(135deg, #DC3545 0%, #FF6B6B 100%);
}

.connector-line {
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, #00B48A 0%, #DC3545 100%);
  opacity: 0.3;
  border-radius: 1px;
}

.location-address {
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.distance-pill {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: 24px;
}

.distance-pill i {
  font-size: 0.7rem;
  color: var(--accent);
}

/* Actions Footer */
.card-actions {
  padding: 0.75rem 1.25rem 1rem;
  margin-top: auto;
  border-top: 1px solid var(--border);
  background: linear-gradient(to bottom, var(--bg-surface) 0%, var(--bg-elevated) 100%);
}

.action-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
}

.action-step {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.2s;
  position: relative;
  z-index: 2;
  width: 48px;
}

.action-step:hover {
  transform: translateY(-2px);
}

.action-step:hover .step-label {
  color: var(--text-primary);
}

.step-icon {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 2px solid var(--border);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: var(--text-secondary);
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
}

.step-label {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--text-tertiary);
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Step States */
.action-step.completed .step-icon {
  background: var(--success);
  border-color: var(--success);
  color: white;
  box-shadow: 0 4px 10px rgb(0 180 138 / 25%);
}

.action-step.completed .step-label {
  color: var(--success);
}

.action-step.active .step-icon {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
  box-shadow: 0 4px 12px rgb(0 167 225 / 30%);
  transform: scale(1.1);
}

.action-step.active .step-label {
  color: var(--accent);
  font-weight: 700;
}

.action-step.next .step-icon {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg-surface);
  border-style: dashed;
}

.action-step.pending .step-icon {
  background: var(--bg-elevated);
  opacity: 0.6;
}

/* Connectors */
.step-connector {
  flex: 1;
  height: 2px;
  background: var(--border);
  margin-top: -1.1rem;
  z-index: 1;
  position: relative;
  border-radius: 2px;
  margin-left: 4px;
  margin-right: 4px;
}

.step-connector.active {
  background: var(--success);
}

/* Responsive */
@media (width <= 480px) {
  .card-map-preview {
    height: 120px;
  }
  
  .route-title {
    font-size: 1rem;
  }
  
  .action-step {
    width: 36px;
  }
  
  .step-label {
    font-size: 0.55rem;
  }
}
</style>
