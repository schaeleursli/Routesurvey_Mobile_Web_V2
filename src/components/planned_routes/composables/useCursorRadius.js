import { ref, onMounted, onUnmounted } from "vue";

export function useCursorRadius(
  mapRef,
  isEnabled,
  radiusInMeters,
  options = {}
) {
  // Log initial setup
  // console.log("Setting up cursor radius with initial values:", {
  //   mapReady: !!mapRef.value,
  //   enabled: isEnabled.value,
  //   radius: radiusInMeters.value,
  // });
  const cursorPosition = ref({ lat: null, lng: null });
  const radiusCircle = ref(null);
  const isMouseOnMap = ref(false);

  // Convert meters to degrees (approximate)
  const metersToRadius = (meters, lat) => {
    // Convert meters to degrees
    // 1 degree latitude ≈ 111,111 meters
    // 1 degree longitude varies by latitude: ≈ 111,111 * cos(latitude)
    const latRadius = meters / 111111;
    const lngRadius = meters / (111111 * Math.cos((lat * Math.PI) / 180));
    return { latRadius, lngRadius };
  };

  // Handle mouse move on map
  const handleMouseMove = (event) => {
    if (!isEnabled.value || !mapRef.value?.leafletObject) {
      return;
    }

    const { lat, lng } = event.latlng;
    cursorPosition.value = { lat, lng };
    isMouseOnMap.value = true;

    updateRadiusCircle(lat, lng);
  };

  // Handle mouse leave map
  const handleMouseLeave = () => {
    isMouseOnMap.value = false;
    hideRadiusCircle();
  };

  // Handle mouse enter map
  const handleMouseEnter = () => {
    if (isEnabled.value) {
      isMouseOnMap.value = true;
    }
  };

  // Update the radius circle position and size
  const updateRadiusCircle = (lat, lng) => {
    if (!mapRef.value?.leafletObject) return;

    const map = mapRef.value.leafletObject;

    // Wait for map to be ready
    if (!map._loaded) {
      console.log("Map not fully loaded yet, skipping circle update");
      return;
    }

    // Check if map has proper size and bounds
    const mapSize = map.getSize();
    if (!mapSize || mapSize.x === 0 || mapSize.y === 0) {
      console.log("Map has invalid size, skipping circle update");
      return;
    }

    // Check if map has valid bounds
    try {
      const bounds = map.getBounds();
      if (!bounds || !bounds.isValid()) {
        console.log("Map bounds are invalid, skipping circle update");
        return;
      }
    } catch (error) {
      console.log("Error getting map bounds, skipping circle update:", error);
      return;
    }

    // Remove existing circle
    if (radiusCircle.value) {
      try {
        // Handle custom element removal
        if (radiusCircle.value.remove) {
          radiusCircle.value.remove();
        } else if (radiusCircle.value.element) {
          // Direct element removal
          if (radiusCircle.value.element.parentNode) {
            radiusCircle.value.element.parentNode.removeChild(
              radiusCircle.value.element
            );
          }
        } else {
          // Fallback for Leaflet layers
          map.removeLayer(radiusCircle.value);
        }
      } catch (error) {
        console.warn("Error removing radius circle:", error);
      }
      radiusCircle.value = null;
    }

    // Only show if enabled and mouse is on map
    if (!isEnabled.value || !isMouseOnMap.value) return;

    // Validate coordinates
    if (
      lat === null ||
      lng === null ||
      lat === undefined ||
      lng === undefined ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      console.warn("Invalid coordinates for radius circle:", lat, lng);
      return;
    }

    // Check if coordinates are within valid ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn("Coordinates out of valid range:", lat, lng);
      return;
    }

    // Get current radius value
    const radius = radiusInMeters.value || 1000;

    // Validate radius
    if (!radius || radius <= 0 || isNaN(radius)) {
      console.warn("Invalid radius value:", radius);
      return;
    }

    // Default styling options
    const defaultOptions = {
      fillColor: "var(--accent)",
      fillOpacity: 0.08,
      color: "var(--accent)",
      weight: 2,
      opacity: 0.7,
      dashArray: "8, 4",
    };

    // Merge with custom options
    const circleOptions = { ...defaultOptions, ...options };

    // Create custom div overlay instead of Leaflet circle to avoid bounds issues
    // This approach bypasses Leaflet's complex geographic calculations that can fail
    // when the map's pixel bounds are not properly initialized
    try {
      // Convert meters to pixels based on current map zoom
      const zoom = map.getZoom();
      const metersPerPixel =
        (40075016.686 * Math.abs(Math.cos((lat * Math.PI) / 180))) /
        Math.pow(2, zoom + 8);
      const radiusInPixels = Math.max(radius / metersPerPixel, 5); // Minimum 5 pixels for visibility

      // Create a custom HTML element for the circle
      const circleElement = document.createElement("div");
      circleElement.className = "cursor-radius-circle-overlay";

      // Apply styles with proper opacity handling
      const fillOpacity = circleOptions.fillOpacity || 0.1;
      const strokeOpacity = circleOptions.opacity || 0.7;

      circleElement.style.cssText = `
        position: absolute;
        width: ${radiusInPixels * 2}px;
        height: ${radiusInPixels * 2}px;
        border-radius: 50%;
        border: ${circleOptions.weight || 2}px ${
        circleOptions.dashArray ? "dashed" : "solid"
      } ${circleOptions.color};
        background-color: ${circleOptions.fillColor};
        opacity: ${Math.max(fillOpacity, strokeOpacity)};
        pointer-events: none;
        z-index: 1000;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
      `;

      // Convert lat/lng to pixel coordinates
      const point = map.latLngToContainerPoint([lat, lng]);
      circleElement.style.left = point.x + "px";
      circleElement.style.top = point.y + "px";

      // Add to map container
      const mapContainer = map.getContainer();
      mapContainer.appendChild(circleElement);

      // Store reference for cleanup
      radiusCircle.value = {
        element: circleElement,
        remove: () => {
          if (circleElement.parentNode) {
            circleElement.parentNode.removeChild(circleElement);
          }
        },
      };

      // Custom circle overlay created successfully
    } catch (error) {
      console.error("Error creating custom circle overlay:", error);
      radiusCircle.value = null;
    }
  };

  // Hide the radius circle
  const hideRadiusCircle = () => {
    if (radiusCircle.value) {
      try {
        // Handle custom element removal
        if (radiusCircle.value.remove) {
          radiusCircle.value.remove();
        } else if (radiusCircle.value.element) {
          // Direct element removal
          if (radiusCircle.value.element.parentNode) {
            radiusCircle.value.element.parentNode.removeChild(
              radiusCircle.value.element
            );
          }
        } else if (mapRef.value?.leafletObject) {
          // Fallback for Leaflet layers
          mapRef.value.leafletObject.removeLayer(radiusCircle.value);
        }
      } catch (error) {
        console.warn("Error hiding radius circle:", error);
      }
      radiusCircle.value = null;
    }
  };

  // Set up event listeners
  const setupEventListeners = () => {
    if (!mapRef.value?.leafletObject) {
      console.warn("Map not ready for radius event listeners");
      return;
    }

    try {
      const map = mapRef.value.leafletObject;
      map.on("mousemove", handleMouseMove);
      map.on("mouseout", handleMouseLeave);
      map.on("mouseover", handleMouseEnter);
      // Event listeners set up successfully
    } catch (error) {
      console.error("Error setting up radius event listeners:", error);
    }
  };

  // Remove event listeners
  const removeEventListeners = () => {
    if (!mapRef.value?.leafletObject) return;

    try {
      const map = mapRef.value.leafletObject;
      map.off("mousemove", handleMouseMove);
      map.off("mouseout", handleMouseLeave);
      map.off("mouseover", handleMouseEnter);
      // Event listeners removed successfully
    } catch (error) {
      console.error("Error removing radius event listeners:", error);
    }
  };

  // Initialize when map is ready
  const initializeRadius = () => {
    if (mapRef.value?.leafletObject) {
      setupEventListeners();
    } else {
      console.warn("Map not ready for cursor radius initialization");
    }
  };

  // Cleanup
  const cleanup = () => {
    removeEventListeners();
    hideRadiusCircle();
  };

  // Update radius when threshold changes
  const updateRadius = () => {
    if (isEnabled.value && isMouseOnMap.value && cursorPosition.value.lat) {
      updateRadiusCircle(cursorPosition.value.lat, cursorPosition.value.lng);
    }
  };

  // Watch for changes and update accordingly
  const refresh = () => {
    console.log(
      "Refreshing cursor radius - enabled:",
      isEnabled.value,
      "mouseOnMap:",
      isMouseOnMap.value,
      "hasPosition:",
      !!cursorPosition.value.lat
    );

    if (!isEnabled.value) {
      console.log("Hiding radius circle - disabled");
      hideRadiusCircle();
    } else if (isMouseOnMap.value && cursorPosition.value.lat) {
      console.log(
        "Updating radius circle at position:",
        cursorPosition.value.lat,
        cursorPosition.value.lng
      );
      updateRadiusCircle(cursorPosition.value.lat, cursorPosition.value.lng);
    } else {
      console.log("Not updating radius - waiting for mouse position");
    }
  };

  return {
    cursorPosition,
    isMouseOnMap,
    initializeRadius,
    cleanup,
    updateRadius,
    refresh,
    hideRadiusCircle,
  };
}
