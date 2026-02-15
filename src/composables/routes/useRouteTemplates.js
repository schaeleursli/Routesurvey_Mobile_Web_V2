/**
 * Route Template Management Composable
 * Handles saving, loading, and managing route templates
 */

import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const API_BASE = '/api/route-templates';

export function useRouteTemplates() {
    const authStore = useAuthStore();
    const templates = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchJson = async (url, options = {}) => {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!res.ok) {
            const message = await res.text();
            throw new Error(message || `Request failed: ${res.status}`);
        }
        return res.json();
    };

    /**
     * Fetch all templates for current user
     */
    const fetchTemplates = async (routeType = null) => {
        loading.value = true;
        error.value = null;

        try {
            const params = new URLSearchParams();
            if (routeType) params.append('type', routeType);

            const data = await fetchJson(`${API_BASE}?${params.toString()}`);
            templates.value = data?.data || data || [];
            return { success: true, data: templates.value };
        } catch (err) {
            error.value = err.message;
            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Save route as template
     */
    const saveTemplate = async (templateData) => {
        loading.value = true;
        error.value = null;

        try {
            const payload = {
                name: templateData.name,
                description: templateData.description || '',
                routeType: templateData.routeType, // 'manual' or 'planned'
                data: templateData.data,
                isShared: templateData.isShared || false,
                organizationId: authStore.user?.organizationId
            };

            const data = await fetchJson(API_BASE, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const created = data?.data || data;
            if (created) {
                templates.value.push(created);
            }

            return { success: true, data: created };
        } catch (err) {
            error.value = err.message;
            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Load template by ID
     */
    const loadTemplate = async (templateId) => {
        loading.value = true;
        error.value = null;

        try {
            const data = await fetchJson(`${API_BASE}/${templateId}`);
            const template = data?.data || data;
            return { success: true, data: template };
        } catch (err) {
            error.value = err.message;
            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Update existing template
     */
    const updateTemplate = async (templateId, updates) => {
        loading.value = true;
        error.value = null;

        try {
            const data = await fetchJson(`${API_BASE}/${templateId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });

            const updated = data?.data || data;
            const templateIndex = templates.value.findIndex(t => t.id === templateId);
            if (templateIndex !== -1 && updated) {
                templates.value[templateIndex] = updated;
            }

            return { success: true, data: updated };
        } catch (err) {
            error.value = err.message;
            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Delete template
     */
    const deleteTemplate = async (templateId) => {
        loading.value = true;
        error.value = null;

        try {
            await fetchJson(`${API_BASE}/${templateId}`, { method: 'DELETE' });
            templates.value = templates.value.filter(t => t.id !== templateId);

            return { success: true };
        } catch (err) {
            error.value = err.message;
            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Share template with organization
     */
    const shareTemplate = async (templateId, share = true) => {
        loading.value = true;
        error.value = null;

        try {
            const data = await fetchJson(`${API_BASE}/${templateId}/share`, {
                method: 'POST',
                body: JSON.stringify({ share })
            });

            const templateIndex = templates.value.findIndex(t => t.id === templateId);
            if (templateIndex !== -1) {
                templates.value[templateIndex].isShared = share;
            }

            return { success: true, data };
        } catch (err) {
            error.value = err.message;
            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Apply template to current route editor state
     */
    const applyTemplate = (template, currentState) => {
        const templateData = template.data;

        // Merge template data with current state
        // Preserve unique identifiers and timestamps
        return {
            ...currentState,
            ...templateData,
            // Don't override these fields
            id: currentState.id,
            createdAt: currentState.createdAt,
            updatedAt: new Date().toISOString()
        };
    };

    return {
        templates,
        loading,
        error,
        fetchTemplates,
        saveTemplate,
        loadTemplate,
        updateTemplate,
        deleteTemplate,
        shareTemplate,
        applyTemplate
    };
}
