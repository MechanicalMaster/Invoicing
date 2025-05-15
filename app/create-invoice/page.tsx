"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Printer, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useReactToPrint } from "react-to-print"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { InvoicePreview } from "@/app/create-invoice/invoice-preview"
import { toast } from "@/components/ui/use-toast"

// Dynamically import PDF components with ssr: false to ensure they only load on the client
const PDFDownloadLinkWrapper = dynamic(
  () => import("@/app/create-invoice/pdf-download-link-wrapper").then((mod) => mod.PDFDownloadLinkWrapper),
  { ssr: false },
)

export default function CreateInvoicePage() {
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    customerName: "",
    date: new Date().toISOString().split("T")[0],
    itemName: "",
    quantity: 1,
    weight: 0,
    pricePerGram: 6450,
    makingCharges: 0,
    gst: 3,
  })

  // Set isBrowser to true once component mounts
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "customerName" || name === "itemName" ? value : Number(value),
    }))
  }

  const calculateTotal = () => {
    const { quantity, weight, pricePerGram, makingCharges, gst } = formData
    const itemTotal = (quantity * weight * pricePerGram) / 10 // Price per 10 grams
    const subtotal = itemTotal + makingCharges
    const gstAmount = subtotal * (gst / 100)
    return {
      itemTotal: itemTotal.toFixed(2),
      subtotal: subtotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      total: (subtotal + gstAmount).toFixed(2),
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
    return {
      invoiceNumber:
        "INV-" +
        Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0"),
      date: formatDate(formData.date),
      customerName: formData.customerName,
      items: [
        {
          name: formData.itemName,
          quantity: formData.quantity,
          weight: formData.weight,
          pricePerGram: formData.pricePerGram,
          total: Number(calculatedTotals.itemTotal),
        },
      ],
      makingCharges: formData.makingCharges,
      subtotal: Number(calculatedTotals.subtotal),
      gstPercentage: formData.gst,
      gstAmount: Number(calculatedTotals.gstAmount),
      total: Number(calculatedTotals.total),
    }
  }

  // Setup for useReactToPrint hook
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${generateInvoiceData().invoiceNumber}`,
    onBeforeGetContent: async () => {
      // You can perform actions before content is retrieved, e.g., show a loading state
      toast({ title: "Preparing print...", description: "Please wait a moment."})
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay for content rendering
    },
    onAfterPrint: () => toast({ title: "Print successful", description: "Invoice has been sent to printer." }),
    onPrintError: () => toast({ title: "Print Error", description: "Failed to print invoice.", variant: "destructive"}),
  });

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true)
    // This is handled by PDFDownloadLink component
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
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      placeholder="Enter customer name"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="itemName">Jewelry Item Name</Label>
                  <Input
                    id="itemName"
                    name="itemName"
                    placeholder="Enter jewelry item name"
                    value={formData.itemName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (in grams)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter weight in grams"
                      value={formData.weight || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerGram">Price per 10 grams (₹)</Label>
                    <Input
                      id="pricePerGram"
                      name="pricePerGram"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter price per gram"
                      value={formData.pricePerGram}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="makingCharges">Making Charges (₹)</Label>
                    <Input
                      id="makingCharges"
                      name="makingCharges"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter making charges (optional)"
                      value={formData.makingCharges || ""}
                      onChange={handleChange}
                    />
                  </div>
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
                      <span>Item Total:</span>
                      <span>₹{calculateTotal().itemTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Making Charges:</span>
                      <span>₹{formData.makingCharges.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{calculateTotal().subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (3%):</span>
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
