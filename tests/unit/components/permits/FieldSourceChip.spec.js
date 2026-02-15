import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FieldSourceChip from '@/components/permits/FieldSourceChip.vue';

describe('FieldSourceChip', () => {
    describe('rendering', () => {
        it('should render ENGINEERING source chip with blue styling', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: {
                        source: 'ENGINEERING',
                        calcJobId: 'engjob-123',
                        syncedAt: '2026-01-27T10:00:00Z'
                    }
                }
            });

            expect(wrapper.find('.source-chip').exists()).toBe(true);
            expect(wrapper.find('.source-engineering').exists()).toBe(true);
            expect(wrapper.text()).toContain('Eng');
        });

        it('should render MANUAL source chip with purple styling', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: {
                        source: 'MANUAL',
                        syncedAt: '2026-01-27T10:00:00Z'
                    }
                }
            });

            expect(wrapper.find('.source-chip').exists()).toBe(true);
            expect(wrapper.find('.source-manual').exists()).toBe(true);
            expect(wrapper.text()).toContain('Manual');
        });

        it('should render with default MANUAL when meta is null', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: null
                }
            });

            expect(wrapper.find('.source-chip').exists()).toBe(true);
            expect(wrapper.find('.source-manual').exists()).toBe(true);
            expect(wrapper.text()).toContain('Manual');
        });

        it('should default to MANUAL when source is missing', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: {
                        syncedAt: '2026-01-27T10:00:00Z'
                    }
                }
            });

            expect(wrapper.find('.source-chip').exists()).toBe(true);
            expect(wrapper.find('.source-manual').exists()).toBe(true);
        });
    });

    describe('tooltip', () => {
        it('should show calc job ID in tooltip for ENGINEERING source', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: {
                        source: 'ENGINEERING',
                        calcJobId: 'engjob-123-456',
                        syncedAt: '2026-01-27T10:00:00Z'
                    }
                }
            });

            const chip = wrapper.find('.source-chip');
            const title = chip.attributes('title'); expect(title).toContain('ENGINEERING');
            expect(title).toContain('engjob-1'); // Substring first 8 chars = engjob-1
        });

        it('should show sync timestamp in tooltip', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: {
                        source: 'ENGINEERING',
                        calcJobId: 'engjob-123',
                        syncedAt: '2026-01-27T10:00:00Z'
                    }
                }
            });

            const chip = wrapper.find('.source-chip');
            expect(chip.attributes('title')).toContain('Synced');
        });

        it('should show basic source for MANUAL without extra data', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: {
                        source: 'MANUAL'
                    }
                }
            });

            const chip = wrapper.find('.source-chip');
            expect(chip.attributes('title')).toContain('MANUAL');
        });

        it('should show Manual input for null meta', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: null
                }
            });

            const chip = wrapper.find('.source-chip');
            expect(chip.attributes('title')).toBe('Manual input');
        });
    });

    describe('icon display', () => {
        it('should show CPU icon for ENGINEERING', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: { source: 'ENGINEERING' }
                }
            });

            expect(wrapper.find('.bi-cpu').exists()).toBe(true);
        });

        it('should show pencil icon for MANUAL', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: { source: 'MANUAL' }
                }
            });

            expect(wrapper.find('.bi-pencil').exists()).toBe(true);
        });

        it('should show calculator icon for CALCULATED', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: { source: 'CALCULATED' }
                }
            });

            expect(wrapper.find('.bi-calculator').exists()).toBe(true);
        });
    });

    describe('label text', () => {
        it('should display "Eng" for ENGINEERING', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: { source: 'ENGINEERING' }
                }
            });

            expect(wrapper.find('.source-label').text()).toBe('Eng');
        });

        it('should display "Manual" for MANUAL', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: { source: 'MANUAL' }
                }
            });

            expect(wrapper.find('.source-label').text()).toBe('Manual');
        });

        it('should display "Calc" for CALCULATED', () => {
            const wrapper = mount(FieldSourceChip, {
                props: {
                    meta: { source: 'CALCULATED' }
                }
            });

            expect(wrapper.find('.source-label').text()).toBe('Calc');
        });
    });
});
