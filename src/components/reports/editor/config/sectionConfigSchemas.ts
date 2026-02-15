import type { SectionConfigSchema, SectionType } from '@/types/report';
import { asNumber } from '@/utils/validators';

/**
 * Configuration schemas for each report section type.
 * These define the configurable attributes for transport-related parameters.
 */
export const SECTION_CONFIG_SCHEMAS: SectionConfigSchema[] = [
    {
        sectionType: 'Bridge_Structure_Register',
        fields: [
            {
                key: 'minVerticalClearance',
                label: 'Minimum Vertical Clearance',
                type: 'number',
                unit: 'm',
                default: 4.5,
                min: 0,
                max: 20,
                step: 0.1,
                required: true,
                description: 'Minimum vertical clearance threshold for bridge filtering',
                validationRules: [
                    {
                        type: 'min',
                        value: 2.0,
                        message: 'Minimum clearance must be at least 2.0m for safety'
                    },
                    {
                        type: 'custom',
                        message: 'Minimum vertical clearance must be less than or equal to maximum',
                        validator: (value, allValues) => {
                            const v = asNumber(value);
                            const max = asNumber(allValues.maxVerticalClearance);
                            if (v === null || max === null) return true;
                            return v <= max;
                        }
                    }
                ]
            },
            {
                key: 'maxVerticalClearance',
                label: 'Maximum Vertical Clearance',
                type: 'number',
                unit: 'm',
                default: 10.0,
                min: 0,
                max: 20,
                step: 0.1,
                description: 'Maximum vertical clearance threshold',
                dependsOn: 'minVerticalClearance',
                validationRules: [
                    {
                        type: 'custom',
                        message: 'Maximum must be greater than minimum clearance',
                        validator: (value, allValues) => {
                            const v = asNumber(value);
                            const min = asNumber(allValues.minVerticalClearance);
                            if (v === null || min === null) return true;
                            return v >= min;
                        }
                    }
                ]
            },
            {
                key: 'minHorizontalClearance',
                label: 'Minimum Horizontal Clearance',
                type: 'number',
                unit: 'm',
                default: 3.5,
                min: 0,
                max: 15,
                step: 0.1,
                required: true,
                description: 'Minimum horizontal clearance threshold',
                validationRules: [
                    {
                        type: 'min',
                        value: 1.5,
                        message: 'Horizontal clearance must be at least 1.5m'
                    }
                ]
            },
            {
                key: 'maxLoadCapacity',
                label: 'Maximum Load Capacity',
                type: 'number',
                unit: 't',
                default: 100,
                min: 0,
                max: 500,
                step: 5,
                description: 'Maximum load capacity for bridge structures',
                validationRules: [
                    {
                        type: 'min',
                        value: 10,
                        message: 'Load capacity must be at least 10 tonnes'
                    }
                ]
            },
            {
                key: 'includeStructureTypes',
                label: 'Structure Types to Include',
                type: 'multiselect',
                options: ['Bridge', 'Overpass', 'Underpass', 'Tunnel', 'Culvert'],
                default: ['Bridge', 'Overpass', 'Underpass'],
                required: true,
                description: 'Types of structures to include in the register',
                validationRules: [
                    {
                        type: 'custom',
                        message: 'At least one structure type must be selected',
                        validator: (value) => Array.isArray(value) && value.length > 0
                    }
                ]
            },
            {
                key: 'showLoadRatings',
                label: 'Show Load Ratings',
                type: 'boolean',
                default: true,
                description: 'Display load rating information for each structure'
            },
            {
                key: 'measurementUnit',
                label: 'Measurement Unit',
                type: 'select',
                options: [
                    { value: 'metric', label: 'Metric (m)' },
                    { value: 'imperial', label: 'Imperial (ft)' }
                ],
                default: 'metric',
                description: 'Unit system for measurements'
            }
        ]
    },
    {
        sectionType: 'Clearance_Analysis',
        fields: [
            {
                key: 'verticalClearanceThreshold',
                label: 'Vertical Clearance Threshold',
                type: 'number',
                unit: 'm',
                default: 4.5,
                min: 0,
                max: 20,
                step: 0.1,
                required: true,
                description: 'Critical vertical clearance threshold',
                validationRules: [
                    {
                        type: 'min',
                        value: 2.0,
                        message: 'Threshold must be at least 2.0m for safety'
                    }
                ]
            },
            {
                key: 'lateralClearanceThreshold',
                label: 'Lateral Clearance Threshold',
                type: 'number',
                unit: 'm',
                default: 3.0,
                min: 0,
                max: 15,
                step: 0.1,
                required: true,
                description: 'Critical lateral clearance threshold',
                validationRules: [
                    {
                        type: 'min',
                        value: 1.0,
                        message: 'Lateral threshold must be at least 1.0m'
                    }
                ]
            },
            {
                key: 'measurementUnit',
                label: 'Measurement Unit',
                type: 'select',
                options: [
                    { value: 'metric', label: 'Metric (m)' },
                    { value: 'imperial', label: 'Imperial (ft)' }
                ],
                default: 'metric',
                description: 'Unit system for clearance measurements'
            },
            {
                key: 'toleranceValue',
                label: 'Clearance Tolerance',
                type: 'number',
                unit: 'm',
                default: 0.3,
                min: 0,
                max: 2,
                step: 0.05,
                description: 'Safety tolerance added to clearance calculations',
                validationRules: [
                    {
                        type: 'custom',
                        message: 'Tolerance should not exceed 50% of vertical threshold',
                        validator: (value, allValues) => {
                            const v = asNumber(value);
                            const threshold = asNumber(allValues.verticalClearanceThreshold);
                            if (v === null || threshold === null) return true;
                            return v <= (threshold * 0.5);
                        }
                    }
                ]
            },
            {
                key: 'highlightCritical',
                label: 'Highlight Critical Clearances',
                type: 'boolean',
                default: true,
                description: 'Highlight clearances below threshold in red'
            }
        ]
    },
    {
        sectionType: 'Transport_Assumptions',
        fields: [
            {
                key: 'vehicleLength',
                label: 'Vehicle Length',
                type: 'number',
                unit: 'm',
                default: 18.0,
                min: 0,
                max: 100,
                step: 0.5,
                description: 'Total length of transport vehicle'
            },
            {
                key: 'vehicleWidth',
                label: 'Vehicle Width',
                type: 'number',
                unit: 'm',
                default: 3.5,
                min: 0,
                max: 20,
                step: 0.1,
                description: 'Total width of transport vehicle'
            },
            {
                key: 'vehicleHeight',
                label: 'Vehicle Height',
                type: 'number',
                unit: 'm',
                default: 4.5,
                min: 0,
                max: 15,
                step: 0.1,
                description: 'Total height of transport vehicle with cargo'
            },
            {
                key: 'axleConfiguration',
                label: 'Axle Configuration',
                type: 'select',
                options: ['2-axle', '3-axle', '4-axle', '5-axle', '6-axle', 'Multi-axle'],
                default: '4-axle',
                description: 'Number of axles on the transport vehicle'
            },
            {
                key: 'maxSpeed',
                label: 'Maximum Speed',
                type: 'number',
                unit: 'km/h',
                default: 60,
                min: 0,
                max: 120,
                step: 5,
                description: 'Maximum permitted speed for transport'
            },
            {
                key: 'requiresEscort',
                label: 'Requires Escort',
                type: 'boolean',
                default: false,
                description: 'Transport requires police or pilot vehicle escort'
            }
        ]
    },
    {
        sectionType: 'Route_Overview',
        fields: [
            {
                key: 'mapZoomLevel',
                label: 'Map Zoom Level',
                type: 'range',
                default: 12,
                min: 8,
                max: 18,
                step: 1,
                description: 'Default zoom level for route overview map'
            },
            {
                key: 'showWaypoints',
                label: 'Show Waypoints',
                type: 'boolean',
                default: true,
                description: 'Display route waypoints on overview map'
            },
            {
                key: 'showElevationProfile',
                label: 'Show Elevation Profile',
                type: 'boolean',
                default: true,
                description: 'Include elevation profile chart'
            },
            {
                key: 'detailLevel',
                label: 'Detail Level',
                type: 'select',
                options: [
                    { value: 'summary', label: 'Summary' },
                    { value: 'standard', label: 'Standard' },
                    { value: 'detailed', label: 'Detailed' }
                ],
                default: 'standard',
                description: 'Level of detail for route overview information'
            }
        ]
    },
    {
        sectionType: 'Road_Geometry_Turning',
        fields: [
            {
                key: 'minTurningRadius',
                label: 'Minimum Turning Radius',
                type: 'number',
                unit: 'm',
                default: 15,
                min: 0,
                max: 100,
                step: 1,
                description: 'Minimum turning radius for vehicle'
            },
            {
                key: 'roadWidthThreshold',
                label: 'Road Width Threshold',
                type: 'number',
                unit: 'm',
                default: 5.0,
                min: 0,
                max: 20,
                step: 0.5,
                description: 'Minimum acceptable road width'
            },
            {
                key: 'maxGradient',
                label: 'Maximum Gradient',
                type: 'number',
                unit: '%',
                default: 8,
                min: 0,
                max: 25,
                step: 1,
                description: 'Maximum acceptable road gradient'
            },
            {
                key: 'analyzeSweepPath',
                label: 'Analyze Sweep Path',
                type: 'boolean',
                default: true,
                description: 'Include vehicle sweep path analysis at turns'
            }
        ]
    },
    {
        sectionType: 'Pavement_Load_Constraints',
        fields: [
            {
                key: 'maxAxleLoad',
                label: 'Maximum Axle Load',
                type: 'number',
                unit: 't',
                default: 20,
                min: 0,
                max: 50,
                step: 1,
                description: 'Maximum load per axle'
            },
            {
                key: 'maxGrossWeight',
                label: 'Maximum Gross Weight',
                type: 'number',
                unit: 't',
                default: 80,
                min: 0,
                max: 300,
                step: 5,
                description: 'Maximum total vehicle weight'
            },
            {
                key: 'pavementClass',
                label: 'Pavement Class',
                type: 'select',
                options: ['Class A', 'Class B', 'Class C', 'Class D'],
                default: 'Class B',
                description: 'Expected pavement classification'
            },
            {
                key: 'checkBridges',
                label: 'Check Bridge Load Ratings',
                type: 'boolean',
                default: true,
                description: 'Include bridge load rating verification'
            }
        ]
    },
    {
        sectionType: 'Risk_Register',
        fields: [
            {
                key: 'riskLevelFilter',
                label: 'Risk Level Filter',
                type: 'multiselect',
                options: ['Critical', 'High', 'Medium', 'Low'],
                default: ['Critical', 'High', 'Medium', 'Low'],
                description: 'Risk levels to include in register'
            },
            {
                key: 'showMitigations',
                label: 'Show Mitigations',
                type: 'boolean',
                default: true,
                description: 'Display mitigation measures for each risk'
            },
            {
                key: 'groupByCategory',
                label: 'Group by Category',
                type: 'boolean',
                default: false,
                description: 'Group risks by category instead of priority'
            }
        ]
    },
    {
        sectionType: 'Photo_Log',
        fields: [
            {
                key: 'imageSize',
                label: 'Image Size',
                type: 'select',
                options: [
                    { value: 'small', label: 'Small (400px)' },
                    { value: 'medium', label: 'Medium (600px)' },
                    { value: 'large', label: 'Large (800px)' },
                    { value: 'full', label: 'Full Width' }
                ],
                default: 'medium',
                description: 'Default size for photo log images'
            },
            {
                key: 'imagesPerRow',
                label: 'Images per Row',
                type: 'select',
                options: ['1', '2', '3', '4'],
                default: '2',
                description: 'Number of images per row in photo log'
            },
            {
                key: 'showGPSCoordinates',
                label: 'Show GPS Coordinates',
                type: 'boolean',
                default: true,
                description: 'Display GPS coordinates with each photo'
            },
            {
                key: 'showTimestamp',
                label: 'Show Timestamp',
                type: 'boolean',
                default: true,
                description: 'Display timestamp with each photo'
            }
        ]
    },
    {
        sectionType: 'Maps_KML',
        fields: [
            {
                key: 'includeRouteKML',
                label: 'Include Route KML',
                type: 'boolean',
                default: true,
                description: 'Include downloadable KML file of route'
            },
            {
                key: 'includeWaypointsKML',
                label: 'Include Waypoints KML',
                type: 'boolean',
                default: true,
                description: 'Include waypoints in KML export'
            },
            {
                key: 'mapStyle',
                label: 'Map Style',
                type: 'select',
                options: [
                    { value: 'roadmap', label: 'Road Map' },
                    { value: 'satellite', label: 'Satellite' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'terrain', label: 'Terrain' }
                ],
                default: 'roadmap',
                description: 'Map style for embedded maps'
            }
        ]
    }
];

/**
 * Get configuration schema for a specific section type
 */
export function getSectionConfigSchema(sectionType: SectionType): SectionConfigSchema | undefined {
    return SECTION_CONFIG_SCHEMAS.find(schema => schema.sectionType === sectionType);
}

/**
 * Get default configuration values for a section type
 */
export function getDefaultConfiguration(sectionType: SectionType): Record<string, unknown> {
    const schema = getSectionConfigSchema(sectionType);
    if (!schema) return {};

    const config: Record<string, unknown> = {};
    schema.fields.forEach(field => {
        config[field.key] = field.default;
    });

    return config;
}
