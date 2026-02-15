<template>
    <div class="add-planned-route-new" ref="containerRef" @mouseup="stopResizing" @mouseleave="stopResizing">
        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Center Content - Map and Form -->
            <div class="center-content" v-show="!isSidebarExpanded" :style="centerContentStyle">
                <!-- Route Map Section -->
                <BasePanel :title="t('plannedRoute')" elevation="level2" :scrollable="false" class="main-panel map-panel-polish">
                    <template #header>
                        <div class="header-actions-group">
                            <div class="header-action-buttons">
                                <BaseButton variant="primary" size="small" :disabled="!canSave || isSubmitting"
                                    @click="handleSubmit"
                                    :left-icon="isSubmitting ? 'fas fa-spinner fa-spin' : 'bi bi-save'">
                                    {{ t('saveRoute') }}
                                </BaseButton>
                            </div>
                        </div>
                    </template>
                    <div class="map-container">
                        <PlannedRouteMapRefactored v-model="routeData" :height="mapHeight" :editing="true" />
                    </div>
                </BasePanel>
            </div>


            <!-- Drag Handle -->
            <div class="resize-handle" v-show="!isSidebarExpanded && !isSidebarCollapsed"
                 @mousedown="startResizing">
                <div class="resize-handle-line"></div>
            </div>

            <!-- Right Sidebar - Form and Route Information -->
            <div class="right-sidebar" :class="{ 'collapsed': isSidebarCollapsed, 'expanded': isSidebarExpanded }" :style="sidebarStyle">
                <!-- Sidebar Toggle Button - Expand (center right when collapsed) -->
                <button v-if="isSidebarCollapsed" class="sidebar-toggle-btn sidebar-collapsed" @click="toggleSidebar"
                    title="Expand sidebar">
                    <i class="bi bi-chevron-left"></i>
                </button>
                <BaseCard v-show="!isSidebarCollapsed" variant="default" class="sidebar-card sidebar-panel-polish" :fixed-footer="true">
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
                                    <label for="surveyName" class="text-left">{{ t('surveyName') }} *</label>
                                    <input id="surveyName" v-model="form.SurveyName" type="text"
                                        :placeholder="t('enterSurveyName')" required class="form-control" />
                                </div>

                                <div class="form-group-compact">
                                    <label for="surveyType" class="text-left">{{ t('surveyType') || 'Survey Type' }} *</label>
                                    <select id="surveyType" v-model="form.SurveyType" class="form-control select-input">
                                        <option value="Route Survey">Route Survey</option>
                                        <option value="Swept Path Analysis">Swept Path Analysis</option>
                                        <option value="Desktop Study">Desktop Study</option>
                                    </select>
                                </div>

                                <div class="form-group-compact">
                                    <BaseDatePicker v-model="form.SurveyDate" :label="t('surveyDate')"
                                        :placeholder="t('selectDate')" />
                                </div>

                                <div class="form-group-compact">
                                    <label for="clientName" class="text-left">{{ t('clientName') }}</label>
                                    <input id="clientName" v-model="form.ClientName" type="text"
                                        :placeholder="t('enterClientName')" required class="form-control" />
                                </div>
                                <div class="form-group-compact">
                                    <label for="surveyInstructions" class="text-left">{{ t('surveyInstructions') }}</label>
                                    <textarea id="surveyInstructions" v-model="form.SurveyInstructions"
                                        :placeholder="t('enterSurveyInstructions')" rows="3" required
                                        class="form-control"></textarea>
                                </div>

                                <div class="form-group-compact">
                                    <label for="toolsUsed" class="text-left">{{ t('toolsUsed') || 'Tools Used' }}</label>
                                    <textarea id="toolsUsed" v-model="form.ToolsUsed"
                                        :placeholder="t('enterToolsUsed') || 'e.g. Laser Meter, Measuring Tape'" rows="2"
                                        class="form-control"></textarea>
                                </div>
                            </div>

                            <!-- Cargo Information Tab -->
                            <div v-if="activeTab === 'cargo'" class="form-section">
                                <div class="form-group-compact">
                                    <label for="cargoType" class="text-left">{{ t('type') }}</label>
                                    <input id="cargoType" v-model="form.CargoType" type="text"
                                        :placeholder="t('enterType')" required class="form-control" />
                                </div>

                                <div class="form-group-compact">
                                    <label for="cargoWeight" class="text-left">{{ t('weight') }}</label>
                                    <div class="input-group">
                                        <input id="cargoWeight" v-model="form.CargoWeight" type="number" step="any"
                                            :placeholder="t('enterWeight')" required class="form-control" />
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
                                                :placeholder="t('enterLength')" required class="form-control" />
                                            <span class="input-group-text">{{ isImperial ? 'ft' : 'm' }}</span>
                                        </div>
                                    </div>

                                    <div class="form-group-compact dimension-field">
                                        <label for="cargoWidth" class="text-left">{{ t('width') }}</label>
                                        <div class="input-group">
                                            <input id="cargoWidth" v-model="form.CargoWidth" type="number" step="any"
                                                :placeholder="t('enterWidth')" required class="form-control" />
                                            <span class="input-group-text">{{ isImperial ? 'ft' : 'm' }}</span>
                                        </div>
                                    </div>

                                    <div class="form-group-compact dimension-field">
                                        <label for="cargoHeight" class="text-left">{{ t('height') }}</label>
                                        <div class="input-group">
                                            <input id="cargoHeight" v-model="form.CargoHeight" type="number" step="any"
                                                :placeholder="t('enterHeight')" required class="form-control" />
                                            <span class="input-group-text">{{ isImperial ? 'ft' : 'm' }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group-compact">
                                    <label for="cargoNotes" class="text-left">{{ t('notes') }}</label>
                                    <textarea id="cargoNotes" v-model="form.CargoNotes" :placeholder="t('enterNotes')"
                                        rows="2" required class="form-control"></textarea>
                                </div>
                            </div>

                            <!-- Trailer Information Tab -->
                            <div v-if="activeTab === 'trailer'" class="form-section">
                                <div class="form-group-compact">
                                    <label for="trailerType" class="text-left">{{ t('type') }}</label>
                                    <input id="trailerType" v-model="form.TrailerType" type="text"
                                        :placeholder="t('enterType')" required class="form-control" />
                                </div>

                                <div class="form-group-compact">
                                    <label for="trailerLength" class="text-left">{{ t('length') }}</label>
                                    <div class="input-group">
                                        <input id="trailerLength" v-model="form.TrailerLength" type="number" step="any"
                                            :placeholder="t('enterLength')" required class="form-control" />
                                        <span class="input-group-text">{{ isImperial ? 'ft' : 'm' }}</span>
                                    </div>
                                </div>

                                <div class="form-group-compact">
                                    <textarea id="trailerNotes" v-model="form.TrailerNotes"
                                        :placeholder="t('enterNotes')" rows="2" required
                                        class="form-control"></textarea>
                                </div>
                            </div>

                             <!-- Prime Mover Information Tab -->
                            <div v-if="activeTab === 'prime_mover'" class="form-section">
                                <div class="form-group-compact">
                                    <label for="primeMoverType" class="text-left">{{ t('type') }}</label>
                                    <input id="primeMoverType" v-model="form.PrimeMoverType" type="text"
                                        :placeholder="t('enterType')" required class="form-control" />
                                </div>

                                <div class="form-group-compact">
                                    <label for="primeMoverLength" class="text-left">{{ t('length') }}</label>
                                    <div class="input-group">
                                        <input id="primeMoverLength" v-model="form.PrimeMoverLength" type="number" step="any"
                                            :placeholder="t('enterLength')" required class="form-control" />
                                        <span class="input-group-text">{{ isImperial ? 'ft' : 'm' }}</span>
                                    </div>
                                </div>

                                <div class="form-group-compact">
                                    <label for="primeMoverNotes" class="text-left">{{ t('notes') }}</label>
                                    <textarea id="primeMoverNotes" v-model="form.PrimeMoverNotes"
                                        :placeholder="t('enterNotes')" rows="2" required
                                        class="form-control"></textarea>
                                </div>
                            </div>
                        </div>
                    </form>

                    <!-- <template #footer>
                        <div class="footer-actions">
                            <BaseButton variant="secondary" size="small" @click="handleCancel">
                                {{ t('cancel') }}
                            </BaseButton>
                            <BaseButton variant="primary" size="small" :disabled="!canSave || isSubmitting"
                                @click="handleSubmit" :left-icon="isSubmitting ? 'fas fa-spinner fa-spin' : null">
                                {{ t('saveRoute') }}
                            </BaseButton>
                        </div>
                    </template> -->
                </BaseCard>
            </div>
        </div>

        <!-- Unsaved Changes Warning Modal -->
        <BaseConfirmationModal :visible="showUnsavedChangesModal" :title="t('unsavedChanges')"
            :message="t('unsavedChangesWarning') || t('unsavedChangesWarningMessage')" icon="bi bi-exclamation-triangle"
            icon-color="var(--warning)" :show-danger-button="true" :show-primary-button="true"
            :danger-text="t('leaveWithoutSaving') || 'Leave Without Saving'" :primary-text="t('saveRoute')"
            :loading="isSubmitting" :primary-loading="isSubmitting" :primary-disabled="isSubmitting || !canSave"
            @close="cancelLeave" @cancel="cancelLeave" @confirm="confirmLeaveWithoutSaving"
            @primary="handleSaveFromModal" />
    </div>
</template>

<script setup>
import { ref, inject, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import { usePlannedRoutes } from "@/composables/usePlannedRoutes";
import { useI18n } from "vue-i18n";
import PlannedRouteMapRefactored from "@/components/planned_routes/PlannedRouteMapRefactored.vue";
import { BasePanel, BaseCard, BaseButton, BaseDatePicker, BaseLoadingIndicator, BaseConfirmationModal } from "@/components/ui";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const router = useRouter();
const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

const authStore = useAuthStore();

const { addPlannedRoute, addForm, validateAddForm, clearAddForm } = usePlannedRoutes();

const loading = ref(false);

const isImperial = ref(false);
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

// Resizing State
const containerRef = ref(null);
const sidebarWidth = ref(450); // Default width
const isResizing = ref(false);
const minSidebarWidth = 350;
const maxSidebarWidth = 800;

const centerContentStyle = computed(() => {
    if (isSidebarExpanded.value) return {};
    if (isSidebarCollapsed.value) return { flex: '1', width: '100%' };
    return { width: `calc(100% - ${sidebarWidth.value}px)` };
});

const sidebarStyle = computed(() => {
    if (isSidebarExpanded.value) return { width: '100%' };
    if (isSidebarCollapsed.value) return { width: '0' };
    return { width: `${sidebarWidth.value}px` };
});

const startResizing = () => {
    isResizing.value = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.userSelect = 'none'; // Prevent selection while dragging
    document.body.style.cursor = 'col-resize';
};

const onMouseMove = (e) => {
    if (!isResizing.value || !containerRef.value) return;
    
    const containerRect = containerRef.value.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;
    
    if (newWidth >= minSidebarWidth && newWidth <= maxSidebarWidth) {
        sidebarWidth.value = newWidth;
        
        // Trigger map resize if needed (though map resize observer usually handles this)
        // We can emit an event or access the map component if strictly necessary, 
        // but current setup uses reactive props/observers.
    }
};

const stopResizing = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
};


const form = addForm;

// Route data from the map component
const routeData = ref({
    startPoint: null,
    endPoint: null,
    waypoints: [],
    routePath: [],
    routeInfo: null,
    loadingRoute: false
});

// Store initial state for unsaved changes detection
const initialFormState = ref(null);
const initialRouteDataState = ref(null);

// Unsaved changes warning modal state
const showUnsavedChangesModal = ref(false);
const pendingNavigation = ref(null);
const shouldBlockNavigation = ref(null); // null = not checked, false = allow, true = block

// Computed
const canSave = computed(() => {
    if (routeData.value.waypoints.length === 0) {
        return false;
    }

    if (routeData.value.routePath.length === 0) {
        return false;
    }

    // Check if route is being calculated
    // if (routeData.value.loadingRoute) {
    //     return false;
    // }

    // // Check if any waypoint is still loading
    // const hasLoadingWaypoints = routeData.value.waypoints && routeData.value.waypoints.some(wp => wp.loading === true);
    // if (hasLoadingWaypoints) {
    //     return false;
    // }

    // // Check if waypoints have been obtained (route must be drawn and waypoints extracted)
    // // If routePath exists but waypoints are empty or still loading, disable save
    // const hasRouteButNoWaypoints = routeData.value.routePath && routeData.value.routePath.length > 0 &&
    //     (!routeData.value.waypoints || routeData.value.waypoints.length === 0);
    // if (hasRouteButNoWaypoints) {
    //     return false;
    // }

    return form.value.SurveyName.trim();
});

const isSubmitting = computed(() => loading.value);

// Computed map height - full height of container
const mapHeight = computed(() => {
    return '100%';
});

// Helper functions
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

const hasLocationData = (location) => {
    if (!location) return false;

    // Handle string format (legacy)
    if (typeof location === 'string') {
        return location.trim().length > 0;
    }

    // Handle object format with address information (new)
    if (typeof location === 'object') {
        // If we have address information
        if (location.address && location.address.display_name) {
            return true;
        }

        // If we have display_name directly
        if (location.display_name) {
            return true;
        }

        // If we have coordinates
        if (location.lat && location.lng) {
            return true;
        }
    }

    return false;
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

// Deep clone helper function
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
};

// Check if there are unsaved changes
const hasUnsavedChanges = () => {
    if (!initialFormState.value || !initialRouteDataState.value) {
        // If no initial state, check if there's any data entered
        const hasFormData = form.value.SurveyName?.trim() ||
            form.value.SurveyDate ||
            form.value.ClientName?.trim() ||
            form.value.SurveyInstructions?.trim() ||
            form.value.ToolsUsed?.trim() ||
             form.value.CargoType?.trim() ||
            form.value.CargoWeight ||
            form.value.CargoLength ||
            form.value.CargoWidth ||
            form.value.CargoHeight ||
            form.value.CargoNotes?.trim() ||
            form.value.TrailerType?.trim() ||
            form.value.TrailerLength ||
            form.value.TrailerNotes?.trim() ||
            form.value.PrimeMoverType?.trim() ||
            form.value.PrimeMoverLength ||
            form.value.PrimeMoverNotes?.trim();

        const hasRouteData = routeData.value.startPoint ||
            routeData.value.endPoint ||
            (routeData.value.waypoints && routeData.value.waypoints.length > 0) ||
            (routeData.value.routePath && routeData.value.routePath.length > 0);

        return hasFormData || hasRouteData;
    }

    // Compare form data
    const currentForm = form.value;
    const initialForm = initialFormState.value;

    const formFields = [
        'SurveyName', 'SurveyDate', 'ClientName', 'SurveyInstructions', 'SurveyType', 'ToolsUsed',
        'CargoType', 'CargoWeight', 'CargoLength', 'CargoWidth', 'CargoHeight', 'CargoNotes',
        'TrailerType', 'TrailerLength', 'TrailerNotes',
        'PrimeMoverType', 'PrimeMoverLength', 'PrimeMoverNotes'
    ];

    for (const field of formFields) {
        const currentValue = currentForm[field] || '';
        const initialValue = initialForm[field] || '';
        if (String(currentValue).trim() !== String(initialValue).trim()) {
            return true;
        }
    }

    // Compare route data
    const currentRoute = routeData.value;
    const initialRoute = initialRouteDataState.value;

    // Compare start point
    const currentStart = formatLocation(currentRoute.startPoint);
    const initialStart = formatLocation(initialRoute.startPoint);
    if (currentStart !== initialStart) {
        return true;
    }

    // Compare end point
    const currentEnd = formatLocation(currentRoute.endPoint);
    const initialEnd = formatLocation(initialRoute.endPoint);
    if (currentEnd !== initialEnd) {
        return true;
    }

    // Compare waypoints
    if (JSON.stringify(currentRoute.waypoints || []) !== JSON.stringify(initialRoute.waypoints || [])) {
        return true;
    }

    // Compare route path
    if (JSON.stringify(currentRoute.routePath || []) !== JSON.stringify(initialRoute.routePath || [])) {
        return true;
    }

    // Compare POIs if they exist
    if (JSON.stringify(currentRoute.pois || []) !== JSON.stringify(initialRoute.pois || [])) {
        return true;
    }

    return false;
};

const handleSubmit = async () => {
    const validation = validateAddForm();
    if (!validation.valid) {
        showMessage({ status: 'error', message: validation.message });
        return;
    }

    if (!routeData.value.startPoint || !routeData.value.endPoint) {
        showMessage({ status: 'error', message: t('pleaseSelectStartAndEndPoints') });
        return;
    }

    loading.value = true;
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

        const res = await addPlannedRoute(submitData);

        if (res.success) {
            showMessage({ status: 'success', message: t('plannedRouteAddedSuccessfully') });
            clearAddForm();
            routeData.value = {
                startPoint: null,
                endPoint: null,
                waypoints: [],
                routePath: [],
                routeInfo: null,
                loadingRoute: false
            };
            // Reset initial state after successful save
            initialFormState.value = deepClone(form.value);
            initialRouteDataState.value = deepClone(routeData.value);
            // Allow navigation after save
            shouldBlockNavigation.value = false;
            router.push('/plan-route');
        } else {
            showMessage({ status: 'error', message: res.message });
        }
    } catch (error) {
        console.error(error);
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    } finally {
        loading.value = false;
        setGlobalLoading(false);
    }
};

const goBack = () => {
    // Navigate to Planned Routes List
    router.push('/plan-route');
};

const handleCancel = () => {
    if (hasUnsavedChanges()) {
        showUnsavedChangesModal.value = true;
        pendingNavigation.value = () => router.push('/plan-route');
    } else {
        router.push('/plan-route');
    }
};

// Handle unsaved changes modal actions
const confirmLeaveWithoutSaving = () => {
    shouldBlockNavigation.value = false;
    showUnsavedChangesModal.value = false;
    if (pendingNavigation.value) {
        const nav = pendingNavigation.value;
        pendingNavigation.value = null;
        nav();
    }
};

const cancelLeave = () => {
    showUnsavedChangesModal.value = false;
    pendingNavigation.value = null;
    shouldBlockNavigation.value = null; // Reset so guard can check again
};

// Handle save from unsaved changes modal
const handleSaveFromModal = async () => {
    // Close the unsaved changes modal
    showUnsavedChangesModal.value = false;
    pendingNavigation.value = null;
    // Call handleSubmit which will save and navigate if successful
    await handleSubmit();
};

// Navigation guard for route changes (browser back, router.push, etc.)
onBeforeRouteLeave((to, from, next) => {
    // If we're explicitly allowing navigation (e.g., after save), proceed
    if (shouldBlockNavigation.value === false) {
        shouldBlockNavigation.value = null; // Reset for next check
        next();
        return;
    }

    // If there are unsaved changes, show modal and block navigation
    if (hasUnsavedChanges()) {
        shouldBlockNavigation.value = true;
        showUnsavedChangesModal.value = true;
        pendingNavigation.value = () => {
            shouldBlockNavigation.value = false;
            next();
        };
        // Don't call next() here - wait for user confirmation
    } else {
        // No unsaved changes, allow navigation
        next();
    }
});

// Handle browser tab/window close
const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but we still need to call preventDefault
        e.returnValue = '';
        return '';
    }
};

const getCurrentUserData = async () => {
    try {
        if (!authStore.user) {
             await authStore.fetchUserProfile();
        }
        if (authStore.user) {
            isImperial.value = authStore.user.imperial;
        }
    } catch (error) {
        console.error('Error getting user data:', error);
    }
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

onMounted(() => {
    getCurrentUserData();
    // Store initial state after component mounts
    initialFormState.value = deepClone(form.value);
    initialRouteDataState.value = deepClone(routeData.value);
    // Set up beforeunload listener
    window.addEventListener('beforeunload', handleBeforeUnload);
});

// Clean up beforeunload listener
onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style scoped>
.add-planned-route-new {
    min-height: 100%;
    display: flex;
    flex-direction: row; /* Changed from column to row for side-by-side layout */

    /* background-color: var(--bg-base); */
    color: var(--text-primary);
    overflow: hidden; /* Hide overflow to handle resizing cleanly */
    position: relative;

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
    gap: 1rem;
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

.form-section-title {
    margin: 0 0 0.75rem;
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0%;
    border-bottom: 2px solid var(--accent);
    padding-bottom: 0.375rem;
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

.floating-route-summary {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: calc(100% - 2rem);
    max-width: 600px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    border-radius: 8px;
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
    border-radius: 4px;
}

.summary-toggle-btn:hover {
    color: var(--accent);
    background: var(--bg-elevated);
}

.summary-toggle-btn i {
    font-size: 16px;
}

.route-summary {
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 0 0 8px 8px;
    border: 1px solid var(--border);
    border-top: none;
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

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
}

.summary-item:last-child {
    border-bottom: none;
}

.summary-item strong {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 14px;
}

.summary-item span {
    color: var(--text-secondary);
}

.no-data {
    color: var(--text-secondary) !important;
    font-style: italic;
}

.loading-address {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: 14px;
}

.loading-spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentcolor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.address-details {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.address-details h4 {
    margin: 0 0 0.75rem;
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 600;
}

.address-item {
    margin-bottom: 0.75rem;
}

.address-item:last-child {
    margin-bottom: 0;
}

.address-item strong {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 14px;
}

.address-breakdown {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.4;
    padding-left: 0.5rem;
    border-left: 2px solid var(--border);
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

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

    .floating-route-summary {
        width: calc(100% - 2rem);
        max-width: none;
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

    .map-container {
        height: 300px;
        min-height: 250px;
    }

    .floating-route-summary {
        width: calc(100% - 1rem);
        max-width: none;
        left: 50%;
        transform: translateX(-50%);
        bottom: 0.5rem;
    }

    .summary-header-actions {
        flex-direction: column;
        gap: 0.25rem;
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

.save-status.saving {
    color: var(--accent);
    background: rgb(0 167 225 / 10%);
}

.save-status.not-saved {
    color: var(--text-secondary);
    background: var(--bg-surface);
}

.save-status i {
    font-size: 11px;
}

.save-status.saving i {
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
</style>

<style scoped>
/* Resize Handle */
.resize-handle {
    width: 12px;
    background-color: transparent;
    cursor: col-resize;
    position: relative;
    z-index: 10;
    margin: 0 -6px; /* Negative margin to overlap containers slightly without taking up visual space */
    display: flex;
    justify-content: center;
    transition: background-color 0.2s;
}

.resize-handle:hover,
.resize-handle:active {
    background-color: rgba(var(--primary-rgb), 0.1);
}

.resize-handle-line {
    width: 2px;
    height: 100%;
    background-color: var(--border-color);
    transition: background-color 0.2s;
}

.resize-handle:hover .resize-handle-line,
.resize-handle:active .resize-handle-line {
    background-color: var(--primary);
}

.map-panel-polish {
    border-radius: var(--radius-md);
    overflow: hidden;
    height: 100%;

    /* border: 1px solid var(--border-color); */

 /* BasePanel usually has border, checking if needed */
}

.sidebar-panel-polish {
    height: 100%;
    border-radius: var(--radius-md) 0 0 var(--radius-md); /* Smooth transition */
}
</style>