<template>
    <div>
        <!-- Share Link Card -->
        <ShareLinkCard :last-shared-link="lastSharedLink" :links="mapRouteShares" :generating="generating"
            @generate-link="handleGenerateLink" @delete-link="handleDeleteLink" @copy-link="handleCopyLink"
            @open-qr="handleOpenQr" />

        <!-- Map Preview Card -->
        <BaseCard class="mt-2">
            <template #header>
                <div class="map-header">
                    <i class="fas fa-map"></i>
                    <span>Map Preview</span>
                </div>
            </template>

            <div class="map-preview-area">
                <RouteMapViewer :route-points="routePoints" :loading="loading" :edit-mode="false"
                    @point-info="openPointInfo" />
            </div>
        </BaseCard>

        <!-- QR Code Modal -->
        <QRModal :visible="showQr" :value="qrCodeValue" @close="closeQr" />

        <!-- Point Information Modal -->
        <BasePointForm :visible="showPointModal" :point="selectedPoint" :is-edit="false" @close="showPointModal = false"
            @save="onPointSave" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n';
import { inject } from 'vue';
import { BaseCard } from '@/components/ui'
import ShareCenterController from "@/controllers/share_center/share_center_controller";
import BasePointForm from '@/components/points/BasePointForm.vue';
import ShareLinkCard from '@/components/share/ShareLinkCard.vue'
import QRModal from '@/components/share/QRModal.vue'
import RouteMapViewer from '@/components/map/RouteMapViewer.vue'

const showMessage = inject('showMessage');
const setGlobalLoading = inject('setGlobalLoading');

const i18n = useI18n();

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

// Map functionality is now handled by MapViewer component

// Link management state
const showQr = ref(false)
const qrCodeValue = ref('')
const generating = ref(false)

const mapRouteShares = ref([]);
const lastSharedLink = ref(null);

// Point modal state
const showPointModal = ref(false);
const selectedPoint = ref(null);

// Point interaction methods

// Point information modal functions
const openPointInfo = (point) => {
    if (point.type === 'route_point') {
        return;
    }

    // Get the fresh point data from routePoints array
    const freshPoint = props.routePoints.find(p => p.id === point.id);
    selectedPoint.value = freshPoint || point;
    showPointModal.value = true;
}

const onPointSave = (updatedPoint) => {
    // This is a read-only view, so we won't actually save changes
    // Just close the modal
    showPointModal.value = false;
    selectedPoint.value = null;
}

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

        const linkPayload = {
            RouteId: Number(props.selectedRoute?.id),
            Password: linkData.requirePassword ? linkData.password : "",
            RequirePassword: linkData.requirePassword,
            ExpireDays: parseInt(linkData.expiry),
        };

        const res = await ShareCenterController.generateMapRouteShare(linkPayload);

        if (res.result) {
            showMessage({ status: "success", message: res.message });
            await getMapRouteShares();
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
        const res = await ShareCenterController.deleteMapRouteShare(id);

        if (res.result) {
            showMessage({ status: "success", message: res.message });
            await getMapRouteShares();
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

const getMapRouteShares = async () => {
    if (!props.selectedRoute) return;

    mapRouteShares.value = [];

    try {
        const res = await ShareCenterController.getMapRouteShares(Number(props.selectedRoute?.id));
        if (res.result) {
            mapRouteShares.value = res.data;

            if (mapRouteShares.value.length > 0) {
                lastSharedLink.value = mapRouteShares.value[mapRouteShares.value.length - 1];
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

const getData = async () => {
    setGlobalLoading(true);

    try {
        await getMapRouteShares();
    } catch (error) {
        console.log(error);
    }

    setGlobalLoading(false);
}

// onMounted(async () => {
//     setTimeout(() => {
//         getData();
//     }, 200);
// })

watch(() => props.selectedRoute, (route) => {
    if (route) {
        getData();
    }
}, { immediate: true })

// Map center is now handled by MapViewer component
</script>

<style scoped>
.map-header {
    display: flex;
    align-items: center;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    gap: var(--spacing-sm);
    color: var(--text-primary);
}

.map-preview-area {
    height: 500px;
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
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    color: var(--text-secondary);
}

.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    color: var(--text-secondary);
}

.loading-spinner i {
    font-size: 2rem;
    animation: spin 1s linear infinite;
}

.map-preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
    font-size: var(--font-size-lg);
}

.map-preview-placeholder i {
    font-size: 3rem;
    color: var(--text-secondary);
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* Map styles are now handled by MapViewer component */

/* Responsive adjustments */
@media (width <= 700px) {
    .map-preview-area {
        min-height: 300px;
    }

    .popup-header h6 {
        font-size: var(--font-size-sm);
    }

    .popup-info {
        font-size: var(--font-size-xs);
    }
}
</style>