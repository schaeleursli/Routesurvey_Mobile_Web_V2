<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Create New Permit Case</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="createPermit" class="modal-body">
        <!-- Route Selection -->
        <div class="form-group">
          <label for="route">Route *</label>
          <select
            id="route"
            v-model="form.route_id"
            required
            class="form-control"
          >
            <option value="">Select a route...</option>
            <option
              v-for="route in availableRoutes"
              :key="route.id"
              :value="route.id"
            >
              {{ route.name || route.id }}
            </option>
          </select>
          <p class="help-text">Select the route for this permit application</p>
        </div>

        <!-- Title -->
        <div class="form-group">
          <label for="title">Permit Title</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="form-control"
            placeholder="Leave blank for auto-generated title"
          />
          <p class="help-text">
            Optional - will be auto-generated based on route if left blank
          </p>
        </div>

        <!-- Transport Configuration (Optional) -->
        <div class="form-group">
          <label for="config">Transport Configuration</label>
          <select
            id="config"
            v-model="form.transport_config_id"
            class="form-control"
          >
            <option value="">None (add later)</option>
            <option
              v-for="config in transportConfigs"
              :key="config.id"
              :value="config.id"
            >
              {{ config.name || config.id }}
            </option>
          </select>
          <p class="help-text">
            Optional - can be linked to engineering calculations later
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          <i class="icon-alert"></i>
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button
            type="button"
            @click="$emit('close')"
            class="btn btn-secondary"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || !form.route_id"
          >
            <span v-if="loading" class="spinner-sm"></span>
            {{ loading ? 'Creating...' : 'Create Permit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PermitsController from '@/controllers/permits/permits_controller';

const emit = defineEmits(['close', 'created']);

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

// State
const form = ref({
  route_id: '',
  title: '',
  transport_config_id: '',
});

const availableRoutes = ref([]);
const transportConfigs = ref([]);
const loading = ref(false);
const error = ref(null);

// Methods
async function loadRoutes() {
  // TODO: Replace with actual routes API call
  // For now, mock data
  availableRoutes.value = [
    { id: 'route-001', name: 'CA-TX Interstate Route' },
    { id: 'route-002', name: 'NY-FL Coastal Route' },
    { id: 'route-003', name: 'WA-AZ West Coast Route' },
  ];
}

async function loadTransportConfigs() {
  // TODO: Replace with actual transport configs API call
  // For now, mock data
  transportConfigs.value = [
    { id: 'config-001', name: 'Heavy Haul - 200 ton' },
    { id: 'config-002', name: 'Oversize - Wind Turbine Blade' },
    { id: 'config-003', name: 'SPMT Transport - 8 Lines' },
  ];
}

async function createPermit() {
  loading.value = true;
  error.value = null;

  try {
    const permitData = {
      route_id: form.value.route_id,
    };

    // Add optional fields if provided
    if (form.value.title) {
      permitData.title = form.value.title;
    }

    // Create the permit
    const permit = await PermitsController.createUSPermitCase(
      props.projectId,
      permitData
    );

    // Link transport config if selected
    if (form.value.transport_config_id) {
      // TODO: Link transport config to permit
      console.log('Would link config:', form.value.transport_config_id);
    }

    emit('created', permit);
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to create permit';
    console.error('Error creating permit:', err);
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  loadRoutes();
  loadTransportConfigs();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 60%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-5);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--spacing-6);
  overflow-y: auto;
}

.form-group {
  margin-bottom: var(--spacing-5);
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: var(--spacing-2);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.form-control {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.help-text {
  margin-top: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.error-message {
  padding: var(--spacing-3);
  background: var(--color-error-100);
  color: var(--color-error-700);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  margin-top: var(--spacing-6);
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

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgb(255 255 255 / 30%);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
