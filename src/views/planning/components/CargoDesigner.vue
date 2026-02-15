<template>
  <div class="cargo-designer">
    <div class="row">
      <!-- Input Column -->
      <div class="col-md-5">
        <div class="form-section">
          <h4><i class="bi bi-box-seam me-2"></i> Cargo Definitions</h4>
          
          <div class="form-group mb-3">
            <label class="form-label">Cargo Name / ID</label>
            <input 
              v-model="cargo.name" 
              type="text" 
              class="form-control" 
              placeholder="e.g. Siemens Transformer T-101"
            />
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Weight (kg) *</label>
              <div class="input-group">
                <input 
                  v-model.number="cargo.weight_kg" 
                  type="number" 
                  class="form-control" 
                  step="100"
                />
                <span class="input-group-text">kg</span>
              </div>
            </div>
          </div>

          <h5 class="mt-4 mb-3 text-muted border-bottom pb-2">Dimensions</h5>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Length</label>
              <div class="input-group input-group-sm">
                <input v-model.number="cargo.length_m" type="number" step="0.01" class="form-control" />
                <span class="input-group-text">m</span>
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Width</label>
              <div class="input-group input-group-sm">
                <input v-model.number="cargo.width_m" type="number" step="0.01" class="form-control" />
                <span class="input-group-text">m</span>
              </div>
            </div>
             <div class="col-md-4">
              <label class="form-label">Height</label>
              <div class="input-group input-group-sm">
                <input v-model.number="cargo.height_m" type="number" step="0.01" class="form-control" />
                <span class="input-group-text">m</span>
              </div>
            </div>
          </div>

          <h5 class="mt-4 mb-3 text-muted border-bottom pb-2">Center of Gravity (CoG)</h5>
          <p class="small text-muted mb-2">Offsets usually from center-bottom of cargo.</p>
          
           <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">X (Long)</label>
              <div class="input-group input-group-sm">
                <input v-model.number="cargo.cog_x" type="number" step="0.01" class="form-control" />
                <span class="input-group-text">m</span>
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Y (Trans)</label>
              <div class="input-group input-group-sm">
                <input v-model.number="cargo.cog_y" type="number" step="0.01" class="form-control" />
                <span class="input-group-text">m</span>
              </div>
            </div>
             <div class="col-md-4">
              <label class="form-label">Z (Vert)</label>
              <div class="input-group input-group-sm">
                <input v-model.number="cargo.cog_z" type="number" step="0.01" class="form-control" />
                <span class="input-group-text">m</span>
              </div>
            </div>
          </div>

           <div class="form-group mt-3">
            <label class="form-label">Notes</label>
            <textarea v-model="cargo.notes" class="form-control" rows="2"></textarea>
          </div>
        </div>
      </div>

      <!-- Visualization Column (Placeholder for 3D schematic) -->
      <div class="col-md-7">
        <div class="schematic-preview">
          <div class="preview-header">
            <span>Schematic Preview</span>
            <span class="badge bg-secondary">Top View</span>
          </div>
          
          <div class="preview-canvas d-flex align-items-center justify-content-center">
            <!-- Simple CSS Representation -->
            <div class="cargo-box" :style="boxStyle">
              <div class="cog-marker" :style="cogStyle">
                <i class="bi bi-crosshair"></i>
              </div>
              <span class="dims-label">{{ cargo.length_m || 0 }}m x {{ cargo.width_m || 0 }}m</span>
            </div>
          </div>

          <div class="alert alert-info mt-3 small">
            <i class="bi bi-info-circle me-1"></i>
            Visual representation is approximate. CoG (Z) is not shown in Top View.
          </div>
        </div>

        <div class="mt-3">
             <div class="card bg-light border-0">
               <div class="card-body">
                 <h6 class="card-title">Summary</h6>
                 <ul>
                    <li><strong>Volume:</strong> {{ volume.toFixed(2) }} m³</li>
                    <li><strong>Density:</strong> {{ density.toFixed(2) }} kg/m³</li>
                 </ul>
               </div>
             </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

// Use a computed property for two-way binding proxy for cleaner templates
const cargo = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const volume = computed(() => {
    return (cargo.value.length_m || 0) * (cargo.value.width_m || 0) * (cargo.value.height_m || 0);
});

const density = computed(() => {
    if (volume.value <= 0) return 0;
    return (cargo.value.weight_kg || 0) / volume.value;
});

// Styles for the CSS box
const boxStyle = computed(() => {
    // scale factor to fit in 300px box
    const maxDim = Math.max(cargo.value.length_m || 1, cargo.value.width_m || 1);
    const scale = 200 / maxDim;
    
    return {
        width: `${(cargo.value.length_m || 1) * scale}px`,
        height: `${(cargo.value.width_m || 1) * scale}px`,
        backgroundColor: 'var(--border)',
        border: '2px solid var(--text-secondary)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };
});

const cogStyle = computed(() => {
    // This is rough approximation for top-view (x, y)
    // 0,0 is center of box
    return {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${cargo.value.cog_x * 10}px), calc(-50% + ${cargo.value.cog_y * 10}px))`, // scaling factor needed
        color: 'red'
    };
});
</script>

<style scoped>
.cargo-designer {
  padding: 1rem;
}

.schematic-preview {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.preview-canvas {
  flex: 1;
  background-image: radial-gradient(var(--border) 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 4px;
}

.dims-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
}
</style>
