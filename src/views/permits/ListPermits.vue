<template>
  <div class="permits-list">
    <!-- Header -->
    <div class="permits-header">
      <div class="header-content">
        <h1>Permit Cases</h1>
        <p class="subtitle">Manage oversize/overweight transport permits</p>
      </div>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <i class="icon-plus"></i>
        New Permit
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search permits..."
        class="search-input"
      />
      <select v-model="statusFilter" class="filter-select">
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="ready">Ready</option>
        <option value="blocked">Blocked</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading permits...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="icon-alert"></i>
      <p>{{ error }}</p>
      <button @click="loadPermits" class="btn btn-secondary">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPermits.length === 0" class="empty-state">
      <i class="icon-file"></i>
      <h3>No permits found</h3>
      <p>Create your first permit case to get started</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Create Permit
      </button>
    </div>

    <!-- Permits Grid -->
    <div v-else class="permits-grid">
      <div
        v-for="permit in filteredPermits"
        :key="permit.id"
        class="permit-card"
        @click="viewPermit(permit.id)"
      >
        <div class="card-header">
          <h3>{{ permit.title }}</h3>
          <span :class="['status-badge', `status-${permit.status}`]">
            {{ permit.status }}
          </span>
        </div>
        
        <div class="card-body">
          <div class="info-row">
            <span class="label">Route:</span>
            <span>{{ permit.route_id }}</span>
          </div>
          
          <div v-if="permit.states_in_route?.length" class="info-row">
            <span class="label">States:</span>
            <span>{{ permit.states_in_route.join(', ') }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Readiness:</span>
            <div class="readiness-bar">
              <div 
                class="readiness-fill" 
                :style="{ width: `${permit.readiness_score}%` }"
              ></div>
              <span class="readiness-text">{{ permit.readiness_score }}%</span>
            </div>
          </div>
        </div>
        
        <div class="card-footer">
          <span class="timestamp">
            Updated {{ formatDate(permit.updated_at) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Create Permit Modal -->
    <CreatePermitModal
      v-if="showCreateModal"
      :project-id="projectId"
      @close="showCreateModal = false"
      @created="handlePermitCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PermitsController from '@/controllers/permits/permits_controller';
import CreatePermitModal from '@/components/permits/CreatePermitModal.vue';

const router = useRouter();

// Props
const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

// State
const permits = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const statusFilter = ref('');
const showCreateModal = ref(false);

// Computed
const filteredPermits = computed(() => {
  let filtered = permits.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.route_id.toLowerCase().includes(query) ||
        p.states_in_route?.some((s) => s.toLowerCase().includes(query))
    );
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter((p) => p.status === statusFilter.value);
  }

  return filtered;
});

// Methods
async function loadPermits() {
  loading.value = true;
  error.value = null;

  try {
    permits.value = await PermitsController.listPermitCases(props.projectId);
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load permits';
    console.error('Error loading permits:', err);
  } finally {
    loading.value = false;
  }
}

function viewPermit(permitId) {
  router.push({ name: 'permit-detail', params: { id: permitId } });
}

function handlePermitCreated(permit) {
  showCreateModal.value = false;
  permits.value.unshift(permit);
  // Navigate to the new permit
  router.push({ name: 'permit-detail', params: { id: permit.id } });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

// Lifecycle
onMounted(() => {
  loadPermits();
});
</script>

<style scoped>
.permits-list {
  padding: var(--spacing-6);
  max-width: 1400px;
  margin: 0 auto;
}

.permits-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.header-content h1 {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  margin-bottom: var(--spacing-2);
  color: var(--color-text-primary);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.filters-bar {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.search-input {
  flex: 1;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.filter-select {
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  min-width: 150px;
}

.loading-container,
.error-container,
.empty-state {
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
  to { transform: rotate(360deg); }
}

.error-container {
  color: var(--color-error);
}

.empty-state i {
  font-size: 64px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-4);
}

.permits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-4);
}

.permit-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.permit-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--spacing-4);
}

.card-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.status-badge {
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

.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.info-row {
  display: flex;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.info-row .label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.readiness-bar {
  flex: 1;
  height: 24px;
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  position: relative;
  overflow: hidden;
}

.readiness-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
  transition: width 0.3s ease;
}

.readiness-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-footer {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-border);
}

.timestamp {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
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

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  background: var(--color-gray-200);
}
</style>
