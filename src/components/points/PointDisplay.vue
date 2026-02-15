<template>
    <div class="point-display">
        <component ref="displayComponentRef" :is="displayComponent" :point="point" :is-edit="isEdit" @save="onSave"
            @cancel="onCancel" v-if="displayComponent" />
        <div v-else class="no-data">
            <p>No point data available</p>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import BridgePointDisplay from './BridgePointDisplay.vue';
import PowerlinePointDisplay from './PowerlinePointDisplay.vue';
import IntersectionPointDisplay from './IntersectionPointDisplay.vue';
import GenericPointDisplay from './GenericPointDisplay.vue';

const props = defineProps({
    point: {
        type: Object,
        required: true
    },
    isEdit: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['save', 'cancel']);

const displayComponentRef = ref(null);

const onSave = (data) => {
    emit('save', data);
};

const onCancel = () => {
    emit('cancel');
};

const saveChanges = () => {
    if (displayComponentRef.value && displayComponentRef.value.saveChanges) {
        displayComponentRef.value.saveChanges();
    }
};

// Expose the saveChanges method to parent components
defineExpose({
    saveChanges
});

const displayComponent = computed(() => {
    if (!props.point) return null;

    switch (props.point.type) {
        case 'bridge':
            return BridgePointDisplay;
        case 'powerline':
            return PowerlinePointDisplay;
        case 'intersection':
            return IntersectionPointDisplay;
        case 'road':
        case 'overhead':
        case 'railroad':
        case 'custom':
        default:
            return GenericPointDisplay;
    }
});
</script>

<style scoped>
.point-display {
    width: 100%;
}

.no-data {
    padding: 2rem;
    text-align: center;
    color: var(--bs-secondary);
}
</style>
