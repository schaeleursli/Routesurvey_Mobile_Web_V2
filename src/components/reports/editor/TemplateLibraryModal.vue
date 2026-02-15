<template>
  <BaseModal
    :visible="visible"
    title="Configuration Template Library"
    size="xlarge"
    @close="$emit('close')"
  >
    <template #body>
      <div class="template-library">
        <!-- Search and Filters -->
        <div class="library-controls mb-4">
          <div class="row g-3">
            <div class="col-md-6">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Search templates..."
              >
            </div>
            <div class="col-md-3">
              <select v-model="filterType" class="form-select">
                <option value="all">All Templates</option>
                <option value="default">Default Templates</option>
                <option value="user">My Templates</option>
              </select>
            </div>
            <div class="col-md-3">
              <button class="btn btn-primary w-100" @click="showCreateModal = true">
                <i class="bi bi-plus-lg me-1"></i>
                New Template
              </button>
            </div>
          </div>
        </div>

        <!-- Template List -->
        <div v-if="filteredTemplates.length === 0" class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          No templates found matching your criteria.
        </div>

        <div v-else class="template-grid">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
            :class="{ 'selected': selectedTemplateId === template.id }"
            @click="selectTemplate(template.id)"
          >
            <!-- Header -->
            <div class="card-header d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-1">
                  {{ template.name }}
                  <span v-if="template.isDefault" class="badge bg-primary ms-2">Default</span>
                  <span v-if="template.isShared" class="badge bg-success ms-2">Shared</span>
                </h6>
                <small class="text-muted">{{ template.description }}</small>
              </div>
              <div class="dropdown" @click.stop>
                <button
                  class="btn btn-sm btn-outline-secondary dropdown-toggle"
                  type="button"
                  :id="`dropdown-${template.id}`"
                  data-bs-toggle="dropdown"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <button class="dropdown-item" @click="applyTemplate(template)">
                      <i class="bi bi-check2 me-2"></i>
                      Apply Template
                    </button>
                  </li>
                  <li>
                    <button class="dropdown-item" @click="duplicateTemplate(template.id)">
                      <i class="bi bi-files me-2"></i>
                      Duplicate
                    </button>
                  </li>
                  <li v-if="!template.isDefault">
                    <button class="dropdown-item" @click="editTemplate(template)">
                      <i class="bi bi-pencil me-2"></i>
                      Edit
                    </button>
                  </li>
                  <li>
                    <button class="dropdown-item" @click="exportSingleTemplate(template.id)">
                      <i class="bi bi-download me-2"></i>
                      Export
                    </button>
                  </li>
                  <li v-if="!template.isDefault"><hr class="dropdown-divider"></li>
                  <li v-if="!template.isDefault">
                    <button class="dropdown-item text-danger" @click="deleteTemplate(template.id)">
                      <i class="bi bi-trash me-2"></i>
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Body -->
            <div class="card-body">
              <div class="template-meta">
                <div class="meta-item">
                  <i class="bi bi-folder me-1"></i>
                  <small>{{ formatSectionType(template.sectionType) }}</small>
                </div>
                <div v-if="template.tags && template.tags.length > 0" class="meta-item">
                  <i class="bi bi-tags me-1"></i>
                  <small>
                    <span v-for="tag in template.tags" :key="tag" class="badge bg-light text-dark me-1">
                      {{ tag }}
                    </span>
                  </small>
                </div>
                <div class="meta-item">
                  <i class="bi bi-clock me-1"></i>
                  <small>{{ formatDate(template.updatedAt) }}</small>
                </div>
              </div>

              <!-- Config Preview -->
              <div class="config-preview mt-2">
                <small class="text-muted">
                  {{ getConfigPreview(template.configuration) }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-outline-secondary" @click="handleImport">
        <i class="bi bi-upload me-1"></i>
        Import Templates
      </button>
      <button class="btn btn-outline-secondary" @click="handleExport">
        <i class="bi bi-download me-1"></i>
        Export All
      </button>
      <button class="btn btn-secondary" @click="$emit('close')">
        Close
      </button>
    </template>
  </BaseModal>

  <!-- Create/Edit Template Modal -->
  <BaseModal
    :visible="showCreateModal"
    :title="editingTemplate ? 'Edit Template' : 'Create Template'"
    @close="closeCreateModal"
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
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="closeCreateModal">
        Cancel
      </button>
      <button 
        class="btn btn-primary" 
        :disabled="!templateForm.name"
        @click="saveNewTemplate"
      >
        <i class="bi bi-check-lg me-1"></i>
        {{ editingTemplate ? 'Update' : 'Create' }} Template
      </button>
    </template>
  </BaseModal>

  <!-- Hidden file input for import -->
  <input
    ref="fileInput"
    type="file"
    accept=".json"
    style="display: none"
    @change="handleFileImport"
  >
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useConfigTemplateStore } from '@/stores/configTemplateStore';
import type { ConfigTemplate, CreateTemplateInput } from '@/types/configTemplate';
import type { SectionType, SectionConfiguration } from '@/types/report';
import BaseModal from '@/components/ui/BaseModal.vue';

const props = defineProps<{
  visible: boolean;
  sectionType?: SectionType;
  currentConfiguration?: SectionConfiguration;
}>();

const emit = defineEmits<{
  close: [];
  apply: [template: ConfigTemplate];
}>();

const templateStore = useConfigTemplateStore();

// State
const searchQuery = ref('');
const filterType = ref<'all' | 'default' | 'user'>('all');
const selectedTemplateId = ref<string | null>(null);
const showCreateModal = ref(false);
const editingTemplate = ref<ConfigTemplate | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const templateForm = ref({
  name: '',
  description: '',
  tagsInput: ''
});

// Computed
const filteredTemplates = computed(() => {
  let templates = props.sectionType
    ? templateStore.templatesBySectionType(props.sectionType)
    : templateStore.templates;

  if (filterType.value === 'default') {
    templates = templates.filter(t => t.isDefault);
  } else if (filterType.value === 'user') {
    templates = templates.filter(t => !t.isDefault);
  }

  if (searchQuery.value) {
    templates = templateStore.filterTemplates({
      searchQuery: searchQuery.value,
      sectionType: props.sectionType
    });
  }

  return templates;
});

// Methods
function selectTemplate(id: string) {
  selectedTemplateId.value = id;
}

function applyTemplate(template: ConfigTemplate) {
  emit('apply', template);
  emit('close');
}

function editTemplate(template: ConfigTemplate) {
  editingTemplate.value = template;
  templateForm.value = {
    name: template.name,
    description: template.description,
    tagsInput: template.tags?.join(', ') || ''
  };
  showCreateModal.value = true;
}

function duplicateTemplate(id: string) {
  const duplicate = templateStore.duplicateTemplate(id);
  if (duplicate) {
    selectedTemplateId.value = duplicate.id;
  }
}

function deleteTemplate(id: string) {
  if (confirm('Are you sure you want to delete this template?')) {
    templateStore.deleteTemplate(id);
  }
}

function exportSingleTemplate(id: string) {
  const json = templateStore.exportTemplates([id]);
  downloadJSON(json, `template-${id}.json`);
}

function handleExport() {
  const json = templateStore.exportTemplates();
  downloadJSON(json, 'config-templates.json');
}

function handleImport() {
  fileInput.value?.click();
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    const { success, errors } = templateStore.importTemplates(result);
    
    if (errors.length > 0) {
      alert(`Import completed with ${errors.length} error(s):\n${errors.join('\n')}`);
    } else {
      alert(`Successfully imported ${success} template(s)`);
    }
  };
  reader.readAsText(file);
  
  // Reset input
  target.value = '';
}

function closeCreateModal() {
  showCreateModal.value = false;
  editingTemplate.value = null;
  templateForm.value = {
    name: '',
    description: '',
    tagsInput: ''
  };
}

function saveNewTemplate() {
  if (!props.sectionType || !props.currentConfiguration) {
    alert('Cannot create template: section type or configuration not available');
    return;
  }

  const tags = templateForm.value.tagsInput
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  if (editingTemplate.value) {
    // Update existing
    templateStore.updateTemplate({
      id: editingTemplate.value.id,
      name: templateForm.value.name,
      description: templateForm.value.description,
      tags
    });
  } else {
    // Create new
    const input: CreateTemplateInput = {
      name: templateForm.value.name,
      description: templateForm.value.description,
      sectionType: props.sectionType,
      configuration: { ...props.currentConfiguration },
      tags
    };
    
    templateStore.createTemplate(input);
  }

  closeCreateModal();
}

// Utilities
function formatSectionType(type: SectionType): string {
  return type.replace(/_/g, ' ');
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}

function getConfigPreview(config: SectionConfiguration): string {
  const keys = Object.keys(config);
  const preview = keys.slice(0, 3).map(key => {
    const value = config[key];
    if (Array.isArray(value)) {
      return `${key}: ${value.length} items`;
    }
    return `${key}: ${value}`;
  });
  
  return preview.join(', ') + (keys.length > 3 ? '...' : '');
}

function downloadJSON(jsonString: string, filename: string) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.template-library {
  min-height: 400px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.template-card {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #0d6efd;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.template-card.selected {
  border-color: #0d6efd;
  border-width: 2px;
  box-shadow: 0 0 0 0.2rem rgb(13 110 253 / 25%);
}

.template-card .card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
}

.template-card .card-body {
  padding: 0.75rem 1rem;
}

.template-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
}

.config-preview {
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
  border: 1px solid #e9ecef;
  font-family: monospace;
  font-size: 0.75rem;
}

.library-controls {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}
</style>
