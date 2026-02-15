<template>
  <div class="report-editor-container position-relative h-100">
    <div v-if="loading" class="d-flex justify-content-center align-items-center h-100">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else class="editor-scroll-area h-100 p-4" ref="scrollContainer" role="main" aria-label="Report editor content">
      <div v-if="!activeReport" class="text-center mt-5">
        <p>No report initialized.</p>
      </div>
      
      <div v-else class="report-content-wrapper" style="max-width: 850px; margin: 0 auto;">
          <!-- Metadata / Header Block -->
          <div class="report-title-block mb-5 pb-3 border-bottom text-center">
              <h1 class="display-6 fw-bold mb-2">{{ activeReport.metadata.title }}</h1>
              <div class="text-muted small text-uppercase tracking-wide">
                  {{ activeReport.metadata.reportType }} | {{ activeReport.metadata.status }} | {{ activeReport.metadata.revision }}
              </div>
          </div>

          <!-- Section Loop -->
          <TransitionGroup name="section-list" tag="div" class="section-list" role="list" aria-label="Report sections">
              <template v-for="section in activeReport.sections" :key="section.id">
                 <!-- Only show enabled sections in the editor stream -->
                 <div class="report-section-wrapper" v-if="section.enabled" role="listitem">
                     <ReportSection 
                        :section="section" 
                        @toggle="toggleSection"
                        @configure="openConfigModal"
                     />
                 </div>
              </template>
          </TransitionGroup>

          <!-- Enhanced Empty State -->
          <div v-if="visibleSectionsCount === 0" class="empty-state-container" role="status">
            <div class="empty-state-content">
              <div class="empty-state-icon">
                <i class="bi bi-inbox" aria-hidden="true"></i>
              </div>
              <h3 class="empty-state-title">No Sections Enabled</h3>
              <p class="empty-state-description">
                Get started by enabling sections from the sidebar to build your report.
              </p>
              <div class="empty-state-tips">
                <p class="text-muted small mb-2">
                  <i class="bi bi-lightbulb me-1" aria-hidden="true"></i>
                  <strong>Tip:</strong> Use the sidebar to select which sections to include in your report.
                </p>
                <p class="text-muted small mb-0">
                  <i class="bi bi-keyboard me-1" aria-hidden="true"></i>
                  <strong>Keyboard:</strong> Navigate with <kbd>↑</kbd> <kbd>↓</kbd>, toggle with <kbd>Space</kbd>
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>

    <!-- Configuration Modal -->
    <SectionConfigModal
      :show="showConfigModal"
      :section-type="configModalSection?.type || null"
      :section-title="configModalSection?.title || ''"
      :current-configuration="configModalSection?.configuration || {}"
      @close="closeConfigModal"
      @save="saveConfiguration"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import ReportSection from './ReportSection.vue';
import SectionConfigModal from './SectionConfigModal.vue';
import type { ReportSection as ReportSectionType, SectionConfiguration } from '@/types/report';

const store = useReportStore();
const activeReport = computed(() => store.activeReport);
const loading = ref(false); // Could hook into global loading state

const visibleSectionsCount = computed(() => {
    return activeReport.value?.sections.filter(s => s.enabled).length || 0;
});

const toggleSection = (id: string) => {
    store.toggleSection(id);
};

const scrollContainer = ref<HTMLElement | null>(null);

// Expose scroll method if needed
const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

onMounted(() => {
    if (!activeReport.value) {
        // Initialize default if none (for dev/test)
        store.initializeReport();
    }
});

// Configuration Modal State
const showConfigModal = ref(false);
const configModalSection = ref<ReportSectionType | null>(null);

function openConfigModal(sectionId: string) {
    const section = activeReport.value?.sections.find(s => s.id === sectionId);
    if (section) {
        configModalSection.value = section;
        showConfigModal.value = true;
    }
}

function closeConfigModal() {
    showConfigModal.value = false;
    configModalSection.value = null;
}

function saveConfiguration(config: SectionConfiguration) {
    if (configModalSection.value) {
        store.updateSectionConfiguration(configModalSection.value.id, config);
    }
}
</script>

<style scoped>
.report-editor-container {
    background-color: var(--bg-surface);
    overflow: hidden; /* Scroll happens in .editor-scroll-area */
}

.editor-scroll-area {
    overflow-y: auto;
    background-color: var(--bg-elevated);
}

.editor-scroll-area {
    overflow-y: auto;
    background-color: var(--bg-elevated);
}

/* Section List Animations */
.section-list-enter-active,
.section-list-leave-active {
  transition: all var(--transition-slow);
}

.section-list-enter-from,
.section-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Ensure smooth moving items when one is removed */
.section-list-move {
  transition: transform var(--transition-slow);
}

/* Empty state styling */
.empty-state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-2xl);
}

.empty-state-content {
  text-align: center;
  max-width: 500px;
}

.empty-state-icon {
  font-size: 4rem;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-state-description {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.empty-state-tips {
  padding: var(--spacing-md);
  background-color: var(--bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.empty-state-tips kbd {
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  margin: 0 2px;
  box-shadow: 0 1px 0 var(--border);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .section-list-enter-active,
  .section-list-leave-active,
  .section-list-move {
    transition: none;
    animation: none;
  }
}
</style>
