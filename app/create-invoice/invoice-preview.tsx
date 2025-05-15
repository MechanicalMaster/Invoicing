"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card"

interface InvoiceItem {
  name: string
  quantity: number
  weight: number
  pricePerGram: number
  total: number
}

export interface InvoiceData {
  invoiceNumber: string
  date: string
  customerName: string
  items: InvoiceItem[]
  makingCharges: number
  subtotal: number
  gstPercentage: number
  gstAmount: number
  total: number
}

interface InvoicePreviewProps {
  invoiceData: InvoiceData
}

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(({ invoiceData }, ref) => {
  return (
    <Card className="overflow-hidden border-2" ref={ref}>
      <CardContent className="p-0">
        <div className="bg-primary/5 p-6">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Sethiya Gold</h1>
            <p className="text-lg font-medium">Premium Jewelry</p>
            <p className="text-sm text-muted-foreground">123 Jewelry Lane, Mumbai, Maharashtra, 400001</p>
            <p className="text-sm text-muted-foreground">GSTIN: 27AABCT3518Q1ZV | Phone: +91 98765 43210</p>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-lg border bg-background p-4 sm:flex-row">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invoice To:</p>
              <p className="font-medium">{invoiceData.customerName}</p>
            </div>
            <div className="space-y-1 text-right">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice Number:</p>
                <p className="font-medium">{invoiceData.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date:</p>
                <p className="font-medium">{invoiceData.date}</p>
              </div>
            </div>
          </div>

          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2 text-sm font-medium">Item</th>
                  <th className="p-2 text-sm font-medium">Qty</th>
                  <th className="p-2 text-sm font-medium">Weight (g)</th>
                  <th className="p-2 text-sm font-medium">Price/10g (₹)</th>
                  <th className="p-2 text-right text-sm font-medium">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">{item.weight.toFixed(2)}</td>
                    <td className="p-2">{item.pricePerGram.toFixed(2)}</td>
                    <td className="p-2 text-right">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between border-b py-1">
                <span>Subtotal:</span>
                <span>₹{invoiceData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span>Making Charges:</span>
                <span>₹{invoiceData.makingCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span>GST ({invoiceData.gstPercentage}%):</span>
                <span>₹{invoiceData.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span>Total:</span>
                <span>₹{invoiceData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-center text-sm">
            <p className="font-medium">Thank you for shopping with Sethiya Gold!</p>
            <p className="text-muted-foreground">
              For any queries related to this invoice, please contact us at info@sethiyagold.com
            </p>
            <p className="text-xs text-muted-foreground">
              This is a computer-generated invoice and does not require a physical signature.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
});

InvoicePreview.displayName = "InvoicePreview";
