'use client'

import { useEffect, useState } from 'react'
import { apiClient, apiPost, apiPut, apiDelete } from '@/lib/api/client'
import { Tables } from '@/lib/database.types'

type StockItem = Tables<'stock_items'>

export interface UseStockOptions {
  sold?: boolean
  autoFetch?: boolean
}

export default function useStock(options: UseStockOptions = {}) {
  const { sold, autoFetch = true } = options
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStockItems = async () => {
    setLoading(true)
    setError(null)

    try {
      const endpoint = sold !== undefined ? `/stock?sold=${sold}` : '/stock'
      const response = await apiClient<StockItem[]>(endpoint)

      if (response.error) {
        setError(response.error)
        setStockItems([])
      } else {
        setStockItems(response.data || [])
      }
    } catch (err: any) {
      console.error('Error in useStock:', err)
      setError(err.message || 'Failed to fetch stock items')
      setStockItems([])
    } finally {
      setLoading(false)
    }
  }

  const createStockItem = async (data: Partial<StockItem>) => {
    try {
      const response = await apiPost<StockItem>('/stock', data)

      if (response.error) {
        console.error('Error creating stock item:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        setStockItems((prev) => [response.data!, ...prev])
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in createStockItem:', err)
      setError(err.message || 'Failed to create stock item')
      return null
    }
  }

  const updateStockItem = async (id: string, updates: Partial<StockItem>) => {
    try {
      const response = await apiPut<StockItem>(`/stock/${id}`, updates)

      if (response.error) {
        console.error('Error updating stock item:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        setStockItems((prev) =>
          prev.map((item) => (item.id === id ? response.data! : item))
        )
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in updateStockItem:', err)
      setError(err.message || 'Failed to update stock item')
      return null
    }
  }

  const deleteStockItem = async (id: string) => {
    try {
      const response = await apiDelete(`/stock/${id}`)

      if (response.error) {
        console.error('Error deleting stock item:', response.error)
        setError(response.error)
        return false
      }

      setStockItems((prev) => prev.filter((item) => item.id !== id))
      return true
    } catch (err: any) {
      console.error('Error in deleteStockItem:', err)
      setError(err.message || 'Failed to delete stock item')
      return false
    }
  }

  const markAsSold = async (id: string) => {
    try {
      const response = await apiPost<StockItem>(`/stock/${id}/actions`, {
        action: 'mark_sold',
      })

      if (response.error) {
        console.error('Error marking stock item as sold:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        setStockItems((prev) =>
          prev.map((item) => (item.id === id ? response.data! : item))
        )
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in markAsSold:', err)
      setError(err.message || 'Failed to mark stock item as sold')
      return null
    }
  }

  const markAsUnsold = async (id: string) => {
    try {
      const response = await apiPost<StockItem>(`/stock/${id}/actions`, {
        action: 'mark_unsold',
      })

      if (response.error) {
        console.error('Error marking stock item as unsold:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        setStockItems((prev) =>
          prev.map((item) => (item.id === id ? response.data! : item))
        )
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in markAsUnsold:', err)
      setError(err.message || 'Failed to mark stock item as unsold')
      return null
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchStockItems()
    }
  }, [sold, autoFetch])

  return {
    stockItems,
    loading,
    error,
    createStockItem,
    updateStockItem,
    deleteStockItem,
    markAsSold,
    markAsUnsold,
    refreshStockItems: fetchStockItems,
  }
}
