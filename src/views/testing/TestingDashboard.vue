<template>
  <div class="testing-dashboard">
    <header class="page-header">
      <div class="header-content">
        <h2><i class="bi bi-bug-fill me-2"></i>Testing & QA</h2>
        <p class="subtitle">End-to-End Testing and Visual Regression</p>
      </div>
    </header>

    <div class="content-scroll">
      <div class="dashboard-grid">
        <!-- E2E Testing Card -->
        <div class="feature-card" @click="navigateTo('E2ETestManager')">
          <div class="card-icon e2e">
            <i class="bi bi-robot"></i>
          </div>
          <h3>E2E Testing</h3>
          <p>Run and manage end-to-end tests with Playwright</p>
          <div class="card-footer">
            <BaseButton variant="ghost" size="small">
              Open <i class="bi bi-arrow-right ms-1"></i>
            </BaseButton>
          </div>
        </div>

        <!-- Visual Regression Card -->
        <div class="feature-card" @click="navigateTo('VisualRegressionView')">
          <div class="card-icon visual">
            <i class="bi bi-images"></i>
          </div>
          <h3>Visual Regression</h3>
          <p>Compare UI snapshots and manage visual changes</p>
          <div class="card-footer">
            <BaseButton variant="ghost" size="small">
              Open <i class="bi bi-arrow-right ms-1"></i>
            </BaseButton>
          </div>
        </div>

        <!-- Test Coverage Card -->
        <div class="feature-card info-card">
          <div class="card-icon coverage">
            <i class="bi bi-pie-chart-fill"></i>
          </div>
          <h3>Test Coverage</h3>
          <p v-if="hasCoverageData" class="metric">E2E: <strong>{{ e2eStats.passed }}/{{ e2eStats.total }}</strong> tests passing</p>
          <p v-if="hasCoverageData" class="metric">Components: <strong>{{ componentStats.coverage }}%</strong> coverage</p>
          <p v-else class="metric muted">No coverage data yet.</p>
        </div>
      </div>

      <!-- Recent Test Runs -->
      <div class="section-card">
        <h3><i class="bi bi-clock-history me-2"></i>Recent Test Runs</h3>
        <div v-if="recentRuns.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>No recent test runs yet.</p>
          <span class="empty-note">Run an E2E suite to populate this list.</span>
        </div>
        <div v-else class="test-runs-list">
          <div v-for="run in recentRuns" :key="run.id" class="test-run-item">
            <div class="run-info">
              <span class="run-name">{{ run.name }}</span>
              <span class="run-time">{{ formatTime(run.timestamp) }}</span>
            </div>
            <div class="run-status">
              <span class="badge" :class="run.status">{{ run.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';

const router = useRouter();

const e2eStats = ref({
  passed: 0,
  total: 0
});

const componentStats = ref({
  coverage: 0
});

const recentRuns = ref([]);

const hasCoverageData = computed(() => {
  return e2eStats.value.total > 0 || componentStats.value.coverage > 0;
});

function navigateTo(routeName) {
  router.push({ name: routeName });
}

function formatTime(timestamp) {
  const now = new Date();
  const diff = now - timestamp;
  const hours = Math.floor(diff / 3600000);
  
  if (hours < 1) return 'Less than an hour ago';
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
</script>

<style scoped>
.testing-dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-background);
}

.page-header {
  padding: 1.5rem 2rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.feature-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
}

.feature-card:not(.info-card):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  border-color: var(--color-primary);
}

.info-card {
  cursor: default;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: white;
}

.card-icon.e2e {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.visual {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-icon.api {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-icon.coverage {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.feature-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: var(--color-text);
}

.feature-card p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.metric {
  margin-top: 0.5rem;
}

.metric strong {
  color: var(--color-text);
}

.card-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.section-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  border: 1px solid var(--color-border);
}

.section-card h3 {
  margin: 0 0 1.5rem;
  font-size: 1.1rem;
  color: var(--color-text);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-note {
  display: inline-block;
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.test-runs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.test-run-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.run-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.run-name {
  font-weight: 500;
  color: var(--color-text);
}

.run-time {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
}

.badge.passed {
  background: var(--color-success-light);
  color: var(--color-success);
}

.badge.failed {
  background: var(--color-error-light);
  color: var(--color-error);
}

.badge.running {
  background: var(--color-warning-light);
  color: var(--color-warning);
}
</style>
