/**
 * Pinia Store for US Permit Cases
 * Manages permit case state and API interactions
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { PermitCasesAPI } from '@/adapters/permitCasesAdapter';

// Debounce utility
function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

export const usePermitCaseStore = defineStore('permitCase', () => {
    // State
    const currentCase = ref(null);
    const cases = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Computed
    const currentStatus = computed(() => currentCase.value?.status || 'draft');
    const isBlocked = computed(() => currentStatus.value === 'blocked');
    const isReady = computed(() => currentStatus.value === 'ready');

    const blockingIssues = computed(() => {
        if (!currentCase.value?.rollup?.validation) return [];
        return currentCase.value.rollup.validation.blockingIssues || [];
    });

    const warnings = computed(() => {
        if (!currentCase.value?.rollup?.validation) return [];
        return currentCase.value.rollup.validation.warnings || [];
    });

    const conflicts = computed(() => {
        if (!currentCase.value?.rollup?.conflicts) return [];
        return currentCase.value.rollup.conflicts || [];
    });

    const blockingConflicts = computed(() => {
        return conflicts.value.filter(c => c.severity === 'block');
    });

    const requiredItems = computed(() => {
        if (!currentCase.value?.rollup?.rollup?.requiredItems) return [];
        return currentCase.value.rollup.rollup.requiredItems || [];
    });

    const globalConstraints = computed(() => {
        if (!currentCase.value?.rollup?.rollup?.globalConstraints) return null;
        return currentCase.value.rollup.rollup.globalConstraints;
    });

    const statesInRoute = computed(() => {
        if (!currentCase.value?.payload?.route?.statesInRoute) return [];
        return currentCase.value.payload.route.statesInRoute;
    });

    const decisions = computed(() => {
        if (!currentCase.value?.rollup?.decisions) return [];
        return currentCase.value.rollup.decisions || [];
    });

    // Actions
    async function createCase(projectId, routeId, title) {
        loading.value = true;
        error.value = null;

        try {
            const response = await PermitCasesAPI.createUSPermitCase(projectId, routeId, title);

            if (response.result) {
                currentCase.value = response.data;
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to create permit case');
            }
        } catch (err) {
            error.value = err.message || 'An error occurred';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function loadCase(caseId) {
        loading.value = true;
        error.value = null;

        try {
            const response = await PermitCasesAPI.getPermitCase(caseId);

            if (response.result) {
                currentCase.value = response.data;
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load permit case');
            }
        } catch (err) {
            error.value = err.message || 'An error occurred';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updatePayload(caseId, partialPayload) {
        try {
            const response = await PermitCasesAPI.updatePermitCase(caseId, partialPayload);

            if (response.result) {
                currentCase.value = response.data;
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to update permit case');
            }
        } catch (err) {
            error.value = err.message || 'An error occurred updating payload';
            throw err;
        }
    }

    // Debounced update for auto-save (500ms delay)
    const debouncedUpdate = debounce(updatePayload, 500);

    async function updatePayloadDebounced(caseId, partialPayload) {
        return debouncedUpdate(caseId, partialPayload);
    }

    async function loadProjectCases(projectId) {
        loading.value = true;
        error.value = null;

        try {
            const response = await PermitCasesAPI.getProjectPermitCases(projectId);

            if (response.result) {
                cases.value = response.data;
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load project permit cases');
            }
        } catch (err) {
            error.value = err.message || 'An error occurred';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    function clearCurrentCase() {
        currentCase.value = null;
        error.value = null;
    }

    return {
        // State
        currentCase,
        cases,
        loading,
        error,

        // Computed
        currentStatus,
        isBlocked,
        isReady,
        blockingIssues,
        warnings,
        conflicts,
        blockingConflicts,
        requiredItems,
        globalConstraints,
        statesInRoute,
        decisions,

        // Actions
        createCase,
        loadCase,
        updatePayload,
        updatePayloadDebounced,
        loadProjectCases,
        clearCurrentCase
    };
});
