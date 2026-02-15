<template>
  <div class="transport-tab">
    <div class="row g-3">
      <div class="col-12">
        <BaseFormField label="Cargo Name" required>
          <input 
            class="form-control"
            v-model="internalData.name" 
            placeholder="e.g. Transformer Unit A" 
            @input="emitChange"
          />
        </BaseFormField>
      </div>

      <div class="col-6 col-md-3">
        <BaseFormField label="Weight (kg)" required>
          <input 
            class="form-control"
            v-model.number="internalData.weight_kg" 
            type="number" 
            placeholder="0"
            @input="emitChange"
          />
        </BaseFormField>
      </div>

       <div class="col-6 col-md-3">
        <BaseFormField label="Length (m)" required>
          <input 
            class="form-control"
            v-model.number="internalData.length_m" 
             type="number" 
            placeholder="0.00"
            step="0.01"
            @input="emitChange"
          />
        </BaseFormField>
      </div>

       <div class="col-6 col-md-3">
        <BaseFormField label="Width (m)" required>
          <input 
            class="form-control"
            v-model.number="internalData.width_m" 
             type="number" 
            placeholder="0.00"
            step="0.01"
            @input="emitChange"
          />
        </BaseFormField>
      </div>

       <div class="col-6 col-md-3">
        <BaseFormField label="Height (m)" required>
          <input 
            class="form-control"
            v-model.number="internalData.height_m" 
             type="number" 
            placeholder="0.00"
            step="0.01"
            @input="emitChange"
          />
        </BaseFormField>
      </div>

      <div class="col-6 col-md-3">
        <BaseFormField label="Support Height (m)">
          <input 
            class="form-control"
            v-model.number="internalData.support_height_m" 
             type="number" 
            placeholder="0.00"
            step="0.01"
            @input="emitChange"
          />
        </BaseFormField>
      </div>
    </div>

    <hr class="my-4" />

    <div class="row">
      <div class="col-12">
        <PdfUpload 
          label="Cargo Drawings (GA)" 
          v-model="internalData.document"
          @update:modelValue="emitChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseFormField from '@/components/ui/BaseFormField.vue';
import PdfUpload from '../components/PdfUpload.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const internalData = ref({ ...props.modelValue });

watch(() => props.modelValue, (newVal) => {
  internalData.value = { ...newVal };
}, { deep: true });

function emitChange() {
  emit('update:modelValue', internalData.value);
  emit('change');
}
</script>

<style scoped>
.transport-tab {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}
</style>
