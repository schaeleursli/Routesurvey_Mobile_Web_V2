# Location Picker Feature

## Overview

The Location Picker is a new component that has been integrated into the planned routes forms to allow users to select start and end locations using OpenStreetMap (OSM) with search functionality.

## Features

### LocationPicker Component (`src/components/LocationPicker.vue`)

- **Interactive Map**: Uses Leaflet with OpenStreetMap tiles
- **Search Functionality**: Search for locations using Nominatim API
- **Current Location**: Get user's current location using browser geolocation
- **Click to Select**: Click anywhere on the map to select a location
- **Reverse Geocoding**: Automatically get address information for clicked locations
- **Responsive Design**: Works on both desktop and mobile devices

### Key Features

1. **Search Bar**: Type to search for locations worldwide
2. **Search Results**: Dropdown with location suggestions
3. **Map Interaction**: Click on map to select locations
4. **Current Location**: Button to use device's GPS location
5. **Clear Location**: Button to clear selected location
6. **Location Display**: Shows selected location name and coordinates

## Usage

### In Forms

The LocationPicker is used in the planned routes forms:

```vue
<LocationPicker 
    v-model="form.SurveyStart"
    :placeholder="t('searchForLocation')"
    height="250px"
/>
```

### Props

- `modelValue` (Object): The selected location object
- `placeholder` (String): Placeholder text for search input
- `height` (String): Height of the map container

### Emitted Value

The component emits a location object with the following structure:

```javascript
{
  lat: number,           // Latitude
  lng: number,           // Longitude
  display_name: string,  // Human-readable address
  address: object        // Full address details from Nominatim
}
```

## Integration

### Form Updates

The planned routes forms have been updated to use the LocationPicker:

1. **AddPlannedRoute.vue**: Start and end location pickers
2. **EditPlannedRoute.vue**: Start and end location pickers

### Data Structure Changes

The form data structure has been updated:

- `SurveyStart`: Changed from string to location object
- `SurveyEnd`: Changed from string to location object

### Display Updates

Components that display planned routes have been updated to handle both legacy string format and new object format:

- **PlannedRouteCard.vue**: Updated to show location names
- **ViewPlannedRoute.vue**: Updated to show location names

### Helper Functions

A `formatLocation` helper function has been added to handle both formats:

```javascript
const formatLocation = (location) => {
    if (!location) return null;
    
    // Handle string format (legacy)
    if (typeof location === 'string') {
        return location;
    }
    
    // Handle object format (new)
    if (typeof location === 'object' && location.display_name) {
        return location.display_name;
    }
    
    return null;
};
```

## Dependencies

The LocationPicker requires:

- `leaflet`: For map functionality
- `@vue-leaflet/vue-leaflet`: Vue wrapper for Leaflet (already installed)
- Nominatim API: For geocoding and reverse geocoding

## Translations

New translations have been added for the location picker:

- `selectedLocation`: "Selected Location" / "الموقع المحدد"
- `latitude`: "Latitude" / "خط العرض"
- `longitude`: "Longitude" / "خط الطول"
- `searchForLocation`: "Search for a location..." / "البحث عن موقع..."
- `useCurrentLocation`: "Use Current Location" / "استخدام الموقع الحالي"
- `clearLocation`: "Clear Location" / "مسح الموقع"
- `noLocationSelected`: "No location selected" / "لم يتم تحديد موقع"

## API Usage

The component uses the Nominatim API for:

1. **Search**: `https://nominatim.openstreetmap.org/search`
2. **Reverse Geocoding**: `https://nominatim.openstreetmap.org/reverse`

## Browser Compatibility

- Requires HTTPS for geolocation features
- Modern browsers with ES6+ support
- Leaflet map library compatibility

## Future Enhancements

Potential improvements:

1. **Caching**: Cache search results for better performance
2. **Custom Markers**: Custom map markers for start/end points
3. **Route Preview**: Show route between start and end points
4. **Favorites**: Save frequently used locations
5. **Offline Support**: Basic offline map functionality 