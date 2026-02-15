<template>
  <div class="review-workspace" :class="layoutClass">
    <!-- Top Bar -->
    <WorkspaceTopBar
      class="review-workspace__topbar"
      :route-name="routeName"
      :point-count="store.visiblePoints.length"
      :total-count="store.points.length"
      @view-change="handleViewChange"
    />

    <!-- Map Pane -->
    <div class="review-workspace__map" :class="{ hidden: mobileView === 'list' }">
      <SurveyMapPane
        :show-center-button="true"
        @center-on-selected="handleCenterOnSelected"
      />
    </div>

    <!-- Route Log (List) Pane -->
    <div
      class="review-workspace__list"
      :class="[
        { hidden: mobileView === 'map' && isSmallScreen },
        drawerMode ? `review-workspace__list--drawer ${drawerState}` : ''
      ]"
    >
      <!-- Drawer handle for normal screens -->
      <div
        v-if="drawerMode"
        class="review-workspace__drawer-handle"
        @click="toggleDrawer"
      >
        <span>
          <PhCaretUp
            class="review-workspace__drawer-handle-icon"
            :class="{ expanded: drawerState !== 'collapsed' }"
            :size="16"
          />
          <strong>Route Log</strong>
          <span class="text-secondary ms-2">{{ store.visiblePoints.length }} points</span>
        </span>
        <span v-if="hasGapFilters" class="badge bg-warning-subtle text-warning">
          Filtered
        </span>
      </div>

      <RouteLogPane v-show="!drawerMode || drawerState !== 'collapsed'" />
    </div>

    <!-- Inspector Pane -->
    <div
      class="review-workspace__inspector"
      :class="{ hidden: !store.selectedPointId && isSmallScreen }"
    >
      <PointInspector
        v-if="store.selectedPointId"
        @save="handleSave"
        @delete="handleDelete"
      />
      <div v-else class="review-workspace__empty-state">
        <PhMagnifyingGlass :size="48" weight="light" />
        <p>Select a point to view details</p>
      </div>
    </div>

    <!-- Unsaved Changes Modal -->
    <UnsavedChangesModal
      v-if="showUnsavedModal"
      @save="handleModalSave"
      @discard="handleModalDiscard"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { PhCaretUp, PhMagnifyingGlass } from '@phosphor-icons/vue';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';
import WorkspaceTopBar from './WorkspaceTopBar.vue';
import SurveyMapPane from '@/components/map/SurveyMapPane.vue';
import RouteLogPane from '@/components/log/RouteLogPane.vue';
import PointInspector from '@/components/inspector/PointInspector.vue';
import UnsavedChangesModal from '@/components/inspector/UnsavedChangesModal.vue';

const props = defineProps<{
  routeName?: string;
}>();

const store = useSurveyReviewStore();

// ---------------------------------------------------------------------------
// Responsive Layout State
// ---------------------------------------------------------------------------

const windowWidth = ref(window.innerWidth);
const mobileView = ref<'map' | 'list'>('map');
const drawerState = ref<'collapsed' | 'half' | 'full'>('collapsed');

const isSmallScreen = computed(() => windowWidth.value < 1280);
const isNormalScreen = computed(() => windowWidth.value >= 1280 && windowWidth.value < 1600);
const isWideScreen = computed(() => windowWidth.value >= 1600);
const drawerMode = computed(() => isNormalScreen.value);

const layoutClass = computed(() => {
  if (isSmallScreen.value) return 'review-workspace--small';
  if (isNormalScreen.value) return 'review-workspace--normal';
  if (windowWidth.value >= 2240) return 'review-workspace--ultrawide';
  return 'review-workspace--wide';
});

const hasGapFilters = computed(() => {
  const { photos, data, notes } = store.filters.gaps;
  return photos || data || notes;
});

// ---------------------------------------------------------------------------
// Unsaved Changes Modal
// ---------------------------------------------------------------------------

const showUnsavedModal = ref(false);
const pendingPointId = ref<string | null>(null);

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

function handleViewChange(view: 'map' | 'list') {
  mobileView.value = view;
}

function toggleDrawer() {
  if (drawerState.value === 'collapsed') {
    drawerState.value = 'half';
  } else if (drawerState.value === 'half') {
    drawerState.value = 'full';
  } else {
    drawerState.value = 'collapsed';
  }
}

function handleCenterOnSelected() {
  // Emit event or call map method to center
}

async function handleSave() {
  await store.saveSelected();
}

async function handleDelete() {
  if (confirm('Are you sure you want to delete this point?')) {
    await store.deleteSelected();
  }
}

function handleModalSave() {
  store.saveSelected().then(() => {
    showUnsavedModal.value = false;
    if (pendingPointId.value !== null) {
      store.forceSelectPoint(pendingPointId.value);
      pendingPointId.value = null;
    }
  });
}

function handleModalDiscard() {
  showUnsavedModal.value = false;
  store.discardDraft();
  if (pendingPointId.value !== null) {
    store.forceSelectPoint(pendingPointId.value);
    pendingPointId.value = null;
  }
}

function handleModalCancel() {
  showUnsavedModal.value = false;
  pendingPointId.value = null;
}

// ---------------------------------------------------------------------------
// Keyboard Navigation
// ---------------------------------------------------------------------------

function handleKeydown(e: KeyboardEvent) {
  if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

  if (e.key === 'ArrowDown' || e.key === 'j') {
    e.preventDefault();
    if (!store.isDirty) {
      store.navigateNext();
    }
  } else if (e.key === 'ArrowUp' || e.key === 'k') {
    e.preventDefault();
    if (!store.isDirty) {
      store.navigatePrev();
    }
  }
}

function handleResize() {
  windowWidth.value = window.innerWidth;
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
@import '@/styles/layout/review-workspace.css';

.review-workspace__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  gap: 1rem;
}
</style>
