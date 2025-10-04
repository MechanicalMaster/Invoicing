// components/ai-chat/invoice-preview-card.tsx

'use client'

import { InvoiceActionData } from '@/lib/ai/actions/invoice/invoice-action-schema'
import { Separator } from '@/components/ui/separator'

interface InvoicePreviewCardProps {
  data: InvoiceActionData
}

export function InvoicePreviewCard({ data }: InvoicePreviewCardProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border dark:bg-gray-900">
      {/* Customer Info */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Customer Details</h4>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Name:</span> {data.customerName}</p>
          {data.customerPhone && (
            <p><span className="font-medium">Phone:</span> {data.customerPhone}</p>
          )}
          {data.customerEmail && (
            <p><span className="font-medium">Email:</span> {data.customerEmail}</p>
          )}
          {data.customerAddress && (
            <p><span className="font-medium">Address:</span> {data.customerAddress}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Items */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Items ({data.items.length})</h4>
        <div className="space-y-2">
          {data.items.map((item, index) => (
            <div key={index} className="bg-white p-3 rounded border text-sm dark:bg-gray-800">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium">{item.name}</span>
                <span className="font-semibold">₹{item.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs text-gray-600 space-y-0.5 dark:text-gray-400">
                <p>Quantity: {item.quantity} | Weight: {item.weight}g | Rate: ₹{item.pricePerGram}/g</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{data.subtotal?.toLocaleString('en-IN') || '0'}</span>
        </div>
        <div className="flex justify-between">
          <span>GST ({data.gstPercentage}%):</span>
          <span>₹{data.gstAmount?.toLocaleString('en-IN') || '0'}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>Grand Total:</span>
          <span className="text-amber-600">
            ₹{data.grandTotal?.toLocaleString('en-IN') || '0'}
          </span>
        </div>
      </div>
    </div>
  )
}
