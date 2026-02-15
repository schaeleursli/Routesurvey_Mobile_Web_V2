<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="close">
        <div class="catalog-browser-modal" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">Equipment Catalog</h2>
            <button class="btn-close" @click="close" aria-label="Close">
              ×
            </button>
          </div>
          
          <!-- Toolbar -->
          <div class="modal-toolbar">
            <div class="search-box">
              <input 
                v-model="searchTerm"
                type="text"
                placeholder="Search equipment..."
                class="search-input"
                @input="handleSearch"
              />
              <span class="search-icon">🔍</span>
            </div>
            
            <div class="filters">
              <select v-model="selectedRegion" class="filter-select">
                <option value="all">All Regions</option>
                <option value="US">🇺🇸 US</option>
                <option value="EU">🇪🇺 EU</option>
                <option value="Global">🌍 Global</option>
              </select>
              
              <button 
                v-if="multiSelect && selectedItems.length > 0"
                class="btn-clear-selection"
                @click="clearSelection"
              >
                Clear ({{ selectedItems.length }})
              </button>
            </div>
          </div>
          
          <!-- Category Tabs -->
          <div class="category-tabs">
            <button 
              v-for="cat in categories" 
              :key="cat.value"
              class="tab-button"
              :class="{ 'is-active': activeCategory === cat.value }"
              @click="activeCategory = cat.value"
            >
              <span class="tab-icon">{{ cat.icon }}</span>
              <span class="tab-label">{{ cat.label }}</span>
              <span v-if="getCategoryCount(cat.value) > 0" class="tab-count">
                {{ getCategoryCount(cat.value) }}
              </span>
            </button>
          </div>
          
          <!-- Content Area -->
          <div class="modal-content">
            <!--Loading State -->
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading catalog...</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="error" class="error-state">
              <p class="error-message">{{ error }}</p>
              <button class="btn-retry" @click="loadCatalog">Retry</button>
            </div>
            
            <!-- Empty State -->
            <div v-else-if="filteredItems.length === 0" class="empty-state">
              <p>No items found</p>
              <button v-if="searchTerm || selectedRegion !== 'all'" class="btn-clear-filters" @click="clearFilters">
                Clear Filters
              </button>
            </div>
            
            <!-- Item Grid -->
            <div v-else class="items-grid">
              <CatalogItemCard
                v-for="item in filteredItems"
                :key="item.id"
                :item="item"
                :selected="isSelected(item.id)"
                @select="handleSelect"
              />
            </div>
          </div>
          
          <!-- Footer -->
          <div class="modal-footer">
            <div class="footer-info">
              <span v-if="multiSelect && selectedItems.length > 0">
                {{ selectedItems.length }} item(s) selected
              </span>
              <span v-else-if="!multiSelect && selectedItems.length > 0">
                1 item selected
              </span>
            </div>
            
            <div class="footer-actions">
              <button class="btn btn-secondary" @click="close">
                Cancel
              </button>
              <button 
                class="btn btn-primary"
                :disabled="selectedItems.length === 0"
                @click="confirmSelection"
              >
                {{ multiSelect ? `Add ${selectedItems.length} Item(s)` : 'Add to Configuration' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useCatalog } from '@/composables/useCatalog';
import CatalogItemCard from './CatalogItemCard.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    default: 'all',
    validator: (value) => ['all', 'tractor', 'module', 'spmt', 'preset'].includes(value)
  },
  multiSelect: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'select']);

const { 
  tractors, modules, spmts, presets, allItems,
  loading, error,
  loadAll, filterByRegion
} = useCatalog();

const searchTerm = ref('');
const selectedRegion = ref('all');
const activeCategory = ref(props.mode === 'all' ? 'tractor' : props.mode);
const selectedItems = ref([]);

const categories = [
  { value: 'tractor', label: 'Tractors', icon: '🚛' },
  { value: 'module', label: 'Modules', icon: '▬' },
  { value: 'spmt', label: 'SPMTs', icon: '⚙️' },
  { value: 'preset', label: 'Presets', icon: '📋' }
];

const currentCategoryItems = computed(() => {
  switch (activeCategory.value) {
    case 'tractor':
      return tractors.value;
    case 'module':
      return modules.value;
    case 'spmt':
      return spmts.value;
    case 'preset':
      return presets.value;
    default:
      return allItems.value;
  }
});

const filteredItems = computed(() => {
  let items = currentCategoryItems.value;
  
  // Apply region filter
  if (selectedRegion.value !== 'all') {
    items = filterByRegion(items, selectedRegion.value);
  }
  
  // Apply search filter
  if (searchTerm.value && searchTerm.value.trim().length >= 2) {
    const term = searchTerm.value.toLowerCase();
    items = items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.manufacturer?.toLowerCase().includes(term) ||
      item.model?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  }
  
  return items;
});

const getCategoryCount = (category) => {
  switch (category) {
    case 'tractor':
      return tractors.value.length;
    case 'module':
      return modules.value.length;
    case 'spmt':
      return spmts.value.length;
    case 'preset':
      return presets.value.length;
    default:
      return 0;
  }
};

const isSelected = (itemId) => {
  return selectedItems.value.some(item => item.id === itemId);
};

const handleSelect = (item) => {
  if (props.multiSelect) {
    const index = selectedItems.value.findIndex(i => i.id === item.id);
    if (index > -1) {
      selectedItems.value.splice(index, 1);
    } else {
      selectedItems.value.push(item);
    }
  } else {
    selectedItems.value = [item];
  }
};

const clearSelection = () => {
  selectedItems.value = [];
};

const clearFilters = () => {
  searchTerm.value = '';
  selectedRegion.value = 'all';
};

const handleSearch = () => {
  // Debounced search handled by computed property
};

const confirmSelection = () => {
  if (selectedItems.value.length > 0) {
    emit('select', props.multiSelect ? selectedItems.value : selectedItems.value[0]);
    close();
  }
};

const close = () => {
  emit('update:modelValue', false);
  // Reset state on close
  setTimeout(() => {
    selectedItems.value = [];
    searchTerm.value = '';
    selectedRegion.value = 'all';
  }, 300);
};

const loadCatalog = async () => {
  try {
    await loadAll();
  } catch (err) {
    console.error('Failed to load catalog:', err);
  }
};

// Load catalog when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && allItems.value.length === 0) {
    loadCatalog();
  }
});

// Set initial category based on mode prop
watch(() => props.mode, (newMode) => {
  if (newMode && newMode !== 'all') {
    activeCategory.value = newMode;
  }
}, { immediate: true });

onMounted(() => {
  if (props.modelValue) {
    loadCatalog();
  }
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
  z-index: 9999;
  padding: 20px;
}

.catalog-browser-modal {
  background: var(--surface-primary, #fff);
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgb(0 0 0 / 30%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #111827);
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  color: var(--text-tertiary, #9ca3af);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: var(--surface-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
}

.modal-toolbar {
  display: flex;
  gap: 16px;
  padding: 16px 28px;
  background: var(--surface-secondary, #f9fafb);
  border-bottom: 1px solid var(--border-color-light, #f3f4f6);
}

.search-box {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 18px;
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 10px 16px;
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 150px;
}

.btn-clear-selection {
  padding: 10px 16px;
  background: var(--warning-bg, #fef3c7);
  color: var(--warning-color, #92400e);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.category-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 28px;
  border-bottom: 2px solid var(--border-color-light, #f3f4f6);
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: none;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button:hover {
  background: var(--surface-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
}

.tab-button.is-active {
  background: var(--primary-bg-subtle, #eff6ff);
  border-color: var(--primary-color, #3b82f6);
  color: var(--primary-color, #3b82f6);
}

.tab-icon {
  font-size: 18px;
}

.tab-count {
  padding: 2px 8px;
  background: var(--badge-bg, #e5e7eb);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.tab-button.is-active .tab-count {
  background: var(--primary-color, #3b82f6);
  color: white;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  min-height: 400px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-secondary, #6b7280);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color-light, #f3f4f6);
  border-top-color: var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: var(--error-color, #dc2626);
  margin-bottom: 16px;
}

.btn-retry,
.btn-clear-filters {
  padding: 10px 20px;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--surface-secondary, #f9fafb);
}

.footer-info {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: var(--surface-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
}

.btn-secondary:hover {
  background: var(--surface-quaternary, #e5e7eb);
}

.btn-primary {
  background: var(--primary-color, #3b82f6);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-color-hover, #2563eb);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .catalog-browser-modal,
.modal-leave-active .catalog-browser-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .catalog-browser-modal,
.modal-leave-to .catalog-browser-modal {
  transform: scale(0.9);
}

/* Responsive */
@media (width <= 768px) {
  .catalog-browser-modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-toolbar {
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
  }
}
</style>
