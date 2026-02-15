<template>
    <div class="organization-manage">
        <!-- Settings Mode (Inline Edit) -->
        <BasePanel v-if="isSettingsMode" :title="t('companyInformation')" elevation="level1">
            <template #footer>
                <div class="organization-manage__footer">
                    <BaseButton type="submit" variant="primary" size="small" @click="handleEditSubmit"
                        :loading="loading">
                        {{ t('save') }}
                    </BaseButton>
                </div>
            </template>
            
            <form @submit.prevent="handleEditSubmit" class="organization-manage__settings-form">
                
                <!-- Branding Section -->
                <div class="organization-manage__branding-section mb-4">
                    <div class="organization-manage__banner-upload" :style="{ backgroundImage: `url(${editForm.coverImage || '/placeholder-banner.jpg'})` }">
                        <div class="organization-manage__banner-overlay">
                            <BaseButton size="small" variant="secondary" @click="triggerCoverUpload" icon="fas fa-camera">
                                {{ t('changeCoverPhoto') || 'Change Cover' }}
                            </BaseButton>
                            <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="handleCoverImageChange" />
                        </div>
                    </div>
                    <div class="organization-manage__logo-upload-wrapper">
                        <BaseImageUpload 
                            :image-url="editForm.logo || '/placeholder-logo.png'" 
                            size="large"
                            @change="handleLogoChange"
                            class="organization-manage__logo-upload"
                        />
                    </div>
                </div>

                <div class="organization-manage__form-grid mt-5">
                    <BaseFormField v-model="editForm.name" type="text" :label="t('organizationName')" required
                        class="organization-manage__form-field" :disabled="userType !== 'Admin'" />
                    <BaseFormField v-model="editForm.email" type="email" :label="t('email')"
                        class="organization-manage__form-field" :disabled="userType !== 'Admin'" />
                </div>

                <BaseFormField v-model="editForm.description" type="textarea" :label="t('aboutCompany') || 'About Company'"
                    :rows="5" class="organization-manage__form-field" :disabled="userType !== 'Admin'" 
                    placeholder="Tell us about your company..." />
                
                <h4 class="form-section-title mt-4">{{ t('contactAndLocation') }}</h4>
                <div class="organization-manage__form-grid">
                    <BaseFormField v-model="editForm.phone" type="tel" :label="t('phone')"
                        class="organization-manage__form-field" :disabled="userType !== 'Admin'" />
                    <BaseFormField v-model="editForm.website" type="url" :label="t('website')"
                        class="organization-manage__form-field" :disabled="userType !== 'Admin'" />
                </div>

                <CompanyAddressFields v-model="addressProxy" :country-options="countryOptions"
                    :title="t('address')" :disabled="userType !== 'Admin'" />

                <h4 class="form-section-title mt-4">{{ t('legal') }}</h4>
                <BaseFormField v-model="editForm.disclaimer" type="textarea" :label="t('disclaimer')" :rows="3"
                    class="organization-manage__form-field" :disabled="userType !== 'Admin'" />
            </form>
        </BasePanel>

        <!-- Default Mode (View + Modal) -->
        <BasePanel v-else :title="t('myOrganization')" subtitle="Manage your organization details and settings"
            elevation="level2" :scrollable="true">
            <template #header>
                <div class="organization-manage__header" v-if="userType === 'Admin'">
                    <BaseButton @click="openEditModal()" variant="primary" size="medium" left-icon="fas fa-edit">
                        {{ t('editOrganization') }}
                    </BaseButton>
                </div>
            </template>

            <div class="organization-manage__content">
                <!-- Organization Info Card -->
                <BaseCard class="organization-manage__info-card">
                    <!-- Profile Header (View Mode) -->
                    <div class="organization-manage__profile-header mb-4">
                        <div class="organization-manage__profile-banner" :style="{ backgroundImage: `url(${organization?.coverImage || '/placeholder-banner.jpg'})` }"></div>
                        <div class="organization-manage__profile-identity">
                            <div class="organization-manage__profile-logo-wrapper">
                                <img :src="organization?.logo || '/placeholder-logo.png'" alt="Organization Logo" class="organization-manage__profile-logo" />
                            </div>
                            <div class="organization-manage__profile-text">
                                <h2 class="organization-manage__profile-name">{{ organization?.name || t('notProvided') }}</h2>
                                <a v-if="organization?.website" :href="organization.website" target="_blank" class="organization-manage__profile-website">
                                    {{ organization.website }} <i class="fas fa-external-link-alt"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div v-if="organization?.description" class="organization-manage__description mb-4">
                        <h4>{{ t('aboutCompany') || 'About Company' }}</h4>
                        <p>{{ organization.description }}</p>
                    </div>

                    <div class="organization-manage__info-grid">
                        <div class="organization-manage__info-section">
                            <h4>{{ t('contactInfo') || 'Contact Info' }}</h4>
                            <div class="organization-manage__info-items">
                                <!-- Name removed from here as it is in header now -->
                                <div class="organization-manage__info-item">
                                    <label>{{ t('email') }}:</label>
                                    <span>{{ organization?.email || t('notProvided') }}</span>
                                </div>
                                <div class="organization-manage__info-item">
                                    <label>{{ t('phone') }}:</label>
                                    <span>{{ organization?.phone || t('notProvided') }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="organization-manage__info-section">
                            <h4>{{ t('location') }}</h4>
                            <div class="organization-manage__info-items">
                                <div class="organization-manage__info-item">
                                    <label>{{ t('address') }}:</label>
                                    <div v-if="organization?.address || organization?.city" class="organization-manage__address-block">
                                        <div v-if="organization?.address">{{ organization.address }}</div>
                                        <div>
                                            <span v-if="organization?.city">{{ organization.city }}</span>
                                            <span v-if="organization?.city && organization?.state">, </span>
                                            <span v-if="organization?.state">{{ organization.state }}</span>
                                            <span v-if="organization?.zipcode"> {{ organization.zipcode }}</span>
                                        </div>
                                        <div v-if="organization?.country">{{ organization.country }}</div>
                                    </div>
                                    <span v-else>{{ t('notProvided') }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="organization?.disclaimer" class="organization-manage__disclaimer">
                        <h4>{{ t('disclaimer') }}</h4>
                        <p>{{ organization.disclaimer }}</p>
                    </div>
                </BaseCard>

                <!-- Organization Statistics -->
                <BaseCard class="organization-manage__stats-card">
                    <h4>{{ t('organizationStatistics') }}</h4>
                    <div class="organization-manage__stats-grid">
                        <div class="organization-manage__stat-item">
                            <div class="organization-manage__stat-value">{{ organizationStats.totalUsers }}</div>
                            <div class="organization-manage__stat-label">{{ t('totalUsers') }}</div>
                        </div>
                        <div class="organization-manage__stat-item">
                            <div class="organization-manage__stat-value">{{ organizationStats.activeUsers }}</div>
                            <div class="organization-manage__stat-label">{{ t('activeUsers') }}</div>
                        </div>
                        <div class="organization-manage__stat-item">
                            <div class="organization-manage__stat-value">{{ organizationStats.managers }}</div>
                            <div class="organization-manage__stat-label">{{ t('managers') }}</div>
                        </div>
                        <div class="organization-manage__stat-item">
                            <div class="organization-manage__stat-value">{{ organizationStats.admins }}</div>
                            <div class="organization-manage__stat-label">{{ t('admins') }}</div>
                        </div>
                    </div>
                </BaseCard>

                <!-- Quick Actions -->
                <BaseCard class="organization-manage__actions-card">
                    <h4>{{ t('quickActions') }}</h4>
                    <div class="organization-manage__actions-grid">
                        <BaseButton @click="$router.push('/organization/users')" variant="primary" size="medium"
                            left-icon="fas fa-users">
                            {{ t('manageUsers') }}
                        </BaseButton>
                        <BaseButton @click="openAddUserModal()" variant="secondary" size="medium"
                            left-icon="fas fa-user-plus">
                            {{ t('assignUser') }}
                        </BaseButton>
                        <!-- <BaseButton @click="exportOrganizationData()" variant="ghost" size="medium"
                            left-icon="fas fa-download">
                            {{ t('exportData') }}
                        </BaseButton> -->
                    </div>
                </BaseCard>
            </div>
        </BasePanel>

        <!-- Edit Organization Modal -->
        <div v-if="showEditModal" class="organization-manage__modal-overlay" @click.self="closeEditModal">
            <div class="organization-manage__modal" @click.stop>
                <div class="organization-manage__modal-header">
                    <h3 class="organization-manage__modal-title">{{ t('editOrganization') }}</h3>
                    <BaseButton @click="closeEditModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-manage__modal-body">
                    <form @submit.prevent="handleEditSubmit" class="organization-manage__modal-form">
                        <div class="organization-manage__form-grid">
                            <BaseFormField v-model="editForm.name" type="text" :label="t('organizationName')" required
                                class="organization-manage__form-field" />
                            <BaseFormField v-model="editForm.email" type="email" :label="t('email')"
                                class="organization-manage__form-field" />
                        </div>

                        <BaseFormField v-model="editForm.description" type="textarea" :label="t('description')"
                            :rows="3" class="organization-manage__form-field" />

                        <CompanyAddressFields v-model="addressProxy" :country-options="countryOptions"
                            :title="t('address')" />

                        <div class="organization-manage__form-grid">
                            <BaseFormField v-model="editForm.phone" type="tel" :label="t('phone')"
                                class="organization-manage__form-field" />
                            <BaseFormField v-model="editForm.website" type="url" :label="t('website')"
                                class="organization-manage__form-field" />
                        </div>

                        <BaseFormField v-model="editForm.disclaimer" type="textarea" :label="t('disclaimer')" :rows="3"
                            class="organization-manage__form-field" />
                    </form>
                </div>

                <div class="organization-manage__modal-footer">
                    <BaseButton @click="closeEditModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleEditSubmit">
                        {{ t('updateOrganization') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Add User Modal -->
        <div v-if="showAddUserModal" class="organization-manage__modal-overlay" @click.self="closeAddUserModal">
            <div class="organization-manage__modal organizations-manage__modal--small" @click.stop>
                <div class="organization-manage__modal-header">
                    <h3 class="organization-manage__modal-title">{{ t('addUserToOrganization') }}</h3>
                    <BaseButton @click="closeAddUserModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organization-manage__modal-body">
                    <form @submit.prevent="handleAddUserSubmit" class="organization-manage__modal-form">
                        <div class="organization-manage__assignment-info">
                            <p><strong>{{ t('organization') }}:</strong> {{ organization?.name }}</p>
                        </div>

                        <BaseFormField v-model="addUserForm.userEmail" type="email" :label="t('userEmail')"
                            :placeholder="t('enterUserEmail')" required class="organization-manage__form-field" />

                        <!-- <BaseFormField v-model="addUserForm.userType" type="select" :label="t('userType')"
                        :options="userTypeOptions" required class="organization-manage__form-field" /> -->
                    </form>
                </div>

                <div class="organization-manage__modal-footer">
                    <BaseButton @click="closeAddUserModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleAddUserSubmit"
                        v-if="userType === 'OrgAdmin'">
                        {{ t('addUser') }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import OrganizationsAdminController from '@/controllers/organizations_admin/organizations_admin_controller';
import {
    BaseButton,
    BaseCard,
    BaseFormField,
    BasePanel,
    CompanyAddressFields,
    BaseImageUpload
} from '@/components/ui';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const props = defineProps({
    isSettingsMode: {
        type: Boolean,
        default: false
    }
});

const { t } = useI18n();

const userType = ref('User');

// Inject showMessage from global state
const showMessage = inject('showMessage');

// State
const organization = ref(null);
const organizationStats = ref({
    totalUsers: 0,
    activeUsers: 0,
    managers: 0,
    admins: 0
});
const loading = ref(false);
const showEditModal = ref(false);
const showAddUserModal = ref(false);

// Edit form
const editForm = ref({
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
    website: '',
    disclaimer: '',
    logo: null,
    coverImage: null
});

// File references for uploads
const coverInput = ref(null);

const handleLogoChange = (file) => {
    // In a real app, you might upload immediately or convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
        editForm.value.logo = e.target.result;
    };
    reader.readAsDataURL(file);
};

const triggerCoverUpload = () => {
    coverInput.value?.click();
};

const handleCoverImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            editForm.value.coverImage = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const addressProxy = computed({
    get: () => ({
        street: editForm.value.address || '',
        city: editForm.value.city || '',
        state: editForm.value.state || '',
        zip: editForm.value.zipcode || '',
        country: editForm.value.country || ''
    }),
    set: (val) => {
        editForm.value.address = val.street;
        editForm.value.city = val.city;
        editForm.value.state = val.state;
        editForm.value.zipcode = val.zip;
        editForm.value.country = val.country;
    }
});

// Add user form
const addUserForm = ref({
    organizationId: '',
    userEmail: '',
    // userType: 'User'
});

// Options
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



// Methods
const getMyOrganization = async () => {
    try {
        loading.value = true;
        // Get current user's organization
        const response = await OrganizationsAdminController.getCurrentUserOrganization();
        if (response.result) {
            organization.value = response.data;
            
            // If in settings mode, populate the edit form immediately
            if (props.isSettingsMode) {
                editForm.value = {
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
                    website: organization.value.website || '',
                    disclaimer: organization.value.disclaimer || '',
                    logo: organization.value.logo || null,
                    coverImage: organization.value.coverImage || null
                };
            }

            await getOrganizationStats();
        } else {
            showMessage?.({ message: response.message, status: 'error' });
        }
    } catch (error) {
        console.error('Error fetching organization:', error);
        showMessage?.({ message: t('errorFetchingOrganization'), status: 'error' });
    } finally {
        loading.value = false;
    }
};

const getOrganizationStats = async () => {
    try {
        if (!organization.value?.id) return;

        const [usersResponse, managersResponse, adminsResponse] = await Promise.all([
            OrganizationsAdminController.getOrganizationUsers(organization.value.id),
            OrganizationsAdminController.getOrganizationManagers(organization.value.id),
            OrganizationsAdminController.getOrganizationAdmin(organization.value.id)
        ]);

        const totalUsers = usersResponse.result ? usersResponse.data?.length || 0 : 0;
        const activeUsers = usersResponse.result ? usersResponse.data?.filter(user => user.active).length || 0 : 0;
        const managers = managersResponse.result ? managersResponse.data?.length || 0 : 0;
        const admins = adminsResponse.result ? adminsResponse.data?.length || 0 : 0;

        organizationStats.value = {
            totalUsers,
            activeUsers,
            managers,
            admins
        };
    } catch (error) {
        console.error('Error fetching organization stats:', error);
    }
};

const openEditModal = () => {
    if (organization.value) {
        editForm.value = {
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
            website: organization.value.website || '',
            disclaimer: organization.value.disclaimer || ''
        };
    }
    showEditModal.value = true;
};

const closeEditModal = () => {
    showEditModal.value = false;
    editForm.value = {
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
        website: '',
        disclaimer: ''
    };
};

const handleEditSubmit = async () => {
    try {
        const response = await OrganizationsAdminController.updateOrganization(editForm.value);
        if (response.result) {
            showMessage?.({ message: response.message, status: 'success' });
            closeEditModal();
            await getMyOrganization();
        } else {
            showMessage?.({ message: response.message, status: 'error' });
        }
    } catch (error) {
        console.error('Error updating organization:', error);
        showMessage?.({ message: t('errorUpdatingOrganization'), status: 'error' });
    }
};

const openAddUserModal = () => {
    addUserForm.value.organizationId = organization.value?.id;
    showAddUserModal.value = true;
};

const closeAddUserModal = () => {
    showAddUserModal.value = false;
    addUserForm.value = {
        organizationId: '',
        userEmail: '',
        userType: 'User'
    };
};

const handleAddUserSubmit = async () => {
    try {
        const response = await OrganizationsAdminController.assignUserToOrganization(addUserForm.value);
        console.log(response);
        if (response.result) {
            showMessage?.({ message: response.message, status: 'success' });
            closeAddUserModal();
            await getOrganizationStats();
        } else {
            showMessage?.({ message: response.message, status: 'error' });
        }
    } catch (error) {
        console.error('Error adding user to organization:', error);
        showMessage?.({ message: t('errorAddingUserToOrganization'), status: 'error' });
    }
};



const getCurrentUserData = async () => {
    if (!authStore.user) {
        await authStore.fetchUserProfile();
    }
    if (authStore.user) {
        userType.value = authStore.user.type;
    }
}

onMounted(() => {
    getCurrentUserData();
    getMyOrganization();
});
</script>

<style scoped>
.organization-manage {
    padding: 1rem;
}

.organization-manage__header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
}

.organization-manage__content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.organization-manage__info-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
}

.organization-manage__info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 1.5rem;
}

.organization-manage__info-section h4 {
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-weight: 600;
}

.organization-manage__info-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.organization-manage__info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.organization-manage__info-item label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.organization-manage__info-item span {
    color: var(--text-primary);
}

.organization-manage__description {
    border-top: 1px solid var(--border);
    padding-top: 1.5rem;
}

.organization-manage__description h4 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    font-weight: 600;
}

.organization-manage__description p {
    color: var(--text-secondary);
    line-height: 1.6;
}

.organization-manage__disclaimer {
    border-top: 1px solid var(--border);
    padding-top: 1.5rem;
}

.organization-manage__disclaimer h4 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    font-weight: 600;
}

.organization-manage__disclaimer p {
    color: var(--text-secondary);
    line-height: 1.6;
    font-style: italic;
}

.organization-manage__address-block {
    display: flex;
    flex-direction: column;
    color: var(--text-primary);
    line-height: 1.4;
}

.organization-manage__stats-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
}

.organization-manage__stats-card h4 {
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-weight: 600;
}

.organization-manage__stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
}

.organization-manage__stat-item {
    text-align: center;
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.organization-manage__stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.organization-manage__stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.organization-manage__actions-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
}

.organization-manage__actions-card h4 {
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-weight: 600;
}

.organization-manage__actions-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

/* Modal Styles */
.organization-manage__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.organization-manage__modal {
    background: var(--bg-surface);
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 10%), 0 10px 10px -5px rgb(0 0 0 / 4%);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.organizations-manage__modal--small {
    max-width: 400px;
}

.organization-manage__modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
}

.organization-manage__modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.organization-manage__modal-body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    max-height: calc(90vh - 140px);
}

.organization-manage__modal-form {
    padding: 1rem;
}

.organization-manage__form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.organization-manage__form-field {
    margin-bottom: 0.75rem;
}

.organization-manage__modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
    flex-shrink: 0;
}

.organization-manage__assignment-info {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.organization-manage__assignment-info p {
    margin: 0;
    color: var(--text-primary);
}

@media (width <= 768px) {
    .organization-manage__info-grid {
        grid-template-columns: 1fr;
    }

    .organization-manage__stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .organization-manage__actions-grid {
        flex-direction: column;
    }

    .organization-manage__form-grid {
        grid-template-columns: 1fr;
    }

    .organization-manage__modal {
        margin: 0.5rem;
        max-height: calc(100vh - 1rem);
    }
}

/* Branding Styles */
.organization-manage__branding-section {
    position: relative;
    margin-bottom: 3rem;
}

.organization-manage__banner-upload {
    height: 200px;
    background-color: var(--bg-elevated);
    background-size: cover;
    background-position: center;
    border-radius: var(--radius-lg);
    position: relative;
    border: 1px solid var(--border);
}

.organization-manage__banner-overlay {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    opacity: 0;
    transition: opacity 0.2s;
}

.organization-manage__banner-upload:hover .organization-manage__banner-overlay {
    opacity: 1;
}

.organization-manage__logo-upload-wrapper {
    position: absolute;
    bottom: -40px;
    left: 2rem;
    padding: 4px;
    background: var(--bg-surface);
    border-radius: 50%;
}

.hidden {
    display: none;
}

.form-section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
}

.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 2.5rem; }
.mb-4 { margin-bottom: 1.5rem; }

/* Profile View Styles */
.organization-manage__profile-header {
    position: relative;
    margin-bottom: 2rem;
}

.organization-manage__profile-banner {
    height: 200px;
    background-color: var(--bg-elevated);
    background-size: cover;
    background-position: center;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
}

.organization-manage__profile-identity {
    display: flex;
    align-items: flex-end;
    margin-top: -50px;
    padding-left: 2rem;
    position: relative;
}

.organization-manage__profile-logo-wrapper {
    width: 140px;
    height: 140px;
    background: var(--bg-surface);
    padding: 6px;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    flex-shrink: 0;
    border: 2px solid var(--bg-surface);
}

.organization-manage__profile-logo {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--bg-elevated);
}

.organization-manage__profile-text {
    margin-left: 1.5rem;
    margin-bottom: 0.75rem;
}

.organization-manage__profile-name {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.organization-manage__profile-website {
    font-size: 1rem;
    color: var(--primary);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
    font-weight: 500;
    opacity: 0.9;
    transition: opacity 0.2s;
}

.organization-manage__profile-website:hover {
    text-decoration: underline;
    opacity: 1;
}

.organization-manage__description {
    background: var(--bg-elevated);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
}

.organization-manage__description h4 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
    font-weight: 600;
}
</style>
