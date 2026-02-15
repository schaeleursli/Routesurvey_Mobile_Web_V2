<template>
    <div class="admin-notifications-wrapper">
        <BasePanel title="Send Notifications"
            subtitle="Send notifications to individual users or broadcast to multiple users"
            class="notifications-panel">
            <div class="notifications-content">
                <!-- Send Single Notification -->
                <div class="notification-section">
                    <h3 class="section-title">{{ t('sendSingleNotification') }}</h3>

                    <form @submit.prevent="sendSingleNotification" class="notification-form">
                        <div class="form-section">
                            <BaseFormField :label="t('selectUser')" type="text" :model-value="userSearchQuery"
                                :placeholder="t('searchUsers')" @update:model-value="handleUserSearch"
                                @focus="showUserDropdown = true" @click="handleInputClick" />

                            <!-- Custom User Dropdown -->
                            <div v-if="showUserDropdown" class="user-dropdown">
                                <div v-if="loadingUsers" class="dropdown-loading">
                                    <i class="bi bi-arrow-clockwise spinning"></i>
                                    <span>{{ t('loadingUsers') }}</span>
                                </div>
                                <div v-else-if="filteredUsers.length === 0" class="dropdown-empty">
                                    <span>{{ t('noUsersFound') }}</span>
                                </div>
                                <div v-else class="user-options">
                                    <div v-for="user in filteredUsers" :key="user.id" class="user-option"
                                        :class="{ 'selected': selectedUser?.id === user.id }" @click="selectUser(user)">
                                        <div class="user-info">
                                            <div class="user-name">{{ user.firstName || 'Unknown' }} {{ user.lastName ||
                                                'User' }}</div>
                                            <div class="user-email">{{ user.email || 'No email' }}</div>
                                        </div>
                                        <div class="user-id">#{{ user.id || 'N/A' }}</div>
                                    </div>
                                </div>
                            </div>

                            <div v-if="selectedUser" class="selected-user-display">
                                <i class="bi bi-person-check"></i>
                                <span>{{ selectedUser.firstName || 'Unknown' }} {{ selectedUser.lastName || 'User' }}
                                    ({{
                                        selectedUser.email || 'No email' }})</span>
                                <BaseButton variant="ghost" size="small" @click="clearSelectedUser">
                                    <i class="bi bi-x"></i>
                                </BaseButton>
                            </div>
                        </div>

                        <BaseFormField :label="t('title')" type="text" v-model="singleNotification.title"
                            :placeholder="t('enterTitle')" required />

                        <BaseFormField :label="t('body')" type="textarea" v-model="singleNotification.body"
                            :placeholder="t('enterBody')" :rows="3" required />

                        <BaseFormField :label="`${t('data')} (${t('optional')})`" type="text"
                            v-model="singleNotification.data" :placeholder="t('enterData')" />

                        <BaseButton type="submit" variant="primary" size="large" :disabled="sending"
                            left-icon="bi bi-send" :class="{ 'spinning': sending }">
                            {{ t('sendNotification') }}
                        </BaseButton>
                    </form>
                </div>

                <!-- Divider -->
                <div class="section-divider"></div>

                <!-- Send Multi Notification -->
                <div class="notification-section">
                    <h3 class="section-title">{{ t('sendMultiNotification') }}</h3>

                    <form @submit.prevent="sendMultiNotification" class="notification-form">
                        <BaseFormField :label="t('topic')" type="text" v-model="multiNotification.topic"
                            :placeholder="t('enterTopic')" required />

                        <BaseFormField :label="t('title')" type="text" v-model="multiNotification.title"
                            :placeholder="t('enterTitle')" required />

                        <BaseFormField :label="t('body')" type="textarea" v-model="multiNotification.body"
                            :placeholder="t('enterBody')" :rows="3" required />

                        <BaseFormField :label="`${t('data')} (${t('optional')})`" type="text"
                            v-model="multiNotification.data" :placeholder="t('enterData')" />

                        <BaseButton type="submit" variant="primary" size="large" :disabled="sending"
                            left-icon="bi bi-send" :class="{ 'spinning': sending }">
                            {{ t('sendNotification') }}
                        </BaseButton>
                    </form>
                </div>

                <!-- Success/Error Messages -->
                <div v-if="message" class="message-section">
                    <BaseCard :variant="message.type === 'success' ? 'success' : 'error'" class="message-card">
                        <div class="message-content">
                            <i
                                :class="message.type === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-triangle'"></i>
                            <span>{{ message.text }}</span>
                        </div>
                    </BaseCard>
                </div>
            </div>
        </BasePanel>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNotifications } from '@/composables/useNotifications';
import usersAdminController from '@/controllers/users_admin/users_admin_controller';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseFormField from '@/components/ui/BaseFormField.vue';
import BasePanel from '@/components/ui/BasePanel.vue';
import { useSearchContext } from "@/composables/useSearchContext";

const { t } = useI18n();

const {
    sendSingleNotification: sendSingle,
    sendMultiNotification: sendMulti,
    logNotification
} = useNotifications();

const { registerSearchContext, clearSearchContext } = useSearchContext();

// Reactive data
const sending = ref(false);
const message = ref(null);
const singleNotification = ref({
    userId: null,
    title: '',
    body: '',
    data: ''
});
const multiNotification = ref({
    topic: '',
    title: '',
    body: '',
    data: ''
});

// User selection data
const users = ref([]);
const filteredUsers = ref([]);
const selectedUser = ref(null);
const userSearchQuery = ref('');
const showUserDropdown = ref(false);
const loadingUsers = ref(false);

// User selection methods
const fetchUsers = async () => {
    loadingUsers.value = true;
    try {
        const response = await usersAdminController.getUsers();
        if (response.result) {
            // Ensure all users have required properties
            users.value = (response.data || []).map(user => ({
                id: user.id || 0,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                ...user
            }));
            filteredUsers.value = [...users.value];
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        users.value = [];
        filteredUsers.value = [];
    } finally {
        loadingUsers.value = false;
    }
};

const searchUsers = () => {
    const query = userSearchQuery.value.toLowerCase();
    if (query.trim() === '') {
        filteredUsers.value = [...users.value];
    } else {
        filteredUsers.value = users.value.filter(user =>
            (user.firstName && user.firstName.toLowerCase().includes(query)) ||
            (user.lastName && user.lastName.toLowerCase().includes(query)) ||
            (user.email && user.email.toLowerCase().includes(query)) ||
            (user.id && user.id.toString().includes(query))
        );
    }
};

const handleUserSearch = (value) => {
    userSearchQuery.value = value;
    searchUsers();
};

const toggleUserDropdown = () => {
    showUserDropdown.value = !showUserDropdown.value;
    if (showUserDropdown.value && users.value.length === 0) {
        fetchUsers();
    }
};

const handleInputClick = (event) => {
    event.stopPropagation();
    showUserDropdown.value = true;
    if (users.value.length === 0) {
        fetchUsers();
    }
};

const selectUser = (user) => {
    if (!user || !user.userId) {
        console.error('Invalid user selected:', user);
        return;
    }

    selectedUser.value = user;
    singleNotification.value.userId = user.userId;
    userSearchQuery.value = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    showUserDropdown.value = false;
};

const clearSelectedUser = () => {
    selectedUser.value = null;
    singleNotification.value.userId = null;
    userSearchQuery.value = '';
};

// Methods
const sendSingleNotification = async () => {
    console.log('selectedUser', selectedUser.value);
    if (!selectedUser.value) {
        message.value = {
            type: 'error',
            text: t('pleaseSelectUser')
        };
        return;
    }

    sending.value = true;
    message.value = null;

    try {
        const response = await sendSingle(singleNotification.value);

        if (response.result) {
            message.value = {
                type: 'success',
                text: t('notificationSentSuccessfully')
            };
            resetSingleForm();
        } else {
            message.value = {
                type: 'error',
                text: response.message || t('failedToSendNotification')
            };
        }
    } catch (error) {
        console.error('Error sending single notification:', error);
        message.value = {
            type: 'error',
            text: t('failedToSendNotification')
        };
    } finally {
        sending.value = false;
    }
};

const sendMultiNotification = async () => {
    sending.value = true;
    message.value = null;

    try {
        const response = await sendMulti(multiNotification.value);

        if (response.result) {
            message.value = {
                type: 'success',
                text: t('notificationSentSuccessfully')
            };
            resetMultiForm();
        } else {
            message.value = {
                type: 'error',
                text: response.message || t('failedToSendNotification')
            };
        }
    } catch (error) {
        console.error('Error sending multi notification:', error);
        message.value = {
            type: 'error',
            text: t('failedToSendNotification')
        };
    } finally {
        sending.value = false;
    }
};

const resetSingleForm = () => {
    singleNotification.value = {
        userId: null,
        title: '',
        body: '',
        data: ''
    };
    selectedUser.value = null;
    userSearchQuery.value = '';
    showUserDropdown.value = false;
};

const resetMultiForm = () => {
    multiNotification.value = {
        topic: '',
        title: '',
        body: '',
        data: ''
    };
};

// Click outside handler
const handleClickOutside = (event) => {
    const userSelectContainer = event.target.closest('.user-select-container');
    if (!userSelectContainer) {
        showUserDropdown.value = false;
    }
};

// Lifecycle
onMounted(() => {
    document.addEventListener('click', handleClickOutside);

    registerSearchContext(t('users'), async (query) => {
        if (users.value.length === 0) {
            await fetchUsers();
        }
        handleUserSearch(query);
        
        return filteredUsers.value.slice(0, 5).map(user => ({
            title: `${user.firstName} ${user.lastName}`,
            description: user.email,
            action: () => selectUser(user)
        }));
    }, 'bi-person');
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    clearSearchContext();
});
</script>

<style scoped>
.admin-notifications-wrapper {
    padding: 1rem;
    margin: 0 auto;
}

.notifications-panel {
    width: 100%;
}

.notifications-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}

.notification-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.section-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin: 0;
    letter-spacing: var(--letter-spacing-normal);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border);
}

.section-divider {
    height: 1px;
    background: var(--border);
    margin: var(--spacing-lg) 0;
}

.notification-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.form-section {
    position: relative;
}

.spinning {
    animation: spin 1s linear infinite;
}

/* Target only the icon within spinning buttons */
.base-button.spinning .base-button__icon {
    animation: spin 1s linear infinite;
}

.base-button.spinning {
    animation: none;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.message-section {
    margin-top: var(--spacing-lg);
}

.message-card {
    width: 100%;
}

.message-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: var(--font-weight-medium);
}

.message-content i {
    font-size: var(--font-size-lg);
}

/* User Dropdown Styles */
.user-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-height: 320px;
    overflow: hidden;
    z-index: 1000;
    animation: dropdownSlide var(--transition-normal) ease-out;
    margin-top: var(--spacing-2xs);
}

@keyframes dropdownSlide {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dropdown-loading,
.dropdown-empty {
    padding: var(--spacing-xl) var(--spacing-md);
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
    margin: var(--spacing-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
}

.user-options {
    max-height: 280px;
    overflow-y: auto;
    padding: var(--spacing-sm);
}

.user-options::-webkit-scrollbar {
    width: 6px;
}

.user-options::-webkit-scrollbar-track {
    background: var(--bg-elevated);
    border-radius: 3px;
}

.user-options::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
}

.user-options::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
}

.user-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-sm);
    margin: var(--spacing-2xs);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 1px solid transparent;
    position: relative;
}

.user-option:hover {
    background: var(--bg-elevated);
    border-color: var(--border);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
}

.user-option.selected {
    background: var(--accent-surface);
    border-color: var(--accent);
    color: var(--accent);
    box-shadow: 0 2px 12px var(--accent-focus-ring);
}

.user-option.selected::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent);
    border-radius: 0 2px 2px 0;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-2xs);
    font-size: var(--font-size-sm);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-email {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.user-id {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    font-weight: var(--font-weight-semibold);
    background: var(--bg-elevated);
    padding: var(--spacing-2xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    white-space: nowrap;
    flex-shrink: 0;
}

.selected-user-display {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: linear-gradient(135deg, rgb(0 179 134 / 10%), rgb(0 179 134 / 5%));
    border: 1px solid var(--success);
    border-radius: var(--radius-lg);
    margin-top: var(--spacing-sm);
    font-size: var(--font-size-sm);
    box-shadow: 0 2px 8px rgb(0 179 134 / 10%);
    position: relative;
    overflow: hidden;
}

.selected-user-display::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--success), var(--success));
}

.selected-user-display i {
    color: var(--success);
    font-size: var(--font-size-lg);
    flex-shrink: 0;
}

.selected-user-display span {
    flex: 1;
    font-weight: var(--font-weight-medium);
    color: var(--success);
}

/* Responsive adjustments */
@media (width <= 768px) {
    .admin-notifications-wrapper {
        padding: var(--spacing-md);
    }

    .user-dropdown {
        max-height: 250px;
        box-shadow: var(--shadow-md);
    }

    .user-option {
        padding: var(--spacing-sm);
        margin: var(--spacing-2xs);
    }

    .user-name {
        font-size: var(--font-size-xs);
    }

    .user-email {
        font-size: var(--font-size-xs);
    }

    .user-id {
        font-size: var(--font-size-xs);
        padding: var(--spacing-2xs) var(--spacing-sm);
    }

    .selected-user-display {
        padding: var(--spacing-sm);
        gap: var(--spacing-sm);
    }

    .selected-user-display span {
        font-size: var(--font-size-xs);
    }
}
</style>
