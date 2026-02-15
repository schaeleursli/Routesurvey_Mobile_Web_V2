<template>
    <div class="map-libre-viewer" ref="mapContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, markRaw } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Import local styles
import darkStyle from './styles/routesurvey-dark-v1.json';
import lightStyle from './styles/routesurvey-light-v1.json';
import satelliteStyle from './styles/routesurvey-satellite-dark-v1.json';

const props = defineProps({
    routePoints: {
        type: Array,
        default: () => []
    },
    mapStyle: {
        type: String,
        default: 'dark', // 'dark', 'light', 'satellite', 'standard'
        validator: (value) => ['dark', 'light', 'satellite', 'standard', 'osm', 'minimal', 'terrain'].includes(value)
    },
    markers: {
        type: Array,
        default: () => []
    },
    zoom: {
        type: Number,
        default: 12
    },
    center: {
        type: Array,
        default: () => [0, 0]
    }
});

const emit = defineEmits(['map-ready', 'move-end', 'click']);

const mapContainer = ref(null);
const mapInstance = ref(null);
const isMapReady = ref(false);

// API Key (Should be in env var in production)
const MAPTILER_KEY = 'YOUR_API_KEY'; // Placeholder

// Helper to get style object or URL
const getStyle = (styleName) => {
    switch (styleName) {
        case 'dark':
            // Inject API Key into Tile URL
            const dark = JSON.parse(JSON.stringify(darkStyle));
            if(dark.sources.osm.tiles[0].includes('YOUR_API_KEY')) {
                 // Fallback or use env var - for now leaving placeholder trigger warning or handle gracefully
                 console.warn("API Key missing for MapTiler");
            }
            return dark;
        case 'light':
            const light = JSON.parse(JSON.stringify(lightStyle));
             if(light.sources.osm.tiles[0].includes('YOUR_API_KEY')) {
                 console.warn("API Key missing for MapTiler");
            }
            return light;
        case 'satellite':
            // Satellite Dark V1 Style (Vector + Raster)
            const sat = JSON.parse(JSON.stringify(satelliteStyle));
            
            // Inject Key into Vector Tile Source if needed
            if(sat.sources.osm && sat.sources.osm.tiles && sat.sources.osm.tiles[0].includes('YOUR_API_KEY')) {
                 // Use same key logic as others (or placeholder warning)
                 // Keeping placeholder or injecting if we had a variable
                 // console.warn("API Key missing for MapTiler in Satellite Style");
            }
            return sat;
        case 'standard':
        case 'osm':
        default:
             return {
                version: 8,
                sources: {
                    'osm-source': {
                        type: 'raster',
                        tiles: [
                            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                        ],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors'
                    }
                },
                layers: [
                    {
                        id: 'osm-layer',
                        type: 'raster',
                        source: 'osm-source',
                        paint: {}
                    }
                ]
            };
    }
};

const initializeMap = () => {
    if (!mapContainer.value) return;

    const style = getStyle(props.mapStyle);

    mapInstance.value = markRaw(new maplibregl.Map({
        container: mapContainer.value,
        style: style,
        center: props.center,
        zoom: props.zoom,
        attributionControl: false // Custom one if needed
    }));

    mapInstance.value.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapInstance.value.addControl(new maplibregl.ScaleControl(), 'bottom-right');

    mapInstance.value.on('load', () => {
        isMapReady.value = true;
        emit('map-ready', mapInstance.value);
        
        // Initial Data Load
        updateRouteSource();
    });

    mapInstance.value.on('moveend', () => {
        emit('move-end', {
            center: mapInstance.value.getCenter().toArray(),
            zoom: mapInstance.value.getZoom()
        });
    });

    mapInstance.value.on('click', (e) => {
        emit('click', e.lngLat);
    });
};

// Managing Markers
const markersArray = [];

const clearMarkers = () => {
    markersArray.forEach(marker => marker.remove());
    markersArray.length = 0;
};

const updateMarkers = () => {
    if (!isMapReady.value || !mapInstance.value) return;

    // Clear existing
    clearMarkers();

    // Add new markers
    // Note: routePoints contains all points, including start/end and survey points
    // We should filter or just iterate props.routePoints.
    // Assuming props.routePoints are the source of truth for display
    
    props.routePoints.forEach((point, index) => {
        if (!point.lat || !point.lng) return;

        // Determine marker image based on type
        let imageUrl = '/media/marker_other.png';
        
        if (point.type === 'bridge') imageUrl = '/media/marker_bridge.png';
        else if (point.type === 'powerline') imageUrl = '/media/marker_powerline.png';
        else if (point.type === 'intersection') imageUrl = '/media/marker_intersection.png';
        else if (point.type === 'road') imageUrl = '/media/marker_road.png';
        else if (point.type === 'overhead') imageUrl = '/media/marker_overhead.png';
        else if (index === 0) imageUrl = '/media/marker_location.png'; // Start
        else if (index === props.routePoints.length - 1) imageUrl = '/media/marker_location.png'; // End
        else if (point.type === 'route_point') return; // Skip route intermediate points (dots) if desired, or render small dot

        // If it is a simple route point (not start/end/survey), we might want to skip or show small dot
        if (point.type === 'route_point' && index !== 0 && index !== props.routePoints.length - 1) {
             // Optional: Render small dots or skip. 
             // Leaflet viewer renders 'route' type as small dots. 
             // Let's render small white circles for consistency if needed, or skip for cleaner look.
             return; 
        }

        const el = document.createElement('div');
        el.className = 'maplibre-marker';
        el.style.backgroundImage = `url(${imageUrl})`;
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundSize = 'contain';
        el.style.cursor = 'pointer';

        // Add to map
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([point.lng, point.lat])
            .addTo(mapInstance.value);

        // Click event
        el.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent map click
            // Emit marker click if needed
             // emit('marker-click', point); 
        });

        markersArray.push(marker);
    });
};

const updateRouteSource = () => {
    if (!isMapReady.value || !mapInstance.value) return;

    // Check if sources exist (they might not in Satellite/OSM raster modes)
    // If we are in Vector modes (Dark/Light), we have 'route' source defined in JSON
    // If in Raster modes, we might need to add them dynamically if we want overlays on top.
    
    // For now, let's assume we primarily support overlays on the Vector styles.
    // To support them on raster, we'd need to addGeoJSONSource programmatically.

    // Generic helper to set data if source exists
    const setSourceData = (sourceId, features) => {
        const source = mapInstance.value.getSource(sourceId);
        if (source) {
             source.setData({
                type: 'FeatureCollection',
                features: features
            });
        }
    };

    // 1. Main Route Line
    const routeCoordinates = props.routePoints.map(p => [p.lng, p.lat]);
    setSourceData('route', [{
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
        }
    }]);

    // 2. Powerlines (stub for now, assuming points with type='powerline')
    // Note: The style expects LineStrings for 'powerlines' source, but if we only have points
    // we might need to adjust or if 'powerlines' means segments between powerline points.
    // For now, let's just leave empty or try to connect them if consecutive?
    // User request: "power lines (red)" overlays.
    // If the data is just markers, the Markers logic handles it. 
    // If we want lines, we need segment data. 
    // Leaving empty for now unless we have segment data.
    setSourceData('powerlines', []);

    // 3. Bridges
    setSourceData('route_bridges', []);
    
    updateMarkers(); // Update markers whenever points change
};

onMounted(() => {
    initializeMap();
});

onUnmounted(() => {
    if (mapInstance.value) {
        mapInstance.value.remove();
    }
});

// Watchers
watch(() => props.mapStyle, (newStyle) => {
    if (mapInstance.value) {
        mapInstance.value.setStyle(getStyle(newStyle));
        // Note: setStyle removes sources/layers not in the new style.
        // Takes a moment to reload.
        mapInstance.value.once('style.load', () => {
            updateRouteSource();
        });
    }
});

watch(() => props.routePoints, () => {
    updateRouteSource();
}, { deep: true });

</script>

<style scoped>
.map-libre-viewer {
    width: 100%;
    height: 100%;
    background-color: #0F1116; /* Fallback */
}
</style>
