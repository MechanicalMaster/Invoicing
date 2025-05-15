"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Home, Save, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { DatePicker } from "@/app/bookings/create/date-picker"

export default function CreateBookingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    bookingDate: new Date(),
    expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    itemDescription: "",
    estimatedAmount: 0,
    advanceAmount: 0,
    paymentMethod: "cash",
    notes: "",
  })

  const [items, setItems] = useState([{ id: 1, name: "", description: "", estimatedPrice: 0 }])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "estimatedAmount" || name === "advanceAmount" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateChange = (name: string, date: Date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }))
  }

  const handleItemChange = (id: number, field: string, value: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === "estimatedPrice" ? Number.parseFloat(value) || 0 : value,
          }
        }
        return item
      }),
    )

    // Update total estimated amount
    if (field === "estimatedPrice") {
      const totalEstimated = items
        .map((item) => (item.id === id ? Number.parseFloat(value) || 0 : item.estimatedPrice))
        .reduce((sum, price) => sum + price, 0)

      setFormData((prev) => ({
        ...prev,
        estimatedAmount: totalEstimated,
      }))
    }
  }

  const addItem = () => {
    const newId = Math.max(0, ...items.map((item) => item.id)) + 1
    setItems([...items, { id: newId, name: "", description: "", estimatedPrice: 0 }])
  }

  const removeItem = (id: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((item) => item.id !== id)
      setItems(updatedItems)

      // Update total estimated amount
      const totalEstimated = updatedItems.reduce((sum, item) => sum + item.estimatedPrice, 0)
      setFormData((prev) => ({
        ...prev,
        estimatedAmount: totalEstimated,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.customerName || !formData.customerPhone || items[0].name === "") {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (formData.advanceAmount <= 0) {
      toast({
        title: "Invalid advance amount",
        description: "Advance amount must be greater than zero.",
        variant: "destructive",
      })
      return
    }

    if (formData.advanceAmount > formData.estimatedAmount) {
      toast({
        title: "Invalid advance amount",
        description: "Advance amount cannot be greater than the estimated amount.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would submit the form data to your API here
    toast({
      title: "Booking created",
      description: "The booking has been created successfully.",
    })

    // Redirect to bookings page
    router.push("/bookings")
  }

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
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">Create New Booking</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Enter the customer's details for this booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    placeholder="Enter customer's name"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    placeholder="Enter customer's phone number"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    placeholder="Enter customer's email address"
                    value={formData.customerEmail}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>Enter the booking dates and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bookingDate">Booking Date</Label>
                    <DatePicker date={formData.bookingDate} setDate={(date) => handleDateChange("bookingDate", date)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                    <DatePicker
                      date={formData.expectedDeliveryDate}
                      setDate={(date) => handleDateChange("expectedDeliveryDate", date)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemDescription">General Description</Label>
                  <Textarea
                    id="itemDescription"
                    name="itemDescription"
                    placeholder="Enter a general description of the items being booked"
                    value={formData.itemDescription}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Item Details */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Item Details</CardTitle>
                    <CardDescription>Enter the details of the items being booked</CardDescription>
                  </div>
                  <Button type="button" onClick={addItem} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {items.map((item, index) => (
                  <div key={item.id} className="space-y-4 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Item {index + 1}</h3>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`item-name-${item.id}`}>
                          Item Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`item-name-${item.id}`}
                          placeholder="Enter item name"
                          value={item.name}
                          onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`item-price-${item.id}`}>
                          Estimated Price (₹) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`item-price-${item.id}`}
                          type="number"
                          placeholder="Enter estimated price"
                          value={item.estimatedPrice || ""}
                          onChange={(e) => handleItemChange(item.id, "estimatedPrice", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-description-${item.id}`}>Description</Label>
                      <Textarea
                        id={`item-description-${item.id}`}
                        placeholder="Enter item description"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                <div className="rounded-lg bg-muted p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Estimated Amount:</span>
                      <span>₹{formData.estimatedAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Enter the advance payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="advanceAmount">
                      Advance Amount (₹) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="advanceAmount"
                      name="advanceAmount"
                      type="number"
                      placeholder="Enter advance amount"
                      value={formData.advanceAmount || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <RadioGroup
                      defaultValue="cash"
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash">Cash</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card">Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi">UPI</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank">Bank Transfer</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Enter any additional notes or special requirements"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Estimated Amount:</span>
                      <span>₹{formData.estimatedAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Advance Amount:</span>
                      <span>₹{formData.advanceAmount.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Balance Due:</span>
                      <span>₹{(formData.estimatedAmount - formData.advanceAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href="/dashboard">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" />
                  Create Booking
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </main>
    </div>
  )
}
