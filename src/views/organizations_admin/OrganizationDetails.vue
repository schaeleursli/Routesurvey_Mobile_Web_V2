<template>
    <div class="organization-details">
        <BasePanel :title="organization?.name || t('organizationDetails')"
            subtitle="Manage organization users and settings" elevation="level2" :scrollable="true">
            <template #header>
                <div class="organization-details__header">
                    <BaseButton @click="$router.push('/admin/organizations')" variant="ghost" size="medium"
                        left-icon="fas fa-arrow-left">
                        {{ t('backToOrganizations') }}
                    </BaseButton>
                    <div class="organization-details__header-actions">
                        <BaseButton @click="openEditOrganizationModal()" variant="primary" size="medium"
                            left-icon="fas fa-edit">
                            {{ t('editOrganization') }}
                        </BaseButton>
                        <BaseButton @click="openAddUserModal()" variant="secondary" size="medium"
                            left-icon="fas fa-user-plus">
                            {{ t('addUser') }}
                        </BaseButton>
                    </div>
                </div>
            </template>

            <div class="organization-details__content">
                <!-- Organization Info Card -->
                <BaseCard class="organization-details__info-card">
                    <div class="organization-details__info-grid">
                        <div class="organization-details__info-section">
                            <h4>{{ t('organizationInformation') }}</h4>
                            <div class="organization-details__info-items">
                                <div class="organization-details__info-item">
                                    <label>{{ t('name') }}:</label>
                                    <span>{{ organization?.name || t('notProvided') }}</span>
                                </div>
                                <div class="organization-details__info-item">
                                    <label>{{ t('email') }}:</label>
                                    <span>{{ organization?.email || t('notProvided') }}</span>
                                </div>
                                <div class="organization-details__info-item">
                                    <label>{{ t('phone') }}:</label>
                                    <span>{{ organization?.phone || t('notProvided') }}</span>
                                </div>
                                <div class="organization-details__info-item">
                                    <label>{{ t('website') }}:</label>
                                    <span>{{ organization?.website || t('notProvided') }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="organization-details__info-section">
                            <h4>{{ t('location') }}</h4>
                            <div class="organization-details__info-items">
                                <div class="organization-details__info-item">
                                    <label>{{ t('address') }}:</label>
                                    <span>{{ organization?.address || t('notProvided') }}</span>
                                </div>
                                <div class="organization-details__info-item">
                                    <label>{{ t('city') }}:</label>
                                    <span>{{ organization?.city || t('notProvided') }}</span>
                                </div>
                                <div class="organization-details__info-item">
                                    <label>{{ t('state') }}:</label>
                                    <span>{{ organization?.state || t('notProvided') }}</span>
                                </div>
                                <div class="organization-details__info-item">
                                    <label>{{ t('zipcode') }}:</label>
                                    <span>{{ organization?.zipcode || t('notProvided') }}</span>
                                </div>
                                <div class="organization-details__info-item">
                                    <label>{{ t('country') }}:</label>
                                    <span>{{ organization?.country || t('notProvided') }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="organization?.description" class="organization-details__description">
                        <h4>{{ t('description') }}</h4>
                        <p>{{ organization.description }}</p>
                    </div>
                </BaseCard>

                <!-- Users Management -->
                <BaseCard class="organization-details__users-card">
                    <template #header>
                        <div class="organization-details__users-header">
                            <h3>{{ t('organizationUsers') }}</h3>
                            <div class="organization-details__users-controls">
                                <BaseFormField v-model="userSearchQuery" type="text" :placeholder="t('searchUsers')"
                                    class="organization-details__user-search">
                                    <template #prepend>
                                        <i class="fas fa-search"></i>
                                    </template>
                                </BaseFormField>
                                <BaseFormField v-model="userFilterType" type="select" :options="userFilterOptions"
                                    class="organization-details__user-filter" />
                            </div>
                        </div>
                    </template>

                    <BaseTable :items="filteredUsers" :columns="userTableColumns" :loading="usersLoading" clickable
                        @row-click="openUserDetails">
                        <template #cell-name="{ item }">
                            <div class="organization-details__user-name">
                                <div class="organization-details__user-avatar">
                                    <img v-if="item.profilePicture" :src="item.profilePicture" :alt="item.firstName" />
                                    <div v-else class="organization-details__user-avatar-placeholder">
                                        {{ getInitials(item.firstName, item.lastName) }}
                                    </div>
                                </div>
                                <div class="organization-details__user-info">
                                    <div class="organization-details__user-fullname">
                                        {{ item.firstName }} {{ item.lastName }}
                                    </div>
                                    <div class="organization-details__user-email">{{ item.email }}</div>
                                </div>
                            </div>
                        </template>

                        <template #cell-userType="{ item }">
                            <StatusIndicator :status="getUserTypeStatus(item.userType)"
                                :label="getUserTypeLabel(item.userType)" />
                        </template>

                        <template #cell-active="{ item }">
                            <StatusIndicator :status="item.active ? 'active' : 'inactive'"
                                :label="item.active ? t('active') : t('inactive')" />
                        </template>

                        <template #cell-lastLogin="{ item }">
                            <div class="organization-details__last-login">
                                {{ formatDate(item.lastLogin) }}
                            </div>
                        </template>

                        <template #cell-actions="{ item }">
                            <div class="organization-details__user-actions">
                                <BaseButton @click.stop="openUserDetails(item)" variant="ghost" size="small"
                                    left-icon="fas fa-eye">
                                    {{ t('view') }}
                                </BaseButton>
                                <BaseButton @click.stop="removeUserFromOrganization(item)" variant="danger" size="small"
                                    left-icon="fas fa-user-minus">
                                    {{ t('remove') }}
                                </BaseButton>
                            </div>
                        </template>

                        <template #empty>
                            <div class="organization-details__empty-users">
                                <i class="fas fa-users"></i>
                                <h3>{{ t('noUsersInOrganization') }}</h3>
                                <p>{{ t('noUsersInOrganizationDescription') }}</p>
                                <BaseButton @click="openAddUserModal()" variant="primary">
                                    {{ t('addFirstUser') }}
                                </BaseButton>
                            </div>
                        </template>
                    </BaseTable>
                </BaseCard>
            </div>
        </BasePanel>

        <!-- Edit Organization Modal -->
        <div v-if="showEditOrganizationModal" class="organization-details__modal-overlay"
            @click.self="closeEditOrganizationModal">
            <div class="organization-details__modal" @click.stop>
                <div class="organization-details__modal-header">
                    <h3 class="organization-details__modal-title">{{ t('editOrganization') }}</h3>
                    <BaseButton @click="closeEditOrganizationModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-details__modal-body">
                    <form @submit.prevent="handleEditOrganizationSubmit" class="organization-details__modal-form">
                        <div class="organization-details__form-grid">
                            <BaseFormField v-model="editOrganizationForm.name" type="text"
                                :label="t('organizationName')" required class="organization-details__form-field" />
                            <BaseFormField v-model="editOrganizationForm.email" type="email" :label="t('email')"
                                class="organization-details__form-field" />
                        </div>

                        <BaseFormField v-model="editOrganizationForm.description" type="textarea"
                            :label="t('description')" :rows="3" class="organization-details__form-field" />

                        <div class="organization-details__form-grid">
                            <BaseFormField v-model="editOrganizationForm.address" type="text" :label="t('address')"
                                class="organization-details__form-field" />
                            <BaseFormField v-model="editOrganizationForm.city" type="text" :label="t('city')"
                                class="organization-details__form-field" />
                        </div>

                        <div class="organization-details__form-grid">
                            <BaseFormField v-model="editOrganizationForm.state" type="text" :label="t('state')"
                                class="organization-details__form-field" />
                            <BaseFormField v-model="editOrganizationForm.zipcode" type="text" :label="t('zipcode')"
                                class="organization-details__form-field" />
                        </div>

                        <div class="organization-details__form-grid">
                            <BaseFormField v-model="editOrganizationForm.country" type="select" :label="t('country')"
                                :options="countryOptions" class="organization-details__form-field" />
                            <BaseFormField v-model="editOrganizationForm.phone" type="tel" :label="t('phone')"
                                class="organization-details__form-field" />
                        </div>

                        <BaseFormField v-model="editOrganizationForm.website" type="url" :label="t('website')"
                            class="organization-details__form-field" />
                    </form>
                </div>

                <div class="organization-details__modal-footer">
                    <BaseButton @click="closeEditOrganizationModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleEditOrganizationSubmit">
                        {{ t('updateOrganization') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Add User Modal -->
        <div v-if="showAddUserModal" class="organization-details__modal-overlay" @click.self="closeAddUserModal">
            <div class="organization-details__modal organizations-details__modal--small" @click.stop>
                <div class="organization-details__modal-header">
                    <h3 class="organization-details__modal-title">{{ t('addUserToOrganization') }}</h3>
                    <BaseButton @click="closeAddUserModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-details__modal-body">
                    <form @submit.prevent="handleAddUserSubmit" class="organization-details__modal-form">
                        <div class="organization-details__assignment-info">
                            <p><strong>{{ t('organization') }}:</strong> {{ organization?.name }}</p>
                        </div>

                        <BaseFormField v-model="addUserForm.userId" type="number" :label="t('userId')"
                            :placeholder="t('enterUserId')" required class="organization-details__form-field" />

                        <BaseFormField v-model="addUserForm.userType" type="select" :label="t('userType')"
                            :options="userTypeOptions" required class="organization-details__form-field" />
                    </form>
                </div>

                <div class="organization-details__modal-footer">
                    <BaseButton @click="closeAddUserModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleAddUserSubmit">
                        {{ t('addUser') }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import OrganizationsAdminController from '@/controllers/organizations_admin/organizations_admin_controller';
import {
    BaseButton,
    BaseCard,
    BaseTable,
    BaseFormField,
    StatusIndicator,
    BasePanel
} from '@/components/ui';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Inject showMessage from global state
const showMessage = inject('showMessage');

// State
const organization = ref(null);
const users = ref([]);
const userSearchQuery = ref('');
const userFilterType = ref('');
const usersLoading = ref(false);
const showEditOrganizationModal = ref(false);
const showAddUserModal = ref(false);

// Edit organization form
const editOrganizationForm = ref({
    id: null,
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
    email: '',
    website: ''
});

// Add user form
const addUserForm = ref({
    organizationId: '',
    userId: '',
    userType: 'User'
});

// Computed properties
const filteredUsers = computed(() => {
    let filtered = users.value;

    // Search filter
    if (userSearchQuery.value) {
        const query = userSearchQuery.value.toLowerCase();
        filtered = filtered.filter(user =>
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    }

    // Type filter
    if (userFilterType.value) {
        filtered = filtered.filter(user => user.userType === userFilterType.value);
    }

    return filtered;
});

// Filter options
const userFilterOptions = computed(() => [
    { value: '', label: t('allUsers') },
    { value: 'User', label: t('user') },
    { value: 'OrgManager', label: t('organizationManager') },
    { value: 'OrgAdmin', label: t('organizationAdmin') }
]);

const userTypeOptions = computed(() => [
    { value: 'User', label: t('user') },
    { value: 'OrgManager', label: t('organizationManager') },
    { value: 'OrgAdmin', label: t('organizationAdmin') }
]);

const countryOptions = computed(() => [
    { value: '', label: t('selectCountry') },
    { value: 'United States', label: '🇺🇸 United States' },
    { value: 'Canada', label: '🇨🇦 Canada' },
    { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
    { value: 'Australia', label: '🇦🇺 Australia' },
    { value: 'Germany', label: '🇩🇪 Germany' },
    { value: 'France', label: '🇫🇷 France' },
    { value: 'Japan', label: '🇯🇵 Japan' },
    { value: 'China', label: '🇨🇳 China' },
    { value: 'India', label: '🇮🇳 India' },
    { value: 'Brazil', label: '🇧🇷 Brazil' }
]);

// Table columns
const userTableColumns = computed(() => [
    { key: 'name', label: t('name'), sortable: true },
    { key: 'userType', label: t('userType'), sortable: true },
    { key: 'active', label: t('status'), sortable: true },
    { key: 'lastLogin', label: t('lastLogin'), sortable: true },
    { key: 'actions', label: t('actions'), sortable: false }
]);

// Methods
const getOrganization = async () => {
    try {
        const response = await OrganizationsAdminController.getOrganization(route.params.id);
        if (response.result) {
            organization.value = response.data;
        } else {
            showMessage?.(response.message, 'error');
        }
    } catch (error) {
        console.error('Error fetching organization:', error);
        showMessage?.(t('errorFetchingOrganization'), 'error');
    }
};

const getOrganizationUsers = async () => {
    try {
        usersLoading.value = true;
        const response = await OrganizationsAdminController.getOrganizationUsers(route.params.id);
        if (response.result) {
            users.value = response.data || [];
        } else {
            showMessage?.(response.message, 'error');
        }
    } catch (error) {
        console.error('Error fetching organization users:', error);
        showMessage?.(t('errorFetchingOrganizationUsers'), 'error');
    } finally {
        usersLoading.value = false;
    }
};

const openEditOrganizationModal = () => {
    if (organization.value) {
        editOrganizationForm.value = {
            id: organization.value.id,
            name: organization.value.name || '',
            description: organization.value.description || '',
            address: organization.value.address || '',
            city: organization.value.city || '',
            state: organization.value.state || '',
            zipcode: organization.value.zipcode || '',
            country: organization.value.country || '',
            phone: organization.value.phone || '',
            email: organization.value.email || '',
            website: organization.value.website || ''
        };
    }
    showEditOrganizationModal.value = true;
};

const closeEditOrganizationModal = () => {
    showEditOrganizationModal.value = false;
    editOrganizationForm.value = {
        id: null,
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: '',
        email: '',
        website: ''
    };
};

const handleEditOrganizationSubmit = async () => {
    try {
        const response = await OrganizationsAdminController.updateOrganization(editOrganizationForm.value);
        if (response.result) {
            showMessage?.(response.message, 'success');
            closeEditOrganizationModal();
            await getOrganization();
        } else {
            showMessage?.(response.message, 'error');
        }
    } catch (error) {
        console.error('Error updating organization:', error);
        showMessage?.(t('errorUpdatingOrganization'), 'error');
    }
};

const openAddUserModal = () => {
    addUserForm.value.organizationId = route.params.id;
    showAddUserModal.value = true;
};

const closeAddUserModal = () => {
    showAddUserModal.value = false;
    addUserForm.value = {
        organizationId: '',
        userId: '',
        userType: 'User'
    };
};

const handleAddUserSubmit = async () => {
    try {
        const response = await OrganizationsAdminController.assignUserToOrganization(addUserForm.value);
        if (response.result) {
            showMessage?.(response.message, 'success');
            closeAddUserModal();
            await getOrganizationUsers();
        } else {
            showMessage?.(response.message, 'error');
        }
    } catch (error) {
        console.error('Error adding user to organization:', error);
        showMessage?.(t('errorAddingUserToOrganization'), 'error');
    }
};

const removeUserFromOrganization = async (user) => {
    if (!confirm(t('confirmRemoveUserFromOrganization'))) return;

    try {
        const response = await OrganizationsAdminController.unassignUserFromOrganization({
            organizationId: route.params.id,
            userId: user.userId
        });
        if (response.result) {
            showMessage?.(response.message, 'success');
            await getOrganizationUsers();
        } else {
            showMessage?.(response.message, 'error');
        }
    } catch (error) {
        console.error('Error removing user from organization:', error);
        showMessage?.(t('errorRemovingUserFromOrganization'), 'error');
    }
};

const openUserDetails = (user) => {
    // Navigate to user details or open user modal
    console.log('Open user details:', user);
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

const getUserTypeStatus = (userType) => {
    switch (userType) {
        case 'OrgAdmin': return 'success';
        case 'OrgManager': return 'warning';
        case 'User': return 'info';
        default: return 'secondary';
    }
};

const getUserTypeLabel = (userType) => {
    switch (userType) {
        case 'OrgAdmin': return t('organizationAdmin');
        case 'OrgManager': return t('organizationManager');
        case 'User': return t('user');
        default: return userType;
    }
};

onMounted(async () => {
    await getOrganization();
    await getOrganizationUsers();
});
</script>

<style scoped>
.organization-details {
    padding: 0;
}

.organization-details__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.organization-details__header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.organization-details__content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.organization-details__info-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
}

.organization-details__info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 1.5rem;
}

.organization-details__info-section h4 {
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-weight: 600;
}

.organization-details__info-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.organization-details__info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.organization-details__info-item label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.organization-details__info-item span {
    color: var(--text-primary);
}

.organization-details__description {
    border-top: 1px solid var(--border);
    padding-top: 1.5rem;
}

.organization-details__description h4 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    font-weight: 600;
}

.organization-details__description p {
    color: var(--text-secondary);
    line-height: 1.6;
}

.organization-details__users-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
}

.organization-details__users-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.organization-details__users-header h3 {
    margin: 0;
    color: var(--text-primary);
    font-weight: 600;
}

.organization-details__users-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.organization-details__user-search {
    min-width: 200px;
}

.organization-details__user-filter {
    min-width: 150px;
}

.organization-details__user-name {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.organization-details__user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
}

.organization-details__user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.organization-details__user-avatar-placeholder {
    width: 100%;
    height: 100%;
    background: var(--bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.875rem;
}

.organization-details__user-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.organization-details__user-fullname {
    font-weight: 500;
    color: var(--text-primary);
}

.organization-details__user-email {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.organization-details__last-login {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.organization-details__user-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.organization-details__empty-users {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    color: var(--text-secondary);
}

.organization-details__empty-users i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.organization-details__empty-users h3 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.organization-details__empty-users p {
    margin-bottom: 1.5rem;
    max-width: 400px;
}

/* Modal Styles */
.organization-details__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.organization-details__modal {
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

.organizations-details__modal--small {
    max-width: 400px;
}

.organization-details__modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-shrink: 0;
}

.organization-details__modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.organization-details__modal-body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    max-height: calc(90vh - 140px);
}

.organization-details__modal-form {
    padding: 1rem;
}

.organization-details__form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.organization-details__form-field {
    margin-bottom: 0.75rem;
}

.organization-details__modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-shrink: 0;
}

.organization-details__assignment-info {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.organization-details__assignment-info p {
    margin: 0;
    color: var(--text-primary);
}

@media (width <= 768px) {
    .organization-details__header {
        flex-direction: column;
        align-items: stretch;
    }

    .organization-details__header-actions {
        justify-content: flex-end;
    }

    .organization-details__info-grid {
        grid-template-columns: 1fr;
    }

    .organization-details__users-header {
        flex-direction: column;
        align-items: stretch;
    }

    .organization-details__users-controls {
        flex-direction: column;
    }

    .organization-details__form-grid {
        grid-template-columns: 1fr;
    }

    .organization-details__user-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .organization-details__modal {
        margin: 0.5rem;
        max-height: calc(100vh - 1rem);
    }
}
</style>
