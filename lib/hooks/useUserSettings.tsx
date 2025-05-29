'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Tables } from '@/lib/database.types'

type UserSettings = Tables<'user_settings'> | null

export default function useUserSettings() {
  const supabase = createClientComponentClient()
  const [settings, setSettings] = useState<UserSettings>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        setSettings(null)
        return
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error)
      }

      setSettings(data || null)
    } catch (error) {
      console.error('Error in useUserSettings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<Tables<'user_settings'>>) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return null

      // If settings exist, update them
      if (settings) {
        const { data, error } = await supabase
          .from('user_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.user.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating user settings:', error)
          return null
        }

        setSettings(data)
        return data
      } 
      // If settings don't exist, create them
      else {
        const { data, error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.user.id,
            ...updates,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating user settings:', error)
          return null
        }

        setSettings(data)
        return data
      }
    } catch (error) {
      console.error('Error in updateSettings:', error)
      return null
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return { settings, loading, updateSettings, refreshSettings: fetchSettings }
} 