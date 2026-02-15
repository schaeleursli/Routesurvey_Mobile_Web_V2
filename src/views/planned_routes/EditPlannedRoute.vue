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
                <BasePanel :title="t('editingPlannedRoute')" elevation="level2" :scrollable="false" class="main-panel">
                    <template #header>
                        <div class="header-actions-group">
                            <div class="save-indicator">
                                <span v-if="isSubmitting" class="save-status saving">
                                    <i class="bi bi-hourglass-split"></i>
                                    {{ t('saving') }}
                                </span>
                                <span v-else-if="hasUnsavedChanges()" class="save-status unsaved">
                                    <i class="bi bi-exclamation-circle"></i>
                                    {{ t('unsavedChanges') }}
                                </span>
                                <span v-else-if="lastSavedTime" class="save-status saved">
                                    <i class="bi bi-check-circle"></i>
                                    {{ t('lastSaved') }}: {{ formatLastSavedTime(lastSavedTime) }}
                                </span>
                                <span v-else class="save-status not-saved">
                                    <i class="bi bi-circle"></i>
                                    {{ t('notSavedYet') }}
                                </span>
                            </div>
                            <div class="header-action-buttons">
                                <BaseButton variant="secondary" size="small" @click="handleCancel"
                                    left-icon="bi bi-x-circle">
                                    {{ t('cancel') }}
                                </BaseButton>
                                <BaseButton variant="primary" size="small" @click="showSaveConfirmModal"
                                    :disabled="!hasUnsavedChanges() || isSubmitting" left-icon="bi bi-save">
                                    {{ t('save') }}
                                </BaseButton>
                                <BaseButton variant="danger" size="small" @click="showDeleteConfirmModal"
                                    :disabled="isSubmitting || isDeleting" left-icon="bi bi-trash">
                                    {{ t('delete') }}
                                </BaseButton>
                            </div>
                        </div>
                    </template>

                    <div class="map-container">
                        <PlannedRouteMapRefactored ref="mapRef" v-model="routeData" :height="mapHeight"
                            :editing="true" />
                    </div>
                </BasePanel>
            </div>

            <!-- Right Sidebar - Form and Route Information -->
            <div class="right-sidebar" :class="{ 'collapsed': isSidebarCollapsed, 'expanded': isSidebarExpanded }">
                <!-- Sidebar Toggle Button - Expand (center right when collapsed) -->
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
                                    <button 
                                        class="sidebar-expand-btn" 
                                        @click="toggleSidebarExpanded"
                                        :title="isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar to full width'"
                                        aria-label="Toggle sidebar width"
                                    >
                                        <i :class="isSidebarExpanded ? 'bi bi-arrows-angle-contract' : 'bi bi-arrows-angle-expand'"></i>
                                    </button>
                                    <!-- Close button -->
                                    <button 
                                        class="sidebar-close-btn" 
                                        @click="toggleSidebar" 
                                        title="Close sidebar"
                                        aria-label="Close sidebar"
                                    >
                                        <i class="bi bi-x-lg"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="header-actions mt-2">
                                <div class="dropdown-group">
                                    <button 
                                        class="action-btn" 
                                        @click="showTemplateModal = true" 
                                        :title="t('templates') || 'Templates'"
                                        aria-label="Manage route templates"
                                    >
                                        <i class="bi bi-journals"></i>
                                        <span>{{ t('templates') || 'Templates' }}</span>
                                    </button>
                                    
                                    <div class="dropdown">
                                        <button 
                                            class="action-btn" 
                                            @click="toggleExportDropdown" 
                                            :title="t('export') || 'Export'"
                                            aria-label="Export route"
                                            aria-haspopup="true"
                                            :aria-expanded="showExportDropdown"
                                        >
                                            <i class="bi bi-download"></i>
                                            <span>{{ t('export') || 'Export' }}</span>
                                            <i class="bi bi-chevron-down dropdown-arrow"></i>
                                        </button>
                                        <div v-if="showExportDropdown" class="dropdown-menu" role="menu">
                                            <button @click="exportAs('gpx')" class="dropdown-item" role="menuitem">
                                                <i class="bi bi-file-earmark-code"></i> Export as GPX
                                            </button>
                                            <button @click="exportAs('kml')" class="dropdown-item" role="menuitem">
                                                <i class="bi bi-globe"></i> Export as KML
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        class="action-btn" 
                                        @click="toggleOfflineMode" 
                                        :class="{ 'active': offlineModeEnabled }"
                                        :title="offlineModeEnabled ? t('offlineModeEnabled') : t('enableOfflineMode')"
                                        :aria-label="offlineModeEnabled ? 'Offline mode enabled' : 'Enable offline mode'"
                                    >
                                        <i :class="offlineModeEnabled ? 'bi bi-wifi-off' : 'bi bi-wifi'"></i>
                                        <span>{{ offlineModeEnabled ? t('offline') : t('online') }}</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Validation Status -->
                            <div v-if="showValidationSummary" class="validation-summary mt-2">
                                <i :class="validationSummary.icon" :style="{ color: validationSummary.color }"></i>
                                <span>{{ validationSummary.message }}</span>
                            </div>
                            
                            <!-- BaseTabGroup -->
                            <div class="mt-3">
                                <BaseTabGroup v-model="activeTab" :tabs="tabs">
                                    <template #default>
                                        <!-- Content handled below in form -->
                                    </template>
                                </BaseTabGroup>
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
                                <BaseFormField v-model="form.SurveyName" :label="t('surveyName') + ' *'"
                                    :placeholder="t('enterSurveyName')" required />

                                <div class="form-group-compact">
                                    <BaseDatePicker v-model="form.SurveyDate" :label="t('surveyDate')"
                                        :placeholder="t('selectDate')" />
                                </div>

                                <BaseFormField v-model="form.ClientName" :label="t('clientName')"
                                    :placeholder="t('enterClientName')" required />

                                <BaseFormField v-model="form.SurveyInstructions" :label="t('surveyInstructions')"
                                    type="textarea" :placeholder="t('enterSurveyInstructions')" :rows="3" required />
                            </div>

                            <!-- Cargo Information Tab -->
                            <div v-if="activeTab === 'cargo'" class="form-section">
                                <BaseFormField v-model="form.CargoType" :label="t('type')" :placeholder="t('enterType')"
                                    required />

                                <BaseFormField v-model="form.CargoWeight" :label="t('weight')" type="number"
                                    :placeholder="t('enterWeight')" required :suffix="isImperial ? 'lbs' : 'kg'" />

                                <div class="form-group-separator">
                                    <span class="separator-label">{{ t('dimensions') || 'Dimensions' }}</span>
                                </div>

                                <div class="dimensions-group">
                                    <BaseFormField v-model="form.CargoLength" :label="t('length')" type="number"
                                        :placeholder="t('enterLength')" required :suffix="isImperial ? 'ft' : 'm'"
                                        class="dimension-field" />

                                    <BaseFormField v-model="form.CargoWidth" :label="t('width')" type="number"
                                        :placeholder="t('enterWidth')" required :suffix="isImperial ? 'ft' : 'm'"
                                        class="dimension-field" />

                                    <BaseFormField v-model="form.CargoHeight" :label="t('height')" type="number"
                                        :placeholder="t('enterHeight')" required :suffix="isImperial ? 'ft' : 'm'"
                                        class="dimension-field" />
                                </div>

                                <BaseFormField v-model="form.CargoNotes" :label="t('notes')" type="textarea"
                                    :placeholder="t('enterNotes')" :rows="2" required />
                            </div>

                            <!-- Trailer Information Tab -->
                            <div v-if="activeTab === 'trailer'" class="form-section">
                                <BaseFormField v-model="form.TrailerType" :label="t('type')"
                                    :placeholder="t('enterType')" required />

                                <BaseFormField v-model="form.TrailerLength" :label="t('length')" type="number"
                                    :placeholder="t('enterLength')" required :suffix="isImperial ? 'ft' : 'm'" />

                                <BaseFormField v-model="form.TrailerNotes" :label="t('notes')" type="textarea"
                                    :placeholder="t('enterNotes')" :rows="2" required />
                            </div>
                        </div>
                    </form>
                    <!-- <template #footer>
                        <div class="footer-actions">
                            <BaseButton variant="secondary" size="small" @click="handleCancel">
                                {{ t('cancel') }}
                            </BaseButton>
                            <BaseButton variant="primary" size="small" :disabled="!hasUnsavedChanges() || isSubmitting"
                                @click="showSaveConfirmModal"
                                :left-icon="isSubmitting ? 'fas fa-spinner fa-spin' : null">
                                {{ t('saveRoute') }}
                            </BaseButton>
                        </div>
                    </template> -->
                </BaseCard>
            </div>
        </div>

        <!-- Save Confirmation Modal -->
        <BaseConfirmationModal :visible="showSaveModal" :title="t('confirmSave')" :message="t('confirmSaveMessage')"
            icon="bi bi-question-circle" icon-color="var(--primary)" :show-danger-button="true"
            :show-primary-button="true" :danger-text="t('discardChanges')" :primary-text="t('save')"
            :loading="isSubmitting" :primary-loading="isSubmitting" :primary-disabled="isSubmitting"
            @close="closeSaveConfirmModal" @cancel="closeSaveConfirmModal" @confirm="handleDiscardChanges"
            @primary="confirmSave" />

        <!-- Delete Confirmation Modal -->
        <BaseConfirmationModal :visible="showDeleteModal" :title="t('confirmDeletePlannedRoute')"
            :message="t('confirmDeletePlannedRouteMessage')" icon="bi bi-exclamation-triangle" icon-color="var(--error)"
            :show-danger-button="true" :show-primary-button="false" :danger-text="t('delete')" danger-icon="bi bi-trash"
            :loading="isDeleting" @close="closeDeleteConfirmModal" @cancel="closeDeleteConfirmModal"
            @confirm="confirmDelete" />

        <!-- Unsaved Changes Warning Modal -->
        <BaseConfirmationModal :visible="showUnsavedChangesModal" :title="t('unsavedChanges')"
            :message="t('unsavedChangesWarning') || t('unsavedChangesWarningMessage')" icon="bi bi-exclamation-triangle"
            icon-color="var(--warning)" :show-danger-button="true" :show-primary-button="true"
            :danger-text="t('leaveWithoutSaving') || 'Leave Without Saving'" :primary-text="t('save')"
            :loading="isSubmitting" :primary-loading="isSubmitting" :primary-disabled="isSubmitting"
            @close="cancelLeave" @cancel="cancelLeave" @confirm="confirmLeaveWithoutSaving"
            @primary="showSaveConfirmModal" />
        
        <!-- Template Management Modal -->
        <BaseModal :visible="showTemplateModal" @close="showTemplateModal = false" :title="t('routeTemplates') || 'Route Templates'" size="medium">
            <div class="template-modal">
                <div class="template-tabs">
                    <button 
                        :class="{ 'active': templateTab === 'load' }"
                        @click="templateTab = 'load'"
                        aria-label="Load template"
                    >
                        {{ t('loadTemplate') || 'Load Template' }}
                    </button>
                    <button 
                        :class="{ 'active': templateTab === 'save' }"
                        @click="templateTab = 'save'"
                        aria-label="Save template"
                    >
                        {{ t('saveTemplate') || 'Save Template' }}
                    </button>
                </div>
                
                <div v-if="templateTab === 'load'" class="template-list">
                    <div v-if="templatesLoading" class="template-loading">
                        <BaseLoadingIndicator size="medium" />
                    </div>
                    <div v-else-if="templates.length === 0" class="template-empty">
                        <i class="bi bi-inbox"></i>
                        <p>{{ t('noTemplates') || 'No templates saved yet' }}</p>
                    </div>
                    <div v-else class="templates-grid">
                        <div 
                            v-for="template in templates" 
                            :key="template.id" 
                            class="template-card"
                            @click="loadRouteTemplate(template)"
                            tabindex="0"
                            @keydown.enter="loadRouteTemplate(template)"
                            role="button"
                            :aria-label="`Load template ${template.name}`"
                        >
                            <div class="template-header">
                                <span class="template-name">{{ template.name }}</span>
                                <button 
                                    @click.stop="deleteRouteTemplate(template.id)" 
                                    class="template-delete"
                                    :aria-label="`Delete template ${template.name}`"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                            <p class="template-description">{{ template.description }}</p>
                            <div class="template-meta">
                                <span>{{ formatTemplateDate(template.createdAt) }}</span>
                                <span v-if="template.isShared" class="template-shared">
                                    <i class="bi bi-people"></i> Shared
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div v-if="templateTab === 'save'" class="template-save-form">
                    <BaseFormField 
                        v-model="newTemplate.name" 
                        :label="t('templateName') || 'Template Name'"
                        :placeholder="t('enterTemplateName') || 'Enter template name...'"
                        required
                    />
                    <BaseFormField 
                        v-model="newTemplate.description" 
                        :label="t('description') || 'Description'"
                        :placeholder="t('enterDescription') || 'Enter description (optional)...'"
                        type="textarea"
                        :rows="3"
                    />
                    <div class="template-actions mt-4">
                        <BaseButton variant="secondary" @click="showTemplateModal = false">
                            {{ t('cancel') }}
                        </BaseButton>
                        <BaseButton 
                            variant="primary" 
                            @click="saveAsTemplate"
                            :disabled="!newTemplate.name.trim()"
                        >
                            {{ t('saveTemplate') || 'Save Template' }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, inject, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import { usePlannedRoutes } from "@/composables/usePlannedRoutes";
import { useI18n } from "vue-i18n";
import PlannedRouteMapRefactored from "@/components/planned_routes/PlannedRouteMapRefactored.vue";
import { BasePanel, BaseCard, BaseButton, BaseLoadingIndicator, BaseDatePicker, BaseConfirmationModal, BaseTabGroup, BaseFormField, BaseModal } from "@/components/ui";
import { LocationSearch, ValidationFeedback } from '@/components/routes';
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

const authStore = useAuthStore();

const isImperial = ref(false);

const {
    fetchPlannedRoute,
    updatePlannedRoute,
    deletePlannedRoute,
    editForm,
    validateEditForm,
    clearEditForm,
    setEditFormData,
    loading,
    error,
    selectedPlannedRoute: plannedRoute
} = usePlannedRoutes();

const isSubmitting = ref(false);
const isDeleting = ref(false);
const form = editForm;
const isSidebarCollapsed = ref(true); // Collapsed by default to maximize map area
const isSidebarExpanded = ref(false); // Full width expanded state
const activeTab = ref('survey'); // Default to survey tab

// Tab configuration - matching ShareCenter style
const tabs = computed(() => [
    { id: 'summary', label: t('summary'), icon: 'bi bi-info-circle' },
    { id: 'survey', label: t('survey'), icon: 'bi bi-clipboard-data' },
    { id: 'cargo', label: t('cargo'), icon: 'bi bi-box-seam' },
    { id: 'trailer', label: t('trailer'), icon: 'bi bi-truck' }
]);

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

// Store initial state for unsaved changes detection
const initialFormState = ref(null);
const initialRouteDataState = ref(null);

// Save confirmation modal state
const showSaveModal = ref(false);
// Delete confirmation modal state
const showDeleteModal = ref(false);
// Unsaved changes warning modal state
const showUnsavedChangesModal = ref(false);
const pendingNavigation = ref(null);
const shouldBlockNavigation = ref(null); // null = not checked, false = allow, true = block

// ============================================
// ENHANCED LOGIC - Route Editor Enhancements
// ============================================

// New UI State for Enhancements
const showExportDropdown = ref(false);
const showTemplateModal = ref(false);
const templateTab = ref('load');
const offlineModeEnabled = ref(false);

// Template System
const {
    templates,
    loading: templatesLoading,
    fetchTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate
} = useRouteTemplates();

const newTemplate = reactive({
    name: '',
    description: ''
});

// Validation State
const validation = reactive({
    routePoints: null,
    cargoData: null,
    trailerData: null
});

// Validation Summary
const showValidationSummary = computed(() => {
    return Object.values(validation).some(v => v !== null);
});

const validationSummary = computed(() => {
    const hasErrors = Object.values(validation).some(v => v && v.status === 'invalid');
    const allValid = Object.values(validation).every(v => !v || v.status === 'valid');

    if (hasErrors) {
        return {
            icon: 'bi bi-exclamation-circle-fill',
            color: 'var(--error)',
            message: t('validationErrors') || 'Please fix validation errors'
        };
    } else if (allValid && routeData.value.startPoint && routeData.value.endPoint) {
        return {
            icon: 'bi bi-check-circle-fill',
            color: 'var(--success)',
            message: t('routeValid') || 'Route is valid'
        };
    }

    return {
        icon: 'bi bi-info-circle-fill',
        color: 'var(--info)',
        message: t('fillRequiredFields') || 'Complete route information'
    };
});

// Watch for validation
watch(routeData, () => {
    if (routeData.value.startPoint && routeData.value.endPoint) {
        const distance = routeData.value.routeInfo?.distance || 0;
        validation.routePoints = {
            status: 'valid',
            message: t('routeValid') || `Route calculated (${(distance / 1000).toFixed(2)} km)`,
            hint: ''
        };
    } else if (routeData.value.startPoint || routeData.value.endPoint) {
        validation.routePoints = {
            status: 'warning',
            message: t('needBothPoints') || 'Add both start and end points',
            hint: t('clickMapToSetPoints') || 'Click on the map to set points'
        };
    }
}, { deep: true });

// ENHANCED FUNCTIONS

const toggleExportDropdown = (event) => {
    event?.stopPropagation();
    showExportDropdown.value = !showExportDropdown.value;
};

const closeExportDropdown = () => {
    showExportDropdown.value = false;
};

const exportAs = (format) => {
    const exportData = {
        points: [
            ...(routeData.value.startPoint ? [routeData.value.startPoint] : []),
            ...routeData.value.waypoints,
            ...(routeData.value.endPoint ? [routeData.value.endPoint] : [])
        ],
        routePath: routeData.value.routePath || [],
        routeInfo: routeData.value.routeInfo || {}
    };

    const filename = form.SurveyNo || form.JobNo || 'planned-route';

    if (format === 'gpx') {
        downloadAsGPX(exportData, filename, {
            name: `Survey ${form.SurveyNo || ''}`,
            description: `Job: ${form.JobNo || ''}`
        });
        showMessage({ status: 'success', message: t('routeExportedGPX') || 'Route exported as GPX' });
    } else if (format === 'kml') {
        downloadAsKML(exportData, filename, {
            name: `Survey ${form.SurveyNo || ''}`,
            description: `Job: ${form.JobNo || ''}`
        });
        showMessage({ status: 'success', message: t('routeExportedKML') || 'Route exported as KML' });
    }

    showExportDropdown.value = false;
};

const handleLocationSelect = (location) => {
    if (location && location.lat && location.lng) {
        if (mapRef.value && mapRef.value.centerMap) {
            mapRef.value.centerMap([location.lat, location.lng], 15);
        }
    }
};

const toggleOfflineMode = async () => {
    if (!offlineModeEnabled.value) {
        try {
            await mapTileCache.init();
            await mapTileCache.enable();

            if (routeData.value.startPoint && routeData.value.endPoint) {
                const bounds = getRouteBounds();
                if (bounds) {
                    setGlobalLoading(true);
                    showMessage({ status: 'info', message: t('cachingTiles') || 'Caching map tiles...' });

                    const result = await mapTileCache.cacheBoundingBox(
                        bounds,
                        [13, 14, 15],
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    );

                    setGlobalLoading(false);
                    showMessage({
                        status: 'success',
                        message: `${result.cached} tiles cached for offline use`
                    });
                }
            } else {
                showMessage({
                    status: 'success',
                    message: t('offlineModeEnabled') || 'Offline mode enabled'
                });
            }

            offlineModeEnabled.value = true;
        } catch (error) {
            console.error('Error enabling offline mode:', error);
            showMessage({ status: 'error', message: t('offlineModeError') || 'Failed to enable offline mode' });
        }
    } else {
        mapTileCache.disable();
        offlineModeEnabled.value = false;
        showMessage({ status: 'info', message: t('offlineModeDisabled') || 'Offline mode disabled' });
    }
};

const getRouteBounds = () => {
    const points = [];
    if (routeData.value.startPoint) points.push(routeData.value.startPoint);
    if (routeData.value.endPoint) points.push(routeData.value.endPoint);
    points.push(...routeData.value.waypoints);

    if (points.length === 0) return null;

    let north = points[0].lat, south = points[0].lat, east = points[0].lng, west = points[0].lng;
    points.forEach(point => {
        north = Math.max(north, point.lat);
        south = Math.min(south, point.lat);
        east = Math.max(east, point.lng);
        west = Math.min(west, point.lng);
    });

    const padding = 0.01;
    return { north: north + padding, south: south - padding, east: east + padding, west: west - padding };
};

const saveAsTemplate = async () => {
    const templateData = {
        name: newTemplate.name,
        description: newTemplate.description,
        routeType: 'planned',
        data: {
            surveyNo: form.SurveyNo,
            jobNo: form.JobNo,
            route: { startPoint: routeData.value.startPoint, endPoint: routeData.value.endPoint, waypoints: routeData.value.waypoints },
            cargo: { type: form.CargoType, weight: form.CargoWeight, length: form.CargoLength, width: form.CargoWidth, height: form.CargoHeight, notes: form.CargoNotes },
            trailer: { type: form.TrailerType, length: form.TrailerLength, notes: form.TrailerNotes }
        }
    };

    const result = await saveTemplate(templateData);
    if (result.success) {
        showMessage({ status: 'success', message: t('templateSaved') || 'Template saved successfully' });
        newTemplate.name = '';
        newTemplate.description = '';
        templateTab.value = 'load';
        await fetchTemplates('planned');
    } else {
        showMessage({ status: 'error', message: result.error || t('templateSaveFailed') || 'Failed to save template' });
    }
};

const loadRouteTemplate = async (template) => {
    const result = await loadTemplate(template.id);
    if (result.success) {
        const data = result.data.data;
        if (data.surveyNo) form.SurveyNo = data.surveyNo;
        if (data.jobNo) form.JobNo = data.jobNo;
        if (data.route) {
            if (data.route.startPoint) routeData.value.startPoint = data.route.startPoint;
            if (data.route.endPoint) routeData.value.endPoint = data.route.endPoint;
            if (data.route.waypoints) routeData.value.waypoints = data.route.waypoints;
        }
        if (data.cargo) Object.keys(data.cargo).forEach(key => {
            const formKey = `Cargo${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (formKey in form) form[formKey] = data.cargo[key];
        });
        if (data.trailer) Object.keys(data.trailer).forEach(key => {
            const formKey = `Trailer${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (formKey in form) form[formKey] = data.trailer[key];
        });
        showMessage({ status: 'success', message: t('templateLoaded') || 'Template loaded successfully' });
        showTemplateModal.value = false;
    } else {
        showMessage({ status: 'error', message: result.error || t('templateLoadFailed') || 'Failed to load template' });
    }
};

const deleteRouteTemplate = async (templateId) => {
    const result = await deleteTemplate(templateId);
    if (result.success) {
        showMessage({ status: 'success', message: t('templateDeleted') || 'Template deleted successfully' });
        await fetchTemplates('planned');
    } else {
        showMessage({ status: 'error', message: result.error || t('templateDeleteFailed') || 'Failed to delete template' });
    }
};

const formatTemplateDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t('today') || 'Today';
    if (diffDays === 1) return t('yesterday') || 'Yesterday';
    if (diffDays <7) return `${diffDays} ${t('daysAgo') || 'days ago'}`;
    return date.toLocaleDateString();
};

// END ENHANCED LOGIC


// Track last saved time
const lastSavedTime = ref(null);

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

            // Store initial state after loading data
            initialFormState.value = deepClone(form.value);
            initialRouteDataState.value = deepClone(routeData.value);
        }
    }
});

// Check if there are unsaved changes
const hasUnsavedChanges = () => {
    if (!initialFormState.value || !initialRouteDataState.value) {
        return false;
    }

    // Compare form data
    const currentForm = form.value;
    const initialForm = initialFormState.value;

    const formFields = [
        'SurveyName', 'SurveyDate', 'ClientName', 'SurveyInstructions',
        'CargoType', 'CargoWeight', 'CargoLength', 'CargoWidth', 'CargoHeight', 'CargoNotes',
        'TrailerType', 'TrailerLength', 'TrailerNotes'
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

const showSaveConfirmModal = () => {
    // Close unsaved changes modal if open
    if (showUnsavedChangesModal.value) {
        showUnsavedChangesModal.value = false;
        pendingNavigation.value = null;
    }
    showSaveModal.value = true;
};

const closeSaveConfirmModal = () => {
    showSaveModal.value = false;
};

const handleDiscardChanges = () => {
    // Reset form to initial state
    if (initialFormState.value) {
        Object.assign(form.value, initialFormState.value);
    }

    // Reset routeData to initial state
    if (initialRouteDataState.value) {
        routeData.value = deepClone(initialRouteDataState.value);
    }

    // Allow navigation after discarding
    shouldBlockNavigation.value = false;
    // Close the save modal
    closeSaveConfirmModal();

    // Navigate to view page
    router.push(`/planned-routes/${route.params.id}`);
};

const confirmSave = async () => {
    const validation = validateEditForm();
    if (!validation.valid) {
        showMessage({ status: 'error', message: validation.message });
        closeSaveConfirmModal();
        return;
    }

    if (!routeData.value.startPoint || !routeData.value.endPoint) {
        showMessage({ status: 'error', message: t('pleaseSelectStartAndEndPoints') });
        closeSaveConfirmModal();
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
            // Reset initial state after successful save
            initialFormState.value = deepClone(form.value);
            initialRouteDataState.value = deepClone(routeData.value);
            // Update last saved time
            lastSavedTime.value = new Date().toISOString();
            // Allow navigation after save
            shouldBlockNavigation.value = false;
            closeSaveConfirmModal();
            // Navigate to view page
            router.push(`/planned-routes/${route.params.id}`);
        } else {
            showMessage({ status: 'error', message: res.message });
            closeSaveConfirmModal();
        }
    } catch (error) {
        console.error(error);
        showMessage({ status: 'error', message: t('somethingWentWrong') });
        closeSaveConfirmModal();
    } finally {
        isSubmitting.value = false;
        setGlobalLoading(false);
    }
};

const handleSubmit = () => {
    showSaveConfirmModal();
};

const goBack = () => {
    // Navigate to view page when canceling from edit (parent-child relationship)
    router.push(`/planned-routes/${route.params.id}`);
};

const handleCancel = () => {
    if (hasUnsavedChanges()) {
        showUnsavedChangesModal.value = true;
        pendingNavigation.value = () => router.push(`/planned-routes/${route.params.id}`);
    } else {
        router.push(`/planned-routes/${route.params.id}`);
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

// Navigation guard for route changes (browser back, router.push, etc.)
onBeforeRouteLeave((to, from, next) => {
    // If we're explicitly allowing navigation (e.g., after save/delete), proceed
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

// Set up beforeunload listener
onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
});

// Clean up beforeunload listener
onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
});

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


// Delete confirmation modal handlers
const showDeleteConfirmModal = () => {
    showDeleteModal.value = true;
};

const closeDeleteConfirmModal = () => {
    showDeleteModal.value = false;
};

const confirmDelete = async () => {
    isDeleting.value = true;
    setGlobalLoading(true);

    try {
        const res = await deletePlannedRoute(route.params.id);

        if (res.success) {
            showMessage({ status: 'success', message: t('plannedRouteDeletedSuccessfully') || res.message });
            // Allow navigation after delete
            shouldBlockNavigation.value = false;
            closeDeleteConfirmModal();
            // Navigate back to plan-route page
            router.push({
                path: '/plan-route',
                replace: true
            });
        } else {
            showMessage({ status: 'error', message: res.message });
            closeDeleteConfirmModal();
        }
    } catch (error) {
        console.error(error);
        showMessage({ status: 'error', message: t('somethingWentWrong') });
        closeDeleteConfirmModal();
    } finally {
        isDeleting.value = false;
        setGlobalLoading(false);
    }
};

// Computed map height - full height of container
const mapHeight = computed(() => {
    return '100%';
});
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
    max-height: calc(100vh - 90px);
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
    min-width: 0;
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

    .right-sidebar {
        width: 100% !important;
        max-height: none;
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
        margin-bottom: 1.5rem;
    }

    .form-group {
        margin-bottom: 0.75rem;
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

.save-status.unsaved {
    color: #ff9800;
    background: rgb(255 152 0 / 10%);
}

.save-status.saved {
    color: #4caf50;
    background: rgb(76 175 80 / 10%);
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

/* ============================================
   ROUTE EDITOR ENHANCEMENTS - CSS
   ============================================ */

/* Header actions */
.header-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
}

.dropdown-group {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    transition: all var(--transition-fast);
    color: var(--text-primary);
}

.action-btn:hover {
    background: var(--accent-surface);
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
}

.action-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

/* Dropdown menu */
.dropdown {
    position: relative;
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + var(--spacing-xs));
    left: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    min-width: 200px;
    z-index: 1000;
    padding: var(--spacing-xs);
    animation: dropdownSlide 0.2s ease-out;
}

@keyframes dropdownSlide {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background-color var(--transition-fast);
    font-size: var(--font-size-sm);
    color: var(--text-primary);
}

.dropdown-item:hover {
    background: var(--bg-elevated);
    color: var(--accent);
}

/* Validation summary */
.validation-summary {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    background: var(--bg-elevated);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    border-left: 3px solid currentcolor;
}

/* Template modal */
.template-modal {
    padding: 0;
}

.template-tabs {
    display: flex;
    gap: 0;
    margin: 0 0 var(--spacing-md) 0;
    border-bottom: 2px solid var(--border);
}

.template-tabs button {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-md);
    transition: all var(--transition-fast);
    color: var(--text-secondary);
}

.template-tabs button:hover {
    color: var(--text-primary);
    background: var(--bg-elevated);
}

.template-tabs button.active {
    border-bottom-color: var(--accent);
    color: var(--accent);
}

.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
}

.template-card {
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    border: 2px solid var(--border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.template-card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.template-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-sm);
    gap: var(--spacing-sm);
}

.template-name {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-md);
    color: var(--text-primary);
    flex: 1;
    word-break: break-word;
}

.template-delete {
    background: none;
    border: none;
    padding: var(--spacing-xs);
    cursor: pointer;
    color: var(--text-secondary);
    transition: all var(--transition-fast);
    border-radius: var(--radius-sm);
}

.template-delete:hover {
    color: var(--error);
    background: rgb(255 0 0 / 10%);
}

.template-description {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin: var(--spacing-sm) 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.template-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-top: var(--spacing-sm);
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--border);
}

.template-shared {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--accent);
    font-weight: var(--font-weight-medium);
}

.template-empty,
.template-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl) var(--spacing-md);
    color: var(--text-secondary);
    text-align: center;
}

.template-empty i {
    font-size: 4em;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
}

.template-save-form {
    padding: var(--spacing-md) 0;
}

.template-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
}

/* Responsive design */
@media (width <= 768px) {
    .templates-grid {
        grid-template-columns: 1fr;
    }
    
    .dropdown-group {
        flex-direction: column;
    }
    
    .action-btn {
        width: 100%;
        justify-content: center;
    }
}


</style>