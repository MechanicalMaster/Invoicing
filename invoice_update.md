**Planning Phase:**

Assuming the following based on common practice and the request:
*   **Per-Item Making Charges:**
    *   Each `InvoiceItem` will have a `makingCharges` field.
    *   The `item.total` calculation for each item will be `((quantity * weight * pricePerGram) / 10) + item.makingCharges`.
    *   The "Making Charges" line in the invoice summary (preview & PDF) will be the sum of all `item.makingCharges`.
    *   The "Subtotal" in the summary will be the sum of all `((quantity * weight * pricePerGram) / 10)` *before* adding making charges. Then "Making Charges" are added, and then GST is applied to `Subtotal + Making Charges`. This aligns better with typical jewelry invoices where making charges are often shown separately before tax.

*   **"Add New Customer" Modal:** The existing conditional rendering of `AddCustomerModal` is suitable.

*   **Firm Details Fallback:** If firm details are not found in `user_settings`, we will use the provided static values (`GSTIN: 27AABCT3518Q1ZV | Phone: +91 98765 43210`, and "Sethiya Gold", "Premium Jewelry", "123 Jewelry Lane, Mumbai, Maharashtra, 400001") as fallbacks.

Here's the step-by-step implementation plan:

**a. Step-by-Step Implementation Plan**

1.  **Update `InvoiceItem` Interface and Form State:**
    *   In `app/create-invoice/page.tsx`, modify the `InvoiceItem` interface to include `makingCharges: number`.
    *   Update the `formData.items` initial state to include `makingCharges: 0` for the default item.
    *   When adding a new item in the `addItem` function, initialize its `makingCharges` to 0.
    *   Remove the global `makingCharges` field from the main `formData` state.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
    *   Functions/Classes:
        *   `InvoiceItem` interface.
        *   `useState` hook for `formData`.
        *   `addItem` function.

2.  **Add UI for Per-Item Making Charges:**
    *   In `app/create-invoice/page.tsx`, within the loop that renders `formData.items`, add a new `Input` field for "Making Charges (₹)" for each item.
    *   This input should be similar to other item inputs (Quantity, Weight, Price).
    *   Update `handleItemChange` to manage changes to this new `makingCharges` field for each item.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
    *   Functions/Classes:
        *   JSX for rendering item rows.
        *   `handleItemChange` function.
        *   `Input` component from `components/ui/input.tsx`.
        *   `Label` component from `components/ui/label.tsx`.

3.  **Update Calculation Logic:**
    *   In `app/create-invoice/page.tsx`:
        *   Modify `calculateItemTotal`: It should now calculate the item's base total from quantity, weight, and price, *without* its own making charges. Let's rename it to `calculateItemBaseTotal`.
            *   `itemBaseTotal = (quantity * weight * pricePerGram) / 10`.
        *   The `item.total` displayed directly under each item in the form should be `itemBaseTotal + item.makingCharges`.
        *   Modify `calculateTotal` function:
            *   Calculate `totalItemBaseValue = sum of all item.calculateItemBaseTotal()`.
            *   Calculate `totalMakingCharges = sum of all item.makingCharges`.
            *   `subtotal = totalItemBaseValue`. (This is the value before making charges for the summary)
            *   `grandTotalBeforeGst = subtotal + totalMakingCharges`.
            *   `gstAmount = grandTotalBeforeGst * (formData.gst / 100)`.
            *   `total = grandTotalBeforeGst + gstAmount`.
            *   Return `subtotal`, `totalMakingCharges`, `gstAmount`, and `total`.
        *   Update the summary display in the form to show:
            *   "Items Total" (this would be the `subtotal` calculated above).
            *   "Making Charges" (this would be `totalMakingCharges`).
            *   "Subtotal (After Making Charges)" (this would be `grandTotalBeforeGst`).
            *   "GST".
            *   "Total Amount".
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
    *   Functions/Classes:
        *   `calculateItemTotal` (or renamed `calculateItemBaseTotal`).
        *   `calculateTotal` function.

4.  **Update `InvoiceData` Interface for Invoice Preview/PDF:**
    *   In `app/create-invoice/invoice-preview.tsx`, modify the `InvoiceItem` sub-interface within `InvoiceData` to include `makingCharges: number`.
    *   Add new fields to `InvoiceData` for firm details: `firmName: string`, `firmAddress: string`, `firmPhone: string`, `firmGstin: string`.
    *   The main `makingCharges` field in `InvoiceData` will now represent the *total* making charges.
    *   The `subtotal` field in `InvoiceData` will represent the sum of item base values (before making charges).
    *   Impacted Files:
        *   `app/create-invoice/invoice-preview.tsx`
    *   Functions/Classes:
        *   `InvoiceItem` interface (nested).
        *   `InvoiceData` interface.

5.  **Update `generateInvoiceData` Function:**
    *   In `app/create-invoice/page.tsx`, modify `generateInvoiceData`:
        *   Fetch firm details from the `user_settings` table in Supabase using `user.id`.
            *   `const { data: settingsData, error: settingsError } = await supabase.from('user_settings').select('firm_name, firm_address, firm_phone, firm_gstin').eq('user_id', user.id).single();`
        *   Use fetched details, or fallbacks if `settingsData` is null or error occurs:
            *   `firmName: settingsData?.firm_name || "Sethiya Gold"`
            *   `firmAddress: settingsData?.firm_address || "123 Jewelry Lane, Mumbai, Maharashtra, 400001"`
            *   `firmPhone: settingsData?.firm_phone || "+91 98765 43210"`
            *   `firmGstin: settingsData?.firm_gstin || "27AABCT3518Q1ZV"`
        *   Map `formData.items` to include `makingCharges` for each item. The `total` for each item in `invoice.items` should be `itemBaseTotal + item.makingCharges`.
        *   Pass the calculated `subtotal` (sum of base item values), `totalMakingCharges` (as `makingCharges` in `InvoiceData`), `gstAmount`, and `total` from the updated `calculateTotal` function.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
    *   Functions/Classes:
        *   `generateInvoiceData` function.
        *   `supabase` client for fetching settings.

6.  **Update `InvoicePreview` Component:**
    *   In `app/create-invoice/invoice-preview.tsx`:
        *   Display the dynamic `firmName`, `firmAddress`, `firmPhone`, and `firmGstin` in the header section.
        *   The items table should now display each item's `name, quantity, weight, pricePerGram, total`. The `total` here should reflect `itemBaseValue + itemMakingCharge`. Consider if an additional column for individual making charges is desired in the table or if it's just part of the item total. (Assuming it's part of the item total for now).
        *   The summary section should display:
            *   "Subtotal:" (this is `invoiceData.subtotal` - sum of base item values).
            *   "Making Charges:" (this is `invoiceData.makingCharges` - sum of all item making charges).
            *   "GST ({invoiceData.gstPercentage}%):"
            *   "Total:"
    *   Impacted Files:
        *   `app/create-invoice/invoice-preview.tsx`
    *   Functions/Classes:
        *   `InvoicePreview` component JSX.

7.  **Update `InvoicePDF` Component:**
    *   In `app/create-invoice/invoice-pdf.tsx`:
        *   Similar to `InvoicePreview`, display dynamic `firmName`, `firmAddress`, `firmPhone`, and `firmGstin`.
        *   Update the items table and summary section to reflect the new calculation logic and display for making charges, consistent with `InvoicePreview`.
    *   Impacted Files:
        *   `app/create-invoice/invoice-pdf.tsx`
    *   Functions/Classes:
        *   `InvoicePDF` component JSX and PDF structure.

8.  **Verify and Refine "Add New Customer" Modal Integration:**
    *   In `app/create-invoice/page.tsx`, ensure the `handleCustomerAdded` function correctly updates `formData.selectedCustomerId`, `formData.selectedCustomerDetails`, and refreshes the `customers` list state by calling `fetchCustomers()` again or by appending the new customer to the existing list.
    *   The `AddCustomerModal` (`app/create-invoice/components/add-customer-modal.tsx`) already saves to Supabase and calls `onCustomerAdded`. Confirm this flow.
    *   Ensure the `Select` component for customers correctly re-renders with the new customer and selects them.
    *   Impacted Files:
        *   `app/create-invoice/page.tsx`
        *   `app/create-invoice/components/add-customer-modal.tsx` (verify, likely no major changes here if `onCustomerAdded` is effective).
    *   Functions/Classes:
        *   `handleCustomerAdded` function.
        *   `fetchCustomers` function.
        *   Customer `Select` component.

**c. Configuration or Database Migrations Required**

*   **Database Migrations:**
    *   No schema changes are required for the `customers` table, as it already exists.
    *   No schema changes are required for the `user_settings` table, as fields like `firm_name`, `firm_address`, `firm_phone`, `firm_gstin` are assumed to exist (as per `app/settings/page.tsx` and typical usage). If they don't, a migration to add them to `user_settings` would be needed.
    *   The `invoices` and `invoice_items` tables (if a separate one exists for items) would need to accommodate per-item making charges when actual invoice saving to DB is implemented. This plan focuses on the "Create Invoice" UI and preview generation, so immediate DB changes for *saving* invoices with this new structure are deferred but should be noted for future work.

*   **Configuration:**
    *   Ensure `lib/database.types.ts` accurately reflects the `user_settings` table, including `firm_name`, `firm_address`, `firm_phone`, `firm_gstin`.