<template>
    <div class="onboarding-widget mb-4">
        <div class="onboarding-content">
            <div class="onboarding-icon">
                <i class="bi bi-rocket-takeoff-fill"></i>
            </div>
            <div class="onboarding-text">
                <h3>Welcome to RouteSurvey!</h3>
                <p>New here? Check out our <strong>Quick Start Guide</strong> to master the basics in 5 minutes.</p>
            </div>
            <div class="onboarding-actions">
                <BaseButton variant="primary" @click="navigateToGuide">
                    Get Started
                </BaseButton>
                <button class="dismiss-btn" @click="$emit('dismiss')">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { BaseButton } from '@/components/ui';

const router = useRouter()
const emit = defineEmits(['dismiss'])

const navigateToGuide = () => {
    router.push('/help-center/quick-start')
}
</script>

<style scoped>
.onboarding-widget {
    background: linear-gradient(135deg, #e0faff 0%, #fff 100%);
    border: 1px solid #bce3eb;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgb(0 167 225 / 10%);
}

.onboarding-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

.onboarding-icon {
    width: 60px;
    height: 60px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    font-size: 1.75rem;
    box-shadow: 0 4px 10px rgb(0 0 0 / 5%);
}

.onboarding-text {
    flex: 1;
}

.onboarding-text h3 {
    margin: 0 0 0.25rem;
    font-size: 1.25rem;
    color: var(--text-primary);
}

.onboarding-text p {
    margin: 0;
    color: var(--text-secondary);
}

.onboarding-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.dismiss-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.2s;
}

.dismiss-btn:hover {
    color: var(--text-primary);
}

@media (width <= 768px) {
    .onboarding-content {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
    }
    
    .onboarding-actions {
        width: 100%;
        justify-content: space-between;
        margin-top: 1rem;
    }
}
</style>
