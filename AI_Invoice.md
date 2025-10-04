Let me search for AI chat-specific implementation:

Let me search for the actual chat implementation files:

Let me search for more specific information about invoice creation flow:

Perfect! Now I have a comprehensive understanding of your codebase. Let me create a detailed specification document for implementing AI-powered invoice creation as a POC.

---

# 🎯 AI Action Execution Specification: Invoice Creation POC

## **Document Version:** 1.0  
## **Date:** October 2025  
## **Status:** Ready for Development

---

## 📋 **Executive Summary**

This specification defines a **reusable AI action execution framework** starting with invoice creation as a proof of concept (POC). The framework will enable natural language commands to trigger structured database operations while maintaining data integrity and user experience.

**Key Principle:** Build a **generic action framework** that can be extended to other entities (customers, stock items, suppliers) beyond invoices.

---

## 🎯 **Objectives**

### **Primary Goals**
1. Enable users to create invoices via natural language in AI chat
2. Extract structured data from conversational input
3. Validate and execute invoice creation with real-time feedback
4. Navigate user to created invoice upon success

### **Secondary Goals**
1. Build reusable patterns for future AI actions (stock, customers, etc.)
2. Maintain audit trail of AI-generated actions
3. Handle ambiguous/incomplete data gracefully
4. Provide progressive disclosure for complex workflows

---

## 🏗️ **Architecture Overview**

### **High-Level Flow**

```
User Message → AI Chat → Intent Detection → Action Extractor 
    → Validation → Confirmation UI → Execution → Navigation → Feedback
```

### **Component Breakdown**

```
lib/ai/
├── actions/
│   ├── types.ts                    # Shared action types & interfaces
│   ├── action-registry.ts          # Central registry of all actions
│   ├── action-validator.ts         # Generic validation logic
│   ├── action-executor.ts          # Generic execution engine
│   └── invoice/
│       ├── invoice-action-schema.ts    # Invoice-specific schemas
│       ├── invoice-extractor.ts        # Extract invoice from AI response
│       ├── invoice-validator.ts        # Validate invoice data
│       └── invoice-executor.ts         # Execute invoice creation
│
├── prompts/
│   ├── system-prompts.ts           # Base system prompts
│   └── action-prompts.ts           # Action-specific prompts
│
└── utils/
    ├── openai-client.ts            # OpenAI API wrapper
    └── context-builder.ts          # Build context for AI

components/ai-chat/
├── action-confirmation-card.tsx    # Generic confirmation UI
├── invoice-preview-card.tsx        # Invoice-specific preview
└── action-progress.tsx             # Progress indicator

app/api/ai/
├── chat/route.ts                   # Main chat endpoint (existing)
├── execute-action/route.ts         # NEW: Generic action execution
└── validate-action/route.ts        # NEW: Pre-execution validation
```

---

## 📊 **Data Models**

### **1. AI Action Base Schema**

```typescript
// lib/ai/actions/types.ts

export type ActionType = 'create_invoice' | 'add_customer' | 'add_stock' | 'update_invoice';

export type ActionStatus = 
  | 'intent_detected'      // AI identified intent
  | 'extracting'           // Extracting structured data
  | 'validating'           // Validating extracted data
  | 'awaiting_confirmation'// Waiting for user confirmation
  | 'executing'            // Creating in database
  | 'completed'            // Successfully completed
  | 'failed'               // Failed with error
  | 'cancelled';           // User cancelled

export interface AIAction<T = unknown> {
  id: string;                    // Unique action ID
  type: ActionType;
  status: ActionStatus;
  data: T;                       // Action-specific data
  missingFields: string[];       // Fields needing clarification
  validationErrors: ValidationError[];
  metadata: {
    conversationId: string;
    messageId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ActionResult {
  success: boolean;
  actionId: string;
  entityId?: string;          // ID of created entity (invoice_id, customer_id, etc.)
  redirectUrl?: string;       // Where to navigate after success
  message: string;
  errors?: ValidationError[];
}
```

### **2. Invoice Action Schema**

```typescript
// lib/ai/actions/invoice/invoice-action-schema.ts

import { z } from 'zod';

export const InvoiceItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  weight: z.number().positive('Weight must be positive'),
  pricePerGram: z.number().positive('Price per gram must be positive'),
  total: z.number().positive('Total must be positive'),
});

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
});

export type InvoiceActionData = z.infer<typeof InvoiceActionDataSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;

// Helper to calculate totals
export function calculateInvoiceTotals(items: InvoiceItem[], gstPercentage: number) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = (subtotal * gstPercentage) / 100;
  const grandTotal = subtotal + gstAmount;
  
  return { subtotal, gstAmount, grandTotal };
}
```

### **3. Database Schema Addition**

```sql
-- migrations/create_ai_actions_table.sql

CREATE TABLE ai_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'intent_detected', 'extracting', 'validating', 
    'awaiting_confirmation', 'executing', 'completed', 'failed', 'cancelled'
  )),
  extracted_data JSONB NOT NULL DEFAULT '{}',
  validation_errors JSONB DEFAULT '[]',
  missing_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  entity_id TEXT NULL,              -- ID of created entity (invoice, customer, etc.)
  error_message TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  executed_at TIMESTAMPTZ NULL,
  
  CONSTRAINT valid_action_type CHECK (action_type IN (
    'create_invoice', 'update_invoice', 'delete_invoice',
    'create_customer', 'update_customer',
    'create_stock', 'update_stock'
  ))
);

CREATE INDEX idx_ai_actions_user_id ON ai_actions(user_id);
CREATE INDEX idx_ai_actions_session_id ON ai_actions(session_id);
CREATE INDEX idx_ai_actions_status ON ai_actions(status);
CREATE INDEX idx_ai_actions_created_at ON ai_actions(created_at DESC);

-- RLS Policies
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI actions"
  ON ai_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI actions"
  ON ai_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI actions"
  ON ai_actions FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 🤖 **OpenAI Integration**

### **1. Enhanced System Prompt**

```typescript
// lib/ai/prompts/system-prompts.ts

export const ACTION_CAPABLE_SYSTEM_PROMPT = `You are an AI assistant for Sethiya Gold jewelry shop management system.

CAPABILITIES:
1. You can execute actions in the app through structured function calls
2. You can create invoices, add customers, manage inventory
3. You provide guidance and answer questions

CURRENT AVAILABLE ACTIONS:
- create_invoice: Create a new sales invoice
- More actions coming soon (customers, inventory, etc.)

RESPONSE STYLE:
- Be conversational and natural
- When users request actions, confirm understanding before execution
- Ask clarifying questions for missing information
- Explain what you're about to do before taking action

BUSINESS CONTEXT:
- Indian jewelry business (GST, rupees, grams)
- Items priced per gram for precious metals
- Default GST is 3%
- Common items: rings, necklaces, bangles, earrings
- Common metals: gold (22K, 24K), silver, platinum

USER INFO:
- User ID: {{userId}}
- Current session: {{sessionId}}
- Date: {{currentDate}}`;
```

### **2. Function Calling Schema**

```typescript
// lib/ai/actions/invoice/invoice-extractor.ts

export const CREATE_INVOICE_FUNCTION = {
  name: 'create_invoice',
  description: 'Create a new sales invoice for a customer. Use this when the user wants to generate a bill, create an invoice, or record a sale.',
  parameters: {
    type: 'object',
    properties: {
      customer: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Customer full name (required)'
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
            description: 'Customer address (optional)'
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
        description: 'Array of items to include in the invoice',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Item name (e.g., "Gold Ring", "Silver Necklace")'
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
};
```

### **3. Action Extraction Logic**

```typescript
// lib/ai/actions/invoice/invoice-extractor.ts

import OpenAI from 'openai';
import { AIAction, ActionStatus } from '../types';
import { InvoiceActionData, InvoiceActionDataSchema } from './invoice-action-schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function extractInvoiceAction(
  userMessage: string,
  conversationHistory: any[],
  userId: string,
  sessionId: string
): Promise<AIAction<InvoiceActionData>> {
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
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
    functions: [CREATE_INVOICE_FUNCTION],
    function_call: 'auto',
    temperature: 0.3, // Lower temperature for more deterministic extraction
  });

  const message = response.choices[0].message;
  
  // Check if AI decided to call the create_invoice function
  if (message.function_call?.name === 'create_invoice') {
    const rawData = JSON.parse(message.function_call.arguments);
    
    // Calculate totals for each item
    const itemsWithTotals = rawData.items.map((item: any) => ({
      ...item,
      total: item.quantity * item.weight * item.pricePerGram
    }));
    
    const invoiceData: Partial<InvoiceActionData> = {
      customerName: rawData.customer.name,
      customerPhone: rawData.customer.phone,
      customerEmail: rawData.customer.email,
      customerAddress: rawData.customer.address,
      customerId: rawData.customer.existingCustomerId,
      items: itemsWithTotals,
      gstPercentage: rawData.gstPercentage || 3,
      invoiceDate: rawData.invoiceDate || new Date(),
    };
    
    // Identify missing required fields
    const missingFields: string[] = [];
    if (!invoiceData.customerName) missingFields.push('customerName');
    if (!invoiceData.items || invoiceData.items.length === 0) missingFields.push('items');
    
    return {
      id: crypto.randomUUID(),
      type: 'create_invoice',
      status: missingFields.length > 0 ? 'extracting' : 'validating',
      data: invoiceData as InvoiceActionData,
      missingFields,
      validationErrors: [],
      metadata: {
        conversationId: sessionId,
        messageId: message.id || crypto.randomUUID(),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };
  }
  
  // If no function call, return null action (just conversation)
  throw new Error('No invoice creation intent detected');
}
```

---

## 🔄 **Validation & Execution Flow**

### **1. Validation Logic**

```typescript
// lib/ai/actions/invoice/invoice-validator.ts

import { InvoiceActionData, InvoiceActionDataSchema, calculateInvoiceTotals } from './invoice-action-schema';
import { ValidationError } from '../types';

export async function validateInvoiceAction(
  data: Partial<InvoiceActionData>,
  userId: string
): Promise<{ isValid: boolean; errors: ValidationError[]; enhancedData?: InvoiceActionData }> {
  
  const errors: ValidationError[] = [];
  
  // 1. Schema validation using Zod
  const parseResult = InvoiceActionDataSchema.safeParse(data);
  
  if (!parseResult.success) {
    parseResult.error.errors.forEach(err => {
      errors.push({
        field: err.path.join('.'),
        message: err.message,
        severity: 'error'
      });
    });
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  const validData = parseResult.data;
  
  // 2. Business rule validations
  
  // Check if customer exists (if customerId provided)
  if (validData.customerId) {
    const { data: customer } = await supabase
      .from('customers')
      .select('id, name')
      .eq('id', validData.customerId)
      .eq('user_id', userId)
      .single();
    
    if (!customer) {
      errors.push({
        field: 'customerId',
        message: 'Customer not found',
        severity: 'error'
      });
    }
  }
  
  // Validate item prices are reasonable
  validData.items.forEach((item, index) => {
    if (item.pricePerGram < 100) {
      errors.push({
        field: `items[${index}].pricePerGram`,
        message: `Price ${item.pricePerGram}/gram seems too low. Please verify.`,
        severity: 'warning'
      });
    }
    
    if (item.pricePerGram > 10000) {
      errors.push({
        field: `items[${index}].pricePerGram`,
        message: `Price ${item.pricePerGram}/gram seems very high. Please verify.`,
        severity: 'warning'
      });
    }
  });
  
  // 3. Calculate and add totals
  const totals = calculateInvoiceTotals(validData.items, validData.gstPercentage);
  const enhancedData = {
    ...validData,
    ...totals
  };
  
  // Only fail on errors, not warnings
  const hasErrors = errors.some(e => e.severity === 'error');
  
  return {
    isValid: !hasErrors,
    errors,
    enhancedData: hasErrors ? undefined : enhancedData
  };
}
```

### **2. Execution Logic (Reuses Existing Code)**

```typescript
// lib/ai/actions/invoice/invoice-executor.ts

import { supabaseServer } from '@/lib/supabase-server';
import { InvoiceActionData } from './invoice-action-schema';
import { ActionResult } from '../types';
import { generateRequestId, logInfo, logError } from '@/lib/logger';
import { auditSuccess, auditFailure } from '@/lib/audit-logger';

export async function executeInvoiceCreation(
  data: InvoiceActionData,
  userId: string,
  actionId: string
): Promise<ActionResult> {
  
  const requestId = generateRequestId();
  const route = '/api/ai/execute-action';
  
  try {
    logInfo('ai_invoice_creation_started', {
      requestId,
      userId,
      route,
      entity: 'invoice',
      metadata: { actionId, customerName: data.customerName }
    });
    
    // 1. Get user settings for firm details (snapshot data)
    const { data: userSettings } = await supabaseServer
      .from('user_settings')
      .select('firm_name, firm_address, firm_phone, firm_gstin')
      .eq('user_id', userId)
      .single();
    
    if (!userSettings) {
      throw new Error('User settings not found. Please configure firm details in settings.');
    }
    
    // 2. Handle customer (create or use existing)
    let customerId = data.customerId;
    let customer: any = null;
    
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
        .single();
      
      if (customerError) throw customerError;
      customer = newCustomer;
      customerId = newCustomer.id;
      
      logInfo('ai_customer_created', {
        requestId,
        userId,
        route,
        entity: 'customer',
        entityId: customerId,
      });
    } else {
      // Fetch existing customer
      const { data: existingCustomer } = await supabaseServer
        .from('customers')
        .select('id, name, phone, email, address')
        .eq('id', customerId)
        .eq('user_id', userId)
        .single();
      
      customer = existingCustomer;
    }
    
    // 3. Generate invoice number
    const { data: lastInvoice } = await supabaseServer
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    let invoiceNumber = 'INV-001';
    if (lastInvoice?.invoice_number) {
      const lastNum = parseInt(lastInvoice.invoice_number.split('-')[1] || '0');
      invoiceNumber = `INV-${String(lastNum + 1).padStart(3, '0')}`;
    }
    
    // 4. Create invoice record
    const { data: invoice, error: invoiceError } = await supabaseServer
      .from('invoices')
      .insert({
        user_id: userId,
        customer_id: customerId,
        invoice_number: invoiceNumber,
        invoice_date: new Date(data.invoiceDate).toISOString().split('T')[0],
        status: 'finalized',
        customer_name_snapshot: customer?.name || data.customerName,
        customer_address_snapshot: customer?.address || data.customerAddress || null,
        customer_phone_snapshot: customer?.phone || data.customerPhone || null,
        customer_email_snapshot: customer?.email || data.customerEmail || null,
        firm_name_snapshot: userSettings.firm_name,
        firm_address_snapshot: userSettings.firm_address,
        firm_phone_snapshot: userSettings.firm_phone,
        firm_gstin_snapshot: userSettings.firm_gstin,
        subtotal: data.subtotal!,
        gst_percentage: data.gstPercentage,
        gst_amount: data.gstAmount!,
        grand_total: data.grandTotal!,
      })
      .select('id')
      .single();
    
    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Failed to create invoice');
    
    // 5. Create invoice items
    const invoiceItems = data.items.map(item => ({
      invoice_id: invoice.id,
      user_id: userId,
      name: item.name,
      quantity: item.quantity,
      weight: item.weight,
      price_per_gram: item.pricePerGram,
      total: item.total,
    }));
    
    const { error: itemsError } = await supabaseServer
      .from('invoice_items')
      .insert(invoiceItems);
    
    if (itemsError) throw itemsError;
    
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
    );
    
    logInfo('ai_invoice_creation_success', {
      requestId,
      userId,
      route,
      entity: 'invoice',
      entityId: invoice.id,
      metadata: { invoiceNumber, total: data.grandTotal }
    });
    
    return {
      success: true,
      actionId,
      entityId: invoice.id,
      redirectUrl: `/invoices/${invoice.id}`,
      message: `Invoice ${invoiceNumber} created successfully! Total: ₹${data.grandTotal!.toLocaleString('en-IN')}`
    };
    
  } catch (error: any) {
    logError('ai_invoice_creation_failed', {
      requestId,
      userId,
      route,
      entity: 'invoice',
      error: error.message || error,
      metadata: { actionId }
    });
    
    await auditFailure(
      userId,
      'ai_invoice_create',
      'invoice',
      null,
      { error: error.message, actionId },
      requestId,
      route
    );
    
    return {
      success: false,
      actionId,
      message: `Failed to create invoice: ${error.message}`,
      errors: [{
        field: 'general',
        message: error.message,
        severity: 'error'
      }]
    };
  }
}
```

---

## 🎨 **UI Components**

### **1. Action Confirmation Card**

```typescript
// components/ai-chat/action-confirmation-card.tsx

'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { AIAction, ValidationError } from '@/lib/ai/actions/types';

interface ActionConfirmationCardProps {
  action: AIAction;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit?: () => void;
  isExecuting?: boolean;
  children?: React.ReactNode; // For action-specific preview
}

export function ActionConfirmationCard({
  action,
  onConfirm,
  onCancel,
  onEdit,
  isExecuting = false,
  children
}: ActionConfirmationCardProps) {
  
  const hasErrors = action.validationErrors.some(e => e.severity === 'error');
  const hasWarnings = action.validationErrors.some(e => e.severity === 'warning');
  
  return (
    <Card className="border-amber-200 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getActionIcon(action.type)}
              {getActionTitle(action.type)}
            </CardTitle>
            <CardDescription>
              Please review and confirm the action
            </CardDescription>
          </div>
          <Badge variant={hasErrors ? 'destructive' : hasWarnings ? 'secondary' : 'default'}>
            {action.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Validation Messages */}
        {action.validationErrors.length > 0 && (
          <div className="space-y-2">
            {action.validationErrors.map((error, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-3 rounded-md ${
                  error.severity === 'error'
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                }`}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">{error.field}: </span>
                  {error.message}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Action-specific preview (children) */}
        {children}
        
        {/* Missing fields prompt */}
        {action.missingFields.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-900">
              <strong>Missing information:</strong> {action.missingFields.join(', ')}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Please provide these details to continue.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isExecuting}
        >
          Cancel
        </Button>
        
        {onEdit && (
          <Button
            variant="secondary"
            onClick={onEdit}
            disabled={isExecuting}
          >
            Edit
          </Button>
        )}
        
        <Button
          onClick={onConfirm}
          disabled={hasErrors || action.missingFields.length > 0 || isExecuting}
          className="ml-auto bg-amber-600 hover:bg-amber-700"
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm & Create
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function getActionIcon(type: string) {
  // Return appropriate icon based on action type
  return <FileText className="h-5 w-5" />;
}

function getActionTitle(type: string) {
  const titles: Record<string, string> = {
    create_invoice: 'Create New Invoice',
    add_customer: 'Add New Customer',
    add_stock: 'Add Stock Item',
  };
  return titles[type] || 'Action';
}
```

### **2. Invoice Preview Card**

```typescript
// components/ai-chat/invoice-preview-card.tsx

'use client';

import { InvoiceActionData } from '@/lib/ai/actions/invoice/invoice-action-schema';
import { Separator } from '@/components/ui/separator';

interface InvoicePreviewCardProps {
  data: InvoiceActionData;
}

export function InvoicePreviewCard({ data }: InvoicePreviewCardProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
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
            <div key={index} className="bg-white p-3 rounded border text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium">{item.name}</span>
                <span className="font-semibold">₹{item.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs text-gray-600 space-y-0.5">
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
  );
}
```

---

## 🔌 **API Routes**

### **1. Enhanced Chat Route**

```typescript
// app/api/ai/chat/route.ts (enhanced)

import { NextRequest, NextResponse } from 'next/server';
import { extractInvoiceAction } from '@/lib/ai/actions/invoice/invoice-extractor';
import { validateInvoiceAction } from '@/lib/ai/actions/invoice/invoice-validator';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();
    
    // Get user from auth
    const authHeader = request.headers.get('authorization');
    const { data: { user } } = await supabaseServer.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Try to extract action intent
    let action: AIAction | null = null;
    let isActionIntent = false;
    
    try {
      action = await extractInvoiceAction(message, [], user.id, sessionId);
      isActionIntent = true;
    } catch (e) {
      // Not an action intent, treat as normal conversation
      isActionIntent = false;
    }
    
    if (isActionIntent && action) {
      // Validate the extracted action
      const validation = await validateInvoiceAction(action.data, user.id);
      
      action.validationErrors = validation.errors;
      action.status = validation.isValid ? 'awaiting_confirmation' : 'validating';
      
      if (validation.enhancedData) {
        action.data = validation.enhancedData;
      }
      
      // Save action to database
      await supabaseServer.from('ai_actions').insert({
        id: action.id,
        user_id: user.id,
        session_id: sessionId,
        action_type: action.type,
        status: action.status,
        extracted_data: action.data,
        validation_errors: action.validationErrors,
        missing_fields: action.missingFields,
      });
      
      // Return action for UI to show confirmation
      return NextResponse.json({
        type: 'action',
        action: action,
        message: generateActionConfirmationMessage(action)
      });
    }
    
    // Normal conversation - call OpenAI for response
    // ... existing chat logic ...
    
    return NextResponse.json({
      type: 'message',
      message: 'Normal AI response...'
    });
    
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateActionConfirmationMessage(action: AIAction): string {
  if (action.type === 'create_invoice') {
    const data = action.data as InvoiceActionData;
    return `I've prepared an invoice for ${data.customerName} with ${data.items.length} item(s) totaling ₹${data.grandTotal?.toLocaleString('en-IN')}. Please review and confirm to create it.`;
  }
  return 'Action prepared. Please review and confirm.';
}
```

### **2. Action Execution Route**

```typescript
// app/api/ai/execute-action/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { executeInvoiceCreation } from '@/lib/ai/actions/invoice/invoice-executor';
import { supabaseServer } from '@/lib/supabase-server';
import { generateRequestId, logInfo, logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const { actionId } = await request.json();
    
    // Get user
    const authHeader = request.headers.get('authorization');
    const { data: { user } } = await supabaseServer.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch action from database
    const { data: action, error: fetchError } = await supabaseServer
      .from('ai_actions')
      .select('*')
      .eq('id', actionId)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError || !action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }
    
    // Check if action is in correct state
    if (action.status !== 'awaiting_confirmation') {
      return NextResponse.json(
        { error: 'Action not in confirmable state' },
        { status: 400 }
      );
    }
    
    // Update status to executing
    await supabaseServer
      .from('ai_actions')
      .update({ status: 'executing', updated_at: new Date().toISOString() })
      .eq('id', actionId);
    
    // Execute based on action type
    let result;
    
    if (action.action_type === 'create_invoice') {
      result = await executeInvoiceCreation(
        action.extracted_data,
        user.id,
        actionId
      );
    } else {
      throw new Error(`Unknown action type: ${action.action_type}`);
    }
    
    // Update action status based on result
    await supabaseServer
      .from('ai_actions')
      .update({
        status: result.success ? 'completed' : 'failed',
        entity_id: result.entityId || null,
        error_message: result.success ? null : result.message,
        executed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', actionId);
    
    logInfo('ai_action_executed', {
      requestId,
      userId: user.id,
      route: '/api/ai/execute-action',
      entity: action.action_type,
      entityId: result.entityId,
      metadata: { success: result.success }
    });
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    logError('ai_action_execution_failed', {
      requestId,
      route: '/api/ai/execute-action',
      error: error.message
    });
    
    return NextResponse.json(
      { error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
```

---

## 🎭 **User Experience Flow**

### **Scenario: Creating Invoice via Chat**

```
1. USER: "Create an invoice for Ram Kumar. He's buying 2 gold rings, 
         each 10 grams at ₹5500 per gram"

2. AI PROCESSES:
   - Extracts intent: create_invoice
   - Parses data: customer, items, prices
   - Calculates totals
   - Validates data
   
3. CHAT SHOWS:
   [ActionConfirmationCard]
   ├── Customer: Ram Kumar
   ├── Items:
   │   └── Gold Ring x2 (20g @ ₹5500/g) = ₹110,000
   ├── Subtotal: ₹110,000
   ├── GST (3%): ₹3,300
   └── Total: ₹113,300
   
   [Buttons: Cancel | Confirm & Create]

4. USER CLICKS "Confirm & Create"

5. SYSTEM:
   - Executes invoice creation
   - Shows progress indicator
   - Creates customer (if new)
   - Creates invoice record
   - Creates invoice items
   - Logs action in audit trail

6. SUCCESS:
   - Shows success message: "Invoice INV-042 created! ₹113,300"
   - Navigates to: /invoices/[id]
   - Invoice page loads with all data pre-filled
```

### **Scenario: Incomplete Information**

```
1. USER: "Make an invoice for a gold necklace"

2. AI DETECTS MISSING INFO:
   - Customer name ❌
   - Weight ❌
   - Price ❌
   - Quantity ❌

3. CHAT RESPONDS:
   "I can help create an invoice! I need some more details:
   - Customer name
   - Necklace weight (in grams)
   - Price per gram
   - Quantity (how many necklaces)"

4. USER: "It's for Priya, 25 grams, ₹6200 per gram, 1 piece"

5. AI EXTRACTS COMPLETE DATA → Shows confirmation card
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**

```typescript
// __tests__/ai/invoice-extractor.test.ts

describe('Invoice Extractor', () => {
  it('should extract complete invoice data', async () => {
    const message = 'Create invoice for John, 2 gold rings 10g each at 5500/g';
    const action = await extractInvoiceAction(message, [], 'user-123', 'session-123');
    
    expect(action.type).toBe('create_invoice');
    expect(action.data.customerName).toBe('John');
    expect(action.data.items).toHaveLength(1);
    expect(action.data.items[0].quantity).toBe(2);
  });
  
  it('should identify missing fields', async () => {
    const message = 'Create invoice for gold ring';
    const action = await extractInvoiceAction(message, [], 'user-123', 'session-123');
    
    expect(action.missingFields).toContain('customerName');
  });
});
```

### **Integration Tests**

1. **End-to-end invoice creation flow**
2. **Error handling with invalid data**
3. **Multi-turn conversation with clarifications**
4. **Customer lookup and reuse**

---

## 📈 **Success Metrics**

1. **Accuracy**: % of correctly extracted invoice data (target: >90%)
2. **Completion Rate**: % of started actions that complete (target: >80%)
3. **Time Saved**: Average time vs manual creation (target: 60% reduction)
4. **User Satisfaction**: Feedback score (target: 4.5/5)
5. **Error Rate**: % of actions that fail (target: <5%)

---

## 🚀 **Implementation Phases**

### **Phase 1: Core Framework (Week 1)**
- ✅ Database schema for ai_actions table
- ✅ Base action types and interfaces
- ✅ OpenAI function calling setup
- ✅ Action registry pattern

### **Phase 2: Invoice POC (Week 2)**
- ✅ Invoice extraction logic
- ✅ Invoice validation
- ✅ Invoice execution (reusing existing code)
- ✅ Action confirmation UI

### **Phase 3: Polish & Testing (Week 3)**
- ✅ Error handling
- ✅ Multi-turn conversations
- ✅ Audit logging integration
- ✅ E2E testing

### **Phase 4: Documentation & Handoff (Week 4)**
- ✅ Developer documentation
- ✅ User guide
- ✅ Video demo
- ✅ Deployment to production

---

## 🔮 **Future Extensions**

Once invoice creation POC is validated, extend the framework to:

1. **Customer Management**
   - "Add customer Rahul, phone 9876543210"
   - "Update Priya's email to priya@example.com"

2. **Inventory Management**
   - "Add 5 gold bangles, 15g each, SKU-GB-001"
   - "Mark item SKU-123 as sold"

3. **Stock Queries**
   - "Show me all gold items under 10 grams"
   - "What's my total gold inventory worth?"

4. **Bulk Operations**
   - "Create invoices for these 3 customers: [list]"
   - "Update prices for all 22K gold items to ₹6500/g"

---

## 📚 **Dependencies & Environment**

```bash
# Additional npm packages needed
pnpm add zod @hookform/resolvers date-fns

# Environment variables (add to .env.local)
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_ENABLE_AI_ACTIONS=true
```

---

## ✅ **Definition of Done**

- [ ] User can create complete invoice via chat
- [ ] Missing information prompts work correctly
- [ ] Validation catches errors before execution
- [ ] Confirmation UI shows accurate preview
- [ ] Invoice created in database matches preview
- [ ] User navigated to invoice page after creation
- [ ] Audit logs capture AI-created invoices
- [ ] Error messages are clear and actionable
- [ ] Code follows existing patterns and conventions
- [ ] Unit tests pass with >80% coverage
- [ ] E2E test validates full flow
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

## 🎯 **Key Design Decisions**

1. **Reusability First**: Framework designed for multiple action types
2. **Validation Before Execution**: Two-step process ensures data quality
3. **Explicit Confirmation**: Users must approve before database changes
4. **Audit Trail**: Every AI action logged for accountability
5. **Graceful Degradation**: Falls back to conversation if action unclear
6. **Leverage Existing Code**: Reuse invoice creation logic from `app/create-invoice`

---
