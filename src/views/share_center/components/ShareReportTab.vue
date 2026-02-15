<template>
    <div>
        <!-- Share Link Card -->
        <ShareLinkCard :last-shared-link="lastSharedLink" :links="reportRouteShares" :generating="generating"
            :disabled="!selectedReportGeneration" @generate-link="handleGenerateLink" @delete-link="handleDeleteLink"
            @copy-link="handleCopyLink" @open-qr="handleOpenQr" />

        <!-- Report Preview Card -->
        <BaseCard class="mt-2">
            <template #header>
                <div class="report-header">
                    <i class="fas fa-file-alt"></i>
                    <span>Report Preview</span>
                </div>
            </template>

            <div class="report-preview-area">
                <div v-if="reportGenerations.length > 0" class="report-generations-list">
                    <div v-for="(generation, index) in reportGenerations" :key="generation.id"
                        class="report-generation-item"
                        :class="{ 'selected': selectedReportGeneration === generation.id }"
                        @click="selectReportGeneration(generation.id)">
                        <div class="generation-selection">
                            <input type="radio" :id="'generation-' + generation.id" :value="generation.id"
                                :checked="selectedReportGeneration === generation.id"
                                @change="selectReportGeneration(generation.id)" class="generation-radio" />
                        </div>
                        <div class="generation-info">
                            <div class="generation-title">
                                {{ "Route Report V" + String(index + 1) }}
                            </div>
                            <div class="generation-meta">
                                Generated on {{ formatDate(generation.dateAdded) }}
                            </div>
                        </div>
                        <div class="generation-actions">
                            <BaseButton variant="primary" size="small" left-icon="fas fa-download"
                                @click.stop="downloadReport(generation.id)">
                                Download
                            </BaseButton>
                            <BaseButton variant="secondary" size="small" left-icon="fas fa-eye"
                                @click.stop="previewReport(generation.id)">
                                Preview
                            </BaseButton>
                        </div>
                    </div>
                </div>
                <div v-else class="report-info">
                    <div class="report-title">No Reports Generated</div>
                    <div class="report-meta">Generate a report for this route to see it here</div>
                    <!-- <div class="report-actions">
                        <BaseButton variant="primary" left-icon="fas fa-plus">
                            Generate Report
                        </BaseButton>
                    </div> -->
                </div>
            </div>
        </BaseCard>

        <!-- QR Code Modal -->
        <QRModal :visible="showQr" :value="qrCodeValue" @close="closeQr" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n';
import { inject } from 'vue';
import { BaseCard, BaseButton, BaseFormField } from '@/components/ui'
import ShareCenterController from "@/controllers/share_center/share_center_controller";
import ReportGenerationsController from "@/controllers/report_generations/report_generations_controller";
import EncryptionUtils from '@/utils/encryption_utils';
import { useRouter } from 'vue-router';
import ShareLinkCard from '@/components/share/ShareLinkCard.vue'
import QRModal from '@/components/share/QRModal.vue'

const router = useRouter();

const showMessage = inject('showMessage');
const setGlobalLoading = inject('setGlobalLoading');

const i18n = useI18n();

const props = defineProps({
    selectedRoute: {
        type: Object,
        default: null
    }
})

// Link management state
const showQr = ref(false)
const qrCodeValue = ref('')
const generating = ref(false)

const reportGenerations = ref([]);
const selectedReportGeneration = ref(null);

const reportRouteShares = ref([]);

// Mock data for last shared link
const lastSharedLink = ref(null);

// Handler methods for ShareLinkCard
const handleGenerateLink = async (linkData) => {
    generating.value = true;
    setGlobalLoading(true);

    try {
        if (linkData.requirePassword) {
            if (linkData.password.length < 6) {
                alert(i18n.t('passwordMustBeAtLeast6CharactersLong'));
                setGlobalLoading(false);
                generating.value = false;
                return;
            }
        }

        if (!selectedReportGeneration.value) {
            alert(i18n.t('pleaseSelectAReportGeneration'));
            setGlobalLoading(false);
            generating.value = false;
            return;
        }

        const linkPayload = {
            ReportGenerationId: Number(selectedReportGeneration.value),
            RouteId: Number(props.selectedRoute?.id),
            Password: linkData.requirePassword ? linkData.password : "",
            RequirePassword: linkData.requirePassword,
            ExpireDays: parseInt(linkData.expiry),
        };

        const res = await ShareCenterController.generateReportRouteShare(linkPayload);

        if (res.result) {
            showMessage({ status: "success", message: res.message });
            await getReportRouteShares();
        } else {
            showMessage({ status: "error", message: res.message });
        }
    } catch (error) {
        console.log(error);
        showMessage({ status: "error", message: error.message });
    }

    setGlobalLoading(false);
    generating.value = false;
}

const handleDeleteLink = async (id) => {
    if (!confirm('Are you sure you want to delete this link?')) {
        return;
    }

    setGlobalLoading(true);

    try {
        const res = await ShareCenterController.deleteReportRouteShare(id);

        if (res.result) {
            showMessage({ status: "success", message: res.message });
            await getReportRouteShares();
        } else {
            showMessage({ status: "error", message: res.message });
        }
    } catch (error) {
        console.log(error);
        showMessage({ status: "error", message: error.message });
    }

    setGlobalLoading(false);
}

const handleCopyLink = async (link) => {
    try {
        await navigator.clipboard.writeText(link)
        showMessage({ status: "success", message: "Link copied to clipboard" });
    } catch (e) {
        showMessage({ status: "error", message: "Failed to copy link" });
    }
}

const handleOpenQr = (url) => {
    qrCodeValue.value = url
    showQr.value = true
}

const closeQr = () => { showQr.value = false }

const previewReport = (id) => {
    try {
        const url = import.meta.env.VITE_MASL_API_BASE_URL + "/" + reportGenerations.value.filter(e => e.id === id)[0].filePath;
        const encryptedUrl = EncryptionUtils.encrypt(url);
        const routeData = router.resolve({
            path: '/pdf-viewer',
            query: { url: encryptedUrl },
        });
        window.open(routeData.href, '_blank');
    } catch (error) {
        console.log(error);
    }
}

const downloadReport = (id) => {
    try {
        console.log(reportGenerations.value);

        const url = import.meta.env.VITE_MASL_API_BASE_URL + "/" + reportGenerations.value.filter(e => e.id === id)[0].filePath;
        window.open(url, '_blank');
    } catch (error) {
        console.log(error);
    }
}

// Format date for display
const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getReportRouteShares = async () => {
    if (!props.selectedRoute) return;

    reportRouteShares.value = [];

    try {
        const res = await ShareCenterController.getReportRouteShares(Number(props.selectedRoute?.id));
        if (res.result) {
            reportRouteShares.value = res.data;

            if (reportRouteShares.value.length > 0) {
                lastSharedLink.value = reportRouteShares.value[reportRouteShares.value.length - 1];
            }
            else {
                lastSharedLink.value = null;
            }
        }
        else {
            showMessage({ status: "error", message: res.message });
        }
    } catch (error) {
        console.log(error);
        showMessage({ status: "error", message: error.message });
    }
}

const loadReportGenerations = async () => {
    try {
        const res = await ReportGenerationsController.getReportGenerations(Number(props.selectedRoute?.id));
        reportGenerations.value = res.reverse();

        // No auto-selection - user must manually select a report generation
    } catch (error) {
        console.log(error);
        reportGenerations.value = [];
    }
}

// Handle report generation selection
const selectReportGeneration = (generationId) => {
    selectedReportGeneration.value = generationId;
    console.log('Selected report generation:', generationId);
}

const getData = async () => {
    setGlobalLoading(true);

    try {
        await getReportRouteShares();
        await loadReportGenerations();
    } catch (error) {
        console.log(error);
    }

    setGlobalLoading(false);
}

watch(() => props.selectedRoute, (route) => {
    if (route) {
        getData();
    }
}, { immediate: true })
</script>

<style scoped>
.report-header {
    display: flex;
    align-items: center;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    gap: var(--spacing-sm);
    color: var(--text-primary);
}

.report-header i {
    color: var(--accent);
}

.report-preview-area {
    min-height: 200px;
    background: var(--bg-elevated);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: var(--font-size-xl);
    border: 1.5px dashed var(--border);
    width: 100%;
    position: relative;
    overflow: hidden;
    transition: all var(--transition-normal);
}

.report-preview-area:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
}

.report-generations-list {
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    padding: var(--spacing-md);
}

.report-generation-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    transition: all var(--transition-normal);
    cursor: pointer;
}

.report-generation-item:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
}

.report-generation-item.selected {
    border-color: var(--accent);
    background: rgb(0 167 225 / 5%);
    box-shadow: 0 0 0 2px rgb(0 167 225 / 10%);
}

.report-generation-item:last-child {
    margin-bottom: 0;
}

.generation-selection {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
}

.generation-radio {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--accent);
}

.generation-info {
    flex: 1;
    min-width: 0;
}

.generation-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.generation-meta {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.generation-actions {
    display: flex;
    gap: var(--spacing-sm);
    flex-shrink: 0;
}

.report-info {
    text-align: center;
    padding: var(--spacing-2xl);
}

.report-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

.report-meta {
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-lg);
}

.report-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    flex-wrap: wrap;
}

/* Responsive Design */
@media (width <= 768px) {
    .report-preview-area {
        min-height: 150px;
    }

    .report-header {
        font-size: var(--font-size-base);
    }

    .report-generation-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
    }

    .generation-selection {
        align-self: flex-start;
    }

    .generation-actions {
        width: 100%;
        justify-content: flex-start;
    }
}

@media (width <= 480px) {
    .report-preview-area {
        min-height: 120px;
    }

    .report-title {
        font-size: var(--font-size-xl);
    }

    .report-meta {
        font-size: var(--font-size-sm);
    }
}
</style>