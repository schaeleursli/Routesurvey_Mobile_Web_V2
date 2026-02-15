import { ref } from "vue";

export function useRouteState() {
  // Route state
  const startPoint = ref(null);
  const endPoint = ref(null);
  const waypoints = ref([]);
  const routePath = ref([]);
  const routeInfo = ref(null);
  const routeMarkers = ref([]); // User-added markers on the route

  // Loading states
  const loadingStartPoint = ref(false);
  const loadingEndPoint = ref(false);
  const loadingWaypoints = ref({}); // Object to track loading state for each waypoint
  const loadingRoute = ref(false);

  const clearRoute = () => {
    startPoint.value = null;
    endPoint.value = null;
    waypoints.value = [];
    routePath.value = [];
    routeInfo.value = null;
    routeMarkers.value = [];
    loadingStartPoint.value = false;
    loadingEndPoint.value = false;
    loadingWaypoints.value = {};
    loadingRoute.value = false;
  };

  const clearWaypoints = () => {
    waypoints.value = [];
    loadingWaypoints.value = {};
  };

  const clearRouteMarkers = () => {
    routeMarkers.value = [];
  };

  return {
    startPoint,
    endPoint,
    waypoints,
    routePath,
    routeInfo,
    routeMarkers,
    loadingStartPoint,
    loadingEndPoint,
    loadingWaypoints,
    loadingRoute,
    clearRoute,
    clearWaypoints,
    clearRouteMarkers,
  };
}
