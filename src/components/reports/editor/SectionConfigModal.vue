<template>
  <BaseModal
    :visible="show"
    :title="`Configure ${sectionTitle}`"
    size="large"
    @close="handleClose"
  >
    <template #body>
      <div v-if="configSchema" class="section-config-form">
        <p class="text-muted mb-4">
          Customize transport-related parameters for this section. These settings control how data is processed and displayed in the report.
        </p>

        <div v-for="field in visibleFields" :key="field.key" class="mb-4">
          <!-- Number Input -->
          <div v-if="field.type === 'number' || field.type === 'range'" class="form-group">
            <label :for="`config-${field.key}`" class="form-label d-flex justify-content-between align-items-center">
              <span>
                {{ field.label }}
                <span v-if="field.required" class="text-danger">*</span>
                <span v-if="field.unit" class="text-muted ms-1">({{ field.unit }})</span>
              </span>
              <span v-if="field.type === 'range'" class="badge bg-light text-dark">{{ formData[field.key] }}</span>
            </label>
            <input
              :id="`config-${field.key}`"
              v-model.number="formData[field.key]"
              :type="field.type === 'range' ? 'range' : 'number'"
              :min="field.min"
              :max="field.max"
              :step="field.step || 1"
              class="form-control"
              :class="{ 'is-invalid': fieldErrors[field.key] && fieldErrors[field.key].length > 0 }"
              :aria-required="field.required"
              :aria-invalid="!!(fieldErrors[field.key] && fieldErrors[field.key].length > 0)"
              :aria-describedby="fieldErrors[field.key] && fieldErrors[field.key].length > 0 ? `${field.key}-error` : field.description ? `${field.key}-description` : undefined"
            />
            <div v-if="fieldErrors[field.key] && fieldErrors[field.key].length > 0" :id="`${field.key}-error`" class="invalid-feedback d-block" role="alert">
              {{ fieldErrors[field.key][0] }}
            </div>
            <small v-else-if="field.description" :id="`${field.key}-description`" class="form-text text-muted">{{ field.description }}</small>
          </div>

          <!-- Text Input -->
          <div v-else-if="field.type === 'text'" class="form-group">
            <label :for="`config-${field.key}`" class="form-label">
              {{ field.label }}
              <span v-if="field.required" class="text-danger">*</span>
            </label>
            <input
              :id="`config-${field.key}`"
              v-model="formData[field.key]"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': fieldErrors[field.key] && fieldErrors[field.key].length > 0 }"
            />
            <div v-if="fieldErrors[field.key] && fieldErrors[field.key].length > 0" class="invalid-feedback d-block">
              {{ fieldErrors[field.key][0] }}
            </div>
            <small v-else-if="field.description" class="form-text text-muted">{{ field.description }}</small>
          </div>

          <!-- Select Dropdown -->
          <div v-else-if="field.type === 'select'" class="form-group">
            <label :for="`config-${field.key}`" class="form-label">{{ field.label }}</label>
            <select
              :id="`config-${field.key}`"
              v-model="formData[field.key]"
              class="form-select"
            >
              <option
                v-for="option in field.options"
                :key="typeof option === 'string' ? option : option.value"
                :value="typeof option === 'string' ? option : option.value"
              >
                {{ typeof option === 'string' ? option : option.label }}
              </option>
            </select>
            <small v-if="field.description" class="form-text text-muted">{{ field.description }}</small>
          </div>

          <!-- Multi-Select -->
          <div v-else-if="field.type === 'multiselect'" class="form-group">
            <label class="form-label">
              {{ field.label }}
              <span v-if="field.required" class="text-danger">*</span>
            </label>
            <div 
              class="multiselect-options"
              :class="{ 'border-danger': fieldErrors[field.key] && fieldErrors[field.key].length > 0 }"
            >
              <div
                v-for="option in field.options"
                :key="typeof option === 'string' ? option : option.value"
                class="form-check"
              >
                <input
                  :id="`config-${field.key}-${typeof option === 'string' ? option : option.value}`"
                  v-model="formData[field.key]"
                  type="checkbox"
                  :value="typeof option === 'string' ? option : option.value"
                  class="form-check-input"
                />
                <label
                  :for="`config-${field.key}-${typeof option === 'string' ? option : option.value}`"
                  class="form-check-label"
                >
                  {{ typeof option === 'string' ? option : option.label }}
                </label>
              </div>
            </div>
            <div v-if="fieldErrors[field.key] && fieldErrors[field.key].length > 0" class="invalid-feedback d-block">
              {{ fieldErrors[field.key][0] }}
            </div>
            <small v-else-if="field.description" class="form-text text-muted">{{ field.description }}</small>
          </div>

          <!-- Boolean Checkbox -->
          <div v-else-if="field.type === 'boolean'" class="form-group">
            <div class="form-check form-switch">
              <input
                :id="`config-${field.key}`"
                v-model="formData[field.key]"
                type="checkbox"
                class="form-check-input"
              />
              <label :for="`config-${field.key}`" class="form-check-label">
                {{ field.label }}
              </label>
            </div>
            <small v-if="field.description" class="form-text text-muted ms-4">{{ field.description }}</small>
          </div>
        </div>

        <!-- Validation Summary -->
        <div v-if="hasErrors" class="alert alert-danger" role="alert" aria-live="polite">
          <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
          <strong>Validation Errors:</strong> Please fix the errors above before saving.
        </div>

        <!-- Config modified indicator -->
        <div v-else-if="isModified" class="alert alert-info mt-4" role="status">
          <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
          Configuration has been modified from defaults.
        </div>
        
        <!-- Keyboard shortcuts hint -->
        <div class="mt-3 text-muted small text-center" role="status">
          <i class="bi bi-keyboard me-1" aria-hidden="true"></i>
          <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to save • <kbd>Esc</kbd> to close
        </div>
      </div>

      <div v-else class="alert alert-warning" role="status">
        <i class="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>
        No configuration options available for this section type.
      </div>
    </template>

    <template #footer>
      <div class="d-flex justify-content-between align-items-center w-100">
        <!-- Left side: Template actions -->
        <div class="btn-group">
          <button
            type="button"
            class="btn btn-outline-primary"
            @click="showTemplateLibrary = true"
            title="Browse and load templates"
          >
            <i class="bi bi-folder2-open me-1"></i>
            Templates
          </button>
          <button
            v-if="configSchema"
            type="button"
            class="btn btn-outline-success"
            :disabled="hasErrors"
            @click="handleSaveAsTemplate"
            title="Save current configuration as a template"
          >
            <i class="bi bi-bookmark-plus me-1"></i>
            Save as Template
          </button>
        </div>

        <!-- Right side: Standard actions -->
        <div class="btn-group">
          <button
            v-if="configSchema"
            type="button"
            class="btn btn-outline-secondary"
            @click="resetToDefaults"
            :title="isModified ? 'Reset to default values' : 'Already using default values'"
            :disabled="!isModified"
            aria-label="Reset configuration to default values"
          >
            <i class="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>
            Reset to Defaults
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="hasErrors || isSaving"
            @click="handleSave"
            :title="hasErrors ? 'Fix validation errors first' : 'Save configuration (Ctrl+Enter)'"
            :aria-busy="isSaving"
          >
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i v-else class="bi bi-check-lg me-1" aria-hidden="true"></i>
            {{ isSaving ? 'Saving...' : 'Save Configuration' }}
          </button>
        </div>
      </div>
    </template>
  </BaseModal>

  <!-- Template Library Modal -->
  <TemplateLibraryModal
    :visible="showTemplateLibrary"
    :section-type="sectionType || undefined"
    :current-configuration="formData"
    @close="showTemplateLibrary = false"
    @apply="handleTemplateApply"
  />

  <!-- Save Template Modal -->
  <BaseModal
    :visible="showSaveTemplateModal"
    title="Save as Template"
    @close="closeSaveTemplateModal"
  >
    <template #body>
      <div class="mb-3">
        <label class="form-label">Template Name <span class="text-danger">*</span></label>
        <input
          v-model="templateForm.name"
          type="text"
          class="form-control"
          placeholder="e.g., Heavy Transport Settings"
        >
      </div>
      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea
          v-model="templateForm.description"
          class="form-control"
          rows="2"
          placeholder="Brief description of what this template is for..."
        ></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Tags (comma-separated)</label>
        <input
          v-model="templateForm.tagsInput"
          type="text"
          class="form-control"
          placeholder="e.g., bridges, heavy-transport, conservative"
        >
      </div>
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        This will save your current configuration for reuse in other reports.
      </div>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="closeSaveTemplateModal">
        Cancel
      </button>
      <button 
        class="btn btn-primary" 
        :disabled="!templateForm.name"
        @click="saveTemplate"
      >
        <i class="bi bi-bookmark-check me-1"></i>
        Save Template
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { SectionType, SectionConfiguration, ConfigField } from '@/types/report';
import type { ConfigTemplate } from '@/types/configTemplate';
import { getSectionConfigSchema, getDefaultConfiguration } from './config/sectionConfigSchemas';
import { validateField } from './config/validationRules';
import { useConfigTemplateStore } from '@/stores/configTemplateStore';
import BaseModal from '@/components/ui/BaseModal.vue';
import TemplateLibraryModal from './TemplateLibraryModal.vue';

const props = defineProps<{
  show: boolean;
  sectionType: SectionType | null;
  sectionTitle: string;
  currentConfiguration: SectionConfiguration;
}>();

const emit = defineEmits<{
  close: [];
  save: [config: SectionConfiguration];
}>();

const templateStore = useConfigTemplateStore();

const formData = ref<Record<string, unknown>>({});
const originalConfig = ref<SectionConfiguration>({});
const showTemplateLibrary = ref(false);
const showSaveTemplateModal = ref(false);
const templateForm = ref({
  name: '',
  description: '',
  tagsInput: ''
});
const isSaving = ref(false);
const modalRef = ref<HTMLElement | null>(null);
const firstInputRef = ref<HTMLElement | null>(null);

const configSchema = computed(() => {
  if (!props.sectionType) return null;
  return getSectionConfigSchema(props.sectionType);
});

const isModified = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalConfig.value);
});

// Validation
const fieldErrors = ref<Record<string, string[]>>({});

const hasErrors = computed(() => {
  return Object.values(fieldErrors.value).some(errors => errors.length > 0);
});

// Visible fields (conditional visibility)
const visibleFields = computed(() => {
  if (!configSchema.value) return [];
  return configSchema.value.fields.filter(field => {
    if (!field.visibleWhen) return true;
    return field.visibleWhen(formData.value);
  });
});

// Validate all fields
function validateAllFields() {
  const errors: Record<string, string[]> = {};
  
  if (!configSchema.value) return;
  
  for (const field of visibleFields.value) {
    const rules = field.validationRules || [];
    
    // Add required rule if specified
    if (field.required && !rules.some(r => r.type === 'required')) {
      rules.unshift({
        type: 'required',
        message: `${field.label} is required`
      });
    }
    
    if (rules.length > 0) {
      const fieldValidationErrors = validateField(
        field.key,
        formData.value[field.key],
        rules,
        formData.value
      );
      
      if (fieldValidationErrors.length > 0) {
        errors[field.key] = fieldValidationErrors;
      }
    }
  }
  
  fieldErrors.value = errors;
}

// Watch form data for changes and validate
watch(
  () => formData.value,
  () => {
    validateAllFields();
  },
  { deep: true }
);

// Initialize form data when modal opens or section changes
watch(
  () => [props.show, props.sectionType],
  ([isShown]) => {
    if (isShown && props.sectionType) {
      const defaults = getDefaultConfiguration(props.sectionType);
      const current = { ...defaults, ...props.currentConfiguration };
      formData.value = { ...current };
      originalConfig.value = { ...current };
      // Validate on init
      setTimeout(() => validateAllFields(), 0);
      
      // Focus first input after modal opens
      setTimeout(() => {
        const firstInput = document.querySelector<HTMLElement>('.section-config-form input, .section-config-form select, .section-config-form textarea');
        firstInput?.focus();
      }, 100);
    }
  },
  { immediate: true }
);

// Keyboard shortcuts
function handleKeydown(event: KeyboardEvent) {
  // Save on Ctrl/Cmd + Enter
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (!hasErrors.value && props.show) {
      event.preventDefault();
      handleSave();
    }
  }
  
  // Close on Escape (already handled by BaseModal, but we add extra logic)
  if (event.key === 'Escape' && props.show) {
    if (showTemplateLibrary.value) {
      showTemplateLibrary.value = false;
      event.stopPropagation();
    } else if (showSaveTemplateModal.value) {
      closeSaveTemplateModal();
      event.stopPropagation();
    }
  }
}

// Add/remove keyboard listener
watch(() => props.show, (isShown) => {
  if (isShown) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
    isSaving.value = false;
  }
});

function handleClose() {
  emit('close');
}

function handleSave() {
  if (hasErrors.value) {
    // Scroll to first error
    const firstError = document.querySelector('.invalid-feedback');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  
  isSaving.value = true;
  
  // Simulate save delay for UX feedback
  setTimeout(() => {
    emit('save', { ...formData.value });
    emit('close');
    isSaving.value = false;
    
    // Show success notification (would integrate with toast system)
    console.log('✓ Configuration saved successfully');
  }, 300);
}

function resetToDefaults() {
  if (confirm('Reset all settings to defaults? This cannot be undone.')) {
    if (props.sectionType) {
      formData.value = { ...getDefaultConfiguration(props.sectionType) };
    }
  }
}

// Template functions
function handleSaveAsTemplate() {
  showSaveTemplateModal.value = true;
}

function saveTemplate() {
  if (!props.sectionType || !templateForm.value.name) return;

  const tags = templateForm.value.tagsInput
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  templateStore.createTemplate({
    name: templateForm.value.name,
    description: templateForm.value.description,
    sectionType: props.sectionType,
    configuration: { ...formData.value },
    tags
  });

  closeSaveTemplateModal();
  
  // Show success message (would integrate with toast system)
  console.log(`✓ Template "${templateForm.value.name}" saved successfully!`);
}

function closeSaveTemplateModal() {
  showSaveTemplateModal.value = false;
  templateForm.value = {
    name: '',
    description: '',
    tagsInput: ''
  };
}

function handleTemplateApply(template: ConfigTemplate) {
  // Apply template configuration to form
  formData.value = { ...template.configuration };
  
  // Validate after applying
  setTimeout(() => validateAllFields(), 0);
  
  // Show success message
  console.log(`✓ Template "${template.name}" applied successfully`);
}
</script>

<style scoped>
.section-config-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.form-label {
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.multiselect-options {
  padding: var(--spacing-xs);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
}

.form-check {
  padding: var(--spacing-2xs) 0;
}

/* Custom scrollbar for long option lists */
.multiselect-options::-webkit-scrollbar,
.section-config-form::-webkit-scrollbar {
  width: 8px;
}

.multiselect-options::-webkit-scrollbar-track,
.section-config-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.multiselect-options::-webkit-scrollbar-thumb,
.section-config-form::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.multiselect-options::-webkit-scrollbar-thumb:hover,
.section-config-form::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
    animation: none;
  }
}

/* Keyboard shortcut styling */
kbd {
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-2xs) var(--spacing-xs);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  box-shadow: 0 1px 0 var(--border);
}
</style>
