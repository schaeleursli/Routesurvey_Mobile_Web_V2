<template>
  <div class="point-inspector">
    <!-- Sticky Header -->
    <InspectorHeader
      @save="$emit('save')"
      @delete="$emit('delete')"
      @prev="store.navigatePrev()"
      @next="store.navigateNext()"
    />

    <!-- Tabs -->
    <div class="point-inspector__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="point-inspector__tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" :size="16" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="point-inspector__content">
      <PhotosTab v-if="activeTab === 'photos'" />
      <DataTab v-else-if="activeTab === 'data'" />
      <NotesTab v-else-if="activeTab === 'notes'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PhCamera, PhClipboardText, PhNote } from '@phosphor-icons/vue';
import { useSurveyReviewStore } from '@/stores/surveyReviewStore';
import InspectorHeader from './InspectorHeader.vue';
import PhotosTab from './tabs/PhotosTab.vue';
import DataTab from './tabs/DataTab.vue';
import NotesTab from './tabs/NotesTab.vue';

defineEmits<{
  (e: 'save'): void;
  (e: 'delete'): void;
}>();

const store = useSurveyReviewStore();

const tabs = [
  { id: 'photos' as const, label: 'Photos', icon: PhCamera },
  { id: 'data' as const, label: 'Data', icon: PhClipboardText },
  { id: 'notes' as const, label: 'Notes', icon: PhNote },
];

const activeTab = ref<'photos' | 'data' | 'notes'>('photos');
</script>

<style scoped>
.point-inspector {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.point-inspector__tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
  flex-shrink: 0;
}

.point-inspector__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.point-inspector__tab:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.point-inspector__tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.point-inspector__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
