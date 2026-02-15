<template>
    <div class="routes-page">
        <!-- Search Bar -->
        <div class="routes-top-controls">
            <div class="routes-search-bar">
                <div class="search-controls">
                    <input v-model="searchTerm" @input="handleSearch" :placeholder="t('searchRoutes')"
                        class="search-input" type="text" />
                </div>
            </div>
        </div>


        <!-- Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay">
            <div class="modal-box">
                <h3>{{ t('deleteSurvey') }}</h3>
                <p>{{ t('deleteSurveyDesc') }}</p>
                <div class="modal-actions">
                    <BaseButton variant="secondary" @click="showDeleteModal = false">{{ t('cancel') }}</BaseButton>
                    <BaseButton variant="danger" @click="confirmDelete">{{ t('delete') }}</BaseButton>
                </div>
            </div>
        </div>

        <!-- Selection Actions Bar -->
        <div v-if="selectedRoutes.length > 0" class="selection-actions-bar">
            <div class="selection-info">
                <span>{{ selectedRoutes.length }} {{ t('routesSelected') }}</span>
            </div>
            <div class="selection-actions">
                <BaseButton variant="primary" @click="openFilterView" left-icon="bi bi-map">
                    {{ t('filterOnMap') }}
                </BaseButton>
                <BaseButton variant="secondary" @click="clearSelection">
                    {{ t('clearSelection') }}
                </BaseButton>
            </div>
        </div>

        <BasePanel title="Surveyed Routes" :subtitle="`${filteredRoutes.length} routes found`" elevation="level2">
             <template #header>
                <div class="panel-header-actions">
                    <div class="view-toggle">
                        <BaseButton @click="viewMode = 'table'" :variant="viewMode === 'table' ? 'primary' : 'ghost'"
                            size="small" title="List View">
                            <i class="bi bi-list-ul"></i>
                        </BaseButton>
                        <BaseButton @click="viewMode = 'cards'" :variant="viewMode === 'cards' ? 'primary' : 'ghost'"
                            size="small" title="Card View">
                            <i class="bi bi-grid-3x3-gap"></i>
                        </BaseButton>
                    </div>
                </div>
            </template>

             <!-- Loading Spinner -->
            <div v-if="routesLoading" class="loading-container">
                <div class="spinner"></div>
                <p>{{ t('pleaseWait') }}</p>
            </div>

            <div v-else>
                 <!-- Table View -->
                <!-- List View (Standardized) -->
                <div v-if="viewMode === 'table'" class="routes-list">
                    <div class="routes-list-header selectable-header">
                        <div class="list-col-select">
                            <!-- Optional Select All Checkbox could go here -->
                        </div>
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
                        :selectable="true"
                        :checked="selectedRoutes.includes(route.id)"
                        @navigate="viewRoute(route.id)"
                        @toggle-select="toggleRouteSelection(route.id)"
                        @action="handleCardAction"
                    />
                </div>

                <!-- Card View -->
                <!-- Card View -->
                 <div v-else-if="viewMode === 'cards'" class="cards-grid">
                    <DashboardRouteCard 
                        v-for="(route, index) in paginatedRoutes" 
                        :key="route.id" 
                        :route="formatRouteForCard(route)"
                        class="animate-stagger"
                        :style="{ animationDelay: `${index * 100}ms` }"
                        @click="viewRoute(route.id)"
                        @action="handleCardAction"
                    />
                </div>
            </div>

             <!-- Pagination Controls -->
            <div class="pagination-controls" v-if="totalPages > 1">
                <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">{{ t('previous') }}</button>
                <button v-for="page in totalPages" :key="page" :class="['page-btn', { active: page === currentPage }]"
                    @click="goToPage(page)">
                    {{ page }}
                </button>
                <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">{{ t('next') }}</button>
            </div>

        </BasePanel>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, inject, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import RoutesController from "@/controllers/routes/routes_controller";
import { useAuthStore } from '@/stores/auth';
import { useI18n } from "vue-i18n";
import dashboardRouteCard from '@/components/dashboard/DashboardRouteCard.vue';
import DashboardRouteListItem from '@/components/dashboard/DashboardRouteListItem.vue';
import { useSubscription } from "@/composables/subscription/useSubscription";
import { BaseButton, BasePanel, BaseTable } from '@/components/ui';
import routeUtils from '@/utils/route_utils';

// Alias specifically for usage in template if needed, though direct import works
const DashboardRouteCard = dashboardRouteCard;

const { checkFeatureAccess, getData: getSubscriptionData } = useSubscription();

const { t } = useI18n();
const setGlobalLoading = inject('setGlobalLoading')
const showMessage = inject('showMessage');
const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const currentUserData = computed(() => authStore.user);

const routes = ref([]);
const filteredRoutes = ref([]);

// Selection state
const selectedRoutes = ref([]);

const routesPerPage = 6;
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const paginatedRoutes = ref([]);
const viewMode = ref('table');

const routesLoading = ref(false);

function sortBy(key) {
    if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
    }
    filteredRoutes.value.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];
        // For date, compare as date
        if (key === 'dateAdded') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        } else {
            aVal = (aVal || '').toString().toLowerCase();
            bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
    });
    currentPage.value = 1;
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        getRoutes(page);
    }
}

// Selection functions
const toggleRouteSelection = (routeId) => {
    const index = selectedRoutes.value.indexOf(routeId);
    if (index > -1) {
        selectedRoutes.value.splice(index, 1);
    } else {
        selectedRoutes.value.push(routeId);
    }
};

const clearSelection = () => {
    selectedRoutes.value = [];
};

const openFilterView = () => {
    if (selectedRoutes.value.length === 0) return;

    router.push({
        name: 'RouteFilterView',
        query: { routes: selectedRoutes.value.join(',') }
    });
    // window.open(routeData.href);
};

const showDeleteModal = ref(false);
const routeToDelete = ref(null);

const openDeleteModal = (route) => {
    routeToDelete.value = route;
    showDeleteModal.value = true;
}

const confirmDelete = async () => {
    if (!routeToDelete.value) return;

    setGlobalLoading(true);

    try {
        const res = await RoutesController.removeRoute(routeToDelete.value.id);

        if (res.result) {
            filteredRoutes.value = filteredRoutes.value.filter(r => r.id !== routeToDelete.value.id);
            routes.value = routes.value.filter(r => r.id !== routeToDelete.value.id);
            // Remove from selection if it was selected
            const index = selectedRoutes.value.indexOf(routeToDelete.value.id);
            if (index > -1) {
                selectedRoutes.value.splice(index, 1);
            }
            showDeleteModal.value = false;
            routeToDelete.value = null;
            showMessage({ status: 'success', message: t('deletedSuccessfully') });
        } else {
            showMessage({ status: 'error', message: t('somethingWentWrong') });
        }
    } catch (error) {
        console.log(error);
    }

    setGlobalLoading(false);
}

const getRoutes = async (page = 1) => {
    routesLoading.value = true;
    try {
        const res = await RoutesController.getCurrentUserRoutesPaginated(page, routesPerPage);
        
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

            // For filtering and sorting, we need to maintain the full list
            // This will be updated when we implement server-side filtering
            // routes.value = res.data;
            // filteredRoutes.value = res.data;
        } else {
            paginatedRoutes.value = [];
            routes.value = [];
            filteredRoutes.value = [];
            totalCount.value = 0;
            totalPages.value = 1;
        }
    } catch (error) {
        console.log(error);
        paginatedRoutes.value = [];
        routes.value = [];
        filteredRoutes.value = [];
        totalCount.value = 0;
        totalPages.value = 1;
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    }
    routesLoading.value = false;
}

const getCurrentUserData = async () => {
    try {
        if (!authStore.user) {
             await authStore.fetchUserProfile();
        }
    } catch (error) {
        console.log(error);
    }
}

const getData = async () => {
    setGlobalLoading(true);

    try {

        await Promise.all([getCurrentUserData(), getRoutes(), getSubscriptionData()]);
    } catch (error) {
        console.log(error);
    }

    setGlobalLoading(false);
}

const searchTerm = ref("");

function handleSearch() {
    const term = searchTerm.value.trim().toLowerCase();
    if (!term) {
        filteredRoutes.value = [...routes.value];
        sortBy(sortKey.value); // keep current sort
        return;
    }
    filteredRoutes.value = routes.value.filter(route => {
        return (
            (route.title && route.title.toLowerCase().includes(term)) ||
            (route.start && route.start.toLowerCase().includes(term)) ||
            (route.end && route.end.toLowerCase().includes(term)) ||
            (route.notes && route.notes.toLowerCase().includes(term))
        );
    });
    sortBy(sortKey.value); // keep current sort
    currentPage.value = 1;
}

const formatDate = (dateString) => {
    if (!dateString) return t('noDate');
    return new Date(dateString).toLocaleDateString();
};

const viewRoute = (id) => {
     router.push({ name: 'RouteViewer', params: { id } });
};

const editRoute = (id) => {
    // Implement edit route if needed
};

const handleRowClick = (item) => {
    viewRoute(item.id);
};

const formatRouteForCard = (route) => {
    // console.log('Format Route:', route);
    return {
        id: route.id,
        name: route.name || route.title || route.routeName || 'Untitled Route',
        startLocation: route.start || route.startLocation || 'Unknown',
        endLocation: route.end || route.endLocation || 'Unknown',
        distance: route.distance || 0,
        status: String(route.status || 'surveyed').toLowerCase(),
        updatedAt: route.dateAdded || route.createdAt || route.updatedAt || new Date().toISOString(),
        type: route.type || 'surveyed'
    };
};

const handleCardAction = ({ route, step }) => {
    const routeId = route.id;
    
    switch (step) {
        case 'planned':
            // Even in Surveyed Routes, we might have a linked plan
            // If we have a plannedRouteId, go there, otherwise maybe just view the route
            if (route.plannedRouteId) {
                router.push({ name: 'ViewPlannedRoute', params: { id: route.plannedRouteId } });
            } else {
                viewRoute(routeId);
            }
            break;
            
        case 'surveyed':
             // View the survey/route details
             router.push({ name: 'SurveyExecution', params: { id: routeId } });
            break;
            
        case 'report':
            router.push({ name: 'SurveyReport', params: { id: routeId } });
            break;
            
        case 'share':
            router.push({ name: 'SurveyShare', params: { id: routeId } });
            break;
            
        default:
            viewRoute(routeId);
            break;
    }
};


onMounted(() => {
    getData();
})
</script>

<style scoped>
.routes-page {
    max-width: 1700px;
    margin: 0 auto;
    padding: var(--spacing-md);
}

.routes-top-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    gap: var(--spacing-md);
}

.routes-search-bar {
    flex: 1;
    max-width: 320px;
}

.search-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    width: 100%;
}

.search-input {
    width: 100%;
    padding: 0.7rem 1.2rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border);
    font-size: var(--font-size-base);
    background: var(--bg-surface);
    color: var(--text-primary);
    outline: none;
    transition: border-color var(--transition-normal);
}

.search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-focus-ring);
}

.selection-actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--accent);
    color: white;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-xl);
    margin-bottom: var(--spacing-lg);
    box-shadow: var(--shadow-colored);
}

.selection-info {
    font-weight: 600;
    font-size: 1.1rem;
}

.selection-actions {
    display: flex;
    gap: var(--spacing-md);
}

.panel-header-actions {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}

.view-toggle {
    display: flex;
    gap: 0.25rem;
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
    padding: 0.25rem;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--spacing-lg);
    padding: 0.1rem;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: var(--text-secondary);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border);
    border-top: 4px solid var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.modal-box {
    background: var(--bg-surface);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-xl);
    padding: 2.2rem 2.5rem 1.5rem;
    min-width: 320px;
    max-width: 90vw;
    text-align: center;
    border: 1px solid var(--border);
}

.modal-box h3 {
    margin-bottom: 1rem;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--error);
}

.modal-actions {
    display: flex;
    justify-content: center;
    gap: 1.2rem;
    margin-top: 2rem;
}

.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2.5rem;
    flex-wrap: wrap;
}

.pagination-controls button {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 0.5rem 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-normal);
    margin-bottom: 0.5rem;
}

.pagination-controls button:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
}

.pagination-controls button:disabled {
    background: var(--bg-surface);
    color: var(--text-tertiary);
    cursor: not-allowed;
    border-color: var(--border);
}

.page-btn.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
    box-shadow: var(--shadow-colored);
}

.route-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--accent);
}

.text-danger {
    color: var(--error) !important;
}

.text-secondary {
    color: var(--text-secondary);
}

.actions-col {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

@media (width <= 900px) {
    .routes-page {
        padding: var(--spacing-md);
    }
    
    .routes-top-controls, .search-controls {
        flex-direction: column;
        align-items: stretch;
    }
    
    .routes-search-bar {
        max-width: 100%;
        margin-bottom: 0.5rem;
    }
    
    .selection-actions-bar {
        flex-direction: column;
        gap: 1rem;
    }
    
    .selection-actions {
        width: 100%;
        justify-content: center;
    }
}

/* Standardized List Styles */
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

.routes-list-header.selectable-header {
    grid-template-columns: 40px 1.5fr 2.5fr 0.8fr 0.8fr 1fr;
}

.routes-list-header > div {
    display: flex;
    align-items: center;
}

.list-col-locations { justify-content: flex-start; }
.list-col-distance, .list-col-status { justify-content: center; }
.list-col-actions { justify-content: flex-end; }
.list-col-select { justify-content: center; }

@media (width <= 1200px) {
    .routes-list-header {
        grid-template-columns: 1.5fr 2fr 1fr 1fr;
    }

    .routes-list-header.selectable-header {
        grid-template-columns: 40px 1.5fr 2fr 1fr 1fr;
    }

    .list-col-actions {
        display: none;
    }
}
</style>