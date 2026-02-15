import { ref } from 'vue';

/**
 * Composable for Bulk Operations on Permits
 * 
 * Handles multi-select and batch operations on permit cases
 */
export function useBulkOperations() {
    const selectedCaseIds = ref(new Set());
    const isProcessing = ref(false);
    const progress = ref({ current: 0, total: 0 });
    const results = ref([]);

    /**
     * Toggle case selection
     */
    const toggleSelection = (caseId) => {
        if (selectedCaseIds.value.has(caseId)) {
            selectedCaseIds.value.delete(caseId);
        } else {
            selectedCaseIds.value.add(caseId);
        }
        // Trigger reactivity
        selectedCaseIds.value = new Set(selectedCaseIds.value);
    };

    /**
     * Select all cases
     */
    const selectAll = (caseIds) => {
        selectedCaseIds.value = new Set(caseIds);
    };

    /**
     * Clear selection
     */
    const clearSelection = () => {
        selectedCaseIds.value = new Set();
    };

    /**
     * Check if case is selected
     */
    const isSelected = (caseId) => {
        return selectedCaseIds.value.has(caseId);
    };

    /**
     * Get selected count
     */
    const getSelectedCount = () => {
        return selectedCaseIds.value.size;
    };

    /**
     * Bulk sync engineering data
     */
    const bulkSync = async (options = {}) => {
        if (selectedCaseIds.value.size === 0) {
            throw new Error('No cases selected');
        }

        isProcessing.value = true;
        progress.value = { current: 0, total: selectedCaseIds.value.size };
        results.value = [];

        try {
            const response = await fetch('/api/v1/permit-cases/bulk/bulk-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    case_ids: Array.from(selectedCaseIds.value),
                    preserve_overrides: options.preserveOverrides !== false,
                    fail_fast: options.failFast || false
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Bulk sync failed');
            }

            const data = await response.json();
            results.value = data.results;
            progress.value.current = data.succeeded + data.failed;

            return data;
        } catch (error) {
            console.error('Bulk sync error:', error);
            throw error;
        } finally {
            isProcessing.value = false;
        }
    };

    /**
     * Bulk link engineering
     */
    const bulkLink = async (calcJobId, options = {}) => {
        if (selectedCaseIds.value.size === 0) {
            throw new Error('No cases selected');
        }

        if (!calcJobId) {
            throw new Error('Calc job ID required');
        }

        isProcessing.value = true;
        progress.value = { current: 0, total: selectedCaseIds.value.size };
        results.value = [];

        try {
            const response = await fetch('/api/v1/permit-cases/bulk/bulk-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    case_ids: Array.from(selectedCaseIds.value),
                    calc_job_id: calcJobId,
                    overwrite_existing: options.overwriteExisting || false
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Bulk link failed');
            }

            const data = await response.json();
            results.value = data.results;
            progress.value.current = data.linked + data.skipped + data.failed;

            return data;
        } catch (error) {
            console.error('Bulk link error:', error);
            throw error;
        } finally {
            isProcessing.value = false;
        }
    };

    /**
     * Get bulk operation summary
     */
    const getBulkSummary = async () => {
        if (selectedCaseIds.value.size === 0) {
            return null;
        }

        try {
            const response = await fetch('/api/v1/permit-cases/bulk/bulk-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    case_ids: Array.from(selectedCaseIds.value)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get bulk summary');
            }

            return await response.json();
        } catch (error) {
            console.error('Get bulk summary error:', error);
            return null;
        }
    };

    return {
        // State
        selectedCaseIds,
        isProcessing,
        progress,
        results,

        // Selection methods
        toggleSelection,
        selectAll,
        clearSelection,
        isSelected,
        getSelectedCount,

        // Bulk operations
        bulkSync,
        bulkLink,
        getBulkSummary
    };
}
