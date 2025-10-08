"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Sparkles, Save, Loader2, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/bill-upload/image-upload"
import { ExtractionPreview } from "@/components/bill-upload/extraction-preview"
import { BillExtractionData } from "@/lib/ai/actions/purchase-bill/bill-action-schema"
import supabase from "@/lib/supabase"
import { Tables } from "@/lib/database.types"

type Supplier = Tables<"suppliers">

export default function UploadBillPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [extractedData, setExtractedData] = useState<BillExtractionData | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false)

  // Editable form state (populated after extraction)
  const [formData, setFormData] = useState({
    purchase_number: "",
    invoice_number: "",
    invoice_date: "",
    supplier_id: "_none",
    supplier_name: "",
    amount: "",
    status: "Received",
    payment_status: "Unpaid",
    number_of_items: "",
    notes: "",
  })

  // Handle image selection
  const handleImageSelected = async (file: File) => {
    setSelectedFile(file)
    setExtractedData(null) // Clear previous extraction
  }

  // Extract bill data from image
  const handleExtractBill = async () => {
    if (!selectedFile || !user) return

    setIsExtracting(true)

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Prepare form data
      const formDataToSend = new FormData()
      formDataToSend.append('image', selectedFile)

      // Call extraction API
      const response = await fetch('/api/ai/extract-bill', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Extraction failed')
      }

      const result = await response.json()
      const data: BillExtractionData = result.data

      setExtractedData(data)

      // Pre-fill form with extracted data
      setFormData({
        purchase_number: `P-${Date.now().toString().slice(-6)}`,
        invoice_number: data.invoiceNumber,
        invoice_date: data.invoiceDate,
        supplier_id: "_none",
        supplier_name: data.supplier.name,
        amount: data.amount.toString(),
        status: "Received",
        payment_status: data.paymentStatus,
        number_of_items: data.numberOfItems?.toString() || "",
        notes: data.notes || "",
      })

      // Load suppliers to check for match
      await loadSuppliers(data.supplier.name)

      toast({
        title: "Extraction successful!",
        description: "Please review the extracted information below.",
      })

    } catch (error: any) {
      console.error("Extraction error:", error)

      // Show user-friendly error message
      let errorTitle = "Extraction failed"
      let errorMessage = "Could not extract bill information. Please try again or enter manually."

      if (error.message && error.message.includes("valid purchase bill")) {
        errorTitle = "Invalid Bill Image"
        errorMessage = error.message
      } else if (error.message && error.message.includes("clear and contains")) {
        errorTitle = "Poor Image Quality"
        errorMessage = error.message
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 6000, // Show longer for important error
      })
    } finally {
      setIsExtracting(false)
    }
  }

  // Load suppliers and try to match
  const loadSuppliers = async (supplierName?: string) => {
    if (!user) return

    setIsLoadingSuppliers(true)
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", user.id)
        .order("name")

      if (error) throw error

      setSuppliers(data || [])

      // Try to find matching supplier
      if (supplierName && data) {
        const match = data.find(s =>
          s.name.toLowerCase() === supplierName.toLowerCase()
        )
        if (match) {
          setFormData(prev => ({ ...prev, supplier_id: match.id }))
          toast({
            title: "Supplier matched!",
            description: `Found existing supplier: ${match.name}`,
          })
        }
      }
    } catch (error: any) {
      console.error("Error loading suppliers:", error)
    } finally {
      setIsLoadingSuppliers(false)
    }
  }

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Save purchase invoice
  const handleSave = async () => {
    if (!user) return

    // Validation
    if (!formData.invoice_number.trim() || !formData.amount.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in invoice number and amount",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Upload image file if exists
      let invoice_file_url = null
      if (selectedFile) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) throw new Error('No active session')

          const fileExt = selectedFile.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          const uploadFormData = new FormData()
          uploadFormData.append('file', selectedFile)
          uploadFormData.append('bucket', 'purchase-invoices')
          uploadFormData.append('path', filePath)

          const response = await fetch('/api/storage/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: uploadFormData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Upload failed')
          }

          const uploadResult = await response.json()
          invoice_file_url = `purchase-invoices/${uploadResult.path}`
        } catch (fileError: any) {
          console.error("File upload error:", fileError)
          throw new Error(`File upload failed: ${fileError.message}`)
        }
      }

      // Create or find supplier
      let supplierId = formData.supplier_id === "_none" ? null : formData.supplier_id

      if (formData.supplier_id === "_none" && formData.supplier_name.trim() && extractedData) {
        // Create new supplier from extracted data
        const { data: newSupplier, error: supplierError } = await supabase
          .from("suppliers")
          .insert({
            name: formData.supplier_name,
            phone: extractedData.supplier.phone || null,
            email: extractedData.supplier.email || null,
            address: extractedData.supplier.address || null,
            gst_number: extractedData.supplier.gstNumber || null,
            user_id: user.id,
          })
          .select()
          .single()

        if (supplierError) {
          console.error("Error creating supplier:", supplierError)
        } else if (newSupplier) {
          supplierId = newSupplier.id
        }
      }

      // Insert purchase invoice
      const { error } = await supabase.from("purchase_invoices").insert({
        purchase_number: formData.purchase_number || `P-${Date.now().toString().slice(-6)}`,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        supplier_id: supplierId,
        amount: parseFloat(formData.amount),
        status: formData.status,
        payment_status: formData.payment_status,
        number_of_items: formData.number_of_items ? parseInt(formData.number_of_items) : null,
        notes: formData.notes,
        invoice_file_url,
        user_id: user.id,
      })

      if (error) throw error

      toast({
        title: "Purchase invoice saved!",
        description: `Invoice #${formData.invoice_number} has been saved successfully`,
      })

      router.push("/purchases")
    } catch (error: any) {
      console.error("Error saving invoice:", error)
      toast({
        title: "Error saving invoice",
        description: error.message || "An error occurred while saving",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Loading state
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Upload Bill Photo</h1>
            <p className="text-sm text-muted-foreground">
              Use AI to automatically extract invoice information from photos
            </p>
          </div>
        </div>

        {/* Info Alert */}
        {!extractedData && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Tips for best results:</strong> Upload a clear photo of a purchase invoice that includes the supplier name, invoice number, date, and total amount. The AI works with printed, handwritten, and digital bills in English, Hindi, or Marathi.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Image Upload */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Bill Image</CardTitle>
                <CardDescription>
                  Take a photo or upload an image of the purchase invoice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageSelected={handleImageSelected}
                  disabled={isExtracting}
                />

                {selectedFile && !extractedData && (
                  <div className="space-y-2 mt-4">
                    <Button
                      onClick={handleExtractBill}
                      disabled={isExtracting}
                      className="w-full"
                      size="lg"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Extracting Information...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Extract Bill Information
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/purchases/invoices/add")}
                      disabled={isExtracting}
                      className="w-full"
                    >
                      Enter Manually Instead
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Extraction Preview */}
            {extractedData && (
              <ExtractionPreview data={extractedData} />
            )}
          </div>

          {/* Right Column - Editable Form */}
          {extractedData && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review & Edit</CardTitle>
                  <CardDescription>
                    Review and modify the extracted information before saving
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="invoice_number">
                        Invoice Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="invoice_number"
                        name="invoice_number"
                        value={formData.invoice_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="invoice_date">
                        Invoice Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="invoice_date"
                        name="invoice_date"
                        type="date"
                        value={formData.invoice_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="supplier_id">Supplier</Label>
                    <Select
                      value={formData.supplier_id}
                      onValueChange={(value) => handleSelectChange("supplier_id", value)}
                    >
                      <SelectTrigger id="supplier_id">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">
                          Create New: {formData.supplier_name}
                        </SelectItem>
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
                            No existing suppliers
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">
                        Amount (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_status">Payment Status</Label>
                      <Select
                        value={formData.payment_status}
                        onValueChange={(value) => handleSelectChange("payment_status", value)}
                      >
                        <SelectTrigger id="payment_status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleSelectChange("status", value)}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Received">Received</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="number_of_items">Number of Items</Label>
                      <Input
                        id="number_of_items"
                        name="number_of_items"
                        type="number"
                        value={formData.number_of_items}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/purchases")}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Invoice
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
