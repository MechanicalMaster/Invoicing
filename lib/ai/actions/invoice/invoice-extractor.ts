// lib/ai/actions/invoice/invoice-extractor.ts

import OpenAI from 'openai'
import { AIAction } from '../types'
import { InvoiceActionData } from './invoice-action-schema'
import { ACTION_CAPABLE_SYSTEM_PROMPT } from '@/lib/ai/prompts/system-prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const CREATE_INVOICE_FUNCTION = {
  name: 'create_invoice',
  description: 'Create a new sales invoice for a customer. Use this when the user wants to generate a bill, create an invoice, or record a sale. IMPORTANT: ALL DATA MUST BE IN ENGLISH ONLY - translate from Hindi/Marathi/other languages to English.',
  parameters: {
    type: 'object',
    properties: {
      customer: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Customer full name in ENGLISH ONLY (required). If name is in Hindi/Marathi, translate to English. Example: "राम कुमार" → "Ram Kumar"'
          },
          phone: {
            type: 'string',
            description: 'Customer phone number (optional)'
          },
          email: {
            type: 'string',
            description: 'Customer email (optional)'
          },
          address: {
            type: 'string',
            description: 'Customer address in ENGLISH ONLY (optional). Translate if in other language.'
          },
          existingCustomerId: {
            type: 'string',
            description: 'UUID of existing customer if mentioned (optional)'
          }
        },
        required: ['name']
      },
      items: {
        type: 'array',
        description: 'Array of items to include in the invoice. ALL ITEM NAMES MUST BE IN ENGLISH ONLY.',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Item name in ENGLISH ONLY (e.g., "Gold Ring", "Silver Necklace"). Translate from Hindi/Marathi: "सोने की अंगूठी" → "Gold Ring", "चांदी का हार" → "Silver Necklace"'
            },
            quantity: {
              type: 'integer',
              description: 'Number of units',
              minimum: 1
            },
            weight: {
              type: 'number',
              description: 'Weight in grams',
              minimum: 0.01
            },
            pricePerGram: {
              type: 'number',
              description: 'Price per gram in rupees',
              minimum: 0
            }
          },
          required: ['name', 'quantity', 'weight', 'pricePerGram']
        },
        minItems: 1
      },
      gstPercentage: {
        type: 'number',
        description: 'GST percentage (default: 3)',
        minimum: 0,
        maximum: 100,
        default: 3
      },
      invoiceDate: {
        type: 'string',
        format: 'date',
        description: 'Invoice date in YYYY-MM-DD format (default: today)'
      }
    },
    required: ['customer', 'items']
  }
}

export async function extractInvoiceAction(
  userMessage: string,
  conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[],
  userId: string,
  sessionId: string
): Promise<AIAction<InvoiceActionData>> {

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: ACTION_CAPABLE_SYSTEM_PROMPT
          .replace('{{userId}}', userId)
          .replace('{{sessionId}}', sessionId)
          .replace('{{currentDate}}', new Date().toISOString())
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ],
    functions: [CREATE_INVOICE_FUNCTION as any],
    function_call: 'auto',
    temperature: 0.3, // Lower temperature for more deterministic extraction
  })

  const message = response.choices[0].message

  // Check if AI decided to call the create_invoice function
  if (message.function_call?.name === 'create_invoice') {
    const rawData = JSON.parse(message.function_call.arguments)

    // Calculate totals for each item
    const itemsWithTotals = rawData.items.map((item: any) => ({
      ...item,
      total: item.quantity * item.weight * item.pricePerGram
    }))

    const invoiceData: Partial<InvoiceActionData> = {
      customerName: rawData.customer.name,
      customerPhone: rawData.customer.phone,
      customerEmail: rawData.customer.email,
      customerAddress: rawData.customer.address,
      customerId: rawData.customer.existingCustomerId,
      items: itemsWithTotals,
      gstPercentage: rawData.gstPercentage || 3,
      invoiceDate: rawData.invoiceDate || new Date(),
    }

    // Identify missing required fields
    const missingFields: string[] = []
    if (!invoiceData.customerName) missingFields.push('customerName')
    if (!invoiceData.items || invoiceData.items.length === 0) missingFields.push('items')

    return {
      id: crypto.randomUUID(),
      type: 'create_invoice',
      status: missingFields.length > 0 ? 'extracting' : 'validating',
      data: invoiceData as InvoiceActionData,
      missingFields,
      validationErrors: [],
      metadata: {
        conversationId: sessionId,
        messageId: crypto.randomUUID(),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
  }

  // If no function call, return null action (just conversation)
  throw new Error('No invoice creation intent detected')
}
