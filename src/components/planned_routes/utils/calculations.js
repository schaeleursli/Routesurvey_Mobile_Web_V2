// Function to calculate distance between two points
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Function to calculate angle between three points
export const calculateAngle = (p1, p2, p3) => {
  const angle1 = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
  const angle2 = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]);
  let angle = (Math.abs(angle2 - angle1) * 180) / Math.PI;

  // Normalize angle to 0-180 degrees
  if (angle > 180) {
    angle = 360 - angle;
  }

  return angle;
};

// Function to calculate total distance of a path
export const calculateTotalDistance = (path) => {
  let totalDistance = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const point1 = path[i];
    const point2 = path[i + 1];
    totalDistance += calculateDistance(
      point1[0],
      point1[1],
      point2[0],
      point2[1]
    );
  }

  return totalDistance * 1000; // Convert to meters
};

// Function to format distance for display
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
};

// Function to format time for display
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};
