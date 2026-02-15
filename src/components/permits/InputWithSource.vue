<template>
    <div class="input-with-source">
        <div class="input-header">
            <label v-if="label">{{ label }}</label>
            <FieldSourceChip 
                v-if="meta" 
                :meta="meta"
            />
        </div>
        <slot></slot>
        <div v-if="showOverrideWarning" class="override-warning">
            <i class="bi bi-exclamation-triangle"></i>
            <span>Editing will override engineering data</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import FieldSourceChip from '@/components/permits/FieldSourceChip.vue';

const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    meta: {
        type: Object,
        default: null
    },
    showOverrideWarning: {
        type: Boolean,
        default: false
    }
});
</script>

<style scoped>
.input-with-source {
    margin-bottom: var(--spacing-md);
}

.input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.input-header label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
}

.override-warning {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    padding: 4px 8px;
    background: var(--warning-bg);
    border: 1px solid var(--warning);
    border-radius: 4px;
    font-size: 11px;
    color: var(--warning);
    font-weight: 500;
}

.override-warning i {
    font-size: 12px;
}
</style>
