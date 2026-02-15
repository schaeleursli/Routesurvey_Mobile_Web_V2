<template>
    <div class="organizations-admin">
        <BasePanel :title="t('organizationManagement')" subtitle="Manage organizations and user assignments"
            elevation="level2" :scrollable="true" class="organizations-admin__panel">
            <template #header>
                <div class="organizations-admin__header">
                    <BaseButton @click="openOrganizationModal()" variant="primary" size="medium"
                        left-icon="fas fa-plus">
                        {{ t('addNewOrganization') }}
                    </BaseButton>
                </div>
            </template>

            <div class="organizations-admin__content">
                <!-- Search and Filter Controls -->
                <BaseCard class="organizations-admin__filters">
                    <div class="organizations-admin__filters-content">
                        <div class="organizations-admin__search">
                            <BaseFormField v-model="searchQuery" type="text" :placeholder="t('searchOrganizations')"
                                class="organizations-admin__search-field">
                                <template #prepend>
                                    <i class="fas fa-search"></i>
                                </template>
                            </BaseFormField>
                        </div>
                        <div class="organizations-admin__filters-row">
                            <BaseFormField v-model="filterType" type="select" :label="t('filterByStatus')"
                                class="organizations-admin__filter-field" :options="filterOptions" />
                            <BaseFormField v-model="sortBy" type="select" :label="t('sortBy')"
                                class="organizations-admin__filter-field" :options="sortOptions" />
                        </div>
                    </div>
                </BaseCard>

                <!-- Organizations Table -->
                <BaseCard class="organizations-admin__table-card">
                    <BaseTable :items="paginatedOrganizations" :columns="tableColumns" :loading="loading" clickable
                        @row-click="openOrganizationDetails">
                        <template #cell-name="{ item }">
                            <div class="organizations-admin__name-cell">
                                <div class="organizations-admin__name">{{ item.name }}</div>
                                <div v-if="item.description" class="organizations-admin__description">{{
                                    item.description }}</div>
                            </div>
                        </template>

                        <template #cell-email="{ item }">
                            <div class="organizations-admin__contact-cell">
                                <div v-if="item.email" class="organizations-admin__email">
                                    <i class="fas fa-envelope"></i>
                                    {{ item.email }}
                                </div>
                                <div v-if="item.phone" class="organizations-admin__phone">
                                    <i class="fas fa-phone"></i>
                                    {{ item.phone }}
                                </div>
                            </div>
                        </template>

                        <!-- <template #cell-city="{ item }">
                            <div class="organizations-admin__location-cell">
                                <div v-if="item.city" class="organizations-admin__city">{{ item.city }}</div>
                                <div v-if="item.state" class="organizations-admin__state">{{ item.state }}</div>
                            </div>
                        </template> -->

                        <template #cell-country="{ item }">
                            <div class="organizations-admin__country">
                                {{ item.country }}
                            </div>
                        </template>

                        <template #cell-active="{ item }">
                            <StatusIndicator :status="item.active ? 'active' : 'inactive'"
                                :label="item.active ? t('active') : t('inactive')" />
                        </template>

                        <template #cell-dateAdded="{ item }">
                            <div class="organizations-admin__date">
                                {{ formatDate(item.dateAdded) }}
                            </div>
                        </template>

                        <template #cell-actions="{ item }">
                            <div class="organizations-admin__actions">
                                <div class="organizations-admin__dropdown" :ref="`dropdown-${item.id}`">
                                    <button class="organizations-admin__dropdown-button" :data-dropdown-button="item.id"
                                        @click.stop="toggleDropdown(item.id)" @blur="handleDropdownBlur(item.id)">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <Teleport to="body">
                                        <div v-if="openDropdowns[item.id]"
                                            class="organizations-admin__dropdown-menu organizations-admin__dropdown-menu--portal"
                                            :style="getDropdownStyle(item.id)" @click.stop>
                                            <div class="organizations-admin__dropdown-option"
                                                @click="openOrganizationModal(item); openDropdowns[item.id] = false">
                                                <i class="fas fa-edit"></i>
                                                {{ t('edit') }}
                                            </div>
                                            <div class="organizations-admin__dropdown-option"
                                                @click="navigateToUserManagement(item.id); openDropdowns[item.id] = false">
                                                <i class="fas fa-users"></i>
                                                {{ t('manageUsers') }}
                                            </div>
                                            <div class="organizations-admin__dropdown-option"
                                                @click="openOrganizationDetails(item); openDropdowns[item.id] = false">
                                                <i class="fas fa-eye"></i>
                                                {{ t('viewDetails') }}
                                            </div>
                                            <div class="organizations-admin__dropdown-option organizations-admin__dropdown-option--danger"
                                                @click="deleteOrganization(item.id); openDropdowns[item.id] = false">
                                                <i class="fas fa-trash"></i>
                                                {{ t('delete') }}
                                            </div>
                                        </div>
                                    </Teleport>
                                </div>
                            </div>
                        </template>

                        <template #empty>
                            <div class="organizations-admin__empty">
                                <i class="fas fa-building"></i>
                                <h3>{{ t('noOrganizations') }}</h3>
                                <p>{{ t('noOrganizationsDescription') }}</p>
                                <BaseButton @click="openOrganizationModal()" variant="primary">
                                    {{ t('addFirstOrganization') }}
                                </BaseButton>
                            </div>
                        </template>
                    </BaseTable>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="organizations-admin__pagination">
                        <BasePagination :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems"
                            :items-per-page="itemsPerPage" @page-change="goToPage" @next="nextPage"
                            @previous="previousPage" />
                    </div>
                </BaseCard>
            </div>
        </BasePanel>

        <!-- Organization Modal -->
        <div v-if="showOrganizationModal" class="organizations-admin__modal-overlay"
            @click.self="closeOrganizationModal">
            <div class="organizations-admin__modal" @click.stop>
                <div class="organizations-admin__modal-header">
                    <h3 class="organizations-admin__modal-title">
                        {{ isEditing ? t('editOrganization') : t('addNewOrganization') }}
                    </h3>
                    <BaseButton @click="closeOrganizationModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organizations-admin__modal-body">
                    <form @submit.prevent="handleOrganizationSubmit" class="organizations-admin__modal-form">
                        <div class="organizations-admin__form-grid">
                            <BaseFormField v-model="organizationForm.name" type="text" :label="t('organizationName')"
                                required class="organizations-admin__form-field" />
                            <BaseFormField v-model="organizationForm.email" type="email" :label="t('email')"
                                class="organizations-admin__form-field" />
                        </div>

                        <BaseFormField v-model="organizationForm.description" type="textarea" :label="t('description')"
                            :rows="3" class="organizations-admin__form-field" />

                        <div class="organizations-admin__form-grid">
                            <BaseFormField v-model="organizationForm.address" type="text" :label="t('address')"
                                class="organizations-admin__form-field" />
                            <BaseFormField v-model="organizationForm.city" type="text" :label="t('city')"
                                class="organizations-admin__form-field" />
                        </div>

                        <div class="organizations-admin__form-grid">
                            <BaseFormField v-model="organizationForm.state" type="text" :label="t('state')"
                                class="organizations-admin__form-field" />
                            <BaseFormField v-model="organizationForm.zipcode" type="text" :label="t('zipcode')"
                                class="organizations-admin__form-field" />
                        </div>

                        <div class="organizations-admin__form-grid">
                            <BaseFormField v-model="organizationForm.country" type="select" :label="t('country')"
                                :options="countryOptions" class="organizations-admin__form-field" />
                            <BaseFormField v-model="organizationForm.phone" type="tel" :label="t('phone')"
                                class="organizations-admin__form-field" />
                        </div>

                        <BaseFormField v-model="organizationForm.website" type="url" :label="t('website')"
                            class="organizations-admin__form-field" />
                    </form>
                </div>

                <div class="organizations-admin__modal-footer">
                    <BaseButton @click="closeOrganizationModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleOrganizationSubmit">
                        {{ isEditing ? t('updateOrganization') : t('addOrganization') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- User Assignment Modal -->
        <div v-if="showUserAssignmentModal" class="organizations-admin__modal-overlay"
            @click.self="closeUserAssignmentModal">
            <div class="organizations-admin__modal organizations-admin__modal--small" @click.stop>
                <div class="organizations-admin__modal-header">
                    <h3 class="organizations-admin__modal-title">{{ t('assignUserToOrganization') }}</h3>
                    <BaseButton @click="closeUserAssignmentModal" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organizations-admin__modal-body">
                    <form @submit.prevent="handleUserAssignmentSubmit" class="organizations-admin__modal-form">
                        <div class="organizations-admin__assignment-info">
                            <p><strong>{{ t('organization') }}:</strong> {{ selectedOrganization?.name }}</p>
                        </div>

                        <BaseFormField v-model="userAssignmentForm.userId" type="number" :label="t('userId')"
                            :placeholder="t('enterUserId')" required class="organizations-admin__form-field" />

                        <BaseFormField v-model="userAssignmentForm.userType" type="select" :label="t('userType')"
                            :options="userTypeOptions" required class="organizations-admin__form-field" />
                    </form>
                </div>

                <div class="organizations-admin__modal-footer">
                    <BaseButton @click="closeUserAssignmentModal" variant="secondary">
                        {{ t('cancel') }}
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" @click="handleUserAssignmentSubmit">
                        {{ t('assignUser') }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Organization Details Modal -->
        <div v-if="showOrganizationDetailsModal" class="organizations-admin__modal-overlay"
            @click.self="closeOrganizationDetails">
            <div class="organizations-admin__modal organizations-admin__modal--large" @click.stop>
                <div class="organizations-admin__modal-header">
                    <h3 class="organizations-admin__modal-title">{{ selectedOrganization?.name }}</h3>
                    <BaseButton @click="closeOrganizationDetails" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>

                <div class="organizations-admin__modal-body">
                    <div v-if="selectedOrganization" class="organizations-admin__details">
                        <div class="organizations-admin__details-section">
                            <h4>{{ t('organizationDetails') }}</h4>
                            <div class="organizations-admin__details-grid">
                                <div class="organizations-admin__detail-item">
                                    <label>{{ t('name') }}:</label>
                                    <span>{{ selectedOrganization.name }}</span>
                                </div>
                                <div class="organizations-admin__detail-item">
                                    <label>{{ t('email') }}:</label>
                                    <span>{{ selectedOrganization.email || t('notProvided') }}</span>
                                </div>
                                <div class="organizations-admin__detail-item">
                                    <label>{{ t('phone') }}:</label>
                                    <span>{{ selectedOrganization.phone || t('notProvided') }}</span>
                                </div>
                                <div class="organizations-admin__detail-item">
                                    <label>{{ t('website') }}:</label>
                                    <span>{{ selectedOrganization.website || t('notProvided') }}</span>
                                </div>
                                <div class="organizations-admin__detail-item">
                                    <label>{{ t('address') }}:</label>
                                    <span>{{ selectedOrganization.address || t('notProvided') }}</span>
                                </div>
                                <div class="organizations-admin__detail-item">
                                    <label>{{ t('city') }}:</label>
                                    <span>{{ selectedOrganization.city || t('notProvided') }}</span>
                                </div>
                                <div class="organizations-admin__detail-item">
                                    <label>{{ t('state') }}:</label>
                                    <span>{{ selectedOrganization.state || t('notProvided') }}</span>
                                </div>
                                <div class="organizations-admin__detail-item">
                                    <label>{{ t('zipcode') }}:</label>
                                    <span>{{ selectedOrganization.zipcode || t('notProvided') }}</span>
                                </div>
                                <div class="organizations-admin__detail-item">
                                    <label>{{ t('country') }}:</label>
                                    <span>{{ selectedOrganization.country || t('notProvided') }}</span>
                                </div>
                            </div>
                        </div>

                        <div v-if="selectedOrganization.description" class="organizations-admin__details-section">
                            <h4>{{ t('description') }}</h4>
                            <p>{{ selectedOrganization.description }}</p>
                        </div>

                        <div class="organizations-admin__details-actions">
                            <BaseButton @click="openOrganizationModal(selectedOrganization); closeOrganizationDetails()"
                                variant="primary">
                                <i class="fas fa-edit"></i>
                                {{ t('editOrganization') }}
                            </BaseButton>
                            <BaseButton
                                @click="navigateToUserManagement(selectedOrganization.id); closeOrganizationDetails()"
                                variant="secondary">
                                <i class="fas fa-users"></i>
                                {{ t('manageUsers') }}
                            </BaseButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, inject, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
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

const { t } = useI18n();
const router = useRouter();

// Inject showMessage from global state
const showMessage = inject('showMessage');

const {
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
    showOrganizationModal,
    showUserAssignmentModal,
    showOrganizationDetailsModal,
    isEditing,
    selectedOrganization,
    loading,
    filteredOrganizations,
    paginatedOrganizations,
    totalPages,
    totalItems,
    filterOptions,
    sortOptions,
    userTypeOptions,
    countryOptions,
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
    resetPagination
} = useOrganizationsAdmin(showMessage);

// Custom dropdown state
const openDropdowns = ref({});
const dropdownPositions = ref({});

// Custom dropdown methods
const toggleDropdown = (itemId) => {
    // Close all other dropdowns
    Object.keys(openDropdowns.value).forEach(id => {
        if (id !== itemId) {
            openDropdowns.value[id] = false;
        }
    });

    // Toggle current dropdown
    const isOpening = !openDropdowns.value[itemId];
    openDropdowns.value[itemId] = isOpening;

    // Calculate position if opening
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
    // Small delay to allow click events to fire
    setTimeout(() => {
        openDropdowns.value[itemId] = false;
    }, 150);
};

// Handle window resize to recalculate dropdown positions
const handleWindowResize = () => {
    // Close all dropdowns on resize
    closeAllDropdowns();
};

// Navigation method
const navigateToUserManagement = (organizationId) => {
    router.push(`/admin/organizations/${organizationId}/users`);
};


// Helper function to format dates
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

// Click outside handler
const handleClickOutside = (event) => {
    const dropdowns = document.querySelectorAll('.organizations-admin__dropdown');
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
.organizations-admin {
    padding: 1rem;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.organizations-admin__panel {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.organizations-admin__header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
}

.organizations-admin__content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    overflow: hidden;
}

.organizations-admin__filters {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
}

.organizations-admin__filters-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.organizations-admin__search {
    flex: 1;
}

.organizations-admin__filters-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.organizations-admin__table-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: visible;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.organizations-admin__table-card :deep(.base-table) {
    overflow: visible !important;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.organizations-admin__table-card :deep(.base-table__cell) {
    overflow: visible !important;
}

.organizations-admin__table-card :deep(.base-table__cell:last-child) {
    overflow: visible !important;
    position: relative;
    z-index: 10;
}

.organizations-admin__table-card :deep(.base-table__row) {
    overflow: visible !important;
    position: relative;
}

.organizations-admin__table-card :deep(.base-table__body) {
    flex: 1;
    overflow-y: auto;
    overflow-x: visible !important;
    position: relative;
}

.organizations-admin__name-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.organizations-admin__name {
    font-weight: 600;
    color: var(--text-primary);
}

.organizations-admin__description {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

.organizations-admin__contact-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.organizations-admin__email,
.organizations-admin__phone {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.organizations-admin__location-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.organizations-admin__city {
    font-weight: 500;
    color: var(--text-primary);
}

.organizations-admin__state {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.organizations-admin__country {
    color: var(--text-primary);
}

.organizations-admin__date {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.organizations-admin__actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    overflow: visible;
    position: relative;
}

.organizations-admin__dropdown {
    position: relative;
    display: inline-block;
    overflow: visible;
    z-index: 1;
}

.organizations-admin__dropdown-button {
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

.organizations-admin__dropdown-button:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    color: var(--text-primary);
}

.organizations-admin__dropdown-button i {
    font-size: 0.875rem;
}

.organizations-admin__dropdown-menu {
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

.organizations-admin__dropdown-menu--portal {
    position: fixed !important;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%), 0 2px 4px -1px rgb(0 0 0 / 6%);
    z-index: 99999;
    min-width: 160px;
    overflow: visible;
}

.organizations-admin__dropdown-option {
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

.organizations-admin__dropdown-option:hover {
    background: var(--bg-elevated);
}

.organizations-admin__dropdown-option i {
    width: 14px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.organizations-admin__dropdown-option--danger {
    color: var(--danger);
}

.organizations-admin__dropdown-option--danger:hover {
    background: var(--danger-bg);
}

.organizations-admin__dropdown-option--danger i {
    color: var(--danger);
}

.organizations-admin__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    color: var(--text-secondary);
}

.organizations-admin__empty i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.organizations-admin__empty h3 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.organizations-admin__empty p {
    margin-bottom: 1.5rem;
    max-width: 400px;
}

.organizations-admin__pagination {
    padding: 1rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
}

/* Modal Styles */
.organizations-admin__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.organizations-admin__modal {
    background: var(--bg-surface);
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 10%), 0 10px 10px -5px rgb(0 0 0 / 4%);
    max-width: 600px;
    width: 100%;
    height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.organizations-admin__modal--small {
    max-width: 400px;
}

.organizations-admin__modal--large {
    max-width: 800px;
}

.organizations-admin__modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
}

.organizations-admin__modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.organizations-admin__modal-body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

.organizations-admin__modal-form {
    padding: 1.5rem;
}

.organizations-admin__form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.organizations-admin__form-field {
    margin-bottom: 1rem;
}

.organizations-admin__modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
}

.organizations-admin__assignment-info {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.organizations-admin__assignment-info p {
    margin: 0;
    color: var(--text-primary);
}

.organizations-admin__details {
    padding: 1.5rem;
}

.organizations-admin__details-section {
    margin-bottom: 2rem;
}

.organizations-admin__details-section h4 {
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-weight: 600;
}

.organizations-admin__details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.organizations-admin__detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.organizations-admin__detail-item label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.organizations-admin__detail-item span {
    color: var(--text-primary);
}

.organizations-admin__details-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
}

@media (width <= 768px) {
    .organizations-admin__filters-row {
        grid-template-columns: 1fr;
    }

    .organizations-admin__form-grid {
        grid-template-columns: 1fr;
    }

    .organizations-admin__details-grid {
        grid-template-columns: 1fr;
    }

    .organizations-admin__actions {
        justify-content: center;
    }

    .organizations-admin__dropdown {
        width: auto;
    }

    .organizations-admin__dropdown-button {
        width: 28px;
        height: 28px;
        justify-content: center;
    }

    .organizations-admin__modal {
        margin: 0.5rem;

        /* max-height: calc(100vh - 1rem); */
        height: 90vh;
    }
}
</style>
