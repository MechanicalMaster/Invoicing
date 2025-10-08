// lib/ai/actions/purchase-bill/bill-action-schema.ts

import { z } from 'zod'

export const BillItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive('Quantity must be positive').optional(),
  rate: z.number().positive('Rate must be positive').optional(),
  amount: z.number().positive('Amount must be positive'),
})

export const SupplierInfoSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
})

export const BillExtractionDataSchema = z.object({
  // Supplier info
  supplier: SupplierInfoSchema,

  // Invoice details
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

  // Financial details
  amount: z.number().positive('Amount must be positive'),
  paymentStatus: z.enum(['Paid', 'Unpaid', 'Partially Paid']).default('Unpaid'),

  // Optional fields
  items: z.array(BillItemSchema).optional(),
  numberOfItems: z.number().int().positive().optional(),
  taxAmount: z.number().optional(),
  discountAmount: z.number().optional(),
  notes: z.string().optional(),

  // Metadata
  confidence: z.number().min(0).max(1).default(0.8),
  detectedLanguage: z.string().optional(),
})

export type BillExtractionData = z.infer<typeof BillExtractionDataSchema>
export type BillItem = z.infer<typeof BillItemSchema>
export type SupplierInfo = z.infer<typeof SupplierInfoSchema>

// Helper to calculate totals
export function calculateBillTotals(items: BillItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  return { subtotal }
}
