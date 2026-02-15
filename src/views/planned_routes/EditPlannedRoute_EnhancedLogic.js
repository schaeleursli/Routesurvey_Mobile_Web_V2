/**
 * Planned Route Editor - Additional JavaScript Logic for Phase 3 Enhancements
 * This file contains the new functions and state needed for all enhancements
 * Integrate these into EditPlannedRoute.vue after the existing declarations
 */

// ADDITIONAL IMPORTS (add to existing imports section around line 290)
import { LocationSearch, ValidationFeedback } from '@/components/routes';
import { useRouteTemplates } from '@/composables/routes/useRouteTemplates';
import { downloadAsGPX, downloadAsKML } from '@/utils/routes/routeExporter';
import mapTileCache from '@/services/mapTileCache';
import { reactive, watch } from 'vue';

// NEW STATE VARIABLES (add after existing refs around line 320)
const showExportDropdown = ref(false);
const showTemplateModal = ref(false);
const templateTab = ref('load'); // 'load' or 'save'
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

// NEW FUNCTIONS

/**
 * Toggle export dropdown
 */
const toggleExportDropdown = () => {
    showExportDropdown.value = !showExportDropdown.value;
};

/**
 * Close export dropdown when clicking outside
 */
const closeExportDropdown = () => {
    showExportDropdown.value = false;
};

// Add click outside listener in onMounted (add to existing onMounted)
onMounted(async () => {
    // ... existing onMounted code ...

    // Add new initialization
    document.addEventListener('click', closeExportDropdown);
    await fetchTemplates('planned');
});

// Add listener cleanup in onBeforeUnmount (add to existing if present, or create new)
onBeforeUnmount(() => {
    document.removeEventListener('click', closeExportDropdown);
});

/**
 * Export route in specified format
 */
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

/**
 * Handle location search selection
 */
const handleLocationSelect = (location) => {
    if (location && location.lat && location.lng) {
        // Center map on selected location
        if (mapRef.value && mapRef.value.centerMap) {
            mapRef.value.centerMap([location.lat, location.lng], 15);
        }
    }
};

/**
 * Toggle offline mode
 */
const toggleOfflineMode = async () => {
    if (!offlineModeEnabled.value) {
        try {
            await mapTileCache.init();
            await mapTileCache.enable();

            // Pre-cache tiles for current route
            if (routeData.value.startPoint && routeData.value.endPoint) {
                const bounds = getRouteBounds();
                if (bounds) {
                    setGlobalLoading(true);
                    showMessage({ status: 'info', message: t('cachingTiles') || 'Caching map tiles...' });

                    const result = await mapTileCache.cacheBoundingBox(
                        bounds,
                        [13, 14, 15], // zoom levels
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

/**
 * Get bounds for current route
 */
const getRouteBounds = () => {
    const points = [];
    if (routeData.value.startPoint) points.push(routeData.value.startPoint);
    if (routeData.value.endPoint) points.push(routeData.value.endPoint);
    points.push(...routeData.value.waypoints);

    if (points.length === 0) return null;

    let north = points[0].lat;
    let south = points[0].lat;
    let east = points[0].lng;
    let west = points[0].lng;

    points.forEach(point => {
        north = Math.max(north, point.lat);
        south = Math.min(south, point.lat);
        east = Math.max(east, point.lng);
        west = Math.min(west, point.lng);
    });

    // Add padding
    const padding = 0.01;
    return {
        north: north + padding,
        south: south - padding,
        east: east + padding,
        west: west - padding
    };
};

/**
 * Save current route as template
 */
const saveAsTemplate = async () => {
    const templateData = {
        name: newTemplate.name,
        description: newTemplate.description,
        routeType: 'planned',
        data: {
            surveyNo: form.SurveyNo,
            jobNo: form.JobNo,
            route: {
                startPoint: routeData.value.startPoint,
                endPoint: routeData.value.endPoint,
                waypoints: routeData.value.waypoints
            },
            cargo: {
                type: form.CargoType,
                weight: form.CargoWeight,
                length: form.CargoLength,
                width: form.CargoWidth,
                height: form.CargoHeight,
                notes: form.CargoNotes
            },
            trailer: {
                type: form.TrailerType,
                length: form.TrailerLength,
                notes: form.TrailerNotes
            }
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

/**
 * Load route template
 */
const loadRouteTemplate = async (template) => {
    const result = await loadTemplate(template.id);

    if (result.success) {
        const data = result.data.data;

        // Apply template data
        if (data.surveyNo) form.SurveyNo = data.surveyNo;
        if (data.jobNo) form.JobNo = data.jobNo;

        if (data.route) {
            if (data.route.startPoint) routeData.value.startPoint = data.route.startPoint;
            if (data.route.endPoint) routeData.value.endPoint = data.route.endPoint;
            if (data.route.waypoints) routeData.value.waypoints = data.route.waypoints;
        }

        if (data.cargo) {
            Object.keys(data.cargo).forEach(key => {
                const formKey = `Cargo${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (formKey in form) form[formKey] = data.cargo[key];
            });
        }

        if (data.trailer) {
            Object.keys(data.trailer).forEach(key => {
                const formKey = `Trailer${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (formKey in form) form[formKey] = data.trailer[key];
            });
        }

        showMessage({ status: 'success', message: t('templateLoaded') || 'Template loaded successfully' });
        showTemplateModal.value = false;
    } else {
        showMessage({ status: 'error', message: result.error || t('templateLoadFailed') || 'Failed to load template' });
    }
};

/**
 * Delete route template
 */
const deleteRouteTemplate = async (templateId) => {
    const result = await deleteTemplate(templateId);

    if (result.success) {
        showMessage({ status: 'success', message: t('templateDeleted') || 'Template deleted successfully' });
        await fetchTemplates('planned');
    } else {
        showMessage({ status: 'error', message: result.error || t('templateDeleteFailed') || 'Failed to delete template' });
    }
};

/**
 * Format template date
 */
const formatTemplateDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('today') || 'Today';
    if (diffDays === 1) return t('yesterday') || 'Yesterday';
    if (diffDays < 7) return `${diffDays} ${t('daysAgo') || 'days ago'}`;

    return date.toLocaleDateString();
};
