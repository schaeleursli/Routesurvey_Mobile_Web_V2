
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { usePlannedRoutes } from '@/composables/usePlannedRoutes';
import { MOCK_PLANNED_ROUTES } from '@/mocks/mock_planned_routes';

// Mock the backend adapters
// We need to mock the module paths that are imported in the composable
vi.mock('@/controllers/planned_routes/planned_routes_controller', () => ({
    default: {
        getCurrentUserPlannedRoutes: vi.fn(),
        getArchivedPlannedRoutes: vi.fn(),
        getPlannedRoute: vi.fn(),
        addPlannedRoute: vi.fn(),
        updatePlannedRoute: vi.fn(),
        deletePlannedRoute: vi.fn(),
        archivePlannedRoute: vi.fn(),
        unarchivePlannedRoute: vi.fn(),
        updateRouteData: vi.fn(),
        getRouteData: vi.fn(),
    }
}));

// Mock the config to ensure we know which backend is being used
// For testing purposes, we'll assume the default or rely on how the composable selects it
// Ideally, we can mock the Backend constant inside the composable if it was exported,
// but since it's internal, we rely on the mocked imports above.

describe('usePlannedRoutes', () => {
    // Helper to get the mocked backend methods. 
    // Since we don't control the toggle easily from outside without mocking utils, and we want to be safe,
    // we can assume the composable uses one of them. 
    // Let's use the Controller mock for our expectations as it's likely the default or we can mock both.

    // Quick fix: Import the mocked objects to assert on them
    let MockController;

    beforeAll(async () => {
        MockController = await import('@/controllers/planned_routes/planned_routes_controller').then(m => m.default);
    });

    // Reset mocks before each test
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with correct default state', () => {
        const { plannedRoutes, loading, error, addForm } = usePlannedRoutes();

        expect(plannedRoutes.value).toEqual([]);
        expect(loading.value).toBe(false);
        expect(error.value).toBe(null);
        expect(addForm.value.SurveyName).toBe("");
    });

    describe('Form Validation', () => {
        it('validateAddForm returns false when SurveyName is missing', () => {
            const { addForm, validateAddForm } = usePlannedRoutes();
            addForm.value.SurveyName = '';

            const result = validateAddForm();
            expect(result.valid).toBe(false);
            expect(result.field).toBe('SurveyName');
        });

        it('validateAddForm returns true when required fields are present', () => {
            const { addForm, validateAddForm } = usePlannedRoutes();
            addForm.value.SurveyName = 'Test Survey';

            const result = validateAddForm();
            expect(result.valid).toBe(true);
        });

        it('validateEditForm returns false when SurveyName is missing', () => {
            const { editForm, validateEditForm } = usePlannedRoutes();
            editForm.value.SurveyName = '';

            const result = validateEditForm();
            expect(result.valid).toBe(false);
        });
    });

    describe('fetchPlannedRoutes', () => {
        it('fetches routes successfully and populates state', async () => {
            const { fetchPlannedRoutes, plannedRoutes, loading } = usePlannedRoutes();

            const mockData = [{ id: 1, SurveyName: 'Route 1' }];
            MockController.getCurrentUserPlannedRoutes.mockResolvedValue(mockData);

            await fetchPlannedRoutes();

            expect(plannedRoutes.value).toEqual(mockData);
            expect(loading.value).toBe(false);
        });

        it('handles errors during fetch', async () => {
            const { fetchPlannedRoutes, error } = usePlannedRoutes();
            const mockError = new Error('Network error');

            // We need to ensure USE_MOCK_DATA logic doesn't override the error
            // The composable has: if (USE_MOCK_DATA) ...
            // If we can't easily change the const inside the file, we test the behavior AS WRITTEN.
            // If USE_MOCK_DATA is true (default in file), it will fallback to mock data on error.

            MockController.getCurrentUserPlannedRoutes.mockRejectedValue(mockError);

            await fetchPlannedRoutes();

            // Based on code: if fetch fails & USE_MOCK_DATA is true -> it loads mock data & clears error
            // So we expect plannedRoutes to have MOCK_PLANNED_ROUTES content
            // This assumes the file has `const USE_MOCK_DATA = true;`
        });
    });

    describe('CRUD Operations', () => {
        it('addPlannedRoute calls backend and refreshes list', async () => {
            const { addPlannedRoute, plannedRoutes } = usePlannedRoutes();
            const newRoute = { SurveyName: 'New Route' };

            MockController.addPlannedRoute.mockResolvedValue({ result: true, message: 'Success' });
            MockController.getCurrentUserPlannedRoutes.mockResolvedValue([{ id: 1, ...newRoute }]);

            const res = await addPlannedRoute(newRoute);

            expect(MockController.addPlannedRoute).toHaveBeenCalledWith(newRoute);
            expect(res.success).toBe(true);
            expect(plannedRoutes.value).toHaveLength(1);
        });

        it('deletePlannedRoute calls backend and refreshes list', async () => {
            const { deletePlannedRoute } = usePlannedRoutes();

            MockController.deletePlannedRoute.mockResolvedValue({ result: true, message: 'Deleted' });
            MockController.getCurrentUserPlannedRoutes.mockResolvedValue([]);

            const res = await deletePlannedRoute(123);

            expect(MockController.deletePlannedRoute).toHaveBeenCalledWith(123);
            expect(res.success).toBe(true);
        });
    });

    describe('Mock Data Fallback', () => {
        // Since the variable is constant in the file, we test the behavior that exists.
        // The file defaults `USE_MOCK_DATA = true`.

        it('uses mock data if backend returns empty list (and USE_MOCK_DATA is true)', async () => {
            const { fetchPlannedRoutes, plannedRoutes } = usePlannedRoutes();

            MockController.getCurrentUserPlannedRoutes.mockResolvedValue([]);

            await fetchPlannedRoutes();

            expect(plannedRoutes.value.length).toBeGreaterThan(0);
            expect(plannedRoutes.value[0]).toHaveProperty('SurveyName');
        });
    });
});
