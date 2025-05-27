**Planning Phase:**

Here's a step-by-step implementation plan:

**I. Backend Setup (Database - Supabase)**

1.  **Create `suppliers` table:**
    *   Fields:
        *   `id` (UUID, primary key, default: `uuid_generate_v4()`)
        *   `user_id` (UUID, foreign key to `auth.users.id`)
        *   `name` (TEXT, not null)
        *   `contact_person` (TEXT, nullable)
        *   `email` (TEXT, nullable, potentially with email format validation)
        *   `phone` (TEXT, nullable)
        *   `address` (TEXT, nullable)
        *   `notes` (TEXT, nullable)
        *   `created_at` (TIMESTAMPTZ, default: `now()`)
        *   `updated_at` (TIMESTAMPTZ, default: `now()`)
    *   Enable Row Level Security (RLS) policies for user-specific access.

2.  **Create `purchase_invoices` table:**
    *   Fields:
        *   `id` (UUID, primary key, default: `uuid_generate_v4()`)
        *   `user_id` (UUID, foreign key to `auth.users.id`)
        *   `purchase_number` (TEXT, not null, unique per user, can be auto-generated or manually entered. For simplicity, let's assume manual entry for now, matching "Purchase #" field)
        *   `supplier_id` (UUID, foreign key to `suppliers.id`, nullable if supplier can be entered ad-hoc without saving to suppliers table, but recommended to be not null)
        *   `invoice_number` (TEXT, not null, this is the supplier's invoice number)
        *   `invoice_date` (DATE, not null)
        *   `amount` (DECIMAL, not null)
        *   `status` (TEXT, not null, e.g., 'Received', 'Pending', 'Cancelled')
        *   `payment_status` (TEXT, not null, e.g., 'Paid', 'Unpaid', 'Partially Paid')
        *   `number_of_items` (INTEGER, nullable)
        *   `notes` (TEXT, nullable)
        *   `invoice_file_url` (TEXT, nullable, for uploaded invoice file)
        *   `created_at` (TIMESTAMPTZ, default: `now()`)
        *   `updated_at` (TIMESTAMPTZ, default: `now()`)
    *   Enable Row Level Security (RLS) policies for user-specific access.

3.  **Update `database.types.ts`:**
    *   Run Supabase CLI to generate new types for the `suppliers` and `purchase_invoices` tables and incorporate them into `lib/database.types.ts`.

**II. Frontend Implementation**

1.  **Update Dashboard (`app/dashboard/page.tsx`):**
    *   Add a new `Card` component for "Purchases".
    *   Use an appropriate `lucide-react` icon (e.g., `ShoppingCart`).
    *   Link this card to the new `/purchases` route.
    *   Position it logically among other cards (e.g., after "Sales" or "Stock").

2.  **Create Purchases Main Page (`app/purchases/page.tsx`):**
    *   Create a new directory `app/purchases/`.
    *   Create `page.tsx`, `loading.tsx`, and potentially `layout.tsx` within this directory.
    *   **`app/purchases/layout.tsx` (Optional but recommended for shared header/footer):**
        *   Include the standard site header (Logo, Dashboard link, User Dropdown) similar to `app/dashboard/layout.tsx` or other main section layouts.
        *   Include the standard site footer.
    *   **`app/purchases/page.tsx`:**
        *   Main title: "Purchases".
        *   Top right action buttons:
            *   "New Invoice" button linking to `/purchases/invoices/add`.
            *   "Add Supplier" button linking to `/purchases/suppliers/add`.
        *   Implement `Tabs` component from `@/components/ui/tabs`.
            *   Tab 1: "Invoices" (default).
            *   Tab 2: "Suppliers".

3.  **Implement "Invoices" Tab Content (within `app/purchases/page.tsx`):**
    *   **Data Fetching:** Fetch purchase invoices from the `purchase_invoices` table, joined with `suppliers` table to get supplier names.
    *   **Search Bar:** `Input` component with a `Search` icon for "Search purchases...". Filter data based on supplier name or invoice number.
    *   **Filters:**
        *   `Select` component for "All Statuses" (options: All, Received, Pending, Cancelled - *assuming these are the options*).
        *   `Select` component for "All Payment Statuses" (options: All, Paid, Unpaid, Partially Paid - *assuming these are the options*).
    *   **Sort Button:** `Button` component with `ArrowDownUp` icon for sorting (e.g., by date).
    *   **Table View:**
        *   Use `Table` component from `@/components/ui/table`.
        *   Columns: Purchase # (`purchase_number`), Date (`invoice_date`), Supplier (`suppliers.name`), Invoice # (`invoice_number`), Amount (`amount`), Status (`status`), Payment Status (`payment_status`), Items (`number_of_items`), Actions (View/Edit/Delete buttons - view/edit can link to `/purchases/invoices/[id]` later).
        *   Implement pagination if expecting many invoices.
    *   **Empty State:** If no invoices match filters or none exist, display "No purchase invoices found." message.

4.  **Create "Add New Purchase Invoice" Page (`app/purchases/invoices/add/page.tsx`):**
    *   Create new route and page.
    *   Standard page header.
    *   Title: "Add New Purchase Invoice".
    *   Use `Card` components for form sections.
    *   **Form Fields:**
        *   **Invoice Details Card:**
            *   `Invoice Number *`: `Input` (supplier's invoice number).
            *   `Invoice Date *`: `DatePicker` component (similar to `app/bookings/create/date-picker.tsx`).
            *   `Supplier *`: `Select` component. Fetch and list suppliers from the `suppliers` table. Add an option like "+ Add New Supplier" which could open a modal or redirect to the add supplier page.
            *   `Amount (₹) *`: `Input` type number.
        *   **Additional Information Card:**
            *   `Status`: `Select` component (options: Received, Pending, Cancelled - *or as specified*).
            *   `Payment Status`: `Select` component (options: Paid, Unpaid, Partially Paid - *or as specified*).
            *   `Number of Items`: `Input` type number.
            *   `Notes`: `Textarea`.
        *   **Upload Invoice File Card:**
            *   Implement a file upload component (drag & drop or standard file input).
            *   Store uploaded file to Supabase Storage and link URL in `purchase_invoices.invoice_file_url`.
    *   **Action Buttons:** "Save Invoice" (submit form) and "Cancel" (redirect to `/purchases`).
    *   **Logic:** On submit, validate data and insert into `purchase_invoices` table.

5.  **Implement "Suppliers" Tab Content (within `app/purchases/page.tsx`):**
    *   **Data Fetching:** Fetch suppliers from the `suppliers` table.
    *   **Search Bar:** `Input` component with `Search` icon for "Search suppliers...". Filter data based on supplier name.
    *   **Display View (assuming cards like customers for now):**
        *   If `filteredSuppliers.length > 0`, map through suppliers and display `SupplierCard` (to be created).
            *   `SupplierCard` should display key supplier info (Name, Contact Person, Phone/Email) and action buttons (View/Edit).
    *   **Empty State:** If no suppliers exist or match search, display:
        *   Icon (e.g., `Building` from `lucide-react`).
        *   Title: "No Suppliers Found".
        *   Subtitle: "Add your first supplier to get started with managing your supply chain."
        *   "Add Supplier" button (linking to `/purchases/suppliers/add`).

6.  **Create "Add New Supplier" Page (`app/purchases/suppliers/add/page.tsx`):**
    *   Create new route and page.
    *   Standard page header.
    *   Title: "Add New Supplier".
    *   Use `Card` components for form sections.
    *   **Form Fields:**
        *   **Basic Information Card:**
            *   `Supplier Name *`: `Input`.
            *   `Contact Person`: `Input`.
            *   `Email`: `Input` type email.
            *   `Phone`: `Input` type tel.
        *   **Additional Information Card:**
            *   `Address`: `Textarea`.
            *   `Notes`: `Textarea`.
        *   **Supplier Information Card (Static Text Block as per screenshot):**
            *   Display the informational text about supplier data usage.
    *   **Action Buttons:** "Save Supplier" (submit form) and "Cancel" (redirect to `/purchases` with Suppliers tab active).
    *   **Logic:** On submit, validate data and insert into `suppliers` table.

7.  **Create Reusable Components (if necessary):**
    *   **`SupplierCard` Component (e.g., `app/purchases/components/supplier-card.tsx`):** Similar to `app/customers/customer-card.tsx`, but for supplier data.
    *   **File Upload Component:** If not already existing, create a generic file uploader.

8.  **Styling and Theming:**
    *   Ensure all new pages and components adhere to the existing UI theme (Tailwind CSS, Shadcn UI).
    *   Reuse existing `Button`, `Card`, `Input`, `Select`, `Tabs`, `Table`, `Textarea`, `Label` components.

9.  **Navigation & Routing:**
    *   Update `next.config.mjs` if any specific configurations are needed (unlikely for this scope).
    *   Ensure all links and redirects work correctly.

**III. API/Supabase Interactions**

*   For each "Add" page, implement Supabase `insert` queries.
*   For list views on the main `/purchases` page, implement Supabase `select` queries with appropriate filters and ordering.
*   Handle loading states and error messages using `toast` notifications.
*   Ensure all Supabase interactions use `user.id` for RLS.

**IV. State Management**

*   Use `useState` and `useEffect` for local component state and data fetching.
*   Leverage `useAuth` for user authentication context.
