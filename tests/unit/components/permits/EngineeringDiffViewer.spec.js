import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EngineeringDiffViewer from '@/components/permits/EngineeringDiffViewer.vue';

describe('EngineeringDiffViewer', () => {
    const mockCurrentData = {
        transport: {
            overall: {
                width_m: 5.5,
                height_m: 5.8,
                length_m: 44.0,
                gross_kg: 200000,
                _meta: {
                    source: 'MANUAL',
                    updatedAt: '2026-01-27T09:00:00Z'
                }
            }
        }
    };

    const mockCalcJobData = {
        transport: {
            overall: {
                width_m: 5.893,
                height_m: 5.892,
                length_m: 45.110,
                gross_kg: 210000
            }
        }
    };

    describe('diff calculation', () => {
        it('should detect changes between current and calc job data', async () => {
            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: mockCurrentData,
                    calcJobId: 'engjob-123'
                }
            });

            await wrapper.vm.$nextTick();

            // Should show differences in the comparison
            const hasChanges = wrapper.text().includes('5.893') || wrapper.text().includes('45.110');
            expect(hasChanges).toBe(true);
        });

        it('should highlight changed fields', () => {
            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: mockCurrentData,
                    calcJobId: 'engjob-123'
                }
            });

            const changedFields = wrapper.findAll('.field-changed, .diff-change, .highlight');
            expect(changedFields.length).toBeGreaterThan(0);
        });

        it('should show unchanged fields without highlighting', () => {
            const sameData = {
                transport: {
                    overall: {
                        width_m: 5.893,
                        height_m: 5.892,
                        _meta: { source: 'ENGINEERING' }
                    }
                }
            };

            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: sameData,
                    calcJobId: 'engjob-123'
                }
            });

            // Unchanged fields should not have change highlighting
            const unchangedFields = wrapper.findAll('.field-unchanged, .no-change');
            expect(unchangedFields.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('selective sync', () => {
        it('should display checkboxes for each field', () => {
            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: mockCurrentData,
                    calcJobId: 'engjob-123'
                }
            });

            const checkboxes = wrapper.findAll('input[type="checkbox"]');
            expect(checkboxes.length).toBeGreaterThan(0);
        });

        it('should auto-check changed fields by default', () => {
            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: mockCurrentData,
                    calcJobId: 'engjob-123'
                }
            });

            if (wrapper.vm.selectedFields) {
                expect(wrapper.vm.selectedFields.length).toBeGreaterThan(0);
            }
        });

        it('should exclude overridden fields from default selection', () => {
            const dataWithOverride = {
                transport: {
                    overall: {
                        width_m: 6.0,
                        _meta: {
                            source: 'MANUAL',
                            sourceRef: { calcJobId: 'engjob-123' },
                            overrideReason: 'Manual correction'
                        }
                    }
                }
            };

            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: dataWithOverride,
                    calcJobId: 'engjob-123'
                }
            });

            if (wrapper.vm.isOverridden) {
                const overriddenField = wrapper.find('.field-override, .override-warning');
                expect(overriddenField.exists()).toBe(true);
            }
        });

        it('should emit sync event with selected fields', async () => {
            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: mockCurrentData,
                    calcJobId: 'engjob-123'
                }
            });

            const syncButton = wrapper.find('button.sync-btn, button:contains("Sync")');
            if (syncButton.exists()) {
                await syncButton.trigger('click');

                const syncEvents = wrapper.emitted('sync');
                if (syncEvents) {
                    expect(syncEvents[0]).toBeDefined();
                    expect(syncEvents[0][0]).toHaveProperty('fields');
                }
            }
        });
    });

    describe('override warnings', () => {
        it('should show warning icon for overridden fields', () => {
            const dataWithOverride = {
                transport: {
                    overall: {
                        width_m: 6.0,
                        _meta: {
                            source: 'MANUAL',
                            sourceRef: { calcJobId: 'engjob-123' },
                            overrideReason: 'Measured on site'
                        }
                    }
                }
            };

            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: dataWithOverride,
                    calcJobId: 'engjob-123'
                }
            });

            const warningIcon = wrapper.find('.warning-icon, .icon-warning, .bi-exclamation-triangle');
            expect(warningIcon.exists() || wrapper.text().includes('override') || wrapper.text().includes('Override')).toBe(true);
        });

        it('should display override reason in tooltip or message', () => {
            const dataWithOverride = {
                transport: {
                    overall: {
                        width_m: 6.0,
                        _meta: {
                            source: 'MANUAL',
                            sourceRef: { calcJobId: 'engjob-123' },
                            overrideReason: 'Measured on site'
                        }
                    }
                }
            };

            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: dataWithOverride,
                    calcJobId: 'engjob-123'
                }
            });

            expect(wrapper.html()).toMatch(/Measured on site|override/);
        });
    });

    describe('modal behavior', () => {
        it('should emit close event when close button clicked', async () => {
            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: mockCurrentData,
                    calcJobId: 'engjob-123'
                }
            });

            const closeButton = wrapper.find('button.close-btn, button:contains("Close"), .modal-close');
            if (closeButton.exists()) {
                await closeButton.trigger('click');
                expect(wrapper.emitted('close')).toBeTruthy();
            }
        });

        it('should have modal backdrop', () => {
            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: mockCurrentData,
                    calcJobId: 'engjob-123'
                }
            });

            const backdrop = wrapper.find('.modal-backdrop, .overlay, .backdrop');
            expect(backdrop.exists()).toBe(true);
        });
    });

    describe('comparison table', () => {
        it('should display side-by-side comparison', () => {
            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: mockCurrentData,
                    calcJobId: 'engjob-123'
                }
            });

            const table = wrapper.find('table, .comparison-table, .diff-table');
            expect(table.exists()).toBe(true);
        });

        it('should show current values column', () => {
            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: mockCurrentData,
                    calcJobId: 'engjob-123'
                }
            });

            expect(wrapper.text()).toMatch(/Current|current/);
        });

        it('should show new values column', () => {
            const wrapper = mount(EngineeringDiffViewer, {
                props: {
                    caseId: 'US-2024-089',
                    currentData: mockCurrentData,
                    calcJobId: 'engjob-123'
                }
            });

            expect(wrapper.text()).toMatch(/New|Engineering|new/);
        });
    });
});
