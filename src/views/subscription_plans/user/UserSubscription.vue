<template>
    <div class="user-subscription">
        <!-- Current Subscription Status -->
        <BasePanel v-if="currentSubscription || isUserTrailExpired || !isUserTrailExpired" class="status-panel"
            :elevation="'level1'">
            <template #header>
                <div class="status-header">
                    <div class="status-title">
                        <i class="bi bi-info-circle"></i>
                        <h4>{{ currentSubscription ? $t('subscription') : $t('trialPeriod') }}</h4>
                    </div>
                </div>
            </template>

            <div v-if="currentSubscription" class="subscription-info">
                <div class="subscription-details">
                    <p class="subscription-text">
                        {{ $t('youAreCurrentlySubscribedTo') }} <strong>{{ JSON.parse(currentSubscription.planData).name
                            }}</strong>
                    </p>
                    <div class="plan-info-compact">
                        <div class="plan-name-compact">
                            <h4>{{ JSON.parse(currentSubscription.planData).name }}</h4>
                            <div class="plan-price-compact">
                                <span class="price">${{ JSON.parse(currentSubscription.planData).price }}</span>
                                <span class="period">/{{ $t('month') }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-if="billingCycle" class="billing-cycle">
                        <i class="bi bi-calendar-range"></i>
                        <span><strong>{{ $t('billingCycle') }}:</strong> {{ billingCycle.start }} - {{ billingCycle.end
                        }}</span>
                    </div>
                </div>
            </div>
            <div v-else-if="isUserTrailExpired" class="trial-info">
                <p class="trial-text">
                    {{ $t('yourTrialPeriodHasExpired') }}
                </p>
                <div class="expire-date">
                    <i class="bi bi-calendar-x"></i>
                    <span>{{ $t('expireDate') }}: {{ expireDate ? formatDate(expireDate) : "N/A" }}</span>
                </div>
            </div>
            <div v-else class="trial-info">
                <p class="trial-text">
                    {{ $t('youAreCurrentlyOnTrial') }}
                </p>
                <div class="remaining-days">
                    <i class="bi bi-clock"></i>
                    <span>{{ $t('remainingDays') }}: {{ remainingDays + " " + $t('days') }}</span>
                </div>
            </div>

            <template #footer v-if="currentSubscription">
                <div class="subscription-actions">
                    <BaseButton variant="secondary" size="small" left-icon="bi bi-list-check"
                        @click="showCurrentPlanFeatures">
                        {{ $t('viewFeatures') }}
                    </BaseButton>
                    <BaseButton variant="danger" size="small" left-icon="bi bi-exclamation-triangle-fill"
                        @click="confirmCancelSubscription">
                        {{ $t('cancelSubscription') }}
                    </BaseButton>
                </div>
            </template>
        </BasePanel>

        <!-- Plans Section -->
        <BasePanel class="plans-section" :elevation="'level1'">
            <template #header>
                <h2>{{ $t('subscriptionPlans') }}</h2>
            </template>

            <div class="plans-grid">
                <BaseCard v-for="plan in availablePlans" :key="plan.id" class="plan-card"
                    :variant="plan.id === 0 ? 'default' : 'success'" interactive hover>
                    <template #header>
                        <div class="plan-header">
                            <h4>{{ plan.name }}</h4>
                            <div class="plan-price-header">
                                <span class="price">${{ plan.price }}</span>
                                <span class="period">/{{ $t('month') }}</span>
                            </div>
                        </div>
                    </template>

                    <div class="plan-features">
                        <h5>{{ $t('features') }}:</h5>
                        <ul class="features-list">
                            <li v-for="feature in featureOptions" :key="feature.id"
                                :class="{ 'feature-disabled': !plan.features[feature.id] && plan.id !== 0 }">
                                <i v-if="plan.features[feature.id] || (Array.isArray(plan.features) && plan.features.includes(feature.id))"
                                    class="bi bi-check feature-enabled"></i>
                                <i v-else class="bi bi-x feature-disabled-icon"></i>
                                <span>{{ feature.name }}</span>
                            </li>
                        </ul>
                    </div>

                    <template #footer>
                        <BaseButton variant="primary" size="large" :disabled="isCurrentPlan(plan)"
                            @click="subscribeToPlan(plan)" class="subscribe-button">
                            {{ currentSubscription ? $t('switch') : $t('subscribe') }}
                        </BaseButton>
                    </template>
                </BaseCard>
            </div>
        </BasePanel>

        <!-- Payment Form -->
        <BasePanel v-if="isPaying" class="payment-panel" :elevation="'level2'">
            <template #header>
                <div class="payment-header">
                    <h4>{{ $t('paymentInformation') }}</h4>
                    <p class="security-message">
                        <i class="bi bi-shield-lock"></i>
                        {{ $t('securePaymentMessage') }}
                    </p>
                </div>
            </template>

            <div class="payment-content">
                <div v-if="paymentError" class="payment-error">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    {{ paymentError }}
                </div>
                <div id="card-element" class="stripe-card-element"></div>

                <div class="payment-actions">
                    <BaseButton variant="primary" size="large" :disabled="isProcessingPayment"
                        @click="confirmSubscription" class="pay-button">
                        <template v-if="isProcessingPayment">
                            <i class="bi bi-hourglass-split"></i>
                            {{ $t('pleaseWait') }}
                        </template>
                        <template v-else>
                            {{ $t('pay') }}
                        </template>
                    </BaseButton>
                </div>
            </div>
        </BasePanel>

        <!-- Current Plan Features Modal -->
        <BaseModal :visible="showFeaturesModal" :title="$t('currentPlanFeatures')" size="large"
            @close="closeFeaturesModal">
            <div v-if="currentSubscription" class="current-plan-features">
                <div class="plan-header-modal">
                    <h4>{{ JSON.parse(currentSubscription.planData).name }}</h4>
                    <div class="plan-price-modal">
                        <span class="price">${{ JSON.parse(currentSubscription.planData).price }}</span>
                        <span class="period">/{{ $t('month') }}</span>
                    </div>
                </div>

                <div class="features-section">
                    <h5>{{ $t('includedFeatures') }}:</h5>
                    <ul class="features-list-modal">
                        <li v-for="feature in featureOptions" :key="feature.id"
                            :class="{ 'feature-disabled': !getCurrentPlanFeature(feature.id) }">
                            <i v-if="getCurrentPlanFeature(feature.id)" class="bi bi-check feature-enabled"></i>
                            <i v-else class="bi bi-x feature-disabled-icon"></i>
                            <span>{{ feature.name }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <template #footer>
                <BaseButton variant="secondary" @click="closeFeaturesModal">
                    {{ $t('close') }}
                </BaseButton>
            </template>
        </BaseModal>

        <!-- Cancel Subscription Confirmation Modal -->
        <BaseConfirmationModal :visible="showCancelModal" :title="$t('confirmCancelSubscription')"
            :show-danger-button="true" danger-text="Confirm Cancellation" danger-icon="bi bi-exclamation-triangle-fill"
            @confirm="cancelSubscription" @cancel="closeCancelModal" @close="closeCancelModal">
            <template #content>
                <p>{{ $t('cancelSubscriptionConfirmation') }}</p>
                <p class="text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    {{ $t('cancelSubscriptionWarning') }}
                </p>
            </template>
        </BaseConfirmationModal>
    </div>
</template>

<script setup>
import { ref, onMounted, inject, computed, onUnmounted, nextTick } from 'vue';
import SubscriptionPlansController from "@/controllers/subscription_plans/subscription_plans_controller";
// AuthController removed
import { loadStripe } from '@stripe/stripe-js';
import { BaseCard, BaseButton, BasePanel, StatusIndicator } from '@/components/ui';
import BaseModal from "@/components/ui/BaseModal.vue";
import BaseConfirmationModal from "@/components/ui/BaseConfirmationModal.vue";
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const stripe = ref(null);
const elements = ref(null);
const cardElement = ref(null);
const paymentError = ref(null);
const isProcessingPayment = ref(false);

const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

// State
const plans = ref([]);
const currentSubscription = ref(null);
const stripeSubscriptionData = ref(null);
const showSubscriptionModal = ref(false);
const selectedPlan = ref(null);
const isUserTrailExpired = ref(false);
const remainingDays = ref(0);
const expireDate = ref(null);
const showCancelModal = ref(false);
const showFeaturesModal = ref(false);

const isPaying = ref(false);

// Placeholder: List of all available features
const featureOptions = [
    // Core Features
    {
        id: 'free_surveys',
        name: 'Free Surveys',
        description: 'Number of free surveys included in the plan',
        category: 'Core',
        valueType: 'number',
        unit: 'surveys',
    },
    {
        id: 'storage_space',
        name: 'Storage Space',
        description: 'Available storage space for surveys and reports',
        category: 'Core',
        valueType: 'number',
        unit: 'GB',
    },
    {
        id: 'survey_scheduling',
        name: 'Survey Scheduling',
        description: 'Schedule and plan survey routes in advance',
        category: 'Core',
    },
    {
        id: 'route_optimization',
        name: 'Route Optimization',
        description: 'AI-powered route optimization for efficiency',
        category: 'Core',
    },
    {
        id: 'multi_user',
        name: 'Multi-User Access',
        description: 'Multiple user accounts with role-based permissions',
        category: 'Core',
    },
    {
        id: 'mobile_app',
        name: 'Mobile App Access',
        description: 'Native mobile app for field operations',
        category: 'Core',
    },
    // Data Management
    {
        id: 'image_timestamp',
        name: 'Image Timestamp & GPS',
        description: 'Automatic GPS tagging and timestamping',
        category: 'Data',
    },
    {
        id: 'export_options',
        name: 'Export Options (PDF, KML)',
        description: 'Export data in PDF and KML formats',
        category: 'Data',
    },
    {
        id: 'data_encryption',
        name: 'Data Encryption',
        description: 'Enterprise-grade data encryption and security',
        category: 'Data',
    },
    {
        id: 'backup_restore',
        name: 'Backup & Restore',
        description: 'Automated data backup and restore capabilities',
        category: 'Data',
    },
    {
        id: 'api_access',
        name: 'API Access',
        description: 'RESTful API access for custom integrations',
        category: 'Data',
    },
    // Reports & Templates
    {
        id: 'mobile_report_editing',
        name: 'Editing Reports (On Mobile)',
        description: 'Edit reports directly from mobile devices',
        category: 'Reports',
    },
    {
        id: 'local_mobile_reports',
        name: 'Generating Local Reports (On Mobile)',
        description: 'Generate reports locally on mobile devices',
        category: 'Reports',
    },
    {
        id: 'report_generation',
        name: 'Generating Reports',
        description: 'Create and generate comprehensive reports',
        category: 'Reports',
    },
    {
        id: 'custom_templates',
        name: 'Custom Templates',
        description: 'Create and save custom report templates',
        category: 'Templates',
    },
    {
        id: 'template_library',
        name: 'Template Library',
        description: 'Access to pre-built template library',
        category: 'Templates',
    },
    // Customization
    {
        id: 'theme_modes',
        name: 'Dark/Light Modes',
        description: 'Switch between dark and light themes',
        category: 'Customization',
    },
    {
        id: 'languages',
        name: 'Languages',
        description: 'Multiple language support',
        category: 'Customization',
        valueType: 'number',
        unit: 'languages',
    },
    {
        id: 'whitelabel',
        name: 'Whitelabel Portal',
        description: 'Custom branding and white-label options',
        category: 'Customization',
    },
    {
        id: 'custom_fields',
        name: 'Custom Fields',
        description: 'Add custom data fields and attributes',
        category: 'Customization',
    },
    {
        id: 'template_builder',
        name: 'Template Builder',
        description: 'Create and save custom templates',
        category: 'Customization',
    },
    // Support
    {
        id: 'priority_support',
        name: 'Priority Support',
        description: '24/7 priority customer support',
        category: 'Support',
    },
    {
        id: 'training_resources',
        name: 'Training Resources',
        description: 'Access to training materials and webinars',
        category: 'Support',
    },
    {
        id: 'dedicated_manager',
        name: 'Dedicated Account Manager',
        description: 'Personal account manager for enterprise clients',
        category: 'Support',
    },
];

// Free plan is fixed
const freePlan = ref({
    id: 0,
    name: 'Core',
    price: 29,
    yearlyPrice: 300,
    billing: 'monthly',
    features: {
        free_surveys: true,
        storage_space: true,
        manual_routes: true,
        survey_scheduling: true,
        route_optimization: false,
        multi_user: false,
        mobile_app: false,
        image_timestamp: true,
        export_options: false,
        data_encryption: false,
        backup_restore: false,
        api_access: false,
        mobile_report_editing: true,
        local_mobile_reports: true,
        report_generation: true,
        custom_templates: false,
        template_library: false,
        theme_modes: true,
        languages: true,
        whitelabel: false,
        custom_fields: false,
        template_builder: false,
        priority_support: false,
        training_resources: false,
        dedicated_manager: false,
    },
});

// Load plans
const loadPlans = async () => {
    try {
        const res = await SubscriptionPlansController.getSubscriptionPlans();
        if (res.result) {
            plans.value = [
                freePlan.value,
                ...res.data.map(plan => ({
                    ...plan,
                    features: JSON.parse(plan.features)
                }))];

            // console.log(plans.value);
        }
    } catch (error) {
        console.error(error);
        showMessage({ status: 'error', message: error.message });
    }
};

// Load current subscription
const loadCurrentSubscription = async () => {
    try {
        // Fetch current subscription from API
        const res = await SubscriptionPlansController.getActiveSubscription();
        // console.log(res);
        if (res.result) {
            currentSubscription.value = res.data;
            if (res.stripeData) {
                if (res.stripeData.result) {
                    stripeSubscriptionData.value = res.stripeData;
                    if (res.stripeData.status === "canceled") {
                        isUserTrailExpired.value = true;
                        currentSubscription.value = null;
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
        showMessage({ status: 'error', message: error.message });
    }
};

// Helper functions
const isCurrentPlan = (plan) => {
    // console.log(plan);
    if (isUserTrailExpired.value) {
        return false;
    }

    // console.log(currentSubscription.value);

    if (currentSubscription.value) {
        const planData = JSON.parse(currentSubscription.value.planData);
        // console.log(planData);
        return planData.id === plan.id;
    }

    return false;
};

const getStatusVariant = (status) => {
    const variants = {
        active: 'success',
        expired: 'danger',
        pending: 'warning'
    };
    return variants[status] || 'secondary';
};

const getStatusIndicatorType = (status) => {
    const statusMap = {
        active: 'verified',
        expired: 'blocked',
        pending: 'caution'
    };
    return statusMap[status] || 'caution';
};

const getStatusDescription = (status) => {
    const descriptions = {
        active: 'Subscription is active and working',
        expired: 'Subscription has expired',
        pending: 'Subscription is pending activation'
    };
    return descriptions[status] || 'Unknown status';
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const billingCycle = computed(() => {
    if (!stripeSubscriptionData.value || !stripeSubscriptionData.value.startDate || !stripeSubscriptionData.value.currentPeriodEnd) {
        return null;
    }
    const startDate = new Date(stripeSubscriptionData.value.startDate);
    const endDate = new Date(stripeSubscriptionData.value.currentPeriodEnd);
    return {
        start: startDate.toLocaleDateString(),
        end: endDate.toLocaleDateString()
    };
});

// Subscription handling
const subscribeToPlan = async (plan) => {
    selectedPlan.value = plan;
    showSubscriptionModal.value = true;
    // Wait for modal to be visible before initializing Stripe
    await nextTick();
    // await initializeStripe();
    await createPaymentIntent();
};

const closeSubscriptionModal = () => {
    showSubscriptionModal.value = false;
    paymentError.value = null;
    if (cardElement.value) {
        cardElement.value.unmount();
        cardElement.value = null;
    }
};

const createPaymentIntent = async () => {
    if (!selectedPlan.value) return;

    isProcessingPayment.value = true;
    isPaying.value = true;
    paymentError.value = null;

    try {
        await new Promise(resolve => setTimeout(resolve, 300));


        // Initialize Stripe if not already initialized
        if (!stripe.value) {
            await initializeStripe();
        }

        // Create payment intent on the server
        // const res = await SubscriptionPlansController.createPaymentIntent({
        //     planId: selectedPlan.value.id,
        //     amount: selectedPlan.value.price * 100, // Convert to cents
        //     currency: 'usd'
        // });

        // if (!res.result) {
        //     throw new Error(res.message || 'Failed to create payment intent');
        // }

        // // Confirm the payment with Stripe
        // const { error, paymentIntent } = await stripe.value.confirmCardPayment(
        //     res.data.clientSecret,
        //     {
        //         payment_method: {
        //             card: cardElement.value,
        //             billing_details: {
        //                 // Add billing details if needed
        //             }
        //         }
        //     }
        // );

        // if (error) {
        //     throw new Error(error.message);
        // }

        // if (paymentIntent.status === 'succeeded') {
        //     // Proceed with subscription
        //     await confirmSubscription();
        // } else {
        //     throw new Error('Payment failed. Please try again.');
        // }
    } catch (error) {
        console.error('Payment error:', error);
        paymentError.value = error.message || 'An error occurred during payment processing';
    } finally {
        isProcessingPayment.value = false;
    }
};

// const onSubscribe = async () => {
//     if (!selectedPlan.value) return;
//     // await createPaymentIntent();
// };

const confirmSubscription = async () => {
    if (!selectedPlan.value) return;

    setGlobalLoading(true);

    try {


        // 1. Create payment method
        const { paymentMethod, error } = await stripe.value.createPaymentMethod({
            type: 'card',
            card: cardElement.value,
        });

        // console.log(paymentMethod);
        // console.log(error);

        const res = await SubscriptionPlansController.createSubscription({
            SubscriptionPlanId: selectedPlan.value.id,
            PlanName: selectedPlan.value.name,
            CorePlanData: JSON.stringify(selectedPlan.value.id === 0 ? freePlan.value : selectedPlan.value),
            PaymentMethodId: paymentMethod.id,
        });
        console.log(res);
        if (res.result) {
            showMessage({ status: 'success', message: res.message });
            // await loadCurrentSubscription();
            window.location.reload();
        }
        else {
            showMessage({ status: 'error', message: res.message });
        }
    } catch (error) {
        console.log(error);
    }

    setGlobalLoading(false);


};

const cancelSubscription = async () => {
    setGlobalLoading(true);
    try {
        // const res = await SubscriptionPlansController.unsubscribeFromPlan();
        const res = await SubscriptionPlansController.cancelSubscription();
        if (res.result) {
            showMessage({ status: 'success', message: res.message });
            // await Promise.all([
            //     checkUserTrailExpired(),
            //     loadPlans(),
            //     loadCurrentSubscription(),
            // ]);
            window.location.reload();
        } else {
            showMessage({ status: 'error', message: res.message });
        }
    } catch (error) {
        console.error(error);
        showMessage({ status: 'error', message: error.message });
    } finally {
        setGlobalLoading(false);
        showCancelModal.value = false;
    }
};

const checkUserTrailExpired = async () => {
    const res = await authStore.checkUserTrailExpired();
    // console.log(res);
    if (res.result) {
        isUserTrailExpired.value = res.data;
        remainingDays.value = res.remainingDays;
        expireDate.value = res.expireDate;
    }
};

const showOtherPlans = () => {
    setTimeout(() => {
        const plansSection = document.querySelector('.subscription-plans');
        if (plansSection) {
            plansSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, 100);
};

const confirmCancelSubscription = () => {
    showCancelModal.value = true;
};

const closeCancelModal = () => {
    showCancelModal.value = false;
};

const showCurrentPlanFeatures = () => {
    showFeaturesModal.value = true;
};

const closeFeaturesModal = () => {
    showFeaturesModal.value = false;
};

const getCurrentPlanFeature = (featureId) => {
    if (!currentSubscription.value) return false;

    const planData = JSON.parse(currentSubscription.value.planData);
    const features = planData.features;

    // Handle both object and array formats
    if (features[featureId] || (Array.isArray(features) && features.includes(featureId))) {
        return true;
    }
    return false;
};

// Add this computed property
const availablePlans = computed(() => {
    if (!currentSubscription.value) {
        return plans.value;
    }

    const currentPlanId = JSON.parse(currentSubscription.value.planData).id;
    return plans.value.filter(plan => plan.id !== currentPlanId);
});

const initializeStripe = async () => {
    try {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
            throw new Error('Stripe publishable key is not configured');
        }

        stripe.value = await loadStripe(publishableKey);
        if (!stripe.value) {
            throw new Error('Failed to initialize Stripe');
        }

        // Get current theme
        const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        const themeColors = isDarkTheme ? {
            colorPrimary: '#0d6efd',
            colorBackground: '#212529',
            colorText: '#e9ecef',
            colorDanger: 'var(--error)',
            colorSuccess: '#198754',
            colorBorder: 'rgba(255, 255, 255, 0.1)',
            colorPlaceholder: '#6c757d'
        } : {
            colorPrimary: '#0d6efd',
            colorBackground: '#ffffff',
            colorText: '#212529',
            colorDanger: 'var(--error)',
            colorSuccess: '#198754',
            colorBorder: '#dee2e6',
            colorPlaceholder: '#6c757d'
        };

        elements.value = stripe.value.elements({
            appearance: {
                theme: 'stripe',
                variables: {
                    ...themeColors,
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px'
                }
            },
            paymentMethodCreation: 'manual',
            locale: 'auto'
        });

        // Unmount existing card element if it exists
        if (cardElement.value) {
            cardElement.value.unmount();
        }

        cardElement.value = elements.value.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: themeColors.colorText,
                    '::placeholder': {
                        color: themeColors.colorPlaceholder
                    },
                    backgroundColor: 'transparent'
                },
                invalid: {
                    color: themeColors.colorDanger
                }
            },
            hidePostalCode: true,
            disableMobile: false
        });

        // Wait for the card element container to be in the DOM
        await nextTick();
        const cardContainer = document.getElementById('card-element');
        if (!cardContainer) {
            throw new Error('Card element container not found');
        }

        // Add passive event listeners
        cardContainer.addEventListener('touchstart', () => { }, { passive: true });
        cardContainer.addEventListener('touchmove', () => { }, { passive: true });
        cardContainer.addEventListener('wheel', () => { }, { passive: true });

        cardElement.value.mount('#card-element');

        // Handle card element errors
        cardElement.value.on('change', (event) => {
            if (event.error) {
                paymentError.value = event.error.message;
            } else {
                paymentError.value = null;
            }
        });

        // Scroll to the card container
        cardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
        console.error('Stripe initialization error:', error);
        paymentError.value = error.message || 'Failed to initialize payment system';
        throw error;
    }
};

// Initialize
onMounted(async () => {
    setGlobalLoading(true);
    try {
        await Promise.all([
            checkUserTrailExpired(),
            loadPlans(),
            loadCurrentSubscription(),
        ]);
    } catch (error) {
        console.error(error);
    } finally {
        setGlobalLoading(false);
    }
});

// Clean up Stripe elements when component is unmounted
onUnmounted(() => {
    if (cardElement.value) {
        cardElement.value.unmount();
    }
});
</script>

<style scoped>
.user-subscription {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Status Panel Styles - Compact */
.status-panel {
    margin-bottom: 0.1rem;
}

.status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.25rem;
    padding: 0;
    margin: 0;
}

.status-title {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.status-title h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;
}

.status-title i {
    font-size: 0.875rem;
    color: var(--accent);
}

.subscription-info,
.trial-info {
    margin-top: 0.1rem;
}

.subscription-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.subscription-text,
.trial-text {
    font-size: 0.875rem;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.plan-info-compact {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    background: var(--bg-elevated);
    border-radius: 6px;
}

.plan-name-compact h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.25rem;
}

.plan-price-compact {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
}

.plan-price-compact .price {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--accent);
}

.plan-price-compact .period {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.expire-date,
.remaining-days,
.billing-cycle {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.625rem;
    background: var(--bg-elevated);
    border-radius: 6px;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

.expire-date i,
.remaining-days i,
.billing-cycle i {
    color: var(--accent);
    font-size: 0.875rem;
}

.subscription-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

/* Current Plan Features Modal */
.current-plan-features {
    padding: 1rem 0;
}

.plan-header-modal {
    text-align: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
}

.plan-header-modal h4 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.plan-price-modal {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
}

.plan-price-modal .price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
}

.plan-price-modal .period {
    font-size: 1rem;
    color: var(--text-secondary);
}

.features-section {
    margin-top: 1rem;
}

.features-section h5 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
}

.features-list-modal {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 400px;
    overflow-y: auto;
}

.features-list-modal li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--border);
    transition: all 0.2s ease;
}

.features-list-modal li:last-child {
    border-bottom: none;
}

.features-list-modal li:hover {
    background: var(--bg-elevated);
}

.features-list-modal .feature-enabled {
    color: var(--success);
    font-size: 1rem;
}

.features-list-modal .feature-disabled-icon {
    color: var(--error);
    font-size: 1rem;
}

.features-list-modal .feature-disabled {
    opacity: 0.6;
}

.features-list-modal span {
    font-size: 0.875rem;
    color: var(--text-primary);
}

/* Plans Section - Compact */
.plans-section {
    margin-bottom: 1rem;
}

.plans-section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.plan-card {
    min-height: 320px;
}

.plan-header {
    text-align: center;
    padding: 0.75rem 0;
}

.plan-header h4 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.plan-price-header {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.25rem;
}

.plan-price-header .price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent);
}

.plan-price-header .period {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.plan-features {
    padding: 0.75rem 0;
}

.plan-features h5 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
}

.features-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.features-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
    font-size: 0.8125rem;
    transition: all 0.2s ease;
}

.features-list li:hover {
    transform: translateX(3px);
}

.feature-enabled {
    color: var(--success);
    font-size: 0.875rem;
}

.feature-disabled-icon {
    color: var(--error);
    font-size: 0.875rem;
}

.feature-disabled {
    opacity: 0.6;
}

.subscribe-button {
    width: 100%;
}

/* Payment Panel */
.payment-panel {
    margin-top: 2rem;
}

.payment-header {
    text-align: center;
}

.payment-header h4 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.security-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}

.security-message i {
    color: var(--success);
}

.payment-content {
    padding: 1.5rem 0;
}

.payment-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgb(232 62 140 / 10%);
    border: 1px solid var(--error);
    border-radius: 8px;
    color: var(--error);
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.stripe-card-element {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-surface);
    min-height: 40px;
    margin-bottom: 1.5rem;
}

.payment-actions {
    display: flex;
    justify-content: center;
}

.pay-button {
    width: 100%;
    max-width: 300px;
}

/* Responsive adjustments */
@media (width <=768px) {
    .user-subscription {
        padding: 1rem;
        gap: 1.5rem;
    }

    .status-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .plan-dates {
        flex-direction: column;
        gap: 1rem;
    }

    .plans-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .plan-card {
        min-height: auto;
    }

    .subscription-actions {
        flex-direction: column;
    }
}
</style>
