<template>
    <AuthShell>
        <AuthCard>
            <template #title>{{ isForgotPassword ? $t('resetPassword') : 'Welcome back' }}</template>
            <template #subtitle>
                {{ isForgotPassword 
                    ? 'Enter your email to receive reset instructions.' 
                    : 'Please sign in to your account.' 
                }}
            </template>

            <!-- Login View -->
            <div v-if="!isForgotPassword">
                
                <div v-if="showDemoLogin" class="demo-login-section mb-4 animate-stagger delay-100">
                    <BaseButton 
                        @click="handleDemoLogin" 
                        variant="soft" 
                        class="w-100 demo-btn"
                        icon="bi bi-play-circle-fill"
                    >
                        Use Demo Credentials
                    </BaseButton>
                    <div class="divider mt-3 mb-1">
                        <span>or continue with email</span>
                    </div>
                </div>

                <form @submit.prevent="handleLogin" class="login-form animate-stagger delay-200">
                    <BaseFormField
                        v-model="form.email"
                        :label="$t('email')"
                        type="email"
                        placeholder="name@company.com"
                        :error="errors.email"
                        start-icon="bi bi-envelope"
                        @focus="clearError('email')"
                        class="mb-3"
                    />

                    <BaseFormField
                        v-model="form.password"
                        :label="$t('password')"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Enter your password"
                        :error="errors.password"
                        start-icon="bi bi-lock"
                        :end-icon="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                        :end-icon-clickable="true"
                        @click:endIcon="togglePassword"
                        @focus="clearError('password')"
                        class="mb-3"
                    />

                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" v-model="form.remember" />
                            <span>{{ $t('rememberMe') }}</span>
                        </label>
                        <a @click.prevent="toggleForgotPassword" class="forgot-password">
                            {{ $t('forgotPassword') }}
                        </a>
                    </div>

                    <BaseButton 
                        type="submit" 
                        :loading="isLoading" 
                        size="large" 
                        class="w-100 mb-4 auth-btn"
                    >
                        {{ $t('login') }}
                    </BaseButton>

                </form>

                <div class="auth-footer animate-stagger delay-300">
                    <p class="footer-text">Don't have an account?</p>
                     <router-link to="/signup" class="footer-link">
                        Create account
                    </router-link>
                </div>
                 <div class="auth-footer-secondary animate-stagger delay-400">
                     <a @click.prevent="goToMfaSetup" class="secondary-link">
                        <i class="bi bi-shield-lock"></i> Setup MFA
                    </a>
                 </div>
            </div>

            <!-- Forgot Password View -->
            <div v-else>
                 <form @submit.prevent="handleForgotPassword" class="forgot-password-form">
                    <BaseFormField
                        v-model="resetForm.email"
                        :label="$t('email')"
                        type="email"
                        placeholder="name@company.com"
                        :error="errors.resetEmail"
                        start-icon="bi bi-envelope"
                        @focus="clearError('resetEmail')"
                        class="mb-3"
                    />


                    <BaseButton type="submit" :loading="isLoading" size="large" class="w-100 mb-3 auth-btn">
                        {{ $t('resetPassword') }}
                    </BaseButton>

                    <div class="form-footer-action text-center">
                         <a @click.prevent="toggleForgotPassword" class="back-to-login">
                            <i class="bi bi-arrow-left"></i> Back to Login
                        </a>
                    </div>
                </form>

                <div v-if="resetSuccess" class="reset-success-message">
                    <div class="success-icon">
                        <i class="bi bi-check-lg"></i>
                    </div>
                    <h3>Check your email</h3>
                    <p>We sent a password reset link to <strong>{{ resetForm.email }}</strong></p>
                    <BaseButton variant="ghost" @click="toggleForgotPassword">Back to Login</BaseButton>
                </div>
            </div>

        </AuthCard>
    </AuthShell>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import forgot_password_controller from '../../controllers/forgot_password/forgot_password_controller';
import mfa_controller from '../../controllers/auth/mfa_controller';
import { storeMfaCredentials } from '../../utils/mfa-utils';
import { BaseFormField, BaseButton } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';
import AuthShell from '@/components/auth/AuthShell.vue';
import AuthCard from '@/components/auth/AuthCard.vue';

const router = useRouter()
const authStore = useAuthStore();

const showDemoLogin = computed(() => {
    return import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true' || import.meta.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === 'true';
});

const form = reactive({
    email: '',
    password: '',
    remember: false
})

const resetForm = reactive({
    email: ''
})

const errors = reactive({
    email: '',
    password: '',
    resetEmail: ''
})

const isLoading = ref(false)
const showPassword = ref(false)
const isForgotPassword = ref(false)
const resetSuccess = ref(false)

const clearError = (field) => {
    errors[field] = ''
}

const togglePassword = () => {
    showPassword.value = !showPassword.value
}

const toggleForgotPassword = () => {
    isForgotPassword.value = !isForgotPassword.value
    resetSuccess.value = false
    errors.resetEmail = ''
}

const validateForm = () => {
    let isValid = true
    if (!form.email) {
        errors.email = 'Email is required'
        isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Please enter a valid email'
        isValid = false
    }
    if (!form.password) {
        errors.password = 'Password is required'
        isValid = false
    } else if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
        isValid = false
    }
    return isValid
}

const validateResetForm = () => {
    if (!resetForm.email) {
        errors.resetEmail = 'Email is required'
        return false
    }
    return true
}

const handleLogin = async () => {
    if (!validateForm()) return

    isLoading.value = true

    try {
        const mfaStatus = await mfa_controller.checkMfaStatus(form.email, form.password)
        if (mfaStatus.result && mfaStatus.hasMfa) {
            storeMfaCredentials(form.email, form.password, mfaStatus.userId)
            router.push('/mfa-verification')
            return
        }

        const res = await authStore.login(form.email, form.password, form.remember);
        if (res.success) {
            router.push('/');
        } else {
            errors.password = res.message
        }
    } catch (error) {
        console.error('Login failed exception:', error)
        errors.password = 'Login failed. Please try again.'
    } finally {
        isLoading.value = false
    }
}

const handleDemoLogin = async () => {
    form.email = 'demo@routesurvey.app';
    form.password = 'demo123';
    // Small delay to visualize the fill
    await new Promise(resolve => setTimeout(resolve, 300));
    handleLogin();
};

const handleForgotPassword = async () => {
    if (!validateResetForm()) return
    
    isLoading.value = true

    try {
        const res = await forgot_password_controller.sendPasswordResetLink(resetForm.email);
        if (res.result) {
            resetSuccess.value = true
            resetForm.email = ''
        } else {
            errors.resetEmail = res.message
        }
    } catch (error) {
        console.error('Reset password failed:', error)
    } finally {
        isLoading.value = false
    }
}

const goToMfaSetup = () => {
    router.push('/mfa-setup')
}
</script>

<style scoped>
.google-btn-wrapper {
    margin-bottom: 1.5rem;
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);  /* Changed from text-tertiary for better contrast */
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1.5rem;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--border, #eee);
}

.divider span {
    padding: 0 1rem;
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
}

.forgot-password, .back-to-login {
    color: var(--accent, #0f62fe);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
}

.auth-btn {
    font-weight: 600;
    letter-spacing: 0.5px;
}

.auth-footer {
    margin-top: 2rem;
    text-align: center;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.footer-text {
    color: var(--text-secondary);
}

.footer-link {
    color: var(--accent, #0f62fe);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
}

.auth-footer-secondary {
    text-align: center;
    margin-top: 1rem;
}

.secondary-link {
    color: var(--text-tertiary);
    font-size: 0.8rem;
    text-decoration: none;
    transition: color 0.2s;
    cursor: pointer;
}

.secondary-link:hover {
    color: var(--text-secondary);
}

/* Success Message */
.reset-success-message {
    text-align: center;
    padding: 1rem 0;
    animation: fadeIn 0.5s ease-out;
}

.success-icon {
    width: 64px;
    height: 64px;
    background: rgb(0 179 134 / 10%);
    color: var(--success, #28a745);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 2rem;
}

.demo-btn {
    background-color: var(--bg-accent-light) !important; 
    color: var(--accent) !important;
    border: 1px solid var(--accent) !important; 
    opacity: 0.9;
    transition: all 0.2s;
}

.demo-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
