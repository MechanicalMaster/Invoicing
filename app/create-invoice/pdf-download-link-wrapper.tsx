"use client"

import { useState, useEffect } from "react"
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

export function PDFDownloadLinkWrapper({
  invoiceData,
  onStartGeneration,
  onFinishGeneration,
}: PDFDownloadLinkWrapperProps) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  const [prevLoading, setPrevLoading] = useState(false)

  if (!isClient) {
    return (
      <Button variant="outline" disabled>
        <Save className="mr-2 h-4 w-4" />
        Loading PDF...
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoiceData} />}
      fileName={`Sethiya-Gold-Invoice-${invoiceData.invoiceNumber}.pdf`}
      className="inline-block"
    >
      {({ blob, url, loading, error }) => {
        useEffect(() => {
          if (loading && !prevLoading) {
            onStartGeneration()
          } else if (!loading && prevLoading) {
            onFinishGeneration()
          }
          setPrevLoading(loading)
        }, [loading, prevLoading, onStartGeneration, onFinishGeneration])

        if (error) {
          console.error("Error generating PDF:", error)
          toast({
            title: "Error generating PDF",
            description: error.message || "Please try again.",
            variant: "destructive",
          })
        }

        return (
          <Button variant="outline" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Generating PDF..." : "Download PDF"}
          </Button>
        )
      }}
    </PDFDownloadLink>
  )
}
