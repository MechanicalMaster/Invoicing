"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card"
import { TERMS_AND_CONDITIONS, AGREEMENT_TEXT } from "@/lib/invoice-text";
import { Separator } from "@/components/ui/separator";

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
  customerAddress?: string
  customerPhone?: string
  customerEmail?: string
  firmName: string
  firmAddress: string
  firmPhone: string
  firmGstin: string
  items: InvoiceItem[]
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
        {/* Header Section */}
        <div className="relative bg-blue-50 p-6">
          {/* Colored Band */}
          <div className="absolute inset-0 bg-blue-50 z-0"></div>
          
          <div className="flex flex-col items-center justify-center space-y-2 text-center relative z-10">
            <p className="text-center text-red-800 font-bold tracking-wide text-lg mb-1">TAX INVOICE</p>
            <h1 className="text-3xl font-bold tracking-tight text-red-800 uppercase">{invoiceData.firmName}</h1>
            <p className="text-sm font-medium uppercase tracking-wide">Premium Jewelry</p>
            <p className="text-xs text-muted-foreground">{invoiceData.firmAddress}</p>
            <p className="text-xs text-muted-foreground">GSTIN: {invoiceData.firmGstin} | HSN: 7113 | Phone: {invoiceData.firmPhone}</p>
            
            <div className="w-full flex justify-between py-2 mt-2 border-t border-b border-gray-400 text-sm">
              <span>Bill No.: {invoiceData.invoiceNumber}</span>
              <span>Date: {invoiceData.date}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Customer Info Section */}
          <div className="mb-6 rounded-none border p-4">
            <div className="grid grid-cols-6 gap-1">
              <div className="col-span-1 font-medium text-sm">M/s.</div>
              <div className="col-span-5 text-sm">{invoiceData.customerName}</div>
              
              {invoiceData.customerAddress && (
                <>
                  <div className="col-span-1 font-medium text-sm">Address:</div>
                  <div className="col-span-5 text-sm">{invoiceData.customerAddress}</div>
                </>
              )}
              
              {invoiceData.customerPhone && (
                <>
                  <div className="col-span-1 font-medium text-sm">Phone:</div>
                  <div className="col-span-5 text-sm">{invoiceData.customerPhone}</div>
                </>
              )}
              
              {invoiceData.customerEmail && (
                <>
                  <div className="col-span-1 font-medium text-sm">Email:</div>
                  <div className="col-span-5 text-sm">{invoiceData.customerEmail}</div>
                </>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 p-2 text-sm font-medium text-center" style={{ width: "35%" }}>Item</th>
                  <th className="border border-gray-400 p-2 text-sm font-medium text-center" style={{ width: "10%" }}>Qty</th>
                  <th className="border border-gray-400 p-2 text-sm font-medium text-center" style={{ width: "15%" }}>Weight (g)</th>
                  <th className="border border-gray-400 p-2 text-sm font-medium text-center" style={{ width: "20%" }}>Price/10g (₹)</th>
                  <th className="border border-gray-400 p-2 text-sm font-medium text-center" style={{ width: "20%" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-400 p-2 text-sm">{item.name}</td>
                    <td className="border border-gray-400 p-2 text-sm text-center">{item.quantity}</td>
                    <td className="border border-gray-400 p-2 text-sm text-right">{item.weight.toFixed(3)}</td>
                    <td className="border border-gray-400 p-2 text-sm text-right">{(item.pricePerGram * 10).toFixed(2)}</td>
                    <td className="border border-gray-400 p-2 text-sm text-right">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="mb-6 flex justify-end">
            <div className="w-1/2 space-y-1">
              <div className="flex justify-between border-b py-1 text-sm">
                <span>Subtotal (Items Value):</span>
                <span>₹{invoiceData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b py-1 text-sm">
                <span>GST ({invoiceData.gstPercentage}%):</span>
                <span>₹{invoiceData.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-b border-black py-2 font-bold">
                <span>GRAND TOTAL:</span>
                <span>₹{invoiceData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-8 border p-4">
            <div className="border-t border-dotted mb-2"></div>
            <p className="text-center font-bold mb-2">Thank You! Visit Again!</p>
            
            <h4 className="text-sm font-bold underline mb-2">Terms & Conditions:</h4>
            <ol className="text-xs text-muted-foreground pl-5 space-y-1">
              {TERMS_AND_CONDITIONS.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ol>
            
            <p className="mt-3 text-xs text-center">{AGREEMENT_TEXT}</p>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm">Customer Signature:</p>
                <div className="mt-8 border-t border-gray-400"></div>
                <p className="text-sm">({invoiceData.customerName})</p>
              </div>
              <div className="text-right">
                <p className="text-sm">For {invoiceData.firmName}:</p>
                <div className="mt-8 border-t border-gray-400"></div>
                <p className="text-sm">(Authorised Signatory)</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between text-xs italic">
              <span>E. & O. E.</span>
              <span>This is a computer-generated invoice.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
});

InvoicePreview.displayName = "InvoicePreview";
