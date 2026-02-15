<template>
    <div class="rs-photo-gallery">
        <!-- Main Preview / Carousel Stage -->
        <div class="gallery-stage" :class="{ 'empty': !hasPhotos }">
            <template v-if="hasPhotos">
                <div class="current-photo">
                    <img 
                        :src="currentPhotoUrl" 
                        alt="Survey Photo" 
                        @click="openFullscreen"
                    />
                    <!-- Overlays: Actions / Info -->
                    <div class="photo-overlays">
                        <span class="photo-index">{{ currentIndex + 1 }} / {{ photos.length }}</span>
                        <div class="photo-actions">
                            <button 
                                class="btn-icon" 
                                title="Annotate (Coming Soon)"
                                disabled
                            >
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button 
                                class="btn-icon" 
                                title="Download"
                                @click.stop="downloadPhoto"
                            >
                                <i class="bi bi-download"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Navigation Controls -->
                <button 
                    class="nav-btn prev" 
                    @click="prevPhoto" 
                    :disabled="currentIndex === 0"
                >
                    <i class="bi bi-chevron-left"></i>
                </button>
                <button 
                    class="nav-btn next" 
                    @click="nextPhoto" 
                    :disabled="currentIndex === photos.length - 1"
                >
                    <i class="bi bi-chevron-right"></i>
                </button>
            </template>

            <!-- Empty State -->
            <div v-else class="empty-state">
                <i class="bi bi-camera-fill"></i>
                <p>No photos available</p>
                <p class="sub-text">Photos must be captured on mobile</p>
            </div>
        </div>

        <!-- Thumbnail Strip -->
        <div class="gallery-strip" v-if="hasPhotos">
            <div 
                v-for="(photo, index) in photos" 
                :key="index"
                class="thumb-item" 
                :class="{ active: index === currentIndex }"
                @click="currentIndex = index"
            >
                <img :src="getThumbUrl(photo)" />
            </div>
        </div>

        <!-- Fullscreen Modal -->
        <div class="fullscreen-modal" v-if="isFullscreen" @click.self="closeFullscreen">
            <button class="close-fs" @click="closeFullscreen"><i class="bi bi-x-lg"></i></button>
            <div class="fs-content">
                <img :src="currentPhotoUrl" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    photos: { type: Array, default: () => [] },
    readOnly: { type: Boolean, default: false }
});

const currentIndex = ref(0);
const isFullscreen = ref(false);

const hasPhotos = computed(() => props.photos && props.photos.length > 0);

const currentPhotoUrl = computed(() => {
    if (!hasPhotos.value) return '';
    const photo = props.photos[currentIndex.value];
    if (typeof photo === 'string') {
        return photo;
    }
    return photo.url || '';
});

const getThumbUrl = (photo) => {
    // For now same as main, in real app use thumb variant
    if (typeof photo === 'string') {
        return photo;
    }
    return photo.url || '';
};

// Reset index if photos change
watch(() => props.photos, () => {
    currentIndex.value = 0;
});

const nextPhoto = () => {
    if (currentIndex.value < props.photos.length - 1) currentIndex.value++;
};

const prevPhoto = () => {
    if (currentIndex.value > 0) currentIndex.value--;
};

const openFullscreen = () => { isFullscreen.value = true; };
const closeFullscreen = () => { isFullscreen.value = false; };
const downloadPhoto = () => { console.log('Downloading...', currentPhotoUrl.value); };

</script>

<style scoped>
.rs-photo-gallery {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.gallery-stage {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    background-color: #000;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.gallery-stage.empty {
    background-color: var(--bg-elevated);
    border: 1px dashed var(--border);
}

.current-photo {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: zoom-in;
}

.current-photo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

/* Overlays */
.photo-overlays {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 8px 12px;
    background: linear-gradient(to bottom, rgb(0 0 0 / 60%), transparent);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
}

.photo-index { font-size: 0.8rem; font-weight: 600; }

.photo-actions { display: flex; gap: 8px; }

.btn-icon {
    background: rgb(0 0 0 / 40%);
    border: none;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
.btn-icon:hover { background: rgb(0 0 0 / 70%); }
.btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }

/* Navigation Buttons */
.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgb(0 0 0 / 50%);
    border: none;
    color: white;
    width: 32px;
    height: 48px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.nav-btn:hover:not(:disabled) { background: rgb(0 0 0 / 80%); }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.nav-btn.prev { left: 8px; }
.nav-btn.next { right: 8px; }

/* Thumbnail Strip */
.gallery-strip {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
}

.thumb-item {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    opacity: 0.6;
    flex-shrink: 0;
    background: #000;
}

.thumb-item.active {
    border-color: var(--accent);
    opacity: 1;
}

.thumb-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    width: 100%;
    height: 100%;
}

.empty-state i { font-size: 2rem; margin-bottom: 8px; opacity: 0.5; }
.empty-state p { margin: 0; font-size: 0.9rem; }
.sub-text { font-size: 0.75rem; opacity: 0.7; margin-top: 4px; }


/* Fullscreen Modal */
.fullscreen-modal {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 90%);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.close-fs {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

.fs-content {
    max-width: 100%;
    max-height: 100%;
}

.fs-content img {
    max-width: 100%;
    max-height: 90vh;
    box-shadow: 0 4px 20px rgb(0 0 0 / 50%);
}
</style>
