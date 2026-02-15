import { setActivePinia, createPinia } from 'pinia';
import { usePlanningStore } from '@/stores/planning';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PlannedRoutesController from '@/controllers/planned_routes/planned_routes_controller';

// Mock the controller
vi.mock('@/controllers/planned_routes/planned_routes_controller', () => ({
    default: {
        addPlannedRoute: vi.fn()
    }
}));

describe('Planning Store - Backend Integration', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        // Mock localStorage
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
    });

    it('savePlan formats payload and calls controller', async () => {
        const store = usePlanningStore();

        // Setup state
        store.loadMockData(); // Pre-fill with known mock data

        // Mock success response
        PlannedRoutesController.addPlannedRoute.mockResolvedValue({
            result: true,
            message: 'Success',
            data: { id: 123 }
        });

        const result = await store.savePlan();

        expect(result.result).toBe(true);
        expect(PlannedRoutesController.addPlannedRoute).toHaveBeenCalledTimes(1);

        // Verify payload structure
        const callArg = PlannedRoutesController.addPlannedRoute.mock.calls[0][0];
        expect(callArg).toHaveProperty('SurveyName');
        expect(callArg).toHaveProperty('ClientName', 'MegaCorp Engineering');
        expect(callArg).toHaveProperty('CargoWeight', 68000);
        expect(callArg).toHaveProperty('RouteData');
        expect(callArg).toHaveProperty('Distance');
    });

    it('savePlan handles controller failure', async () => {
        const store = usePlanningStore();

        // Mock error response
        PlannedRoutesController.addPlannedRoute.mockRejectedValue(new Error('API Error'));

        const result = await store.savePlan();

        expect(result.result).toBe(false);
        expect(result.message).toBe('API Error');
    });
});
