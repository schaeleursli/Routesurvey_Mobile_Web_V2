<template>
    <div class="mfa-settings-container">
        <div class="mfa-settings-card">
            <div class="mfa-settings-header">
                <h1>Two-Factor Authentication</h1>
                <p>Enhance your account security with two-factor authentication</p>
            </div>

            <!-- MFA Status -->
            <div class="mfa-status-section">
                <div class="status-card" :class="{ 'enabled': mfaStatus.isEnabled, 'disabled': !mfaStatus.isEnabled }">
                    <div class="status-icon">
                        <i class="bi" :class="mfaStatus.isEnabled ? 'bi-shield-check' : 'bi-shield'"></i>
                    </div>
                    <div class="status-content">
                        <h3>{{ mfaStatus.isEnabled ? 'MFA Enabled' : 'MFA Disabled' }}</h3>
                        <p>
                            {{
                                mfaStatus.isEnabled ?
                                    'Your account is protected with two-factor authentication' :
                                    'Enabletwo - factor authentication to secure your account' }}
                        </p>
                        <div v-if="mfaStatus.isEnabled" class="status-details">
                            <span>Backup codes remaining: {{ mfaStatus.backupCodesRemaining }}</span>
                            <span v-if="mfaStatus.lastUsedAt">Last used: {{ formatDate(mfaStatus.lastUsedAt) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MFA Actions -->
            <div class="mfa-actions">
                <div v-if="!mfaStatus.isEnabled" class="action-section">
                    <h3>Enable MFA</h3>
                    <p>Set up two-factor authentication to protect your account</p>
                    <button @click="goToMfaSetup" class="action-btn enable-btn">
                        <i class="bi bi-shield-lock"></i> Setup MFA
                    </button>
                </div>

                <div v-else class="action-section">
                    <h3>Manage MFA</h3>

                    <!-- Generate Backup Codes -->
                    <div class="action-item">
                        <div class="action-info">
                            <h4>Backup Codes</h4>
                            <p>Generate new backup codes for emergency access</p>
                        </div>
                        <button @click="showGenerateBackupCodes" class="action-btn secondary-btn">
                            <i class="bi bi-key"></i> Generate Codes
                        </button>
                    </div>

                    <!-- Disable MFA -->
                    <div class="action-item">
                        <div class="action-info">
                            <h4>Disable MFA</h4>
                            <p>Remove two-factor authentication from your account</p>
                        </div>
                        <button @click="showDisableMfa" class="action-btn danger-btn">
                            <i class="bi bi-shield-x"></i> Disable MFA
                        </button>
                    </div>
                </div>
            </div>

            <!-- Generate Backup Codes Modal -->
            <div v-if="showBackupModal" class="modal-overlay" @click="closeBackupModal">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h3>Generate Backup Codes</h3>
                        <button @click="closeBackupModal" class="close-btn">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>

                    <form @submit.prevent="handleGenerateBackupCodes" class="modal-form">
                        <div class="form-group" :class="{ 'error': errors.password }">
                            <label for="password">Password</label>
                            <div class="input-wrapper">
                                <i class="bi bi-lock"></i>
                                <input :type="showPassword ? 'text' : 'password'" id="password"
                                    v-model="backupForm.password" placeholder="Enter your password" required
                                    @focus="clearError('password')" />
                                <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                                    @click="togglePassword"></i>
                            </div>
                            <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
                        </div>

                        <div class="form-group" :class="{ 'error': errors.mfaCode }">
                            <label for="mfaCode">MFA Code</label>
                            <div class="input-wrapper">
                                <i class="bi bi-shield-lock"></i>
                                <input type="text" id="mfaCode" v-model="backupForm.mfaCode"
                                    placeholder="Enter 6-digit code" maxlength="6" required
                                    @focus="clearError('mfaCode')" />
                            </div>
                            <span class="error-message" v-if="errors.mfaCode">{{ errors.mfaCode }}</span>
                        </div>

                        <div class="modal-actions">
                            <button type="button" @click="closeBackupModal" class="cancel-btn">Cancel</button>
                            <button type="submit" class="confirm-btn" :disabled="isGenerating">
                                <span v-if="!isGenerating">Generate Codes</span>
                                <div v-else class="loader"></div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Backup Codes Display Modal -->
            <div v-if="showBackupCodesModal" class="modal-overlay" @click="closeBackupCodesModal">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h3>Your Backup Codes</h3>
                        <button @click="closeBackupCodesModal" class="close-btn">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>

                    <div class="backup-codes-content">
                        <p>Save these codes in a secure location. Each code can only be used once.</p>
                        <div class="backup-codes-grid">
                            <div v-for="(code, index) in backupCodes" :key="index" class="backup-code">
                                {{ code }}
                            </div>
                        </div>
                        <button @click="downloadBackupCodes" class="download-btn">
                            <i class="bi bi-download"></i> Download Codes
                        </button>
                    </div>
                </div>
            </div>

            <!-- Disable MFA Modal -->
            <div v-if="showDisableModal" class="modal-overlay" @click="closeDisableModal">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h3>Disable MFA</h3>
                        <button @click="closeDisableModal" class="close-btn">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>

                    <form @submit.prevent="handleDisableMfa" class="modal-form">
                        <div class="warning-message">
                            <i class="bi bi-exclamation-triangle"></i>
                            <p>Disabling MFA will remove the extra security layer from your account. Are you sure you
                                want to continue?</p>
                        </div>

                        <div class="form-group" :class="{ 'error': errors.password }">
                            <label for="disablePassword">Password</label>
                            <div class="input-wrapper">
                                <i class="bi bi-lock"></i>
                                <input :type="showPassword ? 'text' : 'password'" id="disablePassword"
                                    v-model="disableForm.password" placeholder="Enter your password" required
                                    @focus="clearError('password')" />
                                <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                                    @click="togglePassword"></i>
                            </div>
                            <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
                        </div>

                        <div class="form-group" :class="{ 'error': errors.mfaCode }">
                            <label for="disableMfaCode">MFA Code</label>
                            <div class="input-wrapper">
                                <i class="bi bi-shield-lock"></i>
                                <input type="text" id="disableMfaCode" v-model="disableForm.mfaCode"
                                    placeholder="Enter 6-digit code" maxlength="6" required
                                    @focus="clearError('mfaCode')" />
                            </div>
                            <span class="error-message" v-if="errors.mfaCode">{{ errors.mfaCode }}</span>
                        </div>

                        <div class="modal-actions">
                            <button type="button" @click="closeDisableModal" class="cancel-btn">Cancel</button>
                            <button type="submit" class="danger-btn" :disabled="isDisabling">
                                <span v-if="!isDisabling">Disable MFA</span>
                                <div v-else class="loader"></div>
                            </button>
                        </div>
                    </form>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import mfa_controller from '../../controllers/auth/mfa_controller'
import { clearMfaCredentials, resetMfaWarningDismissed, emitMfaStatusChange } from '../../utils/mfa-utils'

const router = useRouter()

// Reference to the MFA banner component (if available)
const mfaBannerRef = ref(null)

const mfaStatus = reactive({
    isEnabled: false,
    backupCodesRemaining: 0,
    lastUsedAt: null
})

const showBackupModal = ref(false)
const showBackupCodesModal = ref(false)
const showDisableModal = ref(false)
const isLoading = ref(false)
const isGenerating = ref(false)
const isDisabling = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const backupCodes = ref([])

const backupForm = reactive({
    password: '',
    mfaCode: ''
})

const disableForm = reactive({
    password: '',
    mfaCode: ''
})

const errors = reactive({
    password: '',
    mfaCode: ''
})

onMounted(async () => {
    await loadMfaStatus()
})

const loadMfaStatus = async () => {
    try {
        const userId = Cookies.get('login_user_id')
        if (userId) {
            const res = await mfa_controller.getMfaStatus(userId)
            if (res.result) {
                mfaStatus.isEnabled = res.isEnabled
                mfaStatus.backupCodesRemaining = res.backupCodesRemaining
                mfaStatus.lastUsedAt = res.lastUsedAt
            }
        }
    } catch (error) {
        console.error('Failed to load MFA status:', error)
    }
}

const clearError = (field) => {
    errors[field] = ''
    errorMessage.value = ''
}

const togglePassword = () => {
    showPassword.value = !showPassword.value
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
}

const goToMfaSetup = () => {
    router.push('/mfa-setup')
}

const showGenerateBackupCodes = () => {
    showBackupModal.value = true
    backupForm.password = ''
    backupForm.mfaCode = ''
    clearError('password')
    clearError('mfaCode')
}

const closeBackupModal = () => {
    showBackupModal.value = false
}

const showDisableMfa = () => {
    showDisableModal.value = true
    disableForm.password = ''
    disableForm.mfaCode = ''
    clearError('password')
    clearError('mfaCode')
}

const closeDisableModal = () => {
    showDisableModal.value = false
}

const closeBackupCodesModal = () => {
    showBackupCodesModal.value = false
}

const validateBackupForm = () => {
    let isValid = true

    if (!backupForm.password) {
        errors.password = 'Password is required'
        isValid = false
    }

    if (!backupForm.mfaCode) {
        errors.mfaCode = 'MFA code is required'
        isValid = false
    } else if (!/^\d{6}$/.test(backupForm.mfaCode)) {
        errors.mfaCode = 'Please enter a valid 6-digit code'
        isValid = false
    }

    return isValid
}

const validateDisableForm = () => {
    let isValid = true

    if (!disableForm.password) {
        errors.password = 'Password is required'
        isValid = false
    }

    if (!disableForm.mfaCode) {
        errors.mfaCode = 'MFA code is required'
        isValid = false
    } else if (!/^\d{6}$/.test(disableForm.mfaCode)) {
        errors.mfaCode = 'Please enter a valid 6-digit code'
        isValid = false
    }

    return isValid
}

const handleGenerateBackupCodes = async () => {
    if (!validateBackupForm()) return

    isGenerating.value = true
    errorMessage.value = ''

    try {
        const userId = Cookies.get('login_user_id')
        const res = await mfa_controller.generateBackupCodes(userId, backupForm.password, backupForm.mfaCode)

        if (res.result) {
            backupCodes.value = res.backupCodes
            showBackupModal.value = false
            showBackupCodesModal.value = true
            await loadMfaStatus() // Refresh status
        } else {
            errorMessage.value = res.message
        }
    } catch (error) {
        console.error('Generate backup codes failed:', error)
        errorMessage.value = 'Failed to generate backup codes. Please try again.'
    } finally {
        isGenerating.value = false
    }
}

const clearStoredMfaCredentials = () => {
    clearMfaCredentials()
}

const handleDisableMfa = async () => {
    if (!validateDisableForm()) return

    isDisabling.value = true
    errorMessage.value = ''

    try {
        const userId = Cookies.get('login_user_id')
        const res = await mfa_controller.disableMfa(userId, disableForm.password, disableForm.mfaCode)

        if (res.result) {
            showDisableModal.value = false
            await loadMfaStatus() // Refresh status
            errorMessage.value = 'MFA has been disabled successfully.'
            // Clear any stored MFA credentials
            clearStoredMfaCredentials()
            // Emit MFA status change event
            emitMfaStatusChange(false)
        } else {
            errorMessage.value = res.message
        }
    } catch (error) {
        console.error('Disable MFA failed:', error)
        errorMessage.value = 'Failed to disable MFA. Please try again.'
    } finally {
        isDisabling.value = false
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
</script>

<style scoped>
.mfa-settings-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.mfa-settings-card {
    background: white;
    border-radius: var(--radius-xl);
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
    padding: 2rem;
}

.mfa-settings-header {
    text-align: center;
    margin-bottom: 2rem;
}

.mfa-settings-header h1 {
    color: #333;
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.mfa-settings-header p {
    color: #666;
    font-size: 1.1rem;
}

.mfa-status-section {
    margin-bottom: 2rem;
}

.status-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: var(--radius-xl);
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
}

.status-card.enabled {
    border-color: var(--success);
    background: #f8fff9;
}

.status-card.disabled {
    border-color: var(--error);
    background: #fff8f8;
}

.status-icon {
    font-size: 2.5rem;
    color: #666;
}

.status-card.enabled .status-icon {
    color: var(--success);
}

.status-card.disabled .status-icon {
    color: var(--error);
}

.status-content h3 {
    margin: 0 0 0.5rem;
    color: #333;
}

.status-content p {
    margin: 0 0 1rem;
    color: #666;
}

.status-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #666;
}

.mfa-actions {
    margin-top: 2rem;
}

.action-section {
    margin-bottom: 2rem;
}

.action-section h3 {
    color: #333;
    margin-bottom: 0.5rem;
}

.action-section p {
    color: #666;
    margin-bottom: 1rem;
}

.action-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e9ecef;
    border-radius: var(--radius-lg);
    margin-bottom: 1rem;
}

.action-info h4 {
    margin: 0 0 0.25rem;
    color: #333;
}

.action-info p {
    margin: 0;
    color: #666;
    font-size: 0.875rem;
}

.action-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--radius-lg);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.enable-btn {
    background: var(--success);
    color: white;
}

.enable-btn:hover {
    background: #218838;
}

.secondary-btn {
    background: #6c757d;
    color: white;
}

.secondary-btn:hover {
    background: #5a6268;
}

.danger-btn {
    background: var(--error);
    color: white;
}

.danger-btn:hover {
    background: #c82333;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: var(--radius-xl);
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
}

.close-btn:hover {
    color: #333;
}

.modal-form {
    margin-bottom: 1rem;
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

input[type="password"],
input[type="text"] {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 2px solid #e9ecef;
    border-radius: var(--radius-lg);
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

.warning-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: var(--radius-lg);
    margin-bottom: 1.5rem;
    color: #856404;
}

.warning-message i {
    font-size: 1.25rem;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
}

.cancel-btn {
    padding: 0.75rem 1.5rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: background 0.3s ease;
}

.cancel-btn:hover {
    background: #5a6268;
}

.confirm-btn {
    padding: 0.75rem 1.5rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: background 0.3s ease;
}

.confirm-btn:hover:not(:disabled) {
    background: #0095d4;
}

.confirm-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.backup-codes-content {
    text-align: center;
}

.backup-codes-content p {
    margin-bottom: 1.5rem;
    color: #666;
}

.backup-codes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
    margin: 1.5rem 0;
}

.backup-code {
    font-family: monospace;
    font-size: 0.875rem;
    padding: 0.75rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: var(--radius-sm);
    text-align: center;
}

.download-btn {
    padding: 0.75rem 1.5rem;
    background: var(--success);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: background 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 auto;
}

.download-btn:hover {
    background: #218838;
}

.error-display {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: var(--radius-lg);
    color: #721c24;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.error-display i {
    font-size: 1.25rem;
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

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (width <= 768px) {
    .mfa-settings-container {
        padding: 1rem;
    }

    .status-card {
        flex-direction: column;
        text-align: center;
    }

    .action-item {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .backup-codes-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>