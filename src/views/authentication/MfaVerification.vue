<template>
    <div class="mfa-verification-container">
        <div class="mfa-verification-card">
            <div class="mfa-verification-header">
                <img src="@/assets/logo.png" alt="RouteSurvey Logo" class="logo" />
                <h1>Two-Factor Authentication</h1>
                <p>Enter the 6-digit code from your authenticator app</p>
            </div>

            <form @submit.prevent="handleVerification" class="verification-form">
                <div class="form-group" :class="{ 'error': errors.mfaCode }">
                    <label for="mfaCode">Authentication Code</label>
                    <div class="input-wrapper">
                        <i class="bi bi-shield-lock"></i>
                        <input type="text" id="mfaCode" v-model="form.mfaCode" placeholder="Enter 6-digit code"
                            maxlength="6" @focus="clearError('mfaCode')" @input="handleCodeInput" ref="mfaCodeInput" />
                    </div>
                    <span class="error-message" v-if="errors.mfaCode">{{ errors.mfaCode }}</span>
                </div>

                <div class="backup-code-section">
                    <details>
                        <summary>Use Backup Code</summary>
                        <div class="backup-code-form">
                            <div class="form-group" :class="{ 'error': errors.backupCode }">
                                <label for="backupCode">Backup Code</label>
                                <div class="input-wrapper">
                                    <i class="bi bi-key"></i>
                                    <input type="text" id="backupCode" v-model="form.backupCode"
                                        placeholder="Enter backup code" @focus="clearError('backupCode')" />
                                </div>
                                <span class="error-message" v-if="errors.backupCode">{{ errors.backupCode }}</span>
                            </div>
                        </div>
                    </details>
                </div>

                <button type="submit" class="verify-btn" :disabled="isLoading">
                    <span v-if="!isLoading">Verify & Login</span>
                    <div v-else class="loader"></div>
                </button>

                <div class="form-options">
                    <a @click.prevent="goBack" class="back-link">
                        <i class="bi bi-arrow-left"></i> Back to Login
                    </a>
                </div>
            </form>

            <div v-if="errorMessage" class="error-display">
                <i class="bi bi-exclamation-triangle"></i>
                <p>{{ errorMessage }}</p>
            </div>

            <div class="help-section">
                <h4>Need Help?</h4>
                <ul>
                    <li>Make sure your authenticator app is showing the current time</li>
                    <li>Try refreshing the code in your authenticator app</li>
                    <li>Use a backup code if you can't access your authenticator app</li>
                    <li>Contact support if you're still having issues</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mfa_controller from '../../controllers/auth/mfa_controller'
import { getMfaCredentials, clearMfaCredentials } from '../../utils/mfa-utils'

const router = useRouter()
const route = useRoute()

const isLoading = ref(false)
const errorMessage = ref('')
const mfaCodeInput = ref(null)

const form = reactive({
    mfaCode: '',
    backupCode: ''
})

const errors = reactive({
    mfaCode: '',
    backupCode: ''
})

// Get login credentials from route params or session storage
const loginCredentials = reactive({
    email: '',
    password: '',
    userId: ''
})

onMounted(() => {
    // Get stored credentials from session storage
    const credentials = getMfaCredentials()

    if (credentials.hasCredentials) {
        loginCredentials.email = credentials.email
        loginCredentials.password = credentials.password
        loginCredentials.userId = credentials.userId
    } else {
        // If no stored credentials, redirect back to login
        router.push('/login')
        return
    }

    // Focus on the MFA code input
    if (mfaCodeInput.value) {
        mfaCodeInput.value.focus()
    }
})

const clearError = (field) => {
    errors[field] = ''
    errorMessage.value = ''
}

const handleCodeInput = (event) => {
    // Only allow digits
    const value = event.target.value.replace(/\D/g, '')
    form.mfaCode = value

    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
        handleVerification()
    }
}

const validateForm = () => {
    let isValid = true

    if (form.backupCode) {
        // Using backup code
        if (!form.backupCode.trim()) {
            errors.backupCode = 'Backup code is required'
            isValid = false
        }
    } else {
        // Using MFA code
        if (!form.mfaCode) {
            errors.mfaCode = 'Authentication code is required'
            isValid = false
        } else if (!/^\d{6}$/.test(form.mfaCode)) {
            errors.mfaCode = 'Please enter a valid 6-digit code'
            isValid = false
        }
    }

    return isValid
}

const handleVerification = async () => {
    if (!validateForm()) return

    isLoading.value = true
    errorMessage.value = ''

    try {
        let res

        if (form.backupCode) {
            // Use backup code for login
            res = await mfa_controller.loginWithMfa(
                loginCredentials.email,
                loginCredentials.password,
                form.backupCode,
                loginCredentials.userId
            )
        } else {
            // Use MFA code for login
            res = await mfa_controller.loginWithMfa(
                loginCredentials.email,
                loginCredentials.password,
                form.mfaCode,
                loginCredentials.userId
            )
        }

        if (res.result) {
            // Clear stored credentials
            clearMfaCredentials()

            // Redirect to dashboard
            router.push('/')
        } else {
            errorMessage.value = res.message
        }
    } catch (error) {
        console.error('MFA verification failed:', error)
        errorMessage.value = 'Failed to verify authentication code. Please try again.'
    } finally {
        isLoading.value = false
    }
}

const goBack = () => {
    // Clear stored credentials
    clearMfaCredentials()
    router.push('/login')
}
</script>

<style scoped>
.mfa-verification-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 1rem;
}

.mfa-verification-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgb(0 0 0 / 10%);
    width: 100%;
    max-width: 420px;
    padding: 2.5rem;
    animation: slideUp 0.5s ease-out;
}

.mfa-verification-header {
    text-align: center;
    margin-bottom: 2rem;
}

.logo {
    width: 120px;
    margin-bottom: 1.5rem;
    animation: fadeIn 0.5s ease-out;
}

.mfa-verification-header h1 {
    color: #333;
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    animation: fadeIn 0.5s ease-out 0.2s backwards;
}

.mfa-verification-header p {
    color: #666;
    animation: fadeIn 0.5s ease-out 0.3s backwards;
}

.verification-form {
    animation: fadeIn 0.5s ease-out 0.4s backwards;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 500;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-wrapper i {
    position: absolute;
    left: 1rem;
    color: #666;
}

input[type="text"] {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    text-align: center;
    letter-spacing: 0.5rem;
    font-weight: 600;
}

input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgb(0 174 239 / 10%);
}

.form-group.error input {
    border-color: var(--error);
}

.error-message {
    color: var(--error);
    font-size: 0.875rem;
    margin-top: 0.5rem;
    display: block;
    animation: shake 0.5s ease-in-out;
}

.backup-code-section {
    margin: 1.5rem 0;
}

.backup-code-section details {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
}

.backup-code-section summary {
    padding: 1rem;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
    color: #666;
    transition: background 0.3s ease;
}

.backup-code-section summary:hover {
    background: #e9ecef;
}

.backup-code-form {
    padding: 1rem;
    background: white;
}

.verify-btn {
    width: 100%;
    padding: 0.875rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
}

.verify-btn:hover:not(:disabled) {
    background: #0095d4;
    transform: translateY(-1px);
}

.verify-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.loader {
    width: 20px;
    height: 20px;
    border: 2px solid #fff;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    animation: rotation 1s linear infinite;
}

.form-options {
    margin-top: 1.5rem;
    text-align: center;
}

.back-link {
    color: var(--accent);
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.3s ease;
    cursor: pointer;
}

.back-link:hover {
    color: #0095d4;
}

.back-link i {
    margin-right: 0.25rem;
}

.error-display {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 8px;
    color: #721c24;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: fadeIn 0.3s ease-out;
}

.error-display i {
    font-size: 1.25rem;
}

.help-section {
    margin-top: 2rem;
    padding: 1rem;
    background: #e3f2fd;
    border-radius: 8px;
    text-align: left;
}

.help-section h4 {
    color: #1976d2;
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.help-section ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #1976d2;
    font-size: 0.875rem;
}

.help-section li {
    margin-bottom: 0.25rem;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes shake {
    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
    }

    75% {
        transform: translateX(5px);
    }
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (width <= 480px) {
    .mfa-verification-card {
        padding: 1.5rem;
    }

    .mfa-verification-header h1 {
        font-size: 1.5rem;
    }

    input[type="text"] {
        letter-spacing: 0.25rem;
        font-size: 0.875rem;
    }
}
</style>