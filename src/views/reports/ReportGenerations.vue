<template>
    <div class="report-generations" v-if="checkFeatureAccess('report_generation')">
        <BasePanel :title="$t('generatedReports')" elevation="level1" :scrollable="true" class="reports-panel">
            <template #actions-view>
                <BaseButton variant="secondary" size="medium" left-icon="bi bi-arrow-clockwise" @click="loadReports">
                    {{ $t('refresh') }}
                </BaseButton>
            </template>

            <div v-if="loading" class="loading-container">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <div v-else-if="reports.length === 0" class="no-reports">
                <div class="no-reports-content">
                    <i class="bi bi-file-earmark-text"></i>
                    <h3>{{ $t('noReportsGenerated') }}</h3>
                </div>
            </div>
            <div v-else class="reports-list">
                <BaseCard v-for="(report, index) in reports" :key="report.id"
                    :variant="getReportCardVariant(report.status)" class="report-card">
                    <template #header>
                        <div class="report-header">
                            <h3 class="report-title">{{ report.title || report.fileName || $t('untitledReport') }}</h3>
                            <div class="report-version">
                                Version {{ reports.length - index }}
                            </div>
                            <div class="report-date">
                                <i class="bi bi-calendar3 me-1"></i>
                                {{ formatDate(report.dateAdded) }}
                            </div>
                        </div>
                    </template>

                    <div class="report-content">
                        <div class="report-status" :class="report.status">
                            <i :class="getStatusIcon(report.status)" class="me-1"></i>
                            {{ report.status === '' ? $t('unknown') : $t(String(report.status).toLowerCase()) }}
                        </div>
                    </div>

                    <template #footer>
                        <div class="report-actions">
                            <BaseButton variant="secondary" size="medium" left-icon="bi bi-eye"
                                :disabled="report.status !== 'Success'" @click="openReportViewer(report)">
                                {{ $t('view') }}
                            </BaseButton>
                            <BaseButton variant="primary" size="medium" left-icon="bi bi-download"
                                :disabled="report.status !== 'Success'" @click="viewReport(report)">
                                {{ $t('download') }}
                            </BaseButton>
                        </div>
                    </template>
                </BaseCard>
            </div>
        </BasePanel>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ReportGenerationsController from '@/controllers/report_generations/report_generations_controller';
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { useI18n } from 'vue-i18n';
import { useSubscription } from "@/composables/subscription/useSubscription";
import { BasePanel, BaseCard, BaseButton } from '@/components/ui';

const { checkFeatureAccess, getData: getSubscriptionData } = useSubscription();

const { t } = useI18n();

const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');
const router = useRouter();
const route = useRoute();
const reports = ref([]);
const loading = ref(true);
const connection = ref(null);

// SignalR connection setup
const setupSignalRConnection = async () => {
    try {
        connection.value = new HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_BASE_URL}/hubs/report_generations`, {
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        connection.value.on("UserJoinedGroup", (message) => {
            console.log(message);
        })

        // Handle new report generation
        connection.value.on('ReportGenerationAdded', (newReport) => {
            // reports.value.unshift(newReport);
            // console.log(newReport);
            // if (newReport.status === "Success") {
            //     showMessage({ status: 'success', message: t('reportGeneratedSuccessfully') });
            // }
            // else if (newReport.status === "Failed") {
            //     showMessage({ status: 'error', message: t('reportFailedToGenerate') });
            // }
            loadReports();
        });

        // Handle new report generation
        connection.value.on('ReportGenerationUpdated', (newReport) => {
            // reports.value.unshift(newReport);
            // console.log(newReport);
            if (newReport.status === "Success") {
                showMessage({ status: 'success', message: t('reportGeneratedSuccessfully') });
            }
            else if (newReport.status === "Failed") {
                showMessage({ status: 'error', message: t('reportFailedToGenerate') });
            }
            loadReports();
        });

        // // Handle report deletion
        // connection.value.on('ReportDeleted', (reportId) => {
        //     reports.value = reports.value.filter(r => r.id !== reportId);
        // });

        await connection.value.start();

        connection.value.invoke('JoinRouteReportGenerationsGroup', route.params.id);
    } catch (error) {
        console.error('SignalR Connection Error:', error);
        showMessage({ status: 'error', message: 'Failed to establish real-time connection' });
    }
};

const loadReports = async () => {
    try {
        loading.value = true;
        const res = await ReportGenerationsController.getReportGenerations(route.params.id);
        reports.value = [...res].reverse();
    } catch (error) {
        console.error('Error loading reports:', error);
        showMessage({ status: 'error', message: 'Error loading reports' });
    } finally {
        loading.value = false;
    }
};

const viewReport = async (report) => {
    try {
        const fileUrl = import.meta.env.VITE_MASL_API_BASE_URL + "/" + report.filePath;

        // Fetch the file as a blob
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        const blob = await response.blob();

        // Determine the filename from report properties
        const reportName = report.title || report.fileName || t('untitledReport');

        // Get file extension from filePath or default to .pdf
        const fileExtension = report.filePath?.split('.').pop() || 'pdf';
        const fileName = `${reportName}.${fileExtension}`;

        // Create a download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading report:', error);
        showMessage({ status: 'error', message: 'Error downloading report' });
    }
};

const openReportViewer = (report) => {
    const fileUrl = import.meta.env.VITE_MASL_API_BASE_URL + "/" + report.filePath;
    const encodedUrl = window.btoa(unescape(encodeURIComponent(fileUrl)));
    const reportTitle = report.title || report.fileName || t('untitledReport');
    router.push({
        name: 'PdfViewer',
        query: {
            url: encodedUrl,
            title: reportTitle
        }
    });
};

const deleteReport = async (report) => {
    try {
        const res = await ReportGenerationsController.deleteReport(report.id);
        if (res.result) {
            showMessage({ status: 'success', message: 'Report deleted successfully' });
            await loadReports();
        }
    } catch (error) {
        console.error('Error deleting report:', error);
        showMessage({ status: 'error', message: 'Error deleting report' });
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleString();
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'completed':
            return 'bi-check-circle-fill';
        case 'processing':
            return 'bi-hourglass-split';
        case 'failed':
            return 'bi-x-circle-fill';
        default:
            return 'bi-question-circle-fill';
    }
};

const getReportCardVariant = (status) => {
    switch (status) {
        case 'Success':
        case 'completed':
            return 'success';
        case 'Failed':
        case 'failed':
            return 'error';
        case 'Processing':
        case 'processing':
            return 'warning';
        default:
            return 'default';
    }
};

onMounted(async () => {
    await Promise.all([loadReports(), setupSignalRConnection(), getSubscriptionData()]);
});

onUnmounted(async () => {
    if (connection.value) {
        try {
            await connection.value.stop();
        } catch (error) {
            console.error('SignalR Disconnection Error:', error);
        }
    }
});
</script>

<style scoped>
/* Design System Implementation */
.report-generations {
    padding: 1rem;
    height: 93vh;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    /* background: var(--bg-base); */
    color: var(--text-primary);
    overflow: hidden;
}

.reports-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 200px;
}

.loading-container .spinner-border {
    color: var(--accent);
}

.no-reports {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
}

.no-reports-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 1rem;
    max-width: 400px;
    padding: 2rem;
    background: var(--bg-surface);
    border-radius: 12px;
    border: 1px solid var(--border);
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.no-reports-content i {
    font-size: 3.5rem;
    color: var(--accent);
    opacity: 0.5;
    margin-bottom: 0.5rem;
}

.no-reports-content h3 {
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
}

.reports-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
}

.report-card {
    height: 100%;
}

.report-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.report-title {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.report-version {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
}

.report-date {
    color: var(--text-secondary);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.report-date i {
    color: var(--text-secondary);
    margin-right: 0.25rem;
}

.report-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.report-status {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.report-status i {
    margin-right: 0.25rem;
}

.report-status.completed {
    background-color: rgb(0 179 134 / 10%);
    color: var(--success);
    border: 1px solid rgb(0 179 134 / 20%);
}

.report-status.processing {
    background-color: rgb(243 156 18 / 10%);
    color: var(--warning);
    border: 1px solid rgb(243 156 18 / 20%);
}

.report-status.failed {
    background-color: rgb(232 62 140 / 10%);
    color: var(--error);
    border: 1px solid rgb(232 62 140 / 20%);
}

.report-actions {
    display: flex;
    gap: 0.5rem;
    width: 100%;
}

.report-actions .base-button {
    flex: 1;
}

/* Responsive Design */
@media (width <= 768px) {
    .report-generations {
        padding: 1rem;
    }

    .reports-list {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .report-actions {
        flex-direction: column;
    }

    .report-actions .base-button {
        width: 100%;
    }
}
</style>