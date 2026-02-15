import { ref } from "vue";
import { calculateDistance } from "../utils/calculations.js";
import { getAddressFromCoordinates } from "../utils/geocoding.js";
import { calculateSegmentRoute } from "../utils/routeCalculations.js";

export function useRouteSegments() {
  // Simple state
  const selectedSegment = ref(null);
  const hoveredSegment = ref(null);

  // Reactive segments array
  const segments = ref([]);

  // Function to split route path into segments based on waypoints
  const getRouteSegments = (routePath, waypoints, startPoint, endPoint) => {
    // console.log("=== GET ROUTE SEGMENTS DEBUG ===");
    // console.log("Input - routePath length:", routePath?.length || 0);
    // console.log("Input - waypoints length:", waypoints?.length || 0);
    // console.log("Input - startPoint:", startPoint);
    // console.log("Input - endPoint:", endPoint);

    if (!routePath || routePath.length < 2) {
      segments.value = [];
      // console.log("No route path, clearing segments");
      // console.log("=== END GET ROUTE SEGMENTS DEBUG ===");
      return segments.value;
    }

    const newSegments = [];
    const allPoints = [];

    // Add start point
    if (startPoint) {
      allPoints.push({
        type: "start",
        lat: startPoint.lat,
        lng: startPoint.lng,
        index: 0,
      });
    }

    // Add waypoints
    waypoints.forEach((waypoint, index) => {
      allPoints.push({
        type: "waypoint",
        lat: waypoint.lat,
        lng: waypoint.lng,
        index: index + 1,
      });
    });

    // Add end point
    if (endPoint) {
      allPoints.push({
        type: "end",
        lat: endPoint.lat,
        lng: endPoint.lng,
        index: allPoints.length,
      });
    }

    // console.log(
    //   "All points:",
    //   allPoints.length,
    //   allPoints.map((p) => `${p.type}-${p.index}`)
    // );

    // Create segments between consecutive points
    for (let i = 0; i < allPoints.length - 1; i++) {
      const segmentStartPoint = allPoints[i];
      const segmentEndPoint = allPoints[i + 1];

      // Create a more stable segment ID based on the actual points
      const startPointKey = `${segmentStartPoint.type}-${segmentStartPoint.index}`;
      const endPointKey = `${segmentEndPoint.type}-${segmentEndPoint.index}`;
      const segmentId = `segment-${startPointKey}-to-${endPointKey}`;

      // console.log(
      //   `Creating segment ${i}: ${segmentId} from ${startPointKey} to ${endPointKey}`
      // );

      // Check if we already have a modified segment with this ID
      const existingSegment = segments.value.find((s) => s.id === segmentId);

      if (existingSegment && existingSegment.isSnapped) {
        console.log(`Found existing snapped segment: ${segmentId}`);
        // For snapped segments, we need to recalculate the route between the new points
        // but keep the snapped state
        const segmentCoords = findSegmentCoordinates(
          routePath,
          segmentStartPoint.lat,
          segmentStartPoint.lng,
          segmentEndPoint.lat,
          segmentEndPoint.lng
        );

        newSegments.push({
          id: segmentId,
          startPoint: segmentStartPoint,
          endPoint: segmentEndPoint,
          coordinates: segmentCoords,
          distance: calculateSegmentDistance(segmentCoords),
          index: i,
          isSnapped: true, // Preserve the snapped state
        });
      } else {
        // console.log(`Creating new segment: ${segmentId}`);
        // Create new segment with default coordinates
        const segmentCoords = findSegmentCoordinates(
          routePath,
          segmentStartPoint.lat,
          segmentStartPoint.lng,
          segmentEndPoint.lat,
          segmentEndPoint.lng
        );

        newSegments.push({
          id: segmentId,
          startPoint: segmentStartPoint,
          endPoint: segmentEndPoint,
          coordinates: segmentCoords,
          distance: calculateSegmentDistance(segmentCoords),
          index: i,
          isSnapped: false,
        });
      }
    }

    // Update the reactive segments array
    segments.value = newSegments;
    // console.log("=== END GET ROUTE SEGMENTS DEBUG ===");
    return segments.value;
  };

  // Function to find route path coordinates between two points
  const findSegmentCoordinates = (
    routePath,
    startLat,
    startLng,
    endLat,
    endLng
  ) => {
    if (!routePath || routePath.length < 2) return [];

    let startIndex = -1;
    let endIndex = -1;

    // Find start point in route path
    let minStartDistance = Infinity;
    for (let i = 0; i < routePath.length; i++) {
      const distance = calculateDistance(
        routePath[i][0],
        routePath[i][1],
        startLat,
        startLng
      );
      if (distance < minStartDistance) {
        minStartDistance = distance;
        startIndex = i;
      }
    }

    // Find end point in route path
    let minEndDistance = Infinity;
    for (let i = 0; i < routePath.length; i++) {
      const distance = calculateDistance(
        routePath[i][0],
        routePath[i][1],
        endLat,
        endLng
      );
      if (distance < minEndDistance) {
        minEndDistance = distance;
        endIndex = i;
      }
    }

    // Ensure startIndex is before endIndex
    if (startIndex > endIndex) {
      [startIndex, endIndex] = [endIndex, startIndex];
    }

    // Return the segment coordinates
    return routePath.slice(startIndex, endIndex + 1);
  };

  // Function to create straight line coordinates between two points
  const createStraightLineCoordinates = (
    startLat,
    startLng,
    endLat,
    endLng
  ) => {
    const coordinates = [];
    const steps = 10; // Number of intermediate points for smooth line

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = startLat + (endLat - startLat) * t;
      const lng = startLng + (endLng - startLng) * t;
      coordinates.push([lat, lng]);
    }

    return coordinates;
  };

  // Function to calculate distance of a segment
  const calculateSegmentDistance = (coordinates) => {
    if (coordinates.length < 2) return 0;

    let distance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      distance += calculateDistance(
        coordinates[i][0],
        coordinates[i][1],
        coordinates[i + 1][0],
        coordinates[i + 1][1]
      );
    }

    return distance * 1000; // Convert to meters
  };

  // Function to handle segment click (add waypoint like original onRouteClick)
  const onSegmentClick = async (
    event,
    waypoints,
    routePath,
    updateModelValue,
    loadingWaypoints
  ) => {
    const { lat, lng } = event.latlng;

    // Find the nearest point on the route path to the clicked point
    let nearestRoutePointIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < routePath.length; i++) {
      const routePoint = routePath[i];
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
    while (insertIndex < waypoints.length) {
      const waypoint = waypoints[insertIndex];
      // Find this waypoint's position in the route path
      let waypointRouteIndex = 0;
      let minWaypointDistance = Infinity;
      for (let i = 0; i < routePath.length; i++) {
        const distance = calculateDistance(
          routePath[i][0],
          routePath[i][1],
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

    // Get address information for the new waypoint with loading state
    loadingWaypoints[insertIndex] = true;
    try {
      const addressInfo = await getAddressFromCoordinates(lat, lng);
      const newWaypoint = {
        lat,
        lng,
        ...(addressInfo && { address: addressInfo }),
      };

      waypoints.splice(insertIndex, 0, newWaypoint);
      updateModelValue();
    } catch (error) {
      console.error("Error adding waypoint:", error);
    } finally {
      loadingWaypoints[insertIndex] = false;
    }
  };

  // Function to handle segment right click (highlight segment)
  const onSegmentRightClick = (event, segment) => {
    event.originalEvent.preventDefault();
    selectedSegment.value =
      selectedSegment.value?.id === segment.id ? null : segment;
  };

  // Function to handle segment hover
  const onSegmentHover = (segment) => {
    hoveredSegment.value = segment;
  };

  // Function to handle segment leave
  const onSegmentLeave = () => {
    hoveredSegment.value = null;
  };

  // Function to clear segment selection
  const clearSegmentSelection = () => {
    selectedSegment.value = null;
    hoveredSegment.value = null;
  };

  // Simple function to snap segment to route
  const snapSegmentToRoute = async (
    segment,
    routePath,
    waypoints,
    startPoint,
    endPoint,
    updateModelValue
  ) => {
    if (!segment) {
      console.warn("No segment provided for snapping");
      return;
    }

    try {
      // console.log("=== SNAP SEGMENT DEBUG ===");
      // console.log("Snapping segment to route:", segment.id);
      // console.log("Segment start point:", segment.startPoint);
      // console.log("Segment end point:", segment.endPoint);
      // console.log("Current waypoints count:", waypoints?.value?.length || 0);
      // console.log("Current route path length:", routePath?.value?.length || 0);

      // Get the current start and end points from the actual data (not the segment's stored points)
      let currentStartPoint, currentEndPoint;

      if (
        segment.startPoint.type === "start" &&
        startPoint &&
        startPoint.value
      ) {
        currentStartPoint = {
          lat: startPoint.value.lat,
          lng: startPoint.value.lng,
        };
        console.log("Using start point as segment start:", currentStartPoint);
      } else if (
        segment.startPoint.type === "waypoint" &&
        waypoints &&
        waypoints.value
      ) {
        const waypointIndex = segment.startPoint.index - 1; // Convert to 0-based index
        console.log(
          "Looking for waypoint at index:",
          waypointIndex,
          "in waypoints array of length:",
          waypoints.value.length
        );
        if (waypointIndex >= 0 && waypointIndex < waypoints.value.length) {
          currentStartPoint = {
            lat: waypoints.value[waypointIndex].lat,
            lng: waypoints.value[waypointIndex].lng,
          };
          console.log("Using waypoint as segment start:", currentStartPoint);
        } else {
          console.warn("Waypoint index out of bounds:", waypointIndex);
        }
      } else if (
        segment.startPoint.type === "end" &&
        endPoint &&
        endPoint.value
      ) {
        currentStartPoint = {
          lat: endPoint.value.lat,
          lng: endPoint.value.lng,
        };
        console.log("Using end point as segment start:", currentStartPoint);
      }

      if (segment.endPoint.type === "start" && startPoint && startPoint.value) {
        currentEndPoint = {
          lat: startPoint.value.lat,
          lng: startPoint.value.lng,
        };
        console.log("Using start point as segment end:", currentEndPoint);
      } else if (
        segment.endPoint.type === "waypoint" &&
        waypoints &&
        waypoints.value
      ) {
        const waypointIndex = segment.endPoint.index - 1; // Convert to 0-based index
        console.log(
          "Looking for waypoint at index:",
          waypointIndex,
          "in waypoints array of length:",
          waypoints.value.length
        );
        if (waypointIndex >= 0 && waypointIndex < waypoints.value.length) {
          currentEndPoint = {
            lat: waypoints.value[waypointIndex].lat,
            lng: waypoints.value[waypointIndex].lng,
          };
          console.log("Using waypoint as segment end:", currentEndPoint);
        } else {
          console.warn("Waypoint index out of bounds:", waypointIndex);
        }
      } else if (
        segment.endPoint.type === "end" &&
        endPoint &&
        endPoint.value
      ) {
        currentEndPoint = { lat: endPoint.value.lat, lng: endPoint.value.lng };
        console.log("Using end point as segment end:", currentEndPoint);
      }

      if (!currentStartPoint || !currentEndPoint) {
        console.warn(
          "Could not determine current start or end points for segment:",
          segment.id
        );
        console.log("=== END SNAP DEBUG (FAILED) ===");
        return;
      }

      console.log("Current start point:", currentStartPoint);
      console.log("Current end point:", currentEndPoint);

      // Calculate route between current start and end points
      const result = await calculateSegmentRoute(
        currentStartPoint,
        currentEndPoint
      );

      console.log("Route calculation result:", result);
      console.log("=== END SNAP DEBUG ===");

      if (result && result.routePath) {
        // Update the main route path to include the snapped segment
        updateMainRouteWithSnappedSegment(
          segment,
          result.routePath,
          routePath,
          waypoints,
          startPoint,
          endPoint
        );

        // Update the segment coordinates
        const segmentIndex = segments.value.findIndex(
          (s) => s.id === segment.id
        );
        if (segmentIndex !== -1) {
          segments.value[segmentIndex].coordinates = result.routePath;
          segments.value[segmentIndex].distance = calculateSegmentDistance(
            result.routePath
          );
          segments.value[segmentIndex].isSnapped = true;

          // Update the selected segment reference
          if (selectedSegment.value?.id === segment.id) {
            selectedSegment.value = segments.value[segmentIndex];
          }
        }

        // Update all segments to reflect the new route path
        getRouteSegments(
          routePath.value,
          waypoints.value,
          startPoint.value,
          endPoint.value
        );

        // Update the model value to reflect changes
        if (updateModelValue) {
          updateModelValue();
        }

        console.log(
          "Segment snapped successfully:",
          segment.id,
          "New coordinates:",
          result.routePath.length
        );
      } else {
        console.warn("No route result received for segment:", segment.id);
      }
    } catch (error) {
      console.error("Error snapping segment to route:", error);
    }
  };

  // Function to update the main route path with a snapped segment
  const updateMainRouteWithSnappedSegment = (
    segment,
    snappedCoordinates,
    routePath,
    waypoints,
    startPoint,
    endPoint
  ) => {
    if (!routePath || !routePath.value) {
      console.warn("No route path available for updating");
      return;
    }

    console.log("=== UPDATING MAIN ROUTE WITH SNAPPED SEGMENT ===");
    console.log("Segment ID:", segment.id);
    console.log("Snapped coordinates length:", snappedCoordinates.length);
    console.log("Current route path length:", routePath.value.length);

    // Find the positions of the segment start and end points in the main route
    const allPoints = [];

    // Add start point
    if (startPoint && startPoint.value) {
      allPoints.push({
        type: "start",
        lat: startPoint.value.lat,
        lng: startPoint.value.lng,
        index: 0,
      });
    }

    // Add waypoints
    if (waypoints && waypoints.value) {
      waypoints.value.forEach((waypoint, index) => {
        allPoints.push({
          type: "waypoint",
          lat: waypoint.lat,
          lng: waypoint.lng,
          index: index + 1,
        });
      });
    }

    // Add end point
    if (endPoint && endPoint.value) {
      allPoints.push({
        type: "end",
        lat: endPoint.value.lat,
        lng: endPoint.value.lng,
        index: allPoints.length,
      });
    }

    // console.log(
    //   "All points:",
    //   allPoints.map((p) => `${p.type}-${p.index}`)
    // );

    // Find the segment boundaries in the main route
    const segmentStartIndex = allPoints.findIndex(
      (p) =>
        p.type === segment.startPoint.type &&
        p.index === segment.startPoint.index
    );
    const segmentEndIndex = allPoints.findIndex(
      (p) =>
        p.type === segment.endPoint.type && p.index === segment.endPoint.index
    );

    console.log("Segment start index in allPoints:", segmentStartIndex);
    console.log("Segment end index in allPoints:", segmentEndIndex);

    if (segmentStartIndex !== -1 && segmentEndIndex !== -1) {
      // Find the positions of these points in the route path
      const startPointPos = findPointPositionInRoute(
        routePath.value,
        allPoints[segmentStartIndex]
      );
      const endPointPos = findPointPositionInRoute(
        routePath.value,
        allPoints[segmentEndIndex]
      );

      console.log("Start point position in route path:", startPointPos);
      console.log("End point position in route path:", endPointPos);

      if (startPointPos !== -1 && endPointPos !== -1) {
        // Replace the segment in the main route with the snapped coordinates
        const newRoutePath = [...routePath.value];
        const startPos = Math.min(startPointPos, endPointPos);
        const endPos = Math.max(startPointPos, endPointPos);

        console.log("Replacing route path from index", startPos, "to", endPos);
        console.log("Original segment length:", endPos - startPos + 1);
        console.log(
          "New snapped coordinates length:",
          snappedCoordinates.length
        );

        // Replace the segment
        newRoutePath.splice(
          startPos,
          endPos - startPos + 1,
          ...snappedCoordinates
        );
        routePath.value = newRoutePath;

        console.log(
          "Main route updated successfully. New length:",
          routePath.value.length
        );
        console.log("=== END UPDATING MAIN ROUTE ===");
      } else {
        console.warn("Could not find both segment points in route path");
        console.log("Start point found:", startPointPos !== -1);
        console.log("End point found:", endPointPos !== -1);
        console.log("=== END UPDATING MAIN ROUTE (FAILED) ===");
      }
    } else {
      console.warn("Could not find segment boundaries in allPoints");
      console.log("Segment start found:", segmentStartIndex !== -1);
      console.log("Segment end found:", segmentEndIndex !== -1);
      console.log("=== END UPDATING MAIN ROUTE (FAILED) ===");
    }
  };

  // Helper function to find a point's position in the route path
  const findPointPositionInRoute = (routePath, point) => {
    console.log(
      `Looking for point ${point.type}-${point.index} at coordinates:`,
      point.lat,
      point.lng
    );
    console.log(`Route path length:`, routePath.length);

    let closestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < routePath.length; i++) {
      const distance = calculateDistance(
        routePath[i][0],
        routePath[i][1],
        point.lat,
        point.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }

      // If we find an exact match, use it immediately
      if (distance < 0.001) {
        console.log(
          `Found exact match at index ${i} with distance ${distance}`
        );
        return i;
      }
    }

    // If no exact match, use the closest point if it's reasonably close
    if (minDistance < 0.01) {
      // 10 meters tolerance
      console.log(
        `Using closest point at index ${closestIndex} with distance ${minDistance}`
      );
      return closestIndex;
    }

    console.log(
      `No suitable point found. Closest was at index ${closestIndex} with distance ${minDistance}`
    );
    return -1;
  };

  // Function to get segment color based on state
  const getSegmentColor = (segment) => {
    if (selectedSegment.value?.id === segment.id) {
      return "#ff6b35"; // Orange for selected
    }
    if (hoveredSegment.value?.id === segment.id) {
      return "#4ecdc4"; // Teal for hovered
    }
    if (segment.isSnapped) {
      return "var(--success)"; // Green for snapped segments
    }
    return "#333B56"; // Default color
  };

  // Function to get segment weight based on state
  const getSegmentWeight = (segment) => {
    if (
      selectedSegment.value?.id === segment.id ||
      hoveredSegment.value?.id === segment.id
    ) {
      return 8; // Thicker for selected/hovered
    }
    return 6; // Default weight
  };

  return {
    selectedSegment,
    hoveredSegment,
    segments,
    getRouteSegments,
    onSegmentClick,
    onSegmentRightClick,
    onSegmentHover,
    onSegmentLeave,
    clearSegmentSelection,
    snapSegmentToRoute,
    getSegmentColor,
    getSegmentWeight,
  };
}
