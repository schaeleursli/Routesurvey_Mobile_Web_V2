<template>
  <div class="workspace-topbar">
    <!-- Route Breadcrumb -->
    <div class="topbar-breadcrumb">
      <router-link to="/routes" class="topbar-breadcrumb__back">
        <PhCaretLeft :size="16" />
      </router-link>
      <span class="topbar-breadcrumb__title">{{ routeName || 'Route' }}</span>
      <span class="topbar-breadcrumb__count text-secondary">
        {{ pointCount }} of {{ totalCount }} points
      </span>
    </div>

    <!-- Search -->
    <div class="topbar-search">
      <PhMagnifyingGlass :size="18" class="topbar-search__icon" />
      <input
        v-model="searchQuery"
        type="text"
        class="topbar-search__input"
        placeholder="Search road name, notes, type..."
        @input="handleSearchInput"
      />
      <button
        v-if="searchQuery"
        class="topbar-search__clear"
        @click="clearSearch"
      >
        <PhX :size="14" />
      </button>
    </div>

    <!-- Filters -->
    <div class="topbar-filters">
      <!-- Category Filter -->
      <select
        v-model="categoryFilter"
        class="topbar-filter-select"
        @change="handleCategoryChange"
      >
        <option value="all">All Categories</option>
        <option value="obstruction">Obstructions</option>
        <option value="observation">Observations</option>
        <option value="info">Info</option>
      </select>

      <!-- Type Filter -->
      <select
        v-model="typeFilter"
        class="topbar-filter-select"
        @change="handleTypeChange"
      >
        <option value="all">All Types</option>
        <option v-for="t in availableTypes" :key="t.id" :value="t.id">
          {{ t.label }}
        </option>
      </select>

      <!-- Gap Filter Chips -->
      <div class="topbar-gap-chips">
        <button
          class="topbar-chip"
          :class="{ active: store.filters.gaps.photos }"
          @click="store.toggleGapFilter('photos')"
        >
          <PhCamera :size="14" />
          Missing Photos
        </button>
        <button
          class="topbar-chip"
          :class="{ active: store.filters.gaps.data }"
          @click="store.toggleGapFilter('data')"
        >
          <PhClipboardText :size="14" />
          Missing Data
        </button>
        <button
          class="topbar-chip"
          :class="{ active: store.filters.gaps.notes }"
          @click="store.toggleGapFilter('notes')"
        >
          <PhNote :size="14" />
          Missing Notes
        </button>
      </div>
    </div>

    <!-- Spacer -->
    <div class="topbar-spacer" />

    <!-- View Mode Toggle (for smaller screens) -->
    <div v-if="showViewToggle" class="topbar-view-toggle">
      <button
        class="topbar-view-btn"
        :class="{ active: currentView === 'map' }"
        @click="$emit('view-change', 'map')"
      >
        <PhMapTrifold :size="18" />
      </button>
      <button
        class="topbar-view-btn"
        :class="{ active: currentView === 'list' }"
        @click="$emit('view-change', 'list')"
      >
        <PhListBullets :size="18" />
      </button>
    </div>

    <!-- Sync Status -->
    <div class="topbar-sync" :class="syncStatusClass">
      <PhCloudCheck v-if="syncStatus === 'synced'" :size="18" />
      <PhCloudArrowUp v-else-if="syncStatus === 'syncing'" :size="18" class="syncing" />
      <PhCloudSlash v-else :size="18" />
      <span class="topbar-sync__label">{{ syncLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  PhCaretLeft,
  PhMagnifyingGlass,
  PhX,
  PhCamera,
  PhClipboardText,
  PhNote,
  PhMapTrifold,
  PhListBullets,
  PhCloudCheck,
  PhCloudArrowUp,
  PhCloudSlash,
} from '@phosphor-icons/vue';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';

const props = defineProps<{
  routeName?: string;
  pointCount: number;
  totalCount: number;
  showViewToggle?: boolean;
  currentView?: 'map' | 'list';
  syncStatus?: 'synced' | 'syncing' | 'error';
}>();

const emit = defineEmits<{
  (e: 'view-change', view: 'map' | 'list'): void;
}>();

const store = useSurveyReviewStore();

// ---------------------------------------------------------------------------
// Local State
// ---------------------------------------------------------------------------

const searchQuery = ref(store.filters.search);
const categoryFilter = ref(store.filters.category);
const typeFilter = ref(store.filters.type);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

const availableTypes = computed(() => store.availableTypes);

const syncStatusClass = computed(() => ({
  'topbar-sync--synced': props.syncStatus === 'synced',
  'topbar-sync--syncing': props.syncStatus === 'syncing',
  'topbar-sync--error': props.syncStatus === 'error',
}));

const syncLabel = computed(() => {
  switch (props.syncStatus) {
    case 'syncing': return 'Syncing...';
    case 'error': return 'Offline';
    default: return 'Synced';
  }
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function handleSearchInput() {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(() => {
    store.setSearch(searchQuery.value);
  }, 250);
}

function clearSearch() {
  searchQuery.value = '';
  store.setSearch('');
}

function handleCategoryChange() {
  store.setFilter('category', categoryFilter.value as any);
}

function handleTypeChange() {
  store.setFilter('type', typeFilter.value as any);
}

// Watch for external filter changes
watch(() => store.filters.search, (val) => {
  searchQuery.value = val;
});

watch(() => store.filters.category, (val) => {
  categoryFilter.value = val;
});

watch(() => store.filters.type, (val) => {
  typeFilter.value = val;
});
</script>

<style scoped>
.workspace-topbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100%;
  padding: 0 1rem;
}

/* Breadcrumb */
.topbar-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.topbar-breadcrumb__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: background-color 150ms;
}

.topbar-breadcrumb__back:hover {
  background: var(--bg-hover);
}

.topbar-breadcrumb__title {
  font-weight: 600;
  font-size: 0.95rem;
}

.topbar-breadcrumb__count {
  font-size: 0.85rem;
}

/* Search */
.topbar-search {
  position: relative;
  flex: 0 1 280px;
  min-width: 180px;
}

.topbar-search__icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.topbar-search__input {
  width: 100%;
  padding: 6px 32px 6px 36px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-input);
  font-size: 0.875rem;
  color: var(--text-primary);
}

.topbar-search__input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.topbar-search__input::placeholder {
  color: var(--text-tertiary);
}

.topbar-search__clear {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 4px;
}

.topbar-search__clear:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* Filters */
.topbar-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.topbar-filter-select {
  padding: 6px 28px 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-input);
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}

.topbar-filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Gap Filter Chips */
.topbar-gap-chips {
  display: flex;
  gap: 0.5rem;
}

.topbar-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: transparent;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 150ms;
  white-space: nowrap;
}

.topbar-chip:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

.topbar-chip.active {
  background: var(--kpi-partial);
  border-color: var(--kpi-partial);
  color: white;
}

/* Spacer */
.topbar-spacer {
  flex: 1;
}

/* View Toggle */
.topbar-view-toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.topbar-view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 32px;
  border: none;
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 150ms;
}

.topbar-view-btn:first-child {
  border-right: 1px solid var(--border);
}

.topbar-view-btn:hover {
  background: var(--bg-hover);
}

.topbar-view-btn.active {
  background: var(--primary);
  color: white;
}

/* Sync Status */
.topbar-sync {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.topbar-sync--synced {
  color: var(--kpi-complete);
}

.topbar-sync--syncing {
  color: var(--primary);
}

.topbar-sync--error {
  color: var(--kpi-empty);
}

.topbar-sync .syncing {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.topbar-sync__label {
  display: none;
}

@media (min-width: 1400px) {
  .topbar-sync__label {
    display: inline;
  }
}

/* Responsive: hide gap chips on narrow screens */
@media (max-width: 1400px) {
  .topbar-gap-chips {
    display: none;
  }
}

@media (max-width: 1200px) {
  .topbar-search {
    flex: 0 1 200px;
    min-width: 140px;
  }

  .topbar-filter-select {
    max-width: 120px;
  }
}
</style>
