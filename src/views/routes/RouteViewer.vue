<template>
    <div class="route-viewer-redesign" v-if="checkFeatureAccess('free_surveys') && routeData">
        <SurveyLayout 
            :show-left="true" 
            :show-right="!!store.activePointId"
        >
            <!-- Map (Center) -->
            <template #map>
                <SurveyMap 
                    :routeGeometry="routeGeometry" 
                />
            </template>

            <!-- List (Left) -->
            <template #list>
                 <PointListPanel />
            </template>

            <!-- Details (Right) -->
            <template #details>
                <PointDetailDrawer v-if="store.activePointId" />
            </template>
        </SurveyLayout>

        <!-- Modals if needed -->
    </div>
    <div v-else-if="isLoading" class="loading-container">
        <div class="spinner-border text-primary" role="status"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSurveyStore } from '@/stores/surveyStore';
import { useAuthStore } from '@/stores/auth';
import { useSubscription } from "@/composables/subscription/useSubscription";
import RoutesController from '@/controllers/routes/routes_controller';
import routeUtils from '@/utils/route_utils';

// Components
import SurveyLayout from '@/components/survey/SurveyLayout.vue';
import SurveyMap from '@/components/survey/SurveyMap.vue';
import PointListPanel from '@/components/survey/PointListPanel.vue';
import PointDetailDrawer from '@/components/survey/PointDetailDrawer.vue';
import { BaseButton } from '@/components/ui';

const { checkFeatureAccess } = useSubscription();

// Hooks
const route = useRoute();
const router = useRouter();
const store = useSurveyStore();
const authStore = useAuthStore();

// State
const isLoading = ref(true);
const routeData = ref(null);
const routeGeometry = ref([]); // The polyline path
const initialItemsJSON = ref(''); // For dirty checking
const isSaving = ref(false);

// Computed
const hasUnsavedChanges = computed(() => {
    return JSON.stringify(store.points) !== initialItemsJSON.value;
});

// Initialization
onMounted(async () => {
    const id = route.params.id;
    if (!id) return;

    // Set User Preferences in Store
    if (authStore.user?.imperial) {
        store.unitSystem = 'imperial';
    }

    try {
        isLoading.value = true;
        
        // Fetch Route
        const response = await RoutesController.getRoute(id);
        
        if (response && response.result) {
            routeData.value = response.data;
            // Support 'pointsData' (normalized), 'route_points' (legacy/spec), and 'points' (user edit)
            const rawPoints = response.data.pointsData || response.data.route_points || response.data.points;
            // Ensure allPoints is always an array
            const allPoints = Array.isArray(rawPoints) ? rawPoints : [];
            
            // Separate Geometry and Items
            routeGeometry.value = allPoints.filter(p => p.type === 'route_point');
            const items = allPoints.filter(p => p.type !== 'route_point');
            
            // Calculate Distances (using route utils)
            const calculatedPoints = routeUtils.calculateRoutePointsDistances(allPoints);
            const calculatedItems = calculatedPoints.filter(p => p.type !== 'route_point');
            const calculatedGeometry = calculatedPoints.filter(p => p.type === 'route_point');

            // FIX: Use setPoints instead of setItems
            store.setPoints(calculatedItems);
            routeGeometry.value = calculatedGeometry;
            
            // Checkpoint for dirty state
            // FIX: Use store.points instead of store.items
            initialItemsJSON.value = JSON.stringify(store.points);
        }
    } catch (e) {
        console.error("Failed to load survey", e);
    } finally {
        isLoading.value = false;
    }
});

// Save Functionality
const saveRoute = async () => {
    if (!routeData.value) return;
    
    try {
        isSaving.value = true;
        
        // Re-combine Geometry and Items
        // We MUST preserve order if possible, but usually route points are sorted by index/order?
        // If 'route_point' types define the path, and items are POIs.
        // We can just concatenate. The backend or map usage usually handles them.
        // If order matters (e.g. items inserted BETWEEN route points), we need `index` or `distance` sorting.
        // `RouteMapViewer` used `routePoints` array.
        // We'll rely on distance sorting or just save them as is.
        // If the backend expects a flat list.
        
        const allPoints = [...routeGeometry.value, ...store.points];
        
        // We might need to sort them if index matters?
        // Assuming they have 'index' property? Or we resort by distance?
        // Safe bet: sort if we have reliable distance, otherwise append.
        // For now, let's just save.
        
        const updatedRoute = {
            ...routeData.value,
            route_points: allPoints
        };
        
        const res = await RoutesController.updateRoute(routeData.value.id, updatedRoute);
        if (res && res.result) {
             // Update checkpoint
             initialItemsJSON.value = JSON.stringify(store.points);
             // Maybe show toast?
        }
    } catch (e) {
        console.error("Save failed", e);
    } finally {
        isSaving.value = false;
    }
};

onUnmounted(() => {
    // Clear store or reset?
    store.setPoints([]);
    store.setActivePoint(null);
});
</script>

<style scoped>
.route-viewer-redesign {
    height: 100%; /* Fill available space in MainLayout content area */
    width: 100%;
    overflow: hidden;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.survey-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
}

.header-main {
    display: flex;
    flex-direction: column;
}

.route-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
}

.header-meta {
    font-size: 0.8rem;
    color: var(--text-secondary);
    display: flex;
    gap: 0.5rem;
}
</style>