<template>
  <div class="permit-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading permit details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="icon-alert"></i>
      <p>{{ error }}</p>
      <button @click="loadPermit" class="btn btn-secondary">Retry</button>
    </div>

    <!-- Permit Details -->
    <div v-else-if="permit" class="permit-content">
      <!-- Header -->
      <div class="permit-header">
        <div class="header-left">
          <button @click="$router.back()" class="back-btn">
            ← Back to Permits
          </button>
          <h1>{{ permit.title }}</h1>
          <span :class="['status-badge', `status-${permit.status}`]">
            {{ permit.status }}
          </span>
        </div>
        <div class="header-actions">
          <button @click="syncEngineering" class="btn btn-secondary" :disabled="syncing">
            <span v-if="syncing" class="spinner-sm"></span>
            {{ syncing ? 'Syncing...' : 'Sync Engineering' }}
          </button>
          <button @click="deletePermit" class="btn btn-danger">
            Delete
          </button>
        </div>
      </div>

      <!-- Readiness Card -->
      <div class="card readiness-card">
        <h2>Readiness Status</h2>
        <div class="readiness-score">
          <div class="score-circle">
            <svg viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="var(--color-gray-200)"
                stroke-width="12"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="var(--color-primary)"
                stroke-width="12"
                :stroke-dasharray="`${permit.readiness_score * 3.39} 339`"
                stroke-dashoffset="85"
                stroke-linecap="round"
              />
            </svg>
            <div class="score-text">
              <span class="score-number">{{ permit.readiness_score }}%</span>
              <span class="score-label">Ready</span>
            </div>
          </div>
          
          <div class="readiness-details">
            <div class="detail-item" v-for="(issue, idx) in permit.blocking_issues" :key="idx">
              <i class="icon-alert-circle text-error"></i>
              <span>{{ issue }}</span>
            </div>
            <div v-if="permit.blocking_issues.length === 0" class="detail-item">
              <i class="icon-check-circle text-success"></i>
              <span>All requirements met</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Engineering Status -->
      <div class="card">
        <div class="card-header">
          <h2>Engineering Integration</h2>
          <button
            v-if="!engineeringStatus?.linked"
            @click="showLinkEngineeringModal = true"
            class="btn btn-sm btn-primary"
          >
            Link Engineering
          </button>
        </div>
        
        <div v-if="engineeringStatus?.linked" class="engineering-status">
          <div class="status-row">
            <span class="label">Calculation Job:</span>
            <span class="value">{{ engineeringStatus.calc_job_id }}</span>
          </div>
          <div class="status-row">
            <span class="label">Linked At:</span>
            <span class="value">{{ formatDate(engineeringStatus.linked_at) }}</span>
          </div>
          <div class="status-row">
            <span class="label">Last Sync:</span>
            <span class="value">
              {{ engineeringStatus.last_sync ? formatDate(engineeringStatus.last_sync) : 'Never' }}
            </span>
          </div>
        </div>
        <div v-else class="empty-message">
          <i class="icon-link"></i>
          <p>No engineering calculation linked</p>
        </div>
      </div>

      <!-- Route Information -->
      <div class="card">
        <h2>Route Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Route ID:</span>
            <span class="value">{{ permit.route_id }}</span>
          </div>
          <div class="info-item" v-if="permit.states_in_route?.length">
            <span class="label">States:</span>
            <span class="value">{{ permit.states_in_route.join(', ') }}</span>
          </div>
          <div class="info-item">
            <span class="label">Created:</span>
            <span class="value">{{ formatDate(permit.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Last Updated:</span>
            <span class="value">{{ formatDate(permit.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Payload Data -->
      <div class="card">
        <h2>Permit Payload</h2>
        <pre class="payload-viewer">{{ JSON.stringify(permit.payload_json, null, 2) }}</pre>
      </div>
    </div>

    <!-- Link Engineering Modal -->
    <LinkEngineeringModal
      v-if="showLinkEngineeringModal"
      :permit-id="permitId"
      @close="showLinkEngineeringModal = false"
      @linked="handleEngineeringLinked"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import PermitsController from '@/controllers/permits/permits_controller';
import LinkEngineeringModal from '@/components/permits/LinkEngineeringModal.vue';

const router = useRouter();
const route = useRoute();

// Props
const permitId = route.params.id;

// State
const permit = ref(null);
const engineeringStatus = ref(null);
const loading = ref(false);
const syncing = ref(false);
const error = ref(null);
const showLinkEngineeringModal = ref(false);

// Methods
async function loadPermit() {
  loading.value = true;
  error.value = null;

  try {
    permit.value = await PermitsController.getPermitCase(permitId);
    await loadEngineeringStatus();
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load permit';
    console.error('Error loading permit:', err);
  } finally {
    loading.value = false;
  }
}

async function loadEngineeringStatus() {
  try {
    engineeringStatus.value = await PermitsController.getEngineeringStatus(permitId);
  } catch (err) {
    console.error('Error loading engineering status:', err);
  }
}

async function syncEngineering() {
  syncing.value = true;

  try {
    const result = await PermitsController.syncEngineering(permitId);
    console.log('Sync result:', result);
    
    // Reload permit to show updated data
    await loadPermit();
    
    // Show success message
    alert(`Engineering data synced! Updated ${result.updated_fields?.length || 0} fields.`);
  } catch (err) {
    alert(err.response?.data?.detail || 'Failed to sync engineering data');
    console.error('Error syncing engineering:', err);
  } finally {
    syncing.value = false;
  }
}

async function deletePermit() {
  if (!confirm('Are you sure you want to delete this permit? This action cannot be undone.')) {
    return;
  }

  try {
    await PermitsController.deletePermitCase(permitId);
    router.push({ name: 'permits' });
  } catch (err) {
    alert(err.response?.data?.detail || 'Failed to delete permit');
    console.error('Error deleting permit:', err);
  }
}

function handleEngineeringLinked() {
  showLinkEngineeringModal.value = false;
  loadPermit();
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

// Lifecycle
onMounted(() => {
  loadPermit();
});
</script>

<style scoped>
.permit-detail {
  padding: var(--spacing-6);
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  text-align: center;
  padding: var(--spacing-12);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-4);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.permit-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.permit-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.back-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

.back-btn:hover {
  text-decoration: underline;
}

.permit-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.status-badge {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.status-draft {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.status-ready {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.status-blocked {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.header-actions {
  display: flex;
  gap: var(--spacing-3);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
}

.card h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-text-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.card-header h2 {
  margin: 0;
}

.readiness-score {
  display: flex;
  gap: var(--spacing-6);
  align-items: center;
}

.score-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.score-circle svg {
  transform: rotate(-90deg);
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  display: block;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
}

.score-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.readiness-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.text-error {
  color: var(--color-error);
}

.text-success {
  color: var(--color-success);
}

.engineering-status,
.info-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.status-row,
.info-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-3);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.value {
  color: var(--color-text-primary);
}

.empty-message {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-text-tertiary);
}

.empty-message i {
  font-size: 48px;
  margin-bottom: var(--spacing-3);
}

.payload-viewer {
  background: var(--color-gray-900);
  color: var(--color-gray-100);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-family: Monaco, 'Courier New', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.btn {
  padding: var(--spacing-3) var(--spacing-5);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-xs);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-gray-200);
}

.btn-danger {
  background: var(--color-error);
  color: white;
}

.btn-danger:hover {
  background: var(--color-error-dark);
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgb(255 255 255 / 30%);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>
