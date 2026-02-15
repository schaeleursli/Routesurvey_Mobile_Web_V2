/**
 * Engineering Integration Composable
 * 
 * Phase 2.0: Provides helpers for linking, syncing, and managing
 * engineering calculation data in permit cases.
 */

import { ref } from 'vue';

export function useEngineeringIntegration() {
    const loading = ref(false);
    const error = ref(null);

    /**
     * Link engineering calculation to permit case
     */
    async function linkEngineering(caseId, calcJobId) {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`/api/v1/permit-cases/${caseId}/link-engineering`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ calc_job_id: calcJobId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to link engineering');
            }

            return await response.json();
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Sync engineering data from linked calc job
     */
    async function syncEngineering(caseId) {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`/api/v1/permit-cases/${caseId}/sync-engineering`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to sync engineering');
            }

            return await response.json();
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Get engineering status for permit case
     */
    async function getEngineeringStatus(caseId) {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`/api/v1/permit-cases/${caseId}/engineering-status`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to get engineering status');
            }

            return await response.json();
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Detect if field value represents a manual override
     */
    function detectOverride(field, newValue, meta) {
        // If source was ENGINEERING and value has changed, it's now MANUAL
        if (meta?.source === 'ENGINEERING') {
            // Value has been manually edited
            return {
                source: 'MANUAL',
                sourceRef: meta.sourceRef, // Preserve reference
                lastEngineering: meta.lastEngineering || newValue,
                updatedAt: new Date().toISOString()
            };
        }

        // Already manual or no meta
        return meta || {
            source: 'MANUAL',
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Check if field is engineering-sourced
     */
    function isEngineeringSourced(meta) {
        return meta?.source === 'ENGINEERING';
    }

    // Phase 2.3: Auto-refresh system
    let pollInterval = null;
    const lastCheckTimestamp = ref(null);

    /**
     * Check if linked calc job has updates
     */
    async function checkForUpdates(caseId) {
        try {
            const status = await getEngineeringStatus(caseId);

            if (!status.is_linked) {
                return { hasUpdates: false };
            }

            // Fetch latest calc job info
            const calcJobResponse = await fetch(`/api/v1/calc-jobs/${status.engineering_job_id}`);
            if (!calcJobResponse.ok) {
                return { hasUpdates: false };
            }

            const calcJob = await calcJobResponse.json();
            const calcJobUpdatedAt = new Date(calcJob.updated_at);
            const lastSyncAt = new Date(status.last_sync_at || 0);

            return {
                hasUpdates: calcJobUpdatedAt > lastSyncAt,
                calcJobUpdatedAt: calcJob.updated_at,
                lastSyncAt: status.last_sync_at,
                calcJobId: status.engineering_job_id
            };
        } catch (err) {
            console.error('Failed to check for updates:', err);
            return { hasUpdates: false };
        }
    }

    /**
     * Start auto-refresh polling (30s interval)
     */
    function startAutoRefresh(caseId, onUpdateDetected) {
        // Clear any existing interval
        stopAutoRefresh();

        // Initial check
        checkForUpdates(caseId).then(result => {
            if (result.hasUpdates && onUpdateDetected) {
                onUpdateDetected(result);
            }
        });

        // Start polling every 30 seconds
        pollInterval = setInterval(async () => {
            const result = await checkForUpdates(caseId);

            if (result.hasUpdates && onUpdateDetected) {
                onUpdateDetected(result);
            }

            lastCheckTimestamp.value = new Date().toISOString();
        }, 30000); // 30 seconds

        return () => stopAutoRefresh();
    }

    /**
     * Stop auto-refresh polling
     */
    function stopAutoRefresh() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    /**
     * Unlink engineering calculation from permit case
     */
    async function unlinkEngineering(caseId) {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`/api/v1/permit-cases/${caseId}/unlink-engineering`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to unlink engineering');
            }

            return await response.json();
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Get engineering diff (for diff viewer)
     */
    async function getEngineeringDiff(caseId) {
        try {
            const status = await getEngineeringStatus(caseId);

            if (!status.is_linked) {
                throw new Error('No engineering job linked');
            }

            return {
                calcJobId: status.engineering_job_id,
                lastSyncAt: status.last_sync_at,
                availableData: status.available_data
            };
        } catch (err) {
            error.value = err.message;
            throw err;
        }
    }

    return {
        loading,
        error,
        linkEngineering,
        syncEngineering,
        unlinkEngineering,
        getEngineeringStatus,
        detectOverride,
        isEngineeringSourced,
        // Phase 2.3: Auto-refresh
        checkForUpdates,
        startAutoRefresh,
        stopAutoRefresh,
        getEngineeringDiff,
        lastCheckTimestamp
    };
}
