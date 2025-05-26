**Planning Phase:**

**A. Step-by-step Implementation Plan:**

1.  **Create the Invoice List Page (`/app/invoices/page.tsx`):**
    *   This page will display a list of all invoices associated with the logged-in user.
    *   Implement UI elements for:
        *   A header section with the page title ("Invoices") and a button to "Create New Invoice" (linking to `/create-invoice`).
        *   Search input field for searching by customer name.
        *   Date range filter controls (e.g., two date pickers for start and end date).
        *   A sort control (e.g., a dropdown or button) to sort invoices by date (ascending/descending).
        *   A table or a list of cards to display invoices. Each entry should show: Invoice Number, Customer Name (Snapshot), Invoice Date, Grand Total, and Status.
        *   Action buttons for each invoice: "View Details", "Print", "Edit", "Delete".
        *   Pagination controls if the number of invoices exceeds a certain limit (e.g., 10 per page).
    *   Fetch invoice data from the `invoices` table in Supabase, filtered by `user_id`.
    *   Handle loading and empty states.

2.  **Implement Backend Logic for Invoice List:**
    *   In `app/invoices/page.tsx`, write a function to fetch invoices from Supabase.
    *   This function should support:
        *   Filtering by customer name (using `ilike` on `customer_name_snapshot`).
        *   Filtering by date range (on `invoice_date`).
        *   Sorting by `invoice_date`.
        *   Pagination (using `range()` in Supabase query).
    *   Fetch the total count of invoices for pagination.

3.  **Create the Individual Invoice Detail Page (`/app/invoices/[id]/page.tsx`):**
    *   This page will display the full details of a single invoice.
    *   Fetch the specific invoice data from the `invoices` table and its associated items from the `invoice_items` table using the invoice `id` from the URL parameters and `user_id`.
    *   Reuse or adapt the `InvoicePreview` component (`app/create-invoice/invoice-preview.tsx`) to display the invoice details.
    *   Implement UI elements for actions: "Print", "Download PDF", "Edit", "Mark as Paid".
    *   The "Edit" button should link to a new page (e.g., `/invoices/[id]/edit`).
    *   The "Mark as Paid" button will update the `status` field of the invoice in the database.
    *   Handle loading states and cases where an invoice is not found.

4.  **Implement "Print" Functionality for Individual Invoice:**
    *   On the `app/invoices/[id]/page.tsx` page, use `react-to-print` similar to how it's used in `app/create-invoice/page.tsx` to print the `InvoicePreview` component.

5.  **Implement "Download PDF" Functionality for Individual Invoice:**
    *   On the `app/invoices/[id]/page.tsx` page, use the `PDFDownloadLinkWrapper` and `InvoicePDF` components (similar to `app/create-invoice/page.tsx`) to allow downloading the invoice as a PDF. The `InvoicePDF` component will need to be able to take invoice data props.

6.  **Implement "Mark as Paid" Functionality:**
    *   On `app/invoices/[id]/page.tsx`, add a button "Mark as Paid".
    *   Clicking this button will trigger an update to the Supabase `invoices` table, setting the `status` field for the current invoice to `paid`.
    *   Provide visual feedback (e.g., toast notification) and update the UI to reflect the new status.

7.  **Implement "Edit Invoice" Functionality (Stub/Placeholder for now):**
    *   Create a new page `app/invoices/[id]/edit/page.tsx`.
    *   For now, this page can be a simple placeholder indicating "Edit Invoice functionality coming soon" or it can pre-fill a form similar to `app/create-invoice/page.tsx` with the existing invoice data.
    *   The "Edit" button on the invoice list and invoice detail page should link here.
    *   *Detailed implementation of editing is a separate feature but the navigation and basic page structure should be set up.*

8.  **Implement "Delete Invoice" Functionality:**
    *   On `app/invoices/page.tsx` (the list view), add a "Delete" button for each invoice.
    *   Use an `AlertDialog` to confirm deletion.
    *   Upon confirmation, delete the invoice from the `invoices` table and its associated items from `invoice_items`.
    *   **Important:** Consider cascade delete settings in Supabase for `invoice_items` when an invoice is deleted, or handle it manually.
    *   Refresh the invoice list or remove the item from the local state.

9.  **Update Dashboard Link:**
    *   Ensure the "View Invoices" card/link on the dashboard (`app/dashboard/page.tsx`) correctly navigates to `/invoices`.

10. **Add Loading States and Error Handling:**
    *   Implement loading indicators (e.g., skeletons or spinners) for data fetching on both list and detail pages.
    *   Display user-friendly error messages if data fetching fails or an invoice is not found.

**B. Impacted Files/Functions/Classes:**

*   **New Files:**
    *   `app/invoices/page.tsx` (Invoice list page)
    *   `app/invoices/loading.tsx` (Loading UI for invoice list)
    *   `app/invoices/[id]/page.tsx` (Individual invoice detail page)
    *   `app/invoices/[id]/loading.tsx` (Loading UI for invoice detail)
    *   `app/invoices/[id]/edit/page.tsx` (Edit invoice page - can be a placeholder initially)
    *   Potentially a new component for individual invoice items in the list if a card-based layout is chosen for `/invoices/page.tsx`.
*   **Modified Files:**
    *   `app/dashboard/page.tsx`: Update link for "View Invoices" to point to `/invoices`.
    *   `app/create-invoice/invoice-preview.tsx`: May need slight adjustments to be reusable for displaying existing invoices (if not already generic enough).
    *   `app/create-invoice/invoice-pdf.tsx`: May need slight adjustments to be reusable for displaying existing invoices.
    *   `app/create-invoice/pdf-download-link-wrapper.tsx`: Ensure it can handle invoice data passed as props for existing invoices.
    *   `lib/supabase.ts`: No direct changes, but its client will be used for new queries.
    *   `lib/database.types.ts`: No changes expected unless new specific view types are needed.
    *   `components/ui/table.tsx` (or new list item component): Will be used on `app/invoices/page.tsx`.
    *   `components/ui/pagination.tsx`: Will be used on `app/invoices/page.tsx`.
    *   `components/ui/input.tsx`, `components/ui/button.tsx`, `components/ui/date-picker.tsx` (from `app/bookings/create/date-picker.tsx` or a new shared one), `components/ui/select.tsx`: For search, filter, and sort controls on `app/invoices/page.tsx`.
    *   `components/ui/alert-dialog.tsx`: For delete confirmation.
    *   `components/ui/toast.tsx` & `hooks/use-toast.ts`: For notifications.
    *   `components/ui/skeleton.tsx`: For loading states.

**C. Configuration or Database Migrations:**

*   **Database:**
    *   No schema migrations are immediately obvious for *viewing* existing invoices, as we'll be querying existing tables (`invoices`, `invoice_items`, `customers`, `user_settings`).
    *   However, ensure the `invoices` table has a `status` column (e.g., 'draft', 'finalized', 'paid', 'cancelled'). If not, this column needs to be added. Based on `app/create-invoice/page.tsx` which sets `status: 'finalized'`, this column likely exists.
    *   Ensure appropriate RLS (Row Level Security) policies are in place for the `invoices` and `invoice_items` tables to allow users to only access their own data.
*   **Configuration:**
    *   No new environment variables are anticipated for this feature.
