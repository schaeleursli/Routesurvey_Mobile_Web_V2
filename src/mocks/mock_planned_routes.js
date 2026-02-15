/**
 * Mock data for Planned Routes
 * Used for testing/development when backend is unavailable
 */

export const MOCK_PLANNED_ROUTES = [
    {
        id: 101,
        // Fields matching the database schema
        SurveyName: "Cairo Industrial Zone Survey",
        SurveyDate: "2024-03-25",
        ClientName: "Acme Heavy Transport",
        SurveyInstructions: "Full route assessment for oversized cargo delivery",
        SurveyStart: "Cairo Industrial Zone, Helwan",
        SurveyEnd: "Alexandria Port Terminal A",
        CargoType: "Heavy Machinery",
        CargoWeight: "85000",
        CargoLength: "24",
        CargoWidth: "4.5",
        CargoHeight: "5.2",
        CargoNotes: "Wind turbine nacelle - requires escort vehicles",
        TrailerType: "Modular Multi-Axle",
        TrailerLength: "32",
        TrailerNotes: "12-axle configuration required",
        Distance: 225000, // meters (225 km)
        dateAdded: "2024-03-20T08:00:00",
        isArchived: false,
        // Route data with coordinates for map
        RouteData: JSON.stringify({
            pointsData: [
                { id: "start", lat: 29.8500, lng: 31.3342, type: "start" },
                { id: "wp1", lat: 30.0444, lng: 31.2357, type: "waypoint" },
                { id: "wp2", lat: 30.2, lng: 30.8, type: "waypoint" },
                { id: "wp3", lat: 30.6, lng: 30.2, type: "waypoint" },
                { id: "end", lat: 31.2001, lng: 29.9187, type: "end" }
            ]
        }),
        // Legacy fields for compatibility
        startLocation: { display_name: "Cairo Industrial Zone, Helwan", lat: 29.8500, lng: 31.3342 },
        endLocation: { display_name: "Alexandria Port Terminal A", lat: 31.2001, lng: 29.9187 },
        routePath: [
            [29.8500, 31.3342],
            [30.0444, 31.2357],
            [30.2, 30.8],
            [30.6, 30.2],
            [31.2001, 29.9187]
        ]
    },
    {
        id: 102,
        SurveyName: "Suez Canal Bypass Route",
        SurveyDate: "2024-03-28",
        ClientName: "Global Freight Solutions",
        SurveyInstructions: "Alternative route via desert highway avoiding canal bridges",
        SurveyStart: "Port Said Container Terminal",
        SurveyEnd: "10th of Ramadan Industrial City",
        CargoType: "Transformer",
        CargoWeight: "120000",
        CargoLength: "18",
        CargoWidth: "5.8",
        CargoHeight: "4.6",
        CargoNotes: "Power transformer - sensitive electronics",
        TrailerType: "Hydraulic Platform",
        TrailerLength: "28",
        TrailerNotes: "Self-propelled modular transporter",
        Distance: 185000, // 185 km
        dateAdded: "2024-03-21T10:30:00",
        isArchived: false,
        RouteData: JSON.stringify({
            pointsData: [
                { id: "start", lat: 31.2653, lng: 32.3019, type: "start" },
                { id: "wp1", lat: 30.8, lng: 32.0, type: "waypoint" },
                { id: "wp2", lat: 30.4, lng: 31.7, type: "waypoint" },
                { id: "end", lat: 30.2969, lng: 31.7500, type: "end" }
            ]
        }),
        startLocation: { display_name: "Port Said Container Terminal", lat: 31.2653, lng: 32.3019 },
        endLocation: { display_name: "10th of Ramadan Industrial City", lat: 30.2969, lng: 31.7500 },
        routePath: [
            [31.2653, 32.3019],
            [30.8, 32.0],
            [30.4, 31.7],
            [30.2969, 31.7500]
        ]
    },
    {
        id: 103,
        SurveyName: "Aswan Dam Inspection Route",
        SurveyDate: "2024-04-02",
        ClientName: "National Power Authority",
        SurveyInstructions: "Annual infrastructure inspection route with multiple stops",
        SurveyStart: "Aswan High Dam Complex",
        SurveyEnd: "Luxor International Airport",
        CargoType: "Survey Equipment",
        CargoWeight: "8500",
        CargoLength: "6",
        CargoWidth: "2.2",
        CargoHeight: "2.4",
        CargoNotes: "LiDAR scanning equipment - keep dry",
        TrailerType: "Standard Flatbed",
        TrailerLength: "12",
        TrailerNotes: "Covered trailer recommended",
        Distance: 215000, // 215 km
        dateAdded: "2024-03-22T14:15:00",
        isArchived: false,
        RouteData: JSON.stringify({
            pointsData: [
                { id: "start", lat: 24.0889, lng: 32.8998, type: "start" },
                { id: "wp1", lat: 24.5, lng: 32.85, type: "waypoint" },
                { id: "wp2", lat: 25.2, lng: 32.75, type: "waypoint" },
                { id: "end", lat: 25.6994, lng: 32.6421, type: "end" }
            ]
        }),
        startLocation: { display_name: "Aswan High Dam Complex", lat: 24.0889, lng: 32.8998 },
        endLocation: { display_name: "Luxor International Airport", lat: 25.6994, lng: 32.6421 },
        routePath: [
            [24.0889, 32.8998],
            [24.5, 32.85],
            [25.2, 32.75],
            [25.6994, 32.6421]
        ]
    },
    {
        id: 104,
        SurveyName: "Red Sea Coastal Highway Survey",
        SurveyDate: "2024-04-10",
        ClientName: "Petroleum Transport Co.",
        SurveyInstructions: "Pipeline equipment delivery route assessment",
        SurveyStart: "Hurghada Port",
        SurveyEnd: "Suez Refinery Complex",
        CargoType: "Pipeline Sections",
        CargoWeight: "45000",
        CargoLength: "40",
        CargoWidth: "3.2",
        CargoHeight: "3.2",
        CargoNotes: "12 sections of 40m pipe - multiple trips required",
        TrailerType: "Extendable Low Loader",
        TrailerLength: "45",
        TrailerNotes: "Rear steering axle required",
        Distance: 425000, // 425 km
        dateAdded: "2024-03-23T09:45:00",
        isArchived: false,
        RouteData: JSON.stringify({
            pointsData: [
                { id: "start", lat: 27.2579, lng: 33.8116, type: "start" },
                { id: "wp1", lat: 27.8, lng: 33.5, type: "waypoint" },
                { id: "wp2", lat: 28.5, lng: 33.0, type: "waypoint" },
                { id: "wp3", lat: 29.2, lng: 32.6, type: "waypoint" },
                { id: "end", lat: 29.9668, lng: 32.5498, type: "end" }
            ]
        }),
        startLocation: { display_name: "Hurghada Port", lat: 27.2579, lng: 33.8116 },
        endLocation: { display_name: "Suez Refinery Complex", lat: 29.9668, lng: 32.5498 },
        routePath: [
            [27.2579, 33.8116],
            [27.8, 33.5],
            [28.5, 33.0],
            [29.2, 32.6],
            [29.9668, 32.5498]
        ]
    },
    {
        id: 105,
        SurveyName: "Giza Pyramid Access Survey",
        SurveyDate: "2024-04-15",
        ClientName: "Ministry of Tourism",
        SurveyInstructions: "New visitor center construction materials delivery",
        SurveyStart: "6th October City Industrial Area",
        SurveyEnd: "Giza Plateau Visitor Center",
        CargoType: "Construction Materials",
        CargoWeight: "35000",
        CargoLength: "14",
        CargoWidth: "3.2",
        CargoHeight: "3.8",
        CargoNotes: "Prefabricated building sections",
        TrailerType: "Flatbed",
        TrailerLength: "18",
        TrailerNotes: "Night transport only - tourist area restrictions",
        Distance: 42000, // 42 km
        dateAdded: "2024-03-24T16:20:00",
        isArchived: false,
        RouteData: JSON.stringify({
            pointsData: [
                { id: "start", lat: 29.9333, lng: 30.9167, type: "start" },
                { id: "wp1", lat: 29.95, lng: 31.0, type: "waypoint" },
                { id: "end", lat: 29.9792, lng: 31.1342, type: "end" }
            ]
        }),
        startLocation: { display_name: "6th October City Industrial Area", lat: 29.9333, lng: 30.9167 },
        endLocation: { display_name: "Giza Plateau Visitor Center", lat: 29.9792, lng: 31.1342 },
        routePath: [
            [29.9333, 30.9167],
            [29.95, 31.0],
            [29.9792, 31.1342]
        ]
    }
];
