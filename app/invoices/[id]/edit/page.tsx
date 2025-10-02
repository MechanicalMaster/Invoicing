"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"

interface InvoiceItem {
  id: string
  name: string
  quantity: number
  weight: number
  pricePerGram: number
  total: number
  // For tracking database items
  isExisting: boolean
  isDeleted?: boolean
}

export default function EditInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [invoiceItemsData, setInvoiceItemsData] = useState<InvoiceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    items: [] as InvoiceItem[],
    gst: 3,
    notes: "",
  })

  // Fetch invoice data when component mounts
  useEffect(() => {
    if (user && params.id) {
      fetchInvoiceData()
    }
  }, [user, params.id])

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to edit this invoice",
        variant: "destructive",
      })
    }
  }, [user, authLoading, router])

  // Fetch invoice and its items
  const fetchInvoiceData = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Fetch invoice
      if (!params.id) {
        throw new Error('Invoice ID is required')
      }

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()
      
      if (invoiceError) throw invoiceError
      
      if (!invoiceData) {
        toast({
          title: "Invoice not found",
          description: "The requested invoice could not be found",
          variant: "destructive",
        })
        router.push("/invoices")
        return
      }
      
      setInvoiceData(invoiceData)
      
      // Fetch invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', params.id)
        .order('created_at', { ascending: true })
      
      if (itemsError) throw itemsError
      
      // Convert database items to form items
      const convertedItems = (itemsData || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        pricePerGram: item.price_per_gram,
        total: item.total,
        isExisting: true
      }))
      
      setInvoiceItemsData(convertedItems)
      
      // Set form data
      setFormData({
        date: invoiceData.invoice_date,
        items: convertedItems,
        gst: invoiceData.gst_percentage,
        notes: invoiceData.notes || "",
      })
    } catch (error: any) {
      console.error("Error fetching invoice:", error)
      toast({
        title: "Error loading invoice",
        description: error.message || "Could not load invoice details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input changes for non-item fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
          pricePerGram: prev.items.length > 0 ? prev.items[0].pricePerGram : 6450,
          total: 0,
          isExisting: false
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
    
    setFormData((prev) => {
      const itemToRemove = prev.items.find(item => item.id === itemId)
      
      if (itemToRemove?.isExisting) {
        // For existing items, mark as deleted but keep in the array for tracking
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId 
              ? { ...item, isDeleted: true } 
              : item
          )
        }
      } else {
        // For new items, just remove from the array
        return {
          ...prev,
          items: prev.items.filter((item) => item.id !== itemId),
        }
      }
    })
  }

  // Calculate base total for a single item
  const calculateItemBaseTotal = (quantity: number, weight: number, pricePerGram: number) => {
    return (quantity * weight * pricePerGram) / 10 // Price per 10 grams
  }

  // Calculate overall totals
  const calculateTotal = () => {
    const { items, gst } = formData
    
    // Only include non-deleted items in calculations
    const activeItems = items.filter(item => !item.isDeleted)
    
    // Calculate base value (gold value) for all items
    const itemsBaseTotal = activeItems.reduce((sum, item) => 
      sum + calculateItemBaseTotal(item.quantity, item.weight, item.pricePerGram), 0
    )
    
    // Subtotal is the base value of all items
    const subtotal = itemsBaseTotal
    
    // Grand total before GST
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

  // Handle form submission for updating invoice
  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !invoiceData) {
      toast({
        title: "Error",
        description: "User not authenticated or invoice data missing",
        variant: "destructive",
      })
      return
    }
    
    // Validate that we have at least one valid item
    const activeItems = formData.items.filter(item => !item.isDeleted)
    
    if (activeItems.length === 0 || activeItems.some(item => !item.name.trim() || item.quantity <= 0 || item.weight <= 0)) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required item fields with valid values",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSaving(true)
      
      // Calculate totals
      const calculatedTotals = calculateTotal()
      
      // 1. Update the main invoice record
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          invoice_date: formData.date,
          notes: formData.notes,
          subtotal: Number(calculatedTotals.subtotal),
          gst_percentage: formData.gst,
          gst_amount: Number(calculatedTotals.gstAmount),
          grand_total: Number(calculatedTotals.total),
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceData.id)
        .eq('user_id', user.id)
      
      if (invoiceError) throw invoiceError
      
      // 2. Handle invoice items
      
      // 2.1 Update existing items that were modified
      const itemsToUpdate = formData.items.filter(item => 
        item.isExisting && !item.isDeleted
      )
      
      for (const item of itemsToUpdate) {
        const { error: updateError } = await supabase
          .from('invoice_items')
          .update({
            name: item.name,
            quantity: item.quantity,
            weight: item.weight,
            price_per_gram: item.pricePerGram,
            total: item.total
          })
          .eq('id', item.id)
          .eq('user_id', user.id)
        
        if (updateError) throw updateError
      }
      
      // 2.2 Delete items that were removed
      const itemsToDelete = formData.items.filter(item => 
        item.isExisting && item.isDeleted
      )
      
      for (const item of itemsToDelete) {
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('id', item.id)
          .eq('user_id', user.id)
        
        if (deleteError) throw deleteError
      }
      
      // 2.3 Insert new items
      const itemsToInsert = formData.items
        .filter(item => !item.isExisting && !item.isDeleted)
        .map(item => ({
          invoice_id: invoiceData.id,
          user_id: user.id,
          name: item.name,
          quantity: item.quantity,
          weight: item.weight,
          price_per_gram: item.pricePerGram,
          total: item.total
        }))
      
      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert)
        
        if (insertError) throw insertError
      }
      
      // Success message and redirect
      toast({
        title: "Invoice updated",
        description: "The invoice has been successfully updated.",
        variant: "default",
      })
      
      // Navigate to invoice detail page
      router.push(`/invoices/${invoiceData.id}`)
    } catch (error: any) {
      console.error("Error updating invoice:", error)
      toast({
        title: "Error updating invoice",
        description: error.message || "An error occurred while updating the invoice.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state or nothing while checking authentication
  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }
  
  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center">
        <Link href={`/invoices/${params.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Invoice
          </Button>
        </Link>
        <h1 className="ml-4 text-xl font-semibold md:text-2xl">Loading Invoice...</h1>
      </div>
    )
  }

  return (
    <div className="flex items-center flex-col gap-4">
      <div className="flex items-center self-start w-full">
        <Link href={`/invoices/${params.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Invoice
          </Button>
        </Link>
        <h1 className="ml-4 text-xl font-semibold md:text-2xl">Edit Invoice #{invoiceData?.invoice_number}</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Edit the invoice information below</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateInvoice}>
          <CardContent className="space-y-6">
            {/* Customer Info - Read Only */}
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">{invoiceData?.customer_name_snapshot}</p>
              {invoiceData?.customer_address_snapshot && (
                <p className="text-muted-foreground">{invoiceData?.customer_address_snapshot}</p>
              )}
              <p className="text-muted-foreground">
                {invoiceData?.customer_phone_snapshot && `Phone: ${invoiceData?.customer_phone_snapshot}`}
                {invoiceData?.customer_phone_snapshot && invoiceData?.customer_email_snapshot && " | "}
                {invoiceData?.customer_email_snapshot && `Email: ${invoiceData?.customer_email_snapshot}`}
              </p>
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <Label htmlFor="date">Invoice Date</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                value={formData.date} 
                onChange={handleChange} 
                required 
              />
            </div>

            <Separator />

            {/* Items Section */}
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
                  Add Item
                </Button>
              </div>

              {formData.items
                .filter(item => !item.isDeleted)
                .map((item, index) => (
                <div key={item.id} className="rounded-md border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={formData.items.filter(i => !i.isDeleted).length <= 1}
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

            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes or instructions"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* GST Field - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="gst">GST (%)</Label>
              <Input
                id="gst"
                name="gst"
                type="number"
                step="0.01"
                min="0"
                value={formData.gst}
                disabled
              />
              <p className="text-sm text-muted-foreground">GST for jewelry is fixed at 3%</p>
            </div>

            {/* Totals Display */}
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
            <Button variant="outline" type="button" onClick={() => router.push(`/invoices/${params.id}`)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={isSaving}>
              {isSaving ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 