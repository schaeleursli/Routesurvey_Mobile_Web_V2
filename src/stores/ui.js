import { defineStore } from 'pinia';
import { createToaster } from "@meforma/vue-toaster";

const toast = createToaster({
    position: 'top-right',
    duration: 3000
});

export const useUIStore = defineStore('ui', {
    state: () => ({
        isLoading: false, // Global full-screen loader
        loadingMessage: '',
        isSidebarOpen: true,
        toasts: [],
        theme: localStorage.getItem('theme') || 'light'
    }),

    actions: {
        /**
         * Show global loader
         * @param {string} message Optional loading message
         */
        startLoading(message = '') {
            this.isLoading = true;
            this.loadingMessage = message;
        },

        /**
         * Hide global loader
         */
        stopLoading() {
            this.isLoading = false;
            this.loadingMessage = '';
        },

        /**
         * Toggle sidebar
         */
        toggleSidebar() {
            this.isSidebarOpen = !this.isSidebarOpen;
        },

        /**
         * Set sidebar state
         * @param {boolean} isOpen 
         */
        setSidebar(isOpen) {
            this.isSidebarOpen = isOpen;
        },

        /**
         * Show success toast
         * @param {string} message 
         */
        showSuccess(message) {
            toast.success(message);
        },

        /**
         * Show error toast
         * @param {string} message 
         */
        showError(message) {
            toast.error(message);
        },

        /**
         * Show info toast
         * @param {string} message 
         */
        showInfo(message) {
            toast.info(message);
        },

        /**
         * Show warning toast
         * @param {string} message 
         */
        showWarning(message) {
            toast.warning(message);
        },

        /**
         * Set application theme
         * @param {string} theme 'light' or 'dark'
         */
        setTheme(theme) {
            this.theme = theme;
            localStorage.setItem('theme', theme);
            document.documentElement.setAttribute('data-bs-theme', theme);
        },

        /**
         * Toggle between light and dark theme
         */
        toggleTheme() {
            const newTheme = this.theme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        }
    }
});
