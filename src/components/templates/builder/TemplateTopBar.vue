<template>
    <div class="template-top-bar border-bottom bg-white px-3 py-2 d-flex justify-content-between align-items-center">
        <!-- Left: Branding & Breadcrumb -->
        <div class="d-flex align-items-center gap-3">
             <BaseButton variant="ghost" size="small" @click="$emit('back')">
                <i class="bi bi-arrow-left"></i>
            </BaseButton>
            <div>
                <div class="d-flex align-items-center gap-2">
                    <span class="text-muted small">Admin / Templates / </span>
                    <span class="fw-bold">{{ template?.name }}</span>
                    <span class="badge" :class="statusBadgeClass">{{ template?.status }}</span>
                    <span v-if="isDirty" class="badge bg-warning text-dark small">• Unsaved changes</span>
                </div>
                <div class="small text-muted" v-if="validationErrors.length > 0">
                    <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                    {{ validationErrors.length }} Issue(s) found
                </div>
            </div>
        </div>

        <!-- Right: Actions -->
        <div class="d-flex align-items-center gap-2">
            
            <BaseButton variant="ghost" @click="$emit('preview-pdf')" :disabled="generatingPdf || !template">
                <span v-if="generatingPdf" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-file-pdf"></i> 
                {{ generatingPdf ? 'Generating...' : 'Preview PDF' }}
            </BaseButton>

            <BaseButton variant="secondary" :disabled="!isDirty" @click="$emit('save')">
                Save Draft
            </BaseButton>
            
            <div class="d-flex flex-column align-items-end">
                <div class="dropdown">
                    <button class="btn btn-primary dropdown-toggle" type="button" 
                        :disabled="!isValid" 
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Publish Template
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                             <a class="dropdown-item" href="#" @click.prevent="$emit('publish')">
                                 Publish New Version (v{{ (template?.version || 0) + 1 }})
                             </a>
                        </li>
                    </ul>
                </div>
                <!-- Micro-copy -->
                <small class="text-muted mt-1" style="font-size: 0.65rem;">Available for new reports</small>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { BaseButton } from '@/components/ui';

const props = defineProps({
    template: Object,
    isDirty: Boolean,
    isValid: Boolean,
    validationErrors: Array,
    generatingPdf: Boolean
});

defineEmits(['save', 'publish', 'preview-pdf']);

const statusBadgeClass = computed(() => {
    switch(props.template?.status) {
        case 'published': return 'bg-success text-white';
        case 'draft': return 'bg-warning text-dark';
        default: return 'bg-secondary text-white';
    }
});
</script>

<style scoped>
.template-top-bar {
    height: 60px;
}
</style>
