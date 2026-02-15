/**
 * Equipment Store - Project equipment management
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/client'
import type { ProjectEquipment, ProjectEquipmentImport, ProjectEquipmentCustom } from '@/types/equipment'
import { useAppStore } from './app'

export const useEquipmentStore = defineStore('equipment', () => {
    const appStore = useAppStore()

    // State
    const items = ref<ProjectEquipment[]>([])
    const selectedItem = ref<ProjectEquipment | null>(null)
    const loading = ref(false)
    const dirtyItems = ref<Set<string>>(new Set())

    // Computed
    const itemsByCategory = computed(() => {
        const groups: Record<string, ProjectEquipment[]> = {}
        items.value.forEach(item => {
            if (!groups[item.category]) {
                groups[item.category] = []
            }
            groups[item.category]!.push(item)
        })
        return groups
    })

    const hasOverrides = computed(() => (itemId: string) => {
        const item = items.value.find(i => i.id === itemId)
        return item && Object.keys(item.overrides).length > 0
    })

    // Actions
    async function fetchEquipment(projectId: string) {
        loading.value = true
        try {
            items.value = await api.getProjectEquipment(projectId)
            dirtyItems.value.clear()
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to load equipment')
        } finally {
            loading.value = false
        }
    }

    async function importFromCatalog(projectId: string, data: ProjectEquipmentImport) {
        loading.value = true
        try {
            const newItem = await api.importEquipment(projectId, data)
            items.value.push(newItem)
            appStore.showToast(`Imported: ${newItem.name}`, 'success')
            return newItem
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to import equipment')
            throw error
        } finally {
            loading.value = false
        }
    }

    async function createCustom(projectId: string, data: ProjectEquipmentCustom) {
        loading.value = true
        try {
            const newItem = await api.createCustomEquipment(projectId, data)
            items.value.push(newItem)
            appStore.showToast(`Created: ${newItem.name}`, 'success')
            return newItem
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to create equipment')
            throw error
        } finally {
            loading.value = false
        }
    }

    async function updateOverrides(
        projectId: string,
        equipmentId: string,
        overrides: Record<string, unknown>
    ) {
        loading.value = true
        try {
            const updated = await api.updateEquipmentOverrides(projectId, equipmentId, { overrides })
            const index = items.value.findIndex(i => i.id === equipmentId)
            if (index !== -1) {
                items.value[index] = updated
            }
            dirtyItems.value.delete(equipmentId)
            appStore.showToast('Overrides saved', 'success')
            return updated
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to update overrides')
            throw error
        } finally {
            loading.value = false
        }
    }

    async function materialize(projectId: string, equipmentId: string) {
        loading.value = true
        try {
            const updated = await api.materializeEquipment(projectId, equipmentId)
            const index = items.value.findIndex(i => i.id === equipmentId)
            if (index !== -1) {
                items.value[index] = updated
            }
            appStore.showToast('Effective spec rematerialized', 'success')
            return updated
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to materialize')
            throw error
        } finally {
            loading.value = false
        }
    }

    function markDirty(itemId: string) {
        dirtyItems.value.add(itemId)
    }

    function markClean(itemId: string) {
        dirtyItems.value.delete(itemId)
    }

    function selectItem(item: ProjectEquipment | null) {
        selectedItem.value = item
    }

    return {
        // State
        items,
        selectedItem,
        loading,
        dirtyItems,
        // Computed
        itemsByCategory,
        hasOverrides,
        // Actions
        fetchEquipment,
        importFromCatalog,
        createCustom,
        updateOverrides,
        materialize,
        markDirty,
        markClean,
        selectItem,
    }
})
