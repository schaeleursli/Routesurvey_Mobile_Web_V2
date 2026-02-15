/**
 * Permits Controller - FastAPI Backend
 * 
 * Handles all permit case operations using the FastAPI backend.
 * This includes creating permits, managing engineering linkages, and syncing data.
 */

import fastApiClient from '@/utils/fastApiClient';

const PermitsController = {
    /**
     * List all permit cases for a project
     * @param {string} projectId - Project UUID
     * @returns {Promise<Array>} List of permit cases
     */
    async listPermitCases(projectId) {
        try {
            const response = await fastApiClient.get(`/api/v1/projects/${projectId}/permit-cases`);
            return response.data;
        } catch (error) {
            console.error('Error fetching permit cases:', error);
            throw error;
        }
    },

    /**
     * Create a new US permit case
     * @param {string} projectId - Project UUID
     * @param {Object} data - Permit case data
     * @param {string} data.route_id - Route ID for the permit
     * @param {string} [data.title] - Optional title (auto-generated if not provided)
     * @returns {Promise<Object>} Created permit case
     */
    async createUSPermitCase(projectId, data) {
        try {
            const response = await fastApiClient.post(
                `/api/v1/projects/${projectId}/permit-cases/us`,
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error creating permit case:', error);
            throw error;
        }
    },

    /**
     * Get permit case details
     * @param {string} caseId - Permit case UUID
     * @returns {Promise<Object>} Permit case details
     */
    async getPermitCase(caseId) {
        try {
            const response = await fastApiClient.get(`/api/v1/permit-cases/${caseId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching permit case:', error);
            throw error;
        }
    },

    /**
     * Update permit case payload
     * @param {string} caseId - Permit case UUID
     * @param {Object} payload - Permit payload updates (will be merged)
     * @returns {Promise<Object>} Updated permit case
     */
    async updatePermitCase(caseId, payload) {
        try {
            const response = await fastApiClient.put(`/api/v1/permit-cases/${caseId}`, {
                payload_json: payload,
            });
            return response.data;
        } catch (error) {
            console.error('Error updating permit case:', error);
            throw error;
        }
    },

    /**
     * Link an engineering calculation to a permit case
     * @param {string} caseId - Permit case UUID
     * @param {string} calcJobId - Calculation job UUID to link
     * @returns {Promise<Object>} Link response
     */
    async linkEngineering(caseId, calcJobId) {
        try {
            const response = await fastApiClient.post(
                `/api/v1/permit-cases/${caseId}/link-engineering`,
                { calc_job_id: calcJobId }
            );
            return response.data;
        } catch (error) {
            console.error('Error linking engineering:', error);
            throw error;
        }
    },

    /**
     * Sync engineering data to permit case
     * @param {string} caseId - Permit case UUID
     * @returns {Promise<Object>} Sync response with updated fields
     */
    async syncEngineering(caseId) {
        try {
            const response = await fastApiClient.post(
                `/api/v1/permit-cases/${caseId}/sync-engineering`
            );
            return response.data;
        } catch (error) {
            console.error('Error syncing engineering:', error);
            throw error;
        }
    },

    /**
     * Get engineering linkage status for a permit case
     * @param {string} caseId - Permit case UUID
     * @returns {Promise<Object>} Engineering status
     */
    async getEngineeringStatus(caseId) {
        try {
            const response = await fastApiClient.get(
                `/api/v1/permit-cases/${caseId}/engineering-status`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching engineering status:', error);
            throw error;
        }
    },

    /**
     * Delete a permit case
     * @param {string} caseId - Permit case UUID
     * @returns {Promise<void>}
     */
    async deletePermitCase(caseId) {
        try {
            await fastApiClient.delete(`/api/v1/permit-cases/${caseId}`);
        } catch (error) {
            console.error('Error deleting permit case:', error);
            throw error;
        }
    },
};

export default PermitsController;
