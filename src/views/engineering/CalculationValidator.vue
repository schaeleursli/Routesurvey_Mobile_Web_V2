<template>
  <div class="calculation-validator">
    <header class="page-header">
      <div class="header-content">
        <h2><i class="bi bi-calculator me-2"></i>Calculation Validator</h2>
        <p class="subtitle">Validate axle loads and Center of Gravity calculations</p>
      </div>
      <BaseButton variant="secondary" @click="goBack">
        <i class="bi bi-arrow-left me-2"></i>Back
      </BaseButton>
    </header>

    <div class="content-scroll">
      <div class="validator-container">
        <!-- Input Panel -->
        <div class="input-panel">
          <h3><i class="bi bi-input-cursor me-2"></i>Input Parameters</h3>
          
          <div class="form-group">
            <label>Configuration Name</label>
            <input v-model="inputs.configName" type="text" placeholder="e.g., Heavy Haul Config #1">
          </div>

          <div class="form-group">
            <label>Total Weight (kg)</label>
            <input v-model.number="inputs.totalWeight" type="number" placeholder="e.g., 45000">
          </div>

          <div class="form-group">
            <label>Number of Axles</label>
            <input v-model.number="inputs.numAxles" type="number" placeholder="e.g., 6">
          </div>

          <div class="form-group">
            <label>CoG Position (m from front)</label>
            <input v-model.number="inputs.cogPosition" type="number" step="0.1" placeholder="e.g., 5.2">
          </div>

          <div class="form-group">
            <label>Wheelbase (m)</label>
            <input v-model.number="inputs.wheelbase" type="number" step="0.1" placeholder="e.g., 12.5">
          </div>

          <div class="form-actions">
            <BaseButton variant="primary" @click="runCalculation" :disabled="isCalculating">
              <i class="bi bi-play-circle me-2"></i>{{ isCalculating ? 'Calculating...' : 'Run Calculation' }}
            </BaseButton>
            <BaseButton variant="ghost" @click="clearInputs">
              <i class="bi bi-x-circle me-2"></i>Clear
            </BaseButton>
          </div>
        </div>

        <!-- Results Panel -->
        <div class="results-panel">
          <h3><i class="bi bi-graph-up me-2"></i>Results</h3>
          
          <div v-if="!calculationResult" class="empty-state">
            <i class="bi bi-calculator"></i>
            <p>Run a calculation to see results</p>
          </div>

          <div v-else class="results-content">
            <div class="result-status" :class="calculationResult.status">
              <i :class="calculationResult.status === 'valid' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"></i>
              <span>{{ calculationResult.status === 'valid' ? 'Validation Passed' : 'Validation Failed' }}</span>
            </div>

            <div class="result-metrics">
              <div class="metric-card">
                <span class="metric-label">Axle Load Distribution</span>
                <div class="axle-loads">
                  <div v-for="(load, index) in calculationResult.axleLoads" :key="index" class="axle-load">
                    <span class="axle-num">Axle {{ index + 1 }}</span>
                    <span class="axle-value">{{ load }} kg</span>
                  </div>
                </div>
              </div>

              <div class="metric-card">
                <span class="metric-label">Center of Gravity</span>
                <div class="cog-data">
                  <div class="data-row">
                    <span>Longitudinal:</span>
                    <strong>{{ calculationResult.cog.longitudinal }} m</strong>
                  </div>
                  <div class="data-row">
                    <span>Height:</span>
                    <strong>{{ calculationResult.cog.height }} m</strong>
                  </div>
                </div>
              </div>

              <div class="metric-card">
                <span class="metric-label">Compliance</span>
                <div class="compliance-data">
                  <div class="compliance-item" :class="calculationResult.compliance.maxAxleLoad ? 'pass' : 'fail'">
                    <i :class="calculationResult.compliance.maxAxleLoad ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                    <span>Max Axle Load</span>
                  </div>
                  <div class="compliance-item" :class="calculationResult.compliance.balance ? 'pass' : 'fail'">
                    <i :class="calculationResult.compliance.balance ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                    <span>Balance</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="result-actions">
              <BaseButton variant="secondary" size="small">
                <i class="bi bi-download me-2"></i>Export
              </BaseButton>
              <BaseButton variant="secondary" size="small">
                <i class="bi bi-clipboard me-2"></i>Copy
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';

const router = useRouter();
const isCalculating = ref(false);
const calculationResult = ref(null);

const inputs = ref({
  configName: '',
  totalWeight: null,
  numAxles: null,
  cogPosition: null,
  wheelbase: null
});

function goBack() {
  router.push({ name: 'EngineeringDashboard' });
}

function runCalculation() {
  isCalculating.value = true;
  
  // Simulate calculation
  setTimeout(() => {
    // Mock calculation results
    const axleLoads = [];
    const avgLoad = inputs.value.totalWeight / inputs.value.numAxles;
    
    for (let i = 0; i < inputs.value.numAxles; i++) {
      // Add some variation based on CoG position
      const variation = (Math.random() - 0.5) * 2000;
      axleLoads.push(Math.round(avgLoad + variation));
    }
    
    const maxLoad = Math.max(...axleLoads);
    const isBalanced = Math.abs(axleLoads[0] - axleLoads[axleLoads.length - 1]) < 3000;
    
    calculationResult.value = {
      status: maxLoad < 12000 && isBalanced ? 'valid' : 'invalid',
      axleLoads,
      cog: {
        longitudinal: inputs.value.cogPosition,
        height: 1.8
      },
      compliance: {
        maxAxleLoad: maxLoad < 12000,
        balance: isBalanced
      }
    };
    
    isCalculating.value = false;
  }, 1500);
}

function clearInputs() {
  inputs.value = {
    configName: '',
    totalWeight: null,
    numAxles: null,
    cogPosition: null,
    wheelbase: null
  };
  calculationResult.value = null;
}
</script>

<style scoped>
.calculation-validator {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-background);
}

.page-header {
  padding: 1.5rem 2rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--color-text);
}

.subtitle {
  margin: 0.5rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.validator-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
}

.input-panel,
.results-panel {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  border: 1px solid var(--color-border);
}

.input-panel h3,
.results-panel h3 {
  margin: 0 0 1.5rem;
  font-size: 1.1rem;
  color: var(--color-text);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.95rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--color-text-secondary);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.2;
}

.results-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.result-status {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
}

.result-status.valid {
  background: var(--color-success-light);
  color: var(--color-success);
}

.result-status.invalid {
  background: var(--color-error-light);
  color: var(--color-error);
}

.result-status i {
  font-size: 1.5rem;
}

.result-metrics {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.metric-card {
  padding: 1.25rem;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.metric-label {
  display: block;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.axle-loads,
.cog-data,
.compliance-data {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.axle-load,
.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--color-surface);
  border-radius: 6px;
}

.axle-num,
.data-row span {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.axle-value,
.data-row strong {
  color: var(--color-text);
  font-weight: 600;
}

.compliance-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-surface);
  border-radius: 6px;
  font-size: 0.9rem;
}

.compliance-item.pass {
  color: var(--color-success);
}

.compliance-item.fail {
  color: var(--color-error);
}

.result-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

@media (width <= 1024px) {
  .validator-container {
    grid-template-columns: 1fr;
  }
}
</style>
