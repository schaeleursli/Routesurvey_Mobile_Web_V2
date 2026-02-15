<template>
  <div class="survey-tab">
    <div class="row g-3">
      <div class="col-12">
        <h6 class="mb-3">Pre-Survey Checklist</h6>
        
        <div class="check-item">
            <input class="form-check-input" type="checkbox" id="clearance" v-model="internalData.clearance_checked" @change="emitChange">
            <label class="form-check-label" for="clearance">Clearance Checked</label>
        </div>

        <div class="check-item">
            <input class="form-check-input" type="checkbox" id="width" v-model="internalData.width_checked" @change="emitChange">
            <label class="form-check-label" for="width">Width Checked</label>
        </div>

        <div class="check-item">
            <input class="form-check-input" type="checkbox" id="bridges" v-model="internalData.bridges_checked" @change="emitChange">
            <label class="form-check-label" for="bridges">Bridges Checked</label>
        </div>

        <div class="check-item">
            <input class="form-check-input" type="checkbox" id="geometry" v-model="internalData.geometry_checked" @change="emitChange">
            <label class="form-check-label" for="geometry">Geometry Checked</label>
        </div>
      </div>
      
      <div class="col-12 mt-4">
        <h6 class="mb-3">Quick Observation</h6>
          <BaseFormField label="Notes">
          <input 
            class="form-control"
            v-model="internalData.notes" 
            placeholder="Add specific notes related to this survey segment..." 
            @input="emitChange"
          />
        </BaseFormField>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseFormField from '@/components/ui/BaseFormField.vue';

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
.survey-tab {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.check-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
}
</style>
