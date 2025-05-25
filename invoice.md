## Planning Phase

Here's a step-by-step implementation plan:

**a. Step-by-Step Implementation Plan**

1.  **Update `InvoiceData` Interface for Customer Details:**
    *   Modify the `InvoiceData` interface in `app/create-invoice/invoice-preview.tsx` to include customer address and contact details (phone, email).
    *   Impacted Files:
        *   `app/create-invoice/invoice-preview.tsx`
        *   `app/create-invoice/invoice-pdf.tsx` (will need to consume these new fields)
    *   Functions/Classes:
        *   `InvoiceData` interface.

2.  **Modify State for Customer and Items in `CreateInvoicePage`:**
    *   In `app/create-invoice/page.tsx`, change the `formData` state:
        *   Replace `customerName: string` with `selectedCustomerId: string | null` and `selectedCustomerDetails: CustomerType | null`.
        *   Change single item fields (`itemName`, `quantity`, `weight`, `pricePerGram`) to an array of item objects, e.g., `items: [{ id: string, name: "", quantity: 1, weight: 0, pricePerGram: 6450, itemTotal: 0 }]`. Each item should have a unique ID for list rendering (e.g., using `uuidv4`).
    *   Add state to manage the list of customers for the dropdown, e.g., `customers: CustomerType[]`.
    *   Add state for the "Add New Customer" modal, e.g., `isAddCustomerModalOpen: boolean`.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
    *   Functions/Classes:
        *   `useState` hooks for `formData`, `customers`, `isAddCustomerModalOpen`.

3.  **Implement Customer Dropdown and Fetch Customers:**
    *   In `app/create-invoice/page.tsx`, replace the "Customer Name" `Input` with a `Select` component.
    *   Fetch the list of customers (id and name) from the `customers` table in Supabase within a `useEffect` hook when the component mounts (similar to `app/customers/page.tsx`). Populate the `customers` state.
    *   The `Select` component should list fetched customers.
    *   Add a special `SelectItem` with a value like `"add_new_customer"` and text "Add New Customer".
    *   When a customer is selected from the dropdown, update `selectedCustomerId` and fetch/store their full details in `selectedCustomerDetails`.
    *   When "Add New Customer" is selected, set `isAddCustomerModalOpen` to `true`.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
        *   `components/ui/select.tsx` (used)
        *   `lib/supabase.ts` (used)
    *   Functions/Classes:
        *   `useEffect` for fetching customers.
        *   `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` components.
        *   Handler function for `onValueChange` of the customer select.

4.  **Create "Add New Customer" Modal:**
    *   Create a new component, e.g., `AddCustomerModal.tsx` (could be in `app/create-invoice/components/` or a shared components directory).
    *   This modal will use `Dialog` from `components/ui/dialog.tsx`.
    *   The form inside the modal should be similar to `app/customers/add/page.tsx`, including fields for name, phone, email, address, etc. Use `react-hook-form` and `zod` for validation.
    *   On successful submission, the new customer data should be saved to the `customers` table in Supabase.
    *   The modal should then close, and the newly added customer's ID and details should be passed back to `CreateInvoicePage` (e.g., via a callback prop).
    *   `CreateInvoicePage` will then update its `selectedCustomerId`, `selectedCustomerDetails`, and refresh the `customers` list to include the new customer.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx` (to use the modal)
        *   New file: `AddCustomerModal.tsx`
        *   `components/ui/dialog.tsx` (used)
        *   `components/ui/input.tsx`, `components/ui/label.tsx`, `components/ui/button.tsx` (used in modal)
        *   `lib/supabase.ts` (used for saving customer)
    *   Functions/Classes:
        *   New `AddCustomerModal` component.
        *   Form handling logic within the modal.

5.  **Implement Multi-Item Entry UI:**
    *   In `app/create-invoice/page.tsx`, modify the form section for item details.
    *   Iterate over the `formData.items` array to render a set of input fields (`itemName`, `quantity`, `weight`, `pricePerGram`) for each item.
    *   Add an "Add Item" `Button`. Clicking this button should add a new empty item object to the `formData.items` array.
    *   For each item row, add a "Remove" `Button` (e.g., using a `Trash2` icon) to remove that specific item from the `formData.items` array. Ensure at least one item row is always present.
    *   Update the `handleChange` function to handle changes for specific items in the array, likely by passing the item's index or ID.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
    *   Functions/Classes:
        *   JSX for rendering item rows.
        *   Handler functions for adding and removing items.
        *   Updated `handleChange` function.

6.  **Update Calculation Logic for Multiple Items:**
    *   In `app/create-invoice/page.tsx`, modify the `calculateTotal` function.
    *   It should now iterate through `formData.items`, calculate the total for each item (`(quantity * weight * pricePerGram) / 10`), and sum these up to get the total `itemTotal` (which becomes the new subtotal before making charges).
    *   The overall subtotal, GST, and total amount calculations should then proceed based on this aggregated `itemTotal` and the existing `makingCharges` and `gst` fields.
    *   Update the display of these calculated values in the summary section of the form.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
    *   Functions/Classes:
        *   `calculateTotal` function.

7.  **Update `generateInvoiceData` Function:**
    *   In `app/create-invoice/page.tsx`, modify the `generateInvoiceData` function.
    *   It should now map `formData.items` to the structure expected by `InvoicePreview` and `InvoicePDF` (which already expects an array of items).
    *   Include the selected customer's name, address, and contact details (from `selectedCustomerDetails`) in the generated invoice data.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
    *   Functions/Classes:
        *   `generateInvoiceData` function.

8.  **Update `InvoicePreview` Component:**
    *   In `app/create-invoice/invoice-preview.tsx`:
        *   Ensure the customer details section displays the customer's name, address, and contact information.
        *   The items table should correctly iterate over the `invoiceData.items` array and render each item's details.
    *   Impacted Files:
        *   `app/create-invoice/invoice-preview.tsx`
    *   Functions/Classes:
        *   `InvoicePreview` component JSX.

9.  **Update `InvoicePDF` Component:**
    *   In `app/create-invoice/invoice-pdf.tsx`:
        *   Modify the PDF layout to include the customer's address and contact information in the "Invoice To" section or a similar area.
        *   Ensure the items table in the PDF correctly renders all items from the `invoice.items` array.
    *   Impacted Files:
        *   `app/create-invoice/invoice-pdf.tsx`
    *   Functions/Classes:
        *   `InvoicePDF` component JSX and PDF structure.

10. **Styling and UI Consistency:**
    *   Ensure all new UI elements (dropdown, modal, item repeater section) adhere to the existing application theme (amber/primary colors, Tailwind CSS) and use `shadcn/ui` components where appropriate.
    *   Maintain consistent layout and spacing.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
        *   `AddCustomerModal.tsx` (new file)

**b. Configuration or Database Migrations Required**

*   **Database Migrations:**
    *   No database schema changes are strictly required for the `customers` or `invoices` tables *based on this specific request for the create invoice screen*. The `customers` table already exists and contains the necessary fields. The `invoices` table would ideally store multiple items, perhaps in a JSONB column or a separate related `invoice_items` table. The current `InvoiceData` interface for preview/PDF already supports an array of items, so we'll assume the backend/invoice saving mechanism (not explicitly part of this UI change request) can handle this.
    *   If the `invoices` table currently only supports a single item, a migration would be needed later when implementing the actual invoice saving logic to Supabase. For this UI task, we focus on the frontend data structure.

*   **Configuration:**
    *   No changes to `next.config.mjs`, `tailwind.config.js`, `postcss.config.mjs`, or `tsconfig.json` are anticipated for these UI and frontend logic changes.
    *   The `lib/database.types.ts` (specifically `CustomerType`) should already be up-to-date from previous work (e.g., `app/customers/[id]/page.tsx` uses it). If not, ensure it accurately reflects the `customers` table schema.
