<template>
    <div v-if="showWarning" class="mfa-warning-banner">
        <div class="warning-content">
            <div class="warning-icon">
                <PhShieldWarning :size="24" />
            </div>
            <div class="warning-text">
                <h4>Enhance Your Account Security</h4>
                <p>Enable two-factor authentication to protect your account from unauthorized access.</p>
            </div>
            <div class="warning-actions">
                <button @click="setupMfa" class="setup-btn">
                    <PhShield :size="16" />
                    Setup MFA
                </button>
                <button @click="dismissWarning" class="dismiss-btn">
                    <PhX :size="16" />
                    Dismiss
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PhShieldWarning, PhShield, PhX } from '@phosphor-icons/vue';
import Cookies from 'js-cookie'
import mfa_controller from '../controllers/auth/mfa_controller'
import { isMfaWarningDismissed, onMfaStatusChange } from '../utils/mfa-utils'

const router = useRouter()
const route = useRoute()
const showWarning = ref(false)

// Emit banner visibility to parent
const emit = defineEmits(['banner-visibility'])

// Listen for MFA status changes
let unsubscribeMfaEvents = null

onMounted(async () => {
    await checkMfaStatus()

    // Subscribe to MFA status changes
    unsubscribeMfaEvents = onMfaStatusChange((enabled) => {
        if (!enabled && !isMfaWarningDismissed()) {
            showWarning.value = true
        } else {
            showWarning.value = false
        }
    })
})

onUnmounted(() => {
    if (unsubscribeMfaEvents) {
        unsubscribeMfaEvents()
    }
})

// Watch for changes in showWarning and emit to parent
watch(showWarning, (visible) => {
    emit('banner-visibility', visible)
})

// Watch for route changes to re-check MFA status
watch(() => route.path, async () => {
    // Only check if we're on a main app route (not login, setup, etc.)
    if (!route.path.includes('/login') && !route.path.includes('/mfa-')) {
        await checkMfaStatus()
    }
})

const checkMfaStatus = async () => {
    try {
        const userId = Cookies.get('login_user_id')
        if (userId) {
            const res = await mfa_controller.getMfaStatus(userId)
            if (res.result && !res.isEnabled) {
                // Check if user has dismissed the warning
                if (!isMfaWarningDismissed()) {
                    showWarning.value = true
                } else {
                    showWarning.value = false
                }
            } else {
                showWarning.value = false
            }
        } else {
            showWarning.value = false
        }
    } catch (error) {
        console.error('Failed to check MFA status:', error)
        showWarning.value = false
    }
}

const setupMfa = () => {
    router.push('/mfa-setup')
}

const dismissWarning = () => {
    showWarning.value = false
    // localStorage.setItem('mfa_warning_dismissed', 'true')
}

// Expose refresh method for external use
defineExpose({
    refresh: checkMfaStatus
})
</script>

<style scoped>
.mfa-warning-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    border-top: 2px solid #f39c12;
    z-index: 1050;
    animation: slideUp 0.5s ease-out;
    box-shadow: 0 -4px 20px rgb(243 156 18 / 20%);
}

.warning-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.warning-icon {
    font-size: 1.5rem;
    color: #f39c12;
    flex-shrink: 0;
}

.warning-text {
    flex: 1;
}

.warning-text h4 {
    margin: 0 0 0.25rem;
    color: #856404;
    font-size: 1rem;
    font-weight: 600;
}

.warning-text p {
    margin: 0;
    color: #856404;
    font-size: 0.875rem;
    opacity: 0.9;
}

.warning-actions {
    display: flex;
    gap: 0.75rem;
    flex-shrink: 0;
}

.setup-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f39c12;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.setup-btn:hover {
    background: #e67e22;
    transform: translateY(-1px);
}

.dismiss-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: transparent;
    color: #856404;
    border: 1px solid #f39c12;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dismiss-btn:hover {
    background: rgb(243 156 18 / 10%);
    color: #856404;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@media (width <= 768px) {
    .warning-content {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
    }

    .warning-actions {
        width: 100%;
        justify-content: center;
    }

    .setup-btn,
    .dismiss-btn {
        flex: 1;
        justify-content: center;
    }
}

@media (width <= 480px) {
    .warning-content {
        padding: 0.75rem 1rem;
    }

    .warning-text h4 {
        font-size: 0.9rem;
    }

    .warning-text p {
        font-size: 0.8rem;
    }

    .setup-btn,
    .dismiss-btn {
        padding: 0.4rem 0.75rem;
        font-size: 0.8rem;
    }
}
</style>