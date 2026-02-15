<template>
  <div class="transport-config-editor">
    <div class="editor-layout">
      <!-- Left: Schematic -->
      <div class="schematic-panel">
        <div class="panel-header">
          <h3>Transport Schematic</h3>
        </div>
        <div class="schematic-container">
          <RsEngineeringSchematic
            v-if="activeConfig"
            :spec="activeConfig.assembly_spec"
            @select-module="handleModuleSelect"
          />
          <div v-else class="placeholder">
            Load a configuration to view schematic
          </div>
        </div>
      </div>

      <!-- Right: Tabs -->
      <div class="editor-panel">
        <RsTabs :tabs="tabNames" v-model="activeTab">
          <!-- Tab 0: Quick Adjust -->
          <div v-show="activeTab === 0" class="tab-content">
            <h4>Quick Adjustments</h4>
            <p class="info">Quick access to common configuration parameters</p>

            <div v-if="activeConfig" class="quick-controls">
              <div class="control-group">
                <label>Cargo Mass (lbs)</label>
                <input
                  type="number"
                  v-model.number="cargoMass"
                  class="form-input"
                />
              </div>

              <div class="control-group">
                <label>CoG Height (inches)</label>
                <input
                  type="number"
                  v-model.number="cogHeight"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Tab 1: Advanced Editor -->
          <div v-show="activeTab === 1" class="tab-content">
            <h4>Advanced Configuration</h4>
            <p class="info">Full assembly specification (JSON)</p>

            <textarea
              v-if="activeConfig"
              v-model="assemblyJson"
              class="json-editor"
              rows="20"
            ></textarea>

            <div class="actions">
              <RsButton variant="primary" @click="saveConfig">
                Save Changes
              </RsButton>
            </div>
          </div>

          <!-- Tab 2: Mass & CoG -->
          <div v-show="activeTab === 2" class="tab-content">
            <h4>Mass & Center of Gravity</h4>

            <div v-if="activeConfig" class="mass-summary">
              <div class="summary-item">
                <span class="label">Total Mass:</span>
                <span class="value">{{ totalMass.toFixed(0) }} lbs</span>
              </div>
              <div class="summary-item">
                <span class="label">Combined CoG:</span>
                <span class="value">
                  X: {{ combinedCoG.x.toFixed(1) }},
                  Z: {{ combinedCoG.z.toFixed(1) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tab 3: Calculations -->
          <div v-show="activeTab === 3" class="tab-content">
            <h4>Engineering Calculations</h4>

            <div class="calc-actions">
              <RsButton
                variant="primary"
                :loading="calcStore.loading"
                @click="runAxleLoadCalculation"
              >
                Run Axle Load Summary
              </RsButton>
            </div>

            <!-- Results -->
            <div v-if="calcStore.latestAxleLoad" class="calc-results">
              <h5>Results</h5>

              <div class="result-summary">
                <div class="summary-item">
                  <span class="label">Total Mass:</span>
                  <span class="value">
                    {{ calcStore.latestAxleLoad.total_mass.toFixed(0) }} lbs
                  </span>
                </div>
                <div class="summary-item">
                  <span class="label">GVW:</span>
                  <span class="value">
                    {{ calcStore.latestAxleLoad.gross_vehicle_weight.toFixed(0) }} lbs
                  </span>
                </div>
              </div>

              <h6>Axle Loads</h6>
              <table class="results-table">
                <thead>
                  <tr>
                    <th>Axle</th>
                    <th>Load (lbs)</th>
                    <th>Capacity (lbs)</th>
                    <th>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="axle in calcStore.latestAxleLoad.axle_loads"
                    :key="axle.name"
                    :class="{ overload: (axle.utilization || 0) > 1.0 }"
                  >
                    <td>{{ axle.name }}</td>
                    <td>{{ axle.load.toFixed(0) }}</td>
                    <td>{{ axle.capacity?.toFixed(0) || 'N/A' }}</td>
                    <td>{{ ((axle.utilization || 0) * 100).toFixed(1) }}%</td>
                  </tr>
                </tbody>
              </table>

              <!-- Warnings -->
              <div
                v-if="calcStore.latestAxleLoad.warnings.length > 0"
                class="warnings"
              >
                <h6>Warnings</h6>
                <div
                  v-for="(warning, idx) in calcStore.latestAxleLoad.warnings"
                  :key="idx"
                  :class="['warning-item', warning.severity]"
                >
                  <strong>{{ warning.type }}:</strong> {{ warning.message }}
                </div>
              </div>
            </div>

            <!-- Job History -->
            <div v-if="calcStore.jobs.length > 0" class="job-history">
              <h6>Recent Jobs</h6>
              <div
                v-for="job in calcStore.jobs.slice(0, 5)"
                :key="job.id"
                class="job-item"
              >
                <span>{{ job.calc_type }}</span>
                <span :class="['job-status', job.status]">{{ job.status }}</span>
                <span class="job-time">{{ formatTime(job.created_at) }}</span>
              </div>
            </div>
          </div>
        </RsTabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTransportConfigStore } from '@/stores/transportConfig'
import { useCalcStore } from '@/stores/calc'
import { useVisualStore } from '@/stores/visual'
import RsTabs from '@/components/ui/RsTabs.vue'
import RsButton from '@/components/ui/RsButton.vue'
import RsEngineeringSchematic from '@/components/engineering/RsEngineeringSchematic.vue'

const route = useRoute()
const configStore = useTransportConfigStore()
const calcStore = useCalcStore()
const visualStore = useVisualStore()

const projectId = route.params.projectId as string
const configId = route.params.configId as string

const activeTab = ref(0)
const tabNames = ['Quick Adjust', 'Advanced', 'Mass & CoG', 'Calculations']

const cargoMass = ref(80000)
const cogHeight = ref(60)
const assemblyJson = ref('')

const activeConfig = computed(() => configStore.activeConfig)

const totalMass = computed(() => {
  // Simplified calculation
  return cargoMass.value + 43000 // Tractor + trailer weight
})

const combinedCoG = computed(() => {
  return {
    x: 280,
    y: 0,
    z: cogHeight.value
  }
})

onMounted(async () => {
  await configStore.loadConfig(projectId, configId)
  if (activeConfig.value) {
    assemblyJson.value = JSON.stringify(activeConfig.value.assembly_spec, null, 2)
  }
})

function handleModuleSelect(moduleId: string) {
  visualStore.selectModule(moduleId)
}

function saveConfig() {
  try {
    const spec = JSON.parse(assemblyJson.value)
    // Would update config here
    console.log('Saving config:', spec)
  } catch (error) {
    alert('Invalid JSON')
  }
}

async function runAxleLoadCalculation() {
  if (!activeConfig.value) return

  await calcStore.runCalculation({
    calc_type: 'axle_load_summary',
    transport_config_id: activeConfig.value.id,
  })
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<style scoped>
.transport-config-editor {
  height: 100%;
}

.editor-layout {
  display: grid;
  grid-template-columns: 1fr 600px;
  height: calc(100vh - 60px);
}

.schematic-panel,
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.schematic-panel {
  border-right: 1px solid var(--color-border);
}

.panel-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.schematic-container {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
  background: var(--color-background);
}

.placeholder {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.tab-content {
  padding: var(--spacing-lg);
}

.tab-content h4 {
  margin: 0 0 var(--spacing-sm) 0;
}

.info {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: var(--spacing-lg);
}

.quick-controls,
.mass-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.control-group label {
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
}

.json-editor {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.actions {
  margin-top: var(--spacing-md);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.label {
  font-weight: 500;
}

.value {
  font-family: monospace;
}

.calc-actions {
  margin-bottom: var(--spacing-lg);
}

.calc-results {
  margin-top: var(--spacing-lg);
}

.calc-results h5,
.calc-results h6 {
  margin: var(--spacing-lg) 0 var(--spacing-md) 0;
}

.result-summary {
  background: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th,
.results-table td {
  padding: var(--spacing-sm);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.results-table th {
  font-weight: 600;
  background: var(--color-surface);
}

.results-table tr.overload {
  background: rgb(255 0 0 / 10%);
}

.warnings {
  margin-top: var(--spacing-lg);
}

.warning-item {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border-left: 4px solid var(--color-warning);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
}

.warning-item.critical {
  border-left-color: var(--color-error);
}

.job-history {
  margin-top: var(--spacing-xl);
}

.job-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.job-status {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.job-status.completed {
  background: var(--color-success);
  color: white;
}

.job-status.pending {
  background: var(--color-warning);
  color: white;
}

.job-time {
  margin-left: auto;
  color: var(--color-text-secondary);
  font-size: 12px;
}
</style>
