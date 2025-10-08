# Quick Route Reference

A quick lookup guide for all routes in the Sethiya Gold application.

## Public Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/resources` | Resources hub |
| `/resources/blog` | Blog |
| `/resources/contact-us` | Contact form |
| `/resources/faq` | FAQ |
| `/resources/tutorials` | Tutorials |
| `/resources/terms-and-conditions` | Terms |
| `/resources/documentation` | Documentation hub |
| `/resources/documentation/getting-started` | Getting started guide |
| `/resources/documentation/system-requirements` | System requirements |
| `/resources/documentation/dashboard-overview` | Dashboard guide |
| `/resources/documentation/account-setup` | Account setup |

## Protected Routes

### Core
| Route | Purpose |
|-------|---------|
| `/dashboard` | Main dashboard |
| `/profile` | User profile |
| `/settings` | App settings |

### Invoices
| Route | Purpose |
|-------|---------|
| `/create-invoice` | Create invoice |
| `/invoices` | List invoices |
| `/invoices/[id]` | View invoice |
| `/invoices/[id]/edit` | Edit invoice |

### Stock
| Route | Purpose |
|-------|---------|
| `/stock` | List stock |
| `/stock/add` | Add item |
| `/stock/[id]` | View item |
| `/stock/[id]/edit` | Edit item |

### Customers
| Route | Purpose |
|-------|---------|
| `/customers` | List customers |
| `/customers/add` | Add customer |
| `/customers/[id]` | View customer |
| `/customers/[id]/edit` | Edit customer |

### Bookings
| Route | Purpose |
|-------|---------|
| `/bookings` | List bookings |
| `/bookings/create` | Create booking |

### Purchases
| Route | Purpose |
|-------|---------|
| `/purchases` | Purchases hub |
| `/purchases/invoices/add` | Add purchase invoice |
| `/purchases/invoices/[id]` | View purchase invoice |
| `/purchases/invoices/[id]/edit` | Edit purchase invoice |
| `/purchases/suppliers/add` | Add supplier |
| `/purchases/suppliers/[id]` | View supplier |
| `/purchases/suppliers/[id]/edit` | Edit supplier |

## Missing Routes (Linked but Don't Exist)

⚠️ These routes are referenced in the app but don't have page files:

- `/reports` - Analytics/reports page
- `/login` - Dedicated login page
- Multiple documentation sub-routes (see ROUTE_MAP.md for full list)

## Route Logger Console Commands

```javascript
// View navigation history
window.getRouteHistory()

// Clear history
window.clearRouteHistory()

// Export history (persistent logger only)
window.exportRouteHistory()
```

## Quick Navigation from Dashboard

```
Dashboard → Create Invoice: /create-invoice
Dashboard → View Invoices: /invoices
Dashboard → Stock: /stock
Dashboard → Customers: /customers
Dashboard → Purchases: /purchases
Dashboard → Settings: /settings
Dashboard → Profile: /profile
```

## Common Patterns

### Add/Create Pattern
- `/stock/add` - Add stock
- `/customers/add` - Add customer
- `/bookings/create` - Create booking
- `/purchases/invoices/add` - Add purchase
- `/purchases/suppliers/add` - Add supplier

### View Detail Pattern
- `/stock/[id]` - Stock item
- `/customers/[id]` - Customer
- `/invoices/[id]` - Invoice
- `/purchases/invoices/[id]` - Purchase invoice
- `/purchases/suppliers/[id]` - Supplier

### Edit Pattern
- `/stock/[id]/edit`
- `/customers/[id]/edit`
- `/invoices/[id]/edit`
- `/purchases/invoices/[id]/edit`
- `/purchases/suppliers/[id]/edit`

## File Paths

All routes are in `/Users/ronak/Coding/jewelry-invoice/app/`

See ROUTE_MAP.md for complete file path mappings.
