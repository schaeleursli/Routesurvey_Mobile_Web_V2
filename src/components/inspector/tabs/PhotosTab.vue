<template>
  <div class="photos-tab">
    <!-- Photo Grid -->
    <div v-if="photos.length > 0" class="photos-tab__grid">
      <div
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="photos-tab__item"
        @click="openViewer(index)"
      >
        <img
          :src="getPhotoUrl(photo)"
          :alt="`Photo ${index + 1}`"
          class="photos-tab__img"
          loading="lazy"
        />
        <div v-if="photo.overlays?.length" class="photos-tab__overlay-badge">
          <PhPencil :size="12" />
        </div>
        <div v-if="photo.photoNotes" class="photos-tab__notes-badge">
          <PhNote :size="12" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="photos-tab__empty">
      <PhCamera :size="48" weight="light" />
      <p>No photos captured</p>
    </div>

    <!-- Photo Viewer Modal -->
    <PhotoViewerModal
      v-if="viewerOpen"
      :photos="photos"
      :initial-index="viewerIndex"
      @close="closeViewer"
      @update-notes="handleNotesUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PhCamera, PhPencil, PhNote } from '@phosphor-icons/vue';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';
import PhotoViewerModal from './PhotoViewerModal.vue';
import type { Photo } from '@routesurvey/survey-core';

const store = useSurveyReviewStore();

const viewerOpen = ref(false);
const viewerIndex = ref(0);

const photos = computed(() => store.selectedPoint?.photos || []);

function getPhotoUrl(photo: Photo): string {
  // Construct URL based on photo.id or photo.path
  // Adjust based on your actual photo URL structure
  return photo.url || `/api/photos/${photo.id}`;
}

function openViewer(index: number) {
  viewerIndex.value = index;
  viewerOpen.value = true;
}

function closeViewer() {
  viewerOpen.value = false;
}

function handleNotesUpdate(photoId: string, notes: string) {
  // Update photo notes in store draft
  const point = store.selectedPoint;
  if (!point) return;

  const updatedPhotos = point.photos.map((p) =>
    p.id === photoId ? { ...p, photoNotes: notes } : p
  );
  store.updateDraft({ photos: updatedPhotos });
}
</script>

<style scoped>
.photos-tab {
  padding: 1rem;
}

.photos-tab__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
}

@media (min-width: 480px) {
  .photos-tab__grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

.photos-tab__item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--bg-surface-2);
  transition: transform 150ms, box-shadow 150ms;
}

.photos-tab__item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.photos-tab__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photos-tab__overlay-badge,
.photos-tab__notes-badge {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
}

.photos-tab__overlay-badge {
  top: 6px;
  right: 6px;
}

.photos-tab__notes-badge {
  bottom: 6px;
  right: 6px;
  background: var(--primary);
}

.photos-tab__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-tertiary);
  gap: 0.75rem;
}
</style>
