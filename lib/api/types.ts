/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  meta?: ApiMeta
}

/**
 * Metadata for API responses (pagination, counts, etc.)
 */
export interface ApiMeta {
  total?: number
  count?: number
  page?: number
  limit?: number
  hasMore?: boolean
  cursor?: string
}

/**
 * API error response
 */
export interface ApiError {
  error: string
  code?: string
  details?: any
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}

/**
 * Standard list response with pagination
 */
export interface ListResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta
}
