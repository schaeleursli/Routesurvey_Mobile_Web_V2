<template>
  <div class="equipment-library">
    <div class="library-header">
      <h2>Equipment Library</h2>
      <div class="filters">
        <input
          v-model="catalogStore.searchQuery"
          placeholder="Search..."
          class="search-input"
          @input="catalogStore.fetchItems()"
        />
        <select v-model="catalogStore.categoryFilter" @change="catalogStore.fetchItems()">
          <option value="">All Categories</option>
          <option v-for="cat in catalogStore.categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
        <label>
          <input
            type="checkbox"
            v-model="catalogStore.publishedOnlyFilter"
            @change="catalogStore.fetchItems()"
          />
          Published only
        </label>
      </div>
    </div>

    <div v-if="catalogStore.loading" class="loading">Loading...</div>

    <div v-else class="catalog-grid">
      <div
        v-for="item in catalogStore.filteredItems"
        :key="item.id"
        class="catalog-card"
        @click="selectItem(item)"
      >
        <div class="card-header">
          <h3>{{ item.name }}</h3>
          <span class="category-badge">{{ item.category }}</span>
        </div>
        <div class="card-body">
          <p v-if="item.manufacturer">{{ item.manufacturer }} {{ item.model }}</p>
          <p class="description">{{ item.description || 'No description' }}</p>
        </div>
        <div class="card-footer">
          <span v-if="item.published" class="status-badge published">Published</span>
          <span v-else class="status-badge draft">Draft</span>
        </div>
      </div>
    </div>

    <!-- Import Dialog -->
    <RsDrawer v-model="showDrawer" title="Import Equipment" width="500px">
      <div v-if="catalogStore.selectedItem" class="import-form">
        <h4>{{ catalogStore.selectedItem.name }}</h4>
        <p>{{ catalogStore.selectedItem.description }}</p>

        <div class="form-group">
          <label>Custom Name (optional)</label>
          <input v-model="customName" class="form-input" />
        </div>

        <div class="actions">
          <RsButton variant="secondary" @click="showDrawer = false">
            Cancel
          </RsButton>
          <RsButton
            variant="primary"
            :loading="equipmentStore.loading"
            @click="handleImport"
          >
            Import to Project
          </RsButton>
        </div>
      </div>
    </RsDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useEquipmentStore } from '@/stores/equipment'
import RsButton from '@/components/ui/RsButton.vue'
import RsDrawer from '@/components/ui/RsDrawer.vue'
import type { CatalogItem } from '@/types/catalog'

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const equipmentStore = useEquipmentStore()

const showDrawer = ref(false)
const customName = ref('')

const projectId = route.params.projectId as string

onMounted(() => {
  catalogStore.fetchItems()
})

function selectItem(item: CatalogItem) {
  catalogStore.selectItem(item.id)
  showDrawer.value = true
  customName.value = ''
}

async function handleImport() {
  if (!catalogStore.selectedItem) return

  try {
    await equipmentStore.importFromCatalog(projectId, {
      catalog_item_id: catalogStore.selectedItem.id,
      name: customName.value || undefined,
    })
    showDrawer.value = false
    router.push(`/projects/${projectId}/engineering/equipment`)
  } catch (error) {
    // Error handled by store
  }
}
</script>

<style scoped>
.equipment-library {
  padding: var(--spacing-lg);
}

.library-header {
  margin-bottom: var(--spacing-lg);
}

.library-header h2 {
  margin-bottom: var(--spacing-md);
}

.filters {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.search-input,
select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
}

.search-input {
  min-width: 300px;
}

.loading {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.catalog-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-surface);
}

.catalog-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--spacing-sm);
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
}

.category-badge {
  padding: 2px 8px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.card-body {
  margin-bottom: var(--spacing-sm);
}

.description {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.published {
  background: var(--color-success);
  color: white;
}

.draft {
  background: var(--color-warning);
  color: white;
}

.import-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}
</style>
