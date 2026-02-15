import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const CURRENT_ONBOARDING_VERSION = 1;

export const useOnboardingStore = defineStore('onboarding', () => {
    const authStore = useAuthStore();

    // State
    const currentStep = ref(0);
    const isVisible = ref(false);
    const dismissedTips = ref(new Set());

    // Actions
    const init = () => {
        // Check if user has completed onboarding

        // 1. Server check
        if (authStore.user?.onboarding_completed_at) {
            // Check if we have a new version for them? 
            // For now, if server says done, we assume done unless we want to force a version upgrade.
            // But the prompt says "or local onboarding_version is older than current version"

            const localVersion = parseInt(localStorage.getItem('rs_onboarding_version') || '0');
            if (localVersion < CURRENT_ONBOARDING_VERSION) {
                startOnboarding();
            }
            return;
        }

        // 2. Local check (fallback if server value is missing or for guest/demo behavior if applicable)
        const localCompleted = localStorage.getItem('rs_onboarding_completed') === 'true';
        const localVersion = parseInt(localStorage.getItem('rs_onboarding_version') || '0');

        if (!localCompleted || localVersion < CURRENT_ONBOARDING_VERSION) {
            startOnboarding();
        }
    };

    const startOnboarding = () => {
        currentStep.value = 0;
        isVisible.value = true;
    };

    const nextStep = () => {
        currentStep.value++;
    };

    const prevStep = () => {
        if (currentStep.value > 0) currentStep.value--;
    };

    const skip = () => {
        completeOnboarding();
    };

    const completeOnboarding = async () => {
        isVisible.value = false;

        // Persist local
        localStorage.setItem('rs_onboarding_completed', 'true');
        localStorage.setItem('rs_onboarding_version', CURRENT_ONBOARDING_VERSION.toString());

        // Persist server
        if (authStore.user) {
            try {
                // We use the existing auth store action
                await authStore.completeOnboarding({
                    version: CURRENT_ONBOARDING_VERSION,
                    // Send default preferences if this is the first run?
                    // The auth store 'completeOnboarding' expects a data object.
                    // We'll just send basic metadata for now.
                    meta: { type: 'quick-tour' }
                });
            } catch (err) {
                console.warn('Failed to persist onboarding to server:', err);
            }
        }
    };

    // Tips System
    const isTipDismissed = (tipId) => {
        if (dismissedTips.value.has(tipId)) return true;
        return localStorage.getItem(`rs_tip_dismissed::${tipId}`) === 'true';
    };

    const dismissTip = (tipId) => {
        dismissedTips.value.add(tipId);
        localStorage.setItem(`rs_tip_dismissed::${tipId}`, 'true');
    };

    return {
        currentStep,
        isVisible,
        init,
        nextStep,
        prevStep,
        skip,
        completeOnboarding,
        isTipDismissed,
        dismissTip
    };
});
