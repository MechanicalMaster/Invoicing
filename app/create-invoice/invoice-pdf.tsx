import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { InvoiceData } from "@/app/create-invoice/invoice-preview"
import { TERMS_AND_CONDITIONS, AGREEMENT_TEXT } from "@/lib/invoice-text"

const MM_TO_PT = 2.8346;

// Create styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 10 * MM_TO_PT,
    paddingBottom: 15 * MM_TO_PT,
    paddingHorizontal: 10 * MM_TO_PT,
    fontSize: 10,           // Default font size for body text
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
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
    fontSize: 14,
    color: '#B22222', // Firebrick red
    letterSpacing: 1,
    marginBottom: 5,
    marginTop: 5, // Added margin for spacing from top or devanagari if used
  },
  firmNameHeader: {
    textAlign: 'center',
    fontSize: 28,
    color: '#B22222', // Firebrick red
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  firmTagline: {
    textAlign: 'center',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  firmAddressGstinHeader: {
    textAlign: 'center',
    fontSize: 8.5,
    lineHeight: 1.3,
    marginBottom: 3,
  },
  telNumberHeader: {
    textAlign: 'right',
    fontSize: 9,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  invoiceMetaBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  customerInfoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  customerInfoLabel: {
    width: '18%',
  },
  customerInfoValue: {
    width: '82%',
  },

  // Table Styles
  table: {
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
  },
  colItem: { width: '35%' },
  colQty: { width: '10%', textAlign: 'center' },
  colWeight: { width: '15%', textAlign: 'right' },
  colPricePerGram: { width: '20%', textAlign: 'right' },
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
  grandTotalLabel: {
    fontSize: 11,
  },
  grandTotalValue: {
    fontSize: 11,
    textAlign: 'right',
  },

  // Footer Styles
  footerContainer: {
    position: 'absolute',
    bottom: 15 * MM_TO_PT,
    left: 10 * MM_TO_PT,
    right: 10 * MM_TO_PT,
    borderWidth: 1,
    borderColor: '#555555',
    padding: 8,
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
    marginBottom: 5,
  },
  footerTermsTitle: {
    fontSize: 9,
    textDecoration: 'underline',
    marginBottom: 3,
  },
  footerTermItem: {
    fontSize: 7.5,
    lineHeight: 1.3,
    marginBottom: 2,
  },
  footerAgreement: {
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
    fontStyle: 'italic',
    marginTop: 8,
  },
});

interface InvoicePDFProps {
  invoice: InvoiceData;
}

// Helper function to safely format numbers with comprehensive validation
const safeNumber = (value: any, decimals: number = 2): string => {
  // Validate decimals parameter
  const validDecimals = Math.max(0, Math.min(20, Math.floor(decimals)))
  
  // Convert to number
  const num = Number(value)
  
  // Check for invalid numbers
  if (isNaN(num) || !isFinite(num)) {
    return '0.' + '0'.repeat(validDecimals)
  }
  
  // Check for numbers that are too large or too small for safe formatting
  // toFixed() has issues with numbers outside this range
  const MAX_SAFE_VALUE = 1e20
  const MIN_SAFE_VALUE = -1e20
  
  if (num > MAX_SAFE_VALUE || num < MIN_SAFE_VALUE) {
    return '0.' + '0'.repeat(validDecimals)
  }
  
  try {
    return num.toFixed(validDecimals)
  } catch (error) {
    console.error('Error in safeNumber formatting:', error)
    return '0.' + '0'.repeat(validDecimals)
  }
}

// Helper function to safely get numeric value with bounds checking
const safeNumericValue = (value: any): number => {
  const num = Number(value)
  
  // Check for invalid numbers
  if (isNaN(num) || !isFinite(num)) {
    return 0
  }
  
  // Clamp to safe integer range to prevent overflow
  const MAX_SAFE = Number.MAX_SAFE_INTEGER
  const MIN_SAFE = Number.MIN_SAFE_INTEGER
  
  if (num > MAX_SAFE) return MAX_SAFE
  if (num < MIN_SAFE) return MIN_SAFE
  
  return num
}

// Helper function to safely get string value
const safeString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

// Helper function for safe multiplication to prevent overflow
const safeMultiply = (a: any, b: any): number => {
  const num1 = safeNumericValue(a);
  const num2 = safeNumericValue(b);
  
  // Check if multiplication would overflow
  if (num1 !== 0 && Math.abs(num2) > Number.MAX_SAFE_INTEGER / Math.abs(num1)) {
    console.warn('Multiplication would overflow, returning 0');
    return 0;
  }
  
  const result = num1 * num2;
  
  // Final safety check
  if (!isFinite(result)) {
    return 0;
  }
  
  return result;
};

// Create Document Component
export function InvoicePDF({ invoice }: InvoicePDFProps) {
  // Validate and sanitize invoice data
  const sanitizedInvoice = {
    invoiceNumber: safeString(invoice.invoiceNumber),
    date: safeString(invoice.date),
    customerName: safeString(invoice.customerName),
    customerAddress: invoice.customerAddress ? safeString(invoice.customerAddress) : undefined,
    customerPhone: invoice.customerPhone ? safeString(invoice.customerPhone) : undefined,
    customerEmail: invoice.customerEmail ? safeString(invoice.customerEmail) : undefined,
    firmName: safeString(invoice.firmName),
    firmAddress: safeString(invoice.firmAddress),
    firmPhone: safeString(invoice.firmPhone),
    firmGstin: safeString(invoice.firmGstin),
    subtotal: safeNumericValue(invoice.subtotal),
    gstPercentage: safeNumericValue(invoice.gstPercentage),
    gstAmount: safeNumericValue(invoice.gstAmount),
    total: safeNumericValue(invoice.total),
    items: invoice.items.map(item => ({
      name: safeString(item.name),
      quantity: safeNumericValue(item.quantity),
      weight: safeNumericValue(item.weight),
      pricePerGram: safeNumericValue(item.pricePerGram),
      total: safeNumericValue(item.total),
    })),
  };

  return (
    <Document author={sanitizedInvoice.firmName} title={`Invoice ${sanitizedInvoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* --- HEADER SECTION --- */}
        <View style={styles.headerSection}>
          <View style={styles.headerColoredBand} />

          <Text style={styles.taxInvoiceTitle}>TAX INVOICE</Text>

          <Text style={styles.firmNameHeader}>{sanitizedInvoice.firmName}</Text>
          <Text style={styles.firmTagline}>Premium Jewelry</Text>
          <Text style={styles.firmAddressGstinHeader}>
            {sanitizedInvoice.firmAddress}
          </Text>
          <Text style={styles.firmAddressGstinHeader}>
            GSTIN: {sanitizedInvoice.firmGstin} | HSN: 7113
          </Text>
          <Text style={styles.telNumberHeader}>Tel.: {sanitizedInvoice.firmPhone}</Text>

          <View style={styles.invoiceMetaBlock}>
            <Text>Bill No.: {sanitizedInvoice.invoiceNumber}</Text>
            <Text>Date: {sanitizedInvoice.date}</Text>
          </View>
        </View>

        {/* --- CUSTOMER INFO SECTION --- */}
        <View style={styles.customerInfoContainer}>
          <View style={styles.customerInfoRow}>
            <Text style={styles.customerInfoLabel}>M/s.</Text>
            <Text style={styles.customerInfoValue}>{sanitizedInvoice.customerName}</Text>
          </View>
          {sanitizedInvoice.customerAddress && (
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Address:</Text>
              <Text style={styles.customerInfoValue}>{sanitizedInvoice.customerAddress}</Text>
            </View>
          )}
          {sanitizedInvoice.customerPhone && (
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Phone:</Text>
              <Text style={styles.customerInfoValue}>{sanitizedInvoice.customerPhone}</Text>
            </View>
          )}
          {sanitizedInvoice.customerEmail && (
            <View style={styles.customerInfoRow}>
              <Text style={styles.customerInfoLabel}>Email:</Text>
              <Text style={styles.customerInfoValue}>{sanitizedInvoice.customerEmail}</Text>
            </View>
          )}
        </View>

        {/* --- ITEMS TABLE SECTION --- */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, styles.colItem]}>Item</Text>
            <Text style={[styles.tableColHeader, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableColHeader, styles.colWeight]}>Weight (g)</Text>
            <Text style={[styles.tableColHeader, styles.colPricePerGram]}>Price/10g (₹)</Text>
            <Text style={[styles.tableColHeader, styles.colAmount]}>Amount (₹)</Text>
          </View>

          {sanitizedInvoice.items.map((item, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowLight : styles.tableRowDark]}>
              <Text style={[styles.tableCol, styles.colItem]}>{item.name}</Text>
              <Text style={[styles.tableCol, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCol, styles.colWeight]}>{safeNumber(item.weight, 3)}</Text>
              <Text style={[styles.tableCol, styles.colPricePerGram]}>₹{safeNumber(safeMultiply(item.pricePerGram, 10), 2)}</Text>
              <Text style={[styles.tableCol, styles.colAmount]}>₹{safeNumber(item.total, 2)}</Text>
            </View>
          ))}
        </View>

        {/* --- SUMMARY SECTION --- */}
        <View style={styles.summarySection}>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal (Items Value):</Text>
              <Text style={styles.summaryValue}>₹{safeNumber(sanitizedInvoice.subtotal, 2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST ({safeNumber(sanitizedInvoice.gstPercentage, 0)}%):</Text>
              <Text style={styles.summaryValue}>₹{safeNumber(sanitizedInvoice.gstAmount, 2)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
              <Text style={styles.grandTotalValue}>₹{safeNumber(sanitizedInvoice.total, 2)}</Text>
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
              <Text>({sanitizedInvoice.customerName})</Text>
            </View>
            <View style={[styles.footerSignatureBox, { textAlign: 'right' }]}>
              <Text>For {sanitizedInvoice.firmName}:</Text>
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
