/**
 * Unit tests for AxleLoadSheetBlock component
 * 
 * Tests Phase 2.0 axle configuration display and source tracking
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AxleLoadSheetBlock from '../AxleLoadSheetBlock.vue';

describe('AxleLoadSheetBlock', () => {
    describe('No Data State', () => {
        it('should display no-data message when axle config missing', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: {
                    payload: {
                        transport: {}
                    }
                }
            });

            expect(wrapper.find('.no-data-state').exists()).toBe(true);
            expect(wrapper.text()).toContain('No axle configuration data available');
        });

        it('should display no-data message when axle groups empty', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: {
                    payload: {
                        transport: {
                            axleConfig: {
                                groups: []
                            }
                        }
                    }
                }
            });

            expect(wrapper.find('.no-data-state').exists()).toBe(true);
        });
    });

    describe('Axle Sheet Display', () => {
        const axlePayload = {
            transport: {
                axleConfig: {
                    groups: ['Tractor', 'Trailer Front', 'Trailer Rear'],
                    spacings_m: [5.0, 12.0],
                    loads_kg: [15000, 45000, 40000],
                    _meta: {
                        source: 'ENGINEERING',
                        sourceRef: { calcJobId: 'test-123' },
                        updatedAt: '2026-01-27T21:00:00Z'
                    }
                }
            }
        };

        it('should render axle table when data present', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: { payload: axlePayload }
            });

            expect(wrapper.find('.axle-sheet').exists()).toBe(true);
            expect(wrapper.find('.axle-table').exists()).toBe(true);
        });

        it('should display all axle group names', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: { payload: axlePayload }
            });

            expect(wrapper.text()).toContain('Tractor');
            expect(wrapper.text()).toContain('Trailer Front');
            expect(wrapper.text()).toContain('Trailer Rear');
        });

        it('should display correct number of table rows', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: { payload: axlePayload }
            });

            const rows = wrapper.findAll('tbody tr');
            expect(rows.length).toBe(3); // 3 axle groups
        });

        it('should convert spacing to imperial units', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: { payload: axlePayload }
            });

            // 5.0m ≈ 16' 5"
            // 12.0m ≈ 39' 4"
            expect(wrapper.text()).toMatch(/\d+' \d+"/);
        });

        it('should convert loads to pounds', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: { payload: axlePayload }
            });

            // 15000 kg ≈ 33,069 lb
            // 45000 kg ≈ 99,208 lb
            // 40000 kg ≈ 88,185 lb
            expect(wrapper.text()).toContain('lb');
            expect(wrapper.text()).toMatch(/\d{2},\d{3}/); // Formatted with commas
        });

        it('should display total GVW in footer', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: { payload: axlePayload }
            });

            const footer = wrapper.find('tfoot');
            expect(footer.exists()).toBe(true);
            expect(footer.text()).toContain('Total GVW');

            // Total: 100,000 kg ≈ 220,462 lb
            expect(footer.text()).toContain('220');
        });
    });

    describe('Source Badge Display', () => {
        it('should display ENGINEERING badge when source is ENGINEERING', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: {
                    payload: {
                        transport: {
                            axleConfig: {
                                groups: ['Tractor'],
                                spacings_m: [],
                                loads_kg: [15000],
                                _meta: {
                                    source: 'ENGINEERING'
                                }
                            }
                        }
                    }
                }
            });

            const badge = wrapper.find('.source-badge');
            expect(badge.exists()).toBe(true);
            expect(badge.text()).toContain('ENGINEERING');
            expect(badge.classes()).toContain('source-engineering');
        });

        it('should display MANUAL badge when source is MANUAL', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: {
                    payload: {
                        transport: {
                            axleConfig: {
                                groups: ['Tractor'],
                                spacings_m: [],
                                loads_kg: [15000],
                                _meta: {
                                    source: 'MANUAL'
                                }
                            }
                        }
                    }
                }
            });

            const badge = wrapper.find('.source-badge');
            expect(badge.text()).toContain('MANUAL');
            expect(badge.classes()).toContain('source-manual');
        });

        it('should default to MANUAL when _meta missing', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: {
                    payload: {
                        transport: {
                            axleConfig: {
                                groups: ['Tractor'],
                                spacings_m: [],
                                loads_kg: [15000]
                            }
                        }
                    }
                }
            });

            const badge = wrapper.find('.source-badge');
            expect(badge.text()).toContain('MANUAL');
        });
    });

    describe('Manual Override Warning', () => {
        it('should show warning when source is MANUAL', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: {
                    payload: {
                        transport: {
                            axleConfig: {
                                groups: ['Tractor'],
                                spacings_m: [],
                                loads_kg: [15000],
                                _meta: {
                                    source: 'MANUAL'
                                }
                            }
                        }
                    }
                }
            });

            const warning = wrapper.find('.manual-override-warning');
            expect(warning.exists()).toBe(true);
            expect(warning.text()).toContain('manually overridden');
        });

        it('should not show warning when source is ENGINEERING', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: {
                    payload: {
                        transport: {
                            axleConfig: {
                                groups: ['Tractor'],
                                spacings_m: [],
                                loads_kg: [15000],
                                _meta: {
                                    source: 'ENGINEERING'
                                }
                            }
                        }
                    }
                }
            });

            const warning = wrapper.find('.manual-override-warning');
            expect(warning.exists()).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing spacing gracefully', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: {
                    payload: {
                        transport: {
                            axleConfig: {
                                groups: ['Tractor', 'Trailer'],
                                spacings_m: [null],
                                loads_kg: [15000, 45000]
                            }
                        }
                    }
                }
            });

            expect(wrapper.text()).toContain('N/A');
        });

        it('should handle zero loads correctly', () => {
            const wrapper = mount(AxleLoadSheetBlock, {
                props: {
                    payload: {
                        transport: {
                            axleConfig: {
                                groups: ['Tractor'],
                                spacings_m: [],
                                loads_kg: [0]
                            }
                        }
                    }
                }
            });

            expect(wrapper.text()).toContain('0 lb');
        });
    });
});
