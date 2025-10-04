// lib/ai/actions/invoice/invoice-executor.ts

import { supabaseServer } from '@/lib/supabase-server'
import { InvoiceActionData } from './invoice-action-schema'
import { ActionResult } from '../types'
import { generateRequestId, logInfo, logError } from '@/lib/logger'
import { auditSuccess, auditFailure } from '@/lib/audit-logger'

export async function executeInvoiceCreation(
  data: InvoiceActionData,
  userId: string,
  actionId: string
): Promise<ActionResult> {

  const requestId = generateRequestId()
  const route = '/api/ai/execute-action'

  try {
    logInfo('ai_invoice_creation_started', {
      requestId,
      userId,
      route,
      entity: 'invoice',
      metadata: { actionId, customerName: data.customerName }
    })

    // 1. Get user settings for firm details (snapshot data)
    const { data: userSettings } = await supabaseServer
      .from('user_settings')
      .select('firm_name, firm_address, firm_phone, firm_gstin')
      .eq('user_id', userId)
      .single()

    if (!userSettings) {
      throw new Error('User settings not found. Please configure firm details in settings.')
    }

    // 2. Handle customer (create or use existing)
    let customerId = data.customerId
    let customer: any = null

    if (!customerId) {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabaseServer
        .from('customers')
        .insert({
          user_id: userId,
          name: data.customerName,
          phone: data.customerPhone || null,
          email: data.customerEmail || null,
          address: data.customerAddress || null,
        })
        .select('id, name, phone, email, address')
        .single()

      if (customerError) throw customerError
      customer = newCustomer
      customerId = newCustomer.id

      logInfo('ai_customer_created', {
        requestId,
        userId,
        route,
        entity: 'customer',
        entityId: customerId,
      })
    } else {
      // Fetch existing customer
      const { data: existingCustomer } = await supabaseServer
        .from('customers')
        .select('id, name, phone, email, address')
        .eq('id', customerId)
        .eq('user_id', userId)
        .single()

      customer = existingCustomer
    }

    // 3. Generate invoice number
    const { data: lastInvoice } = await supabaseServer
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let invoiceNumber = 'INV-001'
    if (lastInvoice?.invoice_number) {
      const lastNum = parseInt(lastInvoice.invoice_number.split('-')[1] || '0')
      invoiceNumber = `INV-${String(lastNum + 1).padStart(3, '0')}`
    }

    // 4. Create invoice record
    const { data: invoice, error: invoiceError } = await supabaseServer
      .from('invoices')
      .insert({
        user_id: userId,
        customer_id: customerId!,
        invoice_number: invoiceNumber,
        invoice_date: new Date(data.invoiceDate).toISOString().split('T')[0],
        status: 'finalized',
        customer_name_snapshot: customer?.name || data.customerName,
        customer_address_snapshot: customer?.address || data.customerAddress || null,
        customer_phone_snapshot: customer?.phone || data.customerPhone || null,
        customer_email_snapshot: customer?.email || data.customerEmail || null,
        firm_name_snapshot: userSettings.firm_name!,
        firm_address_snapshot: userSettings.firm_address!,
        firm_phone_snapshot: userSettings.firm_phone!,
        firm_gstin_snapshot: userSettings.firm_gstin!,
        subtotal: data.subtotal!,
        gst_percentage: data.gstPercentage,
        gst_amount: data.gstAmount!,
        grand_total: data.grandTotal!,
      })
      .select('id')
      .single()

    if (invoiceError) throw invoiceError
    if (!invoice) throw new Error('Failed to create invoice')

    // 5. Create invoice items
    const invoiceItems = data.items.map(item => ({
      invoice_id: invoice.id,
      user_id: userId,
      name: item.name,
      quantity: item.quantity,
      weight: item.weight,
      price_per_gram: item.pricePerGram,
      total: item.total,
    }))

    const { error: itemsError } = await supabaseServer
      .from('invoice_items')
      .insert(invoiceItems)

    if (itemsError) throw itemsError

    // 6. Audit log
    await auditSuccess(
      userId,
      'ai_invoice_create',
      'invoice',
      invoice.id,
      {
        invoiceNumber,
        customerName: data.customerName,
        total: data.grandTotal,
        itemCount: data.items.length,
        aiActionId: actionId,
      },
      requestId,
      route
    )

    logInfo('ai_invoice_creation_success', {
      requestId,
      userId,
      route,
      entity: 'invoice',
      entityId: invoice.id,
      metadata: { invoiceNumber, total: data.grandTotal }
    })

    return {
      success: true,
      actionId,
      entityId: invoice.id,
      redirectUrl: `/invoices/${invoice.id}`,
      message: `Invoice ${invoiceNumber} created successfully! Total: ₹${data.grandTotal!.toLocaleString('en-IN')}`
    }

  } catch (error: any) {
    logError('ai_invoice_creation_failed', {
      requestId,
      userId,
      route,
      entity: 'invoice',
      metadata: { actionId },
      error: error.message || error
    })

    await auditFailure(
      userId,
      'ai_invoice_create',
      'invoice',
      null,
      { error: error.message, actionId },
      requestId,
      route
    )

    return {
      success: false,
      actionId,
      message: `Failed to create invoice: ${error.message}`,
      errors: [{
        field: 'general',
        message: error.message,
        severity: 'error'
      }]
    }
  }
}
