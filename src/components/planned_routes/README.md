# Planned Route Map Component - Refactored

This directory contains a refactored version of the PlannedRouteMap component, separated into multiple files for better maintainability and reusability.

## Structure

```
planned_routes/
├── composables/           # Vue 3 composables for state management
│   ├── useMapState.js     # Map state (zoom, center, style)
│   ├── useRouteState.js   # Route state (points, waypoints, info)
│   ├── useSearchState.js  # Search functionality state
│   ├── useWaypointMode.js # Waypoint mode and selection
│   ├── useContextMenu.js  # Context menu state and actions
│   ├── useMapControls.js  # Map control functions
│   ├── useRouteActions.js # Route action functions
│   ├── useMapInteractions.js # Map interaction handlers
│   ├── useKeyboardEvents.js # Keyboard event handlers
│   └── index.js           # Export all composables
├── utils/                 # Utility functions
│   ├── geocoding.js       # Geocoding functions
│   ├── calculations.js    # Mathematical calculations
│   ├── routeCalculations.js # Route calculation functions
│   └── index.js           # Export all utilities
├── PlannedRouteMap.vue    # Original component (2027 lines)
├── PlannedRouteMapRefactored.vue # Refactored component (~400 lines)
└── README.md              # This file
```

## Benefits of Refactoring

1. **Separation of Concerns**: Each composable handles a specific aspect of functionality
2. **Reusability**: Composables can be reused in other components
3. **Testability**: Individual functions can be tested in isolation
4. **Maintainability**: Easier to find and modify specific functionality
5. **Readability**: Smaller, focused files are easier to understand

## Composables

### useMapState
Manages map-related state including zoom level, center coordinates, and map style.

### useRouteState
Manages route-related state including start/end points, waypoints, route path, and loading states.

### useSearchState
Handles location search functionality including query state, results, and search actions.

### useWaypointMode
Manages waypoint mode state and waypoint selection.

### useContextMenu
Handles context menu visibility and positioning.

### useMapControls
Provides map control functions like zoom, center, and resize handling.

### useRouteActions
Contains all route-related actions like setting points, adding waypoints, and calculating routes.

### useMapInteractions
Handles map click events and route interactions.

### useKeyboardEvents
Manages keyboard shortcuts and click-outside events.

## Utilities

### geocoding.js
Functions for reverse geocoding using OpenStreetMap Nominatim API.

### calculations.js
Mathematical utilities for distance calculations, angle calculations, and formatting.

### routeCalculations.js
Route calculation functions using OSRM API and waypoint extraction logic.

## Usage

### Using the Refactored Component

```vue
<template>
  <PlannedRouteMapRefactored 
    v-model="routeData"
    height="600px"
  />
</template>

<script setup>
import PlannedRouteMapRefactored from './PlannedRouteMapRefactored.vue';
import { ref } from 'vue';

const routeData = ref({
  startPoint: null,
  endPoint: null,
  waypoints: [],
  routePath: [],
  routeInfo: null
});
</script>
```

### Using Individual Composables

```vue
<script setup>
import { useMapState, useRouteState } from './composables';
import { calculateDistance, formatDistance } from './utils';

// Use map state
const { zoom, mapCenter, setMapStyle } = useMapState();

// Use route state
const { startPoint, endPoint, waypoints } = useRouteState();

// Use utilities
const distance = calculateDistance(lat1, lng1, lat2, lng2);
const formattedDistance = formatDistance(distance);
</script>
```

## Migration from Original Component

The refactored component maintains the same API as the original, so you can replace:

```vue
<!-- Before -->
<PlannedRouteMap v-model="routeData" />

<!-- After -->
<PlannedRouteMapRefactored v-model="routeData" />
```

## Key Improvements

1. **Reduced Complexity**: Main component reduced from 2027 lines to ~400 lines
2. **Better Organization**: Related functionality grouped together
3. **Easier Testing**: Individual composables can be tested separately
4. **Improved Maintainability**: Changes to specific functionality are isolated
5. **Better Documentation**: Each file has a clear purpose and responsibility

## Future Enhancements

- Add TypeScript support
- Create unit tests for each composable
- Add error boundaries and better error handling
- Implement caching for geocoding results
- Add performance optimizations for large routes 