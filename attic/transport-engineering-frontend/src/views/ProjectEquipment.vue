<template>
  <div class="project-equipment">
    <div class="equipment-header">
      <h2>Project Equipment</h2>
      <RsButton variant="primary" @click="showCreateDialog = true">
        Create Custom
      </RsButton>
    </div>

    <div v-if="equipmentStore.loading" class="loading">Loading...</div>

    <div v-else class="equipment-list">
      <div
        v-for="item in equipmentStore.items"
        :key="item.id"
        class="equipment-item"
      >
        <div class="item-header">
          <h3>{{ item.name }}</h3>
          <span class="category-badge">{{ item.category }}</span>
        </div>
        <div class="item-body">
          <p v-if="item.catalog_item_id" class="source">From catalog</p>
          <p v-else class="source">Custom equipment</p>
          <p v-if="hasOverrides(item.id)" class="modified">
            ✏️ Has overrides
          </p>
        </div>
        <div class="item-actions">
          <RsButton variant="ghost" size="sm" @click="editEquipment(item)">
            Edit
          </RsButton>
        </div>
      </div>

      <div v-if="equipmentStore.items.length === 0" class="empty">
        <p>No equipment in this project yet.</p>
        <p>Import from the Equipment Library or create custom equipment.</p>
      </div>
    </div>

    <!-- Edit Drawer -->
    <RsDrawer v-model="showEditDrawer" title="Edit Equipment" width="600px">
      <div v-if="selectedEquipment" class="edit-form">
        <h4>{{ selectedEquipment.name }}</h4>

        <div class="form-group">
          <label>Category</label>
          <input :value="selectedEquipment.category" disabled class="form-input" />
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea v-model="notes" class="form-textarea" rows="3"></textarea>
        </div>

        <div class="override-section">
          <h5>Overrides (JSON)</h5>
          <textarea
            v-model="overridesJson"
            class="form-textarea json-editor"
            rows="10"
            placeholder='{"tractor": {"mass_properties": {"mass": 20000}}}'
          ></textarea>
        </div>

        <div class="actions">
          <RsButton variant="secondary" @click="showEditDrawer = false">
            Cancel
          </RsButton>
          <RsButton
            variant="primary"
            :loading="equipmentStore.loading"
            @click="saveOverrides"
          >
            Save Overrides
          </RsButton>
          <RsButton
            variant="secondary"
            :loading="equipmentStore.loading"
            @click="rematerialize"
          >
            Rematerialize
          </RsButton>
        </div>
      </div>
    </RsDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEquipmentStore } from '@/stores/equipment'
import RsButton from '@/components/ui/RsButton.vue'
import RsDrawer from '@/components/ui/RsDrawer.vue'
import type { ProjectEquipment } from '@/types/equipment'

const route = useRoute()
const equipmentStore = useEquipmentStore()

const projectId = route.params.projectId as string
const showCreateDialog = ref(false)
const showEditDrawer = ref(false)
const selectedEquipment = ref<ProjectEquipment | null>(null)
const notes = ref('')
const overridesJson = ref('')

const hasOverrides = computed(() => equipmentStore.hasOverrides)

onMounted(() => {
  equipmentStore.fetchEquipment(projectId)
})

function editEquipment(item: ProjectEquipment) {
  selectedEquipment.value = item
  notes.value = item.notes || ''
  overridesJson.value = JSON.stringify(item.overrides, null, 2)
  showEditDrawer.value = true
}

async function saveOverrides() {
  if (!selectedEquipment.value) return

  try {
    const overrides = JSON.parse(overridesJson.value)
    await equipmentStore.updateOverrides(
      projectId,
      selectedEquipment.value.id,
      overrides
    )
    showEditDrawer.value = false
  } catch (error) {
    alert('Invalid JSON in overrides')
  }
}

async function rematerialize() {
  if (!selectedEquipment.value) return

  await equipmentStore.materialize(projectId, selectedEquipment.value.id)
}
</script>

<style scoped>
.project-equipment {
  padding: var(--spacing-lg);
}

.equipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.loading {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.equipment-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.equipment-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.item-header h3 {
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

.item-body {
  display: flex;
  gap: var(--spacing-md);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.source {
  margin: 0;
}

.modified {
  margin: 0;
  color: var(--color-warning);
}

.item-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.empty {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.edit-form {
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

.form-input,
.form-textarea {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
}

.json-editor {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.override-section h5 {
  margin: var(--spacing-md) 0 var(--spacing-sm) 0;
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-md);
}
</style>
