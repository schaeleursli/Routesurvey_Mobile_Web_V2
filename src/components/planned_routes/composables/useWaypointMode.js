import { ref } from "vue";

export function useWaypointMode() {
  // Waypoint mode state
  const waypointMode = ref(false);
  const selectedWaypoint = ref(null);

  const enableWaypointMode = () => {
    waypointMode.value = true;
  };

  const disableWaypointMode = () => {
    waypointMode.value = false;
  };

  const onWaypointClick = (index) => {
    // Toggle selection
    if (selectedWaypoint.value === index) {
      selectedWaypoint.value = null;
    } else {
      selectedWaypoint.value = index;
    }
  };

  const clearSelection = () => {
    selectedWaypoint.value = null;
  };

  return {
    waypointMode,
    selectedWaypoint,
    enableWaypointMode,
    disableWaypointMode,
    onWaypointClick,
    clearSelection,
  };
}
