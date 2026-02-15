<template>
    <div class="notifications-wrapper">
        <!-- Main Panel -->
        <BasePanel :title="t('notifications')" :subtitle="t('newestFirst')" elevation="level1" :scrollable="true">
            <template #actions-view>
                <BaseButton @click="refreshNotifications" :disabled="loading" variant="secondary" size="medium"
                    :class="{ 'spinning': loading }">
                    <template #icon>
                        <PhArrowsClockwise size="20" />
                    </template>
                    {{ t('refresh') }}
                </BaseButton>
            </template>

            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
                <BaseLoadingIndicator size="large" variant="primary" :message="t('loadingNotifications')" />
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-container">
                <div class="error-message">
                    <PhWarning size="32" />
                    <span>{{ error }}</span>
                    <BaseButton @click="fetchNotifications" variant="danger" size="small">
                        {{ t('retry') }}
                    </BaseButton>
                </div>
            </div>

            <!-- Notifications Content -->
            <div v-else>
                <!-- Filter and Search -->
                <div class="notifications-controls">
                    <div class="search-box">
                        <PhMagnifyingGlass size="16" class="search-icon" />
                        <input type="text" v-model="searchQuery" :placeholder="t('searchNotifications')"
                            class="search-input" />
                    </div>
                    <div class="filter-controls">
                        <select v-model="statusFilter" class="filter-select">
                            <option value="all">{{ t('allNotifications') }}</option>
                            <option value="active">{{ t('activeNotifications') }}</option>
                            <option value="inactive">{{ t('inactiveNotifications') }}</option>
                        </select>
                    </div>
                </div>

                <!-- Notifications List -->
                <div class="notifications-list" v-if="hasNotifications">
                    <BaseCard v-for="notification in filteredNotifications" :key="notification.id"
                        :variant="notification.active ? 'default' : 'warning'" :interactive="true"
                        class="notification-card">
                        <template #header>
                            <div class="notification-header">
                                <h4 class="notification-title text-left">{{ notification.title }}</h4>
                                <div class="notification-meta">
                                    <span class="notification-date">{{ formatDate(notification.dateAdded) }}</span>
                                    <span class="notification-status" :class="{ 'active': notification.active }">
                                        {{ notification.active ? t('active') : t('inactive') }}
                                    </span>
                                </div>
                            </div>
                        </template>

                        <div class="notification-body text-left">
                            <p>{{ notification.body }}</p>
                        </div>

                        <div class="notification-details" v-if="notification.data">
                            <small class="text-muted">{{ t('additionalData') }}: {{ notification.data }}</small>
                        </div>

                        <template #footer>
                            <div class="notification-target">
                                <PhUser size="16" />
                                <span v-if="notification.userId">{{ t('user') }}: {{ notification.userId }}</span>
                                <span v-else>{{ t('topic') }}: {{ notification.target }}</span>
                            </div>
                        </template>
                    </BaseCard>
                </div>

                <!-- Empty State -->
                <div v-else class="empty-state">
                    <div class="empty-icon">
                        <PhBell size="64" />
                    </div>
                    <h3>{{ t('noNotifications') }}</h3>
                    <p>{{ t('noNotificationsDescription') }}</p>
                </div>
            </div>
        </BasePanel>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNotifications } from '@/composables/useNotifications';
import { BasePanel, BaseButton, BaseCard, BaseLoadingIndicator } from '@/components/ui';
import { PhArrowsClockwise, PhWarning, PhMagnifyingGlass, PhUser, PhBell } from "@phosphor-icons/vue";

const { t } = useI18n();

const {
    notifications,
    loading,
    error,
    fetchNotifications,
    sendSingleNotification,
    sendMultiNotification,
    logNotification
} = useNotifications();

// Local reactive data
const filteredNotifications = ref([]);
const searchQuery = ref("");
const statusFilter = ref("all");

// Computed properties
const hasNotifications = computed(() => filteredNotifications.value.length > 0);

// Methods
const refreshNotifications = async () => {
    await fetchNotifications();
};

const filterNotifications = () => {
    let filtered = [...notifications.value];

    // Filter by search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(notification =>
            notification.title.toLowerCase().includes(query) ||
            notification.body.toLowerCase().includes(query)
        );
    }

    // Filter by status
    if (statusFilter.value !== "all") {
        const isActive = statusFilter.value === "active";
        filtered = filtered.filter(notification => notification.active === isActive);
    }

    // Sort by date (newest first) - reverse the order
    filtered.sort((a, b) => {
        const dateA = new Date(a.dateAdded);
        const dateB = new Date(b.dateAdded);
        return dateB - dateA; // Newest first
    });

    filteredNotifications.value = filtered;
};

const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Watchers
watch([notifications, searchQuery, statusFilter], () => {
    filterNotifications();
}, { immediate: true });

// Lifecycle
onMounted(() => {
    fetchNotifications();
});
</script>

<style scoped>
/* Design System Implementation */
.notifications-wrapper {
    /* padding: var(--spacing-xl); */
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
    height: 93vh;
    display: flex;
    flex-direction: column;
}

/* Ensure BasePanel takes full height */
.notifications-wrapper :deep(.base-panel) {
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* Loading and Error States */
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    padding: var(--spacing-2xl);
}

.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    padding: var(--spacing-2xl);
}

.error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    color: var(--error);
    text-align: center;
}

.error-message i {
    font-size: 2rem;
}

/* Controls */
.notifications-controls {
    display: flex;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    flex: 1;
    min-width: 250px;
}

.search-box .search-icon {
    position: absolute;
    left: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-size: var(--font-size-base);
}

.search-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 2.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    background: var(--bg-surface);
    color: var(--text-primary);
    transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgb(0 167 225 / 10%);
    outline: none;
}

.filter-controls {
    min-width: 200px;
}

.filter-select {
    width: 100%;
    padding: var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    background: var(--bg-surface);
    color: var(--text-primary);
    transition: border-color var(--transition-normal);
}

.filter-select:focus {
    border-color: var(--accent);
    outline: none;
}

/* Notifications List */
.notifications-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    flex: 1;
    overflow-y: auto;
}

.notification-card {
    /* margin-bottom: var(--spacing-md); */
    margin-bottom: 0.1rem;
}

/* Notification Content */
.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-lg);
}

.notification-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    flex: 1;
    line-height: 1.4;
}

.notification-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
}

.notification-date {
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
}

.notification-status {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
}

.notification-status.active {
    background: rgb(0 179 134 / 10%);
    color: var(--success);
}

.notification-status:not(.active) {
    background: rgb(232 62 140 / 10%);
    color: var(--error);
}

.notification-body {
    margin: var(--spacing-md) 0;
}

.notification-body p {
    margin: 0;
    color: var(--text-primary);
    line-height: 1.6;
    font-size: var(--font-size-base);
}

.notification-details {
    margin-top: var(--spacing-sm);
}

.notification-details .text-muted {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.notification-target {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: var(--spacing-2xl) var(--spacing-xl);
    color: var(--text-secondary);
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
    color: var(--text-secondary);
}

.empty-state h3 {
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
}

.empty-state p {
    margin: 0;
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
}

/* Spinning animation for refresh button */
.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* Responsive Design */
@media (width <= 768px) {
    .notifications-wrapper {
        padding: var(--spacing-md);
    }

    .notifications-controls {
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .notification-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
    }

    .notification-meta {
        align-items: flex-start;
    }

    .empty-state {
        padding: var(--spacing-xl) var(--spacing-md);
    }

    .empty-state h3 {
        font-size: var(--font-size-2xl);
    }
}

@media (width <= 480px) {
    .notifications-wrapper {
        padding: var(--spacing-sm);
    }

    .search-box,
    .filter-controls {
        min-width: auto;
    }
}
</style>
