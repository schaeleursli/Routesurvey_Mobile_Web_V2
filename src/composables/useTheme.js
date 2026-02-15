import { ref, watch, onMounted } from 'vue';

/**
 * Composable for managing application theme (light/dark mode)
 * Provides theme state, toggle functionality, and persistence via localStorage
 */
export function useTheme() {
    const STORAGE_KEY = 'app-theme';
    const theme = ref('light');

    /**
     * Apply theme to DOM
     * @param {string} newTheme - 'light' or 'dark'
     */
    function applyTheme(newTheme) {
        const validTheme = newTheme === 'dark' ? 'dark' : 'light';
        theme.value = validTheme;

        // Update data attribute for CSS
        if (validTheme === 'dark') {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-bs-theme');
        }

        // Store in localStorage
        try {
            localStorage.setItem(STORAGE_KEY, validTheme);
        } catch (e) {
            console.warn('Unable to save theme preference:', e);
        }
    }

    /**
     * Toggle between light and dark theme
     */
    function toggleTheme() {
        const newTheme = theme.value === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    }

    /**
     * Set specific theme
     * @param {string} newTheme - 'light' or 'dark'
     */
    function setTheme(newTheme) {
        applyTheme(newTheme);
    }

    /**
     * Initialize theme from localStorage or system preference
     */
    function initTheme() {
        // Check localStorage first
        let savedTheme = null;
        try {
            savedTheme = localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Unable to read theme preference:', e);
        }

        if (savedTheme) {
            applyTheme(savedTheme);
            return;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    }

    // Initialize theme on mount
    onMounted(() => {
        initTheme();

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                // Only auto-switch if user hasn't manually selected a theme
                const savedTheme = localStorage.getItem(STORAGE_KEY);
                if (!savedTheme) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            };

            // Use addEventListener if available, otherwise use deprecated addListener
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleChange);
            } else if (mediaQuery.addListener) {
                mediaQuery.addListener(handleChange);
            }
        }
    });

    return {
        theme,
        toggleTheme,
        setTheme,
        initTheme,
    };
}
