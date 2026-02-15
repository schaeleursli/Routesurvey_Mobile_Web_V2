<template>
    <div class="route-card" :class="{ 'selected': isSelected }">
        <!-- Header Row -->
        <div class="route-header-row">
            <div class="route-selection">
                <input type="checkbox" :checked="isSelected" @change="$emit('select', route.id)"
                    class="route-checkbox" />
            </div>
            <div class="route-title">{{ route.title }}</div>
            <div class="route-start">{{ route.start }}</div>
            <div class="route-end">{{ route.end }}</div>
            <div class="route-time">{{ new Date(route.dateAdded).toLocaleDateString() }}</div>
            <button v-if="accessAllowed" class="toggle-details-btn" @click="toggleExpanded">
                <span v-if="expanded">{{ $t('viewLess') }}</span>
                <span v-else>{{ $t('viewMore') }}</span>
            </button>
            <span v-else>{{ $t('viewMore') }}</span>
        </div>

        <!-- Collapsible Details -->
        <transition name="fade">
            <div v-if="expanded" class="route-details">
                <div class="route-summary">
                    <div class="route-summary-col">
                        <span class="badge badge-km">0.0 {{ isImperial ? $t('miles') : $t('km_label') }}</span>
                        <div class="route-address">
                            <strong>{{ $t('start') }}:</strong> {{ route.start }}
                        </div>
                    </div>
                    <div class="route-summary-col route-summary-center">
                        <div>{{ $t('distance') }}: {{ (Number(route.distance) / (isImperial ? 1609.34 :
                            1000.0)).toFixed(2) }} {{ isImperial ?
                                $t('miles') : $t('km_label')
                            }}</div>
                        <div>{{ $t('points') }}: {{ route.points }} {{ $t('points') }}</div>
                        <div>{{ $t('notes') }}: {{ route.notes }}</div>
                    </div>
                    <div class="route-summary-col">
                        <span class="badge badge-km">{{ (Number(route.distance) / (isImperial ? 1609.34 :
                            1000.0)).toFixed(2) }} {{ isImperial ?
                                $t('miles') : $t('km_label') }}</span>
                        <div class="route-address">
                            <strong>{{ $t('end') }}:</strong> {{ route.end }}
                        </div>
                    </div>
                </div>
                <div class="route-actions">
                    <BaseButton variant="danger" @click="$emit('delete', route)">{{ $t('deleteSurvey') }}</BaseButton>
                    <BaseButton variant="secondary" @click="createReport">{{ $t('reportDetails') }}</BaseButton>
                    <BaseButton variant="primary" @click="viewRoute">{{ $t('viewEditRoute') }}</BaseButton>
                </div>
                <div class="report-cards">
                    <!-- <div class="report-card">
                        <div class="report-title">{{ $t('quickReport') }} <i class="bi bi-box-arrow-up-right"></i></div>
                        <div class="report-meta">{{ $t('generatedAt') }}: 12/12/2024</div>
                        <div class="report-meta">{{ $t('fileName') }}: zzzzzz</div>
                        <div class="report-meta">{{ $t('downloadedAt') }}: 03:50PM, 12/12/2024</div>
                        <div class="report-actions">
                            <button class="btn btn-view">{{ $t('view') }}</button>
                            <button class="btn btn-download">{{ $t('download') }}</button>
                        </div>
                    </div> -->
                    <div class="report-card">
                        <div class="report-title">{{ $t('surveyReport') }} <i class="bi bi-box-arrow-up-right"></i>
                        </div>
                        <div v-if="reportGenerations.length > 0">
                            <div class="report-meta">{{ $t('generatedAt') }}: {{
                                new Date(reportGenerations[reportGenerations.length -
                                    1].dateAdded).toLocaleDateString("en", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })
                            }}</div>
                            <div class="report-meta">{{ $t('fileName') }}: {{ reportGenerations[reportGenerations.length
                                - 1].fileName }}</div>
                            <!-- <div class="report-meta">{{ $t('downloadedAt') }}: {{
                                reportGenerations[reportGenerations.length - 1].downloadedAt }}</div> -->
                            <div class="report-actions">
                                <BaseButton variant="primary" size="small" @click="viewReport">{{ $t('view') }}</BaseButton>
                                <BaseButton variant="secondary" size="small" @click="downloadReport">{{ $t('download') }}</BaseButton>
                            </div>
                        </div>
                        <div v-else>
                            <div class="report-meta">{{ $t('noDataFound') }}</div>
                        </div>
                    </div>
                    <div class="report-card">
                        <div class="report-title">{{ $t('globe') }} <i class="bi bi-box-arrow-up-right"></i></div>
                        <div v-if="kmlReportGenerations.length > 0">
                            <div class="report-meta">{{ $t('generatedAt') }}: 12/12/2024</div>
                            <div class="report-meta">{{ $t('fileName') }}: zzzzzz</div>
                            <div class="report-meta">{{ $t('downloadedAt') }}: 03:50PM, 12/12/2024</div>
                            <div class="report-actions">
                                <button class="btn btn-view">{{ $t('view') }}</button>
                                <button class="btn btn-download">{{ $t('download') }}</button>
                            </div>
                        </div>
                        <div v-else>
                            <div class="report-meta">{{ $t('noDataFound') }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import ReportGenerationsController from '@/controllers/report_generations/report_generations_controller';
import EncryptionUtils from '@/utils/encryption_utils';
import { useRouter } from 'vue-router';
import { BaseButton } from '@/components/ui';

const router = useRouter();

const props = defineProps({
    route: { type: Object, required: true },
    isImperial: { type: Boolean, required: true },
    accessAllowed: { type: Boolean, required: true, default: false },
    isSelected: { type: Boolean, default: false }
});

const emit = defineEmits(['delete', 'select']);

const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

const expanded = ref(false);
const reportGenerations = ref([]);
const kmlReportGenerations = ref([]);

const toggleExpanded = async () => {
    expanded.value = !expanded.value;
    if (expanded.value) {
        setGlobalLoading(true);

        try {
            reportGenerations.value = await ReportGenerationsController.getReportGenerations(props.route.id);

            // console.log(reportGenerations.value);
        } catch (error) {
            showMessage({ status: 'error', message: t('somethingWentWrong') });
        }

        setGlobalLoading(false);
    }
}

const viewReport = () => {
    if (reportGenerations.value.length > 0) {
        const url = import.meta.env.VITE_MASL_API_BASE_URL + "/" + reportGenerations.value[reportGenerations.value.length - 1].filePath;
        const encryptedUrl = EncryptionUtils.encrypt(url);
        // window.open(encryptedUrl, '_blank');
        // router.push({
        //     path: '/pdf-viewer',
        //     query: { url: encryptedUrl },
        // });
        const routeData = router.resolve({
            path: '/pdf-viewer',
            query: { url: encryptedUrl },
        });
        window.open(routeData.href, '_blank');
    }
}

const downloadReport = () => {
    if (reportGenerations.value.length > 0) {
        window.open(import.meta.env.VITE_MASL_API_BASE_URL + "/" + reportGenerations.value[reportGenerations.value.length - 1].filePath, '_blank');
    }
}

const viewRoute = () => {
    const routeData = router.resolve({
        name: 'RouteViewer',
        params: { id: props.route.id }
    });
    window.open(routeData.href, '_blank');
};

const createReport = () => {
    const routeData = router.resolve({
        name: 'RouteReport',
        params: { id: props.route.id }
    });
    window.open(routeData.href, '_blank');
};
</script>

<style scoped>
.route-card {
    background: var(--bg-surface);
    border-radius: 16px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
    margin-bottom: 1rem !important;
    padding: 0;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--border);
}

.route-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
    border-color: var(--accent);
}

.route-card.selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgb(0 167 225 / 20%), 0 8px 24px rgb(0 167 225 / 15%);
}

.route-header-row {
    display: flex;
    align-items: center;
    padding: 1.25rem 2rem;
    background: var(--bg-surface); /* Clean look */
    border-bottom: 1px solid transparent; /* Hidden by default */
    font-weight: 500;
    font-size: 1.05rem;
    color: var(--text-primary);
    transition: background 0.2s;
}

.route-card:has(.route-details) .route-header-row {
    border-bottom-color: var(--border);
    background: var(--bg-elevated);
}

.route-header-row i {
    color: var(--text-secondary);
}

.route-selection {
    margin-right: 1.5rem;
    display: flex;
    align-items: center;
}

.route-checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: var(--accent);
    border-radius: 6px;
}

.route-title {
    flex: 2;
    color: var(--text-primary);
    font-weight: 700;
    font-size: 1.1rem;
}

.route-start,
.route-end,
.route-time {
    flex: 1;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 500;
}

.toggle-details-btn {
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 99px;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.4rem 1.25rem;
    cursor: pointer;
    margin-left: 1.5rem;
    transition: all 0.2s;
    box-shadow: none;
    outline: none;
    display: flex;
    align-items: center;
}

.toggle-details-btn:hover {
    background: var(--accent);
    color: white;
}

.route-details {
    padding: 2rem;
    background: var(--bg-surface);
}

.route-summary {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--bg-elevated);
    border-radius: 12px;
    border: 1px solid var(--border);
}

.route-summary-col {
    flex: 1;
    min-width: 180px;
}

.route-summary-center {
    text-align: center;
    color: var(--text-primary);
    font-size: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
}

.route-address {
    margin-top: 0.75rem;
    color: var(--text-primary);
    font-size: 1rem;
    line-height: 1.4;
}

.route-address strong {
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 0.25rem;
}

.badge {
    display: inline-flex;
    padding: 0.4em 0.8em;
    font-size: 0.9em;
    font-weight: 700;
    border-radius: 8px;
    background: var(--bg-elevated);
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    align-items: center;
    gap: 0.5rem;
}

.badge-km {
    background: rgb(0 167 225 / 10%);
    color: var(--accent);
    border: 1px solid transparent;
}

.route-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.report-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.report-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.2s;
}

.report-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgb(0 0 0 / 8%);
    border-color: var(--accent);
}

.report-title {
    font-weight: 700;
    font-size: 1.05rem;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--text-primary);
}

.report-title i {
    color: var(--text-tertiary);
    font-size: 0.9rem;
}

.report-meta {
    color: var(--text-secondary);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.report-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.75rem;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (width <= 900px) {
    .route-card {
        border-radius: 12px;
    }

    .route-header-row {
        padding: 1rem;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .route-selection {
        margin-right: 0.75rem;
    }
    
    .route-title {
        width: 100%;
        order: -1;
        margin-bottom: 0.5rem;
    }

    .route-details {
        padding: 1.25rem;
    }

    .route-summary {
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.25rem;
    }

    .route-summary-col {
        min-width: 0;
        text-align: left;
    }
    
    .route-summary-center {
        text-align: left;
        align-items: flex-start;
    }

    .report-cards {
        grid-template-columns: 1fr;
    }
    
    .route-actions {
        flex-direction: column;
    }
    
    .toggle-details-btn {
        margin-left: auto;
    }
}
</style>