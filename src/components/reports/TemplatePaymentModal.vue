<template>
    <div v-if="visible" class="payment-modal-overlay" @click="$emit('close')">
        <BasePanel :title="$t('purchaseTemplate')" elevation="level3" class="payment-modal" @click.stop>
            <template #actions-view>
                <BaseButton variant="ghost" size="small" right-icon="bi bi-x-lg" @click="$emit('close')" />
            </template>

            <div class="payment-modal-body">
                <BaseCard class="template-summary">
                    <template #header>
                        <div class="template-preview">
                            <img v-if="template?.media && template.media.length > 0" :src="template.media[0]"
                                :alt="template?.name" />
                            <div v-else class="template-placeholder">
                                <i class="bi bi-file-earmark-text"></i>
                            </div>
                        </div>
                    </template>

                    <div class="template-details">
                        <h5>{{ template?.name }}</h5>
                        <p>{{ template?.description }}</p>
                        <div class="template-price-display" v-if="template?.price">
                            <span class="price">{{ template.price }}</span>
                        </div>
                    </div>
                </BaseCard>

                <BasePanel :title="$t('paymentInformation')" elevation="level1" class="payment-form-panel">
                    <template #header>
                        <div class="secure-payment">
                            <i class="bi bi-shield-lock"></i>
                            {{ $t('securePaymentMessage') }}
                        </div>
                    </template>

                    <div v-if="paymentError" class="alert alert-danger">
                        {{ paymentError }}
                    </div>

                    <div id="card-element" class="stripe-card-element"></div>

                    <div class="payment-status" v-if="isCardComplete && !paymentError">
                        <i class="bi bi-check-circle-fill text-success"></i>
                        <span class="text-success">{{ $t('cardComplete') }}</span>
                    </div>

                    <div class="payment-status" v-else-if="!isCardComplete && !paymentError">
                        <i class="bi bi-info-circle text-info"></i>
                        <span class="text-info">{{ $t('completeCardInfo') }}</span>
                    </div>

                    <template #footer>
                        <div class="payment-actions">
                            <BaseButton variant="secondary" size="medium" @click="$emit('close')"
                                :disabled="isProcessingPayment">
                                {{ $t('cancel') }}
                            </BaseButton>
                            <BaseButton variant="primary" size="medium"
                                :left-icon="isProcessingPayment ? null : 'bi bi-credit-card'"
                                @click="processPayment" :disabled="!isPaymentFormValid">
                                <span v-if="isProcessingPayment">
                                    <BaseLoadingIndicator size="small" inline />
                                    {{ $t('processingPayment') }}
                                </span>
                                <span v-else>
                                    {{ $t('pay') }} {{ template?.price ? `$${template.price}` : '' }}
                                </span>
                            </BaseButton>
                        </div>
                    </template>
                </BasePanel>
            </div>
        </BasePanel>
    </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import SubscriptionPlansController from '@/controllers/subscription_plans/subscription_plans_controller';
import { loadStripe } from '@stripe/stripe-js';
import Cookies from 'js-cookie';
import { BaseCard, BasePanel, BaseButton, BaseLoadingIndicator } from '@/components/ui';

const props = defineProps({
    visible: Boolean,
    template: Object
});

const emit = defineEmits(['close', 'payment-success']);

const { t } = useI18n();
const showMessage = inject('showMessage');

const stripe = ref(null);
const elements = ref(null);
const cardElement = ref(null);
const paymentError = ref(null);
const isProcessingPayment = ref(false);
const isCardComplete = ref(false);

const isPaymentFormValid = computed(() => {
    return isCardComplete.value && !paymentError.value && !isProcessingPayment.value;
});

// Watch for visibility change to initialize/teardown Stripe
watch(() => props.visible, async (newVal) => {
    if (newVal) {
        if (!stripe.value) {
            await initializeStripe();
        } else {
            // Give DOM time to render before mounting card element
            await nextTick();
            await initializeCardElement();
        }
    } else {
        // Clean up card element when modal closes
        // if (cardElement.value) {
        //     cardElement.value.unmount();
        //     cardElement.value = null;
        // }
    }
});

const initializeStripe = async () => {
    try {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
            throw new Error('Stripe publishable key is not configured. Please contact support.');
        }

        stripe.value = await loadStripe(publishableKey);
        if (!stripe.value) {
            throw new Error('Failed to initialize Stripe payment system');
        }

        await initializeCardElement();
    } catch (error) {
        console.error('Stripe initialization error:', error);
        paymentError.value = error.message || 'Failed to initialize payment system';
        showMessage({ status: 'error', message: error.message });
    }
};

const initializeCardElement = async () => {
    try {
        // Get current theme
        const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        const themeColors = isDarkTheme ? {
            colorPrimary: 'var(--accent)',
            colorBackground: '#212529',
            colorText: '#e9ecef',
            colorDanger: 'var(--error)',
            colorSuccess: '#198754',
            colorBorder: 'rgba(255, 255, 255, 0.1)',
            colorPlaceholder: '#6c757d'
        } : {
            colorPrimary: 'var(--accent)',
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

        // Unmount existing if needed
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

        await nextTick();
        const cardContainer = document.getElementById('card-element');
        if (!cardContainer) {
            // Retrying once if not found immediately (sometimes DOM update lag)
            await new Promise(r => setTimeout(r, 100));
            if (!document.getElementById('card-element'))
                throw new Error('Card element container not found');
        }

        cardElement.value.mount('#card-element');

        cardElement.value.on('change', (event) => {
            if (event.error) {
                paymentError.value = event.error.message;
                isCardComplete.value = false;
            } else {
                paymentError.value = null;
                isCardComplete.value = event.complete;
            }
        });
    } catch (error) {
        console.error('Card element initialization error:', error);
        paymentError.value = error.message || 'Failed to initialize payment form';
    }
};

const createPaymentIntent = async () => {
    if (!props.template) return null;

    try {
        const res = await SubscriptionPlansController.createPaymentIntent({
            TemplateId: props.template.id,
            Amount: props.template.price * 100, // Convert to cents
            Currency: 'usd',
            Description: `Template: ${props.template.id}-${props.template.name}, User: ${Cookies.get('login_user_id')}`
        });

        if (res.result) {
            return res.clientSecret;
        } else {
            showMessage({ status: 'error', message: res.message });
            return null;
        }
    } catch (error) {
        console.error('Payment intent creation error:', error);
        showMessage({ status: 'error', message: error.message });
        return null;
    }
};

const processPayment = async () => {
    if (!props.template || !stripe.value || !cardElement.value) {
        paymentError.value = 'Payment system not initialized';
        return;
    }

    isProcessingPayment.value = true;
    paymentError.value = null;

    try {
        const clientSecret = await createPaymentIntent();
        if (!clientSecret) {
            showMessage({ status: 'error', message: t('paymentFailed') });
            return;
        }

        const { paymentMethod, error: paymentMethodError } = await stripe.value.createPaymentMethod({
            type: 'card',
            card: cardElement.value,
        });

        if (paymentMethodError) {
            showMessage({ status: 'error', message: paymentMethodError.message });
            return;
        }

        const { error: confirmError, paymentIntent } = await stripe.value.confirmCardPayment(
            clientSecret,
            {
                payment_method: paymentMethod.id
            }
        );

        if (confirmError) {
            showMessage({ status: 'error', message: confirmError.message });
            return;
        }

        if (paymentIntent.status === 'succeeded') {
            // Emit success with data needed to finalize adding template
             emit('payment-success', {
                 template: props.template,
                 paymentIntentId: paymentIntent.id,
                 paymentMethodId: paymentMethod.id
             });
        } else {
            showMessage({ status: 'error', message: t('paymentFailed') });
        }
    } catch (error) {
        console.error('Payment processing error:', error);
        paymentError.value = error.message || 'An error occurred during payment processing';
    } finally {
        isProcessingPayment.value = false;
    }
};

onUnmounted(() => {
    if (cardElement.value) {
        try {
            cardElement.value.unmount();
        } catch (e) {
            // ignore
        }
    }
});
</script>

<style scoped>
.payment-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    backdrop-filter: blur(5px);
}

.payment-modal {
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
}

.payment-modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
}

.template-summary {
    margin-bottom: 1.5rem;
}

.template-preview {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.template-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.template-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated);
    color: var(--text-secondary);
}

.template-placeholder i {
    font-size: 2rem;
}

.template-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.template-details h5 {
    margin: 0 0 0.5rem;
    font-weight: 600;
    color: var(--text-primary);
}

.template-details p {
    margin: 0 0 0.5rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.template-price-display {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.template-price-display .price {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--accent);
}

.payment-form-panel {
    margin-top: 1rem;
}

.secure-payment {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.secure-payment i {
    color: var(--accent);
}

.stripe-card-element {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-surface);
    min-height: 40px;
    transition: all 0.2s;
}

.stripe-card-element:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgb(0 167 225 / 10%);
}

.payment-status {
    text-align: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: rgb(255 255 255 / 10%);
}

.payment-status i {
    font-size: 1.5rem;
    margin-right: 0.5rem;
}

.payment-status .text-success {
    font-size: 1rem;
    font-weight: 600;
    color: var(--success);
}

.payment-status .text-info {
    font-size: 1rem;
    font-weight: 500;
    color: var(--accent);
}

.payment-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
}

.alert {
    border-radius: 8px;
    margin-bottom: 1rem;
}

@media (width <= 768px) {
    .payment-modal {
        width: 95%;
        margin: 1rem;
    }
}
</style>
