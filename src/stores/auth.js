import { defineStore } from 'pinia';
import Cookies from 'js-cookie';
import axios from 'axios';
import auth_controller from '@/controllers/auth/auth_controller';
import tokenManager from '@/utils/token-manager';

export const DISCLAIMER_VERSION = "2026-01-30-v1";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: Cookies.get('l_t') || null,
        isAuthenticated: !!Cookies.get('l_t'),
        isLoading: false,
        error: null,
        disclaimerAcceptedVersion: localStorage.getItem('disclaimerAcceptedVersion') || null
    }),

    getters: {
        currentUser: (state) => state.user,
        isLoggedIn: (state) => state.isAuthenticated,
        isDisclaimerAccepted: (state) => state.disclaimerAcceptedVersion === DISCLAIMER_VERSION
    },

    actions: {
        /**
         * Initialize auth state (e.g. fetch user profile if token exists)
         */
        async init() {
            if (this.token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                tokenManager.init();

                // Fetch user data if we have a token but no user data
                if (!this.user) {
                    await this.fetchUserProfile();
                }
            }
        },

        /**
         * Fetch current user profile
         */
        async fetchUserProfile() {
            try {
                this.isLoading = true;

                const res = await auth_controller.getCurrentUserData();
                if (res && res.result) {
                    this.user = res.data;
                    return { success: true, data: res.data };
                } else {
                    return { success: false, message: res?.message || 'Failed to fetch profile' };
                }
            } catch (err) {
                console.error('Fetch profile error:', err);
                return { success: false, message: err.message };
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Login with email and password
         * @param {string} email 
         * @param {string} password 
         * @param {boolean} remember 
         */
        async login(email, password, remember = false) {
            this.isLoading = true;
            this.error = null;

            try {
                const res = await auth_controller.loginWithCredentials(email, password, remember);

                if (res.result) {
                    this.token = Cookies.get('l_t');
                    this.isAuthenticated = true;
                    // Note: auth_controller handles cookie setting

                    // Initialize token monitoring
                    tokenManager.init();

                    // Fetch user profile immediately after login
                    await this.fetchUserProfile();

                    return { success: true };
                } else {
                    this.error = res.message;
                    return { success: false, message: res.message };
                }
            } catch (err) {
                console.error('Login action error:', err);
                this.error = 'An unexpected error occurred';
                return { success: false, message: this.error };
            } finally {
                this.isLoading = false;
            }
        },


        /**
         * Logout user
         */
        async logout() {
            try {
                // Call backend logout if API exists
                // await auth_controller.logout(); 

                // Clear local state
                this.user = null;
                this.token = null;
                this.isAuthenticated = false;

                // Clear cookies
                Cookies.remove('l_t');
                Cookies.remove('l_u'); // Assuming l_u is user info
                Cookies.remove('login_user_id');
                Cookies.remove('login_email');

                // Clear axios header
                delete axios.defaults.headers.common['Authorization'];

                // Stop token manager
                // tokenManager.stop(); // If stop method exists
            } catch (err) {
                console.error('Logout error:', err);
            }
        },

        /**
         * Update user info
         * @param {Object} data 
         */
        async updateUserInfo(data) {
            try {
                this.isLoading = true;
                const res = await auth_controller.updateUserInfo(data);

                if (res.result) {
                    // Update local user state if successful
                    if (this.user) {
                        if (data.Imperial !== undefined) this.user.imperial = data.Imperial;
                        if (data.FirstName) this.user.firstName = data.FirstName;
                        if (data.LastName) this.user.lastName = data.LastName;
                        if (data.AboutMe !== undefined) this.user.aboutMe = data.AboutMe;
                        if (data.Skills !== undefined) this.user.skills = data.Skills;
                        if (data.SurveyTypes !== undefined) this.user.surveyTypes = data.SurveyTypes;
                    }
                    return { success: true, message: res.message };
                } else {
                    return { success: false, message: res.message };
                }
            } catch (err) {
                console.error('Update user info error:', err);
                return { success: false, message: err.message };
            } finally {
                this.isLoading = false;
            }
        },

        async checkUserTrailExpired() {
            try {
                const res = await auth_controller.isUserTrailExpired();
                // Optionally update state if we want to track this in store
                return res;
            } catch (err) {
                console.error('Check trail expired error:', err);
                return { result: false, message: err.message };
            }
        },

        async getUsers() {
            try {
                this.isLoading = true;
                const res = await auth_controller.getUsers();
                return res;
            } catch (err) {
                console.error('Get users error:', err);
                return { result: false, message: err.message };
            } finally {
                this.isLoading = false;
            }
        },

        async addUser(userData) {
            try {
                this.isLoading = true;
                const res = await auth_controller.addUser(userData);
                return res;
            } catch (err) {
                console.error('Add user error:', err);
                return { result: false, message: err.message };
            } finally {
                this.isLoading = false;
            }
        },

        async updateCompanyInfo(companyData) {
            try {
                this.isLoading = true;
                const res = await auth_controller.updateCompanyInfo(companyData);
                return res;
            } catch (err) {
                console.error('Update company info error:', err);
                return { result: false, message: err.message };
            } finally {
                this.isLoading = false;
            }
        },

        async refreshToken() {
            try {
                const res = await auth_controller.refreshToken();
                if (res && res.result) {
                    this.token = Cookies.get('l_t');
                    return { success: true };
                }

                // If refresh failed (but didn't throw), we must clear the session
                this.user = null;
                this.token = null;
                this.isAuthenticated = false;
                return { success: false };
            } catch (err) {
                console.error('Refresh token error:', err);
                this.user = null;
                this.token = null;
                this.isAuthenticated = false;
                return { success: false, message: err.message };
            }
        },

        async completeOnboarding(data) {
            this.isLoading = true;
            try {
                const res = await auth_controller.completeOnboarding(data);
                if (res.result) {
                    // Update local user
                    if (this.user) {
                        this.user.onboarding_completed_at = new Date().toISOString();
                    }
                    return { success: true };
                }
                return { success: false, message: res.message };
            } catch (err) {
                return { success: false, message: err.message };
            } finally {
                this.isLoading = false;
            }
        },

        acceptDisclaimer() {
            localStorage.setItem('disclaimerAcceptedVersion', DISCLAIMER_VERSION);
            this.disclaimerAcceptedVersion = DISCLAIMER_VERSION;
            return { success: true };
        }
    }
});
