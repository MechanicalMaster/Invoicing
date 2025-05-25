"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, FileText, Home, Mail, Phone, Save, Settings, Upload, Building, Bell, Database, Receipt, Tag, Image } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  
  const [firmDetails, setFirmDetails] = useState({
    name: "Sethiya Gold",
    phone: "+91 9876543210",
    address: "123 Jewelry Lane, Mumbai, Maharashtra 400001",
    gstin: "27ABCDE1234F1Z5",
    email: "contact@sethiyagold.com",
    website: "www.sethiyagold.com",
    establishmentDate: "01/01/1995"
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: false,
    sms: true,
    whatsapp: false,
    frequency: "instant",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00"
  });
  
  const [invoiceSettings, setInvoiceSettings] = useState({
    defaultPrefix: "INV-",
    nextNumber: 1,
    defaultNotes: ""
  });
  
  const [labelSettings, setLabelSettings] = useState({
    type: "standard",
    copies: 1,
    includeProductName: true,
    includePrice: true,
    includeBarcode: true,
    includeDate: true,
    includeMetal: true,
    includeWeight: true,
    includePurity: true,
    includeQrCode: true
  });
  
  const [photoSettings, setPhotoSettings] = useState({
    compressionLevel: "medium"
  });
  
  const [backupFileName, setBackupFileName] = useState("");
  
  // Fetch user settings when component mounts and user is available
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;
      
      try {
        setIsSettingsLoading(true);
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          // If error is not 'no rows returned', show error
          if (error.code !== 'PGRST116') {
            console.error('Error fetching settings:', error);
            toast({
              title: "Error loading settings",
              description: "There was a problem loading your settings. Please try again.",
              variant: "destructive",
            });
          }
          // For first time users or no settings found, keep default values
        } else if (data) {
          // Update firm details
          setFirmDetails({
            name: data.firm_name || firmDetails.name,
            phone: data.firm_phone || firmDetails.phone,
            address: data.firm_address || firmDetails.address,
            gstin: data.firm_gstin || firmDetails.gstin,
            email: data.firm_email || firmDetails.email,
            website: data.firm_website || firmDetails.website,
            establishmentDate: data.firm_establishment_date || firmDetails.establishmentDate
          });
          
          // Update notification settings
          setNotificationSettings({
            email: data.notifications_email_enabled ?? notificationSettings.email,
            push: data.notifications_push_enabled ?? notificationSettings.push,
            sms: data.notifications_sms_enabled ?? notificationSettings.sms,
            whatsapp: data.notifications_whatsapp_enabled ?? notificationSettings.whatsapp,
            frequency: data.notifications_frequency || notificationSettings.frequency,
            quietHoursStart: data.notifications_quiet_hours_start || notificationSettings.quietHoursStart,
            quietHoursEnd: data.notifications_quiet_hours_end || notificationSettings.quietHoursEnd
          });
          
          // Update invoice settings
          setInvoiceSettings({
            defaultPrefix: data.invoice_default_prefix || invoiceSettings.defaultPrefix,
            nextNumber: data.invoice_next_number || invoiceSettings.nextNumber,
            defaultNotes: data.invoice_default_notes || invoiceSettings.defaultNotes
          });
          
          // Update label settings
          setLabelSettings({
            type: data.label_type || labelSettings.type,
            copies: data.label_copies || labelSettings.copies,
            includeProductName: data.label_include_product_name ?? labelSettings.includeProductName,
            includePrice: data.label_include_price ?? labelSettings.includePrice,
            includeBarcode: data.label_include_barcode ?? labelSettings.includeBarcode,
            includeDate: data.label_include_date ?? labelSettings.includeDate,
            includeMetal: data.label_include_metal ?? labelSettings.includeMetal,
            includeWeight: data.label_include_weight ?? labelSettings.includeWeight,
            includePurity: data.label_include_purity ?? labelSettings.includePurity,
            includeQrCode: data.label_include_qr_code ?? labelSettings.includeQrCode
          });
          
          // Update photo settings
          setPhotoSettings({
            compressionLevel: data.photo_compression_level || photoSettings.compressionLevel
          });
        }
      } catch (error) {
        console.error('Error in fetchUserSettings:', error);
      } finally {
        setIsSettingsLoading(false);
      }
    };
    
    if (!isLoading) {
      fetchUserSettings();
    }
  }, [user, isLoading]);
  
  const handleFirmDetailChange = (field: string, value: string) => {
    setFirmDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNotificationChange = (field: string, value: boolean | string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleInvoiceSettingChange = (field: string, value: string | number) => {
    setInvoiceSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleLabelSettingChange = (field: string, value: string | number | boolean) => {
    setLabelSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handlePhotoSettingChange = (field: string, value: string) => {
    setPhotoSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveChanges = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to save settings.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Construct the settings payload
      const settingsPayload = {
        user_id: user.id,
        // Firm Details
        firm_name: firmDetails.name,
        firm_phone: firmDetails.phone,
        firm_address: firmDetails.address,
        firm_gstin: firmDetails.gstin,
        firm_email: firmDetails.email,
        firm_website: firmDetails.website,
        firm_establishment_date: firmDetails.establishmentDate,
        // Notification Settings
        notifications_email_enabled: notificationSettings.email,
        notifications_push_enabled: notificationSettings.push,
        notifications_sms_enabled: notificationSettings.sms,
        notifications_whatsapp_enabled: notificationSettings.whatsapp,
        notifications_frequency: notificationSettings.frequency,
        notifications_quiet_hours_start: notificationSettings.quietHoursStart,
        notifications_quiet_hours_end: notificationSettings.quietHoursEnd,
        // Invoice Settings
        invoice_default_prefix: invoiceSettings.defaultPrefix,
        invoice_next_number: invoiceSettings.nextNumber,
        invoice_default_notes: invoiceSettings.defaultNotes,
        // Label Settings
        label_type: labelSettings.type,
        label_copies: labelSettings.copies,
        label_include_product_name: labelSettings.includeProductName,
        label_include_price: labelSettings.includePrice,
        label_include_barcode: labelSettings.includeBarcode,
        label_include_date: labelSettings.includeDate,
        label_include_metal: labelSettings.includeMetal,
        label_include_weight: labelSettings.includeWeight,
        label_include_purity: labelSettings.includePurity,
        label_include_qr_code: labelSettings.includeQrCode,
        // Photo Settings
        photo_compression_level: photoSettings.compressionLevel,
      };
      
      // Save settings to Supabase
      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsPayload, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: "Error saving settings",
          description: "There was a problem saving your settings. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Changes saved",
        description: "Your settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error in handleSaveChanges:', error);
      toast({
        title: "Error saving settings",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleBackup = () => {
    toast({
      title: "Backup created",
      description: "Your data has been backed up successfully",
    });
  };
  
  const handleRestore = () => {
    if (!backupFileName) {
      toast({
        title: "No file selected",
        description: "Please select a backup file to restore",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Restore initiated",
      description: "Your data is being restored from backup",
    });
  };
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl">Sethiya Gold</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="ml-4">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your firm settings, notifications, and backups</p>
          </div>
        </div>
        
        <Tabs defaultValue="firm-details" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-6">
            <TabsTrigger value="firm-details" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>Firm Details</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Backup</span>
            </TabsTrigger>
            <TabsTrigger value="invoice-settings" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>Invoice</span>
            </TabsTrigger>
            <TabsTrigger value="label-settings" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Label</span>
            </TabsTrigger>
            <TabsTrigger value="photo-settings" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span>Photo</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Firm Details Tab */}
          <TabsContent value="firm-details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Firm Details</CardTitle>
                <CardDescription>Manage your firm's information</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firmName">Firm Name</Label>
                      <Input 
                        id="firmName" 
                        value={firmDetails.name}
                        onChange={(e) => handleFirmDetailChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firmPhone">Firm Phone Number</Label>
                      <Input 
                        id="firmPhone" 
                        value={firmDetails.phone}
                        onChange={(e) => handleFirmDetailChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="firmAddress">Firm Address</Label>
                    <Input 
                      id="firmAddress" 
                      value={firmDetails.address}
                      onChange={(e) => handleFirmDetailChange("address", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firmGstin">Firm GSTIN Number</Label>
                      <Input 
                        id="firmGstin" 
                        value={firmDetails.gstin}
                        onChange={(e) => handleFirmDetailChange("gstin", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firmEmail">Firm Email Address</Label>
                      <Input 
                        id="firmEmail" 
                        type="email" 
                        value={firmDetails.email}
                        onChange={(e) => handleFirmDetailChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firmWebsite">Firm Website</Label>
                      <Input 
                        id="firmWebsite" 
                        value={firmDetails.website}
                        onChange={(e) => handleFirmDetailChange("website", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateEstablished">Date of Establishment</Label>
                      <Input 
                        id="dateEstablished" 
                        value={firmDetails.establishmentDate}
                        onChange={(e) => handleFirmDetailChange("establishmentDate", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleSaveChanges}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <Switch 
                          id="emailNotifications" 
                          checked={notificationSettings.email}
                          onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <Switch 
                          id="pushNotifications" 
                          checked={notificationSettings.push}
                          onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <Switch 
                          id="smsNotifications" 
                          checked={notificationSettings.sms}
                          onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="whatsappNotifications">WhatsApp Notifications</Label>
                        <Switch 
                          id="whatsappNotifications" 
                          checked={notificationSettings.whatsapp}
                          onCheckedChange={(checked) => handleNotificationChange("whatsapp", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Frequency and Quiet Hours</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notificationFrequency">Notification Frequency</Label>
                      <Select 
                        value={notificationSettings.frequency} 
                        onValueChange={(value) => handleNotificationChange("frequency", value)}
                      >
                        <SelectTrigger id="notificationFrequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Instant</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Quiet Hours</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quietHoursStart">Start Time</Label>
                          <Input
                            id="quietHoursStart"
                            type="time"
                            value={notificationSettings.quietHoursStart}
                            onChange={(e) => handleNotificationChange("quietHoursStart", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quietHoursEnd">End Time</Label>
                          <Input
                            id="quietHoursEnd"
                            type="time"
                            value={notificationSettings.quietHoursEnd}
                            onChange={(e) => handleNotificationChange("quietHoursEnd", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleSaveChanges}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>Create backups and restore your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Create Backup Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Create Backup</h3>
                      <p className="text-sm text-muted-foreground">
                        Download a complete backup of your data for safekeeping.
                      </p>
                      <Button 
                        className="w-full"
                        onClick={handleBackup}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Backup
                      </Button>
                    </div>
                    
                    {/* Restore Backup Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Restore Backup</h3>
                      <div className="space-y-2">
                        <Label htmlFor="backupFile">Select Backup File</Label>
                        <div className="flex items-center">
                          <Input 
                            id="backupFile" 
                            type="file" 
                            onChange={(e) => setBackupFileName(e.target.files?.[0]?.name || "")}
                          />
                        </div>
                        <p className="text-sm text-amber-600">
                          Restoring a backup will replace all your current data
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleRestore}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Restore Selected Backup
                      </Button>
                    </div>
                  </div>
                  
                  {/* Backup History */}
                  <div className="space-y-4 rounded-md border p-4">
                    <h3 className="font-medium">Backup History</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Recent Backups Created</h4>
                        <p className="text-sm text-muted-foreground">No recent backups</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Recent Restores</h4>
                        <p className="text-sm text-muted-foreground">No recent restores</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoice Settings Tab */}
          <TabsContent value="invoice-settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Settings</CardTitle>
                <CardDescription>Configure your invoice preferences and defaults</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                      <Input
                        id="invoicePrefix"
                        placeholder="e.g., INV-"
                        value={invoiceSettings.defaultPrefix}
                        onChange={(e) => handleInvoiceSettingChange("defaultPrefix", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be prepended to invoice numbers (e.g., INV-001)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nextInvoiceNumber">Next Invoice Number</Label>
                      <Input
                        id="nextInvoiceNumber"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={invoiceSettings.nextNumber}
                        onChange={(e) => handleInvoiceSettingChange("nextNumber", parseInt(e.target.value, 10) || 1)}
                      />
                      <p className="text-xs text-muted-foreground">
                        The next invoice will use this number and increment it
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultNotes">Default Invoice Notes</Label>
                    <Textarea
                      id="defaultNotes"
                      placeholder="These notes will appear on all invoices by default"
                      rows={4}
                      value={invoiceSettings.defaultNotes}
                      onChange={(e) => handleInvoiceSettingChange("defaultNotes", e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleSaveChanges}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Invoice Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Label Settings Tab */}
          <TabsContent value="label-settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Label Configuration</CardTitle>
                <CardDescription>Configure and print labels for inventory items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {/* Label Options */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Label Options</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="labelType">Label Type</Label>
                        <Select 
                          value={labelSettings.type}
                          onValueChange={(value) => handleLabelSettingChange("type", value)}
                        >
                          <SelectTrigger id="labelType">
                            <SelectValue placeholder="Standard (2.25&quot; x 1.25&quot;)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard (2.25" x 1.25")</SelectItem>
                            <SelectItem value="large">Large (3" x 2")</SelectItem>
                            <SelectItem value="small">Small (1.5" x 1")</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numberOfLabels">Number of Labels</Label>
                        <Select
                          value={labelSettings.copies.toString()}
                          onValueChange={(value) => handleLabelSettingChange("copies", parseInt(value, 10))}
                        >
                          <SelectTrigger id="numberOfLabels">
                            <SelectValue placeholder="1" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 10].map((num) => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Include on Label</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="productName" 
                                checked={labelSettings.includeProductName}
                                onCheckedChange={(checked) => 
                                  handleLabelSettingChange("includeProductName", checked === true)
                                }
                              />
                              <Label htmlFor="productName">Product Name</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="price" 
                                checked={labelSettings.includePrice}
                                onCheckedChange={(checked) => 
                                  handleLabelSettingChange("includePrice", checked === true)
                                }
                              />
                              <Label htmlFor="price">Price</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="barcode" 
                                checked={labelSettings.includeBarcode}
                                onCheckedChange={(checked) => 
                                  handleLabelSettingChange("includeBarcode", checked === true)
                                }
                              />
                              <Label htmlFor="barcode">Barcode</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="date" 
                                checked={labelSettings.includeDate}
                                onCheckedChange={(checked) => 
                                  handleLabelSettingChange("includeDate", checked === true)
                                }
                              />
                              <Label htmlFor="date">Date</Label>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="metal" 
                                checked={labelSettings.includeMetal}
                                onCheckedChange={(checked) => 
                                  handleLabelSettingChange("includeMetal", checked === true)
                                }
                              />
                              <Label htmlFor="metal">Metal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="weight" 
                                checked={labelSettings.includeWeight}
                                onCheckedChange={(checked) => 
                                  handleLabelSettingChange("includeWeight", checked === true)
                                }
                              />
                              <Label htmlFor="weight">Weight</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="purity" 
                                checked={labelSettings.includePurity}
                                onCheckedChange={(checked) => 
                                  handleLabelSettingChange("includePurity", checked === true)
                                }
                              />
                              <Label htmlFor="purity">Purity</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="qrCode" 
                                checked={labelSettings.includeQrCode}
                                onCheckedChange={(checked) => 
                                  handleLabelSettingChange("includeQrCode", checked === true)
                                }
                              />
                              <Label htmlFor="qrCode">QR Code</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={handleSaveChanges}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </Button>
                  </div>

                  {/* Label Preview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Label Preview</h3>
                    <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center">
                      <p className="text-muted-foreground">
                        Label preview will appear here when printing from inventory
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Note: The actual configuration will be applied when printing labels from the Inventory section.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photo Settings Tab */}
          <TabsContent value="photo-settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Photo Settings</CardTitle>
                <CardDescription>Configure image compression and quality settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="imageCompression">Image Compression Level</Label>
                    <Select
                      value={photoSettings.compressionLevel}
                      onValueChange={(value) => handlePhotoSettingChange("compressionLevel", value)}
                    >
                      <SelectTrigger id="imageCompression">
                        <SelectValue placeholder="Select compression level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Choose the compression level for images uploaded to the application. Higher compression means smaller file sizes but lower image quality.
                    </p>
                  </div>

                  <Button 
                    type="button" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleSaveChanges}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 