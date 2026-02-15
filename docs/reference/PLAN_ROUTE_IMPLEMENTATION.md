# Plan Route Page Implementation

## Overview
This document describes the implementation of the new Plan Route page that matches the design shown in the provided images. The page includes both list and grid view options, with the grid view showing interactive maps for each route.

## Files Created/Modified

### New Files
1. **`src/views/planned_routes/PlanRoute.vue`** - Main Plan Route page component
2. **`src/components/planned_routes/RouteCardWithMap.vue`** - Route card component with integrated map

### Modified Files
1. **`src/router/index.js`** - Added new route for Plan Route page
2. **`src/views/layouts/MainLayout.vue`** - Updated navigation to point to new Plan Route page

## Features Implemented

### 1. View Toggle
- Grid view with route cards showing mini maps
- List view with table format
- Toggle buttons in the header to switch between views

### 2. Grid View
- Route cards with status badges
- Mini maps showing route paths with start/end markers
- Route details (start/end locations, distance, vehicle type)
- Route descriptions
- Start Survey and Edit actions
- Client information and update dates

### 3. List View
- Sortable table with columns:
  - Route Name
  - Client
  - Start/End locations
  - Distance
  - Updated date
  - Actions
- Hover effects and responsive design

### 4. Search Functionality
- Search bar to filter routes by name, client, or locations
- Real-time filtering as user types

### 5. Interactive Maps
- Leaflet.js integration for mini maps
- Route polylines with start/end markers
- Consistent route generation based on route ID
- Responsive map containers

### 6. Styling
- Modern card-based design
- Hover effects and transitions
- Responsive layout for mobile devices
- Status badges with color coding
- Professional typography and spacing

## Route Data Structure
The component expects route objects with the following structure:
```javascript
{
  id: number,
  name: string,
  client: string,
  startLocation: string,
  endLocation: string,
  distance: string,
  vehicleType: string,
  status: string,
  description: string,
  updatedAt: string,
  createdAt: string
}
```

## Navigation
- Access via sidebar: Plan > Plan Route
- URL: `/plan-route`
- Integrates with existing navigation structure

## Responsive Design
- Mobile-first approach
- Grid view adapts to single column on mobile
- Table view becomes horizontally scrollable on small screens
- Touch-friendly buttons and interactions

## Future Enhancements
- Real route data integration
- Map clustering for better performance
- Advanced filtering options
- Route sharing capabilities
- Export functionality

## Dependencies
- Vue 3 Composition API
- Vue Router
- Leaflet.js for maps
- Bootstrap Icons
- Vue i18n for internationalization
