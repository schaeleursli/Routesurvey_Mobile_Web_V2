<template>
  <div class="add-account-request container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white text-center">
            <h3 class="mb-0">{{ t('requestAccount') }}</h3>
            <p class="mb-0">{{ t('requestAccountSubtitle') }}</p>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="submitRequest" ref="requestForm">
              <!-- Personal Information -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="firstName" class="form-label">{{ t('firstName') }} *</label>
                  <input v-model="formData.firstName" type="text" class="form-control" id="firstName"
                    :class="{ 'is-invalid': errors.firstName }" required />
                  <div v-if="errors.firstName" class="invalid-feedback">
                    {{ errors.firstName }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="lastName" class="form-label">{{ t('lastName') }} *</label>
                  <input v-model="formData.lastName" type="text" class="form-control" id="lastName"
                    :class="{ 'is-invalid': errors.lastName }" required />
                  <div v-if="errors.lastName" class="invalid-feedback">
                    {{ errors.lastName }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">{{ t('email') }} *</label>
                <input v-model="formData.email" type="email" class="form-control" id="email"
                  :class="{ 'is-invalid': errors.email }" required />
                <div v-if="errors.email" class="invalid-feedback">
                  {{ errors.email }}
                </div>
              </div>

              <div class="mb-3">
                <label for="phoneNumber" class="form-label">{{ t('phone') }}</label>
                <input v-model="formData.phoneNumber" type="tel" class="form-control" id="phoneNumber"
                  :class="{ 'is-invalid': errors.phoneNumber }" />
                <div v-if="errors.phoneNumber" class="invalid-feedback">
                  {{ errors.phoneNumber }}
                </div>
              </div>

              <!-- Professional Information -->
              <div class="mb-3">
                <label for="company" class="form-label">{{ t('company') }}</label>
                <input v-model="formData.company" type="text" class="form-control" id="company"
                  :class="{ 'is-invalid': errors.company }" />
                <div v-if="errors.company" class="invalid-feedback">
                  {{ errors.company }}
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="country" class="form-label">{{ t('country') }}</label>
                  <select v-model="formData.country" class="form-select" id="country"
                    :class="{ 'is-invalid': errors.country }">
                    <option value="">{{ t('selectCountry') }}</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Australia">Australia</option>
                    <option value="Japan">Japan</option>
                    <option value="China">China</option>
                    <option value="India">India</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Mexico">Mexico</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="UAE">UAE</option>
                    <option value="Other">Other</option>
                  </select>
                  <div v-if="errors.country" class="invalid-feedback">
                    {{ errors.country }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="profession" class="form-label">{{ t('profession') }}</label>
                  <select v-model="formData.profession" class="form-select" id="profession"
                    :class="{ 'is-invalid': errors.profession }">
                    <option value="">{{ t('selectProfession') }}</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Surveyor">Surveyor</option>
                    <option value="Architect">Architect</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Construction Manager">Construction Manager</option>
                    <option value="Transportation Planner">Transportation Planner</option>
                    <option value="GIS Specialist">GIS Specialist</option>
                    <option value="Urban Planner">Urban Planner</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Student">Student</option>
                    <option value="Academic">Academic</option>
                    <option value="Government Official">Government Official</option>
                    <option value="Other">Other</option>
                  </select>
                  <div v-if="errors.profession" class="invalid-feedback">
                    {{ errors.profession }}
                  </div>
                </div>
              </div>

              <!-- Password -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="password" class="form-label">{{ t('password') }} *</label>
                  <input v-model="formData.password" type="password" class="form-control" id="password"
                    :class="{ 'is-invalid': errors.password }" required />
                  <div v-if="errors.password" class="invalid-feedback">
                    {{ errors.password }}
                  </div>
                  <small class="form-text text-muted">
                    {{ t('passwordRequirements') }}
                  </small>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="confirmPassword" class="form-label">{{ t('confirmPassword') }} *</label>
                  <input v-model="formData.confirmPassword" type="password" class="form-control" id="confirmPassword"
                    :class="{ 'is-invalid': errors.confirmPassword }" required />
                  <div v-if="errors.confirmPassword" class="invalid-feedback">
                    {{ errors.confirmPassword }}
                  </div>
                </div>
              </div>

              <!-- Terms and Conditions -->
              <div class="mb-3">
                <div class="form-check">
                  <input v-model="formData.acceptTerms" class="form-check-input" type="checkbox" id="acceptTerms"
                    :class="{ 'is-invalid': errors.acceptTerms }" required />
                  <label class="form-check-label" for="acceptTerms">
                    {{ t('acceptTerms') }}
                    <a href="#" @click.prevent="showTermsModal = true">{{ t('termsAndConditions') }}</a>
                  </label>
                  <div v-if="errors.acceptTerms" class="invalid-feedback">
                    {{ errors.acceptTerms }}
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="d-grid">
                <button type="submit" class="btn btn-primary btn-lg" :disabled="loading" @click="submitRequest">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? t('submitting') : t('submitRequest') }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="alert alert-success mt-3">
          <i class="bi bi-check-circle-fill me-2"></i>
          {{ t('requestSubmittedSuccessfully') }}
        </div>

        <!-- Error Message -->
        <div v-if="error" class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Terms and Conditions Modal -->
    <div class="modal fade" id="termsModal" tabindex="-1" ref="termsModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('termsAndConditions') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <h6>{{ t('accountRequestTerms') }}</h6>
            <p>{{ t('accountRequestTermsText') }}</p>

            <h6>{{ t('dataPrivacy') }}</h6>
            <p>{{ t('dataPrivacyText') }}</p>

            <h6>{{ t('accountApproval') }}</h6>
            <p>{{ t('accountApprovalText') }}</p>

            <h6>{{ t('usageTerms') }}</h6>
            <p>{{ t('usageTermsText') }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ t('close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import AccountRequestsController from '@/controllers/account_requests/account_requests_controller.js';
import { Modal } from 'bootstrap';

export default {
  name: 'AddAccountRequest',
  setup() {
    const { t } = useI18n();

    // Form data
    const formData = reactive({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      company: '',
      country: '',
      profession: '',
      acceptTerms: false
    });

    // Form state
    const loading = ref(false);
    const success = ref(false);
    const error = ref('');
    const errors = reactive({});
    const showTermsModal = ref(false);

    // References
    const requestForm = ref(null);
    const termsModal = ref(null);
    let termsModalInstance = null;

    // Validation
    const validateForm = () => {
      // Clear previous errors
      Object.keys(errors).forEach(key => delete errors[key]);

      let isValid = true;

      // Required fields
      if (!formData.firstName.trim()) {
        errors.firstName = t('firstNameRequired');
        isValid = false;
      }

      if (!formData.lastName.trim()) {
        errors.lastName = t('lastNameRequired');
        isValid = false;
      }

      if (!formData.email.trim()) {
        errors.email = t('emailRequired');
        isValid = false;
      } else if (!isValidEmail(formData.email)) {
        errors.email = t('emailInvalid');
        isValid = false;
      }

      if (!formData.password) {
        errors.password = t('passwordRequired');
        isValid = false;
      } else if (formData.password.length < 6) {
        errors.password = t('passwordTooShort');
        isValid = false;
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = t('confirmPasswordRequired');
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t('passwordsDoNotMatch');
        isValid = false;
      }

      if (!formData.acceptTerms) {
        errors.acceptTerms = t('acceptTermsRequired');
        isValid = false;
      }

      return isValid;
    };

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Submit form
    const submitRequest = async () => {
      console.log('Submit button clicked');

      if (!validateForm()) {
        console.log('Form validation failed:', errors);
        return;
      }

      console.log('Form validation passed, submitting...');
      loading.value = true;
      error.value = '';
      success.value = false;

      try {
        const requestData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phoneNumber: formData.phoneNumber.trim() || null,
          company: formData.company.trim() || null,
          country: formData.country || null,
          profession: formData.profession || null
        };

        console.log('Sending request data:', requestData);
        const response = await AccountRequestsController.addAccountRequest(requestData);
        console.log('Response received:', response);

        if (response.result) {
          success.value = true;
          // Reset form
          Object.keys(formData).forEach(key => {
            if (key === 'acceptTerms') {
              formData[key] = false;
            } else {
              formData[key] = '';
            }
          });
          // Scroll to success message
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        } else {
          error.value = response.message;
        }
      } catch (err) {
        console.error('Error submitting request:', err);
        error.value = t('requestSubmissionError');
      } finally {
        loading.value = false;
      }
    };

    // Lifecycle
    onMounted(() => {
      termsModalInstance = new Modal(termsModal.value);
    });

    return {
      t,
      formData,
      loading,
      success,
      error,
      errors,
      showTermsModal,
      requestForm,
      termsModal,
      submitRequest
    };
  }
};
</script>

<style scoped>
.add-account-request {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  border: none;
  border-radius: 15px;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.form-control:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgb(102 126 234 / 25%);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(102 126 234 / 40%);
}

.btn-primary:disabled {
  transform: none;
  box-shadow: none;
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

.alert {
  border-radius: 10px;
  border: none;
}

.modal-content {
  border-radius: 15px;
  border: none;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px 15px 0 0;
}

.modal-header .btn-close {
  filter: invert(1);
}
</style>
