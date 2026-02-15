<template>
    <div class="template-builder-shell d-flex flex-column h-100">
        <!-- Top Bar -->
        <TemplateTopBar 
            :template="template" 
            :is-dirty="store.isDirty"
            :is-valid="store.isValid"
            :validation-errors="store.validationErrors"
            :generating-pdf="isGeneratingPdf"
            @save="store.saveDraft"
            @publish="handlePublishRequest"
            @back="router.push('/admin/templates')"
            @preview-pdf="handlePreviewPDF"
        />
        
        <div v-if="store.loading" class="flex-grow-1 d-flex justify-content-center align-items-center">
             <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else-if="!store.currentTemplate" class="p-5 text-center">
            <h3>Template not found</h3>
             <BaseButton variant="primary" @click="router.push('/admin/templates')">Go Back</BaseButton>
        </div>

        <div v-else class="builder-content d-flex flex-grow-1 overflow-hidden">
            <!-- Left Pane: Configuration -->
            <div class="config-pane d-flex flex-column border-end bg-white" style="width: 450px; min-width: 400px;">
                
                <!-- 1. Clarify what a Template is -->
                <div class="px-3 pt-3 pb-2 border-bottom bg-light bg-opacity-50">
                    <p class="m-0 text-muted small" style="line-height: 1.3;">
                        <span class="fw-bold">Template:</span> Defines structure and layout for future reports.
                        <br>Existing reports will not be affected.
                    </p>
                </div>

                <!-- Mode Switcher -->
                <div class="mode-switcher p-3 border-bottom">
                    <!-- 2. Rename mode labels -->
                    <div class="btn-group w-100 mb-2" role="group">
                        <button type="button" class="btn btn-outline-secondary" 
                            :class="{ active: currentMode === 'flow' }"
                            @click="currentMode = 'flow'">
                            <i class="bi bi-diagram-3 me-1"></i> Process
                        </button>
                        <button type="button" class="btn btn-outline-secondary"
                            :class="{ active: currentMode === 'content' }"
                            @click="currentMode = 'content'">
                            <i class="bi bi-file-text me-1"></i> Report Content
                        </button>
                        <button type="button" class="btn btn-outline-secondary"
                            :class="{ active: currentMode === 'branding' }"
                            @click="currentMode = 'branding'">
                            <i class="bi bi-palette me-1"></i> Appearance
                        </button>
                    </div>
                    <!-- Subtitle for mode -->
                     <div class="text-muted small text-center">
                        {{ modeSubtitle }}
                     </div>
                </div>

                <!-- Config Content -->
                <div class="config-body flex-grow-1 overflow-auto p-3">
                    <keep-alive>
                        <component 
                            :is="activeConfigComponent" 
                            :template="store.currentTemplate"
                            @update="store.markDirty"
                        />
                    </keep-alive>
                </div>
            </div>

            <!-- Right Pane: Preview -->
            <div class="preview-pane flex-grow-1 bg-light p-4 overflow-auto d-flex flex-column">
                 <!-- 10. Global Safety Message -->
                 <div v-if="showSafetyBanner" class="alert alert-info border-info-subtle bg-info-subtle d-flex justify-content-between align-items-center py-2 mb-3 shadow-sm">
                    <div class="small">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        Templates affect only future reports. Existing reports remain unchanged.
                    </div>
                    <button type="button" class="btn-close btn-close-white small" style="filter: none; opacity: 0.5;" aria-label="Close" @click="showSafetyBanner = false"></button>
                 </div>

                 <TemplatePreviewPanel :template="store.currentTemplate" class="flex-grow-1" />
            </div>
        </div>

        <!-- 7. Pre-publish Summary Modal -->
        <div v-if="showPublishSummary" class="modal-backdrop bg-dark bg-opacity-50 d-flex align-items-center justify-content-center" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1050;">
            <div class="modal-content bg-white rounded shadow p-0" style="width: 450px; max-width: 90%;">
                <div class="modal-header border-bottom p-3">
                    <h5 class="modal-title h6 m-0">Publish Template</h5>
                    <button type="button" class="btn-close" @click="showPublishSummary = false"></button>
                </div>
                <div class="modal-body p-4">
                    <p class="mb-3">You are about to publish <strong>{{ store.currentTemplate?.name }}</strong>.</p>
                    
                    <div class="card bg-light border-0 mb-3">
                        <div class="card-body py-2">
                             <div class="d-flex justify-content-between mb-1">
                                <span class="small text-muted">Page Orientation</span>
                                <span class="small fw-bold">{{ store.currentTemplate?.snapshot?.orientation === 'landscape' ? 'Landscape' : 'Portrait' }}</span>
                             </div>
                             <div class="d-flex justify-content-between mb-1">
                                <span class="small text-muted">Steps Enforced</span>
                                <span class="small fw-bold">{{ store.currentTemplate?.snapshot?.steps?.filter(s => s.enabled)?.length || 0 }}</span>
                             </div>
                             <div class="d-flex justify-content-between mb-1">
                                <span class="small text-muted">Required Sections</span>
                                <span class="small fw-bold">{{ store.currentTemplate?.snapshot?.sections?.filter(s => s.enabled && s.required)?.length || 0 }}</span>
                             </div>
                             <div class="d-flex justify-content-between mb-1">
                                <span class="small text-muted">Output Format</span>
                                <span class="small fw-bold">PDF</span>
                             </div>
                             <div class="d-flex justify-content-between">
                                <span class="small text-muted">Scope</span>
                                <span class="small fw-bold text-capitalize">{{ store.currentTemplate?.scope || 'Global' }}</span>
                             </div>
                        </div>
                    </div>

                    <p class="small text-muted mb-0 text-center">
                        <i class="bi bi-check-circle me-1"></i> Makes this template available for new reports
                    </p>
                </div>
                <div class="modal-footer border-top p-3 bg-light rounded-bottom d-flex justify-content-end gap-2">
                    <BaseButton variant="ghost" @click="showPublishSummary = false">Cancel</BaseButton>
                    <BaseButton variant="primary" @click="confirmPublish">Confirm Publish</BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTemplateStore } from '@/stores/templateStore';
import { BaseButton } from '@/components/ui';

// Components
import TemplateTopBar from '@/components/templates/builder/TemplateTopBar.vue';
import FlowConfig from '@/components/templates/builder/FlowConfig.vue';
import ContentConfig from '@/components/templates/builder/ContentConfig.vue';
import BrandingConfig from '@/components/templates/builder/BrandingConfig.vue';
import TemplatePreviewPanel from '@/components/templates/builder/TemplatePreviewPanel.vue';

const route = useRoute();
const router = useRouter();
const store = useTemplateStore();
const showMessage = inject('showMessage');

const currentMode = ref('flow');
const template = computed(() => store.currentTemplate);

// UI State
const showPublishSummary = ref(false);
const showSafetyBanner = ref(true); // Default to true, let user dismiss
const isGeneratingPdf = ref(false);

const activeConfigComponent = computed(() => {
    switch(currentMode.value) {
        case 'flow': return FlowConfig;
        case 'content': return ContentConfig;
        case 'branding': return BrandingConfig;
        default: return FlowConfig;
    }
});

const modeSubtitle = computed(() => {
    switch(currentMode.value) {
        case 'flow': return 'How the report is completed';
        case 'content': return 'What appears in the document';
        case 'branding': return 'How it looks to the client';
        default: return '';
    }
});

function handlePublishRequest() {
    showPublishSummary.value = true;
}

function confirmPublish() {
    store.publish();
    showPublishSummary.value = false;
}

const handlePreviewPDF = async () => {
    isGeneratingPdf.value = true;
    try {
        // Construct a mock payload using current snapshot
        const snapshot = store.currentTemplate.snapshot;
        
        // Mock sections based on snapshot for preview
        const mockSections = snapshot.sections.filter(s => s.enabled).map(s => ({
            id: s.id,
            title: s.title || s.id,
            type: 'text',
            enabled: true,
            // Enhanced placeholder with more realistic look
            content: `
                <div style="padding: 20px; border: 1px dashed #ccc; background: #f9f9f9; text-align: center; color: #666;">
                    <strong>${s.title}</strong>
                    <p style="margin-top: 10px; font-size: 0.9em;">Dynamic content will be populated here based on route data.</p>
                </div>
            ` 
        }));

        const payload = {
            metadata: {
                title: `PREVIEW: ${store.currentTemplate.name}`,
                reportType: store.currentTemplate.reportType,
                version: 'Preview',
                status: 'Draft'
            },
            sections: mockSections,
            snapshot: snapshot,
            watermark: 'TEMPLATE PREVIEW' // Feature flag for best in class
        };

        // Use environment variable for API URL
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        
        const response = await fetch(`${apiBase}/api/reports/preview-template/render-pdf`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(payload)
        });

        if (response.ok) {
             const blob = await response.blob();
             const url = window.URL.createObjectURL(blob);
             // Best Practice: Open in named window to reuse tab if possible, or use standard behavior
             window.open(url, 'rs_pdf_preview'); 
             showMessage({ status: 'success', message: 'Preview generated successfully' });
        } else {
             const err = await response.json().catch(() => ({}));
             throw new Error(err.error || 'Server rejected preview request');
        }
    } catch (e) {
        console.error("PDF Preview Error:", e);
        showMessage({ status: 'error', message: 'Failed to generate PDF preview. Check backend connection.' });
    } finally {
        isGeneratingPdf.value = false;
    }
}

onMounted(async () => {
    const id = route.params.id;
    if (id === 'new') {
        // Create new draft logic
        try {
            const newTpl = await store.createTemplate({
                name: 'New Template',
                reportType: 'route_assessment',
                scope: 'global'
            });
            // Replace URL without reload
            router.replace(`/admin/templates/${newTpl.id}`);
        } catch (e) {
            console.error("Failed to create new template", e);
        }
    } else {
        await store.loadTemplate(id);
    }
});
</script>

<style scoped>
.template-builder-shell {
    /* Ensure it takes full height of the layout container if embedded */
    height: 100vh; 
    max-height: 100vh;
}

/* Premium Segmented Control / Mode Switcher */
.mode-switcher .btn-group {
    background-color: #f1f3f5; /* Light gray track */
    padding: 4px;
    border-radius: 8px;
    border: none;
}

.mode-switcher .btn {
    border: none;
    border-radius: 6px !important; /* Pills inside */
    margin: 0 1px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #6c757d;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    overflow: hidden;
}

.mode-switcher .btn:hover {
    background-color: rgb(0 0 0 / 3%);
    color: #495057;
}

.mode-switcher .btn.active {
    background-color: white;
    color: var(--primary-color, #0d6efd);
    box-shadow: 0 2px 5px rgb(0 0 0 / 8%);
}

.mode-switcher .btn.active i {
    transform: scale(1.1);
    display: inline-block;
    transition: transform 0.2s ease;
}

/* Smooth fade for content switching */
.config-body {
    transition: opacity 0.2s ease;
}
</style>
