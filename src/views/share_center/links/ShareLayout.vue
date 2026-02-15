<template>
    <div class="public-share-layout" :class="{ 'dark-mode': isDarkMode }">
        <!-- Theme Toggle Button -->
        <div class="theme-toggle">
            <BaseButton @click="toggleTheme" :variant="isDarkMode ? 'secondary' : 'ghost'" size="small"
                class="theme-toggle-btn" :left-icon="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'">
                {{ isDarkMode ? 'Light' : 'Dark' }}
            </BaseButton>
        </div>

        <!-- Main Content Area -->
        <main class="share-main">
            <router-view />
        </main>

        <!-- Footer -->
        <BasePanel class="share-footer" elevation="level1">
            <div class="footer-content">
                <p class="footer-text">
                    &copy; {{ new Date().getFullYear() }} Route Survey Console. All rights reserved.
                </p>
                <div class="footer-links">
                    <a href="#" class="footer-link">Privacy Policy</a>
                    <a href="#" class="footer-link">Terms of Service</a>
                </div>
            </div>
        </BasePanel>
    </div>
</template>

<script setup>
// This is a layout component for public share pages
// It provides a consistent layout for all shared content
import { ref, onMounted, watch } from 'vue';
import { BasePanel, BaseButton } from '@/components/ui';

// Theme management
const isDarkMode = ref(false);

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark';
    } else {
        isDarkMode.value = prefersDark;
    }

    applyTheme();
};

// Apply theme to document
const applyTheme = () => {
    const html = document.documentElement;
    if (isDarkMode.value) {
        html.setAttribute('data-bs-theme', 'dark');
    } else {
        html.removeAttribute('data-bs-theme');
    }
};

// Toggle theme
const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    applyTheme();
};

// Watch for system theme changes
const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            isDarkMode.value = e.matches;
            applyTheme();
        }
    });
};

// Initialize on mount
onMounted(() => {
    initializeTheme();
    watchSystemTheme();
});

// Watch for theme changes
watch(isDarkMode, () => {
    applyTheme();
});
</script>

<style scoped>
.public-share-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-base);
}

/* Theme Toggle */
.theme-toggle {
    position: fixed;
    top: var(--spacing-lg);
    right: var(--spacing-lg);
    z-index: 1000;
}

.theme-toggle-btn {
    backdrop-filter: blur(10px);
    background: rgb(255 255 255 / 90%);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
}

.theme-toggle-btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
}

.dark-mode .theme-toggle-btn {
    background: rgb(30 41 59 / 90%);
    border-color: var(--border);
}

/* Main Content */
.share-main {
    flex: 1;
    width: 100%;
    background: var(--bg-base);
}

/* Footer Styles */
.share-footer {
    margin-top: auto;
    background: var(--bg-surface);
    border-top: 1px solid var(--border);
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-lg) var(--spacing-xl);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-text {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin: 0;
}

.footer-links {
    display: flex;
    gap: var(--spacing-lg);
}

.footer-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: color var(--transition-fast);
}

.footer-link:hover {
    color: var(--accent);
}

/* Responsive Design */
@media (width <= 768px) {
    .theme-toggle {
        top: var(--spacing-md);
        right: var(--spacing-md);
    }

    .footer-content {
        padding: var(--spacing-md) var(--spacing-lg);
        flex-direction: column;
        gap: var(--spacing-md);
        text-align: center;
    }

    .footer-links {
        gap: var(--spacing-md);
    }
}

@media (width <= 480px) {
    .theme-toggle {
        top: var(--spacing-sm);
        right: var(--spacing-sm);
    }

    .theme-toggle-btn {
        font-size: var(--font-size-xs);
        padding: var(--spacing-xs) var(--spacing-sm);
    }

    .footer-content {
        padding: var(--spacing-sm) var(--spacing-md);
    }

    .footer-links {
        flex-direction: column;
        gap: var(--spacing-sm);
    }
}
</style>