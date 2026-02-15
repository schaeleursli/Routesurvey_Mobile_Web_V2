<template>
  <div class="engineering-dashboard">
    <header class="page-header">
      <div class="header-content">
        <h2><i class="bi bi-gear-fill me-2"></i>Engineering Dashboard</h2>
        <p class="subtitle">Transport engineering calculations, validation, and permits integration</p>
      </div>
    </header>

    <div class="content-scroll">
      <div class="dashboard-grid">
        <!-- Transport Engineering Card -->
        <div class="feature-card" @click="navigateTo('TransportEngineering')">
          <div class="card-icon transport">
            <i class="bi bi-truck"></i>
          </div>
          <h3>Transport Engineering</h3>
          <p>Configure trailer, cargo, and pre-survey checks</p>
          <div class="card-footer">
            <BaseButton variant="ghost" size="small">
              Open <i class="bi bi-arrow-right ms-1"></i>
            </BaseButton>
          </div>
        </div>

        <!-- Calculation Validator Card -->
        <div class="feature-card" @click="navigateTo('CalculationValidator')">
          <div class="card-icon calculator">
            <i class="bi bi-calculator"></i>
          </div>
          <h3>Calculation Validator</h3>
          <p>Validate axle loads and CoG calculations</p>
          <div class="card-footer">
            <BaseButton variant="ghost" size="small">
              Open <i class="bi bi-arrow-right ms-1"></i>
            </BaseButton>
          </div>
        </div>

        <!-- Permits Integration Card -->
        <div class="feature-card" @click="navigateTo('PermitsEngineering')">
          <div class="card-icon permits">
            <i class="bi bi-file-earmark-check"></i>
          </div>
          <h3>Permits Integration</h3>
          <p>Link calculations to permit cases and sync data</p>
          <div class="card-footer">
            <BaseButton variant="ghost" size="small">
              Open <i class="bi bi-arrow-right ms-1"></i>
            </BaseButton>
          </div>
        </div>

        <!-- Engineering Status Card -->
        <div class="feature-card info-card">
          <div class="card-icon status">
            <i class="bi bi-clipboard-data"></i>
          </div>
          <h3>System Status</h3>
          <p class="metric">Active Calculations: <strong>{{ stats.activeCalculations }}</strong></p>
          <p class="metric">Linked Permits: <strong>{{ stats.linkedPermits }}</strong></p>
          <p class="metric">Last Sync: <strong>{{ formatTime(stats.lastSync) }}</strong></p>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="section-card">
        <h3><i class="bi bi-activity me-2"></i>Recent Engineering Activity</h3>
        <div v-if="recentActivity.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>No recent engineering activity</p>
        </div>
        <div v-else class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="activity.type">
              <i :class="`bi ${activity.icon}`"></i>
            </div>
            <div class="activity-info">
              <span class="activity-title">{{ activity.title }}</span>
              <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
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

// Engineering stats
const stats = ref({
  activeCalculations: 12,
  linkedPermits: 8,
  lastSync: new Date(Date.now() - 1800000) // 30 minutes ago
});

// Recent activity
const recentActivity = ref([
  {
    id: 1,
    type: 'calculation',
    icon: 'bi-calculator',
    title: 'Axle load calculation completed for Route #245',
    timestamp: new Date(Date.now() - 900000)
  },
  {
    id: 2,
    type: 'sync',
    icon: 'bi-arrow-repeat',
    title: 'Engineering data synced to Permit Case #US-2024-089',
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: 3,
    type: 'validation',
    icon: 'bi-check-circle',
    title: 'CoG validation passed for Configuration #CV-445',
    timestamp: new Date(Date.now() - 3600000)
  }
]);

function navigateTo(routeName) {
  router.push({ name: routeName });
}

function formatTime(timestamp) {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
</script>

<style scoped>
.engineering-dashboard {
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

.card-icon.transport {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.calculator {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.card-icon.permits {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.card-icon.status {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
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

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
}

.activity-icon.calculation {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.activity-icon.sync {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.activity-icon.validation {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-title {
  color: var(--color-text);
  font-size: 0.9rem;
}

.activity-time {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}
</style>
