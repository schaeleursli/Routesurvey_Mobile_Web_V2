<template>
    <div class="mfa-setup-container">
        <div class="mfa-setup-card">
            <div class="mfa-setup-header">
                <img src="@/assets/logo.png" alt="RouteSurvey Logo" class="logo" />
                <h1>Setup Two-Factor Authentication</h1>
                <p>Enhance your account security with two-factor authentication</p>
            </div>

            <!-- Step 1: Initial Setup -->
            <div v-if="currentStep === 1" class="setup-step">
                <form @submit.prevent="handleSetup" class="setup-form">
                    <div class="form-group" :class="{ 'error': errors.email }">
                        <label for="email">Email</label>
                        <div class="input-wrapper">
                            <i class="bi bi-envelope"></i>
                            <input type="email" id="email" v-model="form.email" placeholder="Enter your email" required
                                @focus="clearError('email')" />
                        </div>
                        <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
                    </div>

                    <div class="form-group" :class="{ 'error': errors.password }">
                        <label for="password">Password</label>
                        <div class="input-wrapper">
                            <i class="bi bi-lock"></i>
                            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password"
                                placeholder="Enter your password" required @focus="clearError('password')" />
                            <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'" @click="togglePassword"></i>
                        </div>
                        <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
                    </div>

                    <button type="submit" class="setup-btn" :disabled="isLoading">
                        <span v-if="!isLoading">Setup MFA</span>
                        <div v-else class="loader"></div>
                    </button>
                </form>
            </div>

            <!-- Step 2: QR Code Display -->
            <div v-if="currentStep === 2" class="setup-step">
                <div class="qr-section">
                    <h3>Scan QR Code</h3>
                    <p>Use your authenticator app to scan this QR code:</p>

                    <div class="qr-container">
                        <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code" class="qr-code" />
                        <div v-else class="qr-placeholder">
                            <i class="bi bi-qr-code"></i>
                            <p>Loading QR code...</p>
                        </div>
                    </div>

                    <div class="manual-entry">
                        <h4>Manual Entry</h4>
                        <p>If you can't scan the QR code, enter this code manually in your authenticator app:</p>
                        <div class="secret-key-container">
                            <code class="secret-key">{{ manualEntryKey }}</code>
                            <button @click="copySecretKey" class="copy-btn">
                                <i class="bi bi-clipboard"></i>
                            </button>
                        </div>
                    </div>

                    <div class="next-step">
                        <p>After adding the code to your authenticator app, click "Next" to verify.</p>
                        <button @click="nextStep" class="next-btn">Next</button>
                    </div>
                </div>
            </div>

            <!-- Step 3: Verification -->
            <div v-if="currentStep === 3" class="setup-step">
                <div class="verification-section">
                    <h3>Verify Setup</h3>
                    <p>Enter the 6-digit code from your authenticator app:</p>

                    <form @submit.prevent="handleVerification" class="verification-form">
                        <div class="form-group" :class="{ 'error': errors.mfaCode }">
                            <label for="mfaCode">Authentication Code</label>
                            <div class="input-wrapper">
                                <i class="bi bi-shield-lock"></i>
                                <input type="text" id="mfaCode" v-model="verificationForm.mfaCode"
                                    placeholder="Enter 6-digit code" maxlength="6" required
                                    @focus="clearError('mfaCode')" />
                            </div>
                            <span class="error-message" v-if="errors.mfaCode">{{ errors.mfaCode }}</span>
                        </div>

                        <button type="submit" class="verify-btn" :disabled="isVerifying">
                            <span v-if="!isVerifying">Verify & Enable MFA</span>
                            <div v-else class="loader"></div>
                        </button>
                    </form>

                    <div class="backup-info">
                        <h4>Backup Codes</h4>
                        <p>After enabling MFA, you'll receive 10 backup codes. Save them in a secure location in case
                            you lose access to your authenticator app.</p>
                    </div>
                </div>
            </div>

            <!-- Success Step -->
            <div v-if="currentStep === 4" class="setup-step">
                <div class="success-section">
                    <div class="success-icon">
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <h3>MFA Setup Complete!</h3>
                    <p>Two-factor authentication has been successfully enabled for your account.</p>

                    <div v-if="backupCodes.length > 0" class="backup-codes-section">
                        <h4>Your Backup Codes</h4>
                        <p>Save these codes in a secure location. Each code can only be used once.</p>
                        <div class="backup-codes">
                            <div v-for="(code, index) in backupCodes" :key="index" class="backup-code">
                                {{ code }}
                            </div>
                        </div>
                        <button @click="downloadBackupCodes" class="download-btn">
                            <i class="bi bi-download"></i> Download Backup Codes
                        </button>
                    </div>

                    <button @click="goToDashboard" class="dashboard-btn">Go to Dashboard</button>
                </div>
            </div>

            <!-- Error Display -->
            <div v-if="errorMessage" class="error-display">
                <i class="bi bi-exclamation-triangle"></i>
                <p>{{ errorMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import mfa_controller from '../../controllers/auth/mfa_controller'
import { resetMfaWarningDismissed, emitMfaStatusChange } from '../../utils/mfa-utils'

const router = useRouter()

const currentStep = ref(1)
const isLoading = ref(false)
const isVerifying = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const qrCodeUrl = ref('')
const manualEntryKey = ref('')
const backupCodes = ref([])
const userId = ref(null)

const form = reactive({
    email: '',
    password: ''
})

const verificationForm = reactive({
    mfaCode: ''
})

const errors = reactive({
    email: '',
    password: '',
    mfaCode: ''
})

const clearError = (field) => {
    errors[field] = ''
    errorMessage.value = ''
}

const togglePassword = () => {
    showPassword.value = !showPassword.value
}

const validateSetupForm = () => {
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
    }

    return isValid
}

const validateVerificationForm = () => {
    if (!verificationForm.mfaCode) {
        errors.mfaCode = 'Authentication code is required'
        return false
    } else if (!/^\d{6}$/.test(verificationForm.mfaCode)) {
        errors.mfaCode = 'Please enter a valid 6-digit code'
        return false
    }
    return true
}

const handleSetup = async () => {
    if (!validateSetupForm()) return

    isLoading.value = true
    errorMessage.value = ''

    try {
        const res = await mfa_controller.setupMfa(form.email, form.password)

        if (res.result) {
            qrCodeUrl.value = res.qrCodeUrl
            manualEntryKey.value = res.manualEntryKey
            userId.value = res.userId // Store the user ID from response
            currentStep.value = 2
        } else {
            errorMessage.value = res.message
        }
    } catch (error) {
        console.error('MFA setup failed:', error)
        errorMessage.value = 'Failed to setup MFA. Please try again.'
    } finally {
        isLoading.value = false
    }
}

const nextStep = () => {
    currentStep.value = 3
}

const handleVerification = async () => {
    if (!validateVerificationForm()) return

    isVerifying.value = true
    errorMessage.value = ''

    try {
        // Get user ID from the setup response or extract from the form
        // For now, we'll need to get this from the backend or store it
        const res = await mfa_controller.enableMfa(userId.value, verificationForm.mfaCode)

        if (res.result) {
            // Generate backup codes
            const backupRes = await mfa_controller.generateBackupCodes(userId.value, form.password, verificationForm.mfaCode)
            if (backupRes.result) {
                backupCodes.value = backupRes.backupCodes
            }

            // Reset MFA warning dismissed state since MFA is now enabled
            resetMfaWarningDismissed()

            // Emit MFA status change event
            emitMfaStatusChange(true)

            currentStep.value = 4
        } else {
            errorMessage.value = res.message
        }
    } catch (error) {
        console.error('MFA verification failed:', error)
        errorMessage.value = 'Failed to verify MFA. Please try again.'
    } finally {
        isVerifying.value = false
    }
}

const copySecretKey = async () => {
    try {
        await navigator.clipboard.writeText(manualEntryKey.value)
        // Show success message
        alert('Secret key copied to clipboard!')
    } catch (error) {
        console.error('Failed to copy secret key:', error)
    }
}

const downloadBackupCodes = () => {
    const content = `RouteSurvey Backup Codes\n\n${backupCodes.value.join('\n')}\n\nKeep these codes safe. Each code can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'routesurvey-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

const goToDashboard = () => {
    router.push('/')
}
</script>

<style scoped>
.mfa-setup-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 1rem;
}

.mfa-setup-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgb(0 0 0 / 10%);
    width: 100%;
    max-width: 500px;
    padding: 2.5rem;
    animation: slideUp 0.5s ease-out;
}

.mfa-setup-header {
    text-align: center;
    margin-bottom: 2rem;
}

.logo {
    width: 120px;
    margin-bottom: 1.5rem;
    animation: fadeIn 0.5s ease-out;
}

.mfa-setup-header h1 {
    color: #333;
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    animation: fadeIn 0.5s ease-out 0.2s backwards;
}

.mfa-setup-header p {
    color: #666;
    animation: fadeIn 0.5s ease-out 0.3s backwards;
}

.setup-step {
    animation: fadeIn 0.3s ease-out;
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

.input-wrapper i:last-child {
    left: auto;
    right: 1rem;
    cursor: pointer;
}

input[type="email"],
input[type="password"],
input[type="text"] {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
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
}

.setup-btn,
.verify-btn,
.next-btn,
.dashboard-btn {
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

.setup-btn:hover:not(:disabled),
.verify-btn:hover:not(:disabled),
.next-btn:hover:not(:disabled),
.dashboard-btn:hover:not(:disabled) {
    background: #0095d4;
    transform: translateY(-1px);
}

.setup-btn:disabled,
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

.qr-section,
.verification-section,
.success-section {
    text-align: center;
}

.qr-container {
    margin: 2rem 0;
    display: flex;
    justify-content: center;
}

.qr-code {
    max-width: 200px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
}

.qr-placeholder {
    width: 200px;
    height: 200px;
    border: 2px dashed #e9ecef;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
}

.qr-placeholder i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.manual-entry {
    margin: 2rem 0;
    text-align: left;
}

.manual-entry h4 {
    color: #333;
    margin-bottom: 0.5rem;
}

.secret-key-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.secret-key {
    font-family: monospace;
    font-size: 1rem;
    color: #333;
    background: white;
    padding: 0.5rem;
    border-radius: 4px;
    flex: 1;
}

.copy-btn {
    padding: 0.5rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.copy-btn:hover {
    background: #0095d4;
}

.next-step {
    margin-top: 2rem;
}

.backup-info {
    margin-top: 2rem;
    padding: 1rem;
    background: #e3f2fd;
    border-radius: 8px;
    text-align: left;
}

.backup-info h4 {
    color: #1976d2;
    margin-bottom: 0.5rem;
}

.backup-info p {
    color: #1976d2;
    margin: 0;
    font-size: 0.875rem;
}

.success-section {
    text-align: center;
}

.success-icon {
    margin-bottom: 1rem;
}

.success-icon i {
    font-size: 4rem;
    color: var(--success);
}

.backup-codes-section {
    margin-top: 2rem;
    text-align: left;
}

.backup-codes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
    margin: 1rem 0;
}

.backup-code {
    font-family: monospace;
    font-size: 0.875rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    text-align: center;
}

.download-btn {
    width: 100%;
    padding: 0.75rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.3s ease;
    margin-top: 1rem;
}

.download-btn:hover {
    background: #5a6268;
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
}

.error-display i {
    font-size: 1.25rem;
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

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (width <= 480px) {
    .mfa-setup-card {
        padding: 1.5rem;
    }

    .mfa-setup-header h1 {
        font-size: 1.5rem;
    }

    .backup-codes {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>