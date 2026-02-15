<template>
    <BaseModal :visible="visible" size="fullscreen" @close="$emit('close')">
        <template #header>
            <div class="point-modal-header">
                <BaseButton 
                    v-if="showNavigation && hasPrevious" 
                    variant="ghost" 
                    size="small" 
                    @click="$emit('previous')"
                    left-icon="bi bi-chevron-left"
                    :disabled="!hasPrevious">
                    Previous
                </BaseButton>
                <div v-else class="header-spacer"></div>
                <h3 class="point-modal-title">{{ modalTitle }}</h3>
                <BaseButton 
                    v-if="showNavigation && hasNext" 
                    variant="ghost" 
                    size="small" 
                    @click="$emit('next')"
                    right-icon="bi bi-chevron-right"
                    :disabled="!hasNext">
                    Next
                </BaseButton>
                <div v-else class="header-spacer"></div>
            </div>
        </template>
        <component :is="pointFormComponent" v-if="isSpecializedForm" :is-edit="isEdit" :is-imperial="isImperial"
            :point="point" @save="onSave" @close="$emit('close')" ref="specializedFormRef" />
        
        <!-- Audit History Section -->
        <div v-if="pointHistory.length > 0 && !isEdit" class="mt-4 border-top pt-4">
            <PointHistory :history="pointHistory" />
        </div>

        <form v-else-if="!isSpecializedForm" @submit.prevent="onSave">
            <div class="point-form-content">
                <BaseFormField v-model="form.address" label="Address" type="text" placeholder="Enter address" />
                <BaseFormField v-model="form.notes" label="Notes" type="textarea" :rows="4" placeholder="Enter notes" />
            </div>
        </form>
        <template #footer>
            <BaseButton variant="secondary" size="small" @click="$emit('close')">Cancel</BaseButton>
            <BaseButton v-if="isEdit" variant="primary" size="small" @click="handleSave">Save</BaseButton>
        </template>
    </BaseModal>
</template>

<script setup>
import { reactive, watch, computed, ref, nextTick } from 'vue';
import { BaseModal, BaseButton, BaseFormField } from '@/components/ui';
import RoadPointForm from './RoadPointForm.vue';
import RailroadPointForm from './RailroadPointForm.vue';
import PowelinePointForm from './PowelinePointForm.vue';
import BridgePointForm from './BridgePointForm.vue';
import OverheadPointForm from './OverheadPointForm.vue';
import IntersectionPointForm from './IntersectionPointForm.vue';
import CustomPointForm from './CustomPointForm.vue';
import PointHistory from './PointHistory.vue';

const props = defineProps({
    visible: Boolean,
    point: Object,
    isEdit: Boolean,
    isImperial: Boolean,
    showNavigation: {
        type: Boolean,
        default: false
    },
    hasPrevious: {
        type: Boolean,
        default: false
    },
    hasNext: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['close', 'save', 'previous', 'next']);

const form = reactive({
    address: '',
    notes: ''
});

watch(() => props.point, (val) => {
    if (val) {
        form.address = val.address || '';
        form.notes = val.notes || '';
    }
}, { immediate: true });

const pointFormComponent = computed(() => {
    if (!props.point) return null;
    switch (props.point.type) {
        case 'road': return RoadPointForm;
        case 'railroad': return RailroadPointForm;
        case 'powerline': return PowelinePointForm;
        case 'bridge': return BridgePointForm;
        case 'overhead': return OverheadPointForm;
        case 'intersection': return IntersectionPointForm;
        case 'custom': return CustomPointForm;
        default: return null;
    }
});

const isSpecializedForm = computed(() => !!pointFormComponent.value);
const specializedFormRef = ref(null);

// Parse history from point data
const pointHistory = computed(() => {
    if (!props.point || !props.point.data) return [];
    try {
        const data = typeof props.point.data === 'string' ? JSON.parse(props.point.data) : props.point.data;
        return data.history || [];
    } catch (e) {
        console.error('Failed to parse point history', e);
        return [];
    }
});

const getPointTypeLabel = (type) => {
    const typeMap = {
        'bridge': 'Bridge',
        'powerline': 'Powerline',
        'overhead': 'Overhead',
        'intersection': 'Intersection',
        'road': 'Road',
        'railroad': 'Railroad',
        'custom': 'Custom'
    };
    return typeMap[type] || type || 'Point';
};

const modalTitle = computed(() => {
    if (!props.point) return 'Point Details';
    return getPointTypeLabel(props.point.type);
});

function onSave(updated) {
    emit('save', updated);
}

async function handleSave() {
    if (isSpecializedForm.value) {
        // Wait for component to be fully mounted
        await nextTick();

        // Try multiple approaches to trigger form submission
        if (specializedFormRef.value) {
            // Method 1: Try to find and submit the form element
            const formElement = specializedFormRef.value.$el?.querySelector('form');
            if (formElement) {
                formElement.requestSubmit();
                return;
            }

            // Method 2: Try to access the component's onSave method directly
            if (typeof specializedFormRef.value.onSave === 'function') {
                specializedFormRef.value.onSave();
                return;
            }

            // Method 3: Try to find a submit button and click it
            const submitButton = specializedFormRef.value.$el?.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.click();
                return;
            }
        }

        console.warn('Could not trigger save on specialized form');
    } else {
        onSave({ ...props.point, address: form.address, notes: form.notes });
    }
}
</script>

<style scoped>
/* Design System variables are now global - see /src/assets/css/design-system.css */

.point-form-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.point-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    width: 100%;
    flex: 1;
}

.header-spacer {
    width: 80px;
    flex-shrink: 0;
}

.point-modal-title {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    line-height: 1.2;
    flex: 1;
    text-align: center;
}
</style>