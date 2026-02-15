<template>
    <div v-if="visible" class="preview-modal-overlay" @click="$emit('close')">
        <div class="preview-modal-content" @click.stop>
            <div class="preview-header">
                <h4>{{ template?.name }}</h4>
                <BaseButton variant="ghost" size="small" @click="$emit('close')">
                    <i class="bi bi-x-lg"></i>
                </BaseButton>
            </div>
            <div class="preview-body">
                <div class="preview-image-container" :class="{ 'has-multiple': hasMultipleSlides }">
                    <template v-if="template?.media && template.media.length > 0">
                        <div class="carousel-main">
                            <BaseButton v-if="hasMultipleSlides" variant="secondary" size="small" class="carousel-nav prev" @click="prevSlide">
                                <i class="bi bi-chevron-left"></i>
                            </BaseButton>
                            
                            <div class="image-wrapper">
                                <img :src="template.media[activeSlide]" :alt="template.name" />
                            </div>

                            <BaseButton v-if="hasMultipleSlides" variant="secondary" size="small" class="carousel-nav next" @click="nextSlide">
                                <i class="bi bi-chevron-right"></i>
                            </BaseButton>
                        </div>
                        
                        <!-- Thumbnails -->
                        <div v-if="hasMultipleSlides" class="carousel-thumbnails">
                            <div 
                                v-for="(img, idx) in template.media" 
                                :key="idx"
                                class="thumbnail-item"
                                :class="{ active: idx === activeSlide }"
                                @click="activeSlide = idx"
                            >
                                <img :src="img" alt="Thumbnail" />
                            </div>
                        </div>
                    </template>
                    <div v-else class="preview-placeholder">
                        <i class="bi bi-file-earmark-richtext"></i>
                        <p>{{ $t('noPreviewAvailable') }}</p>
                    </div>
                </div>
                <div class="preview-details">
                    <p>{{ template?.description }}</p>
                    <div class="preview-meta">
                        <span v-if="template?.price" class="price-tag">{{ template.price }}</span>
                        <span class="date-tag">Added: {{ formatDate(template?.dateAdded) }}</span>
                    </div>
                </div>
            </div>
            <div class="preview-footer">
                 <BaseButton variant="secondary" @click="$emit('close')">{{ $t('close') }}</BaseButton>
                 <BaseButton 
                    v-if="showPurchaseAction" 
                    variant="primary" 
                    @click="$emit('purchase', template)"
                 >
                    {{ $t('addTemplate') }}
                 </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { BaseButton } from '@/components/ui';

const props = defineProps({
    visible: Boolean,
    template: Object,
    showPurchaseAction: {
        type: Boolean,
        default: false
    }
});

defineEmits(['close', 'purchase']);

const activeSlide = ref(0);

// Reset slide when template changes
watch(() => props.template, () => {
    activeSlide.value = 0;
});

const hasMultipleSlides = computed(() => {
    return props.template?.media && props.template.media.length > 1;
});

const nextSlide = () => {
    if (!props.template?.media) return;
    activeSlide.value = (activeSlide.value + 1) % props.template.media.length;
};

const prevSlide = () => {
    if (!props.template?.media) return;
    activeSlide.value = (activeSlide.value - 1 + props.template.media.length) % props.template.media.length;
};

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.preview-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(0 0 0 / 50%);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-modal-content {
    background: var(--surface-card);
    width: 90%;
    max-width: 800px;
    height: 80%;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.preview-header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-header h4 {
    margin: 0;
}

.preview-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.preview-image-container {
    background: var(--surface-ground);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
}

.preview-image-container img {
    max-width: 100%;
    max-height: 500px;
    box-shadow: var(--shadow-md);
}

.preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-secondary);
}

.preview-placeholder i {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm);
}

.preview-footer {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
}

.preview-details {
    padding: 0 var(--spacing-sm);
}

.preview-meta {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-sm);
    font-size: 0.9em;
    color: var(--text-secondary);
}

/* Carousel Styles */
.preview-image-container.has-multiple {
    padding: var(--spacing-sm);
    flex-direction: column;
    gap: var(--spacing-md);
    background: #f8f9fa; /* Light grey background for document feel */
}

/* Dark mode adjustment */
[data-bs-theme="dark"] .preview-image-container.has-multiple {
    background: #1a1d20;
}

.carousel-main {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    flex: 1;
}

.image-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.image-wrapper img {
    max-height: 500px;
    max-width: 100%;
    object-fit: contain;
    box-shadow: var(--shadow-lg); /* Elevate the "page" */
    border-radius: var(--radius-sm);
}

.carousel-nav {
    background: var(--bg-elevated);
    border: 1px solid var(--border-color);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 2;
    color: var(--text-primary);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    backdrop-filter: blur(4px);
    box-shadow: var(--shadow-md);
}

.carousel-nav:hover {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
    transform: translateY(-50%) scale(1.1);
}

.carousel-nav.prev {
    left: var(--spacing-sm);
}

.carousel-nav.next {
    right: var(--spacing-sm);
}

.carousel-thumbnails {
    display: flex;
    gap: var(--spacing-sm);
    overflow-x: auto;
    padding: 2px;
    max-width: 100%;
}

.thumbnail-item {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    opacity: 0.6;
    transition: all 0.2s;
}

.thumbnail-item.active {
    border-color: var(--accent);
    opacity: 1;
}

.thumbnail-item:hover {
    opacity: 1;
}

.thumbnail-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
