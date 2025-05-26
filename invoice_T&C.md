
**Planning Phase:**

**a. Step-by-Step Implementation Plan**

1.  **Define T&C Content**:
    *   Create a constant or a small utility function/component that holds the array of T&C strings as transcribed above, and the "Read / Understood..." agreement line. This can be defined within or imported into the relevant invoice components.
    *   Impacted Files:
        *   Potentially a new utility file (e.g., `lib/invoice-text.ts`) or directly within `app/create-invoice/invoice-preview.tsx` and `app/create-invoice/invoice-pdf.tsx`.

2.  **Update `InvoicePreview` Component (`app/create-invoice/invoice-preview.tsx`)**:
    *   Locate the end of the current invoice content within the main `CardContent` (likely after the "Thank you" message and contact info).
    *   Add a new `div` section for the footer, styled with a top border or separator to distinguish it visually.
    *   **T&C Section**:
        *   Add a subheading like "Terms & Conditions".
        *   Render the list of T&C points (e.g., using an ordered list `<ol>`). Style them to be small and legible (e.g., `text-xs text-muted-foreground`).
        *   Below is the text to be added as is in the T&C 
         
            1.  Please note that, the net amount includes Metal Value, Cost of Stones (Precious, Non Precious and other material Charges), Product Making Charges/Wastage Charges, GST and other taxes (as applicable). Upon specific request detailed statement will be provided.
            2.  Weight verified and Received product in good condition.
            3.  I hereby confirm the purity, weight and value of the material & have read & accepted all terms and conditions & further acknowledge the amount stated is correct and accurate.
            4.  If other (non-precious/semiprecious) materials are included in the product, the product gross weight is inclusive of other material weight.


    *   **Agreement Line**:
        *   Add a paragraph for the "Read / Understood and agreed to the terms and conditions overleaf" line.
    *   **Signature Section**:
        *   Use a flexbox or grid layout to create two columns.
        *   **Left Column (Customer)**:
            *   Display "Customer name: {invoiceData.customerName}".
            *   Add a line or space for "Customer signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_".
        *   **Right Column (Firm)**:
            *   Display "For {invoiceData.firmName}".
            *   Add a line or space for "Authorised Signatory: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_".
        *   Ensure appropriate styling for labels and signature lines (e.g., `text-sm`, `font-medium`).
    *   **Bottom Line**:
        *   Add a `div` at the bottom of this new footer section.
        *   Use flexbox with `justify-between` to place "E & OE" on the left and "See overleaf" on the right. Style as `text-sm`.
    *   Impacted Files:
        *   `app/create-invoice/invoice-preview.tsx`
    *   Functions/Classes:
        *   `InvoicePreview` React component.

3.  **Update `InvoicePDF` Component (`app/create-invoice/invoice-pdf.tsx`)**:
    *   Locate the end of the current invoice content within the PDF `Page` component, before the existing absolute-positioned PDF footer (which usually contains page numbers or "computer-generated" text).
    *   Add a new `<View>` section for this footer content.
    *   **T&C Section**:
        *   Add a `<Text>` element for the "Terms & Conditions" heading.
        *   Iterate through the T&C strings and render each as a `<Text>` element, possibly prefixed with numbers. Apply appropriate PDF styles (e.g., `fontSize: 8` or `9`).
    *   **Agreement Line**:
        *   Add a `<Text>` element for the "Read / Understood..." line.
    *   **Signature Section**:
        *   Use `<View>` with `flexDirection: "row"` and `justifyContent: "space-between"` (or fixed widths) for the two columns.
        *   **Left Column (Customer)**:
            *   `<Text>Customer name: {invoice.customerName}</Text>`
            *   `<Text>Customer signature: ________________</Text>` (or a line drawn using PDF drawing elements if preferred, though text underscores are simpler).
        *   **Right Column (Firm)**:
            *   `<Text>For {invoice.firmName}</Text>`
            *   `<Text>Authorised Signatory: ________________</Text>`
        *   Define styles in the `StyleSheet.create` object for these elements (e.g., font size, margins, alignment).
    *   **Bottom Line**:
        *   Add a `<View>` with `flexDirection: "row", justifyContent: "space-between"`.
        *   Inside, add `<Text>E & OE</Text>` and `<Text>See overleaf</Text>`.
        *   Apply appropriate PDF styles.
    *   Adjust styling (padding, margins, font sizes, line heights) for all new PDF elements to match the visual structure of the screenshot and ensure readability within the PDF format.
    *   Impacted Files:
        *   `app/create-invoice/invoice-pdf.tsx`
    *   Functions/Classes:
        *   `InvoicePDF` React-PDF component.
        *   `styles` object (from `StyleSheet.create`).

4.  **Styling Considerations**:
    *   For `InvoicePreview` (HTML): Use Tailwind CSS classes for styling the new footer section, T&Cs, signature areas, and bottom line to match the general look of the existing preview and the provided screenshot.
    *   For `InvoicePDF`: Define new styles in the `StyleSheet.create` object for the added PDF elements. Focus on font sizes (e.g., 8pt or 9pt for T&Cs), line spacing, and the two-column layout for signatures.

**c. Configuration or Database Migrations Required**

*   **Configuration**:
    *   No changes to `next.config.mjs`, `tailwind.config.js`, `postcss.config.mjs`, or `tsconfig.json` are anticipated for these UI and content changes.
*   **Database Migrations**:
    *   No database migrations are required for this change, as the T&Cs are static text and the dynamic data (customer name, firm name) is already part of the `invoiceData` structure.
