"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Home, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"

export default function AddCustomerPage() {
  const { user } = useAuth();
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    identityType: "pan_card",
    identityReference: "",
    referredBy: "",
    referralNotes: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Reset file input when identity type is changed to "none"
    if (name === "identityType" && value === "none") {
      removeFile()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PNG, JPG, or PDF file.",
          variant: "destructive",
        })
        return
      }
      
      setDocumentFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = () => {
        setDocumentPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setDocumentFile(null)
    setDocumentPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!user) {
        throw new Error("You must be logged in to add a customer")
      }

      // Validate form
      if (!formData.name) {
        throw new Error("Customer name is required")
      }

      // Validate identity reference when "others" is selected
      if (formData.identityType === "others" && !formData.identityReference) {
        throw new Error("Identity reference is required when 'Others' is selected")
      }

      // Upload file to Supabase Storage if provided and identity type is not "none"
      let identityDocPath = null
      if (documentFile && formData.identityType !== "none") {
        const fileExt = documentFile.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        // Use secure upload API
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('No active session')
        }

        const formDataUpload = new FormData()
        formDataUpload.append('file', documentFile)
        formDataUpload.append('bucket', 'identity_docs')
        formDataUpload.append('path', filePath)

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formDataUpload,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const uploadResult = await response.json()
        // Store the path in a URL format for backward compatibility
        identityDocPath = `identity_docs/${uploadResult.path}`
      }

      // Insert customer data into Supabase
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          notes: formData.notes || null,
          user_id: user.id,
          identity_type: formData.identityType,
          identity_reference: formData.identityReference || null,
          identity_doc: identityDocPath
        })
        .select()

      if (error) {
        throw new Error(`Error adding customer: ${error.message}`)
      }

      toast({
        title: "Customer added",
        description: "The customer has been added successfully.",
      })

      // Redirect to customers page
      router.push("/customers")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-2 font-heading font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl">Sethiya Gold</span>
        </div>
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
          <Link href="/customers">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">Add New Customer</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the customer's personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter customer's full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Identity Information */}
            <Card>
              <CardHeader>
                <CardTitle>Identity Information</CardTitle>
                <CardDescription>Enter the customer's identity details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Identity Type</Label>
                  <RadioGroup
                    value={formData.identityType}
                    onValueChange={(value) => handleSelectChange("identityType", value)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pan_card" id="pan_card" />
                      <Label htmlFor="pan_card">PAN Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="aadhaar_card" id="aadhaar_card" />
                      <Label htmlFor="aadhaar_card">Aadhaar Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="others" id="others" />
                      <Label htmlFor="others">Others</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none">None</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.identityType !== "none" && (
                  <>
                    {formData.identityType === "others" && (
                      <div className="space-y-2">
                        <Label htmlFor="identityReference">
                          Identity Reference Number {formData.identityType === "others" && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                          id="identityReference"
                          name="identityReference"
                          placeholder="Enter reference number"
                          value={formData.identityReference}
                          onChange={handleChange}
                          required={formData.identityType === "others"}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Identity Document {formData.identityType !== "none" && <span className="text-destructive">*</span>}</Label>
                      <div className="mt-1 flex items-center justify-center rounded-md border-2 border-dashed border-muted p-6">
                        {documentPreview ? (
                          <div className="relative">
                            {documentFile?.type === 'application/pdf' ? (
                              <div className="flex h-40 w-60 items-center justify-center rounded-md bg-muted">
                                <FileText className="h-16 w-16 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">{documentFile.name}</p>
                              </div>
                            ) : (
                              <img
                                src={documentPreview}
                                alt="Document Preview"
                                className="h-40 rounded-md object-cover"
                              />
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                              onClick={removeFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div className="mt-2 flex text-sm text-muted-foreground">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  accept="image/png,image/jpeg,application/pdf"
                                  onChange={handleFileChange}
                                  ref={fileInputRef}
                                  required={formData.identityType !== "none"}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Referral Information */}
            <Card>
              <CardHeader>
                <CardTitle>Referral Information</CardTitle>
                <CardDescription>Enter referral details if applicable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referredBy">Referred By</Label>
                  <Select
                    value={formData.referredBy}
                    onValueChange={(value) => handleSelectChange("referredBy", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a referrer (if any)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Rajesh Mehta">Rajesh Mehta</SelectItem>
                      <SelectItem value="Amit Singh">Amit Singh</SelectItem>
                      <SelectItem value="Neha Gupta">Neha Gupta</SelectItem>
                      <SelectItem value="Ananya Patel">Ananya Patel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralNotes">Referral Notes</Label>
                  <Textarea
                    id="referralNotes"
                    name="referralNotes"
                    placeholder="Enter any notes about the referral"
                    value={formData.referralNotes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Enter any additional notes or preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Enter any additional notes about the customer"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Link href="/customers">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
