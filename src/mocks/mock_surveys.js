export const MOCK_SURVEYS = [
    {
        id: 201,
        name: "Route to Site A",
        description: "Survey for heavy machinery to Site A",
        startLocation: "Port of Miami",
        endLocation: "Construction Site A",
        distance: "45.2 km",
        dateAdded: "2024-03-01T10:00:00",
        status: "Completed",
        points: 15,
        obstacles: 2,
        isVisible: true,
        pointsData: [
            { lat: 25.7743, lng: -80.1937, type: 'start' },
            { lat: 25.7753, lng: -80.1947, type: 'route_point' },
            { lat: 25.7763, lng: -80.1957, type: 'route_point' },
            { lat: 25.7800, lng: -80.2000, type: 'route_point' },
            { lat: 25.7850, lng: -80.2100, type: 'route_point' },
            { lat: 25.7900, lng: -80.2200, type: 'end' }
        ]
    },
    {
        id: 202,
        name: "North Corridor Transport",
        description: "Survey for wind turbine parts",
        startLocation: "Manufacturing Plant",
        endLocation: "Wind Farm North",
        distance: "120.5 km",
        dateAdded: "2024-03-05T14:30:00",
        status: "In Progress",
        points: 42,
        obstacles: 5,
        isVisible: true,
        pointsData: [
            { lat: 33.7490, lng: -84.3880, type: 'start' },
            { lat: 33.7500, lng: -84.3900, type: 'route_point' },
            { lat: 33.7600, lng: -84.4000, type: 'route_point' },
            { lat: 33.7800, lng: -84.4200, type: 'route_point' },
            { lat: 33.8000, lng: -84.4500, type: 'end' }
        ]
    },
    {
        id: 203,
        name: "City Bypass Route",
        description: "Alternative route avoiding city center",
        startLocation: "Distribution Center",
        endLocation: "Highway Junction 5",
        distance: "18.0 km",
        dateAdded: "2024-03-10T09:15:00",
        status: "Completed",
        points: 8,
        obstacles: 0,
        isVisible: true,
        pointsData: [
            { lat: 51.5074, lng: -0.1278, type: 'start' }, // London-ish
            { lat: 51.5100, lng: -0.1300, type: 'route_point' },
            { lat: 51.5200, lng: -0.1400, type: 'end' }
        ]
    },
    {
        id: 204,
        name: "Coastal Highway Access",
        description: "Survey ensuring bridge clearance",
        startLocation: "Harbor",
        endLocation: "Coastal Resort",
        distance: "60.3 km",
        dateAdded: "2024-03-12T11:00:00",
        status: "Completed",
        points: 25,
        obstacles: 3,
        isVisible: true,
        pointsData: [
            { lat: 34.0522, lng: -118.2437, type: 'start' }, // LA
            { lat: 34.0600, lng: -118.2500, type: 'route_point' },
            { lat: 34.0700, lng: -118.2600, type: 'end' }
        ]
    },
    {
        id: 205,
        name: "Mountain Pass Logistics",
        description: "Survey for steep grade transport",
        startLocation: "Base Camp",
        endLocation: "Summit Station",
        distance: "35.7 km",
        dateAdded: "2024-03-15T08:45:00",
        status: "Planned",
        points: 12,
        obstacles: 8,
        isVisible: true,
        pointsData: [
            { lat: 39.7392, lng: -104.9903, type: 'start' }, // Denver
            { lat: 39.7400, lng: -105.0000, type: 'route_point' },
            { lat: 39.7500, lng: -105.0100, type: 'end' }
        ]
    },
    {
        id: 206,
        name: "Urban Delivery Route",
        description: "Night time delivery survey",
        startLocation: "Warehouse B",
        endLocation: "Downtown Plaza",
        distance: "12.4 km",
        dateAdded: "2024-03-18T22:00:00",
        status: "Completed",
        points: 20,
        obstacles: 4,
        isVisible: true,
        pointsData: [
            { lat: 40.7128, lng: -74.0060, type: 'start' }, // NYC
            { lat: 40.7200, lng: -74.0100, type: 'route_point' },
            { lat: 40.7300, lng: -74.0200, type: 'end' }
        ]
    }
];
