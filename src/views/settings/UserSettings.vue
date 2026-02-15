<template>
    <div class="user-settings">
        <div class="user-settings__header">
            <h1>{{ t('settings') }}</h1>
        </div>

        <BaseTabGroup v-model="activeTab" :tabs="tabs">
            <!-- Settings Tab -->
            <div v-if="activeTab === 'settings'" class="tab-content">
                <!-- General Settings (Preferences) -->
                <div class="settings-section mb-5">
                    <h3 class="section-title">{{ t('preferences') }}</h3>
                    <div class="settings-grid">
                        <BasePanel :title="$t('regional')" icon="fas fa-globe">
                            <div class="setting-item">
                                <BaseFormField 
                                    v-model="settings.language" 
                                    type="select" 
                                    :label="$t('language')" 
                                    :options="languageOptions" 
                                />
                            </div>
                            <div class="setting-item">
                                <BaseFormField 
                                    v-model="settings.timezone" 
                                    type="select" 
                                    :label="$t('timezone')" 
                                    :options="timezoneOptions" 
                                />
                            </div>
                            <div class="row">
                                <div class="col-md-6 setting-item">
                                    <BaseFormField 
                                        v-model="settings.dateFormat" 
                                        type="select" 
                                        :label="$t('dateFormat')" 
                                        :options="dateFormatOptions" 
                                    />
                                </div>
                                <div class="col-md-6 setting-item">
                                    <BaseFormField 
                                        v-model="settings.timeFormat" 
                                        type="select" 
                                        :label="$t('timeFormat')" 
                                        :options="timeFormatOptions" 
                                    />
                                </div>
                            </div>
                            <!-- Imperial Units Switch -->
                            <div class="setting-item">
                                <BaseFormField 
                                    v-model="settings.imperial" 
                                    type="checkbox" 
                                    :label="$t('useImperialUnits')" 
                                />
                            </div>
                        </BasePanel>
                        
                        <div class="settings-actions">
                            <BaseButton variant="primary" @click="savePreferences" :loading="isSaving">
                                {{ t('savePreferences') || 'Save Preferences' }}
                            </BaseButton>
                        </div>
                    </div>
                </div>

                <!-- MFA Settings -->
                 <div class="settings-section">
                    <h3 class="section-title">{{ t('security') }}</h3>
                    <MfaSettings />
                 </div>
            </div>

            <!-- User Profile Tab -->
            <div v-if="activeTab === 'profile'" class="tab-content">
                <MyProfile :show-company-info="false" />
            </div>

            <!-- Company Profile Tab -->
            <div v-if="activeTab === 'company'" class="tab-content">
                <OrganizationManage :is-settings-mode="true" />
            </div>
        </BaseTabGroup>

        <!-- Unsaved Changes Warning Modal -->
        <BaseConfirmationModal :visible="showUnsavedChangesModal" :title="t('unsavedChanges') || 'Unsaved Changes'"
            :message="t('unsavedChangesWarning') || 'You have unsaved changes. Are you sure you want to leave without saving?'"
            icon="bi bi-exclamation-triangle" icon-color="var(--warning)" :show-danger-button="true"
            :show-primary-button="true" :danger-text="t('leaveWithoutSaving') || 'Leave Without Saving'"
            :primary-text="t('save') || 'Save'" @close="cancelLeave" @cancel="cancelLeave" @confirm="confirmLeave"
            @primary="(e) => handleSaveFromModal(e)" />
    </div>
</template>


<script setup>
import { ref, computed, reactive, inject, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { BaseTabGroup, BasePanel, BaseFormField, BaseButton, BaseConfirmationModal } from '@/components/ui';
import MfaSettings from '@/views/settings/MfaSettings.vue';
import MyProfile from '@/views/profile/MyProfile.vue';
import OrganizationManage from '@/views/organization/OrganizationManage.vue';
import { useAuthStore } from '@/stores/auth';
import { useUnsavedChanges } from '@/composables/useUnsavedChanges';
import Cookies from 'js-cookie';

const { t } = useI18n();
const showMessage = inject('showMessage');
const authStore = useAuthStore();

const activeTab = ref('settings');
const isSaving = ref(false);

const tabs = computed(() => [
    { id: 'settings', label: t('settings'), icon: 'fas fa-cog' },
    { id: 'profile', label: t('myProfile'), icon: 'fas fa-user' },
    { id: 'company', label: t('companyName'), icon: 'fas fa-building' }
]);

// General Settings Data
const settings = reactive({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM.DD.YYYY',
    timeFormat: '24h',
    imperial: false
});

// Initial state for dirty checking
const initialSettingsState = ref(null);

const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' }
];

const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'EST', label: 'Eastern Standard Time' },
    { value: 'CST', label: 'Central Standard Time' },
    { value: 'MST', label: 'Mountain Standard Time' },
    { value: 'PST', label: 'Pacific Standard Time' }
];

const dateFormatOptions = [
    { value: 'MM.DD.YYYY', label: 'MM.DD.YYYY' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
];

const timeFormatOptions = [
    { value: '24h', label: '24h (14:30)' },
    { value: '12h', label: '12h (2:30 PM)' }
];

// Load settings
onMounted(async () => {
    // wait for user data if needed
    if (!authStore.user) await authStore.fetchUserProfile();
    
    if (authStore.user) {
        settings.imperial = authStore.user.imperial || false;
        // Mock loading other settings from cookies or store if they existed
        const savedLang = Cookies.get('app_lang');
        if (savedLang) settings.language = savedLang;
        
        const savedDateFormat = Cookies.get('app_date_format');
        if (savedDateFormat) settings.dateFormat = savedDateFormat;

        const savedTimeFormat = Cookies.get('app_time_format');
        if (savedTimeFormat) settings.timeFormat = savedTimeFormat;
    }
    
    initialSettingsState.value = JSON.parse(JSON.stringify(settings));
});

// Check dirty state
const checkDirtyState = () => {
    if (!initialSettingsState.value) return false;
    // Only check if active tab is settings. 
    // If switching tabs within the page, we might ideally block too, 
    // but the router guard protects leaving the route.
    return JSON.stringify(settings) !== JSON.stringify(initialSettingsState.value);
};

const { showUnsavedChangesModal, confirmLeave, cancelLeave, allowNextNavigation } = useUnsavedChanges(checkDirtyState);

const handleSaveFromModal = async () => {
    showUnsavedChangesModal.value = false;
    await savePreferences();
    confirmLeave();
};

const savePreferences = async () => {
    isSaving.value = true;
    try {
        // Save to AuthStore (Backend)
        const res = await authStore.updateUserInfo({
            Imperial: settings.imperial,
            // Language and Timezone might not be backend fields yet, but let's assume we handle them locally or pass them
        });
        
        // Save Settings to Cookie/Local
        Cookies.set('app_lang', settings.language, { expires: 365 });
        Cookies.set('app_date_format', settings.dateFormat, { expires: 365 });
        Cookies.set('app_time_format', settings.timeFormat, { expires: 365 });
        // Trigger locale change if needed (not implemented here but implied)

        if (res.success) {
            showMessage({ status: 'success', message: t('savedSuccessfully') || 'Settings saved successfully' });
            initialSettingsState.value = JSON.parse(JSON.stringify(settings));
            allowNextNavigation();
        } else {
            showMessage({ status: 'error', message: res.message || t('somethingWentWrong') });
        }
    } catch (error) {
        console.error(error);
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    }
    isSaving.value = false;
};
</script>

<style scoped>
.user-settings {
    padding: var(--spacing-lg);
    max-width: 1200px;
    margin: 0 auto;
}

.user-settings__header {
    margin-bottom: var(--spacing-lg);
}

.user-settings__header h1 {
    font-size: var(--font-size-2xl);
    color: var(--text-primary);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--letter-spacing-tight);
}

.tab-content {
    animation: fadeIn 0.3s ease-in-out;
}

.section-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--border);
}

.settings-grid {
    display: grid;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
}

.setting-item {
    padding: var(--spacing-xs) 0;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>