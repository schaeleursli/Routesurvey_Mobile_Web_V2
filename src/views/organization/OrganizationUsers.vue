<template>
    <div class="organization-users">
        <BasePanel :title="t('organizationUsers')" subtitle="Manage users within your organization" elevation="level2"
            :scrollable="true">
            <template #header>
                <div class="organization-users__header">
                    <BaseButton @click="openAddUserModal()" variant="primary" size="medium"
                        left-icon="fas fa-user-plus">
                        {{ t('addUser') }}
                    </BaseButton>
                    <!-- <BaseButton @click="openBulkAssignModal()" variant="secondary" size="medium"
                        left-icon="fas fa-users">
                        {{ t('bulkAssign') }}
                    </BaseButton> -->
                </div>
            </template>

            <div class="organization-users__content">
                <!-- Search and Filter Controls -->
                <BaseCard class="organization-users__filters">
                    <div class="organization-users__filters-content">
                        <div class="organization-users__search">
                            <BaseFormField v-model="searchQuery" type="text" :placeholder="t('searchUsers')"
                                class="organization-users__search-field">
                                <template #prepend>
                                    <i class="fas fa-search"></i>
                                </template>
                            </BaseFormField>
                        </div>
                        <div class="organization-users__filters-row">
                            <BaseFormField v-model="filterType" type="select" :label="t('filterByRole')"
                                class="organization-users__filter-field" :options="filterOptions" />
                            <BaseFormField v-model="sortBy" type="select" :label="t('sortBy')"
                                class="organization-users__filter-field" :options="sortOptions" />
                        </div>
                    </div>
                </BaseCard>

                <!-- Users Table -->
                <BaseCard class="organization-users__table-card">
                    <BaseTable :items="paginatedUsers" :columns="tableColumns" :loading="loading" clickable
                        @row-click="openUserDetails">
                        <template #cell-name="{ item }">
                            <div class="organization-users__name-cell">
                                <div class="organization-users__name">{{ item.firstName }} {{ item.lastName }}</div>
                                <div class="organization-users__email">{{ item.email }}</div>
                            </div>
                        </template>

                        <template #cell-userType="{ item }">
                            <StatusIndicator :status="getRoleStatus(item.userType)"
                                :title="getRoleText(item.userType)" />
                        </template>

                        <template #cell-plan="{ item }">
                            <div class="organization-users__plan-info">
                                <div class="organization-users__plan-badge" :class="getPlanBadgeClass(item)">
                                    {{ getPlanTitle(item) }}
                                </div>
                                <div v-if="getBillingCycle(item)" class="organization-users__billing-cycle">
                                    <i class="bi bi-calendar-range"></i>
                                    <span>{{ getBillingCycle(item) }}</span>
                                </div>
                            </div>
                        </template>

                        <template #cell-status="{ item }">
                            <StatusIndicator :status="getUserStatus(item)" :text="getUserStatusText(item)" />
                        </template>

                        <template #cell-dateAdded="{ item }">
                            <div class="organization-users__date">
                                {{ formatDate(item.dateAdded) }}
                            </div>
                        </template>

                        <template #cell-actions="{ item }">
                            <div class="organization-users__actions">
                                <div class="organization-users__dropdown" :ref="`dropdown-${item.userId}`">
                                    <button class="organization-users__dropdown-button"
                                        :data-dropdown-button="item.userId" @click.stop="toggleDropdown(item.userId)"
                                        @blur="handleDropdownBlur(item.userId)">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <Teleport to="body">
                                        <div v-if="openDropdowns[item.userId]"
                                            class="organization-users__dropdown-menu organization-users__dropdown-menu--portal"
                                            :style="getDropdownStyle(item.userId)" @click.stop>
                                            <div class="organization-users__dropdown-option"
                                                @click="openEditUserModal(item); openDropdowns[item.userId] = false">
                                                <i class="fas fa-edit"></i>
                                                {{ t('editUser') }}
                                            </div>
                                            <div class="organization-users__dropdown-option"
                                                @click="openPlanDetailsModal(item); openDropdowns[item.userId] = false">
                                                <i class="fas fa-info-circle"></i>
                                                {{ t('viewPlanDetails') }}
                                            </div>
                                            <div v-if="canManagePlans" class="organization-users__dropdown-option"
                                                @click="openPlanModal(item.userId, item.plan); openDropdowns[item.userId] = false">
                                                <i class="fas fa-exchange-alt"></i>
                                                {{ t('switchPlan') }}
                                            </div>
                                            <div v-if="canManagePlans && item.plan"
                                                class="organization-users__dropdown-option organization-users__dropdown-option--danger"
                                                @click="openCancelPlanModal(item.userId); openDropdowns[item.userId] = false">
                                                <i class="fas fa-times"></i>
                                                {{ t('cancelPlan') }}
                                            </div>
                                            <div v-if="canFreezeUser" class="organization-users__dropdown-option"
                                                @click="toggleUserStatus(item); openDropdowns[item.userId] = false">
                                                <i :class="item.suspend ? 'fas fa-play' : 'fas fa-pause'"></i>
                                                {{ item.suspend ? t('unfreezeUser') : t('freezeUser') }}
                                            </div>
                                            <div v-if="canDeleteThisUser(item)"
                                                class="organization-users__dropdown-option organization-users__dropdown-option--danger"
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
                            <div class="organization-users__empty">
                                <i class="fas fa-users"></i>
                                <h3>{{ t('noUsersInOrganization') }}</h3>
                                <p>{{ t('noUsersInOrganizationDescription') }}</p>
                                <BaseButton @click="openAddUserModal()" variant="primary">
                                    {{ t('addFirstUser') }}
                                </BaseButton>
                            </div>
                        </template>
                    </BaseTable>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="organization-users__pagination">
                        <BasePagination :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems"
                            :items-per-page="itemsPerPage" @page-change="goToPage" @next="nextPage"
                            @previous="previousPage" />
                    </div>
                </BaseCard>
            </div>
        </BasePanel>

        <!-- Add User Modal -->
        <div v-if="showAddUserModal" class="organization-users__modal-overlay" @click.self="closeAddUserModal">
            <div class="organization-users__modal" @click.stop>
                <div class="organization-users__modal-header">
                    <h3 class="organization-users__modal-title">{{ t('createNewUser') }}</h3>
                    <BaseButton @click="closeAddUserModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-users__modal-body">
                    <form @submit.prevent="handleAddUserSubmit" class="organization-users__modal-form">
                        <div class="organization-users__form-grid">
                            <BaseFormField v-model="addUserForm.firstName" type="text" :label="t('firstName')" required
                                class="organization-users__form-field" />
                            <BaseFormField v-model="addUserForm.lastName" type="text" :label="t('lastName')" required
                                class="organization-users__form-field" />
                        </div>

                        <div class="organization-users__form-grid">
                            <BaseFormField v-model="addUserForm.email" type="email" :label="t('email')" required
                                class="organization-users__form-field" />
                            <BaseFormField v-model="addUserForm.password" type="password" :label="t('password')"
                                required class="organization-users__form-field" />
                        </div>

                        <div class="organization-users__form-grid">
                            <BaseFormField v-model="addUserForm.mobileNumber" type="tel" :label="t('mobileNumber')"
                                class="organization-users__form-field" />
                            <BaseFormField v-model="addUserForm.userType" type="select" :label="t('role')"
                                :options="userRoleOptions" required class="organization-users__form-field" />
                        </div>

                        <div class="organization-users__form-section">
                            <h4>{{ t('companyInformation') }}</h4>
                            <div class="organization-users__form-grid">
                                <BaseFormField v-model="addUserForm.companyName" type="text" :label="t('companyName')"
                                    class="organization-users__form-field" />
                                <BaseFormField v-model="addUserForm.companyWebsite" type="url"
                                    :label="t('companyWebsite')" class="organization-users__form-field" />
                            </div>
                        </div>

                        <div class="organization-users__form-section">
                            <h4>{{ t('companyAddress') }}</h4>
                            <div class="organization-users__form-grid">
                                <BaseFormField v-model="addUserForm.companyADStreet" type="text" :label="t('street')"
                                    class="organization-users__form-field" />
                                <BaseFormField v-model="addUserForm.companyADCity" type="text" :label="t('city')"
                                    class="organization-users__form-field" />
                            </div>
                            <div class="organization-users__form-grid">
                                <BaseFormField v-model="addUserForm.companyADState" type="text" :label="t('state')"
                                    class="organization-users__form-field" />
                                <BaseFormField v-model="addUserForm.companyADZipcode" type="text" :label="t('zipcode')"
                                    class="organization-users__form-field" />
                            </div>
                            <BaseFormField v-model="addUserForm.companyADCountry" type="select" :label="t('country')"
                                :options="countryOptions" class="organization-users__form-field" />
                        </div>

                        <BaseFormField v-model="addUserForm.disclaimer" type="textarea" :label="t('disclaimer')"
                            :rows="3" class="organization-users__form-field" />
                    </form>
                </div>

                <div class="organization-users__modal-footer">
                    <BaseButton @click="closeAddUserModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleAddUserSubmit">
                        {{ t('createUser') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Edit User Modal -->
        <div v-if="showEditUserModal" class="organization-users__modal-overlay" @click.self="closeEditUserModal">
            <div class="organization-users__modal" @click.stop>
                <div class="organization-users__modal-header">
                    <h3 class="organization-users__modal-title">{{ t('editUser') }}</h3>
                    <BaseButton @click="closeEditUserModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-users__modal-body">
                    <form @submit.prevent="handleEditUserSubmit" class="organization-users__modal-form">
                        <div class="organization-users__form-grid">
                            <BaseFormField v-model="editUserForm.firstName" type="text" :label="t('firstName')" required
                                class="organization-users__form-field" />
                            <BaseFormField v-model="editUserForm.lastName" type="text" :label="t('lastName')" required
                                class="organization-users__form-field" />
                        </div>

                        <div class="organization-users__form-grid">
                            <BaseFormField v-model="editUserForm.email" type="email" :label="t('email')" required
                                :disabled="true" class="organization-users__form-field" />
                            <BaseFormField v-model="editUserForm.mobileNumber" type="tel" :label="t('mobileNumber')"
                                class="organization-users__form-field" />
                        </div>

                        <div class="organization-users__form-grid">
                            <BaseFormField v-model="editUserForm.userType" type="select" :label="t('role')"
                                :options="userTypeOptions" required class="organization-users__form-field" />
                        </div>
                    </form>
                </div>

                <div class="organization-users__modal-footer">
                    <BaseButton @click="closeEditUserModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleEditUserSubmit">
                        {{ t('updateUser') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Edit User Role Modal -->
        <div v-if="showEditUserRoleModal" class="organization-users__modal-overlay"
            @click.self="closeEditUserRoleModal">
            <BaseCard class="organization-users__modal organization-users__modal--small" @click.stop>
                <template #header>
                    <div class="organization-users__modal-header">
                        <h3 class="organization-users__modal-title">{{ t('editUserRole') }}</h3>
                        <BaseButton @click="closeEditUserRoleModal" variant="ghost" size="small">
                            <i class="fas fa-times"></i>
                        </BaseButton>
                    </div>
                </template>

                <form @submit.prevent="handleEditUserRoleSubmit" class="organization-users__modal-form">
                    <div class="organization-users__user-info">
                        <p><strong>{{ t('user') }}:</strong> {{ selectedUser?.firstName }} {{ selectedUser?.lastName }}
                        </p>
                        <p><strong>{{ t('currentRole') }}:</strong> {{ getRoleText(selectedUser?.userType) }}</p>
                    </div>

                    <BaseFormField v-model="editUserRoleForm.userType" type="select" :label="t('newRole')"
                        :options="userTypeOptions" required class="organization-users__form-field" />
                </form>

                <template #footer>
                    <div class="organization-users__modal-footer">
                        <BaseButton @click="closeEditUserRoleModal" variant="secondary">
                            {{ t('cancel') }}
                        </BaseButton>
                        <BaseButton type="submit" variant="primary" @click="handleEditUserRoleSubmit">
                            {{ t('updateRole') }}
                        </BaseButton>
                    </div>
                </template>
            </BaseCard>
        </div>

        <!-- Bulk Assign Modal -->
        <div v-if="showBulkAssignModal" class="organization-users__modal-overlay" @click.self="closeBulkAssignModal">
            <BaseCard class="organization-users__modal organizations-users__modal--large" @click.stop>
                <template #header>
                    <div class="organization-users__modal-header">
                        <h3 class="organization-users__modal-title">{{ t('bulkAssignUsers') }}</h3>
                        <BaseButton @click="closeBulkAssignModal" variant="ghost" size="small">
                            <i class="fas fa-times"></i>
                        </BaseButton>
                    </div>
                </template>

                <form @submit.prevent="handleBulkAssignSubmit" class="organization-users__modal-form">
                    <div class="organization-users__bulk-info">
                        <p><strong>{{ t('organization') }}:</strong> {{ organizationName }}</p>
                        <p>{{ t('bulkAssignDescription') }}</p>
                    </div>

                    <BaseFormField v-model="bulkAssignForm.userIds" type="textarea" :label="t('userIds')"
                        :placeholder="t('enterUserIdsCommaSeparated')" :rows="4" required
                        class="organization-users__form-field" />

                    <BaseFormField v-model="bulkAssignForm.userType" type="select" :label="t('assignRole')"
                        :options="userTypeOptions" required class="organization-users__form-field" />
                </form>

                <template #footer>
                    <div class="organization-users__modal-footer">
                        <BaseButton @click="closeBulkAssignModal" variant="secondary">
                            {{ t('cancel') }}
                        </BaseButton>
                        <!-- <BaseButton type="submit" variant="primary" @click="handleBulkAssignSubmit">
                            {{ t('bulkAssign') }}
                        </BaseButton> -->
                    </div>
                </template>
            </BaseCard>
        </div>

        <!-- Freeze User Modal -->
        <div v-if="showFreezeModal" class="organization-users__modal-overlay" @click.self="closeFreezeModal">
            <div class="organization-users__modal organization-users__modal--small" @click.stop>
                <div class="organization-users__modal-header">
                    <h3 class="organization-users__modal-title">{{ t('freezeUser') }}</h3>
                    <BaseButton @click="closeFreezeModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-users__modal-body">
                    <form @submit.prevent="handleFreezeSubmit" class="organization-users__modal-form">
                        <div class="organization-users__user-info">
                            <p><strong>{{ t('user') }}:</strong> {{ selectedUser?.firstName }} {{ selectedUser?.lastName
                                }}
                                ({{
                                    selectedUser?.email }})
                            </p>
                        </div>

                        <BaseFormField v-model="freezeForm.reason" type="textarea" :label="t('freezeReason')"
                            :placeholder="t('enterFreezeReason')" required :rows="4"
                            class="organization-users__form-field" />
                    </form>
                </div>

                <div class="organization-users__modal-footer">
                    <BaseButton @click="closeFreezeModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleFreezeSubmit">
                        {{ t('freezeUser') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Plan Switch Modal -->
        <div v-if="showPlanModal" class="organization-users__modal-overlay" @click.self="closePlanModal">
            <div class="organization-users__modal organization-users__modal--small" @click.stop>
                <div class="organization-users__modal-header">
                    <h3 class="organization-users__modal-title">{{ t('switchUserPlan') }}</h3>
                    <BaseButton @click="closePlanModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-users__modal-body">
                    <form @submit.prevent="handlePlanSubmit" class="organization-users__modal-form">
                        <div class="organization-users__form-field">
                            <label class="organization-users__form-label">{{ t('newPlan') }}</label>
                            <select v-model="planForm.newPlan" class="organization-users__form-select" required>
                                <option value="" disabled>{{ t('selectPlan') }}</option>
                                <option v-for="plan in planOptions" :key="plan.value" :value="plan.value">
                                    {{ plan.label }}
                                </option>
                            </select>
                        </div>
                    </form>
                </div>

                <div class="organization-users__modal-footer">
                    <BaseButton @click="closePlanModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handlePlanSubmit">
                        {{ t('switchPlan') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Cancel Plan Modal -->
        <div v-if="showCancelPlanModal" class="organization-users__modal-overlay" @click.self="closeCancelPlanModal">
            <div class="organization-users__modal organization-users__modal--small" @click.stop>
                <div class="organization-users__modal-header">
                    <h3 class="organization-users__modal-title">{{ t('cancelUserPlan') }}</h3>
                    <BaseButton @click="closeCancelPlanModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-users__modal-body">
                    <form @submit.prevent="handleCancelPlanSubmit" class="organization-users__modal-form">
                        <div class="organization-users__user-info">
                            <p><strong>{{ t('confirmCancelPlan') }}</strong></p>
                            <p>{{ t('cancelPlanWarning') }}</p>
                        </div>
                    </form>
                </div>

                <div class="organization-users__modal-footer">
                    <BaseButton @click="closeCancelPlanModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleCancelPlanSubmit">
                        {{ t('cancelPlan') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Plan Details Modal -->
        <div v-if="showPlanDetailsModal" class="organization-users__modal-overlay" @click.self="closePlanDetailsModal">
            <div class="organization-users__modal organization-users__modal--medium" @click.stop>
                <div class="organization-users__modal-header">
                    <h3 class="organization-users__modal-title">{{ t('planDetails') }}</h3>
                    <BaseButton @click="closePlanDetailsModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-users__plan-details-content" v-if="selectedUserForPlanDetails">
                    <!-- Loading State -->
                    <div v-if="loadingPlanDetails" class="organization-users__plan-details-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>{{ t('loading') }}...</span>
                    </div>

                    <!-- Content -->
                    <template v-else>
                        <!-- User Info -->
                        <div class="organization-users__plan-details-user">
                            <h4>{{ selectedUserForPlanDetails.firstName }} {{ selectedUserForPlanDetails.lastName }}
                            </h4>
                            <p class="organization-users__plan-details-email">{{ selectedUserForPlanDetails.email }}</p>
                        </div>

                        <!-- Plan Info -->
                        <div v-if="userSubscriptionData" class="organization-users__plan-details-section">
                            <div class="organization-users__plan-details-header">
                                <h4>{{ getPlanTitleForDetails() }}</h4>
                                <div class="organization-users__plan-details-price">
                                    <span class="price">${{ getPlanPrice(selectedUserForPlanDetails) }}</span>
                                    <span class="period">/{{ t('month') }}</span>
                                </div>
                            </div>

                            <!-- Billing Cycle -->
                            <div v-if="userStripeData && userStripeData.startDate && userStripeData.currentPeriodEnd"
                                class="organization-users__plan-details-billing">
                                <div class="organization-users__plan-details-billing-header">
                                    <i class="bi bi-calendar-range"></i>
                                    <strong>{{ t('billingCycle') }}</strong>
                                </div>
                                <div class="organization-users__plan-details-billing-dates">
                                    <span>{{ getBillingCycleDates(selectedUserForPlanDetails).start }}</span>
                                    <i class="fas fa-arrow-right"></i>
                                    <span>{{ getBillingCycleDates(selectedUserForPlanDetails).end }}</span>
                                </div>
                            </div>

                            <!-- Subscription Status -->
                            <div class="organization-users__plan-details-status">
                                <div class="organization-users__plan-details-status-header">
                                    <i class="bi bi-info-circle"></i>
                                    <strong>{{ t('subscriptionStatus') }}</strong>
                                </div>
                                <div class="organization-users__plan-details-status-value">
                                    <StatusIndicator :status="getSubscriptionStatus(selectedUserForPlanDetails)"
                                        :text="getSubscriptionStatusText(selectedUserForPlanDetails)" />
                                </div>
                            </div>
                        </div>

                        <!-- No Plan / Trial -->
                        <div v-else class="organization-users__plan-details-section">
                            <div class="organization-users__plan-details-header">
                                <h4>{{ selectedUserForPlanDetails.isExpired ? t('trialExpired') : t('trial') }}</h4>
                            </div>
                            <div class="organization-users__plan-details-status">
                                <div class="organization-users__plan-details-status-header">
                                    <i class="bi bi-info-circle"></i>
                                    <strong>{{ t('status') }}</strong>
                                </div>
                                <div class="organization-users__plan-details-status-value">
                                    <StatusIndicator
                                        :status="selectedUserForPlanDetails.isExpired ? 'blocked' : 'caution'"
                                        :text="selectedUserForPlanDetails.isExpired ? t('trialExpired') : t('trial')" />
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="organization-users__modal-footer">
                    <BaseButton @click="closePlanDetailsModal" variant="secondary">
                        {{ t('close') }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, inject, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOrganizationsAdmin } from '@/composables/useOrganizationsAdmin';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
import OrganizationsAdminController from '@/controllers/organizations_admin/organizations_admin_controller';
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

// Inject showMessage from global state
const showMessage = inject('showMessage');

// Use the organizations admin composable
const {
    getOrganization,
    getOrganizationUsers,
    getManagerUsers,
    addOrganizationUser,
    updateOrganizationUser,
    updateOrganizationAdmin,
    updateOrganizationManager,
    deleteOrganizationAdmin,
    deleteOrganizationManager,
    deleteOrganizationUser,
    freezeOrganizationUser,
    unfreezeOrganizationUser,
    removeUserFromOrganization,
    switchUserPlan,
    cancelUserPlan,
    getSubscriptionPlans,
    openPlanModal,
    closePlanModal,
    openCancelPlanModal,
    closeCancelPlanModal,
    plans,
    planOptions,
    showPlanModal,
    showCancelPlanModal,
    planForm,
    cancelPlanForm
} = useOrganizationsAdmin(showMessage);

const userType = ref('User');

// State
const organization = ref(null);
const users = ref([]);
const organizationName = ref('');
const searchQuery = ref('');
const filterType = ref('');
const sortBy = ref('');
const sortDesc = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const loading = ref(false);

// Modal states
const showAddUserModal = ref(false);
const showEditUserModal = ref(false);
const showEditUserRoleModal = ref(false);
const showBulkAssignModal = ref(false);
const showFreezeModal = ref(false);
const selectedUser = ref(null);

// Dropdown state
const openDropdowns = ref({});
const dropdownPositions = ref({});

// Forms
const addUserForm = ref({
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
    companyADCountry: 'US',
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

const editUserRoleForm = ref({
    userId: '',
    userType: ''
});

const bulkAssignForm = ref({
    organizationId: '',
    userIds: '',
    userType: 'User'
});

const freezeForm = ref({
    userId: '',
    reason: ''
});

// Computed properties
const filteredUsers = computed(() => {
    let filtered = users.value;

    // Search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(user =>
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    }

    // Type filter
    if (filterType.value) {
        filtered = filtered.filter(user => user.userType === filterType.value);
    }

    return filtered;
});

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredUsers.value.slice(start, end);
});

const totalPages = computed(() =>
    Math.ceil(filteredUsers.value.length / itemsPerPage.value)
);

const totalItems = computed(() => filteredUsers.value.length);

// Permission checks
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

const canManagePlans = computed(() => {
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

// Filter options
const filterOptions = computed(() => userType.value === "OrgAdmin" ? [
    { value: '', label: t('allUsers') },
    { value: 'User', label: t('user') },
    { value: 'OrgManager', label: t('organizationManager') },
] : userType.value === "OrgManager" ? [
    { value: '', label: t('allUsers') },
    { value: 'User', label: t('user') },
] : []);

const sortOptions = computed(() => [
    { value: 'name', label: t('name') },
    { value: 'userType', label: t('userType') },
    { value: 'lastLogin', label: t('lastLogin') },
    { value: 'active', label: t('status') }
]);

const userTypeOptions = computed(() => userType.value === "OrgAdmin" ? [
    { value: 'User', label: t('user') },
    { value: 'OrgManager', label: t('organizationManager') },
] : userType.value === "OrgManager" ? [
    { value: 'User', label: t('user') },
] : []);

const userRoleOptions = computed(() => userType.value === "OrgAdmin" ? [
    { value: 'User', label: t('user') },
    { value: 'OrgManager', label: t('organizationManager') },
] : userType.value === "OrgManager" ? [
    { value: 'User', label: t('user') },
] : []);

const countryOptions = computed(() => [
    { value: 'US', label: '🇺🇸 United States' },
    { value: 'CA', label: '🇨🇦 Canada' },
    { value: 'GB', label: '🇬🇧 United Kingdom' },
    { value: 'AU', label: '🇦🇺 Australia' },
    { value: 'DE', label: '🇩🇪 Germany' },
    { value: 'FR', label: '🇫🇷 France' },
    { value: 'IT', label: '🇮🇹 Italy' },
    { value: 'ES', label: '🇪🇸 Spain' },
    { value: 'NL', label: '🇳🇱 Netherlands' },
    { value: 'BE', label: '🇧🇪 Belgium' },
    { value: 'CH', label: '🇨🇭 Switzerland' },
    { value: 'AT', label: '🇦🇹 Austria' },
    { value: 'SE', label: '🇸🇪 Sweden' },
    { value: 'NO', label: '🇳🇴 Norway' },
    { value: 'DK', label: '🇩🇰 Denmark' },
    { value: 'FI', label: '🇫🇮 Finland' },
    { value: 'IE', label: '🇮🇪 Ireland' },
    { value: 'PT', label: '🇵🇹 Portugal' },
    { value: 'GR', label: '🇬🇷 Greece' },
    { value: 'PL', label: '🇵🇱 Poland' },
    { value: 'CZ', label: '🇨🇿 Czech Republic' },
    { value: 'HU', label: '🇭🇺 Hungary' },
    { value: 'SK', label: '🇸🇰 Slovakia' },
    { value: 'SI', label: '🇸🇮 Slovenia' },
    { value: 'HR', label: '🇭🇷 Croatia' },
    { value: 'RO', label: '🇷🇴 Romania' },
    { value: 'BG', label: '🇧🇬 Bulgaria' },
    { value: 'LT', label: '🇱🇹 Lithuania' },
    { value: 'LV', label: '🇱🇻 Latvia' },
    { value: 'EE', label: '🇪🇪 Estonia' },
    { value: 'CY', label: '🇨🇾 Cyprus' },
    { value: 'MT', label: '🇲🇹 Malta' },
    { value: 'LU', label: '🇱🇺 Luxembourg' },
    { value: 'IS', label: '🇮🇸 Iceland' },
    { value: 'LI', label: '🇱🇮 Liechtenstein' },
    { value: 'MC', label: '🇲🇨 Monaco' },
    { value: 'SM', label: '🇸🇲 San Marino' },
    { value: 'VA', label: '🇻🇦 Vatican City' },
    { value: 'AD', label: '🇦🇩 Andorra' },
    { value: 'JP', label: '🇯🇵 Japan' },
    { value: 'KR', label: '🇰🇷 South Korea' },
    { value: 'CN', label: '🇨🇳 China' },
    { value: 'IN', label: '🇮🇳 India' },
    { value: 'BR', label: '🇧🇷 Brazil' },
    { value: 'MX', label: '🇲🇽 Mexico' },
    { value: 'AR', label: '🇦🇷 Argentina' },
    { value: 'CL', label: '🇨🇱 Chile' },
    { value: 'CO', label: '🇨🇴 Colombia' },
    { value: 'PE', label: '🇵🇪 Peru' },
    { value: 'VE', label: '🇻🇪 Venezuela' },
    { value: 'ZA', label: '🇿🇦 South Africa' },
    { value: 'EG', label: '🇪🇬 Egypt' },
    { value: 'NG', label: '🇳🇬 Nigeria' },
    { value: 'KE', label: '🇰🇪 Kenya' },
    { value: 'MA', label: '🇲🇦 Morocco' },
    { value: 'TN', label: '🇹🇳 Tunisia' },
    { value: 'DZ', label: '🇩🇿 Algeria' },
    { value: 'LY', label: '🇱🇾 Libya' },
    { value: 'SD', label: '🇸🇩 Sudan' },
    { value: 'ET', label: '🇪🇹 Ethiopia' },
    { value: 'GH', label: '🇬🇭 Ghana' },
    { value: 'UG', label: '🇺🇬 Uganda' },
    { value: 'TZ', label: '🇹🇿 Tanzania' },
    { value: 'ZW', label: '🇿🇼 Zimbabwe' },
    { value: 'BW', label: '🇧🇼 Botswana' },
    { value: 'NA', label: '🇳🇦 Namibia' },
    { value: 'ZM', label: '🇿🇲 Zambia' },
    { value: 'MW', label: '🇲🇼 Malawi' },
    { value: 'MZ', label: '🇲🇿 Mozambique' },
    { value: 'MG', label: '🇲🇬 Madagascar' },
    { value: 'MU', label: '🇲🇺 Mauritius' },
    { value: 'SC', label: '🇸🇨 Seychelles' },
    { value: 'RE', label: '🇷🇪 Réunion' },
    { value: 'YT', label: '🇾🇹 Mayotte' },
    { value: 'KM', label: '🇰🇲 Comoros' },
    { value: 'DJ', label: '🇩🇯 Djibouti' },
    { value: 'SO', label: '🇸🇴 Somalia' },
    { value: 'ER', label: '🇪🇷 Eritrea' },
    { value: 'SS', label: '🇸🇸 South Sudan' },
    { value: 'CF', label: '🇨🇫 Central African Republic' },
    { value: 'TD', label: '🇹🇩 Chad' },
    { value: 'NE', label: '🇳🇪 Niger' },
    { value: 'ML', label: '🇲🇱 Mali' },
    { value: 'BF', label: '🇧🇫 Burkina Faso' },
    { value: 'CI', label: '🇨🇮 Côte d\'Ivoire' },
    { value: 'GN', label: '🇬🇳 Guinea' },
    { value: 'SL', label: '🇸🇱 Sierra Leone' },
    { value: 'LR', label: '🇱🇷 Liberia' },
    { value: 'GM', label: '🇬🇲 Gambia' },
    { value: 'SN', label: '🇸🇳 Senegal' },
    { value: 'GW', label: '🇬🇼 Guinea-Bissau' },
    { value: 'CV', label: '🇨🇻 Cape Verde' },
    { value: 'ST', label: '🇸🇹 São Tomé and Príncipe' },
    { value: 'GQ', label: '🇬🇶 Equatorial Guinea' },
    { value: 'GA', label: '🇬🇦 Gabon' },
    { value: 'CG', label: '🇨🇬 Republic of the Congo' },
    { value: 'CD', label: '🇨🇩 Democratic Republic of the Congo' },
    { value: 'AO', label: '🇦🇴 Angola' },
    { value: 'CM', label: '🇨🇲 Cameroon' },
    { value: 'BI', label: '🇧🇮 Burundi' },
    { value: 'RW', label: '🇷🇼 Rwanda' }
]);

// Table columns
const tableColumns = computed(() => [
    { key: 'name', label: t('name'), sortable: true },
    { key: 'userType', label: t('role'), sortable: true },
    { key: 'plan', label: t('plan'), sortable: false },
    // { key: 'status', label: t('status'), sortable: true },
    { key: 'dateAdded', label: t('dateAdded'), sortable: true },
    { key: 'actions', label: t('actions'), sortable: false }
]);

// Methods
const getData = async () => {
    await getCurrentUserData();
    await getMyOrganization();
    await loadOrganizationUsers(organization.value.id);
    await getSubscriptionPlans();
}

const getMyOrganization = async () => {
    try {
        // Get current user's organization ID from the organization manage page context
        // For now, we'll need to get this from the current organization context
        // This should be passed as a prop or obtained from the parent component
        // const organizationId = organization.value?.id;
        // if (organizationId) {
        //     const orgData = await getOrganization(organizationId);
        //     organizationName.value = orgData.name;
        //     await loadOrganizationUsers(organizationId);
        // }

        const response = await OrganizationsAdminController.getCurrentUserOrganization();
        if (response.result) {
            organization.value = response.data;
            organizationName.value = response.data.name;
            await loadOrganizationUsers(response.data.id);
        } else {
            showMessage?.({ message: response.message, status: 'error' });
        }
    } catch (error) {
        console.error('Error fetching organization:', error);
        showMessage?.({ message: t('errorFetchingOrganization'), status: 'error' });
    }
};

const loadOrganizationUsers = async (organizationId) => {
    try {
        loading.value = true;
        const usersData = userType.value === "OrgAdmin" ? await getOrganizationUsers(organizationId) : userType.value === "OrgManager" ? await getManagerUsers() : await getOrganizationUsers(organizationId);
        users.value = usersData || [];
        if (userType.value === "OrgAdmin") {
            users.value = users.value.filter(e => e.userType !== "OrgAdmin");
        }
        else if (userType.value === "OrgManager") {
            users.value = users.value.filter(e => e.userType !== "OrgAdmin" && e.userType !== "OrgManager");
        }
        else if (userType.value === "User") {
            users.value = [];
        }
    } catch (error) {
        console.error('Error fetching organization users:', error);
        showMessage?.({ message: t('errorFetchingOrganizationUsers'), status: 'error' });
    } finally {
        loading.value = false;
    }
};

const openAddUserModal = () => {
    addUserForm.value = {
        organizationId: organization.value?.id || '',
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
        companyADCountry: 'US',
        disclaimer: ''
    };
    showAddUserModal.value = true;
};

const closeAddUserModal = () => {
    showAddUserModal.value = false;
};

const handleAddUserSubmit = async () => {
    try {
        // Ensure organization ID is set
        addUserForm.value.organizationId = organization.value?.id;

        if (userType.value === "OrgManager") {
            addUserForm.value.managerId = Number(Cookies.get("login_user_id"));
        }

        console.log('Submitting user form:', addUserForm.value);


        const response = await addOrganizationUser(addUserForm.value);
        if (response.result) {
            showMessage?.({ message: t('userCreatedSuccessfully'), status: 'success' });
            closeAddUserModal();
            await loadOrganizationUsers(organization.value?.id);
        } else {
            showMessage?.({ message: response.message || t('errorCreatingUser'), status: 'error' });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showMessage?.({ message: t('errorCreatingUser'), status: 'error' });
    }
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

const openEditUserRoleModal = (user) => {
    selectedUser.value = user;
    editUserRoleForm.value = {
        userId: user.userId,
        userType: user.userType
    };
    showEditUserRoleModal.value = true;
};

const closeEditUserRoleModal = () => {
    showEditUserRoleModal.value = false;
    selectedUser.value = null;
    editUserRoleForm.value = {
        userId: '',
        userType: ''
    };
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

const resetFreezeForm = () => {
    freezeForm.value = {
        userId: '',
        reason: ''
    };
};

const handleEditUserSubmit = async () => {
    try {
        let response;

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

        if (response.result) {
            showMessage?.({ message: t('userUpdatedSuccessfully'), status: 'success' });
            closeEditUserModal();
            await loadOrganizationUsers(organization.value?.id);
        } else {
            showMessage?.({ message: response.message || t('errorUpdatingUser'), status: 'error' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showMessage?.({ message: t('errorUpdatingUser'), status: 'error' });
    }
};

const handleEditUserRoleSubmit = async () => {
    try {
        // This would require a new API endpoint to update user role within organization
        showMessage?.({ message: t('featureNotImplemented'), status: 'warning' });
        closeEditUserRoleModal();
    } catch (error) {
        console.error('Error updating user role:', error);
        showMessage?.({ message: t('errorUpdatingUserRole'), status: 'error' });
    }
};

const handleFreezeSubmit = async () => {
    try {
        const response = await freezeOrganizationUser(freezeForm.value);
        if (response.result) {
            showMessage?.({ message: t('userFrozenSuccessfully'), status: 'success' });
            closeFreezeModal();
            await loadOrganizationUsers(organization.value?.id);
        } else {
            showMessage?.({ message: response.message || t('failedToFreezeUser'), status: 'error' });
        }
    } catch (error) {
        console.error('Error freezing user:', error);
        showMessage?.({ message: t('failedToFreezeUser'), status: 'error' });
    }
};

const toggleUserStatus = async (user) => {
    try {
        if (user.suspend) {
            // Unfreeze user
            const response = await unfreezeOrganizationUser({ userId: user.userId, reason: '' });
            if (response.result) {
                showMessage?.({ message: t('userUnfrozenSuccessfully'), status: 'success' });
                await loadOrganizationUsers(organization.value?.id);
            } else {
                showMessage?.({ message: response.message || t('failedToUnfreezeUser'), status: 'error' });
            }
        } else {
            // Freeze user - open modal for reason
            openFreezeModal(user);
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        showMessage?.({ message: t('errorUpdatingUserStatus'), status: 'error' });
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
            showMessage?.({ message: t('userDeletedSuccessfully'), status: 'success' });
            await loadOrganizationUsers(organization.value?.id);
        } else {
            showMessage?.({ message: response.message || t('errorDeletingUser'), status: 'error' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage?.({ message: t('errorDeletingUser'), status: 'error' });
    }
};

const openBulkAssignModal = () => {
    bulkAssignForm.value = {
        organizationId: '',
        userIds: '',
        userType: 'User'
    };
    showBulkAssignModal.value = true;
};

const closeBulkAssignModal = () => {
    showBulkAssignModal.value = false;
};

const handleBulkAssignSubmit = async () => {
    try {
        const userIds = bulkAssignForm.value.userIds.split(',').map(id => id.trim()).filter(id => id);

        // Process each user assignment
        const promises = userIds.map(userId =>
            addOrganizationUser({
                organizationId: organization.value?.id,
                userEmail: userId, // Assuming userIds are actually emails in this context
                userType: bulkAssignForm.value.userType
            })
        );

        const results = await Promise.allSettled(promises);
        const successful = results.filter(result => result.status === 'fulfilled' && result.value.result).length;
        const failed = results.length - successful;

        if (successful > 0) {
            showMessage?.({ message: t('bulkAssignSuccess', { successful, failed }), status: 'success' });
            closeBulkAssignModal();
            await loadOrganizationUsers(organization.value?.id);
        } else {
            showMessage?.({ message: t('bulkAssignFailed'), status: 'error' });
        }
    } catch (error) {
        console.error('Error bulk assigning users:', error);
        showMessage?.({ message: t('errorBulkAssigningUsers'), status: 'error' });
    }
};

const removeUserFromOrg = async (user) => {
    if (!confirm(t('confirmRemoveUserFromOrganization'))) return;

    try {
        const response = await removeUserFromOrganization(organization.value?.id, user.userId);
        if (response.result) {
            showMessage?.({ message: t('userRemovedFromOrganization'), status: 'success' });
            await loadOrganizationUsers(organization.value?.id);
        } else {
            showMessage?.({ message: response.message || t('errorRemovingUserFromOrganization'), status: 'error' });
        }
    } catch (error) {
        console.error('Error removing user from organization:', error);
        showMessage?.({ message: t('errorRemovingUserFromOrganization'), status: 'error' });
    }
};

const openUserDetails = (user) => {
    // Navigate to user details or open user modal
    console.log('Open user details:', user);
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

// Helper functions
const formatDate = (dateString) => {
    if (!dateString) return t('never');
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

const getRoleStatus = (role) => {
    switch (role) {
        case 'OrgAdmin': return 'verified';
        case 'OrgManager': return 'caution';
        case 'User': return 'verified';
        default: return 'blocked';
    }
};

const getRoleText = (role) => {
    switch (role) {
        case 'OrgAdmin': return t('organizationAdmin');
        case 'OrgManager': return t('organizationManager');
        case 'User': return t('user');
        default: return role || 'Unknown';
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

// Plan helper functions
const getPlanTitle = (user) => {
    if (user.plan) {
        return t(String(JSON.parse(user.plan.planData).name).toLowerCase());
    }
    return user.isExpired ? t('trailExpired') : t('trail');
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

const getPlanBadgeClass = (user) => {
    if (user.plan) {
        const planName = JSON.parse(user.plan.planData).name.toLowerCase().replace("plan", "");
        switch (planName) {
            case 'core':
                return 'organization-users__plan-badge--core';
            case 'professional':
                return 'organization-users__plan-badge--professional';
            case 'enterprise':
                return 'organization-users__plan-badge--enterprise';
            default:
                return 'organization-users__plan-badge--default';
        }
    }
    if (user.isExpired) return 'organization-users__plan-badge--expired';
    return 'organization-users__plan-badge--trial';
};

const getCurrentUserData = async () => {
    if (!authStore.user) {
        await authStore.fetchUserProfile();
    }
    if (authStore.user) {
        userType.value = authStore.user.type;
    }
}

// Plan handling functions
const handlePlanSubmit = async () => {
    try {
        const success = await switchUserPlan(planForm.value);
        if (success) {
            closePlanModal();
            // Reload users after successful plan switch
            await getData();
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error handling plan submit:", error);
        return false;
    }
};

const handleCancelPlanSubmit = async () => {
    try {
        const success = await cancelUserPlan(cancelPlanForm.value.userId);
        if (success) {
            closeCancelPlanModal();
            // Reload users after successful plan cancellation
            await getData();
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error handling cancel plan submit:", error);
        return false;
    }
};

// Method to set organization data from parent component
const setOrganization = (orgData) => {
    organization.value = orgData;
    organizationName.value = orgData.name;
    loadOrganizationUsers(orgData.id);
};

// Click outside handler
const handleClickOutside = (event) => {
    const dropdowns = document.querySelectorAll('.organization-users__dropdown');
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
.organization-users {
    padding: 1rem;
}

.organization-users__header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
}

.organization-users__content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.organization-users__filters {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
}

.organization-users__filters-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.organization-users__search {
    flex: 1;
}

.organization-users__filters-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.organization-users__table-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
}

.organization-users__name-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.organization-users__name {
    font-weight: 600;
    color: var(--text-primary);
}

.organization-users__email {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.organization-users__date {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.organization-users__actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    overflow: visible;
    position: relative;
}

.organization-users__dropdown {
    position: relative;
    display: inline-block;
    overflow: visible;
    z-index: 1;
}

.organization-users__dropdown-button {
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

.organization-users__dropdown-button:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    color: var(--text-primary);
}

.organization-users__dropdown-button i {
    font-size: 0.875rem;
}

.organization-users__dropdown-menu {
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

.organization-users__dropdown-menu--portal {
    position: fixed !important;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%), 0 2px 4px -1px rgb(0 0 0 / 6%);
    z-index: 99999;
    min-width: 160px;
    overflow: visible;
}

.organization-users__dropdown-option {
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

.organization-users__dropdown-option:hover {
    background: var(--bg-elevated);
}

.organization-users__dropdown-option i {
    width: 14px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.organization-users__dropdown-option--danger {
    color: var(--danger);
}

.organization-users__dropdown-option--danger:hover {
    background: var(--danger-bg);
}

.organization-users__dropdown-option--danger i {
    color: var(--danger);
}

.organization-users__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    color: var(--text-secondary);
}

.organization-users__empty i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.organization-users__empty h3 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.organization-users__empty p {
    margin-bottom: 1.5rem;
    max-width: 400px;
}

.organization-users__pagination {
    padding: 1rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
}

/* Modal Styles */
.organization-users__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.organization-users__modal {
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

.organization-users__modal--small {
    max-width: 400px;
}

.organization-users__modal--medium {
    max-width: 600px;
}


.organizations-users__modal--large {
    max-width: 800px;
}

.organization-users__modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-shrink: 0;
}

.organization-users__modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.organization-users__modal-body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    max-height: calc(90vh - 140px);

    /* Subtract header and footer height */
}

.organization-users__modal-form {
    padding: 1rem;
}

.organization-users__modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-shrink: 0;
}

.organization-users__assignment-info,
.organization-users__user-info,
.organization-users__bulk-info {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.organization-users__assignment-info p,
.organization-users__user-info p,
.organization-users__bulk-info p {
    margin: 0 0 0.5rem;
    color: var(--text-primary);
}

.organization-users__assignment-info p:last-child,
.organization-users__user-info p:last-child,
.organization-users__bulk-info p:last-child {
    margin-bottom: 0;
}

.organization-users__form-field {
    margin-bottom: 0.75rem;
}

.organization-users__form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.organization-users__form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
}

.organization-users__form-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 0.875rem;
    transition: border-color 0.2s ease;
}

.organization-users__form-select:focus {
    outline: none;
    border-color: var(--accent);
}

.organization-users__form-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Plan Badge Styling */
.organization-users__plan-info {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.organization-users__plan-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.organization-users__billing-cycle {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.organization-users__billing-cycle i {
    color: var(--accent);
    font-size: 0.7rem;
}

/* Plan Details Modal Styles */
.organization-users__plan-details-content {
    padding: 1rem 0;
}

.organization-users__plan-details-user {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
}

.organization-users__plan-details-user h4 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
}

.organization-users__plan-details-email {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}

.organization-users__plan-details-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.organization-users__plan-details-header {
    text-align: center;
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.organization-users__plan-details-header h4 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.75rem;
}

.organization-users__plan-details-price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
}

.organization-users__plan-details-price .price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
}

.organization-users__plan-details-price .period {
    font-size: 1rem;
    color: var(--text-secondary);
}

.organization-users__plan-details-billing {
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.organization-users__plan-details-billing-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
}

.organization-users__plan-details-billing-header i {
    color: var(--accent);
    font-size: 1rem;
}

.organization-users__plan-details-billing-dates {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1rem;
    color: var(--text-secondary);
}

.organization-users__plan-details-billing-dates i {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.organization-users__plan-details-status {
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.organization-users__plan-details-status-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
}

.organization-users__plan-details-status-header i {
    color: var(--accent);
    font-size: 1rem;
}

.organization-users__plan-details-status-value {
    display: flex;
    align-items: center;
}

.organization-users__plan-details-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
    color: var(--text-secondary);
}

.organization-users__plan-details-loading i {
    font-size: 2rem;
    color: var(--accent);
}

.organization-users__plan-badge--trial {
    background: rgb(243 156 18 / 10%);
    color: var(--warning);
    border: 1px solid rgb(243 156 18 / 30%);
}

.organization-users__plan-badge--expired {
    background: rgb(232 62 140 / 10%);
    color: var(--error);
    border: 1px solid rgb(232 62 140 / 30%);
}

.organization-users__plan-badge--core {
    background: rgb(107 114 128 / 10%);
    color: var(--text-secondary);
    border: 1px solid rgb(107 114 128 / 30%);
}

.organization-users__plan-badge--professional {
    background: rgb(243 156 18 / 10%);
    color: var(--warning);
    border: 1px solid rgb(243 156 18 / 30%);
}

.organization-users__plan-badge--enterprise {
    background: rgb(0 167 225 / 10%);
    color: var(--accent);
    border: 1px solid rgb(0 167 225 / 30%);
}

.organization-users__plan-badge--default {
    background: var(--bg-elevated);
    color: var(--text-secondary);
    border: 1px solid var(--border);
}

.organization-users__form-section {
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.organization-users__form-section h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
}

.organization-users__user-info {
    background: var(--bg-elevated);
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
}

.organization-users__user-info p {
    margin: 0 0 0.5rem;
    color: var(--text-primary);
}

.organization-users__user-info p:last-child {
    margin-bottom: 0;
}

@media (width <= 768px) {
    .organization-users__header {
        flex-direction: column;
        align-items: stretch;
    }

    .organization-users__filters-row {
        grid-template-columns: 1fr;
    }

    .organization-users__actions {
        justify-content: center;
    }

    .organization-users__dropdown {
        width: auto;
    }

    .organization-users__dropdown-button {
        width: 28px;
        height: 28px;
        justify-content: center;
    }

    .organization-users__form-grid {
        grid-template-columns: 1fr;
    }

    .organization-users__modal {
        margin: 0.5rem;
        max-height: calc(100vh - 1rem);
    }

    .organization-users__modal-body {
        max-height: calc(100vh - 120px);

        /* Smaller header/footer on mobile */
    }

    .organization-users__modal-form {
        padding: 0.75rem;
    }
}
</style>
