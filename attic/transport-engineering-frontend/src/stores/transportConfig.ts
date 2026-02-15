/**
 * Transport Config Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { TransportConfig, TransportConfigCreate } from '@/types/transportConfig'
import { useAppStore } from './app'

export const useTransportConfigStore = defineStore('transportConfig', () => {
    const appStore = useAppStore()

    // State
    const configs = ref<TransportConfig[]>([])
    const activeConfig = ref<TransportConfig | null>(null)
    const loading = ref(false)

    // Actions
    async function fetchConfigs(projectId: string) {
        loading.value = true
        try {
            configs.value = await api.getTransportConfigs(projectId)
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to load configs')
        } finally {
            loading.value = false
        }
    }

    async function loadConfig(projectId: string, configId: string) {
        loading.value = true
        try {
            activeConfig.value = await api.getTransportConfig(projectId, configId)
            return activeConfig.value
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to load config')
            throw error
        } finally {
            loading.value = false
        }
    }

    async function createConfig(projectId: string, data: TransportConfigCreate) {
        loading.value = true
        try {
            const newConfig = await api.createTransportConfig(projectId, data)
            configs.value.push(newConfig)
            appStore.showToast(`Created: ${newConfig.name}`, 'success')
            return newConfig
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to create config')
            throw error
        } finally {
            loading.value = false
        }
    }

    function resolveEffectiveSpec(config: TransportConfig): Record<string, unknown> {
        // Return assembly_spec which should contain the effective spec
        // In future, this could resolve equipment IDs to their effective_specs
        return config.assembly_spec
    }

    return {
        // State
        configs,
        activeConfig,
        loading,
        // Actions
        fetchConfigs,
        loadConfig,
        createConfig,
        resolveEffectiveSpec,
    }
})
