<template>
    <div v-if="visible" class="users-admin__modal-overlay" @click="$emit('close')">
        <BaseCard class="users-admin__modal users-admin__modal--medium" @click.stop>
            <template #header>
                <div class="users-admin__modal-header">
                    <h3 class="users-admin__modal-title">{{ $t('planDetails') }}</h3>
                    <BaseButton @click="$emit('close')" variant="ghost" size="small">
                        <i class="fas fa-times"></i>
                    </BaseButton>
                </div>
            </template>

            <div class="users-admin__plan-details-content" v-if="user">
                <!-- Loading State -->
                <div v-if="loading" class="users-admin__plan-details-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>{{ $t('loading') }}...</span>
                </div>

                <!-- Content -->
                <template v-else>
                    <!-- User Info -->
                    <div class="users-admin__plan-details-user">
                        <h4>{{ user.firstName }} {{ user.lastName }}</h4>
                        <p class="users-admin__plan-details-email">{{ user.email }}</p>
                    </div>

                    <!-- Plan Info -->
                    <div v-if="subscriptionData" class="users-admin__plan-details-section">
                        <div class="users-admin__plan-details-header">
                            <h4>{{ planTitle }}</h4>
                            <div class="users-admin__plan-details-price">
                                <span class="price">${{ planPrice }}</span>
                                <span class="period">/{{ $t('month') }}</span>
                            </div>
                        </div>

                        <!-- Billing Cycle -->
                        <div v-if="stripeData && stripeData.startDate && stripeData.currentPeriodEnd"
                            class="users-admin__plan-details-billing">
                            <div class="users-admin__plan-details-billing-header">
                                <i class="bi bi-calendar-range"></i>
                                <strong>{{ $t('billingCycle') }}</strong>
                            </div>
                            <div class="users-admin__plan-details-billing-dates">
                                <span>{{ billingDates.start }}</span>
                                <i class="fas fa-arrow-right"></i>
                                <span>{{ billingDates.end }}</span>
                            </div>
                        </div>

                        <!-- Subscription Status -->
                        <div class="users-admin__plan-details-status">
                            <div class="users-admin__plan-details-status-header">
                                <i class="bi bi-info-circle"></i>
                                <strong>{{ $t('subscriptionStatus') }}</strong>
                            </div>
                            <div class="users-admin__plan-details-status-value">
                                <StatusIndicator :status="subscriptionStatus" :text="subscriptionStatusText" />
                            </div>
                        </div>
                    </div>

                    <!-- No Plan / Trial -->
                    <div v-else class="users-admin__plan-details-section">
                        <div class="users-admin__plan-details-header">
                            <h4>{{ user.isExpired ? $t('trialExpired') : $t('trial') }}</h4>
                        </div>
                        <div class="users-admin__plan-details-status">
                            <div class="users-admin__plan-details-status-header">
                                <i class="bi bi-info-circle"></i>
                                <strong>{{ $t('status') }}</strong>
                            </div>
                            <div class="users-admin__plan-details-status-value">
                                <StatusIndicator :status="user.isExpired ? 'blocked' : 'caution'"
                                    :text="user.isExpired ? $t('trialExpired') : $t('trial')" />
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <template #footer>
                <div class="users-admin__modal-footer">
                    <BaseButton @click="$emit('close')" variant="secondary">
                        {{ $t('close') }}
                    </BaseButton>
                </div>
            </template>
        </BaseCard>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { BaseCard, BaseButton, StatusIndicator } from '@/components/ui';

const props = defineProps({
    visible: Boolean,
    loading: Boolean,
    user: Object,
    subscriptionData: Object,
    stripeData: Object,
    planTitle: String,
    planPrice: [String, Number],
    billingDates: Object,
    subscriptionStatus: String,
    subscriptionStatusText: String
});

defineEmits(['close']);
</script>

<style scoped>
.users-admin__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: var(--spacing-lg);
    backdrop-filter: blur(4px);
}

.users-admin__modal {
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.users-admin__modal--medium {
    max-width: 600px;
}

.users-admin__modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
}

.users-admin__modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.users-admin__plan-details-content {
    padding: 1rem;
    overflow-y: auto;
    max-height: calc(90vh - 140px);
}

.users-admin__plan-details-user {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
}

.users-admin__plan-details-user h4 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
}

.users-admin__plan-details-email {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}

.users-admin__plan-details-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.users-admin__plan-details-header {
    text-align: center;
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.users-admin__plan-details-header h4 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.75rem;
}

.users-admin__plan-details-price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
}

.users-admin__plan-details-price .price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
}

.users-admin__plan-details-price .period {
    font-size: 1rem;
    color: var(--text-secondary);
}

.users-admin__plan-details-billing {
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.users-admin__plan-details-billing-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
}

.users-admin__plan-details-billing-header i {
    color: var(--accent);
    font-size: 1rem;
}

.users-admin__plan-details-billing-dates {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1rem;
    color: var(--text-secondary);
}

.users-admin__plan-details-billing-dates i {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.users-admin__plan-details-status {
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.users-admin__plan-details-status-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
}

.users-admin__plan-details-status-header i {
    color: var(--accent);
    font-size: 1rem;
}

.users-admin__plan-details-status-value {
    display: flex;
    align-items: center;
}

.users-admin__plan-details-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
    color: var(--text-secondary);
}

.users-admin__plan-details-loading i {
    font-size: 2rem;
    color: var(--accent);
}

.users-admin__modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
    background: var(--bg-elevated);
}
</style>
