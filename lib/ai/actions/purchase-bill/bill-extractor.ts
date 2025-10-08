// lib/ai/actions/purchase-bill/bill-extractor.ts

import OpenAI from 'openai'
import { BillExtractionData } from './bill-action-schema'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const EXTRACT_BILL_FUNCTION = {
  name: 'extract_purchase_bill',
  description: 'Extract information from a purchase invoice/bill image. Extract all visible details including supplier info, invoice details, items, and amounts. ALL DATA MUST BE IN ENGLISH ONLY - translate from Hindi/Marathi/other languages to English.',
  parameters: {
    type: 'object',
    properties: {
      supplier: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Supplier/Vendor name in ENGLISH ONLY (required). If name is in Hindi/Marathi, translate to English.'
          },
          phone: {
            type: 'string',
            description: 'Supplier phone number (optional)'
          },
          email: {
            type: 'string',
            description: 'Supplier email (optional)'
          },
          address: {
            type: 'string',
            description: 'Supplier address in ENGLISH ONLY (optional)'
          },
          gstNumber: {
            type: 'string',
            description: 'GST number if visible (optional)'
          }
        },
        required: ['name']
      },
      invoiceNumber: {
        type: 'string',
        description: 'Invoice/Bill number (required). Look for terms like "Invoice No", "Bill No", "Inv#"'
      },
      invoiceDate: {
        type: 'string',
        format: 'date',
        description: 'Invoice date in YYYY-MM-DD format (required). Convert any date format to YYYY-MM-DD.'
      },
      amount: {
        type: 'number',
        description: 'Total amount/Grand total in rupees (required). Look for "Total", "Grand Total", "Net Amount"',
        minimum: 0
      },
      paymentStatus: {
        type: 'string',
        enum: ['Paid', 'Unpaid', 'Partially Paid'],
        description: 'Payment status if mentioned. Default to "Unpaid" if not clear.'
      },
      items: {
        type: 'array',
        description: 'Array of line items from the bill (optional). Extract if itemized list is visible.',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Item name in ENGLISH ONLY'
            },
            quantity: {
              type: 'number',
              description: 'Quantity (optional)',
              minimum: 0
            },
            rate: {
              type: 'number',
              description: 'Rate per unit (optional)',
              minimum: 0
            },
            amount: {
              type: 'number',
              description: 'Line item amount',
              minimum: 0
            }
          },
          required: ['name', 'amount']
        }
      },
      numberOfItems: {
        type: 'integer',
        description: 'Total number of items (optional). Count from items array or extract if mentioned.',
        minimum: 0
      },
      taxAmount: {
        type: 'number',
        description: 'Tax/GST amount if separately mentioned (optional)',
        minimum: 0
      },
      discountAmount: {
        type: 'number',
        description: 'Discount amount if mentioned (optional)',
        minimum: 0
      },
      notes: {
        type: 'string',
        description: 'Any additional notes or remarks visible on the bill (optional)'
      },
      confidence: {
        type: 'number',
        description: 'Confidence score from 0 to 1 based on image quality and text clarity',
        minimum: 0,
        maximum: 1
      },
      detectedLanguage: {
        type: 'string',
        description: 'Language detected in the bill (e.g., "en", "hi", "mr", "mixed")'
      }
    },
    required: ['supplier', 'invoiceNumber', 'invoiceDate', 'amount']
  }
}

export async function extractBillFromImage(
  imageBase64: string,
  mimeType: string
): Promise<BillExtractionData> {

  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // GPT-4 with vision support
    messages: [
      {
        role: 'system',
        content: `You are an expert at extracting structured data from purchase invoices and bills for a jewelry shop in India.

IMPORTANT INSTRUCTIONS:
- Extract ALL visible information accurately
- Translate ALL text from Hindi/Marathi/regional languages to English
- Common Hindi/Marathi terms:
  * "आपूर्तिकर्ता" → Supplier
  * "चालान" / "बिल" → Invoice/Bill
  * "रकम" / "राशि" → Amount
  * "तारीख" → Date
  * "सोना" → Gold
  * "चांदी" → Silver
  * "अंगूठी" → Ring
  * "हार" → Necklace
- Handle various invoice formats (handwritten, printed, digital)
- Parse dates in any format and convert to YYYY-MM-DD
- Extract amounts even if currency symbols are present
- If image quality is poor, provide best estimate with lower confidence score
- Look for GST numbers, tax amounts, and itemized lists
`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all information from this purchase invoice/bill. Translate any Hindi/Marathi text to English.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: 'high' // High detail for better OCR
            }
          }
        ]
      }
    ],
    functions: [EXTRACT_BILL_FUNCTION as any],
    function_call: { name: 'extract_purchase_bill' },
    temperature: 0.1, // Very low temperature for consistent extraction
    max_tokens: 2000,
  })

  const message = response.choices[0].message

  if (message.function_call?.name === 'extract_purchase_bill') {
    const rawData = JSON.parse(message.function_call.arguments)

    const billData: BillExtractionData = {
      supplier: {
        name: rawData.supplier.name,
        phone: rawData.supplier.phone,
        email: rawData.supplier.email,
        address: rawData.supplier.address,
        gstNumber: rawData.supplier.gstNumber,
      },
      invoiceNumber: rawData.invoiceNumber,
      invoiceDate: rawData.invoiceDate,
      amount: rawData.amount,
      paymentStatus: rawData.paymentStatus || 'Unpaid',
      items: rawData.items || [],
      numberOfItems: rawData.numberOfItems || rawData.items?.length || undefined,
      taxAmount: rawData.taxAmount,
      discountAmount: rawData.discountAmount,
      notes: rawData.notes,
      confidence: rawData.confidence || 0.8,
      detectedLanguage: rawData.detectedLanguage || 'unknown',
    }

    return billData
  }

  throw new Error('Failed to extract bill information from image')
}
