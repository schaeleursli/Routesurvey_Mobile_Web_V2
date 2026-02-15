<template>
    <div class="dashboard">
        <!-- Loading State -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center p-5">
            <BaseLoadingIndicator message="Loading dashboard data..." size="large" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-4">
            <BaseEmptyState 
                variant="error"
                title="Failed to load dashboard"
                :message="error"
            >
                <template #actions>
                    <BaseButton @click="fetchDashboardData" variant="primary" size="medium">
                         <template #icon-left>
                            <PhArrowsClockwise :size="20" />
                        </template>
                        Retry
                    </BaseButton>
                </template>
            </BaseEmptyState>
        </div>

        <!-- Dashboard Content -->
        <div v-else>
            <!-- Onboarding Widget (Dismissible) -->
            <DashboardOnboarding 
                v-if="showOnboarding" 
                @dismiss="dismissOnboarding" 
            />

            <!-- Routes Section -->
            <div class="routes-section">
                <BasePanel :title="activeFilter ? `${getFilterTitle(activeFilter)} Routes` : 'Recent Routes'"
                    :subtitle="`${routesToDisplay.length} routes${activeFilter ? ' (filtered)' : ''}`"
                    elevation="level2">
                    <template #header>
                        <div class="panel-header-actions">
                            <!-- KPI Badges -->
                            <div class="kpi-group">
                                <DashboardKpiBadge
                                    v-for="type in ['planned', 'surveyed', 'reported', 'shared']"
                                    :key="type"
                                    :kpi-type="type"
                                    :value="animatedStats[type]"
                                    :is-active="activeFilter === type"
                                    :label="type"
                                    @click="setFilter(type, $event)"
                                />
                            </div>

                            <div class="view-toggle">
                                <BaseButton @click="viewMode = 'table'"
                                    :variant="viewMode === 'table' ? 'primary' : 'ghost'" size="small"
                                    title="List View">
                                    <PhListBullets :size="20" weight="duotone" />
                                </BaseButton>
                                <BaseButton @click="viewMode = 'cards'"
                                    :variant="viewMode === 'cards' ? 'primary' : 'ghost'" size="small"
                                    title="Card View">
                                    <PhGridFour :size="20" weight="duotone" />
                                </BaseButton>
                            </div>
                        </div>
                    </template>

                <!-- List View (Standardized) -->
                <div v-if="viewMode === 'table'" class="routes-list">
                    <div class="routes-list-header">
                        <div class="list-col-info">Route</div>
                        <div class="list-col-locations">Locations</div>
                        <div class="list-col-distance">Distance</div>
                        <div class="list-col-status">Status</div>
                        <div class="list-col-actions">Actions</div>
                    </div>
                    <div v-if="routesToDisplay.length === 0" class="p-4 text-center text-muted">
                        No routes found
                    </div>
                     <DashboardRouteListItem 
                        v-for="route in routesToDisplay" 
                        :key="route.id" 
                        :route="route"
                        :is-selected="isRouteSelected(route)"
                        @navigate="navigateToRoute(route)"
                        @action="handleCardAction"
                    />
                </div>

                <!-- Card View -->
                <div v-else-if="viewMode === 'cards'" class="routes-cards">
                    <div v-if="routesToDisplay.length === 0" class="no-routes">
                        <BaseEmptyState 
                            title="No routes found"
                            message="Create your first route to get started"
                            compact
                        >
                            <template #icon>
                                <PhMapTrifold :size="48" weight="duotone" />
                            </template>
                        </BaseEmptyState>
                    </div>
                    <div v-else class="cards-grid">
                        <DashboardRouteCard 
                            v-for="(route, index) in routesToDisplay" 
                            :key="route.id" 
                            :route="route"
                            :is-selected="isRouteSelected(route)"
                            class="animate-stagger"
                            :style="{ animationDelay: `${index * 100}ms` }"
                            @click="navigateToRoute(route)"
                            @action="handleCardAction"
                            @select="handleRouteSelect"
                            @release="handleRouteRelease"
                        />
                    </div>
                </div>
            </BasePanel>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed, nextTick, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboard } from '@/composables/useDashboard'
import { useUnits } from '@/composables/useUnits'
import { BaseCard, BaseButton, BasePanel, BaseLoadingIndicator, BaseEmptyState } from '@/components/ui';
import DashboardRouteCard from '@/components/dashboard/DashboardRouteCard.vue';
import DashboardRouteListItem from '@/components/dashboard/DashboardRouteListItem.vue';
import DashboardOnboarding from '@/components/dashboard/DashboardOnboarding.vue';
import DashboardKpiBadge from '@/components/dashboard/DashboardKpiBadge.vue';
import routeUtils from '@/utils/route_utils';

import { useRouteContextStore } from '@/stores/routeContext';
import { PhArrowsClockwise, PhListBullets, PhGridFour, PhMapTrifold } from "@phosphor-icons/vue";

const router = useRouter()
const { formatDistance } = useUnits()
const routeContextStore = useRouteContextStore()

// Last viewed route tracking
const LAST_VIEWED_ROUTE_KEY = 'lastViewedRouteId'

const getLastViewedRouteId = () => {
    try {
        return localStorage.getItem(LAST_VIEWED_ROUTE_KEY)
    } catch (error) {
        console.error('Error getting last viewed route:', error)
        return null
    }
}

const setLastViewedRouteId = (routeId) => {
    try {
        localStorage.setItem(LAST_VIEWED_ROUTE_KEY, String(routeId))
    } catch (error) {
        console.error('Error setting last viewed route:', error)
    }
}

const lastViewedRouteId = ref(getLastViewedRouteId())

const isLastViewedRoute = (routeId) => {
    return lastViewedRouteId.value && String(routeId) === String(lastViewedRouteId.value)
}

// Onboarding State
const showOnboarding = ref(localStorage.getItem('onboardingDismissed') !== 'true');

const dismissOnboarding = () => {
    showOnboarding.value = false;
    localStorage.setItem('onboardingDismissed', 'true');
};

// View mode state
const viewMode = ref('table')

// Filter state
const activeFilter = ref(null)

// Sorting state
const sortColumn = ref('')
const sortDirection = ref('asc')

// Table columns configuration
const tableColumns = [
    { key: 'name', label: 'ROUTE NAME', sortable: true },
    { key: 'location', label: 'START / END', sortable: false },
    { key: 'distance', label: 'DISTANCE', sortable: true },
    { key: 'status', label: 'STATUS', sortable: true },
    { key: 'updated', label: 'UPDATED', sortable: true }
]

// Use dashboard composable
const {
    loading,
    error,
    stats,
    recentRoutes,
    allDashboardRoutes,
    fetchDashboardData,
    fetchAndAddRoute,
    routeExistsInDashboard,
    formatDate,
    getStatusClass
} = useDashboard()

// Animated stats
const animatedStats = reactive({
    planned: 0,
    surveyed: 0,
    reported: 0,
    shared: 0
})

// Tweening function for smooth number animation
const tweenValue = (key, start, end, duration = 1000) => {
    if (start === end) return
    
    const range = end - start
    let startTime = null
    
    const animate = (currentTime) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        
        // Ease out quart
        const easeProperties = 1 - Math.pow(1 - progress, 4)
        
        animatedStats[key] = Math.floor(start + (range * easeProperties))
        
        if (progress < 1) {
            requestAnimationFrame(animate)
        } else {
            animatedStats[key] = end
        }
    }
    
    requestAnimationFrame(animate)
}

// Watch for stats changes to trigger animation
watch(() => stats.value, (newStats) => {
    if (newStats) {
        tweenValue('planned', animatedStats.planned, newStats.planned.count)
        tweenValue('surveyed', animatedStats.surveyed, newStats.surveyed.count)
        tweenValue('reported', animatedStats.reported, newStats.reported.count)
        tweenValue('shared', animatedStats.shared, newStats.shared.count)
    }
}, { deep: true, immediate: true })

// Computed property to ensure last viewed route is always included
const routesToDisplay = computed(() => {
    // Use all routes when filtering, otherwise use recent routes
    let routes = activeFilter.value ? [...allDashboardRoutes.value] : [...recentRoutes.value]

    // Apply filter if active
    if (activeFilter.value) {
        routes = routes.filter((route) => {
            const routeStatus = String(route.status).toLowerCase()
            const filterValue = activeFilter.value.toLowerCase()

            // Handle "completed" status as "reported"
            if (filterValue === 'reported') {
                return routeStatus === 'reported' || routeStatus === 'completed'
            }

            return routeStatus === filterValue
        })
    } else {
        // If there's a last viewed route and it's not in the recent 5, ensure it's included
        if (lastViewedRouteId.value) {
            const lastViewedRoute = routes.find(
                (route) => String(route.id) === String(lastViewedRouteId.value)
            )

            if (!lastViewedRoute) {
                // Try to find it in all dashboard routes (not just recent 5)
                const routeInAllRoutes = allDashboardRoutes.value.find(
                    (route) => String(route.id) === String(lastViewedRouteId.value)
                )

                if (routeInAllRoutes) {
                    // Add it to the beginning of the list so it's visible
                    routes = [routeInAllRoutes, ...routes]
                    // Keep only 5 routes total (or 6 if we added the last viewed one)
                    routes = routes.slice(0, 6)
                }
            }
        }
    }

    return routes
})



// Sort function for BaseTable
const handleSort = (column) => {
    if (sortColumn.value === column) {
        // Toggle direction if same column
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        // New column, default to ascending
        sortColumn.value = column
        sortDirection.value = 'asc'
    }
}



// Filter functions
const setFilter = (filterType, event) => {
    // Prevent navigation and default behavior
    if (event) {
        event.preventDefault()
        event.stopPropagation()
    }
    console.log('setFilter called with:', filterType)
    console.log('Current activeFilter:', activeFilter.value)
    // Toggle filter: if clicking the same filter, clear it
    if (activeFilter.value === filterType) {
        activeFilter.value = null
    } else {
        activeFilter.value = filterType
    }
    console.log('Filter set to:', activeFilter.value)
    // Force reactivity check
    nextTick(() => {
        console.log('After nextTick, activeFilter:', activeFilter.value)
    })
}

const clearFilter = () => {
    activeFilter.value = null
}

const getFilterTitle = (filterType) => {
    if (!filterType) return ''
    const titles = {
        planned: 'Planned',
        surveyed: 'Surveyed',
        reported: 'Reported',
        shared: 'Shared'
    }
    return titles[filterType] || filterType
}

// Navigate to route edit/view page based on route type
const navigateToRoute = (route) => {
    if (!route || !route.id) return

    // Save last viewed route ID
    setLastViewedRouteId(route.id)
    lastViewedRouteId.value = String(route.id)

    // console.log('route', route)

    switch (String(route.status).toLowerCase()) {
        case 'planned':
            // router.push({ name: 'edit-planned-route', params: { id: route.id } })
            router.push("/planned-routes/" + route.id)
            break
        case 'manual':
            router.push({ name: 'edit-manual-route', params: { id: route.id } })
            break
        case 'surveyed':
            // router.push({ name: 'RouteViewer', params: { id: route.id } })
            router.push("/routes/" + route.id + "/view")
            break
        default:
            // Fallback to route viewer for unknown types
            router.push({ name: 'RouteViewer', params: { id: route.id } })
            break
    }
}

// Load dashboard data on component mount
onMounted(async () => {
    await fetchDashboardData()
    // Refresh last viewed route ID from localStorage
    lastViewedRouteId.value = getLastViewedRouteId()

    // If last viewed route is not in the dashboard routes, fetch and add it
    if (lastViewedRouteId.value) {
        // Check if route exists in ALL dashboard routes (not just recent 5)
        const routeExists = routeExistsInDashboard(lastViewedRouteId.value)

        if (!routeExists) {
            // Try to fetch and add the route
            const success = await fetchAndAddRoute(lastViewedRouteId.value)
            if (success) {
                console.log(`Successfully added route ${lastViewedRouteId.value} to dashboard`)
            } else {
                console.warn(`Failed to fetch and add route ${lastViewedRouteId.value} to dashboard`)
            }
        }
    }
})

const handleCardAction = ({ route, step }) => {
    // console.log('Card action:', step, route, route.id);
    const routeId = route.id;
    
    switch (step) {
        case 'planned':
            // Logic: Go to the edit page for the planned route
            if (route.type === 'planned' || route.status === 'Planned') {
                 router.push({ name: 'EditPlannedRoute', params: { id: routeId } });
            } else {
                // Fallback if it's a surveyed route but user clicked planned step (maybe view plan details?)
                 router.push({ name: 'ViewPlannedRoute', params: { id: routeId } });
            }
            break;
            
        case 'surveyed':
             // Logic: View the survey/route details
             // If we want the locked context:
             router.push({ name: 'SurveyExecution', params: { id: routeId } });
             // Or unlocked:
             // router.push({ name: 'RouteViewer', params: { id: routeId } });
            break;
            
        case 'report':
            // Logic: Go to the report page for this route
            router.push({ name: 'SurveyReport', params: { id: routeId } });
            break;
            
        case 'share':
            // Logic: Go to the share page for this route
            router.push({ name: 'SurveyShare', params: { id: routeId } });
            break;
            
        default:
            navigateToRoute(route);
            break;
    }
};

const handleRouteSelect = (route) => {
    routeContextStore.selectRoute(route)
}

const handleRouteRelease = () => {
    routeContextStore.clearRoute()
}

const isRouteSelected = (route) => {
    return routeContextStore.selectedRouteId === String(route.id)
}
</script>

<style scoped>
/* Design System CSS Variables */

/* Design System CSS Variables are now global in @/assets/css/design-system.css */

.dashboard {
    padding: 1rem;

    /* background-color: var(--bg-base); */
    /* background-color: var(--bg-base); */
    min-height: 100vh;
    color: var(--text-primary);
    width: 100%;
    margin: 0;
}

/* Page Header */
.page-header {
    margin-bottom: 2rem;
}

.page-title {
    font-size: 48px;

    /* Display Heading from design system */
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
    letter-spacing: -0.5%;
}

.page-subtitle {
    font-size: 16px;

    /* Body Text from design system */
    font-weight: 400;
    color: var(--text-secondary);
    margin: 0;
    letter-spacing: 0%;
}


/* Onboarding styles moved to component */

/* Summary Cards - Design System Applied */
.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.summary-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
    transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.summary-card--active {
    border: 2px solid var(--accent) !important;
    background: rgb(0 167 225 / 5%) !important;
    box-shadow: 0 4px 12px rgb(0 167 225 / 20%) !important;
}

.summary-card--active:hover {
    background: rgb(0 167 225 / 10%) !important;
    box-shadow: 0 6px 16px rgb(0 167 225 / 30%) !important;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.card-header h3,
.card-header h4 {
    font-size: 24px;

    /* Panel Title from design system */
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: 0%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.change-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    font-size: 0.7rem;
    font-weight: 600;
    padding: var(--spacing-2xs) var(--spacing-xs);
    border-radius: 4px;
}

.change-indicator.positive {
    color: var(--success);
    background: rgb(0 179 134 / 10%);
}

.change-indicator.negative {
    color: var(--error);
    background: rgb(232 62 140 / 10%);
}

.change-indicator.neutral {
    color: var(--text-secondary);
    background: var(--bg-elevated);
}

.card-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.card-description {
    font-size: 14px;

    /* Small/Label from design system */
    color: var(--text-secondary);
    line-height: 1.3;
    font-weight: 400;
}

/* Routes Section - Now handled by BasePanel component */

.routes-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.filter-badge-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 var(--spacing-xs);
}

.panel-header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
    width: 100%;
    justify-content: flex-end;
}

.active-filter-badge {
    display: flex !important;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgb(0 167 225 / 10%);
    border: 1px solid var(--accent);
    border-radius: 6px;
    color: var(--accent);
    font-size: 14px;
    font-weight: 500;
    visibility: visible !important;
    opacity: 1 !important;
    cursor: default;
    pointer-events: auto;
    user-select: none;
}

.active-filter-badge i {
    font-size: 14px;
}

/* Ensure header content is visible in BasePanel */
:deep(.base-panel__header-content) {
    display: flex !important;
    align-items: center;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;
    min-width: 0;
    width: 100%;
}

/* Ensure header main layout works correctly */
:deep(.base-panel__header-main) {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.view-toggle {
    display: flex;
    gap: var(--spacing-2xs);
    background: var(--bg-elevated);
    border-radius: 6px;
    padding: var(--spacing-2xs);
}

.view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.view-btn:hover {
    background: var(--bg-surface);
    color: var(--text-primary);
}

.view-btn.active {
    background: var(--accent);
    color: white;
}

.view-btn i {
    font-size: 1rem;
}

.routes-search {
    position: relative;
    display: flex;
    align-items: center;
    max-width: 300px;
}

/* KPI Badges in Panel Header */
.kpi-group {
    display: flex;
    gap: var(--spacing-sm);
    margin-right: auto;

    /* Push to left side of actions area */
}

/* KPI Badge styles moved to component */

@media (width <= 900px) {
    .kpi-group {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 4px;
        margin-right: 0;
        margin-bottom: var(--spacing-sm);
        justify-content: flex-start;
    }
    
    .panel-header-actions {
        flex-direction: column;
        align-items: flex-end;
    }
}

.routes-search i {
    position: absolute;
    left: 1rem;
    color: var(--text-secondary);
    z-index: 1;
}

.routes-search-input {
    padding: var(--spacing-xs) var(--spacing-md) var(--spacing-xs) var(--spacing-2xl);
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 0.875rem;
    width: 100%;
    transition: border-color 0.2s;
}

.routes-search-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgb(0 167 225 / 10%);
}

/* Routes Table */
.routes-table {
    overflow-x: auto;
}

/* Routes Cards */
.routes-cards {
    padding: 0.1rem;
}

.cards-grid {
    display: grid;
    /* Default to 1 column on mobile */
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
}

@media (width >= 768px) {
    .cards-grid {
        /* 2 columns on tablet */
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (width >= 1024px) {
    .cards-grid {
        /* 3 columns on desktop */
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Route Card Styles */
.route-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
}

.route-title {
    font-size: 24px;

    /* Panel Title from design system */
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

/* Legacy card styles - now handled by BaseCard component */

.location-section {
    margin-bottom: 1rem;
}

.route-card .location-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    margin-bottom: 0.75rem;
}

.route-card .location-item:last-child {
    margin-bottom: 0;
}

.route-card .location-item i {
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

.location-label {
    font-size: 13px;

    /* Small/Label from design system */
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.2%;
}

.location-text {
    font-size: 14px;

    /* Small/Label from design system */
    color: var(--text-primary);
    line-height: 1.3;
    word-break: break-word;
    font-weight: 400;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bs-border-color);
}

.route-card .distance-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: 14px;

    /* Small/Label from design system */
    font-weight: 400;
}

.route-card .update-time {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: 13px;

    /* Small/Label from design system */
    font-weight: 400;
}

.route-card .update-time i {
    font-size: 0.75rem;
}

.route-card--last-viewed {
    border-left: 4px solid var(--accent) !important;
    background: rgb(0 167 225 / 5%) !important;
    box-shadow: 0 4px 12px rgb(0 167 225 / 15%) !important;
}

.route-card--last-viewed:hover {
    background: rgb(0 167 225 / 10%) !important;
    box-shadow: 0 8px 24px rgb(0 167 225 / 20%) !important;
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr 1fr 1.5fr;
    gap: var(--spacing-md);
    padding: 1rem 1.5rem;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    font-weight: 600;
    font-size: 13px;

    /* Small/Label from design system */
    text-transform: uppercase;
    letter-spacing: 0.2%;
    color: var(--text-secondary);
}

.table-body {
    display: flex;
    flex-direction: column;
}

.table-row {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr 1fr 1.5fr;
    gap: var(--spacing-md);
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    transition: background-color 0.2s;
}

.table-row:hover {
    background: var(--bg-elevated);
}

.clickable-row {
    cursor: pointer;
    transition: all 0.2s ease;
}

.clickable-row:hover {
    background: rgb(0 167 225 / 5%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.table-row:last-child {
    border-bottom: none;
}

.table-cell {
    display: flex;
    align-items: center;
    font-size: 14px;

    /* Small/Label from design system */
    color: var(--text-primary);
    font-weight: 400;
}

.table-cell.sortable {
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.table-cell.sortable:hover {
    color: var(--accent);
}

.route-name {
    font-weight: 500;
    color: var(--text-primary);
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

.start-location {
    color: var(--success);
}

.end-location {
    color: var(--error);
}

.distance-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
}

.status-badge {
    padding: var(--spacing-2xs) var(--spacing-sm);
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.surveyed {
    background: rgb(0 179 134 / 20%);
    color: var(--success);
}

.status-badge.reported {
    background: rgb(0 167 225 / 20%);
    color: var(--accent);
}

.status-badge.planned {
    background: rgb(243 156 18 / 20%);
    color: var(--warning);
}

.status-badge.shared {
    background: rgb(232 62 140 / 20%);
    color: var(--error);
}

.update-time {
    color: var(--text-secondary);
    font-size: 13px;

    /* Small/Label from design system */
    line-height: 1.2;
    white-space: nowrap;
    font-weight: 400;
}

.update-time span {
    display: block;
    line-height: 1.2;
}

/* Responsive Design */
@media (width <= 768px) {
    .header-content {
        flex-direction: column;
        align-items: stretch;
    }

    .header-actions {
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .search-input {
        min-width: auto;
        width: 100%;
    }

    .summary-cards {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
        margin-bottom: 1rem;
    }

    .summary-card {
        padding: 1rem;
    }

    /* Section styles now handled by BasePanel component */

    .panel-header-actions {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
    }

    .active-filter-badge {
        width: 100%;
        justify-content: space-between;
    }

    .view-toggle {
        align-self: flex-end;
    }

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: var(--spacing-xs);
    }

    .table-cell {
        padding: 0.5rem 0;
    }

    .table-cell::before {
        content: attr(data-label);
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--bs-secondary);
        margin-bottom: 0.25rem;
        display: block;
    }

    .cards-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
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
}

/* Loading and Error States handled by Base components */


/* No Routes State handled by BaseEmptyState */

/* Routes List Standardized Styles */
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
</style>
