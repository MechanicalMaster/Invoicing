'use client'

import { useEffect, useState } from 'react'
import { apiClient, apiPost, apiPut, apiDelete } from '@/lib/api/client'
import { Tables } from '@/lib/database.types'

type Invoice = Tables<'invoices'>
type InvoiceItem = Tables<'invoice_items'>

interface InvoiceWithItems extends Invoice {
  invoice_items?: InvoiceItem[]
}

export interface UseInvoicesOptions {
  search?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  page?: number
  limit?: number
  autoFetch?: boolean
}

export interface CreateInvoiceData {
  customer_id?: string | null
  customer_name_snapshot: string
  customer_address_snapshot?: string | null
  customer_phone_snapshot?: string | null
  customer_email_snapshot?: string | null
  firm_name_snapshot: string
  firm_address_snapshot?: string | null
  firm_phone_snapshot?: string | null
  firm_gstin_snapshot?: string | null
  invoice_date: string
  subtotal: number
  gst_percentage: number
  gst_amount: number
  grand_total: number
  notes?: string | null
  status?: string
  items: Array<{
    name: string
    quantity: number
    weight: number
    price_per_gram: number
    total: number
  }>
}

export default function useInvoices(options: UseInvoicesOptions = {}) {
  const { search, dateFrom, dateTo, status, page = 1, limit = 50, autoFetch = true } = options
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<{
    page: number
    limit: number
    total: number
  }>({
    page: 1,
    limit: 50,
    total: 0,
  })

  const fetchInvoices = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      if (status) params.append('status', status)
      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const endpoint = `/invoices?${params.toString()}`
      const response = await apiClient<Invoice[]>(endpoint)

      if (response.error) {
        setError(response.error)
        setInvoices([])
      } else {
        setInvoices(response.data || [])
        if (response.meta) {
          setMeta({
            page: response.meta.page || page,
            limit: response.meta.limit || limit,
            total: response.meta.total || 0,
          })
        }
      }
    } catch (err: any) {
      console.error('Error in useInvoices:', err)
      setError(err.message || 'Failed to fetch invoices')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const createInvoice = async (data: CreateInvoiceData) => {
    try {
      const response = await apiPost<InvoiceWithItems>('/invoices', data)

      if (response.error) {
        console.error('Error creating invoice:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        // Optionally refresh the list
        // await fetchInvoices()
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in createInvoice:', err)
      setError(err.message || 'Failed to create invoice')
      return null
    }
  }

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const response = await apiPut<InvoiceWithItems>(`/invoices/${id}`, updates)

      if (response.error) {
        console.error('Error updating invoice:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        setInvoices((prev) =>
          prev.map((invoice) => (invoice.id === id ? { ...invoice, ...updates } : invoice))
        )
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in updateInvoice:', err)
      setError(err.message || 'Failed to update invoice')
      return null
    }
  }

  const deleteInvoice = async (id: string) => {
    try {
      const response = await apiDelete(`/invoices/${id}`)

      if (response.error) {
        console.error('Error deleting invoice:', response.error)
        setError(response.error)
        return false
      }

      setInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
      return true
    } catch (err: any) {
      console.error('Error in deleteInvoice:', err)
      setError(err.message || 'Failed to delete invoice')
      return false
    }
  }

  const getInvoice = async (id: string) => {
    try {
      const response = await apiClient<InvoiceWithItems>(`/invoices/${id}`)

      if (response.error) {
        console.error('Error fetching invoice:', response.error)
        setError(response.error)
        return null
      }

      return response.data || null
    } catch (err: any) {
      console.error('Error in getInvoice:', err)
      setError(err.message || 'Failed to fetch invoice')
      return null
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchInvoices()
    }
  }, [search, dateFrom, dateTo, status, page, limit, autoFetch])

  return {
    invoices,
    loading,
    error,
    meta,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    refreshInvoices: fetchInvoices,
  }
}
