import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useConfigTemplateStore } from '@/stores/configTemplateStore';
import type { CreateTemplateInput } from '@/types/configTemplate';

describe('configTemplateStore', () => {
    beforeEach(() => {
        // Create a fresh pinia instance for each test
        setActivePinia(createPinia());

        // Mock localStorage properly
        const localStorageMock = {
            store: {} as Record<string, string>,
            clear() {
                this.store = {};
            },
            getItem(key: string) {
                return this.store[key] || null;
            },
            setItem(key: string, value: string) {
                this.store[key] = value;
            },
            removeItem(key: string) {
                delete this.store[key];
            }
        };
        vi.stubGlobal('localStorage', localStorageMock);
        localStorageMock.clear();
    });

    describe('initialization', () => {
        it('should initialize with default templates', () => {
            const store = useConfigTemplateStore();

            expect(store.templates.length).toBeGreaterThan(0);
            expect(store.defaultTemplates.length).toBeGreaterThan(0);
        });

        it('should have 6 default templates', () => {
            const store = useConfigTemplateStore();

            expect(store.defaultTemplates.length).toBe(6);
        });

        it('should initialize with no user templates', () => {
            const store = useConfigTemplateStore();

            expect(store.userTemplates.length).toBe(0);
        });
    });

    describe('createTemplate', () => {
        it('should create a new user template', () => {
            const store = useConfigTemplateStore();
            const initialCount = store.templates.length;

            const input: CreateTemplateInput = {
                name: 'Test Template',
                description: 'Test description',
                sectionType: 'Bridge_Structure_Register',
                configuration: {
                    minVerticalClearance: 5.0,
                    showLoadRatings: true
                },
                tags: ['test']
            };

            const template = store.createTemplate(input);

            expect(template).toBeDefined();
            expect(template.id).toBeTruthy();
            expect(template.name).toBe('Test Template');
            expect(template.isDefault).toBe(false);
            expect(store.templates.length).toBe(initialCount + 1);
        });

        it('should assign unique IDs to templates', () => {
            const store = useConfigTemplateStore();

            const template1 = store.createTemplate({
                name: 'Template 1',
                description: 'Desc 1',
                sectionType: 'Bridge_Structure_Register',
                configuration: {}
            });

            const template2 = store.createTemplate({
                name: 'Template 2',
                description: 'Desc 2',
                sectionType: 'Clearance_Analysis',
                configuration: {}
            });

            expect(template1.id).not.toBe(template2.id);
        });

        it('should save to localStorage after creation', () => {
            const store = useConfigTemplateStore();

            store.createTemplate({
                name: 'Test',
                description: 'Test',
                sectionType: 'Photo_Log',
                configuration: {}
            });

            const stored = localStorage.getItem('config_templates');
            expect(stored).toBeTruthy();

            const parsed = JSON.parse(stored!);
            expect(parsed).toBeInstanceOf(Array);
            expect(parsed.length).toBe(1);
        });
    });

    describe('updateTemplate', () => {
        it('should update existing user template', () => {
            const store = useConfigTemplateStore();

            const template = store.createTemplate({
                name: 'Original Name',
                description: 'Original Desc',
                sectionType: 'Bridge_Structure_Register',
                configuration: {}
            });

            const updated = store.updateTemplate({
                id: template.id,
                name: 'Updated Name',
                description: 'Updated Desc'
            });

            expect(updated).toBeDefined();
            expect(updated!.name).toBe('Updated Name');
            expect(updated!.description).toBe('Updated Desc');
        });

        it('should not update default templates', () => {
            const store = useConfigTemplateStore();
            const defaultTemplate = store.defaultTemplates[0];

            const result = store.updateTemplate({
                id: defaultTemplate.id,
                name: 'Hacked Name'
            });

            expect(result).toBeNull();
            expect(store.error).toContain('Cannot edit default templates');
        });

        it('should update updatedAt timestamp', () => {
            vi.useFakeTimers();
            const store = useConfigTemplateStore();

            const template = store.createTemplate({
                name: 'Test',
                description: 'Test',
                sectionType: 'Photo_Log',
                configuration: {}
            });

            const originalTime = template.updatedAt;

            // Advance time
            vi.advanceTimersByTime(1000);

            const updated = store.updateTemplate({
                id: template.id,
                name: 'Updated'
            });

            expect(updated!.updatedAt).not.toBe(originalTime);

            vi.useRealTimers();
        });
    });

    describe('deleteTemplate', () => {
        it('should delete user template', () => {
            const store = useConfigTemplateStore();

            const template = store.createTemplate({
                name: 'To Delete',
                description: 'Will be deleted',
                sectionType: 'Photo_Log',
                configuration: {}
            });

            const initialCount = store.templates.length;
            const success = store.deleteTemplate(template.id);

            expect(success).toBe(true);
            expect(store.templates.length).toBe(initialCount - 1);
            expect(store.getTemplate(template.id)).toBeNull();
        });

        it('should not delete default templates', () => {
            const store = useConfigTemplateStore();
            const defaultTemplate = store.defaultTemplates[0];

            const success = store.deleteTemplate(defaultTemplate.id);

            expect(success).toBe(false);
            expect(store.error).toContain('Cannot delete default templates');
            expect(store.getTemplate(defaultTemplate.id)).toBeDefined();
        });

        it('should return false for non-existent ID', () => {
            const store = useConfigTemplateStore();

            const success = store.deleteTemplate('non-existent-id');
            expect(success).toBe(false);
        });
    });

    describe('filterTemplates', () => {
        beforeEach(() => {
            const store = useConfigTemplateStore();

            // Create some test templates
            store.createTemplate({
                name: 'Bridge Test',
                description: 'For bridges',
                sectionType: 'Bridge_Structure_Register',
                configuration: {},
                tags: ['bridge', 'test']
            });

            store.createTemplate({
                name: 'Clearance Test',
                description: 'For clearances',
                sectionType: 'Clearance_Analysis',
                configuration: {},
                tags: ['clearance', 'test']
            });
        });

        it('should filter by section type', () => {
            const store = useConfigTemplateStore();

            const bridgeTemplates = store.filterTemplates({
                sectionType: 'Bridge_Structure_Register'
            });

            expect(bridgeTemplates.length).toBeGreaterThan(0);
            bridgeTemplates.forEach(t => {
                expect(t.sectionType).toBe('Bridge_Structure_Register');
            });
        });

        it('should filter by tags', () => {
            const store = useConfigTemplateStore();

            const testTemplates = store.filterTemplates({
                tags: ['test']
            });

            expect(testTemplates.length).toBe(2);
        });

        it('should filter by search query', () => {
            const store = useConfigTemplateStore();

            const results = store.filterTemplates({
                searchQuery: 'bridge'
            });

            expect(results.length).toBeGreaterThan(0);
            const hasMatch = results.some(t =>
                t.name.toLowerCase().includes('bridge') ||
                t.description.toLowerCase().includes('bridge')
            );
            expect(hasMatch).toBe(true);
        });

        it('should filter by isDefault', () => {
            const store = useConfigTemplateStore();

            const defaults = store.filterTemplates({ isDefault: true });
            const users = store.filterTemplates({ isDefault: false });

            expect(defaults.length).toBe(6);
            expect(users.length).toBe(2);
        });
    });

    describe('importTemplates', () => {
        it('should import valid JSON', () => {
            const store = useConfigTemplateStore();

            const jsonData = JSON.stringify([
                {
                    name: 'Imported Template',
                    description: 'From JSON',
                    sectionType: 'Photo_Log',
                    configuration: { imageSize: 'large' },
                    tags: ['imported']
                }
            ]);

            const result = store.importTemplates(jsonData);

            expect(result.success).toBe(1);
            expect(result.errors).toHaveLength(0);

            const imported = store.templates.find(t => t.name === 'Imported Template');
            expect(imported).toBeDefined();
            expect(imported!.isDefault).toBe(false);
        });

        it('should assign new IDs on import', () => {
            const store = useConfigTemplateStore();

            const originalId = 'original-uuid';
            const jsonData = JSON.stringify([
                {
                    id: originalId,
                    name: 'Test',
                    description: 'Test',
                    sectionType: 'Photo_Log',
                    configuration: {}
                }
            ]);

            store.importTemplates(jsonData);

            const imported = store.templates.find(t => t.name === 'Test');
            expect(imported).toBeDefined();
            expect(imported!.id).not.toBe(originalId);
        });

        it('should handle invalid JSON', () => {
            const store = useConfigTemplateStore();

            const result = store.importTemplates('invalid json{{{');

            expect(result.success).toBe(0);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('exportTemplates', () => {
        it('should export user templates only by default', () => {
            const store = useConfigTemplateStore();

            store.createTemplate({
                name: 'User Template',
                description: 'User made',
                sectionType: 'Photo_Log',
                configuration: {}
            });

            const exported = store.exportTemplates();
            const parsed = JSON.parse(exported);

            expect(parsed).toBeInstanceOf(Array);
            expect(parsed.length).toBe(1);
            expect(parsed[0].name).toBe('User Template');

            // Should not include defaults
            const hasDefault = parsed.some((t: { isDefault: boolean }) => t.isDefault);
            expect(hasDefault).toBe(false);
        });

        it('should export specific templates by ID', () => {
            const store = useConfigTemplateStore();

            const t1 = store.createTemplate({
                name: 'Template 1',
                description: 'Desc 1',
                sectionType: 'Photo_Log',
                configuration: {}
            });

            const t2 = store.createTemplate({
                name: 'Template 2',
                description: 'Desc 2',
                sectionType: 'Photo_Log',
                configuration: {}
            });

            const exported = store.exportTemplates([t1.id]);
            const parsed = JSON.parse(exported);

            expect(parsed.length).toBe(1);
            expect(parsed[0].id).toBe(t1.id);
        });
    });

    describe('duplicateTemplate', () => {
        it('should create copy of template', () => {
            const store = useConfigTemplateStore();
            const original = store.defaultTemplates[0];

            const duplicate = store.duplicateTemplate(original.id);

            expect(duplicate).toBeDefined();
            expect(duplicate!.id).not.toBe(original.id);
            expect(duplicate!.name).toBe(`${original.name} (Copy)`);
            expect(duplicate!.configuration).toEqual(original.configuration);
            expect(duplicate!.isDefault).toBe(false);
        });
    });

    describe('templatesBySectionType getter', () => {
        it('should return templates for specific section', () => {
            const store = useConfigTemplateStore();

            const bridgeTemplates = store.templatesBySectionType('Bridge_Structure_Register');

            expect(bridgeTemplates.length).toBeGreaterThan(0);
            bridgeTemplates.forEach(t => {
                expect(t.sectionType).toBe('Bridge_Structure_Register');
            });
        });
    });
});
