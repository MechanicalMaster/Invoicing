# Audit Logging System - Implementation Guide

## Overview

The audit logging system provides comprehensive tracking of business-critical actions, errors, and user activities in the jewelry invoice application. It consists of:

1. **Structured JSON logs** - Console logs for monitoring and debugging
2. **Audit trail database** - Immutable records of important actions
3. **Type-safe helpers** - TypeScript utilities for consistent logging

## Setup

### 1. Run Database Migration

Apply the audit_logs table migration:

```sql
-- Run this in your Supabase SQL editor
-- File: migrations/create_audit_logs.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 2. Add Environment Variable

Ensure your `.env.local` file has the service role key for server-side audit logging:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Usage

### Structured Logging (Console)

Use these for monitoring and debugging:

```typescript
import { generateRequestId, logInfo, logWarn, logError } from '@/lib/logger';

// Generate a unique request ID for each API call
const requestId = generateRequestId();

// Info log - normal operations
logInfo('user_action', {
  requestId,
  userId: user.id,
  route: '/api/items/create',
  entity: 'inventory',
  entityId: item.id,
  metadata: { itemName: item.name, quantity: item.quantity },
});

// Warning log - suspicious activity
logWarn('large_file_upload', {
  requestId,
  userId: user.id,
  route: '/api/storage/upload',
  entity: 'file',
  metadata: { size: file.size, fileName: file.name },
});

// Error log - failures
logError('database_error', {
  requestId,
  userId: user.id,
  route: '/api/items/update',
  entity: 'inventory',
  entityId: item.id,
  error: error, // Can be Error object or string
  metadata: { query: 'UPDATE items...' },
});
```

### Audit Trail (Database)

Use these for business-critical actions that need permanent records:

```typescript
import { auditSuccess, auditFailure, auditFile, auditInventory } from '@/lib/audit-logger';

// Example 1: File upload
await auditFile(
  'file_upload',
  userId,
  `${bucket}/${path}`,
  { fileName: file.name, size: file.size, type: file.type },
  true, // success
  requestId,
  route
);

// Example 2: Inventory created
await auditInventory(
  'inventory_create',
  userId,
  itemId,
  { name: 'Gold Ring', quantity: 5, price: 1200 },
  requestId,
  route
);

// Example 3: Generic success
await auditSuccess(
  userId,
  'customer_create',
  'customer',
  customerId,
  { name: customer.name, phone: customer.phone },
  requestId,
  route
);

// Example 4: Generic failure
await auditFailure(
  userId,
  'invoice_update',
  'invoice',
  invoiceId,
  { error: 'Validation failed', reason: 'Invalid total' },
  requestId,
  route
);
```

## Integration Pattern

### API Route Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateRequestId, logInfo, logError } from '@/lib/logger';
import { auditSuccess, auditFailure } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const route = '/api/your-route';
  let userId: string | null = null;

  try {
    // 1. Get user authentication
    const { user } = await getUser(request);
    userId = user.id;

    // 2. Parse request
    const data = await request.json();

    // 3. Log operation start
    logInfo('operation_started', {
      requestId,
      userId,
      route,
      entity: 'your_entity',
      metadata: { relevant: 'data' },
    });

    // 4. Perform operation
    const result = await performOperation(data);

    // 5. Audit success
    await auditSuccess(
      userId,
      'entity_create',
      'your_entity',
      result.id,
      { ...result },
      requestId,
      route
    );

    // 6. Log success
    logInfo('operation_success', {
      requestId,
      userId,
      route,
      entity: 'your_entity',
      entityId: result.id,
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    // 7. Log error
    logError('operation_failed', {
      requestId,
      userId,
      route,
      entity: 'your_entity',
      error: error instanceof Error ? error : String(error),
    });

    // 8. Audit failure
    if (userId) {
      await auditFailure(
        userId,
        'entity_create',
        'your_entity',
        null,
        { error: error instanceof Error ? error.message : String(error) },
        requestId,
        route
      );
    }

    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
```

## What to Log

### ✅ Must Log (Critical)

- User authentication (login/logout)
- Inventory CRUD operations
- File uploads/deletions
- Customer CRUD operations
- Invoice CRUD operations
- API errors and failures

### ✅ Should Log (Important)

- Settings changes
- Unauthorized access attempts
- Large file uploads
- Notification events
- Supplier/Purchase operations

### ⚠️ Nice to Have

- Performance metrics
- Search queries
- Report generation

## Querying Audit Logs

### From Supabase Dashboard

```sql
-- Get all logs for a specific user
SELECT * FROM audit_logs
WHERE user_id = 'user-uuid'
ORDER BY timestamp DESC
LIMIT 100;

-- Get all file uploads in the last 24 hours
SELECT * FROM audit_logs
WHERE action = 'file_upload'
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- Get failed operations
SELECT * FROM audit_logs
WHERE success = false
ORDER BY timestamp DESC;

-- Get inventory changes for a specific item
SELECT * FROM audit_logs
WHERE entity = 'inventory'
  AND entity_id = 'item-uuid'
ORDER BY timestamp DESC;
```

### From Application Code

```typescript
import { supabaseServer } from '@/lib/supabase-server';

// Get user's audit trail
const { data: logs } = await supabaseServer
  .from('audit_logs')
  .select('*')
  .eq('user_id', userId)
  .order('timestamp', { ascending: false })
  .limit(100);

// Get recent file uploads
const { data: uploads } = await supabaseServer
  .from('audit_logs')
  .select('*')
  .eq('action', 'file_upload')
  .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  .order('timestamp', { ascending: false });
```

## Available Actions

See `lib/audit-types.ts` for the complete list of `AuditAction` types:

- Authentication: `login_success`, `login_failure`, `logout`
- Inventory: `inventory_create`, `inventory_update`, `inventory_delete`
- Stock: `stock_create`, `stock_update`, `stock_delete`
- Files: `file_upload`, `file_delete`
- Customers: `customer_create`, `customer_update`, `customer_delete`
- Invoices: `invoice_create`, `invoice_update`, `invoice_delete`
- Suppliers: `supplier_create`, `supplier_update`, `supplier_delete`
- And more...

## Security Notes

- Audit logs are **immutable** - they cannot be updated or deleted via RLS policies
- Only service role can insert audit logs (prevents user manipulation)
- Users can only view their own audit logs
- Logs are retained for at least 1 year (configure in Supabase retention settings)

## Monitoring

### Check Logs in Production

**Vercel:**
```bash
vercel logs --follow
```

**Parse JSON logs:**
```bash
vercel logs | grep '"level":"error"' | jq '.'
```

### Example Log Output

```json
{
  "timestamp": "2025-10-02T12:34:56.789Z",
  "level": "info",
  "event": "file_upload_success",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "route": "/api/storage/upload",
  "entity": "file",
  "entityId": "identity_docs/user-123/file.pdf",
  "metadata": {
    "fileName": "file.pdf",
    "size": 245123,
    "type": "application/pdf",
    "path": "user-123/abc-123.pdf"
  }
}
```

## Next Steps

1. ✅ Run the database migration
2. ✅ Add audit logging to remaining API routes
3. 📊 Create an admin dashboard to view audit logs
4. 🔔 Set up alerts for suspicious activities
5. 📈 Add retention policies for old logs

## Files Reference

- `migrations/create_audit_logs.sql` - Database schema
- `lib/audit-types.ts` - Type definitions
- `lib/logger.ts` - Console logging utilities
- `lib/audit-logger.ts` - Database audit utilities
- `app/api/storage/upload/route.ts` - Example implementation
