<template>
    <div class="vehicle-load-block">
        <div class="block-section">
            <h4>Overall Transport Dimensions</h4>
            
            <InputWithSource
                label="Width"
                :meta="payload.transport.overall?._width_m_meta"
            >
                <ImperialDimensionInput
                    :modelValue="payload.transport.overall.width_m"
                    @update:modelValue="updateOverall('width_m', $event)"
                />
            </InputWithSource>
            
            <InputWithSource
                label="Height"
                :meta="payload.transport.overall?._height_m_meta"
            >
                <ImperialDimensionInput
                    :modelValue="payload.transport.overall.height_m"
                    @update:modelValue="updateOverall('height_m', $event)"
                />
            </InputWithSource>
            
            <InputWithSource
                label="Length"
                :meta="payload.transport.overall?._length_m_meta"
            >
                <ImperialDimensionInput
                    :modelValue="payload.transport.overall.length_m"
                    @update:modelValue="updateOverall('length_m', $event)"
                />
            </InputWithSource>
        </div>

        <div class="block-section">
            <h4>Weight</h4>
            
            <InputWithSource
                label="Gross Weight"
                :meta="payload.transport.overall?._gross_kg_meta"
            >
                <ImperialWeightInput
                    :modelValue="payload.transport.overall.gross_kg"
                    @update:modelValue="updateOverall('gross_kg', $event)"
                />
            </InputWithSource>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import ImperialDimensionInput from '@/components/permits/inputs/ImperialDimensionInput.vue';
import ImperialWeightInput from '@/components/permits/inputs/ImperialWeightInput.vue';
import InputWithSource from '@/components/permits/InputWithSource.vue';

const props = defineProps({
    payload: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update']);

const handleUpdate = () => {
    // Emit update to parent (legacy hook if needed, but we mostly use specific updates now)
    emit('update', props.payload);
};

const updateOverall = (field, value) => {
    // Immutable update pattern
    const newPayload = { ...props.payload };
    
    // Ensure nested objects exist
    if (!newPayload.transport) newPayload.transport = {};
    if (!newPayload.transport.overall) newPayload.transport.overall = {};
    
    // Shallow copy nested objects
    newPayload.transport = { ...newPayload.transport };
    newPayload.transport.overall = { ...newPayload.transport.overall };
    
    // Update field
    newPayload.transport.overall[field] = value;
    
    emit('update', newPayload);
};
</script>

<style scoped>
.vehicle-load-block {
    padding: var(--spacing-md);
}

.block-section {
    margin-bottom: var(--spacing-lg);
}

.block-section h4 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    padding-bottom: var(--spacing-xs);
}
</style>
