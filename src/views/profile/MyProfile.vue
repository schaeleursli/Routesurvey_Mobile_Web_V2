<template>
    <div class="profile-layout" v-if="profile">
        <!-- MFA Warning Banner -->
        <MfaWarningBanner />

        <div class="profile-grid-container">
            <!-- Left Sidebar -->
            <aside class="profile-sidebar">
                <BaseCard class="profile-card" no-padding>
                    <div class="profile-banner"></div>
                    
                    <div class="profile-header-content">
                        <div class="avatar-container">
                            <BaseImageUpload :image-url="profile.avatar" alt="Profile" size="large"
                                :edit-title="$t('changeProfilePhoto')" @change="handleProfileImageChange" />
                        </div>
                        
                        <div class="profile-identity">
                            <h2>{{ profile.firstName }} {{ profile.lastName }}</h2>
                            <p class="profile-role" v-if="profile.jobTitle">{{ profile.jobTitle }}</p>
                            <p class="profile-dept" v-if="profile.department">{{ profile.department }}</p>
                        </div>

                        <div class="profile-badges">
                            <div class="badge-item" v-if="profile.employeeId">
                                <span class="badge-label">{{ $t('id') }}</span>
                                <span class="badge-value">{{ profile.employeeId }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="profile-contact-section">
                        <h3>{{ $t('contactInformation') || 'Contact Information' }}</h3>
                        
                        <div class="contact-grid">
                            <BaseFormField v-model="profile.mobilePhone" type="tel" :label="$t('mobilePhone')"
                                :placeholder="$t('mobilePhone')" icon="bi bi-phone" />
                            <BaseFormField v-model="profile.officePhone" type="tel" :label="$t('officePhone')"
                                :placeholder="$t('officePhone')" icon="bi bi-telephone" />
                            <BaseFormField v-model="profile.email" type="email" :label="$t('defaultEmail')"
                                :placeholder="$t('defaultEmail')" readonly icon="bi bi-envelope" />
                            
                            <div class="business-email-group">
                                <BaseFormField v-model="profile.businessEmail" type="email" :label="$t('businessEmail')"
                                    :placeholder="$t('businessEmail')" :readonly="sameAsDefaultEmail" icon="bi bi-briefcase" />
                                <div class="same-as-checkbox">
                                    <input type="checkbox" id="sameEmail" v-model="sameAsDefaultEmail">
                                    <label for="sameEmail">{{ $t('sameAsDefault') }}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                         <BaseButton variant="primary" block @click="savePersonalInfo">
                            {{ $t('saveChanges') || 'Save Changes' }}
                        </BaseButton>
                    </div>
                </BaseCard>
            </aside>

            <!-- Main Content -->
            <main class="profile-main">
                
                <!-- About Me -->
                <BasePanel :title="$t('aboutMe') || 'About Me'" elevation="level1" class="content-panel">
                    <div class="about-me-section">
                        <textarea 
                            v-model="profile.aboutMe" 
                            class="rs-textarea" 
                            :placeholder="$t('aboutMePlaceholder') || 'Tell us about your professional background, expertise, and what drives you...'"
                            rows="6"
                        ></textarea>
                        <p class="helper-text">{{ $t('aboutMeHint') || 'Use this space to describe your surveying experience, certifications, and professional focus.' }}</p>
                    </div>
                </BasePanel>

                <!-- Skills & Survey Types -->
                <div class="split-panel-grid">
                    <BasePanel :title="$t('skills') || 'Skills & Expertise'" elevation="level1" class="content-panel">
                        <div class="chip-input-container">
                            <div class="chip-wrapper">
                                <span v-for="(skill, index) in profile.skills" :key="index" class="rs-chip">
                                    {{ skill }}
                                    <button @click="removeSkill(index)" class="chip-remove">&times;</button>
                                </span>
                            </div>
                            <div class="input-wrapper">
                                <input 
                                    v-model="newSkill" 
                                    @keydown.enter.prevent="addSkill" 
                                    placeholder="Add skill (Enter to add)..."
                                    class="rs-input-clean"
                                />
                                <BaseButton size="small" variant="secondary" @click="addSkill" icon="bi bi-plus" />
                            </div>
                        </div>
                    </BasePanel>

                    <BasePanel :title="$t('surveyTypes') || 'Survey Types'" elevation="level1" class="content-panel">
                        <div class="chip-input-container">
                            <div class="chip-wrapper">
                                <span v-for="(type, index) in profile.surveyTypes" :key="index" class="rs-chip rs-chip-accent">
                                    {{ type }}
                                    <button @click="removeSurveyType(index)" class="chip-remove">&times;</button>
                                </span>
                            </div>
                            <div class="input-wrapper">
                                <input 
                                    v-model="newSurveyType" 
                                    @keydown.enter.prevent="addSurveyType" 
                                    placeholder="Add survey type (Enter to add)..."
                                    class="rs-input-clean"
                                />
                                <BaseButton size="small" variant="secondary" @click="addSurveyType" icon="bi bi-plus" />
                            </div>
                        </div>
                    </BasePanel>
                </div>

                <!-- Personal Details Form -->
                <BasePanel :title="$t('personalDetails') || 'Personal Details'" elevation="level1" class="content-panel">
                    <div class="form-grid">
                        <BaseFormField v-model="profile.firstName" :label="$t('firstName')" :placeholder="$t('firstName')" />
                        <BaseFormField v-model="profile.lastName" :label="$t('lastName')" :placeholder="$t('lastName')" />
                        <BaseFormField v-model="profile.jobTitle" :label="$t('jobTitle')" :placeholder="$t('jobTitle')" />
                        <BaseFormField v-model="profile.department" :label="$t('department')" :placeholder="$t('department')" />
                        <BaseFormField v-model="profile.employeeId" :label="$t('employeeId')" :placeholder="$t('employeeId')" />
                    </div>
                </BasePanel>

                <!-- Company Info -->
                <BasePanel v-if="showCompanyInfo" :title="$t('companyInformation')" elevation="level1" class="content-panel">
                    <div class="company-header-row">
                        <BaseImageUpload :image-url="company.logo" alt="Company Logo" size="small"
                            :edit-title="$t('changeCompanyLogo')" @change="handleCompanyImageChange" />
                        <div class="company-title-input">
                            <BaseFormField v-model="company.name" :placeholder="$t('companyName')" class="mb-0" />
                        </div>
                    </div>
                    
                    <div class="form-grid mt-4">
                        <BaseFormField v-model="company.website" type="url" :label="$t('companyWebsite')" :placeholder="$t('companyWebsite')" />
                    </div>
                    
                    <CompanyAddressFields v-model="companyAddress" :country-options="countryOptions"
                        :country-disabled="userType === 'RestrictedAdmin'" :title="$t('companyAddress')" />
                    
                    <BaseFormField v-model="company.disclaimer" type="textarea" :label="$t('disclaimer')"
                        :placeholder="$t('disclaimer')" :rows="3" />
                    
                    <div class="panel-actions text-right mt-3">
                        <BaseButton variant="primary" size="small" @click="saveCompanyInfo">
                            {{ $t('saveCompanyInfo') || 'Save Company Info' }}
                        </BaseButton>
                    </div>
                </BasePanel>

            </main>
        </div>

        <!-- Unsaved Changes Warning Modal -->
        <BaseConfirmationModal :visible="showUnsavedChangesModal" :title="$t('unsavedChanges') || 'Unsaved Changes'"
            :message="$t('unsavedChangesWarning') || 'You have unsaved changes. Are you sure you want to leave without saving?'"
            icon="bi bi-exclamation-triangle" icon-color="var(--warning)" :show-danger-button="true"
            :show-primary-button="true" :danger-text="$t('leaveWithoutSaving') || 'Leave Without Saving'"
            :primary-text="$t('save') || 'Save'" @close="cancelLeave" @cancel="cancelLeave" @confirm="confirmLeave"
            @primary="handleSaveFromModal" />
    </div>
</template>

<script setup>
import { reactive, inject, onMounted, computed, ref, watch } from 'vue'
import file_management_controller from '@/controllers/file_management/file_management_controller';
import { BaseCard, BasePanel, BaseButton, BaseFormField, BaseImageUpload, CompanyAddressFields, BaseConfirmationModal } from '@/components/ui';
import MfaWarningBanner from '@/components/MfaWarningBanner.vue';
import { useAuthStore } from '@/stores/auth';
import { COUNTRIES_WITH_FLAGS } from '@/constants/countries';
import { useI18n } from 'vue-i18n';
import { useUnsavedChanges } from '@/composables/useUnsavedChanges';

const setGlobalLoading = inject('setGlobalLoading')
const showMessage = inject('showMessage');
const { t } = useI18n();
const authStore = useAuthStore();

const userType = ref("User");
const sameAsDefaultEmail = ref(false);

const profile = reactive({
    avatar: '/img/avatar.png',
    firstName: '',
    lastName: '',
    email: '',
    businessEmail: '',
    mobilePhone: '',
    officePhone: '',
    imperial: false,
    jobTitle: '',
    department: '',
    employeeId: '',
    aboutMe: '',
    skills: [],
    surveyTypes: []
})

// Initial state for dirty checking
const initialProfileState = ref(null);
const initialCompanyState = ref(null);

defineProps({
    showCompanyInfo: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['update:modelValue'])

const company = reactive({
    logo: '/img/company.png',
    name: '',
    website: '',
    mail: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    disclaimer: '',
});

// Deep clone helper
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Check dirty state
const checkDirtyState = () => {
    if (!initialProfileState.value) return false;
    
    // Check profile changes
    const profileChanged = JSON.stringify(profile) !== JSON.stringify(initialProfileState.value);
    
    // Check company changes (only if visible, but we track data regardless)
    const companyChanged = initialCompanyState.value && JSON.stringify(company) !== JSON.stringify(initialCompanyState.value);

    return profileChanged || companyChanged;
};

const { showUnsavedChangesModal, confirmLeave, cancelLeave, allowNextNavigation } = useUnsavedChanges(checkDirtyState);

const handleSaveFromModal = async () => {
    showUnsavedChangesModal.value = false;
    await savePersonalInfo();
    await saveCompanyInfo();
    allowNextNavigation();
    confirmLeave(); 
};

// Computed property for country options
const countryOptions = computed(() => {
    return COUNTRIES_WITH_FLAGS.map(country => ({
        value: country.name,
        label: `${country.flag} ${t(country.name)}`
    }));
});

// Computed property for company address that syncs with company object
const companyAddress = computed({
    get: () => ({
        street: company.street || '',
        city: company.city || '',
        state: company.state || '',
        zip: company.zip || '',
        country: company.country || ''
    }),
    set: (value) => {
        company.street = value.street || '';
        company.city = value.city || '';
        company.state = value.state || '';
        company.zip = value.zip || '';
        company.country = value.country || '';
    }
});

// Watch for "Same as Default" checkbox changes
watch(sameAsDefaultEmail, (isChecked) => {
    if (isChecked) {
        profile.businessEmail = profile.email;
    }
});

// Watch for default email changes and sync if checkbox is checked
watch(() => profile.email, (newEmail) => {
    if (sameAsDefaultEmail.value) {
        profile.businessEmail = newEmail;
    }
});

const handleProfileImageChange = async (file) => {
    setGlobalLoading(true);

    try {
        if (file) {
            const form = new FormData();
            form.append("file", file);

            const res = await file_management_controller.uploadUserPhoto(form);

            if (res.result) {
                profile.avatar = res.url;
                await savePersonalInfo();
            }
            else {
                showMessage({ status: 'error', message: t('somethingWentWrong') });
            }
        }
    } catch (error) {
        console.log(error);
    }

    setGlobalLoading(false);
};

const handleCompanyImageChange = async (file) => {
    setGlobalLoading(true);

    try {
        if (file) {
            const form = new FormData();
            form.append("file", file);

            const res = await file_management_controller.uploadCompanyLogo(form);

            if (res.result) {
                company.logo = res.url;
                await saveCompanyInfo();
            }
            else {
                showMessage({ status: 'error', message: t('somethingWentWrong') });
            }
        }
    } catch (error) {
        console.log(error);
    }

    setGlobalLoading(false);
};

const savePersonalInfo = async () => {
    setGlobalLoading(true);

    try {
        const res = await authStore.updateUserInfo({
            FirstName: profile.firstName,
            LastName: profile.lastName,
            BusinessEmail: profile.businessEmail,
            MobilePhone: profile.mobilePhone,
            OfficePhone: profile.officePhone,
            PhotoUrl: profile.avatar,
            Imperial: profile.imperial,
            JobTitle: profile.jobTitle,
            Department: profile.department,
            EmployeeId: profile.employeeId,
            AboutMe: profile.aboutMe,
            Skills: profile.skills,
            SurveyTypes: profile.surveyTypes
        });

        if (res.result) {
            showMessage({ status: 'success', message: t('savedSuccessfully') });
            await authStore.fetchUserProfile();
            initialProfileState.value = deepClone(profile);
            allowNextNavigation();
        } else {
            showMessage({ status: 'error', message: t('somethingWentWrong') });
        }
    } catch (error) {
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    }

    setGlobalLoading(false);
}

const saveCompanyInfo = async () => {
    setGlobalLoading(true);

    try {
        const res = await authStore.updateCompanyInfo({
            CompanyLogo: company.logo,
            CompanyName: company.name,
            CompanyWebsite: company.website,
            CompanyADStreet: company.street,
            CompanyADCity: company.city,
            CompanyADState: company.state,
            CompanyADZipcode: company.zip,
            CompanyADCountry: company.country,
            Disclaimer: company.disclaimer,
        });

        if (res.result) {
            showMessage({ status: 'success', message: t('savedSuccessfully') });
             await authStore.fetchUserProfile();
             initialCompanyState.value = deepClone(company);
             allowNextNavigation();
        }
        else {
            showMessage({ status: 'error', message: t('somethingWentWrong') });
        }
    } catch (error) {
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    }

    setGlobalLoading(false);
}

const getCurrentUserData = async () => {
    let userData = authStore.user;
    
    if (!userData) {
        await authStore.fetchUserProfile();
        userData = authStore.user;
    }

    if (userData) {
        if (userData.photoUrl != "") {
            profile.avatar = String(userData.photoUrl).replace("http://10.0.2.2", "http://localhost");
        }
        else {
            profile.avatar = "https://ui-avatars.com/api/?name=" + userData.firstName + "+" + userData.lastName + "&background=random";
        }
        profile.firstName = userData.firstName;
        profile.lastName = userData.lastName;
        profile.email = userData.email;
        profile.businessEmail = userData.businessEmail || '';
        profile.mobilePhone = userData.mobilePhone || '';
        profile.officePhone = userData.officePhone || '';
        profile.imperial = userData.imperial || false;
        profile.jobTitle = userData.jobTitle || '';
        profile.department = userData.department || '';
        profile.employeeId = userData.employeeId || '';
        profile.aboutMe = userData.aboutMe || '';
        profile.skills = Array.isArray(userData.skills) ? [...userData.skills] : [];
        profile.surveyTypes = Array.isArray(userData.surveyTypes) ? [...userData.surveyTypes] : [];


        sameAsDefaultEmail.value = (userData.businessEmail === userData.email);

        if (userData.companyLogo != "") {
            company.logo = String(userData.companyLogo).replace("http://10.0.2.2", "http://localhost");
        }
        else {
            company.logo = "https://ui-avatars.com/api/?name=" + userData.CompanyName + "&background=random";
        }
        company.name = userData.companyName;
        company.website = userData.companyWebsite;
        company.street = userData.companyADStreet;
        company.city = userData.companyADCity;
        company.state = userData.companyADState;
        company.zip = userData.companyADZipcode;
        company.country = userData.companyADCountry;
        company.disclaimer = userData.disclaimer;
        userType.value = userData.type;

        initialProfileState.value = deepClone(profile);
        initialCompanyState.value = deepClone(company);
    }
}

onMounted(() => {
    getCurrentUserData()
})

const newSkill = ref('');
const newSurveyType = ref('');

const addSkill = () => {
    const val = newSkill.value.trim();
    if (val && !profile.skills.includes(val)) {
        profile.skills.push(val);
    }
    newSkill.value = '';
};

const removeSkill = (index) => {
    profile.skills.splice(index, 1);
};

const addSurveyType = () => {
    const val = newSurveyType.value.trim();
    if (val && !profile.surveyTypes.includes(val)) {
        profile.surveyTypes.push(val);
    }
    newSurveyType.value = '';
};

const removeSurveyType = (index) => {
    profile.surveyTypes.splice(index, 1);
};
</script>

<style scoped>
.profile-layout {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--spacing-md);
    min-height: 100vh;
    background-color: var(--bg-background);
}

.profile-grid-container {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: var(--spacing-lg);
    align-items: start;
}

/* Sidebar Styles */
.profile-sidebar {
    position: sticky;
    top: var(--spacing-md);
}

.profile-card {
    overflow: hidden;
    position: relative;
    border: 1px solid var(--border);
    background: var(--bg-surface);
}

.profile-banner {
    height: 120px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
    width: 100%;
}

.profile-header-content {
    margin-top: -60px;
    padding: 0 var(--spacing-md);
    text-align: center;
    position: relative;
    z-index: 1;
}

.avatar-container {
    display: inline-block;
    padding: 4px;
    background: var(--bg-surface);
    border-radius: 50%;
    box-shadow: var(--shadow-md);
}

.profile-identity {
    margin-top: var(--spacing-sm);
}

.profile-identity h2 {
    font-size: var(--font-size-2xl);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
}

.profile-role {
    font-size: var(--font-size-md);
    color: var(--accent);
    font-weight: 600;
    margin: 4px 0 0;
}

.profile-dept {
    font-size: var(--font-size-sm);
    color: var(--text-tertiary);
    margin: 2px 0 0;
}

.profile-badges {
    display: flex;
    justify-content: center;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-md);
}

.badge-item {
    background: var(--bg-alt);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.badge-label {
    color: var(--text-tertiary);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.badge-value {
    font-weight: 700;
    color: var(--text-primary);
}

.profile-contact-section {
    padding: var(--spacing-md);
    border-top: 1px solid var(--border);
    margin-top: var(--spacing-md);
}

.profile-contact-section h3 {
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    color: var(--text-secondary);
    font-weight: 700;
    margin-bottom: var(--spacing-md);
    letter-spacing: 1px;
}

.contact-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.same-as-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    margin-left: 2px;
}

.same-as-checkbox label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    cursor: pointer;
}

.profile-actions {
    padding: var(--spacing-md);
    background: var(--bg-alt);
    border-top: 1px solid var(--border);
}

/* Main Content Styles */
.profile-main {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.content-panel {
    border: 1px solid var(--border);
}

.rs-textarea {
    width: 100%;
    padding: var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-input);
    color: var(--text-primary);
    font-family: inherit;
    resize: vertical;
    transition: var(--transition-base);

}

.rs-textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-light-translucent);
}

.helper-text {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
    margin-top: var(--spacing-xs);
}

.split-panel-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
}

/* Chip/Skill Input Styles */
.chip-input-container {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm);
    background: var(--bg-input);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.chip-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
}

.rs-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--accent-surface);
    color: var(--accent-dark);
    border-radius: 100px;
    font-size: var(--font-size-sm);
    font-weight: 500;
}

.rs-chip-accent {
    background: var(--accent-surface);
    color: var(--accent-dark);
}

.chip-remove {
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 0;
    opacity: 0.6;
}

.chip-remove:hover {
    opacity: 1;
}

.input-wrapper {
    display: flex;
    gap: 8px;
}

.rs-input-clean {
    flex: 1;
    border: none;
    background: transparent;
    padding: 4px 0;
    color: var(--text-primary);
}

.rs-input-clean:focus {
    outline: none;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
}

.company-header-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.company-title-input {
    flex: 1;
}

.mt-3 { margin-top: var(--spacing-md); }
.mt-4 { margin-top: var(--spacing-lg); }
.mb-0 { margin-bottom: 0 !important; }

/* Mobile Responsiveness */
@media (width <= 900px) {
    .profile-grid-container {
        grid-template-columns: 1fr;
    }
    
    .profile-sidebar {
        position: static;
    }

    .split-panel-grid {
        grid-template-columns: 1fr;
    }
}
</style>