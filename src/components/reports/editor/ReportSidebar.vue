<template>
  <div class="report-sidebar" role="navigation" aria-label="Report sections navigation">
    <div class="sidebar-header d-flex align-items-center justify-content-between">
      <h5 class="m-0 text-truncate" v-if="!collapsed">Report Structure</h5>
      <button 
        class="btn btn-sm btn-light border-0" 
        @click="$emit('toggle-collapse')" 
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!collapsed"
      >
        <i class="bi" :class="collapsed ? 'bi-layout-sidebar' : 'bi-layout-sidebar-inset'" aria-hidden="true"></i>
      </button>
    </div>
    
    <div class="sidebar-content">
      <div v-for="(sections, groupName) in localSectionsByGroup" :key="groupName" class="sidebar-group">
        <h6 class="group-title" v-if="!collapsed">{{ groupName }}</h6>
        <hr v-else class="my-2 text-muted opacity-25">
        
        <draggable 
          v-model="localSectionsByGroup[groupName]" 
          item-key="id"
          handle=".drag-handle"
          @change="onDragChange(groupName, $event)"
          @start="onDragStart"
          @end="onDragEnd"
          :group="{ name: groupName, put: false, pull: false }" 
          :animation="200"
          ghost-class="ghost-card"
          :disabled="collapsed"
          role="list"
          :aria-label="`${groupName} sections`"
        >
          <template #item="{ element }">
            <div 
              class="section-item" 
              :class="{ 'disabled': !element.enabled, 'active': currentSectionId === element.id, 'justify-content-center px-1': collapsed }" 
              tabindex="0"
              role="button"
              :aria-label="`${element.title}, ${element.enabled ? 'enabled' : 'disabled'}. Press Space to toggle, Enter to select.`"
              @click="selectSection(element.id)"
              @keydown="handleSectionKeydown($event, element)"
              :title="collapsed ? element.title : ''"
            >
              <div class="drag-handle" title="Drag to reorder" v-if="!collapsed" aria-hidden="true">
                 <i class="bi bi-list"></i>
              </div>
              
              <div class="section-status" :class="{'me-0': collapsed}" aria-hidden="true">
                 <i v-if="!element.enabled" class="bi bi-square text-muted" title="Disabled"></i>
                 <i v-else-if="element.status === 'Complete'" class="bi bi-check-circle-fill text-success" title="Complete"></i>
                 <i v-else-if="element.status === 'Warning'" class="bi bi-exclamation-triangle-fill text-warning" title="Warning"></i>
                 <i v-else-if="element.status === 'Error'" class="bi bi-x-circle-fill text-danger" title="Error"></i>
                 <i v-else class="bi bi-circle text-secondary" title="Incomplete"></i>
              </div>

              <div class="section-title" v-if="!collapsed" :title="element.title">
                {{ element.title }}
              </div>

              <div class="section-actions" v-if="!collapsed">
                <!-- Toggle -->
                <div class="form-check form-switch m-0" style="min-height: auto;">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :checked="element.enabled" 
                    :disabled="element.required"
                    @change.stop="toggleSection(element.id)"
                    @click.stop
                    style="cursor: pointer;"
                    :aria-label="`Toggle ${element.title}`"
                  >
                </div>
                <i v-if="element.required" class="bi bi-lock-fill text-muted small ms-1" title="Required Section" aria-hidden="true"></i>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import draggable from 'vuedraggable';
import type { SectionGroup, ReportSection } from '@/types/report';

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-collapse']);

const store = useReportStore();

// Local state for dragging to avoid mutating computed store state directly
const localSectionsByGroup = ref<Record<string, ReportSection[]>>({});
const isDragging = ref(false);

// Sync from store to local when store changes
watch(
  () => store.sectionsByGroup, 
  (newGroups) => {
    if (isDragging.value) return; // Don't interrupt dragging
    
    const groups: Record<string, ReportSection[]> = {};
    for (const [key, value] of Object.entries(newGroups)) {
        groups[key] = Array.isArray(value) ? [...value] : []; 
    }
    localSectionsByGroup.value = groups;
  }, 
  { deep: true, immediate: true }
);

const onDragChange = (group: string | number, event: { moved?: { element: ReportSection; newIndex: number; oldIndex: number }; added?: unknown; removed?: unknown }) => {
    // If moved, update store
    if (event.moved) {
        // The v-model has already updated localSectionsByGroup[groupName]
        // We push that new order to store
        store.updateGroupOrder(group as SectionGroup, localSectionsByGroup.value[group]);
    }
};

const onDragStart = () => {
    isDragging.value = true;
};

const onDragEnd = () => {
    isDragging.value = false;
    // Force sync one last time to ensure consistency? 
    // Actually, onDragChange handles the logic. 
    // Just clearing the flag is enough to resume store watching.
};

const toggleSection = (id: string) => {
  store.toggleSection(id);
};

const currentSectionId = ref<string | null>(null);

const selectSection = (id: string) => {
  currentSectionId.value = id;
  const el = document.getElementById(`section-${id}`);
  if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Keyboard navigation for sections
function handleSectionKeydown(event: KeyboardEvent, section: ReportSection) {
  const currentElement = event.target as HTMLElement;
  const allSections = Array.from(document.querySelectorAll('.section-item[tabindex="0"]'));
  const currentIndex = allSections.indexOf(currentElement);
  
  switch(event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (currentIndex < allSections.length - 1) {
        (allSections[currentIndex + 1] as HTMLElement).focus();
      }
      break;
      
    case 'ArrowUp':
      event.preventDefault();
      if (currentIndex > 0) {
        (allSections[currentIndex - 1] as HTMLElement).focus();
      }
      break;
      
    case ' ':
    case 'Space':
      event.preventDefault();
      if (!section.required) {
        toggleSection(section.id);
      }
      break;
      
    case 'Enter':
      event.preventDefault();
      selectSection(section.id);
      break;
      
    case 'Home':
      event.preventDefault();
      (allSections[0] as HTMLElement).focus();
      break;
      
    case 'End':
      event.preventDefault();
      (allSections[allSections.length - 1] as HTMLElement).focus();
      break;
  }
}
</script>

<style scoped>
.report-sidebar {
  width: 100%;
  background: var(--bg-elevated);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.sidebar-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.sidebar-content {
  padding: var(--spacing-md);
}

.sidebar-group {
  margin-bottom: var(--spacing-lg);
}

.group-title {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  color: var(--text-secondary);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
  padding-left: var(--spacing-xs);
}

.section-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  margin-bottom: var(--spacing-2xs);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.section-item:hover {
  border-color: var(--accent);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.section-item.active {
  border-color: var(--accent);
  background: var(--accent-surface);
}

.section-item.disabled {
  opacity: 0.7;
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.drag-handle {
  cursor: grab;
  color: var(--text-secondary);
  margin-right: var(--spacing-md);
  opacity: 0.3; 
  transition: opacity var(--transition-fast);
  display: flex;
  align-items: center;
}

.section-item:hover .drag-handle {
  opacity: 1; 
}

.section-status {
  margin-right: var(--spacing-md);
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
}

.section-title {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: var(--spacing-sm);
}

.section-actions {
  display: flex;
  align-items: center;
}

.ghost-card {
  opacity: 0.5;
  background: var(--accent-surface);
  border: 1px dashed var(--accent);
}

/* Keyboard navigation focus styles */
.section-item:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--accent-surface);
}

.section-item:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--accent-surface);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .section-item,
  .ghost-card {
    transition: none;
  }
}
</style>
