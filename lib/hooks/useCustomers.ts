'use client'

import { useEffect, useState } from 'react'
import { apiClient, apiPost, apiPut, apiDelete } from '@/lib/api/client'
import { Tables } from '@/lib/database.types'

type Customer = Tables<'customers'>

export interface UseCustomersOptions {
  search?: string
  referred?: boolean
  autoFetch?: boolean
}

export interface CreateCustomerData {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  identity_type?: string | null
  identity_reference?: string | null
  identity_doc?: string | null
  referred_by?: string | null
  referral_notes?: string | null
  notes?: string | null
}

export default function useCustomers(options: UseCustomersOptions = {}) {
  const { search, referred, autoFetch = true } = options
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (referred !== undefined) params.append('referred', referred.toString())

      const endpoint = `/customers?${params.toString()}`
      const response = await apiClient<Customer[]>(endpoint)

      if (response.error) {
        setError(response.error)
        setCustomers([])
      } else {
        setCustomers(response.data || [])
      }
    } catch (err: any) {
      console.error('Error in useCustomers:', err)
      setError(err.message || 'Failed to fetch customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (data: CreateCustomerData) => {
    try {
      const response = await apiPost<Customer>('/customers', data)

      if (response.error) {
        console.error('Error creating customer:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        // Optionally refresh the list
        // await fetchCustomers()
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in createCustomer:', err)
      setError(err.message || 'Failed to create customer')
      return null
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const response = await apiPut<Customer>(`/customers/${id}`, updates)

      if (response.error) {
        console.error('Error updating customer:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        setCustomers((prev) =>
          prev.map((customer) => (customer.id === id ? { ...customer, ...updates } : customer))
        )
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in updateCustomer:', err)
      setError(err.message || 'Failed to update customer')
      return null
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      const response = await apiDelete(`/customers/${id}`)

      if (response.error) {
        console.error('Error deleting customer:', response.error)
        setError(response.error)
        return false
      }

      setCustomers((prev) => prev.filter((customer) => customer.id !== id))
      return true
    } catch (err: any) {
      console.error('Error in deleteCustomer:', err)
      setError(err.message || 'Failed to delete customer')
      return false
    }
  }

  const getCustomer = async (id: string) => {
    try {
      const response = await apiClient<Customer>(`/customers/${id}`)

      if (response.error) {
        console.error('Error fetching customer:', response.error)
        setError(response.error)
        return null
      }

      return response.data || null
    } catch (err: any) {
      console.error('Error in getCustomer:', err)
      setError(err.message || 'Failed to fetch customer')
      return null
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchCustomers()
    }
  }, [search, referred, autoFetch])

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    refreshCustomers: fetchCustomers,
  }
}
