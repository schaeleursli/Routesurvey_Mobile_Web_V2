<template>
    <div class="route-viewer-new" v-if="checkFeatureAccess('free_surveys') && routeData && currentUserData">
        <!-- Main Panel -->
        <BasePanel :title="routeData?.title || 'Route Viewer'" elevation="level1" class="main-panel"
            v-show="!isSidebarExpanded">
            <template #header>
                <BaseButton variant="primary" size="small" @click="editRoute" left-icon="bi bi-pencil">
                    Edit
                </BaseButton>
            </template>

            <!-- Screenshots Section - Moved to unified floating panel -->

            <!-- Main Content Area -->
            <div class="main-content">
                <!-- Center Content - Map View -->
                <div class="center-content">
                    <div class="map-container">
                        <!-- Map View -->
                        <div v-if="viewMode === 'map'" class="map-view">
                            <!-- Floating Info Panel -->
                            <!-- <div class="floating-panel info-panel" v-if="currentUserData">
                            <div class="info-row">
                                <span><b>{{ $t('distance') }}:</b> {{ currentUserData.imperial ? (routeData.distance /
                                    1609.34).toFixed(2) :
                                    (routeData.distance / 1000.0).toFixed(2) }} {{ currentUserData.imperial ?
                                        $t('miles') :
                                        $t('km') }}</span>
                            </div>
                            <div class="info-row">
                                <span><b>{{ $t('points') }}:</b> {{ nonRoutePointsCount }} {{ $t('points') }}</span>
                            </div>
                            <div class="info-row">
                                <span><b>{{ $t('notes') }}:</b> <span :title="routeData.note || '-'">{{ truncatedNotes
                                }}</span></span>
                                <i class="bi bi-pencil ms-2" style="cursor:pointer;" @click="showNotesEdit = true"></i>
                            </div>
                        </div> -->
                            <!-- <div class="right-floating-panel info-panel">
                            <div>
                                <span><b>{{ $t('editObjectDesc') }}</b></span>
                            </div>
                        </div> -->

                            <RouteMapViewer ref="mapRef" :route-points="routePoints" :edit-mode="editMode"
                                :selected-marker="selectedMarker" :map-center="mapCenter" :zoom="zoom"
                                @marker-click="onMarkerClick" @marker-drag="onMarkerDrag"
                                @segment-click="onSegmentClick" @segment-hover="onSegmentHover"
                                @segment-leave="onSegmentLeave" @point-info="openPointInfo" @point-edit="editPoint"
                                @map-ready="onMapReady" />

                            <!-- Unified Floating Panel with Tabs -->
                            <div v-if="routeData || screenshots.length > 0 || filteredRoutePointsWithDistance.length > 0"
                                class="floating-unified-panel"
                                :class="{ 'expanded': !isObstructionPanelCollapsed, 'collapsed': isObstructionPanelCollapsed }">
                                <div class="unified-panel-header">
                                    <!-- Title always shown -->
                                    <div class="unified-panel-title">
                                        <span class="title-text" @click="toggleObstructionPanel">
                                            {{ routeData?.title || 'Route' }}
                                            <span v-if="routeData?.distance" class="title-distance">
                                                - {{ formatDistance(routeData.distance, isImperial) }}
                                            </span>
                                        </span>
                                        <button class="unified-toggle-btn" @click.stop="toggleObstructionPanel"
                                            :title="isObstructionPanelCollapsed ? t('expand') : t('collapse')">
                                            <i
                                                :class="isObstructionPanelCollapsed ? 'bi bi-chevron-down' : 'bi bi-chevron-up'"></i>
                                        </button>
                                    </div>
                                    <!-- Tabs shown when expanded, below title -->
                                    <div v-show="!isObstructionPanelCollapsed" class="unified-panel-tabs">
                                        <button class="unified-tab"
                                            :class="{ 'active': activeFloatingTab === 'summary' }"
                                            @click.stop="activeFloatingTab = 'summary'">
                                            <i class="bi bi-info-circle"></i>
                                            <span>Summary</span>
                                        </button>
                                        <button class="unified-tab"
                                            :class="{ 'active': activeFloatingTab === 'screenshots' }"
                                            @click.stop="activeFloatingTab = 'screenshots'">
                                            <i class="bi bi-images"></i>
                                            <span>Screenshots ({{ screenshots.length }})</span>
                                        </button>
                                        <button v-if="filteredRoutePointsWithDistance.length > 0" class="unified-tab"
                                            :class="{ 'active': activeFloatingTab === 'obstructions' }"
                                            @click.stop="activeFloatingTab = 'obstructions'">
                                            <i class="bi bi-list-ul"></i>
                                            <span>Obstructions ({{ filteredRoutePointsWithDistance.length }})</span>
                                        </button>
                                    </div>
                                </div>
                                <transition name="slide-down">
                                    <div v-show="!isObstructionPanelCollapsed" class="unified-panel-content">
                                        <!-- Summary Tab -->
                                        <div v-show="activeFloatingTab === 'summary'" class="tab-content">
                                            <div v-if="routeData" class="route-summary">
                                                <div v-if="routeData.distance" class="summary-item">
                                                    <strong>{{ t('totalDistance') }}:</strong>
                                                    <span>{{ formatDistance(routeData.distance, isImperial) }}</span>
                                                </div>
                                                <div class="summary-item">
                                                    <strong>{{ t('points') }}:</strong>
                                                    <span>{{ nonRoutePointsCount }}</span>
                                                </div>
                                                <div v-if="routeData.note" class="summary-item">
                                                    <strong>{{ t('notes') }}:</strong>
                                                    <span>{{ routeData.note }}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Screenshots Tab -->
                                        <div v-show="activeFloatingTab === 'screenshots'" class="tab-content">
                                            <div v-if="screenshots.length === 0" class="no-screenshots">
                                                <div class="text-center py-4">
                                                    <i class="bi bi-images text-muted" style="font-size: 2rem;"></i>
                                                    <p class="text-muted mt-2 small">No screenshots yet</p>
                                                </div>
                                            </div>
                                            <div v-else class="compact-screenshots-grid">
                                                <div v-for="screenshot in screenshots" :key="screenshot.id"
                                                    class="compact-screenshot-item">
                                                    <div class="compact-screenshot-card"
                                                        @click="viewScreenshot(screenshot)">
                                                        <div class="compact-screenshot-image">
                                                            <img :src="getScreenshotUrl(screenshot)"
                                                                :alt="'Screenshot ' + screenshot.id" />
                                                        </div>
                                                        <div class="compact-screenshot-info">
                                                            <div v-if="getScreenshotNote(screenshot)"
                                                                class="compact-screenshot-note">
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

                                        <!-- Obstructions Tab -->
                                        <div v-show="activeFloatingTab === 'obstructions'" class="tab-content">
                                            <div class="compact-obstructions-list">
                                                <div v-for="(point, index) in filteredRoutePointsWithDistance"
                                                    :key="`${point.id}-${index}`" class="compact-obstruction-item"
                                                    :class="{ active: selectedMarker?.index === routePoints.findIndex(p => p.id === point.id) }"
                                                    @click="selectMarker(routePoints.findIndex(p => p.id === point.id))"
                                                    @dblclick="openPointInfo(point)">
                                                    <div class="compact-obstruction-icon">
                                                        <img v-if="point.type === 'bridge'" width="16" height="16"
                                                            src="@/assets/img/bridge.png">
                                                        <img v-else-if="point.type === 'powerline'" width="16"
                                                            height="16"
                                                            src="@/assets/img/electric-tower_old_delete.png">
                                                        <img v-else-if="point.type === 'intersection'" width="16"
                                                            height="16" src="@/assets/img/intersection.png">
                                                        <img v-else-if="point.type === 'road'" width="16" height="16"
                                                            src="@/assets/img/road.png">
                                                        <img v-else-if="point.type === 'overhead'" width="16"
                                                            height="16" src="@/assets/img/overhead.png">
                                                        <i v-else-if="point.type === 'railroad'" class="fas fa-train"
                                                            style="font-size: 12px;"></i>
                                                        <i v-else-if="point.type === 'custom'"
                                                            class="far fa-question-circle" style="font-size: 12px;"></i>
                                                        <i v-else class="bi bi-geo-alt" style="font-size: 12px;"></i>
                                                    </div>
                                                    <div class="compact-obstruction-info">
                                                        <div class="compact-obstruction-name">{{
                                                            getPointTypeLabel(point.type) }}</div>
                                                        <div class="compact-obstruction-details">
                                                            <span class="compact-distance">{{
                                                                calculateDistanceFromStart(point)
                                                                }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </transition>
                            </div>

                        </div>

                        <!-- List View -->
                        <div v-if="viewMode === 'list'" class="list-view">
                            <div class="list-header">
                                <h4>Route Points ({{ nonRoutePointsCount }})</h4>
                            </div>
                            <div class="points-list">
                                <ListItem v-for="(point, index) in filteredRoutePoints" :key="`${point.id}-${index}`"
                                    :title="getPointTypeLabel(point.type)"
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
                                            <i v-else-if="point.type === 'custom'" class="far fa-question-circle"></i>
                                            <i v-else class="bi bi-geo-alt"></i>
                                        </div>
                                    </template>
                                </ListItem>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BasePanel>

        <!-- Right Sidebar - Points List (Replaced by floating obstruction panel) -->
        <!-- <div class="right-sidebar" :class="{ 'collapsed': isSidebarCollapsed, 'expanded': isSidebarExpanded }">
            <button v-if="isSidebarCollapsed" class="sidebar-toggle-btn sidebar-collapsed" @click="toggleSidebar"
                title="Expand sidebar">
                <i class="bi bi-chevron-right"></i>
            </button>
            <BaseCard v-show="!isSidebarCollapsed" variant="default" class="sidebar-card">
                <template #header>
                    <div class="sidebar-header-content">
                        <h3 class="sidebar-title">Route Points</h3>
                        <div class="sidebar-header-actions">
                            <button class="sidebar-expand-btn" @click="toggleSidebarExpanded"
                                :title="isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar to full width'">
                                <i
                                    :class="isSidebarExpanded ? 'bi bi-arrows-angle-contract' : 'bi bi-arrows-angle-expand'"></i>
                            </button>
                            <button class="sidebar-close-btn" @click="toggleSidebar" title="Close sidebar">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>
                </template>

                <div class="points-list-content">
                    <div class="route-point start-point" v-if="routeData"
                        :class="{ active: selectedMarker?.index === 0 }" @click="selectMarker(0)">
                        <div class="point-indicator start"></div>
                        <div class="point-info">
                            <div class="point-label">Start Point</div>
                            <div class="point-location text-left">{{ routeData.start || 'Start Location' }}</div>
                        </div>
                    </div>

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
            </BaseCard>
        </div> -->

        <!-- Point Modal -->
        <BasePointForm :visible="showPointModal" :point="selectedMarker?.point" :is-edit="false"
            :is-imperial="currentUserData.imperial" :show-navigation="true" :has-previous="hasPreviousObstruction"
            :has-next="hasNextObstruction" @close="showPointModal = false" @save="onPointSave"
            @previous="navigateToPreviousObstruction" @next="navigateToNextObstruction" />

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
import { BaseCard, BaseButton, BasePanel, ListItem, BaseModal, BaseConfirmationModal } from '@/components/ui';
import { useI18n } from 'vue-i18n';
import { useSubscription } from "@/composables/subscription/useSubscription";
import { useRouter } from 'vue-router';
import routeUtils from '@/utils/route_utils';
import { useAuthStore } from '@/stores/auth';

const { checkFeatureAccess, getData: getSubscriptionData } = useSubscription();
const { t } = useI18n();

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
const selectedSegment = ref(null);
const hoveredSegment = ref(null);

// Marker state for highlighting
const selectedMarker = ref(null);

// Mouse position for popup positioning
const mousePosition = ref({ x: 0, y: 0 });

// Context menu state
const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    targetType: null, // 'segment', 'marker'
    targetIndex: null,
    clickLatLng: null, // Store the clicked coordinates for inserting points
});

// Loading state for snapping


// Computed properties
const routePath = computed(() => {
    const validPoints = routePoints.value
        .filter(point =>
            point.lat && point.lng &&
            !isNaN(point.lat) && !isNaN(point.lng) &&
            point.lat >= -90 && point.lat <= 90 &&
            point.lng >= -180 && point.lng <= 180
        );

    // Only return path if we have at least 2 valid points
    if (validPoints.length < 2) {
        return [];
    }

    const path = validPoints.map(point => [point.lat, point.lng]);
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

// Computed properties for navigation
const currentObstructionIndex = computed(() => {
    if (!selectedMarker.value || !selectedMarker.value.point) return -1;
    return filteredRoutePointsWithDistance.value.findIndex(p => p.id === selectedMarker.value.point.id);
});

const hasPreviousObstruction = computed(() => {
    return currentObstructionIndex.value > 0;
});

const hasNextObstruction = computed(() => {
    return currentObstructionIndex.value >= 0 && currentObstructionIndex.value < filteredRoutePointsWithDistance.value.length - 1;
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

        // Showing markers based on viewport and performance limits
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
        // Component health is critical, showing minimal route points
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

    // Calculate segments between non-route points

    for (let i = 0; i < nonRoutePoints.length - 1; i++) {
        const currentPoint = nonRoutePoints[i];
        const nextPoint = nonRoutePoints[i + 1];

        // Find the indices of these points in the full routePoints array
        const currentIndex = routePoints.value.findIndex(p => p.id === currentPoint.id);
        const nextIndex = routePoints.value.findIndex(p => p.id === nextPoint.id);

        // Process segment

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

    // Segment calculation complete

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

            // Route points loaded

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



// Map functionality now handled by RouteMapViewer component

// Map control functions now handled by RouteMapViewer component



// Segment methods












// Action methods



// Title and notes editing functions


// Screenshot functions




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





// Initialize with first point selected
// Mobile map resize handler
const handleMobileResize = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
        setTimeout(() => {
            mapRef.value.leafletObject.invalidateSize();
            // Map resized for mobile
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
    height: 100%;
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
    padding: var(--spacing-sm);
    max-height: calc(90vh - 200px);
    overflow-y: auto;
}

.route-point {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    border-radius: var(--radius-md);
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
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    border-radius: var(--radius-md);
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
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: var(--radius-md);
    margin-right: var(--spacing-sm);
    color: var(--text-secondary);
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
    margin-bottom: var(--spacing-2xs);
    font-size: var(--font-size-sm);
    text-align: left;
}

.obstruction-details {
    display: flex;
    gap: var(--spacing-sm);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-2xs);
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
    width: 100%;
    height: 100%;
}

.center-content :deep(.base-panel) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
}

.map-container {
    flex: 1;
    min-height: 300px;
    height: 100%;
    width: 100%;
    position: relative;
    background: var(--bg-elevated);

    /* border-radius: var(--radius-md); */
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
}

/* Floating Route Summary Panel */
.floating-route-summary {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: calc(100% - 2rem);
    max-width: 600px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-elevated);
}

.floating-route-summary.expanded {
    z-index: 1002;
}

.route-summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-bottom: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
    gap: 0.75rem;
}

.route-summary-header:hover {
    background: var(--bg-surface);
}

.summary-header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
}

.summary-toggle-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
    border-radius: var(--radius-sm);
}

.summary-toggle-btn:hover {
    color: var(--accent);
    background: var(--bg-elevated);
}

.summary-toggle-btn i {
    font-size: 16px;
}

.summary-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.route-summary {
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 0 0 8px 8px;
    border: 1px solid var(--border);
    border-top: none;
}

.summary-item {
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.summary-item:last-child {
    margin-bottom: 0;
}

.summary-item strong {
    color: var(--text-secondary);
    font-weight: 600;
    flex-shrink: 0;
}

.summary-item span {
    color: var(--text-primary);
    text-align: right;
    word-break: break-word;
}

/* Slide down animation for summary panel */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease;
    max-height: 1000px;
    overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
}

/* Unified Floating Panel with Tabs */
.floating-unified-panel {
    position: absolute;
    top: 3.5rem;
    right: 10px;
    z-index: 1000;
    width: 260px;
    max-width: calc(100% - 2rem);
    max-height: calc(100% - 5rem);
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-elevated);
    display: flex;
    flex-direction: column;
}

.floating-unified-panel.expanded {
    z-index: 1002;
}

.floating-unified-panel.collapsed {
    width: auto;
    min-width: 180px;
}

.unified-panel-header {
    display: flex;
    flex-direction: column;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-bottom: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
}

.unified-panel-header:hover {
    background: var(--bg-surface);
}

.unified-panel-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
}

.title-text {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    cursor: pointer;
}

.title-distance {
    color: var(--text-secondary);
    font-weight: 500;
}

.unified-panel-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border);
    border-top: 1px solid var(--border);
    overflow: auto hidden;
    scrollbar-width: thin;
    scrollbar-color: var(--text-secondary) transparent;
    -webkit-overflow-scrolling: touch;
}

.unified-panel-tabs::-webkit-scrollbar {
    height: 4px;
}

.unified-panel-tabs::-webkit-scrollbar-track {
    background: transparent;
}

.unified-panel-tabs::-webkit-scrollbar-thumb {
    background-color: var(--text-secondary);
    border-radius: var(--radius-sm);
}

.unified-panel-tabs::-webkit-scrollbar-thumb:hover {
    background-color: var(--text-primary);
}

.unified-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: fit-content;
}

.unified-tab i {
    font-size: 12px;
    flex-shrink: 0;
}

.unified-tab span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.unified-tab:hover {
    background: var(--bg-surface);
    color: var(--text-primary);
}

.unified-tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
    background: var(--bg-surface);
}

.unified-toggle-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
}

.unified-toggle-btn:hover {
    color: var(--accent);
    background: var(--bg-elevated);
}

.unified-toggle-btn i {
    font-size: 14px;
}

.unified-panel-content {
    background: var(--bg-elevated);
    border-radius: 0 0 8px 8px;
    border: 1px solid var(--border);
    border-top: none;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
}

.tab-content {
    padding: 0.5rem;
}

.tab-content .route-summary {
    padding: 0;
}

.tab-content .summary-item {
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    font-size: 13px;
}

.tab-content .summary-item:last-child {
    margin-bottom: 0;
}

.tab-content .summary-item strong {
    color: var(--text-secondary);
    font-weight: 600;
    flex-shrink: 0;
    font-size: 12px;
}

.tab-content .summary-item span {
    color: var(--text-primary);
    text-align: right;
    word-break: break-word;
    font-size: 12px;
}

/* Compact Screenshots Grid for Tab */
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
}

.compact-screenshot-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
}

.compact-screenshot-card {
    cursor: pointer;
    display: flex;
    flex-direction: column;
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

.compact-obstructions-list {
    padding: 0.25rem;
}

.compact-obstruction-item {
    display: flex;
    align-items: center;
    padding: 0.375rem;
    margin-bottom: 0.25rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 1px solid transparent;
    background: var(--bg-surface);
}

.compact-obstruction-item:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    transform: translateX(-2px);
}

.compact-obstruction-item.active {
    background: rgb(0 167 225 / 10%);
    border-color: var(--accent);
}

.compact-obstruction-item:last-child {
    margin-bottom: 0;
}

.compact-obstruction-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: var(--radius-sm);
    margin-right: 0.5rem;
    color: var(--text-secondary);
    flex-shrink: 0;
}

/* Dark mode: grey background */
[data-bs-theme="dark"] .compact-obstruction-icon {
    background: #6c757d;
}

.compact-obstruction-item.active .compact-obstruction-icon {
    background: var(--accent);
    color: white;
}

.compact-obstruction-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.compact-obstruction-name {
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: 0.125rem;
    font-size: 13px;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.compact-obstruction-details {
    display: flex;
    gap: 0.5rem;
    font-size: 11px;
    color: var(--text-secondary);
}

.compact-distance {
    font-size: 11px;
    color: var(--text-secondary);
}

/* Adjust minimap position when floating unified panel is present */
.map-container:has(.floating-unified-panel) :deep(.minimap-container) {
    bottom: 1rem;
    right: 1rem;
}

/* Mobile styles for floating route summary and obstruction panel */
@media (width <= 768px) {
    .floating-route-summary {
        width: calc(100% - 1rem);
        max-width: none;
        bottom: 0.5rem;
    }

    .floating-unified-panel {
        width: calc(100% - 2rem);
        max-width: 240px;
        top: 3.5rem;
        right: 10px;
        max-height: calc(100% - 5rem);
    }

    .unified-tab {
        font-size: 10px;
        padding: 0.375rem;
    }

    .unified-tab i {
        font-size: 11px;
    }

    .map-container:has(.floating-unified-panel) :deep(.minimap-container) {
        bottom: 0.5rem;
        right: 0.5rem;
    }
}

@media (width <= 480px) {
    .floating-route-summary {
        width: calc(100% - 1rem);
        bottom: 0.5rem;
    }

    .floating-unified-panel {
        width: calc(100% - 1rem);
        max-width: none;
        top: 3.5rem;
        right: 10px;
        max-height: calc(100% - 5rem);
    }

    .unified-tab {
        font-size: 9px;
        padding: 0.375rem 0.25rem;
    }

    .unified-tab span {
        display: none;
    }

    .unified-tab.active span {
        display: inline;
    }

    .obstruction-panel-header {
        padding: 0.375rem 0.5rem;
    }

    .obstruction-panel-title {
        font-size: 12px;
    }

    .compact-obstruction-item {
        padding: 0.375rem;
    }

    .compact-obstruction-name {
        font-size: 12px;
    }

    .compact-obstruction-details {
        font-size: 10px;
    }

    .route-summary-header {
        padding: 0.5rem 0.75rem;
    }

    .summary-title {
        font-size: 14px;
    }

    .route-summary {
        padding: 0.75rem;
    }

    .map-container:has(.floating-unified-panel) :deep(.minimap-container) {
        bottom: 0.5rem;
        right: 0.5rem;
    }
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
    width: 500px;
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

.sidebar-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0%;
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


.sidebar-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0%;
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
}

.screenshot-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
    border-color: var(--accent);
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

.screenshots-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height var(--transition-slow);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-top: none;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.screenshots-content.expanded {
    max-height: 400px;
    overflow-y: auto;
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
        height: 100%;
    }

    .map-container {
        min-height: 400px;
    }
}

@media (width <= 1400px) {
    .right-sidebar {
        width: 450px;
    }

    .center-content {
        height: 100%;
    }
}

@media (width <= 1200px) {
    .right-sidebar {
        width: 400px;
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
        height: 100%;
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
        height: 100%;
        min-height: 350px;
    }

    .map-container {
        min-height: 300px;
    }

    .right-sidebar {
        width: 350px;
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

    .floating-route-summary {
        z-index: 1000;
        position: absolute;
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
    height: 100%;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

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
}
</style>