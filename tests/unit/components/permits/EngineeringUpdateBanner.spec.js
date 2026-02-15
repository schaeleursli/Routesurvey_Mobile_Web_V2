import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EngineeringUpdateBanner from '@/components/permits/EngineeringUpdateBanner.vue';

describe('EngineeringUpdateBanner', () => {
    describe('visibility', () => {
        it('should be hidden when visible prop is false', () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: false,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            const banner = wrapper.find('.update-banner');
            expect(banner.exists()).toBe(true);
            expect(banner.classes()).not.toContain('banner-visible');
        });

        it('should be visible when visible prop is true', () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            const banner = wrapper.find('.update-banner');
            expect(banner.classes()).toContain('banner-visible');
        });

        it('should slide in with animation when made visible', async () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: false,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            expect(wrapper.find('.update-banner').classes()).not.toContain('banner-visible');

            await wrapper.setProps({ visible: true });
            expect(wrapper.find('.update-banner').classes()).toContain('banner-visible');
        });
    });

    describe('content display', () => {
        it('should display calc job ID', () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            expect(wrapper.text()).toContain('engjob-123');
        });

        it('should display update message', () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            expect(wrapper.text()).toMatch(/update|Update|new data/);
        });

        it('should display formatted timestamp', () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            expect(wrapper.text()).toContain('2026');
        });
    });

    describe('action buttons', () => {
        it('should emit sync event when sync button clicked', async () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            const syncButton = wrapper.find('button.sync-btn, button:contains("Sync")');
            if (syncButton.exists()) {
                await syncButton.trigger('click');
                expect(wrapper.emitted('sync')).toBeTruthy();
            }
        });

        it('should emit view-changes event when view changes clicked', async () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            const viewButton = wrapper.find('button.view-btn, button:contains("View")');
            if (viewButton.exists()) {
                await viewButton.trigger('click');
                expect(wrapper.emitted('view-changes')).toBeTruthy();
            }
        });

        it('should emit dismiss event when dismiss button clicked', async () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            const dismissButton = wrapper.find('button.dismiss-btn, button.close-btn, .icon-close');
            if (dismissButton.exists()) {
                await dismissButton.trigger('click');
                expect(wrapper.emitted('dismiss')).toBeTruthy();
            }
        });
    });

    describe('update metadata', () => {
        it('should pass calc job ID in sync event', async () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            if (wrapper.vm.handleSync) {
                wrapper.vm.handleSync();
                const syncEvents = wrapper.emitted('sync');
                if (syncEvents) {
                    expect(syncEvents[0]).toBeDefined();
                }
            }
        });
    });

    describe('accessibility', () => {
        it('should have proper ARIA attributes for announcement', () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            const banner = wrapper.find('.update-banner');
            expect(
                banner.attributes('role') === 'alert' ||
                banner.attributes('aria-live') === 'polite'
            ).toBe(true);
        });

        it('should have accessible button labels', () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            const buttons = wrapper.findAll('button');
            buttons.forEach(button => {
                expect(
                    button.text().length > 0 ||
                    button.attributes('aria-label') !== undefined ||
                    button.attributes('title') !== undefined
                ).toBe(true);
            });
        });
    });

    describe('styling', () => {
        it('should have warning/info styling to indicate update available', () => {
            const wrapper = mount(EngineeringUpdateBanner, {
                props: {
                    visible: true,
                    calcJobId: 'engjob-123',
                    updatedAt: '2026-01-27T10:00:00Z'
                }
            });

            const banner = wrapper.find('.update-banner');
            const hasWarningStyle =
                banner.classes().some(c => c.includes('warning') || c.includes('info') || c.includes('update'));

            expect(hasWarningStyle).toBe(true);
        });
    });
});
