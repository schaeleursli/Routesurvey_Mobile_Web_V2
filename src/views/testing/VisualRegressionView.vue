<template>
  <div class="visual-regression-view">
    <header class="page-header">
      <div class="header-content">
        <h2><i class="bi bi-images me-2"></i>Visual Regression</h2>
        <p class="subtitle">Compare UI snapshots and manage visual changes</p>
      </div>
      <BaseButton variant="secondary" @click="goBack">
        <i class="bi bi-arrow-left me-2"></i>Back
      </BaseButton>
    </header>

    <div class="content-scroll">
      <div class="info-banner">
        <i class="bi bi-info-circle"></i>
        <p>Visual regression testing captures screenshots and compares them against baseline images to detect unintended UI changes.</p>
      </div>

      <div class="snapshots-grid">
        <div v-if="snapshots.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>No snapshots available yet.</p>
        </div>
        <div v-else v-for="snapshot in snapshots" :key="snapshot.id" class="snapshot-card">
          <div class="snapshot-header">
            <h3>{{ snapshot.name }}</h3>
            <span class="badge" :class="snapshot.status">{{ snapshot.status }}</span>
          </div>
          
          <div class="snapshot-preview">
            <div class="preview-image">
              <i class="bi bi-image"></i>
              <span>{{ snapshot.viewport }}</span>
            </div>
          </div>

          <div class="snapshot-info">
            <div class="info-item">
              <span class="label">Page:</span>
              <span class="value">{{ snapshot.page }}</span>
            </div>
            <div class="info-item">
              <span class="label">Last Run:</span>
              <span class="value">{{ formatDate(snapshot.lastRun) }}</span>
            </div>
            <div v-if="snapshot.diff" class="info-item">
              <span class="label">Difference:</span>
              <span class="value error">{{ snapshot.diff }}%</span>
            </div>
          </div>

          <div class="snapshot-actions">
            <BaseButton variant="ghost" size="small">
              <i class="bi bi-eye me-1"></i>View
            </BaseButton>
            <BaseButton v-if="snapshot.status === 'changed'" variant="ghost" size="small">
              <i class="bi bi-check2 me-1"></i>Approve
            </BaseButton>
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

const snapshots = ref([]);

function goBack() {
  router.push({ name: 'TestingDashboard' });
}

function formatDate(date) {
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('en-US', options);
}
</script>

<style scoped>
.visual-regression-view {
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

.info-banner {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 1rem 1.5rem;
  background: var(--color-info-light);
  border-left: 4px solid var(--color-info);
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.info-banner i {
  font-size: 1.25rem;
  color: var(--color-info);
  margin-top: 0.125rem;
}

.info-banner p {
  margin: 0;
  color: var(--color-text);
  line-height: 1.6;
}

.snapshots-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  grid-column: 1 / -1;
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

.snapshot-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.snapshot-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.snapshot-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text);
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.passed {
  background: var(--color-success-light);
  color: var(--color-success);
}

.badge.changed {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.badge.failed {
  background: var(--color-error-light);
  color: var(--color-error);
}

.snapshot-preview {
  background: var(--color-background);
  border-radius: 8px;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
}

.preview-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
}

.preview-image i {
  font-size: 2.5rem;
  opacity: 0.3;
}

.preview-image span {
  font-size: 0.85rem;
}

.snapshot-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.info-item .label {
  color: var(--color-text-secondary);
}

.info-item .value {
  color: var(--color-text);
  font-weight: 500;
}

.info-item .value.error {
  color: var(--color-error);
}

.snapshot-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}
</style>
