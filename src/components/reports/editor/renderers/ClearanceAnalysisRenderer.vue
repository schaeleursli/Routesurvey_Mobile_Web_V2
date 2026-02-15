<template>
  <div class="clearance-analysis-renderer">
    <div v-if="clearances.length === 0" class="alert alert-info">
      <i class="bi bi-info-circle me-2"></i>
      No clearance data available for analysis.
    </div>

    <div v-else>
      <!-- Summary Section -->
      <div class="analysis-summary mb-4 p-3 border rounded">
        <h6 class="mb-3">
          <i class="bi bi-bar-chart me-2"></i>
          Clearance Analysis Summary
        </h6>
        <div class="row">
          <div class="col-md-3">
            <div class="summary-stat">
              <div class="stat-label">Total Points</div>
              <div class="stat-value">{{ clearances.length }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="summary-stat">
              <div class="stat-label">Critical Points</div>
              <div class="stat-value text-danger">{{ criticalPoints.length }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="summary-stat">
              <div class="stat-label">Min Clearance</div>
              <div class="stat-value" :class="{ 'text-danger': minimumClearance < effectiveThreshold }">
                {{ formatValue(minimumClearance) }}
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="summary-stat">
              <div class="stat-label">Safety Margin</div>
              <div class="stat-value" :class="safetyMarginClass">
                {{ formatValue(safetyMargin) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Critical Points Alert -->
      <div v-if="criticalPoints.length > 0" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>{{ criticalPoints.length }} critical clearance point(s) detected</strong> below the threshold of {{ formatValue(effectiveThreshold) }}.
        Immediate attention required.
      </div>

      <!-- Clearance Table -->
      <div class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Location</th>
              <th>Type</th>
              <th>Vertical Clearance</th>
              <th>Lateral Clearance</th>
              <th>With Tolerance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(clearance, index) in sortedClearances"
              :key="clearance.id"
              :class="getClearanceRowClass(clearance)"
            >
              <td>{{ index + 1 }}</td>
              <td>
                <strong>{{ clearance.location }}</strong>
                <br>
                <small class="text-muted">{{ clearance.coordinates }}</small>
              </td>
              <td>
                <span class="badge bg-secondary">{{ clearance.type }}</span>
              </td>
              <td>
                <div class="clearance-value" :class="getValueClass(clearance.vertical)">
                  <strong>{{ formatValue(clearance.vertical) }}</strong>
                  <span v-if="isCriticalValue(clearance.vertical)" class="ms-1">
                    <i class="bi bi-exclamation-triangle-fill text-danger"></i>
                  </span>
                </div>
              </td>
              <td>
                <div class="clearance-value" :class="getValueClass(clearance.lateral)">
                  <strong>{{ formatValue(clearance.lateral) }}</strong>
                  <span v-if="isCriticalValue(clearance.lateral, 'lateral')" class="ms-1">
                    <i class="bi bi-exclamation-triangle-fill text-danger"></i>
                  </span>
                </div>
              </td>
              <td>
                <span class="text-muted">
                  {{ formatValue(clearance.vertical - (config.toleranceValue ?? 0)) }}
                </span>
              </td>
              <td>
                <span v-if="isCriticalClearance(clearance)" class="badge bg-danger">
                  Critical
                </span>
                <span v-else-if="isWarningClearance(clearance)" class="badge bg-warning text-dark">
                  Warning
                </span>
                <span v-else class="badge bg-success">
                  Acceptable
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Configuration Panel -->
      <div class="config-panel mt-4 p-3 bg-light rounded">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-2">
              <i class="bi bi-sliders me-1"></i>
              Analysis Parameters
            </h6>
            <div class="row">
              <div class="col-md-4">
                <small>
                  <strong>Threshold:</strong> {{ formatValue(config.verticalClearanceThreshold ?? 0) }}<br>
                  <strong>Lateral Threshold:</strong> {{ formatValue(config.lateralClearanceThreshold ?? 0) }}
                </small>
              </div>
              <div class="col-md-4">
                <small>
                  <strong>Safety Tolerance:</strong> {{ formatValue(config.toleranceValue ?? 0) }}<br>
                  <strong>Measurement Unit:</strong> {{ config.measurementUnit === 'metric' ? 'Metric (m)' : 'Imperial (ft)' }}
                </small>
              </div>
              <div class="col-md-4">
                <small>
                  <strong>Highlight Critical:</strong> {{ config.highlightCritical ? 'Yes' : 'No' }}<br>
                  <strong>Effective Threshold:</strong> {{ formatValue(effectiveThreshold) }}
                </small>
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline-secondary" @click="$emit('configure')">
            <i class="bi bi-gear me-1"></i>
            Adjust
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ClearanceAnalysisConfig } from '@/types/report';

interface ClearancePoint {
  id: string;
  location: string;
  coordinates: string;
  type: string;
  vertical: number; // in meters or feet
  lateral: number;
}

const props = defineProps<{
  config: ClearanceAnalysisConfig;
  clearances: ClearancePoint[];
}>();

const emit = defineEmits(['configure']);

// Effective threshold includes tolerance
const effectiveThreshold = computed(() => {
  return (props.config.verticalClearanceThreshold ?? 0) + (props.config.toleranceValue || 0);
});

// Critical points (below threshold)
const criticalPoints = computed(() => {
  return props.clearances.filter(c => isCriticalClearance(c));
});

// Minimum clearance value
const minimumClearance = computed(() => {
  if (props.clearances.length === 0) return 0;
  return Math.min(...props.clearances.map(c => c.vertical));
});

// Safety margin (minimum - threshold)
const safetyMargin = computed(() => {
  return minimumClearance.value - effectiveThreshold.value;
});

const safetyMarginClass = computed(() => {
  if (safetyMargin.value < 0) return 'text-danger';
  if (safetyMargin.value < 0.5) return 'text-warning';
  return 'text-success';
});

// Sort by vertical clearance (critical first)
const sortedClearances = computed(() => {
  return [...props.clearances].sort((a, b) => a.vertical - b.vertical);
});

// Helper functions
function isCriticalValue(value: number, type: 'vertical' | 'lateral' = 'vertical'): boolean {
  const threshold = type === 'vertical'
    ? props.config.verticalClearanceThreshold
    : props.config.lateralClearanceThreshold;
  return value < (threshold ?? 0);
}

function isCriticalClearance(clearance: ClearancePoint): boolean {
  return (
    clearance.vertical < (props.config.verticalClearanceThreshold ?? 0) ||
    clearance.lateral < (props.config.lateralClearanceThreshold ?? 0)
  );
}

function isWarningClearance(clearance: ClearancePoint): boolean {
  const warningThreshold = effectiveThreshold.value + 0.5;
  return clearance.vertical < warningThreshold && !isCriticalClearance(clearance);
}

function getClearanceRowClass(clearance: ClearancePoint): string {
  if (!props.config.highlightCritical) return '';
  if (isCriticalClearance(clearance)) return 'table-danger';
  if (isWarningClearance(clearance)) return 'table-warning';
  return '';
}

function getValueClass(value: number): string {
  if (!props.config.highlightCritical) return '';
  if (isCriticalValue(value)) return 'text-danger fw-bold';
  return '';
}

function formatValue(value: number): string {
  const unit = props.config.measurementUnit === 'imperial' ? 'ft' : 'm';
  return `${value.toFixed(2)} ${unit}`;
}
</script>

<style scoped>
.clearance-analysis-renderer {
  padding: 1rem 0;
}

.summary-stat {
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.clearance-value {
  font-family: 'Courier New', monospace;
}

.table-danger {
  background-color: #f8d7da;
}

.table-danger:hover {
  background-color: #f1c2c6;
}

.table-warning {
  background-color: #fff3cd;
}

.table-warning:hover {
  background-color: #ffe69c;
}

.clearance-reminder {
  border-left: 4px solid var(--accent);
}
</style>
