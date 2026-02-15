import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import Cookies from 'js-cookie';
import auth_controller from '@/controllers/auth/auth_controller';

// Mock dependencies
vi.mock('@/controllers/auth/auth_controller');
vi.mock('js-cookie');
vi.mock('axios');
vi.mock('@/utils/token-manager', () => ({
    default: {
        init: vi.fn(),
        stop: vi.fn()
    }
}));

describe('AuthStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        Cookies.get.mockReturnValue(null);
    });

    it('initializes with no user and no token by default', () => {
        const store = useAuthStore();
        expect(store.user).toBeNull();
        expect(store.token).toBeNull();
        expect(store.isAuthenticated).toBe(false);
    });

    it('login success sets token and authenticated state', async () => {
        const store = useAuthStore();
        Cookies.get.mockReturnValue('mock-token'); // Simulate cookie being set by controller
        auth_controller.loginWithCredentials.mockResolvedValue({ result: true });

        const result = await store.login('test@example.com', 'password');

        expect(result.success).toBe(true);
        expect(store.isAuthenticated).toBe(true);
        expect(store.token).toBe('mock-token');
        expect(store.error).toBeNull();
    });

    it('login failure sets error', async () => {
        const store = useAuthStore();
        auth_controller.loginWithCredentials.mockResolvedValue({ result: false, message: 'Invalid credentials' });
        Cookies.get.mockReturnValue(null);

        const result = await store.login('test@example.com', 'wrongpassword');

        expect(result.success).toBe(false);
        expect(store.isAuthenticated).toBe(false);
        expect(store.error).toBe('Invalid credentials');
    });

    it('logout clears state and cookies', async () => {
        const store = useAuthStore();
        store.token = 'mock-token';
        store.isAuthenticated = true;
        store.user = { name: 'User' };

        await store.logout();

        expect(store.token).toBeNull();
        expect(store.isAuthenticated).toBe(false);
        expect(store.user).toBeNull();
        expect(Cookies.remove).toHaveBeenCalledWith('l_t');
        expect(Cookies.remove).toHaveBeenCalledWith('l_u');
    });

    it('init restores session if cookie exists', async () => {
        const store = useAuthStore();
        // state is initialized from cookies in the definition, so we need to mock cookie get behavior *before* store creation if we tested that.
        // But here we test the init action.
        // Let's assume the store was created with a token (simulated by state default)
        store.token = 'existing-token';

        await store.init();

        expect(axios.defaults.headers.common['Authorization']).toBe('Bearer existing-token');
    });

    describe('Token Refresh', () => {
        it('refreshToken success updates token', async () => {
            const store = useAuthStore();
            auth_controller.refreshToken.mockResolvedValue({ result: true });
            Cookies.get.mockReturnValue('new-refreshed-token');

            const result = await store.refreshToken();

            expect(result.success).toBe(true);
            expect(store.token).toBe('new-refreshed-token');
        });

        it('refreshToken failure clears state', async () => {
            const store = useAuthStore();
            store.token = 'old-token';
            store.isAuthenticated = true;

            auth_controller.refreshToken.mockResolvedValue({ result: false });
            // The store implementation returns success: false if result is falsy, but doesn't explicit logout unless it throws.
            // Wait, looking at code: 
            // if (res && res.result) { ... } return { success: false };
            // It ONLY correctly logs out in the CATCH block.
            // So if controller returns { result: false }, it just returns { success: false } without clearing state?
            // Let's verify expectations against current code:
            // "if (res && res.result) ... return { success: true }; return { success: false };"
            // The catch block does the clearing. So we should simulate an ERROR to test the clearing behavior usually associated with expiration.

            // Test 1: Graceful failure (e.g. backend says invalid reuse) - State should clear now.
            const result = await store.refreshToken();
            expect(result.success).toBe(false);
            expect(store.token).toBeNull();
            expect(store.isAuthenticated).toBe(false);

            // Test 2: Error (which usually happens on 401 interceptor in real world, but here called directly)
            auth_controller.refreshToken.mockRejectedValue(new Error('Refresh failed'));

            const resultError = await store.refreshToken();
            expect(resultError.success).toBe(false);
            expect(store.token).toBeNull();
            expect(store.isAuthenticated).toBe(false);
        });
    });

    describe('User Profile', () => {
        it('fetchUserProfile success updates user', async () => {
            const store = useAuthStore();
            const mockUser = { id: 1, name: 'Test' };
            auth_controller.getCurrentUserData.mockResolvedValue({ result: true, data: mockUser });

            const result = await store.fetchUserProfile();

            expect(result.success).toBe(true);
            expect(store.user).toEqual(mockUser);
        });

        it('handle mock profile fetch', async () => {
            const store = useAuthStore();
            Cookies.get.mockImplementation((key) => key === 'is_mock' ? 'true' : null);

            const result = await store.fetchUserProfile();

            expect(result.success).toBe(true);
            expect(store.user.email).toContain('mock');
        });
    });

    describe('Mock Login', () => {
        it('mockLogin sets mock state', async () => {
            const store = useAuthStore();

            const result = await store.mockLogin();

            expect(result.success).toBe(true);
            expect(store.isAuthenticated).toBe(true);
            expect(store.user.firstName).toBe('Mock');
            expect(Cookies.set).toHaveBeenCalledWith('is_mock', 'true', expect.any(Object));
        });
    });

    describe('Update Info', () => {
        it('updateUserInfo updates local state on success', async () => {
            const store = useAuthStore();
            store.user = { firstName: 'Old', lastName: 'Name' };

            auth_controller.updateUserInfo.mockResolvedValue({ result: true });

            await store.updateUserInfo({ FirstName: 'New' });

            expect(store.user.firstName).toBe('New');
            expect(store.user.lastName).toBe('Name');
        });
    });

    describe('Onboarding', () => {
        it('completeOnboarding success updates local state', async () => {
            const store = useAuthStore();
            store.user = { onboarding_completed_at: null };

            auth_controller.completeOnboarding.mockResolvedValue({ result: true });

            const result = await store.completeOnboarding({ some: 'data' });

            expect(result.success).toBe(true);
            expect(store.user.onboarding_completed_at).not.toBeNull();
        });

        it('completeOnboarding failure returns error', async () => {
            const store = useAuthStore();
            store.user = { onboarding_completed_at: null };

            auth_controller.completeOnboarding.mockResolvedValue({ result: false, message: 'Failed' });

            const result = await store.completeOnboarding({ some: 'data' });

            expect(result.success).toBe(false);
            expect(store.user.onboarding_completed_at).toBeNull();
        });

        it('completeOnboarding works with mock mode', async () => {
            const store = useAuthStore();
            Cookies.get.mockImplementation((key) => key === 'is_mock' ? 'true' : null);
            store.user = { userId: 999, onboarding_completed_at: null };

            const result = await store.completeOnboarding({});

            expect(result.success).toBe(true);
            expect(store.user.onboarding_completed_at).not.toBeNull();
        });
    });

    describe('Trail Expiration', () => {
        it('checkUserTrailExpired returns controller result', async () => {
            const store = useAuthStore();
            auth_controller.isUserTrailExpired.mockResolvedValue({ result: true, expired: true });

            const result = await store.checkUserTrailExpired();

            expect(result.result).toBe(true);
            expect(result.expired).toBe(true);
        });
    });
});
