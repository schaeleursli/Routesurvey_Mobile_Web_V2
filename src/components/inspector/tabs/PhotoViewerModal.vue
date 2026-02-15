<template>
  <Teleport to="body">
    <div class="photo-viewer-overlay" @click.self="$emit('close')">
      <div class="photo-viewer">
        <!-- Header -->
        <div class="photo-viewer__header">
          <span class="photo-viewer__counter">
            {{ currentIndex + 1 }} / {{ photos.length }}
          </span>
          <button class="photo-viewer__close" @click="$emit('close')">
            <PhX :size="24" />
          </button>
        </div>

        <!-- Main Photo -->
        <div class="photo-viewer__main">
          <button
            class="photo-viewer__nav photo-viewer__nav--prev"
            :disabled="currentIndex === 0"
            @click="prev"
          >
            <PhCaretLeft :size="32" />
          </button>

          <div class="photo-viewer__image-container">
            <img
              :src="currentPhoto?.url || `/api/photos/${currentPhoto?.id}`"
              :alt="`Photo ${currentIndex + 1}`"
              class="photo-viewer__image"
            />
            <!-- Overlay Renderer (view-only) -->
            <OverlayRenderer
              v-if="currentPhoto?.overlays?.length"
              :overlays="currentPhoto.overlays"
              class="photo-viewer__overlays"
            />
          </div>

          <button
            class="photo-viewer__nav photo-viewer__nav--next"
            :disabled="currentIndex >= photos.length - 1"
            @click="next"
          >
            <PhCaretRight :size="32" />
          </button>
        </div>

        <!-- Photo Notes Panel -->
        <div class="photo-viewer__notes">
          <label class="photo-viewer__notes-label">Photo Notes</label>
          <textarea
            v-model="notesValue"
            class="photo-viewer__notes-input"
            placeholder="Add notes for this photo..."
            rows="2"
            @input="handleNotesChange"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { PhX, PhCaretLeft, PhCaretRight } from '@phosphor-icons/vue';
import OverlayRenderer from './OverlayRenderer.vue';
import type { Photo } from '@routesurvey/survey-core';

const props = defineProps<{
  photos: Photo[];
  initialIndex: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update-notes', photoId: string, notes: string): void;
}>();

const currentIndex = ref(props.initialIndex);
const notesValue = ref('');

const currentPhoto = computed(() => props.photos[currentIndex.value]);

// Sync notes when photo changes
watch(
  currentPhoto,
  (photo) => {
    notesValue.value = photo?.photoNotes || '';
  },
  { immediate: true }
);

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function next() {
  if (currentIndex.value < props.photos.length - 1) {
    currentIndex.value++;
  }
}

let notesDebounce: ReturnType<typeof setTimeout> | null = null;

function handleNotesChange() {
  if (notesDebounce) clearTimeout(notesDebounce);
  notesDebounce = setTimeout(() => {
    if (currentPhoto.value) {
      emit('update-notes', currentPhoto.value.id, notesValue.value);
    }
  }, 300);
}

// Keyboard navigation
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'ArrowLeft') {
    prev();
  } else if (e.key === 'ArrowRight') {
    next();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.photo-viewer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 140ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.photo-viewer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  max-height: 90vh;
  margin: auto;
}

.photo-viewer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  color: white;
}

.photo-viewer__counter {
  font-size: 0.9rem;
  opacity: 0.8;
}

.photo-viewer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background 150ms;
}

.photo-viewer__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.photo-viewer__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0 1rem;
  min-height: 0;
}

.photo-viewer__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 150ms;
  flex-shrink: 0;
}

.photo-viewer__nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.photo-viewer__nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.photo-viewer__image-container {
  position: relative;
  flex: 1;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-viewer__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.photo-viewer__overlays {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.photo-viewer__notes {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.photo-viewer__notes-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
}

.photo-viewer__notes-input {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 0.9rem;
  resize: none;
}

.photo-viewer__notes-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.photo-viewer__notes-input:focus {
  outline: none;
  border-color: var(--primary);
}
</style>
