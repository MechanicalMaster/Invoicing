"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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

// Mock data for a single customer
const customerData = {
  id: "1",
  name: "Priya Sharma",
  phone: "+91 98765 43210",
  email: "priya.sharma@example.com",
  address: "123 Park Street, Mumbai, Maharashtra, 400001",
  identityType: "PAN",
  identityNumber: "ABCPS1234D",
  identityDocument: "/placeholder.svg?height=300&width=400",
  referredBy: "Rajesh Mehta",
  referralNotes: "Regular customer at Rajesh's shop, interested in gold jewelry",
  notes: "Prefers gold jewelry with traditional designs. Birthday on 15th August.",
}

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    identityType: "pan_card" as "pan_card" | "aadhaar_card" | "others" | "none",
    identityReference: "",
    referredBy: "",
    referralNotes: "",
    notes: "",
  })
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const [existingDocPath, setExistingDocPath] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast({
            title: "Customer not found",
            description: "The requested customer could not be found.",
            variant: "destructive",
          });
          router.push('/customers');
          return;
        }

        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          identityType: data.identity_type,
          identityReference: data.identity_reference || "",
          referredBy: data.referred_by || "",
          referralNotes: data.referral_notes || "",
          notes: data.notes || "",
        });

        if (data.identity_doc) {
          setDocumentPreview(data.identity_doc);
          setExistingDocPath(data.identity_doc);
        }

        setIsLoading(false);
      } catch (error: any) {
        toast({
          title: "Error loading customer",
          description: error.message || "Could not load customer data.",
          variant: "destructive",
        });
        router.push('/customers');
      }
    };

    fetchCustomer();
  }, [params.id, user, router]);

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
    setExistingDocPath(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!user) {
        throw new Error("You must be logged in to update a customer")
      }

      // Validate form
      if (!formData.name) {
        throw new Error("Customer name is required")
      }

      // Validate identity reference when "others" is selected
      if (formData.identityType === "others" && !formData.identityReference) {
        throw new Error("Identity reference is required when 'Others' is selected")
      }

      // Helper function to extract storage path from public URL
      const extractStoragePathFromUrl = (publicUrl: string, bucketName: string): string | null => {
        try {
          const url = new URL(publicUrl)
          const pathParts = url.pathname.split('/')
          const bucketIndex = pathParts.indexOf(bucketName)
          
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            // Get everything after the bucket name
            return pathParts.slice(bucketIndex + 1).join('/')
          }
          return null
        } catch (error) {
          console.error('Error parsing storage URL:', error)
          return null
        }
      }

      // Upload file to Supabase Storage if a new file is provided
      let identityDocPath = existingDocPath
      if (documentFile && formData.identityType !== "none") {
        // Delete existing file if there is one
        if (existingDocPath) {
          const existingFilePath = extractStoragePathFromUrl(existingDocPath, 'identity_docs')
          
          if (existingFilePath) {
            await supabase.storage
              .from('identity_docs')
              .remove([existingFilePath]);
          }
        }
        
        // Upload new file using secure API
        const fileExt = documentFile.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
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
      
      // If identity type is "none", set document path to null
      if (formData.identityType === "none") {
        identityDocPath = null;
        
        // Delete existing file if there is one
        if (existingDocPath) {
          const existingFilePath = extractStoragePathFromUrl(existingDocPath, 'identity_docs')
          
          if (existingFilePath) {
            await supabase.storage
              .from('identity_docs')
              .remove([existingFilePath]);
          }
        }
      }

      // Update customer data in Supabase
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          notes: formData.notes || null,
          identity_type: formData.identityType,
          identity_reference: formData.identityReference || null,
          identity_doc: identityDocPath,
          referred_by: formData.referredBy || null,
          referral_notes: formData.referralNotes || null
        })
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        throw new Error(`Error updating customer: ${error.message}`)
      }

      toast({
        title: "Customer updated",
        description: "The customer information has been updated successfully.",
      })

      // Redirect to customer detail page
      router.push(`/customers/${params.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-2 font-heading font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl">Sethiya Gold</span>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Loading customer information...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl">Ratna Invoicing</span>
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
          <Link href={`/customers/${params.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Customer
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">Edit Customer</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update the customer's personal details</CardDescription>
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
                <CardDescription>Update the customer's identity details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Identity Type</Label>
                  <RadioGroup
                    value={formData.identityType}
                    onValueChange={(value) => handleSelectChange("identityType", value as "pan_card" | "aadhaar_card" | "others" | "none")}
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
                            {documentFile?.type === 'application/pdf' || (documentPreview.toLowerCase().endsWith('.pdf')) ? (
                              <div className="flex h-40 w-60 items-center justify-center rounded-md bg-muted">
                                <FileText className="h-16 w-16 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {documentFile ? documentFile.name : 'PDF Document'}
                                </p>
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
                                  required={formData.identityType !== "none" && !documentPreview}
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
                <CardDescription>Update referral details if applicable</CardDescription>
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
                <CardDescription>Update any additional notes or preferences</CardDescription>
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
            <Link href={`/customers/${params.id}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
