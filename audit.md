Perfect — I’ll draft a **logging & audit specification document** for your app. It will define what to log, where to log it, and how to store/trace it. You can hand this directly to your dev team (or to yourself as a checklist) to implement structured logging + audit trail for your inventory app.

---

# 📄 **Logging & Audit Specification Document**

## 1. Purpose

The logging & audit system ensures:

* **Traceability** — know *who* did *what*, *when*, and *where*.
* **Debugging** — structured error logs to resolve issues faster.
* **Compliance & accountability** — an immutable audit trail for inventory management actions.
* **Monitoring** — capture system errors, anomalies, and suspicious activity.

---

## 2. Scope

Covers:

* API routes (`/api/.../route.ts`)
* Core workflows: **authentication, inventory CRUD, file uploads, notifications**
* Errors/exceptions
* Audit trail for business-critical actions (inventory & files)

Excludes:

* Client-side debug logs (non-essential for audit)

---

## 3. Logging Model

### 3.1 Log Levels

* **INFO** → Normal operations (login, file upload success, item update).
* **WARN** → Suspicious or unexpected activity (unauthorized request, large upload).
* **ERROR** → Failures that prevent operation (DB errors, upload failures).

---

### 3.2 Log Format (Structured JSON)

Every log must follow this schema:

```json
{
  "timestamp": "2025-10-02T12:34:56.789Z",
  "level": "info | warn | error",
  "event": "short_event_name",
  "requestId": "uuid",
  "userId": "uuid-or-null",
  "route": "/api/items/update",
  "entity": "inventory | file | user | notification",
  "entityId": "uuid-or-filename",
  "metadata": {
    "key": "value",
    "changes": { "quantity": 10, "price": 500 }
  },
  "error": "stack trace or message if level=error"
}
```

---

## 4. Logging Points

### 4.1 Authentication

* **Login success** (INFO): `{ userId }`
* **Login failure** (WARN): `{ email, reason }`
* **Logout** (INFO): `{ userId }`

### 4.2 Inventory CRUD

* **Item Created** (INFO): `{ userId, itemId, itemName, initialQty }`
* **Item Updated** (INFO): `{ userId, itemId, changes }`
* **Item Deleted** (INFO): `{ userId, itemId }`

### 4.3 File Uploads

* **Upload request** (INFO): `{ userId, fileName, size, type }`
* **Upload success** (INFO): `{ userId, filePath }`
* **Upload failure** (ERROR): `{ userId, error }`
* **Invalid attempt** (WARN): `{ userId, path, reason }`

### 4.4 Notifications

* **Notification created** (INFO): `{ userId, notificationId }`
* **Notification read** (INFO): `{ userId, notificationId }`

### 4.5 Errors (System-wide)

* **Unhandled errors** (ERROR): `{ userId, route, errorStack }`
* **DB errors** (ERROR): `{ query, error }`

---

## 5. Audit Trail (Database)

### 5.1 `audit_logs` Table Schema

| Column      | Type        | Description                                 |
| ----------- | ----------- | ------------------------------------------- |
| `id`        | UUID (PK)   | Log entry ID                                |
| `timestamp` | Timestamptz | Event time                                  |
| `user_id`   | UUID        | Acting user (nullable)                      |
| `action`    | Text        | e.g., `inventory_create`, `file_upload`     |
| `entity`    | Text        | `inventory`, `file`, `user`, `notification` |
| `entity_id` | UUID/Text   | Related object ID                           |
| `metadata`  | JSONB       | Additional context                          |
| `success`   | Boolean     | Was the action successful?                  |

---

### 5.2 Audit Examples

* Inventory created:

```json
{
  "action": "inventory_create",
  "entity": "inventory",
  "entity_id": "item-uuid",
  "user_id": "user-uuid",
  "metadata": { "name": "Gold Ring", "quantity": 5, "price": 1200 },
  "success": true
}
```

* File upload failed:

```json
{
  "action": "file_upload",
  "entity": "file",
  "entity_id": "invoices/user123/file.png",
  "user_id": "user-uuid",
  "metadata": { "fileName": "file.png", "size": 5_200_000 },
  "success": false
}
```

---

## 6. Implementation Guidelines

1. **Central Logging Utility (`lib/logger.ts`)**

   * Wrapper around `console.log` that always outputs JSON.
   * Automatically attach `timestamp` + `requestId`.

2. **Request Correlation**

   * Generate `requestId = crypto.randomUUID()` in each API route.
   * Pass `requestId` to all log calls inside that request.

3. **Audit Logging Helper**

   ```ts
   async function auditLog({
     userId, action, entity, entityId, metadata, success
   }: AuditLogInput) {
     await supabaseServer.from("audit_logs").insert({
       user_id: userId,
       action,
       entity,
       entity_id: entityId,
       metadata,
       success
     });
   }
   ```

4. **Error Handling**

   * Wrap all API routes in `try/catch`.
   * Log both structured error (JSON log) + insert audit log (if relevant).

---

## 7. Minimum Acceptable Logging

✅ **Must log:**

* User login/logout
* Inventory item create/update/delete
* File uploads (all outcomes)
* Errors in API routes

✅ **Should log:**

* Notifications
* Unauthorized access attempts

✅ **Can log later (nice-to-have):**

* Performance metrics (latency, request size)
* System health checks

---

## 8. Storage & Retention

* **Structured JSON logs** → Console → Pipe to hosting provider’s log system (Vercel, Cloudflare, or external service).
* **Audit logs table** → Permanent, immutable records for business-critical actions.
* Retain at least **1 year** of audit logs (business requirement).

---

# ✅ Summary

* Add **structured JSON logs** in all API routes.
* Use a central `audit_logs` table for business-critical actions (inventory, uploads).
* Attach `requestId` to trace user actions across logs.
* Capture both **user events** and **system errors**.

---
