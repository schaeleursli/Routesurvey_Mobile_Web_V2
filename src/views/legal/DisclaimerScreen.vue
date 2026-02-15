<template>
    <AuthShell>
        <AuthCard>
            <template #title>Important disclaimer</template>
            <template #subtitle>
                Please review and accept the following information to proceed.
            </template>

            <div class="disclaimer-content">
                <div class="scroll-box">
                    <p>This application supports route planning, survey capture, reporting, and sharing. It does not replace engineering judgement, regulatory compliance, permit requirements, or safe operational procedures.</p>
                    <p>Route and site conditions can change without notice. Measurements and outputs depend on device sensors, user input, and third-party data. Always verify critical information in the field.</p>
                    <p>Do not operate this application while driving. Use a passenger/operator when capturing photos or entering data.</p>
                    <p>You are responsible for obtaining permissions, complying with laws and safety rules, and ensuring you have rights to capture and share photos, locations, and documents.</p>
                    <p>The app is provided “as is” without warranties. To the maximum extent permitted by law, the provider is not liable for damages resulting from use or reliance on app outputs.</p>
                </div>

                <div class="acceptance-area">
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="accepted">
                        <span>I have read and accept the Terms, Privacy Policy and Disclaimer.</span>
                    </label>
                </div>

                <BaseButton 
                    :disabled="!accepted" 
                    @click="handleAccept" 
                    class="w-100 mt-3" 
                    size="large"
                >
                    Accept & continue
                </BaseButton>
            </div>
        </AuthCard>
    </AuthShell>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AuthShell from '@/components/auth/AuthShell.vue';
import AuthCard from '@/components/auth/AuthCard.vue';
import { BaseButton } from '@/components/ui';

const router = useRouter();
const authStore = useAuthStore();
const accepted = ref(false);

const handleAccept = async () => {
    if (accepted.value) {
        authStore.acceptDisclaimer();
        router.push({ name: 'Dashboard' });
    }
};
</script>

<style scoped>
.disclaimer-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.scroll-box {
    background: rgb(0 0 0 / 4%);
    border-radius: 12px;
    padding: 1rem;
    max-height: 300px;
    overflow-y: auto;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--text-secondary);
    border: 1px solid var(--border);
}

.scroll-box p {
    margin-bottom: 1rem;
}

.scroll-box p:last-child {
    margin-bottom: 0;
}

.checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    cursor: pointer;
    font-size: 0.95rem;
    color: var(--text-primary);
    user-select: none;
}

.checkbox-label input {
    margin-top: 0.25rem;
    width: 18px;
    height: 18px;
    accent-color: var(--primary);
}

.w-100 {
    width: 100%;
}

.mt-3 {
    margin-top: 1rem;
}
</style>
