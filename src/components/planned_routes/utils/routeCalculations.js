import {
  calculateDistance,
  calculateAngle,
  calculateTotalDistance,
} from "./calculations.js";
import { getAddressFromCoordinates } from "./geocoding.js";

// Function to calculate route using OSRM
export const calculateRoute = async (
  startPoint,
  endPoint,
  waypoints,
  routeMarkers
) => {
  if (!startPoint || !endPoint) return null;

  try {
    // Build coordinates string for OSRM
    let coordinates = `${startPoint.lng},${startPoint.lat}`;

    // Add existing waypoints
    waypoints.forEach((waypoint) => {
      coordinates += `;${waypoint.lng},${waypoint.lat}`;
    });

    // Add route markers as additional waypoints
    routeMarkers.forEach((marker) => {
      coordinates += `;${marker.lng},${marker.lat}`;
    });

    // Add end point
    coordinates += `;${endPoint.lng},${endPoint.lat}`;

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
    );

    if (response.ok) {
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routePath = route.geometry.coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]);
        const routeInfo = {
          distance: route.distance,
          duration: route.duration,
        };

        return { routePath, routeInfo };
      }
    }
    return null;
  } catch (error) {
    console.error("Error calculating route:", error);
    return null;
  }
};

// Function to calculate route between just two points (for segment snapping)
export const calculateSegmentRoute = async (startPoint, endPoint) => {
  if (!startPoint || !endPoint) return null;

  try {
    // Build coordinates string for OSRM (just start and end)
    const coordinates = `${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}`;

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
    );

    if (response.ok) {
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routePath = route.geometry.coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]);
        const routeInfo = {
          distance: route.distance,
          duration: route.duration,
        };

        return { routePath, routeInfo };
      }
    }
    return null;
  } catch (error) {
    console.error("Error calculating segment route:", error);
    return null;
  }
};

// Function to extract waypoints from route joints
export const extractWaypointsFromRoute = async (routeCoordinates) => {
  const waypoints = [];
  const minDistance = 0.0001; // Very small minimum distance to detect more turns
  const minAngle = 10; // Reduced minimum angle to detect more turns
  const maxWaypoints = 20; // Increased maximum number of waypoints

  // Always add the first significant point after start
  if (routeCoordinates.length > 2) {
    const firstWaypoint = {
      lat: routeCoordinates[1][0],
      lng: routeCoordinates[1][1],
    };

    // Get address information for this waypoint
    const addressInfo = await getAddressFromCoordinates(
      firstWaypoint.lat,
      firstWaypoint.lng
    );
    if (addressInfo) {
      firstWaypoint.address = addressInfo;
    }

    waypoints.push(firstWaypoint);
  }

  for (
    let i = 2;
    i < routeCoordinates.length - 2 && waypoints.length < maxWaypoints;
    i++
  ) {
    const prev = routeCoordinates[i - 1];
    const current = routeCoordinates[i];
    const next = routeCoordinates[i + 1];

    // Calculate angle between segments
    const angle = calculateAngle(prev, current, next);
    const distance = calculateDistance(
      prev[0],
      prev[1],
      current[0],
      current[1]
    );

    // If there's a significant turn, add as waypoint
    if (angle > minAngle && distance > minDistance) {
      // Check if this point is not too close to existing waypoints
      const isDuplicate = waypoints.some(
        (wp) =>
          Math.abs(wp.lat - current[0]) < 0.0005 &&
          Math.abs(wp.lng - current[1]) < 0.0005
      );

      if (!isDuplicate) {
        const waypoint = {
          lat: current[0],
          lng: current[1],
        };

        // Get address information for this waypoint
        const addressInfo = await getAddressFromCoordinates(
          waypoint.lat,
          waypoint.lng
        );
        if (addressInfo) {
          waypoint.address = addressInfo;
        }

        waypoints.push(waypoint);
      }
    }
  }

  // Always add the last significant point before end
  if (routeCoordinates.length > 2) {
    const lastPoint = routeCoordinates[routeCoordinates.length - 2];
    const isDuplicate = waypoints.some(
      (wp) =>
        Math.abs(wp.lat - lastPoint[0]) < 0.0005 &&
        Math.abs(wp.lng - lastPoint[1]) < 0.0005
    );

    if (!isDuplicate) {
      const lastWaypoint = {
        lat: lastPoint[0],
        lng: lastPoint[1],
      };

      // Get address information for this waypoint
      const addressInfo = await getAddressFromCoordinates(
        lastWaypoint.lat,
        lastWaypoint.lng
      );
      if (addressInfo) {
        lastWaypoint.address = addressInfo;
      }

      waypoints.push(lastWaypoint);
    }
  }

  return waypoints;
};

// Function to create a simple route path from points
export const createSimpleRoutePath = (startPoint, endPoint, waypoints) => {
  const path = [];

  // Add start point
  if (startPoint) {
    path.push([startPoint.lat, startPoint.lng]);
  }

  // Add waypoints in order
  waypoints.forEach((waypoint) => {
    path.push([waypoint.lat, waypoint.lng]);
  });

  // Add end point
  if (endPoint) {
    path.push([endPoint.lat, endPoint.lng]);
  }

  return path;
};

// Function to calculate route info from path
export const calculateRouteInfo = (path) => {
  if (path.length > 1) {
    const distance = calculateTotalDistance(path);
    const averageSpeed = 50; // km/h - average urban driving speed
    const estimatedTime = (distance / 1000 / averageSpeed) * 3600; // Convert to seconds

    return {
      distance: distance,
      duration: estimatedTime,
    };
  }
  return null;
};
