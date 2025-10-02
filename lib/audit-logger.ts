/**
 * Audit Logging Helper
 * Provides functions to write audit logs to the database
 */

import { createClient } from '@supabase/supabase-js';
import { AuditLogEntry, AuditAction, AuditEntity } from './audit-types';
import { logInfo, logError } from './logger';

// Create a Supabase client with service role key for server-side operations
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration for audit logging');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Write an audit log entry to the database
 */
export async function auditLog(
  entry: AuditLogEntry,
  requestId: string,
  route: string
): Promise<void> {
  try {
    const supabase = getServiceClient();

    const { error } = await supabase.from('audit_logs').insert({
      user_id: entry.user_id,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id,
      metadata: entry.metadata,
      success: entry.success,
    });

    if (error) {
      // Log the audit logging failure (meta!)
      logError('audit_log_failed', {
        requestId,
        userId: entry.user_id,
        route,
        entity: entry.entity,
        entityId: entry.entity_id,
        metadata: { action: entry.action, originalError: error.message },
        error: error.message,
      });
      throw error;
    }

    // Also log to console for monitoring
    logInfo('audit_log_created', {
      requestId,
      userId: entry.user_id,
      route,
      entity: entry.entity,
      entityId: entry.entity_id,
      metadata: { action: entry.action, success: entry.success },
    });
  } catch (error) {
    // Don't throw - we don't want audit logging failures to break the main flow
    console.error('Failed to write audit log:', error);
  }
}

/**
 * Helper: Log a successful action
 */
export async function auditSuccess(
  userId: string | null,
  action: AuditAction | string,
  entity: AuditEntity,
  entityId: string | null,
  metadata: Record<string, any>,
  requestId: string,
  route: string
): Promise<void> {
  await auditLog(
    {
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      metadata,
      success: true,
    },
    requestId,
    route
  );
}

/**
 * Helper: Log a failed action
 */
export async function auditFailure(
  userId: string | null,
  action: AuditAction | string,
  entity: AuditEntity,
  entityId: string | null,
  metadata: Record<string, any>,
  requestId: string,
  route: string
): Promise<void> {
  await auditLog(
    {
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      metadata,
      success: false,
    },
    requestId,
    route
  );
}

/**
 * Helper: Log authentication events
 */
export async function auditAuth(
  action: 'login_success' | 'login_failure' | 'logout',
  userId: string | null,
  metadata: Record<string, any>,
  requestId: string,
  route: string
): Promise<void> {
  await auditLog(
    {
      user_id: userId,
      action,
      entity: 'user',
      entity_id: userId,
      metadata,
      success: action !== 'login_failure',
    },
    requestId,
    route
  );
}

/**
 * Helper: Log file operations
 */
export async function auditFile(
  action: 'file_upload' | 'file_delete',
  userId: string | null,
  filePath: string,
  metadata: Record<string, any>,
  success: boolean,
  requestId: string,
  route: string
): Promise<void> {
  await auditLog(
    {
      user_id: userId,
      action,
      entity: 'file',
      entity_id: filePath,
      metadata,
      success,
    },
    requestId,
    route
  );
}

/**
 * Helper: Log inventory operations
 */
export async function auditInventory(
  action: 'inventory_create' | 'inventory_update' | 'inventory_delete',
  userId: string | null,
  itemId: string,
  metadata: Record<string, any>,
  requestId: string,
  route: string
): Promise<void> {
  await auditLog(
    {
      user_id: userId,
      action,
      entity: 'inventory',
      entity_id: itemId,
      metadata,
      success: true,
    },
    requestId,
    route
  );
}
