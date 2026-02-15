<template>
  <div class="e2e-test-manager">
    <header class="page-header">
      <div class="header-content">
        <h2><i class="bi bi-robot me-2"></i>E2E Test Manager</h2>
        <p class="subtitle">Run and manage Playwright end-to-end tests</p>
      </div>
      <div class="header-actions">
        <BaseButton variant="secondary" @click="goBack">
          <i class="bi bi-arrow-left me-2"></i>Back
        </BaseButton>
        <BaseButton variant="primary" @click="runAllTests" :disabled="isRunning">
          <i class="bi bi-play-fill me-2"></i>{{ isRunning ? 'Running...' : 'Run All Tests' }}
        </BaseButton>
      </div>
    </header>

    <div class="content-scroll">
      <div class="test-suites">
        <div v-if="testSuites.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>No test suites available yet.</p>
        </div>
        <div v-else v-for="suite in testSuites" :key="suite.id" class="test-suite-card">
          <div class="suite-header">
            <div class="suite-info">
              <h3>{{ suite.name }}</h3>
              <p>{{ suite.description }}</p>
            </div>
            <div class="suite-actions">
              <BaseButton variant="ghost" size="small" @click="runSuite(suite.id)" :disabled="isRunning">
                <i class="bi bi-play-circle"></i>
              </BaseButton>
            </div>
          </div>
          
          <div class="suite-stats">
            <div class="stat">
              <span class="stat-label">Tests:</span>
              <span class="stat-value">{{ suite.tests.length }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Passed:</span>
              <span class="stat-value success">{{ suite.passed }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Failed:</span>
              <span class="stat-value error">{{ suite.failed }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Duration:</span>
              <span class="stat-value">{{ suite.duration }}s</span>
            </div>
          </div>

          <div class="test-list">
            <div v-for="test in suite.tests" :key="test.id" class="test-item">
              <div class="test-status">
                <i v-if="test.status === 'passed'" class="bi bi-check-circle-fill text-success"></i>
                <i v-else-if="test.status === 'failed'" class="bi bi-x-circle-fill text-error"></i>
                <i v-else class="bi bi-circle"></i>
              </div>
              <div class="test-info">
                <span class="test-name">{{ test.name }}</span>
                <span v-if="test.error" class="test-error">{{ test.error }}</span>
              </div>
              <div class="test-duration">{{ test.duration }}ms</div>
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
const isRunning = ref(false);

const testSuites = ref([]);

function goBack() {
  router.push({ name: 'TestingDashboard' });
}

function runAllTests() {
  isRunning.value = true;
  console.warn('Test execution not wired to backend yet.');
  isRunning.value = false;
}

function runSuite(suiteId) {
  isRunning.value = true;
  console.warn(`Test suite execution not wired yet: ${suiteId}`);
  isRunning.value = false;
}
</script>

<style scoped>
.e2e-test-manager {
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.test-suites {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
}

.empty-state i {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.test-suite-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  border: 1px solid var(--color-border);
}

.suite-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.suite-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: var(--color-text);
}

.suite-info p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.suite-stats {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: var(--color-text);
}

.stat-value.success {
  color: var(--color-success);
}

.stat-value.error {
  color: var(--color-error);
}

.test-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.test-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-background);
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.test-status {
  font-size: 1.2rem;
}

.test-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.test-name {
  color: var(--color-text);
  font-size: 0.9rem;
}

.test-error {
  color: var(--color-error);
  font-size: 0.85rem;
}

.test-duration {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.text-success {
  color: var(--color-success);
}

.text-error {
  color: var(--color-error);
}
</style>
