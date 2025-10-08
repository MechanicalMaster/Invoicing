/**
 * Audit Logging Types
 * Based on the audit specification document
 */

// Log levels
export type LogLevel = 'info' | 'warn' | 'error';

// Entity types
export type AuditEntity = 'inventory' | 'file' | 'user' | 'notification' | 'customer' | 'invoice' | 'supplier' | 'purchase' | 'stock' | 'voice_transcription' | 'bill_extraction';

// Common audit actions
export type AuditAction =
  // Authentication
  | 'login_success'
  | 'login_failure'
  | 'logout'
  // Inventory
  | 'inventory_create'
  | 'inventory_update'
  | 'inventory_delete'
  // Stock
  | 'stock_create'
  | 'stock_update'
  | 'stock_delete'
  // File operations
  | 'file_upload'
  | 'file_delete'
  // Customers
  | 'customer_create'
  | 'customer_update'
  | 'customer_delete'
  // Invoices
  | 'invoice_create'
  | 'invoice_update'
  | 'invoice_delete'
  // Suppliers
  | 'supplier_create'
  | 'supplier_update'
  | 'supplier_delete'
  // Purchases
  | 'purchase_create'
  | 'purchase_update'
  | 'purchase_delete'
  // Notifications
  | 'notification_create'
  | 'notification_read'
  // System
  | 'error_unhandled'
  | 'error_database';

// Structured log format
export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  event: string;
  requestId: string;
  userId: string | null;
  route: string;
  entity: AuditEntity;
  entityId?: string | null;
  metadata?: Record<string, any>;
  error?: string;
}

// Audit log entry (for database)
export interface AuditLogEntry {
  user_id: string | null;
  action: AuditAction | string;
  entity: AuditEntity;
  entity_id?: string | null;
  metadata?: Record<string, any>;
  success: boolean;
}

// Audit log record (from database)
export interface AuditLogRecord extends AuditLogEntry {
  id: string;
  timestamp: string;
  created_at: string;
}
