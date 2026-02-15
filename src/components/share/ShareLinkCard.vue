<template>
    <BaseCard title="Share Links" elevation="level1">
        <template #header-right>
            <BaseButton variant="secondary" size="small" @click="refreshLinks">
                <i class="fas fa-sync-alt"></i> Refresh
            </BaseButton>
        </template>

        <!-- Last Shared Link -->
        <div v-if="lastSharedLink" class="last-shared-section">
            <div class="section-title">
                <i class="fas fa-history"></i>
                <span>Last Shared Link</span>
            </div>
            <div class="share-link-row">
                <input class="share-link-input" :value="lastSharedLink.url" readonly />
                <div class="link-actions">
                    <BaseButton size="small" variant="secondary" @click="copyLink(lastSharedLink.url)">
                        <i class="fas fa-copy"></i> Copy
                    </BaseButton>
                    <BaseButton size="small" variant="secondary" @click="openQr(lastSharedLink.url)">
                        <i class="fas fa-qrcode"></i> QR
                    </BaseButton>
                    <span v-if="copySuccess" class="copy-success">Copied!</span>
                </div>
            </div>
            <div class="link-details">
                <StatusIndicator :status="lastSharedLink.isExpired ? 'error' : 'success'"
                    :text="lastSharedLink.isExpired ? 'Expired' : 'Active'" />
                <div class="link-detail-item">
                    <i class="fas fa-clock"></i>
                    <span>Expires: {{ formatDate(lastSharedLink.expireDate) }}</span>
                </div>
                <div class="link-detail-item">
                    <i class="fas fa-lock" v-if="lastSharedLink.requirePassword"></i>
                    <i class="fas fa-unlock" v-else></i>
                    <span v-if="lastSharedLink.requirePassword">Password Protected</span>
                    <span v-else>Public Access</span>
                </div>
                <div class="link-detail-item">
                    <i class="fas fa-eye"></i>
                    <span>Views: {{ lastSharedLink.views }}</span>
                </div>
            </div>
        </div>

        <!-- Create New Link -->
        <div class="create-link-section">
            <div class="section-title">
                <i class="fas fa-plus-circle"></i>
                <span>Create New Link</span>
            </div>

            <div class="form-grid">
                <!-- Link Settings Row -->
                <div class="form-row">
                    <div class="form-field">
                        <BaseFormField type="select" v-model="newLinkExpiry" label="Link Expiry"
                            :options="expiryOptions" />
                    </div>

                    <div class="form-field" v-if="requirePassword">
                        <BaseFormField type="text" v-model="newLinkPassword" label="Password"
                            placeholder="Enter password (min 6 characters)" />
                    </div>
                </div>

                <!-- Password Protection Option -->
                <div class="password-option">
                    <BaseFormField type="checkbox" v-model="requirePassword" label="Require Password Protection" />
                </div>

                <!-- Generate Button -->
                <div class="generate-button-row">
                    <BaseButton variant="primary" size="medium" :loading="generating" @click="generateNewLink"
                        :disabled="disabled || (requirePassword && newLinkPassword.length < 6)">
                        <i class="fas fa-link"></i> Generate Share Link
                    </BaseButton>
                </div>
            </div>

            <!-- New Generated Link -->
            <div v-if="newGeneratedLink" class="new-link-section">
                <div class="section-title">
                    <i class="fas fa-check-circle"></i>
                    <span>New Generated Link</span>
                </div>
                <div class="share-link-row">
                    <input class="share-link-input" :value="newGeneratedLink.url" readonly />
                    <div class="link-actions">
                        <BaseButton size="small" variant="secondary" @click="copyLink(newGeneratedLink.url)">
                            <i class="fas fa-copy"></i> Copy
                        </BaseButton>
                        <BaseButton size="small" variant="secondary" @click="openQr(newGeneratedLink.url)">
                            <i class="fas fa-qrcode"></i> QR
                        </BaseButton>
                    </div>
                </div>
                <div class="link-details">
                    <StatusIndicator status="success" text="Active" />
                    <div class="link-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>Expires: {{ formatDate(newGeneratedLink.expiresAt) }}</span>
                    </div>
                    <div class="link-detail-item" v-if="newGeneratedLink.password">
                        <i class="fas fa-key"></i>
                        <span>Password: {{ newGeneratedLink.password }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- All Generated Links -->
        <div v-if="links.length > 0" class="links-listing-section">
            <div class="section-title">
                <i class="fas fa-list"></i>
                <span>All Generated Links ({{ links.length }})</span>
            </div>
            <div class="links-list">
                <div v-for="link in links" :key="link.id" class="link-item">
                    <BaseCard elevation="level0">
                        <template #header>
                            <div class="link-item-header">
                                <div class="link-item-title">
                                    <StatusIndicator :status="link.isExpired ? 'error' : 'success'"
                                        :text="link.isExpired ? 'Expired' : 'Active'" />
                                    <span class="link-date">{{ formatDate(link.dateAdded) }}</span>
                                </div>
                                <div class="link-item-actions">
                                    <BaseButton size="small" variant="secondary" @click="copyLink(link.url)">
                                        <i class="fas fa-copy"></i> Copy
                                    </BaseButton>
                                    <BaseButton size="small" variant="secondary" @click="openQr(link.url)">
                                        <i class="fas fa-qrcode"></i> QR
                                    </BaseButton>
                                    <BaseButton size="small" variant="danger" @click="deleteLink(link.id)">
                                        <i class="fas fa-trash"></i> Delete
                                    </BaseButton>
                                </div>
                            </div>
                        </template>

                        <div class="link-item-url">
                            <input class="link-url-input" :value="link.url" readonly />
                        </div>
                        <div class="link-item-details">
                            <div class="link-detail-item">
                                <i class="fas fa-clock"></i>
                                <span>Expires: {{ formatDate(link.expireDate) }}</span>
                            </div>
                            <div class="link-detail-item">
                                <i class="fas fa-lock" v-if="link.requirePassword"></i>
                                <i class="fas fa-unlock" v-else></i>
                                <span v-if="link.requirePassword">Password Protected</span>
                                <span v-else>Public Access</span>
                            </div>
                            <div class="link-detail-item">
                                <i class="fas fa-eye"></i>
                                <span>Views: {{ link.views }}</span>
                            </div>
                        </div>
                    </BaseCard>
                </div>
            </div>
        </div>
    </BaseCard>
</template>

<script setup>
import { ref, watch } from 'vue'
import { BaseCard, BaseButton, BaseFormField, StatusIndicator } from '@/components/ui'

const props = defineProps({
    lastSharedLink: {
        type: Object,
        default: null
    },
    links: {
        type: Array,
        default: () => []
    },
    generating: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['generate-link', 'delete-link', 'copy-link', 'open-qr', 'refresh-links'])

// Form state
const requirePassword = ref(false)
const newLinkExpiry = ref('7')
const newLinkPassword = ref('')
const copySuccess = ref(false)
const newGeneratedLink = ref(null)

// Expiry options
const expiryOptions = [
    { value: '1', label: '1 day' },
    { value: '7', label: '7 days' },
    { value: '14', label: '14 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' }
]

// Copy to clipboard
const copyLink = async (link) => {
    try {
        await navigator.clipboard.writeText(link)
        copySuccess.value = true
        setTimeout(() => (copySuccess.value = false), 1200)
        emit('copy-link', link)
    } catch (e) {
        copySuccess.value = false
    }
}

// QR code modal
const openQr = (url) => {
    emit('open-qr', url)
}

// Generate new link
const generateNewLink = () => {
    const linkData = {
        requirePassword: requirePassword.value,
        password: newLinkPassword.value,
        expiry: newLinkExpiry.value
    }
    emit('generate-link', linkData)
}

// Delete link
const deleteLink = (id) => {
    emit('delete-link', id)
}

// Refresh links
const refreshLinks = () => {
    emit('refresh-links')
}

// Watch for password requirement changes
watch(requirePassword, (newValue) => {
    if (!newValue) {
        // Clear password when checkbox is unchecked
        newLinkPassword.value = ''
    }
})

// Format date for display
const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>

<style scoped>
.section-title {
    display: flex;
    align-items: center;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    gap: var(--spacing-sm);
}

.section-title i {
    color: var(--accent);
    font-size: var(--font-size-base);
}

.last-shared-section,
.create-link-section,
.new-link-section,
.links-listing-section {
    background: var(--bg-elevated);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    border: 1px solid var(--border);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

/* Form Layout */
.form-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    align-items: end;
}

.form-field {
    display: flex;
    flex-direction: column;
}

.password-option {
    margin-top: var(--spacing-sm);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border);
}

/* Custom checkbox styling */
:deep(.password-option .base-form-field) {
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-sm);
}

:deep(.password-option .base-form-field__label) {
    margin-bottom: 0;
    order: 2;
    cursor: pointer;
}

:deep(.password-option .base-form-field__input-wrapper) {
    order: 1;
    flex-shrink: 0;
}

.generate-button-row {
    display: flex;
    justify-content: flex-start;
    margin-top: var(--spacing-sm);
}

.share-link-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    flex-wrap: wrap;
}

.link-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex-shrink: 0;
}

.share-link-input {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    font-size: var(--font-size-base);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-family-mono);
    min-width: 300px;
}

.link-details {
    display: flex;
    gap: var(--spacing-lg);
    align-items: center;
    flex-wrap: wrap;
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border);
}

.link-detail-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.link-detail-item i {
    font-size: var(--font-size-xs);
    color: var(--accent);
    width: 12px;
    text-align: center;
}

/* Links Listing Styles */
.links-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.link-item {
    margin-bottom: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.link-item:hover {
    border-color: var(--accent);
    box-shadow: 0 2px 8px rgb(0 167 225 / 10%);
}

.link-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.link-item-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.link-date {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.link-item-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.link-item-url {
    margin-bottom: var(--spacing-sm);
}

.link-url-input {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    font-size: var(--font-size-sm);
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-family: var(--font-family-mono);
}

.link-item-details {
    display: flex;
    gap: var(--spacing-md);
    align-items: center;
    flex-wrap: wrap;
    margin-top: var(--spacing-sm);
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--border);
}

.link-detail-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.link-detail-item i {
    font-size: var(--font-size-xs);
    color: var(--accent);
}

.copy-success {
    color: var(--accent);
    font-weight: var(--font-weight-semibold);
    margin-left: var(--spacing-sm);
    font-size: var(--font-size-base);
    transition: opacity var(--transition-fast);
}

/* Custom Dropdown Styling */
:deep(.base-form-field__select) {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
    appearance: none;
    cursor: pointer;
}

:deep(.base-form-field__select:focus) {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2300a7e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
}

:deep(.base-form-field__select:hover) {
    border-color: var(--accent);
    background-color: var(--bg-surface);
}

/* Enhanced Form Field Styling */
:deep(.base-form-field__input),
:deep(.base-form-field__select) {
    transition: all var(--transition-normal);
    border: 2px solid var(--border);
}

:deep(.base-form-field__input:focus),
:deep(.base-form-field__select:focus) {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgb(0 167 225 / 10%);
    transform: translateY(-1px);
}

:deep(.base-form-field__input:hover),
:deep(.base-form-field__select:hover) {
    border-color: var(--accent);
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

/* Button Enhancements */
:deep(.base-button) {
    transition: all var(--transition-normal);
}

:deep(.base-button:hover) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgb(0 0 0 / 15%);
}

:deep(.base-button:active) {
    transform: translateY(0);
}

/* Responsive adjustments */
@media (width <= 768px) {
    .form-row {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
    }

    .share-link-input {
        min-width: 200px;
    }

    .link-details,
    .link-item-details {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
    }

    .link-item-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
    }

    .link-item-actions {
        align-self: flex-end;
    }
}

@media (width <= 480px) {
    .share-link-row {
        flex-direction: column;
        align-items: stretch;
    }

    .link-actions {
        justify-content: center;
        margin-top: var(--spacing-sm);
    }

    .share-link-input {
        min-width: auto;
    }
}
</style>
