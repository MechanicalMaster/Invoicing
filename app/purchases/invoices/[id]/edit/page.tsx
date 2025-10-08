"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { ArrowLeft, CalendarIcon, FileText, FileUp, PlusCircle, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import supabase from "@/lib/supabase"
import { Tables } from "@/lib/database.types"

type Supplier = Tables<"suppliers">
type PurchaseInvoice = Tables<"purchase_invoices">

export default function EditPurchaseInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentInvoiceFile, setCurrentInvoiceFile] = useState<string | null>(null)
  const [removeCurrentFile, setRemoveCurrentFile] = useState(false)
  const [formData, setFormData] = useState({
    purchase_number: "",
    invoice_number: "",
    invoice_date: new Date(),
    supplier_id: "_none",
    amount: "",
    status: "Received",
    payment_status: "Unpaid",
    number_of_items: "",
    notes: "",
  })

  // Unwrap params
  useEffect(() => {
    params.then(p => setInvoiceId(p.id));
  }, [params]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to edit a purchase invoice",
        variant: "destructive",
      })
      return
    }

    if (user && invoiceId) {
      fetchSuppliers()
      fetchInvoice()
    }
  }, [user, authLoading, invoiceId])

  const fetchSuppliers = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", user.id)
        .order("name")

      if (error) throw error
      setSuppliers(data || [])
    } catch (error: any) {
      console.error("Error fetching suppliers:", error)
      toast({
        title: "Error fetching suppliers",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSuppliers(false)
    }
  }

  const fetchInvoice = async () => {
    if (!invoiceId) return;
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("purchase_invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("user_id", user!.id)
        .single()

      if (error) throw error

      if (!data) {
        toast({
          title: "Purchase invoice not found",
          description: "The requested invoice does not exist or you don't have access to it",
          variant: "destructive",
        })
        router.push("/purchases?tab=invoices")
        return
      }

      // Set current invoice file
      if (data.invoice_file_url) {
        setCurrentInvoiceFile(data.invoice_file_url)
      }

      // Set form data
      setFormData({
        purchase_number: data.purchase_number || "",
        invoice_number: data.invoice_number || "",
        invoice_date: data.invoice_date ? new Date(data.invoice_date) : new Date(),
        supplier_id: data.supplier_id || "_none",
        amount: data.amount ? data.amount.toString() : "",
        status: data.status || "Received",
        payment_status: data.payment_status || "Unpaid",
        number_of_items: data.number_of_items ? data.number_of_items.toString() : "",
        notes: data.notes || "",
      })
    } catch (error: any) {
      console.error("Error fetching purchase invoice:", error)
      toast({
        title: "Error loading purchase invoice",
        description: error.message || "An error occurred while loading invoice details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, invoice_date: date }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setRemoveCurrentFile(true) // When a new file is selected, we'll remove the old one
    }
  }

  const handleRemoveCurrentFile = () => {
    setRemoveCurrentFile(true)
    setCurrentInvoiceFile(null)
  }

  const handleCancelRemoveFile = () => {
    setRemoveCurrentFile(false)
    setSelectedFile(null)
    // If we had a file URL before, restore it
    if (currentInvoiceFile) {
      setCurrentInvoiceFile(currentInvoiceFile)
    }
  }

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      return pathParts[pathParts.length - 1]
    } catch (error) {
      return url.split('/').pop() || 'Invoice File'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to update a purchase invoice",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.invoice_number.trim() || !formData.amount.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
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

      // Handle file changes
      let invoice_file_url = currentInvoiceFile
      
      // If we're removing the current file
      if (removeCurrentFile && currentInvoiceFile) {
        try {
          const filePath = extractStoragePathFromUrl(currentInvoiceFile, 'purchase-invoices')
          
          if (filePath) {
            const { error: removeError } = await supabase.storage
              .from('purchase-invoices')
              .remove([filePath])
            
            if (removeError) {
              console.error("Error removing file:", removeError)
              // Continue even if remove fails
            }
          }
          
          invoice_file_url = null // Reset file URL
        } catch (fileError) {
          console.error("Error processing file removal:", fileError)
        }
      }
      
             // If we have a new file to upload
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
          const filePath = `${user.id}/${fileName}`
          
          // Use secure upload API
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            throw new Error('No active session')
          }

          const formData = new FormData()
          formData.append('file', selectedFile)
          formData.append('bucket', 'purchase-invoices')
          formData.append('path', filePath)

          const response = await fetch('/api/storage/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: formData,
          })

          if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(errorResponse.error || 'Upload failed')
          }

          const uploadResult = await response.json()
          // Store the path in a URL format for backward compatibility
          invoice_file_url = `purchase-invoices/${uploadResult.path}`
        } catch (fileError: any) {
          console.error("File upload error:", fileError)
          throw new Error(`File upload failed: ${fileError.message || 'Unknown error'}`)
        }
      }

      // Update purchase invoice
      if (!invoiceId) {
        throw new Error('Invoice ID is required')
      }

      const { error } = await supabase
        .from('purchase_invoices')
        .update({
          purchase_number: formData.purchase_number,
          invoice_number: formData.invoice_number,
          invoice_date: formData.invoice_date instanceof Date ? formData.invoice_date.toISOString().split('T')[0] : formData.invoice_date,
          supplier_id: formData.supplier_id === "_none" ? null : formData.supplier_id,
          amount: parseFloat(formData.amount),
          status: formData.status,
          payment_status: formData.payment_status,
          number_of_items: formData.number_of_items ? parseInt(formData.number_of_items) : null,
          notes: formData.notes,
          invoice_file_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Purchase invoice updated successfully",
        description: `Invoice #${formData.invoice_number} has been updated`,
      })

      router.push(`/purchases/invoices/${invoiceId}`)
    } catch (error: any) {
      console.error("Error updating purchase invoice:", error)
      toast({
        title: "Error updating purchase invoice",
        description: error.message || "An error occurred while updating the purchase invoice",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Edit Purchase Invoice</h1>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="grid gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Invoice Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Invoice Details</CardTitle>
                  <CardDescription>Edit details from the supplier's invoice</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="invoice_number">
                        Invoice Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="invoice_number"
                        name="invoice_number"
                        placeholder="Enter supplier's invoice number"
                        value={formData.invoice_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="invoice_date">
                        Invoice Date <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="invoice_date"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.invoice_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.invoice_date ? format(formData.invoice_date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.invoice_date}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supplier_id">Supplier</Label>
                      <Select 
                        value={formData.supplier_id} 
                        onValueChange={(value) => handleSelectChange("supplier_id", value)}
                      >
                        <SelectTrigger id="supplier_id">
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
                          {isLoadingSuppliers ? (
                            <SelectItem value="_loading" disabled>
                              Loading suppliers...
                            </SelectItem>
                          ) : suppliers.length > 0 ? (
                            suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="_no_suppliers" disabled>
                              No suppliers found
                            </SelectItem>
                          )}
                          <Button
                            variant="ghost"
                            className="mt-2 w-full justify-start"
                            onClick={() => router.push("/purchases/suppliers/add")}
                            type="button"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Supplier
                          </Button>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">
                        Amount (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter total amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Additional Information</CardTitle>
                  <CardDescription>Edit more details about this purchase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="purchase_number">Purchase #</Label>
                      <Input
                        id="purchase_number"
                        name="purchase_number"
                        placeholder="Enter purchase number"
                        value={formData.purchase_number}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="number_of_items">Number of Items</Label>
                      <Input
                        id="number_of_items"
                        name="number_of_items"
                        type="number"
                        min="0"
                        placeholder="Enter number of items"
                        value={formData.number_of_items}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Received">Received</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_status">Payment Status</Label>
                      <Select
                        value={formData.payment_status}
                        onValueChange={(value) => handleSelectChange("payment_status", value)}
                      >
                        <SelectTrigger id="payment_status">
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Add any notes about this purchase"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice File Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Invoice File</CardTitle>
                  <CardDescription>
                    Update or remove the invoice file attachment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {/* Current file display */}
                    {currentInvoiceFile && !removeCurrentFile && (
                      <div className="rounded-md border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <FileText className="mt-0.5 h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Current file</p>
                              <a 
                                href={currentInvoiceFile} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                {getFileNameFromUrl(currentInvoiceFile)}
                              </a>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveCurrentFile}
                            className="h-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* File removal confirmation */}
                    {removeCurrentFile && currentInvoiceFile && !selectedFile && (
                      <div className="rounded-md border border-destructive p-4 bg-destructive/5">
                        <div className="flex flex-col gap-3">
                          <p className="text-sm">
                            The current file will be permanently deleted. You can upload a new file below or cancel.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelRemoveFile}
                            className="w-fit"
                          >
                            Cancel Removal
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* File upload */}
                    <div className="grid gap-2">
                      <Label htmlFor="invoice_file">
                        {selectedFile 
                          ? "Replace with new file" 
                          : currentInvoiceFile && !removeCurrentFile 
                            ? "Replace file" 
                            : "Upload file"
                        }
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="invoice_file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="flex-1"
                        />
                      </div>
                      {selectedFile && (
                        <p className="text-xs text-muted-foreground">
                          Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>

                    {/* File upload zone */}
                    <div className="rounded-md border border-dashed p-6 text-center">
                      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
                        <FileUp className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium">
                          Drag and drop your invoice file here, or click the button above to browse
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Supported formats: PDF, JPG, PNG
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/purchases?tab=invoices`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
} 