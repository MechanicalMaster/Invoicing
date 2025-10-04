// lib/ai/actions/types.ts

export type ActionType = 'create_invoice' | 'add_customer' | 'add_stock' | 'update_invoice'

export type ActionStatus =
  | 'intent_detected'      // AI identified intent
  | 'extracting'           // Extracting structured data
  | 'validating'           // Validating extracted data
  | 'awaiting_confirmation'// Waiting for user confirmation
  | 'executing'            // Creating in database
  | 'completed'            // Successfully completed
  | 'failed'               // Failed with error
  | 'cancelled'            // User cancelled

export interface AIAction<T = unknown> {
  id: string                    // Unique action ID
  type: ActionType
  status: ActionStatus
  data: T                       // Action-specific data
  missingFields: string[]       // Fields needing clarification
  validationErrors: ValidationError[]
  metadata: {
    conversationId: string
    messageId: string
    userId: string
    createdAt: Date
    updatedAt: Date
  }
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ActionResult {
  success: boolean
  actionId: string
  entityId?: string          // ID of created entity (invoice_id, customer_id, etc.)
  redirectUrl?: string       // Where to navigate after success
  message: string
  errors?: ValidationError[]
}
