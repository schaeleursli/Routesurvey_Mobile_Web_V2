import type { SectionType, SectionConfiguration } from './report';

/**
 * Configuration template for saving and reusing section configurations
 */
export interface ConfigTemplate {
    id: string; // Unique template ID (UUID)
    name: string; // User-friendly name
    description: string; // Template description
    sectionType: SectionType; // Which section type this applies to
    configuration: SectionConfiguration; // The actual config values
    createdAt: Date; // Creation timestamp
    updatedAt: Date; // Last update timestamp
    createdBy?: string; // User ID who created it
    isDefault?: boolean; // System default template
    isShared?: boolean; // Shared with organization
    tags?: string[]; // Categorization tags
}

/**
 * Template creation input
 */
export interface CreateTemplateInput {
    name: string;
    description: string;
    sectionType: SectionType;
    configuration: SectionConfiguration;
    tags?: string[];
}

/**
 * Template update input
 */
export interface UpdateTemplateInput {
    id: string;
    name?: string;
    description?: string;
    configuration?: SectionConfiguration;
    tags?: string[];
}

/**
 * Template filter options
 */
export interface TemplateFilter {
    sectionType?: SectionType;
    tags?: string[];
    isDefault?: boolean;
    isShared?: boolean;
    searchQuery?: string;
}
