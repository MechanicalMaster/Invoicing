import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { InvoiceData } from "@/app/create-invoice/invoice-preview"

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#B45309", // amber-700
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F5F5F4", // stone-100
    borderRadius: 5,
  },
  infoColumn: {
    flexDirection: "column",
  },
  infoLabel: {
    fontSize: 10,
    color: "#78716C", // stone-500
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
  },
  customerInfo: {
    fontSize: 10,
    color: "#78716C", // stone-500
    marginTop: 2,
  },
  table: {
    // display: "table", - Removed due to type issue
    width: "100%",
    marginBottom: 20,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E7E5E4", // stone-200
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderCell: {
    backgroundColor: "#F5F5F4", // stone-100
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E7E5E4", // stone-200
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E7E5E4", // stone-200
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  summaryContainer: {
    alignSelf: "flex-end",
    width: "50%",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4", // stone-200
    borderBottomStyle: "solid",
  },
  summaryLabel: {
    fontSize: 10,
  },
  summaryValue: {
    fontSize: 10,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    fontWeight: "bold",
  },
  totalLabel: {
    fontSize: 12,
  },
  totalValue: {
    fontSize: 12,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
  },
  footerText: {
    fontSize: 10,
    marginBottom: 5,
  },
  footerSmallText: {
    fontSize: 8,
    color: "#78716C", // stone-500
  },
})

interface InvoicePDFProps {
  invoice: InvoiceData;
}

// Create Document Component
export function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{invoice.firmName}</Text>
          <Text style={styles.subtitle}>Premium Jewelry</Text>
          <Text style={styles.subtitle}>{invoice.firmAddress}</Text>
          <Text style={styles.subtitle}>GSTIN: {invoice.firmGstin} | Phone: {invoice.firmPhone}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Invoice To:</Text>
            <Text style={styles.infoValue}>{invoice.customerName}</Text>
            {invoice.customerAddress && (
              <Text style={styles.customerInfo}>{invoice.customerAddress}</Text>
            )}
            {invoice.customerPhone && (
              <Text style={styles.customerInfo}>Phone: {invoice.customerPhone}</Text>
            )}
            {invoice.customerEmail && (
              <Text style={styles.customerInfo}>Email: {invoice.customerEmail}</Text>
            )}
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Invoice Number:</Text>
            <Text style={styles.infoValue}>{invoice.invoiceNumber}</Text>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{invoice.date}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableHeaderCell, { width: "30%" }]}>
              <Text>Item</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: "10%" }]}>
              <Text>Qty</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: "12%" }]}>
              <Text>Weight (g)</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: "13%" }]}>
              <Text>Price/10g (₹)</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: "15%" }]}>
              <Text>Making (₹)</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: "20%" }]}>
              <Text>Amount (₹)</Text>
            </View>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCell, { width: "30%" }]}>
                <Text>{item.name}</Text>
              </View>
              <View style={[styles.tableCell, { width: "10%" }]}>
                <Text>{item.quantity}</Text>
              </View>
              <View style={[styles.tableCell, { width: "12%" }]}>
                <Text>{item.weight.toFixed(2)}</Text>
              </View>
              <View style={[styles.tableCell, { width: "13%" }]}>
                <Text>{item.pricePerGram.toFixed(2)}</Text>
              </View>
              <View style={[styles.tableCell, { width: "15%" }]}>
                <Text>{item.makingCharges.toFixed(2)}</Text>
              </View>
              <View style={[styles.tableCell, { width: "20%" }]}>
                <Text>{item.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₹{invoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Making Charges:</Text>
            <Text style={styles.summaryValue}>₹{invoice.makingCharges.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST ({invoice.gstPercentage}%):</Text>
            <Text style={styles.summaryValue}>₹{invoice.gstAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₹{invoice.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for shopping with {invoice.firmName}!</Text>
          <Text style={styles.footerText}>
            For any queries related to this invoice, please contact us at info@{invoice.firmName.toLowerCase().replace(/\s+/g, '')}.com
          </Text>
          <Text style={styles.footerSmallText}>
            This is a computer-generated invoice and does not require a physical signature.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
