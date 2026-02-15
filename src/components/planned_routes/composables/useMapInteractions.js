import { getAddressFromCoordinates } from "../utils/geocoding.js";
import { calculateDistance } from "../utils/calculations.js";

export function useMapInteractions(
  startPoint,
  endPoint,
  waypoints,
  waypointMode,
  loadingStartPoint,
  loadingEndPoint,
  loadingWaypoints,
  setStartPoint,
  setEndPoint,
  addWaypoint,
  setMapCenter
) {
  const onMapClick = async (event) => {
    const { lat, lng } = event.latlng;

    // Get address information for the clicked location
    if (waypointMode.value) {
      // Add waypoint with loading state
      loadingWaypoints.value[waypoints.value.length] = true;
      try {
        const addressInfo = await getAddressFromCoordinates(lat, lng);
        await addWaypoint(lat, lng, addressInfo, false);
        waypointMode.value = false; // Exit waypoint mode after adding
      } catch (error) {
        console.error("Error adding waypoint:", error);
      } finally {
        loadingWaypoints.value[waypoints.value.length - 1] = false;
      }
      return;
    }

    // If no start point, set as start
    if (!startPoint.value) {
      loadingStartPoint.value = true;
      try {
        const addressInfo = await getAddressFromCoordinates(lat, lng);
        await setStartPoint(lat, lng, addressInfo, false);
      } catch (error) {
        console.error("Error setting start point:", error);
      } finally {
        loadingStartPoint.value = false;
      }
    }
    // If no end point, set as end
    else if (!endPoint.value) {
      loadingEndPoint.value = true;
      try {
        const addressInfo = await getAddressFromCoordinates(lat, lng);
        await setEndPoint(lat, lng, addressInfo, false);
      } catch (error) {
        console.error("Error setting end point:", error);
      } finally {
        loadingEndPoint.value = false;
      }
    }
    // If both start and end points are set, don't add waypoints automatically
    // Waypoints will be extracted from route joints when route is calculated
  };

  const onRouteClick = async (event, routePath, updateModelValue) => {
    console.log("onRouteClick triggered");
    const { lat, lng } = event.latlng;

    // Find the nearest point on the route path to the clicked point
    let nearestRoutePointIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < routePath.value.length; i++) {
      const routePoint = routePath.value[i];
      const distance = calculateDistance(
        routePoint[0],
        routePoint[1],
        lat,
        lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestRoutePointIndex = i;
      }
    }

    // Find the insertion index by checking existing waypoints
    let insertIndex = 0;
    while (insertIndex < waypoints.value.length) {
      const waypoint = waypoints.value[insertIndex];
      // Find this waypoint's position in the route path
      let waypointRouteIndex = 0;
      let minWaypointDistance = Infinity;
      for (let i = 0; i < routePath.value.length; i++) {
        const distance = calculateDistance(
          routePath.value[i][0],
          routePath.value[i][1],
          waypoint.lat,
          waypoint.lng
        );
        if (distance < minWaypointDistance) {
          minWaypointDistance = distance;
          waypointRouteIndex = i;
        }
      }

      if (nearestRoutePointIndex < waypointRouteIndex) {
        break;
      }
      insertIndex++;
    }

    console.log("About to add waypoint at index:", insertIndex);
    // Get address information for the new waypoint with loading state
    loadingWaypoints.value[insertIndex] = true;
    try {
      const addressInfo = await getAddressFromCoordinates(lat, lng);
      console.log("Address info received, adding waypoint");
      const newWaypoint = {
        lat,
        lng,
        ...(addressInfo && { address: addressInfo }),
      };

      waypoints.value.splice(insertIndex, 0, newWaypoint);
      console.log("Waypoint added, calling updateModelValue");
      updateModelValue();
      console.log("onRouteClick completed");
    } catch (error) {
      console.error("Error adding waypoint from route click:", error);
    } finally {
      loadingWaypoints.value[insertIndex] = false;
    }
  };

  const selectSearchResult = async (result, setMapCenter) => {
    console.log(result);
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lng);

    // Just center the map on the selected location without setting start/end points
    setMapCenter(lat, lng, false);
  };

  return {
    onMapClick,
    onRouteClick,
    selectSearchResult,
  };
}
