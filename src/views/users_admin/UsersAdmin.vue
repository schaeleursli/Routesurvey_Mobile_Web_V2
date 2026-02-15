<template>
    <div class="users-admin" v-if="userType === 'RestrictedAdmin' || userType === 'Admin'">
        <BasePanel :title="t('userManagement')" subtitle="Manage user accounts and permissions" elevation="level2"
            :scrollable="true">
            <template #header>
                <div class="users-admin__header">
                    <BaseButton @click="openUserModal()" variant="primary" size="medium">
                         <template #icon-left>
                            <PhPlus :size="20" />
                        </template>
                        {{ t('addNewUser') }}
                    </BaseButton>
                </div>
            </template>

            <div class="users-admin__content">
                <!-- Search and Filter Controls -->
                <BaseCard class="users-admin__filters">
                    <div class="users-admin__filters-content">

                        <div class="users-admin__filters-row">
                            <BaseFormField v-model="filterType" type="select" :label="t('filterByPlan')"
                                class="users-admin__filter-field" :options="planFilterOptions" />
                            <BaseFormField v-model="sortBy" type="select" :label="t('sortBy')"
                                class="users-admin__filter-field" :options="sortOptions" />
                        </div>
                    </div>
                </BaseCard>

                <!-- Users Table -->
                <BaseCard class="users-admin__table-card">
                    <BaseTable :items="paginatedUsers" :columns="tableColumns" :sort-column="sortBy"
                        :sort-direction="sortDesc ? 'desc' : 'asc'" @sort="handleSort"
                        class="users-admin__table users-admin__table--compact">
                        <!-- Name Column -->
                        <template #cell-name="{ item }">
                            <div class="users-admin__user-info">
                                <div class="users-admin__user-name">{{ item.firstName }} {{ item.lastName }}</div>
                                <div class="users-admin__user-email">{{ item.email }}</div>
                            </div>
                        </template>

                        <!-- Phone Column -->
                        <template #cell-phone="{ item }">
                            <span class="users-admin__phone">{{ item.mobilePhone || '-' }}</span>
                        </template>

                        <!-- Plan Column -->
                        <template #cell-plan="{ item }">
                            <div class="users-admin__plan-info">
                                <div class="users-admin__plan-badge" :class="getPlanBadgeClass(item)">
                                    {{ getPlanTitle(item) }}
                                </div>
                                <div v-if="getBillingCycle(item)" class="users-admin__billing-cycle">
                                    <PhCalendarBlank :size="14" />
                                    <span>{{ getBillingCycle(item) }}</span>
                                </div>
                            </div>
                        </template>

                        <!-- Status Column -->
                        <template #cell-status="{ item }">
                            <div class="users-admin__status-badge" :class="getStatusBadgeClass(item)">
                                <component :is="item.suspend ? PhPauseCircle : PhCheckCircle" :size="14" />
                                {{ item.suspend ? t('suspended') : t('active') }}
                            </div>
                        </template>

                        <!-- Type Column -->
                        <template #cell-type="{ item }">
                            <div class="users-admin__user-type">
                                <span :class="getUserTypeClass(item.userType)">
                                    {{ item.userType === 'Admin' ? t('admin') : item.userType === 'RestrictedAdmin' ?
                                        t('restrictedAdmin') : item.userType === 'OrgManager' ? t('organizationManager') :
                                            item.userType === 'OrgAdmin' ? t('organizationAdmin') : t('user') }}
                                </span>
                            </div>
                        </template>

                        <!-- Actions Column -->
                        <template #cell-actions="{ item }">
                            <div class="users-admin__actions">
                                <div class="users-admin__action-row">
                                    <div class="users-admin__action-group">
                                        <BaseButton @click="openUserModal(item)" variant="ghost" size="small"
                                            :title="t('editUser')" class="users-admin__action-btn">
                                            <PhPencilSimple :size="16" />
                                        </BaseButton>
                                        <BaseButton @click="openPasswordModal(item.userId)" variant="ghost" size="small"
                                            :title="t('changePassword')" class="users-admin__action-btn">
                                            <PhKey :size="16" />
                                        </BaseButton>
                                    </div>

                                    <div class="users-admin__action-group">
                                        <BaseButton v-if="!item.suspend" @click="openFreezeModal(item.userId)"
                                            variant="ghost" size="small" :title="t('freezeUser')"
                                            class="users-admin__action-btn">
                                            <PhPauseCircle :size="16" />
                                        </BaseButton>
                                        <BaseButton v-else @click="unfreezeUser(item.userId)" variant="ghost"
                                            size="small" :title="t('unfreezeUser')" class="users-admin__action-btn">
                                            <PhPlayCircle :size="16" />
                                        </BaseButton>
                                        <BaseButton v-if="userType === 'Admin'" @click="confirmDeleteUser(item)"
                                            variant="danger" size="small" :title="t('deleteUser')"
                                            class="users-admin__action-btn">
                                            <PhTrash :size="16" />
                                        </BaseButton>
                                    </div>
                                </div>

                                <div class="users-admin__plan-actions">
                                    <BaseDropdown :placeholder="t('planActions')" class="users-admin__plan-dropdown">
                                        <template #selected>
                                            <!-- <i class="fas fa-exchange-alt"></i> -->
                                            <span class="users-admin__plan-text">{{ t('planActions') }}</span>
                                        </template>
                                        <template #options>
                                            <div class="users-admin__dropdown-option"
                                                @click="openPlanDetailsModal(item)">
                                                <PhInfo :size="16" />
                                                {{ t('viewPlanDetails') }}
                                            </div>
                                            <div class="users-admin__dropdown-option"
                                                @click="openPlanModal(item.userId, item.plan)">
                                                <PhArrowsClockwise :size="16" />
                                                {{ t('switchPlan') }}
                                            </div>
                                            <div class="users-admin__dropdown-option users-admin__dropdown-option--danger"
                                                @click="openCancelPlanModal(item.userId)">
                                                <PhX :size="16" />
                                                {{ t('cancelPlan') }}
                                            </div>
                                        </template>
                                    </BaseDropdown>
                                </div>
                            </div>
                        </template>

                        <!-- Empty State -->
                        <template #empty>
                            <BaseEmptyState 
                                :title="t('noUsersFound')"
                                :message="t('noUsersFoundDescription')"
                            >
                                <template #icon>
                                    <PhUsers :size="48" weight="duotone" />
                                </template>
                                <template #actions>
                                    <BaseButton @click="openUserModal()" variant="primary">
                                        {{ t('addFirstUser') }}
                                    </BaseButton>
                                </template>
                            </BaseEmptyState>
                        </template>
                    </BaseTable>
                </BaseCard>

                <!-- Pagination Controls -->
                <BaseCard class="users-admin__pagination-card">
                    <div class="users-admin__pagination-content">
                        <div class="users-admin__pagination-info">
                            <BaseFormField v-model="itemsPerPage" type="select" :label="t('itemsPerPage')"
                                class="users-admin__items-per-page" :options="itemsPerPageOptions" />
                            <span class="users-admin__pagination-text">
                                {{ t('showing') }} {{ (currentPage - 1) * itemsPerPage + 1 }} {{ t('to') }} {{
                                    Math.min(currentPage *
                                        itemsPerPage, totalItems) }} {{ t('of') }} {{ totalItems }} {{ t('users') }}
                            </span>
                        </div>
                        <BasePagination v-if="totalPages > 1" :current-page="currentPage" :total-pages="totalPages"
                            :total-items="totalItems" :items-per-page="itemsPerPage" :item-label="t('users')"
                            @page-change="goToPage" />
                    </div>
                </BaseCard>
            </div>
        </BasePanel>

        <!-- User Modal -->
        <UserFormModal 
            :visible="showUserModal"
            :is-editing="isEditing"
            :user-data="userForm"
            :current-user-type="userType"
            :user-type-options="userTypeOptions"
            @close="showUserModal = false"
            @submit="handleUserSubmit"
        />

        <!-- Password Change Modal -->
        <UserPasswordChangeModal
            :visible="showPasswordModal"
            @close="showPasswordModal = false"
            @submit="handlePasswordSubmit"
        />

        <!-- Plan Switch Modal -->
        <UserPlanSwitchModal
            :visible="showPlanModal"
            :plan-options="planOptions"
            @close="showPlanModal = false"
            @submit="handlePlanSubmit"
        />

        <!-- Cancel Plan Modal -->
        <UserCancelPlanModal
            :visible="showCancelPlanModal"
            @close="closeCancelPlanModal"
            @submit="handleCancelPlanSubmit"
        />

        <!-- Freeze User Modal -->
        <UserFreezeModal
            :visible="showFreezeModal"
            @close="closeFreezeModal"
            @submit="handleFreezeSubmit"
        />

        <!-- Plan Details Modal -->
        <PlanDetailsModal
            :visible="showPlanDetailsModal"
            :loading="loadingPlanDetails"
            :user="selectedUserForPlanDetails"
            :subscription-data="userSubscriptionData"
            :stripe-data="userStripeData"
            :plan-title="getPlanTitleForDetails()"
            :plan-price="getPlanPrice(selectedUserForPlanDetails)"
            :billing-dates="getBillingCycleDates(selectedUserForPlanDetails)"
            :subscription-status="selectedUserForPlanDetails ? getSubscriptionStatus(selectedUserForPlanDetails) : ''"
            :subscription-status-text="selectedUserForPlanDetails ? getSubscriptionStatusText(selectedUserForPlanDetails) : ''"
            @close="closePlanDetailsModal"
        />
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, inject, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUsersAdmin } from '@/composables/users_admin/useUsersAdmin';
import { useSearchContext } from "@/composables/useSearchContext";
import { BaseButton, BaseCard, BaseTable, BasePagination, BaseFormField, BaseDropdown, StatusIndicator, BasePanel, BaseEmptyState } from '@/components/ui';
import UserFormModal from '@/components/users_admin/UserFormModal.vue';
import UserPasswordChangeModal from '@/components/users_admin/UserPasswordChangeModal.vue';
import UserPlanSwitchModal from '@/components/users_admin/UserPlanSwitchModal.vue';
import UserCancelPlanModal from '@/components/users_admin/UserCancelPlanModal.vue';
import UserFreezeModal from '@/components/users_admin/UserFreezeModal.vue';
import PlanDetailsModal from '@/components/users_admin/PlanDetailsModal.vue';
import SubscriptionPlansController from '@/controllers/subscription_plans/subscription_plans_controller';
import { useAuthStore } from '@/stores/auth';
import { COUNTRIES_WITH_FLAGS } from '@/constants/countries';
import { 
    PhPlus, PhCalendarBlank, PhCheckCircle, PhPauseCircle, 
    PhPencilSimple, PhKey, PhPlayCircle, PhTrash, 
    PhInfo, PhArrowsClockwise, PhX, PhUsers 
} from "@phosphor-icons/vue";

const { t } = useI18n();

const userType = ref("User");
const userCountry = ref("");

const authStore = useAuthStore();

const getCurrentUserData = async () => {
    if (!authStore.user) {
        await authStore.fetchUserProfile();
    }
    
    if (authStore.user) {
        const data = authStore.user;
        userType.value = data.type;
        userCountry.value = data.companyADCountry;
        // console.log(userForm.value);
        userForm.value.companyADCountry = data.companyADCountry;
        // console.log(userForm.value);
    }
}

// Inject showMessage from global state
const showMessage = inject('showMessage');

// Dropdown state
const activePlanDropdown = ref(null);

// Table columns configuration
const tableColumns = computed(() => [
    { key: 'name', label: t('name'), sortable: true },
    { key: 'phone', label: t('phone'), sortable: false },
    { key: 'plan', label: t('plan'), sortable: false },
    { key: 'status', label: t('status'), sortable: true },
    { key: 'type', label: t('type'), sortable: true },
    { key: 'actions', label: t('actions'), sortable: false }
]);

// Filter and sort options
const planFilterOptions = computed(() => [
    { value: '', label: t('allPlans') },
    { value: 'Trial', label: t('trial') },
    { value: 'TrialExpired', label: t('trialExpired') },
    { value: 'Core', label: t('core') },
    { value: 'Professional', label: t('professional') },
    { value: 'Enterprise', label: t('enterprise') }
]);

const sortOptions = computed(() => [
    { value: '', label: t('sortBy') },
    { value: 'email', label: t('email') },
    { value: 'firstName', label: t('firstName') },
    { value: 'lastName', label: t('lastName') },
    { value: 'suspend', label: t('status') }
]);

const itemsPerPageOptions = computed(() => [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' }
]);

const userTypeOptions = computed(() => userType.value === 'Admin' ? [
    { value: '', label: t('selectUserType') },
    { value: 'User', label: t('user') },
    { value: 'RestrictedAdmin', label: t('restrictedAdmin') },
    // { value: 'OrgAdmin', label: t('organizationAdmin') },
    // { value: 'OrgManager', label: t('organizationManager') },
] : userType.value === "RestrictedAdmin" ? [
    { value: '', label: t('selectUserType') },
    { value: 'User', label: t('user') },
] : []);

const countryOptions = computed(() => [
    { value: '', label: t('selectCountry') },
    ...countriesWithFlags.map(country => ({
        value: country.name,
        label: `${country.flag} ${t(country.name)}`
    }))
]);

const planOptions = computed(() => [
    // { value: "", label: t('selectPlan'), disabled: true },
    ...plans.value.map(plan => ({
        value: plan.id,
        label: t(String(plan.name).toLowerCase())
    }))
]);

const {
    // State
    users,
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
    freezeUser,
    unfreezeUser,
    deleteUser,

    // Form management
    openUserModal,
    openPasswordModal,
    openPlanModal,
    openCancelPlanModal,
    openFreezeModal,
    closeFreezeModal,
    closeCancelPlanModal,



    // Pagination
    goToPage,
    nextPage,
    previousPage,
    resetPagination,
} = useUsersAdmin(showMessage);

const { registerSearchContext, clearSearchContext } = useSearchContext();

// Helper functions for new components
const getPlanStatus = (user) => {
    if (user.isExpired) return 'blocked';
    if (user.plan) return 'verified';
    return 'caution';
};

const getPlanTitle = (user) => {
    if (user.plan) {
        return t(String(JSON.parse(user.plan.planData).name).toLowerCase());
    }
    return user.isExpired ? t('trailExpired') : t('trail');
};

const getPlanDescription = (user) => {
    if (user.plan) {
        return t('activeSubscription');
    }
    return user.isExpired ? t('trialExpiredDescription') : t('trialDescription');
};

const getUserTypeClass = (userType) => {
    return userType === 'Admin' ? 'users-admin__user-type--admin' : 'users-admin__user-type--user';
};

const handleSort = (column) => {
    if (sortBy.value === column) {
        sortDesc.value = !sortDesc.value;
    } else {
        sortBy.value = column;
        sortDesc.value = false;
    }
};

// Helper functions for compact table styling
const getPlanBadgeClass = (user) => {
    if (user.plan) {
        const planName = JSON.parse(user.plan.planData).name.toLowerCase().replace("plan", "");
        switch (planName) {
            case 'core':
                return 'users-admin__plan-badge--core';
            case 'professional':
                return 'users-admin__plan-badge--professional';
            case 'enterprise':
                return 'users-admin__plan-badge--enterprise';
            default:
                return 'users-admin__plan-badge--default';
        }
    }
    if (user.isExpired) return 'users-admin__plan-badge--expired';
    return 'users-admin__plan-badge--trial';
};

const getStatusBadgeClass = (user) => {
    return user.suspend ? 'users-admin__status-badge--suspended' : 'users-admin__status-badge--active';
};

// Removed getStatusIcon as it's replaced by dynamic component logic in template

const getBillingCycle = (user) => {
    if (!user || !user.plan) return null;

    // Check if stripeData is available in the plan object
    const stripeData = user.plan.stripeData || user.stripeData;
    if (!stripeData || !stripeData.startDate || !stripeData.currentPeriodEnd) {
        return null;
    }

    const startDate = new Date(stripeData.startDate);
    const endDate = new Date(stripeData.currentPeriodEnd);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
};

const getBillingCycleDates = (user) => {
    // Use fetched subscription data if available
    const stripeData = userStripeData.value || (user?.plan?.stripeData) || user?.stripeData;
    if (!stripeData || !stripeData.startDate || !stripeData.currentPeriodEnd) {
        return { start: null, end: null };
    }

    const startDate = new Date(stripeData.startDate);
    const endDate = new Date(stripeData.currentPeriodEnd);
    return {
        start: startDate.toLocaleDateString(),
        end: endDate.toLocaleDateString()
    };
};

const getPlanPrice = (user) => {
    // Use fetched subscription data if available
    const subscription = userSubscriptionData.value || user?.plan;
    if (!subscription) return null;

    try {
        const planData = typeof subscription.planData === 'string'
            ? JSON.parse(subscription.planData)
            : subscription.planData;
        return planData?.price || 0;
    } catch (e) {
        return 0;
    }
};

const getPlanTitleForDetails = () => {
    if (!userSubscriptionData.value) return null;
    try {
        const planData = typeof userSubscriptionData.value.planData === 'string'
            ? JSON.parse(userSubscriptionData.value.planData)
            : userSubscriptionData.value.planData;
        return planData?.name || t('unknownPlan');
    } catch (e) {
        return t('unknownPlan');
    }
};

const getSubscriptionStatus = (user) => {
    // Use fetched stripe data if available
    const stripeData = userStripeData.value || (user?.plan?.stripeData) || user?.stripeData;
    const subscription = userSubscriptionData.value || user?.plan;

    if (!subscription) {
        return user?.isExpired ? 'blocked' : 'caution';
    }

    if (stripeData?.status === 'canceled') {
        return 'blocked';
    }
    if (stripeData?.status === 'active') {
        return 'verified';
    }
    return 'caution';
};

const getSubscriptionStatusText = (user) => {
    // Use fetched stripe data if available
    const stripeData = userStripeData.value || (user?.plan?.stripeData) || user?.stripeData;
    const subscription = userSubscriptionData.value || user?.plan;

    if (!subscription) {
        return user?.isExpired ? t('trialExpired') : t('trial');
    }

    if (stripeData?.status === 'canceled') {
        return t('canceled');
    }
    if (stripeData?.status === 'active') {
        return t('active');
    }
    return stripeData?.status || t('unknown');
};

// Plan Details Modal
const showPlanDetailsModal = ref(false);
const selectedUserForPlanDetails = ref(null);
const userSubscriptionData = ref(null);
const userStripeData = ref(null);
const loadingPlanDetails = ref(false);

const openPlanDetailsModal = async (user) => {
    selectedUserForPlanDetails.value = user;
    userSubscriptionData.value = null;
    userStripeData.value = null;
    showPlanDetailsModal.value = true;

    // Fetch subscription details for this user
    loadingPlanDetails.value = true;
    try {
        const res = await SubscriptionPlansController.getUserActiveSubscription(user.userId);
        if (res.result) {
            userSubscriptionData.value = res.data;
            if (res.stripeData) {
                if (res.stripeData.result) {
                    userStripeData.value = res.stripeData;
                }
            }
        }
    } catch (error) {
        console.error('Error loading subscription details:', error);
        showMessage({ status: 'error', message: t('failedToLoadSubscriptionDetails') });
    } finally {
        loadingPlanDetails.value = false;
    }
};

const closePlanDetailsModal = () => {
    showPlanDetailsModal.value = false;
    selectedUserForPlanDetails.value = null;
    userSubscriptionData.value = null;
    userStripeData.value = null;
};

// Confirm delete user
const confirmDeleteUser = async (user) => {
    if (confirm(`${t('confirmDeleteUser')} "${user.firstName} ${user.lastName}"? ${t('thisActionCannotBeUndone')}`)) {
        await deleteUser(user.userId);
    }
};

// Generate visible page numbers for pagination
const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages.value <= maxVisiblePages) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i);
        }
    } else {
        // Show pages around current page with ellipsis
        const start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
        const end = Math.min(totalPages.value, start + maxVisiblePages - 1);

        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push('...');
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages.value) {
            if (end < totalPages.value - 1) {
                pages.push('...');
            }
            pages.push(totalPages.value);
        }
    }

    return pages;
};

// Toggle plan dropdown
const togglePlanDropdown = (userId) => {
    if (activePlanDropdown.value === userId) {
        activePlanDropdown.value = null;
    } else {
        activePlanDropdown.value = userId;
    }
};

// Close dropdown when clicking outside
const closeDropdowns = () => {
    activePlanDropdown.value = null;
};

// Load data on component mount
onMounted(async () => {
    await getCurrentUserData();
    await getData();

    registerSearchContext(t('users'), (query) => {
        searchQuery.value = query;
        return filteredUsers.value.slice(0, 5).map(user => ({
            title: `${user.firstName} ${user.lastName}`,
            description: user.email,
            action: () => openUserModal(user)
        }));
    }, 'bi-people');
    
    // Add click outside handler to close dropdowns
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.btn-group')) {
            closeDropdowns();
        }
    });
});

onUnmounted(() => {
    clearSearchContext();
});
// Local Handlers overriding composable ones to handle data from components
const handleUserSubmit = async (formData) => {
    try {
        if (isEditing.value) {
            const data = { ...userForm.value, ...formData, id: userForm.value.id || userForm.value.userId };
             await updateUser(data); 
        } else {
            await addUser(formData);
        }
    } catch (error) {
         console.error(error);
    }
};

const handlePasswordSubmit = async (formData) => {
    if (formData.newPassword !== formData.confirmPassword) {
        showMessage({ status: 'error', message: t('passwordsDoNotMatch') });
        return;
    }
    await changeUserPassword({ userId: passwordForm.value.userId, ...formData });
};

const handlePlanSubmit = async (formData) => {
    await switchUserPlan({ userId: planForm.value.userId, ...formData });
};

const handleFreezeSubmit = async (formData) => {
    if (!formData.reason.trim()) {
      showMessage({ status: "error", message: t("freezeReasonRequired") });
      return;
    }
    await freezeUser({ userId: freezeForm.value.userId, ...formData });
};

const handleCancelPlanSubmit = async () => {
    await cancelUserPlan(cancelPlanForm.value);
};

</script>

<style scoped>
/* Users Admin Layout */
.users-admin {
    height: 93vh;
    display: flex;
    flex-direction: column;
    padding: 1rem;
}

.users-admin .base-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

/* Scrollable content area */
.users-admin__content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);

    /* padding: var(--spacing-md); */
    padding: 1rem;
    min-height: 0;
}

/* Header Section */
.users-admin__header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--spacing-lg);
}

/* Filters Section */
.users-admin__filters {
    margin-bottom: var(--spacing-lg);
}

.users-admin__filters-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.users-admin__search {
    max-width: 300px;
}

.users-admin__search-field {
    position: relative;
}

.users-admin__search-field :deep(.base-form-field__input) {
    padding-left: 2.5rem;
}

.users-admin__search-field :deep(.base-form-field__input)::before {
    /* TODO: Replace with Phosphor Icon in BaseFormField or adjust this CSS context */
    /* content: '\F52A';  bi-search */
    display: none; 
}

.users-admin__filters-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--spacing-sm);
}

.users-admin__filter-field {
    width: 100%;
}

.users-admin__filter-field :deep(.base-form-field) {
    margin-bottom: 0;
}

.users-admin__filter-field :deep(.base-form-field__label) {
    font-size: var(--font-size-xs);
    margin-bottom: var(--spacing-2xs);
}

.users-admin__filter-field :deep(.base-form-field__input) {
    padding: var(--spacing-xs);
    font-size: var(--font-size-sm);
    height: 32px;
}

.users-admin__search-field :deep(.base-form-field) {
    margin-bottom: 0;
}

.users-admin__search-field :deep(.base-form-field__input) {
    padding: var(--spacing-xs);
    font-size: var(--font-size-sm);
    height: 32px;
}

/* Table Section */
.users-admin__table-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.users-admin__table {
    border: none;
    box-shadow: none;
    flex: 1;
    padding-bottom: 100px;
}

/* Compact Table Styling */
.users-admin__table--compact :deep(.base-table__header) {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 2fr;
}

.users-admin__table--compact :deep(.base-table__row) {
    padding: var(--spacing-sm) var(--spacing-md);
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 2fr;
    min-height: 60px;
}

.users-admin__table--compact :deep(.base-table__cell) {
    font-size: var(--font-size-sm);
    align-items: center;
}

/* User Info in Table */
.users-admin__user-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
}

.users-admin__user-name {
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-base);
}

.users-admin__user-email {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.users-admin__phone {
    font-size: var(--font-size-base);
    color: var(--text-primary);
}

/* User Type Styling */
.users-admin__user-type--admin {
    background: var(--accent);
    color: white;
    padding: var(--spacing-2xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
}

.users-admin__user-type--user {
    background: var(--bg-elevated);
    color: var(--text-secondary);
    padding: var(--spacing-2xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
}

/* Plan Badge Styling */
.users-admin__plan-badge {
    display: inline-flex;
    align-items: center;
    padding: var(--spacing-2xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.users-admin__plan-badge--trial {
    background: rgb(243 156 18 / 10%);
    color: var(--warning);
    border: 1px solid rgb(243 156 18 / 30%);
}

.users-admin__plan-badge--expired {
    background: rgb(232 62 140 / 10%);
    color: var(--error);
    border: 1px solid rgb(232 62 140 / 30%);
}

.users-admin__plan-badge--core {
    background: rgb(107 114 128 / 10%);
    color: var(--text-secondary);
    border: 1px solid rgb(107 114 128 / 30%);
}

.users-admin__plan-badge--professional {
    background: rgb(243 156 18 / 10%);
    color: var(--warning);
    border: 1px solid rgb(243 156 18 / 30%);
}

.users-admin__plan-badge--enterprise {
    background: rgb(0 167 225 / 10%);
    color: var(--accent);
    border: 1px solid rgb(0 167 225 / 30%);
}

.users-admin__plan-badge--default {
    background: var(--bg-elevated);
    color: var(--text-secondary);
    border: 1px solid var(--border);
}

.users-admin__plan-info {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.users-admin__billing-cycle {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
}

.users-admin__billing-cycle i {
    color: var(--accent);
    font-size: 0.75rem;
}

/* Status Badge Styling */
.users-admin__status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: var(--spacing-2xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
}

.users-admin__status-badge--active {
    background: rgb(0 179 134 / 10%);
    color: var(--success);
    border: 1px solid rgb(0 179 134 / 30%);
}

.users-admin__status-badge--suspended {
    background: rgb(232 62 140 / 10%);
    color: var(--error);
    border: 1px solid rgb(232 62 140 / 30%);
}

/* Actions */
.users-admin__actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-end;
}

.users-admin__action-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
    justify-content: flex-end;
}

.users-admin__action-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    border-radius: var(--radius-md);
    background: var(--bg-elevated);
    padding: var(--spacing-2xs);
}

.users-admin__action-btn {
    min-width: 28px;
    height: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.users-admin__action-btn i {
    font-size: var(--font-size-sm);
}

.users-admin__plan-actions {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}

.users-admin__plan-dropdown {
    min-width: auto;
    width: auto;
    height: 32px;
}

.users-admin__plan-dropdown :deep(.base-dropdown__selected) {
    min-width: auto;
    width: auto;
    height: 32px;
    padding: var(--spacing-xs) var(--spacing-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    gap: var(--spacing-xs);
}

.users-admin__plan-text {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
}

.users-admin__dropdown-option {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    cursor: pointer;
    transition: background-color var(--transition-fast);
    font-size: var(--font-size-sm);
}

.users-admin__dropdown-option:hover {
    background: var(--bg-elevated);
}

.users-admin__dropdown-option--danger {
    color: var(--error);
}

.users-admin__dropdown-option--danger:hover {
    background: rgb(232 62 140 / 10%);
}

/* Empty State handled by BaseEmptyState */

/* Pagination */
.users-admin__pagination-card {
    margin-top: var(--spacing-lg);
}

.users-admin__pagination-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
}

.users-admin__pagination-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.users-admin__items-per-page {
    min-width: 100px;
}

.users-admin__items-per-page :deep(.base-form-field) {
    margin-bottom: 0;
}

.users-admin__items-per-page :deep(.base-form-field__label) {
    font-size: var(--font-size-xs);
    margin-bottom: var(--spacing-2xs);
}

.users-admin__items-per-page :deep(.base-form-field__input) {
    padding: var(--spacing-xs);
    font-size: var(--font-size-sm);
    height: 32px;
}

.users-admin__pagination-text {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    white-space: nowrap;
}


</style>