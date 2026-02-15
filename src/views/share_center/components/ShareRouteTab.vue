<template>
    <div class="share-route-tab">
        <!-- Export Route Panel -->
        <BasePanel title="Share Route" elevation="level1" class="export-panel">
            <!-- <template #header>
                <div class="panel-header">
                    <i class="fas fa-share-alt panel-icon"></i>
                    <span class="panel-title">Export Route</span>
                </div>
            </template> -->

            <div class="export-options">
                <div class="export-option">
                    <div class="export-option__content">
                        <div class="export-option__icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="export-option__info">
                            <div class="export-option__title">KML File</div>
                            <div class="export-option__description">Google Earth, Maps</div>
                        </div>
                    </div>
                    <BaseButton variant="ghost" size="medium" left-icon="fas fa-download" @click="downloadData('kml')"
                        class="export-button">
                        Download
                    </BaseButton>
                </div>

                <div class="export-option">
                    <div class="export-option__content">
                        <div class="export-option__icon">
                            <i class="fas fa-map-pin"></i>
                        </div>
                        <div class="export-option__info">
                            <div class="export-option__title">GPX File</div>
                            <div class="export-option__description">GPS devices</div>
                        </div>
                    </div>
                    <BaseButton variant="ghost" size="medium" left-icon="fas fa-download" @click="downloadData('gpx')"
                        class="export-button">
                        Download
                    </BaseButton>
                </div>

                <div class="export-option">
                    <div class="export-option__content">
                        <div class="export-option__icon">
                            <i class="fas fa-database"></i>
                        </div>
                        <div class="export-option__info">
                            <div class="export-option__title">GeoJSON</div>
                            <div class="export-option__description">Web mapping</div>
                        </div>
                    </div>
                    <BaseButton variant="ghost" size="medium" left-icon="fas fa-download"
                        @click="downloadData('geojson')" class="export-button">
                        Download
                    </BaseButton>
                </div>
            </div>
        </BasePanel>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, inject } from 'vue';
import RouteUtils from '@/utils/route_utils';
import { BasePanel, BaseButton } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const showMessage = inject('showMessage');
const setGlobalLoading = inject('setGlobalLoading');

const props = defineProps({
    selectedRoute: {
        type: Object,
        default: null
    },
    routePoints: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const downloadData = async (type) => {
    if (!props.selectedRoute) {
        showMessage({ status: "error", message: "Please select a route first" });
        return;
    }

    if (!props.routePoints || props.routePoints.length === 0) {
        showMessage({ status: "error", message: "No route points available for download" });
        return;
    }

    setGlobalLoading(true);

    try {
        const routeName = props.selectedRoute.title || props.selectedRoute.routeName || 'Route';

        switch (type) {
            case 'kml':
                if (!authStore.user) {
                     await authStore.fetchUserProfile();
                }

                if (authStore.user) {
                    await RouteUtils.downloadKML(props.routePoints, routeName, authStore.user.imperial);
                    showMessage({ status: "success", message: "KML file downloaded successfully" });
                }
                else {
                    showMessage({ status: "error", message: "Failed to fetch user profile" });
                }
                break;
            case 'gpx':
                await RouteUtils.downloadGPX(props.routePoints, routeName);
                showMessage({ status: "success", message: "GPX file downloaded successfully" });
                break;
            case 'geojson':
                await RouteUtils.downloadGeoJSON(props.routePoints, routeName);
                showMessage({ status: "success", message: "GeoJSON file downloaded successfully" });
                break;
            default:
                showMessage({ status: "error", message: "Invalid file type" });
        }
    } catch (error) {
        console.error('Download error:', error);
        showMessage({ status: "error", message: error.message || "Failed to download file" });
    } finally {
        setGlobalLoading(false);
    }
}
</script>

<style scoped>
/* Design System Compliant Styles */
.share-route-tab {
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