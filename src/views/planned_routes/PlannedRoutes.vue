<template>
    <div class="routes-page">
        <!-- Search Bar and Add Button Row -->
        <div class="routes-top-controls">
            <!-- Search is now global in the top bar -->
            <div class="spacer"></div>
            <!-- Primary action moved to FAB -->
        </div>

        <!-- Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay">
            <div class="modal-box">
                <h3>{{ t('deletePlannedRoute') }}</h3>
                <p>{{ t('deletePlannedRouteDesc') }}</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" @click="showDeleteModal = false">{{ t('cancel') }}</button>
                    <button class="btn btn-danger" @click="confirmDelete">{{ t('delete') }}</button>
                </div>
            </div>
        </div>

        <!-- Archive Confirmation Modal -->
        <div v-if="showArchiveModal" class="modal-overlay">
            <div class="modal-box">
                <h3>{{ t('archivePlannedRoute') }}</h3>
                <p>{{ t('archivePlannedRoute') }}?</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" @click="showArchiveModal = false">
                        {{ t('cancel') }}
                    </button>
                    <button class="btn btn-warning" @click="confirmArchive">
                        {{ t('archivePlannedRoute') }}
                    </button>
                </div>
            </div>
        </div>

        <BasePanel title="Planned Routes" :subtitle="`${filteredRoutes.length} routes found`" elevation="level2" :scrollable="true" class="routes-panel">
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

            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
                <div class="spinner"></div>
                <p>{{ t('pleaseWait') }}</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="paginatedRoutes.length === 0" class="empty-state">
                <i class="bi bi-calendar-event"></i>
                <h3>{{ t('noPlannedRoutesFound') }}</h3>
                <p>{{ t('addPlannedRoute') }}</p>
                <!-- Button moved to FAB -->
            </div>

            <div v-else>
                <!-- List View -->
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
                        @navigate="viewPlannedRoute(route.id)"
                        @action="handleListAction"
                    />
                </div>

                <!-- Card View -->
                 <div v-else-if="viewMode === 'cards'" class="cards-grid">
                    <DashboardRouteCard 
                        v-for="route in paginatedRoutes" 
                        :key="route.id" 
                        :route="formatRouteForCard(route)"
                        @click="viewPlannedRoute(route.id)"
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

        <BaseFab @click="addNewPlannedRoute" icon="bi bi-plus" :title="t('addPlannedRoute')" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, inject, computed } from "vue";
import { useSearchContext } from "@/composables/useSearchContext";
import { useRoute, useRouter } from "vue-router";
import { usePlannedRoutes } from "@/composables/usePlannedRoutes";
import { useI18n } from "vue-i18n";
import DashboardRouteCard from '@/components/dashboard/DashboardRouteCard.vue';
import DashboardRouteListItem from '@/components/dashboard/DashboardRouteListItem.vue';
import { BaseButton, BasePanel, BaseFab } from '@/components/ui';

const { t } = useI18n();
const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');
const route = useRoute();
const router = useRouter();
const { registerSearchContext, clearSearchContext } = useSearchContext();

const {
    plannedRoutes,
    loading,
    error,
    fetchPlannedRoutes,
    deletePlannedRoute,
    archivePlannedRoute
} = usePlannedRoutes();

const filteredRoutes = ref([]);
const routesPerPage = 6; // Adjusted for grid
const currentPage = ref(1);
const viewMode = ref('table');

const totalPages = computed(() => Math.ceil(filteredRoutes.value.length / routesPerPage));
const paginatedRoutes = computed(() => {
    const start = (currentPage.value - 1) * routesPerPage;
    return filteredRoutes.value.slice(start, start + routesPerPage);
});

// Table Configuration
const tableColumns = [
    { key: 'SurveyName', label: t('surveyName'), sortable: true },
    { key: 'ClientName', label: t('clientName'), sortable: true },
    { key: 'SurveyDate', label: t('surveyDate'), sortable: true },
    { key: 'createdAt', label: t('timeCreated'), sortable: true },
    { key: 'actions', label: '', sortable: false }
];

// Sorting
const sortKey = ref('createdAt');
const sortOrder = ref('desc');

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
        if (key === 'createdAt' || key === 'SurveyDate') {
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
        currentPage.value = page;
    }
}

const showDeleteModal = ref(false);
const showArchiveModal = ref(false);
const routeToDelete = ref(null);
const routeToArchive = ref(null);

const openDeleteModal = (route) => {
    routeToDelete.value = route;
    showDeleteModal.value = true;
};

const openArchiveModal = (route) => {
    routeToArchive.value = route;
    showArchiveModal.value = true;
};

const confirmDelete = async () => {
    if (!routeToDelete.value) return;
    setGlobalLoading(true);

    try {
        const res = await deletePlannedRoute(routeToDelete.value.id);

        if (res.success) {
            filteredRoutes.value = filteredRoutes.value.filter(r => r.id !== routeToDelete.value.id);
            plannedRoutes.value = plannedRoutes.value.filter(r => r.id !== routeToDelete.value.id);
            showDeleteModal.value = false;
            routeToDelete.value = null;
            showMessage({ status: 'success', message: t('plannedRouteDeletedSuccessfully') });
        } else {
            showMessage({ status: 'error', message: res.message });
        }
    } catch (error) {
        console.log(error);
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    }

    setGlobalLoading(false);
};

const confirmArchive = async () => {
    if (!routeToArchive.value) return;

    setGlobalLoading(true);
    try {
        const res = await archivePlannedRoute(routeToArchive.value.id);

        if (res.success) {
            filteredRoutes.value = filteredRoutes.value.filter(
                r => r.id !== routeToArchive.value.id
            );
            plannedRoutes.value = plannedRoutes.value.filter(
                r => r.id !== routeToArchive.value.id
            );
            showArchiveModal.value = false;
            routeToArchive.value = null;
            showMessage({ status: 'success', message: t('archivedSuccessfully') });
        } else {
            showMessage({ status: 'error', message: res.message });
        }
    } catch (error) {
        console.log(error);
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    }
    setGlobalLoading(false);
};

const getPlannedRoutes = async () => {
    try {
        await fetchPlannedRoutes();
        filteredRoutes.value = [...plannedRoutes.value];
        // Initial sort
        sortBy(sortKey.value);
    } catch (error) {
        filteredRoutes.value = [];
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    }
};

const searchTerm = ref("");

function handleSearch() {
    const term = searchTerm.value.trim().toLowerCase();
    if (!term) {
        filteredRoutes.value = [...plannedRoutes.value];
        sortBy(sortKey.value); // keep current sort
        return;
    }
    filteredRoutes.value = plannedRoutes.value.filter(route => {
        return (
            (route.SurveyName && route.SurveyName.toLowerCase().includes(term)) ||
            (route.ClientName && route.ClientName.toLowerCase().includes(term)) ||
            (route.SurveyInstructions && route.SurveyInstructions.toLowerCase().includes(term)) ||
            (route.CargoType && route.CargoType.toLowerCase().includes(term)) ||
            (route.TrailerType && route.TrailerType.toLowerCase().includes(term))
        );
    });
    sortBy(sortKey.value); // keep current sort
    currentPage.value = 1;
}

const formatDate = (dateString) => {
    if (!dateString) return t('noDate');
    return new Date(dateString).toLocaleDateString();
};

const addNewPlannedRoute = () => {
    router.push('/planned-routes/add');
};

const viewPlannedRoute = (id) => {
    router.push(`/planned-routes/${id}`);
};

const editPlannedRoute = (id) => {
    router.push(`/planned-routes/${id}/edit`);
};

const handleRowClick = (item) => {
    viewPlannedRoute(item.id);
};

const formatRouteForCard = (route) => {
    // Extract start location - handle both string and object formats
    let startLocation = 'Unknown';
    if (route.SurveyStart) {
        startLocation = route.SurveyStart;
    } else if (route.startLocation) {
        startLocation = route.startLocation.display_name || route.startLocation;
    }
    
    // Extract end location - handle both string and object formats
    let endLocation = 'Unknown';
    if (route.SurveyEnd) {
        endLocation = route.SurveyEnd;
    } else if (route.endLocation) {
        endLocation = route.endLocation.display_name || route.endLocation;
    }
    
    // Extract coordinates for the map
    let coordinates = [];
    if (route.routePath && Array.isArray(route.routePath)) {
        coordinates = route.routePath.map(p => ({ lat: p[0], lng: p[1] }));
    } else if (route.RouteData) {
        try {
            const data = typeof route.RouteData === 'string' ? JSON.parse(route.RouteData) : route.RouteData;
            if (data.pointsData && Array.isArray(data.pointsData)) {
                coordinates = data.pointsData;
            }
        } catch (e) { /* ignore parse errors */ }
    }
    
    // Extract start/end coordinates
    let startCoords = null;
    let endCoords = null;
    if (route.startLocation && route.startLocation.lat) {
        startCoords = { lat: route.startLocation.lat, lng: route.startLocation.lng };
    }
    if (route.endLocation && route.endLocation.lat) {
        endCoords = { lat: route.endLocation.lat, lng: route.endLocation.lng };
    }
    
    return {
        id: route.id,
        name: route.SurveyName || route.name || 'Untitled Route',
        startLocation: startLocation,
        endLocation: endLocation,
        distance: route.Distance || route.distance || 0,
        status: route.status || 'planned',
        updatedAt: route.dateAdded || route.dateUpdated,
        type: 'planned',
        // Include coordinates for map
        coordinates: coordinates,
        startCoords: startCoords,
        endCoords: endCoords,
        pointsData: coordinates,
        routePath: route.routePath
    };
};


const handleCardAction = ({ route, step }) => {
    switch (step) {
        case 'planned':
            editPlannedRoute(route.id);
            break;
        case 'surveyed':
            viewPlannedRoute(route.id);
            break;
        default:
            viewPlannedRoute(route.id);
            break;
    }
};

const handleListAction = ({ route, step }) => {
    switch (step) {
        case 'view':
            viewPlannedRoute(route.id);
            break;
        case 'edit':
            editPlannedRoute(route.id);
            break;
        case 'delete':
            openDeleteModal(route);
            break;
        default:
            viewPlannedRoute(route.id);
            break;
    }
};

const getData = async () => {
    setGlobalLoading(true);
    try {
        await getPlannedRoutes();
    } catch (error) {
        console.log(error);
    }
    setGlobalLoading(false);
};

onMounted(() => {
    getData();
    
    registerSearchContext(t('planned'), (query) => {
        searchTerm.value = query;
        handleSearch();
        
        // Return mapped results for dropdown
        return filteredRoutes.value.slice(0, 5).map(route => ({
            title: route.SurveyName || t('untitled'),
            description: route.ClientName || t('noClientName'),
            action: () => viewPlannedRoute(route.id)
        }));
    }, 'bi-map');
});

onUnmounted(() => {
    clearSearchContext();
});

watch(plannedRoutes, (newRoutes) => {
    filteredRoutes.value = newRoutes;
    sortBy(sortKey.value);
});
</script>

<style scoped>
.routes-page {
    max-width: 1700px;
    margin: 0 auto;
    padding: 1rem;
    height: 100%; /* Fill available vertical space from parent */
    display: flex;
    flex-direction: column;
}

.routes-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.routes-top-controls {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 1.1rem;
    gap: 1rem;
}

.spacer {
    flex: 1;
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
    border-radius: 6px;
    padding: 0.25rem;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    padding: 0.1rem;
}

.routes-list {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
}

.routes-list-header {
    display: grid;
    grid-template-columns: 1.5fr 2.5fr 0.8fr 0.8fr 1fr;
    gap: 1rem;
    padding: 0.75rem 1.25rem;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
}

.routes-list-header > div {
    display: flex;
    align-items: center;
}

.list-col-locations {
    justify-content: flex-start;
}

.list-col-distance,
.list-col-status {
    justify-content: center;
}

.list-col-actions {
    justify-content: flex-end;
}

@media (width <= 1200px) {
    .routes-list-header {
        grid-template-columns: 1.5fr 2fr 1fr 1fr;
    }
    
    .list-col-actions {
        display: none;
    }
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

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: var(--text-secondary);
    height: 100%; /* Center vertically in the grown panel */
    flex: 1;
}

.empty-state i {
    font-size: 48px;
    margin-bottom: 16px;
    color: var(--text-tertiary);
}

.empty-state h3 {
    margin: 0 0 8px;
    color: var(--text-primary);
}

.empty-state p {
    margin: 0 0 20px;
    max-width: 400px;
}

.actions-col {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
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
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 0.5rem;
}

.pagination-controls button:disabled {
    background: var(--bg-surface);
    color: var(--text-disabled);
    cursor: not-allowed;
}

.page-btn.active {
    background: var(--accent);
    color: #fff;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 40%);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-box {
    background: var(--bg-surface);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
    padding: 2.2rem 2.5rem 1.5rem;
    min-width: 320px;
    max-width: 90vw;
    text-align: center;
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

.text-danger {
    color: var(--error) !important;
}

.text-secondary {
    color: var(--text-secondary);
}
</style>