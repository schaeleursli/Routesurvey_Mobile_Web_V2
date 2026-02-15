<template>
    <div class="account-requests-admin">
        <!-- Main Content Panel -->
        <BasePanel class="main-content-panel" elevation="level2" :scrollable="true" title="Account Requests"
            :subtitle="t('manageAccountRequests')">
            <template #actions-view>
                <div class="view-toggle-buttons">
                    <BaseButton @click="showArchived = false" :variant="!showArchived ? 'primary' : 'secondary'"
                        size="medium" left-icon="bi bi-list-check">
                        {{ t('activeRequests') }}
                    </BaseButton>
                    <BaseButton @click="showArchived = true" :variant="showArchived ? 'primary' : 'secondary'"
                        size="medium" left-icon="bi bi-archive">
                        {{ t('archivedRequests') }}
                    </BaseButton>
                </div>
            </template>

            <!-- Search and Filter Controls -->
            <div class="filters-section">
                <div class="filters-grid">
                    <BaseFormField v-model="searchQuery" type="text" :placeholder="t('searchRequests')"
                        @input="handleSearch" class="search-field">
                        <template #prefix>
                            <i class="bi bi-search"></i>
                        </template>
                    </BaseFormField>

                    <BaseFormField v-model="statusFilter" type="select" :options="statusOptions" @change="handleFilter"
                        class="filter-field" />

                    <BaseFormField v-model="sortBy" type="select" :options="sortOptions" @change="handleSort"
                        class="filter-field" />

                    <BaseButton @click="handleSortToggle" variant="ghost" size="medium"
                        :left-icon="sortDesc ? 'bi bi-sort-down' : 'bi bi-sort-up'" class="sort-toggle-btn">
                        {{ t('sort') }}
                    </BaseButton>
                </div>
            </div>

            <!-- Account Requests List -->
            <div class="list-section">
                <div v-if="paginatedRequests.length === 0" class="empty-state">
                    <div class="empty-state__content">
                        <i class="bi bi-inbox empty-state__icon"></i>
                        <h3 class="empty-state__title">{{ t('noRequestsFound') }}</h3>
                        <p class="empty-state__description">{{ t('noRequestsDescription') }}</p>
                    </div>
                </div>

                <div v-else class="requests-list">
                    <ListItem v-for="request in paginatedRequests" :key="request.id"
                        :title="`${request.firstName} ${request.lastName}`" :subtitle="request.email"
                        :description="getRequestDescription(request)" :clickable="true"
                        @click="openRequestModal(request)" class="request-item">
                        <template #icon>
                            <div class="request-avatar">
                                <i class="bi bi-person-fill"></i>
                            </div>
                        </template>

                        <template #content>
                            <div class="request-meta">
                                <div class="meta-item" v-if="request.phoneNumber">
                                    <i class="bi bi-telephone"></i>
                                    <span>{{ request.phoneNumber }}</span>
                                </div>
                                <div class="meta-item" v-if="request.company">
                                    <i class="bi bi-building"></i>
                                    <span>{{ request.company }}</span>
                                </div>
                                <div class="meta-item" v-if="request.country">
                                    <i class="bi bi-geo-alt"></i>
                                    <span>{{ request.country }}</span>
                                </div>
                                <div class="meta-item" v-if="request.profession">
                                    <i class="bi bi-briefcase"></i>
                                    <span>{{ request.profession }}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="bi bi-calendar"></i>
                                    <span>{{ formatDate(request.dateAdded) }}</span>
                                </div>
                            </div>
                        </template>

                        <template #actions>
                            <div class="request-actions">
                                <StatusIndicator :status="getStatusType(request.status)"
                                    :title="t(request.status.toLowerCase())"
                                    :description="getStatusDescription(request.status)"
                                    class="status-indicator--compact" />

                                <div class="action-buttons">
                                    <BaseButton @click.stop="openRequestModal(request)" variant="ghost" size="small"
                                        left-icon="bi bi-eye" :title="t('viewDetails')" />
                                    <BaseButton v-if="request.status === 'Pending'"
                                        @click.stop="updateStatus(request.id, 'Approved')" variant="ghost" size="small"
                                        left-icon="bi bi-check-circle" :title="t('approve')"
                                        class="action-btn--success" />
                                    <BaseButton v-if="request.status === 'Pending'"
                                        @click.stop="updateStatus(request.id, 'Rejected')" variant="ghost" size="small"
                                        left-icon="bi bi-x-circle" :title="t('reject')" class="action-btn--danger" />
                                    <BaseButton v-if="!showArchived" @click.stop="archiveRequest(request.id)"
                                        variant="ghost" size="small" left-icon="bi bi-archive" :title="t('archive')"
                                        class="action-btn--warning" />
                                    <BaseButton v-if="showArchived" @click.stop="unarchiveRequest(request.id)"
                                        variant="ghost" size="small" left-icon="bi bi-arrow-counterclockwise"
                                        :title="t('unarchive')" class="action-btn--info" />
                                    <BaseButton @click.stop="deleteRequest(request.id)" variant="ghost" size="small"
                                        left-icon="bi bi-trash" :title="t('delete')" class="action-btn--danger" />
                                </div>
                            </div>
                        </template>
                    </ListItem>
                </div>
            </div>

            <!-- Pagination -->
            <template #footer>
                <div class="pagination-footer">
                    <div class="pagination-info">
                        <span class="pagination-text">
                            {{ t('showing') }} {{ startIndex + 1 }}-{{ endIndex }} {{ t('of') }} {{ totalCount }} {{
                                t('requests') }}
                        </span>
                    </div>
                    <BasePagination :current-page="currentPage" :total-pages="totalPages" :total-items="totalCount"
                        :items-per-page="pageSize" :item-label="t('requests')" @page-change="changePage" />
                </div>
            </template>
        </BasePanel>

        <!-- Request Details Modal -->
        <div class="modal fade" id="requestModal" tabindex="-1" ref="requestModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content design-system-modal">
                    <div class="modal-header design-system-modal__header">
                        <h5 class="modal-title design-system-modal__title">{{ t('requestDetails') }}</h5>
                        <BaseButton variant="ghost" size="small" left-icon="bi bi-x-lg" @click="closeRequestModal"
                            class="modal-close-btn" />
                    </div>
                    <div class="modal-body design-system-modal__body" v-if="selectedRequest">
                        <BasePanel class="request-details-panel" elevation="level0">
                            <div class="request-details-grid">
                                <div class="request-details-section">
                                    <h6 class="section-title">{{ t('personalInformation') }}</h6>
                                    <div class="detail-item">
                                        <span class="detail-label">{{ t('firstName') }}:</span>
                                        <span class="detail-value">{{ selectedRequest.firstName }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">{{ t('lastName') }}:</span>
                                        <span class="detail-value">{{ selectedRequest.lastName }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">{{ t('email') }}:</span>
                                        <span class="detail-value">{{ selectedRequest.email }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">{{ t('phone') }}:</span>
                                        <span class="detail-value">{{ selectedRequest.phoneNumber || '-' }}</span>
                                    </div>
                                </div>
                                <div class="request-details-section">
                                    <h6 class="section-title">{{ t('professionalInformation') }}</h6>
                                    <div class="detail-item">
                                        <span class="detail-label">{{ t('company') }}:</span>
                                        <span class="detail-value">{{ selectedRequest.company || '-' }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">{{ t('country') }}:</span>
                                        <span class="detail-value">{{ selectedRequest.country || '-' }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">{{ t('profession') }}:</span>
                                        <span class="detail-value">{{ selectedRequest.profession || '-' }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="request-details-section request-details-section--full">
                                <h6 class="section-title">{{ t('requestInformation') }}</h6>
                                <div class="detail-item">
                                    <span class="detail-label">{{ t('status') }}:</span>
                                    <StatusIndicator :status="getStatusType(selectedRequest.status)"
                                        :title="t(selectedRequest.status.toLowerCase())"
                                        :description="getStatusDescription(selectedRequest.status)" />
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">{{ t('statusComment') }}:</span>
                                    <span class="detail-value">{{ selectedRequest.statusComment || '-' }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">{{ t('dateAdded') }}:</span>
                                    <span class="detail-value">{{ formatDate(selectedRequest.dateAdded) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">{{ t('dateUpdated') }}:</span>
                                    <span class="detail-value">{{ formatDate(selectedRequest.dateUpdated) }}</span>
                                </div>
                            </div>
                        </BasePanel>
                    </div>
                    <div class="modal-footer design-system-modal__footer">
                        <BaseButton variant="secondary" size="medium" @click="closeRequestModal">
                            {{ t('close') }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Update Modal -->
        <div class="modal fade" id="statusModal" tabindex="-1" ref="statusModal">
            <div class="modal-dialog">
                <div class="modal-content design-system-modal">
                    <div class="modal-header design-system-modal__header">
                        <h5 class="modal-title design-system-modal__title">{{ t('updateStatus') }}</h5>
                        <BaseButton variant="ghost" size="small" left-icon="bi bi-x-lg" @click="closeStatusModal"
                            class="modal-close-btn" />
                    </div>
                    <div class="modal-body design-system-modal__body">
                        <BasePanel class="status-update-panel" elevation="level0">
                            <BaseFormField v-model="statusUpdate.status" type="select" :label="t('status')"
                                :options="statusUpdateOptions" class="status-field" />
                            <BaseFormField v-model="statusUpdate.statusComment" type="textarea"
                                :label="t('statusComment')" :placeholder="t('enterStatusComment')" :rows="3"
                                class="comment-field" />
                        </BasePanel>
                    </div>
                    <div class="modal-footer design-system-modal__footer">
                        <BaseButton variant="secondary" size="medium" @click="closeStatusModal">
                            {{ t('cancel') }}
                        </BaseButton>
                        <BaseButton variant="primary" size="medium" @click="confirmStatusUpdate">
                            {{ t('update') }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AccountRequestsController from '@/controllers/account_requests/account_requests_controller.js';
import { Modal } from 'bootstrap';
import {
    BaseButton,

    BasePanel,
    BaseFormField,
    BasePagination,
    StatusIndicator,
    ListItem
} from '@/components/ui';

export default {
    name: 'AccountRequestsAdmin',
    components: {
        BaseButton,

        BasePanel,
        BaseFormField,
        BasePagination,
        StatusIndicator,
        ListItem
    },
    setup() {
        const { t } = useI18n();

        // Reactive data
        const requests = ref([]);
        const filteredRequests = ref([]);
        const selectedRequest = ref(null);
        const showArchived = ref(false);
        const searchQuery = ref('');
        const statusFilter = ref('');
        const sortBy = ref('');
        const sortDesc = ref(true);
        const currentPage = ref(1);
        const pageSize = ref(10);
        const totalCount = ref(0);
        const loading = ref(false);

        // Status update modal
        const statusUpdate = ref({
            id: null,
            status: 'Pending',
            statusComment: ''
        });

        // Modal references
        const requestModal = ref(null);
        const statusModal = ref(null);
        let requestModalInstance = null;
        let statusModalInstance = null;

        // Computed properties
        const startIndex = computed(() => (currentPage.value - 1) * pageSize.value);
        const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, totalCount.value));
        const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));



        // Filter options
        const statusOptions = computed(() => [
            { value: '', label: t('allStatuses') },
            { value: 'Pending', label: t('pending') },
            { value: 'Approved', label: t('approved') },
            { value: 'Rejected', label: t('rejected') }
        ]);

        const sortOptions = computed(() => [
            { value: '', label: t('sortBy') },
            { value: 'dateAdded', label: t('dateAdded') },
            { value: 'firstName', label: t('firstName') },
            { value: 'lastName', label: t('lastName') },
            { value: 'email', label: t('email') },
            { value: 'status', label: t('status') }
        ]);

        const statusUpdateOptions = computed(() => [
            { value: 'Pending', label: t('pending') },
            { value: 'Approved', label: t('approved') },
            { value: 'Rejected', label: t('rejected') }
        ]);

        const visiblePages = computed(() => {
            const pages = [];
            const start = Math.max(1, currentPage.value - 2);
            const end = Math.min(totalPages.value, currentPage.value + 2);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        });

        const paginatedRequests = computed(() => {
            return filteredRequests.value.slice(startIndex.value, startIndex.value + pageSize.value);
        });

        // Methods
        const loadRequests = async () => {
            loading.value = true;
            try {
                let response;
                if (showArchived.value) {
                    response = await AccountRequestsController.getArchivedAccountRequestsPaginated(
                        currentPage.value,
                        pageSize.value,
                        searchQuery.value
                    );
                } else {
                    response = await AccountRequestsController.getAccountRequestsPaginated(
                        currentPage.value,
                        pageSize.value,
                        searchQuery.value
                    );
                }

                if (response.result) {
                    requests.value = response.data || [];
                    totalCount.value = response.totalCount || 0;
                    applyFilters();
                } else {
                    console.error('Failed to load requests:', response.message);
                }
            } catch (error) {
                console.error('Error loading requests:', error);
            } finally {
                loading.value = false;
            }
        };

        const applyFilters = () => {
            let filtered = [...requests.value];

            // Status filter
            if (statusFilter.value) {
                filtered = filtered.filter(request => request.status === statusFilter.value);
            }

            // Sort
            if (sortBy.value) {
                filtered.sort((a, b) => {
                    let aVal = a[sortBy.value];
                    let bVal = b[sortBy.value];

                    if (typeof aVal === 'string') {
                        aVal = aVal.toLowerCase();
                        bVal = bVal.toLowerCase();
                    }

                    if (sortDesc.value) {
                        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                    } else {
                        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                    }
                });
            }

            filteredRequests.value = filtered;
        };

        const handleSearch = () => {
            currentPage.value = 1;
            loadRequests();
        };

        const handleFilter = () => {
            currentPage.value = 1;
            applyFilters();
        };

        const handleSort = () => {
            applyFilters();
        };

        const handleSortToggle = () => {
            sortDesc.value = !sortDesc.value;
            applyFilters();
        };

        const changePage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                currentPage.value = page;
                loadRequests();
            }
        };

        const openRequestModal = (request) => {
            selectedRequest.value = request;
            if (requestModalInstance) {
                requestModalInstance.show();
            }
        };

        const updateStatus = (id, status) => {
            statusUpdate.value = {
                id: id,
                status: status,
                statusComment: ''
            };
            if (statusModalInstance) {
                statusModalInstance.show();
            }
        };

        const confirmStatusUpdate = async () => {
            try {
                const response = await AccountRequestsController.updateAccountRequestStatus(statusUpdate.value);
                if (response.result) {
                    if (statusModalInstance) {
                        statusModalInstance.hide();
                    }
                    loadRequests();
                } else {
                    console.error('Failed to update status:', response.message);
                }
            } catch (error) {
                console.error('Error updating status:', error);
            }
        };

        const archiveRequest = async (id) => {
            console.log(id);
            if (confirm(t('confirmArchive'))) {
                try {
                    const response = await AccountRequestsController.archiveAccountRequest(id);
                    if (response.result) {
                        loadRequests();
                    } else {
                        console.error('Failed to archive request:', response.message);
                    }
                } catch (error) {
                    console.error('Error archiving request:', error);
                }
            }
        };

        const unarchiveRequest = async (id) => {
            if (confirm(t('confirmUnarchive'))) {
                try {
                    const response = await AccountRequestsController.unarchiveAccountRequest(id);
                    if (response.result) {
                        loadRequests();
                    } else {
                        console.error('Failed to unarchive request:', response.message);
                    }
                } catch (error) {
                    console.error('Error unarchiving request:', error);
                }
            }
        };

        const deleteRequest = async (id) => {
            if (confirm(t('confirmDeleteRequest'))) {
                try {
                    const response = await AccountRequestsController.deleteAccountRequest(id);
                    if (response.result) {
                        loadRequests();
                    } else {
                        console.error('Failed to delete request:', response.message);
                    }
                } catch (error) {
                    console.error('Error deleting request:', error);
                }
            }
        };

        const getStatusType = (status) => {
            switch (status) {
                case 'Approved':
                    return 'verified';
                case 'Pending':
                    return 'caution';
                case 'Rejected':
                    return 'blocked';
                default:
                    return 'caution';
            }
        };

        const getStatusDescription = (status) => {
            switch (status) {
                case 'Approved':
                    return t('requestApproved');
                case 'Pending':
                    return t('requestPending');
                case 'Rejected':
                    return t('requestRejected');
                default:
                    return t('requestPending');
            }
        };

        const getRequestDescription = (request) => {
            const parts = [];
            if (request.company) parts.push(request.company);
            if (request.country) parts.push(request.country);
            if (request.profession) parts.push(request.profession);
            return parts.join(' • ') || t('noAdditionalInfo');
        };



        const closeRequestModal = () => {
            if (requestModalInstance) {
                requestModalInstance.hide();
            }
        };

        const closeStatusModal = () => {
            if (statusModalInstance) {
                statusModalInstance.hide();
            }
        };

        const formatDate = (dateString) => {
            if (!dateString) return '-';
            return new Date(dateString).toLocaleDateString();
        };

        // Watchers
        watch(showArchived, () => {
            currentPage.value = 1;
            loadRequests();
        });

        // Lifecycle
        onMounted(() => {
            requestModalInstance = new Modal(requestModal.value);
            statusModalInstance = new Modal(statusModal.value);
            loadRequests();
        });

        return {
            t,
            requests,
            filteredRequests,
            selectedRequest,
            showArchived,
            searchQuery,
            statusFilter,
            sortBy,
            sortDesc,
            currentPage,
            pageSize,
            totalCount,
            loading,
            statusUpdate,
            requestModal,
            statusModal,
            startIndex,
            endIndex,
            totalPages,
            visiblePages,
            paginatedRequests,

            statusOptions,
            sortOptions,
            statusUpdateOptions,
            loadRequests,
            applyFilters,
            handleSearch,
            handleFilter,
            handleSort,
            handleSortToggle,

            changePage,
            openRequestModal,
            updateStatus,
            confirmStatusUpdate,
            archiveRequest,
            unarchiveRequest,
            deleteRequest,
            getStatusType,
            getStatusDescription,
            getRequestDescription,
            closeRequestModal,
            closeStatusModal,
            formatDate
        };
    }
};
</script>

<style scoped>
/* Design System Implementation */
.account-requests-admin {
    min-height: 90vh;

    /* background: var(--bg-base); */

    /* padding: var(--spacing-lg); */
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

/* Main Content Panel */
.main-content-panel {
    flex: 1;
    display: flex;
    flex-direction: column;

    /* height: calc(100vh - 2 * var(--spacing-lg)); */
    height: 90vh;

    /* max-height: calc(100vh - 2 * var(--spacing-lg)); */
    max-height: 90vh;
}

/* View Toggle Buttons */
.view-toggle-buttons {
    display: flex;
    gap: var(--spacing-sm);
}

/* Filters Section */
.filters-section {
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border);
}

.filters-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr auto;
    gap: var(--spacing-md);
    align-items: end;
}

.search-field {
    position: relative;
}

.search-field :deep(.base-form-field__input) {
    padding-left: 2.5rem;
}

.search-field :deep(.base-form-field__input::before) {
    content: '\f002';
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-family: 'Bootstrap Icons';
}

.filter-field {
    min-width: 0;
}

.sort-toggle-btn {
    white-space: nowrap;
}

/* List Section */
.list-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.requests-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
}

/* Empty State */
.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: var(--spacing-2xl);
}

.empty-state__content {
    text-align: center;
    max-width: 400px;
}

.empty-state__icon {
    font-size: 4rem;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-lg);
}

.empty-state__title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
}

.empty-state__description {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
}

/* Request Item */
.request-item {
    border-bottom: 1px solid var(--border);
    transition: all 0.2s ease;
}

.request-item:hover {
    background: var(--bg-elevated);
}

.request-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
}

.request-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xs);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.meta-item i {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.request-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex-shrink: 0;
}

.status-indicator--compact {
    transform: scale(0.9);
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

/* Table Cell Styling */
.name-cell {
    display: flex;
    flex-direction: column;
}

.name-text {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
}

.email-text,
.phone-text,
.company-text,
.country-text,
.profession-text,
.date-text {
    color: var(--text-primary);
    font-size: var(--font-size-sm);
}

.actions-cell {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
}

.action-btn--success {
    color: var(--success);
}

.action-btn--success:hover {
    background: rgb(0 179 134 / 10%);
}

.action-btn--danger {
    color: var(--error);
}

.action-btn--danger:hover {
    background: rgb(232 62 140 / 10%);
}

.action-btn--warning {
    color: var(--warning);
}

.action-btn--warning:hover {
    background: rgb(243 156 18 / 10%);
}

.action-btn--info {
    color: var(--accent);
}

.action-btn--info:hover {
    background: rgb(0 167 225 / 10%);
}

/* Pagination Footer */
.pagination-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg) 0;
}

.pagination-info {
    display: flex;
    align-items: center;
}

.pagination-text {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
}

/* Modal Styling */
.design-system-modal {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
}

.design-system-modal__header {
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    padding: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.design-system-modal__title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin: 0;
}

.modal-close-btn {
    color: var(--text-secondary);
}

.design-system-modal__body {
    padding: var(--spacing-lg);
    background: var(--bg-surface);
}

.design-system-modal__footer {
    background: var(--bg-elevated);
    border-top: 1px solid var(--border);
    padding: var(--spacing-lg);
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
}

/* Request Details Panel */
.request-details-panel {
    background: var(--bg-surface);
}

.request-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);
}

.request-details-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.request-details-section--full {
    grid-column: 1 / -1;
}

.section-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--border);
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--border);
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.detail-value {
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    text-align: right;
    max-width: 60%;
    word-break: break-word;
}

/* Status Update Panel */
.status-update-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.status-field,
.comment-field {
    width: 100%;
}

/* Responsive Design */
@media (width <= 768px) {
    .account-requests-admin {
        padding: var(--spacing-md);
    }

    .main-content-panel {
        height: calc(100vh - 2 * var(--spacing-md));
        max-height: calc(100vh - 2 * var(--spacing-md));
    }

    .view-toggle-buttons {
        justify-content: center;
        flex-wrap: wrap;
    }

    .filters-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
    }

    .filters-section {
        margin-bottom: var(--spacing-md);
        padding-bottom: var(--spacing-md);
    }

    .request-meta {
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .request-actions {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
    }

    .action-buttons {
        justify-content: center;
        flex-wrap: wrap;
    }

    .pagination-footer {
        flex-direction: column;
        gap: var(--spacing-sm);
        text-align: center;
    }

    .request-details-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-lg);
    }

    .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
    }

    .detail-value {
        text-align: left;
        max-width: 100%;
    }
}

@media (width <= 480px) {
    .account-requests-admin {
        padding: var(--spacing-sm);
    }

    .main-content-panel {
        height: calc(100vh - 2 * var(--spacing-sm));
        max-height: calc(100vh - 2 * var(--spacing-sm));
    }

    .design-system-modal__header,
    .design-system-modal__body,
    .design-system-modal__footer {
        padding: var(--spacing-md);
    }
}
</style>
