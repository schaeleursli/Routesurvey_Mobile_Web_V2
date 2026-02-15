/**
 * Catalog Item Types
 */

export interface CatalogItem {
    id: string
    name: string
    category: string
    manufacturer?: string
    model?: string
    description?: string
    spec: Record<string, unknown> // EffectiveSpec
    published: boolean
    published_at?: string
    version: number
    tags?: Record<string, unknown>
    created_at: string
    updated_at: string
}

export interface CatalogItemCreate {
    name: string
    category: string
    manufacturer?: string
    model?: string
    description?: string
    spec: Record<string, unknown>
    tags?: Record<string, unknown>
}
