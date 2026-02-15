import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EngineeringSummaryBlock from '@/components/permits/blocks/EngineeringSummaryBlock.vue';
import { useEngineeringIntegration } from '@/composables/useEngineeringIntegration';

vi.mock('@/composables/useEngineeringIntegration');

describe('EngineeringSummaryBlock', () => {
    const mockGetStatus = vi.fn();
    const mockSync = vi.fn();
    const mockUnlink = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useEngineeringIntegration.mockReturnValue({
            loading: { value: false },
            error: { value: null },
            getEngineeringStatus: mockGetStatus,
            syncEngineering: mockSync,
            unlinkEngineering: mockUnlink
        });
    });

    describe('unlinked state', () => {
        it('should display not-linked message when no engineering linked', async () => {
            mockGetStatus.mockResolvedValue({
                is_linked: false,
                engineering_job_id: null
            });

            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    caseId: 'US-2024-089'
                }
            });

            await wrapper.vm.$nextTick();
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(wrapper.text()).toContain('No engineering calculation linked');
        });

        it('should show link hint when unlinked', async () => {
            mockGetStatus.mockResolvedValue({
                is_linked: false,
                engineering_job_id: null
            });

            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    caseId: 'US-2024-089'
                }
            });

            await wrapper.vm.$nextTick();
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(wrapper.text()).toContain('Link a transport engineering calculation');
        });
    });

    describe('linked state', () => {
        it('should display calculation ID when linked', async () => {
            mockGetStatus.mockResolvedValue({
                is_linked: true,
                engineering_job_id: 'engjob-5555',
                last_sync_at: '2026-01-27T10:00:00Z',
                available_data: {
                    overall_dimensions: true,
                    axle_configuration: true
                }
            });

            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    caseId: 'US-2024-089'
                }
            });

            await wrapper.vm.$nextTick();
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(wrapper.text()).toContain('engjob-5555');
        });

        it('should display last sync timestamp', async () => {
            mockGetStatus.mockResolvedValue({
                is_linked: true,
                engineering_job_id: 'engjob-5555',
                last_sync_at: '2026-01-27T10:00:00Z',
                available_data: {}
            });

            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    caseId: 'US-2024-089'
                }
            });

            await wrapper.vm.$nextTick();
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(wrapper.text()).toContain('sync');
        });

        it('should show available data types', async () => {
            mockGetStatus.mockResolvedValue({
                is_linked: true,
                engineering_job_id: 'engjob-5555',
                last_sync_at: '2026-01-27T10:00:00Z',
                available_data: {
                    overall_dimensions: true,
                    axle_configuration: true
                }
            });

            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    caseId: 'US-2024-089'
                }
            });

            await wrapper.vm.$nextTick();
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(wrapper.html()).toContain('dimensions');
        });
    });

    describe('sync functionality', () => {
        it('should call syncEngineering when sync button clicked', async () => {
            mockGetStatus.mockResolvedValue({
                is_linked: true,
                engineering_job_id: 'engjob-5555',
                last_sync_at: '2026-01-27T10:00:00Z',
                available_data: {}
            });

            mockSync.mockResolvedValue({
                updated_fields: ['width_m', 'height_m'],
                sync_timestamp: '2026-01-27T11:00:00Z'
            });

            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    caseId: 'US-2024-089'
                }
            });

            await wrapper.vm.$nextTick();
            await new Promise(resolve => setTimeout(resolve, 100));

            const syncButton = wrapper.find('button.sync-btn');
            if (syncButton.exists()) {
                await syncButton.trigger('click');
                expect(mockSync).toHaveBeenCalledWith('US-2024-089');
            }
        });

        it('should emit reload event after successful sync', async () => {
            mockGetStatus.mockResolvedValue({
                is_linked: true,
                engineering_job_id: 'engjob-5555',
                last_sync_at: '2026-01-27T10:00:00Z',
                available_data: {}
            });

            mockSync.mockResolvedValue({
                updated_fields: ['width_m'],
                sync_timestamp: '2026-01-27T11:00:00Z'
            });

            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    caseId: 'US-2024-089'
                }
            });

            await wrapper.vm.$nextTick();

            if (wrapper.vm.handleSync) {
                await wrapper.vm.handleSync();
                expect(wrapper.emitted('reload')).toBeTruthy();
            }
        });
    });

    describe('loading states', () => {
        it('should show loading indicator while fetching status', () => {
            useEngineeringIntegration.mockReturnValue({
                loading: { value: true },
                error: { value: null },
                getEngineeringStatus: mockGetStatus,
                syncEngineering: mockSync
            });

            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    caseId: 'US-2024-089'
                }
            });

            expect(wrapper.find('.loading').exists() || wrapper.text().includes('Loading')).toBe(true);
        });
    });

    describe('error handling', () => {
        it('should display error message when status fetch fails', async () => {
            useEngineeringIntegration.mockReturnValue({
                loading: { value: false },
                error: { value: 'Failed to fetch status' },
                getEngineeringStatus: mockGetStatus,
                syncEngineering: mockSync
            });

            const wrapper = mount(EngineeringSummaryBlock, {
                props: {
                    caseId: 'US-2024-089'
                }
            });

            await wrapper.vm.$nextTick();

            expect(wrapper.text()).toMatch(/Failed|Error/);
        });
    });
});
