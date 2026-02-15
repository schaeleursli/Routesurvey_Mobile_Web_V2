<template>
  <div :id="`section-${section.id}`" class="report-section card mb-4" :class="{ 'border-primary': isFocused }" role="article" :aria-labelledby="`section-title-${section.id}`">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0" :id="`section-title-${section.id}`">
        {{ section.title }}
        <span v-if="section.required" class="badge bg-light text-dark border ms-2">Required</span>
        <span v-else class="badge bg-light text-secondary border ms-2">Optional</span>
      </h5>
      <div class="d-flex align-items-center gap-2">
        <div class="section-meta" aria-live="polite">
          <span v-if="section.status === 'Complete'" class="text-success"><PhCheckCircle :size="16" weight="fill" aria-hidden="true" /> Complete</span>
          <span v-else-if="section.status === 'Warning'" class="text-warning"><PhWarning :size="16" weight="fill" aria-hidden="true" /> Review</span>
          <span v-else-if="section.status === 'Error'" class="text-danger"><PhXCircle :size="16" weight="fill" aria-hidden="true" /> Invalid</span>
          <span v-else-if="!section.enabled" class="text-muted">Disabled</span>
          <span v-else class="text-secondary">Incomplete</span>
        </div>
        <button
          v-if="section.enabled"
          type="button"
          class="btn btn-sm btn-outline-secondary setup-btn"
          :class="{ 'config-active': hasCustomConfig }"
          @click="handleSetupClick"
          :title="`Configure ${section.title} settings`"
          :aria-label="`Configure ${section.title}`"
          :aria-pressed="hasCustomConfig"
        >
          <PhGear :size="16" weight="fill" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div class="card-body">
      <!-- Disabled State -->
      <div v-if="!section.enabled" class="text-center py-4 text-muted bg-light rounded">
        <PhEyeSlash :size="24" class="mb-2" />
        <p class="mb-0">This section is currently disabled and will not appear in the report.</p>
        <button class="btn btn-sm btn-outline-primary mt-2" @click="$emit('toggle', section.id)">Enable Section</button>
      </div>

      <!-- Enabled State -->
      <div v-else>
        <!-- Specialized Renderers with Configuration -->
        <div v-if="hasRenderer(section.type)">
          <!-- Bridge Register Renderer -->
          <BridgeRegisterRenderer
            v-if="section.type === 'Bridge_Structure_Register'"
            :config="section.configuration || {}"
            :bridges="bridgeData"
            @configure="handleSetupClick"
          />
          
          <!-- Clearance Analysis Renderer -->
          <ClearanceAnalysisRenderer
            v-else-if="section.type === 'Clearance_Analysis'"
            :config="section.configuration || {}"
            :clearances="clearanceData"
            @configure="handleSetupClick"
          />
          
          <!-- Transport Assumptions Renderer -->
          <TransportAssumptionsRenderer
            v-else-if="section.type === 'Transport_Assumptions'"
            :config="section.configuration || {}"
            @configure="handleSetupClick"
          />
          
          <!-- Photo Log Renderer -->
          <PhotoLogRenderer
            v-else-if="section.type === 'Photo_Log'"
            :config="section.configuration || {}"
            :photos="photoData"
            @configure="handleSetupClick"
          />
        </div>

        <!-- Fallback: Manual Input for other sections -->
        <div v-else>
           <MinimalRichTextEditor 
             v-model="internalContent" 
             :placeholder="getPlaceholderData(section.type)"
             @focus="isFocused = true"
             @blur="isFocused = false"
           />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { PhCheckCircle, PhWarning, PhXCircle, PhGear, PhEyeSlash } from '@phosphor-icons/vue';
import type { ReportSection, SectionType } from '@/types/report';
import MinimalRichTextEditor from './MinimalRichTextEditor.vue';
import BridgeRegisterRenderer from './renderers/BridgeRegisterRenderer.vue';
import ClearanceAnalysisRenderer from './renderers/ClearanceAnalysisRenderer.vue';
import TransportAssumptionsRenderer from './renderers/TransportAssumptionsRenderer.vue';
import PhotoLogRenderer from './renderers/PhotoLogRenderer.vue';
import { useReportStore } from '@/stores/reportStore';

const props = defineProps<{
  section: ReportSection
}>();

const emit = defineEmits(['toggle', 'configure']);

const store = useReportStore();
const isFocused = ref(false);
const internalContent = ref(props.section.content);

watch(internalContent, (newVal) => {
  store.updateSectionContent(props.section.id, newVal);
});

// Sync from store if external update (e.g. undo/redo or init)
watch(() => props.section.content, (newVal) => {
    if (newVal !== internalContent.value) {
        internalContent.value = newVal;
    }
});

// Check if section has custom (non-default) configuration
const hasCustomConfig = computed(() => {
    if (!props.section.configuration) return false;
    // Could implement more sophisticated check against defaults
    return Object.keys(props.section.configuration).length > 0;
});

function handleSetupClick() {
    emit('configure', props.section.id);
}

// Check if section type has a custom renderer
function hasRenderer(type: SectionType): boolean {
    return [
        'Bridge_Structure_Register',
        'Clearance_Analysis',
        'Transport_Assumptions',
        'Photo_Log'
    ].includes(type);
}

type SectionData = Record<string, unknown>;
const sectionData = computed<SectionData>(() => {
  if (!props.section) return {};
  const data = (props.section as { data?: unknown }).data;
  return data && typeof data === 'object' ? (data as SectionData) : {};
});
const bridgeData = computed(() => (sectionData.value.bridges || []) as any[]);
const clearanceData = computed(() => (sectionData.value.clearances || []) as any[]);
const photoData = computed(() => (sectionData.value.photos || []) as any[]);

const isAutoGenerated = (type: SectionType) => {
  const autoTypes: SectionType[] = [
      'Cover_Metadata', 
      'Route_Overview', 
      'Transport_Assumptions', // Partially
      'Bridge_Structure_Register',
      'Clearance_Analysis',
      'Maps_KML',
      'Photo_Log'
  ];
  return autoTypes.includes(type);
};

const getPlaceholderText = (type: SectionType) => {
    switch(type) {
        case 'Bridge_Structure_Register': return 'No bridge data is linked to this route yet. Run a route survey or import a bridge register.';
        case 'Route_Overview': return 'Map and basic route statistics will appear here.';
        default: return 'Data will be auto-generated.';
    }
};

const getPlaceholderData = (type: SectionType) => {
    // Return professional placeholder text instructions
    return "Enter detailed analysis here...";
}
</script>

<style scoped>
.bg-soft-info {
    background-color: rgb(15 98 254 / 10%);
    color: var(--accent);
}

.setup-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
}

.setup-btn:hover {
    background-color: var(--bg-elevated);
    color: var(--text-primary);
}

.setup-btn.config-active {
    background-color: var(--accent);
    color: white;
    border-color: var(--accent);
}

.setup-btn.config-active:hover {
    background-color: var(--accent-hover);
    opacity: 1;
}

.setup-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px var(--accent-focus-ring);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .setup-btn {
        transition: none;
    }
}
</style>
