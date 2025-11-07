import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { InvoiceData } from "@/app/create-invoice/invoice-preview"
import { TERMS_AND_CONDITIONS, AGREEMENT_TEXT } from "@/lib/invoice-text"

const MM_TO_PT = 2.8346;

// Luxury Gold & Black Color Palette
const COLORS = {
  gold: '#D4AF37',           // Primary gold
  darkGold: '#B8960C',       // Darker gold for depth
  black: '#000000',          // Primary text
  cream: '#FFFEF0',          // Background cream
  lightCream: '#FFF9E6',     // Alternating rows
  white: '#FFFFFF',          // Pure white
  darkGray: '#333333',       // Secondary text
  lightGray: '#E5E5E5',      // Subtle borders
};

// Create styles - Luxury Gold & Black Theme
const styles = StyleSheet.create({
  page: {
    paddingTop: 10 * MM_TO_PT,
    paddingBottom: 15 * MM_TO_PT,
    paddingHorizontal: 10 * MM_TO_PT,
    fontSize: 10,
    backgroundColor: COLORS.cream,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },

  // Header Styles - Luxury Gold Theme
  headerSection: {
    marginBottom: 18,
  },
  headerColoredBand: {
    backgroundColor: COLORS.gold,
    position: 'absolute',
    top: 5 * MM_TO_PT,
    left: -10 * MM_TO_PT,
    right: -10 * MM_TO_PT,
    height: 70,
    zIndex: -1,
  },
  taxInvoiceTitle: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: 6,
    marginTop: 8,
    fontWeight: 'bold',
  },
  firmNameHeader: {
    textAlign: 'center',
    fontSize: 32,
    color: COLORS.black,
    textTransform: 'uppercase',
    marginBottom: 3,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  firmTagline: {
    textAlign: 'center',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    color: COLORS.gold,
    fontStyle: 'italic',
  },
  firmAddressGstinHeader: {
    textAlign: 'center',
    fontSize: 8.5,
    lineHeight: 1.4,
    marginBottom: 2,
    color: COLORS.black,
  },
  telNumberHeader: {
    textAlign: 'right',
    fontSize: 9,
    position: 'absolute',
    top: 0,
    right: 0,
    color: COLORS.white,
  },
  invoiceMetaBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    paddingVertical: 6,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: COLORS.gold,
    marginTop: 8,
    marginBottom: 12,
    color: COLORS.black,
  },

  // Customer Info Styles - Gold Border
  customerInfoContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.white,
    padding: 10,
    marginBottom: 16,
    fontSize: 9.5,
  },
  customerInfoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  customerInfoLabel: {
    width: '18%',
    color: COLORS.darkGray,
    fontWeight: 'bold',
  },
  customerInfoValue: {
    width: '82%',
    color: COLORS.black,
  },

  // Table Styles - Gold Accents
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: COLORS.gold,
    borderRightWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: COLORS.gold,
    fontSize: 9.5,
    textAlign: 'center',
    color: COLORS.white,
    fontWeight: 'bold',
  },
  tableCol: {
    borderStyle: 'solid',
    borderBottomWidth: 0.5,
    borderColor: COLORS.lightGray,
    borderRightWidth: 0.5,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 9,
    color: COLORS.black,
  },
  colItem: { width: '35%' },
  colQty: { width: '10%', textAlign: 'center' },
  colWeight: { width: '15%', textAlign: 'right' },
  colPricePerGram: { width: '20%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right', borderRightWidth: 0 },
  tableRowLight: { backgroundColor: COLORS.white },
  tableRowDark: { backgroundColor: COLORS.lightCream },

  // Summary Styles - Elegant Gold Accents
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  summaryTable: {
    width: '50%',
    fontSize: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    padding: 8,
    backgroundColor: COLORS.white,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderColor: COLORS.lightGray,
  },
  summaryLabel: {
    textAlign: 'left',
    color: COLORS.black,
  },
  summaryValue: {
    textAlign: 'right',
    color: COLORS.black,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    backgroundColor: COLORS.gold,
    marginTop: 4,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    color: COLORS.white,
  },

  // Footer Styles - Elegant Gold
  footerContainer: {
    position: 'absolute',
    bottom: 15 * MM_TO_PT,
    left: 10 * MM_TO_PT,
    right: 10 * MM_TO_PT,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    padding: 10,
    backgroundColor: COLORS.white,
  },
  footerDottedLine: {
    borderTopWidth: 1.5,
    borderColor: COLORS.gold,
    marginBottom: 6,
  },
  footerThankYou: {
    textAlign: 'center',
    fontSize: 11,
    marginBottom: 6,
    color: COLORS.gold,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerTermsTitle: {
    fontSize: 9,
    textDecoration: 'underline',
    marginBottom: 4,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  footerTermItem: {
    fontSize: 7.5,
    lineHeight: 1.4,
    marginBottom: 2,
    color: COLORS.darkGray,
  },
  footerAgreement: {
    fontSize: 7.5,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
    color: COLORS.darkGray,
    fontStyle: 'italic',
  },
  footerSignatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerSignatureBox: {
    width: '48%',
    fontSize: 8.5,
    color: COLORS.black,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderColor: COLORS.gold,
    marginTop: 18,
    marginBottom: 3,
  },
  footerBottomText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    fontStyle: 'italic',
    marginTop: 10,
    color: COLORS.darkGray,
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
