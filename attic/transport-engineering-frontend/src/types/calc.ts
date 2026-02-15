/**
 * Calculation Types
 */

export interface CalculationRequest {
    calc_type: string
    transport_config_id: string
    parameters?: Record<string, unknown>
}

export interface AxleLoadItem {
    name: string
    load: number
    capacity?: number
    utilization?: number
}

export interface AxleLoadWarning {
    type: string
    severity: string
    message: string
    details?: Record<string, unknown>
}

export interface AxleLoadResult {
    total_mass: number
    gross_vehicle_weight: number
    combined_cog: Record<string, number>
    axle_loads: AxleLoadItem[]
    warnings: AxleLoadWarning[]
    summary: Record<string, unknown>
}

export interface CalcJob {
    id: string
    project_id: string
    transport_config_id: string
    calc_type: string
    status: string
    parameters: Record<string, unknown>
    effective_spec_snapshot: Record<string, unknown>
    results?: Record<string, unknown>
    error_message?: string
    created_at: string
    started_at?: string
    completed_at?: string
}
