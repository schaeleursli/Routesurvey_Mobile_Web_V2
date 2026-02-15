<template>
    <div class="template-preview border rounded bg-white shadow-sm h-100 d-flex flex-column">
        <div class="preview-header border-bottom p-2 bg-light d-flex justify-content-between align-items-center">
            <span class="small fw-bold text-uppercase text-muted">Preview: Document Outline</span>
            <div class="d-flex align-items-center gap-3">
                <span class="text-muted small">≈ {{ estimatedPageCount }} pages</span>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary active">Outline</button>
                    <button class="btn btn-outline-secondary" disabled title="Not implemented in mock">PDF</button>
                </div>
            </div>
        </div>

        <div class="preview-content p-4 overflow-auto flex-grow-1">
            <!-- Simulated Document Page -->
             <div class="document-page shadow-sm border mx-auto p-5" 
                :class="pageOrientationClass"
                :style="pageDimensions"
             >
                
                <!-- Header -->
                <div v-if="branding?.coverPreset !== 'C'" class="doc-header mb-5 p-3 border-bottom border-2" :class="headerFooterClass">
                    <div class="d-flex justify-content-between align-items-center">
                         <h3>{{ template?.name || 'Report Title' }}</h3>
                         <div class="text-muted">Header Style {{ branding?.headerFooterPreset }}</div>
                    </div>
                </div>
                
                <!-- Header for Presentation (Option C) - Simplified -->
                <div v-if="branding?.coverPreset === 'cover_presentation_c'" class="doc-header mb-4">
                    <h2 class="text-primary border-start border-5 border-primary ps-3 display-6">Slide Title / Overview</h2>
                </div>

                <!-- Sections Outline -->
                <div class="doc-body">
                    <div v-for="(section, idx) in enabledSections" :key="section.id" class="doc-section mb-4">
                        <div class="d-flex align-items-baseline gap-2">
                             <h4 :class="{'h5': template?.snapshot?.orientation === 'landscape', 'text-secondary': isSectionEmpty(section), 'text-primary': !isSectionEmpty(section)}">
                                {{ idx + 1 }}. {{ section.title }}
                             </h4>
                             <span v-if="section.required" class="badge bg-primary rounded-pill small" style="font-size: 0.6em; vertical-align: middle;">Required</span>
                             <span v-if="isSectionEmpty(section)" class="badge bg-light text-muted border small ms-2">No data yet</span>
                        </div>
                        <div class="placeholder-lines mt-2" v-if="!isSectionEmpty(section)">
                            <div class="bg-light rounded mb-1" style="height: 10px; width: 90%;"></div>
                            <div class="bg-light rounded mb-1" style="height: 10px; width: 95%;"></div>
                             <div class="bg-light rounded mb-1" style="height: 10px; width: 80%;"></div>
                        </div>
                        <div v-else class="p-4 bg-light text-center text-muted small rounded border border-dashed mt-2">
                            Section content will be added by report author
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                 <div class="doc-footer mt-5 pt-3 border-top text-center text-muted">
                    Page 1 of X • {{ branding?.orientation }}
                    <span v-if="branding?.signaturePreset !== 'None'"> • Signature: {{ branding?.signaturePreset }}</span>
                 </div>
             </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    template: Object
});

const branding = computed(() => props.template?.snapshot?.branding || {});

const enabledSections = computed(() => {
    return props.template?.snapshot?.sections?.filter(s => s.enabled) || [];
});

const estimatedPageCount = computed(() => {
    // Rough estimation: 1 page cover + 0.5 page per section
    const sectionCount = enabledSections.value.length;
    return Math.ceil(1 + (sectionCount * 0.5));
});

function isSectionEmpty(section) {
    // In a real app we'd check if specific default content is set, 
    // for now we'll simulate it based on if it's a "custom" section with no blocks (mock logic)
    return section.id.startsWith('custom_') && (!section.blocks || section.blocks.length === 0);
}

const headerFooterClass = computed(() => {
    return `header-style-${branding.value.headerFooterPreset}`;
});

const pageOrientationClass = computed(() => {
    const orient = props.template?.snapshot?.orientation || 'portrait';
    return orient === 'landscape' ? 'page-landscape' : 'page-portrait';
});

const pageDimensions = computed(() => {
    const orient = props.template?.snapshot?.orientation || 'portrait';
    if (orient === 'landscape') {
        return { maxWidth: '297mm', minHeight: '210mm' };
    }
    return { maxWidth: '210mm', minHeight: '297mm' };
});
</script>

<style scoped>
.preview-content {
    background-color: #f0f2f5; 
}
.document-page {
    background: white;
    transition: all 0.3s ease;
}
</style>
