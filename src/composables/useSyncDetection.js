import { ref, onUnmounted } from 'vue';

/**
 * Composable for Real-time Sync Detection
 * 
 * Polls engineering status to detect when linked calc jobs are updated
 * and permits are out of sync.
 */
export function useSyncDetection(caseId, options = {}) {
    const intervalMs = options.intervalMs || 30000; // 30 seconds default
    const enabled = options.enabled !== false; // Default to enabled

    const isOutOfSync = ref(false);
    const lastCheckTime = ref(null);
    const isPolling = ref(false);
    const error = ref(null);
    const syncStatus = ref(null);

    let pollInterval = null;

    /**
     * Check current sync status
     */
    const checkSyncStatus = async () => {
        if (!caseId) return null;

        try {
            const response = await fetch(`/api/v1/permit-cases/${caseId}/engineering-status`);

            if (!response.ok) {
                throw new Error('Failed to check sync status');
            }

            const status = await response.json();
            syncStatus.value = status;
            isOutOfSync.value = status.is_out_of_sync || false;
            lastCheckTime.value = new Date();
            error.value = null;

            return status;
        } catch (err) {
            error.value = err.message;
            console.error('Sync detection error:', err);
            return null;
        }
    };

    /**
     * Start polling for sync status
     */
    const startPolling = async () => {
        if (!enabled || isPolling.value) return;

        isPolling.value = true;

        // Initial check
        await checkSyncStatus();

        // Set up interval
        pollInterval = setInterval(async () => {
            await checkSyncStatus();
        }, intervalMs);
    };

    /**
     * Stop polling
     */
    const stopPolling = () => {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
        isPolling.value = false;
    };

    /**
     * Reset detection state
     */
    const reset = () => {
        stopPolling();
        isOutOfSync.value = false;
        lastCheckTime.value = null;
        syncStatus.value = null;
        error.value = null;
    };

    // Auto-cleanup on unmount
    onUnmounted(() => {
        stopPolling();
    });

    return {
        // State
        isOutOfSync,
        lastCheckTime,
        isPolling,
        error,
        syncStatus,

        // Methods
        startPolling,
        stopPolling,
        checkSyncStatus,
        reset
    };
}
