'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import useUserSettings from '@/lib/hooks/useUserSettings'
import { Loader2, AlertCircle } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { TimeInput } from '@/components/ui/time-input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Constants } from '@/lib/database.types'

export function NotificationSettings() {
  const { settings, loading, updateSettings } = useUserSettings()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  
  // Push notification test permission status
  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null)
  
  // Check push notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission)
    }
  }, [])
  
  const handlePushPermissionTest = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notifications not supported',
        description: 'Your browser does not support push notifications.',
        variant: 'destructive'
      })
      return
    }
    
    try {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)
      
      if (permission === 'granted') {
        toast({
          title: 'Notification permission granted',
          description: 'You will now receive push notifications when enabled.'
        })
        
        // Show a test notification
        new Notification('Test Notification', {
          body: 'This is a test notification from Jewelry Invoice app',
          icon: '/favicon.ico'
        })
      } else {
        toast({
          title: 'Notification permission denied',
          description: 'You need to allow notifications in your browser settings.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast({
        title: 'Error requesting permission',
        description: 'There was an error requesting notification permission.',
        variant: 'destructive'
      })
    }
  }
  
  const handleToggleChange = async (key: string, value: boolean) => {
    setSaving(true)
    try {
      await updateSettings({
        [key]: value
      })
      toast({
        title: 'Settings updated',
        description: 'Your notification settings have been updated.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }
  
  const handleFrequencyChange = async (value: string) => {
    setSaving(true)
    try {
      await updateSettings({
        notifications_frequency: value as any
      })
      toast({
        title: 'Settings updated',
        description: 'Your notification frequency has been updated.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }
  
  const handleQuietHoursChange = async (start: string, end: string) => {
    setSaving(true)
    try {
      await updateSettings({
        notifications_quiet_hours_start: start,
        notifications_quiet_hours_end: end
      })
      toast({
        title: 'Settings updated',
        description: 'Your quiet hours have been updated.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how and when you want to receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Channels</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications in your browser
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings?.notifications_push_enabled || false}
                onCheckedChange={(value) => handleToggleChange('notifications_push_enabled', value)}
                disabled={saving}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePushPermissionTest}
                disabled={saving}
              >
                Test
              </Button>
            </div>
          </div>
          
          {pushPermission === 'denied' && (
            <div className="flex gap-2 text-sm p-2 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>
                Notification permission denied. Please enable notifications in your browser settings.
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={settings?.notifications_email_enabled || false}
              onCheckedChange={(value) => handleToggleChange('notifications_email_enabled', value)}
              disabled={saving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via SMS (standard rates apply)
              </p>
            </div>
            <Switch
              checked={settings?.notifications_sms_enabled || false}
              onCheckedChange={(value) => handleToggleChange('notifications_sms_enabled', value)}
              disabled={saving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>WhatsApp Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via WhatsApp
              </p>
            </div>
            <Switch
              checked={settings?.notifications_whatsapp_enabled || false}
              onCheckedChange={(value) => handleToggleChange('notifications_whatsapp_enabled', value)}
              disabled={saving}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Preferences</h3>
          
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select
              value={settings?.notifications_frequency || 'instant'}
              onValueChange={handleFrequencyChange}
              disabled={saving}
            >
              <SelectTrigger id="frequency" className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {Constants.public.Enums.notification_frequency_enum.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How frequently you want to receive non-critical notifications
            </p>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label>Quiet Hours</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Don't send notifications during these hours
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="quietHoursStart" className="text-xs">Start Time</Label>
                <TimeInput
                  id="quietHoursStart"
                  value={settings?.notifications_quiet_hours_start || '22:00'}
                  onChange={(value) => handleQuietHoursChange(
                    value, 
                    settings?.notifications_quiet_hours_end || '08:00'
                  )}
                  disabled={saving}
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="quietHoursEnd" className="text-xs">End Time</Label>
                <TimeInput
                  id="quietHoursEnd"
                  value={settings?.notifications_quiet_hours_end || '08:00'}
                  onChange={(value) => handleQuietHoursChange(
                    settings?.notifications_quiet_hours_start || '22:00',
                    value
                  )}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 