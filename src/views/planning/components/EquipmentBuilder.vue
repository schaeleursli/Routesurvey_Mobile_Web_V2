<template>
  <div class="equipment-builder">
    <!-- Assembly Preset Quick-Select -->
    <div v-if="presets.length > 0" class="preset-section mb-4">
      <div class="section-header">
        <h5 class="section-title">
          <i class="bi bi-lightning-charge-fill me-2"></i>
          Quick Select: Assembly Presets
        </h5>
        <button class="btn-browse-presets" @click="openCatalogBrowser('preset')">
          Browse All <i class="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
      <div class="preset-grid">
        <AssemblyPresetCard
          v-for="preset in presets.slice(0, 3)"
          :key="preset.id"
          :preset="preset"
          compact
          @apply="applyPreset"
        />
      </div>
    </div>

    <!-- Main Equipment Selection -->
    <div class="row g-3">
      <!-- Prime Mover Column -->
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fs-6"><i class="bi bi-truck me-2"></i> Prime Mover</h5>
              <button class="btn-browse-mini" @click="openCatalogBrowser('tractor')" title="Browse Catalog">
                📋
              </button>
            </div>
          </div>
          <div class="card-body">
            <!-- Catalog Selection Mode -->
            <div v-if="useCatalogMode">
              <div class="mb-3">
                <label class="form-label">Select from Catalog</label>
                <select class="form-select" v-model="selectedTractorId" @change="onTractorSelect">
                  <option value="">Select Tractor...</option>
                  <optgroup v-if="tractorsByRegion.US.length > 0" label="🇺🇸 US">
                    <option v-for="t in tractorsByRegion.US" :key="t.id" :value="t.id">
                      {{ t.name }} ({{ t.spec?.axleConfig }})
                    </option>
                  </optgroup>
                  <optgroup v-if="tractorsByRegion.EU.length > 0" label="🇪🇺 EU">
                    <option v-for="t in tractorsByRegion.EU" :key="t.id" :value="t.id">
                      {{ t.name }} ({{ t.spec?.axleConfig }})
                    </option>
                  </optgroup>
                </select>
              </div>

              <div v-if="selectedTractor" class="catalog-item-preview">
                <div class="preview-badge">From Catalog</div>
                <div class="preview-name">{{ selectedTractor.name }}</div>
                <div class="preview-meta">
                  {{ selectedTractor.manufacturer }} {{ selectedTractor.model }}
                </div>
                <div class="preview-specs">
                  <span class="spec-badge">{{ selectedTractor.spec?.axleConfig }}</span>
                  <span class="spec-badge">{{ formatLength(selectedTractor.spec?.wheelbaseM) }} WB</span>
                </div>
              </div>

              <button class="btn btn-sm btn-link p-0 mt-2" @click="switchToManualMode">
                Switch to Manual Entry
              </button>
            </div>

            <!-- Manual Entry Mode -->
            <div v-else>
              <div class="mb-3">
                <label class="form-label">Model</label>
                <select class="form-select" v-model="equipment.primeMover.name">
                  <option value="">Select Truck...</option>
                  <option value="Volvo FH16 750">Volvo FH16 750 (8x4)</option>
                  <option value="Mercedes Actros SLT">Mercedes Actros SLT (8x4)</option>
                  <option value="Generic 6x4">Generic 6x4 Prime Mover</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Registration / ID</label>
                <input v-model="equipment.primeMover.registration" type="text" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Tare Weight (kg)</label>
                <input v-model.number="equipment.primeMover.tare_weight_kg" type="number" class="form-control" />
              </div>

              <button class="btn btn-sm btn-link p-0" @click="switchToCatalogMode">
                Use Catalog Instead
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Trailer Column -->
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fs-6"><i class="bi bi-layout-three-columns me-2"></i> Trailer</h5>
              <button class="btn-browse-mini" @click="openCatalogBrowser('module')" title="Browse Catalog">
                📋
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Trailer Type</label>
              <select class="form-select" v-model="equipment.trailer.type">
                <option value="Modular">Modular (Hydraulic)</option>
                <option value="Lowbed">Lowbed / Semi</option>
                <option value="SPMT">SPMT</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Model / Name</label>
              <input v-model="equipment.trailer.name" type="text" class="form-control" placeholder="e.g. Goldhofer THP/SL" />
            </div>
            
            <div class="row g-2">
              <div class="col-6">
                <label class="form-label small">Axles</label>
                <input v-model.number="equipment.trailer.num_axles" type="number" class="form-control form-control-sm" />
              </div>
              <div class="col-6">
                <label class="form-label small">Tare (kg)</label>
                <input v-model.number="equipment.trailer.tare_weight_kg" type="number" class="form-control form-control-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuration Column -->
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-header bg-light">
            <h5 class="mb-0 fs-6"><i class="bi bi-sliders me-2"></i> Dimensions</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Deck Height (m)</label>
              <input v-model.number="equipment.trailer.deck_height_m" type="number" step="0.05" class="form-control" />
              <small class="text-muted">Laden height assumption</small>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Deck Length (m)</label>
              <input v-model.number="equipment.trailer.deck_length_m" type="number" step="0.1" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Width (m)</label>
              <input v-model.number="equipment.trailer.width_m" type="number" step="0.05" class="form-control" />
              <small class="text-muted" v-if="equipment.trailer.width_m > 3.0">Warning: Wide load</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualizer Strip -->
    <div class="mt-4 p-3 bg-white border rounded">
      <h6>Combination Preview</h6>
      <div class="d-flex align-items-center justify-content-center p-4 bg-light rounded">
        <div class="text-center me-1">
          <i class="bi bi-truck display-4 text-primary"></i>
          <div class="small">{{ equipment.primeMover.name || 'Prime Mover' }}</div>
        </div>
        <div class="border-top border-4 border-dark" style="width: 30px; height: 10px;"></div>
        <div class="d-flex">
          <div v-for="n in Math.min(equipment.trailer.num_axles || 4, 12)" :key="n" class="mx-1">
            <div class="bg-dark rounded-circle" style="width: 12px; height: 12px; margin-top: 20px;"></div>
          </div>
          <div v-if="(equipment.trailer.num_axles || 0) > 12" class="ms-1 align-self-end small">
            +{{equipment.trailer.num_axles - 12}}
          </div>
        </div>
      </div>
    </div>

    <!-- Catalog Browser Modal -->
    <CatalogBrowserModal
      v-model="showCatalogBrowser"
      :mode="catalogBrowserMode"
      :multi-select="catalogBrowserMode === 'module'"
      @select="handleCatalogSelection"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCatalog } from '@/composables/useCatalog';
import CatalogBrowserModal from '@/components/equipment/CatalogBrowserModal.vue';
import AssemblyPresetCard from '@/components/equipment/AssemblyPresetCard.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const equipment = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// Catalog state
const { 
  tractors, 
  presets, 
  tractorsByRegion,
  loadAll, 
  loadByCategory,
  findByName,
  loading,
  error
} = useCatalog();

const useCatalogMode = ref(false);
const selectedTractorId = ref('');
const selectedTractor = computed(() => {
  if (!selectedTractorId.value) return null;
  return tractors.value.find(t => t.id === selectedTractorId.value);
});

const showCatalogBrowser = ref(false);
const catalogBrowserMode = ref('tractor');

// Load catalog data on mount
onMounted(async () => {
  try {
    await loadAll();
    // If backend is available and catalog has items, default to catalog mode
    if (tractors.value.length > 0) {
      useCatalogMode.value = true;
    }
  } catch (err) {
    console.error('Failed to load catalog, falling back to manual mode:', err);
    useCatalogMode.value = false;
  }
});

const switchToCatalogMode = () => {
  useCatalogMode.value = true;
};

const switchToManualMode = () => {
  useCatalogMode.value = false;
  selectedTractorId.value = '';
};

const onTractorSelect = () => {
  if (selectedTractor.value) {
    // Populate equipment from catalog spec
    equipment.value.primeMover.name = selectedTractor.value.name;
    equipment.value.primeMover.catalogItemId = selectedTractor.value.id;
    // Could populate more fields from spec if available
  }
};

const openCatalogBrowser = (mode) => {
  catalogBrowserMode.value = mode;
  showCatalogBrowser.value = true;
};

const handleCatalogSelection = (selection) => {
  if (catalogBrowserMode.value === 'tractor') {
    selectedTractorId.value = selection.id;
    useCatalogMode.value = true;
    onTractorSelect();
  } else if (catalogBrowserMode.value === 'module') {
    // Handle module(s) selection
    const modules = Array.isArray(selection) ? selection : [selection];
    console.log('Selected modules:', modules);
    // TODO: Implement module integration
  } else if (catalogBrowserMode.value === 'preset') {
    applyPreset(selection);
  }
};

const applyPreset = async (preset) => {
  console.log('Applying preset:', preset);
  // TODO: Implement preset materialization
  // This would call backend to expand preset refs into full configuration
  // For now, just log it
  alert(`Preset "${preset.name}" selected. Materialization coming in Phase 2!`);
};

const formatLength = (meters) => {
  if (!meters) return '';
  return `${meters.toFixed(1)}m`;
};
</script>

<style scoped>
.equipment-builder {
  padding: 1rem;
}

.preset-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #0c4a6e;
  margin: 0;
}

.btn-browse-presets {
  background: white;
  border: 2px solid #0ea5e9;
  color: #0369a1;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-browse-presets:hover {
  background: #0ea5e9;
  color: white;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.btn-browse-mini {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.btn-browse-mini:hover {
  background: rgb(0 0 0 / 5%);
}

.catalog-item-preview {
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.preview-badge {
  display: inline-block;
  background: var(--success);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.preview-name {
  font-size: 16px;
  font-weight: 700;
  color: #166534;
  margin-bottom: 4px;
}

.preview-meta {
  font-size: 13px;
  color: #15803d;
  margin-bottom: 8px;
}

.preview-specs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.spec-badge {
  display: inline-block;
  background: white;
  border: 1px solid #86efac;
  color: #166534;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
</style>
