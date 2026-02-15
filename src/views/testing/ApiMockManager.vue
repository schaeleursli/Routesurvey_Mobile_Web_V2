<template>
  <div class="api-mock-manager">
    <header class="page-header">
      <div class="header-content">
        <h2><i class="bi bi-hdd-network me-2"></i>API Mock Manager</h2>
        <p class="subtitle">Manage MSW handlers and mock API responses</p>
      </div>
      <BaseButton variant="secondary" @click="goBack">
        <i class="bi bi-arrow-left me-2"></i>Back
      </BaseButton>
    </header>

    <div class="content-scroll">
      <div class="mocks-container">
        <div class="mocks-list">
          <h3><i class="bi bi-server me-2"></i>Available Mocks</h3>
          
          <div v-for="mock in mocks" :key="mock.id" class="mock-item">
            <div class="mock-info">
              <div class="mock-header">
                <span class="method-badge" :class="mock.method.toLowerCase()">{{ mock.method }}</span>
                <span class="mock-path">{{ mock.path }}</span>
              </div>
              <p class="mock-description">{{ mock.description }}</p>
            </div>
            
            <div class="mock-controls">
              <label class="toggle-switch">
                <input type="checkbox" :checked="mock.enabled" @change="toggleMock(mock.id)">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="mock-details">
          <h3><i class="bi bi-code-square me-2"></i>Mock Response</h3>
          <p class="helper-text">Select a mock from the list to view and edit its response</p>
          
          <div class="code-block">
            <pre><code>// Example mock handler
rest.get('/api/routes', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      data: [
        { id: 1, name: 'Route 1', status: 'active' },
        { id: 2, name: 'Route 2', status: 'completed' }
      ]
    })
  );
});</code></pre>
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

// Mock data for API mocks
const mocks = ref([
  {
    id: 1,
    method: 'GET',
    path: '/api/routes',
    description: 'Get all routes',
    enabled: true
  },
  {
    id: 2,
    method: 'GET',
    path: '/api/routes/:id',
    description: 'Get route by ID',
    enabled: true
  },
  {
    id: 3,
    method: 'POST',
    path: '/api/routes',
    description: 'Create new route',
    enabled: true
  },
  {
    id: 4,
    method: 'GET',
    path: '/api/permits',
    description: 'Get all permits',
    enabled: true
  },
  {
    id: 5,
    method: 'PUT',
    path: '/api/permits/:id',
    description: 'Update permit',
    enabled: false
  },
  {
    id: 6,
    method: 'GET',
    path: '/api/users/profile',
    description: 'Get user profile',
    enabled: true
  },
  {
    id: 7,
    method: 'DELETE',
    path: '/api/routes/:id',
    description: 'Delete route',
    enabled: false
  }
]);

function goBack() {
  router.push({ name: 'TestingDashboard' });
}

function toggleMock(mockId) {
  const mock = mocks.value.find(m => m.id === mockId);
  if (mock) {
    mock.enabled = !mock.enabled;
    console.log(`Mock ${mockId} ${mock.enabled ? 'enabled' : 'disabled'}`);
  }
}
</script>

<style scoped>
.api-mock-manager {
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

.mocks-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.mocks-list,
.mock-details {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  border: 1px solid var(--color-border);
}

.mocks-list h3,
.mock-details h3 {
  margin: 0 0 1.5rem;
  font-size: 1.1rem;
  color: var(--color-text);
}

.mock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  transition: border-color 0.2s ease;
}

.mock-item:hover {
  border-color: var(--color-primary);
}

.mock-info {
  flex: 1;
}

.mock-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.method-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: monospace;
  text-transform: uppercase;
}

.method-badge.get {
  background: var(--color-info-light);
  color: var(--color-info);
}

.method-badge.post {
  background: var(--color-success-light);
  color: var(--color-success);
}

.method-badge.put {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.method-badge.delete {
  background: var(--color-error-light);
  color: var(--color-error);
}

.mock-path {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
}

.mock-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
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

.helper-text {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.code-block {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
}

.code-block code {
  font-family: Monaco, Menlo, 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #d4d4d4;
}

@media (width <= 1024px) {
  .mocks-container {
    grid-template-columns: 1fr;
  }
}
</style>
