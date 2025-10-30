# API Documentation

**Version:** 1.0
**Base URL:** `/api`
**Authentication:** Bearer token (JWT) required for all endpoints
**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Settings API](#settings-api)
3. [Suppliers API](#suppliers-api)
4. [Stock API](#stock-api)
5. [Invoices API](#invoices-api)
6. [Customers API](#customers-api)
7. [Purchases API](#purchases-api)
8. [Storage API](#storage-api)
9. [AI Chat API](#ai-chat-api)
10. [Error Handling](#error-handling)
11. [Response Format](#response-format)

---

## Authentication

All API endpoints require authentication via Bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

Obtain the JWT token from Supabase authentication:

```typescript
const { data: { session } } = await supabase.auth.getSession()
const token = session.access_token
```

---

## Settings API

### Get User Settings

```http
GET /api/settings
```

**Response:**
```json
{
  "data": {
    "user_id": "uuid",
    "firm_name": "string",
    "firm_address": "string",
    "firm_phone": "string",
    "firm_email": "string",
    "firm_gstin": "string",
    "invoice_default_prefix": "INV-",
    "invoice_next_number": 1,
    "photo_compression_level": "medium",
    ...
  }
}
```

### Update Settings (Partial)

```http
PATCH /api/settings
```

**Body:**
```json
{
  "firm_name": "New Firm Name",
  "firm_phone": "+1234567890"
}
```

### Update Settings (Full Replace)

```http
PUT /api/settings
```

### Increment Invoice Number

```http
POST /api/settings/invoice-number
```

**Response:**
```json
{
  "data": {
    "current": 100,
    "next": 101
  }
}
```

### Set Invoice Number

```http
PUT /api/settings/invoice-number
```

**Body:**
```json
{
  "number": 200
}
```

---

## Suppliers API

### List Suppliers

```http
GET /api/purchases/suppliers?search={query}
```

**Query Parameters:**
- `search` (optional): Filter by supplier name

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Supplier Name",
      "email": "supplier@example.com",
      "phone": "+1234567890",
      "address": "123 Street",
      "contact_person": "John Doe",
      "notes": "Notes",
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "uuid"
    }
  ]
}
```

### Create Supplier

```http
POST /api/purchases/suppliers
```

**Body:**
```json
{
  "name": "Supplier Name",
  "email": "supplier@example.com",
  "phone": "+1234567890",
  "address": "123 Street",
  "contact_person": "John Doe",
  "notes": "Notes"
}
```

### Get Supplier

```http
GET /api/purchases/suppliers/{id}
```

### Update Supplier

```http
PUT /api/purchases/suppliers/{id}
```

**Body:** Same as create, all fields optional

### Delete Supplier

```http
DELETE /api/purchases/suppliers/{id}
```

**Note:** Cannot delete if supplier has purchase invoices

---

## Stock API

### List Stock Items

```http
GET /api/stock?sold={true|false}
```

**Query Parameters:**
- `sold` (optional): Filter by sold status

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "item_number": "ITEM-001",
      "category": "Ring",
      "material": "Gold",
      "weight": 10.5,
      "purity": "22K",
      "purchase_price": 50000,
      "description": "Description",
      "supplier": "Supplier Name",
      "purchase_date": "2024-01-01",
      "image_urls": ["url1", "url2"],
      "is_sold": false,
      "sold_at": null,
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "uuid"
    }
  ]
}
```

### Create Stock Item

```http
POST /api/stock
```

**Body:**
```json
{
  "item_number": "ITEM-001",
  "category": "Ring",
  "material": "Gold",
  "weight": 10.5,
  "purchase_price": 50000,
  "purity": "22K",
  "description": "Description",
  "supplier": "Supplier Name",
  "purchase_date": "2024-01-01",
  "image_urls": ["url1", "url2"]
}
```

**Required:** `category`, `material`, `item_number`, `weight`, `purchase_price`

### Get Stock Item

```http
GET /api/stock/{id}
```

### Update Stock Item

```http
PUT /api/stock/{id}
```

**Body:** Same as create, all fields optional

### Delete Stock Item

```http
DELETE /api/stock/{id}
```

### Mark as Sold/Unsold

```http
POST /api/stock/{id}/actions
```

**Body:**
```json
{
  "action": "mark_sold"
}
```

**Actions:**
- `mark_sold`: Mark item as sold
- `mark_unsold`: Mark item as unsold

---

## Invoices API

### List Invoices

```http
GET /api/invoices?search={query}&dateFrom={date}&dateTo={date}&status={status}&page={n}&limit={n}
```

**Query Parameters:**
- `search` (optional): Filter by customer name or invoice number
- `dateFrom` (optional): Filter by date range start (YYYY-MM-DD)
- `dateTo` (optional): Filter by date range end (YYYY-MM-DD)
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-0001",
      "invoice_date": "2024-01-01",
      "customer_id": "uuid",
      "customer_name_snapshot": "John Doe",
      "customer_phone_snapshot": "+1234567890",
      "firm_name_snapshot": "My Firm",
      "subtotal": 10000,
      "gst_percentage": 3,
      "gst_amount": 300,
      "grand_total": 10300,
      "status": "finalized",
      "notes": "Notes",
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "uuid"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 100
  }
}
```

### Create Invoice

```http
POST /api/invoices
```

**Body:**
```json
{
  "customer_id": "uuid",
  "customer_name_snapshot": "John Doe",
  "customer_phone_snapshot": "+1234567890",
  "customer_email_snapshot": "john@example.com",
  "customer_address_snapshot": "123 Street",
  "firm_name_snapshot": "My Firm",
  "firm_address_snapshot": "456 Avenue",
  "firm_phone_snapshot": "+9876543210",
  "firm_gstin_snapshot": "GSTIN123",
  "invoice_date": "2024-01-01",
  "subtotal": 10000,
  "gst_percentage": 3,
  "gst_amount": 300,
  "grand_total": 10300,
  "status": "finalized",
  "notes": "Notes",
  "items": [
    {
      "name": "Gold Ring",
      "quantity": 1,
      "weight": 10.5,
      "price_per_gram": 5000,
      "total": 52500
    }
  ]
}
```

**Required:** `customer_name_snapshot`, `firm_name_snapshot`, `invoice_date`, `subtotal`, `gst_percentage`, `gst_amount`, `grand_total`, `items` (at least 1)

**Response:** Invoice with auto-generated `invoice_number` and items

### Get Invoice

```http
GET /api/invoices/{id}
```

**Response:** Invoice with items joined

### Update Invoice

```http
PUT /api/invoices/{id}
```

**Body:** Same as create (excluding items), all fields optional

**Note:** Does not update items (items are immutable)

### Delete Invoice

```http
DELETE /api/invoices/{id}
```

**Note:** Cascade deletes invoice items via foreign key

---

## Customers API

### List Customers

```http
GET /api/customers?search={query}&referred={true|false}
```

**Query Parameters:**
- `search` (optional): Filter by customer name
- `referred` (optional): Filter by referred customers only

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Street",
      "identity_type": "pan_card",
      "identity_reference": "ABCDE1234F",
      "identity_doc": "identity_docs/path/to/file.pdf",
      "referred_by": "Jane Doe",
      "referral_notes": "Notes",
      "notes": "Customer notes",
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "uuid"
    }
  ]
}
```

### Create Customer

```http
POST /api/customers
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Street",
  "identity_type": "pan_card",
  "identity_reference": "ABCDE1234F",
  "identity_doc": "identity_docs/path/to/file.pdf",
  "referred_by": "Jane Doe",
  "referral_notes": "Notes",
  "notes": "Customer notes"
}
```

**Required:** `name`

**Identity Types:** `pan_card`, `aadhaar_card`, `others`, `none`

**Note:** `identity_reference` required when `identity_type` is `others`

### Get Customer

```http
GET /api/customers/{id}
```

### Update Customer

```http
PUT /api/customers/{id}
```

**Body:** Same as create, all fields optional

### Delete Customer

```http
DELETE /api/customers/{id}
```

**Note:** Cannot delete if customer has invoices

---

## Purchases API

### List Purchase Invoices

```http
GET /api/purchases/invoices?search={query}&status={status}&payment_status={status}
```

**Query Parameters:**
- `search` (optional): Filter by purchase number or invoice number
- `status` (optional): Filter by status (Received, Pending, Cancelled)
- `payment_status` (optional): Filter by payment status (Paid, Unpaid, Partially Paid)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "purchase_number": "P-123456",
      "invoice_number": "INV-001",
      "invoice_date": "2024-01-01",
      "supplier_id": "uuid",
      "amount": 50000,
      "status": "Received",
      "payment_status": "Paid",
      "number_of_items": 10,
      "notes": "Notes",
      "invoice_file_url": "purchase-invoices/path/to/file.pdf",
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "uuid",
      "suppliers": {
        "name": "Supplier Name"
      }
    }
  ]
}
```

### Create Purchase Invoice

```http
POST /api/purchases/invoices
```

**Body:**
```json
{
  "purchase_number": "P-123456",
  "invoice_number": "INV-001",
  "invoice_date": "2024-01-01",
  "supplier_id": "uuid",
  "amount": 50000,
  "status": "Received",
  "payment_status": "Paid",
  "number_of_items": 10,
  "notes": "Notes",
  "invoice_file_url": "purchase-invoices/path/to/file.pdf"
}
```

**Required:** `invoice_number`, `invoice_date`, `amount`

**Auto-generated:** `purchase_number` (if not provided): `P-{timestamp}`

**Status values:** `Received`, `Pending`, `Cancelled`

**Payment status values:** `Paid`, `Unpaid`, `Partially Paid`

### Get Purchase Invoice

```http
GET /api/purchases/invoices/{id}
```

**Response:** Purchase invoice with supplier joined

### Update Purchase Invoice

```http
PUT /api/purchases/invoices/{id}
```

**Body:** Same as create, all fields optional

### Delete Purchase Invoice

```http
DELETE /api/purchases/invoices/{id}
```

---

## Storage API

### Upload File

```http
POST /api/storage/upload
```

**Content-Type:** `multipart/form-data`

**Body (FormData):**
- `file`: File to upload
- `bucket`: Bucket name (`identity_docs`, `purchase-invoices`, `stock_item_images`)
- `path`: File path within bucket

**Response:**
```json
{
  "data": {
    "path": "user-id/filename.ext"
  }
}
```

### Get Signed URL

```http
POST /api/storage/signed-url
```

**Body:**
```json
{
  "bucket": "stock_item_images",
  "path": "user-id/filename.ext",
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "data": {
    "url": "https://..."
  }
}
```

---

## AI Chat API

### Create/Get Active Session

```http
POST /api/ai/chat/new-session
```

### Get All Sessions

```http
GET /api/ai/chat/sessions
```

### Get Session History

```http
GET /api/ai/chat/history?sessionId={id}&limit={n}
```

### Send Chat Message

```http
POST /api/ai/chat
```

**Body:**
```json
{
  "message": "Your message",
  "sessionId": "uuid"
}
```

### Execute AI Action

```http
POST /api/ai/execute-action
```

**Body:**
```json
{
  "action": "action_name",
  "data": {}
}
```

### Extract Bill (OCR)

```http
POST /api/ai/extract-bill
```

**Content-Type:** `multipart/form-data`

**Body:**
- `file`: Image file

### Voice Transcription

```http
POST /api/ai/voice/transcribe
```

**Content-Type:** `multipart/form-data`

**Body:**
- `audio`: Audio file

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "status": 400
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Messages

- `"Unauthorized"` - Missing or invalid authentication token
- `"[Field] is required"` - Missing required field
- `"Invalid [field] value"` - Field validation failed
- `"[Resource] not found"` - Resource doesn't exist or doesn't belong to user
- `"Cannot delete [resource] with existing [references]"` - Foreign key constraint

---

## Response Format

### Success Response

```json
{
  "data": <response_data>,
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 100
  }
}
```

**Note:** `meta` is only present for paginated list endpoints

### Error Response

```json
{
  "error": "Error message",
  "status": 400
}
```

---

## Best Practices

### Authentication
Always include the Bearer token in the Authorization header:

```typescript
const response = await fetch('/api/customers', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Using the API Client
Use the provided API client for type-safe requests:

```typescript
import { apiClient, apiPost, apiPut, apiDelete } from '@/lib/api/client'

// GET request
const response = await apiClient<Customer[]>('/customers')

// POST request
const response = await apiPost<Customer>('/customers', data)

// PUT request
const response = await apiPut<Customer>('/customers/123', updates)

// DELETE request
const response = await apiDelete('/customers/123')
```

### Using Hooks
Use the provided hooks for state management:

```typescript
import useCustomers from '@/lib/hooks/useCustomers'

function MyComponent() {
  const {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomers({ search: 'John' })

  // Component logic...
}
```

### Error Handling
Always check for errors in the response:

```typescript
const response = await apiClient('/customers')

if (response.error) {
  console.error('Error:', response.error)
  // Handle error
} else {
  console.log('Data:', response.data)
  // Process data
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production use.

---

## Versioning

API Version: 1.0

Future versions may include version prefix: `/api/v2/...`

---

**Last Updated:** 2025-10-30
**API Version:** 1.0
