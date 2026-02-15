<template>
    <div class="photo-carousel-manager">
        <div v-if="localPhotos.length > 0" class="photo-carousel">
            <!-- Carousel with Indicators -->
            <div class="carousel-wrapper">
                <!-- Main Photo Display -->
                <div class="carousel-container">
                    <button v-if="localPhotos.length > 1" class="carousel-nav carousel-nav--prev" @click="previousPhoto"
                        :aria-label="'Previous photo'" type="button">
                        <i class="bi bi-chevron-left"></i>
                    </button>

                    <div class="carousel-image-wrapper" @click="viewCurrentPhoto">
                        <img :src="currentPhotoUrl" :alt="currentPhoto.note || 'Point photo'" class="carousel-image" />
                        <div class="carousel-overlay">
                            <i class="bi bi-zoom-in"></i>
                        </div>
                        <!-- Edit Button (Edit Mode Only) -->
                        <button v-if="isEdit && localPhotos.length > 0" class="carousel-edit-btn"
                            @click.stop="openPhotoEditor" aria-label="Edit photo" title="Edit photo" type="button">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <!-- Exclude Button (Edit Mode Only) -->
                        <button v-if="isEdit && localPhotos.length > 0" class="carousel-exclude-btn"
                            :class="{ 'is-excluded': currentPhoto?.excluded }"
                            @click.stop="toggleExclude" 
                            :aria-label="currentPhoto?.excluded ? 'Include in report' : 'Exclude from report'" 
                            :title="currentPhoto?.excluded ? 'Include in report' : 'Exclude from report'" 
                            type="button">
                            <i :class="currentPhoto?.excluded ? 'bi bi-eye-slash-fill' : 'bi bi-eye'"></i>
                        </button>
                        <!-- Delete Button (Edit Mode Only) -->
                        <button v-if="isEdit && localPhotos.length > 0" class="carousel-delete-btn"
                            @click.stop="showDeleteConfirm" aria-label="Delete photo" title="Delete photo"
                            type="button">
                            <i class="bi bi-trash"></i>
                        </button>
                        
                        <!-- Excluded Badge -->
                        <div v-if="currentPhoto?.excluded" class="excluded-badge">
                            <i class="bi bi-eye-slash"></i> Excluded
                        </div>
                    </div>

                    <button v-if="localPhotos.length > 1" class="carousel-nav carousel-nav--next" @click="nextPhoto"
                        :aria-label="'Next photo'" type="button">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>

                <!-- Photo Note Input (Edit Mode) -->
                <div v-if="localPhotos.length > 0" class="photo-note-edit">
                    <BaseFormField :model-value="currentPhoto?.note || ''" type="text" placeholder="Enter photo note"
                        @update:model-value="updatePhotoNote" :disabled="!isEdit" />
                </div>

                <!-- Photo Actions (Edit Mode) -->
                <div v-if="isEdit && localPhotos.length > 0" class="photo-actions">
                    <BaseButton variant="primary" size="small" left-icon="bi bi-plus" @click="triggerPhotoUploadInput"
                        type="button">
                        {{ $t("addPhoto") }}
                    </BaseButton>
                </div>

                <!-- Photo Indicators (Dots) -->
                <div v-if="localPhotos.length > 1" class="carousel-indicators">
                    <button v-for="(photo, idx) in localPhotos" :key="idx"
                        :class="['carousel-indicator', { 'carousel-indicator--active': idx === currentIndex }]"
                        @click="goToPhoto(idx)" :aria-label="`Go to photo ${idx + 1}`" type="button"></button>
                </div>
            </div>


        </div>

        <!-- Empty State -->
        <div v-else class="photo-carousel-empty">
            <i class="bi bi-image"></i>
            <p>No photos yet</p>
            <div v-if="isEdit" class="photo-actions-empty">
                <BaseButton variant="primary" size="small" left-icon="bi bi-plus" @click="triggerPhotoUploadInput"
                    type="button">
                    {{ $t("addPhoto") }}
                </BaseButton>
            </div>
        </div>

        <!-- Hidden file input -->
        <input ref="photoUploadInputRef" type="file" accept="image/*" style="display: none;"
            @change="onPhotoUploadInputChanged">

        <!-- Delete Confirmation Modal -->
        <BaseModal :visible="showDeleteModal" title="Delete Photo" size="small" @close="closeDeleteConfirm">
            <div class="delete-confirmation-content">
                <p>Are you sure you want to delete this photo?</p>
                <p class="text-muted">This action cannot be undone.</p>
            </div>
            <template #footer>
                <BaseButton variant="secondary" size="small" @click="closeDeleteConfirm">
                    {{ $t('cancel') }}
                </BaseButton>
                <BaseButton variant="danger" size="small" @click="confirmDeletePhoto">
                    Delete
                </BaseButton>
            </template>
        </BaseModal>

        <!-- Photo Editor Modal -->
        <BaseModal :visible="showPhotoEditor" title="Edit Photo" size="fullscreen" @close="closePhotoEditor">
            <div class="photo-editor-content" v-if="currentPhotoUrl">
                <TuiImageEditor ref="imageEditorRef" :imageUrl="currentPhotoUrl" :width="1200" :height="800"
                    @ready="onImageEditorReady" />
            </div>
            <template #footer>
                <BaseButton variant="secondary" size="small" @click="closePhotoEditor">Cancel</BaseButton>
                <BaseButton variant="primary" size="small" @click="saveEditedPhoto" :disabled="isSavingPhoto"
                    left-icon="bi bi-save">
                    {{ isSavingPhoto ? 'Saving...' : 'Save Photo' }}
                </BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, watch, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePhotoViewer } from '@/composables/usePhotoViewer';
import { BaseButton, BaseFormField, BaseModal } from '@/components/ui';
import TuiImageEditor from '@/components/ui/TuiImageEditor.vue';
import FileManagementController from '@/controllers/file_management/file_management_controller';

const props = defineProps({
    photos: {
        type: Array,
        default: () => []
    },
    isEdit: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:photos']);
const { t } = useI18n();
const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');
const localPhotos = ref([...props.photos]);
const currentIndex = ref(0);
const photoUploadInputRef = ref(null);
const showDeleteModal = ref(false);
const showPhotoEditor = ref(false);
const imageEditorRef = ref(null);
const isSavingPhoto = ref(false);
const { showPhoto } = usePhotoViewer();

watch(() => props.photos, (val, oldVal) => {
    const oldLength = oldVal?.length || 0;
    localPhotos.value = [...val];

    // If a new photo was added (length increased), navigate to the last photo
    if (val.length > oldLength) {
        currentIndex.value = val.length - 1;
    } else if (currentIndex.value >= localPhotos.value.length) {
        // Reset to first photo if current index is out of bounds
        currentIndex.value = Math.max(0, localPhotos.value.length - 1);
    }
}, { immediate: true });

const currentPhoto = computed(() => {
    if (localPhotos.value.length === 0) return null;
    return localPhotos.value[currentIndex.value];
});

const currentPhotoUrl = computed(() => {
    if (!currentPhoto.value) return '';
    return String(currentPhoto.value.url).replace('10.0.2.2', 'localhost');
});

function nextPhoto() {
    if (localPhotos.value.length === 0) return;
    currentIndex.value = (currentIndex.value + 1) % localPhotos.value.length;
}

function previousPhoto() {
    if (localPhotos.value.length === 0) return;
    currentIndex.value = currentIndex.value === 0
        ? localPhotos.value.length - 1
        : currentIndex.value - 1;
}

function goToPhoto(idx) {
    if (idx >= 0 && idx < localPhotos.value.length) {
        currentIndex.value = idx;
    }
}

function updatePhotoNote(value) {
    if (localPhotos.value.length > 0 && currentIndex.value >= 0 && currentIndex.value < localPhotos.value.length) {
        localPhotos.value[currentIndex.value].note = value;
        emit('update:photos', localPhotos.value);
    }
}

function removePhoto(idx) {
    localPhotos.value.splice(idx, 1);
    emit('update:photos', localPhotos.value);

    // Adjust current index if needed
    if (currentIndex.value >= localPhotos.value.length) {
        currentIndex.value = Math.max(0, localPhotos.value.length - 1);
    }
}

function toggleExclude() {
    if (localPhotos.value.length === 0) return;
    const photo = localPhotos.value[currentIndex.value];
    if (photo) {
        photo.excluded = !photo.excluded;
        emit('update:photos', localPhotos.value);
    }
}

function removeCurrentPhoto() {
    if (localPhotos.value.length === 0) return;
    removePhoto(currentIndex.value);
}

function showDeleteConfirm() {
    showDeleteModal.value = true;
}

function closeDeleteConfirm() {
    showDeleteModal.value = false;
}

function confirmDeletePhoto() {
    if (localPhotos.value.length === 0) return;
    removePhoto(currentIndex.value);
    closeDeleteConfirm();
}

function viewCurrentPhoto() {
    if (!currentPhoto.value) return;
    const photoIndex = currentIndex.value;

    // Create edit callback that updates the photo URL
    const editCallback = async (newUrl) => {
        if (localPhotos.value.length > 0 && photoIndex >= 0 && photoIndex < localPhotos.value.length) {
            localPhotos.value[photoIndex].url = newUrl;
            emit('update:photos', localPhotos.value);
        }
    };

    showPhoto(currentPhotoUrl.value, currentPhoto.value.note || 'Point photo', editCallback);
}

function viewPhoto(url) {
    showPhoto(String(url).replace('10.0.2.2', 'localhost'), 'Point photo');
}

function triggerPhotoUploadInput() {
    if (photoUploadInputRef.value) {
        photoUploadInputRef.value.click();
    }
}

async function onPhotoUploadInputChanged(e) {
    setGlobalLoading(true);

    try {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const res = await FileManagementController.uploadRoutePhoto(formData);
            if (res.result) {
                localPhotos.value = [...localPhotos.value, { url: res.url, note: file.name, type: 'photo' }];
                emit('update:photos', localPhotos.value);
            } else {
                showMessage({ status: 'error', message: res.message });
            }
        }
    } catch (error) {
        console.log(error);
        showMessage({ status: 'error', message: t('somethingWentWrong') });
    } finally {
        // Reset the input so the same file can be uploaded again if needed
        if (e.target) {
            e.target.value = '';
        }
        setGlobalLoading(false);
    }
}

function openPhotoEditor() {
    if (!currentPhoto.value) return;
    showPhotoEditor.value = true;
}

function closePhotoEditor() {
    showPhotoEditor.value = false;
}

const onImageEditorReady = () => {
    console.log('Image editor ready');
};

const saveEditedPhoto = async () => {
    if (isSavingPhoto.value || !imageEditorRef.value || !currentPhoto.value) return;

    isSavingPhoto.value = true;
    setGlobalLoading(true);

    try {
        const photoIndex = currentIndex.value;

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
            // Update the photo URL in the local photos array
            if (localPhotos.value.length > 0 && photoIndex >= 0 && photoIndex < localPhotos.value.length) {
                localPhotos.value[photoIndex].url = uploadResult.url;
                emit('update:photos', localPhotos.value);
            }

            showMessage({ status: 'success', message: 'Photo saved successfully!' });
            closePhotoEditor();
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

<style scoped>
.photo-carousel-manager {
    width: 100%;
    position: relative;
    display: block;
}

.photo-carousel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    position: relative;
    width: 100%;
}

.carousel-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.5rem);
    position: relative;
    width: 100%;
    flex-shrink: 0;
}

.carousel-container {
    position: relative;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    aspect-ratio: 4 / 3;
    max-height: 500px;
    background: var(--bg-elevated, #f4f5f6);
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.carousel-image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.carousel-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: var(--bg-elevated, #f4f5f6);
}

.carousel-overlay {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 0%);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
    pointer-events: none;
}

.carousel-overlay i {
    font-size: 2rem;
    color: rgb(255 255 255 / 0%);
    transition: color 0.2s ease;
}

.carousel-image-wrapper:hover .carousel-overlay {
    background: rgb(0 0 0 / 30%);
}

.carousel-image-wrapper:hover .carousel-overlay i {
    color: rgb(255 255 255 / 90%);
}

.carousel-edit-btn {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgb(0 167 225 / 90%);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 15;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgb(0 0 0 / 20%);
    backdrop-filter: blur(4px);
}

.carousel-edit-btn:hover {
    background: rgb(0 167 225 / 100%);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgb(0 167 225 / 40%);
}

.carousel-edit-btn:active {
    transform: scale(0.95);
}

.carousel-edit-btn i {
    font-size: 1.1rem;
}

.carousel-delete-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgb(220 53 69 / 90%);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 15;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgb(0 0 0 / 20%);
    backdrop-filter: blur(4px);
}

.carousel-delete-btn:hover {
    background: rgb(220 53 69 / 100%);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgb(220 53 69 / 40%);
}

.carousel-delete-btn:active {
    transform: scale(0.95);
}

.carousel-delete-btn i {
    font-size: 1.1rem;
}

.carousel-exclude-btn {
    position: absolute;
    top: 12px;
    right: 56px; /* Position to the left of delete button */
    background: rgb(108 117 125 / 90%); /* Secondary color */
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 15;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgb(0 0 0 / 20%);
    backdrop-filter: blur(4px);
}

.carousel-exclude-btn:hover {
    background: rgb(108 117 125 / 100%);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgb(108 117 125 / 40%);
}

.carousel-exclude-btn.is-excluded {
    background: rgb(253 126 20 / 90%); /* Orange for active state */
}

.carousel-exclude-btn.is-excluded:hover {
    background: rgb(253 126 20 / 100%);
}

.carousel-exclude-btn:active {
    transform: scale(0.95);
}

.carousel-exclude-btn i {
    font-size: 1.1rem;
}

.excluded-badge {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgb(220 53 69 / 90%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    z-index: 15;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
    backdrop-filter: blur(4px);
}

.delete-confirmation-content {
    padding: var(--spacing-sm, 0.5rem) 0;
}

.delete-confirmation-content p {
    margin: 0 0 var(--spacing-sm, 0.5rem) 0;
}

.delete-confirmation-content .text-muted {
    color: var(--text-secondary, #6b7280);
    font-size: 0.9rem;
}

.carousel-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgb(255 255 255 / 90%);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.carousel-nav:hover {
    background: var(--accent, #00a7e1);
    color: white;
    border-color: var(--accent, #00a7e1);
    box-shadow: 0 4px 12px rgb(0 167 225 / 30%);
}

.carousel-nav--prev {
    left: var(--spacing-sm, 0.5rem);
}

.carousel-nav--next {
    right: var(--spacing-sm, 0.5rem);
}

.carousel-nav i {
    font-size: 1.25rem;
    font-weight: bold;
}

.carousel-indicators {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-xs, 0.375rem);
    flex-wrap: wrap;
    padding: var(--spacing-xs, 0.375rem) 0;
    margin: 0;
    position: static;
    z-index: auto;
    width: 100%;
    flex-shrink: 0;
}

.carousel-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    border: none;
    background: var(--border, #e5e7eb);
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
}

.carousel-indicator:hover {
    background: var(--accent-hover, #0090c9);
    transform: scale(1.2);
}

.carousel-indicator--active {
    background: var(--accent, #00a7e1);
    width: 0.75rem;
    height: 0.75rem;
}

.photo-note-edit {
    margin-top: var(--spacing-sm, 0.5rem);
    width: 100%;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.photo-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-sm, 0.5rem);
    margin-top: var(--spacing-xs, 0.375rem);
}

.photo-actions-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: var(--spacing-md, 1rem);
}

.photo-carousel-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl, 3rem);
    background: var(--bg-elevated, #f4f5f6);
    border-radius: var(--radius-lg, 12px);
    border: 2px dashed var(--border, #e5e7eb);
    color: var(--text-secondary, #6b7280);
}

.photo-carousel-empty i {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm, 0.5rem);
    opacity: 0.5;
}

.photo-carousel-empty p {
    margin: 0;
    font-size: var(--font-size-base, 1rem);
}

@media (width <= 768px) {
    .carousel-container {
        max-width: 100%;
        max-height: 250px;
        aspect-ratio: 4 / 3;
    }

    .photo-note-edit {
        max-width: 100%;
    }

    .carousel-container {
        max-width: 100%;
        max-height: 400px;
    }

    .carousel-nav {
        width: 2rem;
        height: 2rem;
    }

    .carousel-nav i {
        font-size: 1rem;
    }

    .carousel-edit-btn {
        width: 36px;
        height: 36px;
        top: 8px;
        left: 8px;
    }

    .carousel-edit-btn i {
        font-size: 1rem;
    }

    .carousel-delete-btn {
        width: 36px;
        height: 36px;
        top: 8px;
        right: 8px;
    }

    .carousel-delete-btn i {
        font-size: 1rem;
    }
}

.photo-editor-content {
    width: 100%;
    height: 100%;
    min-height: 600px;
}
</style>