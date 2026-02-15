<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-box">
            <div class="modal-header">
                <h3>{{ t('importKML') }}</h3>
                <button class="close-btn" @click="$emit('close')">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <div class="modal-body">
                <div class="upload-area" @click="triggerFileInput" @dragover.prevent="handleDragOver"
                    @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop"
                    :class="{ 'drag-over': isDragOver }">
                    <div class="upload-content">
                        <i class="bi bi-cloud-upload upload-icon"></i>
                        <p class="upload-text">{{ t('dragAndDropKML') }}</p>
                        <p class="upload-subtext">{{ t('orClickToBrowse') }}</p>
                        <button class="browse-btn" @click.stop="triggerFileInput">
                            {{ t('browseFiles') }}
                        </button>
                    </div>
                </div>

                <input ref="fileInput" type="file" accept=".kml" @change="handleFileSelect" style="display: none;" />

                <div v-if="selectedFile" class="file-info">
                    <div class="file-details">
                        <i class="bi bi-file-earmark-text"></i>
                        <span class="file-name">{{ selectedFile.name }}</span>
                        <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                    </div>
                    <button class="remove-btn" @click="removeFile">
                        <i class="bi bi-x"></i>
                    </button>
                </div>

                <div v-if="parsedData" class="import-preview">
                    <h4>{{ t('importPreview') }}</h4>
                    <div class="preview-item">
                        <strong>{{ t('routeName') }}:</strong> {{ parsedData.name }}
                    </div>
                    <div class="preview-item">
                        <strong>{{ t('pointsCount') }}:</strong> {{ parsedData.points.length }}
                    </div>
                    <div class="preview-item">
                        <strong>{{ t('routePath') }}:</strong> {{ parsedData.routePath.length }} {{ t('coordinates') }}
                    </div>
                </div>

                <div v-if="error" class="error-message">
                    <i class="bi bi-exclamation-triangle"></i>
                    {{ error }}
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" @click="$emit('close')">
                    {{ t('cancel') }}
                </button>
                <button class="btn btn-primary" @click="importRoute" :disabled="!selectedFile || loading"
                    :class="{ 'loading': loading }">
                    <span v-if="loading" class="spinner"></span>
                    {{ t('importRoute') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import KMLParser from '@/utils/kml_parser';
import RoutesController from '@/controllers/routes/routes_controller';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'imported']);

const fileInput = ref(null);
const selectedFile = ref(null);
const parsedData = ref(null);
const error = ref('');

const loading = ref(false);
const isDragOver = ref(false);

const authStore = useAuthStore();

// Computed property to check if user is admin
const isAdmin = computed(() => {
    return authStore.user?.type === 'Admin';
});

// Get current user data to check admin status (init if needed)
const getCurrentUserData = async () => {
    if (!authStore.user) {
        await authStore.fetchUserProfile();
    }
};

const triggerFileInput = () => {
    fileInput.value?.click();
};

const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
        await processFile(file);
    }
};

const handleDragOver = (event) => {
    isDragOver.value = true;
};

const handleDragLeave = (event) => {
    isDragOver.value = false;
};

const handleDrop = async (event) => {
    isDragOver.value = false;
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.name.toLowerCase().endsWith('.kml')) {
            await processFile(file);
        } else {
            error.value = t('pleaseSelectKMLFile');
        }
    }
};

const processFile = async (file) => {
    error.value = '';
    selectedFile.value = file;
    parsedData.value = null;

    try {
        loading.value = true;
        const data = await KMLParser.parseKMLFile(file);
        // console.log('Parsed KML data:', data);
        parsedData.value = data;
    } catch (err) {
        error.value = err.message;
        selectedFile.value = null;
    } finally {
        loading.value = false;
    }
};

const removeFile = () => {
    selectedFile.value = null;
    parsedData.value = null;
    error.value = '';
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const isRoutePoint = (point, routePath) => {
    return routePath.some(p => p.lat === point.lat && p.lng === point.lng);
};

const importRoute = async () => {
    if (!selectedFile.value || !parsedData.value) return;

    // Check if user is admin before allowing import
    if (!isAdmin.value) {
        error.value = t('adminOnlyFeature') || 'This feature is only available to administrators.';
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        console.log('Parsed KML data:', parsedData.value);
        console.log('Total distance from KML:', parsedData.value.totalDistance);
        console.log('Route path:', parsedData.value.routePath);

        // Prepare route data
        const totalRoutePoints = parsedData.value.routePath.map(p => {
            const point = parsedData.value.points.find(point => point.lat === p.lat && point.lng === p.lng);
            if (point) {
                let parsedPointData = {};
                try {
                    parsedPointData = JSON.parse(point.data);
                } catch (e) {
                    console.warn('Failed to parse point data:', e);
                }

                return {
                    Lat: point.lat,
                    Lng: point.lng,
                    Alt: point.alt,
                    Head: 0,
                    Distance: point.distance || 0,
                    Type: point.type,
                    Data: JSON.stringify(parsedPointData),
                    DateAdded: point.dateAdded
                }
            }

            return {
                Lat: p.lat,
                Lng: p.lng,
                Alt: p.alt,
                Head: 0,
                Distance: 0,
                Type: 'route_point',
                Data: "",
                DateAdded: new Date().toISOString()
            }
        });

        // console.log('Total route points:', totalRoutePoints);


        const routeData = {
            Title: parsedData.value.name,
            Note: parsedData.value.description || '',
            Start: parsedData.value.points.find(p => p.name === 'Start Point')?.description || '',
            End: parsedData.value.points.find(p => p.name === 'End Point')?.description || '',
            Distance: parsedData.value.totalDistance || getMaxDistanceFromPoints(parsedData.value.points),
            Points: parsedData.value.points.length,
            PointsData: totalRoutePoints,
            // PointsData: parsedData.value.points.map(point => {
            //     // Parse the data JSON to get the structured data
            //     let parsedPointData = {};
            //     try {
            //         parsedPointData = JSON.parse(point.data);
            //     } catch (e) {
            //         console.warn('Failed to parse point data:', e);
            //     }

            //     return {
            //         Lat: Number(point.lat),
            //         Lng: Number(point.lng),
            //         Alt: Number(point.alt) || 0,
            //         Head: 0,
            //         Distance: point.distance || 0,
            //         Type: point.type,
            //         Data: JSON.stringify(parsedPointData), // Re-stringify the parsed data
            //         DateAdded: point.dateAdded
            //     };
            // })
        };

        console.log('Route data to be sent:', routeData);

        const res = await RoutesController.addRoute(routeData);

        if (res.result) {
            emit('imported', res.data);
            emit('close');
        } else {
            error.value = res.message || t('importFailed');
        }
    } catch (err) {
        console.error('Import error:', err);
        error.value = t('importFailed');
    } finally {
        loading.value = false;
    }
};

const calculateTotalDistanceFromPoints = (points) => {
    if (!points || points.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        // console.log(prev, curr);
        totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    }

    // console.log(totalDistance);

    return totalDistance;
};

const getMaxDistanceFromPoints = (points) => {
    if (!points || points.length === 0) return 0;

    // Find the maximum distance value from all points
    const distances = points.map(point => point.distance || 0).filter(d => d > 0);

    console.log('All point distances:', points.map(p => ({ name: p.name, distance: p.distance })));
    console.log('Filtered distances > 0:', distances);

    if (distances.length === 0) {
        // If no distances found, calculate from coordinates
        console.log('No distances found in KML, calculating from route path');
        return calculateTotalDistanceFromPoints(parsedData.value.points);
    }

    // Return the maximum distance (which should be the end point distance)
    const maxDistance = Math.max(...distances);
    console.log('Using max distance from KML points:', maxDistance);
    return maxDistance;
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Get user data on mount
onMounted(async () => {
    await getCurrentUserData();
});

// Reset when modal is closed
watch(() => props.show, (newVal) => {
    if (!newVal) {
        removeFile();
    }
});
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 18%);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-box {
    background: var(--bs-body-bg, #fff);
    border-radius: 16px;
    box-shadow: 0 4px 32px rgb(0 0 0 / 18%);
    min-width: 500px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem 1rem;
    border-bottom: 1px solid var(--bs-border-color);
}

.modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--bs-body-color);
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: var(--bs-body-color);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background 0.2s;
}

.close-btn:hover {
    background: var(--bs-tertiary-bg);
}

.modal-body {
    padding: 1.5rem 2rem;
}

.upload-area {
    border: 2px dashed var(--bs-border-color);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--bs-tertiary-bg);
}

.upload-area:hover,
.upload-area.drag-over {
    border-color: var(--bs-primary);
    background: var(--bs-primary-bg-subtle);
}

.upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.upload-icon {
    font-size: 3rem;
    color: var(--bs-primary);
}

.upload-text {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: var(--bs-body-color);
}

.upload-subtext {
    font-size: 0.9rem;
    color: var(--bs-secondary-color);
    margin: 0;
}

.browse-btn {
    background: var(--bs-primary);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.7rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.browse-btn:hover {
    background: var(--bs-primary-dark);
}

.file-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bs-tertiary-bg);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
}

.file-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.file-name {
    font-weight: 600;
    color: var(--bs-body-color);
}

.file-size {
    font-size: 0.9rem;
    color: var(--bs-secondary-color);
}

.remove-btn {
    background: none;
    border: none;
    color: var(--bs-danger);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background 0.2s;
}

.remove-btn:hover {
    background: var(--bs-danger-bg-subtle);
}

.import-preview {
    margin-top: 1.5rem;
    padding: 1rem;
    background: var(--bs-tertiary-bg);
    border-radius: 8px;
    border-left: 4px solid var(--bs-primary);
}

.import-preview h4 {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    color: var(--bs-body-color);
}

.preview-item {
    margin-bottom: 0.5rem;
    color: var(--bs-body-color);
}

.error-message {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--bs-danger-bg-subtle);
    border: 1px solid var(--bs-danger-border-subtle);
    border-radius: 8px;
    color: var(--bs-danger);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem 2rem 1.5rem;
    border-top: 1px solid var(--bs-border-color);
}

.btn {
    padding: 0.7rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: var(--bs-primary);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--bs-primary-dark);
}

.btn-primary:disabled {
    background: var(--bs-secondary);
    cursor: not-allowed;
}

.btn-secondary {
    background: var(--bs-tertiary-bg);
    color: var(--bs-body-color);
}

.btn-secondary:hover {
    background: var(--bs-border-color);
}

.loading {
    position: relative;
    color: transparent;
}

.spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: translate(-50%, -50%) rotate(0deg);
    }

    100% {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

@media (width <= 600px) {
    .modal-box {
        min-width: 90vw;
        margin: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }

    .upload-area {
        padding: 1.5rem;
    }

    .upload-icon {
        font-size: 2.5rem;
    }
}
</style>