import { ref, onUnmounted } from "vue";

export function useMapControls() {
  const mapRef = ref(null);
  let resizeObserver = null;
  let resizeTimeout = null;

  const onMapReady = () => {
    if (mapRef.value) {
      mapRef.value.leafletObject.invalidateSize();
    }
  };

  const setMapCenter = (lat, lng, shouldChangeZoom = true) => {
    if (mapRef.value) {
      if (shouldChangeZoom) {
        mapRef.value.leafletObject.setView(
          [lat, lng],
          mapRef.value.leafletObject.getZoom()
        );
      } else {
        mapRef.value.leafletObject.setView(
          [lat, lng],
          mapRef.value.leafletObject.getZoom()
        );
      }
    }
  };

  const centerMap = (startPoint, endPoint, waypoints, routePath) => {
    // console.log("centerMap called");
    if (mapRef.value && mapRef.value.leafletObject) {
      const points = [];

      // Add start and end points
      if (startPoint) points.push([startPoint.lat, startPoint.lng]);
      if (endPoint) points.push([endPoint.lat, endPoint.lng]);

      // Add waypoints
      waypoints.forEach((waypoint) => {
        points.push([waypoint.lat, waypoint.lng]);
      });

      // Add route path points to ensure the entire route is visible
      if (routePath && routePath.length > 0) {
        // Add key points from the route path (every nth point to avoid too many points)
        const step = Math.max(1, Math.floor(routePath.length / 20)); // Include ~20 points from the route
        for (let i = 0; i < routePath.length; i += step) {
          points.push(routePath[i]);
        }
        // Always include the last point of the route
        if (routePath.length > 0) {
          points.push(routePath[routePath.length - 1]);
        }
      }

      if (points.length > 0) {
        try {
          // console.log("Fitting bounds to points:", points.length, "points");
          mapRef.value.leafletObject.fitBounds(points, { padding: [20, 20] });
        } catch (error) {
          // console.warn("Error fitting bounds:", error);
        }
      }
    }
  };

  // Enhanced resize handler with debouncing
  const handleResize = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
      // Clear existing timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      // Debounce the resize operation
      resizeTimeout = setTimeout(() => {
        try {
          // Force a reflow to ensure the container has updated dimensions
          const container = mapRef.value.leafletObject.getContainer();
          if (container) {
            // Trigger a reflow
            void container.offsetHeight;

            // Invalidate size to recalculate map dimensions
            mapRef.value.leafletObject.invalidateSize();

            // Additional check: if the map is not properly sized, try again after a short delay
            setTimeout(() => {
              if (mapRef.value && mapRef.value.leafletObject) {
                const mapSize = mapRef.value.leafletObject.getSize();
                if (mapSize.x === 0 || mapSize.y === 0) {
                  console.warn("Map size is 0, attempting to fix...");
                  mapRef.value.leafletObject.invalidateSize();
                }
              }
            }, 50);
          }
        } catch (error) {
          console.warn("Error during map resize:", error);
        }
      }, 100); // 100ms debounce
    }
  };

  // Setup ResizeObserver for more accurate container size detection
  const setupResizeObserver = () => {
    if (typeof ResizeObserver !== "undefined" && mapRef.value) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === mapRef.value.leafletObject.getContainer()) {
            handleResize();
          }
        }
      });

      // Observe the map container
      if (
        mapRef.value.leafletObject &&
        mapRef.value.leafletObject.getContainer()
      ) {
        resizeObserver.observe(mapRef.value.leafletObject.getContainer());
      }
    }
  };

  // Cleanup resize observer
  const cleanupResizeObserver = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
  };

  // Enhanced onMapReady with ResizeObserver setup
  const onMapReadyEnhanced = () => {
    onMapReady();
    // Setup ResizeObserver after a short delay to ensure map is fully initialized
    setTimeout(() => {
      setupResizeObserver();
    }, 100);
  };

  const zoomIn = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
      mapRef.value.leafletObject.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.value && mapRef.value.leafletObject) {
      mapRef.value.leafletObject.zoomOut();
    }
  };

  const setCursor = (cursor) => {
    if (mapRef.value && mapRef.value.leafletObject) {
      mapRef.value.leafletObject.getContainer().style.cursor = cursor;
    }
  };

  // Cleanup on unmount
  onUnmounted(() => {
    cleanupResizeObserver();
  });

  // Manual resize trigger for external use
  const triggerResize = () => {
    handleResize();
  };

  return {
    mapRef,
    onMapReady: onMapReadyEnhanced,
    setMapCenter,
    centerMap,
    handleResize,
    triggerResize,
    zoomIn,
    zoomOut,
    setCursor,
    cleanupResizeObserver,
  };
}
