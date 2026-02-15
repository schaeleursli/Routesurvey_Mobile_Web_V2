import { ref } from "vue";

export function useContextMenu() {
  // Context menu state
  const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    targetType: null, // 'waypoint', 'start', 'end'
    targetIndex: null,
  });

  const showContextMenu = (event, targetType, targetIndex) => {
    event.originalEvent.preventDefault();

    // Get the map container position
    const mapContainer = event.target._map.getContainer();
    const rect = mapContainer.getBoundingClientRect();

    // Calculate position relative to the map container
    const x = event.originalEvent.clientX - rect.left;
    const y = event.originalEvent.clientY - rect.top;

    contextMenu.value = {
      visible: true,
      x: x,
      y: y,
      targetType: targetType,
      targetIndex: targetIndex,
    };
  };

  const hideContextMenu = () => {
    contextMenu.value.visible = false;
    contextMenu.value.targetType = null;
    contextMenu.value.targetIndex = null;
  };

  const onWaypointContextMenu = (event, index) => {
    showContextMenu(event, "waypoint", index);
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    onWaypointContextMenu,
  };
}
