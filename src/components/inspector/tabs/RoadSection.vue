<template>
  <div class="road-section">
    <!-- Header with status chip -->
    <div class="road-section__header">
      <h4 class="road-section__title">Road</h4>
      <span v-if="isEdited" class="road-section__chip road-section__chip--edited">
        Edited
      </span>
      <span v-else-if="isLowConfidence" class="road-section__chip road-section__chip--check">
        Check
      </span>
    </div>

    <!-- Display row (read-only) -->
    <div class="road-section__row road-section__row--display">
      <label class="road-section__label">Shown in lists</label>
      <div class="road-section__display-value">
        {{ road?.display || '—' }}
      </div>
      <span class="road-section__helper">This is what appears in the route log and exports.</span>
    </div>

    <!-- Editable fields -->
    <div class="road-section__row">
      <label class="road-section__label" for="road-ref">Road reference</label>
      <input
        id="road-ref"
        type="text"
        class="road-section__input"
        :value="road?.refPrimary || ''"
        placeholder="RN-40, I-78, A-1, BR-101"
        @input="handleRefChange"
      />
      <span class="road-section__helper">Best for highways and route IDs.</span>
    </div>

    <div class="road-section__row">
      <label class="road-section__label" for="road-name">Road name</label>
      <input
        id="road-name"
        type="text"
        class="road-section__input"
        :value="road?.name || ''"
        placeholder="Ruta 5 Sur, Avenida Apoquindo"
        @input="handleNameChange"
      />
      <span class="road-section__helper">Optional local name.</span>
    </div>

    <!-- Other refs (read-only) -->
    <div class="road-section__row" v-if="road?.refs && road.refs.length > 1">
      <label class="road-section__label">Other references</label>
      <div class="road-section__chips">
        <span 
          v-for="ref in road.refs" 
          :key="ref" 
          class="road-section__ref-chip"
        >
          {{ ref }}
        </span>
      </div>
    </div>

    <!-- Source/Confidence (small, optional) -->
    <div class="road-section__meta" v-if="road">
      <span class="road-section__meta-item">
        Source: {{ formatSource(road.source) }}
      </span>
      <span class="road-section__meta-item">
        Confidence: {{ formatConfidence(road.confidence) }}
      </span>
    </div>

    <!-- Actions -->
    <div class="road-section__actions">
      <button 
        class="road-section__btn"
        :disabled="isRefreshing"
        @click="handleRefresh"
      >
        <PhArrowsClockwise :size="16" :class="{ 'spin': isRefreshing }" />
        {{ isRefreshing ? 'Refreshing...' : 'Refresh from OSM' }}
      </button>
    </div>

    <!-- Confirm Modal -->
    <Teleport to="body">
      <div v-if="showConfirmModal" class="road-section__modal-overlay" @click.self="showConfirmModal = false">
        <div class="road-section__modal">
          <h3 class="road-section__modal-title">Replace edited road?</h3>
          <p class="road-section__modal-body">
            This point has a manually edited road. Refresh will replace it with an auto-detected road.
          </p>
          <div class="road-section__modal-actions">
            <button class="road-section__btn road-section__btn--secondary" @click="showConfirmModal = false">
              Cancel
            </button>
            <button class="road-section__btn road-section__btn--primary" @click="confirmRefresh">
              Replace
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PhArrowsClockwise } from '@phosphor-icons/vue';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';
import { roadIdentityService, computeRoadDisplay } from '@/services/roadIdentityService';
import type { RoadIdentity } from '@routesurvey/survey-core';

const store = useSurveyReviewStore();

const isRefreshing = ref(false);
const showConfirmModal = ref(false);

// Get road from current point
const road = computed<RoadIdentity | null | undefined>(() => {
  return store.selectedPoint?.road;
});

const isEdited = computed(() => road.value?.manualOverride === true);
const isLowConfidence = computed(() => (road.value?.confidence ?? 0) < 0.6);

// Format source for display
function formatSource(source: string | undefined): string {
  const sourceMap: Record<string, string> = {
    osm: 'OSM',
    osrm: 'OSRM',
    reverse_geocode: 'Geocode',
    offline: 'Offline',
    manual: 'Manual',
  };
  return sourceMap[source || ''] || source || 'Unknown';
}

// Format confidence for display
function formatConfidence(confidence: number | undefined): string {
  if (confidence === undefined || confidence === null) return 'Unknown';
  if (confidence >= 0.85) return 'High';
  if (confidence >= 0.65) return 'Medium';
  return 'Low';
}

// Handle ref change
function handleRefChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  updateRoad({ refPrimary: value || null });
}

// Handle name change
function handleNameChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  updateRoad({ name: value || null });
}

// Update road with manual override
function updateRoad(updates: Partial<RoadIdentity>) {
  const currentRoad = road.value || { display: '—', source: 'manual', confidence: 1.0 };
  
  const newRoad: RoadIdentity = {
    ...currentRoad,
    ...updates,
    manualOverride: true,
    source: 'manual',
    updatedAt: new Date().toISOString(),
  } as RoadIdentity;
  
  // Recompute display
  newRoad.display = computeRoadDisplay(newRoad);
  
  store.updateDraft({ road: newRoad });
}

// Handle refresh button
function handleRefresh() {
  if (isEdited.value) {
    showConfirmModal.value = true;
  } else {
    doRefresh();
  }
}

// Confirm refresh (after modal)
function confirmRefresh() {
  showConfirmModal.value = false;
  doRefresh();
}

// Actually perform the refresh
async function doRefresh() {
  const point = store.selectedPoint;
  if (!point?.gps?.lat || !point?.gps?.lng) return;

  isRefreshing.value = true;
  
  try {
    const result = await roadIdentityService.resolve(
      point.gps.lat,
      point.gps.lng,
      { forceRefresh: true }
    );
    
    store.updateDraft({ road: result.road });
  } catch (error) {
    console.error('Road refresh failed:', error);
    // Toast could go here
  } finally {
    isRefreshing.value = false;
  }
}
</script>

<style scoped>
.road-section {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.road-section__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.road-section__title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.road-section__chip {
  font-size: 0.625rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.road-section__chip--edited {
  background: var(--blue-100);
  color: var(--blue-700);
}

.road-section__chip--check {
  background: var(--amber-100);
  color: var(--amber-700);
}

.road-section__row {
  margin-bottom: 12px;
}

.road-section__row--display {
  background: var(--bg-muted);
  padding: 12px;
  border-radius: 6px;
}

.road-section__label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.road-section__display-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.road-section__helper {
  display: block;
  font-size: 0.6875rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.road-section__input {
  width: 100%;
  padding: 8px 12px;
  font-size: 0.875rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
  transition: border-color 150ms;
}

.road-section__input:focus {
  outline: none;
  border-color: var(--primary);
}

.road-section__input::placeholder {
  color: var(--text-muted);
}

.road-section__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.road-section__ref-chip {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: var(--bg-muted);
  border-radius: 4px;
  color: var(--text-secondary);
}

.road-section__meta {
  display: flex;
  gap: 16px;
  font-size: 0.6875rem;
  color: var(--text-muted);
  margin-top: 8px;
  margin-bottom: 12px;
}

.road-section__actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.road-section__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 150ms;
}

.road-section__btn:hover:not(:disabled) {
  background: var(--bg-hover);
}

.road-section__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.road-section__btn--primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.road-section__btn--primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.road-section__btn--secondary {
  background: transparent;
}

/* Modal */
.road-section__modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.road-section__modal {
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.road-section__modal-title {
  margin: 0 0 8px;
  font-size: 1.125rem;
  font-weight: 600;
}

.road-section__modal-body {
  margin: 0 0 24px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.road-section__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Spin animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}
</style>
