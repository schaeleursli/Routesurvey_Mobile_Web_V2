import { ref, computed, watch, inject } from "vue";
import OrganizationsAdminController from "@/controllers/organizations_admin/organizations_admin_controller";
import { useI18n } from "vue-i18n";
import Cookies from "js-cookie";

export const useOrganizationsAdmin = (showMessage = null) => {
  const setGlobalLoading = inject("setGlobalLoading", () => {});
  const { t } = useI18n();

  // State
  const organizations = ref([]);
  const searchQuery = ref("");
  const filterType = ref("");
  const sortBy = ref("");
  const sortDesc = ref(false);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const loading = ref(false);
  const plans = ref([]);

  // Organization form state
  const organizationForm = ref({
    id: null,
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
    email: "",
    website: "",
  });

  // User assignment form state
  const userAssignmentForm = ref({
    organizationId: "",
    userId: "",
    userType: "User", // User, OrgManager, OrgAdmin
  });

  // Plan form state
  const planForm = ref({
    userId: "",
    newPlan: "",
  });

  const cancelPlanForm = ref({
    userId: "",
  });

  // Modal states
  const showOrganizationModal = ref(false);
  const showUserAssignmentModal = ref(false);
  const showOrganizationDetailsModal = ref(false);
  const showPlanModal = ref(false);
  const showCancelPlanModal = ref(false);
  const isEditing = ref(false);
  const selectedOrganization = ref(null);

  // Computed properties
  const filteredOrganizations = computed(() => {
    let filtered = organizations.value;

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.name?.toLowerCase().includes(query) ||
          org.email?.toLowerCase().includes(query) ||
          org.city?.toLowerCase().includes(query) ||
          org.country?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType.value) {
      filtered = filtered.filter(
        (org) => org.active === (filterType.value === "active")
      );
    }

    return filtered;
  });

  const paginatedOrganizations = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredOrganizations.value.slice(start, end);
  });

  const totalPages = computed(() =>
    Math.ceil(filteredOrganizations.value.length / itemsPerPage.value)
  );

  const totalItems = computed(() => filteredOrganizations.value.length);

  // Filter options
  const filterOptions = computed(() => [
    { value: "", label: t("allOrganizations") },
    { value: "active", label: t("activeOrganizations") },
    { value: "inactive", label: t("inactiveOrganizations") },
  ]);

  const sortOptions = computed(() => [
    { value: "name", label: t("name") },
    { value: "email", label: t("email") },
    { value: "city", label: t("city") },
    { value: "dateAdded", label: t("dateAdded") },
  ]);

  const userTypeOptions = computed(() => [
    { value: "User", label: t("user") },
    { value: "OrgManager", label: t("organizationManager") },
    { value: "OrgAdmin", label: t("organizationAdmin") },
  ]);

  const countryOptions = computed(() => [
    { value: "", label: t("selectCountry") },
    { value: "United States", label: "🇺🇸 United States" },
    { value: "Canada", label: "🇨🇦 Canada" },
    { value: "United Kingdom", label: "🇬🇧 United Kingdom" },
    { value: "Australia", label: "🇦🇺 Australia" },
    { value: "Germany", label: "🇩🇪 Germany" },
    { value: "France", label: "🇫🇷 France" },
    { value: "Japan", label: "🇯🇵 Japan" },
    { value: "China", label: "🇨🇳 China" },
    { value: "India", label: "🇮🇳 India" },
    { value: "Brazil", label: "🇧🇷 Brazil" },
  ]);

  const planOptions = computed(() => [
    ...plans.value.map((plan) => ({
      value: plan.id,
      label: t(String(plan.name).toLowerCase()),
    })),
  ]);

  // Table columns
  const tableColumns = computed(() => [
    { key: "name", label: t("name"), sortable: true },
    { key: "email", label: t("email"), sortable: true },
    // { key: "city", label: t("city"), sortable: true },
    { key: "country", label: t("country"), sortable: true },
    // { key: "active", label: t("status"), sortable: true },
    { key: "dateAdded", label: t("dateAdded"), sortable: true },
    { key: "actions", label: t("actions"), sortable: false },
  ]);

  // Methods
  const getData = async () => {
    try {
      setGlobalLoading(true);
      loading.value = true;
      const response = await OrganizationsAdminController.getOrganizations();

      if (response.result) {
        organizations.value = response.data || [];
      } else {
        showMessage?.(response.message, "error");
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      showMessage?.(t("errorFetchingOrganizations"), "error");
    } finally {
      setGlobalLoading(false);
      loading.value = false;
    }
  };

  const openOrganizationModal = (organization = null) => {
    isEditing.value = !!organization;
    selectedOrganization.value = organization;

    if (organization) {
      organizationForm.value = {
        id: organization.id,
        name: organization.name || "",
        description: organization.description || "",
        address: organization.address || "",
        city: organization.city || "",
        state: organization.state || "",
        zipcode: organization.zipcode || "",
        country: organization.country || "",
        phone: organization.phone || "",
        email: organization.email || "",
        website: organization.website || "",
      };
    } else {
      resetOrganizationForm();
    }

    showOrganizationModal.value = true;
  };

  const closeOrganizationModal = () => {
    showOrganizationModal.value = false;
    resetOrganizationForm();
    isEditing.value = false;
    selectedOrganization.value = null;
  };

  const resetOrganizationForm = () => {
    organizationForm.value = {
      id: null,
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
      phone: "",
      email: "",
      website: "",
    };
  };

  const handleOrganizationSubmit = async () => {
    try {
      setGlobalLoading(true);

      const response = isEditing.value
        ? await OrganizationsAdminController.updateOrganization(
            organizationForm.value
          )
        : await OrganizationsAdminController.addOrganization(
            organizationForm.value
          );

      if (response.result) {
        showMessage?.(response.message, "success");
        closeOrganizationModal();
        await getData();
      } else {
        showMessage?.(response.message, "error");
      }
    } catch (error) {
      console.error("Error saving organization:", error);
      showMessage?.(t("errorSavingOrganization"), "error");
    } finally {
      setGlobalLoading(false);
    }
  };

  const deleteOrganization = async (organizationId) => {
    if (!confirm(t("confirmDeleteOrganization"))) return;

    try {
      setGlobalLoading(true);
      const response = await OrganizationsAdminController.deleteOrganization(
        organizationId
      );

      if (response.result) {
        showMessage?.(response.message, "success");
        await getData();
      } else {
        showMessage?.(response.message, "error");
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      showMessage?.(t("errorDeletingOrganization"), "error");
    } finally {
      setGlobalLoading(false);
    }
  };

  const openUserAssignmentModal = (organization) => {
    selectedOrganization.value = organization;
    userAssignmentForm.value.organizationId = organization.id;
    showUserAssignmentModal.value = true;
  };

  const closeUserAssignmentModal = () => {
    showUserAssignmentModal.value = false;
    userAssignmentForm.value = {
      organizationId: "",
      userId: "",
      userType: "User",
    };
    selectedOrganization.value = null;
  };

  const handleUserAssignmentSubmit = async () => {
    try {
      setGlobalLoading(true);

      const response =
        await OrganizationsAdminController.assignUserToOrganization(
          userAssignmentForm.value
        );

      if (response.result) {
        showMessage?.(response.message, "success");
        closeUserAssignmentModal();
      } else {
        showMessage?.(response.message, "error");
      }
    } catch (error) {
      console.error("Error assigning user:", error);
      showMessage?.(t("errorAssigningUser"), "error");
    } finally {
      setGlobalLoading(false);
    }
  };

  const openOrganizationDetails = (organization) => {
    selectedOrganization.value = organization;
    showOrganizationDetailsModal.value = true;
  };

  const closeOrganizationDetails = () => {
    showOrganizationDetailsModal.value = false;
    selectedOrganization.value = null;
  };

  // Pagination methods
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const resetPagination = () => {
    currentPage.value = 1;
  };

  // User management methods
  const getOrganizationUsers = async (organizationId) => {
    try {
      const response = await OrganizationsAdminController.getOrganizationUsers(
        organizationId
      );
      // console.log(response);
      if (response.result) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching organization users:", error);
      throw error;
    }
  };

  const getManagerUsers = async () => {
    try {
      const managerId = Number(Cookies.get("login_user_id"));

      const response = await OrganizationsAdminController.getManagerUsers(
        managerId
      );
      if (response.result) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching manager users:", error);
      return [];
    }
  };

  const addOrganizationUser = async (userData) => {
    try {
      // console.log(userData);
      const response = await OrganizationsAdminController.addOrganizationUser(
        userData
      );
      // console.log(response);
      return response;
    } catch (error) {
      console.error("Error adding user to organization:", error);
      throw error;
    }
  };

  const updateOrganizationUser = async (userData) => {
    try {
      const response =
        await OrganizationsAdminController.updateOrganizationUser(userData);
      // console.log(response);
      return response;
    } catch (error) {
      console.error("Error updating organization user:", error);
      throw error;
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      const response = await OrganizationsAdminController.changeUserRole(
        userId,
        newRole
      );
      return response.data;
    } catch (error) {
      console.error("Error changing user role:", error);
      throw error;
    }
  };

  const getOrganization = async (organizationId) => {
    try {
      const response = await OrganizationsAdminController.getOrganization(
        organizationId
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching organization:", error);
      throw error;
    }
  };

  const removeUserFromOrganization = async (organizationId, userId) => {
    try {
      const response =
        await OrganizationsAdminController.removeUserFromOrganization(
          organizationId,
          userId
        );
      return response.data;
    } catch (error) {
      console.error("Error removing user from organization:", error);
      throw error;
    }
  };

  const updateOrganizationAdmin = async (userData) => {
    try {
      const response =
        await OrganizationsAdminController.updateOrganizationAdmin(userData);
      return response;
    } catch (error) {
      console.error("Error updating organization admin:", error);
      throw error;
    }
  };

  const updateOrganizationManager = async (userData) => {
    try {
      const response =
        await OrganizationsAdminController.updateOrganizationManager(userData);
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error updating organization manager:", error);
      throw error;
    }
  };

  const deleteOrganizationAdmin = async (adminId) => {
    try {
      const response =
        await OrganizationsAdminController.deleteOrganizationAdmin(adminId);
      return response;
    } catch (error) {
      console.error("Error deleting organization admin:", error);
      throw error;
    }
  };

  const deleteOrganizationManager = async (managerId) => {
    try {
      const response =
        await OrganizationsAdminController.deleteOrganizationManager(managerId);
      return response;
    } catch (error) {
      console.error("Error deleting organization manager:", error);
      throw error;
    }
  };

  const deleteOrganizationUser = async (userId) => {
    try {
      const response =
        await OrganizationsAdminController.deleteOrganizationUser(userId);
      return response;
    } catch (error) {
      console.error("Error deleting organization user:", error);
      throw error;
    }
  };

  const freezeOrganizationUser = async (userData) => {
    try {
      const response =
        await OrganizationsAdminController.freezeOrganizationUser({
          Id: userData.userId,
          Reason: userData.reason,
        });
      return response;
    } catch (error) {
      console.error("Error freezing organization user:", error);
      throw error;
    }
  };

  const unfreezeOrganizationUser = async (userData) => {
    try {
      const response =
        await OrganizationsAdminController.unfreezeOrganizationUser({
          Id: userData.userId,
          Reason: "",
        });
      return response;
    } catch (error) {
      console.error("Error unfreezing organization user:", error);
      throw error;
    }
  };

  const switchUserPlan = async (data) => {
    try {
      setGlobalLoading(true);

      const planData = {
        UserId: data.userId,
        CustomerId: String(data.userId),
        SubscriptionPlanId: data.newPlan,
        PlanName: plans.value.find((e) => e.id === data.newPlan)?.name || "",
        CorePlanData: JSON.stringify(
          plans.value.find((e) => e.id === data.newPlan)
        ),
        PaymentMethodId: "",
      };

      const response = await OrganizationsAdminController.switchUserPlan(
        planData
      );

      if (response.result) {
        showMessage?.({ message: response.message, status: "success" });
        return true;
      } else {
        showMessage?.({ message: response.message, status: "error" });
        return false;
      }
    } catch (error) {
      console.error("Error switching user plan:", error);
      showMessage?.({ message: t("failedToSwitchUserPlan"), status: "error" });
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const cancelUserPlan = async (userId) => {
    try {
      setGlobalLoading(true);

      const response = await OrganizationsAdminController.cancelUserPlan(
        userId
      );

      if (response.result) {
        showMessage?.({ message: response.message, status: "success" });
        return true;
      } else {
        showMessage?.({ message: response.message, status: "error" });
        return false;
      }
    } catch (error) {
      console.error("Error canceling user plan:", error);
      showMessage?.({ message: t("failedToCancelUserPlan"), status: "error" });
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const getSubscriptionPlans = async () => {
    try {
      const response =
        await OrganizationsAdminController.getSubscriptionPlans();

      if (response.result) {
        // Free plan is fixed
        const freePlan = {
          id: 0,
          name: "Core",
          price: 29,
          yearlyPrice: 300,
          billing: "monthly",
          features: {
            free_surveys: true,
            storage_space: true,
            manual_routes: true,
            survey_scheduling: true,
            route_optimization: false,
            multi_user: false,
            mobile_app: false,
            image_timestamp: true,
            export_options: false,
            data_encryption: false,
            backup_restore: false,
            api_access: false,
            mobile_report_editing: true,
            local_mobile_reports: true,
            report_generation: true,
            custom_templates: false,
            template_library: false,
            theme_modes: true,
            languages: true,
            whitelabel: false,
            custom_fields: false,
            template_builder: false,
            priority_support: false,
            training_resources: false,
            dedicated_manager: false,
          },
        };

        plans.value = [
          freePlan,
          ...(response.data || []).map((plan) => ({
            ...plan,
            features: JSON.parse(plan.features),
          })),
        ];
        return plans.value;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      return [];
    }
  };

  // Plan modal management
  const openPlanModal = (userId, currentPlan) => {
    planForm.value.userId = userId;
    if (currentPlan) {
      planForm.value.newPlan = JSON.parse(currentPlan.planData).id;
    } else {
      planForm.value.newPlan = "";
    }
    showPlanModal.value = true;
  };

  const closePlanModal = () => {
    showPlanModal.value = false;
    resetPlanForm();
  };

  const openCancelPlanModal = (userId) => {
    cancelPlanForm.value = {
      userId: userId,
    };
    showCancelPlanModal.value = true;
  };

  const closeCancelPlanModal = () => {
    showCancelPlanModal.value = false;
    resetCancelPlanForm();
  };

  const resetPlanForm = () => {
    planForm.value = {
      userId: "",
      newPlan: "",
    };
  };

  const resetCancelPlanForm = () => {
    cancelPlanForm.value = {
      userId: "",
    };
  };

  // Watch for search/filter changes to reset pagination
  watch([searchQuery, filterType], () => {
    resetPagination();
  });

  return {
    // State
    organizations,
    searchQuery,
    filterType,
    sortBy,
    sortDesc,
    currentPage,
    itemsPerPage,
    organizationForm,
    userAssignmentForm,
    planForm,
    cancelPlanForm,
    showOrganizationModal,
    showUserAssignmentModal,
    showOrganizationDetailsModal,
    showPlanModal,
    showCancelPlanModal,
    isEditing,
    selectedOrganization,
    loading,
    plans,
    filteredOrganizations,
    paginatedOrganizations,
    totalPages,
    totalItems,
    filterOptions,
    sortOptions,
    userTypeOptions,
    countryOptions,
    planOptions,
    tableColumns,

    // Methods
    getData,
    openOrganizationModal,
    closeOrganizationModal,
    handleOrganizationSubmit,
    deleteOrganization,
    openUserAssignmentModal,
    closeUserAssignmentModal,
    handleUserAssignmentSubmit,
    openOrganizationDetails,
    closeOrganizationDetails,
    resetOrganizationForm,
    goToPage,
    nextPage,
    previousPage,
    resetPagination,

    // User management methods
    getOrganization,
    getOrganizationUsers,
    getManagerUsers,
    addOrganizationUser,
    updateOrganizationUser,
    changeUserRole,
    removeUserFromOrganization,
    updateOrganizationAdmin,
    updateOrganizationManager,
    deleteOrganizationAdmin,
    deleteOrganizationManager,
    deleteOrganizationUser,
    freezeOrganizationUser,
    unfreezeOrganizationUser,

    // Plan management methods
    switchUserPlan,
    cancelUserPlan,
    getSubscriptionPlans,
    openPlanModal,
    closePlanModal,
    openCancelPlanModal,
    closeCancelPlanModal,
    resetPlanForm,
    resetCancelPlanForm,
  };
};
