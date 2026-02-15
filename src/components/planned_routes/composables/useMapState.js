import { ref, computed, watch, onMounted, onUnmounted } from "vue";

// Local storage keys
const MAP_CENTER_STORAGE_KEY = "plannedRouteMapCenter";
const MAP_ZOOM_STORAGE_KEY = "plannedRouteMapZoom";
const MAP_STYLE_STORAGE_KEY = "plannedRouteMapStyle";

// Custom event name for cross-component communication
const MAP_STATE_CHANGED_EVENT = "mapStateChanged";

// Default center: Atlantic Ocean
const DEFAULT_MAP_CENTER = [0, -30]; // Atlantic Ocean
const DEFAULT_ZOOM = 3;
const DEFAULT_MAP_STYLE = "blue"; // Default to brand blue

// Load map state from localStorage
const loadMapStateFromStorage = () => {
  try {
    const savedCenter = localStorage.getItem(MAP_CENTER_STORAGE_KEY);
    const savedZoom = localStorage.getItem(MAP_ZOOM_STORAGE_KEY);
    const savedStyle = localStorage.getItem(MAP_STYLE_STORAGE_KEY);

    const state = {
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_ZOOM,
      style: DEFAULT_MAP_STYLE,
    };

    if (savedCenter) {
      const center = JSON.parse(savedCenter);
      if (Array.isArray(center) && center.length === 2) {
        state.center = center;
      }
    }

    if (savedZoom) {
      const zoom = parseInt(savedZoom, 10);
      if (!isNaN(zoom)) {
        state.zoom = zoom;
      }
    }

    if (savedStyle && ["osm", "satellite", "light", "dark", "blue"].includes(savedStyle)) {
      state.style = savedStyle;
    }

    return state;
  } catch (error) {
    console.warn("Error loading map state from localStorage:", error);
    return {
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_ZOOM,
      style: DEFAULT_MAP_STYLE,
    };
  }
};

const saveMapCenterToStorage = (center, zoom) => {
  try {
    if (center && Array.isArray(center) && center.length === 2) {
      localStorage.setItem(MAP_CENTER_STORAGE_KEY, JSON.stringify(center));
      localStorage.setItem(MAP_ZOOM_STORAGE_KEY, zoom.toString());

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent(MAP_STATE_CHANGED_EVENT, {
        detail: { type: 'center', value: { center, zoom } }
      }));
    }
  } catch (error) {
    console.warn("Error saving map state to localStorage:", error);
  }
};

// Save map style to localStorage
const saveMapStyleToStorage = (style) => {
  try {
    if (["osm", "satellite", "light", "dark", "blue"].includes(style)) {
      localStorage.setItem(MAP_STYLE_STORAGE_KEY, style);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent(MAP_STATE_CHANGED_EVENT, {
        detail: { type: 'style', value: style }
      }));
    }
  } catch (error) {
    console.warn("Error saving map style to localStorage:", error);
  }
};

export function useMapState() {
  // Load initial map state from localStorage or use defaults
  const savedState = loadMapStateFromStorage();

  // Flag to prevent saving when updating from external sources
  let isUpdatingFromExternal = false;

  // Map state
  const zoom = ref(savedState.zoom);
  const minZoom = ref(4);
  const maxZoom = ref(18);
  const mapCenter = ref(savedState.center);
  const mapStyle = ref(savedState.style);

  // Computed
  const tileLayerUrl = computed(() => {
    // Satellite
    if (mapStyle.value === "satellite") {
      return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    }
    // CARTO Positron (Light)
    if (mapStyle.value === "light") {
      return "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    }
    // CARTO Dark Matter (Dark & Blue bases)
    if (mapStyle.value === "dark" || mapStyle.value === "blue") {
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
    // Default OSM
    return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  });

  const mapStyleLabel = computed(() => {
    switch (mapStyle.value) {
      case "satellite": return "Satellite";
      case "light": return "Light";
      case "dark": return "Dark";
      case "blue": return "Blue";
      default: return "OpenStreetMap";
    }
  });

  const setMapStyle = (style) => {
    if (["osm", "satellite", "light", "dark", "blue"].includes(style)) {
      mapStyle.value = style;
      saveMapStyleToStorage(style);
    }
  };

  // Function to save current map center and zoom
  const saveMapCenter = (center, zoomLevel) => {
    saveMapCenterToStorage(center, zoomLevel);
  };

  // Watch zoom changes and save to localStorage
  // Use saveMapCenterToStorage to ensure events are dispatched
  watch(zoom, (newZoom) => {
    if (newZoom !== undefined && !isNaN(newZoom) && !isUpdatingFromExternal) {
      // Get current center to save both together
      const currentCenter = mapCenter.value;
      saveMapCenterToStorage(currentCenter, newZoom);
    }
  });

  // Watch mapCenter changes and save to localStorage
  watch(mapCenter, (newCenter) => {
    if (newCenter && Array.isArray(newCenter) && newCenter.length === 2 && !isUpdatingFromExternal) {
      const currentZoom = zoom.value;
      saveMapCenterToStorage(newCenter, currentZoom);
    }
  }, { deep: true });

  // Watch mapStyle changes and save to localStorage
  watch(mapStyle, (newStyle) => {
    if (newStyle === "osm" || newStyle === "satellite" && !isUpdatingFromExternal) {
      saveMapStyleToStorage(newStyle);
    }
  });

  // Function to update state from localStorage (called when external changes occur)
  const updateStateFromStorage = () => {
    isUpdatingFromExternal = true;
    const newState = loadMapStateFromStorage();

    // Only update if values actually changed to avoid infinite loops
    if (JSON.stringify(mapCenter.value) !== JSON.stringify(newState.center)) {
      mapCenter.value = newState.center;
    }

    if (zoom.value !== newState.zoom) {
      zoom.value = newState.zoom;
    }

    if (mapStyle.value !== newState.style) {
      mapStyle.value = newState.style;
    }

    // Reset flag after a short delay
    setTimeout(() => {
      isUpdatingFromExternal = false;
    }, 100);
  };

  // Listen for storage events and custom events from other components
  const handleStorageChange = (e) => {
    // Handle storage events (from other tabs/windows)
    if (e.key === MAP_CENTER_STORAGE_KEY || e.key === MAP_ZOOM_STORAGE_KEY || e.key === MAP_STYLE_STORAGE_KEY) {
      updateStateFromStorage();
    }
  };

  // Listen for custom events (from same window)
  const handleMapStateChanged = (e) => {
    updateStateFromStorage();
  };

  // Set up event listeners
  onMounted(() => {
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(MAP_STATE_CHANGED_EVENT, handleMapStateChanged);
  });

  // Clean up event listeners
  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener(MAP_STATE_CHANGED_EVENT, handleMapStateChanged);
  });

  return {
    zoom,
    minZoom,
    maxZoom,
    mapCenter,
    mapStyle,
    tileLayerUrl,
    mapStyleLabel,
    setMapStyle,
    saveMapCenter,
    updateStateFromStorage, // Expose for manual updates if needed
  };
}
