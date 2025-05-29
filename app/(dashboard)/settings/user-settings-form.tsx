'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import useUserSettings from '@/lib/hooks/useUserSettings'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export function UserSettingsForm() {
  const { settings, loading, updateSettings } = useUserSettings()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    firm_name: '',
    firm_address: '',
    firm_phone: '',
    firm_email: '',
    firm_website: '',
    firm_gstin: '',
    firm_establishment_date: ''
  })
  
  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        firm_name: settings.firm_name || '',
        firm_address: settings.firm_address || '',
        firm_phone: settings.firm_phone || '',
        firm_email: settings.firm_email || '',
        firm_website: settings.firm_website || '',
        firm_gstin: settings.firm_gstin || '',
        firm_establishment_date: settings.firm_establishment_date 
          ? new Date(settings.firm_establishment_date).toISOString().split('T')[0]
          : ''
      })
    }
  }, [settings])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await updateSettings({
        ...formData,
        firm_establishment_date: formData.firm_establishment_date 
          ? new Date(formData.firm_establishment_date).toISOString() 
          : null
      })
      
      toast({
        title: 'Settings updated',
        description: 'Your settings have been saved successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: 'There was a problem saving your settings.',
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
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Update your business details that will appear on invoices and other documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firm_name">Business Name</Label>
              <Input
                id="firm_name"
                name="firm_name"
                value={formData.firm_name}
                onChange={handleChange}
                placeholder="Your business name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firm_gstin">GSTIN</Label>
              <Input
                id="firm_gstin"
                name="firm_gstin"
                value={formData.firm_gstin}
                onChange={handleChange}
                placeholder="GSTIN number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firm_phone">Phone Number</Label>
              <Input
                id="firm_phone"
                name="firm_phone"
                value={formData.firm_phone}
                onChange={handleChange}
                placeholder="Business phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firm_email">Email Address</Label>
              <Input
                id="firm_email"
                name="firm_email"
                type="email"
                value={formData.firm_email}
                onChange={handleChange}
                placeholder="Business email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firm_website">Website</Label>
              <Input
                id="firm_website"
                name="firm_website"
                value={formData.firm_website}
                onChange={handleChange}
                placeholder="Business website"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firm_establishment_date">Establishment Date</Label>
              <Input
                id="firm_establishment_date"
                name="firm_establishment_date"
                type="date"
                value={formData.firm_establishment_date}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="firm_address">Business Address</Label>
            <Input
              id="firm_address"
              name="firm_address"
              value={formData.firm_address}
              onChange={handleChange}
              placeholder="Full business address"
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
} 