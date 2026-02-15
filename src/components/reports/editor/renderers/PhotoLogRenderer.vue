<template>
  <div class="photo-log-renderer">
    <div v-if="photos.length === 0" class="alert alert-info">
      <i class="bi bi-image me-2"></i>
      No photos available for this section.
    </div>

    <div v-else>
      <!-- Photo Grid -->
      <div class="photo-grid" :class="`cols-${config.imagesPerRow}`">
        <div 
          v-for="photo in photos" 
          :key="photo.id" 
          class="photo-item"
        >
          <div class="photo-card">
            <div class="photo-image-container" :class="`size-${config.imageSize}`">
              <img 
                :src="photo.url" 
                :alt="photo.caption || 'Route photo'"
                class="photo-image"
                @click="openPhotoViewer(photo)"
              />
              <div class="photo-overlay">
                <button class="btn btn-sm btn-light" @click="openPhotoViewer(photo)">
                  <i class="bi bi-zoom-in"></i>
                </button>
              </div>
            </div>
            
            <div class="photo-details">
              <!-- Caption -->
              <div v-if="photo.caption" class="photo-caption">
                {{ photo.caption }}
              </div>
              
              <!-- Metadata -->
              <div class="photo-metadata">
                <!-- GPS Coordinates -->
                <div v-if="config.showGPSCoordinates && photo.coordinates" class="metadata-item">
                  <i class="bi bi-geo-alt-fill text-primary me-1"></i>
                  <small class="text-muted">
                    <a :href="`https://www.google.com/maps?q=${photo.coordinates.lat},${photo.coordinates.lng}`" target="_blank">
                      {{ formatCoordinates(photo.coordinates) }}
                    </a>
                  </small>
                </div>
                
                <!-- Timestamp -->
                <div v-if="config.showTimestamp && photo.timestamp" class="metadata-item">
                  <i class="bi bi-clock-fill text-secondary me-1"></i>
                  <small class="text-muted">
                    {{ formatTimestamp(photo.timestamp) }}
                  </small>
                </div>
                
                <!-- Additional info -->
                <div v-if="photo.distance !== undefined" class="metadata-item">
                  <i class="bi bi-signpost-fill text-success me-1"></i>
                  <small class="text-muted">
                    {{ photo.distance.toFixed(1) }} km from start
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="photo-summary mt-4 p-3 bg-light rounded">
        <div class="row">
          <div class="col-md-8">
            <small>
              <i class="bi bi-images me-2"></i>
              <strong>{{ photos.length }} photos</strong> documented along the route
              <span v-if="config.showGPSCoordinates"> • GPS coordinates enabled</span>
              <span v-if="config.showTimestamp"> • Timestamps enabled</span>
            </small>
          </div>
          <div class="col-md-4 text-end">
            <button class="btn btn-sm btn-outline-secondary" @click="$emit('configure')">
              <i class="bi bi-gear me-1"></i>
              Display Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SectionConfiguration } from '@/types/report';

interface PhotoCoordinates {
  lat: number;
  lng: number;
}

interface Photo {
  id: string;
  url: string;
  caption?: string;
  coordinates?: PhotoCoordinates;
  timestamp?: Date | string;
  distance?: number;
}

const props = defineProps<{
  config: SectionConfiguration;
  photos: Photo[];
}>();

const emit = defineEmits(['configure', 'openPhoto']);

function formatCoordinates(coords: PhotoCoordinates): string {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
}

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function openPhotoViewer(photo: Photo) {
  emit('openPhoto', photo);
}
</script>

<style scoped>
.photo-log-renderer {
  padding: 1rem 0;
}

.photo-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.photo-grid.cols-1 {
  grid-template-columns: 1fr;
}

.photo-grid.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.photo-grid.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.photo-grid.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (width <= 768px) {
  .photo-grid.cols-3,
  .photo-grid.cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 576px) {
  .photo-grid {
    grid-template-columns: 1fr !important;
  }
}

.photo-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.photo-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: var(--bg-elevated);
  cursor: pointer;
}

/* Image size configurations */
.photo-image-container.size-small {
  height: 200px;
}

.photo-image-container.size-medium {
  height: 300px;
}

.photo-image-container.size-large {
  height: 400px;
}

.photo-image-container.size-full {
  height: auto;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-image-container.size-full .photo-image {
  height: auto;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-image-container:hover .photo-overlay {
  opacity: 1;
}

.photo-details {
  padding: 0.75rem;
}

.photo-caption {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.photo-metadata {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-item {
  display: flex;
  align-items: center;
}

.metadata-item strong {
  color: var(--text-primary);
  text-decoration: none;
}

.metadata-item a {
  color: inherit;
  text-decoration: none;
}

.metadata-item a:hover {
  text-decoration: underline;
}

.photo-summary {
  border-left: 4px solid var(--accent);
}
</style>
