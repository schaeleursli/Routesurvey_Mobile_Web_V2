<template>
    <div class="route-viewer-new" v-if="checkFeatureAccess('free_surveys') && routeData && currentUserData">
        <!-- Main Panel -->
        <BasePanel :title="routeData?.title || 'Route Viewer'" elevation="level1" class="main-panel"
            v-show="!isSidebarExpanded">
            <template #header>
                <div class="header-actions-group">
                    <div v-if="routeData" class="header-action-buttons">
                        <BaseButton variant="primary" size="small" @click="editRoute" left-icon="bi bi-pencil">
                            Edit Route
                        </BaseButton>
                    </div>
                </div>
            </template>

            <!-- Main Content Area -->
            <div class="main-content">
                <!-- Center Content - Map View -->
                <div class="center-content">
                    <BaseCard>
                        <div class="map-container">
                            <!-- Map View -->
                            <div v-if="viewMode === 'map'" class="map-view">
                                <RouteMapViewer ref="mapRef" :route-points="routePoints" :edit-mode="editMode"
                                    :selected-marker="selectedMarker" :map-center="mapCenter" :zoom="zoom"
                                    @marker-click="onMarkerClick" @marker-drag="onMarkerDrag"
                                    @segment-click="onSegmentClick" @segment-hover="onSegmentHover"
                                    @segment-leave="onSegmentLeave" @point-info="openPointInfo" @point-edit="editPoint"
                                    @map-ready="onMapReady" />

                            </div>

                            <!-- List View -->
                            <div v-if="viewMode === 'list'" class="list-view">
                                <div class="list-header">
                                    <h4>Route Points ({{ nonRoutePointsCount }})</h4>
                                </div>
                                <div class="points-list">
                                    <ListItem v-for="(point, index) in filteredRoutePoints"
                                        :key="`${point.id}-${index}`" :title="getPointTypeLabel(point.type)"
                                        :subtitle="`${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`"
                                        :description="getPointDescription(point)" :clickable="true"
                                        :active="selectedMarker?.index === routePoints.findIndex(p => p.id === point.id)"
                                        @click="openPointInfo(point)">
                                        <template #icon>
                                            <div class="point-icon">
                                                <img v-if="point.type === 'bridge'" width="20" height="20"
                                                    src="@/assets/img/bridge.png">
                                                <img v-else-if="point.type === 'powerline'" width="20" height="20"
                                                    src="@/assets/img/electric-tower_old_delete.png">
                                                <img v-else-if="point.type === 'intersection'" width="20" height="20"
                                                    src="@/assets/img/intersection.png">
                                                <img v-else-if="point.type === 'road'" width="20" height="20"
                                                    src="@/assets/img/road.png">
                                                <img v-else-if="point.type === 'overhead'" width="20" height="20"
                                                    src="@/assets/img/overhead.png">
                                                <i v-else-if="point.type === 'railroad'" class="fas fa-train"></i>
                                                <i v-else-if="point.type === 'custom'"
                                                    class="far fa-question-circle"></i>
                                                <i v-else class="bi bi-geo-alt"></i>
                                            </div>
                                        </template>
                                    </ListItem>
                                </div>
                            </div>
                        </div>
                    </BaseCard>
                </div>
            </div>
        </BasePanel>

        <!-- Right Sidebar - Points List -->
        <div class="right-sidebar" :class="{ 'collapsed': isSidebarCollapsed, 'expanded': isSidebarExpanded }">
            <!-- Sidebar Toggle Button - Expand (center right when collapsed) -->
            <button v-if="isSidebarCollapsed" class="sidebar-toggle-btn sidebar-collapsed" @click="toggleSidebar"
                title="Expand sidebar">
                <i class="bi bi-chevron-right"></i>
            </button>
            <BaseCard v-show="!isSidebarCollapsed" variant="default" class="sidebar-card">
                <template #header>
                    <div class="sidebar-header">
                        <div class="sidebar-header-top">
                            <h3 class="sidebar-title">Route Information</h3>
                            <div class="sidebar-header-actions">
                                <!-- Expand button -->
                                <button class="sidebar-expand-btn" @click="toggleSidebarExpanded"
                                    :title="isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar to full width'">
                                    <i
                                        :class="isSidebarExpanded ? 'bi bi-arrows-angle-contract' : 'bi bi-arrows-angle-expand'"></i>
                                </button>
                                <!-- Close button -->
                                <button class="sidebar-close-btn" @click="toggleSidebar" title="Close sidebar">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Tab Content -->
                <BaseTabGroup v-model="activeSidebarTab" :tabs="sidebarTabs" class="sidebar-tab-group">
                    <!-- Route Summary Tab -->
                    <div v-if="activeSidebarTab === 'summary'" class="route-summary-content">
                        <div v-if="routeData" class="route-summary">
                            <div v-if="routeData.start || routeData.end" class="summary-section">
                                <h4 class="summary-section-title">Route</h4>
                                <div class="summary-items">
                                    <div v-if="routeData.start" class="summary-item">
                                        <span class="summary-label">Start:</span>
                                        <span class="summary-value text-left">{{ routeData.start }}</span>
                                    </div>
                                    <div v-if="routeData.end" class="summary-item">
                                        <span class="summary-label">End:</span>
                                        <span class="summary-value text-left">{{ routeData.end }}</span>
                                    </div>
                                </div>
                            </div>
                            <div v-if="routeData.distance || nonRoutePointsCount" class="summary-section">
                                <h4 class="summary-section-title">Statistics</h4>
                                <div class="summary-items">
                                    <div v-if="routeData.distance" class="summary-item">
                                        <span class="summary-label">{{ t('totalDistance') }}:</span>
                                        <span class="summary-value">{{ formatDistance(routeData.distance)
                                        }}</span>
                                    </div>
                                    <div class="summary-item">
                                        <span class="summary-label">{{ t('points') }}:</span>
                                        <span class="summary-value">{{ nonRoutePointsCount }}</span>
                                    </div>
                                </div>
                            </div>
                            <div v-if="routeData.note" class="summary-section">
                                <h4 class="summary-section-title">{{ t('notes') }}</h4>
                                <div class="summary-note text-left">
                                    <p>{{ routeData.note }}</p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-route-data">
                            <p class="text-muted">No route data available</p>
                        </div>
                    </div>

                    <!-- Route Points Tab -->
                    <div v-if="activeSidebarTab === 'points'" class="points-list-content">
                        <!-- Start Point -->
                        <div class="route-point start-point" v-if="routeData"
                            :class="{ active: selectedMarker?.index === 0 }" @click="selectMarker(0)">
                            <div class="point-indicator start"></div>
                            <div class="point-info">
                                <div class="point-label">Start Point</div>
                                <div class="point-location text-left">{{ routeData.start || 'Start Location' }}</div>
                            </div>
                        </div>

                        <!-- Points List -->
                        <div class="obstructions-list">
                            <div v-for="(point, index) in filteredRoutePointsWithDistance" :key="`${point.id}-${index}`"
                                class="obstruction-item"
                                :class="{ active: selectedMarker?.index === routePoints.findIndex(p => p.id === point.id) }"
                                @click="selectMarker(routePoints.findIndex(p => p.id === point.id))"
                                @dblclick="openPointInfo(point)">
                                <div class="obstruction-icon">
                                    <img v-if="point.type === 'bridge'" width="20" height="20"
                                        src="@/assets/img/bridge.png">
                                    <img v-else-if="point.type === 'powerline'" width="20" height="20"
                                        src="@/assets/img/electric-tower_old_delete.png">
                                    <img v-else-if="point.type === 'intersection'" width="20" height="20"
                                        src="@/assets/img/intersection.png">
                                    <img v-else-if="point.type === 'road'" width="20" height="20"
                                        src="@/assets/img/road.png">
                                    <img v-else-if="point.type === 'overhead'" width="20" height="20"
                                        src="@/assets/img/overhead.png">
                                    <i v-else-if="point.type === 'railroad'" class="fas fa-train"></i>
                                    <i v-else-if="point.type === 'custom'" class="far fa-question-circle"></i>
                                    <i v-else class="bi bi-geo-alt"></i>
                                </div>
                                <div class="obstruction-info">
                                    <div class="obstruction-name">{{ getPointTypeLabel(point.type) }}</div>
                                    <div class="obstruction-details">
                                        <span class="distance">{{ calculateDistanceFromStart(point) }}</span>
                                        <span class="obstruction-id">Point #{{ index + 1 }}</span>
                                    </div>
                                    <div class="obstruction-height" v-if="point.address || point.notes">
                                        {{ point.address || point.notes }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- End Point -->
                        <div class="route-point end-point" v-if="routeData"
                            :class="{ active: selectedMarker?.index === routePoints.length - 1 }"
                            @click="selectMarker(routePoints.length - 1)">
                            <div class="point-indicator end"></div>
                            <div class="point-info">
                                <div class="point-label">End Point</div>
                                <div class="point-location text-left">{{ routeData.end || 'End Location' }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Screenshots Tab -->
                    <div v-if="activeSidebarTab === 'screenshots'" class="screenshots-content">
                        <div v-if="screenshots.length === 0" class="no-screenshots">
                            <div class="text-center py-4">
                                <i class="bi bi-images text-muted" style="font-size: 2rem;"></i>
                                <p class="text-muted mt-2 small">No screenshots yet</p>
                            </div>
                        </div>
                        <div v-else class="compact-screenshots-grid" id="compact-screenshots-grid">
                            <div v-for="(screenshot, index) in screenshots" :key="screenshot.id"
                                class="compact-screenshot-item"
                                :class="{ 'dragging': draggedScreenshotId === screenshot.id }" :draggable="true"
                                @dragstart="onDragStart($event, screenshot, index)" @dragend="onDragEnd"
                                @dragover.prevent="onDragOver($event, index)" @drop="onDrop($event, index)">
                                <div class="compact-screenshot-card" @click="viewScreenshot(screenshot)">
                                    <div class="compact-screenshot-drag-handle">
                                        <i class="bi bi-grip-vertical"></i>
                                    </div>
                                    <div class="compact-screenshot-image">
                                        <img :src="getScreenshotUrl(screenshot)" :alt="'Screenshot ' + screenshot.id" />
                                    </div>
                                    <div class="compact-screenshot-info">
                                        <div v-if="getScreenshotNote(screenshot)" class="compact-screenshot-note">
                                            {{ getScreenshotNote(screenshot) }}
                                        </div>
                                        <div v-else class="compact-screenshot-date">
                                            {{ formatScreenshotDate(screenshot.dateAdded) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BaseTabGroup>
            </BaseCard>
        </div>

        <!-- Point Modal -->
        <BasePointForm :visible="showPointModal" :point="selectedMarker?.point" :is-edit="false"
            :is-imperial="currentUserData.imperial" @close="showPointModal = false" @save="onPointSave" />

        <!-- Screenshot Viewer Modal -->
        <BaseModal :visible="showScreenshotViewer && !!selectedScreenshot" size="fullscreen"
            @close="closeScreenshotViewer">
            <template #header>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                    <i class="bi bi-image"></i>
                    <span>Screenshot Details</span>
                </div>
            </template>
            <div class="screenshot-viewer-content">
                <div class="screenshot-full-image">
                    <img :src="getScreenshotUrl(selectedScreenshot)" :alt="'Screenshot ' + selectedScreenshot.id" />
                </div>
                <div class="screenshot-details">
                    <div class="detail-item">
                        <strong>Date:</strong> {{ formatScreenshotDate(selectedScreenshot.dateAdded) }}
                    </div>
                    <div v-if="selectedScreenshot.order" class="detail-item">
                        <strong>Order:</strong> {{ selectedScreenshot.order }}
                    </div>
                    <div v-if="getScreenshotNote(selectedScreenshot)" class="detail-item">
                        <strong>Note:</strong> {{ getScreenshotNote(selectedScreenshot) }}
                    </div>
                </div>
            </div>
            <template #footer>
                <BaseButton variant="secondary" size="small" @click="closeScreenshotViewer">Close</BaseButton>
            </template>
        </BaseModal>

        <!-- Route Info Modal -->
        <RouteInfoModal :show="showRouteInfoModal" :route-data="routeData" :current-user-data="currentUserData"
            :non-route-points-count="nonRoutePointsCount" :readonly="true" @close="showRouteInfoModal = false" />

        <!-- Delete Screenshot Confirmation Modal -->
        <BaseConfirmationModal :visible="showDeleteScreenshotModal" title="Delete Screenshot"
            message="Are you sure you want to delete this screenshot?" icon="bi bi-exclamation-triangle"
            icon-color="var(--error)" :show-danger-button="true" :show-primary-button="false" danger-text="Delete"
            danger-icon="bi bi-trash" @close="showDeleteScreenshotModal = false"
            @cancel="showDeleteScreenshotModal = false" @confirm="confirmDeleteScreenshot" />

        <!-- Delete Point Confirmation Modal -->
        <BaseConfirmationModal :visible="showDeletePointModal" title="Delete Point"
            :message="pointToDelete?.point?.type === 'route_point' ? 'Are you sure you want to delete this route point?' : `Are you sure you want to delete this ${getPointTypeLabel(pointToDelete?.point?.type || '')} point?`"
            :details="pointToDelete?.point ? `${getPointTypeLabel(pointToDelete.point.type)} at ${pointToDelete.point.lat?.toFixed(6)}, ${pointToDelete.point.lng?.toFixed(6)}` : ''"
            details-label="Point" icon="bi bi-exclamation-triangle" icon-color="var(--error)" :show-danger-button="true"
            :show-primary-button="false" danger-text="Delete" danger-icon="bi bi-trash"
            @close="showDeletePointModal = false; pointToDelete.value = null"
            @cancel="showDeletePointModal = false; pointToDelete.value = null" @confirm="confirmDeletePoint" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, inject, watch, nextTick, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
// Leaflet is now loaded via CDN in index.html
// import '@/utils/leaflet-icon-fix'; // This will be handled in the script
import RoutesController from '@/controllers/routes/routes_controller';
// AuthController removed
import RouteMapScreenshotsController from '@/controllers/route_map_screenshots/route_map_screenshots_controller';
import FileManagementController from '@/controllers/file_management/file_management_controller';
import BasePointForm from '@/components/points/BasePointForm.vue';
import PointDisplay from '@/components/points/PointDisplay.vue';
import RouteInfoModal from '@/components/routes/RouteInfoModal.vue';
import RouteMapViewer from '@/components/map/RouteMapViewer.vue';
import { BaseCard, BaseButton, BasePanel, ListItem, BaseModal, BaseConfirmationModal, BaseTabGroup } from '@/components/ui';
import { useI18n } from 'vue-i18n';
import { useSubscription } from "@/composables/subscription/useSubscription";
import { useUnits } from '@/composables/useUnits';
import { useRouter } from 'vue-router';
import routeUtils from '@/utils/route_utils';
import { useAuthStore } from '@/stores/auth';

const { checkFeatureAccess, getData: getSubscriptionData } = useSubscription();
const { t } = useI18n();
const { formatDistance } = useUnits();

const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

const authStore = useAuthStore();

// Router and route data
const route = useRoute();
const currentUserData = computed(() => authStore.user);
const router = useRouter();
// Map and view state
const viewMode = ref('map');
const mapRef = ref(null);
const pointDisplayRef = ref(null);
const zoom = ref(15);
const minZoom = ref(10);
const maxZoom = ref(20);
const mapCenter = ref([0, 0]);
const mapStyle = ref('osm');
const editMode = ref(false); // Always false for view-only mode

const showRouteInfoModal = ref(false);

const isImperial = ref(false);

// Map initialization state
const isMapReady = ref(false);
const isMapInitialized = ref(false);
const isComponentMounted = ref(true);
const isUnmounting = ref(false);
const componentHealth = ref('healthy'); // 'healthy', 'degraded', 'critical'

// Reactive trigger for viewport updates

const MAX_ERRORS = 5; // Maximum errors before complete shutdown

// Global error handler for layer management errors
const handleLayerError = (error) => {
    if (error.message && (error.message.includes('_leaflet_id') || error.message.includes('MutationObserver') || error.message.includes('not of type \'Node\''))) {
        // Handle these errors but don't disable functionality
        try {
            // Refresh marker state but keep functionality
            componentHealth.value = 'degraded';
            nextTick(() => {
                try {
                    viewportUpdateTrigger.value++;
                } catch (refreshError) {
                    // Handle refresh errors but don't disable
                }
            });
        } catch (silentError) {
            // Handle errors but don't disable functionality
        }

        return true; // Error handled
    }
    return false; // Error not handled
};



// Set up global error handler
onMounted(() => {
    const originalErrorHandler = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
        if (handleLayerError({ message })) {
            return true; // Prevent default error handling
        }
        if (originalErrorHandler) {
            return originalErrorHandler(message, source, lineno, colno, error);
        }
        return false;
    };

    // Also handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        if (handleLayerError(event.reason)) {
            event.preventDefault();
        }
    });
});

// Vue error handling override
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Override console methods to suppress Vue unmounted errors
console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' &&
        message.includes('Unhandled error during execution of unmounted hook') &&
        message.includes('LMarker')) {
        // Suppress only LMarker unmounted hook errors
        return;
    }
    originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
    const message = args[0];
    if (typeof message === 'string' &&
        message.includes('[Vue warn]: Unhandled error during execution of unmounted hook') &&
        message.includes('LMarker')) {
        // Suppress only LMarker unmounted hook warnings
        return;
    }
    originalConsoleWarn.apply(console, args);
};

// Global error handler for Vue errors
const originalError = window.onerror;
const originalUnhandledRejection = window.onunhandledrejection;

// Override global error handlers to catch Vue errors
window.onerror = (message, source, lineno, colno, error) => {
    // Suppress only LMarker unmounted hook errors
    if (typeof message === 'string' &&
        message.includes('Unhandled error during execution of unmounted hook') &&
        message.includes('LMarker')) {
        return true; // Prevent default error handling
    }
    // Let other errors through
    if (originalError) {
        return originalError(message, source, lineno, colno, error);
    }
    return false;
};

window.onunhandledrejection = (event) => {
    // Suppress only LMarker unmounted hook errors in promises
    if (event.reason && typeof event.reason === 'string' &&
        event.reason.includes('Unhandled error during execution of unmounted hook') &&
        event.reason.includes('LMarker')) {
        event.preventDefault();
        return;
    }
    // Let other rejections through
    if (originalUnhandledRejection) {
        return originalUnhandledRejection(event);
    }
};

// Cleanup on unmount to prevent errors
onUnmounted(() => {
    try {
        // Mark component as unmounting immediately to prevent new marker creation
        isUnmounting.value = true;
        isComponentMounted.value = false;

        // Disable marker updates to prevent errors during cleanup
        markerUpdatesDisabled.value = true;

        // Clear any pending timeouts
        if (errorRecoveryTimeout) {
            clearTimeout(errorRecoveryTimeout);
            errorRecoveryTimeout = null;
        }

        // Map cleanup now handled by RouteMapViewer component

        // Restore original error handlers
        if (originalError) {
            window.onerror = originalError;
        }
        if (originalUnhandledRejection) {
            window.onunhandledrejection = originalUnhandledRejection;
        }

        // Remove resize listeners
        window.removeEventListener('resize', handleWindowResize);
        window.removeEventListener('orientationchange', handleMobileResize);
        window.removeEventListener('layout-sidebar-toggle', handleLayoutSidebarToggle);

        console.log('Component unmounting, disabled marker updates and cleared map');
    } catch (error) {
        console.warn('Error during component cleanup:', error);
    }
});

// Route styling properties - handled by RouteMapViewer component

// Segment state for highlighting and manipulation


// Point modal state
const showPointModal = ref(false);

// Screenshots state
const screenshots = ref([]);
const selectedScreenshot = ref(null);
const showScreenshotViewer = ref(false);
const showDeleteScreenshotModal = ref(false);
const screenshotToDelete = ref(null);

// Drag and drop state
const draggedScreenshotId = ref(null);
const draggedScreenshotIndex = ref(null);
const dragOverIndex = ref(null);

// Loading state for snapping


// Delete point confirmation state
const showDeletePointModal = ref(false);
const pointToDelete = ref(null);

// Sidebar collapse state
const isSidebarCollapsed = ref(true);
const isSidebarExpanded = ref(false); // Full width expanded state
const activeSidebarTab = ref('summary'); // Active tab: 'summary', 'points', or 'screenshots'

// Tab configuration - matching AddPlannedRoute style
const sidebarTabs = computed(() => [
    { id: 'summary', label: 'Summary', icon: 'bi bi-info-circle' },
    { id: 'points', label: `Points (${nonRoutePointsCount.value})`, icon: 'bi bi-geo-alt' },
    { id: 'screenshots', label: `Screenshots (${screenshots.value.length})`, icon: 'bi bi-images' }
]);

// Route data
const routeData = ref(null);
const routePoints = ref([]);


// Computed properties
const routePath = computed(() => {
    const validPoints = routePoints.value
        .filter(point =>
            point.lat && point.lng &&
            !isNaN(point.lat) && !isNaN(point.lng) &&
            point.lat >= -90 && point.lat <= 90 &&
            point.lng >= -180 && point.lng <= 180
        );

    console.log('Route path computation:', {
        totalPoints: routePoints.value.length,
        validPoints: validPoints.length,
        firstValid: validPoints[0],
        lastValid: validPoints[validPoints.length - 1]
    });

    // Only return path if we have at least 2 valid points
    if (validPoints.length < 2) {
        console.log('Not enough valid points for polyline');
        return [];
    }

    const path = validPoints.map(point => [point.lat, point.lng]);
    console.log('Generated route path:', path.slice(0, 3), '...', path.slice(-3));
    return path;
});

// Check if route path is valid for rendering
const isRoutePathValid = computed(() => {
    const isValid = routePath.value.length >= 2;
    console.log('Route path validation:', {
        pathLength: routePath.value.length,
        isValid: isValid,
        firstPoint: routePath.value[0],
        lastPoint: routePath.value[routePath.value.length - 1]
    });
    return isValid;
});

const nonRoutePointsCount = computed(() => {
    return routePoints.value.filter(point => point.type !== 'route_point').length;
});

const filteredRoutePoints = computed(() => {
    return routePoints.value.filter(point => point.type !== 'route_point');
});

// Computed property for filtered route points with distance calculations (display only)
const filteredRoutePointsWithDistance = computed(() => {
    if (routePoints.value.length === 0) return [];

    // Calculate distances for all route points using route_utils
    const pointsWithDistance = routeUtils.calculateRoutePointsDistances([...routePoints.value]);

    // Filter out route_points and return only display points with distance
    return pointsWithDistance.filter(point => point.type !== 'route_point');
});

// Performance optimization: Viewport-based marker rendering
const visibleSurveyPoints = computed(() => {
    // Skip if component is unmounted or unmounting
    if (!isComponentMounted.value || isUnmounting.value) {
        return [];
    }

    // If component health is critical, show very limited markers
    if (componentHealth.value === 'critical') {
        return filteredRoutePoints.value.slice(0, 10); // Very conservative fallback
    }

    // Use viewportUpdateTrigger to force reactivity (only if updates are enabled)
    if (!markerUpdatesDisabled.value) {
        void viewportUpdateTrigger.value;
    }

    if (!isMapReady.value || !isMapInitialized.value) {
        return filteredRoutePoints.value.slice(0, 25); // Safe fallback during initialization
    }

    if (!map) {
        return filteredRoutePoints.value.slice(0, 50);
    }

    // If marker updates are disabled, show limited markers (fallback mode)
    if (markerUpdatesDisabled.value) {
        return filteredRoutePoints.value.slice(0, 50); // Show fewer markers to prevent errors
    }

    try {
        const bounds = map.getBounds();
        const currentZoom = zoom.value;

        // Safety check for bounds
        if (!bounds || !bounds.isValid()) {
            return filteredRoutePoints.value.slice(0, 50);
        }

        // Much more conservative marker limits to prevent errors with many markers
        let maxMarkers;
        if (currentZoom < 8) maxMarkers = 20;   // Very low zoom - minimal markers
        else if (currentZoom < 10) maxMarkers = 40;
        else if (currentZoom < 12) maxMarkers = 60;
        else if (currentZoom < 14) maxMarkers = 80;
        else maxMarkers = 100; // Increased to match absolute max

        // Apply health-based reductions
        if (componentHealth.value === 'degraded') {
            maxMarkers = Math.floor(maxMarkers * 0.5); // 50% reduction for degraded health
        } else if (componentHealth.value === 'critical') {
            maxMarkers = Math.min(maxMarkers, 10); // Very conservative for critical health
        }

        // If there are many markers in viewport, reduce limits even further
        const totalMarkers = filteredRoutePoints.value.length;
        if (totalMarkers > 1000) {
            maxMarkers = Math.min(maxMarkers, 50); // Ultra conservative for large datasets
        } else if (totalMarkers > 500) {
            maxMarkers = Math.min(maxMarkers, 70); // Conservative for medium datasets
        }

        // Ultra-aggressive limiting for marker-dense areas (low zoom levels)
        if (currentZoom < 10) {
            maxMarkers = Math.min(maxMarkers, 30); // Never more than 30 at low zoom
        } else if (currentZoom < 12) {
            maxMarkers = Math.min(maxMarkers, 50); // Never more than 50 at medium zoom
        }

        // Filter out invalid coordinates and get viewport-based subset
        const validPoints = filteredRoutePoints.value.filter(point => {
            if (!point.lat || !point.lng || isNaN(point.lat) || isNaN(point.lng)) {
                return false;
            }
            if (point.lat < -90 || point.lat > 90 || point.lng < -180 || point.lng > 180) {
                return false;
            }
            try {
                return bounds.contains([point.lat, point.lng]);
            } catch (error) {
                return false;
            }
        });

        // Ultra-aggressive safety: detect marker density and apply extreme limits
        let finalPoints = validPoints;

        // If we have many markers in viewport, use extreme sampling
        if (validPoints.length > maxMarkers) {
            // Calculate viewport area to determine density
            const bounds = map.getBounds();
            const viewportArea = bounds.getNorthEast().distanceTo(bounds.getSouthWest());
            const markerDensity = validPoints.length / (viewportArea / 1000); // markers per km²

            // Ultra-conservative limits for dense areas
            let actualMaxMarkers = maxMarkers;
            if (markerDensity > 100) { // Very dense area
                actualMaxMarkers = Math.min(actualMaxMarkers, 5);
            } else if (markerDensity > 50) { // Dense area
                actualMaxMarkers = Math.min(actualMaxMarkers, 8);
            } else if (markerDensity > 20) { // Medium density
                actualMaxMarkers = Math.min(actualMaxMarkers, 12);
            }

            // Use step-based sampling with ultra-conservative limits
            const step = Math.max(1, Math.floor(validPoints.length / actualMaxMarkers));
            finalPoints = validPoints.filter((_, index) => index % step === 0);

            // Ensure we have at least some points but never more than our limit
            if (finalPoints.length === 0 && validPoints.length > 0) {
                finalPoints = validPoints.slice(0, Math.min(3, validPoints.length));
            } else if (finalPoints.length > actualMaxMarkers) {
                finalPoints = finalPoints.slice(0, actualMaxMarkers);
            }
        }

        // Final safety net: never exceed absolute maximum
        const ABSOLUTE_MAX_MARKERS = 100; // Hard limit that can never be exceeded
        if (finalPoints.length > ABSOLUTE_MAX_MARKERS) {
            finalPoints = finalPoints.slice(0, ABSOLUTE_MAX_MARKERS);
        }

        console.log(`Showing ${finalPoints.length} markers (from ${validPoints.length} in viewport, max: ${maxMarkers}, absolute max: ${ABSOLUTE_MAX_MARKERS})`);
        return finalPoints;
    } catch (error) {
        console.warn('Error in visibleSurveyPoints computation:', error);
        return filteredRoutePoints.value.slice(0, 50);
    }


});


const visibleRoutePoints = computed(() => {
    // Skip if component is unmounted or unmounting
    if (!isComponentMounted.value || isUnmounting.value) {
        return [];
    }

    // If component health is critical, show very limited route points
    if (componentHealth.value === 'critical') {
        console.log('Component health is critical, showing minimal route points');
        return routePoints.value
            .filter(point => point.type === 'route_point')
            .slice(0, 5); // Very conservative fallback
    }

    // Use viewportUpdateTrigger to force reactivity (only if updates are enabled)
    if (!markerUpdatesDisabled.value) {
        void viewportUpdateTrigger.value;
    }

    // Temporarily disable viewport-based rendering for route points
    // Only show route points at high zoom levels
    const currentZoom = zoom.value;
    if (currentZoom < 15) return [];

    // Filter out invalid coordinates to prevent rendering errors
    return routePoints.value
        .filter(point => point.type === 'route_point')
        .filter(point =>
            point.lat && point.lng &&
            !isNaN(point.lat) && !isNaN(point.lng) &&
            point.lat >= -90 && point.lat <= 90 &&
            point.lng >= -180 && point.lng <= 180
        )
        .slice(0, 100); // Limit route points
});

// Performance optimization: Dynamic marker sizing based on zoom level
const getMarkerSize = (currentZoom) => {
    if (currentZoom < 10) return [20, 20];
    if (currentZoom < 12) return [25, 25];
    if (currentZoom < 14) return [28, 28];
    return [30, 30];
};

const getIconSize = (currentZoom) => {
    if (currentZoom < 10) return 12;
    if (currentZoom < 12) return 14;
    if (currentZoom < 14) return 16;
    return 18;
};

const getMarkerClass = (currentZoom) => {
    if (currentZoom < 10) return 'marker-small';
    if (currentZoom < 12) return 'marker-medium';
    return 'marker-large';
};

const routeSegments = computed(() => {
    if (routePoints.value.length < 2) return [];

    const segments = [];
    // Include start and end points, and filter out route points for the middle
    const nonRoutePoints = routePoints.value.filter(p =>
        p.type !== 'route_point' ||
        p.id === routePoints.value[0].id ||
        p.id === routePoints.value[routePoints.value.length - 1].id
    );

    console.log("=== SEGMENT CALCULATION ===");
    console.log("Total route points:", routePoints.value.length);
    console.log("Non-route points:", nonRoutePoints.length);
    console.log("Non-route point IDs:", nonRoutePoints.map(p => p.id));
    console.log("All route point IDs:", routePoints.value.map(p => ({ id: p.id, type: p.type, lat: p.lat, lng: p.lng })));

    for (let i = 0; i < nonRoutePoints.length - 1; i++) {
        const currentPoint = nonRoutePoints[i];
        const nextPoint = nonRoutePoints[i + 1];

        // Find the indices of these points in the full routePoints array
        const currentIndex = routePoints.value.findIndex(p => p.id === currentPoint.id);
        const nextIndex = routePoints.value.findIndex(p => p.id === nextPoint.id);

        console.log(`Segment ${i}: ${currentPoint.id} (${currentIndex}) -> ${nextPoint.id} (${nextIndex})`);

        if (currentIndex === -1 || nextIndex === -1) {
            console.warn(`Could not find point indices for segment ${i}`);
            continue;
        }

        // Get all points between current and next (including route points)
        const segmentCoordinates = [];
        for (let j = currentIndex; j <= nextIndex; j++) {
            const point = routePoints.value[j];
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

    console.log("Created segments:", segments.length);
    console.log("=== END SEGMENT CALCULATION ===");

    return segments;
});

// Computed properties for undo/redo button states
const canUndo = computed(() => undoStack.value.length > 0);
const canRedo = computed(() => redoStack.value.length > 0);

// Map options and tile layer - optimized for performance with many markers
const mapOptions = computed(() => ({
    zoomControl: false,
    attributionControl: true,
    // Use canvas renderer for better performance with many markers
    preferCanvas: true,
    // Enable canvas rendering for markers
    renderer: window.L.canvas(),
    // Performance optimizations
    maxZoom: 20,
    minZoom: 1,
    // Disable clustering to maintain individual marker interaction
    markerCluster: false,
    cluster: false,
    // Ensure individual marker interaction
    interactive: true,
    // Performance settings
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    // Reduce marker rendering overhead
    markerZoomAnimation: false,
    // Optimize for large datasets
    worldCopyJump: false,
    // Reduce memory usage
    fadeAnimation: false,
    zoomAnimation: true
}));

const tileLayerUrl = computed(() => {
    const tileLayers = {
        'osm': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'satellite': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        'terrain': 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
    };
    return tileLayers[mapStyle.value] || tileLayers['osm'];
});

const mapStyleLabel = computed(() => {
    const labels = {
        'osm': 'OpenStreetMap',
        'satellite': 'Satellite',
        'terrain': 'Terrain'
    };
    return labels[mapStyle.value] || labels['osm'];
});

const truncatedNotes = computed(() => {
    if (!routeData.value?.note) return '-';
    return routeData.value.note.length > 50
        ? routeData.value.note.substring(0, 50) + '...'
        : routeData.value.note;
});

// Methods
const fetchRouteData = async () => {
    try {
        const res = await RoutesController.getRoute(route.params.id);
        if (res.result) {
            routeData.value = res.data;

            // Save last viewed route ID to localStorage
            try {
                localStorage.setItem('lastViewedRouteId', String(route.params.id));
            } catch (error) {
                console.error('Error saving last viewed route:', error);
            }

            // Ensure all route points have unique IDs
            const generateUniqueId = () => {
                const timestamp = Date.now();
                const random = Math.random().toString(36).substr(2, 9);
                return `route_point_${timestamp}_${random}`;
            };

            routePoints.value = (res.data.pointsData || []).map(point => ({
                ...point,
                id: point.id || generateUniqueId() // Assign ID if missing
            }));

            // console.log("Loaded route points with IDs:", routePoints.value.map(p => ({ id: p.id, type: p.type })));
            // console.log("Loaded route points data:", routePoints.value.map(p => ({ id: p.id, data: p.data })));

            console.log("Non-route points:", routePoints.value.filter(p => p.type !== 'route_point').length);

            if (routePoints.value.length > 0) {
                mapCenter.value = [routePoints.value[0].lat, routePoints.value[0].lng];
            }
        }
    } catch (error) {
        console.error('Error fetching route data:', error);
        showMessage('Error loading route data', 'error');
    }
};

const fetchCurrentUserData = async () => {
    try {
        if (!authStore.user) {
             await authStore.fetchUserProfile();
        }
        if (authStore.user) {
            isImperial.value = authStore.user.imperial;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

// Note: selectPoint method removed - original RouteViewer uses right-click context menu for selection



const getPointTypeLabel = (type) => {
    const labelMap = {
        'bridge': 'Bridge',
        'powerline': 'Power Line',
        'overhead': 'Overhead',
        'intersection': 'Intersection',
        'road': 'Road',
        'railroad': 'Railroad',
        'custom': 'Custom',
        'other': 'Other'
    };
    return labelMap[type] || 'Unknown';
};

const getPointDescription = (point) => {
    try {
        if (point.data && point.data !== '') {
            const data = JSON.parse(point.data);
            return data.roadAddress || data.pointNotes || data.descriptionOfObstruction || null;
        }
    } catch (error) {
        console.error('Error parsing point data:', error);
    }
    return point.address || point.notes || null;
};



const calculateDistanceFromStart = (point) => {
    if (routePoints.value.length === 0) return formatDistance(0);

    // Try to get distance from the computed property with distances (display only)
    const pointWithDistance = filteredRoutePointsWithDistance.value.find(p => p.id === point.id);

    if (pointWithDistance && pointWithDistance.distance !== undefined) {
        // Use the cumulative distance calculated along the route
        const distanceInMeters = pointWithDistance.distance;
        return formatDistance(distanceInMeters);
    }

    // Fallback to straight-line distance if not found in computed property
    const startPoint = routePoints.value[0];
    const distanceInKm = calculateDistance(startPoint.lat, startPoint.lng, point.lat, point.lng);
    // Convert km to meters for formatDistance
    const distanceInMeters = distanceInKm * 1000;
    return formatDistance(distanceInMeters);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Helper function to safely get point address


// Helper function to ensure all route points have unique IDs
const ensureRoutePointIds = () => {
    const generateUniqueId = () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `route_point_${timestamp}_${random}`;
    };

    routePoints.value = routePoints.value.map(point => ({
        ...point,
        id: point.id || generateUniqueId()
    }));
};

// Helper function to validate route point integrity


// Select marker by index
const selectMarker = (index) => {
    if (index >= 0 && index < routePoints.value.length) {
        const point = routePoints.value[index];
        selectedMarker.value = { point, index };
        console.log('Selected marker:', selectedMarker.value);

        // Open sidebar to show point details
        // if (isSidebarCollapsed.value) {
        //     isSidebarCollapsed.value = false;
        // }

        // Center map on selected point
        // if (map) {
        //     map.setView([point.lat, point.lng], Math.max(zoom.value, 16));
        // }
    }
};

// Map functionality now handled by RouteMapViewer component

// Map control functions now handled by RouteMapViewer component



// Segment methods


// Event handlers for RouteMapViewer component
const onMarkerClick = (point, index) => {
    selectMarker(index);
    // Open the point info modal
    openPointInfo(point);
};

const onMarkerDrag = ({ point, index, newPos }) => {
    // Handle marker drag in edit mode
    console.log('Marker dragged:', point, index, newPos);
};

const editPoint = (point) => {
    // Handle point edit
    console.log('Edit point:', point);
};

const onMapReady = () => {
    console.log('Map ready event received from RouteMapViewer');
    isMapReady.value = true;
    isMapInitialized.value = true;

    // Ensure map is properly sized on initial load
    nextTick(() => {
        if (mapRef.value && mapRef.value.leafletObject) {
            setTimeout(() => {
                mapRef.value.leafletObject.invalidateSize();
            }, 100);
        }
    });
};

const onSegmentRightClick = (event, segment) => {
    if (!editMode.value) return;

    // Select the segment when right-clicking
    selectedSegment.value = segment;

    showContextMenu(event, 'segment', segment.index);
};

// Marker methods


// Point methods
const openPointInfo = (point) => {
    if (point.type === 'route_point') {
        return;
    }
    // Find the index of the point in routePoints
    const index = routePoints.value.findIndex(p => p.id === point.id);
    if (index !== -1) {
        // Get the fresh point data from routePoints array to avoid corrupted data
        const freshPoint = routePoints.value[index];
        selectedMarker.value = { point: freshPoint, index };
        showPointModal.value = true;
    }
};

const onPointSave = (updatedPoint) => {
    if (selectedMarker.value) {
        const index = selectedMarker.value.index;
        if (index >= 0 && index < routePoints.value.length) {
            // Save state BEFORE modifying route points
            forceSaveState();

            // Merge the updated point data with the existing point data
            // The updatedPoint contains the form data that should be stored in the data field
            const updatedData = JSON.stringify(updatedPoint);
            console.log("Saving point data:", { index, updatedPoint, updatedData });

            routePoints.value[index] = {
                ...routePoints.value[index],
                data: updatedData
            };

            console.log("Updated route point:", routePoints.value[index]);

            // Update the selected marker point reference to reflect the changes
            selectedMarker.value.point = routePoints.value[index];

            // Force reactivity update for the sidebar
            selectedMarker.value = { ...selectedMarker.value };
        }
    }

    // Only close modal if it's actually open (for modal context)
    if (showPointModal.value) {
        showPointModal.value = false;
    }
};



// Context menu methods
const snapSelectedSegment = async () => {
    if (contextMenu.value.targetType === 'segment') {
        const segmentIndex = contextMenu.value.targetIndex;
        const segment = routeSegments.value.find(s => s.index === segmentIndex);

        if (segment) {
            snappingSegment.value = true;
            try {
                await snapSegmentToRoute(segment);
            } finally {
                snappingSegment.value = false;
            }
        }
    }
    hideContextMenu();
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
        console.log("Route points before snapping:", routePoints.value.length);

        // Save state BEFORE modifying route points
        forceSaveState();

        // Get the start and end points from the segment
        const startPoint = segment.startPoint;
        const endPoint = segment.endPoint;

        // Calculate OSRM route between these points
        const result = await calculateSegmentRoute(startPoint, endPoint);

        if (result && result.routePath) {
            // Find the indices of start and end points in the original routePoints array
            const startIndex = routePoints.value.findIndex(p => p.id === startPoint.id);
            const endIndex = routePoints.value.findIndex(p => p.id === endPoint.id);

            console.log("Start index:", startIndex, "End index:", endIndex);

            if (startIndex !== -1 && endIndex !== -1) {
                // Remove all route points between start and end (exclusive)
                const pointsToRemove = [];
                for (let i = startIndex + 1; i < endIndex; i++) {
                    if (routePoints.value[i].type === 'route_point') {
                        pointsToRemove.push(i);
                    }
                }

                console.log("Points to remove:", pointsToRemove.length);

                // Remove route points in reverse order to maintain indices
                for (let i = pointsToRemove.length - 1; i >= 0; i--) {
                    routePoints.value.splice(pointsToRemove[i], 1);
                }

                // Generate unique IDs for new route points
                const generateUniqueId = () => {
                    const timestamp = Date.now();
                    const random = Math.random().toString(36).substr(2, 9);
                    return `snapped_route_${timestamp}_${random}`;
                };

                // Insert the snapped route coordinates as new route points with unique IDs
                const newRoutePoints = result.routePath.slice(1, -1).map((coord, index) => {
                    const newPoint = {
                        id: generateUniqueId(), // Generate unique ID for each new route point
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

                // Insert the new route points after the start point
                const insertIndex = startIndex + 1;
                routePoints.value.splice(insertIndex, 0, ...newRoutePoints);

                // console.log(`Replaced ${pointsToRemove.length} old route points with ${newRoutePoints.length} new snapped route points`);
                // console.log("Route points after snapping:", routePoints.value.length);
                // console.log("New route point IDs:", newRoutePoints.map(p => p.id));

                // Ensure all route points have proper IDs
                ensureRoutePointIds();
            }

            console.log("Segment snapped successfully:", segment.id);
        } else {
            console.warn("No route result received for segment:", segment.id);
        }
    } catch (error) {
        console.error("Error snapping segment to route:", error);
    }
};

const insertRoutePoint = () => {
    if (contextMenu.value.targetType === 'segment' && contextMenu.value.clickLatLng) {
        const segmentIndex = contextMenu.value.targetIndex;
        const segment = routeSegments.value.find(s => s.index === segmentIndex);
        const clickLatLng = contextMenu.value.clickLatLng;

        if (segment && clickLatLng) {
            // Save state BEFORE inserting the route point
            forceSaveState();

            // Find the insertion point in the routePoints array
            const startIndex = routePoints.value.findIndex(p => p.id === segment.startPoint.id);
            const endIndex = routePoints.value.findIndex(p => p.id === segment.endPoint.id);

            if (startIndex !== -1 && endIndex !== -1) {
                // Generate unique ID for new route point
                const generateUniqueId = () => {
                    const timestamp = Date.now();
                    const random = Math.random().toString(36).substr(2, 9);
                    return `inserted_route_${timestamp}_${random}`;
                };

                // Create new route point
                const newRoutePoint = {
                    id: generateUniqueId(),
                    lat: clickLatLng.lat,
                    lng: clickLatLng.lng,
                    type: 'route_point',
                    data: JSON.stringify({}),
                    distance: 0,
                    alt: 0,
                    head: 0,
                    dateUpdated: new Date().toISOString()
                };

                // Insert the new route point between start and end
                const insertIndex = startIndex + 1;
                routePoints.value.splice(insertIndex, 0, newRoutePoint);

                console.log(`Inserted new route point at index ${insertIndex}:`, newRoutePoint.id);
                console.log("Route points after insertion:", routePoints.value.length);

                // Ensure all route points have proper IDs
                ensureRoutePointIds();
            }
        }
    }
    hideContextMenu();
};

const deleteSelectedMarker = () => {
    if (contextMenu.value.targetType === 'marker') {
        const markerIndex = contextMenu.value.targetIndex;

        if (markerIndex >= 0 && markerIndex < routePoints.value.length) {
            // Don't allow deletion of start and end points
            if (markerIndex === 0 || markerIndex === routePoints.value.length - 1) {
                console.log('Cannot delete start or end point');
                hideContextMenu();
                return;
            }

            // Show confirmation modal
            const point = routePoints.value[markerIndex];
            pointToDelete.value = { index: markerIndex, point };
            showDeletePointModal.value = true;
        }
    }
    hideContextMenu();
};

const confirmDeletePoint = () => {
    if (!pointToDelete.value) return;

    const { index } = pointToDelete.value;

    // Save state BEFORE deleting the marker
    forceSaveState();

    // Remove the marker from routePoints
    routePoints.value.splice(index, 1);

    // Clear selected marker
    selectedMarker.value = null;

    // Remove highlighting from all markers
    const allMarkers = document.querySelectorAll('.marker-highlighted');
    allMarkers.forEach(marker => {
        marker.classList.remove('marker-highlighted');
    });

    console.log(`Deleted marker at index ${index}`);

    // Close modal and reset
    showDeletePointModal.value = false;
    pointToDelete.value = null;
};

// Undo/Redo methods
const performUndo = () => {
    if (!canUndo.value) return;

    isUndoRedoOperation.value = true;
    const stateToRestore = undoStack.value.pop();
    redoStack.value.push(getCurrentState());

    routePoints.value = stateToRestore.routePoints;
    routeData.value = stateToRestore.routeData;

    isUndoRedoOperation.value = false;
};

const performRedo = () => {
    if (!canRedo.value) return;

    isUndoRedoOperation.value = true;
    const stateToRestore = redoStack.value.pop();
    undoStack.value.push(getCurrentState());

    routePoints.value = stateToRestore.routePoints;
    routeData.value = stateToRestore.routeData;

    isUndoRedoOperation.value = false;
};

const getCurrentState = () => {
    return {
        routePoints: JSON.parse(JSON.stringify(routePoints.value)),
        routeData: routeData.value ? JSON.parse(JSON.stringify(routeData.value)) : null
    };
};

// Function to check if two states are different
const isStateDifferent = (state1, state2) => {
    if (!state1 || !state2) return true;

    // Compare route points
    if (state1.routePoints?.length !== state2.routePoints?.length) return true;

    for (let i = 0; i < state1.routePoints?.length; i++) {
        const point1 = state1.routePoints[i];
        const point2 = state2.routePoints[i];

        if (
            point1?.lat !== point2?.lat ||
            point1?.lng !== point2?.lng ||
            point1?.type !== point2?.type ||
            point1?.data !== point2?.data
        ) return true;
    }

    return false;
};

const saveState = () => {
    if (isUndoRedoOperation.value) return;

    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
        const currentState = getCurrentState();
        const lastState = undoStack.value.length > 0 ? undoStack.value[undoStack.value.length - 1] : null;

        if (isStateDifferent(currentState, lastState)) {
            redoStack.value = [];
            undoStack.value.push(JSON.parse(JSON.stringify(currentState)));

            if (undoStack.value.length > MAX_STATES) {
                undoStack.value.shift();
            }
        }
    }, DEBOUNCE_DELAY);
};

// Function to force save state immediately (for important actions)
const forceSaveState = () => {
    if (isUndoRedoOperation.value) return;

    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
    }

    const currentState = getCurrentState();
    const lastState = undoStack.value.length > 0 ? undoStack.value[undoStack.value.length - 1] : null;

    if (isStateDifferent(currentState, lastState)) {
        redoStack.value = [];
        undoStack.value.push(JSON.parse(JSON.stringify(currentState)));

        if (undoStack.value.length > MAX_STATES) {
            undoStack.value.shift();
        }
    }
};

// Action methods
const toggleEditMode = () => {
    editMode.value = !editMode.value;
    console.log('Edit mode toggled:', editMode.value);
};

const cancelEdit = () => {
    // Navigate back or close edit mode
    if (editMode.value) {
        editMode.value = false;
    }
    // You can add navigation logic here if needed
    console.log('Cancel edit');
};

const generateReport = () => {
    // Implement generate report functionality
    console.log('Generate report');
};



// Screenshot functions


const viewScreenshot = (screenshot) => {
    selectedScreenshot.value = screenshot;
    showScreenshotViewer.value = true;
};

// Load screenshots for the current route
const loadScreenshots = async () => {
    try {
        const result = await RouteMapScreenshotsController.getMapScreenshotsByRouteId(route.params.id);
        if (result.result) {
            // Sort screenshots by Order (ascending), then by dateAdded if order is the same
            screenshots.value = result.data.sort((a, b) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                // If order is the same, sort by date
                return new Date(a.dateAdded) - new Date(b.dateAdded);
            });
        }
    } catch (error) {
        console.error('Error loading screenshots:', error);
    }
};

const closeScreenshotViewer = () => {
    showScreenshotViewer.value = false;
    selectedScreenshot.value = null;
};

const deleteScreenshot = (screenshotId) => {
    screenshotToDelete.value = screenshotId;
    showDeleteScreenshotModal.value = true;
};

const confirmDeleteScreenshot = async () => {
    if (!screenshotToDelete.value) return;

    try {
        const result = await RouteMapScreenshotsController.deleteMapScreenshot(screenshotToDelete.value);
        if (result.result) {
            showMessage({ status: "success", message: "Screenshot deleted successfully!" });

            // Close the viewer modal if it's open
            if (showScreenshotViewer.value) {
                showScreenshotViewer.value = false;
                selectedScreenshot.value = null;
            }

            // Reload screenshots to get updated list
            await loadScreenshots();
        } else {
            showMessage({ status: "error", message: "Failed to delete screenshot" });
        }
    } catch (error) {
        console.error('Error deleting screenshot:', error);
        showMessage({ status: "error", message: "Error deleting screenshot" });
    } finally {
        showDeleteScreenshotModal.value = false;
        screenshotToDelete.value = null;
    }
};

// Drag and drop functions for reordering screenshots
const onDragStart = (event, screenshot, index) => {
    draggedScreenshotId.value = screenshot.id;
    draggedScreenshotIndex.value = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target);
    event.target.style.opacity = '0.5';
};

const onDragEnd = (event) => {
    event.target.style.opacity = '';
    draggedScreenshotId.value = null;
    draggedScreenshotIndex.value = null;
    dragOverIndex.value = null;
};

const onDragOver = (event, index) => {
    event.preventDefault();
    dragOverIndex.value = index;
    event.dataTransfer.dropEffect = 'move';
};

const onDrop = async (event, dropIndex) => {
    event.preventDefault();

    if (draggedScreenshotIndex.value === null || draggedScreenshotIndex.value === dropIndex) {
        return;
    }

    // Create a new array with reordered screenshots
    const newScreenshots = [...screenshots.value];
    const draggedScreenshot = newScreenshots[draggedScreenshotIndex.value];

    // Remove the dragged item from its original position
    newScreenshots.splice(draggedScreenshotIndex.value, 1);

    // Insert it at the new position
    newScreenshots.splice(dropIndex, 0, draggedScreenshot);

    // Update order values based on new positions
    const screenshotOrders = newScreenshots.map((screenshot, index) => ({
        Id: screenshot.id,
        Order: index + 1
    }));

    // Update the local state immediately for better UX
    screenshots.value = newScreenshots.map((screenshot, index) => ({
        ...screenshot,
        order: index + 1
    }));

    // Send update to server
    try {
        const result = await RouteMapScreenshotsController.updateMapScreenshotOrder({
            ScreenshotOrders: screenshotOrders
        });

        if (result.result) {
            showMessage({ status: "success", message: "Screenshot order updated successfully!" });
        } else {
            showMessage({ status: "error", message: "Failed to update screenshot order" });
            // Reload screenshots to revert to server state
            await loadScreenshots();
        }
    } catch (error) {
        console.error('Error updating screenshot order:', error);
        showMessage({ status: "error", message: "Error updating screenshot order" });
        // Reload screenshots to revert to server state
        await loadScreenshots();
    }

    // Reset drag state
    draggedScreenshotId.value = null;
    draggedScreenshotIndex.value = null;
    dragOverIndex.value = null;
};

// Sidebar toggle functions (removed - using BaseCard now)

const getScreenshotUrl = (screenshot) => {
    try {
        const screenshotData = JSON.parse(screenshot.screenshot);
        return screenshotData.Url;
    } catch (error) {
        console.error('Error parsing screenshot data:', error);
        return '';
    }
};

const getScreenshotNote = (screenshot) => {
    try {
        if (screenshot.extraData) {
            const extraData = JSON.parse(screenshot.extraData);
            return extraData.Note || '';
        }
        return '';
    } catch (error) {
        console.error('Error parsing screenshot extra data:', error);
        return '';
    }
};

const formatScreenshotDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
};

// Initialize with first point selected
// Mobile map resize handler
const handleMobileResize = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
        setTimeout(() => {
            mapRef.value.leafletObject.invalidateSize();
            console.log('Map resized for mobile viewport change');
        }, 200);
    }
};

onMounted(async () => {
    await Promise.all([fetchRouteData(), fetchCurrentUserData(), getSubscriptionData()]);

    // Load screenshots for the route
    await loadScreenshots();

    // Auto-enable edit mode if accessed via edit route
    if (route.name === 'EditRoute') {
        editMode.value = true;
    }

    // Map initialization now handled by RouteMapViewer component

    // Ensure all route points have unique IDs
    ensureRoutePointIds();

    // Marker interactivity now handled by RouteMapViewer component

    // Add resize listeners
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleMobileResize);
    window.addEventListener('layout-sidebar-toggle', handleLayoutSidebarToggle);

    // Note: No automatic point selection - user must right-click to select points
});

// Marker interactivity now handled by RouteMapViewer component

// Navigation methods
const editRoute = () => {
    // Navigate to edit mode
    // window.location.href = `#/routes/${route.params.id}/edit`;
    router.push(`/routes/${route.params.id}/edit`);
};

const goBack = () => {
    // Navigate to Dashboard as the home/navigation root
    router.push({ name: 'Dashboard' });
};

const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    // Reset expanded state when closing
    if (isSidebarCollapsed.value) {
        isSidebarExpanded.value = false;
    }
    // Invalidate map size after sidebar transition completes
    setTimeout(() => {
        if (mapRef.value && mapRef.value.leafletObject) {
            mapRef.value.leafletObject.invalidateSize();
        }
    }, 350); // Wait for CSS transition (0.3s) + small buffer
};

const toggleSidebarExpanded = () => {
    isSidebarExpanded.value = !isSidebarExpanded.value;
    // Invalidate map size after sidebar transition completes
    setTimeout(() => {
        if (mapRef.value && mapRef.value.leafletObject) {
            mapRef.value.leafletObject.invalidateSize();
        }
    }, 350); // Wait for CSS transition (0.3s) + small buffer
};

// Helper functions for formatting
const formatLocationShort = (location) => {
    if (!location) return '';

    // Handle string format
    if (typeof location === 'string') {
        // Get first two parts of the address
        const parts = location.split(',').map(p => p.trim()).filter(p => p);
        return parts.slice(0, 2).join(', ') || location;
    }

    return '';
};

// formatDistance is now provided by useUnits composable

// Watch for sidebar collapse changes to resize map
watch(isSidebarCollapsed, () => {
    // Invalidate map size after sidebar transition completes
    setTimeout(() => {
        if (mapRef.value && mapRef.value.leafletObject) {
            mapRef.value.leafletObject.invalidateSize();
        }
    }, 350); // Wait for CSS transition (0.3s) + small buffer
});

// Handle window resize
const handleWindowResize = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
        setTimeout(() => {
            mapRef.value.leafletObject.invalidateSize();
        }, 100);
    }
};

// Handle main layout sidebar toggle
const handleLayoutSidebarToggle = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
        // Wait a bit for the layout transition to complete
        setTimeout(() => {
            mapRef.value.leafletObject.invalidateSize();
        }, 100);
    }
};
</script>

<style scoped>
/* Map styles now handled by RouteMapViewer component */

.route-viewer-new {
    height: 100vh;
    display: flex;
    flex-direction: row;
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    padding: 1rem;
    overflow: hidden;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    position: relative;
    gap: 1rem;
}

.route-viewer-header {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-surface);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
}

.route-viewer-header h5 {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
}

.action-buttons {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
    flex-wrap: wrap;
}

.edit-mode-actions {
    display: flex;
    gap: 0.5rem;
    align-items: right;
    flex-wrap: wrap;
}

.view-toggle {
    display: flex;
    border: 1px solid var(--bs-border-color);
    border-radius: 0.375rem;
    overflow: hidden;
}

/* View toggle styles - now handled by BaseButton components */
.view-toggle {
    display: flex;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.left-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 300px;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    transform: translateX(-100%);
    transition: transform var(--transition-slow);
    z-index: 1000;
    overflow-y: auto;
}

.left-sidebar.sidebar-open {
    transform: translateX(0);
}

.sidebar-toggle {
    position: fixed;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    background: var(--accent);
    color: white;
    padding: var(--spacing-xs) var(--spacing-2xs);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    cursor: pointer;
    z-index: 1001;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: var(--font-size-xs);
    transition: all var(--transition-slow);
}

.sidebar-toggle:hover {
    background: var(--accent-hover);
    padding-left: var(--spacing-xs);
}

.points-list-content {
    padding: 0;
    max-height: calc(90vh - 200px);
    overflow-y: auto;
    scrollbar-width: none;

    /* Firefox */
    -ms-overflow-style: none;

    /* Internet Explorer 10+ */
}

.points-list-content::-webkit-scrollbar {
    display: none;

    /* WebKit */
}

.route-point {
    display: flex;
    align-items: center;
    padding: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    border-radius: var(--radius-sm);
    background: var(--bs-tertiary-bg);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--bs-border-color);
}



.route-point:hover {
    background: var(--bs-secondary-bg);
    border-color: var(--bs-border-color);
}

.route-point.active {
    background: var(--bs-primary-bg-subtle);
    border-color: var(--bs-primary);
}

/* Custom marker styles - following PlannedRouteMapRefactored structure */
.custom-icon:not(.route-point) {
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

.point-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 1rem;
}

.point-indicator.start {
    background: var(--bs-success);
}

.point-indicator.end {
    background: var(--bs-danger);
}

.point-info {
    flex: 1;
}

.point-label {
    font-weight: 600;
    color: var(--bs-body-color);
    font-size: 0.9rem;
    text-align: left;
}

.point-location {
    color: var(--bs-secondary-color);
    font-size: 0.85rem;
}

.obstructions-list {
    margin: 1rem 0;
}

.obstruction-item {
    display: flex;
    align-items: center;
    padding: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 1px solid var(--bs-border-color);
}

.obstruction-item:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
}

.obstruction-item.active {
    background: rgb(0 167 225 / 10%);
    border-color: var(--accent);
}

.obstruction-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: var(--radius-sm);
    margin-right: var(--spacing-xs);
    color: var(--text-secondary);
    flex-shrink: 0;
}

/* Dark mode: grey background */
[data-bs-theme="dark"] .obstruction-icon {
    background: #6c757d;
}

.obstruction-item.active .obstruction-icon {
    background: var(--accent);
    color: white;
}

.obstruction-info {
    flex: 1;
}

.obstruction-name {
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: 2px;
    font-size: var(--font-size-xs);
    text-align: left;
}

.obstruction-details {
    display: flex;
    gap: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-bottom: 0;
}

.obstruction-height {
    font-size: var(--font-size-xs);
    color: var(--text-primary);
    font-weight: var(--font-weight-medium);
}

.center-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0;
    overflow: hidden;
    min-height: 0;
}

.center-content :deep(.base-panel) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
}

/* Remove padding from BaseCard when it contains map-container */
.center-content :deep(.base-card__content) {
    padding: 0;
}

/* Override BaseCard border-radius for map-container to make top corners rectangular */
.center-content> :deep(.base-card),
.center-content :deep(.base-card:has(.map-container)) {
    border-radius: 0 !important;
    overflow: hidden;
}

.center-content> :deep(.base-card .base-card__header),
.center-content> :deep(.base-card .base-card__content),
.center-content> :deep(.base-card .base-card__footer),
.center-content :deep(.base-card:has(.map-container) .base-card__header),
.center-content :deep(.base-card:has(.map-container) .base-card__content),
.center-content :deep(.base-card:has(.map-container) .base-card__footer) {
    border-radius: 0 !important;
}

.map-container {
    flex: 1;
    min-height: 300px;
    height: 100%;
    position: relative;
    background: var(--bg-elevated);

    /* border-radius: var(--radius-md); */
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
}



/* Header Actions Group - Inline title and buttons */
.header-actions-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    justify-content: flex-end;
}

.header-action-buttons {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-left: auto;
}

.header-action-buttons .base-button:has(i:only-child) {
    padding: 0.375rem;
    min-width: 1.75rem;
    width: 1.75rem;
    justify-content: center;
}

/* Compact header styles - matching RouteViewerNew */
.main-panel :deep(.base-panel__header) {
    padding: 0.75rem 1rem;
}

.main-panel :deep(.base-panel__header-main) {
    margin-bottom: 0;
}

.main-panel :deep(.base-panel__header-content) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.main-panel :deep(.base-panel__title h4) {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
    margin: 0;
}

/* Ensure BasePanel content fits width and doesn't scroll horizontally */
.main-panel :deep(.base-panel__content) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden auto;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
    padding: 0;
}

.map-view {
    width: 100%;
    height: 100%;
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.map-controls {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1000;
    padding: var(--spacing-xs);
}

.map-controls>div {
    position: absolute;
    display: flex;
    gap: 0.5rem;
}

.map-controls-top-left {
    top: 1rem;
    left: 1rem;
}

.map-controls-top-right {
    top: 1rem;
    right: 1rem;
}

.map-controls-bottom-right {
    bottom: 1rem;
    right: 1rem;
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
    margin: var(--spacing-xs);
}

.control-btn:hover {
    background: var(--bg-elevated);
    transform: translateY(-1px);
}

.list-view {
    width: 100%;
    height: calc(80vh - 160px);
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
}

.list-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border);
    background: var(--bg-surface);
    flex-shrink: 0;
}

.list-header h4 {
    margin: 0;
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
}

.points-list {
    flex: 1;
    overflow-y: auto;
    background: var(--bg-surface);
    max-height: calc(100vh - 200px);
    min-height: 300px;
}

.point-icon {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    flex-shrink: 0;
}

/* Responsive list view scrolling */
@media (width <= 1024px) {
    .points-list {
        max-height: calc(100vh - 150px);
        min-height: 250px;
    }
}

@media (width <= 768px) {
    .points-list {
        max-height: calc(100vh - 120px);
        min-height: 200px;
    }
}

@media (width <= 480px) {
    .points-list {
        max-height: calc(100vh - 100px);
        min-height: 150px;
    }
}


.point-actions {
    display: flex;
    gap: 0.5rem;
}

.right-sidebar {
    width: 380px;
    background: var(--bg-base);
    margin: 0;
    max-height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    transition: width 0.3s ease, flex 0.3s ease;
}

.right-sidebar.collapsed {
    width: 0;
    overflow: visible;
}

.right-sidebar.expanded {
    flex: 1;
    width: 100%;
    min-width: 100%;
}

.sidebar-toggle-btn {
    position: absolute;
    right: -16px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-md) 0 0 6px;
    width: 24px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
    transition: all 0.3s ease;
    padding: 0;
}

/* Expand button - center right when collapsed */
.sidebar-toggle-btn.sidebar-collapsed {
    top: 50%;
    transform: translateY(-50%);
    background: var(--accent);
    right: -16px;
}

.sidebar-toggle-btn.sidebar-collapsed:hover {
    background: var(--accent-hover);
    box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
}

.sidebar-header {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0;
    margin: 0;
    padding: 0;
}

.sidebar-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: var(--spacing-md);
}

.sidebar-header-separator {
    height: 1px;
    background: var(--border);
    margin: 0;
    padding: 0;
    width: 100%;
}

.sidebar-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.sidebar-expand-btn {
    background: transparent;
    color: var(--text-primary);
    border: none;
    border-radius: var(--radius-sm);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
}

.sidebar-expand-btn:hover {
    background: var(--bg-elevated);
    color: var(--accent);
}

.sidebar-expand-btn i {
    font-size: 14px;
}

.sidebar-close-btn {
    background: transparent;
    color: var(--text-primary);
    border: none;
    border-radius: var(--radius-sm);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
}

.sidebar-close-btn:hover {
    background: var(--bg-elevated);
    color: var(--error);
}

.sidebar-close-btn i {
    font-size: 14px;
}

.sidebar-toggle-btn i {
    font-size: 10px;
    line-height: 1;
}

.sidebar-card {
    height: 100%;
}

.sidebar-title {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--letter-spacing-normal);
    line-height: 1.2;
}

.footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}


/* Ensure proper scrolling and hover behavior */
.right-sidebar .sidebar-card {
    position: relative;
    z-index: 1;
}

/* Remove outer spacing from sidebar card header */

/* Remove outer spacing from sidebar card header */
.right-sidebar .sidebar-card :deep(.base-card__header) {
    padding: 0.5rem 0.75rem 0;
}

/* Compact sidebar header top */
.right-sidebar .sidebar-header-top {
    padding: 0.5rem 0;
    margin: 0;
}

.right-sidebar .sidebar-header {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0;
    margin: 0;
    padding: 0;
}

.sidebar-card :deep(.base-card__content) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
}

/* BaseTabGroup styling matching AddPlannedRoute */
.sidebar-tab-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
}

.sidebar-tab-group :deep(.base-tab-group__tabs) {
    flex-wrap: nowrap;
    overflow: auto hidden;
    gap: 0;
    margin: 0;
    margin-top: 0;
    padding: 0;
    padding-top: 0;
    border-bottom: 1px solid var(--border);
    scrollbar-width: thin;
    scrollbar-color: var(--text-secondary) transparent;
    -webkit-overflow-scrolling: touch;
    justify-content: center;
}

.sidebar-tab-group :deep(.base-tab-group__tabs)::-webkit-scrollbar {
    height: 4px;
}

.sidebar-tab-group :deep(.base-tab-group__tabs)::-webkit-scrollbar-track {
    background: transparent;
}

.sidebar-tab-group :deep(.base-tab-group__tabs)::-webkit-scrollbar-thumb {
    background-color: var(--text-secondary);
    border-radius: var(--radius-sm);
}

.sidebar-tab-group :deep(.base-tab-group__tabs)::-webkit-scrollbar-thumb:hover {
    background-color: var(--accent);
}

/* Compact tab button styling matching AddPlannedRoute */
.sidebar-tab-group :deep(.base-tab) {
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    gap: 0.25rem;
    line-height: 1.2;
    white-space: nowrap;
    min-width: fit-content;
    flex-shrink: 0;
    border-radius: 0;
    transition: all var(--transition-normal);
    justify-content: center;
    text-align: center;
}

.sidebar-tab-group :deep(.base-tab__icon) {
    font-size: var(--font-size-xs);
    line-height: 1.2;
}

.sidebar-tab-group :deep(.base-tab__text) {
    flex: 0 1 auto;
    text-align: center;
}

/* Active tab styling */
.sidebar-tab-group :deep(.base-tab.active) {
    background: var(--bg-surface);
    color: var(--accent);
    border-bottom: 2px solid var(--accent);
}

/* Hover state for inactive tabs */
.sidebar-tab-group :deep(.base-tab:not(.active):hover) {
    background: var(--bg-elevated);
    color: var(--accent);
}

.sidebar-tab-group :deep(.base-tab-group__content) {
    flex: 1;
    min-height: 0;
    overflow: hidden auto;
    display: flex;
    flex-direction: column;
    -webkit-overflow-scrolling: touch;
    padding: var(--spacing-xs);
}

.route-summary-content {
    padding: var(--spacing-xs);
}

.route-summary {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.summary-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.summary-section-title {
    margin: 0;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    text-align: left;
    padding-bottom: var(--spacing-2xs);
    letter-spacing: var(--letter-spacing-normal);
}

.summary-items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.summary-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
}

.summary-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
}

.summary-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-normal);
    color: var(--text-primary);
    word-break: break-word;
    line-height: 1.4;
}

.summary-note {
    margin-top: var(--spacing-2xs);
}

.summary-note p {
    margin: 0;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-normal);
    color: var(--text-primary);
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
}

.no-route-data {
    padding: var(--spacing-2xl);
    text-align: center;
}

/* Compact Screenshots Grid */
.screenshots-content {
    padding: var(--spacing-xs);
    overflow-y: auto;
    max-height: calc(90vh - 200px);
}

/* Compact Screenshots Grid for Sidebar Tab */
.compact-screenshots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.5rem;
}

.compact-screenshot-item {
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
    border: 1px solid var(--border);
    cursor: move;
    position: relative;
}

.compact-screenshot-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
}

.compact-screenshot-item.dragging {
    opacity: 0.5;
    cursor: grabbing;
}

.compact-screenshot-item[draggable="true"] {
    cursor: grab;
}

.compact-screenshot-item[draggable="true"]:active {
    cursor: grabbing;
}

.compact-screenshot-card {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    position: relative;
}

.compact-screenshot-drag-handle {
    position: absolute;
    top: 2px;
    left: 2px;
    z-index: 10;
    background: rgb(0 0 0 / 60%);
    color: white;
    padding: 2px 4px;
    border-radius: 3px;
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.compact-screenshot-item:hover .compact-screenshot-drag-handle {
    opacity: 1;
}

.compact-screenshot-drag-handle:active {
    cursor: grabbing;
}

.compact-screenshot-drag-handle i {
    font-size: 12px;
}

.compact-screenshot-image {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--bg-elevated);
}

.compact-screenshot-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.compact-screenshot-info {
    padding: 0.375rem;
    background: var(--bg-surface);
}

.compact-screenshot-date {
    font-size: 10px;
    color: var(--text-secondary);
    margin-bottom: 0.125rem;
}

.compact-screenshot-note {
    font-size: 10px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.compact-screenshots-grid .no-screenshots {
    grid-column: 1 / -1;
    padding: 1rem;
}

.compact-screenshots-grid .no-screenshots i {
    font-size: 2rem;
}

.compact-screenshots-grid .no-screenshots p {
    font-size: 12px;
    margin-top: 0.5rem;
}

.no-screenshots {
    text-align: center;
    padding: 2rem;
    border: 2px dashed #ccc;
    border-radius: var(--radius-xl);
}

/* Fix hover effects to work across full height */
.right-sidebar * {
    pointer-events: auto;
}

/* Ensure PointDisplay component content is contained */
.point-details-content :deep(*) {
    max-width: 100%;
    box-sizing: border-box;
}

.point-details-content :deep(.point-display),
.point-details-content :deep(.point-form),
.point-details-content :deep(.form-group),
.point-details-content :deep(.form-control),
.point-details-content :deep(.btn),
.point-details-content :deep(.input-group),
.point-details-content :deep(.card),
.point-details-content :deep(.panel) {
    overflow-wrap: break-word;
}

/* Handle long text content */
.point-details-content :deep(p),
.point-details-content :deep(span),
.point-details-content :deep(div),
.point-details-content :deep(label) {
    overflow-wrap: break-word;
    hyphens: auto;
}



.route-info-section,
.obstruction-details-section {
    padding: var(--spacing-sm);
    border-bottom: 1px solid var(--border);
}

.route-info-section h3,
.obstruction-details-section h3 {
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--text-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
}

.info-item {
    display: flex;
    flex-direction: column;
}

.info-item label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    margin-bottom: var(--spacing-2xs);
}

.date-input {
    position: relative;
}

.date-input i {
    position: absolute;
    right: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    pointer-events: none;
}

.obstruction-filters {
    display: flex;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
    flex-wrap: wrap;
}

.filter-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--border);
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: all var(--transition-normal);
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    color: var(--text-primary);
}

.filter-btn:hover {
    background: var(--bs-tertiary-bg);
}

.filter-btn.active {
    background: var(--bs-primary);
    color: var(--bs-primary-text);
    border-color: var(--bs-primary);
}

.details-header h4 {
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
}

.details-subheader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);
}

.details-subheader h5 {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
}

.point-of {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
}

.details-grid {
    display: grid;
    gap: var(--spacing-sm);
}

.detail-item {
    display: flex;
    flex-direction: column;
}

.detail-item label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    margin-bottom: var(--spacing-2xs);
}


.no-obstruction-selected {
    text-align: center;
    color: var(--text-secondary);
    padding: var(--spacing-lg);
    font-style: italic;
}

/* Form controls - now using design system variables */
.form-control {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    background: var(--bg-surface);
    color: var(--text-primary);
}

.form-control:focus {
    border-color: var(--accent);
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgb(0 167 225 / 10%);
}

/* Custom marker styles */
:deep(.custom-marker) {
    background: transparent !important;
    border: none !important;
}

/* Marker popup styles */
:deep(.leaflet-popup-content) {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
}

:deep(.leaflet-popup-content-wrapper) {
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
}

.marker-popup h6 {
    margin: 0 0 0.5rem;
    color: var(--bs-body-color);
}

.marker-popup p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: var(--bs-secondary-color);
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(-100%);
    opacity: 0;
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
}

.style-btn:hover {
    background: var(--bg-elevated);
}

.style-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

/* Undo/Redo controls */
.undo-redo-controls {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    display: flex;
    gap: 0.5rem;
    z-index: 1000;
}

/* Undo/Redo button styles - now using design system variables */
.undo-btn,
.redo-btn {
    width: 40px;
    height: 40px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-primary);
    transition: all var(--transition-normal);
}

.undo-btn:hover,
.redo-btn:hover {
    background: var(--bg-elevated);
}

.undo-btn:disabled,
.redo-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Custom marker styles - following PlannedRouteMapRefactored structure */
.custom-icon:not(.route-point) {
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
    background-color: #f8f9fa;

    /* Light gray background */
}

/* Start and end point markers - solid dark blue */
.custom-icon.start-end {
    background-color: #333B56 !important;

    /* Solid dark blue background */
    border: 3px solid #333B56 !important;
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
    border: 3px solid #333B56 !important;

    /* Dark blue border */
    color: #333B56 !important;
}

.custom-icon.survey-point img {
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
    background: transparent !important;
}

/* Route point markers (only visible in edit mode) */
.custom-icon.route-point {
    background-color: #6c757d !important;

    /* Gray background */
    border: 3px solid #495057 !important;

    /* Darker gray border */
    color: white !important;

    /* width: 16px !important;
    height: 16px !important;
    font-size: 8px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important; */
}

.custom-icon.route-point i {
    color: white !important;
    font-size: 8px !important;
    position: relative !important;
    z-index: 1 !important;
}

/* Ensure route-point markers are exactly 16px - highest specificity */
div.custom-icon.route-point {
    width: 16px !important;
    height: 16px !important;
    min-width: 16px !important;
    min-height: 16px !important;
    max-width: 16px !important;
    max-height: 16px !important;
    box-sizing: border-box !important;
}

/* Target Leaflet icon container for route-point markers */
:deep(.leaflet-marker-icon) div.custom-icon.route-point {
    width: 16px !important;
    height: 16px !important;
    min-width: 16px !important;
    min-height: 16px !important;
    max-width: 16px !important;
    max-height: 16px !important;
    box-sizing: border-box !important;
}

/* Ensure Leaflet icon container for route-points is also 16px */
:deep(.leaflet-marker-icon[style*="width: 16px"]) {
    width: 16px !important;
    height: 16px !important;
}

:deep(.leaflet-marker-icon[style*="width: 16px"]) div {
    width: 16px !important;
    height: 16px !important;
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

/* Ensure our custom icons don't inherit any unwanted backgrounds */
:deep(.leaflet-marker-icon) div {
    background: transparent !important;
}

/* Ensure our custom icons don't inherit any unwanted backgrounds */
.custom-icon:not(.route-point) {
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
    border: 3px solid #333B56 !important;
}

/* Performance optimization: Dynamic marker sizing */
.marker-small {
    width: 20px !important;
    height: 20px !important;
    font-size: 10px !important;
}

.marker-medium {
    width: 25px !important;
    height: 25px !important;
    font-size: 12px !important;
}

.marker-large {
    width: 30px !important;
    height: 30px !important;
    font-size: 14px !important;
}

/* Optimize marker rendering for performance */
.custom-icon img {
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
    transition: none !important;

    /* Disable transitions for better performance */
}

/* Reduce marker complexity at low zoom levels */
@media (width <= 768px) {
    .marker-small {
        width: 16px !important;
        height: 16px !important;
        font-size: 8px !important;
    }

    .marker-medium {
        width: 20px !important;
        height: 20px !important;
        font-size: 10px !important;
    }
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

.custom-icon.start-end img {
    filter: brightness(0) invert(0.8) !important;

    /* Make the image white */
}

/* Survey point markers */
.custom-icon.survey-point {
    background-color: #f8f9fa !important;

    /* Light gray background */
    border: 2px solid #333B56 !important;

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
    color: #333B56 !important;
    font-size: 12px !important;
    position: relative !important;
    z-index: 1 !important;
}

/* Marker highlighting */
.transparent-marker {
    opacity: 0.8;
    transition: opacity 0.2s;
}

.selected-marker,
.marker-highlighted {
    opacity: 1;
    z-index: 1000;
}

/* Floating panels */
.floating-panel {
    position: absolute;
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
    z-index: 1000;
    padding: 1rem;
    max-width: 300px;
}

.info-panel {
    top: 1rem;
    left: 1rem;
}

.right-floating-panel {
    top: 1rem;
    right: 1rem;
}

.info-row {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.info-row:last-child {
    margin-bottom: 0;
}

/* Context Menu Styles */

/* Context Menu Styles - Design System */
.context-menu {
    position: absolute;
    background: var(--bg-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--spacing-2xs) 0;
    z-index: 100000;
    min-width: 150px;
    border: 1px solid var(--border);
    pointer-events: auto;
}

.context-menu-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    cursor: pointer;
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

.context-menu-item i.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.context-menu-item i {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    flex-shrink: 0;
}

/* Selected marker highlighting */
:deep(.selected-marker .custom-icon) {
    border: 3px solid var(--warning) !important;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%) !important;
    animation: markerPulse 2s ease-in-out infinite;
}

@keyframes markerPulse {
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

/* Selected marker highlighting */
:deep(.selected-marker) {
    z-index: 1000 !important;
}

:deep(.selected-marker .custom-icon) {
    border: 3px solid var(--warning) !important;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%) !important;
    animation: markerPulse 2s ease-in-out infinite;
}

:deep(.selected-marker .custom-icon.survey-point) {
    border: 3px solid var(--warning) !important;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%) !important;
    animation: markerPulse 2s ease-in-out infinite;
}

:deep(.selected-marker .custom-icon.start-end) {
    border: 3px solid var(--warning) !important;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%) !important;
    animation: markerPulse 2s ease-in-out infinite;
}

/* Alternative marker highlighting */
:deep(.marker-highlighted) {
    z-index: 1000 !important;
}

:deep(.marker-highlighted .leaflet-marker-icon) {
    border: 3px solid var(--warning) !important;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%) !important;
    animation: markerPulse 2s ease-in-out infinite;
}

:deep(.marker-highlighted .custom-icon) {
    border: 3px solid var(--warning) !important;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%) !important;
    animation: markerPulse 2s ease-in-out infinite;
}

:deep(.marker-highlighted .custom-icon) {
    border: 3px solid var(--warning) !important;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%) !important;
    animation: markerPulse 2s ease-in-out infinite;
}

/* Direct marker highlighting without :deep() */
.marker-highlighted {
    z-index: 1000 !important;
}

.marker-highlighted .leaflet-marker-icon {
    border: 3px solid var(--warning) !important;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%) !important;
    animation: markerPulse 2s ease-in-out infinite;
}

.marker-highlighted .custom-icon {
    border: 3px solid var(--warning) !important;
    box-shadow: 0 0 0 2px var(--warning), 0 2px 8px rgb(0 0 0 / 30%) !important;
    animation: markerPulse 2s ease-in-out infinite;
}


/* Ensure markers remain individually interactive and visible */
:deep(.leaflet-marker-cluster) {
    display: none !important;
}

:deep(.marker-cluster) {
    display: none !important;
}

:deep(.leaflet-cluster) {
    display: none !important;
}

/* Ensure all markers are individually visible and interactive */
:deep(.leaflet-marker) {
    display: block !important;
    pointer-events: auto !important;
    z-index: 1000 !important;
}

:deep(.leaflet-marker-icon) {
    pointer-events: auto !important;
    cursor: pointer !important;
}

/* Prevent any clustering interference with interactive elements */
:deep(.leaflet-marker-cluster-small),
:deep(.leaflet-marker-cluster-medium),
:deep(.leaflet-marker-cluster-large) {
    display: none !important;
}

/* Ensure route segments remain interactive */
:deep(.leaflet-interactive) {
    pointer-events: auto !important;
    cursor: pointer !important;
}

/* Additional marker highlighting for better visibility */
:deep(.leaflet-marker:hover) {
    z-index: 1001 !important;
}

:deep(.leaflet-marker.selected) {
    z-index: 1002 !important;
}

/* Ensure context menu appears above all other elements */
.context-menu {
    z-index: 100000 !important;
}

/* Ensure segment info popup appears above all other elements */
.segment-info-compact {
    z-index: 100000 !important;
}

/* Screenshot button spinning animation */
.control-btn i.spinning {
    animation: spin 1s linear infinite;
}

/* Screenshot button specific styling */
.control-btn:has(.bi-camera) {
    background: var(--success) !important;
    border-color: var(--success) !important;
}

.control-btn:has(.bi-camera):hover {
    background: #218838 !important;
    border-color: #218838 !important;
}

.control-btn:has(.bi-camera):disabled {
    background: #6c757d !important;
    border-color: #6c757d !important;
    opacity: 0.6;
}

/* Modal styles - now using design system variables */
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
    background: var(--bg-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    padding: var(--spacing-sm);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-close:hover {
    color: var(--text-primary);
}

.modal-body {
    padding: var(--spacing-sm);
}

.modal-footer {
    padding: var(--spacing-sm);
    border-top: 1px solid var(--border);
    display: flex;
    gap: var(--spacing-xs);
    justify-content: flex-end;
}

/* Screenshot styles - now using design system variables */
.screenshots-section {
    margin-top: var(--spacing-xs);
    padding: var(--spacing-xs);
    background-color: var(--bg-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
}

.screenshots-header {
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
}

.screenshots-content {
    /* Remove flex display to allow grid layout to work properly */
    display: block;
}

.screenshot-card {
    position: relative;
}

.no-screenshots {
    text-align: center;
    padding: 2rem;
    border: 2px dashed #ccc;
    border-radius: var(--radius-xl);
}

.screenshots-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
    gap: var(--spacing-sm) !important;
    margin-top: var(--spacing-xs);
    width: 100%;
    align-items: start;
}

.screenshot-item {
    background: var(--bg-elevated);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-slow);
    border: 1px solid var(--border);
    height: 200px;
    display: flex;
    flex-direction: column;
    width: 100%;
    cursor: move;
    position: relative;
}

.screenshot-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
    border-color: var(--accent);
}

.screenshot-item.dragging {
    opacity: 0.5;
    cursor: grabbing;
}

.screenshot-item[draggable="true"] {
    cursor: grab;
}

.screenshot-item[draggable="true"]:active {
    cursor: grabbing;
}

.screenshot-drag-handle {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 10;
    background: rgb(0 0 0 / 60%);
    color: white;
    padding: var(--spacing-2xs) 6px;
    border-radius: var(--radius-sm);
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.screenshot-item:hover .screenshot-drag-handle {
    opacity: 1;
}

.screenshot-drag-handle:active {
    cursor: grabbing;
}

.screenshot-drag-handle i {
    font-size: 14px;
}

.screenshot-card {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.screenshot-image {
    position: relative;
    width: 100%;
    height: 120px;
    overflow: hidden;
    background: var(--bg-surface);
    flex-shrink: 0;
}

.screenshot-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.screenshot-image:hover img {
    transform: scale(1.08);
}

.screenshot-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgb(0 0 0 / 70%) 0%, rgb(0 0 0 / 40%) 100%);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: var(--spacing-md);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.screenshot-item:hover .screenshot-overlay {
    opacity: 1;
}

.screenshot-overlay .btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: all 0.2s ease;
}

.screenshot-overlay .btn-light {
    background: rgb(255 255 255 / 90%);
    color: var(--bs-body-color);
    border: none;
}

.screenshot-overlay .btn-light:hover {
    background: rgb(255 255 255 / 100%);
    transform: scale(1.05);
}

.screenshot-overlay .btn-danger {
    background: rgb(220 53 69 / 90%);
    color: white;
    border: none;
}

.screenshot-overlay .btn-danger:hover {
    background: rgb(220 53 69 / 100%);
    transform: scale(1.05);
}

.screenshot-info {
    padding: var(--spacing-xs);
    background: var(--bg-surface);
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.screenshot-order {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--accent);
    margin-bottom: var(--spacing-2xs);
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
}

.screenshot-order::before {
    content: "🔢";
    font-size: var(--font-size-xs);
}

.screenshot-date {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-2xs);
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
}

.screenshot-date::before {
    content: "📅";
    font-size: var(--font-size-xs);
}

.screenshot-note {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    line-height: 1.3;
    overflow-wrap: break-word;
    background: var(--bg-elevated);
    padding: var(--spacing-2xs);
    border-radius: var(--radius-sm);
    border-left: 2px solid var(--accent);
    margin-top: var(--spacing-2xs);
    flex: 1;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
}

.no-screenshots {
    text-align: center;
    padding: var(--spacing-sm);
    border: 2px dashed var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-elevated);
    margin: var(--spacing-xs) 0;
}

.no-screenshots i {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
}

.no-screenshots p {
    color: var(--text-secondary);
    margin: var(--spacing-2xs) 0;
}

.no-screenshots .small {
    font-size: var(--font-size-sm);
    opacity: 0.8;
}

/* Collapsible screenshots styles - now using design system variables */
.collapsible-screenshots {
    position: relative;
    z-index: 10;
    margin-bottom: var(--spacing-2xs);
    background: var(--bg-surface);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
}

.screenshots-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-2xs) var(--spacing-xs);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--transition-normal);
}

.screenshots-toggle:hover {
    background: var(--bg-surface);
}

.toggle-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
}

.toggle-content i {
    font-size: var(--font-size-base);
    color: var(--accent);
}

.toggle-content span {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
}


.screenshots-sections {
    padding: var(--spacing-xs);
}

/* Screenshot Viewer Modal Styles */
.screenshot-viewer-modal {
    max-width: 90vw;
    max-height: 90vh;
    width: 800px;
}

.screenshot-viewer-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.screenshot-full-image {
    text-align: center;
    background: var(--bs-tertiary-bg);
    border-radius: var(--radius-lg);
    padding: 1rem;
    max-height: 60vh;
    overflow: auto;
}

.screenshot-full-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.screenshot-details {
    background: var(--bs-tertiary-bg);
    border-radius: var(--radius-lg);
    padding: 1rem;
}

.detail-item {
    margin-bottom: 0.8rem;
    font-size: 0.9rem;
    color: var(--bs-body-color);
}

.detail-item:last-child {
    margin-bottom: 0;
}

.detail-item strong {
    color: var(--bs-primary);
    font-weight: 600;
}

/* Responsive design for large screens */
@media (width >= 1600px) {
    .center-content {
        flex: 1;
        height: 100%;
    }

    .map-container {
        flex: 1;
        height: 100%;
    }
}

@media (width <= 1400px) {
    .right-sidebar {
        width: 350px;
    }

    .center-content {
        flex: 1;
        height: 100%;
    }
}

@media (width <= 1200px) {
    .right-sidebar {
        width: 320px;
    }
}

@media (width <= 992px) {
    .main-content {
        flex-direction: column;
    }

    .left-sidebar {
        width: 100%;
        height: auto;
        max-height: 40vh;
        position: relative;
        transform: none;
    }

    .left-sidebar.sidebar-open {
        transform: none;
    }

    .sidebar-toggle {
        position: relative;
        transform: none;
        writing-mode: horizontal-tb;
        text-orientation: initial;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        margin: 1rem;
    }

    .right-sidebar {
        width: 100%;
        height: auto;
        max-height: none;
        margin: 0;
        overflow-y: auto;
        scrollbar-width: none;

        /* Firefox */
        -ms-overflow-style: none;

        /* Internet Explorer 10+ */
    }

    .right-sidebar::-webkit-scrollbar {
        display: none;

        /* WebKit */
    }

    .center-content {
        flex: 1;
        min-height: 350px;
        height: auto;
        max-height: none;
        margin: 0.01rem 0;
    }

    .map-container {
        min-height: 300px;
        height: 50vh;
        max-height: 500px;
    }

    .footer-actions {
        flex-direction: column;
        gap: 0.75rem;
    }

}

/* Enhanced responsive design for tablets */
@media (width <= 1024px) {
    .main-content {
        gap: var(--spacing-xs);
    }

    .center-content {
        height: calc(75vh - 100px);
        min-height: 350px;
    }

    .map-container {
        min-height: 300px;
    }

    .right-sidebar {
        width: 300px;
    }
}

/* Responsive design for mobile tablets */
@media (width <= 768px) {
    .center-content {
        max-height: none;
        overflow-y: auto;
        scrollbar-width: none;

        /* Firefox */
        -ms-overflow-style: none;

        /* Internet Explorer 10+ */
    }

    .center-content::-webkit-scrollbar {
        display: none;

        /* WebKit */
    }

    .map-container {
        height: 300px;
        min-height: 250px;
        position: relative;
        overflow: hidden;
    }

    .map-view {
        width: 100%;
        height: 100%;
        min-height: 250px;
    }

    .map-view :deep(.route-map-container) {
        height: 100% !important;
        min-height: 250px !important;
    }

    .map-view :deep(.leaflet-map) {
        height: 100% !important;
        min-height: 250px !important;
    }

    .map-view :deep(.leaflet-container) {
        height: 100% !important;
        min-height: 250px !important;
    }

    .screenshots-toggle {
        padding: var(--spacing-2xs) var(--spacing-xs);
    }

    .toggle-content span {
        font-size: var(--font-size-xs);
    }

    .screenshots-sections {
        padding: var(--spacing-2xs);
    }

    .footer-actions {
        flex-direction: column;
        gap: 0.75rem;
    }


    .screenshots-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
        gap: var(--spacing-xs);
    }

    .screenshot-item {
        height: 160px;
    }

    .screenshot-image {
        height: 100px;
    }

    .screenshot-info {
        padding: var(--spacing-2xs);
    }

    .screenshot-date {
        font-size: var(--font-size-xs);
    }

    .screenshot-note {
        font-size: var(--font-size-xs);
        -webkit-line-clamp: 2;
        line-clamp: 2;
    }

    .screenshot-viewer-modal {
        width: 95vw;
        max-height: 95vh;
    }

    .screenshot-full-image {
        max-height: 40vh;
    }
}

@media (width <= 480px) {
    .center-content {
        max-height: none;
        overflow-y: auto;
        scrollbar-width: none;

        /* Firefox */
        -ms-overflow-style: none;

        /* Internet Explorer 10+ */
    }

    .center-content::-webkit-scrollbar {
        display: none;

        /* WebKit */
    }

    .map-container {
        height: 300px;
        min-height: 250px;
        position: relative;
        overflow: hidden;
    }

    .map-view {
        width: 100%;
        height: 100%;
        min-height: 250px;
    }

    .map-view :deep(.route-map-container) {
        height: 100% !important;
        min-height: 250px !important;
    }

    .map-view :deep(.leaflet-map) {
        height: 100% !important;
        min-height: 250px !important;
    }

    .map-view :deep(.leaflet-container) {
        height: 100% !important;
        min-height: 250px !important;
    }

    .screenshots-grid {
        grid-template-columns: 1fr !important;
        gap: var(--spacing-xs);
    }

    .screenshot-item {
        height: 140px;
    }

    .screenshot-image {
        height: 80px;
    }

    .screenshot-info {
        padding: var(--spacing-2xs);
    }

    .screenshot-date {
        font-size: var(--font-size-xs);
    }

    .screenshot-note {
        font-size: var(--font-size-xs);
        -webkit-line-clamp: 2;
        line-clamp: 2;
    }
}

/* Extra small mobile devices */
@media (width <= 360px) {
    .center-content {
        max-height: none;
        overflow-y: auto;
    }

    .map-container {
        height: 300px;
        min-height: 250px;
    }

    .map-view {
        min-height: 250px;
    }
}

/* Mobile map fixes */
@media (width <= 768px) {
    .map-container {
        z-index: 1;
    }

    .map-container .leaflet-container {
        height: 100% !important;
        min-height: 250px !important;
        z-index: 1;
        position: relative;
    }

    .map-view .leaflet-container {
        height: 100% !important;
        min-height: 250px !important;
        z-index: 1;
        position: relative;
    }

}

/* Final route-point rule to override any conflicting styles */
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

/* CRITICAL: Force route-point markers to be 16px - highest specificity */
.custom-icon.route-point,
div.custom-icon.route-point,
:deep(.leaflet-marker-icon) .custom-icon.route-point,
:deep(.leaflet-marker-icon) div.custom-icon.route-point {
    width: 16px !important;
    height: 16px !important;
    min-width: 16px !important;
    min-height: 16px !important;
    max-width: 16px !important;
    max-height: 16px !important;
    box-sizing: border-box !important;
    background-color: #6c757d !important;
    border: 3px solid #495057 !important;
    color: white !important;
    font-size: 8px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%) !important;
}

/* Design System Integration - Remove custom elevated card styles as they're now handled by BaseCard */

/* Main Panel Styles */
.main-panel {
    flex: 1;
    min-height: 0;
    max-height: calc(100vh - 120px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.actions-container {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    width: 100%;
    flex-wrap: nowrap;
}

.action-row:last-child {
    margin-bottom: 0;
}

.action-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.screenshots-section {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
}

.point-details-content {
    padding: 1rem;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    box-sizing: border-box;
}

.no-point-selected {
    padding: 2rem 1rem;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Responsive Panel Header */
@media (width <= 768px) {
    .actions-container {
        gap: 0.5rem;
    }

    .action-row {
        flex-direction: column;
        gap: 0.75rem;
        align-items: stretch;
    }

    .action-group {
        justify-content: center;
        flex-wrap: wrap;
    }

    .main-panel {
        margin: 0.5rem;
        max-width: calc(100% - 1rem);
        width: calc(100% - 1rem);
    }

    /* Layout changes for smaller screens */
    .route-viewer-new {
        flex-direction: column;
        padding: 0.5rem;
        gap: 0.5rem;
    }

    .main-panel {
        flex: 0 0 auto;
        max-height: 50vh;
        min-height: 300px;
    }

    /* Hide sidebar buttons on smaller screens */
    .sidebar-expand-btn,
    .sidebar-close-btn,
    .sidebar-toggle-btn.sidebar-collapsed {
        display: none !important;
    }

    /* Make sidebar always visible and below main panel */
    .right-sidebar {
        width: 100% !important;
        max-width: 100% !important;
        flex: 0 0 auto;
        max-height: calc(50vh - 1rem);
        height: calc(50vh - 1rem);
        margin-top: 0.5rem;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .right-sidebar.collapsed {
        width: 100% !important;
        height: calc(50vh - 1rem) !important;
        max-height: calc(50vh - 1rem) !important;
        overflow: hidden;
    }

    .right-sidebar.expanded {
        flex: 0 0 auto;
        width: 100% !important;
    }

    /* Force sidebar card to be visible on smaller screens */
    .right-sidebar .sidebar-card {
        display: flex !important;
        height: 100%;
        max-height: 100%;
        overflow: hidden;
    }

    /* Ensure BaseCard content allows scrolling */
    .right-sidebar .sidebar-card :deep(.base-card__content) {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
        padding: 0;
    }

    /* Make sidebar content scrollable */
    .right-sidebar .points-list-content,
    .right-sidebar .sidebar-tab-group :deep(.base-tab-group__content) {
        flex: 1;
        overflow: hidden auto;
        min-height: 0;
        -webkit-overflow-scrolling: touch;
    }

    .main-content {
        flex: 0 0 auto;
    }

    /* Responsive styles for header buttons on smaller screens */
    .header-actions-group {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        overflow: auto hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        scrollbar-color: var(--text-secondary) transparent;
    }

    .header-actions-group::-webkit-scrollbar {
        height: 4px;
    }

    .header-actions-group::-webkit-scrollbar-track {
        background: transparent;
    }

    .header-actions-group::-webkit-scrollbar-thumb {
        background-color: var(--text-secondary);
        border-radius: var(--radius-sm);
    }

    .header-actions-group::-webkit-scrollbar-thumb:hover {
        background-color: var(--accent);
    }

    .header-action-buttons {
        display: flex;
        flex-wrap: nowrap;
        gap: 0.375rem;
        margin-left: auto;
        flex-shrink: 0;
    }

    .header-action-buttons .base-button {
        flex: 0 0 auto;
        min-width: auto;
        white-space: nowrap;
    }

    .save-indicator {
        flex-shrink: 0;
        white-space: nowrap;
    }
}
</style>