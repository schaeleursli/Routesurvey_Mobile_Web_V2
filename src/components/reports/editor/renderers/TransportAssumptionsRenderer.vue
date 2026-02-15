<template>
  <div class="transport-assumptions-renderer">
    <!-- Vehicle Envelope Diagram -->
    <div class="vehicle-envelope-section mb-4">
      <h6 class="mb-3">
        <i class="bi bi-truck me-2"></i>
        Vehicle & Cargo Envelope
      </h6>
      
      <div class="row">
        <!-- Side View Diagram -->
        <div class="col-md-6">
          <div class="diagram-container">
            <h6 class="text-center mb-2">Side View</h6>
            <svg viewBox="0 0 400 250" class="vehicle-diagram">
              <!-- Ground -->
              <line x1="10" y1="220" x2="390" y2="220" stroke="#333" stroke-width="2"/>
              
              <!-- Vehicle outline (simple truck shape) -->
              <!-- Wheels -->
              <circle cx="100" cy="220" r="20" fill="#333"/>
              <circle cx="300" cy="220" r="20" fill="#333"/>
              
              <!-- Trailer bed -->
              <rect x="60" y="140" :width="vehicleLengthPx" :height="40" fill="#e0e0e0" stroke="#333" stroke-width="2"/>
              
              <!-- Cargo -->
              <rect 
                x="80" 
                :y="140 - cargoHeightPx" 
                :width="vehicleLengthPx - 40" 
                :height="cargoHeightPx" 
                fill="#4CAF50" 
                stroke="#2E7D32" 
                stroke-width="2"
                opacity="0.7"
              />
              
              <!-- Dimensions -->
              <!-- Length -->
              <line x1="60" y1="240" :x2="60 + vehicleLengthPx" y2="240" stroke="#0066cc" stroke-width="1" marker-end="url(#arrowblue)"/>
              <text :x="60 + vehicleLengthPx/2" y="255" text-anchor="middle" class="dimension-text">
                {{ config.vehicleLength }}m
              </text>
              
              <!-- Height -->
              <line x1="370" y1="220" x2="370" :y2="140 - cargoHeightPx" stroke="#0066cc" stroke-width="1" marker-end="url(#arrowblue)"/>
              <text x="385" :y="180 - cargoHeightPx/2" class="dimension-text">
                {{ config.vehicleHeight }}m
              </text>
              
              <!-- Arrow markers -->
              <defs>
                <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#0066cc" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
        
        <!-- Front View Diagram -->
        <div class="col-md-6">
          <div class="diagram-container">
            <h6 class="text-center mb-2">Front View</h6>
            <svg viewBox="0 0 300 250" class="vehicle-diagram">
              <!-- Ground -->
              <line x1="10" y1="220" x2="290" y2="220" stroke="#333" stroke-width="2"/>
              
              <!-- Vehicle/Cargo -->
              <rect 
                :x="150 - vehicleWidthPx/2" 
                :y="220 - cargoHeightPx" 
                :width="vehicleWidthPx" 
                :height="cargoHeightPx" 
                fill="#4CAF50" 
                stroke="#2E7D32" 
                stroke-width="2"
                opacity="0.7"
              />
              
              <!-- Dimensions -->
              <!-- Width -->
              <line 
                :x1="150 - vehicleWidthPx/2" 
                y1="235" 
                :x2="150 + vehicleWidthPx/2" 
                y2="235" 
                stroke="#0066cc" 
                stroke-width="1"
              />
              <text x="150" y="245" text-anchor="middle" class="dimension-text">
                {{ config.vehicleWidth }}m
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Specifications Table -->
    <div class="specifications-section mb-4">
      <h6 class="mb-3">
        <i class="bi bi-clipboard-data me-2"></i>
        Technical Specifications
      </h6>
      
      <div class="row">
        <div class="col-md-6">
          <table class="table table-sm table-bordered">
            <tbody>
              <tr>
                <th class="bg-light" width="50%">Vehicle Length</th>
                <td><strong>{{ config.vehicleLength }} m</strong></td>
              </tr>
              <tr>
                <th class="bg-light">Vehicle Width</th>
                <td><strong>{{ config.vehicleWidth }} m</strong></td>
              </tr>
              <tr>
                <th class="bg-light">Vehicle Height</th>
                <td><strong>{{ config.vehicleHeight }} m</strong></td>
              </tr>
              <tr>
                <th class="bg-light">Axle Configuration</th>
                <td>
                  <span class="badge bg-primary">{{ config.axleConfiguration }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="col-md-6">
          <table class="table table-sm table-bordered">
            <tbody>
              <tr>
                <th class="bg-light" width="50%">Maximum Speed</th>
                <td><strong>{{ config.maxSpeed }} km/h</strong></td>
              </tr>
              <tr>
                <th class="bg-light">Requires Escort</th>
                <td>
                  <span v-if="config.requiresEscort" class="badge bg-warning text-dark">
                    <i class="bi bi-shield-check me-1"></i>
                    Yes - Escort Required
                  </span>
                  <span v-else class="badge bg-success">
                    <i class="bi bi-check-circle me-1"></i>
                    No Escort Needed
                  </span>
                </td>
              </tr>
              <tr>
                <th class="bg-light">Turning Radius</th>
                <td>
                  <span class="text-muted">
                    Calculated: ~{{ estimatedTurningRadius }} m
                  </span>
                </td>
              </tr>
              <tr>
                <th class="bg-light">Estimated Weight</th>
                <td>
                  <span class="text-muted">
                    {{ estimatedAxleCount }} axles
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="config.requiresEscort" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>Escort Required:</strong> This transport exceeds standard dimensions and requires escort vehicles.
    </div>
    
    <div v-if="isOversize" class="alert alert-info">
      <i class="bi bi-info-circle me-2"></i>
      <strong>Oversize Load:</strong> Vehicle dimensions exceed standard road limits. Special permits may be required.
    </div>

    <!-- Configuration Summary -->
    <div class="config-summary p-3 bg-light rounded">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <small class="text-muted">
            <i class="bi bi-gear me-1"></i>
            Based on configured transport parameters
          </small>
        </div>
        <button class="btn btn-sm btn-outline-secondary" @click="$emit('configure')">
          <i class="bi bi-pencil me-1"></i>
          Modify Parameters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TransportAssumptionsConfig } from '@/types/report';

const props = defineProps<{
  config: TransportAssumptionsConfig;
}>();

const emit = defineEmits(['configure']);

// SVG scaling for diagrams (pixels per meter)
const scale = 15;

const vehicleLengthPx = computed(() => Math.min((props.config.vehicleLength ?? 15) * scale, 280));
const vehicleWidthPx = computed(() => Math.min((props.config.vehicleWidth ?? 2.5) * scale, 100));
const cargoHeightPx = computed(() => Math.min((props.config.vehicleHeight ?? 4) * scale, 120));

// Estimated turning radius based on vehicle length
const estimatedTurningRadius = computed(() => {
  // Simple estimation: longer vehicles need larger turning radius
  return Math.max(15, Math.ceil((props.config.vehicleLength ?? 0) * 1.2));
});

// Extract number of axles from configuration
const estimatedAxleCount = computed(() => {
  const match = props.config.axleConfiguration?.match(/(\d+)/);
  return match ? parseInt(match[1]) : 4;
});

// Check if vehicle is considered oversize
const isOversize = computed(() => {
  return (
    (props.config.vehicleLength ?? 0) > 20 ||
    (props.config.vehicleWidth ?? 0) > 4 ||
    (props.config.vehicleHeight ?? 0) > 4.5
  );
});
</script>

<style scoped>
.transport-assumptions-renderer {
  padding: 1rem 0;
}

.diagram-container {
  background: white;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.vehicle-diagram {
  width: 100%;
  height: auto;
  display: block;
}

.dimension-text {
  font-size: 12px;
  fill: #06c;
  font-weight: 600;
}

.specifications-section table th {
  font-weight: 500;
  font-size: 0.875rem;
}

.specifications-section table td {
  font-size: 0.875rem;
}

.config-summary {
  border-left: 4px solid var(--accent);
}
</style>
