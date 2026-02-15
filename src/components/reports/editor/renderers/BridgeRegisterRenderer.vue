<template>
  <div class="bridge-register-renderer">
    <div v-if="filteredBridges.length === 0" class="alert alert-info" role="status">
      <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
      No bridge data available or all bridges filtered by current configuration settings.
      <button class="btn btn-sm btn-link" @click="$emit('configure')" aria-label="Adjust bridge configuration settings">
        Adjust Configuration
      </button>
    </div>

    <div v-else>
      <!-- Summary Stats -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-label">Total Structures</div>
            <div class="stat-value">{{ filteredBridges.length }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-label">Min Clearance</div>
            <div class="stat-value">
              {{ (minClearance || 0).toFixed(1) }}{{ config.measurementUnit === 'metric' ? 'm' : 'ft' }}
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-label">Critical Structures</div>
            <div class="stat-value text-danger">{{ criticalCount }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-label">Types Included</div>
            <div class="stat-value">{{ config.includeStructureTypes?.length || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- Bridge Table -->
      <div class="table-responsive">
        <table class="table table-striped table-hover" role="table" aria-label="Bridge structures register">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name/Location</th>
              <th scope="col">Type</th>
              <th scope="col">Vertical Clearance</th>
              <th scope="col">Horizontal Clearance</th>
              <th v-if="config.showLoadRatings" scope="col">Load Rating</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="bridge in filteredBridges"
              :key="bridge.id"
              :class="{ 'table-danger': isCritical(bridge) }"
              :aria-label="isCritical(bridge) ? `${bridge.name} - Critical clearance` : `${bridge.name} - Acceptable clearance`"
            >
              <td>
                <code>{{ bridge.id }}</code>
              </td>
              <td>
                <strong>{{ bridge.name }}</strong>
                <br>
                <small class="text-muted">{{ bridge.location }}</small>
              </td>
              <td>
                <span class="badge bg-secondary">{{ bridge.type }}</span>
              </td>
              <td>
                <span :class="{ 'text-danger fw-bold': bridge.verticalClearance < (config.minVerticalClearance ?? 0) }">
                  {{ formatClearance(bridge.verticalClearance) }}
                </span>
              </td>
              <td>
                <span :class="{ 'text-danger fw-bold': bridge.horizontalClearance < (config.minHorizontalClearance ?? 0) }">
                  {{ formatClearance(bridge.horizontalClearance) }}
                </span>
              </td>
              <td v-if="config.showLoadRatings">
                {{ bridge.loadRating }}t
              </td>
              <td>
                <span v-if="isCritical(bridge)" class="badge bg-danger">
                  <i class="bi bi-exclamation-triangle-fill me-1" aria-hidden="true"></i>
                  Critical
                </span>
                <span v-else class="badge bg-success">
                  <i class="bi bi-check-circle-fill me-1" aria-hidden="true"></i>
                  Acceptable
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Configuration Summary -->
      <div class="mt-3 p-3 bg-light rounded">
        <h6 class="mb-2">
          <i class="bi bi-gear me-1"></i>
          Current Filter Settings
        </h6>
        <div class="row">
          <div class="col-md-6">
            <small>
              <strong>Clearance Thresholds:</strong><br>
              Vertical: ≥ {{ config.minVerticalClearance ?? '-' }}{{ config.measurementUnit === 'metric' ? 'm' : 'ft' }}<br>
              Horizontal: ≥ {{ config.minHorizontalClearance ?? '-' }}{{ config.measurementUnit === 'metric' ? 'm' : 'ft' }}
            </small>
          </div>
          <div class="col-md-6">
            <small>
              <strong>Included Structure Types:</strong><br>
              {{ config.includeStructureTypes?.join(', ') || 'All' }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BridgeRegisterConfig } from '@/types/report';

interface Bridge {
  id: string;
  name: string;
  location: string;
  type: string;
  verticalClearance: number;
  horizontalClearance: number;
  loadRating?: number;
}

const props = defineProps<{
  config: BridgeRegisterConfig;
  bridges: Bridge[];
}>();

const emit = defineEmits(['configure']);

// Apply configuration filters
const filteredBridges = computed(() => {
  let bridges = props.bridges || [];

  // Filter by structure types
  if (props.config.includeStructureTypes && props.config.includeStructureTypes.length > 0) {
    bridges = bridges.filter(b =>
      props.config.includeStructureTypes?.includes(b.type)
    );
  }

  // Filter by clearances (if configured)
  if (props.config.minVerticalClearance !== undefined) {
    bridges = bridges.filter(b =>
      b.verticalClearance >= (props.config.minVerticalClearance ?? 0)
    );
  }

  if (props.config.minHorizontalClearance !== undefined) {
    bridges = bridges.filter(b =>
      b.horizontalClearance >= (props.config.minHorizontalClearance ?? 0)
    );
  }

  // Filter by load capacity (if configured)
  if (props.config.maxLoadCapacity !== undefined) {
    bridges = bridges.filter(b =>
      !b.loadRating || b.loadRating <= (props.config.maxLoadCapacity ?? 1000)
    );
  }

  return bridges;
});

// Calculate statistics
const minClearance = computed(() => {
  if (filteredBridges.value.length === 0) return 0;
  return Math.min(...filteredBridges.value.map(b => b.verticalClearance));
});

const criticalCount = computed(() => {
  return filteredBridges.value.filter(b => isCritical(b)).length;
});

// Helper functions
function isCritical(bridge: Bridge): boolean {
  return (
    bridge.verticalClearance < (props.config.minVerticalClearance ?? 0) ||
    bridge.horizontalClearance < (props.config.minHorizontalClearance ?? 0)
  );
}

function formatClearance(value: number): string {
  const unit = props.config.measurementUnit === 'imperial' ? 'ft' : 'm';
  return `${value.toFixed(1)}${unit}`;
}
</script>

<style scoped>
.bridge-register-renderer {
  padding: 1rem 0;
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  text-align: center;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.table-danger {
  background-color: #f8d7da !important;
}

.table-danger:hover {
  background-color: #f1c2c6 !important;
}

code {
  background-color: var(--bg-elevated);
  padding: var(--spacing-2xs) var(--spacing-xs);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .stat-card {
    transition: none;
  }
}
</style>
