// lib/ai/actions/invoice/invoice-validator.ts

import { InvoiceActionData, InvoiceActionDataSchema, calculateInvoiceTotals } from './invoice-action-schema'
import { ValidationError } from '../types'
import { supabaseServer } from '@/lib/supabase-server'

export async function validateInvoiceAction(
  data: Partial<InvoiceActionData>,
  userId: string
): Promise<{ isValid: boolean; errors: ValidationError[]; enhancedData?: InvoiceActionData }> {

  const errors: ValidationError[] = []

  // 1. Schema validation using Zod
  const parseResult = InvoiceActionDataSchema.safeParse(data)

  if (!parseResult.success) {
    parseResult.error.errors.forEach(err => {
      errors.push({
        field: err.path.join('.'),
        message: err.message,
        severity: 'error'
      })
    })
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  if (!parseResult.success || !parseResult.data) {
    return { isValid: false, errors }
  }

  const validData = parseResult.data

  // 2. Business rule validations

  // Check if customer exists (if customerId provided)
  if (validData.customerId) {
    const { data: customer } = await supabaseServer
      .from('customers')
      .select('id, name')
      .eq('id', validData.customerId)
      .eq('user_id', userId)
      .single()

    if (!customer) {
      errors.push({
        field: 'customerId',
        message: 'Customer not found',
        severity: 'error'
      })
    }
  }

  // Validate item prices are reasonable
  validData.items.forEach((item, index) => {
    if (item.pricePerGram < 100) {
      errors.push({
        field: `items[${index}].pricePerGram`,
        message: `Price ${item.pricePerGram}/gram seems too low. Please verify.`,
        severity: 'warning'
      })
    }

    if (item.pricePerGram > 10000) {
      errors.push({
        field: `items[${index}].pricePerGram`,
        message: `Price ${item.pricePerGram}/gram seems very high. Please verify.`,
        severity: 'warning'
      })
    }
  })

  // 3. Calculate and add totals
  const totals = calculateInvoiceTotals(validData.items, validData.gstPercentage)
  const enhancedData = {
    ...validData,
    ...totals
  }

  // Only fail on errors, not warnings
  const hasErrors = errors.some(e => e.severity === 'error')

  return {
    isValid: !hasErrors,
    errors,
    enhancedData: hasErrors ? undefined : enhancedData
  }
}
