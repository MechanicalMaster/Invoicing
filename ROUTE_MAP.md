# Route Map - Sethiya Gold Jewelry Management System

**Generated:** 2025-10-08
**Application Path:** `/Users/ronak/Coding/jewelry-invoice`

---

## Table of Contents
- [Overview](#overview)
- [Route Structure](#route-structure)
- [Layout Hierarchy](#layout-hierarchy)
- [Navigation Flow](#navigation-flow)
- [Component Usage Analysis](#component-usage-analysis)
- [Orphaned Components](#orphaned-components)

---

## Overview

This Next.js 13+ application uses the App Router with the following structure:
- **Total Routes:** 35 pages
- **Layouts:** 5 layout files
- **Dynamic Routes:** 9 routes with dynamic segments
- **Auth-Protected Routes:** Most routes require authentication

---

## Route Structure

### Public Routes (No Auth Required)

| Route | File Path | Description |
|-------|-----------|-------------|
| `/` | `/app/page.tsx` | Landing page with features, testimonials, and CTA |
| `/resources` | `/app/resources/page.tsx` | Resources hub page |
| `/resources/blog` | `/app/resources/blog/page.tsx` | Blog listing page |
| `/resources/contact-us` | `/app/resources/contact-us/page.tsx` | Contact form |
| `/resources/faq` | `/app/resources/faq/page.tsx` | FAQ page |
| `/resources/terms-and-conditions` | `/app/resources/terms-and-conditions/page.tsx` | Terms and conditions |
| `/resources/tutorials` | `/app/resources/tutorials/page.tsx` | Tutorials listing |
| `/resources/documentation` | `/app/resources/documentation/page.tsx` | Documentation hub |
| `/resources/documentation/getting-started` | `/app/resources/documentation/getting-started/page.tsx` | Getting started guide |
| `/resources/documentation/system-requirements` | `/app/resources/documentation/system-requirements/page.tsx` | System requirements |
| `/resources/documentation/dashboard-overview` | `/app/resources/documentation/dashboard-overview/page.tsx` | Dashboard overview guide |
| `/resources/documentation/account-setup` | `/app/resources/documentation/account-setup/page.tsx` | Account setup guide |

### Protected Routes (Auth Required)

#### Dashboard & Core
| Route | File Path | Description |
|-------|-----------|-------------|
| `/dashboard` | `/app/dashboard/page.tsx` | Main dashboard with navigation tiles |
| `/profile` | `/app/profile/page.tsx` | User profile page |
| `/settings` | `/app/settings/page.tsx` | Application settings |

#### Invoices
| Route | File Path | Description |
|-------|-----------|-------------|
| `/create-invoice` | `/app/create-invoice/page.tsx` | Invoice creation form with PDF generation |
| `/invoices` | `/app/invoices/page.tsx` | Invoice listing and management |
| `/invoices/[id]` | `/app/invoices/[id]/page.tsx` | View specific invoice details |
| `/invoices/[id]/edit` | `/app/invoices/[id]/edit/page.tsx` | Edit existing invoice |

#### Stock Management
| Route | File Path | Description |
|-------|-----------|-------------|
| `/stock` | `/app/stock/page.tsx` | Stock listing with category/table views |
| `/stock/add` | `/app/stock/add/page.tsx` | Add new stock item |
| `/stock/[id]` | `/app/stock/[id]/page.tsx` | View stock item details with image gallery |
| `/stock/[id]/edit` | `/app/stock/[id]/edit/page.tsx` | Edit stock item |

#### Customers
| Route | File Path | Description |
|-------|-----------|-------------|
| `/customers` | `/app/customers/page.tsx` | Customer listing |
| `/customers/add` | `/app/customers/add/page.tsx` | Add new customer |
| `/customers/[id]` | `/app/customers/[id]/page.tsx` | View customer details and history |
| `/customers/[id]/edit` | `/app/customers/[id]/edit/page.tsx` | Edit customer information |

#### Bookings
| Route | File Path | Description |
|-------|-----------|-------------|
| `/bookings` | `/app/bookings/page.tsx` | Bookings listing |
| `/bookings/create` | `/app/bookings/create/page.tsx` | Create new booking with date picker |

#### Purchases
| Route | File Path | Description |
|-------|-----------|-------------|
| `/purchases` | `/app/purchases/page.tsx` | Purchases hub with tabs for invoices/suppliers |
| `/purchases/invoices/add` | `/app/purchases/invoices/add/page.tsx` | Add purchase invoice |
| `/purchases/invoices/[id]` | `/app/purchases/invoices/[id]/page.tsx` | View purchase invoice |
| `/purchases/invoices/[id]/edit` | `/app/purchases/invoices/[id]/edit/page.tsx` | Edit purchase invoice |
| `/purchases/suppliers/add` | `/app/purchases/suppliers/add/page.tsx` | Add new supplier |
| `/purchases/suppliers/[id]` | `/app/purchases/suppliers/[id]/page.tsx` | View supplier details |
| `/purchases/suppliers/[id]/edit` | `/app/purchases/suppliers/[id]/edit/page.tsx` | Edit supplier information |

#### Special Routes
| Route | File Path | Description |
|-------|-----------|-------------|
| `/reports` | N/A - **MISSING** | Referenced in dashboard but no page exists |
| `404` | `/app/not-found.tsx` | Custom 404 page |

---

## Layout Hierarchy

### 1. Root Layout (`/app/layout.tsx`)
**Applies to:** All routes
**Key Features:**
- Theme provider (dark/light mode)
- Auth provider wrapper
- Notification provider
- Chat mode provider & chat context
- AI Chat floating button and panel
- Toast notifications
- Metadata: "Sethiya Gold - Premium Jewelry Management"

**Providers Stack:**
```
ThemeProvider
  └─ AuthProvider
      └─ NotificationProvider
          └─ ChatModeProvider
              └─ ChatProvider
                  └─ children
                  └─ ChatFloatingButton
                  └─ ChatPanel
                  └─ Toaster
```

### 2. Dashboard Layout (`/app/dashboard/layout.tsx`)
**Applies to:** `/dashboard/*`
**Note:** Currently a pass-through layout with only metadata

### 3. Invoices Layout (`/app/invoices/layout.tsx`)
**Applies to:** `/invoices/*`
**Features:**
- Header with logo and back to dashboard link
- Auth provider wrapper
- Main content area with padding

### 4. Purchases Layout (`/app/purchases/layout.tsx`)
**Applies to:** `/purchases/*`
**Features:**
- Full header with navigation
- User dropdown menu (profile, logout)
- Auth protection with redirect
- Footer

### 5. Resources Layout (`/app/resources/layout.tsx`)
**Applies to:** `/resources/*`
**Features:**
- Simple header with logo/brand
- Footer component
- No auth required
- Clean public-facing design

---

## Navigation Flow

### Primary Navigation Paths

#### From Landing Page (`/`)
```
/ (Landing)
 ├─ Login (Auth Modal) → /dashboard
 ├─ /resources/documentation → Documentation hub
 ├─ /resources/tutorials → Tutorials
 ├─ /resources/blog → Blog
 ├─ /resources/contact-us → Contact form
 └─ /resources/faq → FAQ
```

#### From Dashboard (`/dashboard`)
```
/dashboard (Main hub)
 ├─ Sales Operations
 │   ├─ /create-invoice → Create new invoice
 │   ├─ /invoices → View all invoices
 │   └─ /bookings/create → Create booking
 ├─ Inventory & Stock
 │   └─ /stock → Stock management
 ├─ Purchasing
 │   └─ /purchases → Suppliers & purchase invoices
 ├─ Customer Management
 │   └─ /customers → Customer database
 ├─ Analytics
 │   └─ /reports → **MISSING PAGE**
 ├─ Configuration
 │   └─ /settings → App settings
 └─ User
     └─ /profile → User profile
```

#### Stock Management Flow
```
/stock (List view)
 ├─ /stock/add → Add new item
 ├─ /stock/[id] → View details
 │   └─ /stock/[id]/edit → Edit item
 └─ /dashboard (Back link)
```

#### Customer Management Flow
```
/customers (List view)
 ├─ /customers/add → Add new customer
 ├─ /customers/[id] → Customer details
 │   ├─ /customers/[id]/edit → Edit customer
 │   └─ /create-invoice → Create invoice for customer
 └─ /dashboard (Back link)
```

#### Invoice Flow
```
/invoices (List view)
 ├─ /create-invoice → New invoice
 ├─ /invoices/[id] → View invoice
 │   └─ /invoices/[id]/edit → Edit invoice
 └─ /dashboard (Back link)
```

#### Purchases Flow
```
/purchases (Hub with tabs)
 ├─ Invoices Tab
 │   ├─ /purchases/invoices/add → Add purchase invoice
 │   ├─ /purchases/invoices/[id] → View purchase
 │   └─ /purchases/invoices/[id]/edit → Edit purchase
 └─ Suppliers Tab
     ├─ /purchases/suppliers/add → Add supplier
     ├─ /purchases/suppliers/[id] → View supplier
     └─ /purchases/suppliers/[id]/edit → Edit supplier
```

#### Resources Flow
```
/resources (Hub)
 ├─ /resources/documentation → Docs hub
 │   ├─ /resources/documentation/getting-started
 │   ├─ /resources/documentation/system-requirements
 │   ├─ /resources/documentation/account-setup
 │   └─ /resources/documentation/dashboard-overview
 ├─ /resources/tutorials → Tutorials
 ├─ /resources/blog → Blog
 ├─ /resources/contact-us → Contact
 ├─ /resources/faq → FAQ
 └─ /resources/terms-and-conditions → Terms
```

### Common Navigation Patterns

**Back to Dashboard:**
- Nearly all protected routes have a "Back to Dashboard" or "Dashboard" link
- Consistent header pattern across most pages

**User Menu (Dropdown):**
- Profile (`/profile`)
- Settings (`/settings`)
- Change Password (functionality exists in dropdown but no dedicated route)
- Logout (signs out and redirects to `/`)

---

## Component Usage Analysis

### Active Components (Imported & Used)

#### App-Level Components (`/app/components/`)
| Component | File Path | Used In | Status |
|-----------|-----------|---------|--------|
| `AuthModal` | `/app/components/auth-modal.tsx` | `/app/page.tsx` (landing) | ✅ Active |
| `Footer` | `/app/components/footer/footer.tsx` | `/app/resources/layout.tsx`, `/app/bookings/page.tsx` | ✅ Active |
| `RecentInvoices` | `/app/components/recent-invoices.tsx` | **NONE** | ⚠️ Orphaned |
| `InvoiceStats` | `/app/components/invoice-stats.tsx` | **NONE** | ⚠️ Orphaned |

#### Stock Components
| Component | File Path | Used In | Status |
|-----------|-----------|---------|--------|
| `StockItemCard` | `/app/stock/stock-item-card.tsx` | `/app/stock/page.tsx` | ✅ Active |
| `StockItemTable` | `/app/stock/stock-item-table.tsx` | `/app/stock/page.tsx` | ✅ Active |
| `StockCategoryCard` | `/app/stock/stock-category-card.tsx` | `/app/stock/page.tsx` | ✅ Active |
| `ImageGallery` | `/app/stock/[id]/image-gallery.tsx` | `/app/stock/[id]/page.tsx` | ✅ Active |
| `StockItemLabelPDF` | `/app/stock/components/stock-item-label-pdf.tsx` | Stock label feature | ✅ Active |
| `StockItemLabelDownloadWrapper` | `/app/stock/components/stock-item-label-download-wrapper.tsx` | Stock label feature | ✅ Active |

#### Invoice Components
| Component | File Path | Used In | Status |
|-----------|-----------|---------|--------|
| `InvoicePreview` | `/app/create-invoice/invoice-preview.tsx` | `/app/create-invoice/page.tsx`, `/app/invoices/[id]/page.tsx` | ✅ Active |
| `InvoicePDF` | `/app/create-invoice/invoice-pdf.tsx` | `/app/create-invoice/pdf-download-link-wrapper.tsx` | ✅ Active |
| `PDFDownloadLinkWrapper` | `/app/create-invoice/pdf-download-link-wrapper.tsx` | Invoice PDF generation | ✅ Active |
| `AddCustomerModal` | `/app/create-invoice/components/add-customer-modal.tsx` | `/app/create-invoice/page.tsx` | ✅ Active |

#### Customer Components
| Component | File Path | Used In | Status |
|-----------|-----------|---------|--------|
| `CustomerCard` | `/app/customers/customer-card.tsx` | `/app/customers/page.tsx` | ✅ Active |

#### Booking Components
| Component | File Path | Used In | Status |
|-----------|-----------|---------|--------|
| `DatePicker` | `/app/bookings/create/date-picker.tsx` | `/app/bookings/create/page.tsx` | ✅ Active |

#### Purchase Components
| Component | File Path | Used In | Status |
|-----------|-----------|---------|--------|
| `SupplierCard` | `/app/purchases/components/supplier-card.tsx` | Suppliers listing | ✅ Active |

#### Global Components (`/components/`)
| Component | File Path | Used In | Status |
|-----------|-----------|---------|--------|
| `ThemeProvider` | `/components/theme-provider.tsx` | Root layout | ✅ Active |
| `AuthProvider` | `/components/auth-provider.tsx` | Root layout, various pages | ✅ Active |
| `UserNav` | `/components/user-nav.tsx` | Headers (dropdown menu) | ✅ Active |
| `Header` | `/components/header.tsx` | Unknown | ❓ Usage unclear |
| `ModeToggle` | `/components/mode-toggle.tsx` | Theme switching | ✅ Likely Active |
| `SidebarToggle` | `/components/sidebar-toggle.tsx` | Unknown | ❓ Usage unclear |

#### UI Components (`/components/ui/`)
All UI components from shadcn/ui are actively used throughout the application.

---

## Orphaned Components

### Definitely Orphaned (Not Imported Anywhere)

1. **`RecentInvoices`** (`/app/components/recent-invoices.tsx`)
   - **Purpose:** Displays list of recent invoices with avatars
   - **Why Orphaned:** No imports found in codebase
   - **Potential Use:** Could be used on dashboard or invoice pages
   - **Recommendation:** Delete or integrate into dashboard

2. **`InvoiceStats`** (`/app/components/invoice-stats.tsx`)
   - **Purpose:** Bar chart showing monthly invoice totals
   - **Why Orphaned:** No imports found in codebase
   - **Potential Use:** Analytics dashboard or reports page
   - **Recommendation:** Use on `/reports` page (when created) or delete

### Potentially Orphaned (Usage Unclear)

3. **`Header`** (`/components/header.tsx`)
   - **Status:** Exists but no clear usage found
   - **Note:** May be replaced by inline headers in layouts

4. **`SidebarToggle`** (`/components/sidebar-toggle.tsx`)
   - **Status:** Exists but sidebar not actively used in current layouts
   - **Note:** Sidebar UI components exist but not implemented in layouts

---

## Missing Routes (Referenced But Don't Exist)

1. **`/reports`** - Referenced in `/app/dashboard/page.tsx` (line 240)
   - Has a dashboard tile linking to it
   - No page file exists
   - **Recommendation:** Create `/app/reports/page.tsx`

2. **`/login`** - Referenced in `/components/user-nav.tsx` (line 44)
   - Redirect target after logout
   - No dedicated login page (uses AuthModal instead)
   - **Recommendation:** Create dedicated login page or update redirect to `/`

3. **Documentation routes referenced but not created:**
   - `/resources/documentation/create-invoice`
   - `/resources/documentation/customizing-invoices`
   - `/resources/documentation/printing-invoices`
   - `/resources/documentation/invoice-management`
   - `/resources/documentation/invoicing` (category page)
   - `/resources/documentation/adding-items`
   - `/resources/documentation/inventory-categories`
   - `/resources/documentation/tracking-gold-rates`
   - `/resources/documentation/inventory-reports`
   - `/resources/documentation/inventory` (category page)
   - `/resources/documentation/adding-customers`
   - `/resources/documentation/customer-history`
   - `/resources/documentation/customer-reminders`
   - `/resources/documentation/customer-communications`
   - `/resources/documentation/customers` (category page)
   - These are linked from `/app/resources/documentation/page.tsx` but files don't exist

4. **`/resources/support#request-tutorial`** - Referenced in tutorials page but no support page exists

---

## Loading & Error States

### Loading Components
| Route | Loading File | Purpose |
|-------|-------------|---------|
| `/stock` | `/app/stock/loading.tsx` | Stock listing skeleton |
| `/customers` | `/app/customers/loading.tsx` | Customers listing skeleton |
| `/bookings` | `/app/bookings/loading.tsx` | Bookings listing skeleton |
| `/invoices` | `/app/invoices/loading.tsx` | Invoice listing skeleton |
| `/invoices/[id]` | `/app/invoices/[id]/loading.tsx` | Invoice detail skeleton |
| `/resources/documentation` | `/app/resources/documentation/loading.tsx` | Documentation skeleton |
| `/resources/documentation/*` | Individual loading.tsx files | Section-specific skeletons |
| `/resources/contact-us` | `/app/resources/contact-us/loading.tsx` | Contact form skeleton |
| `/resources/faq` | `/app/resources/faq/loading.tsx` | FAQ skeleton |
| `/resources/terms-and-conditions` | `/app/resources/terms-and-conditions/loading.tsx` | Terms skeleton |

### Error Handling
- Custom 404: `/app/not-found.tsx`
- No custom error.tsx files found (uses Next.js defaults)

---

## Special Features

### AI Chat Integration
- **Floating Button:** Available on all pages via root layout
- **Chat Panel:** Context-aware AI assistance
- **Providers:** ChatModeProvider and ChatProvider wrap entire app

### PDF Generation
- Invoice PDF generation using `@react-pdf/renderer`
- Stock item label printing functionality

### Authentication Flow
- Protected routes redirect to `/` if not authenticated
- AuthModal on landing page for sign-in/sign-up
- Logout redirects to `/` (should redirect to `/login` if it existed)

### Theme Support
- Dark/light mode toggle
- Theme persisted via ThemeProvider

---

## Recommendations

### High Priority
1. **Create `/reports` page** - Currently linked from dashboard but doesn't exist
2. **Fix orphaned components** - Either use or remove `RecentInvoices` and `InvoiceStats`
3. **Create documentation pages** - Multiple doc routes referenced but missing
4. **Standardize auth redirects** - Decide on `/` vs `/login` for logout redirect

### Medium Priority
5. **Add route logger** - Implement navigation tracking (see `RouteLogger` component)
6. **Create error.tsx files** - Better error handling for each route segment
7. **Audit sidebar components** - Decide if sidebar navigation should be implemented
8. **Create `/login` page** - Dedicated login page instead of just modal

### Low Priority
9. **Add route metadata** - Ensure all pages have proper metadata
10. **Implement breadcrumbs** - Improve navigation UX on deep routes
11. **Add route transitions** - Enhance navigation experience

---

## Route Logger Implementation

A route logger component has been created at `/components/route-logger.tsx` that can be added to the root layout to track all navigation events. See implementation details in that file.

**Usage:**
```tsx
// In app/layout.tsx
import { RouteLogger } from '@/components/route-logger'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RouteLogger />
        {children}
      </body>
    </html>
  )
}
```

---

## Summary Statistics

- **Total Page Routes:** 35
- **Public Routes:** 12
- **Protected Routes:** 23
- **Dynamic Routes:** 9
- **Layout Files:** 5
- **Loading States:** 11
- **Active Components:** ~25
- **Orphaned Components:** 2-4
- **Missing Referenced Routes:** 20+

---

*This route map is auto-generated. For the most up-to-date information, refer to the actual file structure and code.*
