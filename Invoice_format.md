**Revised Step-by-Step Guide & Code Snippets**

**Step 0: Prepare `invoiceData` (Example for Clarity)**

```javascript
const invoiceDataExample = {
  invoiceNumber: "SG-2024-001",
  date: "26/05/2025", // DD/MM/YYYY format
  customerName: "Ronak Sethiya",
  customerAddress: "D 46, s 12, Amar Jyoti society sector 14 Vashi, Navi Mumbai",
  customerPhone: "08454881721",
  customerEmail: "ronakss.rj@gmail.com",
  firmName: "Sethiya Gold", // This will be styled for prominence
  firmAddress: "Premium Jewelry, Navi Mumbai",
  firmPhone: "9867944634",
  firmGstin: "27ABCDE1234F1Z5",
  firmTagline: "Premium Jewelry Merchants", // English tagline
  items: [
    { name: "Chain", quantity: 1, weight: 12.90, pricePerGram: 6450.00, makingCharges: 900.00, total: 84105.00 },
    { name: "Ring", quantity: 1, weight: 12.09, pricePerGram: 6450.00, makingCharges: 9000.00, total: 86980.50 },
  ],
  subtotal: 161185.50,
  makingCharges: 9900.00,
  gstPercentage: 3,
  gstAmount: 5132.56,
  total: 176218.07,
};
```

**Step 1: Update Page Setup (No Custom Font Registration Needed)**

In `app/create-invoice/invoice-pdf.tsx`:

```tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"; // Removed Font
import type { InvoiceData } from "@/app/create-invoice/invoice-preview";
import { TERMS_AND_CONDITIONS, AGREEMENT_TEXT } from "@/lib/invoice-text";

const MM_TO_PT = 2.8346;

// Define styles (or merge into your existing StyleSheet.create call)
const styles = StyleSheet.create({
  page: {
    paddingTop: 10 * MM_TO_PT,
    paddingBottom: 15 * MM_TO_PT,
    paddingHorizontal: 10 * MM_TO_PT,
    fontFamily: 'Helvetica', // Default font
    fontSize: 10,           // Default font size for body text
    backgroundColor: '#FFFFFF',
  },
  // Header Styles
  headerSection: {
    marginBottom: 15,
  },
  headerColoredBand: {
    backgroundColor: '#E8EAF6', // A light blue/gray, adjust to your brand
    position: 'absolute',
    top: 5 * MM_TO_PT,      // Adjust positioning carefully
    left: -10 * MM_TO_PT,   // Span full width beyond page padding
    right: -10 * MM_TO_PT,
    height: 60,             // Adjust height for content
    zIndex: -1,
  },
  taxInvoiceTitle: {
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: '#B22222', // Firebrick red
    letterSpacing: 1,
    marginBottom: 5,
    marginTop: 5, // Added margin for spacing from top or devanagari if used
  },
  firmNameHeader: {
    textAlign: 'center',
    fontFamily: 'Times-Bold', // Using Times-Bold for a more classic title feel
    fontSize: 28,
    color: '#B22222', // Firebrick red
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  firmTagline: {
    textAlign: 'center',
    fontSize: 9,
    fontFamily: 'Helvetica',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  firmAddressGstinHeader: {
    textAlign: 'center',
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    lineHeight: 1.3,
    marginBottom: 3,
  },
  telNumberHeader: {
    textAlign: 'right',
    fontFamily: 'Helvetica',
    fontSize: 9,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  invoiceMetaBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    paddingVertical: 5,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#555555',
    marginTop: 5,
    marginBottom: 10,
  },

  // Customer Info Styles
  customerInfoContainer: {
    borderWidth: 1,
    borderColor: '#AAAAAA',
    padding: 8,
    marginBottom: 15,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
  },
  customerInfoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  customerInfoLabel: {
    width: '18%',
    fontFamily: 'Helvetica-Bold',
  },
  customerInfoValue: {
    width: '82%',
  },

  // Table Styles
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#000000',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderBottomWidth: 0.5,
    borderColor: '#000000',
    borderRightWidth: 0.5,
    paddingVertical: 3, // Adjusted for 8pt feel with default fonts
    paddingHorizontal: 5,
    backgroundColor: '#E0E0E0',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableCol: {
    borderStyle: 'solid',
    borderBottomWidth: 0.5,
    borderColor: '#000000',
    borderRightWidth: 0.5,
    paddingVertical: 3, // Adjusted for 8pt feel
    paddingHorizontal: 5,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  colItem: { width: '28%' },
  colQty: { width: '8%', textAlign: 'center' },
  colWeight: { width: '12%', textAlign: 'right' },
  colPricePerGram: { width: '17%', textAlign: 'right' },
  colMaking: { width: '15%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right', borderRightWidth: 0 },
  tableRowLight: { backgroundColor: '#FFFFFF' },
  tableRowDark: { backgroundColor: '#F5F5F5' },

  // Summary Styles
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  summaryTable: {
    width: '50%',
    fontSize: 9.5,
    fontFamily: 'Helvetica',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderColor: '#888888',
  },
  summaryLabel: {
    textAlign: 'left',
  },
  summaryValue: {
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000000',
    marginTop: 3,
  },
  grandTotalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  grandTotalValue: { fontSize: 11, textAlign: 'right', fontFamily: 'Helvetica-Bold' },

  // Footer Styles
  footerContainer: {
    position: 'absolute',
    bottom: 15 * MM_TO_PT,
    left: 10 * MM_TO_PT,
    right: 10 * MM_TO_PT,
    borderWidth: 1,
    borderColor: '#555555',
    padding: 8,
    fontFamily: 'Helvetica',
  },
  footerDottedLine: {
    borderTopWidth: 1,
    borderTopStyle: 'dotted',
    borderColor: '#555555',
    marginBottom: 5,
  },
  footerThankYou: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  footerTermsTitle: { // Removed Devanagari font
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    marginBottom: 3,
  },
  footerTermItem: { // Removed Devanagari font
    fontSize: 7.5,
    lineHeight: 1.3,
    marginBottom: 2,
  },
  footerAgreement: { // Removed Devanagari font
    fontSize: 7.5,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  footerSignatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerSignatureBox: {
    width: '48%',
    fontSize: 8.5,
  },
  signatureLine: {
    borderBottomWidth: 0.5,
    borderColor: '#333333',
    marginTop: 15,
    marginBottom: 2,
  },
  footerBottomText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    fontFamily: 'Helvetica-Italic', // Using italic for E&OE
    marginTop: 8,
  },
});

export function InvoicePDF({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document author={invoice.firmName} title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* --- HEADER SECTION --- */}
        <View style={styles.headerSection}>
          <View style={styles.headerColoredBand} />

          <Text style={styles.taxInvoiceTitle}>TAX INVOICE</Text>

          <Text style={styles.firmNameHeader}>{invoice.firmName}</Text>
          {invoice.firmTagline && ( // Display English tagline if available
            <Text style={styles.firmTagline}>{invoice.firmTagline}</Text>
          )}
          <Text style={styles.firmAddressGstinHeader}>
            {invoice.firmAddress}
          </Text>
          <Text style={styles.firmAddressGstinHeader}>
            GSTIN: {invoice.firmGstin} | HSN: 7113
          </Text>
          <Text style={styles.telNumberHeader}>Tel.: {invoice.firmPhone}</Text>

          <View style={styles.invoiceMetaBlock}>
            <Text>Bill No.: {invoice.invoiceNumber}</Text>
            <Text>Date: {invoice.date}</Text>
          </View>
        </View>

        {/* --- CUSTOMER INFO SECTION --- */}
        <View style={styles.customerInfoContainer}>
          <View style={styles.customerInfoRow}>
            <Text style={styles.customerInfoLabel}>M/s.</Text>
            <Text style={styles.customerInfoValue}>{invoice.customerName}</Text>
          </View>
          {invoice.customerAddress && (
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Address:</Text>
              <Text style={styles.customerInfoValue}>{invoice.customerAddress}</Text>
            </View>
          )}
          {invoice.customerPhone && (
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Phone:</Text>
              <Text style={styles.customerInfoValue}>{invoice.customerPhone}</Text>
            </View>
          )}
          {invoice.customerEmail && (
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Email:</Text>
              <Text style={styles.customerInfoValue}>{invoice.customerEmail}</Text>
            </View>
          )}
        </View>

        {/* --- ITEMS TABLE --- */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, styles.colItem]}>Item</Text>
            <Text style={[styles.tableColHeader, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableColHeader, styles.colWeight]}>Weight (g)</Text>
            <Text style={[styles.tableColHeader, styles.colPricePerGram]}>Price/10g (₹)</Text>
            <Text style={[styles.tableColHeader, styles.colMaking]}>Making (₹)</Text>
            <Text style={[styles.tableColHeader, styles.colAmount]}>Amount (₹)</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowLight : styles.tableRowDark]}>
              <Text style={[styles.tableCol, styles.colItem]}>{item.name}</Text>
              <Text style={[styles.tableCol, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCol, styles.colWeight]}>{item.weight.toFixed(3)}</Text>
              <Text style={[styles.tableCol, styles.colPricePerGram]}>{(item.pricePerGram * 10).toFixed(2)}</Text>
              <Text style={[styles.tableCol, styles.colMaking]}>{item.makingCharges.toFixed(2)}</Text>
              <Text style={[styles.tableCol, styles.colAmount]}>{item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* --- SUMMARY SECTION --- */}
        <View style={styles.summarySection}>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal (Items Value):</Text>
              <Text style={styles.summaryValue}>₹{invoice.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Making Charges:</Text>
              <Text style={styles.summaryValue}>₹{invoice.makingCharges.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST ({invoice.gstPercentage}%):</Text>
              <Text style={styles.summaryValue}>₹{invoice.gstAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
              <Text style={styles.grandTotalValue}>₹{invoice.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* --- FOOTER SECTION --- */}
        <View style={styles.footerContainer} fixed>
          <View style={styles.footerDottedLine} />
          <Text style={styles.footerThankYou}>Thank You! Visit Again!</Text>

          <Text style={styles.footerTermsTitle}>Terms & Conditions:</Text>
          {TERMS_AND_CONDITIONS.map((term, index) => (
            <Text key={index} style={styles.footerTermItem}>
              {index + 1}. {term}
            </Text>
          ))}
          <Text style={styles.footerAgreement}>{AGREEMENT_TEXT}</Text>

          <View style={styles.footerSignatureSection}>
            <View style={styles.footerSignatureBox}>
              <Text>Customer Signature:</Text>
              <View style={styles.signatureLine} />
              <Text>({invoice.customerName})</Text>
            </View>
            <View style={[styles.footerSignatureBox, { textAlign: 'right' }]}>
              <Text>For {invoice.firmName}:</Text>
              <View style={styles.signatureLine} />
              <Text>(Authorised Signatory)</Text>
            </View>
          </View>
          <View style={styles.footerBottomText}>
            <Text>E. & O. E.</Text>
            <Text>This is a computer-generated invoice.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
```

**Explanation of Font-Related Changes:**

1.  **No `Font.register()`:** All `Font.register` calls have been removed.
2.  **Default `fontFamily`:**
    *   `styles.page.fontFamily` is set to `'Helvetica'`.
    *   Most text elements will inherit this or explicitly use `Helvetica` or its variants.
3.  **Header Styling with Default Fonts:**
    *   `taxInvoiceTitle`: Uses `Helvetica-Bold`.
    *   `firmNameHeader`: Changed to `Times-Bold` to give it a slightly more traditional/serif look available by default, differentiating it from `Helvetica`. You can change this to `Helvetica-Bold` if you prefer consistency.
    *   `firmTagline`, `firmAddressGstinHeader`, `telNumberHeader`: Use `Helvetica`.
    *   Removed `firmNameDevanagari` style and its usage in JSX, as default fonts won't render Devanagari script correctly.
4.  **Customer Info, Table, Summary with Default Fonts:**
    *   Generally use `Helvetica`. Bold versions (`Helvetica-Bold`) are used for labels or headers where emphasis is needed (e.g., `customerInfoLabel`, `tableColHeader`, `grandTotalLabel`, `grandTotalValue`).
5.  **Footer Styling with Default Fonts:**
    *   `footerContainer` and its children primarily use `Helvetica`.
    *   `footerThankYou`, `footerTermsTitle`: Use `Helvetica-Bold`.
    *   `footerTermItem`, `footerAgreement`: Use `Helvetica` (your `lib/invoice-text.ts` contains English, which is fine).
    *   `footerBottomText`: Uses `Helvetica-Italic` for "E. & O. E." for a common stylistic touch.

**To Integrate into Your Project:**

1.  **Replace `invoice-pdf.tsx`:**
    *   Replace the content of your `app/create-invoice/invoice-pdf.tsx` with the code provided above.
    *   Ensure the import path for `InvoiceData` and `lib/invoice-text` are correct.
2.  **Verify `invoiceData`:**
    *   Ensure the `invoiceData` prop passed to `InvoicePDF` has all the necessary fields. The `firmTagline` is now expected to be English. `firmNameDevanagari` is no longer used.
3.  **Test and Iterate:**
    *   Generate a PDF and compare it.
    *   The main challenge will be achieving the desired visual density and hierarchy using only default font weights and styles. You may need to adjust `fontSize`, `padding`, `margin`, and `lineHeight` more carefully.
    *   Pay attention to how `Times-Bold` looks for the main title versus `Helvetica-Bold`. `Times-Roman` is generally more condensed than `Helvetica` at the same point size, which might help with density if used for body text, but `Helvetica` is a very standard and clean choice.
