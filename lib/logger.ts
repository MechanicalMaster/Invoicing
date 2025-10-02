/**
 * Central Logging Utility
 * Provides structured JSON logging for the application
 */

import { StructuredLog, LogLevel, AuditEntity } from './audit-types';

/**
 * Creates a structured log entry
 */
export function createLog(
  level: LogLevel,
  event: string,
  data: {
    requestId: string;
    userId?: string | null;
    route: string;
    entity: AuditEntity;
    entityId?: string | null;
    metadata?: Record<string, any>;
    error?: Error | string;
  }
): StructuredLog {
  const log: StructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId: data.requestId,
    userId: data.userId || null,
    route: data.route,
    entity: data.entity,
    entityId: data.entityId,
    metadata: data.metadata,
  };

  if (data.error) {
    if (data.error instanceof Error) {
      log.error = `${data.error.message}\n${data.error.stack}`;
    } else {
      log.error = String(data.error);
    }
  }

  return log;
}

/**
 * Log an info message
 */
export function logInfo(
  event: string,
  data: {
    requestId: string;
    userId?: string | null;
    route: string;
    entity: AuditEntity;
    entityId?: string | null;
    metadata?: Record<string, any>;
  }
): void {
  const log = createLog('info', event, data);
  console.log(JSON.stringify(log));
}

/**
 * Log a warning message
 */
export function logWarn(
  event: string,
  data: {
    requestId: string;
    userId?: string | null;
    route: string;
    entity: AuditEntity;
    entityId?: string | null;
    metadata?: Record<string, any>;
  }
): void {
  const log = createLog('warn', event, data);
  console.warn(JSON.stringify(log));
}

/**
 * Log an error message
 */
export function logError(
  event: string,
  data: {
    requestId: string;
    userId?: string | null;
    route: string;
    entity: AuditEntity;
    entityId?: string | null;
    metadata?: Record<string, any>;
    error: Error | string;
  }
): void {
  const log = createLog('error', event, data);
  console.error(JSON.stringify(log));
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}
