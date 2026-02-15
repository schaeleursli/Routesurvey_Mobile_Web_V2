<template>
    <Teleport to="body">
        <div v-if="isVisible" class="photo-viewer-overlay" @click="close">
            <div class="photo-viewer-container" @click.stop>
                <img :src="imageUrl" :alt="altText" class="photo-viewer-image" @click.stop />
                <button class="photo-viewer-close" @click="close" aria-label="Close photo viewer">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    isVisible: {
        type: Boolean,
        default: false
    },
    imageUrl: {
        type: String,
        default: ''
    },
    altText: {
        type: String,
        default: 'Photo'
    }
});

const emit = defineEmits(['close']);

const close = () => {
    emit('close');
};

// Close on escape key
const handleKeydown = (event) => {
    if (event.key === 'Escape' && props.isVisible) {
        close();
    }
};

// Add event listener when component mounts
if (typeof window !== 'undefined') {
    document.addEventListener('keydown', handleKeydown);
}

// Cleanup event listener when component unmounts
import { onUnmounted } from 'vue';
onUnmounted(() => {
    if (typeof window !== 'undefined') {
        document.removeEventListener('keydown', handleKeydown);
    }
});
</script>

<style scoped>
.photo-viewer-overlay {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgb(0 0 0 / 90%) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 99999 !important;
    cursor: pointer !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
    overflow: hidden !important;
}

.photo-viewer-container {
    position: relative;
    max-width: 100vw;
    max-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
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
}

.photo-viewer-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgb(0 0 0 / 70%);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    transition: all 0.2s ease;
    z-index: 100000;
}

.photo-viewer-close:hover {
    background: rgb(0 0 0 / 90%);
    transform: scale(1.1);
}

.photo-viewer-close:focus {
    outline: 2px solid white;
    outline-offset: 2px;
}

/* Global styles to ensure it works everywhere */
:global(.photo-viewer-overlay) {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgb(0 0 0 / 90%) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 99999 !important;
    cursor: pointer !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
    overflow: hidden !important;
}

:global(.photo-viewer-image) {
    max-width: 100vw !important;
    max-height: 100vh !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
}

@media (width <= 768px) {
    .photo-viewer-close {
        top: 10px;
        right: 10px;
        width: 40px;
        height: 40px;
        font-size: 16px;
    }
}
</style>
