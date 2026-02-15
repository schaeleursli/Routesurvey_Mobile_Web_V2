<template>
    <div v-if="loading" class="loading-container">
        <BaseLoadingIndicator size="large" :message="t('pleaseWait')" />
    </div>
    <div v-else-if="error" class="error-container">
        <i class="bi bi-exclamation-triangle"></i>
        <h3>{{ t('error') }}</h3>
        <p>{{ error }}</p>
        <button @click="goBack" class="btn btn-primary">
            {{ t('goBack') }}
        </button>
    </div>
    <div v-else-if="plannedRoute" class="add-planned-route-new">
        <!-- Header -->
        <!-- <div class="route-viewer-header">
                <div class="row">
                    <div class="col-md-8 text-left">
                        <h5>{{ t('editPlannedRoute') }}</h5>
                        <p class="text-muted">{{ t('editPlannedRouteDesc') }}</p>
                    </div>
                </div>
            </div> -->

        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Center Content - Map and Form -->
            <div class="center-content" v-show="!isSidebarExpanded">
                <!-- Route Map Section -->
                <BasePanel :title="t('viewingPlannedRoute')" elevation="level2" :scrollable="false" class="main-panel">
                    <template #header>
                        <div class="header-actions-group">
                            <div class="save-indicator" v-if="lastSavedTime">
                                <span class="save-status saved">
                                    <i class="bi bi-check-circle"></i>
                                    {{ t('lastSaved') }}: {{ formatLastSavedTime(lastSavedTime) }}
                                </span>
                            </div>
                            <div class="header-action-buttons">
                                <BaseButton variant="primary" size="small" @click="handleStartSurvey" left-icon="bi bi-play-fill" class="mr-2">
                                    {{ t('startSurvey') || 'Start Survey' }}
                                </BaseButton>
                                <BaseButton variant="secondary" size="small" @click="handleEdit" left-icon="bi bi-pencil">
                                    {{ t('edit') }}
                                </BaseButton>
                            </div>
                        </div>
                    </template>

                    <div class="map-container">
                        <PlannedRouteMapRefactored ref="mapRef" v-model="routeData" :height="mapHeight" />
                    </div>
                </BasePanel>
            </div>

            <!-- Right Sidebar - Form and Route Information -->
            <div class="right-sidebar" :class="{ 'collapsed': isSidebarCollapsed, 'expanded': isSidebarExpanded }">
                <!-- Sidebar Toggle Button - Expand (center right when collapsed) -->
                <button v-if="isSidebarCollapsed" class="sidebar-toggle-btn sidebar-collapsed" @click="toggleSidebar"
                    title="Expand sidebar">
                    <i class="bi bi-chevron-left"></i>
                </button>
                <BaseCard v-show="!isSidebarCollapsed" variant="default" class="sidebar-card" :fixed-footer="true">
                    <template #header>
                        <div class="sidebar-header">
                            <div class="sidebar-header-content">
                                <h3 class="sidebar-title text-left">{{ t('routeInformation') }}</h3>
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
                            <div class="sidebar-header-separator"></div>
                            <!-- Tab Titles Container -->
                            <div class="sidebar-tabs-container">
                                <button v-for="tab in tabs" :key="tab.id" class="sidebar-tab"
                                    :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
                                    <i v-if="tab.icon" :class="tab.icon" class="sidebar-tab__icon"></i>
                                    <span>{{ tab.label }}</span>
                                </button>
                            </div>
                        </div>
                    </template>

                    <form @submit.prevent="handleSubmit" class="planned-route-form">
                        <!-- Tab Content Container -->
                        <div class="tab-content-container">
                            <!-- Route Summary Tab -->
                            <div v-if="activeTab === 'summary'" class="route-summary-section">
                                <div v-if="routeData.startPoint || routeData.endPoint || routeData.routeInfo || routeData.waypoints.length > 0"
                                    class="summary-content">
                                    <div v-if="routeData.startPoint || routeData.endPoint" class="summary-group">
                                        <h4 class="summary-group-title">{{ t('route') }}</h4>
                                        <div class="summary-items">
                                            <div v-if="routeData.startPoint" class="summary-item">
                                                <span class="summary-label">{{ t('startPoint') }}:</span>
                                                <span class="summary-value text-left">
                                                    <span
                                                        v-if="routeData.startPoint.loading && !hasLocationData(routeData.startPoint)"
                                                        class="loading-address">
                                                        <BaseLoadingIndicator size="small" inline />
                                                    </span>
                                                    <span v-else>{{ formatLocation(routeData.startPoint) ||
                                                        formatLocationShort(routeData.startPoint) }}</span>
                                                </span>
                                            </div>
                                            <div v-if="routeData.endPoint" class="summary-item">
                                                <span class="summary-label">{{ t('endPoint') }}:</span>
                                                <span class="summary-value text-left">
                                                    <span
                                                        v-if="routeData.endPoint.loading && !hasLocationData(routeData.endPoint)"
                                                        class="loading-address">
                                                        <BaseLoadingIndicator size="small" inline />
                                                    </span>
                                                    <span v-else>{{ formatLocation(routeData.endPoint) ||
                                                        formatLocationShort(routeData.endPoint) }}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="routeData.routeInfo || routeData.waypoints.length > 0"
                                        class="summary-group">
                                        <h4 class="summary-group-title">{{ t('statistics') }}</h4>
                                        <div class="summary-items">
                                            <div v-if="routeData.routeInfo && routeData.routeInfo.distance"
                                                class="summary-item">
                                                <span class="summary-label">{{ t('totalDistance') }}:</span>
                                                <span class="summary-value">{{
                                                    formatDistance(routeData.routeInfo.distance,
                                                        isImperial) }}</span>
                                            </div>
                                            <div v-if="routeData.routeInfo && routeData.routeInfo.duration"
                                                class="summary-item">
                                                <span class="summary-label">{{ t('estimatedTime') }}:</span>
                                                <span class="summary-value">{{ formatTime(routeData.routeInfo.duration)
                                                }}</span>
                                            </div>
                                            <div class="summary-item">
                                                <span class="summary-label">{{ t('waypoints') }}:</span>
                                                <span class="summary-value">{{ routeData.waypoints.length }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="no-route-data">
                                    <p class="text-muted">
                                        {{
                                            t('noRouteData')
                                            ||
                                            'No route data available. Draw a route on the map to see summary.'
                                        }}
                                    </p>
                                </div>
                            </div>
                            <!-- Survey Information Tab -->
                            <div v-if="activeTab === 'survey'" class="form-section">
                                <div class="form-group-compact">
                                    <input id="surveyName" v-model="form.SurveyName" type="text"
                                        :placeholder="t('enterSurveyName')" required class="form-control" disabled />
                                </div>

                                <div class="form-group-compact">
                                    <label for="surveyType" class="text-left">{{ t('surveyType') || 'Survey Type' }} *</label>
                                    <input id="surveyType" v-model="form.SurveyType" type="text"
                                        class="form-control" disabled />
                                </div>

                                <div class="form-group-compact">
                                    <label for="surveyDate" class="text-left">{{ t('surveyDate') }}</label>
                                    <input id="surveyDate" v-model="form.SurveyDate" type="date" required
                                        class="form-control" disabled />
                                </div>

                                <div class="form-group-compact">
                                    <label for="clientName" class="text-left">{{ t('clientName') }}</label>
                                    <input id="clientName" v-model="form.ClientName" type="text"
                                        :placeholder="t('enterClientName')" required class="form-control" disabled />
                                </div>

                                <div class="form-group-compact">
                                    <label for="surveyInstructions" class="text-left">{{ t('surveyInstructions')
                                    }}</label>
                                    <textarea id="surveyInstructions" v-model="form.SurveyInstructions"
                                        :placeholder="t('enterSurveyInstructions')" rows="3" required
                                        class="form-control" disabled></textarea>
                                </div>

                                <div class="form-group-compact">
                                    <label for="toolsUsed" class="text-left">{{ t('toolsUsed') || 'Tools Used' }}</label>
                                    <textarea id="toolsUsed" v-model="form.ToolsUsed"
                                        :placeholder="t('enterToolsUsed') || 'e.g. Laser Meter, Measuring Tape'" rows="2"
                                        class="form-control" disabled></textarea>
                                </div>
                            </div>

                            <!-- Cargo Information Tab -->
                            <div v-if="activeTab === 'cargo'" class="form-section">
                                <div class="form-group-compact">
                                    <label for="cargoType" class="text-left">{{ t('type') }}</label>
                                    <input id="cargoType" v-model="form.CargoType" type="text"
                                        :placeholder="t('enterType')" required class="form-control" disabled />
                                </div>

                                <div class="form-group-compact">
                                    <label for="cargoWeight" class="text-left">{{ t('weight') }}</label>
                                    <div class="input-group">
                                        <input id="cargoWeight" v-model="form.CargoWeight" type="number" step="any"
                                            :placeholder="t('enterWeight')" required class="form-control" disabled />
                                        <span class="input-group-text">{{ isImperial ? 'lbs' : 'kg' }}</span>
                                    </div>
                                </div>

                                <div class="form-group-separator">
                                    <span class="separator-label">{{ t('dimensions') || 'Dimensions' }}</span>
                                </div>

                                <div class="dimensions-group">
                                    <div class="form-group-compact dimension-field">
                                        <label for="cargoLength" class="text-left">{{ t('length') }}</label>
                                        <div class="input-group">
                                            <input id="cargoLength" v-model="form.CargoLength" type="number" step="any"
                                                :placeholder="t('enterLength')" required class="form-control"
                                                disabled />
                                            <span class="input-group-text">{{ isImperial ? 'ft' : 'm' }}</span>
                                        </div>
                                    </div>

                                    <div class="form-group-compact dimension-field">
                                        <label for="cargoWidth" class="text-left">{{ t('width') }}</label>
                                        <div class="input-group">
                                            <input id="cargoWidth" v-model="form.CargoWidth" type="number" step="any"
                                                :placeholder="t('enterWidth')" required class="form-control" disabled />
                                            <span class="input-group-text">{{ isImperial ? 'ft' : 'm' }}</span>
                                        </div>
                                    </div>

                                    <div class="form-group-compact dimension-field">
                                        <label for="cargoHeight" class="text-left">{{ t('height') }}</label>
                                        <div class="input-group">
                                            <input id="cargoHeight" v-model="form.CargoHeight" type="number" step="any"
                                                :placeholder="t('enterHeight')" required class="form-control"
                                                disabled />
                                            <span class="input-group-text">{{ isImperial ? 'ft' : 'm' }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group-compact">
                                    <label for="cargoNotes" class="text-left">{{ t('notes') }}</label>
                                    <textarea id="cargoNotes" v-model="form.CargoNotes" :placeholder="t('enterNotes')"
                                        rows="2" required class="form-control" disabled></textarea>
                                </div>
                            </div>

                            <!-- Trailer Information Tab -->
                            <div v-if="activeTab === 'trailer'" class="form-section">
                                <div class="form-group-compact">
                                    <label for="trailerType" class="text-left">{{ t('type') }}</label>
                                    <input id="trailerType" v-model="form.TrailerType" type="text"
                                        :placeholder="t('enterType')" required class="form-control" disabled />
                                </div>

                                <div class="form-group-compact">
                                    <label for="trailerLength" class="text-left">{{ t('length') }}</label>
                                    <div class="input-group">
                                        <input id="trailerLength" v-model="form.TrailerLength" type="number" step="any"
                                            :placeholder="t('enterLength')" required class="form-control" disabled />
                                        <span class="input-group-text">{{ isImperial ? 'ft' : 'm' }}</span>
                                    </div>
                                </div>

                                <div class="form-group-compact">
                                    <label for="trailerNotes" class="text-left">{{ t('notes') }}</label>
                                    <textarea id="trailerNotes" v-model="form.TrailerNotes"
                                        :placeholder="t('enterNotes')" rows="2" required class="form-control"
                                        disabled></textarea>
                                </div>
                            </div>

                            <!-- Prime Mover Information Tab -->
                            <div v-if="activeTab === 'prime_mover'" class="form-section">
                                <div class="form-group-compact">
                                    <label for="primeMoverType" class="text-left">{{ t('type') }}</label>
                                    <input id="primeMoverType" v-model="form.PrimeMoverType" type="text"
                                        :placeholder="t('enterType')" required class="form-control" disabled />
                                </div>

                                <div class="form-group-compact">
                                    <label for="primeMoverLength" class="text-left">{{ t('length') }}</label>
                                    <div class="input-group">
                                        <input id="primeMoverLength" v-model="form.PrimeMoverLength" type="number" step="any"
                                            :placeholder="t('enterLength')" required class="form-control" disabled />
                                        <span class="input-group-text">{{ isImperial ? 'ft' : 'm' }}</span>
                                    </div>
                                </div>

                                <div class="form-group-compact">
                                    <label for="primeMoverNotes" class="text-left">{{ t('notes') }}</label>
                                    <textarea id="primeMoverNotes" v-model="form.PrimeMoverNotes"
                                        :placeholder="t('enterNotes')" rows="2" required class="form-control"
                                        disabled></textarea>
                                </div>
                            </div>
                        </div>
                    </form>

                    <!-- <template #footer>
                        <div class="footer-actions">
                            <BaseButton variant="secondary" size="medium" @click="handleCancel">
                                {{ t('cancel') }}
                            </BaseButton>
                            <BaseButton variant="primary" size="medium" :disabled="isSubmitting" @click="handleSubmit"
                                :left-icon="isSubmitting ? 'fas fa-spinner fa-spin' : null">
                                {{ t('saveRoute') }}
                            </BaseButton>
                        </div>
                    </template> -->
                </BaseCard>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { usePlannedRoutes } from "@/composables/usePlannedRoutes";
import RoutesController from '@/controllers/routes/routes_controller';
import { useI18n } from "vue-i18n";
import PlannedRouteMapRefactored from "@/components/planned_routes/PlannedRouteMapRefactored.vue";
import { BasePanel, BaseCard, BaseButton, BaseLoadingIndicator } from "@/components/ui";
import { useAuthStore } from "@/stores/auth";
import { useSearchContext } from "@/composables/useSearchContext";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

const authStore = useAuthStore();
const { registerSearchContext, clearSearchContext } = useSearchContext();

const isImperial = ref(false);

const {
    fetchPlannedRoute,
    updatePlannedRoute,
    editForm,
    validateEditForm,
    clearEditForm,
    setEditFormData,
    loading,
    error,
    selectedPlannedRoute: plannedRoute
} = usePlannedRoutes();

const isSubmitting = ref(false);
const form = editForm;
const isSidebarCollapsed = ref(false); // Expanded by default
const isSidebarExpanded = ref(false); // Full width expanded state
const activeTab = ref('survey'); // Default to survey tab

// Tab configuration - matching ShareCenter style
const tabs = computed(() => [
    { id: 'summary', label: t('summary'), icon: 'bi bi-info-circle' },
    { id: 'survey', label: t('survey'), icon: 'bi bi-clipboard-data' },
    { id: 'cargo', label: t('cargo'), icon: 'bi bi-box-seam' },
    { id: 'trailer', label: t('trailer'), icon: 'bi bi-truck' },
    { id: 'prime_mover', label: t('primeMover') || 'Prime Mover', icon: 'bi bi-truck-front' }
]);

// Track last saved time
const lastSavedTime = ref(null);

// Route data from the map component
const routeData = ref({
    startPoint: null,
    endPoint: null,
    waypoints: [],
    routePath: [],
    routeInfo: null
});

// Map component reference
const mapRef = ref(null);

// Computed map height - full height of container
const mapHeight = computed(() => {
    return '100%';
});

// Computed
const canSave = computed(() => {
    return form.value.SurveyName.trim() &&
        form.value.SurveyDate &&
        form.value.ClientName.trim() &&
        form.value.SurveyInstructions.trim() &&
        form.value.CargoType.trim() &&
        form.value.CargoWeight &&
        form.value.CargoLength &&
        form.value.CargoWidth &&
        form.value.CargoHeight &&
        form.value.CargoNotes.trim() &&
        form.value.TrailerType.trim() &&
        form.value.TrailerLength &&
        form.value.TrailerNotes.trim() &&
        // form.value.PrimeMoverType.trim() && // Optional?
        // form.value.PrimeMoverLength && // Optional?
        // form.value.PrimeMoverNotes.trim() && // Optional?
        routeData.value.startPoint &&
        routeData.value.endPoint;
});

// Helper functions
const hasLocationData = (location) => {
    if (!location) return false;

    // Handle string format (legacy)
    if (typeof location === 'string') {
        return location.trim().length > 0;
    }

    // Handle object format
    if (typeof location === 'object') {
        // Check if address exists and has meaningful data
        if (location.address) {
            const addr = location.address.address || location.address;
            if (addr && (addr.road || addr.city || addr.state || addr.postcode)) {
                return true;
            }
        }
        // Check if lat/lng exists
        if (location.lat && location.lng) {
            return true;
        }
    }

    return false;
};

const formatLocation = (location) => {
    if (!location) return null;

    // Handle string format (legacy)
    if (typeof location === 'string') {
        return location;
    }

    // Handle object format with address information (new)
    if (typeof location === 'object') {
        // If we have address information from the map component
        if (location.address && location.address.display_name) {
            return location.address.display_name;
        }

        // If we have display_name directly
        if (location.display_name) {
            return location.display_name;
        }

        // Fallback to coordinates if no address available
        if (location.lat && location.lng) {
            return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
        }
    }

    return null;
};

const formatLocationShort = (location) => {
    if (!location) return '';

    // Handle string format (legacy)
    if (typeof location === 'string') {
        // Get first two parts of the address
        const parts = location.split(',').map(p => p.trim()).filter(p => p);
        return parts.slice(0, 2).join(', ') || location;
    }

    // Handle object format with address information (new)
    if (typeof location === 'object') {
        // If we have address information, try to get a short version
        if (location.address && location.address.display_name) {
            const parts = location.address.display_name.split(',').map(p => p.trim()).filter(p => p);
            return parts.slice(0, 2).join(', ') || location.address.display_name;
        }

        // If we have display_name directly
        if (location.display_name) {
            const parts = location.display_name.split(',').map(p => p.trim()).filter(p => p);
            return parts.slice(0, 2).join(', ') || location.display_name;
        }

        // Fallback to coordinates if no address available
        if (location.lat && location.lng) {
            return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        }
    }

    return '';
};

const formatDistance = (meters, isImperial) => {
    if (!meters) return '0' + (isImperial ? 'ft' : 'm');
    if (meters < 1000) {
        return `${(isImperial ? meters * 3.28084 : meters).toFixed(2)}${isImperial ? 'ft' : 'm'}`;
    } else {
        return `${(isImperial ? meters / 1609.34 : meters / 1000).toFixed(1)}${isImperial ? 'mi' : 'km'}`;
    }
};

const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
};

const formatLastSavedTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
        return t('justNow');
    } else if (diffMins < 60) {
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            hour: 'numeric',
            minute: '2-digit'
        });
    }
};

const getCurrentUserData = async () => {
    try {
        if (!authStore.user) {
             await authStore.fetchUserProfile();
        }
        isImperial.value = authStore.user?.imperial;
    } catch (error) {
        console.error('Error getting user data:', error);
    }
};

onMounted(async () => {
    getCurrentUserData();
    const routeId = route.params.id;
    if (routeId) {
        await fetchPlannedRoute(routeId);
        if (plannedRoute.value) {
            setEditFormData(plannedRoute.value);

            // Set last saved time from route data (use updated_at or created_at if available)
            if (plannedRoute.value.updated_at) {
                lastSavedTime.value = plannedRoute.value.updated_at;
            } else if (plannedRoute.value.created_at) {
                lastSavedTime.value = plannedRoute.value.created_at;
            }

            // Load route data if available
            if (plannedRoute.value.RouteData) {
                // Extract coordinates from RouteData for map display
                let startPointData = null;
                let endPointData = null;

                // Try to get coordinates from route path
                if (plannedRoute.value.RouteData.routePath && plannedRoute.value.RouteData.routePath.length > 0) {
                    const routePath = plannedRoute.value.RouteData.routePath;
                    // First point is start, last point is end
                    if (routePath.length > 0) {
                        startPointData = {
                            lat: routePath[0][0],
                            lng: routePath[0][1],
                            display_name: plannedRoute.value.SurveyStart
                        };
                    }
                    if (routePath.length > 1) {
                        endPointData = {
                            lat: routePath[routePath.length - 1][0],
                            lng: routePath[routePath.length - 1][1],
                            display_name: plannedRoute.value.SurveyEnd
                        };
                    }
                }

                // Fallback to string format if no coordinates found
                if (!startPointData) {
                    startPointData = typeof plannedRoute.value.SurveyStart === 'string'
                        ? { display_name: plannedRoute.value.SurveyStart }
                        : plannedRoute.value.SurveyStart;
                }
                if (!endPointData) {
                    endPointData = typeof plannedRoute.value.SurveyEnd === 'string'
                        ? { display_name: plannedRoute.value.SurveyEnd }
                        : plannedRoute.value.SurveyEnd;
                }

                routeData.value = {
                    startPoint: startPointData,
                    endPoint: endPointData,
                    waypoints: plannedRoute.value.RouteData.waypoints || [],
                    routePath: plannedRoute.value.RouteData.routePath || [],
                    routeInfo: plannedRoute.value.RouteData.routeInfo || null,
                    pois: plannedRoute.value.RouteData.pois || []
                };
            } else {
                // Handle legacy data format
                routeData.value = {
                    startPoint: typeof plannedRoute.value.SurveyStart === 'string'
                        ? { display_name: plannedRoute.value.SurveyStart }
                        : plannedRoute.value.SurveyStart,
                    endPoint: typeof plannedRoute.value.SurveyEnd === 'string'
                        ? { display_name: plannedRoute.value.SurveyEnd }
                        : plannedRoute.value.SurveyEnd,
                    waypoints: [],
                    routePath: [],
                    routeInfo: null,
                    pois: []
                };
            }

            // The map component's watcher will handle centering/preserving zoom automatically
        }
    }

    // Register search context
    registerSearchContext('Planned Route', async (query) => {
        if (!plannedRoute.value) return [];
        const q = query.toLowerCase();
        const results = [];
        const p = editForm.value; // Access the form data which holds the display values

        // Search in Form Fields (Navigates to Tab)
        
        // Cargo
        if (p.CargoType?.toLowerCase().includes(q) || 
            p.CargoNotes?.toLowerCase().includes(q) || 
            q.includes('cargo')) {
            results.push({
                title: 'Cargo Information',
                description: `${p.CargoType} - ${p.CargoWeight} ${isImperial.value ? 'lbs' : 'kg'}`,
                type: 'action',
                action: () => { activeTab.value = 'cargo'; if(isSidebarCollapsed.value) toggleSidebar(); }
            });
        }

        // Trailer
        if (p.TrailerType?.toLowerCase().includes(q) || 
            p.TrailerNotes?.toLowerCase().includes(q) || 
            q.includes('trailer')) {
            results.push({
                title: 'Trailer Information',
                description: `${p.TrailerType}`,
                type: 'action',
                action: () => { activeTab.value = 'trailer'; if(isSidebarCollapsed.value) toggleSidebar(); }
            });
        }

        // Client / Survey Info
        if (p.ClientName?.toLowerCase().includes(q) || 
            p.SurveyName?.toLowerCase().includes(q) || 
            q.includes('survey')) {
            results.push({
                title: 'Survey Details',
                description: `${p.SurveyName} - ${p.ClientName}`,
                type: 'action',
                action: () => { activeTab.value = 'survey'; if(isSidebarCollapsed.value) toggleSidebar(); }
            });
        }

        // Start/End Points
        if (routeData.value.startPoint) {
            const startStr = formatLocation(routeData.value.startPoint);
            if (startStr && startStr.toLowerCase().includes(q)) {
                 results.push({
                    title: 'Start Point',
                    description: startStr,
                    type: 'action', // Just show info or pan map?
                    action: () => { 
                         // Logic to pan map to start point could go here if mapRef exposed it
                         activeTab.value = 'summary'; 
                    }
                });
            }
        }
        
        return results;
    }, 'bi-map');
});

onUnmounted(() => {
    clearSearchContext();
});

const handleSubmit = async () => {
    const validation = validateEditForm();
    if (!validation.valid) {
        showMessage({ status: 'error', message: validation.message });
        return;
    }

    if (!routeData.value.startPoint || !routeData.value.endPoint) {
        showMessage({ status: 'error', message: t('pleaseSelectStartAndEndPoints') });
        return;
    }

    isSubmitting.value = true;
    setGlobalLoading(true);

    try {
        // Prepare the form data with route information
        const submitData = {
            ...form.value,
            SurveyStart: formatLocation(routeData.value.startPoint),
            SurveyEnd: formatLocation(routeData.value.endPoint),
            RouteData: {
                waypoints: routeData.value.waypoints,
                routePath: routeData.value.routePath,
                routeInfo: routeData.value.routeInfo,
                pois: routeData.value.pois || []
            }
        };

        const res = await updatePlannedRoute(route.params.id, submitData);

        if (res.success) {
            showMessage({ status: 'success', message: t('plannedRouteUpdatedSuccessfully') });
            router.push('/plan-route');
        } else {
            showMessage({ status: 'error', message: res.message });
        }
    } catch (error) {
        console.error(error);
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    } finally {
        isSubmitting.value = false;
        setGlobalLoading(false);
    }
};

const goBack = () => {
    // Navigate to Planned Routes List
    router.push('/plan-route');
};

const handleEdit = () => {
    router.push({
        path: `/planned-routes/${route.params.id}/edit`,
        replace: true
    });
};

const handleStartSurvey = async () => {
    if (!plannedRoute.value || !routeData.value.startPoint || !routeData.value.endPoint) {
        showMessage({ status: 'error', message: t('incompleteRouteData') || 'Incomplete route data' });
        return;
    }

    setGlobalLoading(true);
    
    try {
        // Prepare route points from route path
        const pointsData = routeData.value.routePath.map(p => ({
            Lat: p[0],
            Lng: p[1],
            Alt: 0,
            Head: 0,
            Distance: 0,
            Type: 'route_point',
            Data: "",
            DateAdded: new Date().toISOString()
        }));

        // Include waypoints as specific points if possible, but routePath usually covers the geometry
        // Waypoints are already integrated into the calculated routePath geometry.

        const submitData = {
            Title: form.value.SurveyName,
            Note: form.value.SurveyInstructions || '',
            Start: formatLocation(routeData.value.startPoint),
            End: formatLocation(routeData.value.endPoint),
            Distance: routeData.value.routeInfo?.distance || 0,
            Points: pointsData.length,
            PointsData: pointsData,
            // Pass additional metadata if supported by backend, otherwise they might be lost
            // or stored in a JSON field if the backend supports it.
            // For now, appending to Note if critical, or passing as is.
            Cargo: {
                type: form.value.CargoType,
                weight: form.value.CargoWeight,
                length: form.value.CargoLength,
                width: form.value.CargoWidth,
                height: form.value.CargoHeight,
                notes: form.value.CargoNotes
            },
            Trailer: {
                type: form.value.TrailerType,
                length: form.value.TrailerLength,
                notes: form.value.TrailerNotes
            }
        };

        const res = await RoutesController.addRoute(submitData);

        if (res.result) {
            showMessage({ status: 'success', message: t('surveyStarted') || 'Survey started' });
            // Navigate to the newly created route
            router.push({
                name: 'SurveyExecution',
                params: { id: res.data.id || res.data.Id } // Handle case sensitivity
            });
        } else {
            showMessage({ status: 'error', message: res.message || t('failedToStartSurvey') });
        }
    } catch (error) {
        console.error('Error starting survey:', error);
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    } finally {
        setGlobalLoading(false);
    }
};

const handleCancel = () => {
    // Navigate to Planned Routes List
    router.push('/plan-route');
};

const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    // Reset expanded state when closing
    if (isSidebarCollapsed.value) {
        isSidebarExpanded.value = false;
    }
};

const toggleSidebarExpanded = () => {
    isSidebarExpanded.value = !isSidebarExpanded.value;
};

</script>

<style scoped>
.add-planned-route-new {
    min-height: 100%;
    display: flex;
    flex-direction: column;

    /* background-color: var(--bg-base); */
    color: var(--text-primary);
    overflow-y: auto;
    scrollbar-width: none;

    /* Firefox */
    -ms-overflow-style: none;

    /* Internet Explorer 10+ */
}

.add-planned-route-new::-webkit-scrollbar {
    display: none;

    /* WebKit */
}

.main-content {
    flex: 1;
    display: flex;
    gap: 1rem;
    padding: 1rem;
    min-height: 0;
    position: relative;
}

.center-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0;
    overflow: hidden;
    max-height: calc(100vh - 120px);
    min-height: 0;
}

.center-content :deep(.base-panel) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.center-content :deep(.base-panel__content) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0;
}

.center-content :deep(.base-panel__header) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.center-content :deep(.base-panel__header-main) {
    margin-bottom: 0;
    flex: 1;
}

/* Compact header styling matching RouteViewerNewWithOverlay.vue */
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
    padding: 0;
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
    border-radius: 6px 0 0 6px;
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

.sidebar-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.sidebar-header-separator {
    height: 1px;
    background: var(--border);
    margin: 0;
    padding: 0;
    width: 100%;
}

/* Tab Titles Container - separate from content */
.sidebar-tabs-container {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    scrollbar-width: none;

    /* Firefox */
    -ms-overflow-style: none;

    /* Internet Explorer 10+ */
    -webkit-overflow-scrolling: touch;
    margin: 0;
    padding: 0;
    width: 100%;
    justify-content: center;
}

.sidebar-tabs-container::-webkit-scrollbar {
    display: none;

    /* WebKit */
}

.sidebar-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    background: none;
    border: none;
    border-radius: 0;
    cursor: pointer;
    transition: all var(--transition-normal);
    white-space: nowrap;
    min-width: fit-content;
    position: relative;
    flex-shrink: 0;
    line-height: 1.2;
    text-align: center;
    margin: 0;
}

.sidebar-tab:not(.active):hover {
    background: var(--bg-elevated);
    color: var(--accent);
}

.sidebar-tab.active {
    background: var(--bg-surface);
    color: var(--accent);
    border-bottom: 2px solid var(--accent);
}

.sidebar-tab__icon {
    font-size: var(--font-size-xs);
    line-height: 1.2;
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
    border-radius: 4px;
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
    border-radius: 4px;
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

/* Ensure proper scrolling and hover behavior */
.right-sidebar .sidebar-card {
    position: relative;
    z-index: 1;
}

/* Remove outer spacing from sidebar card header */
.right-sidebar .sidebar-card :deep(.base-card__header) {
    padding: 0.5rem 0 0;
}

/* Compact sidebar header top */
.right-sidebar .sidebar-header-content {
    padding: 0.5rem 0.75rem 0;
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
    padding-top: 0;
}

.sidebar-title {
    margin: 0;
    margin-bottom: var(--spacing-xs);
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

.map-container {
    height: 100%;
    min-height: 600px;
    position: relative;
    background: var(--bg-elevated);

    /* border-radius: 8px; */
    border: 1px solid var(--border);
    overflow: hidden;
}

.map-container :deep(.leaflet-container) {
    height: 100% !important;
    width: 100% !important;

    /* border-radius: 8px; */
}

.map-container :deep(.leaflet-map-pane),
.map-container :deep(.leaflet-tile-pane),
.map-container :deep(.leaflet-overlay-pane) {
    border-radius: 8px;
}

.map-container :deep(.leaflet-control-container) {
    border-radius: 8px;
}

.planned-route-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    min-height: 0;
    flex: 1;
    padding: 0;
    margin: 0;
}

/* Tab Content Container - separate from tabs, with minimal padding */
.tab-content-container {
    flex: 1;
    min-height: 0;
    overflow: hidden auto;
    display: flex;
    flex-direction: column;
    -webkit-overflow-scrolling: touch;
    padding: 0.75rem;
}

/* Route Summary Section */
.route-summary-section {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.summary-content {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.summary-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
}

.summary-group:last-child {
    margin-bottom: 0;
}

.summary-group-title {
    margin: 0;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    text-align: left;
    padding-bottom: 0.25rem;
    letter-spacing: var(--letter-spacing-normal);
    text-transform: uppercase;
}

.summary-items {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.375rem 0;
    border-bottom: 1px solid var(--border);
    font-size: var(--font-size-sm);
    gap: var(--spacing-sm);
}

.summary-item:last-child {
    border-bottom: none;
}

.summary-label {
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
    flex-shrink: 0;
}

.summary-value {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    text-align: right;
    word-break: break-word;
    flex: 1;
}

.summary-value,
.summary-value span {
    color: var(--text-secondary);
}

.summary-value.text-left {
    text-align: left;
}

.no-route-data {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    text-align: center;
}

.no-route-data .text-muted {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.loading-address {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}


.form-section {
    margin-bottom: 0.75rem;
}

.form-section:last-child {
    margin-bottom: 0;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
}

.form-group:last-child {
    margin-bottom: 0;
}

/* Compact form group styling */
.form-group-compact {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.form-group-compact:last-child {
    margin-bottom: 0;
}

/* Form group separator for logical grouping */
.form-group-separator {
    margin: 0.75rem 0 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border);
}

.form-group-separator .separator-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Dimensions group - inline layout */
.dimensions-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.dimensions-group .dimension-field {
    flex: 1;
    margin-bottom: 0;
    min-width: 0;
}

.dimensions-group .dimension-field:last-child {
    margin-bottom: 0;
}

.form-group label,
.form-group-compact label {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 12px;
    letter-spacing: 0.2%;
    margin-bottom: 0;
}

.form-control {
    width: 100%;
    padding: 0.375rem 0.625rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 13px;
    font-weight: 400;
    background: var(--bg-surface);
    color: var(--text-primary);
    transition: all 0.2s ease;
    line-height: 1.4;
}

.form-control:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgb(0 167 225 / 10%);
}

.form-control::placeholder {
    color: var(--text-secondary);
}

.input-group {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
}

.input-group .form-control {
    flex: 1;
    width: auto;
    min-width: 0;
    border-radius: 4px 0 0 4px;
    border-right: none;
}

.input-group-text {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem 0.625rem;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-left: none;
    border-radius: 0 4px 4px 0;
    white-space: nowrap;
    flex-shrink: 0;
    text-transform: uppercase;
}

.input-group .form-control:focus {
    border-right: none;
}

.input-group .form-control:focus+.input-group-text {
    border-color: var(--accent);
}


.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
}

.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
    color: var(--text-secondary);
}

.error-container i {
    font-size: 48px;
    margin-bottom: 16px;
    color: var(--error);
}

.error-container h3 {
    margin: 0 0 8px;
    color: var(--text-primary);
}

.error-container p {
    margin: 0 0 20px;
    max-width: 400px;
}

/* Responsive design */

/* Responsive design */
@media (width <= 1400px) {
    .right-sidebar {
        width: 350px;
    }
}

@media (width <= 1200px) {
    .right-sidebar {
        width: 320px;
    }
}

/* Enhanced responsive design for tablets */
@media (width <= 1024px) {
    .right-sidebar {
        width: 300px;
    }
}

@media (width <= 992px) {
    .main-content {
        flex-direction: column;
        padding: 0.5rem;
        gap: 1rem;
    }

    .center-content {
        margin: 0;
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

    .center-content :deep(.base-panel__header) {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .center-content :deep(.base-panel__header-main) {
        width: 100%;
    }

    .center-content :deep(.base-panel__actions-view) {
        margin-left: 0;
        width: 100%;
        justify-content: flex-start;
    }

    .sidebar-toggle-btn {
        display: none;
    }

    .right-sidebar {
        width: 100% !important;
        height: auto;
        max-height: none;
        margin: 0;
        overflow-y: auto;
        scrollbar-width: none;

        /* Firefox */
        -ms-overflow-style: none;

        /* Internet Explorer 10+ */
    }

    .right-sidebar.collapsed {
        width: 100% !important;
    }

    .right-sidebar .sidebar-card {
        display: block !important;
    }

    .right-sidebar::-webkit-scrollbar {
        display: none;

        /* WebKit */
    }

    .footer-actions {
        flex-direction: column;
        gap: 0.75rem;
    }

    .form-section {
        margin-bottom: 1rem;
    }

    .map-container {
        height: 400px;
        min-height: 300px;
    }

    /* Stack dimensions vertically on tablets */
    .dimensions-group {
        flex-direction: column;
        gap: 0.5rem;
    }
}

@media (width <= 768px) {
    .add-planned-route-new {
        height: auto;
        min-height: 100vh;
    }

    .main-content {
        padding: 0.5rem;
        gap: 0.75rem;
    }

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

    .center-content :deep(.base-panel__header) {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .center-content :deep(.base-panel__header-main) {
        width: 100%;
    }

    .center-content :deep(.base-panel__actions-view) {
        margin-left: 0;
        width: 100%;
        justify-content: flex-start;
    }

    .sidebar-toggle-btn {
        display: none;
    }

    .map-container {
        height: 300px;
        min-height: 250px;
    }

    .main-panel {
        margin: 0.5rem;
        max-width: calc(100% - 1rem);
        width: calc(100% - 1rem);
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

    .right-sidebar::-webkit-scrollbar {
        display: none;

        /* WebKit */
    }

    .footer-actions {
        flex-direction: column;
        gap: 0.75rem;
    }

    .form-section {
        margin-bottom: 1rem;
    }

    .form-group {
        margin-bottom: 0.625rem;
    }

    .form-control {
        padding: 0.5rem 0.75rem;
        font-size: 14px;
    }

    /* Stack dimensions vertically on small screens */
    .dimensions-group {
        flex-direction: column;
        gap: 0.5rem;
    }
}

/* Save Status Indicator - Compact style matching RouteViewerNewWithOverlay.vue */
.save-indicator {
    display: flex;
    align-items: center;
    gap: 0.375rem;
}

.save-status {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 12px;
    font-weight: 500;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.save-status.saved {
    color: #4caf50;
    background: rgb(76 175 80 / 10%);
}

.save-status i {
    font-size: 11px;
}
</style>