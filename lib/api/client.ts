import supabase from '@/lib/supabase'
import type { ApiResponse } from './types'

/**
 * Configuration options for API client
 */
interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean
}

/**
 * Type-safe API client for making requests to Next.js API routes
 * Automatically handles authentication token injection and error handling
 *
 * @param endpoint - API endpoint path (e.g., '/customers', '/invoices')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with typed API response
 *
 * @example
 * // GET request
 * const response = await apiClient<Customer[]>('/customers')
 * if (response.data) {
 *   console.log(response.data)
 * }
 *
 * @example
 * // POST request
 * const response = await apiClient<Customer>('/customers', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John Doe', phone: '1234567890' })
 * })
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const { skipAuth = false, ...fetchOptions } = options

    // Get authentication token from Supabase session
    let token: string | undefined

    if (!skipAuth) {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Failed to get session:', sessionError)
        return {
          error: 'Authentication error. Please log in again.',
        }
      }

      token = session?.access_token
    }

    // Prepare headers
    const headers: Record<string, string> = {
      ...(fetchOptions.headers as Record<string, string> || {}),
    }

    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Add Content-Type for JSON requests (unless it's FormData)
    if (
      fetchOptions.body &&
      typeof fetchOptions.body === 'string' &&
      !headers['Content-Type']
    ) {
      headers['Content-Type'] = 'application/json'
    }

    // Make the request
    const response = await fetch(`/api${endpoint}`, {
      ...fetchOptions,
      headers,
    })

    // Parse response
    const data = await response.json()

    // Handle non-200 responses
    if (!response.ok) {
      return {
        error: data.error || `Request failed with status ${response.status}`,
        ...data,
      }
    }

    return data
  } catch (error: any) {
    console.error('API Client Error:', error)
    return {
      error: error.message || 'Network error. Please check your connection.',
    }
  }
}

/**
 * Convenience wrapper for GET requests
 */
export async function apiGet<T = any>(
  endpoint: string,
  options?: ApiClientOptions
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { ...options, method: 'GET' })
}

/**
 * Convenience wrapper for POST requests
 */
export async function apiPost<T = any>(
  endpoint: string,
  body: any,
  options?: ApiClientOptions
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

/**
 * Convenience wrapper for PUT requests
 */
export async function apiPut<T = any>(
  endpoint: string,
  body: any,
  options?: ApiClientOptions
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

/**
 * Convenience wrapper for PATCH requests
 */
export async function apiPatch<T = any>(
  endpoint: string,
  body: any,
  options?: ApiClientOptions
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

/**
 * Convenience wrapper for DELETE requests
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options?: ApiClientOptions
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { ...options, method: 'DELETE' })
}

/**
 * Upload file(s) using FormData
 *
 * @example
 * const formData = new FormData()
 * formData.append('name', 'John Doe')
 * formData.append('image', fileInput.files[0])
 *
 * const response = await apiUpload<Customer>('/customers', formData)
 */
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  options?: ApiClientOptions
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: options?.method || 'POST',
    body: formData,
    // Don't set Content-Type for FormData - browser will set it with boundary
  })
}
