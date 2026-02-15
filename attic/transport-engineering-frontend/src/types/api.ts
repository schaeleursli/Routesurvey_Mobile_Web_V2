/**
 * API Response Types
 */

export interface ApiEnvelope<T> {
    data?: T
    error?: string
    detail?: string
    message?: string
}

export interface ApiError {
    error: string
    detail?: string
    validation_errors?: ValidationError[]
}

export interface ValidationError {
    loc: string
    msg: string
    type: string
}

export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    page_size: number
    has_next: boolean
    has_prev: boolean
}
