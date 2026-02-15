<template>
    <div class="plan-route-page">
        <!-- Page Header -->
        <!-- <div class="page-header">
            <h1 class="page-title">Plan Route</h1>
            <div class="header-actions">
                <div class="view-toggle">
                    <BaseButton :variant="viewMode === 'grid' ? 'primary' : 'ghost'" size="small"
                        @click="viewMode = 'grid'" title="Grid View">
                        <PhSquaresFour size="16" />
                    </BaseButton>
                    <BaseButton :variant="viewMode === 'list' ? 'primary' : 'ghost'" size="small"
                        @click="viewMode = 'list'" title="List View">
                        <PhListBullets size="16" />
                    </BaseButton>
                </div>
                <BaseButton variant="primary" size="medium" @click="addNewRoute">
                    <i class="bi bi-plus"></i>
                    New Route
                </BaseButton>
            </div>
        </div> -->

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <BaseLoadingIndicator size="large" message="Loading routes..." />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
            <PhWarning size="64" />
            <h3>Error Loading Routes</h3>
            <p>{{ error }}</p>
            <BaseButton variant="primary" size="medium" @click="loadData">
                Try Again
            </BaseButton>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredRoutes.length === 0" class="empty-state">
            <PhCalendarBlank size="64" />
            <h3>No routes found</h3>
            <p v-if="searchTerm">No routes match your search criteria</p>
            <p v-else>Create your first route to get started</p>
            <BaseButton variant="primary" size="medium" @click="addNewRoute">
                Create Route
            </BaseButton>
        </div>

        <!-- Routes Content -->
        <div v-else>
            <!-- Grid View -->
            <BasePanel v-if="viewMode === 'grid'" title="Planned Routes" :subtitle="`${filteredRoutes.length} routes`"
                elevation="level2">
                <template #header>
                    <div class="view-toggle">
                        <BaseButton :variant="viewMode === 'list' ? 'primary' : 'ghost'" size="small"
                            @click="viewMode = 'list'" title="List View">
                            <PhListBullets size="16" />
                        </BaseButton>
                        <BaseButton :variant="viewMode === 'grid' ? 'primary' : 'ghost'" size="small"
                            @click="viewMode = 'grid'" title="Grid View">
                            <PhSquaresFour size="16" />
                        </BaseButton>
                        <BaseButton variant="primary" size="small" @click="addNewRoute">
                            <PhPlus size="16" /> &nbsp;
                            New Route
                        </BaseButton>
                    </div>
                </template>

                <div class="routes-grid">
                    <BaseCard v-for="route in paginatedRoutes" :key="route.id" :interactive="true"
                        @click="viewRoute(route.id)">
                        <template #header>
                            <div class="route-card-header">
                                <h4 class="route-title text-left">{{ route.SurveyName || 'Untitled Route' }}</h4>
                                <span class="status-badge" :class="getStatusClass(route)">
                                    {{ getStatusText(route) }}
                                </span>
                            </div>
                        </template>

                        <div class="route-card-content">
                            <!-- Map Section -->
                            <div class="map-container" :id="`map-${route.id}`">
                                <!-- Map will be rendered here -->
                            </div>

                            <div class="location-section">
                                <div class="location-item">
                                    <PhMapPin weight="fill" class="start-location" size="16" />
                                    <div class="location-details">
                                        <span class="location-text text-left">{{
                                            routeUtils.getShortAddress(route.SurveyStart) ||
                                            'Start Location'
                                        }}</span>
                                    </div>
                                </div>
                                <div class="location-item">
                                    <PhMapPin weight="fill" class="end-location" size="16" />
                                    <div class="location-details">
                                        <span class="location-text text-left">{{
                                            routeUtils.getShortAddress(route.SurveyEnd) ||
                                            'End Location'
                                            }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <template #footer>
                            <div class="route-card-footer">
                                <div class="distance-info">
                                    <PhPath size="16" />
                                    <span>{{ getRouteDistance(route) }}</span>
                                </div>
                                <div class="update-time">
                                    <span v-html="routeUtils.formatDateTime(route.dateAdded || route.createdAt)"></span>
                                </div>
                            </div>
                        </template>
                    </BaseCard>
                </div>

                <template #footer>
                    <BasePagination :current-page="currentPage" :total-pages="totalPages"
                        :total-items="filteredRoutes.length" :items-per-page="routesPerPage" item-label="routes"
                        @page-change="goToPage" />
                </template>
            </BasePanel>

            <!-- List View -->
            <BasePanel v-else title="Planned Routes" :subtitle="`${filteredRoutes.length} routes`" elevation="level2">
                <template #header>
                    <div class="view-toggle">
                        <BaseButton :variant="viewMode === 'list' ? 'primary' : 'ghost'" size="small"
                            @click="viewMode = 'list'" title="List View">
                            <PhListBullets size="16" />
                        </BaseButton>
                        <BaseButton :variant="viewMode === 'grid' ? 'primary' : 'ghost'" size="small"
                            @click="viewMode = 'grid'" title="Grid View">
                            <PhSquaresFour size="16" />
                        </BaseButton>
                        <BaseButton variant="primary" size="small" @click="addNewRoute">
                            <PhPlus size="16" />
                            New Route
                        </BaseButton>
                    </div>
                </template>

                <BaseTable :items="paginatedRoutes" :columns="tableColumns" :sort-column="sortKey"
                    :sort-direction="sortOrder" :clickable="true" :disable-internal-sorting="true" @sort="handleSort"
                    @row-click="handleRowClick">
                    <template #empty>
                        <div class="no-routes-content">
                            <PhMapTrifold size="48" />
                            <span>No routes found</span>
                            <p>Create your first route to get started</p>
                        </div>
                    </template>

                    <template #cell-name="{ item }">
                        <div class="route-name">{{ item.SurveyName || 'Untitled Route' }}</div>
                    </template>

                    <template #cell-client="{ item }">
                        <div class="client-info">
                            <PhBuildings size="16" />
                            <span>{{ item.ClientName || 'No Client' }}</span>
                        </div>
                    </template>

                    <template #cell-location="{ item }">
                        <div class="location-info">
                            <div class="location-item">
                                <PhMapPin weight="fill" class="start-location" size="16" />
                                <span class="text-left">{{ routeUtils.getShortAddress(item.SurveyStart)
                                    || 'Start Location'
                                    }}</span>
                            </div>
                            <div class="location-item">
                                <PhMapPin weight="fill" class="end-location" size="16" />
                                <span class="text-left">{{ routeUtils.getShortAddress(item.SurveyEnd) || 'End Location'
                                }}</span>
                            </div>
                        </div>
                    </template>

                    <template #cell-distance="{ item }">
                        <div class="distance-info">
                            <PhPath size="16" />
                            <span>{{ getRouteDistance(item) }}</span>
                        </div>
                    </template>

                    <template #cell-status="{ item }">
                        <span class="status-badge" :class="getStatusClass(item)">
                            {{ getStatusText(item) }}
                        </span>
                    </template>

                    <template #cell-updated="{ item }">
                        <span class="update-time"
                            v-html="routeUtils.formatDateTime(item.dateAdded || item.createdAt)"></span>
                    </template>

                    <template #cell-actions="{ item }">
                        <BaseButton variant="ghost" size="small" @click.stop="editRoute(item.id)">
                            Edit
                        </BaseButton>
                    </template>
                </BaseTable>

                <template #footer>
                    <BasePagination :current-page="currentPage" :total-pages="totalPages"
                        :total-items="filteredRoutes.length" :items-per-page="routesPerPage" item-label="routes"
                        @page-change="goToPage" />
                </template>
            </BasePanel>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlannedRoutes } from '@/composables/usePlannedRoutes';
import { useUnits } from '@/composables/useUnits';
import { BaseCard, BaseButton, BasePanel, BaseTable, BasePagination, BaseLoadingIndicator } from '@/components/ui';
import RouteCardWithMap from '@/components/planned_routes/RouteCardWithMap.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import routeUtils from '@/utils/route_utils';
import { 
    PhSquaresFour, 
    PhListBullets, 
    PhPlus, 
    PhWarning, 
    PhCalendarBlank, 
    PhMapTrifold, 
    PhBuildings, 
    PhMapPin, 
    PhPath, 
    PhPencilSimple 
} from "@phosphor-icons/vue";

const { t } = useI18n();
const router = useRouter();
const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');
const { formatDistance } = useUnits();

// Use planned routes composable
const {
    plannedRoutes,
    loading,
    error,
    fetchPlannedRoutes,
    deletePlannedRoute
} = usePlannedRoutes();

// State
const viewMode = ref('list'); // 'grid' or 'list'
const searchTerm = ref('');
const sortKey = ref('dateAdded');
const sortOrder = ref('desc');

// Table columns configuration
const tableColumns = [
    { key: 'SurveyName', label: 'ROUTE NAME', sortable: true },
    // { key: 'ClientName', label: 'CLIENT', sortable: true },
    { key: 'location', label: 'START / END', sortable: false },
    { key: 'distance', label: 'DISTANCE', sortable: true },
    { key: 'status', label: 'STATUS', sortable: true },
    { key: 'updated', label: 'UPDATED', sortable: true },
    // { key: 'actions', label: 'ACTIONS', sortable: false }
];

// Pagination
const routesPerPage = computed(() => {
    return viewMode.value === 'grid' ? 4 : 5; // 6 for grid, 10 for list
});
const currentPage = ref(1);

// Computed
const filteredRoutes = computed(() => {
    let filtered = plannedRoutes.value || [];

    // Apply search filter
    if (searchTerm.value.trim()) {
        const term = searchTerm.value.toLowerCase();
        filtered = filtered.filter(route =>
            (route.SurveyName && route.SurveyName.toLowerCase().includes(term)) ||
            (route.ClientName && route.ClientName.toLowerCase().includes(term)) ||
            (route.SurveyStart && route.SurveyStart.toLowerCase().includes(term)) ||
            (route.SurveyEnd && route.SurveyEnd.toLowerCase().includes(term)) ||
            (route.SurveyInstructions && route.SurveyInstructions.toLowerCase().includes(term))
        );
    }

    // Apply sorting
    filtered.sort((a, b) => {
        let aVal, bVal;

        // Handle special sorting cases
        if (sortKey.value === 'distance') {
            // For distance sorting, extract distance from RouteData
            aVal = getRouteDistance(a);
            bVal = getRouteDistance(b);

            // Convert distance strings to numbers for proper sorting
            aVal = parseFloat(aVal.replace(/[^\d.]/g, '')) || 0;
            bVal = parseFloat(bVal.replace(/[^\d.]/g, '')) || 0;
        } else if (sortKey.value === 'status') {
            // For status sorting, get status text
            aVal = getStatusText(a).toLowerCase();
            bVal = getStatusText(b).toLowerCase();
        } else if (sortKey.value === 'dateAdded' || sortKey.value === 'SurveyDate') {
            // Handle date sorting
            aVal = new Date(a[sortKey.value]);
            bVal = new Date(b[sortKey.value]);
        } else {
            // Handle regular string sorting
            aVal = (a[sortKey.value] || '').toString().toLowerCase();
            bVal = (b[sortKey.value] || '').toString().toLowerCase();
        }

        if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
    });

    return filtered;
});

// Pagination computed properties
const totalPages = computed(() => Math.ceil(filteredRoutes.value.length / routesPerPage.value));

const paginatedRoutes = computed(() => {
    const start = (currentPage.value - 1) * routesPerPage.value;
    return filteredRoutes.value.slice(start, start + routesPerPage.value);
});

// Pagination methods
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

// Methods
const handleSearch = () => {
    // Search is handled by computed property
};

const sortBy = (key) => {
    if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
    }
    currentPage.value = 1; // Reset to first page when sorting
};

// Handle sort for BaseTable component
const handleSort = (column) => {
    sortBy(column);
};

// Handle row click for BaseTable component
const handleRowClick = (route) => {
    viewRoute(route.id);
};


const getStatusClass = (route) => {
    // Determine status based on route data
    if (route.RouteData) {
        try {
            const routeData = typeof route.RouteData === 'string' ? JSON.parse(route.RouteData) : route.RouteData;
            if (routeData.routePath && routeData.routePath.length > 0) {
                // return 'status-planned';
                return 'planned'
            }
        } catch (e) {
            console.warn('Error parsing route data:', e);
        }
    }
    // return 'status-planned'; // Default status
    return 'planned'
};

const getStatusText = (route) => {
    // Determine status text based on route data
    if (route.RouteData) {
        try {
            const routeData = typeof route.RouteData === 'string' ? JSON.parse(route.RouteData) : route.RouteData;
            if (routeData.routePath && routeData.routePath.length > 0) {
                return 'Planned';
            }
        } catch (e) {
            console.warn('Error parsing route data:', e);
        }
    }
    // return 'Planned'; // Default status
    return 'planned'
};

const getClientInitial = (client) => {
    return client ? client.charAt(0).toUpperCase() : '?';
};

const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const getRouteDistance = (route) => {
    if (route.RouteData) {
        try {
            const routeData = typeof route.RouteData === 'string' ? JSON.parse(route.RouteData) : route.RouteData;
            if (routeData.routeInfo && routeData.routeInfo.distance) {
                const distance = routeData.routeInfo.distance;
                return formatDistance(distance);
            }
        } catch (e) {
            console.warn('Error parsing route data for distance:', e);
        }
    }
    return 'N/A';
};

const getVehicleType = (route) => {
    if (route.TrailerType) {
        return route.TrailerType;
    }
    if (route.CargoType) {
        return route.CargoType;
    }
    return 'Standard';
};

const addNewRoute = () => {
    router.push('/planned-routes/add');
};


const editRoute = (routeId) => {
    router.push(`/planned-routes/${routeId}/edit`);
};

const viewRoute = (routeId) => {
    router.push(`/planned-routes/${routeId}`);
};

// Watch for search term changes to reset pagination
watch(searchTerm, () => {
    currentPage.value = 1;
});

// Watch for view mode changes to reset pagination
watch(viewMode, () => {
    currentPage.value = 1;
});

// Map initialization
const maps = ref(new Map());

const initializeMap = async (routeId, routeData) => {
    await nextTick();
    const mapContainer = document.getElementById(`map-${routeId}`);
    if (!mapContainer || maps.value.has(routeId)) return;

    try {
        // Fix for default markers in Leaflet
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const map = L.map(mapContainer, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Parse route data and add markers/path
        if (routeData && routeData.RouteData) {
            try {
                const route = typeof routeData.RouteData === 'string'
                    ? JSON.parse(routeData.RouteData)
                    : routeData.RouteData;

                if (route.routePath && route.routePath.length > 0) {
                    // Add route path
                    const routeLine = L.polyline(route.routePath, {
                        color: '#00A7E1',
                        weight: 3,
                        opacity: 0.8
                    }).addTo(map);

                    // Add start and end markers
                    const startPoint = route.routePath[0];
                    const endPoint = route.routePath[route.routePath.length - 1];

                    // Start marker (green)
                    const startIcon = L.divIcon({
                        className: 'custom-marker start-marker',
                        html: '<div class="marker-content"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80.8,146,84.4,149.1a8,8,0,0,0,7.2,0C135.2,250,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,112a24,24,0,1,1,24-24A24,24,0,0,1,128,128Z"></path></svg></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 20]
                    });

                    L.marker([startPoint[0], startPoint[1]], { icon: startIcon })
                        .addTo(map)
                        .bindPopup(`<strong>Start:</strong> ${routeData.SurveyStart || 'Start Location'}`);

                    // End marker (red)
                    const endIcon = L.divIcon({
                        className: 'custom-marker end-marker',
                        html: '<div class="marker-content"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80.8,146,84.4,149.1a8,8,0,0,0,7.2,0C135.2,250,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,112a24,24,0,1,1,24-24A24,24,0,0,1,128,128Z"></path></svg></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 20]
                    });

                    L.marker([endPoint[0], endPoint[1]], { icon: endIcon })
                        .addTo(map)
                        .bindPopup(`<strong>End:</strong> ${routeData.SurveyEnd || 'End Location'}`);

                    // Fit map to route bounds
                    map.fitBounds(routeLine.getBounds(), { padding: [10, 10] });
                } else {
                    // Default view if no route data
                    map.setView([40.7128, -74.0060], 10);
                }
            } catch (error) {
                console.warn('Error parsing route data:', error);
                map.setView([40.7128, -74.0060], 10);
            }
        } else {
            // Default view if no route data
            map.setView([40.7128, -74.0060], 10);
        }

        maps.value.set(routeId, map);
    } catch (error) {
        console.error('Error initializing map:', error);
    }
};

const initializeAllMaps = async () => {
    if (viewMode.value === 'grid' && paginatedRoutes.value.length > 0) {
        for (const route of paginatedRoutes.value) {
            await initializeMap(route.id, route);
        }
    }
};

// Watch for route changes to reinitialize maps
watch([paginatedRoutes, viewMode], async () => {
    if (viewMode.value === 'grid') {
        // Clear existing maps
        maps.value.forEach((map) => {
            map.remove();
        });
        maps.value.clear();

        // Initialize new maps
        await nextTick();
        await initializeAllMaps();
    }
}, { flush: 'post' });

// Load data
const loadData = async () => {
    // setGlobalLoading(true);
    try {
        await fetchPlannedRoutes();
    } catch (error) {
        console.error('Error loading planned routes:', error);
        showMessage({ status: 'error', message: 'Failed to load planned routes' });
    } finally {
        // setGlobalLoading(false);
    }
};

// Lifecycle
onMounted(async () => {
    await loadData();
    await initializeAllMaps();
});
</script>

<style scoped>
/* Design System CSS Variables - Inherited from global */
/* :root and dark mode overrides removed to use global design-system.css */

.plan-route-page {
    padding: 1rem;
    min-height: 100vh;
    color: var(--text-primary);
    max-width: 1700px;
    margin: 0 auto;
}

/* Page Header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
}

.page-title {
    font-size: 48px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.5%;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

/* View Toggle */
.view-toggle {
    display: flex;
    gap: var(--spacing-2xs);
    background: var(--bg-elevated);
    border-radius: 6px;
    padding: var(--spacing-2xs);
}

/* Loading State */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    color: var(--text-secondary);
}

.empty-state i {
    font-size: 4rem;
    margin-bottom: var(--spacing-md);
    color: var(--text-secondary);
}

.empty-state h3 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-primary);
    font-size: 24px;
    font-weight: 600;
}

.empty-state p {
    margin: 0 0 var(--spacing-lg) 0;
    max-width: 400px;
    font-size: 16px;
}

/* Error State */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    color: var(--error);
}

.error-state i {
    font-size: 4rem;
    margin-bottom: var(--spacing-md);
    color: var(--error);
}

.error-state h3 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--error);
    font-size: 24px;
    font-weight: 600;
}

.error-state p {
    margin: 0 0 var(--spacing-lg) 0;
    max-width: 400px;
    color: var(--text-secondary);
    font-size: 16px;
}

/* Routes Grid */
.routes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: var(--spacing-lg);
}

/* Map Container */
.map-container {
    height: 200px;
    margin-bottom: var(--spacing-md);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
    position: relative;
}

.map-container .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 8px;
}

/* Custom Marker Styles */
:deep(.custom-marker) {
    background: transparent;
    border: none;
    width: 20px;
    height: 20px;
}

:deep(.marker-content) {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
    box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
    border: 2px solid white;
}

:deep(.start-marker .marker-content) {
    background: var(--success);
}

:deep(.end-marker .marker-content) {
    background: var(--error);
}

/* Leaflet popup styling */
:deep(.leaflet-popup-content-wrapper) {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

:deep(.leaflet-popup-content) {
    margin: 8px 12px;
    font-size: 14px;
    line-height: 1.4;
}

:deep(.leaflet-popup-tip) {
    background: white;
    border: none;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

/* Route Card Styles */
.route-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-md);
    width: 100%;
}

.route-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    flex: 1;
    min-width: 0;
    margin: 0;
    letter-spacing: 0%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.route-card-content {
    padding: 0;
}

.route-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.location-section {
    margin-bottom: var(--spacing-md);
}

.location-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
}

.location-item:last-child {
    margin-bottom: 0;
}

.location-item i {
    margin-top: 0.125rem;
    font-size: 0.875rem;
}

.location-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    flex: 1;
    min-width: 0;
}

.location-text {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.3;
    word-break: break-word;
    font-weight: 400;
}

.distance-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 400;
}

.update-time {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 400;
}

.status-badge {
    padding: var(--spacing-2xs) var(--spacing-sm);
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.planned {
    background: rgb(243 156 18 / 20%);
    color: var(--warning);
}

.status-badge.surveyed {
    background: rgb(0 179 134 / 20%);
    color: var(--success);
}

.status-badge.reported {
    background: rgb(0 167 225 / 20%);
    color: var(--accent);
}

.status-badge.shared {
    background: rgb(232 62 140 / 20%);
    color: var(--error);
}

.start-location {
    color: var(--success);
}

.end-location {
    color: var(--error);
}

/* Table Styles */
.route-name {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 14px;
}

.client-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 14px;
}

.client-info i {
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.location-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
}

.location-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.8rem;
}

/* Pagination Controls - Now handled by BasePagination component */

/* No Routes Content */
.no-routes-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
    text-align: center;
}

.no-routes-content i {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm);
}

.no-routes-content span {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
}

.no-routes-content p {
    font-size: 14px;
    margin: 0;
    color: var(--text-secondary);
    font-weight: 400;
}

/* Responsive Design */
@media (width <= 768px) {
    .plan-route-page {
        padding: 0.75rem;
    }

    .page-header {
        flex-direction: column;
        gap: var(--spacing-sm);
        align-items: stretch;
        margin-bottom: var(--spacing-md);
    }

    .page-title {
        font-size: 32px;
    }

    .header-actions {
        justify-content: space-between;
        gap: var(--spacing-sm);
    }

    .routes-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
    }

    .map-container {
        height: 180px;
    }

    .route-card-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
    }

    .route-card-footer {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-xs);
    }

    /* Pagination controls now handled by BasePagination component */
}

@media (width <= 480px) {
    .plan-route-page {
        padding: 0.5rem;
    }

    .page-title {
        font-size: 24px;
    }

    .header-actions {
        gap: var(--spacing-xs);
    }

    .routes-grid {
        gap: var(--spacing-sm);
    }

    .map-container {
        height: 160px;
    }
}
</style>
