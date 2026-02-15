import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type {
    ConfigTemplate,
    CreateTemplateInput,
    UpdateTemplateInput,
    TemplateFilter
} from '@/types/configTemplate';
import type { SectionType } from '@/types/report';

/**
 * Store for managing configuration templates
 */
export const useConfigTemplateStore = defineStore('configTemplate', () => {
    // State
    const templates = ref<ConfigTemplate[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Getters
    const templatesBySectionType = computed(() => {
        return (sectionType: SectionType) => {
            return templates.value.filter(t => t.sectionType === sectionType);
        };
    });

    const defaultTemplates = computed(() => {
        return templates.value.filter(t => t.isDefault);
    });

    const userTemplates = computed(() => {
        return templates.value.filter(t => !t.isDefault);
    });

    // Actions

    /**
     * Initialize store with default templates
     */
    function initializeDefaultTemplates() {
        const defaults: ConfigTemplate[] = [
            {
                id: uuidv4(),
                name: 'Standard Bridge Inspection',
                description: 'Standard clearance thresholds for bridge inspections',
                sectionType: 'Bridge_Structure_Register',
                configuration: {
                    minVerticalClearance: 4.5,
                    maxVerticalClearance: 10.0,
                    minHorizontalClearance: 3.5,
                    maxLoadCapacity: 100,
                    includeStructureTypes: ['Bridge', 'Overpass', 'Underpass'],
                    showLoadRatings: true,
                    measurementUnit: 'metric'
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: true,
                isShared: true,
                tags: ['standard', 'bridges']
            },
            {
                id: uuidv4(),
                name: 'Heavy Transport - Bridges',
                description: 'Conservative settings for heavy/oversized transport',
                sectionType: 'Bridge_Structure_Register',
                configuration: {
                    minVerticalClearance: 5.5,
                    maxVerticalClearance: 15.0,
                    minHorizontalClearance: 4.5,
                    maxLoadCapacity: 200,
                    includeStructureTypes: ['Bridge', 'Overpass', 'Underpass', 'Tunnel'],
                    showLoadRatings: true,
                    measurementUnit: 'metric'
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: true,
                isShared: true,
                tags: ['heavy-transport', 'conservative']
            },
            {
                id: uuidv4(),
                name: 'Standard Clearance Analysis',
                description: 'Balanced thresholds for general clearance analysis',
                sectionType: 'Clearance_Analysis',
                configuration: {
                    verticalClearanceThreshold: 4.5,
                    lateralClearanceThreshold: 3.0,
                    measurementUnit: 'metric',
                    toleranceValue: 0.3,
                    highlightCritical: true
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: true,
                isShared: true,
                tags: ['standard', 'clearance']
            },
            {
                id: uuidv4(),
                name: 'Strict Safety Margins',
                description: 'Conservative clearance analysis with higher safety margins',
                sectionType: 'Clearance_Analysis',
                configuration: {
                    verticalClearanceThreshold: 5.0,
                    lateralClearanceThreshold: 3.5,
                    measurementUnit: 'metric',
                    toleranceValue: 0.5,
                    highlightCritical: true
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: true,
                isShared: true,
                tags: ['conservative', 'safety']
            },
            {
                id: uuidv4(),
                name: 'Compact Photo Layout',
                description: '4 images per row, small thumbnails',
                sectionType: 'Photo_Log',
                configuration: {
                    imageSize: 'small',
                    imagesPerRow: '4',
                    showGPSCoordinates: true,
                    showTimestamp: false
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: true,
                isShared: true,
                tags: ['compact', 'thumbnails']
            },
            {
                id: uuidv4(),
                name: 'Detailed Photo Documentation',
                description: 'Large images with full metadata',
                sectionType: 'Photo_Log',
                configuration: {
                    imageSize: 'large',
                    imagesPerRow: '2',
                    showGPSCoordinates: true,
                    showTimestamp: true
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: true,
                isShared: true,
                tags: ['detailed', 'documentation']
            }
        ];

        templates.value = defaults;
        saveToLocalStorage();
    }

    /**
     * Create a new template
     */
    function createTemplate(input: CreateTemplateInput): ConfigTemplate {
        const template: ConfigTemplate = {
            id: uuidv4(),
            name: input.name,
            description: input.description,
            sectionType: input.sectionType,
            configuration: { ...input.configuration },
            createdAt: new Date(),
            updatedAt: new Date(),
            isDefault: false,
            isShared: false,
            tags: input.tags || []
        };

        templates.value.push(template);
        saveToLocalStorage();
        return template;
    }

    /**
     * Update an existing template
     */
    function updateTemplate(input: UpdateTemplateInput): ConfigTemplate | null {
        const index = templates.value.findIndex(t => t.id === input.id);
        if (index === -1) return null;

        const template = templates.value[index];

        // Don't allow editing default templates
        if (template.isDefault) {
            error.value = 'Cannot edit default templates. Create a new template instead.';
            return null;
        }

        templates.value[index] = {
            ...template,
            name: input.name ?? template.name,
            description: input.description ?? template.description,
            configuration: input.configuration ?? template.configuration,
            tags: input.tags ?? template.tags,
            updatedAt: new Date()
        };

        saveToLocalStorage();
        return templates.value[index];
    }

    /**
     * Delete a template
     */
    function deleteTemplate(id: string): boolean {
        const template = templates.value.find(t => t.id === id);

        if (!template) return false;

        // Don't allow deleting default templates
        if (template.isDefault) {
            error.value = 'Cannot delete default templates.';
            return false;
        }

        templates.value = templates.value.filter(t => t.id !== id);
        saveToLocalStorage();
        return true;
    }

    /**
     * Get a template by ID
     */
    function getTemplate(id: string): ConfigTemplate | null {
        return templates.value.find(t => t.id === id) || null;
    }

    /**
     * Filter templates
     */
    function filterTemplates(filter: TemplateFilter): ConfigTemplate[] {
        let filtered = templates.value;

        if (filter.sectionType) {
            filtered = filtered.filter(t => t.sectionType === filter.sectionType);
        }

        if (filter.isDefault !== undefined) {
            filtered = filtered.filter(t => t.isDefault === filter.isDefault);
        }

        if (filter.isShared !== undefined) {
            filtered = filtered.filter(t => t.isShared === filter.isShared);
        }

        if (filter.tags && filter.tags.length > 0) {
            filtered = filtered.filter(t =>
                t.tags?.some(tag => filter.tags!.includes(tag))
            );
        }

        if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query) ||
                t.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return filtered;
    }

    /**
     * Export templates as JSON
     */
    function exportTemplates(templateIds?: string[]): string {
        const toExport = templateIds
            ? templates.value.filter(t => templateIds.includes(t.id))
            : templates.value.filter(t => !t.isDefault); // Export only user templates by default

        return JSON.stringify(toExport, null, 2);
    }

    /**
     * Import templates from JSON
     */
    function importTemplates(jsonString: string): { success: number; errors: string[] } {
        const errors: string[] = [];
        let success = 0;

        try {
            const imported = JSON.parse(jsonString) as ConfigTemplate[];

            if (!Array.isArray(imported)) {
                throw new Error('Invalid format: expected an array of templates');
            }

            for (const template of imported) {
                try {
                    // Generate new IDs to avoid conflicts
                    const newTemplate: ConfigTemplate = {
                        ...template,
                        id: uuidv4(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isDefault: false // Imported templates are never default
                    };

                    templates.value.push(newTemplate);
                    success++;
                } catch (err) {
                    errors.push(`Failed to import template "${template.name}": ${err}`);
                }
            }

            if (success > 0) {
                saveToLocalStorage();
            }
        } catch (err) {
            errors.push(`Failed to parse JSON: ${err}`);
        }

        return { success, errors };
    }

    /**
     * Duplicate a template
     */
    function duplicateTemplate(id: string): ConfigTemplate | null {
        const original = getTemplate(id);
        if (!original) return null;

        const duplicate: ConfigTemplate = {
            ...original,
            id: uuidv4(),
            name: `${original.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDefault: false
        };

        templates.value.push(duplicate);
        saveToLocalStorage();
        return duplicate;
    }

    // Persistence
    const STORAGE_KEY = 'config_templates';

    function saveToLocalStorage() {
        try {
            // Only save user templates (not defaults)
            const userTemplates = templates.value.filter(t => !t.isDefault);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates));
        } catch (err) {
            console.error('Failed to save templates to localStorage:', err);
        }
    }

    function loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const userTemplates = JSON.parse(stored) as ConfigTemplate[];
                // Merge with default templates
                templates.value = [
                    ...templates.value.filter(t => t.isDefault),
                    ...userTemplates
                ];
            }
        } catch (err) {
            console.error('Failed to load templates from localStorage:', err);
        }
    }

    // Initialize
    initializeDefaultTemplates();
    loadFromLocalStorage();

    return {
        // State
        templates,
        isLoading,
        error,

        // Getters
        templatesBySectionType,
        defaultTemplates,
        userTemplates,

        // Actions
        createTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplate,
        filterTemplates,
        exportTemplates,
        importTemplates,
        duplicateTemplate
    };
});
