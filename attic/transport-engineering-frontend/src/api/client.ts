/**
 * Type-safe API Client for Transport Engineering Backend
 */

import type { ApiError } from '@/types/api'
import type { CatalogItem, CatalogItemCreate } from '@/types/catalog'
import type { ProjectEquipment, ProjectEquipmentImport, ProjectEquipmentCustom, ProjectEquipmentOverridePatch } from '@/types/equipment'
import type { TransportConfig, TransportConfigCreate } from '@/types/transportConfig'
import type { CalcJob, CalculationRequest } from '@/types/calc'

const BASE_URL = '/api/v1'

class ApiClient {
    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${BASE_URL}${endpoint}`

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            })

            if (!response.ok) {
                const error: ApiError = await response.json()
                throw new Error(error.detail || error.error || 'API request failed')
            }

            return await response.json()
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Network error')
        }
    }

    // Health
    async health() {
        return this.request<{ status: string }>('/health')
    }

    // Catalog
    async getCatalogItems(params?: {
        category?: string
        published_only?: boolean
    }) {
        const query = new URLSearchParams()
        if (params?.category) query.set('category', params.category)
        if (params?.published_only) query.set('published_only', 'true')

        const queryString = query.toString()
        return this.request<CatalogItem[]>(
            `/catalog/items${queryString ? `?${queryString}` : ''}`
        )
    }

    async createCatalogItem(data: CatalogItemCreate) {
        return this.request<CatalogItem>('/catalog/items', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async getCatalogItem(id: string) {
        return this.request<CatalogItem>(`/catalog/items/${id}`)
    }

    async publishCatalogItem(id: string) {
        return this.request<{ message: string }>(`/catalog/items/${id}/publish`, {
            method: 'POST',
        })
    }

    // Project Equipment
    async getProjectEquipment(projectId: string) {
        return this.request<ProjectEquipment[]>(`/projects/${projectId}/equipment`)
    }

    async importEquipment(projectId: string, data: ProjectEquipmentImport) {
        return this.request<ProjectEquipment>(`/projects/${projectId}/equipment/import`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async createCustomEquipment(projectId: string, data: ProjectEquipmentCustom) {
        return this.request<ProjectEquipment>(`/projects/${projectId}/equipment/custom`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async getEquipment(projectId: string, equipmentId: string) {
        return this.request<ProjectEquipment>(`/projects/${projectId}/equipment/${equipmentId}`)
    }

    async updateEquipmentOverrides(
        projectId: string,
        equipmentId: string,
        data: ProjectEquipmentOverridePatch
    ) {
        return this.request<ProjectEquipment>(`/projects/${projectId}/equipment/${equipmentId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    }

    async materializeEquipment(projectId: string, equipmentId: string) {
        return this.request<ProjectEquipment>(`/projects/${projectId}/equipment/${equipmentId}/materialize`, {
            method: 'POST',
        })
    }

    // Transport Configs
    async getTransportConfigs(projectId: string) {
        return this.request<TransportConfig[]>(`/projects/${projectId}/transport-configs`)
    }

    async createTransportConfig(projectId: string, data: TransportConfigCreate) {
        return this.request<TransportConfig>(`/projects/${projectId}/transport-configs`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async getTransportConfig(projectId: string, configId: string) {
        return this.request<TransportConfig>(`/projects/${projectId}/transport-configs/${configId}`)
    }

    // Calculations
    async runCalculation(data: CalculationRequest) {
        return this.request<CalcJob>('/calculations/run', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async getCalculationJobs(projectId: string) {
        return this.request<CalcJob[]>(`/projects/${projectId}/calculations/jobs`)
    }

    async getCalculationJob(jobId: string) {
        return this.request<CalcJob>(`/calculations/${jobId}`)
    }
}

export const api = new ApiClient()
