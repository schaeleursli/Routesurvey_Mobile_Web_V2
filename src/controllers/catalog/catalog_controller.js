/**
 * Catalog Controller - FastAPI Backend
 * 
 * Handles equipment catalog operations including browsing, importing,
 * and managing project equipment with the override system.
 */

import fastApiClient from '@/utils/fastApiClient';

const CatalogController = {
    // =============================================================================
    // Catalog Items (Global)
    // =============================================================================

    /**
     * List catalog items with optional filtering
     * @param {Object} [params] - Query parameters
     * @param {string} [params.category] - Filter by category
     * @param {boolean} [params.published_only] - Show only published items
     * @param {number} [params.skip] - Pagination offset
     * @param {number} [params.limit] - Page size
     * @returns {Promise<Array>} List of catalog items
     */
    async listCatalogItems(params = {}) {
        try {
            const response = await fastApiClient.get('/api/v1/catalog/items', { params });
            return response.data;
        } catch (error) {
            console.error('Error listing catalog items:', error);
            throw error;
        }
    },

    /**
     * Get catalog item details
     * @param {string} itemId - Catalog item UUID
     * @returns {Promise<Object>} Catalog item details
     */
    async getCatalogItem(itemId) {
        try {
            const response = await fastApiClient.get(`/api/v1/catalog/items/${itemId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching catalog item:', error);
            throw error;
        }
    },

    /**
     * Create a new catalog item (admin only)
     * @param {Object} data - Catalog item data
     * @returns {Promise<Object>} Created catalog item
     */
    async createCatalogItem(data) {
        try {
            const response = await fastApiClient.post('/api/v1/catalog/items', data);
            return response.data;
        } catch (error) {
            console.error('Error creating catalog item:', error);
            throw error;
        }
    },

    /**
     * Update catalog item (admin only)
     * @param {string} itemId - Catalog item UUID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated catalog item
     */
    async updateCatalogItem(itemId, data) {
        try {
            const response = await fastApiClient.put(`/api/v1/catalog/items/${itemId}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating catalog item:', error);
            throw error;
        }
    },

    /**
     * Delete catalog item (admin only)
     * @param {string} itemId - Catalog item UUID
     * @returns {Promise<void>}
     */
    async deleteCatalogItem(itemId) {
        try {
            await fastApiClient.delete(`/api/v1/catalog/items/${itemId}`);
        } catch (error) {
            console.error('Error deleting catalog item:', error);
            throw error;
        }
    },

    /**
     * Publish catalog item (admin only)
     * @param {string} itemId - Catalog item UUID
     * @returns {Promise<Object>} Published catalog item
     */
    async publishCatalogItem(itemId) {
        try {
            const response = await fastApiClient.post(`/api/v1/catalog/items/${itemId}/publish`);
            return response.data;
        } catch (error) {
            console.error('Error publishing catalog item:', error);
            throw error;
        }
    },

    // =============================================================================
    // Project Equipment
    // =============================================================================

    /**
     * List project equipment
     * @param {string} projectId - Project UUID
     * @returns {Promise<Array>} List of project equipment
     */
    async listProjectEquipment(projectId) {
        try {
            const response = await fastApiClient.get(`/api/v1/projects/${projectId}/equipment`);
            return response.data;
        } catch (error) {
            console.error('Error listing project equipment:', error);
            throw error;
        }
    },

    /**
     * Get project equipment details
     * @param {string} projectId - Project UUID
     * @param {string} equipmentId - Equipment UUID
     * @returns {Promise<Object>} Equipment details
     */
    async getProjectEquipment(projectId, equipmentId) {
        try {
            const response = await fastApiClient.get(
                `/api/v1/projects/${projectId}/equipment/${equipmentId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching project equipment:', error);
            throw error;
        }
    },

    /**
     * Import equipment from catalog to project
     * @param {string} projectId - Project UUID
     * @param {Object} data - Import data
     * @param {string} data.catalog_item_id - Catalog item UUID to import
     * @param {Object} [data.overrides] - Optional field overrides
     * @returns {Promise<Object>} Created project equipment
     */
    async importFromCatalog(projectId, data) {
        try {
            const response = await fastApiClient.post(
                `/api/v1/projects/${projectId}/equipment/import`,
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error importing from catalog:', error);
            throw error;
        }
    },

    /**
     * Create custom project equipment (not from catalog)
     * @param {string} projectId - Project UUID
     * @param {Object} data - Equipment data
     * @returns {Promise<Object>} Created custom equipment
     */
    async createCustomEquipment(projectId, data) {
        try {
            const response = await fastApiClient.post(
                `/api/v1/projects/${projectId}/equipment/custom`,
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error creating custom equipment:', error);
            throw error;
        }
    },

    /**
     * Update project equipment overrides
     * @param {string} projectId - Project UUID
     * @param {string} equipmentId - Equipment UUID
     * @param {Object} overrides - Field overrides
     * @returns {Promise<Object>} Updated equipment with effective spec
     */
    async updateEquipmentOverrides(projectId, equipmentId, overrides) {
        try {
            const response = await fastApiClient.put(
                `/api/v1/projects/${projectId}/equipment/${equipmentId}`,
                { overrides }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating equipment overrides:', error);
            throw error;
        }
    },

    /**
     * Materialize overrides (make them permanent and detach from catalog)
     * @param {string} projectId - Project UUID
     * @param {string} equipmentId - Equipment UUID
     * @returns {Promise<Object>} Materialized equipment
     */
    async materializeOverrides(projectId, equipmentId) {
        try {
            const response = await fastApiClient.post(
                `/api/v1/projects/${projectId}/equipment/${equipmentId}/materialize`
            );
            return response.data;
        } catch (error) {
            console.error('Error materializing overrides:', error);
            throw error;
        }
    },

    /**
     * Delete project equipment
     * @param {string} projectId - Project UUID
     * @param {string} equipmentId - Equipment UUID
     * @returns {Promise<void>}
     */
    async deleteProjectEquipment(projectId, equipmentId) {
        try {
            await fastApiClient.delete(`/api/v1/projects/${projectId}/equipment/${equipmentId}`);
        } catch (error) {
            console.error('Error deleting project equipment:', error);
            throw error;
        }
    },
};

export default CatalogController;
