import { NextResponse } from 'next/server'
import type { ApiResponse, ApiError } from './types'

/**
 * Creates a standardized success response
 * @param data - The response data
 * @param meta - Optional metadata (pagination, counts, etc.)
 * @param status - HTTP status code (default: 200)
 */
export function apiResponse<T>(
  data: T,
  meta?: ApiResponse['meta'],
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      ...(meta && { meta }),
    },
    { status }
  )
}

/**
 * Creates a standardized error response
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param code - Optional error code
 * @param details - Optional additional details
 */
export function apiError(
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      ...(code && { code }),
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Wraps an async handler with standardized error handling
 * @param handler - The async function to wrap
 * @returns Wrapped handler with error handling
 */
export async function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<ApiError | T>> {
  try {
    return await handler()
  } catch (error: any) {
    console.error('API Error:', error)

    // Handle authentication errors
    if (error.message?.includes('Unauthorized')) {
      return apiError(error.message, 401)
    }

    // Handle validation errors
    if (error.message?.includes('Invalid') || error.message?.includes('required')) {
      return apiError(error.message, 400)
    }

    // Handle Supabase errors
    if (error.code) {
      return apiError(error.message || 'Database error', 500, error.code)
    }

    // Generic error
    return apiError(
      error.message || 'An unexpected error occurred',
      500
    )
  }
}

/**
 * Extracts query parameters from URL search params
 * @param searchParams - URLSearchParams object
 * @returns Object with typed query parameters
 */
export function getQueryParams(searchParams: URLSearchParams) {
  return {
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '50', 10),
    search: searchParams.get('search') || '',
    cursor: searchParams.get('cursor') || undefined,
  }
}

/**
 * Validates pagination parameters
 * @param page - Page number
 * @param limit - Items per page
 * @returns Validated and constrained values
 */
export function validatePagination(page: number, limit: number) {
  const validPage = Math.max(1, page)
  const validLimit = Math.min(Math.max(1, limit), 100) // Max 100 items per page

  return {
    page: validPage,
    limit: validLimit,
    offset: (validPage - 1) * validLimit,
  }
}

/**
 * Handles FormData parsing with file extraction
 * @param request - Request object
 * @returns Object with parsed fields and files
 */
export async function parseFormData(request: Request) {
  const formData = await request.formData()
  const fields: Record<string, any> = {}
  const files: Record<string, File> = {}

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files[key] = value
    } else {
      // Try to parse JSON values
      try {
        fields[key] = JSON.parse(value)
      } catch {
        fields[key] = value
      }
    }
  }

  return { fields, files }
}

/**
 * Checks if request content type is JSON
 */
export function isJsonRequest(request: Request): boolean {
  const contentType = request.headers.get('content-type')
  return contentType?.includes('application/json') ?? false
}

/**
 * Checks if request content type is FormData
 */
export function isFormDataRequest(request: Request): boolean {
  const contentType = request.headers.get('content-type')
  return contentType?.includes('multipart/form-data') ?? false
}
