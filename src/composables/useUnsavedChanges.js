
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

/**
 * Composable to handle unsaved changes protection
 * @param {Function} checkDirtyState - Function that returns true if there are unsaved changes
 * @returns {Object} State and handlers for the unsaved changes modal
 */
export function useUnsavedChanges(checkDirtyState) {
    const showUnsavedChangesModal = ref(false);
    const pendingNavigation = ref(null);
    const shouldBlockNavigation = ref(null);

    const confirmLeave = () => {
        shouldBlockNavigation.value = false;
        showUnsavedChangesModal.value = false;
        if (pendingNavigation.value) {
            const nav = pendingNavigation.value;
            pendingNavigation.value = null;
            nav();
        }
    };

    const cancelLeave = () => {
        showUnsavedChangesModal.value = false;
        pendingNavigation.value = null;
        shouldBlockNavigation.value = null;
    };

    const handleBeforeUnload = (e) => {
        if (checkDirtyState()) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    };

    // Router guard
    onBeforeRouteLeave((to, from, next) => {
        // If explicitly allowed (e.g. after save), proceed
        if (shouldBlockNavigation.value === false) {
            shouldBlockNavigation.value = null;
            next();
            return;
        }

        if (checkDirtyState()) {
            shouldBlockNavigation.value = true;
            showUnsavedChangesModal.value = true;
            pendingNavigation.value = () => {
                shouldBlockNavigation.value = false;
                next();
            };
        } else {
            next();
        }
    });

    onMounted(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    });

    return {
        showUnsavedChangesModal,
        confirmLeave,
        cancelLeave,
        // Helper to manually trigger "allow navigation" (e.g. after successful save)
        allowNextNavigation: () => { shouldBlockNavigation.value = false; }
    };
}
