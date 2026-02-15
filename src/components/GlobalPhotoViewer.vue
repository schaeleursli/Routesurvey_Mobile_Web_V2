<template>
    <div v-if="photoViewerState.isVisible" class="global-photo-viewer" @click="handleBackgroundClick">
        <div class="photo-viewer-container" @click.stop>
            <div class="photo-viewer-image-wrapper"
                :style="{ transform: `scale(${photoViewerState.zoomLevel}) rotate(${photoViewerState.rotation}deg)` }">
                <img :src="photoViewerState.imageUrl" :alt="photoViewerState.altText" class="photo-viewer-image"
                    @click.stop />
            </div>

            <!-- Control Buttons -->
            <div class="photo-viewer-controls">
                <!-- Top Controls -->
                <div class="photo-viewer-controls-top">
                    <button v-if="photoViewerState.canEdit" class="photo-viewer-btn" @click="openEditor"
                        aria-label="Edit image" title="Edit (E)">
                        <PhPencil :size="18" />
                    </button>
                    <button class="photo-viewer-btn" @click="downloadImage" aria-label="Download image"
                        title="Download (D)">
                        <PhDownload :size="18" />
                    </button>
                    <button class="photo-viewer-btn" @click="toggleFullscreen" aria-label="Toggle fullscreen"
                        title="Fullscreen (F)">
                        <component :is="photoViewerState.isFullscreen ? PhArrowsIn : PhArrowsOut" :size="18" />
                    </button>
                    <button class="photo-viewer-btn" @click="hidePhoto" aria-label="Close photo viewer"
                        title="Close (Esc)">
                        <PhX :size="18" />
                    </button>
                </div>

                <!-- Bottom Controls -->
                <div class="photo-viewer-controls-bottom">
                    <button class="photo-viewer-btn" @click="zoomOut" aria-label="Zoom out" title="Zoom Out (-)">
                        <PhMagnifyingGlassMinus :size="18" />
                    </button>
                    <button class="photo-viewer-btn" @click="resetZoom" aria-label="Reset zoom" title="Reset Zoom (0)">
                        <span class="zoom-level">{{ Math.round(photoViewerState.zoomLevel * 100) }}%</span>
                    </button>
                    <button class="photo-viewer-btn" @click="zoomIn" aria-label="Zoom in" title="Zoom In (+)">
                        <PhMagnifyingGlassPlus :size="18" />
                    </button>
                    <button class="photo-viewer-btn" @click="rotate" aria-label="Rotate image" title="Rotate (R)">
                        <PhArrowClockwise :size="18" />
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Photo Editor Modal -->
    <BaseModal :visible="showEditor" title="Edit Photo" size="fullscreen" @close="closeEditor">
        <div class="photo-editor-content" v-if="photoViewerState.imageUrl">
            <TuiImageEditor ref="imageEditorRef" :imageUrl="photoViewerState.imageUrl" :width="1200" :height="800"
                @ready="onImageEditorReady" />
        </div>
        <template #footer>
            <BaseButton variant="secondary" size="small" @click="closeEditor">Cancel</BaseButton>
            <BaseButton variant="primary" size="small" @click="saveEditedPhoto" :disabled="isSavingPhoto"
                left-icon="bi bi-save">
                {{ isSavingPhoto ? 'Saving...' : 'Save Photo' }}
            </BaseButton>
        </template>
    </BaseModal>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue';
import { photoViewerState, usePhotoViewer } from '@/composables/usePhotoViewer';
import TuiImageEditor from '@/components/ui/TuiImageEditor.vue';
import { BaseModal, BaseButton } from '@/components/ui';
import FileManagementController from '@/controllers/file_management/file_management_controller';
import {
    PhPencil, PhDownload, PhArrowsIn, PhArrowsOut, PhX,
    PhMagnifyingGlassMinus, PhMagnifyingGlassPlus, PhArrowClockwise
} from '@phosphor-icons/vue';

const { hidePhoto, zoomIn, zoomOut, resetZoom, rotate, toggleFullscreen, downloadImage } = usePhotoViewer();

const showEditor = ref(false);
const imageEditorRef = ref(null);
const isSavingPhoto = ref(false);
const showMessage = inject('showMessage');
const setGlobalLoading = inject('setGlobalLoading');

// Listen for edit keyboard shortcut
const handleEditShortcut = () => {
    if (photoViewerState.canEdit && photoViewerState.isVisible && !showEditor.value) {
        openEditor();
    }
};

onMounted(() => {
    window.addEventListener('photo-viewer-edit', handleEditShortcut);
});

onUnmounted(() => {
    window.removeEventListener('photo-viewer-edit', handleEditShortcut);
});

const handleBackgroundClick = (e) => {
    // Only close if clicking the background, not the image or controls
    if (e.target.classList.contains('global-photo-viewer')) {
        hidePhoto();
    }
};

const openEditor = () => {
    showEditor.value = true;
};

const closeEditor = () => {
    showEditor.value = false;
};

const onImageEditorReady = () => {
    console.log('Image editor ready');
};

const saveEditedPhoto = async () => {
    if (isSavingPhoto.value || !imageEditorRef.value || !photoViewerState.onEditCallback) return;

    isSavingPhoto.value = true;
    setGlobalLoading(true);

    try {
        // Get the edited image blob from the editor
        const blob = await imageEditorRef.value.getImageBlob();

        if (!blob) {
            throw new Error('Failed to get edited image from editor');
        }

        // Further compress the image if it's too large
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB limit
        let finalBlob = blob;

        if (blob.size > maxSizeInBytes) {
            // Create a new canvas for additional compression
            const compressionCanvas = document.createElement('canvas');
            const ctx = compressionCanvas.getContext('2d');
            const img = new Image();
            const imageUrl = URL.createObjectURL(blob);

            await new Promise((resolve, reject) => {
                img.onload = () => {
                    // Calculate new dimensions to reduce file size
                    const maxDimension = 1200; // Max width/height
                    let { width, height } = img;

                    if (width > maxDimension || height > maxDimension) {
                        const ratio = Math.min(maxDimension / width, maxDimension / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    compressionCanvas.width = width;
                    compressionCanvas.height = height;

                    // Draw the image onto the compressed canvas
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob with higher compression
                    compressionCanvas.toBlob((compressedBlob) => {
                        URL.revokeObjectURL(imageUrl);
                        if (compressedBlob) {
                            finalBlob = compressedBlob;
                            resolve();
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    }, 'image/jpeg', 0.7);
                };
                img.onerror = () => {
                    URL.revokeObjectURL(imageUrl);
                    reject(new Error('Failed to load image for compression'));
                };
                img.src = imageUrl;
            });
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', finalBlob, `edited_photo_${Date.now()}.jpg`);

        // Upload the photo
        const uploadResult = await FileManagementController.uploadRoutePhoto(formData);

        if (uploadResult.result) {
            // Call the callback to update the photo URL
            if (photoViewerState.onEditCallback) {
                await photoViewerState.onEditCallback(uploadResult.url);
            }

            showMessage({ status: 'success', message: 'Photo saved successfully!' });
            closeEditor();
            hidePhoto(); // Close the photo viewer after saving
        } else {
            showMessage({ status: 'error', message: uploadResult.message || 'Failed to upload photo' });
        }
    } catch (error) {
        console.error('Error saving edited photo:', error);
        showMessage({ status: 'error', message: 'Error saving photo' });
    } finally {
        isSavingPhoto.value = false;
        setGlobalLoading(false);
    }
};
</script>

<style>
.global-photo-viewer {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgb(0 0 0 / 95%) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 99999 !important;
    cursor: pointer !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
    overflow: hidden !important;
    pointer-events: auto !important;
}

.photo-viewer-container {
    position: relative;
    max-width: 100vw;
    max-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    width: 100%;
    height: 100%;
}

.photo-viewer-image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
    transform-origin: center center;
    max-width: 100vw;
    max-height: 100vh;
}

.photo-viewer-image {
    max-width: 100vw !important;
    max-height: 100vh !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    pointer-events: none !important;
    user-select: none;
}

.photo-viewer-controls {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 100000;
}

.photo-viewer-controls-top {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    pointer-events: auto;
}

.photo-viewer-controls-bottom {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    align-items: center;
    background: rgb(0 0 0 / 60%);
    padding: 10px 20px;
    border-radius: 50px;
    pointer-events: auto;
    backdrop-filter: blur(10px);
}

.photo-viewer-btn {
    background: rgb(0 0 0 / 70%);
    color: white;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
}

.photo-viewer-btn:hover {
    background: rgb(0 167 225 / 90%);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgb(0 167 225 / 40%);
}

.photo-viewer-btn:active {
    transform: scale(0.95);
}

.photo-viewer-btn:focus {
    outline: 2px solid rgb(255 255 255 / 50%);
    outline-offset: 2px;
}

.photo-viewer-controls-bottom .photo-viewer-btn {
    background: rgb(255 255 255 / 15%);
}

.photo-viewer-controls-bottom .photo-viewer-btn:hover {
    background: rgb(0 167 225 / 90%);
}

.zoom-level {
    font-size: 14px;
    font-weight: 600;
    min-width: 50px;
    text-align: center;
}

@media (width <= 768px) {
    .photo-viewer-controls-top {
        top: 10px;
        right: 10px;
        gap: 8px;
    }

    .photo-viewer-controls-bottom {
        bottom: 20px;
        padding: 8px 16px;
        gap: 8px;
    }

    .photo-viewer-btn {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }

    .zoom-level {
        font-size: 12px;
        min-width: 45px;
    }
}

@media (width <= 480px) {
    .photo-viewer-controls-bottom {
        flex-wrap: wrap;
        justify-content: center;
        max-width: 90%;
    }

    .photo-viewer-btn {
        width: 36px;
        height: 36px;
        font-size: 14px;
    }
}

.photo-editor-content {
    width: 100%;
    height: 100%;
    min-height: 600px;
}
</style>
