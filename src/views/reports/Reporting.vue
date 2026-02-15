<template>
    <div class="reporting">
        <div class="route-selection">
            <BasePanel :title="t('selectRouteToCreateReport')" :subtitle="`${filteredRoutes.length} routes available`" elevation="level2">
                <template #header>
                    <div class="panel-header-actions">
                        <div class="view-toggle">
                            <BaseButton @click="viewMode = 'table'"
                                :variant="viewMode === 'table' ? 'primary' : 'ghost'" size="small" title="List View">
                                <i class="bi bi-list-ul"></i>
                            </BaseButton>
                            <BaseButton @click="viewMode = 'cards'"
                                :variant="viewMode === 'cards' ? 'primary' : 'ghost'" size="small" title="Card View">
                                <i class="bi bi-grid-3x3-gap"></i>
                            </BaseButton>
                        </div>
                    </div>
                </template>

                <div v-if="loadingRoutes" class="d-flex justify-content-center align-items-center p-5">
                    <BaseLoadingIndicator :message="t('loadingRoutes') || 'Loading routes...'" size="large" />
                </div>

                <div v-else-if="paginatedRoutes.length === 0" class="p-5">
                    <BaseEmptyState 
                        icon="bi bi-map" 
                        :title="t('noRoutesFound') || 'No routes found'"
                        :message="t('createRouteFirst') || 'Create your first route to get started'"
                    />
                </div>

                <div v-else>
                    <!-- List View (Standardized) -->
                    <div v-if="viewMode === 'table'" class="routes-list">
                        <div class="routes-list-header">
                            <div class="list-col-info">Route</div>
                            <div class="list-col-locations">Locations</div>
                            <div class="list-col-distance">Distance</div>
                            <div class="list-col-status">Status</div>
                            <div class="list-col-actions">Actions</div>
                        </div>
                        <DashboardRouteListItem 
                            v-for="route in paginatedRoutes" 
                            :key="route.id" 
                            :route="formatRouteForCard(route)"
                            :is-selected="false"
                            @navigate="selectRoute(route)"
                            @action="handleCardAction"
                        />
                    </div>

                    <!-- Card View -->
                    <div v-else-if="viewMode === 'cards'" class="cards-grid">
                        <DashboardRouteCard 
                            v-for="(route, index) in paginatedRoutes" 
                            :key="route.id"
                            :route="formatRouteForCard(route)" 
                            class="animate-stagger"
                            :style="{ animationDelay: `${index * 100}ms` }"
                            @click="selectRoute(route)"
                            @action="handleCardAction" 
                        />
                    </div>
                </div>

                <template #footer>
                     <div class="pagination-controls" v-if="totalPages > 1 && paginatedRoutes.length > 0">
                        <BaseButton variant="ghost" size="small" :disabled="currentPage === 1"
                            @click="goToPage(currentPage - 1)">{{ t('previous') }}</BaseButton>
                        <BaseButton v-for="page in visiblePages" :key="page" variant="ghost" size="small"
                            :class="['page-btn', { active: page === currentPage }]" @click="goToPage(page)">
                            {{ page }}
                        </BaseButton>
                        <BaseButton variant="ghost" size="small" :disabled="currentPage === totalPages"
                            @click="goToPage(currentPage + 1)">{{ t('next') }}</BaseButton>
                    </div>
                </template>
            </BasePanel>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue';
import RoutesController from '@/controllers/routes/routes_controller';
import { useRouter } from 'vue-router';
import { BasePanel, BaseButton, BasePagination, BaseTable, BaseLoadingIndicator, BaseEmptyState } from '@/components/ui';
import dashboardRouteCard from '@/components/dashboard/DashboardRouteCard.vue';
import DashboardRouteListItem from '@/components/dashboard/DashboardRouteListItem.vue';

// Alias specifically for usage in template if needed
const DashboardRouteCard = dashboardRouteCard;

// Inject global functions
const showMessage = inject('showMessage');
const setGlobalLoading = inject('setGlobalLoading');
const router = useRouter();

// Route listing logic
const routes = ref([]);
const filteredRoutes = ref([]);
const loadingRoutes = ref(true);

const routesPerPage = 6;
const currentPage = ref(1);
const viewMode = ref('table');
const totalPages = ref(1);
const totalCount = ref(0);
const paginatedRoutes = ref([]);

// Calculate visible page numbers for pagination
const visiblePages = computed(() => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page numbers

    if (totalPages.value <= maxVisible) {
        // If total pages is less than max visible, show all pages
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i);
        }
    } else {
        // Show pages around current page
        let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages.value, start + maxVisible - 1);

        // Adjust start if we're near the end
        if (end === totalPages.value) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
    }

    return pages;
});

// Reset to first page when routes change
watch(() => routes.value.length, () => {
    currentPage.value = 1;
});

// Fallback translations for missing keys
const t = (key) => {
    const translations = {
        selectRouteToCreateReport: 'Select a Route to Create a Report',
        loadingRoutes: 'Loading routes...',
        noRoutesFound: 'No routes found',
        createRouteFirst: 'Create your first route to get started',
        previous: 'Previous',
        next: 'Next',
    };

    // Try to use existing i18n translation first, fallback to our translations
    try {
        return $t(key) || translations[key] || key;
    } catch {
        return translations[key] || key;
    }
};

function selectRoute(route) {
    // Navigate to the V2 Report UI
    router.push({ name: 'SurveyReport', params: { id: route.id } });
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        getRoutes(page);
    }
}

const getRoutes = async (page = 1) => {
    loadingRoutes.value = true;
    try {
        const res = await RoutesController.getCurrentUserRoutesPaginated(page, routesPerPage);
        console.log('Reporting API Response:', res);

        if (res.result) {
            paginatedRoutes.value = res.data;

            // Handle pagination with fallback for different property names
            if (res.pagination) {
                totalCount.value = res.pagination.TotalCount || res.pagination.totalCount || res.pagination.total_count || 0;
                totalPages.value = res.pagination.TotalPages || res.pagination.totalPages || res.pagination.total_pages || 1;
                currentPage.value = res.pagination.CurrentPage || res.pagination.currentPage || res.pagination.current_page || 1;
            } else {
                // Fallback if no pagination object
                totalCount.value = res.data ? res.data.length : 0;
                totalPages.value = 1;
                currentPage.value = 1;
            }

            // For the reporting page, we need the full list for selection
            routes.value = res.data;
            filteredRoutes.value = res.data;
        } else {
            paginatedRoutes.value = [];
            routes.value = [];
            filteredRoutes.value = [];
            totalCount.value = 0;
            totalPages.value = 1;
        }
    } catch (error) {
        console.error('Error loading routes:', error);
        paginatedRoutes.value = [];
        routes.value = [];
        totalCount.value = 0;
        totalPages.value = 1;
        showMessage({ status: 'error', message: 'Error loading routes' });
    } finally {
        loadingRoutes.value = false;
    }
}

const formatRouteForCard = (route) => {
    return {
        id: route.id,
        name: route.title || route.SurveyName || 'Untitled Route',
        startLocation: route.start || route.SurveyStart || route.startLocation || 'Unknown',
        endLocation: route.end || route.SurveyEnd || route.endLocation || 'Unknown',
        distance: route.distance || route.Distance || 0,
        status: route.status || 'surveyed',
        updatedAt: route.dateAdded || route.SurveyDate,
        type: 'reporting',
        // Pass through raw data for map coordinates extraction
        ...route
    };
};

const handleCardAction = ({ route, step }) => {
    // If the card is clicked or an action is triggered, select the route for reporting
    selectRoute(route);
};

onMounted(async () => {
    try {
        await getRoutes(1);
    } catch (error) {
        console.error('Error loading routes:', error);
        showMessage({ status: 'error', message: 'Error loading routes' });
    }
});
</script>

<style scoped>
.reporting {
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    color: var(--text-primary);
    max-width: 1700px;
    margin: 0 auto;
}

.route-selection {
    width: 100%;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--spacing-lg);
    padding: 0.1rem;
}

/* Pagination container styling */
.pagination-controls {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    padding-top: var(--spacing-md);
}

.page-btn.active {
    background: var(--accent) !important;
    color: white !important;
    border-color: var(--accent) !important;
}

.routes-list {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    overflow: hidden;
}

.routes-list-header {
    display: grid;
    grid-template-columns: 1.5fr 2.5fr 0.8fr 0.8fr 1fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    font-size: var(--font-size-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
}

.routes-list-header > div {
    display: flex;
    align-items: center;
}

.list-col-locations { justify-content: flex-start; }
.list-col-distance, .list-col-status { justify-content: center; }
.list-col-actions { justify-content: flex-end; }

@media (width <= 1200px) {
    .routes-list-header {
        grid-template-columns: 1.5fr 2fr 1fr 1fr;
    }

    .list-col-actions {
        display: none !important;
    }
}
</style>