import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"
import type { InvoiceData } from "@/app/create-invoice/invoice-preview"
import { TERMS_AND_CONDITIONS, AGREEMENT_TEXT } from "@/lib/invoice-text"

// Register standard PDF fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
    { src: 'Helvetica-Oblique', fontStyle: 'italic' },
    { src: 'Helvetica-BoldOblique', fontWeight: 'bold', fontStyle: 'italic' },
  ]
});

Font.register({
  family: 'Times',
  fonts: [
    { src: 'Times-Roman' },
    { src: 'Times-Bold', fontWeight: 'bold' },
    { src: 'Times-Italic', fontStyle: 'italic' },
    { src: 'Times-BoldItalic', fontWeight: 'bold', fontStyle: 'italic' },
  ]
});

const MM_TO_PT = 2.8346;

// Create styles
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
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#B22222', // Firebrick red
    letterSpacing: 1,
    marginBottom: 5,
    marginTop: 5, // Added margin for spacing from top or devanagari if used
  },
  firmNameHeader: {
    textAlign: 'center',
    fontFamily: 'Times',
    fontWeight: 'bold',
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
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
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
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
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
  grandTotalLabel: { 
    fontSize: 11, 
    fontFamily: 'Helvetica', 
    fontWeight: 'bold'
  },
  grandTotalValue: { 
    fontSize: 11, 
    textAlign: 'right', 
    fontFamily: 'Helvetica',
    fontWeight: 'bold'
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
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  footerTermsTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
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
    fontFamily: 'Helvetica',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

interface InvoicePDFProps {
  invoice: InvoiceData;
}

// Create Document Component
export function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <Document author={invoice.firmName} title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* --- HEADER SECTION --- */}
        <View style={styles.headerSection}>
          <View style={styles.headerColoredBand} />

          <Text style={styles.taxInvoiceTitle}>TAX INVOICE</Text>

          <Text style={styles.firmNameHeader}>{invoice.firmName}</Text>
          <Text style={styles.firmTagline}>Premium Jewelry</Text>
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
