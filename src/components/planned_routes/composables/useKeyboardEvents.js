import { onMounted, onUnmounted } from "vue";

export function useKeyboardEvents(
  selectedWaypoint,
  deleteWaypoint,
  hideContextMenu,
  clearSelection,
  clearSegmentSelection,
  performUndo,
  performRedo,
  isEditing
) {
  // Keyboard event handler for delete key
  const handleKeyDown = (event) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      // Only allow deletion in editing mode
      if (isEditing && isEditing() && selectedWaypoint.value !== null) {
        deleteWaypoint(selectedWaypoint.value);
        selectedWaypoint.value = null;
      }
    } else if (event.key === "Escape") {
      // Clear selection and hide context menu
      clearSelection();
      hideContextMenu();
      clearSegmentSelection();
    } else if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
      // Undo: Ctrl+Z (or Cmd+Z on Mac) - only in editing mode
      if (isEditing && isEditing()) {
        event.preventDefault();
        if (performUndo) {
          performUndo();
        }
      }
    } else if (event.key === "y" && (event.ctrlKey || event.metaKey)) {
      // Redo: Ctrl+Y (or Cmd+Y on Mac) - only in editing mode
      if (isEditing && isEditing()) {
        event.preventDefault();
        if (performRedo) {
          performRedo();
        }
      }
    }
  };

  // Click outside to hide context menu and clear selection
  const handleClickOutside = (event) => {
    // Check if click is outside the context menu
    const contextMenuElement = document.querySelector(".context-menu");
    if (contextMenuElement && !contextMenuElement.contains(event.target)) {
      hideContextMenu();
    }

    // Check if click is outside waypoint markers (on map)
    const isMapClick =
      event.target.closest(".leaflet-container") &&
      !event.target.closest(".leaflet-marker-icon") &&
      !event.target.closest(".leaflet-marker-shadow");

    if (isMapClick) {
      clearSelection();
      clearSegmentSelection();
    }
  };

  // Lifecycle hooks
  onMounted(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDown);
  });

  return {
    handleKeyDown,
    handleClickOutside,
  };
}
