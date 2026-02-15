<template>
    <div>
        <!-- Survey Photos Panel -->
        <BasePanel title="Survey Photos" :subtitle="`${allPhotos.length} photos available`" elevation="level1">
            <template #actions-view>
                <div class="photo-actions">
                    <BaseButton variant="secondary" size="small" :disabled="!selectedPhotos.length || isDownloading"
                        @click="deselectAllPhotos">
                        <template #left-icon>
                            <i class="fas fa-times"></i>
                        </template>
                        Deselect All
                    </BaseButton>
                    <BaseButton variant="primary" size="small" :disabled="!selectedPhotos.length || isDownloading"
                        @click="downloadSelectedPhotos">
                        <template #left-icon>
                            <i class="fas fa-download"></i>
                        </template>
                        Download Selected ({{ selectedPhotos.length }})
                    </BaseButton>
                </div>
            </template>

            <!-- Download Progress -->
            <div v-if="isDownloading" class="download-progress">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: downloadProgress + '%' }"></div>
                </div>
                <div class="progress-text">Downloading... {{ downloadProgress }}%</div>
            </div>

            <!-- Photos Grid -->
            <div v-if="allPhotos.length > 0" class="photos-section">
                <div class="photos-instructions">
                    <i class="fas fa-info-circle"></i>
                    <span>Click photo to select/deselect, double-click to view full size</span>
                </div>
                <div class="photos-grid">
                    <BaseCard v-for="(photo, index) in allPhotos" :key="index"
                        :variant="selectedPhotos.includes(photo) ? 'success' : 'default'" :interactive="true"
                        :hover="true" @click="togglePhotoSelection(photo)" @dblclick="viewPhoto(photo.url)"
                        class="photo-card">
                        <div class="photo-checkbox" v-if="selectedPhotos.includes(photo)">
                            <i class="fas fa-check"></i>
                        </div>
                        <img :src="photo.url" class="photo-img" :alt="photo.note" @click.stop="viewPhoto(photo.url)" />
                        <div class="photo-caption">
                            <div class="photo-title">{{ photo.note || 'Untitled' }}</div>
                            <div class="photo-meta">{{ photo.pointType }} - {{ photo.pointIndex }}</div>
                        </div>
                    </BaseCard>
                </div>
            </div>

            <!-- No Photos Message -->
            <div v-else-if="!loading" class="no-photos-message">
                <i class="fas fa-images"></i>
                <h3>No Photos Found</h3>
                <p>No photos have been uploaded for this route yet.</p>
            </div>
        </BasePanel>

        <!-- Download All Photos Panel -->
        <BasePanel title="Download All Photos" subtitle="Download all photos as a ZIP file" elevation="level1"
            class="mt-4">
            <BaseButton variant="primary" size="large" :disabled="!allPhotos.length || isDownloading"
                @click="downloadAllPhotos" class="download-all-button">
                <template #left-icon>
                    <i class="fas fa-download"></i>
                </template>
                Download as ZIP ({{ allPhotos.length }} photos)
            </BaseButton>

            <!-- Download Progress for All Photos -->
            <div v-if="isDownloading" class="download-progress">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: downloadProgress + '%' }"></div>
                </div>
                <div class="progress-text">Downloading all photos... {{ downloadProgress }}%</div>
            </div>
        </BasePanel>

        <!-- Photo Viewer Modal -->
        <PhotoViewer :is-visible="!!viewerUrl" :image-url="viewerUrl" :alt-text="'Survey Photo'"
            @close="closePhotoViewer" />
    </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import JSZip from 'jszip';
import shareCenterController from '@/controllers/share_center/share_center_controller';
import { BasePanel, BaseButton, BaseCard, PhotoViewer } from '@/components/ui';

const showMessage = inject('showMessage')
const setGlobalLoading = inject('setGlobalLoading')
const i18n = useI18n()

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

const selectedPhotos = ref([])
const viewerUrl = ref('')
const downloadProgress = ref(0)
const isDownloading = ref(false)

// Computed properties
const allPhotos = computed(() => {
    if (!props.routePoints || props.routePoints.length === 0) return []

    const photos = []

    props.routePoints.forEach((point, pointIndex) => {
        if (point.type !== 'route_point' && point.data) {
            try {
                const parsedData = JSON.parse(point.data)
                if (parsedData.media && Array.isArray(parsedData.media)) {
                    const pointPhotos = parsedData.media.filter(media => media.type === 'photo')
                    // console.log(pointPhotos)
                    pointPhotos.forEach(photo => {
                        photos.push({
                            ...photo,
                            url: String(photo.url)
                                .replace('10.0.2.2', 'localhost')
                                // .replace(/https?:\/\/localhost:\d+\/Uploads/, '/Uploads')
                                .replace("http://api.route-survey.survys.com", "https://api.route-survey.survys.com"),
                            pointType: point.type,
                            pointIndex: pointIndex + 1,
                            pointData: parsedData
                        })
                    })
                }
            } catch (error) {
                console.error('Error parsing point data:', error)
            }
        }
    })

    // console.log(photos)

    return photos
})

// Methods
const togglePhotoSelection = (photo) => {
    const index = selectedPhotos.value.findIndex(p => p.url === photo.url)
    if (index > -1) {
        selectedPhotos.value.splice(index, 1)
    } else {
        selectedPhotos.value.push(photo)
    }
}

const viewPhoto = (url) => {
    viewerUrl.value = processPhotoUrl(url)
}

const closePhotoViewer = () => {
    viewerUrl.value = ''
}

// Helper function to process photo URLs consistently
const processPhotoUrl = (url) => {
    const processedUrl = String(url)
        .replace('10.0.2.2', 'localhost')
        .replace("http://api.route-survey.survys.com", "https://api.route-survey.survys.com")

    // In development, use relative URLs to work with Vite proxy
    // if (import.meta.env.DEV) {
    //     // Extract just the path part for proxy
    //     const urlObj = new URL(processedUrl)
    //     return urlObj.pathname
    // }

    return processedUrl
}

const downloadSelectedPhotos = async () => {
    if (selectedPhotos.value.length === 0) {
        showMessage({ status: "error", message: "Please select photos to download" })
        return
    }

    setGlobalLoading(true)
    isDownloading.value = true
    downloadProgress.value = 0

    try {
        const urls = [];

        // Create individual download links for each photo
        for (let i = 0; i < selectedPhotos.value.length; i++) {
            const photo = selectedPhotos.value[i]
            try {
                const processedUrl = processPhotoUrl(photo.url);

                // const fileName = `${photo.pointType}_${photo.pointIndex}_${i + 1}_${photo.note || 'photo'}.jpg`
                //     .replace(/[^a-zA-Z0-9._-]/g, '_')
                //     .replace(/_+/g, '_')
                //     .replace(/^_|_$/g, '')

                // // Create download link that bypasses CORS
                // const link = document.createElement('a')
                // link.href = processedUrl
                // link.download = fileName
                // link.target = '_blank'
                // link.style.display = 'none'
                // document.body.appendChild(link)
                // link.click()
                // document.body.removeChild(link)

                // // Update progress
                // downloadProgress.value = Math.round(((i + 1) / selectedPhotos.value.length) * 100)

                // // Small delay to prevent browser from blocking multiple downloads
                // await new Promise(resolve => setTimeout(resolve, 200))

                urls.push(processedUrl);
            } catch (error) {
                console.error(`Error downloading photo ${i + 1}:`, error)
                showMessage({ status: "warning", message: `Failed to download photo ${i + 1}` })
            }
        }

        // showMessage({ status: "success", message: `Downloaded ${selectedPhotos.value.length} photos successfully` })

        const res = await shareCenterController.generateZipFromUrls({ Urls: urls, ZipFileName: "selected_photos.zip" });

        if (res.result) {
            showMessage({ status: "success", message: res.message })
        } else {
            showMessage({ status: "error", message: res.message })
        }
    } catch (error) {
        console.error('Download error:', error)
        showMessage({ status: "error", message: "Failed to download photos" })
    } finally {
        setGlobalLoading(false)
        isDownloading.value = false
        downloadProgress.value = 0
    }
}

const downloadAllPhotos = async () => {
    if (allPhotos.value.length === 0) {
        showMessage({ status: "error", message: "No photos available for download" })
        return
    }

    setGlobalLoading(true)
    isDownloading.value = true
    downloadProgress.value = 0

    try {
        const urls = [];

        // Create individual download links for each photo
        for (let i = 0; i < allPhotos.value.length; i++) {
            const photo = allPhotos.value[i]
            try {
                const processedUrl = processPhotoUrl(photo.url)
                // const fileName = `${photo.pointType}_${photo.pointIndex}_${i + 1}_${photo.note || 'photo'}.jpg`
                //     .replace(/[^a-zA-Z0-9._-]/g, '_')
                //     .replace(/_+/g, '_')
                //     .replace(/^_|_$/g, '')

                // // Create download link that bypasses CORS
                // const link = document.createElement('a')
                // link.href = processedUrl
                // link.download = fileName
                // link.target = '_blank'
                // link.style.display = 'none'
                // document.body.appendChild(link)
                // link.click()
                // document.body.removeChild(link)

                // // Update progress
                // downloadProgress.value = Math.round(((i + 1) / allPhotos.value.length) * 100)

                // // Small delay to prevent browser from blocking multiple downloads
                // await new Promise(resolve => setTimeout(resolve, 200))

                urls.push(processedUrl);
            } catch (error) {
                console.error(`Error downloading photo ${i + 1}:`, error)
                showMessage({ status: "warning", message: `Failed to download photo ${i + 1}` })
            }
        }

        const res = await shareCenterController.generateZipFromUrls({ Urls: urls, ZipFileName: "all_photos.zip" });

        if (res.result) {
            showMessage({ status: "success", message: res.message })
        } else {
            showMessage({ status: "error", message: res.message })
        }
    } catch (error) {
        console.error('Download error:', error)
        showMessage({ status: "error", message: "Failed to download photos" })
    } finally {
        setGlobalLoading(false)
        isDownloading.value = false
        downloadProgress.value = 0
    }
}

const deselectAllPhotos = () => {
    selectedPhotos.value = []
}

// Watchers
watch(() => props.routePoints, () => {
    // Reset selected photos when route points change
    selectedPhotos.value = []
}, { immediate: true })
</script>

<style scoped>
/* Design System Variables - using global CSS variables from design-system.css */

.photo-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.photos-section {
    margin-top: 1rem;
}

.photos-instructions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: var(--bg-elevated);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.photo-card {
    position: relative;
    cursor: pointer;
    min-height: 200px;
}

.photo-checkbox {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: var(--success);
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    z-index: 10;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
}

.photo-img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    transition: transform 0.2s ease;
}

.photo-card:hover .photo-img {
    transform: scale(1.02);
}

.photo-caption {
    text-align: center;
    padding: 0.5rem;
}

.photo-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    line-height: 1.4;
    word-break: break-word;
}

.photo-meta {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
    letter-spacing: 0.2%;
}

.no-photos-message {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-secondary);
}

.no-photos-message i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--text-secondary);
    opacity: 0.5;
}

.no-photos-message h3 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    font-size: 24px;
    font-weight: 600;
}

.no-photos-message p {
    color: var(--text-secondary);
    font-size: 16px;
}

.download-all-button {
    width: 100%;
    margin-bottom: 1rem;
}

.download-progress {
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.progress-bar {
    height: 8px;
    background-color: var(--bg-elevated);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--border);
}

.progress-fill {
    height: 100%;
    background-color: var(--accent);
    transition: width 0.3s ease;
    border-radius: 4px;
}

.progress-text {
    text-align: center;
    margin-top: 0.5rem;
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 500;
}

/* Responsive Design - Following Design System Guidelines */
@media (width <= 768px) {
    .photo-actions {
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }

    .photo-actions .base-button {
        width: 100%;
    }

    .photos-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.75rem;
    }

    .photos-instructions {
        font-size: 13px;
        padding: 0.5rem;
    }
}

@media (width <= 480px) {
    .photos-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 0.5rem;
    }

    .photo-img {
        height: 100px;
    }

    .photo-title {
        font-size: 13px;
    }

    .photo-meta {
        font-size: 11px;
    }
}
</style>