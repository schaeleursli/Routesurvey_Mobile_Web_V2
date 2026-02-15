import { getAddressFromCoordinates } from "../utils/geocoding.js";
import {
  calculateRoute,
  extractWaypointsFromRoute,
} from "../utils/routeCalculations.js";
import {
  calculateDistance,
  calculateTotalDistance,
} from "../utils/calculations.js";

export function useRouteActions(
  startPoint,
  endPoint,
  waypoints,
  routePath,
  routeInfo,
  loadingStartPoint,
  loadingEndPoint,
  loadingWaypoints,
  loadingRoute,
  updateModelValue,
  centerMap,
  saveStateFunction = null
) {
  const setStartPoint = async (
    lat,
    lng,
    addressInfo = null,
    shouldCenterMap = true
  ) => {
    startPoint.value = {
      lat,
      lng,
      ...(addressInfo && { address: addressInfo }),
    };
    updateModelValue();

    // Calculate full route if we have both start and end points
    if (startPoint.value && endPoint.value) {
      await calculateFullRoute(shouldCenterMap);
    }
  };

  const setEndPoint = async (
    lat,
    lng,
    addressInfo = null,
    shouldCenterMap = true
  ) => {
    endPoint.value = {
      lat,
      lng,
      ...(addressInfo && { address: addressInfo }),
    };
    updateModelValue();

    // Calculate full route if we have both start and end points
    if (startPoint.value && endPoint.value) {
      await calculateFullRoute(shouldCenterMap);
    }
  };

  const addWaypoint = async (
    lat,
    lng,
    addressInfo = null,
    shouldCenterMap = true
  ) => {
    // Save state before adding waypoint
    if (saveStateFunction) {
      saveStateFunction();
    }

    waypoints.value.push({
      lat,
      lng,
      ...(addressInfo && { address: addressInfo }),
    });
    updateModelValue();

    // Calculate full route if we have start and end points
    if (startPoint.value && endPoint.value) {
      await calculateFullRoute(shouldCenterMap);
    }
  };

  const calculateFullRoute = async (shouldCenterMap = true) => {
    console.log("calculateRoute called with shouldCenterMap:", shouldCenterMap);
    if (!startPoint.value || !endPoint.value) return;

    loadingRoute.value = true;

    try {
      const result = await calculateRoute(
        startPoint.value,
        endPoint.value,
        waypoints.value,
        []
      );

      if (result) {
        routePath.value = result.routePath;
        routeInfo.value = result.routeInfo;

        // Extract waypoints from route joints (turns) - but preserve user-added route markers
        if (routePath.value.length > 2) {
          const extractedWaypoints = await extractWaypointsFromRoute(
            routePath.value
          );
          waypoints.value = extractedWaypoints;
        }

        updateModelValue();

        // Center and zoom the map to fit the route only if requested
        if (shouldCenterMap) {
          console.log("Centering map after route calculation");
          centerMap(
            startPoint.value,
            endPoint.value,
            waypoints.value,
            routePath.value
          );
        } else {
          console.log("Skipping map centering after route calculation");
        }
      }
    } catch (error) {
      console.error("Error calculating route:", error);
    } finally {
      loadingRoute.value = false;
    }
  };

  const onStartMarkerDragEnd = async (event) => {
    const { lat, lng } = event.target.getLatLng();

    // Save state before updating start point
    if (saveStateFunction) {
      saveStateFunction();
    }

    // Get address information for the new location
    loadingStartPoint.value = true;
    try {
      const addressInfo = await getAddressFromCoordinates(lat, lng);
      startPoint.value = {
        lat,
        lng,
        ...(addressInfo && { address: addressInfo }),
      };
      updateModelValue();
      if (startPoint.value && endPoint.value) {
        await calculateFullRoute(false);
      }
    } catch (error) {
      console.error("Error updating start point:", error);
    } finally {
      loadingStartPoint.value = false;
    }
  };

  const onEndMarkerDragEnd = async (event) => {
    const { lat, lng } = event.target.getLatLng();

    // Save state before updating end point
    if (saveStateFunction) {
      saveStateFunction();
    }

    // Get address information for the new location
    loadingEndPoint.value = true;
    try {
      const addressInfo = await getAddressFromCoordinates(lat, lng);
      endPoint.value = {
        lat,
        lng,
        ...(addressInfo && { address: addressInfo }),
      };
      updateModelValue();
      if (startPoint.value && endPoint.value) {
        await calculateFullRoute(false);
      }
    } catch (error) {
      console.error("Error updating end point:", error);
    } finally {
      loadingEndPoint.value = false;
    }
  };

  const onWaypointDragEnd = async (event, index) => {
    console.log("onWaypointDragEnd called with index:", index, "event:", event);
    const { lat, lng } = event.target.getLatLng();
    console.log("New coordinates:", { lat, lng });

    // Save state before updating waypoint
    if (saveStateFunction) {
      saveStateFunction();
    }

    // Get address information for the new location
    loadingWaypoints.value[index] = true;
    try {
      const addressInfo = await getAddressFromCoordinates(lat, lng);
      waypoints.value[index] = {
        lat,
        lng,
        ...(addressInfo && { address: addressInfo }),
      };
      console.log("Waypoint updated:", waypoints.value[index]);
      updateModelValue();

      // Update only the route segments affected by this waypoint (like old code)
      if (startPoint.value && endPoint.value) {
        updateRouteSegment(index);
      }
    } catch (error) {
      console.error("Error updating waypoint:", error);
    } finally {
      loadingWaypoints.value[index] = false;
    }
  };

  // Function to find the positions of waypoints in the route path
  const findWaypointPositionsInRoute = () => {
    const positions = {};

    waypoints.value.forEach((waypoint, index) => {
      let closestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < routePath.value.length; i++) {
        const point = routePath.value[i];
        const distance = calculateDistance(
          point[0],
          point[1],
          waypoint.lat,
          waypoint.lng
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      positions[index] = closestIndex;
    });

    return positions;
  };

  // Function to update only the route segments affected by a specific waypoint
  const updateRouteSegment = (waypointIndex) => {
    if (!routePath.value || routePath.value.length === 0) return;

    const waypoint = waypoints.value[waypointIndex];

    // Find the waypoint positions in the route path
    const waypointPositions = findWaypointPositionsInRoute();

    if (waypointPositions[waypointIndex] !== undefined) {
      // Update the entire route segment that goes through this waypoint
      const newPath = [...routePath.value];
      const waypointPos = waypointPositions[waypointIndex];

      // Find the previous and next waypoints to determine the segment boundaries
      const prevWaypointIndex = waypointIndex - 1;
      const nextWaypointIndex = waypointIndex + 1;

      let segmentStart = 0;
      let segmentEnd = newPath.length - 1;

      // Find segment start (previous waypoint or start point)
      if (
        prevWaypointIndex >= 0 &&
        waypointPositions[prevWaypointIndex] !== undefined
      ) {
        segmentStart = waypointPositions[prevWaypointIndex];
      } else if (startPoint.value) {
        // Find start point position
        for (let i = 0; i < newPath.length; i++) {
          const distance = calculateDistance(
            newPath[i][0],
            newPath[i][1],
            startPoint.value.lat,
            startPoint.value.lng
          );
          if (distance < 0.001) {
            // Very close to start point
            segmentStart = i;
            break;
          }
        }
      }

      // Find segment end (next waypoint or end point)
      if (
        nextWaypointIndex < waypoints.value.length &&
        waypointPositions[nextWaypointIndex] !== undefined
      ) {
        segmentEnd = waypointPositions[nextWaypointIndex];
      } else if (endPoint.value) {
        // Find end point position
        for (let i = newPath.length - 1; i >= 0; i--) {
          const distance = calculateDistance(
            newPath[i][0],
            newPath[i][1],
            endPoint.value.lat,
            endPoint.value.lng
          );
          if (distance < 0.001) {
            // Very close to end point
            segmentEnd = i;
            break;
          }
        }
      }

      // Create a new segment that actually follows the dragged waypoint
      const newSegment = [];

      // Get the start and end points of the segment
      const segmentStartPoint = newPath[segmentStart];
      const segmentEndPoint = newPath[segmentEnd];

      // Create a path that goes from start to the dragged waypoint to end
      newSegment.push(segmentStartPoint);

      // Add intermediate points to create a smooth path to the dragged waypoint
      const steps = 5; // Number of intermediate points
      for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 1);
        const lat =
          segmentStartPoint[0] + (waypoint.lat - segmentStartPoint[0]) * t;
        const lng =
          segmentStartPoint[1] + (waypoint.lng - segmentStartPoint[1]) * t;
        newSegment.push([lat, lng]);
      }

      // Add the dragged waypoint
      newSegment.push([waypoint.lat, waypoint.lng]);

      // Add intermediate points to create a smooth path from waypoint to end
      for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 1);
        const lat = waypoint.lat + (segmentEndPoint[0] - waypoint.lat) * t;
        const lng = waypoint.lng + (segmentEndPoint[1] - waypoint.lng) * t;
        newSegment.push([lat, lng]);
      }

      newSegment.push(segmentEndPoint);

      // Replace the entire segment in the path
      newPath.splice(
        segmentStart,
        segmentEnd - segmentStart + 1,
        ...newSegment
      );

      routePath.value = newPath;

      // Update distance and time
      if (newPath.length > 1) {
        const distance = calculateTotalDistance(newPath);
        const averageSpeed = 50; // km/h
        const estimatedTime = (distance / 1000 / averageSpeed) * 3600;

        routeInfo.value = {
          distance: distance,
          duration: estimatedTime,
        };
      }
    }

    updateModelValue();
  };

  const deleteWaypoint = (index) => {
    if (index >= 0 && index < waypoints.value.length) {
      // Save state before deleting waypoint
      if (saveStateFunction) {
        saveStateFunction();
      }

      // Store the waypoint being deleted for reference
      const deletedWaypoint = waypoints.value[index];

      // Remove the waypoint from the array
      waypoints.value.splice(index, 1);

      // Clear loading state for this waypoint
      if (loadingWaypoints.value[index]) {
        delete loadingWaypoints.value[index];
      }

      // Only update the route segment around the deleted waypoint
      if (startPoint.value && endPoint.value && routePath.value.length > 0) {
        updateRouteSegmentAfterDeletion(index, deletedWaypoint);
      }

      updateModelValue();
    }
  };

  const updateRouteSegmentAfterDeletion = (deletedIndex, deletedWaypoint) => {
    console.log("=== WAYPOINT DELETION DEBUG ===");
    console.log("Deleting waypoint at index:", deletedIndex);
    console.log("Deleted waypoint:", deletedWaypoint);
    console.log("Remaining waypoints count:", waypoints.value.length);

    // Find the positions of the previous and next points in the route path
    let prevPoint = null;
    let nextPoint = null;

    // Determine previous point
    if (deletedIndex === 0) {
      // First waypoint deleted, previous point is start point
      prevPoint = startPoint.value;
      console.log("Previous point is start point:", prevPoint);
    } else {
      // Previous point is the waypoint before the deleted one
      prevPoint = waypoints.value[deletedIndex - 1];
      console.log("Previous point is waypoint:", prevPoint);
    }

    // Determine next point
    if (deletedIndex >= waypoints.value.length) {
      // Last waypoint deleted, next point is end point
      nextPoint = endPoint.value;
      console.log("Next point is end point:", nextPoint);
    } else {
      // Next point is the waypoint after the deleted one
      nextPoint = waypoints.value[deletedIndex];
      console.log("Next point is waypoint:", nextPoint);
    }

    // Find the positions of these points in the current route path
    let prevPointIndex = -1;
    let nextPointIndex = -1;

    // Find previous point position in route path with more flexible distance checking
    let minPrevDistance = Infinity;
    for (let i = 0; i < routePath.value.length; i++) {
      const point = routePath.value[i];
      const distance = calculateDistance(
        point[0],
        point[1],
        prevPoint.lat,
        prevPoint.lng
      );
      if (distance < minPrevDistance) {
        minPrevDistance = distance;
        prevPointIndex = i;
      }
    }

    // Find next point position in route path with more flexible distance checking
    let minNextDistance = Infinity;
    for (let i = 0; i < routePath.value.length; i++) {
      const point = routePath.value[i];
      const distance = calculateDistance(
        point[0],
        point[1],
        nextPoint.lat,
        nextPoint.lng
      );
      if (distance < minNextDistance) {
        minNextDistance = distance;
        nextPointIndex = i;
      }
    }

    console.log(
      "Previous point found at index:",
      prevPointIndex,
      "with distance:",
      minPrevDistance
    );
    console.log(
      "Next point found at index:",
      nextPointIndex,
      "with distance:",
      minNextDistance
    );

    // If we found both points, replace the segment between them with a straight line
    if (
      prevPointIndex !== -1 &&
      nextPointIndex !== -1 &&
      prevPointIndex < nextPointIndex
    ) {
      console.log("Creating straight line between points");
      const newPath = [...routePath.value];

      // Create a straight line segment between previous and next points
      const straightLineSegment = [];
      const steps = 5; // Number of intermediate points for smooth line

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = prevPoint.lat + (nextPoint.lat - prevPoint.lat) * t;
        const lng = prevPoint.lng + (nextPoint.lng - prevPoint.lng) * t;
        straightLineSegment.push([lat, lng]);
      }

      // Replace the segment between prevPointIndex and nextPointIndex
      const segmentToReplace = newPath.slice(
        prevPointIndex + 1,
        nextPointIndex
      );
      console.log(
        "Replacing segment of length:",
        segmentToReplace.length,
        "with straight line of length:",
        straightLineSegment.slice(1, -1).length
      );

      newPath.splice(
        prevPointIndex + 1,
        nextPointIndex - prevPointIndex - 1,
        ...straightLineSegment.slice(1, -1)
      );

      routePath.value = newPath;

      // Update distance and time
      if (newPath.length > 1) {
        const distance = calculateTotalDistance(newPath);
        const averageSpeed = 50; // km/h
        const estimatedTime = (distance / 1000 / averageSpeed) * 3600;

        routeInfo.value = {
          distance: distance,
          duration: estimatedTime,
        };
      }

      console.log("Route updated successfully after waypoint deletion");
    } else {
      console.warn(
        "Could not find both points in route path for straight line creation"
      );
      console.log(
        "prevPointIndex:",
        prevPointIndex,
        "nextPointIndex:",
        nextPointIndex
      );
    }

    console.log("=== END WAYPOINT DELETION DEBUG ===");
  };

  return {
    setStartPoint,
    setEndPoint,
    addWaypoint,
    calculateFullRoute,
    onStartMarkerDragEnd,
    onEndMarkerDragEnd,
    onWaypointDragEnd,
    deleteWaypoint,
  };
}
