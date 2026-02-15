/**
 * App Store - Global application state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Theme = 'light' | 'dark'

export interface Toast {
    id: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    duration?: number
}

export const useAppStore = defineStore('app', () => {
    // Theme
    const theme = ref<Theme>('light')
    const isDark = computed(() => theme.value === 'dark')

    function setTheme(newTheme: Theme) {
        theme.value = newTheme
        localStorage.setItem('theme', newTheme)
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    function toggleTheme() {
        setTheme(isDark.value ? 'light' : 'dark')
    }

    function initTheme() {
        const saved = localStorage.getItem('theme') as Theme | null
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(saved || (systemPrefersDark ? 'dark' : 'light'))
    }

    // Toasts
    const toasts = ref<Toast[]>([])

    function showToast(message: string, type: Toast['type'] = 'info', duration = 5000) {
        const id = Math.random().toString(36).slice(2)
        const toast: Toast = { id, message, type, duration }
        toasts.value.push(toast)

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    function removeToast(id: string) {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    // Error handling
    const globalError = ref<string | null>(null)

    function setError(error: string | null) {
        globalError.value = error
        if (error) {
            showToast(error, 'error')
        }
    }

    function clearError() {
        globalError.value = null
    }

    return {
        // Theme
        theme,
        isDark,
        setTheme,
        toggleTheme,
        initTheme,
        // Toasts
        toasts,
        showToast,
        removeToast,
        // Errors
        globalError,
        setError,
        clearError,
    }
})
