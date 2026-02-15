<template>
    <div class="map-share-page">
        <!-- Password Modal -->
        <div v-if="requiresPassword && !passwordEntered" class="password-modal-overlay">
            <BaseCard class="password-modal">
                <template #header>
                    <div class="password-header">
                        <i class="fas fa-lock"></i>
                        <h3>Password Protected</h3>
                        <p>This shared content requires a password to access</p>
                    </div>
                </template>

                <div class="password-form">
                    <BaseFormField id="sharePassword" v-model="password" type="password" label="Password"
                        placeholder="Enter the share password" :error="passwordError" @keyup.enter="submitPassword" />

                    <BaseButton @click="submitPassword" :disabled="!password.trim()" left-icon="fas fa-unlock"
                        size="large" class="submit-btn">
                        Access Content
                    </BaseButton>
                </div>
            </BaseCard>
        </div>

        <div class="main-content" v-if="currentRoute">
            <!-- Expired State -->
            <BaseCard v-if="isExpired" variant="error" class="status-card">
                <div class="status-content">
                    <i class="fas fa-clock status-icon"></i>
                    <h3>Link Expired</h3>
                    <p>This shared link has expired and is no longer accessible.</p>
                </div>
            </BaseCard>

            <!-- Access Denied State -->
            <BaseCard v-else-if="!isAccessible" variant="error" class="status-card">
                <div class="status-content">
                    <i class="fas fa-ban status-icon"></i>
                    <h3>Access Denied</h3>
                    <p>You don't have permission to access this shared content.</p>
                </div>
            </BaseCard>

            <!-- Main Map Content -->
            <div v-else class="map-section">
                <BasePanel title="Shared Map" subtitle="Interactive map view of the shared route survey data"
                    elevation="level2">
                    <div class="map-container">
                        <RouteMapViewer :route-points="routePoints" :edit-mode="false" :map-center="mapCenter"
                            :zoom="15" @point-info="openPointInfo" @marker-click="handleMarkerClick"
                            @map-ready="handleMapReady" />
                    </div>
                </BasePanel>

                <!-- Route Information Panel -->
                <BasePanel title="Route Information" elevation="level1" class="info-panel">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Route Name:</span>
                            <span class="info-value">{{ currentRoute?.title || 'Untitled' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Distance:</span>
                            <span class="info-value">
                                {{ (Number(currentRoute?.distance) / 1000.0).toFixed(2) + ' km' || '0.00 km' }}
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Points:</span>
                            <span class="info-value">{{ routePoints.length }} locations</span>
                        </div>
                    </div>
                </BasePanel>
            </div>
        </div>

        <!-- Point Information Modal -->
        <BasePointForm :visible="showPointModal" :point="selectedPoint" :is-edit="false" @close="showPointModal = false"
            @save="onPointSave" />
    </div>
</template>

<script setup>
// MapShare page component for public viewing
import { useRoute } from "vue-router";
import { decrypt } from "@/utils/crypto";
import { onMounted, ref, watch, nextTick, computed } from "vue";
import ShareCenterController from "@/controllers/share_center/share_center_controller";
import BasePointForm from '@/components/points/BasePointForm.vue';
import { BaseCard, BaseButton, BaseFormField, BasePanel } from '@/components/ui';
import RouteMapViewer from '@/components/map/RouteMapViewer.vue';
import { useUIStore } from "@/stores/ui";

const uiStore = useUIStore();

const currentRoute = ref(null);
const shareData = ref(null);
const isExpired = ref(false);
const isAccessible = ref(false);
const requiresPassword = ref(false);
const passwordEntered = ref(false);
const password = ref("");
const passwordError = ref("");
const loading = ref(false);
const routePoints = ref([]);

// Map state
const mapCenter = ref([0, 0]);

// Point modal state
const showPointModal = ref(false);
const selectedPoint = ref(null);

// Helper functions for point data processing
const getPointAddress = (point) => {
    try {
        if (point.data) {
            const data = typeof point.data === 'string' ? JSON.parse(point.data) : point.data
            return data.roadAddress || data.primaryRoadAddress || data.secondaryRoadAddress || 'No address available'
        }
        return 'No address available'
    } catch (e) {
        return 'No address available'
    }
}

// Point information modal functions
const openPointInfo = (point) => {
    if (point.type === 'route_point') {
        return;
    }

    // Get the fresh point data from routePoints array
    const freshPoint = routePoints.value.find(p => p.id === point.id);
    selectedPoint.value = freshPoint || point;
    showPointModal.value = true;
}

const onPointSave = (updatedPoint) => {
    // This is a read-only view, so we won't actually save changes
    // Just close the modal
    showPointModal.value = false;
    selectedPoint.value = null;
}

// RouteMapViewer event handlers
const handleMarkerClick = (point, index) => {
    console.log('Marker clicked:', point, index);
    // Could add additional marker click logic here if needed
}

const handleMapReady = () => {
    console.log('Map is ready');
    // Map initialization complete
}

const getDataFromUrl = async () => {
    try {
        console.log(window.location.href);
        const res = await ShareCenterController.getMapRouteShareFromUrl(window.location.href);
        // console.log(res);
        if (res.result) {
            currentRoute.value = res.route;
            shareData.value = res.data;
            isExpired.value = res.isExpired;
            requiresPassword.value = shareData.value.requirePassword;

            // Extract route points from the data
            if (currentRoute.value.pointsData) {
                routePoints.value = currentRoute.value.pointsData.map(point => ({
                    lat: Number(point.lat),
                    lng: Number(point.lng),
                    type: point.type || 'route_point',
                    data: point.data,
                    notes: point.notes,
                    id: point.id || Math.random().toString(36),
                    distance: point.distance
                }));
            } else {
                // Try alternative data sources
                if (shareData.value && shareData.value.routePoints) {
                    routePoints.value = shareData.value.routePoints.map(point => ({
                        lat: Number(point.lat),
                        lng: Number(point.lng),
                        type: point.type || 'route_point',
                        data: point.data,
                        notes: point.notes,
                        id: point.id || Math.random().toString(36),
                        distance: point.distance,
                    }));
                }
            }

            // Set map center to first valid point
            if (routePoints.value.length > 0) {
                const firstPoint = routePoints.value.find(p => p.lat && p.lng);
                if (firstPoint) {
                    mapCenter.value = [firstPoint.lat, firstPoint.lng];
                }
            }

            // If no password required, mark as accessible
            if (!requiresPassword.value) {
                isAccessible.value = true;
            }
        }
        else {
            currentRoute.value = null;
            shareData.value = null;
            uiStore.showError(res.message);
        }
    } catch (error) {
        console.log(error);
        uiStore.showError(String(error));
    }
}

const submitPassword = async () => {
    if (!password.value.trim()) {
        passwordError.value = "Please enter a password";
        return;
    }

    passwordError.value = "";
    uiStore.startLoading();

    try {
        if (shareData.value.password === password.value) {
            passwordEntered.value = true;
            isAccessible.value = true;

            // Extract route points after successful password verification
            if (currentRoute.value && currentRoute.value.pointsData) {
                routePoints.value = currentRoute.value.pointsData.map(point => ({
                    lat: Number(point.lat),
                    lng: Number(point.lng),
                    type: point.type || 'route_point',
                    data: point.data,
                    notes: point.notes,
                    id: point.id || Math.random().toString(36),
                    distance: point.distance
                }));
            } else if (shareData.value && shareData.value.routePoints) {
                routePoints.value = shareData.value.routePoints.map(point => ({
                    lat: Number(point.lat),
                    lng: Number(point.lng),
                    type: point.type || 'route_point',
                    data: point.data,
                    notes: point.notes,
                    id: point.id || Math.random().toString(36),
                    distance: point.distance
                }));
            }

            // Set map center to first valid point
            if (routePoints.value.length > 0) {
                const firstPoint = routePoints.value.find(p => p.lat && p.lng);
                if (firstPoint) {
                    mapCenter.value = [firstPoint.lat, firstPoint.lng];
                }
            }

            await incrementMapRouteShareView(shareData.value.id);
        }
        else {
            passwordError.value = "Incorrect password. Please try again.";
            uiStore.showError("Incorrect password");
        }
    } catch (error) {
        console.error("Password verification failed:", error);
        passwordError.value = "An error occurred while verifying the password";
        uiStore.showError("Password verification failed");
    } finally {
        uiStore.stopLoading();
    }
}

const incrementMapRouteShareView = async (shareId) => {
    try {
        await ShareCenterController.incrementMapRouteShareView(shareId);
    } catch (error) {
        console.log(error);
    }
}

const getData = async () => {
    loading.value = true;
    uiStore.startLoading();

    try {
        await getDataFromUrl();
        if (shareData.value) {
            if (!requiresPassword.value) {
                await incrementMapRouteShareView(shareData.value.id);
            }
        }
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false;
        uiStore.stopLoading();
    }
}


onMounted(() => {
    getData();
});
</script>

<style scoped>
.map-share-page {
    background: var(--bg-base);
    min-height: 100vh;
    padding: var(--spacing-lg);
}

.main-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

/* Password Modal Styles */
.password-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 70%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-lg);
}

.password-modal {
    max-width: 400px;
    width: 100%;
}

.password-header {
    text-align: center;
    margin-bottom: var(--spacing-lg);
}

.password-header i {
    font-size: 3rem;
    color: var(--accent);
    margin-bottom: var(--spacing-md);
}

.password-header h3 {
    font-size: 1.5rem;
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--text-primary);
    font-weight: 600;
}

.password-header p {
    color: var(--text-secondary);
    margin: 0;
}

.password-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.submit-btn {
    width: 100%;
}

/* Status Cards */
.status-card {
    text-align: center;
    padding: var(--spacing-2xl);
}

.status-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
}

.status-icon {
    font-size: 4rem;
    color: var(--error);
}

.status-content h3 {
    font-size: 1.5rem;
    margin: 0;
    color: var(--text-primary);
    font-weight: 600;
}

.status-content p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1.1rem;
}

/* Map Section */
.map-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.map-container {
    height: 500px;
    border-radius: var(--radius-lg);
    overflow: hidden;
}

/* Info Panel */
.info-panel {
    margin-top: var(--spacing-lg);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    padding: var(--spacing-md);
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
}

.info-label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.2%;
}

.info-value {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--text-primary);
}

/* Responsive Design */
@media (width <= 768px) {
    .map-share-page {
        padding: var(--spacing-md);
    }

    .password-modal-overlay {
        padding: var(--spacing-md);
    }

    .password-modal {
        margin: var(--spacing-sm);
    }

    .map-container {
        height: 400px;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
    }

    .status-content {
        padding: var(--spacing-lg);
    }

    .status-icon {
        font-size: 3rem;
    }
}

@media (width <= 480px) {
    .map-share-page {
        padding: var(--spacing-sm);
    }

    .map-container {
        height: 300px;
    }

    .status-content h3 {
        font-size: 1.25rem;
    }

    .status-content p {
        font-size: 1rem;
    }
}
</style>
