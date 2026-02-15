export type ReportType =
    | 'Desktop Route Review'
    | 'Field Route Survey'
    | 'Transport Feasibility Study'
    | 'Authority Submission';

export type ReportStatus = 'Draft' | 'Complete' | 'Frozen';

export type SectionStatus = 'Complete' | 'Warning' | 'Error' | 'Disabled' | 'Incomplete';

export type SectionGroup =
    | 'Front Matter'
    | 'Commercial / Scope'
    | 'Route Definition'
    | 'Technical Analysis'
    | 'Risk & Conclusions'
    | 'Appendices';

export type SectionType =
    | 'Cover_Metadata'
    | 'Executive_Summary'
    | 'Scope_Of_Work'
    | 'Assumptions_Exclusions'
    | 'Route_Overview'
    | 'Route_Description'
    | 'Transport_Assumptions'
    | 'Bridge_Structure_Register'
    | 'Clearance_Analysis'
    | 'Road_Geometry_Turning'
    | 'Pavement_Load_Constraints'
    | 'Risk_Register'
    | 'Mitigation_Measures'
    | 'Conclusions_Feasibility'
    | 'Photo_Log'
    | 'Maps_KML'
    | 'Data_Tables_Appendices';

export interface ReportMetadata {
    title: string;
    reportType: ReportType;
    revision: string; // "Rev A", "Rev B"
    status: ReportStatus;
    client: string;
    project: string;
    routeOrigin: string;
    routeDestination: string;
    author: string;
    company: string;
}

// Configuration field types for section configuration forms
export type ConfigFieldType = 'number' | 'text' | 'select' | 'multiselect' | 'boolean' | 'range';

export interface ConfigField {
    key: string;
    label: string;
    type: ConfigFieldType;
    unit?: string; // e.g., 'm', 'kg', 'km/h'
    default: unknown;
    min?: number;
    max?: number;
    step?: number;
    options?: string[] | { value: string; label: string }[];
    description?: string;
    required?: boolean; // Field is required
    validationRules?: ValidationRule[]; // Custom validation rules
    dependsOn?: string; // Key of field this depends on
    visibleWhen?: (values: Record<string, unknown>) => boolean; // Conditional visibility

    // Phase 4: UI Enhancements
    tooltip?: string; // Detailed help text
    example?: string; // Example value
    group?: string; // Group/section name for organizing fields
    icon?: string; // Bootstrap icon class (e.g., 'bi-rulers')
}

// Validation rule interface
export interface ValidationRule {
    type: 'required' | 'min' | 'max' | 'range' | 'pattern' | 'custom';
    message: string;
    value?: unknown; // For min/max/pattern
    validator?: (value: unknown, allValues: Record<string, unknown>) => boolean;
}

export interface SectionConfigSchema {
    sectionType: SectionType;
    fields: ConfigField[];
}

// Section-specific configuration values
export interface SectionConfiguration {
    [key: string]: unknown;
}

export interface BridgeRegisterConfig extends SectionConfiguration {
    includeStructureTypes?: string[];
    minVerticalClearance?: number;
    minHorizontalClearance?: number;
    maxLoadCapacity?: number;
    measurementUnit?: 'metric' | 'imperial';
    showLoadRatings?: boolean;
}

export interface ClearanceAnalysisConfig extends SectionConfiguration {
    verticalClearanceThreshold?: number; // Made optional as it might be undefined
    lateralClearanceThreshold?: number;
    toleranceValue?: number;
    measurementUnit?: 'metric' | 'imperial';
}

export interface TransportAssumptionsConfig extends SectionConfiguration {
    vehicleLength?: number;
    vehicleWidth?: number;
    vehicleHeight?: number;
    axleConfiguration?: string;
}

export interface ReportSection {
    id: string; // Unique ID (e.g., UUID)
    type: SectionType;
    title: string; // Display title
    group: SectionGroup;
    required: boolean;
    enabled: boolean;
    status: SectionStatus;
    content: string; // Markdown/HTML content or specialized data structure
    configuration?: SectionConfiguration; // Section-specific settings

    // UX Properties
    isLocked?: boolean; // If true, cannot be disabled/moved outside constraints (handled by logic)
    validationMessage?: string; // Tooltip/Error message
}

export interface ReportModel {
    id: string;
    metadata: ReportMetadata;
    sections: ReportSection[];

    // Helper to maintain order
    sectionOrder: string[]; // Array of Section IDs
    appendices?: Appendix[];
}

export interface Appendix {
    id: string;
    order: number;
    title: string;
    fileId?: string; // If stored in backend/db
    fileName?: string; // For display
    url?: string; // For preview/download
    includeInPdf: boolean;
    includeInToc: boolean;
}

// Configuration for default sections per Report Type
export const REQUIRED_SECTIONS: Record<ReportType, SectionType[]> = {
    'Desktop Route Review': [
        'Cover_Metadata', 'Scope_Of_Work', 'Route_Overview', 'Route_Description',
        'Assumptions_Exclusions', 'Risk_Register', 'Conclusions_Feasibility'
    ],
    'Field Route Survey': [
        'Cover_Metadata', 'Scope_Of_Work', 'Route_Overview', 'Bridge_Structure_Register',
        'Clearance_Analysis', 'Risk_Register', 'Mitigation_Measures', 'Photo_Log', 'Maps_KML'
    ],
    'Transport Feasibility Study': [
        'Executive_Summary', 'Transport_Assumptions', 'Bridge_Structure_Register',
        'Clearance_Analysis', 'Road_Geometry_Turning', 'Pavement_Load_Constraints',
        'Risk_Register', 'Mitigation_Measures', 'Conclusions_Feasibility',
        'Photo_Log', 'Maps_KML', 'Data_Tables_Appendices'
    ],
    'Authority Submission': [
        'Route_Description', 'Route_Overview', 'Clearance_Analysis',
        'Risk_Register', 'Mitigation_Measures', 'Maps_KML'
        // Note: prompt mentioned "Vehicle & Cargo Envelope", "Legal References", "Clearance Tables"
        // I mapped them to closest available or extended types. 
        // "Vehicle & Cargo" -> usually in Transport Assumptions or separate? 
        // For now I'll stick to the 17 Canonical Sections defined in 3.2.
    ]
};

export const SECTION_GROUPS_ORDER: SectionGroup[] = [
    'Front Matter',
    'Commercial / Scope',
    'Route Definition',
    'Technical Analysis',
    'Risk & Conclusions',
    'Appendices'
];

export const ALL_SECTIONS_CONFIG: { type: SectionType; title: string; group: SectionGroup }[] = [
    { type: 'Cover_Metadata', title: 'Cover & Metadata', group: 'Front Matter' },
    { type: 'Executive_Summary', title: 'Executive Summary', group: 'Front Matter' },
    { type: 'Scope_Of_Work', title: 'Scope of Work', group: 'Commercial / Scope' },
    { type: 'Assumptions_Exclusions', title: 'Assumptions & Exclusions', group: 'Commercial / Scope' },
    { type: 'Route_Overview', title: 'Route Overview', group: 'Route Definition' },
    { type: 'Route_Description', title: 'Route Description', group: 'Route Definition' },
    { type: 'Transport_Assumptions', title: 'Transport Assumptions', group: 'Route Definition' },
    { type: 'Bridge_Structure_Register', title: 'Bridge & Structure Register', group: 'Technical Analysis' },
    { type: 'Clearance_Analysis', title: 'Clearance Analysis', group: 'Technical Analysis' },
    { type: 'Road_Geometry_Turning', title: 'Road Geometry & Turning', group: 'Technical Analysis' },
    { type: 'Pavement_Load_Constraints', title: 'Pavement / Load Constraints', group: 'Technical Analysis' },
    { type: 'Risk_Register', title: 'Risk Register', group: 'Risk & Conclusions' },
    { type: 'Mitigation_Measures', title: 'Mitigation Measures', group: 'Risk & Conclusions' },
    { type: 'Conclusions_Feasibility', title: 'Conclusions / Feasibility Statement', group: 'Risk & Conclusions' },
    { type: 'Photo_Log', title: 'Photo Log', group: 'Appendices' },
    { type: 'Maps_KML', title: 'Maps & KML', group: 'Appendices' },
    { type: 'Data_Tables_Appendices', title: 'Data Tables / Appendices', group: 'Appendices' },
];
