import { useState, useEffect, useCallback } from 'react'
import { apiClient, apiPost, apiPut, apiDelete } from '@/lib/api/client'
import type { Tables } from '@/lib/database.types'

type Supplier = Tables<'suppliers'>

interface UseSuppliersOptions {
  search?: string
  autoFetch?: boolean
}

interface UseSuppliersReturn {
  suppliers: Supplier[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createSupplier: (data: Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Supplier | null>
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<Supplier | null>
  deleteSupplier: (id: string) => Promise<boolean>
}

/**
 * Hook for managing suppliers
 * @param options - Configuration options (search, autoFetch)
 * @returns Suppliers data and CRUD operations
 *
 * @example
 * const { suppliers, loading, createSupplier, refetch } = useSuppliers()
 *
 * // Create a supplier
 * const newSupplier = await createSupplier({
 *   name: 'ABC Jewelers',
 *   phone: '1234567890',
 *   email: 'contact@abc.com'
 * })
 */
export function useSuppliers(options: UseSuppliersOptions = {}): UseSuppliersReturn {
  const { search = '', autoFetch = true } = options

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const endpoint = search ? `/purchases/suppliers?search=${encodeURIComponent(search)}` : '/purchases/suppliers'
      const response = await apiClient<Supplier[]>(endpoint)

      if (response.error) {
        setError(response.error)
        setSuppliers([])
      } else {
        setSuppliers(response.data || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suppliers')
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }, [search])

  const createSupplier = async (
    data: Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Supplier | null> => {
    try {
      const response = await apiPost<Supplier>('/purchases/suppliers', data)

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Add new supplier to the list
        setSuppliers((prev) => [...prev, response.data!])
        return response.data
      }

      return null
    } catch (err: any) {
      setError(err.message || 'Failed to create supplier')
      return null
    }
  }

  const updateSupplier = async (
    id: string,
    data: Partial<Supplier>
  ): Promise<Supplier | null> => {
    try {
      const response = await apiPut<Supplier>(`/purchases/suppliers/${id}`, data)

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Update supplier in the list
        setSuppliers((prev) =>
          prev.map((supplier) => (supplier.id === id ? response.data! : supplier))
        )
        return response.data
      }

      return null
    } catch (err: any) {
      setError(err.message || 'Failed to update supplier')
      return null
    }
  }

  const deleteSupplier = async (id: string): Promise<boolean> => {
    try {
      const response = await apiDelete(`/purchases/suppliers/${id}`)

      if (response.error) {
        setError(response.error)
        return false
      }

      // Remove supplier from the list
      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id))
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to delete supplier')
      return false
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchSuppliers()
    }
  }, [fetchSuppliers, autoFetch])

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
}

/**
 * Hook for fetching a single supplier by ID
 * @param id - Supplier ID
 * @returns Single supplier data
 *
 * @example
 * const { supplier, loading, error } = useSupplier(supplierId)
 */
export function useSupplier(id: string | null) {
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setSupplier(null)
      return
    }

    const fetchSupplier = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient<Supplier>(`/purchases/suppliers/${id}`)

        if (response.error) {
          setError(response.error)
          setSupplier(null)
        } else {
          setSupplier(response.data || null)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch supplier')
        setSupplier(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSupplier()
  }, [id])

  return { supplier, loading, error }
}
