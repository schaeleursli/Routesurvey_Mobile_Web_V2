<template>
    <div class="add-planned-route-new">
        <!-- Header -->
        <div class="route-viewer-header">
            <div class="row">
                <div class="col-md-8 text-left">
                    <h5>{{ t('addPlannedRoute') }}</h5>
                    <p class="text-muted">{{ t('addPlannedRouteDesc') }}</p>
                </div>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Center Content - Map and Form -->
            <div class="center-content">
                <!-- Route Map Section -->
                <div class="elevated-card">
                    <div class="form-section">
                        <h3>{{ t('routeDetails') }}</h3>
                        <p class="section-description">{{ t('routeMapDescription') }}</p>

                        <div class="map-container">
                            <PlannedRouteMapRefactored v-model="routeData" height="600px" />
                        </div>

                        <!-- Route Summary -->
                        <div v-if="routeData.routeInfo || routeData.startPoint || routeData.endPoint"
                            class="route-summary">
                            <div class="summary-item">
                                <strong>{{ t('startPoint') }}:</strong>
                                <span v-if="routeData.startPoint">
                                    <span v-if="routeData.startPoint.loading" class="loading-address">
                                        <div class="loading-spinner-small"></div>
                                        {{ t('gettingAddress') }}
                                    </span>
                                    <span v-else>{{ formatLocation(routeData.startPoint) }}</span>
                                </span>
                                <span v-else class="no-data">{{ t('noStartPoint') }}</span>
                            </div>
                            <div class="summary-item">
                                <strong>{{ t('endPoint') }}:</strong>
                                <span v-if="routeData.endPoint">
                                    <span v-if="routeData.endPoint.loading" class="loading-address">
                                        <div class="loading-spinner-small"></div>
                                        {{ t('gettingAddress') }}
                                    </span>
                                    <span v-else>{{ formatLocation(routeData.endPoint) }}</span>
                                </span>
                                <span v-else class="no-data">{{ t('noEndPoint') }}</span>
                            </div>
                            <div v-if="routeData.routeInfo" class="summary-item">
                                <strong>{{ t('totalDistance') }}:</strong>
                                <span>{{ formatDistance(routeData.routeInfo.distance) }}</span>
                            </div>
                            <div v-if="routeData.routeInfo" class="summary-item">
                                <strong>{{ t('estimatedTime') }}:</strong>
                                <span>{{ formatTime(routeData.routeInfo.duration) }}</span>
                            </div>
                            <div class="summary-item">
                                <strong>{{ t('waypoints') }}:</strong>
                                <span>{{ routeData.waypoints.length }}</span>
                            </div>

                            <!-- Detailed Address Information -->
                            <div v-if="routeData.startPoint?.address || routeData.endPoint?.address"
                                class="address-details">
                                <h4>{{ t('addressDetails') }}</h4>
                                <div v-if="routeData.startPoint?.address" class="address-item">
                                    <strong>{{ t('startAddress') }}:</strong>
                                    <div class="address-breakdown">
                                        <span v-if="routeData.startPoint.address.address?.house_number">{{
                                            routeData.startPoint.address.address.house_number }} </span>
                                        <span v-if="routeData.startPoint.address.address?.road">{{
                                            routeData.startPoint.address.address.road }}, </span>
                                        <span v-if="routeData.startPoint.address.address?.suburb">{{
                                            routeData.startPoint.address.address.suburb }}, </span>
                                        <span v-if="routeData.startPoint.address.address?.city">{{
                                            routeData.startPoint.address.address.city }}, </span>
                                        <span v-if="routeData.startPoint.address.address?.state">{{
                                            routeData.startPoint.address.address.state }}, </span>
                                        <span v-if="routeData.startPoint.address.address?.postcode">{{
                                            routeData.startPoint.address.address.postcode }}, </span>
                                        <span v-if="routeData.startPoint.address.address?.country">{{
                                            routeData.startPoint.address.address.country }}</span>
                                    </div>
                                </div>
                                <div v-if="routeData.endPoint?.address" class="address-item">
                                    <strong>{{ t('endAddress') }}:</strong>
                                    <div class="address-breakdown">
                                        <span v-if="routeData.endPoint.address.address?.house_number">{{
                                            routeData.endPoint.address.address.house_number }} </span>
                                        <span v-if="routeData.endPoint.address.address?.road">{{
                                            routeData.endPoint.address.address.road }}, </span>
                                        <span v-if="routeData.endPoint.address.address?.suburb">{{
                                            routeData.endPoint.address.address.suburb }}, </span>
                                        <span v-if="routeData.endPoint.address.address?.city">{{
                                            routeData.endPoint.address.address.city }}, </span>
                                        <span v-if="routeData.endPoint.address.address?.state">{{
                                            routeData.endPoint.address.address.state }}, </span>
                                        <span v-if="routeData.endPoint.address.address?.postcode">{{
                                            routeData.endPoint.address.address.postcode }}, </span>
                                        <span v-if="routeData.endPoint.address.address?.country">{{
                                            routeData.endPoint.address.address.country }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Right Sidebar - Form and Route Information -->
            <div class="right-sidebar">
                <!-- Scrollable Content -->
                <div class="sidebar-content">
                    <!-- Form Section -->
                    <div class="elevated-card mt-2">
                        <form @submit.prevent="handleSubmit" class="planned-route-form">
                            <!-- Survey Information -->
                            <div class="form-section">
                                <h3>{{ t('surveyDetails') }}</h3>

                                <div class="form-group">
                                    <label for="surveyName">{{ t('surveyName') }} *</label>
                                    <input id="surveyName" v-model="form.SurveyName" type="text"
                                        :placeholder="t('enterSurveyName')" required class="form-control" />
                                </div>

                                <div class="form-group">
                                    <label for="surveyDate">{{ t('surveyDate') }} *</label>
                                    <input id="surveyDate" v-model="form.SurveyDate" type="date" required
                                        class="form-control" />
                                </div>

                                <div class="form-group">
                                    <label for="clientName">{{ t('clientName') }} *</label>
                                    <input id="clientName" v-model="form.ClientName" type="text"
                                        :placeholder="t('enterClientName')" required class="form-control" />
                                </div>

                                <div class="form-group">
                                    <label for="surveyInstructions">{{ t('surveyInstructions') }} *</label>
                                    <textarea id="surveyInstructions" v-model="form.SurveyInstructions"
                                        :placeholder="t('enterSurveyInstructions')" rows="3" required
                                        class="form-control"></textarea>
                                </div>
                            </div>

                            <!-- Cargo Information -->
                            <div class="form-section">
                                <h3>{{ t('cargoDetails') }}</h3>

                                <div class="form-group">
                                    <label for="cargoType">{{ t('cargoType') }} *</label>
                                    <input id="cargoType" v-model="form.CargoType" type="text"
                                        :placeholder="t('enterCargoType')" required class="form-control" />
                                </div>

                                <div class="form-group">
                                    <label for="cargoWeight">{{ t('cargoWeight') }} *</label>
                                    <input id="cargoWeight" v-model="form.CargoWeight" type="number" step="any"
                                        :placeholder="t('enterCargoWeight')" required class="form-control" />
                                </div>

                                <div class="form-group">
                                    <label for="cargoLength">{{ t('cargoLength') }} *</label>
                                    <input id="cargoLength" v-model="form.CargoLength" type="number" step="any"
                                        :placeholder="t('enterCargoLength')" required class="form-control" />
                                </div>

                                <div class="form-group">
                                    <label for="cargoWidth">{{ t('cargoWidth') }} *</label>
                                    <input id="cargoWidth" v-model="form.CargoWidth" type="number" step="any"
                                        :placeholder="t('enterCargoWidth')" required class="form-control" />
                                </div>

                                <div class="form-group">
                                    <label for="cargoHeight">{{ t('cargoHeight') }} *</label>
                                    <input id="cargoHeight" v-model="form.CargoHeight" type="number" step="any"
                                        :placeholder="t('enterCargoHeight')" required class="form-control" />
                                </div>

                                <div class="form-group">
                                    <label for="cargoNotes">{{ t('cargoNotes') }} *</label>
                                    <textarea id="cargoNotes" v-model="form.CargoNotes"
                                        :placeholder="t('enterCargoNotes')" rows="2" required
                                        class="form-control"></textarea>
                                </div>
                            </div>

                            <!-- Trailer Information -->
                            <div class="form-section">
                                <h3>{{ t('trailerDetails') }}</h3>

                                <div class="form-group">
                                    <label for="trailerType">{{ t('trailerType') }} *</label>
                                    <input id="trailerType" v-model="form.TrailerType" type="text"
                                        :placeholder="t('enterTrailerType')" required class="form-control" />
                                </div>

                                <div class="form-group">
                                    <label for="trailerLength">{{ t('trailerLength') }} *</label>
                                    <input id="trailerLength" v-model="form.TrailerLength" type="number" step="any"
                                        :placeholder="t('enterTrailerLength')" required class="form-control" />
                                </div>

                                <div class="form-group">
                                    <label for="trailerNotes">{{ t('trailerNotes') }} *</label>
                                    <textarea id="trailerNotes" v-model="form.TrailerNotes"
                                        :placeholder="t('enterTrailerNotes')" rows="2" required
                                        class="form-control"></textarea>
                                </div>
                            </div>

                        </form>
                    </div>

                    <!-- Route Information -->
                    <div class="elevated-card">
                        <div class="section-header">
                            <h3>{{ t('routeInformation') }}</h3>
                        </div>
                        <div class="route-info-section">
                            <div class="info-row">
                                <span><b>{{ t('startPoint') }}:</b></span>
                                <span v-if="routeData.startPoint">
                                    <span v-if="routeData.startPoint.loading" class="loading-address">
                                        <div class="loading-spinner-small"></div>
                                        {{ t('gettingAddress') }}
                                    </span>
                                    <span v-else>{{ formatLocation(routeData.startPoint) }}</span>
                                </span>
                                <span v-else class="no-data">{{ t('noStartPoint') }}</span>
                            </div>
                            <div class="info-row">
                                <span><b>{{ t('endPoint') }}:</b></span>
                                <span v-if="routeData.endPoint">
                                    <span v-if="routeData.endPoint.loading" class="loading-address">
                                        <div class="loading-spinner-small"></div>
                                        {{ t('gettingAddress') }}
                                    </span>
                                    <span v-else>{{ formatLocation(routeData.endPoint) }}</span>
                                </span>
                                <span v-else class="no-data">{{ t('noEndPoint') }}</span>
                            </div>
                            <div v-if="routeData.routeInfo" class="info-row">
                                <span><b>{{ t('totalDistance') }}:</b></span>
                                <span>{{ formatDistance(routeData.routeInfo.distance) }}</span>
                            </div>
                            <div v-if="routeData.routeInfo" class="info-row">
                                <span><b>{{ t('estimatedTime') }}:</b></span>
                                <span>{{ formatTime(routeData.routeInfo.duration) }}</span>
                            </div>
                            <div class="info-row">
                                <span><b>{{ t('waypoints') }}:</b></span>
                                <span>{{ routeData.waypoints.length }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar Footer -->
                <div class="sidebar-footer">
                    <div class="footer-actions">
                        <button type="button" class="btn btn-secondary me-2" @click="handleCancel">
                            {{ t('cancel') }}
                        </button>
                        <button type="button" class="btn btn-primary" :disabled="isSubmitting" @click="handleSubmit">
                            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"
                                aria-hidden="true"></span>
                            {{ t('saveRoute') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import { useRouter } from "vue-router";
import { usePlannedRoutes } from "@/composables/usePlannedRoutes";
import { useI18n } from "vue-i18n";
import PlannedRouteMapRefactored from "@/components/planned_routes/PlannedRouteMapRefactored.vue";

const { t } = useI18n();
const router = useRouter();
const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

const { addPlannedRoute, addForm, validateAddForm, clearAddForm } = usePlannedRoutes();

const loading = ref(false);

const form = addForm;

// Route data from the map component
const routeData = ref({
    startPoint: null,
    endPoint: null,
    waypoints: [],
    routePath: [],
    routeInfo: null
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
        routeData.value.startPoint &&
        routeData.value.endPoint;
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

const formatDistance = (meters) => {
    if (!meters) return '0m';
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    } else {
        return `${(meters / 1000).toFixed(1)}km`;
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
                routeInfo: null
            };
            router.push('/planned-routes');
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
    // Navigate to Dashboard as the home/navigation root
    router.push({ name: 'Dashboard' });
};

const handleCancel = () => {
    // Navigate to Dashboard as the home/navigation root
    router.push({ name: 'Dashboard' });
};
</script>

<style scoped>
.add-planned-route-new {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    overflow-y: auto;
}

.route-viewer-header {
    padding: 0.5rem 1.5rem 0.25rem;
    background: var(--bs-body-bg);
    border-bottom: 1px solid var(--bs-border-color);
}

.route-viewer-header h5 {
    margin: 0 0 0.25rem;
    color: var(--bs-body-color);
    font-size: 1.25rem;
    font-weight: 600;
}

.route-viewer-header .text-muted {
    margin: 0;
    font-size: 0.9rem;
}

.main-content {
    flex: 1;
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    min-height: 0;
}

.center-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0.5rem 0.25rem 0;
    overflow-y: auto;
    max-height: calc(100vh - 120px);
}

.right-sidebar {
    width: 500px;
    background: var(--bs-body-bg);
    margin: 0.5rem 0 0 1rem;
    max-height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
}

.sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
}

.sidebar-footer {
    background: var(--bs-body-bg);
    border-top: 1px solid var(--bs-border-color);
    padding: 1rem 1.5rem;
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    z-index: 10;
}

.footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.map-container {
    height: 500px;
    min-height: 400px;
    position: relative;
    background: var(--bs-tertiary-bg);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--bs-border-color);
    overflow: hidden;
}

.map-container :deep(.leaflet-container) {
    height: 100% !important;
    width: 100% !important;
    border-radius: 8px;
}

.map-container :deep(.leaflet-map-pane),
.map-container :deep(.leaflet-tile-pane),
.map-container :deep(.leaflet-overlay-pane) {
    border-radius: 8px;
}

.map-container :deep(.leaflet-control-container) {
    border-radius: 8px;
}

.elevated-card {
    background: var(--bs-body-bg);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%), 0 2px 4px rgb(0 0 0 / 6%);
    border: 1px solid var(--bs-border-color);
    padding: 2rem;
    margin-bottom: 1.5rem;
    transition: all 0.3s ease;
}

.planned-route-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    border: 1px solid var(--bs-border-color);
    border-radius: 12px;
    padding: 1.5rem;
    background: var(--bs-body-bg);
    margin-bottom: 1.5rem;
}

.form-section h3 {
    margin: 0 0 1rem;
    color: var(--bs-body-color);
    font-size: 1.2rem;
    font-weight: 600;
    border-bottom: 2px solid var(--bs-primary);
    padding-bottom: 0.5rem;
}

.section-description {
    margin: 0 0 1rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.4;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-group label {
    font-weight: 700;
    color: var(--bs-body-color);
    font-size: 1rem;
}

.form-control {
    width: 100%;
    padding: 0.7rem 1rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    transition: border-color 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
}

.form-control::placeholder {
    color: var(--text-tertiary);
}

.route-summary {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--bs-tertiary-bg);
    border-radius: 8px;
    border: 1px solid var(--bs-border-color);
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--bs-border-color);
}

.summary-item:last-child {
    border-bottom: none;
}

.summary-item strong {
    color: var(--bs-body-color);
    font-weight: 600;
}

.summary-item span {
    color: var(--text-secondary);
}

.no-data {
    color: var(--text-tertiary) !important;
    font-style: italic;
}

.loading-address {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
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
    border-top: 1px solid var(--bs-border-color);
}

.address-details h4 {
    margin: 0 0 0.5rem;
    color: var(--bs-body-color);
    font-size: 1rem;
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
    margin-bottom: 0.25rem;
    color: var(--bs-body-color);
    font-weight: 600;
    font-size: 0.9rem;
}

.address-breakdown {
    color: var(--text-secondary);
    font-size: 0.85rem;
    line-height: 1.4;
    padding-left: 0.5rem;
    border-left: 2px solid var(--bs-border-color);
}

.address-breakdown span:last-child {
    color: var(--text-tertiary);
}

/* Section Header Styles */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem 0.5rem;
    cursor: pointer;
    border-bottom: 1px solid var(--bs-border-color);
    margin-bottom: 1rem;
}

.section-header h3 {
    margin: 0;
    color: var(--bs-body-color);
    font-size: 1.1rem;
    font-weight: 600;
}

.section-header i {
    color: var(--text-secondary);
    font-size: 1rem;
    transition: transform 0.2s ease;
}

/* Info Row Styles */
.info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--bs-border-color);
    gap: 1rem;
}

.info-row:last-child {
    border-bottom: none;
}

.info-row span:first-child {
    color: var(--bs-body-color);
    font-weight: 600;
    min-width: 120px;
}

.info-row span:last-child {
    color: var(--text-secondary);
    text-align: right;
    flex: 1;
}

/* Route Info Section */
.route-info-section,
.form-summary-section {
    padding: 0 1.5rem 1.5rem;
}


.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: var(--bs-primary);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--bs-primary-dark);
    transform: translateY(-1px);
}

.btn-secondary {
    background: var(--bs-secondary);
    color: white;
}

.btn-secondary:hover {
    background: var(--bs-secondary-dark);
    transform: translateY(-1px);
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentcolor;
    border-radius: 50%;
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

/* Responsive design */
@media (width <= 1400px) {
    .right-sidebar {
        width: 450px;
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
        padding: 0.5rem;
    }

    .center-content {
        margin: 0;
        max-height: none;
        overflow-y: visible;
    }

    .right-sidebar {
        width: 100%;
        height: auto;
        max-height: none;
        margin: 0;
    }

    .sidebar-content {
        padding: 0.25rem;
    }

    .sidebar-footer {
        padding: 0.75rem 1rem;
    }

    .footer-actions {
        flex-direction: column;
        gap: 0.5rem;
    }

    .elevated-card {
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .form-section {
        padding: 1rem;
    }

    .map-container {
        height: 400px;
        min-height: 300px;
        padding: 0.5rem;
    }
}

@media (width <= 768px) {
    .add-planned-route-new {
        height: auto;
        min-height: 100vh;
    }

    .main-content {
        padding: 0.25rem;
    }

    .center-content {
        max-height: none;
        overflow-y: visible;
    }

    .elevated-card {
        padding: 0.75rem;
    }

    .form-section {
        padding: 0.75rem;
    }


    .btn {
        width: 100%;
        justify-content: center;
    }

    .route-viewer-header {
        padding: 0.5rem 1rem 0.25rem;
    }

    .route-viewer-header h5 {
        font-size: 1.1rem;
    }

    .route-viewer-header .text-muted {
        font-size: 0.85rem;
    }

    .map-container {
        height: 300px;
        min-height: 250px;
        padding: 0.5rem;
    }

    .right-sidebar {
        max-height: none;
    }

    .sidebar-content {
        padding: 0.25rem;
    }

    .sidebar-footer {
        padding: 0.5rem 0.75rem;
    }

    .footer-actions {
        flex-direction: column;
        gap: 0.5rem;
    }

    .section-header {
        padding: 0.75rem 1rem 0.5rem;
    }

    .route-info-section,
    .form-summary-section {
        padding: 0 1rem 1rem;
    }

    .info-row {
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-row span:first-child {
        min-width: auto;
    }

    .info-row span:last-child {
        text-align: left;
    }
}
</style>