// lib/ai/actions/invoice/invoice-action-schema.ts

import { z } from 'zod'

export const InvoiceItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  weight: z.number().positive('Weight must be positive'),
  pricePerGram: z.number().positive('Price per gram must be positive'),
  total: z.number().positive('Total must be positive'),
})

export const InvoiceActionDataSchema = z.object({
  // Customer info
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerAddress: z.string().optional(),
  customerId: z.string().uuid().optional(), // If existing customer

  // Invoice details
  invoiceDate: z.date().or(z.string()).default(new Date()),
  gstPercentage: z.number().min(0).max(100).default(3),

  // Items
  items: z.array(InvoiceItemSchema).min(1, 'At least one item is required'),

  // Computed fields (calculated from items)
  subtotal: z.number().optional(),
  gstAmount: z.number().optional(),
  grandTotal: z.number().optional(),
})

export type InvoiceActionData = z.infer<typeof InvoiceActionDataSchema>
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>

// Helper to calculate totals
export function calculateInvoiceTotals(items: InvoiceItem[], gstPercentage: number) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const gstAmount = (subtotal * gstPercentage) / 100
  const grandTotal = subtotal + gstAmount

  return { subtotal, gstAmount, grandTotal }
}
