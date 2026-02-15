<template>
  <div class="pdf-upload-container">
    <div class="upload-header">
      <label class="label">{{ label }}</label>
      <span class="subtext">PDF only, max 10MB</span>
    </div>

    <div v-if="!fileMetadata" class="upload-action">
      <input
        type="file"
        ref="fileInput"
        accept="application/pdf"
        @change="handleFileChange"
        class="hidden-input"
      />
      <BaseButton variant="secondary" @click="triggerUpload">
        <i class="bi bi-upload me-2"></i> Upload Drawing
      </BaseButton>
    </div>

    <div v-else class="file-preview">
      <div class="file-info">
        <i class="bi bi-file-earmark-pdf text-danger fs-4"></i>
        <div class="details">
          <span class="filename">{{ fileMetadata.filename }}</span>
          <span class="upload-date">Uploaded: {{ fileMetadata.uploadedAt }}</span>
        </div>
      </div>
      <BaseButton variant="text" color="danger" @click="removeFile">
        <i class="bi bi-trash"></i>
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const props = defineProps({
  label: {
    type: String,
    default: 'Drawings / Docs'
  },
  modelValue: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const fileMetadata = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  fileMetadata.value = newVal;
}, { deep: true });

function triggerUpload() {
  fileInput.value.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    alert('Only PDF files are allowed.');
    return;
  }

  // Mock upload - just store metadata
  const metadata = {
    filename: file.name,
    uploadedAt: new Date().toLocaleString(),
    size: file.size,
    type: file.type
  };

  fileMetadata.value = metadata;
  emit('update:modelValue', metadata);
}

function removeFile() {
  fileMetadata.value = null;
  fileInput.value.value = ''; // Reset input
  emit('update:modelValue', null);
}
</script>

<style scoped>
.pdf-upload-container {
  border: 1px dashed #ccc;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label {
  font-weight: 600;
  font-size: 0.9rem;
}

.subtext {
  font-size: 0.8rem;
  color: #666;
}

.hidden-input {
  display: none;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.details {
  display: flex;
  flex-direction: column;
}

.filename {
  font-weight: 500;
  font-size: 0.9rem;
}

.upload-date {
  font-size: 0.75rem;
  color: #888;
}
</style>
