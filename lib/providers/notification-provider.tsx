'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Tables } from '@/lib/database.types'
import { toast } from 'sonner'
import useUserSettings from '@/lib/hooks/useUserSettings'

export type Notification = Tables<'notifications'>

type NotificationContextType = {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { settings } = useUserSettings()
  
  const fetchNotifications = async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching notifications:', error)
      return
    }
    
    setNotifications(data || [])
    setUnreadCount(data?.filter(n => !n.read_at).length || 0)
  }
  
  const markAsRead = async (id: string) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return
    
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.user.id)
    
    if (error) {
      console.error('Error marking notification as read:', error)
      return
    }
    
    await fetchNotifications()
  }
  
  const markAllAsRead = async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return
    
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id)
    if (unreadIds.length === 0) return
    
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds)
      .eq('user_id', user.user.id)
    
    if (error) {
      console.error('Error marking all notifications as read:', error)
      return
    }
    
    await fetchNotifications()
  }
  
  // Setup real-time subscription for new notifications
  useEffect(() => {
    let channel: any = null
    
    const setupSubscription = async () => {
      await fetchNotifications()
      
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return
      
      // Subscribe only to notifications for the current user
      channel = supabase
        .channel(`notifications-channel-${user.user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.user.id}`
          },
          async (payload) => {
            const newNotification = payload.new as Notification
            
            // Show toast notification
            toast(newNotification.title, {
              description: newNotification.message,
              action: newNotification.action_url ? {
                label: 'View',
                onClick: () => {
                  window.location.href = newNotification.action_url as string
                }
              } : undefined,
            })
            
            // Refresh notifications list
            await fetchNotifications()
          }
        )
        .subscribe()
    }
    
    setupSubscription()
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])
  
  // Request push notification permission if enabled in settings
  useEffect(() => {
    const requestPushPermission = async () => {
      if (settings?.notifications_push_enabled && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission()
          if (permission !== 'granted') {
            console.log('Push notification permission not granted')
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error)
        }
      }
    }
    
    if (settings) {
      requestPushPermission()
    }
  }, [settings])
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 