<template>
    <div class="route-manager-page">
        <!-- Page Header -->
        <!-- <div class="page-header">
            <h1 class="page-title">Route Manager</h1>
            <div class="header-actions">
                    <BaseButton :variant="viewMode === 'grid' ? 'primary' : 'ghost'" size="small"
                        @click="viewMode = 'grid'" title="Grid View">
                        <PhSquaresFour size="16" />
                    </BaseButton>
                    <BaseButton :variant="viewMode === 'list' ? 'primary' : 'ghost'" size="small"
                        @click="viewMode = 'list'" title="List View">
                        <PhListBullets size="16" />
                    </BaseButton>
                </div>
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
        <div v-else-if="routes.length === 0" class="empty-state">
            <PhMapTrifold size="64" />
            <h3>No routes found</h3>
            <p>Create your first route to get started</p>
            <BaseButton variant="primary" size="medium" @click="addNewRoute">
                Create Route
            </BaseButton>
        </div>

        <!-- Routes Content -->
        <div v-else>
            <!-- Grid View -->
            <BasePanel v-if="viewMode === 'grid'" title="Routes" :subtitle="`${totalCount} routes`" elevation="level2">
                <template #header>
                    <div class="header-actions">

                        <div class="view-toggle">
                            <BaseButton :variant="viewMode === 'list' ? 'primary' : 'ghost'" size="small"
                                @click="viewMode = 'list'" title="List View">
                                <PhListBullets size="16" />
                            </BaseButton>
                            <BaseButton :variant="viewMode === 'grid' ? 'primary' : 'ghost'" size="small"
                                @click="viewMode = 'grid'" title="Grid View">
                                <PhSquaresFour size="16" />
                            </BaseButton>
                        </div>
                    </div>
                </template>

                <div class="routes-grid">
                    <BaseCard v-for="route in paginatedRoutes" :key="route.id" :interactive="true"
                        @click="viewRoute(route.id)">
                        <template #header>
                            <div class="route-card-header">
                                <h4 class="route-title text-left">{{ route.title || 'Untitled Route' }}</h4>
                                <span class="status-badge" :class="getStatusClass(route.routeStatus)">
                                    {{ getStatusText(route) }}
                                </span>
                            </div>
                        </template>

                        <div class="route-card-content">
                            <!-- Map Container -->
                            <div class="map-container" :id="`route-map-${route.id}`"></div>

                            <div class="location-section">
                                <div class="location-item">
                                    <PhMapPin weight="fill" class="start-location" size="16" />
                                    <div class="location-details">
                                        <span class="location-text text-left text-truncate">{{ routeUtils.getShortAddress(route.SurveyStart)
                                            || 'Start Location'
                                        }}</span>
                                    </div>
                                </div>
                                <div class="location-item">
                                    <PhMapPin weight="fill" class="end-location" size="16" />
                                    <div class="location-details">
                                        <span class="location-text text-left text-truncate">{{ routeUtils.getShortAddress(route.SurveyEnd)
                                            || 'End Location'
                                            }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <template #footer>
                            <div class="route-card-footer">
                                <div class="route-actions">
                                    <BaseButton variant="secondary" size="small" @click.stop="viewRoute(route.id)">
                                        <PhEye size="16" class="me-1" /> View
                                    </BaseButton>
                                    <BaseButton v-if="canEdit(route)" variant="primary" size="small"
                                        @click.stop="editRoute(route.id)">
                                        <PhPencilSimple size="16" class="me-1" /> Edit
                                    </BaseButton>
                                    <BaseButton v-if="canDelete(route)" variant="danger" size="small"
                                        @click.stop="confirmDelete(route)">
                                        <PhTrash size="16" />
                                    </BaseButton>
                                </div>
                                <div class="distance-info">
                                    <PhPath size="16" />
                                    <span>{{ getRouteDistance(route) }}</span>
                                </div>
                                <div class="update-time">
                                    <span
                                        v-html="routeUtils.formatDateTime(route.dateAdded || route.createdAt)"></span>
                                </div>
                            </div>
                        </template>
                    </BaseCard>
                </div>

                <template #footer>
                    <BasePagination :current-page="currentPage" :total-pages="totalPages" :total-items="totalCount"
                        :items-per-page="getRoutesPerPage()" item-label="routes" @page-change="goToPage" />
                </template>
            </BasePanel>

            <!-- List View -->
            <BasePanel v-else title="Routes" :subtitle="`${totalCount} routes`" elevation="level2">
                <template #header>
                    <div class="header-actions">
                        <div class="view-toggle">
                            <BaseButton :variant="viewMode === 'list' ? 'primary' : 'ghost'" size="small"
                                @click="viewMode = 'list'" title="List View">
                                <PhListBullets size="16" />
                            </BaseButton>
                            <BaseButton :variant="viewMode === 'grid' ? 'primary' : 'ghost'" size="small"
                                @click="viewMode = 'grid'" title="Grid View">
                                <PhSquaresFour size="16" />
                            </BaseButton>

                        </div>
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

                    <template #cell-title="{ item }">
                        <div class="route-name">{{ item.title || 'Untitled Route' }}</div>
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
                                <span class="text-left text-truncate">{{ routeUtils.getShortAddress(item.SurveyStart)
                                    || 'Start Location'
                                    }}</span>
                            </div>
                            <div class="location-item">
                                <PhMapPin weight="fill" class="end-location" size="16" />
                                <span class="text-left text-truncate">{{ routeUtils.getShortAddress(item.SurveyEnd) ||
                                    'End Location'
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
                        <span class="status-badge" :class="getStatusClass(item.routeStatus)">
                            {{ getStatusText(item) }}
                        </span>
                    </template>

                    <template #cell-updated="{ item }">
                        <span class="update-time"
                            v-html="routeUtils.formatDateTime(item.dateAdded || item.createdAt)"></span>
                    </template>

                     <template #cell-actions="{ item }">
                        <div class="action-buttons">
                            <BaseButton variant="ghost" size="small" @click.stop="editRoute(item.id)" v-if="canEdit(item)">
                                <PhPencilSimple size="16" /> Edit
                            </BaseButton>
                            <BaseButton variant="ghost-danger" size="small" @click.stop="confirmDelete(item)"
                                v-if="canDelete(item)">
                                <PhTrash size="16" />
                            </BaseButton>
                        </div>
                    </template>
                </BaseTable>

                <template #footer>
                    <BasePagination :current-page="currentPage" :total-pages="totalPages" :total-items="totalCount"
                        :items-per-page="getRoutesPerPage()" item-label="routes" @page-change="goToPage" />
                </template>
            </BasePanel>
        </div>



        <!-- Delete Confirmation Modal -->
        <BaseModal :show="showDeleteModal" title="Delete Route" @close="showDeleteModal = false" @confirm="handleDelete"
            :details="routeToDelete?.title || 'Untitled Route'" details-label="Route"
            :danger-text="$t('delete')" :loading="isDeletingRoute">
            <template #icon>
                <PhWarning size="24" />
            </template>
            <p>{{ $t('deleteConfirmation') }}</p>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch, nextTick } from 'vue';
import { useSearchContext } from "@/composables/useSearchContext";
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import RoutesController from '@/controllers/routes/routes_controller';
import { useUnits } from '@/composables/useUnits';
import { BaseCard, BaseButton, BasePanel, BaseTable, BasePagination, BaseLoadingIndicator, BaseConfirmationModal } from '@/components/ui';
import RouteCardWithMap from '@/components/routes/RouteCardWithMap.vue';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { 
    PhSquaresFour, 
    PhListBullets, 
    PhPlus, 
    PhWarning, 
    PhEye,
    PhPencilSimple,
    PhTrash,
    PhMapTrifold, 
    PhBuildings, 
    PhMapPin, 
    PhPath,
    PhCalendarBlank,
    PhSignpostSplit
} from "@phosphor-icons/vue";
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const router = useRouter();
const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');
const { formatDistance } = useUnits();
const { registerSearchContext, clearSearchContext } = useSearchContext();

// State
const routes = ref([]);
const filteredRoutes = ref([]);
const loading = ref(false);
const error = ref(null);
const viewMode = ref('list'); // 'grid' or 'list'
const searchTerm = ref('');
const sortKey = ref('dateAdded');
const sortOrder = ref('desc');



// Delete Confirmation Modal
const showDeleteModal = ref(false);
const routeToDelete = ref(null);
const isDeletingRoute = ref(false);

// User type for admin checks
const userType = ref('User');

// Computed property to check if user is admin
const isAdmin = computed(() => userType.value === 'Admin');

// Table columns configuration
const tableColumns = [
    { key: 'title', label: 'ROUTE NAME', sortable: true },
    // { key: 'client', label: 'CLIENT', sortable: true },
    { key: 'location', label: 'START / END', sortable: false },
    { key: 'distance', label: 'DISTANCE', sortable: true },
    { key: 'status', label: 'STATUS', sortable: false },
    { key: 'updated', label: 'UPDATED', sortable: true },
    // { key: 'actions', label: 'ACTIONS', sortable: false }
];

// Pagination
const getRoutesPerPage = () => {
    return viewMode.value === 'grid' ? 4 : 5; // 4 for grid, 5 for list
};
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const paginatedRoutes = ref([]);

// Pagination methods
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        getRoutes(page);
    }
};

// Methods
const handleSearch = () => {
    const term = searchTerm.value.trim().toLowerCase();
    if (!term) {
        filteredRoutes.value = [...routes.value];
        sortBy(sortKey.value); // keep current sort
        return;
    }
    filteredRoutes.value = routes.value.filter(route => {
        return (
            (route.title && route.title.toLowerCase().includes(term)) ||
            (route.client && route.client.toLowerCase().includes(term)) ||
            (route.start && route.start.toLowerCase().includes(term)) ||
            (route.end && route.end.toLowerCase().includes(term)) ||
            (route.description && route.description.toLowerCase().includes(term))
        );
    });
    sortBy(sortKey.value); // keep current sort
    currentPage.value = 1;
};

const sortBy = (key) => {
    if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
    }
    filteredRoutes.value.sort((a, b) => {
        let aVal, bVal;

        // Handle special sorting cases
        if (key === 'distance') {
            // Sort by raw distance value (in meters) for accurate sorting
            aVal = a.distance || 0;
            bVal = b.distance || 0;
        } else if (key === 'status') {
            // For status sorting, get status text
            aVal = getStatusText(a).toLowerCase();
            bVal = getStatusText(b).toLowerCase();
        } else if (key === 'dateAdded' || key === 'createdAt') {
            // Handle date sorting
            aVal = new Date(a[key]);
            bVal = new Date(b[key]);
        } else {
            // Handle regular string sorting
            aVal = (a[key] || '').toString().toLowerCase();
            bVal = (b[key] || '').toString().toLowerCase();
        }

        if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
    });
    currentPage.value = 1;
};

// Handle sort for BaseTable component
const handleSort = (column) => {
    sortBy(column);
};

// Handle row click for BaseTable component
const handleRowClick = (route) => {
    viewRoute(route.id);
};


const getStatusClass = (status) => {
    if (!status) return 'surveyed';

    // Normalize to lowercase for comparison
    const normalizedStatus = String(status).toLowerCase();

    // Map status values to Dashboard-compatible classes
    switch (normalizedStatus) {
        case 'planned':
            return 'planned';
        case 'surveyed':
        case 'in progress':
        case 'in-progress':
            return 'surveyed';
        case 'reported':
        case 'completed':
            return 'reported';
        case 'shared':
            return 'shared';
        default:
            return 'surveyed';
    }
};

const getStatusText = (route) => {
    // Determine status text based on route data
    if (route.routeStatus) {
        return route.routeStatus;
    }
    return 'surveyed'; // Default status for regular routes
};

const getClientInitial = (client) => {
    return client ? client.charAt(0).toUpperCase() : '?';
};



const getRouteDistance = (route) => {
    if (route.distance) {
        return formatDistance(route.distance);
    }
    return 'N/A';
};

const getVehicleType = (route) => {
    return route.vehicleType || 'Standard';
};

const addNewRoute = () => {
    router.push('/routes/add');
};

const viewRoute = (routeId) => {
    router.push(`/routes/${routeId}/view`);
};

const editRoute = (routeId) => {
    router.push(`/routes/${routeId}/edit`);
};

const confirmRemoveRoute = (route) => {
    routeToDelete.value = route;
    showDeleteModal.value = true;
};

const confirmRemoveRouteById = (routeId) => {
    const route = paginatedRoutes.value.find(r => r.id === routeId);
    if (route) {
        confirmRemoveRoute(route);
    }
};

const confirmDelete = async () => {
    if (!routeToDelete.value) return;

    isDeletingRoute.value = true;
    try {
        const res = await RoutesController.removeRoute(routeToDelete.value.id);
        if (res.result) {
            showMessage({ status: 'success', message: 'Route removed successfully' });
            showDeleteModal.value = false;
            routeToDelete.value = null;
            // Reload the current page to refresh the data
            await getRoutes(currentPage.value);
        } else {
            showMessage({ status: 'error', message: res.message || 'Failed to remove route' });
        }
    } catch (error) {
        console.error('Error removing route:', error);
        showMessage({ status: 'error', message: 'Failed to remove route' });
    } finally {
        isDeletingRoute.value = false;
    }
};



const getRoutes = async (page = 1) => {
    loading.value = true;
    try {
        const res = await RoutesController.getCurrentUserRoutesPaginated(page, getRoutesPerPage());
        console.log('Routes API Response:', res);

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

            console.log('Pagination values:', {
                totalCount: totalCount.value,
                totalPages: totalPages.value,
                currentPage: currentPage.value,
                routesLength: paginatedRoutes.value.length,
                paginationObject: res.pagination
            });

            // For filtering and sorting, we need to maintain the full list
            routes.value = res.data;
            filteredRoutes.value = res.data;

            // Initialize maps after data is loaded
            if (viewMode.value === 'grid') {
                await initializeAllMaps();
            }
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
        showMessage({ status: 'error', message: 'Failed to load routes' });
    }
    loading.value = false;
};

// Watch for view mode changes to reset pagination
watch(viewMode, async () => {
    if (currentPage.value !== 1) {
        goToPage(1);
    }

    // Initialize maps when switching to grid view
    if (viewMode.value === 'grid' && paginatedRoutes.value.length > 0) {
        await nextTick();
        setTimeout(async () => {
            await initializeAllMaps();
        }, 200);
    }
});

// Load data
const loadData = async () => {
    // setGlobalLoading(true);
    try {
        await getRoutes(1); // Fetch first page
    } catch (error) {
        console.error('Error loading routes:', error);
        showMessage({ status: 'error', message: 'Failed to load routes' });
    } finally {
        // setGlobalLoading(false);
    }
};

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Map instances storage
const mapInstances = ref(new Map());

// Initialize map for a route
const initializeMap = async (route) => {
    await nextTick();
    const mapId = `route-map-${route.id}`;
    const mapElement = document.getElementById(mapId);

    console.log('Initializing map for route:', route.id, 'Element found:', !!mapElement);

    if (!mapElement || mapInstances.value.has(mapId)) {
        console.log('Map element not found or already initialized for route:', route.id);
        return;
    }

    try {
        // Create map
        const map = L.map(mapId, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false
        });

        // Ensure map container has proper dimensions
        mapElement.style.height = '200px';
        mapElement.style.width = '100%';

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Try to get route data and draw path
        let routeData = null;
        console.log('Full route object for', route.id, ':', route);

        if (route.RouteData) {
            try {
                routeData = typeof route.RouteData === 'string' ? JSON.parse(route.RouteData) : route.RouteData;
                console.log('Parsed route data for', route.id, ':', routeData);
                console.log('Route data keys:', Object.keys(routeData));
            } catch (e) {
                console.warn('Failed to parse RouteData for route:', route.id, e);
            }
        } else {
            console.log('No RouteData found for route:', route.id);
        }

        // Check for route path data - first check if route has pointsData directly
        if (route.pointsData && route.pointsData.length > 0) {
            console.log('Found pointsData directly on route:', route.pointsData.length, 'points');
            // Convert pointsData to coordinates array
            const coordinates = route.pointsData.map(point => [point.lat, point.lng]);
            console.log('Coordinates:', coordinates);

            // Draw route path
            const routeLine = L.polyline(coordinates, {
                color: '#00A7E1',
                weight: 3,
                opacity: 0.8
            }).addTo(map);

            // Add start and end markers
            const startPoint = coordinates[0];
            const endPoint = coordinates[coordinates.length - 1];

            // Start marker (green)
            const startIcon = L.divIcon({
                className: 'custom-marker start-marker',
                html: '<div class="marker-content"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80.8,146,84.4,149.1a8,8,0,0,0,7.2,0C135.2,250,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,112a24,24,0,1,1,24-24A24,24,0,0,1,128,128Z"></path></svg></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 20]
            });

            L.marker([startPoint[0], startPoint[1]], { icon: startIcon })
                .addTo(map)
                .bindPopup(`<strong>Start:</strong> ${route.start || 'Start Location'}`);

            // End marker (red)
            const endIcon = L.divIcon({
                className: 'custom-marker end-marker',
                html: '<div class="marker-content"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80.8,146,84.4,149.1a8,8,0,0,0,7.2,0C135.2,250,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,112a24,24,0,1,1,24-24A24,24,0,0,1,128,128Z"></path></svg></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 20]
            });

            L.marker([endPoint[0], endPoint[1]], { icon: endIcon })
                .addTo(map)
                .bindPopup(`<strong>End:</strong> ${routeUtils.getShortAddress(route.end) || 'End Location'}`);

            // Fit map to route bounds with proper zoom
            const bounds = routeLine.getBounds();
            console.log('Fitting bounds for route:', route.id, bounds);
            map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 16 // Prevent zooming too close
            });

            // Ensure minimum zoom level
            setTimeout(() => {
                if (map.getZoom() < 8) {
                    map.setZoom(8);
                }
                console.log('Map zoom level after fitBounds:', map.getZoom());
            }, 100);
        } else if (routeData && routeData.routePath && routeData.routePath.length > 0) {
            console.log('Found routePath data:', routeData.routePath.length, 'points');
            // Draw route path using routePath coordinates
            const routeLine = L.polyline(routeData.routePath, {
                color: '#00A7E1',
                weight: 3,
                opacity: 0.8
            }).addTo(map);

            // Add start and end markers
            const startPoint = routeData.routePath[0];
            const endPoint = routeData.routePath[routeData.routePath.length - 1];

            // Start marker (green)
            const startIcon = L.divIcon({
                className: 'custom-marker start-marker',
                html: '<div class="marker-content"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80.8,146,84.4,149.1a8,8,0,0,0,7.2,0C135.2,250,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,112a24,24,0,1,1,24-24A24,24,0,0,1,128,128Z"></path></svg></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 20]
            });

            L.marker([startPoint[0], startPoint[1]], { icon: startIcon })
                .addTo(map)
                .bindPopup(`<strong>Start:</strong> ${routeUtils.getShortAddress(route.start) || 'Start Location'}`);

            // End marker (red)
            const endIcon = L.divIcon({
                className: 'custom-marker end-marker',
                html: '<div class="marker-content"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80.8,146,84.4,149.1a8,8,0,0,0,7.2,0C135.2,250,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,112a24,24,0,1,1,24-24A24,24,0,0,1,128,128Z"></path></svg></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 20]
            });

            L.marker([endPoint[0], endPoint[1]], { icon: endIcon })
                .addTo(map)
                .bindPopup(`<strong>End:</strong> ${route.end || 'End Location'}`);

            // Fit map to route bounds with proper zoom
            const bounds = routeLine.getBounds();
            console.log('Fitting bounds for route:', route.id, bounds);
            map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 16 // Prevent zooming too close
            });

            // Ensure minimum zoom level
            setTimeout(() => {
                if (map.getZoom() < 8) {
                    map.setZoom(8);
                }
                console.log('Map zoom level after fitBounds:', map.getZoom());
            }, 100);
        } else if (routeData && routeData.pointsData && routeData.pointsData.length > 0) {
            console.log('Found pointsData:', routeData.pointsData.length, 'points');
            // Fallback: try pointsData format
            const coordinates = routeData.pointsData.map(point => [point.lat, point.lng]);
            const polyline = L.polyline(coordinates, {
                color: '#00A7E1',
                weight: 3,
                opacity: 0.8
            }).addTo(map);

            // Fit map to route bounds with proper zoom
            const bounds = polyline.getBounds();
            console.log('Fitting bounds for route (pointsData):', route.id, bounds);
            map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 16 // Prevent zooming too close
            });

            // Ensure minimum zoom level
            setTimeout(() => {
                if (map.getZoom() < 8) {
                    map.setZoom(8);
                }
                console.log('Map zoom level after fitBounds (pointsData):', map.getZoom());
            }, 100);

            // Add start marker
            if (coordinates.length > 0) {
                const start = coordinates[0];
                const startMarker = L.marker(start, {
                    icon: L.divIcon({
                        className: 'custom-marker start-marker',
                        html: '<div class="marker-icon start-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80.8,146,84.4,149.1a8,8,0,0,0,7.2,0C135.2,250,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,112a24,24,0,1,1,24-24A24,24,0,0,1,128,128Z"></path></svg></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(map);

                startMarker.bindPopup(`
                    <div class="marker-popup">
                        <strong>Start Location</strong><br>
                        ${routeUtils.getShortAddress(route.start) || 'Start Point'}
                    </div>
                `);
            }

            // Add end marker
            if (coordinates.length > 1) {
                const end = coordinates[coordinates.length - 1];
                const endMarker = L.marker(end, {
                    icon: L.divIcon({
                        className: 'custom-marker end-marker',
                        html: '<div class="marker-icon end-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80.8,146,84.4,149.1a8,8,0,0,0,7.2,0C135.2,250,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,112a24,24,0,1,1,24-24A24,24,0,0,1,128,128Z"></path></svg></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(map);

                endMarker.bindPopup(`
                    <div class="marker-popup">
                        <strong>End Location</strong><br>
                        ${routeUtils.getShortAddress(route.end) || 'End Point'}
                    </div>
                `);
            }
        } else {
            // Check for other possible route data structures
            console.log('No routePath or pointsData found. Checking for other route data...');
            console.log('Available route data keys:', routeData ? Object.keys(routeData) : 'No route data');

            // Try to create a simple route from start/end coordinates if available
            if (route.start && route.end) {
                console.log('No route data, trying to create simple route from start/end');
                // This would require geocoding the start/end addresses to coordinates
                // For now, show default view
                map.setView([40.7128, -74.0060], 10);
            } else {
                // Fallback: show default view
                map.setView([40.7128, -74.0060], 10); // Default to NYC
            }
        }

        // Store map instance
        mapInstances.value.set(mapId, map);

    } catch (error) {
        console.error('Error initializing map for route:', route.id, error);
    }
};

// Initialize all maps when routes change
const initializeAllMaps = async () => {
    if (viewMode.value === 'grid' && paginatedRoutes.value.length > 0) {
        await nextTick();
        // Add a small delay to ensure DOM is ready
        setTimeout(async () => {
            for (const route of paginatedRoutes.value) {
                await initializeMap(route);
            }
        }, 100);
    }
};

// Watch for route changes to reinitialize maps
watch([paginatedRoutes, viewMode], async () => {
    if (viewMode.value === 'grid') {
        // Clear existing maps
        mapInstances.value.forEach((map) => {
            if (map) {
                map.remove();
            }
        });
        mapInstances.value.clear();

        // Initialize new maps with a longer delay
        setTimeout(async () => {
            await initializeAllMaps();
        }, 300);
    }
}, { deep: true });

// Additional watcher for when grid view is first rendered
watch(() => viewMode.value === 'grid' && paginatedRoutes.value.length > 0, async (shouldInitialize) => {
    if (shouldInitialize) {
        await nextTick();
        setTimeout(async () => {
            console.log('Initializing maps for grid view');
            await initializeAllMaps();
        }, 500);
    }
});

const authStore = useAuthStore();

// Lifecycle
const getCurrentUserData = async () => {
    if (!authStore.user) {
        await authStore.fetchUserProfile();
    }
    
    if (authStore.user) {
        userType.value = authStore.user.type || 'User';
    }
};

onMounted(async () => {
    await getCurrentUserData();
    loadData();

    registerSearchContext(t('routes'), (query) => {
        searchTerm.value = query;
        handleSearch();
        
        return filteredRoutes.value.slice(0, 5).map(route => ({
             title: route.title || t('untitled'),
             description: routeUtils.getShortAddress(route.start) || t('unknown'),
             action: () => viewRoute(route.id)
        }));
    }, PhSignpostSplit);
});

onUnmounted(() => {
    clearSearchContext();
});
</script>

<style scoped>
/* Design System CSS Variables */
:root {
    --bg-base: #F9FAFB;
    --bg-surface: #FFF;
    --bg-elevated: #F4F5F6;
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --accent: #00A7E1;
    --accent-hover: #0090C9;
    --border: #E5E7EB;
    --success: #00B386;
    --warning: #F39C12;
    --error: #E83E8C;

    /* Spacing Scale */
    --spacing-2xs: 4px;
    --spacing-xs: 8px;
    --spacing-sm: 12px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
}

/* Dark mode overrides */
[data-bs-theme="dark"] {
    --bg-base: #0F172A;
    --bg-surface: #1E293B;
    --bg-elevated: #334155;
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --border: #475569;
}

.route-manager-page {
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

/* Header Actions */
.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
    width: 100%;
}

/* View Toggle */
.view-toggle {
    display: flex;
    gap: var(--spacing-2xs);
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
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
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
}

/* Map Container */
.map-container {
    height: 200px;
    width: 100%;
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: var(--spacing-md);
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    position: relative;
    min-height: 200px;
}

/* Ensure Leaflet map fills container */
.map-container :deep(.leaflet-container) {
    height: 100% !important;
    width: 100% !important;
    border-radius: var(--radius-lg);
}

/* Custom Marker Styles */
:deep(.custom-marker) {
    background: transparent;
    border: none;
}

:deep(.marker-content) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
}

:deep(.marker-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
}

:deep(.start-marker .marker-content) {
    background: var(--success);
    color: white;
}

:deep(.end-marker .marker-content) {
    background: var(--error);
    color: white;
}

:deep(.start-icon) {
    background: var(--success);
    color: white;
}

:deep(.end-icon) {
    background: var(--error);
    color: white;
}

:deep(.marker-popup) {
    font-size: 14px;
    line-height: 1.4;
}

:deep(.marker-popup strong) {
    color: var(--text-primary);
    font-weight: 600;
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
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-sm);
}

.route-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-sm);
}

.route-actions {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
    width: 100%;
}

.route-actions .btn-block {
    flex: 1;
    width: 100%;
}


.btn-icon {
    width: auto;
    min-width: 40px;
    padding: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
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
    border-radius: var(--radius-xl);
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.planned {
    background: color-mix(in srgb, var(--status-needs-data), transparent 80%);
    color: var(--status-needs-data);
}

.status-badge.surveyed {
    background: color-mix(in srgb, var(--status-ready), transparent 80%);
    color: var(--status-ready);
}

.status-badge.reported {
    background: color-mix(in srgb, var(--status-shared), transparent 80%);
    color: var(--status-shared);
}

.status-badge.shared {
    background: color-mix(in srgb, var(--status-blocking), transparent 80%);
    color: var(--status-blocking);
}

.start-location {
    color: var(--status-ready);
}

.end-location {
    color: var(--status-blocking);
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

.action-buttons {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
}

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
@media (width <= 1400px) {
    .routes-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (width <= 768px) {
    .route-manager-page {
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
        gap: var(--spacing-xs);
    }

    .route-info {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
    }

    .route-actions {
        justify-content: center;
        flex-wrap: wrap;
    }

    .header-actions {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
    }
}

@media (width <= 480px) {
    .route-manager-page {
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

    .header-actions {
        gap: var(--spacing-xs);
    }
}
</style>
