import { ref } from "vue";
import RoutesController from "@/controllers/routes/routes_controller";

export function useUserRoutes() {
  const routes = ref([]);
  const selectedRouteId = ref(null);
  const selectedRoute = ref(null);
  const routePoints = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Pagination state
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const routesPerPage = ref(10);

  // Fetch all routes for the current user (paginated)
  const fetchRoutes = async (page = 1) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await RoutesController.getCurrentUserRoutesPaginated(page, routesPerPage.value);

      if (res.result) {
        routes.value = res.data;
        totalCount.value = res.pagination.TotalCount;
        totalPages.value = res.pagination.TotalPages;
        currentPage.value = res.pagination.CurrentPage;

        // Auto-select the first route if available
        if (routes.value.length > 0 && !selectedRouteId.value) {
          selectedRouteId.value = routes.value[0].id;
          await fetchRoutePoints(selectedRouteId.value);
        }
      } else {
        routes.value = [];
        totalCount.value = 0;
        totalPages.value = 1;
      }
    } catch (e) {
      error.value = e;
      routes.value = [];
      totalCount.value = 0;
      totalPages.value = 1;
    } finally {
      loading.value = false;
    }
  };

  // Fetch points for a given route
  const fetchRoutePoints = async (routeId) => {
    loading.value = true;
    error.value = null;
    try {
      selectedRouteId.value = routeId;

      const res = await RoutesController.getRoute(routeId);
      if (res.result) {
        selectedRoute.value = res.data;
        routePoints.value = res.data.pointsData || [];
      } else {
        selectedRoute.value = null;
        routePoints.value = [];
      }
    } catch (e) {
      error.value = e;
      selectedRoute.value = null;
      routePoints.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Change the selected route
  const selectRoute = async (routeId) => {
    await fetchRoutePoints(routeId);
  };

  // Go to a specific page
  const goToPage = async (page) => {
    if (page >= 1 && page <= totalPages.value) {
      await fetchRoutes(page);
    }
  };

  return {
    routes,
    selectedRouteId,
    selectedRoute,
    routePoints,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    routesPerPage,
    fetchRoutes,
    selectRoute,
    goToPage,
  };
}
