<template>
    <div class="route-report-v2 d-flex h-100 w-100" v-if="checkFeatureAccess('report_generation')">
        <!-- Sidebar (Spine) -->
        <!-- Sidebar (Spine) -->
        <ReportSidebar 
            class="flex-shrink-0 border-end transition-width" 
            :style="{ width: sidebarWidth + 'px' }"
            :collapsed="isSidebarCollapsed"
            @toggle-collapse="toggleSidebar"
        />

        <!-- Main Content (Header + Editor Stream) -->
        <div class="d-flex flex-column flex-grow-1 h-100" style="min-width: 0;">
            
            <!-- Header -->
            <div class="report-header p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                <div class="header-left d-flex align-items-center gap-3">
                    <!-- Clean minimal status display -->
                     <div class="d-flex align-items-center gap-2">
                         <span class="badge bg-light text-dark border fw-normal">{{ store.activeReport?.metadata.reportType }}</span>
                         <span v-if="store.activeReport?.metadata.status === 'Frozen'" class="badge bg-info text-white">Frozen</span>
                         <span v-else class="badge bg-secondary text-white">{{ store.activeReport?.metadata.status }}</span>
                         <span class="text-muted small ms-1">{{ store.activeReport?.metadata.revision }}</span>
                    </div>
                </div>

                <div class="header-actions d-flex align-items-center gap-2">
                    <div v-if="store.isDirty" class="text-warning small d-flex align-items-center me-2">
                        <i class="bi bi-circle-fill me-1" style="font-size: 8px;"></i> Unsaved Changes
                    </div>

                    <BaseButton variant="secondary" size="small" @click="handleSaveAsTemplate" title="Reuse this structure for future reports">
                         <i class="bi bi-save me-1"></i> Save as Template
                    </BaseButton>

                    <BaseButton variant="ghost" size="small" @click="handlePreview">
                        <i class="bi bi-eye"></i> {{ t('preview') }}
                    </BaseButton>

                    <BaseButton variant="ghost" size="small" @click="saveReport" :disabled="!store.isDirty">
                         <i class="bi bi-save"></i> {{ t('save') }}
                    </BaseButton>

                    <div class="dropdown">
                        <BaseButton variant="primary" class="dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            {{ t('actions') }}
                        </BaseButton>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                            <li><h6 class="dropdown-header">Export</h6></li>
                            <li>
                                <button class="dropdown-item" @click="generatePDF" :disabled="!store.isReportValid">
                                    <i class="bi bi-file-earmark-pdf text-danger"></i> View PDF
                                </button>
                            </li>
                             <!-- Validation Feedback in Dropdown if invalid -->
                            <li v-if="!store.isReportValid" class="px-3 py-1">
                                <small class="text-danger">
                                    <i class="bi bi-exclamation-triangle"></i> Complete required sections
                                </small>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <router-link class="dropdown-item" :to="`/routes/${route.params.id}/reports`">
                                    <i class="bi bi-arrow-left"></i> Back to Reports
                                </router-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Editor Stream -->
            <div class="editor-area flex-grow-1 h-100 bg-light position-relative">
                 <ReportEditor />
            </div>
        </div>

        <!-- Preview Modal -->
        <div v-if="showPreview" class="modal-backdrop preview-fullscreen" @click="showPreview = false">
            <div class="modal-content preview-modal-fullscreen" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('reportPreview') }}</h5>
                    <div class="preview-actions">
                        <BaseButton variant="ghost" size="small" @click="showPreview = false">
                            <i class="bi bi-x-lg"></i>
                        </BaseButton>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="preview-content" v-html="previewContent"></div>
                </div>
                <div class="modal-footer">
                    <BaseButton variant="secondary" leftIcon="bi bi-x-lg" @click="showPreview = false">
                        {{ t('close') }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, inject, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReportStore } from '@/stores/reportStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useSubscription } from "@/composables/subscription/useSubscription";
import { useI18n } from 'vue-i18n';
import type { ReportModel } from '@/types/report';
import RoutesController from '@/controllers/routes/routes_controller';

import ReportSidebar from '@/components/reports/editor/ReportSidebar.vue';
import ReportEditor from '@/components/reports/editor/ReportEditor.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

import { MASLUtility } from "@/utils/masl_utility";

const { t } = useI18n();
const { checkFeatureAccess } = useSubscription();
const route = useRoute();
const router = useRouter();
const store = useReportStore();
const templateStore = useTemplateStore();

const isSidebarCollapsed = ref(false);
const sidebarWidth = computed(() => isSidebarCollapsed.value ? 60 : 320); // Optimized from 350 to 320

const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

interface ReportRecord {
    ReportData?: string;
    routeId?: string;
    id?: string;
    createdAt?: string;
    updatedAt?: string;
}

const setGlobalLoading = inject('setGlobalLoading') as (val: boolean) => void;
const showMessage = inject('showMessage') as (msg: { status: string; message: string }) => void;
const rawReportRecord = ref<ReportRecord | null>(null); // Keep original record for updates

// Save as Template Handler
const handleSaveAsTemplate = async () => {
    if (!store.activeReport) return;
    
    const reportTitle = store.activeReport.metadata?.title || 'Untitled Report';
    const draftName = `${reportTitle} Template`;
    
    // Construct simplified snapshot MOCK
    const snapshot = {
        steps: [
            { id: 'step_survey', title: 'Survey Data', enabled: true, required: true, order: 0 },
            { id: 'step_media', title: 'Media Upload', enabled: true, required: false, order: 1 }
        ],
        sections: store.activeReport.sections.map((s, idx: number) => ({
            id: s.id || `sec_${idx}`,
            title: s.title,
            enabled: s.enabled,
            required: s.required || false,
            order: idx
        })),
        branding: {
            coverPreset: 'A',
            headerFooterPreset: 'A',
            signaturePreset: 'Simple'
        }
    };

    try {
        const newTemplate = await templateStore.createTemplate({
            name: draftName,
            reportType: store.activeReport.metadata?.reportType || 'route_assessment',
            scope: 'client', 
            snapshot: snapshot
        });
        
        // Show confirmation toast before redirecting (or instead of redirecting immediately if preferred, but following flow)
        showMessage({ status: 'success', message: "Template draft created. You can edit and publish it now." });
        
        // Small delay to let user read toast if we were not redirecting immediately, 
        // but here we redirect. In a real app the toast persistance handles this.
        router.push(`/admin/templates/${newTemplate.id}`);
    } catch (e) {
        console.error("Failed to save as template", e);
        showMessage({ status: 'error', message: "Failed to create template draft." });
    }
}

// Preview State
const showPreview = ref(false);
const previewContent = ref("");

onMounted(async () => {
    await loadReport();
});

const loadReport = async () => {
    setGlobalLoading(true);
    try {
        const routeId = route.params.id as string;
        
        // Fetch both report data and route details (for title/metadata)
        const [reportRes, routeRes] = await Promise.all([
            RoutesController.getRouteReportData(routeId),
            RoutesController.getRoute(routeId)
        ]);
        
        const routeTitle = routeRes.result && routeRes.data?.title 
            ? `${routeRes.data.title} Report` 
            : `Route Report - ${routeId}`;

        // Set current route ID for persistence context
        store.setCurrentRouteId(routeId);

        interface LoadedReportData {
            metadata?: Record<string, unknown>;
            sections?: Array<Record<string, unknown>>;
            version?: string;
        }

        let loadedData: LoadedReportData | null = null;
        if (reportRes.result && reportRes.data) {
            rawReportRecord.value = reportRes.data;
            try {
                if (reportRes.data.reportData && reportRes.data.reportData !== "undefined") {
                    loadedData = JSON.parse(reportRes.data.reportData);
                }
            } catch (e) {
                console.warn('Failed to parse report JSON', e);
            }
        }

        // Check if it's the new schema (has metadata and sections)
        if (loadedData && loadedData.sections && loadedData.metadata) {
            // Hydrate store directly - trust that parsed JSON matches ReportModel shape
            store.activeReport = loadedData as unknown as ReportModel; 
            store.isDirty = false;
        } else {
            // Legacy data or Empty -> Initialize New Canonical Report
            store.initializeReport('Desktop Route Review', {
                title: routeTitle,
                routeOrigin: routeRes.data?.start || '',
                routeDestination: routeRes.data?.end || '',
            });
        }

        // Attempt to restore unsaved changes from backup (overrides backend if exists)
        if (store.loadFromBackup(routeId)) {
            showMessage({ status: 'info', message: 'Restored unsaved changes from backup.' });
        }

    } catch (error) {
        console.error('Error loading report:', error);
        showMessage({ status: 'error', message: 'Failed to load report data' });
    } finally {
        setGlobalLoading(false);
    }
};

const saveReport = async () => {
    const report = store.activeReport;
    if (!report) return;
    
    setGlobalLoading(true);
    try {
        const routeId = route.params.id as string;
        
        const payload = {
            RouteId: routeId,
            ReportData: JSON.stringify({
                ...rawReportRecord.value, // Keep other backend fields if any
                metadata: report.metadata,
                sections: report.sections,
                sectionOrder: report.sectionOrder, 
                version: '2.0-canonical'
            })
        };

        const res = await RoutesController.updateRouteReportData(payload);
        
        if (res.result) {
            store.isDirty = false;
            store.clearBackup(); // Clear backup after successful save
            showMessage({ status: 'success', message: 'Report saved.' });
        } else {
             showMessage({ status: 'error', message: 'Save failed.' });
        }

    } catch (error) {
        console.error('Error saving:', error);
        showMessage({ status: 'error', message: 'Error saving report' });
    } finally {
        setGlobalLoading(false);
    }
};

const handlePreview = async () => {
    const report = store.activeReport;
    if (!report) return;

    setGlobalLoading(true);
    try {
        // Construct raw HTML from sections
        const rawContent = report.sections
            .filter(s => s.enabled)
            .map(s => `<div class="report-section mb-5">
                <h1 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">${s.title}</h1>
                <div class="section-content mt-3">${s.content}</div>
            </div>`)
            .join('\n');

        const routeId = route.params.id as string;
        // Parse MASL variables
        const processed = await MASLUtility.parseMASL(rawContent, routeId);
        
        previewContent.value = processed.replaceAll("https://localhost", "http://localhost");
        showPreview.value = true;
    } catch (error) {
        console.error('Preview error:', error);
        showMessage({ status: 'error', message: 'Failed to generate preview' });
    } finally {
        setGlobalLoading(false);
    }
};

import ReportingController from '@/controllers/reporting/reporting_controller';

// ... (other imports remain)

// ...

const generatePDF = async () => {
    const report = store.activeReport;
    if (!report) return;
    const routeId = route.params.id as string;

    if (!store.isReportValid) {
         showMessage({ status: 'error', message: 'Report is incomplete. Please check required sections.' });
         return;
    }
    
    await saveReport();
    
    setGlobalLoading(true);
    try {
         // Call the local PDF generation service via Controller
         const payload = {
            metadata: report.metadata,
            sections: report.sections.filter(s => s.enabled),
            routeId: routeId
         };
         
         const response = await ReportingController.renderPdf(routeId, payload);

         if (response.result) {
             const blob = response.data;
             // Create blob URL for viewer
             const blobUrl = window.URL.createObjectURL(blob);
             
             // Base64 encode the URL string for passing in query params
             const encodedUrl = btoa(blobUrl);
             
             // Navigate to viewer
             router.push({
                 name: 'PdfViewer',
                 query: {
                     url: encodedUrl,
                     title: `${report.metadata?.title || 'Route Report'}`, // better title
                 }
             });
             
             showMessage({ status: 'success', message: 'Opening PDF Viewer...' });
         } else {
             throw new Error(response.message || 'Server returned error');
         }
    } catch (error) {
        let msg = 'Error generating PDF';
        if (error instanceof Error) msg = error.message;
        showMessage({ status: 'error', message: msg });
    } finally {
        setGlobalLoading(false);
    }
}
</script>

<style scoped>
.route-report-v2 {
    height: calc(100vh - 60px); /* Adjust for Main Navbar if needed */
    overflow: hidden;
}
.transition-width {
    transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.editor-area {
    overflow: hidden;
}

/* Preview Modal Styles */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(0 0 0 / 50%);
    z-index: 1050;
    display: flex;
    justify-content: center;
    align-items: center;
}

.preview-modal-fullscreen {
    width: 90vw;
    height: 90vh;
    background: white;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
}

.modal-header {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    background: #f8f9fa;
}

.preview-content {
    background: white;
    padding: 40px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    min-height: 100%;
}

.modal-footer {
    padding: 1rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
}
</style>