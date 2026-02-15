import { ref, onMounted } from "vue";
import csrfManager from "@/utils/csrf-manager";

export function useCsrf() {
  const isCsrfAvailable = ref(false);
  const isCsrfInitialized = ref(false);
  const csrfError = ref(null);

  /**
   * Initialize CSRF protection
   */
  const initCsrf = async () => {
    try {
      csrfError.value = null;
      await csrfManager.init();
      isCsrfAvailable.value = csrfManager.isAvailable();
      isCsrfInitialized.value = true;
    } catch (error) {
      csrfError.value = error.message;
      isCsrfAvailable.value = false;
      isCsrfInitialized.value = true;
    }
  };

  /**
   * Refresh CSRF token
   */
  const refreshCsrfToken = async () => {
    try {
      csrfError.value = null;
      await csrfManager.refreshToken();
      isCsrfAvailable.value = csrfManager.isAvailable();
    } catch (error) {
      csrfError.value = error.message;
      isCsrfAvailable.value = false;
    }
  };

  /**
   * Clear CSRF token
   */
  const clearCsrfToken = () => {
    csrfManager.clearToken();
    isCsrfAvailable.value = false;
    csrfError.value = null;
  };

  /**
   * Get current CSRF token
   */
  const getCsrfToken = () => {
    return csrfManager.getToken();
  };

  /**
   * Check if CSRF protection is available
   */
  const checkCsrfAvailability = () => {
    isCsrfAvailable.value = csrfManager.isAvailable();
    return isCsrfAvailable.value;
  };

  // Initialize CSRF on component mount
  onMounted(() => {
    if (!isCsrfInitialized.value) {
      initCsrf();
    }
  });

  return {
    // State
    isCsrfAvailable,
    isCsrfInitialized,
    csrfError,

    // Methods
    initCsrf,
    refreshCsrfToken,
    clearCsrfToken,
    getCsrfToken,
    checkCsrfAvailability,
  };
}
