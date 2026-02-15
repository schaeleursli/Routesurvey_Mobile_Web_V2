<template>
    <div class="share-data-tab">
        <!-- Export Survey Data Panel -->
        <BasePanel title="Share Data" elevation="level1" class="export-panel">
            <!-- <template #header>
                <div class="panel-header">
                    <i class="fas fa-database panel-icon"></i>
                    <span class="panel-title">Export Survey Data</span>
                </div>
            </template> -->

            <!-- Export Options -->
            <div v-if="selectedRoute" class="export-options">
                <div class="export-option">
                    <div class="export-option__content">
                        <div class="export-option__icon">
                            <i class="fas fa-file-csv"></i>
                        </div>
                        <div class="export-option__info">
                            <div class="export-option__title">CSV</div>
                            <div class="export-option__description">Spreadsheet format</div>
                        </div>
                    </div>
                    <BaseButton variant="ghost" size="medium" left-icon="fas fa-download" :disabled="downloadingCSV"
                        @click="downloadSurveyData('csv')" class="export-button">
                        {{ downloadingCSV ? 'Downloading...' : 'Download' }}
                    </BaseButton>
                </div>

                <div class="export-option">
                    <div class="export-option__content">
                        <div class="export-option__icon">
                            <i class="fas fa-file-excel"></i>
                        </div>
                        <div class="export-option__info">
                            <div class="export-option__title">Excel</div>
                            <div class="export-option__description">Microsoft Excel (.xlsx)</div>
                        </div>
                    </div>
                    <BaseButton variant="ghost" size="medium" left-icon="fas fa-download" :disabled="downloadingExcel"
                        @click="downloadSurveyData('xlsx')" class="export-button">
                        {{ downloadingExcel ? 'Downloading...' : 'Download' }}
                    </BaseButton>
                </div>
            </div>

            <!-- No Route Selected Message -->
            <div v-else class="no-route-message">
                <div class="no-route-message__content">
                    <i class="fas fa-info-circle no-route-message__icon"></i>
                    <span class="no-route-message__text">Please select a route from the dropdown above to export
                        data.</span>
                </div>
            </div>
        </BasePanel>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import RouteUtils from '@/utils/route_utils.js'
import { BasePanel, BaseButton } from '@/components/ui'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
    selectedRoute: {
        type: Object,
        default: null
    },
    routes: {
        type: Array,
        default: () => []
    },
    routePoints: {
        type: Array,
        default: () => []
    }
})

const downloadingCSV = ref(false)
const downloadingExcel = ref(false)

const downloadSurveyData = async (format) => {
    if (!props.selectedRoute) {
        console.error('No route selected')
        return
    }

    if (!props.routePoints || props.routePoints.length === 0) {
        console.error('No route points available for export')
        return
    }

    try {
        const routeName = props.selectedRoute.title || 'Route'

        let imperial = false;

        if (!authStore.user) {
            await authStore.fetchUserProfile();
        }

        if (authStore.user) {
            imperial = authStore.user.imperial;
        }

        if (format === 'csv') {
            downloadingCSV.value = true
            await RouteUtils.downloadCSV(props.routePoints, routeName, imperial)
        } else if (format === 'xlsx') {
            downloadingExcel.value = true
            await RouteUtils.downloadExcel(props.routePoints, routeName, imperial)
        }
    } catch (error) {
        console.error('Error downloading survey data:', error)
    } finally {
        downloadingCSV.value = false
        downloadingExcel.value = false
    }
}
</script>

<style scoped>
/* Design System Compliant Styles */
.share-data-tab {
    width: 100%;
}

.export-panel {
    margin-bottom: var(--spacing-lg);
}

.panel-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.panel-icon {
    color: var(--accent);
    font-size: var(--font-size-lg);
}

.panel-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    letter-spacing: var(--letter-spacing-normal);
}

.export-options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.export-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    transition: all var(--transition-normal);
}

.export-option:hover {
    background: var(--bg-surface);
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
}

.export-option__content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex: 1;
}

.export-option__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: var(--accent);
    color: white;
    border-radius: var(--radius-lg);
    font-size: var(--font-size-lg);
}

.export-option__info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
}

.export-option__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    letter-spacing: var(--letter-spacing-normal);
}

.export-option__description {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    letter-spacing: var(--letter-spacing-wide);
}

.export-button {
    flex-shrink: 0;
}

.no-route-message {
    padding: var(--spacing-xl);
    background: var(--bg-elevated);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
}

.no-route-message__content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    color: var(--text-secondary);
    font-size: var(--font-size-lg);
}

.no-route-message__icon {
    color: var(--accent);
    font-size: var(--font-size-xl);
    flex-shrink: 0;
}

.no-route-message__text {
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-normal);
}

/* Responsive Design */
@media (width <= 768px) {
    .export-option {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
    }

    .export-option__content {
        justify-content: center;
    }

    .export-button {
        align-self: center;
        width: fit-content;
    }

    .no-route-message__content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-sm);
    }
}

@media (width <= 480px) {
    .export-option__content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-sm);
    }

    .export-option__icon {
        align-self: center;
    }
}
</style>