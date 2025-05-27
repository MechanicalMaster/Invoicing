"use client"

import type React from "react"
import { v4 as uuidv4 } from "uuid"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Printer, Save, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useReactToPrint } from "react-to-print"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InvoicePreview } from "@/app/create-invoice/invoice-preview"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"
import { AddCustomerModal } from "@/app/create-invoice/components/add-customer-modal"

// Dynamically import PDF components with ssr: false to ensure they only load on the client
const PDFDownloadLinkWrapper = dynamic(
  () => import("@/app/create-invoice/pdf-download-link-wrapper").then((mod) => mod.PDFDownloadLinkWrapper),
  { ssr: false },
)

// Item interface for form state
interface InvoiceItem {
  id: string
  name: string
  quantity: number
  weight: number
  pricePerGram: number
  total: number
}

// Customer interface
interface Customer {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [showPreview, setShowPreview] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoicePrefix, setInvoicePrefix] = useState("INV-")
  const [invoiceNextNumber, setInvoiceNextNumber] = useState(1)
  const [firmDetails, setFirmDetails] = useState({
    firmName: "Sethiya Gold",
    firmAddress: "123 Jewelry Lane, Mumbai, Maharashtra, 400001",
    firmPhone: "+91 98765 43210",
    firmGstin: "27AABCT3518Q1ZV"
  })
  
  const invoiceRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState({
    selectedCustomerId: "",
    selectedCustomerDetails: null as Customer | null,
    date: new Date().toISOString().split("T")[0],
    items: [
      {
        id: uuidv4(),
        name: "",
        quantity: 1,
        weight: 0,
        pricePerGram: 6450,
        total: 0,
      },
    ] as InvoiceItem[],
    gst: 3,
  })

  // Set isBrowser to true once component mounts and fetch customers and firm details
  useEffect(() => {
    setIsBrowser(true)
    if (user) {
      fetchCustomers()
      fetchFirmDetails()
    } else {
      setIsLoading(false)
    }
  }, [user])

  // Fetch customers from Supabase
  const fetchCustomers = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, phone, email')
        .eq('user_id', user.id)
        .order('name')
      
      if (error) throw error
      
      setCustomers(data || [])
    } catch (error: any) {
      toast({
        title: "Error loading customers",
        description: error.message || "Could not load customers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch firm details from user settings
  const fetchFirmDetails = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('firm_name, firm_address, firm_phone, firm_gstin, firm_email, invoice_default_prefix, invoice_next_number')
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        console.error("Error fetching firm details:", error)
        return // Use default values set in state
      }
      
      if (data) {
        setFirmDetails({
          firmName: data.firm_name || "Sethiya Gold",
          firmAddress: data.firm_address || "123 Jewelry Lane, Mumbai, Maharashtra, 400001",
          firmPhone: data.firm_phone || "+91 98765 43210",
          firmGstin: data.firm_gstin || "27AABCT3518Q1ZV"
        })
        
        // Set invoice prefix and next number
        if (data.invoice_default_prefix) {
          setInvoicePrefix(data.invoice_default_prefix)
        }
        
        if (data.invoice_next_number) {
          setInvoiceNextNumber(data.invoice_next_number)
        }
      }
    } catch (error: any) {
      console.error("Error fetching firm details:", error)
    }
  }

  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    if (customerId === "add_new_customer") {
      // This is handled by the AddCustomerModal component
      return
    }
    
    const selectedCustomer = customers.find((c) => c.id === customerId) || null
    
    setFormData((prev) => ({
      ...prev,
      selectedCustomerId: customerId,
      selectedCustomerDetails: selectedCustomer,
    }))
  }

  // Handle new customer added via modal
  const handleCustomerAdded = (newCustomer: any) => {
    const customerObj = {
      id: newCustomer.id,
      name: newCustomer.name,
      address: newCustomer.address,
      phone: newCustomer.phone,
      email: newCustomer.email,
    }
    
    // Add to customers list
    setCustomers((prev) => [...prev, customerObj])
    
    // Select the new customer
    setFormData((prev) => ({
      ...prev,
      selectedCustomerId: newCustomer.id,
      selectedCustomerDetails: customerObj,
    }))
  }

  // Handle input changes for non-item fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "date" ? value : Number(value),
    }))
  }
  
  // Handle item field changes
  const handleItemChange = (itemId: string, field: string, value: string | number) => {
    setFormData((prev) => {
      const newItems = prev.items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            [field]: field === "name" ? value : Number(value),
          }
          
          // Recalculate total for this item
          updatedItem.total = calculateItemBaseTotal(
            updatedItem.quantity,
            updatedItem.weight,
            updatedItem.pricePerGram
          )
          
          return updatedItem
        }
        return item
      })
      
      return { ...prev, items: newItems }
    })
  }
  
  // Add a new item to the list
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: uuidv4(),
          name: "",
          quantity: 1,
          weight: 0,
          pricePerGram: prev.items[0]?.pricePerGram || 6450, // Use the price from the first item or default
          total: 0,
        },
      ],
    }))
  }
  
  // Remove an item from the list
  const removeItem = (itemId: string) => {
    // Don't remove if it's the last item
    if (formData.items.length <= 1) {
      return
    }
    
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }

  // Calculate base total for a single item (without making charges)
  const calculateItemBaseTotal = (quantity: number, weight: number, pricePerGram: number) => {
    return (quantity * weight * pricePerGram) / 10 // Price per 10 grams
  }

  // Calculate overall totals
  const calculateTotal = () => {
    const { items, gst } = formData
    
    // Calculate base value (gold value) for all items
    const itemsBaseTotal = items.reduce((sum, item) => 
      sum + calculateItemBaseTotal(item.quantity, item.weight, item.pricePerGram), 0
    )
    
    // Subtotal is the base value of all items
    const subtotal = itemsBaseTotal
    
    // Grand total before GST is the same as subtotal since we no longer have making charges
    const grandTotalBeforeGst = subtotal
    
    // Calculate GST on the grand total
    const gstAmount = grandTotalBeforeGst * (gst / 100)
    
    // Total including GST
    const total = grandTotalBeforeGst + gstAmount
    
    return {
      itemsBaseTotal: itemsBaseTotal.toFixed(2),
      subtotal: subtotal.toFixed(2),
      grandTotalBeforeGst: grandTotalBeforeGst.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      total: total.toFixed(2),
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if any item is invalid
    if (formData.items.some(item => !item.name.trim() || item.quantity <= 0 || item.weight <= 0)) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required item fields with valid values",
        variant: "destructive",
      })
      return
    }
    
    // Validate customer selection
    if (!formData.selectedCustomerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer for the invoice",
        variant: "destructive",
      })
      return
    }
    
    // If customer ID is "add_new_customer" but we don't have a name, show error
    if (formData.selectedCustomerId === "add_new_customer" && (!formData.selectedCustomerDetails || !formData.selectedCustomerDetails.name.trim())) {
      toast({
        title: "Customer name required",
        description: "Please enter a name for the new customer",
        variant: "destructive",
      })
      return
    }
    
    // Save invoice to database before showing preview
    handleSaveInvoice().then(() => {
      setShowPreview(true)
    }).catch(error => {
      toast({
        title: "Error saving invoice",
        description: error.message || "Failed to save the invoice to the database",
        variant: "destructive",
      })
    })
  }

  // Save invoice data to Supabase
  const saveInvoiceToDB = async () => {
    if (!user) {
      throw new Error("User not authenticated")
    }
    
    try {
      setIsSaving(true)
      
      const invoiceData = generateInvoiceData()
      const calculatedTotals = calculateTotal()
      const customer = formData.selectedCustomerDetails
      
      // Insert the main invoice record
      const { data: invoiceRecord, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          customer_id: formData.selectedCustomerId !== "add_new_customer" ? formData.selectedCustomerId : null,
          invoice_number: invoiceData.invoiceNumber,
          invoice_date: new Date(formData.date).toISOString().split('T')[0],
          status: 'finalized',
          customer_name_snapshot: customer?.name || "Customer",
          customer_address_snapshot: customer?.address || null,
          customer_phone_snapshot: customer?.phone || null,
          customer_email_snapshot: customer?.email || null,
          firm_name_snapshot: firmDetails.firmName,
          firm_address_snapshot: firmDetails.firmAddress,
          firm_phone_snapshot: firmDetails.firmPhone,
          firm_gstin_snapshot: firmDetails.firmGstin,
          subtotal: Number(calculatedTotals.subtotal),
          gst_percentage: formData.gst,
          gst_amount: Number(calculatedTotals.gstAmount),
          grand_total: Number(calculatedTotals.total)
        })
        .select('id')
        .single()
      
      if (invoiceError) {
        throw new Error(`Error saving invoice: ${invoiceError.message}`)
      }
      
      if (!invoiceRecord) {
        throw new Error("Failed to create invoice record")
      }
      
      // Now insert all the invoice items
      const invoiceItems = formData.items.map(item => ({
        invoice_id: invoiceRecord.id,
        user_id: user.id,
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        price_per_gram: item.pricePerGram,
        total: item.total
      }))
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)
      
      if (itemsError) {
        throw new Error(`Error saving invoice items: ${itemsError.message}`)
      }
      
      // Update the invoice_next_number in user_settings
      const { error: updateError } = await supabase
        .from('user_settings')
        .update({ invoice_next_number: invoiceNextNumber + 1 })
        .eq('user_id', user.id)
      
      if (updateError) {
        console.error(`Error updating invoice number: ${updateError.message}`)
        // Continue anyway, as the invoice is already saved
      } else {
        // Update local state for next invoice
        setInvoiceNextNumber(invoiceNextNumber + 1)
      }
      
      toast({
        title: "Invoice saved",
        description: `Invoice ${invoiceData.invoiceNumber} has been successfully saved.`,
        variant: "default",
      })
      
      return invoiceRecord.id
    } catch (error: any) {
      console.error("Error saving invoice:", error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/")
  }

  const generateInvoiceData = () => {
    const calculatedTotals = calculateTotal()
    const customer = formData.selectedCustomerDetails || { 
      name: "Customer", 
      address: undefined,
      phone: undefined,
      email: undefined 
    }
    
    return {
      invoiceNumber:
        invoicePrefix +
        invoiceNextNumber.toString()
          .padStart(4, "0"),
      date: formatDate(formData.date),
      customerName: customer.name,
      customerAddress: customer.address,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      firmName: firmDetails.firmName,
      firmAddress: firmDetails.firmAddress,
      firmPhone: firmDetails.firmPhone,
      firmGstin: firmDetails.firmGstin,
      items: formData.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        pricePerGram: item.pricePerGram,
        total: item.total,
      })),
      subtotal: Number(calculatedTotals.subtotal),
      gstPercentage: formData.gst,
      gstAmount: Number(calculatedTotals.gstAmount),
      total: Number(calculatedTotals.total),
    }
  }

  // Handle printing
  const handlePrint = useReactToPrint({
    // @ts-ignore - TypeScript definition seems incomplete
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${generateInvoiceData().invoiceNumber}`,
  });

  const handleSaveInvoice = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save an invoice",
        variant: "destructive",
      })
      return
    }
    
    // Validate required fields
    if (formData.items.some(item => !item.name.trim() || item.quantity <= 0 || item.weight <= 0)) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required item fields with valid values",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSaving(true)
      
      const id = await saveInvoiceToDB()
      
      toast({
        title: "Invoice saved",
        description: "The invoice has been successfully saved.",
        variant: "default",
      })
      
      // Navigate to invoice detail page
      router.push(`/invoices/${id}`)
    } catch (error: any) {
      console.error("Error saving invoice:", error)
      toast({
        title: "Error saving invoice",
        description: error.message || "An error occurred while saving the invoice.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle previewing the invoice
  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if any item is invalid
    if (formData.items.some(item => !item.name.trim() || item.quantity <= 0 || item.weight <= 0)) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required item fields with valid values",
        variant: "destructive",
      })
      return
    }
    
    // If customer ID is "add_new_customer" but we don't have a name, show error
    if (formData.selectedCustomerId === "add_new_customer" && (!formData.selectedCustomerDetails || !formData.selectedCustomerDetails.name.trim())) {
      toast({
        title: "Customer name required",
        description: "Please enter a name for the new customer",
        variant: "destructive",
      })
      return
    }
    
    setShowPreview(true)
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-amber-500" />
          <span className="text-xl">Sethiya Gold</span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">Create New Invoice</h1>
        </div>

        {!showPreview ? (
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Fill in the details to create a new invoice</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select 
                      value={formData.selectedCustomerId} 
                      onValueChange={handleCustomerChange}
                    >
                      <SelectTrigger id="customer">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Customers</SelectLabel>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="add_new_customer">
                            <span className="text-primary">+ Add New Customer</span>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formData.selectedCustomerId === "add_new_customer" && (
                      <AddCustomerModal onCustomerAdded={handleCustomerAdded} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                  </div>
                </div>

                {formData.selectedCustomerDetails && (
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{formData.selectedCustomerDetails.name}</p>
                    {formData.selectedCustomerDetails.address && (
                      <p className="text-muted-foreground">{formData.selectedCustomerDetails.address}</p>
                    )}
                    <p className="text-muted-foreground">
                      {formData.selectedCustomerDetails.phone && `Phone: ${formData.selectedCustomerDetails.phone}`}
                      {formData.selectedCustomerDetails.phone && formData.selectedCustomerDetails.email && " | "}
                      {formData.selectedCustomerDetails.email && `Email: ${formData.selectedCustomerDetails.email}`}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Jewelry Items</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addItem}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  {formData.items.map((item, index) => (
                    <div key={item.id} className="rounded-md border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={formData.items.length <= 1}
                          className="h-8 w-8 rounded-full p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`item-name-${item.id}`}>Jewelry Item Name</Label>
                          <Input
                            id={`item-name-${item.id}`}
                            value={item.name}
                            onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                            placeholder="Enter jewelry item name"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor={`item-quantity-${item.id}`}>Quantity</Label>
                            <Input
                              id={`item-quantity-${item.id}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-weight-${item.id}`}>Weight (in grams)</Label>
                            <Input
                              id={`item-weight-${item.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Enter weight in grams"
                              value={item.weight || ""}
                              onChange={(e) => handleItemChange(item.id, "weight", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-price-${item.id}`}>Price per 10 grams (₹)</Label>
                            <Input
                              id={`item-price-${item.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Enter price per 10 grams"
                              value={item.pricePerGram}
                              onChange={(e) => handleItemChange(item.id, "pricePerGram", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2 flex flex-col justify-end">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Base Value: ₹{calculateItemBaseTotal(item.quantity, item.weight, item.pricePerGram).toFixed(2)}</div>
                              <div className="font-medium">Item Total: ₹{item.total.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gst">GST (%)</Label>
                  <Input
                    id="gst"
                    name="gst"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.gst}
                    onChange={handleChange}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">GST for jewelry is fixed at 3%</p>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Items Base Total:</span>
                      <span>₹{calculateTotal().itemsBaseTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal (Before GST):</span>
                      <span>₹{calculateTotal().grandTotalBeforeGst}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({formData.gst}%):</span>
                      <span>₹{calculateTotal().gstAmount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span>₹{calculateTotal().total}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.push("/dashboard")} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Invoice...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Generate Invoice
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Edit Invoice
              </Button>
              <div className="flex gap-2">
                {isBrowser && (
                  <>
                    <Button variant="outline" onClick={handlePrint}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print Invoice
                    </Button>
                  </>
                )}
                <PDFDownloadLinkWrapper
                  invoiceData={generateInvoiceData()}
                  onStartGeneration={() => setIsGeneratingPDF(true)}
                  onFinishGeneration={() => setIsGeneratingPDF(false)}
                />
              </div>
            </div>

            <div ref={invoiceRef}>
              <InvoicePreview invoiceData={generateInvoiceData()} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
