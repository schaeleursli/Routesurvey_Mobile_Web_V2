/**
 * Engineering Controller - FastAPI Backend
 * 
 * Handles engineering calculations including axle loads, swept path analysis,
 * and other transport engineering computations.
 */

import fastApiClient from '@/utils/fastApiClient';

const EngineeringController = {
    /**
     * Run an engineering calculation job
     * @param {Object} data - Calculation job data
     * @param {string} data.project_id - Project UUID
     * @param {string} data.transport_config_id - Transport configuration UUID
     * @param {string} [data.route_id] - Optional route ID
     * @param {Array<string>} [data.calculation_types] - Types of calculations to run
     * @returns {Promise<Object>} Calculation job with job_id
     */
    async runCalculation(data) {
        try {
            const response = await fastApiClient.post('/api/v1/calculations/run', data);
            return response.data;
        } catch (error) {
            console.error('Error running calculation:', error);
            throw error;
        }
    },

    /**
     * Get calculation job results
     * @param {string} jobId - Calculation job UUID
     * @returns {Promise<Object>} Calculation results
     */
    async getCalculationResults(jobId) {
        try {
            const response = await fastApiClient.get(`/api/v1/calculations/${jobId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching calculation results:', error);
            throw error;
        }
    },

    /**
     * List all calculation jobs for a project
     * @param {string} projectId - Project UUID
     * @returns {Promise<Array>} List of calculation jobs
     */
    async listCalculationJobs(projectId) {
        try {
            const response = await fastApiClient.get(
                `/api/v1/projects/${projectId}/calculations/jobs`
            );
            return response.data;
        } catch (error) {
            console.error('Error listing calculation jobs:', error);
            throw error;
        }
    },

    /**
     * Poll calculation job status until complete
     * @param {string} jobId - Calculation job UUID
     * @param {number} [maxAttempts=30] - Maximum polling attempts
     * @param {number} [intervalMs=2000] - Polling interval in milliseconds
     * @returns {Promise<Object>} Completed calculation results
     */
    async pollCalculationJob(jobId, maxAttempts = 30, intervalMs = 2000) {
        let attempts = 0;

        const poll = async () => {
            try {
                const result = await this.getCalculationResults(jobId);

                // Check if job is complete
                if (result.status === 'completed' || result.status === 'success') {
                    return result;
                }

                if (result.status === 'failed' || result.status === 'error') {
                    throw new Error(`Calculation failed: ${result.error || 'Unknown error'}`);
                }

                // Continue polling if still in progress
                if (attempts < maxAttempts) {
                    attempts++;
                    await new Promise((resolve) => setTimeout(resolve, intervalMs));
                    return poll();
                } else {
                    throw new Error('Calculation timeout - max polling attempts reached');
                }
            } catch (error) {
                console.error('Error polling calculation job:', error);
                throw error;
            }
        };

        return poll();
    },
};

export default EngineeringController;
