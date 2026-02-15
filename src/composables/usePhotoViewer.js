import { ref, reactive } from "vue";

// Global state for photo viewer
const isVisible = ref(false);
const imageUrl = ref("");
const altText = ref("Photo");
const zoomLevel = ref(1);
const rotation = ref(0);
const isFullscreen = ref(false);
const onEditCallback = ref(null); // Callback function to handle photo edit
const canEdit = ref(false); // Whether edit button should be shown

// Global photo viewer functions
export const usePhotoViewer = () => {
  const showPhoto = (url, alt = "Photo", editCallback = null) => {
    imageUrl.value = url;
    altText.value = alt;
    onEditCallback.value = editCallback;
    canEdit.value = !!editCallback;
    isVisible.value = true;
    // Reset zoom and rotation when showing new photo
    zoomLevel.value = 1;
    rotation.value = 0;
    isFullscreen.value = false;

    // Prevent body scroll when photo viewer is open
    document.body.style.overflow = "hidden";
  };

  const hidePhoto = () => {
    isVisible.value = false;
    imageUrl.value = "";
    altText.value = "Photo";
    zoomLevel.value = 1;
    rotation.value = 0;
    isFullscreen.value = false;
    onEditCallback.value = null;
    canEdit.value = false;

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // Restore body scroll
    document.body.style.overflow = "";
  };

  const zoomIn = () => {
    zoomLevel.value = Math.min(zoomLevel.value + 0.25, 5);
  };

  const zoomOut = () => {
    zoomLevel.value = Math.max(zoomLevel.value - 0.25, 0.5);
  };

  const resetZoom = () => {
    zoomLevel.value = 1;
  };

  const rotate = () => {
    rotation.value = (rotation.value + 90) % 360;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          isFullscreen.value = true;
        })
        .catch(() => {
          isFullscreen.value = false;
        });
    } else {
      document.exitFullscreen().then(() => {
        isFullscreen.value = false;
      });
    }
  };

  // Listen for fullscreen changes (e.g., when user presses Esc in fullscreen)
  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
  };

  // Add global event listener for fullscreen changes
  if (typeof window !== "undefined") {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
  }

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageUrl.value;
    link.download = altText.value || "photo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeydown = (event) => {
    if (!isVisible.value) return;

    if (event.key === "Escape") {
      hidePhoto();
    } else if (event.key === "+" || event.key === "=") {
      zoomIn();
    } else if (event.key === "-") {
      zoomOut();
    } else if (event.key === "0") {
      resetZoom();
    } else if (event.key === "r" || event.key === "R") {
      rotate();
    } else if (event.key === "f" || event.key === "F") {
      toggleFullscreen();
    } else if ((event.key === "e" || event.key === "E") && canEdit.value && onEditCallback.value) {
      // Trigger edit - this will be handled by GlobalPhotoViewer
      const editEvent = new CustomEvent('photo-viewer-edit');
      window.dispatchEvent(editEvent);
    }
  };

  // Add global event listener for escape key
  if (typeof window !== "undefined") {
    document.addEventListener("keydown", handleKeydown);
  }

  return {
    isVisible,
    imageUrl,
    altText,
    zoomLevel,
    rotation,
    isFullscreen,
    onEditCallback,
    canEdit,
    showPhoto,
    hidePhoto,
    zoomIn,
    zoomOut,
    resetZoom,
    rotate,
    toggleFullscreen,
    downloadImage,
  };
};

// Export the reactive state for global access
export const photoViewerState = reactive({
  isVisible,
  imageUrl,
  altText,
  zoomLevel,
  rotation,
  isFullscreen,
  onEditCallback,
  canEdit,
});
