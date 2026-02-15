import { ref, computed, watch, inject } from "vue";
import UsersAdminController from "@/controllers/users_admin/users_admin_controller";
import { useI18n } from "vue-i18n";
import SubscriptionPlansController from "@/controllers/subscription_plans/subscription_plans_controller";

export const useUsersAdmin = (showMessage = null) => {
  const setGlobalLoading = inject("setGlobalLoading", () => {});
  const { t } = useI18n();
  const users = ref([]);
  const fields = ref([]);
  const searchQuery = ref("");
  const filterType = ref("");
  const sortBy = ref("");
  const sortDesc = ref(false);

  // Pagination state
  const currentPage = ref(1);
  const itemsPerPage = ref(10);

  const plans = ref([]);

  // Free plan is fixed
  const freePlan = ref({
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
  });

  // User form state
  const userForm = ref({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userType: "",
    mobileNumber: "",
    companyName: "",
    companyWebsite: "",
    companyADStreet: "",
    companyADCity: "",
    companyADState: "",
    companyADZipcode: "",
    companyADCountry: "",
    disclaimer: "",
    // isActive: true,
  });

  // Password change state
  const passwordForm = ref({
    userId: null,
    newPassword: "",
    confirmPassword: "",
  });

  // Plan switch state
  const planForm = ref({
    userId: null,
    newPlan: -1,
  });

  // Cancel plan state
  const cancelPlanForm = ref({
    userId: null,
    reason: "",
  });

  // Freeze user state
  const freezeForm = ref({
    userId: null,
    reason: "",
  });

  // UI state
  const showUserModal = ref(false);
  const showPasswordModal = ref(false);
  const showPlanModal = ref(false);
  const showCancelPlanModal = ref(false);
  const showFreezeModal = ref(false);
  const isEditing = ref(false);

  // Use provided showMessage or fallback to console.log
  const displayMessage = (messageObj) => {
    if (showMessage) {
      showMessage(messageObj);
    } else {
      console.log(`${messageObj.status}: ${messageObj.message}`);
    }
  };

  // Load plans
  const loadPlans = async () => {
    try {
      const res = await SubscriptionPlansController.getSubscriptionPlans();
      if (res.result) {
        plans.value = [
          freePlan.value,
          ...res.data.map((plan) => ({
            ...plan,
            features: JSON.parse(plan.features),
          })),
        ];

        // console.log(plans.value);
      }
    } catch (error) {
      console.error(error);
      displayMessage({ status: "error", message: error.message });
    }
  };

  const getUsers = async () => {
    try {
      const res = await UsersAdminController.getUsers();
      //   console.log(res);
      if (res.result) {
        users.value = res.data;
      } else {
        users.value = [];
        displayMessage({ status: "error", message: res.message });
      }
    } catch (error) {
      console.log(error);
      users.value = [];
      displayMessage({ status: "error", message: t("failedToFetchUsers") });
    }
  };

  const getUser = async (id) => {
    try {
      const res = await UsersAdminController.getUser(id);
      if (res.result) {
        return res.data;
      } else {
        displayMessage({ status: "error", message: res.message });
        return null;
      }
    } catch (error) {
      console.log(error);
      displayMessage({ status: "error", message: t("failedToFetchUser") });
      return null;
    }
  };

  const addUser = async (data) => {
    setGlobalLoading(true);
    try {
      data = {
        FirstName: data.firstName,
        LastName: data.lastName,
        Email: data.email,
        Password: data.password,
        UserType: data.userType,
        MobileNumber: data.mobilePhone,
        CompanyName: data.companyName,
        CompanyWebsite: data.companyWebsite,
        CompanyADStreet: data.companyADStreet,
        CompanyADCity: data.companyADCity,
        CompanyADState: data.companyADState,
        CompanyADZipcode: data.companyADZipcode,
        CompanyADCountry: data.companyADCountry,
        Disclaimer: data.disclaimer,
      };
      const res = await UsersAdminController.addUser(data);
      if (res.result) {
        displayMessage({ status: "success", message: res.message });
        await getUsers();
        resetUserForm();
        showUserModal.value = false;
        return true;
      } else {
        displayMessage({ status: "error", message: res.message });
        return false;
      }
    } catch (error) {
      console.log(error);
      displayMessage({ status: "error", message: t("failedToAddUser") });
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const updateUser = async (data) => {
    setGlobalLoading(true);
    try {
      data = {
        Id: data.id,
        FirstName: data.firstName,
        LastName: data.lastName,
        UserType: data.userType,
        MobileNumber: data.mobilePhone,
        CompanyName: data.companyName,
        CompanyWebsite: data.companyWebsite,
        CompanyADStreet: data.companyADStreet,
        CompanyADCity: data.companyADCity,
        CompanyADState: data.companyADState,
        CompanyADZipcode: data.companyADZipcode,
        CompanyADCountry: data.companyADCountry,
        Disclaimer: data.disclaimer,
      };

      //   console.log(data);

      const res = await UsersAdminController.updateUser(data);
      if (res.result) {
        displayMessage({ status: "success", message: res.message });
        await getUsers();
        resetUserForm();
        showUserModal.value = false;
        return true;
      } else {
        displayMessage({ status: "error", message: res.message });
        return false;
      }
    } catch (error) {
      console.log(error);
      displayMessage({ status: "error", message: t("failedToUpdateUser") });
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const changeUserPassword = async (data) => {
    setGlobalLoading(true);
    try {
      data = {
        Id: data.userId,
        NewPassword: data.newPassword,
      };
      const res = await UsersAdminController.changeUserPassword(data);
      if (res.result) {
        displayMessage({ status: "success", message: res.message });
        resetPasswordForm();
        showPasswordModal.value = false;
        return true;
      } else {
        displayMessage({ status: "error", message: res.message });
        return false;
      }
    } catch (error) {
      console.log(error);
      displayMessage({ status: "error", message: t("failedToChangePassword") });
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const freezeUser = async (data) => {
    setGlobalLoading(true);
    try {
      const res = await UsersAdminController.freezeUser({
        Id: data.userId,
        Reason: data.reason,
      });
      if (res.result) {
        displayMessage({ status: "success", message: res.message });
        await getUsers();
        resetFreezeForm();
        showFreezeModal.value = false;
        return true;
      } else {
        displayMessage({ status: "error", message: res.message });
        return false;
      }
    } catch (error) {
      console.log(error);
      displayMessage({ status: "error", message: t("failedToFreezeUser") });
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const unfreezeUser = async (userId) => {
    setGlobalLoading(true);
    try {
      const res = await UsersAdminController.unfreezeUser({
        Id: userId,
        Reason: "",
      });
      if (res.result) {
        displayMessage({ status: "success", message: res.message });
        await getUsers();
        return true;
      } else {
        displayMessage({ status: "error", message: res.message });
        return false;
      }
    } catch (error) {
      console.log(error);
      displayMessage({ status: "error", message: t("failedToUnfreezeUser") });
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const switchUserPlan = async (data) => {
    setGlobalLoading(true);
    try {
      data = {
        UserId: data.userId,
        CustomerId: String(data.userId),
        SubscriptionPlanId: data.newPlan,
        PlanName: plans.value.find((e) => e.id === data.newPlan).name,
        CorePlanData: JSON.stringify(
          plans.value.find((e) => e.id === data.newPlan)
        ),
        PaymentMethodId: "",
      };

      const res = await UsersAdminController.switchUserPlan(data);
      if (res.result) {
        displayMessage({ status: "success", message: res.message });
        await getUsers();
        resetPlanForm();
        showPlanModal.value = false;
        return true;
      } else {
        displayMessage({ status: "error", message: res.message });
        return false;
      }
    } catch (error) {
      console.log(error);
      displayMessage({ status: "error", message: t("failedToSwitchUserPlan") });
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const cancelUserPlan = async (data) => {
    setGlobalLoading(true);
    try {
      const res = await UsersAdminController.cancelUserPlan(data.userId);
      //   console.log(res);
      if (res.result) {
        displayMessage({ status: "success", message: res.message });
        await getUsers();
        resetCancelPlanForm();
        showCancelPlanModal.value = false;
        return true;
      } else {
        resetCancelPlanForm();
        showCancelPlanModal.value = false;
        displayMessage({ status: "error", message: res.message });
        return false;
      }
    } catch (error) {
      console.log(error);
      displayMessage({ status: "error", message: t("failedToCancelUserPlan") });
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setGlobalLoading(true);
    try {
      const res = await UsersAdminController.deleteUser(id);
      if (res.result) {
        displayMessage({ status: "success", message: res.message });
        await getUsers();
        return true;
      } else {
        displayMessage({ status: "error", message: res.message });
        return false;
      }
    } catch (error) {
      console.log(error);
      displayMessage({ status: "error", message: t("failedToDeleteUser") });
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  // Form management functions
  const openUserModal = (user = null) => {
    if (user) {
      userForm.value = { ...user, id: user.userId };
      //   console.log(userForm.value);
      isEditing.value = true;
    } else {
      resetUserForm();
      isEditing.value = false;
    }
    showUserModal.value = true;
  };

  const openPasswordModal = (userId) => {
    passwordForm.value.userId = userId;
    showPasswordModal.value = true;
  };

  const openPlanModal = (userId, currentPlan) => {
    planForm.value.userId = userId;
    // planForm.value.newPlan = currentPlan;
    if (currentPlan) {
      planForm.value.newPlan = JSON.parse(currentPlan.planData).id;
    } else {
      planForm.value.newPlan = -1;
    }
    showPlanModal.value = true;
  };

  const openFreezeModal = (userId) => {
    freezeForm.value.userId = userId;
    showFreezeModal.value = true;
  };

  const openCancelPlanModal = (userId) => {
    cancelPlanForm.value.userId = userId;
    showCancelPlanModal.value = true;
  };

  const closeFreezeModal = () => {
    showFreezeModal.value = false;
    resetFreezeForm();
  };

  const closeCancelPlanModal = () => {
    showCancelPlanModal.value = false;
    resetCancelPlanForm();
  };

  const resetUserForm = () => {
    userForm.value = {
      ...userForm.value,
      ...{
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        userType: "",
        mobileNumber: "",
        companyName: "",
        companyWebsite: "",
        companyADStreet: "",
        companyADCity: "",
        companyADState: "",
        companyADZipcode: "",
        // companyADCountry: "",
        disclaimer: "",
        isActive: true,
      },
    };
  };

  const resetPasswordForm = () => {
    passwordForm.value = {
      userId: null,
      newPassword: "",
      confirmPassword: "",
    };
  };

  const resetPlanForm = () => {
    planForm.value = {
      userId: null,
      newPlan: "",
    };
  };

  const resetFreezeForm = () => {
    freezeForm.value = {
      userId: null,
      reason: "",
    };
  };

  const resetCancelPlanForm = () => {
    cancelPlanForm.value = {
      userId: null,
      reason: "",
    };
  };

  // Form submission handlers
  const handleUserSubmit = async () => {
    if (isEditing.value) {
      await updateUser(userForm.value);
    } else {
      await addUser(userForm.value);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      displayMessage({ status: "error", message: t("passwordsDoNotMatch") });
      return;
    }
    await changeUserPassword(passwordForm.value);
  };

  const handlePlanSubmit = async () => {
    // console.log(planForm.value);
    await switchUserPlan(planForm.value);
  };

  const handleFreezeSubmit = async () => {
    if (!freezeForm.value.reason.trim()) {
      displayMessage({ status: "error", message: t("freezeReasonRequired") });
      return;
    }
    await freezeUser(freezeForm.value);
  };

  const handleCancelPlanSubmit = async () => {
    // if (!cancelPlanForm.value.reason.trim()) {
    //   showMessage({ status: "error", message: t("cancelPlanReasonRequired") });
    //   return;
    // }
    await cancelUserPlan(cancelPlanForm.value);
  };

  // Filtering and sorting
  const filteredUsers = computed(() => {
    let filtered = users.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query)
      );
    }

    if (filterType.value) {
      if (filterType.value === "Trial") {
        filtered = filtered
          .filter((e) => e.plan === null || e.plan === undefined)
          .filter((e) => !e.isExpired);
      } else if (filterType.value === "TrialExpired") {
        filtered = filtered
          .filter((e) => e.plan === null || e.plan === undefined)
          .filter((e) => e.isExpired);
      } else
        filtered = filtered
          .filter((e) => e.plan)
          .filter(
            (user) => JSON.parse(user.plan.planData).name === filterType.value
          );
    }

    if (sortBy.value) {
      filtered.sort((a, b) => {
        const aVal = a[sortBy.value];
        const bVal = b[sortBy.value];

        if (sortDesc.value) {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  });

  // Paginated users
  const paginatedUsers = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    return filteredUsers.value.slice(startIndex, endIndex);
  });

  // Pagination info
  const totalPages = computed(() => {
    return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
  });

  const totalItems = computed(() => {
    return filteredUsers.value.length;
  });

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

  const getData = async () => {
    setGlobalLoading(true);

    try {
      //   await getUsers();
      // await loadPlans();

      await Promise.all([getUsers(), loadPlans()]);
    } catch (error) {
      console.log(error);
    }

    setGlobalLoading(false);
  };

  // Add a watcher to reset pagination to page 1 when search query or filter type changes
  watch(searchQuery, () => {
    resetPagination();
  });

  watch(filterType, () => {
    resetPagination();
  });

  watch(itemsPerPage, () => {
    resetPagination();
  });

  return {
    // State
    users,
    fields,
    searchQuery,
    filterType,
    sortBy,
    sortDesc,
    currentPage,
    itemsPerPage,
    userForm,
    passwordForm,
    planForm,
    cancelPlanForm,
    freezeForm,
    showUserModal,
    showPasswordModal,
    showPlanModal,
    showCancelPlanModal,
    showFreezeModal,
    isEditing,
    filteredUsers,
    paginatedUsers,
    totalPages,
    totalItems,
    plans,

    // Functions
    getData,
    getUsers,
    getUser,
    addUser,
    updateUser,
    changeUserPassword,
    freezeUser,
    unfreezeUser,
    switchUserPlan,
    cancelUserPlan,
    deleteUser,
    loadPlans,

    // Form management
    openUserModal,
    openPasswordModal,
    openPlanModal,
    openFreezeModal,
    openCancelPlanModal,
    closeFreezeModal,
    closeCancelPlanModal,
    resetUserForm,
    resetPasswordForm,
    resetPlanForm,
    resetFreezeForm,
    resetCancelPlanForm,

    // Form submissions
    handleUserSubmit,
    handlePasswordSubmit,
    handlePlanSubmit,
    handleFreezeSubmit,
    handleCancelPlanSubmit,

    // Pagination
    goToPage,
    nextPage,
    previousPage,
    resetPagination,
  };
};
