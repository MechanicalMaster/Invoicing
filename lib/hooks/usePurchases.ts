'use client'

import { useEffect, useState } from 'react'
import { apiClient, apiPost, apiPut, apiDelete } from '@/lib/api/client'
import { Tables } from '@/lib/database.types'

type PurchaseInvoice = Tables<'purchase_invoices'>

interface PurchaseInvoiceWithSupplier extends PurchaseInvoice {
  suppliers?: {
    name: string
  } | null
}

export interface UsePurchasesOptions {
  search?: string
  status?: string
  payment_status?: string
  autoFetch?: boolean
}

export interface CreatePurchaseInvoiceData {
  purchase_number?: string
  invoice_number: string
  invoice_date: string
  supplier_id?: string | null
  amount: number
  status?: string
  payment_status?: string
  number_of_items?: number | null
  notes?: string | null
  invoice_file_url?: string | null
}

export default function usePurchases(options: UsePurchasesOptions = {}) {
  const { search, status, payment_status, autoFetch = true } = options
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceWithSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPurchaseInvoices = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      if (payment_status) params.append('payment_status', payment_status)

      const endpoint = `/purchases/invoices?${params.toString()}`
      const response = await apiClient<PurchaseInvoiceWithSupplier[]>(endpoint)

      if (response.error) {
        setError(response.error)
        setPurchaseInvoices([])
      } else {
        setPurchaseInvoices(response.data || [])
      }
    } catch (err: any) {
      console.error('Error in usePurchases:', err)
      setError(err.message || 'Failed to fetch purchase invoices')
      setPurchaseInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const createPurchaseInvoice = async (data: CreatePurchaseInvoiceData) => {
    try {
      const response = await apiPost<PurchaseInvoiceWithSupplier>('/purchases/invoices', data)

      if (response.error) {
        console.error('Error creating purchase invoice:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        // Optionally refresh the list
        // await fetchPurchaseInvoices()
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in createPurchaseInvoice:', err)
      setError(err.message || 'Failed to create purchase invoice')
      return null
    }
  }

  const updatePurchaseInvoice = async (id: string, updates: Partial<PurchaseInvoice>) => {
    try {
      const response = await apiPut<PurchaseInvoiceWithSupplier>(`/purchases/invoices/${id}`, updates)

      if (response.error) {
        console.error('Error updating purchase invoice:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        setPurchaseInvoices((prev) =>
          prev.map((invoice) => (invoice.id === id ? { ...invoice, ...updates } : invoice))
        )
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in updatePurchaseInvoice:', err)
      setError(err.message || 'Failed to update purchase invoice')
      return null
    }
  }

  const deletePurchaseInvoice = async (id: string) => {
    try {
      const response = await apiDelete(`/purchases/invoices/${id}`)

      if (response.error) {
        console.error('Error deleting purchase invoice:', response.error)
        setError(response.error)
        return false
      }

      setPurchaseInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
      return true
    } catch (err: any) {
      console.error('Error in deletePurchaseInvoice:', err)
      setError(err.message || 'Failed to delete purchase invoice')
      return false
    }
  }

  const getPurchaseInvoice = async (id: string) => {
    try {
      const response = await apiClient<PurchaseInvoiceWithSupplier>(`/purchases/invoices/${id}`)

      if (response.error) {
        console.error('Error fetching purchase invoice:', response.error)
        setError(response.error)
        return null
      }

      return response.data || null
    } catch (err: any) {
      console.error('Error in getPurchaseInvoice:', err)
      setError(err.message || 'Failed to fetch purchase invoice')
      return null
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchPurchaseInvoices()
    }
  }, [search, status, payment_status, autoFetch])

  return {
    purchaseInvoices,
    loading,
    error,
    createPurchaseInvoice,
    updatePurchaseInvoice,
    deletePurchaseInvoice,
    getPurchaseInvoice,
    refreshPurchaseInvoices: fetchPurchaseInvoices,
  }
}
