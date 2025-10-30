'use client'

import { useEffect, useState } from 'react'
import { apiClient, apiPatch, apiPost } from '@/lib/api/client'
import { Tables } from '@/lib/database.types'

type UserSettings = Tables<'user_settings'> | null

export default function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient<UserSettings>('/settings')

      if (response.error) {
        setError(response.error)
        setSettings(null)
      } else {
        setSettings(response.data || null)
      }
    } catch (err: any) {
      console.error('Error in useUserSettings:', err)
      setError(err.message || 'Failed to fetch settings')
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<Tables<'user_settings'>>) => {
    try {
      const response = await apiPatch<UserSettings>('/settings', updates)

      if (response.error) {
        console.error('Error updating user settings:', response.error)
        setError(response.error)
        return null
      }

      if (response.data) {
        setSettings(response.data)
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error in updateSettings:', err)
      setError(err.message || 'Failed to update settings')
      return null
    }
  }

  const incrementInvoiceNumber = async () => {
    try {
      const response = await apiPost<{ currentNumber: number; nextNumber: number }>(
        '/settings/invoice-number',
        {}
      )

      if (response.error) {
        console.error('Error incrementing invoice number:', response.error)
        setError(response.error)
        return null
      }

      // Refresh settings to get updated invoice number
      await fetchSettings()

      return response.data
    } catch (err: any) {
      console.error('Error in incrementInvoiceNumber:', err)
      setError(err.message || 'Failed to increment invoice number')
      return null
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings: fetchSettings,
    incrementInvoiceNumber,
  }
} 