/**
 * Unit tests for EngineeringSummaryBlock component
 * 
 * Tests Phase 2.0 engineering integration display and sync functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EngineeringSummaryBlock from '@/components/permits/blocks/EngineeringSummaryBlock.vue';

describe('EngineeringSummaryBlock', () => {
    describe('Not Linked State', () => {
        it('should display not-linked message when no engineering data', () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    payload: {
                        transport: {
                            overall: {}
                        }
                    }
                }
            });

            expect(wrapper.find('.not-linked-state').exists()).toBe(true);
            expect(wrapper.text()).toContain('No engineering calculation linked');
        });

        it('should display not-linked when source is MANUAL', () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    payload: {
                        transport: {
                            overall: {
                                _meta: {
                                    source: 'MANUAL'
                                }
                            }
                        }
                    }
                }
            });

            expect(wrapper.find('.not-linked-state').exists()).toBe(true);
        });
    });

    describe('Linked State', () => {
        const linkedPayload = {
            transport: {
                overall: {
                    width_m: 5.9,
                    height_m: 5.76,
                    length_m: 30.48,
                    gross_kg: 199580,
                    _meta: {
                        source: 'ENGINEERING',
                        sourceRef: {
                            calcJobId: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        updatedAt: '2026-01-27T21:00:00Z'
                    }
                },
                axleConfig: {
                    groups: ['Tractor', 'Trailer Front', 'Trailer Rear'],
                    loads_kg: [15000, 45000, 40000]
                }
            }
        };

        it('should display linked state when engineering data present', () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: { payload: linkedPayload }
            });

            expect(wrapper.find('.linked-state').exists()).toBe(true);
            expect(wrapper.find('.not-linked-state').exists()).toBe(false);
        });

        it('should display truncated job ID', () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: { payload: linkedPayload }
            });

            const jobIdText = wrapper.find('.value.mono').text();
            expect(jobIdText).toContain('550e8400');
        });

        it('should convert dimensions to imperial units correctly', () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: { payload: linkedPayload }
            });

            // 5.9m = ~19' 4"
            // 5.76m = ~18' 11"
            // 30.48m = 100' 0"
            const dimValues = wrapper.findAll('.dim-value');

            expect(dimValues.length).toBeGreaterThan(0);
            // Check that imperial formatting is present
            expect(wrapper.text()).toMatch(/\d+'-\d+"/);
        });

        it('should convert weight to pounds correctly', () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: { payload: linkedPayload }
            });

            // 199580 kg ≈ 440,000 lb (displays as 439,998 due to rounding)
            expect(wrapper.text()).toContain('439,998');
            expect(wrapper.text()).toContain('lb');
        });

        it('should display axle count when axle config present', () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: { payload: linkedPayload }
            });

            expect(wrapper.text()).toContain('3 axle groups');
        });

        it('should display sync button', () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: { payload: linkedPayload }
            });

            const syncButton = wrapper.find('.btn-sync');
            expect(syncButton.exists()).toBe(true);
            expect(syncButton.text()).toContain('Sync Data');
        });

        it('should emit sync event when sync button clicked', async () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: { payload: linkedPayload }
            });

            const syncButton = wrapper.find('.btn-sync');
            await syncButton.trigger('click');

            expect(wrapper.emitted('sync')).toBeTruthy();
        });

        it('should show loading state when syncing', async () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: { payload: linkedPayload }
            });

            const syncButton = wrapper.find('.btn-sync');
            await syncButton.trigger('click');

            // Button should show syncing state
            expect(syncButton.text()).toContain('Syncing');
            expect(syncButton.element.disabled).toBe(true);
        });
    });

    describe('Imperial Unit Conversion', () => {
        it('should convert meters to feet and inches correctly', () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    payload: {
                        transport: {
                            overall: {
                                width_m: 3.048,  // Exactly 10 feet
                                _meta: {
                                    source: 'ENGINEERING',
                                    sourceRef: { calcJobId: 'test' }
                                }
                            }
                        }
                    }
                }
            });

            // Should show 10'-0"
            expect(wrapper.text()).toMatch(/10'-0"/);
        });

        it('should handle null/undefined dimensions gracefully', () => {
            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    payload: {
                        transport: {
                            overall: {
                                width_m: null,
                                _meta: {
                                    source: 'ENGINEERING',
                                    sourceRef: { calcJobId: 'test' }
                                }
                            }
                        }
                    }
                }
            });

            expect(wrapper.text()).toContain('N/A');
        });
    });
});
