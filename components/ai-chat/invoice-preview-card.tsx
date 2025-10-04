// components/ai-chat/invoice-preview-card.tsx

'use client'

import { InvoiceActionData } from '@/lib/ai/actions/invoice/invoice-action-schema'
import { Separator } from '@/components/ui/separator'

interface InvoicePreviewCardProps {
  data: InvoiceActionData
}

export function InvoicePreviewCard({ data }: InvoicePreviewCardProps) {
  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg border dark:bg-gray-900 overflow-hidden">
      {/* Customer Info */}
      <div>
        <h4 className="font-semibold text-xs mb-1.5 text-gray-700 dark:text-gray-300">Customer</h4>
        <div className="text-xs space-y-0.5">
          <p className="truncate"><span className="font-medium">Name:</span> {data.customerName}</p>
          {data.customerPhone && (
            <p className="truncate"><span className="font-medium">Phone:</span> {data.customerPhone}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Items */}
      <div>
        <h4 className="font-semibold text-xs mb-1.5 text-gray-700 dark:text-gray-300">Items ({data.items.length})</h4>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {data.items.map((item, index) => (
            <div key={index} className="bg-white p-2 rounded border text-xs dark:bg-gray-800">
              <div className="flex justify-between items-start gap-2">
                <span className="font-medium truncate flex-1">{item.name}</span>
                <span className="font-semibold shrink-0">₹{item.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                {item.quantity} × {item.weight}g @ ₹{item.pricePerGram}/g
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{data.subtotal?.toLocaleString('en-IN') || '0'}</span>
        </div>
        <div className="flex justify-between">
          <span>GST ({data.gstPercentage}%):</span>
          <span>₹{data.gstAmount?.toLocaleString('en-IN') || '0'}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-sm pt-1">
          <span>Total:</span>
          <span className="text-amber-600">
            ₹{data.grandTotal?.toLocaleString('en-IN') || '0'}
          </span>
        </div>
      </div>
    </div>
  )
}
