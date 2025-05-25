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
  makingCharges: number
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
  const [customers, setCustomers] = useState<Customer[]>([])
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
        makingCharges: 0,
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
        .select('firm_name, firm_address, firm_phone, firm_gstin, firm_email')
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
          if (field !== "makingCharges") {
            updatedItem.total = calculateItemBaseTotal(
              updatedItem.quantity,
              updatedItem.weight,
              updatedItem.pricePerGram
            ) + updatedItem.makingCharges
          } else {
            updatedItem.total = calculateItemBaseTotal(
              updatedItem.quantity,
              updatedItem.weight,
              updatedItem.pricePerGram
            ) + Number(value)
          }
          
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
          makingCharges: 0,
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
    
    // Sum up all item making charges
    const totalMakingCharges = items.reduce((sum, item) => sum + item.makingCharges, 0)
    
    // Subtotal is the base value of all items
    const subtotal = itemsBaseTotal
    
    // Grand total before GST includes making charges
    const grandTotalBeforeGst = subtotal + totalMakingCharges
    
    // Calculate GST on the grand total
    const gstAmount = grandTotalBeforeGst * (gst / 100)
    
    // Total including GST
    const total = grandTotalBeforeGst + gstAmount
    
    return {
      itemsBaseTotal: itemsBaseTotal.toFixed(2),
      totalMakingCharges: totalMakingCharges.toFixed(2),
      subtotal: subtotal.toFixed(2),
      grandTotalBeforeGst: grandTotalBeforeGst.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      total: total.toFixed(2),
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate customer selection
    if (!formData.selectedCustomerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer for the invoice",
        variant: "destructive",
      })
      return
    }
    
    // Validate at least one item with complete info
    const hasValidItems = formData.items.some(
      (item) => item.name && item.quantity > 0 && item.weight > 0
    )
    
    if (!hasValidItems) {
      toast({
        title: "Item details required",
        description: "Please enter valid item details with name, quantity, and weight",
        variant: "destructive",
      })
      return
    }
    
    setShowPreview(true)
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
    
    // Sum up all making charges from items
    const totalMakingCharges = formData.items.reduce((sum, item) => sum + item.makingCharges, 0)
    
    return {
      invoiceNumber:
        "INV-" +
        Math.floor(Math.random() * 10000)
          .toString()
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
        makingCharges: item.makingCharges,
        total: item.total,
      })),
      makingCharges: totalMakingCharges,
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
                          <div className="space-y-2">
                            <Label htmlFor={`item-making-charges-${item.id}`}>Making Charges (₹)</Label>
                            <Input
                              id={`item-making-charges-${item.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Enter making charges"
                              value={item.makingCharges}
                              onChange={(e) => handleItemChange(item.id, "makingCharges", e.target.value)}
                            />
                          </div>
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
                      <span>Total Making Charges:</span>
                      <span>₹{calculateTotal().totalMakingCharges}</span>
                    </div>
                    <div className="flex justify-between border-b py-1">
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
                <Button variant="outline" type="button" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  <Save className="mr-2 h-4 w-4" />
                  Generate Invoice
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
