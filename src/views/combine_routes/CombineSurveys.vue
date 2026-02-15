<template>
    <div class="combine-surveys-page">
        <!-- Page Header -->
        <!-- <div class="page-header">
            <h1 class="page-title">Combine Surveys</h1>
            <div class="header-actions">
                <BaseButton variant="secondary" @click="goBack" left-icon="bi bi-arrow-left">
                    Back
                </BaseButton>
            </div>
        </div> -->

        <!-- Main Content -->
        <div class="main-content">
            <!-- Left Panel: Select Surveys to Combine -->
            <BasePanel title="Select Surveys to Combine" elevation="level2" class="left-panel">
                <template #header>
                    <div class="search-container">
                        <i class="bi bi-search search-icon"></i>
                        <input v-model="searchTerm" @input="handleSearch" placeholder="Search surveys..."
                            class="search-input" type="text" />
                    </div>
                </template>

                <div class="surveys-list">
                    <div v-if="loading" class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading surveys...</p>
                    </div>

                    <div v-else-if="paginatedSurveys.length === 0" class="empty-state">
                        <i class="bi bi-map"></i>
                        <h3>No surveys found</h3>
                        <p>No surveys match your search criteria</p>
                    </div>

                    <div v-else class="surveys-list-container">
                        <BaseCard v-for="survey in paginatedSurveys" :key="survey.id"
                            :variant="selectedSurveys.includes(survey.id) ? 'success' : 'default'" :interactive="true"
                            :hover="true" @click="toggleSurveySelection(survey.id)" class="survey-card">
                            <div class="survey-row">
                                <div class="survey-checkbox">
                                    <input type="checkbox" :checked="selectedSurveys.includes(survey.id)"
                                        @click.stop="toggleSurveySelection(survey.id)" class="survey-checkbox-input" />
                                </div>

                                <div class="survey-name">
                                    <div class="survey-title">{{ survey.title || 'Untitled Survey' }}</div>
                                </div>

                                <div class="survey-location">
                                    <div class="location-text">
                                        <div class="start-location">{{ survey.start }}</div>
                                        <div class="end-location">{{ survey.end }}</div>
                                    </div>
                                </div>

                                <div class="survey-distance">
                                    <div class="distance-text">{{ formatDistance(survey.distance) }}</div>
                                </div>

                                <div class="survey-date">
                                    <div class="date-text">{{ formatDate(survey.dateAdded) }}</div>
                                </div>
                            </div>
                        </BaseCard>
                    </div>
                </div>

                <template #footer>
                    <BasePagination :current-page="currentPage" :total-pages="totalPages"
                        :total-items="filteredSurveys.length" :items-per-page="surveysPerPage" item-label="surveys"
                        @page-change="goToPage" />
                </template>
            </BasePanel>

            <!-- Right Panel: Combination Preview -->
            <BasePanel title="Combination Preview" elevation="level2" class="right-panel">
                <div class="preview-content">
                    <div class="selected-surveys-section">
                        <h3>Selected Surveys Order:</h3>
                        <div v-if="selectedSurveysData.length === 0" class="no-selection">
                            <p>No surveys selected</p>
                        </div>
                        <div v-else class="selected-surveys-list">
                            <BaseCard v-for="(survey, index) in selectedSurveysData" :key="survey.id" variant="default"
                                class="selected-survey-card">
                                <div class="selected-survey-item">
                                    <div class="survey-order">{{ index + 1 }}</div>
                                    <div class="survey-info">
                                        <div class="survey-title">{{ survey.title || 'Untitled Survey' }}</div>
                                        <div class="survey-distance">{{ formatDistance(survey.distance) }}</div>
                                    </div>
                                </div>
                            </BaseCard>
                        </div>
                    </div>

                    <BaseCard variant="default" class="summary-card">
                        <div class="summary-content">
                            <div class="card-icon">
                                <i class="bi bi-arrow-left-right"></i>
                            </div>
                            <div class="card-content">
                                <div class="card-label">Total Distance</div>
                                <div class="card-value">{{ formatDistance(totalDistance) }}</div>
                            </div>
                        </div>
                    </BaseCard>

                </div>

                <template #footer>
                    <div class="action-buttons">
                        <BaseButton variant="secondary" @click="cancelCombine">
                            Cancel
                        </BaseButton>
                        <BaseButton variant="primary" @click="combineSurveys" :disabled="selectedSurveys.length < 2">
                            Combine Surveys
                        </BaseButton>
                    </div>
                </template>
            </BasePanel>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import RoutesController from '@/controllers/routes/routes_controller';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BasePanel from '@/components/ui/BasePanel.vue';
import BasePagination from '@/components/ui/BasePagination.vue';

const { t } = useI18n();
const router = useRouter();
const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

// State
const surveys = ref([]);
const filteredSurveys = ref([]);
const selectedSurveys = ref([]);
const loading = ref(false);
const searchTerm = ref('');

// Pagination
const surveysPerPage = 3;
const currentPage = ref(1);
const totalPages = ref(1);
const paginatedSurveys = ref([]);

// List view configuration - no table columns needed

// Computed properties
const selectedSurveysData = computed(() => {
    return surveys.value.filter(survey => selectedSurveys.value.includes(survey.id));
});

const totalDistance = computed(() => {
    return selectedSurveysData.value.reduce((total, survey) => total + (survey.distance || 0), 0);
});


// Methods
const loadSurveys = async () => {
    loading.value = true;
    try {
        const res = await RoutesController.getCurrentUserRoutesPaginated(1, 100); // Load more surveys

        if (res.result && res.data) {
            surveys.value = res.data;
            filteredSurveys.value = res.data;
            updatePagination();
        } else {
            surveys.value = [];
            filteredSurveys.value = [];
            paginatedSurveys.value = [];
        }
    } catch (error) {
        console.error('Error loading surveys:', error);
        showMessage({ status: 'error', message: 'Failed to load surveys' });
        surveys.value = [];
        filteredSurveys.value = [];
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    const term = searchTerm.value.trim().toLowerCase();
    if (!term) {
        filteredSurveys.value = [...surveys.value];
    } else {
        filteredSurveys.value = surveys.value.filter(survey => {
            return (
                (survey.title && survey.title.toLowerCase().includes(term)) ||
                (survey.start && survey.start.toLowerCase().includes(term)) ||
                (survey.end && survey.end.toLowerCase().includes(term)) ||
                (survey.notes && survey.notes.toLowerCase().includes(term))
            );
        });
    }

    // Reset to first page and update pagination
    currentPage.value = 1;
    updatePagination();
};

const updatePagination = () => {
    totalPages.value = Math.ceil(filteredSurveys.value.length / surveysPerPage);
    const startIndex = (currentPage.value - 1) * surveysPerPage;
    const endIndex = startIndex + surveysPerPage;
    paginatedSurveys.value = filteredSurveys.value.slice(startIndex, endIndex);
};

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        updatePagination();
    }
};

const toggleSurveySelection = (surveyId) => {
    const index = selectedSurveys.value.indexOf(surveyId);
    if (index > -1) {
        selectedSurveys.value.splice(index, 1);
    } else {
        selectedSurveys.value.push(surveyId);
    }
};

const handleRowClick = (item) => {
    toggleSurveySelection(item.id);
};

const formatDistance = (distance) => {
    if (!distance) return 'N/A';
    const distanceInKm = Number(distance) / 1000.0;
    return `${distanceInKm.toFixed(1)} km`;
};

const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};


const combineSurveys = () => {
    if (selectedSurveys.value.length < 2) {
        showMessage({ status: 'warning', message: 'Please select at least 2 surveys to combine' });
        return;
    }

    // Navigate to RouteFilterView with selected surveys for filtering/combining
    router.push({
        name: 'RouteFilterView',
        query: {
            routes: selectedSurveys.value.join(',')
        }
    });
};

const cancelCombine = () => {
    // Navigate to Dashboard as the home/navigation root
    router.push({ name: 'Dashboard' });
};

const goBack = () => {
    // Navigate to Dashboard as the home/navigation root
    router.push({ name: 'Dashboard' });
};

// Lifecycle
onMounted(() => {
    loadSurveys();
});
</script>

<style scoped>
/* Design System Implementation */
.combine-surveys-page {
    padding: 1rem;
    max-width: 1700px;
    margin: 0 auto;
    min-height: 100vh;
    color: var(--text-primary);
}

/* Page Header - Design System Typography */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
}

.page-title {
    font-size: 48px;

    /* Display Heading (H1) */
    font-weight: 700;
    letter-spacing: -0.5%;
    color: var(--text-primary);
    margin: 0;
}

/* Main Content Layout */
.main-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    min-height: 500px;
}

/* Left Panel */
.left-panel {
    display: flex;
    flex-direction: column;
}

/* Search Container */
.search-container {
    position: relative;
    margin-bottom: var(--spacing-md);
}

.search-icon {
    position: absolute;
    left: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    z-index: 1;
    font-size: 14px;
}

.search-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 2rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 14px;
    background: var(--bg-surface);
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s ease;
}

.search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgb(0 167 225 / 10%);
}

/* Surveys List */
.surveys-list {
    flex: 1;
    margin-bottom: var(--spacing-md);
}

.surveys-list-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.survey-card {
    transition: all 0.2s ease;
}

.survey-row {
    display: grid;
    grid-template-columns: 40px 1fr 1fr 100px 120px;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    align-items: center;
}

.survey-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
}

.survey-name {
    display: flex;
    align-items: center;
    min-width: 0;
}

.survey-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

.survey-location {
    display: flex;
    align-items: center;
    min-width: 0;
}

.location-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
}

.start-location,
.end-location {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.start-location {
    color: var(--success);
}

.end-location {
    color: var(--error);
}

.survey-distance {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-width: 100px;
}

.distance-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
}

.survey-date {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-width: 120px;
}

.date-text {
    font-size: 14px;
    color: var(--text-secondary);
}

.survey-checkbox-input {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

/* Location Text Styling */
.location-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.start-location {
    font-size: 13px;
    color: var(--success);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.end-location {
    font-size: 13px;
    color: var(--error);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.distance-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
}

.date-text {
    font-size: 14px;
    color: var(--text-secondary);
}

/* Pagination Controls - Now handled by BasePagination component */

/* Right Panel */
.right-panel {
    display: flex;
    flex-direction: column;
}

.preview-content {
    padding: 1rem;
    flex: 1;
    overflow-y: auto;
}

/* Selected Surveys Section */
.selected-surveys-section {
    margin-bottom: var(--spacing-xl);
}

.selected-surveys-section h3 {
    font-size: 24px;

    /* Panel Title (H3) */
    font-weight: 600;
    letter-spacing: 0%;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-md) 0;
}

.no-selection {
    padding: var(--spacing-xl);
    text-align: center;
    color: var(--text-secondary);
    background: var(--bg-elevated);
    border-radius: 12px;
    border: 2px dashed var(--border);
}

.selected-surveys-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.selected-survey-card {
    margin-bottom: var(--spacing-sm);
}

.selected-survey-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.survey-order {
    width: 24px;
    height: 24px;
    background: var(--accent);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 13px;
}

.survey-info {
    flex: 1;
}

.survey-title {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
    font-size: 14px;
}

.survey-distance {
    font-size: 13px;
    color: var(--text-secondary);
}

/* Summary Card */
.summary-card {
    margin-bottom: var(--spacing-xl);
}

.summary-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.card-icon {
    width: 40px;
    height: 40px;
    background: var(--accent);
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.card-content {
    flex: 1;
}

.card-label {
    font-size: 13px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.2%;
    margin-bottom: 2px;
    font-weight: 500;
}

.card-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
}

/* Action Buttons */
.action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
}

/* Loading and Empty States */
.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2xl);
    color: var(--text-secondary);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border);
    border-top: 4px solid var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-md);
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.empty-state i {
    font-size: 48px;
    margin-bottom: var(--spacing-md);
    color: var(--text-secondary);
}

.empty-state h3 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
}

.empty-state p {
    margin: 0;
    text-align: center;
    font-size: 16px;
    color: var(--text-secondary);
}

/* Responsive Design */
@media (width <= 1200px) {
    .main-content {
        gap: var(--spacing-xl);
    }
}

@media (width <= 768px) {
    .combine-surveys-page {
        padding: 1rem;
    }

    .page-header {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: stretch;
    }

    .page-title {
        font-size: 32px;

        /* Section Heading (H2) for mobile */
    }

    .survey-row {
        grid-template-columns: 30px 1fr 1fr 80px 100px;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs);
    }

    .survey-checkbox {
        min-width: 30px;
    }

    .survey-distance {
        min-width: 80px;
    }

    .survey-date {
        min-width: 100px;
    }

    .action-buttons {
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    /* Pagination controls now handled by BasePagination component */
}

@media (width <= 480px) {
    .page-title {
        font-size: 24px;

        /* Panel Title (H3) for small mobile */
    }

    .survey-row {
        grid-template-columns: 25px 1fr 1fr 70px 80px;
        gap: 4px;
        padding: var(--spacing-xs);
    }

    .survey-checkbox {
        min-width: 25px;
    }

    .survey-distance {
        min-width: 70px;
    }

    .survey-date {
        min-width: 80px;
    }

    .survey-title,
    .distance-text,
    .date-text {
        font-size: 13px;
    }

    .start-location,
    .end-location {
        font-size: 12px;
    }

    .preview-content {
        padding: var(--spacing-md);
    }

    .summary-content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-sm);
    }

    .card-icon {
        width: 32px;
        height: 32px;
        font-size: 14px;
    }

    .card-value {
        font-size: 16px;
    }
}
</style>
