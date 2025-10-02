"use client"

import { useState, useEffect, useRef } from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InvoicePDF } from "@/app/create-invoice/invoice-pdf"
import { toast } from "@/components/ui/use-toast"
import type { InvoiceData } from "@/app/create-invoice/invoice-preview"

interface PDFDownloadLinkWrapperProps {
  invoiceData: InvoiceData
  onStartGeneration: () => void
  onFinishGeneration: () => void
}

// Separate component to handle the render function properly
const PDFButton = ({
  loading,
  error,
  onStartGeneration,
  onFinishGeneration,
}: {
  loading: boolean
  error: Error | null
  onStartGeneration: () => void
  onFinishGeneration: () => void
}) => {
  const prevLoadingRef = useRef(false)

  useEffect(() => {
    if (loading && !prevLoadingRef.current) {
      onStartGeneration()
    } else if (!loading && prevLoadingRef.current) {
      onFinishGeneration()
    }
    prevLoadingRef.current = loading
  }, [loading, onStartGeneration, onFinishGeneration])

  useEffect(() => {
    if (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error generating PDF",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    }
  }, [error])

  return (
    <Button variant="outline" disabled={loading}>
      <Save className="mr-2 h-4 w-4" />
      {loading ? "Generating PDF..." : "Download PDF"}
    </Button>
  )
}

export function PDFDownloadLinkWrapper({
  invoiceData,
  onStartGeneration,
  onFinishGeneration,
}: PDFDownloadLinkWrapperProps) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Button variant="outline" disabled>
        <Save className="mr-2 h-4 w-4" />
        Loading PDF...
      </Button>
    )
  }

  // Validate invoice data before rendering PDF
  if (!invoiceData || !invoiceData.items || invoiceData.items.length === 0) {
    console.error('Invalid invoice data for PDF generation:', invoiceData);
    return (
      <Button variant="outline" disabled>
        <Save className="mr-2 h-4 w-4" />
        Invalid Data
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoiceData} />}
      fileName={`Sethiya-Gold-Invoice-${invoiceData.invoiceNumber}.pdf`}
      className="inline-block"
    >
      {({ blob, url, loading, error }) => (
        <PDFButton
          loading={loading}
          error={error}
          onStartGeneration={onStartGeneration}
          onFinishGeneration={onFinishGeneration}
        />
      )}
    </PDFDownloadLink>
  )
}
