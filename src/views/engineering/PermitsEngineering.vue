<template>
  <div class="permits-engineering">
    <header class="page-header">
      <div class="header-content">
        <h2><i class="bi bi-file-earmark-check me-2"></i>Permits Engineering Integration</h2>
        <p class="subtitle">Link calculations to permit cases and manage engineering data sync</p>
      </div>
      <BaseButton variant="secondary" @click="goBack">
        <i class="bi bi-arrow-left me-2"></i>Back
      </BaseButton>
    </header>

    <div class="content-scroll">
      <!-- Linked Permits -->
      <div class="section-card">
        <div class="section-header">
          <h3><i class="bi bi-link-45deg me-2"></i>Linked Permit Cases</h3>
          <BaseButton variant="primary" size="small">
            <i class="bi bi-plus-circle me-2"></i>Link New Case
          </BaseButton>
        </div>

        <div v-if="linkedPermits.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>No permit cases linked to engineering calculations</p>
        </div>

        <div v-else class="permits-list">
          <div v-for="permit in linkedPermits" :key="permit.id" class="permit-item">
            <div class="permit-info">
              <div class="permit-header">
                <span class="permit-id">{{ permit.caseId }}</span>
                <span class="badge" :class="permit.syncStatus">{{ permit.syncStatus }}</span>
              </div>
              <p class="permit-route">{{ permit.routeName }}</p>
              <div class="permit-meta">
                <span><i class="bi bi-calendar3"></i> {{ formatDate(permit.linkedDate) }}</span>
                <span><i class="bi bi-arrow-repeat"></i> Last sync: {{ formatTime(permit.lastSync) }}</span>
              </div>
            </div>
            <div class="permit-actions">
              <BaseButton variant="ghost" size="small" @click="viewDiff(permit.id)">
                <i class="bi bi-eye"></i> View Diff
              </BaseButton>
              <BaseButton variant="ghost" size="small" @click="syncData(permit.id)">
                <i class="bi bi-arrow-repeat"></i> Sync
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Calculation Jobs -->
      <div class="section-card">
        <div class="section-header">
          <h3><i class="bi bi-cpu me-2"></i>Calculation Jobs</h3>
          <BaseButton variant="secondary" size="small">
            <i class="bi bi-play-circle me-2"></i>Run New Calculation
          </BaseButton>
        </div>

        <div class="jobs-grid">
          <div v-for="job in calculationJobs" :key="job.id" class="job-card">
            <div class="job-header">
              <span class="job-name">{{ job.name }}</span>
              <span class="badge" :class="job.status">{{ job.status }}</span>
            </div>
            <div class="job-details">
              <div class="detail-item">
                <span class="label">Type:</span>
                <span class="value">{{ job.type }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Created:</span>
                <span class="value">{{ formatDate(job.createdAt) }}</span>
              </div>
              <div v-if="job.linkedTo" class="detail-item">
                <span class="label">Linked to:</span>
                <span class="value">{{ job.linkedTo }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Auto-Refresh Settings -->
      <div class="section-card">
        <h3><i class="bi bi-gear me-2"></i>Auto-Refresh Settings</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-name">Enable Auto-Refresh</span>
              <p class="setting-description">Automatically detect and sync updates from linked calculation jobs</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="autoRefreshEnabled">
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-name">Refresh Interval</span>
              <p class="setting-description">How often to check for updates (minutes)</p>
            </div>
            <select v-model="refreshInterval" class="setting-select">
              <option :value="5">5 minutes</option>
              <option :value="10">10 minutes</option>
              <option :value="15">15 minutes</option>
              <option :value="30">30 minutes</option>
            </select>
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
const autoRefreshEnabled = ref(true);
const refreshInterval = ref(10);

// Mock linked permits data
const linkedPermits = ref([
  {
    id: 1,
    caseId: 'US-2024-089',
    routeName: 'Interstate 40 Heavy Haul',
    linkedDate: new Date(Date.now() - 86400000 * 7),
    lastSync: new Date(Date.now() - 3600000),
    syncStatus: 'synced'
  },
  {
    id: 2,
    caseId: 'US-2024-104',
    routeName: 'Route 66 Mining Equipment',
    linkedDate: new Date(Date.now() - 86400000 * 3),
    lastSync: new Date(Date.now() - 7200000),
    syncStatus: 'out-of-sync'
  }
]);

// Mock calculation jobs
const calculationJobs = ref([
  {
    id: 1,
    name: 'Axle Load Analysis #445',
    type: 'Axle Load Summary',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 2),
    linkedTo: 'US-2024-089'
  },
  {
    id: 2,
    name: 'CoG Validation #446',
    type: 'Center of Gravity',
    status: 'running',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 3,
    name: 'Bridge Analysis #447',
    type: 'Bridge Clearance',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000),
    linkedTo: 'US-2024-104'
  }
]);

function goBack() {
  router.push({ name: 'EngineeringDashboard' });
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

function viewDiff(permitId) {
  console.log('Viewing diff for permit:', permitId);
}

function syncData(permitId) {
  console.log('Syncing data for permit:', permitId);
}
</script>

<style scoped>
.permits-engineering {
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
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.section-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  border: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-card h3 {
  margin: 0;
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

.permits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.permit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.permit-info {
  flex: 1;
}

.permit-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.permit-id {
  font-weight: 600;
  color: var(--color-text);
  font-size: 1rem;
}

.permit-route {
  margin: 0 0 0.75rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.permit-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.permit-meta i {
  margin-right: 0.25rem;
}

.permit-actions {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.synced {
  background: var(--color-success-light);
  color: var(--color-success);
}

.badge.out-of-sync {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.badge.completed {
  background: var(--color-success-light);
  color: var(--color-success);
}

.badge.running {
  background: var(--color-info-light);
  color: var(--color-info);
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.job-card {
  padding: 1.25rem;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.job-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.95rem;
}

.job-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.detail-item.label {
  color: var(--color-text-secondary);
}

.detail-item .value {
  color: var(--color-text);
  font-weight: 500;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 8px;
}

.setting-info {
  flex: 1;
}

.setting-name {
  display: block;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.setting-description {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.setting-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider::before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-success);
}

input:checked + .slider::before {
  transform: translateX(24px);
}
</style>
