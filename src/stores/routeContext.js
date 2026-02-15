import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useRouteContextStore = defineStore('routeContext', () => {
    // State
    const selectedRouteId = ref(localStorage.getItem('context_route_id') || null);
    const selectedRouteName = ref(localStorage.getItem('context_route_name') || null);
    const selectedRouteType = ref(localStorage.getItem('context_route_type') || null);

    // Computed
    const hasSelectedRoute = computed(() => !!selectedRouteId.value);

    // Actions
    function selectRoute(route) {
        if (!route) return;

        selectedRouteId.value = String(route.id);
        selectedRouteName.value = route.name || route.title || 'Untitled Route';
        selectedRouteType.value = route.status || 'unknown';

        // Persist
        localStorage.setItem('context_route_id', selectedRouteId.value);
        localStorage.setItem('context_route_name', selectedRouteName.value);
        localStorage.setItem('context_route_type', selectedRouteType.value);
    }

    function clearRoute() {
        selectedRouteId.value = null;
        selectedRouteName.value = null;
        selectedRouteType.value = null;

        // Clear persistence
        localStorage.removeItem('context_route_id');
        localStorage.removeItem('context_route_name');
        localStorage.removeItem('context_route_type');

        // Dispatch event for components that might need to know immediately
        window.dispatchEvent(new CustomEvent('route-context-cleared'));
    }

    // Helper to get destination link based on route type and desired section
    function getContextLink(section) {
        if (!hasSelectedRoute.value) return null;

        const id = selectedRouteId.value;
        const type = String(selectedRouteType.value || '').toLowerCase();

        switch (section) {
            case 'planned':
            case '/planned-routes':
                // navigate to view or edit based on type
                if (type === 'planned') {
                    return { name: 'EditPlannedRoute', params: { id } };
                }
                return { name: 'ViewPlannedRoute', params: { id } };

            case 'surveyed':
            case '/route-manager':
            case '/routes':
                // navigate to survey overview
                // If it's pure planned, we might want to guide them to "Execute Survey" or just view it
                return { name: 'RouteViewer', params: { id } };

            case 'report':
            case '/reporting':
                return { name: 'SurveyReport', params: { id } };

            case 'share':
            case '/user/share_center':
                return { name: 'SurveyShare', params: { id } };

            default:
                return null;
        }
    }

    return {
        selectedRouteId,
        selectedRouteName,
        selectedRouteType,
        hasSelectedRoute,
        selectRoute,
        clearRoute,
        getContextLink
    };
});
