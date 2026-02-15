import { ref, computed } from "vue";
import AccountRequestsController from "@/controllers/account_requests/account_requests_controller.js";

export function useAccountRequests() {
  const requests = ref([]);
  const archivedRequests = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const activeRequests = computed(() =>
    requests.value.filter((request) => !request.archived)
  );

  const pendingRequests = computed(() =>
    activeRequests.value.filter((request) => request.status === "Pending")
  );

  const approvedRequests = computed(() =>
    activeRequests.value.filter((request) => request.status === "Approved")
  );

  const rejectedRequests = computed(() =>
    activeRequests.value.filter((request) => request.status === "Rejected")
  );

  const loadRequests = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await AccountRequestsController.getAccountRequests();
      if (response.result) {
        requests.value = response.data || [];
      } else {
        error.value = response.message;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const loadArchivedRequests = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response =
        await AccountRequestsController.getArchivedAccountRequests();
      if (response.result) {
        archivedRequests.value = response.data || [];
      } else {
        error.value = response.message;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const addRequest = async (requestData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await AccountRequestsController.addAccountRequest(
        requestData
      );
      if (response.result) {
        await loadRequests();
        return { success: true, data: response.data };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  };

  const updateRequest = async (requestData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await AccountRequestsController.updateAccountRequest(
        requestData
      );
      if (response.result) {
        await loadRequests();
        return { success: true, data: response.data };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  };

  const updateRequestStatus = async (requestData) => {
    loading.value = true;
    error.value = null;
    try {
      const response =
        await AccountRequestsController.updateAccountRequestStatus(requestData);
      if (response.result) {
        await loadRequests();
        return { success: true, data: response.data };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  };

  const deleteRequest = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await AccountRequestsController.deleteAccountRequest(id);
      if (response.result) {
        await loadRequests();
        return { success: true, data: response.data };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  };

  const archiveRequest = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await AccountRequestsController.archiveAccountRequest(
        id
      );
      if (response.result) {
        await loadRequests();
        return { success: true, data: response.data };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  };

  const unarchiveRequest = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await AccountRequestsController.unarchiveAccountRequest(
        id
      );
      if (response.result) {
        await loadRequests();
        await loadArchivedRequests();
        return { success: true, data: response.data };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  };

  const getRequestById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await AccountRequestsController.getAccountRequest(id);
      if (response.result) {
        return { success: true, data: response.data };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    requests,
    archivedRequests,
    loading,
    error,

    // Computed
    activeRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,

    // Methods
    loadRequests,
    loadArchivedRequests,
    addRequest,
    updateRequest,
    updateRequestStatus,
    deleteRequest,
    archiveRequest,
    unarchiveRequest,
    getRequestById,
  };
}
