<template>
    <div class="organization-user-management">
        <BasePanel :title="t('organizationUsers')" :subtitle="`${t('manageUsersFor')} ${organization?.name}`"
            elevation="level2" :scrollable="true" class="organization-user-management__panel">
            <template #header>
                <div class="organization-user-management__header">
                    <BaseButton @click="goBack" variant="secondary" size="medium" left-icon="fas fa-arrow-left">
                        {{ t('backToOrganizations') }}
                    </BaseButton>
                    <BaseButton v-if="canCreateUsers" @click="openCreateUserModal()" variant="primary" size="medium"
                        left-icon="fas fa-plus">
                        {{ t('createNewUser') }}
                    </BaseButton>
                </div>
            </template>

            <div class="organization-user-management__content">
                <!-- Search and Filter Controls -->
                <BaseCard class="organization-user-management__filters">
                    <div class="organization-user-management__filters-content">
                        <div class="organization-user-management__search">
                            <BaseFormField v-model="searchQuery" type="text" :placeholder="t('searchUsers')"
                                class="organization-user-management__search-field">
                                <template #prefix>
                                    <i class="fas fa-search"></i>
                                </template>
                            </BaseFormField>
                        </div>

                        <div class="organization-user-management__filters-row">
                            <BaseFormField v-model="filterRole" type="select" :label="t('filterByRole')"
                                :options="roleFilterOptions" class="organization-user-management__filter-field" />

                            <BaseFormField v-model="sortBy" type="select" :label="t('sortBy')" :options="sortOptions"
                                class="organization-user-management__filter-field" />

                            <BaseButton @click="resetFilters" variant="ghost" size="small">
                                <i class="fas fa-refresh"></i>
                                {{ t('resetFilters') }}
                            </BaseButton>
                        </div>
                    </div>
                </BaseCard>

                <!-- Users Table -->
                <BaseCard class="organization-user-management__table-card">
                    <BaseTable :items="paginatedUsers" :columns="tableColumns" :loading="loading" @sort="handleSort">
                        <template #cell-name="{ item }">
                            <div class="organization-user-management__name-cell">
                                <div class="organization-user-management__name">{{ item.name }}</div>
                                <div class="organization-user-management__email">{{ item.email }}</div>
                            </div>
                        </template>

                        <template #cell-userType="{ item }">
                            <StatusIndicator :status="getRoleStatus(item.userType)"
                                :title="getRoleText(item.userType)" />
                            <!-- Debug info -->
                            <!-- <div style="font-size: 10px; color: #666;">
                                Debug: role={{ item.userType }}, status={{ getRoleStatus(item.userType) }}, text={{
                                    getRoleText(item.userType) }}
                            </div> -->
                        </template>

                        <template #cell-plan="{ item }">
                            <div class="organization-user-management__plan-info">
                                <div v-if="item.plan" class="organization-user-management__plan-badge">
                                    {{ getPlanName(item) }}
                                </div>
                                <div v-else
                                    class="organization-user-management__plan-badge organization-user-management__plan-badge--trial">
                                    {{ item.isExpired ? t('trialExpired') : t('trial') }}
                                </div>
                                <div v-if="getBillingCycle(item)" class="organization-user-management__billing-cycle">
                                    <i class="bi bi-calendar-range"></i>
                                    <span>{{ getBillingCycle(item) }}</span>
                                </div>
                            </div>
                        </template>

                        <template #cell-status="{ item }">
                            <StatusIndicator :status="getUserStatus(item)" :text="getUserStatusText(item)" />
                        </template>

                        <template #cell-dateAdded="{ item }">
                            <div class="organization-user-management__date">
                                {{ formatDate(item.dateAdded) }}
                            </div>
                        </template>

                        <template #cell-actions="{ item }">
                            <div class="organization-user-management__actions">
                                <div class="organization-user-management__dropdown" :ref="`dropdown-${item.userId}`">
                                    <button class="organization-user-management__dropdown-button"
                                        :data-dropdown-button="item.userId" @click.stop="toggleDropdown(item.userId)"
                                        @blur="handleDropdownBlur(item.userId)">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <Teleport to="body">
                                        <div v-if="openDropdowns[item.userId]"
                                            class="organization-user-management__dropdown-menu organization-user-management__dropdown-menu--portal"
                                            :style="getDropdownStyle(item.userId)" @click.stop>
                                            <div class="organization-user-management__dropdown-option"
                                                @click="openEditUserModal(item); openDropdowns[item.userId] = false">
                                                <i class="fas fa-edit"></i>
                                                {{ t('editUser') }}
                                            </div>
                                            <div class="organization-user-management__dropdown-option"
                                                @click="openPlanDetailsModal(item); openDropdowns[item.userId] = false">
                                                <i class="fas fa-info-circle"></i>
                                                {{ t('viewPlanDetails') }}
                                            </div>
                                            <!-- <div v-if="canChangeRole"
                                                class="organization-user-management__dropdown-option"
                                                @click="openChangeRoleModal(item); openDropdowns[item.userId] = false">
                                                <i class="fas fa-user-tag"></i>
                                                {{ t('changeRole') }}
                                            </div> -->
                                            <div v-if="canFreezeUser"
                                                class="organization-user-management__dropdown-option"
                                                @click="toggleUserStatus(item); openDropdowns[item.userId] = false">
                                                <i :class="item.suspend ? 'fas fa-play' : 'fas fa-pause'"></i>
                                                {{ item.suspend ? t('unfreezeUser') : t('freezeUser') }}
                                            </div>
                                            <!-- <div class="organization-user-management__dropdown-option organization-user-management__dropdown-option--danger"
                                                @click="removeUserFromOrganization(item); openDropdowns[item.userId] = false">
                                                <i class="fas fa-user-times"></i>
                                                {{ t('removeFromOrganization') }}
                                            </div> -->
                                            <div v-if="canDeleteThisUser(item)"
                                                class="organization-user-management__dropdown-option organization-user-management__dropdown-option--danger"
                                                @click="deleteUser(item); openDropdowns[item.userId] = false">
                                                <i class="fas fa-trash"></i>
                                                {{ t('deleteUser') }}
                                            </div>
                                        </div>
                                    </Teleport>
                                </div>
                            </div>
                        </template>

                        <template #empty>
                            <div class="organization-user-management__empty">
                                <i class="fas fa-users"></i>
                                <h3>{{ t('noUsersInOrganization') }}</h3>
                                <p>{{ t('noUsersInOrganizationDescription') }}</p>
                                <BaseButton v-if="canCreateUsers" @click="openCreateUserModal()" variant="primary">
                                    {{ t('createFirstUser') }}
                                </BaseButton>
                            </div>
                        </template>
                    </BaseTable>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="organization-user-management__pagination">
                        <BasePagination :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems"
                            :items-per-page="itemsPerPage" @page-change="goToPage" @next="nextPage"
                            @previous="previousPage" />
                    </div>
                </BaseCard>
            </div>
        </BasePanel>

        <!-- Create User Modal -->
        <div v-if="showCreateUserModal" class="organization-user-management__modal-overlay"
            @click.self="closeCreateUserModal">
            <div class="organization-user-management__modal" @click.stop>
                <div class="organization-user-management__modal-header">
                    <h3 class="organization-user-management__modal-title">{{ t('createNewUser') }}</h3>
                    <BaseButton @click="closeCreateUserModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-user-management__modal-body">
                    <form @submit.prevent="handleCreateUserSubmit" class="organization-user-management__modal-form">
                        <div class="organization-user-management__form-grid">
                            <BaseFormField v-model="userForm.firstName" type="text" :label="t('firstName')" required
                                class="organization-user-management__form-field" />
                            <BaseFormField v-model="userForm.lastName" type="text" :label="t('lastName')" required
                                class="organization-user-management__form-field" />
                        </div>

                        <div class="organization-user-management__form-grid">
                            <BaseFormField v-model="userForm.email" type="email" :label="t('email')" required
                                class="organization-user-management__form-field" />
                            <BaseFormField v-model="userForm.password" type="password" :label="t('password')" required
                                class="organization-user-management__form-field" />
                        </div>

                        <div class="organization-user-management__form-grid">
                            <BaseFormField v-model="userForm.mobileNumber" type="tel" :label="t('mobileNumber')"
                                class="organization-user-management__form-field" />
                            <BaseFormField v-model="userForm.userType" type="select" :label="t('role')"
                                :options="userRoleOptions" required class="organization-user-management__form-field" />
                        </div>

                        <div class="organization-user-management__form-section">
                            <h4>{{ t('companyInformation') }}</h4>
                            <div class="organization-user-management__form-grid">
                                <BaseFormField v-model="userForm.companyName" type="text" :label="t('companyName')"
                                    class="organization-user-management__form-field" />
                                <BaseFormField v-model="userForm.companyWebsite" type="url" :label="t('companyWebsite')"
                                    class="organization-user-management__form-field" />
                            </div>
                        </div>

                        <div class="organization-user-management__form-section">
                            <h4>{{ t('companyAddress') }}</h4>
                            <div class="organization-user-management__form-grid">
                                <BaseFormField v-model="userForm.companyADStreet" type="text" :label="t('street')"
                                    class="organization-user-management__form-field" />
                                <BaseFormField v-model="userForm.companyADCity" type="text" :label="t('city')"
                                    class="organization-user-management__form-field" />
                            </div>
                            <div class="organization-user-management__form-grid">
                                <BaseFormField v-model="userForm.companyADState" type="text" :label="t('state')"
                                    class="organization-user-management__form-field" />
                                <BaseFormField v-model="userForm.companyADZipcode" type="text" :label="t('zipcode')"
                                    class="organization-user-management__form-field" />
                            </div>
                            <BaseFormField v-model="userForm.companyADCountry" type="select" :label="t('country')"
                                :options="countryOptions" class="organization-user-management__form-field" />
                        </div>

                        <BaseFormField v-model="userForm.disclaimer" type="textarea" :label="t('disclaimer')" :rows="3"
                            class="organization-user-management__form-field" />
                    </form>
                </div>

                <div class="organization-user-management__modal-footer">
                    <BaseButton @click="closeCreateUserModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleCreateUserSubmit">
                        {{ t('createUser') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Edit User Modal -->
        <div v-if="showEditUserModal" class="organization-user-management__modal-overlay"
            @click.self="closeEditUserModal">
            <div class="organization-user-management__modal" @click.stop>
                <div class="organization-user-management__modal-header">
                    <h3 class="organization-user-management__modal-title">{{ t('editUser') }}</h3>
                    <BaseButton @click="closeEditUserModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-user-management__modal-body">
                    <form @submit.prevent="handleEditUserSubmit" class="organization-user-management__modal-form">
                        <div class="organization-user-management__form-grid">
                            <BaseFormField v-model="editUserForm.firstName" type="text" :label="t('firstName')" required
                                class="organization-user-management__form-field" />
                            <BaseFormField v-model="editUserForm.lastName" type="text" :label="t('lastName')" required
                                class="organization-user-management__form-field" />
                        </div>

                        <div class="organization-user-management__form-grid">
                            <BaseFormField v-model="editUserForm.email" type="email" :label="t('email')" required
                                :disabled="true" class="organization-user-management__form-field" />
                            <BaseFormField v-model="editUserForm.mobileNumber" type="tel" :label="t('mobileNumber')"
                                class="organization-user-management__form-field" />
                        </div>

                        <div class="organization-user-management__form-grid">
                            <BaseFormField v-model="editUserForm.userType" type="select" :label="t('role')"
                                :options="userRoleOptions" required class="organization-user-management__form-field" />
                        </div>

                        <div class="organization-user-management__form-section">
                            <h4>{{ t('companyInformation') }}</h4>
                            <div class="organization-user-management__form-grid">
                                <BaseFormField v-model="editUserForm.companyName" type="text" :label="t('companyName')"
                                    class="organization-user-management__form-field" />
                                <BaseFormField v-model="editUserForm.companyWebsite" type="url"
                                    :label="t('companyWebsite')" class="organization-user-management__form-field" />
                            </div>
                        </div>

                        <div class="organization-user-management__form-section">
                            <h4>{{ t('companyAddress') }}</h4>
                            <div class="organization-user-management__form-grid">
                                <BaseFormField v-model="editUserForm.companyADStreet" type="text" :label="t('street')"
                                    class="organization-user-management__form-field" />
                                <BaseFormField v-model="editUserForm.companyADCity" type="text" :label="t('city')"
                                    class="organization-user-management__form-field" />
                            </div>
                            <div class="organization-user-management__form-grid">
                                <BaseFormField v-model="editUserForm.companyADState" type="text" :label="t('state')"
                                    class="organization-user-management__form-field" />
                                <BaseFormField v-model="editUserForm.companyADZipcode" type="text" :label="t('zipcode')"
                                    class="organization-user-management__form-field" />
                            </div>
                            <BaseFormField v-model="editUserForm.companyADCountry" type="select" :label="t('country')"
                                :options="countryOptions" class="organization-user-management__form-field" />
                        </div>

                        <BaseFormField v-model="editUserForm.disclaimer" type="textarea" :label="t('disclaimer')"
                            :rows="3" class="organization-user-management__form-field" />
                    </form>
                </div>

                <div class="organization-user-management__modal-footer">
                    <BaseButton @click="closeEditUserModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleEditUserSubmit">
                        {{ t('updateUser') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Change Role Modal -->
        <div v-if="showChangeRoleModal" class="organization-user-management__modal-overlay"
            @click.self="closeChangeRoleModal">
            <div class="organization-user-management__modal organization-user-management__modal--small" @click.stop>
                <div class="organization-user-management__modal-header">
                    <h3 class="organization-user-management__modal-title">{{ t('changeUserRole') }}</h3>
                    <BaseButton @click="closeChangeRoleModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-user-management__modal-body">
                    <form @submit.prevent="handleChangeRoleSubmit" class="organization-user-management__modal-form">
                        <div class="organization-user-management__user-info">
                            <p><strong>{{ t('user') }}:</strong> {{ selectedUser?.name }} ({{ selectedUser?.email }})
                            </p>
                        </div>

                        <BaseFormField v-model="roleChangeForm.role" type="select" :label="t('newRole')"
                            :options="userRoleOptions" required class="organization-user-management__form-field" />
                    </form>
                </div>

                <div class="organization-user-management__modal-footer">
                    <BaseButton @click="closeChangeRoleModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleChangeRoleSubmit">
                        {{ t('changeRole') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Freeze User Modal -->
        <div v-if="showFreezeModal" class="organization-user-management__modal-overlay" @click.self="closeFreezeModal">
            <div class="organization-user-management__modal organization-user-management__modal--small" @click.stop>
                <div class="organization-user-management__modal-header">
                    <h3 class="organization-user-management__modal-title">{{ t('freezeUser') }}</h3>
                    <BaseButton @click="closeFreezeModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-user-management__modal-body">
                    <form @submit.prevent="handleFreezeSubmit" class="organization-user-management__modal-form">
                        <div class="organization-user-management__user-info">
                            <p><strong>{{ t('user') }}:</strong> {{ selectedUser?.name }} ({{ selectedUser?.email }})
                            </p>
                        </div>

                        <BaseFormField v-model="freezeForm.reason" type="textarea" :label="t('freezeReason')"
                            :placeholder="t('enterFreezeReason')" required :rows="4"
                            class="organization-user-management__form-field" />
                    </form>
                </div>

                <div class="organization-user-management__modal-footer">
                    <BaseButton @click="closeFreezeModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleFreezeSubmit">
                        {{ t('freezeUser') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Plan Details Modal -->
        <div v-if="showPlanDetailsModal" class="organization-user-management__modal-overlay"
            @click.self="closePlanDetailsModal">
            <div class="organization-user-management__modal organization-user-management__modal--medium" @click.stop>
                <div class="organization-user-management__modal-header">
                    <h3 class="organization-user-management__modal-title">{{ t('planDetails') }}</h3>
                    <BaseButton @click="closePlanDetailsModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-user-management__plan-details-content" v-if="selectedUserForPlanDetails">
                    <!-- Loading State -->
                    <div v-if="loadingPlanDetails" class="organization-user-management__plan-details-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>{{ t('loading') }}...</span>
                    </div>

                    <!-- Content -->
                    <template v-else>
                        <!-- User Info -->
                        <div class="organization-user-management__plan-details-user">
                            <h4>{{ selectedUserForPlanDetails.name }}</h4>
                            <p class="organization-user-management__plan-details-email">{{
                                selectedUserForPlanDetails.email
                                }}</p>
                        </div>

                        <!-- Plan Info -->
                        <div v-if="userSubscriptionData" class="organization-user-management__plan-details-section">
                            <div class="organization-user-management__plan-details-header">
                                <h4>{{ getPlanTitleForDetails() }}</h4>
                                <div class="organization-user-management__plan-details-price">
                                    <span class="price">${{ getPlanPrice(selectedUserForPlanDetails) }}</span>
                                    <span class="period">/{{ t('month') }}</span>
                                </div>
                            </div>

                            <!-- Billing Cycle -->
                            <div v-if="userStripeData && userStripeData.startDate && userStripeData.currentPeriodEnd"
                                class="organization-user-management__plan-details-billing">
                                <div class="organization-user-management__plan-details-billing-header">
                                    <i class="bi bi-calendar-range"></i>
                                    <strong>{{ t('billingCycle') }}</strong>
                                </div>
                                <div class="organization-user-management__plan-details-billing-dates">
                                    <span>{{ getBillingCycleDates(selectedUserForPlanDetails).start }}</span>
                                    <i class="fas fa-arrow-right"></i>
                                    <span>{{ getBillingCycleDates(selectedUserForPlanDetails).end }}</span>
                                </div>
                            </div>

                            <!-- Subscription Status -->
                            <div class="organization-user-management__plan-details-status">
                                <div class="organization-user-management__plan-details-status-header">
                                    <i class="bi bi-info-circle"></i>
                                    <strong>{{ t('subscriptionStatus') }}</strong>
                                </div>
                                <div class="organization-user-management__plan-details-status-value">
                                    <StatusIndicator :status="getSubscriptionStatus(selectedUserForPlanDetails)"
                                        :text="getSubscriptionStatusText(selectedUserForPlanDetails)" />
                                </div>
                            </div>
                        </div>

                        <!-- No Plan / Trial -->
                        <div v-else class="organization-user-management__plan-details-section">
                            <div class="organization-user-management__plan-details-header">
                                <h4>{{ selectedUserForPlanDetails.isExpired ? t('trialExpired') : t('trial') }}</h4>
                            </div>
                            <div class="organization-user-management__plan-details-status">
                                <div class="organization-user-management__plan-details-status-header">
                                    <i class="bi bi-info-circle"></i>
                                    <strong>{{ t('status') }}</strong>
                                </div>
                                <div class="organization-user-management__plan-details-status-value">
                                    <StatusIndicator
                                        :status="selectedUserForPlanDetails.isExpired ? 'blocked' : 'caution'"
                                        :text="selectedUserForPlanDetails.isExpired ? t('trialExpired') : t('trial')" />
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="organization-user-management__modal-footer">
                    <BaseButton @click="closePlanDetailsModal" variant="secondary">
                        {{ t('close') }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, inject, ref, nextTick, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useOrganizationsAdmin } from '@/composables/useOrganizationsAdmin';
import {
    BaseButton,
    BaseCard,
    BaseTable,
    BasePagination,
    BaseFormField,
    StatusIndicator,
    BasePanel
} from '@/components/ui';
import Cookies from 'js-cookie';
import SubscriptionPlansController from '@/controllers/subscription_plans/subscription_plans_controller';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// Inject showMessage from global state
const showMessage = inject('showMessage');

// Get organization ID from route
const organizationId = computed(() => route.params.id);

const {
    // State
    organizations,
    loading,
    getOrganization,
    getOrganizationUsers,
    addOrganizationUser,
    updateOrganizationUser,
    removeUserFromOrganization,
    changeUserRole,
    updateOrganizationAdmin,
    updateOrganizationManager,
    deleteOrganizationAdmin,
    deleteOrganizationManager,
    deleteOrganizationUser,
    freezeOrganizationUser,
    unfreezeOrganizationUser
} = useOrganizationsAdmin(showMessage);

// Local state
const organization = ref(null);
const users = ref([]);
const searchQuery = ref('');
const filterRole = ref('');
const sortBy = ref('name');
const sortDesc = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Modal states
const showCreateUserModal = ref(false);
const showEditUserModal = ref(false);
const showChangeRoleModal = ref(false);
const showFreezeModal = ref(false);
const selectedUser = ref(null);

// Forms
const userForm = ref({
    organizationId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userType: 'User',
    mobileNumber: '',
    companyName: '',
    companyWebsite: '',
    companyADStreet: '',
    companyADCity: '',
    companyADState: '',
    companyADZipcode: '',
    companyADCountry: '',
    disclaimer: ''
});

const editUserForm = ref({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    userType: '',
    companyName: '',
    companyWebsite: '',
    companyADStreet: '',
    companyADCity: '',
    companyADState: '',
    companyADZipcode: '',
    companyADCountry: '',
    disclaimer: ''
});

const roleChangeForm = ref({
    userId: '',
    role: ''
});

const freezeForm = ref({
    userId: '',
    reason: ''
});

// Watch for organization ID changes and update form
watch(organizationId, (newId) => {
    if (newId && userForm.value) {
        userForm.value.organizationId = newId;
    }
}, { immediate: true });

// Dropdown state
const openDropdowns = ref({});
const dropdownPositions = ref({});

// User type check (you'll need to get this from your auth system)
const userType = ref('Admin'); // This should come from your auth context

// Computed properties
const canCreateUsers = computed(() => {
    return userType.value === 'Admin' || userType.value === 'OrgManager' || userType.value === 'OrgAdmin';
});

const canChangeRole = computed(() => {
    return userType.value === 'Admin' || userType.value === 'OrgAdmin';
});

const canDeleteUser = computed(() => {
    return userType.value === 'Admin' || userType.value === 'OrgAdmin' || userType.value === 'OrgManager';
});

const canDeleteAdmin = computed(() => {
    return userType.value === 'Admin';
});

const canDeleteManager = computed(() => {
    return userType.value === 'Admin' || userType.value === 'OrgAdmin';
});

const canDeleteRegularUser = computed(() => {
    return userType.value === 'Admin' || userType.value === 'OrgAdmin' || userType.value === 'OrgManager';
});

const canFreezeUser = computed(() => {
    return userType.value === 'Admin' || userType.value === 'OrgAdmin' || userType.value === 'OrgManager';
});

const canDeleteThisUser = (user) => {
    switch (user.userType) {
        case 'OrgAdmin':
            return canDeleteAdmin.value;
        case 'OrgManager':
            return canDeleteManager.value;
        case 'User':
        default:
            return canDeleteRegularUser.value;
    }
};

const filteredUsers = computed(() => {
    if (!users.value || !Array.isArray(users.value)) {
        return [];
    }

    let filtered = [...users.value];

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
            (user) =>
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query)
        );
    }

    if (filterRole.value) {
        filtered = filtered.filter((user) => user.role === filterRole.value);
    }

    return filtered.sort((a, b) => {
        const aVal = a[sortBy.value];
        const bVal = b[sortBy.value];

        if (sortDesc.value) {
            return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
    });
});

const paginatedUsers = computed(() => {
    if (!filteredUsers.value || !Array.isArray(filteredUsers.value)) {
        return [];
    }
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredUsers.value.slice(start, end);
});

const totalPages = computed(() => {
    if (!filteredUsers.value || !Array.isArray(filteredUsers.value)) {
        return 0;
    }
    return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});

const totalItems = computed(() => {
    if (!filteredUsers.value || !Array.isArray(filteredUsers.value)) {
        return 0;
    }
    return filteredUsers.value.length;
});

const roleFilterOptions = computed(() => [
    { value: '', label: t('allRoles') },
    { value: 'User', label: t('user') },
    { value: 'OrgManager', label: t('organizationManager') },
    { value: 'OrgAdmin', label: t('organizationAdmin') }
]);

const userRoleOptions = computed(() => [
    { value: 'User', label: t('user') },
    { value: 'OrgManager', label: t('organizationManager') },
    { value: 'OrgAdmin', label: t('organizationAdmin') }
]);

const countryOptions = computed(() => [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'BE', label: 'Belgium' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'AT', label: 'Austria' },
    { value: 'SE', label: 'Sweden' },
    { value: 'NO', label: 'Norway' },
    { value: 'DK', label: 'Denmark' },
    { value: 'FI', label: 'Finland' },
    { value: 'IE', label: 'Ireland' },
    { value: 'PT', label: 'Portugal' },
    { value: 'GR', label: 'Greece' },
    { value: 'PL', label: 'Poland' },
    { value: 'CZ', label: 'Czech Republic' },
    { value: 'HU', label: 'Hungary' },
    { value: 'SK', label: 'Slovakia' },
    { value: 'SI', label: 'Slovenia' },
    { value: 'HR', label: 'Croatia' },
    { value: 'RO', label: 'Romania' },
    { value: 'BG', label: 'Bulgaria' },
    { value: 'LT', label: 'Lithuania' },
    { value: 'LV', label: 'Latvia' },
    { value: 'EE', label: 'Estonia' },
    { value: 'CY', label: 'Cyprus' },
    { value: 'MT', label: 'Malta' },
    { value: 'LU', label: 'Luxembourg' },
    { value: 'IS', label: 'Iceland' },
    { value: 'LI', label: 'Liechtenstein' },
    { value: 'MC', label: 'Monaco' },
    { value: 'SM', label: 'San Marino' },
    { value: 'VA', label: 'Vatican City' },
    { value: 'AD', label: 'Andorra' },
    { value: 'JP', label: 'Japan' },
    { value: 'KR', label: 'South Korea' },
    { value: 'CN', label: 'China' },
    { value: 'IN', label: 'India' },
    { value: 'BR', label: 'Brazil' },
    { value: 'MX', label: 'Mexico' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CL', label: 'Chile' },
    { value: 'CO', label: 'Colombia' },
    { value: 'PE', label: 'Peru' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'EG', label: 'Egypt' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'KE', label: 'Kenya' },
    { value: 'MA', label: 'Morocco' },
    { value: 'TN', label: 'Tunisia' },
    { value: 'DZ', label: 'Algeria' },
    { value: 'LY', label: 'Libya' },
    { value: 'SD', label: 'Sudan' },
    { value: 'ET', label: 'Ethiopia' },
    { value: 'GH', label: 'Ghana' },
    { value: 'UG', label: 'Uganda' },
    { value: 'TZ', label: 'Tanzania' },
    { value: 'ZW', label: 'Zimbabwe' },
    { value: 'BW', label: 'Botswana' },
    { value: 'NA', label: 'Namibia' },
    { value: 'ZM', label: 'Zambia' },
    { value: 'MW', label: 'Malawi' },
    { value: 'MZ', label: 'Mozambique' },
    { value: 'MG', label: 'Madagascar' },
    { value: 'MU', label: 'Mauritius' },
    { value: 'SC', label: 'Seychelles' },
    { value: 'RE', label: 'Réunion' },
    { value: 'YT', label: 'Mayotte' },
    { value: 'KM', label: 'Comoros' },
    { value: 'DJ', label: 'Djibouti' },
    { value: 'SO', label: 'Somalia' },
    { value: 'ER', label: 'Eritrea' },
    { value: 'SS', label: 'South Sudan' },
    { value: 'CF', label: 'Central African Republic' },
    { value: 'TD', label: 'Chad' },
    { value: 'NE', label: 'Niger' },
    { value: 'ML', label: 'Mali' },
    { value: 'BF', label: 'Burkina Faso' },
    { value: 'CI', label: 'Côte d\'Ivoire' },
    { value: 'GN', label: 'Guinea' },
    { value: 'SL', label: 'Sierra Leone' },
    { value: 'LR', label: 'Liberia' },
    { value: 'GM', label: 'Gambia' },
    { value: 'SN', label: 'Senegal' },
    { value: 'GW', label: 'Guinea-Bissau' },
    { value: 'CV', label: 'Cape Verde' },
    { value: 'ST', label: 'São Tomé and Príncipe' },
    { value: 'GQ', label: 'Equatorial Guinea' },
    { value: 'GA', label: 'Gabon' },
    { value: 'CG', label: 'Republic of the Congo' },
    { value: 'CD', label: 'Democratic Republic of the Congo' },
    { value: 'AO', label: 'Angola' },
    { value: 'CM', label: 'Cameroon' },
    { value: 'BI', label: 'Burundi' },
    { value: 'RW', label: 'Rwanda' }
]);

const sortOptions = computed(() => [
    { value: 'name', label: t('name') },
    { value: 'email', label: t('email') },
    { value: 'role', label: t('role') },
    { value: 'dateAdded', label: t('dateAdded') }
]);

const tableColumns = computed(() => [
    { key: 'name', label: t('name'), sortable: true },
    { key: 'userType', label: t('role'), sortable: true },
    { key: 'plan', label: t('plan'), sortable: false },
    { key: 'status', label: t('status'), sortable: true },
    { key: 'dateAdded', label: t('dateAdded'), sortable: true },
    { key: 'actions', label: t('actions'), sortable: false }
]);

// Methods
const getData = async () => {
    try {
        const orgData = await getOrganization(organizationId.value);
        organization.value = orgData;

        const usersData = await getOrganizationUsers(organizationId.value);
        users.value = usersData;
        // Users loaded successfully
    } catch (error) {
        console.error('Error loading data:', error);
    }
};

const goBack = () => {
    router.push('/admin/organizations');
};

const resetFilters = () => {
    searchQuery.value = '';
    filterRole.value = '';
    sortBy.value = 'name';
    sortDesc.value = false;
    currentPage.value = 1;
};

const handleSort = (column) => {
    if (sortBy.value === column) {
        sortDesc.value = !sortDesc.value;
    } else {
        sortBy.value = column;
        sortDesc.value = false;
    }
};

const goToPage = (page) => {
    currentPage.value = page;
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

// Modal methods
const openCreateUserModal = () => {
    resetUserForm();
    showCreateUserModal.value = true;
};

const closeCreateUserModal = () => {
    showCreateUserModal.value = false;
    resetUserForm();
};

const openEditUserModal = (user) => {
    selectedUser.value = user;
    editUserForm.value = {
        id: user.userId,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || user.phone || user.mobilePhone || '',
        userType: user.userType || 'User',
        companyName: user.companyName || '',
        companyWebsite: user.companyWebsite || '',
        companyADStreet: user.companyADStreet || '',
        companyADCity: user.companyADCity || '',
        companyADState: user.companyADState || '',
        companyADZipcode: user.companyADZipcode || '',
        companyADCountry: user.companyADCountry || '',
        disclaimer: user.disclaimer || ''
    };
    showEditUserModal.value = true;
};

const closeEditUserModal = () => {
    showEditUserModal.value = false;
    selectedUser.value = null;
    resetEditUserForm();
};

const openChangeRoleModal = (user) => {
    selectedUser.value = user;
    roleChangeForm.value = {
        userId: user.userId,
        role: user.role
    };
    showChangeRoleModal.value = true;
};

const closeChangeRoleModal = () => {
    showChangeRoleModal.value = false;
    selectedUser.value = null;
    resetRoleChangeForm();
};

const openFreezeModal = (user) => {
    selectedUser.value = user;
    freezeForm.value = {
        userId: user.userId,
        reason: ''
    };
    showFreezeModal.value = true;
};

const closeFreezeModal = () => {
    showFreezeModal.value = false;
    selectedUser.value = null;
    resetFreezeForm();
};

const resetUserForm = () => {
    userForm.value = {
        organizationId: organizationId.value,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        userType: 'User',
        mobileNumber: '',
        companyName: '',
        companyWebsite: '',
        companyADStreet: '',
        companyADCity: '',
        companyADState: '',
        companyADZipcode: '',
        companyADCountry: '',
        disclaimer: ''
    };
};

const resetEditUserForm = () => {
    editUserForm.value = {
        id: null,
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        userType: 'User',
        companyName: '',
        companyWebsite: '',
        companyADStreet: '',
        companyADCity: '',
        companyADState: '',
        companyADZipcode: '',
        companyADCountry: '',
        disclaimer: ''
    };
};

const resetRoleChangeForm = () => {
    roleChangeForm.value = {
        userId: '',
        role: ''
    };
};

const resetFreezeForm = () => {
    freezeForm.value = {
        userId: '',
        reason: ''
    };
};

const handleCreateUserSubmit = async () => {
    try {
        // Ensure organization ID is set
        userForm.value.organizationId = organizationId.value;
        // Submitting user creation
        if (userType.value === "OrgManager") {
            userForm.value.managerId = Number(Cookies.get("login_user_id"));
        }
        await addOrganizationUser(userForm.value);
        showMessage(t('userCreatedSuccessfully'), 'success');
        closeCreateUserModal();
        getData();
    } catch (error) {
        console.error('Error creating user:', error);
        showMessage(t('errorCreatingUser'), 'error');
    }
};

const handleEditUserSubmit = async () => {
    try {
        let response;

        // Updating user

        // Use the appropriate update method based on user type
        switch (editUserForm.value.userType) {
            case 'OrgAdmin':
                response = await updateOrganizationAdmin(editUserForm.value);
                break;
            case 'OrgManager':
                response = await updateOrganizationManager(editUserForm.value);
                break;
            case 'User':
                response = await updateOrganizationUser(editUserForm.value);
                break;
            default:
                response = await updateOrganizationUser(editUserForm.value);
                break;
        }

        // console.log(response);

        if (response.result) {
            showMessage(t('userUpdatedSuccessfully'), 'success');
            closeEditUserModal();
            getData();
        } else {
            showMessage(response.message || t('errorUpdatingUser'), 'error');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showMessage(t('errorUpdatingUser'), 'error');
    }
};

const handleChangeRoleSubmit = async () => {
    try {
        await changeUserRole(roleChangeForm.value.userId, roleChangeForm.value.role);
        showMessage(t('userRoleChangedSuccessfully'), 'success');
        closeChangeRoleModal();
        getData();
    } catch (error) {
        showMessage(t('errorChangingUserRole'), 'error');
    }
};

const handleFreezeSubmit = async () => {
    try {
        const response = await freezeOrganizationUser(freezeForm.value);
        if (response.result) {
            showMessage(t('userFrozenSuccessfully'), 'success');
            closeFreezeModal();
            getData();
        } else {
            showMessage(response.message || t('failedToFreezeUser'), 'error');
        }
    } catch (error) {
        console.error('Error freezing user:', error);
        showMessage(t('failedToFreezeUser'), 'error');
    }
};

const toggleUserStatus = async (user) => {
    try {
        if (user.suspend) {
            // Unfreeze user
            const response = await unfreezeOrganizationUser({ userId: user.userId, reason: '' });
            if (response.result) {
                showMessage(t('userUnfrozenSuccessfully'), 'success');
                getData();
            } else {
                showMessage(response.message || t('failedToUnfreezeUser'), 'error');
            }
        } else {
            // Freeze user - open modal for reason
            openFreezeModal(user);
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        showMessage(t('errorUpdatingUserStatus'), 'error');
    }
};

const removeUserFromOrg = async (user) => {
    try {
        await removeUserFromOrganization(organizationId.value, user.userId);
        showMessage(t('userRemovedFromOrganization'), 'success');
        getData();
    } catch (error) {
        showMessage(t('errorRemovingUserFromOrganization'), 'error');
    }
};

const deleteUser = async (user) => {
    if (!confirm(t('confirmDeleteUser'))) return;

    try {
        let response;

        // Use the appropriate delete method based on user type
        switch (user.userType) {
            case 'OrgAdmin':
                response = await deleteOrganizationAdmin(user.userId);
                break;
            case 'OrgManager':
                response = await deleteOrganizationManager(user.userId);
                break;
            case 'User':
            default:
                response = await deleteOrganizationUser(user.userId);
                break;
        }

        if (response.result) {
            showMessage(t('userDeletedSuccessfully'), 'success');
            getData();
        } else {
            showMessage(response.message || t('errorDeletingUser'), 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage(t('errorDeletingUser'), 'error');
    }
};

// Dropdown methods
const toggleDropdown = (itemId) => {
    Object.keys(openDropdowns.value).forEach(id => {
        if (id !== itemId) {
            openDropdowns.value[id] = false;
        }
    });

    const isOpening = !openDropdowns.value[itemId];
    openDropdowns.value[itemId] = isOpening;

    if (isOpening) {
        nextTick(() => {
            const button = document.querySelector(`[data-dropdown-button="${itemId}"]`);
            if (button) {
                const rect = button.getBoundingClientRect();
                dropdownPositions.value[itemId] = {
                    top: rect.bottom + 4,
                    right: window.innerWidth - rect.right
                };
            }
        });
    }
};

const getDropdownStyle = (itemId) => {
    const position = dropdownPositions.value[itemId];
    if (!position) return {};

    return {
        position: 'fixed',
        top: `${position.top}px`,
        right: `${position.right}px`,
        zIndex: 99999
    };
};

const closeAllDropdowns = () => {
    Object.keys(openDropdowns.value).forEach(id => {
        openDropdowns.value[id] = false;
    });
};

const handleDropdownBlur = (itemId) => {
    setTimeout(() => {
        openDropdowns.value[itemId] = false;
    }, 150);
};

// Helper functions
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const getRoleStatus = (role) => {
    // Determine role status
    switch (role) {
        case 'OrgAdmin': return 'verified';
        case 'OrgManager': return 'caution';
        case 'User': return 'verified';
        default:
            console.log('Unknown role in getRoleStatus:', role);
            return 'blocked';
    }
};

const getRoleText = (role) => {
    // Determine role text
    switch (role) {
        case 'OrgAdmin': return t('organizationAdmin');
        case 'OrgManager': return t('organizationManager');
        case 'User': return t('user');
        default:
            console.log('Unknown role in getRoleText:', role);
            return role || 'Unknown';
    }
};

const getUserStatus = (user) => {
    if (user.suspend) return 'blocked';
    if (user.active === false) return 'inactive';
    return 'verified';
};

const getUserStatusText = (user) => {
    if (user.suspend) return t('frozen');
    if (user.active === false) return t('inactive');
    return t('active');
};

const getPlanName = (user) => {
    if (!user || !user.plan) return null;
    try {
        const planData = typeof user.plan.planData === 'string'
            ? JSON.parse(user.plan.planData)
            : user.plan.planData;
        return planData?.name || t('unknownPlan');
    } catch (e) {
        return t('unknownPlan');
    }
};

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
        showMessage?.({ message: t('failedToLoadSubscriptionDetails'), status: 'error' });
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

// Click outside handler
const handleClickOutside = (event) => {
    const dropdowns = document.querySelectorAll('.organization-user-management__dropdown');
    let clickedInside = false;

    dropdowns.forEach(dropdown => {
        if (dropdown.contains(event.target)) {
            clickedInside = true;
        }
    });

    if (!clickedInside) {
        closeAllDropdowns();
    }
};

const handleWindowResize = () => {
    closeAllDropdowns();
};

onMounted(() => {
    getData();
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleWindowResize);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('resize', handleWindowResize);
});
</script>

<style scoped>
.organization-user-management {
    padding: 1rem;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.organization-user-management__panel {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.organization-user-management__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.organization-user-management__content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    overflow: hidden;
}

.organization-user-management__filters {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
}

.organization-user-management__filters-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.organization-user-management__search {
    flex: 1;
}

.organization-user-management__search-field {
    width: 100%;
}

.organization-user-management__filters-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 1rem;
    align-items: end;
}

.organization-user-management__filter-field {
    min-width: 0;
}

.organization-user-management__table-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: visible;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.organization-user-management__table-card :deep(.base-table) {
    overflow: visible !important;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.organization-user-management__table-card :deep(.base-table__cell) {
    overflow: visible !important;
}

.organization-user-management__table-card :deep(.base-table__cell:last-child) {
    overflow: visible !important;
    position: relative;
    z-index: 10;
}

.organization-user-management__table-card :deep(.base-table__row) {
    overflow: visible !important;
    position: relative;
}

.organization-user-management__table-card :deep(.base-table__body) {
    flex: 1;
    overflow-y: auto;
    overflow-x: visible !important;
    position: relative;
}

.organization-user-management__name-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.organization-user-management__name {
    font-weight: 600;
    color: var(--text-primary);
}

.organization-user-management__email {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.organization-user-management__date {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.organization-user-management__plan-info {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.organization-user-management__plan-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: rgb(0 167 225 / 10%);
    color: var(--accent);
    border: 1px solid rgb(0 167 225 / 30%);
}

.organization-user-management__plan-badge--trial {
    background: rgb(243 156 18 / 10%);
    color: var(--warning);
    border: 1px solid rgb(243 156 18 / 30%);
}

.organization-user-management__billing-cycle {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.organization-user-management__billing-cycle i {
    color: var(--accent);
    font-size: 0.7rem;
}

.organization-user-management__actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    overflow: visible;
    position: relative;
}

.organization-user-management__dropdown {
    position: relative;
    display: inline-block;
    overflow: visible;
    z-index: 1;
}

.organization-user-management__dropdown-button {
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
}

.organization-user-management__dropdown-button:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    color: var(--text-primary);
}

.organization-user-management__dropdown-button i {
    font-size: 0.875rem;
}

.organization-user-management__dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%), 0 2px 4px -1px rgb(0 0 0 / 6%);
    z-index: 99999;
    min-width: 160px;
    margin-top: 4px;
    overflow: visible;
}

.organization-user-management__dropdown-menu--portal {
    position: fixed !important;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%), 0 2px 4px -1px rgb(0 0 0 / 6%);
    z-index: 99999;
    min-width: 160px;
    overflow: visible;
}

.organization-user-management__dropdown-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    color: var(--text-primary);
    font-size: 0.8rem;
    min-height: 32px;
}

.organization-user-management__dropdown-option:hover {
    background: var(--bg-elevated);
}

.organization-user-management__dropdown-option i {
    width: 14px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.organization-user-management__dropdown-option--danger {
    color: var(--danger);
}

.organization-user-management__dropdown-option--danger:hover {
    background: var(--danger-bg);
}

.organization-user-management__dropdown-option--danger i {
    color: var(--danger);
}

.organization-user-management__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
}

.organization-user-management__empty i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.organization-user-management__empty h3 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.organization-user-management__empty p {
    margin-bottom: 1.5rem;
    max-width: 400px;
}

.organization-user-management__pagination {
    padding: 1rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
}

/* Modal Styles */
.organization-user-management__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.organization-user-management__modal {
    background: var(--bg-surface);
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 10%), 0 10px 10px -5px rgb(0 0 0 / 4%);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.organization-user-management__modal--small {
    max-width: 400px;
}

.organization-user-management__modal--medium {
    max-width: 600px;
}

.organization-user-management__modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-shrink: 0;
}

.organization-user-management__modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.organization-user-management__modal-body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    max-height: calc(90vh - 140px);
}

.organization-user-management__modal-form {
    padding: 1rem;
}

.organization-user-management__form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.organization-user-management__form-field {
    margin-bottom: 0.75rem;
}

.organization-user-management__form-section {
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.organization-user-management__form-section h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
}

.organization-user-management__user-info {
    background: var(--bg-elevated);
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
}

.organization-user-management__modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-shrink: 0;
}

/* Responsive Design */
@media (width <= 768px) {
    .organization-user-management {
        padding: 0.5rem;
    }

    .organization-user-management__header {
        flex-direction: column;
        align-items: stretch;
    }

    .organization-user-management__filters-row {
        grid-template-columns: 1fr;
    }

    .organization-user-management__actions {
        justify-content: center;
    }

    .organization-user-management__dropdown {
        width: auto;
    }

    .organization-user-management__dropdown-button {
        width: 28px;
        height: 28px;
        justify-content: center;
    }

    .organization-user-management__modal {
        margin: 0.5rem;
        height: 90vh;
    }

    .organization-user-management__form-grid {
        grid-template-columns: 1fr;
    }
}

/* Plan Details Modal Styles */
.organization-user-management__plan-details-content {
    padding: 1rem 0;
}

.organization-user-management__plan-details-user {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
}

.organization-user-management__plan-details-user h4 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
}

.organization-user-management__plan-details-email {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}

.organization-user-management__plan-details-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.organization-user-management__plan-details-header {
    text-align: center;
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.organization-user-management__plan-details-header h4 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.75rem;
}

.organization-user-management__plan-details-price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
}

.organization-user-management__plan-details-price .price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
}

.organization-user-management__plan-details-price .period {
    font-size: 1rem;
    color: var(--text-secondary);
}

.organization-user-management__plan-details-billing {
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.organization-user-management__plan-details-billing-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
}

.organization-user-management__plan-details-billing-header i {
    color: var(--accent);
    font-size: 1rem;
}

.organization-user-management__plan-details-billing-dates {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1rem;
    color: var(--text-secondary);
}

.organization-user-management__plan-details-billing-dates i {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.organization-user-management__plan-details-status {
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.organization-user-management__plan-details-status-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
}

.organization-user-management__plan-details-status-header i {
    color: var(--accent);
    font-size: 1rem;
}

.organization-user-management__plan-details-status-value {
    display: flex;
    align-items: center;
}

.organization-user-management__plan-details-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
    color: var(--text-secondary);
}

.organization-user-management__plan-details-loading i {
    font-size: 2rem;
    color: var(--accent);
}
</style>
