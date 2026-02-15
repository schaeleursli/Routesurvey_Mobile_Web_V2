/**
 * Route Test Data Generator
 * Generates realistic test data for route editor testing
 */

/**
 * Generate random coordinates within bounds
 */
export function generateRandomCoordinate(lat, lng, variance = 0.01) {
    return {
        lat: lat + (Math.random() - 0.5) * variance,
        lng: lng + (Math.random() - 0.5) * variance
    };
}

/**
 * Generate a route with specified number of points
 */
export function generateTestRoute(pointCount = 10, options = {}) {
    const {
        startLat = 40.7128,
        startLng = -74.0060,
        routeType = 'manual',
        includeMetadata = true
    } = options;

    const points = [];
    const routePath = [];

    // Generate route points
    for (let i = 0; i < pointCount; i++) {
        const coord = generateRandomCoordinate(
            startLat + i * 0.01,
            startLng + i * 0.01,
            0.005
        );

        const point = {
            ...coord,
            id: `point_${i}`,
            type: i === 0 ? 'start' : i === pointCount - 1 ? 'end' : 'waypoint',
            name: i === 0 ? 'Start Point' : i === pointCount - 1 ? 'End Point' : `Waypoint ${i}`,
            order: i
        };

        if (includeMetadata) {
            point.address = `${i} Test Street, Test City`;
            point.timestamp = new Date(Date.now() - (pointCount - i) * 3600000).toISOString();
        }

        points.push(point);
        routePath.push([coord.lat, coord.lng]);
    }

    const route = {
        id: `route_${Date.now()}`,
        type: routeType,
        points,
        routePath,
        startPoint: points[0],
        endPoint: points[points.length - 1],
        waypoints: points.slice(1, -1)
    };

    if (includeMetadata) {
        route.routeInfo = {
            distance: calculateDistance(routePath),
            duration: pointCount * 300, // 5 minutes per point
            createdAt: new Date().toISOString()
        };
    }

    return route;
}

/**
 * Generate manual route with form data
 */
export function generateManualRouteData(pointCount = 5) {
    const route = generateTestRoute(pointCount, { routeType: 'manual' });

    return {
        ...route,
        form: {
            RouteTitle: `Manual Route ${Date.now()}`,
            RouteDescription: 'Test route for automated testing',
            RouteType: 'Highway',
            EstimatedDuration: '2 hours',
            Notes: 'Test notes'
        }
    };
}

/**
 * Generate planned route with survey data
 */
export function generatePlannedRouteData(pointCount = 8) {
    const route = generateTestRoute(pointCount, { routeType: 'planned' });

    return {
        ...route,
        form: {
            SurveyNo: `SRV-${Date.now()}`,
            JobNo: `JOB-${Date.now()}`,
            SurveyDate: new Date().toISOString().split('T')[0],
            CargoType: 'Construction Equipment',
            CargoWeight: 25000,
            CargoLength: 15.5,
            CargoWidth: 3.5,
            CargoHeight: 4.2,
            CargoNotes: 'Oversized load - requires escort',
            TrailerType: 'Lowboy',
            TrailerLength: 16.0,
            TrailerNotes: 'Heavy-duty trailer'
        }
    };
}

/**
 * Generate large route for performance testing
 */
export function generateLargeRoute(pointCount = 1000) {
    console.log(`Generating route with ${pointCount} points...`);
    const route = generateTestRoute(pointCount, {
        startLat: 40.7128,
        startLng: -74.0060,
        includeMetadata: false // Skip metadata for performance
    });

    route.isLarge = true;
    route.virtualScrollingRequired = pointCount > 50;

    return route;
}

/**
 * Generate route template test data
 */
export function generateRouteTemplate(name, routeType = 'manual') {
    const route = routeType === 'manual'
        ? generateManualRouteData(5)
        : generatePlannedRouteData(8);

    return {
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name || `${routeType.charAt(0).toUpperCase() + routeType.slice(1)} Template`,
        description: `Test template for ${routeType} routes`,
        routeType,
        data: route.form || {},
        route: {
            startPoint: route.startPoint,
            endPoint: route.endPoint,
            waypoints: route.waypoints
        },
        isShared: Math.random() > 0.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

/**
 * Generate multiple templates
 */
export function generateTemplates(count = 5, routeType = null) {
    const templates = [];
    for (let i = 0; i < count; i++) {
        const type = routeType || (i % 2 === 0 ? 'manual' : 'planned');
        templates.push(generateRouteTemplate(`Template ${i + 1}`, type));
    }
    return templates;
}

/**
 * Calculate approximate distance from route path
 */
function calculateDistance(routePath) {
    if (!routePath || routePath.length < 2) return 0;

    let distance = 0;
    for (let i = 0; i < routePath.length - 1; i++) {
        distance += haversineDistance(
            routePath[i][0],
            routePath[i][1],
            routePath[i + 1][0],
            routePath[i + 1][1]
        );
    }
    return Math.round(distance);
}

/**
 * Haversine distance calculation (meters)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Generate test location search results
 */
export function generateLocationSearchResults(query, count = 5) {
    const baseLocations = [
        { name: 'New York', lat: 40.7128, lng: -74.0060, type: 'city' },
        { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, type: 'city' },
        { name: 'Chicago', lat: 41.8781, lng: -87.6298, type: 'city' },
        { name: 'Houston', lat: 29.7604, lng: -95.3698, type: 'city' },
        { name: 'Phoenix', lat: 33.4484, lng: -112.0740, type: 'city' },
        { name: 'Philadelphia', lat: 39.9526, lng: -75.1652, type: 'city' },
        { name: 'San Antonio', lat: 29.4241, lng: -98.4936, type: 'city' },
        { name: 'San Diego', lat: 32.7157, lng: -117.1611, type: 'city' }
    ];

    return baseLocations
        .filter(loc => loc.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, count)
        .map(loc => ({
            lat: loc.lat.toString(),
            lon: loc.lng.toString(),
            display_name: `${loc.name}, USA`,
            type: loc.type,
            address: {
                city: loc.name,
                country: 'United States'
            }
        }));
}

/**
 * Generate map tiles for testing
 */
export function generateMockTile(z, x, y) {
    // Create a simple canvas-based tile
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Draw a simple pattern
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#ccc';
    ctx.strokeRect(0, 0, 256, 256);

    // Add tile coordinates
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`${z}/${x}/${y}`, 10, 128);

    return canvas.toDataURL('image/png');
}

/**
 * Export all generators
 */
export default {
    generateRandomCoordinate,
    generateTestRoute,
    generateManualRouteData,
    generatePlannedRouteData,
    generateLargeRoute,
    generateRouteTemplate,
    generateTemplates,
    generateLocationSearchResults,
    generateMockTile
};
