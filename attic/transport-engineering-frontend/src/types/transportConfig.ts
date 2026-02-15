/**
 * Transport Configuration Types
 */

export interface TransportConfig {
    id: string
    project_id: string
    name: string
    description?: string
    assembly_type: string
    assembly_spec: Record<string, unknown>
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface TransportConfigCreate {
    name: string
    description?: string
    assembly_type: string
    assembly_spec: Record<string, unknown>
}
