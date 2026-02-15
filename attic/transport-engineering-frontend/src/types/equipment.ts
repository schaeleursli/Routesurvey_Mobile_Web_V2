/**
 * Project Equipment Types
 */

export interface ProjectEquipment {
    id: string
    project_id: string
    catalog_item_id?: string
    name: string
    category: string
    base_spec: Record<string, unknown>
    overrides: Record<string, unknown>
    effective_spec: Record<string, unknown>
    notes?: string
    created_at: string
    updated_at: string
}

export interface ProjectEquipmentImport {
    catalog_item_id: string
    name?: string
    overrides?: Record<string, unknown>
}

export interface ProjectEquipmentCustom {
    name: string
    category: string
    spec: Record<string, unknown>
    notes?: string
}

export interface ProjectEquipmentOverridePatch {
    overrides: Record<string, unknown>
}
