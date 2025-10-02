"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useReactToPrint } from "react-to-print"
import dynamic from "next/dynamic"
import { ArrowLeft, Save, Printer, Edit, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"
import { InvoicePreview, InvoiceData } from "@/app/create-invoice/invoice-preview"

// Dynamically import PDF components with ssr: false to ensure they only load on the client
const PDFDownloadLinkWrapper = dynamic(
  () => import("@/app/create-invoice/pdf-download-link-wrapper").then((mod) => mod.PDFDownloadLinkWrapper),
  { ssr: false },
)

interface InvoiceItem {
  id: string
  name: string
  quantity: number
  weight: number
  price_per_gram: number
  total: number
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [invoice, setInvoice] = useState<any>(null)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)
  
  const invoiceRef = useRef<HTMLDivElement>(null)
  
  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to view this invoice",
        variant: "destructive",
      })
    }
  }, [user, authLoading, router, toast])
  
  // Set isBrowser to true once component mounts
  useEffect(() => {
    setIsBrowser(true)
  }, [])
  
  // Fetch invoice data
  useEffect(() => {
    if (user && params.id) {
      fetchInvoiceData()
    }
  }, [user, params.id])
  
  // Fetch invoice and its items
  const fetchInvoiceData = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Fetch invoice
      if (!params.id) {
        throw new Error('Invoice ID is required')
      }

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()
      
      if (invoiceError) throw invoiceError
      
      if (!invoiceData) {
        toast({
          title: "Invoice not found",
          description: "The requested invoice could not be found",
          variant: "destructive",
        })
        router.push("/invoices")
        return
      }
      
      setInvoice(invoiceData)
      
      // Fetch invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', params.id)
        .order('created_at', { ascending: true })
      
      if (itemsError) throw itemsError
      
      setInvoiceItems(itemsData || [])
    } catch (error: any) {
      console.error("Error fetching invoice:", error)
      toast({
        title: "Error loading invoice",
        description: error.message || "Could not load invoice details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Mark invoice as paid
  const markAsPaid = async () => {
    if (!user || !invoice) return
    
    try {
      setIsUpdating(true)
      
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoice.id)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      // Update local state
      setInvoice({ ...invoice, status: 'paid' })
      
      toast({
        title: "Invoice updated",
        description: "Invoice has been marked as paid",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error updating invoice:", error)
      toast({
        title: "Update failed",
        description: error.message || "Could not update invoice status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }
  
  // Format invoice data for the preview component - memoized to avoid recalculation
  // All formatting logic is inside useMemo to ensure stable references and proper dependency tracking
  const invoiceData = useMemo((): InvoiceData | null => {
    if (!invoice) return null
    
    // Safe date formatter - handles null, undefined, and invalid dates
    const formatDate = (dateString: any): string => {
      if (!dateString) return 'N/A'
      
      try {
        const date = new Date(dateString)
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return 'N/A'
        }
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      } catch (error) {
        console.error('Error formatting date:', error)
        return 'N/A'
      }
    }
    
    // Safe number converter with bounds checking
    const safeNumber = (value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
      const num = Number(value)
      if (isNaN(num) || !isFinite(num) || num < min || num > max) {
        return 0
      }
      return num
    }
    
    try {
      // Create stable item references by pre-processing
      const processedItems = invoiceItems.map(item => ({
        name: String(item.name || ''),
        quantity: safeNumber(item.quantity, 0, 999999),
        weight: safeNumber(item.weight, 0, 999999),
        pricePerGram: safeNumber(item.price_per_gram, 0, 999999),
        total: safeNumber(item.total, 0, 99999999),
      }))
      
      return {
        invoiceNumber: String(invoice.invoice_number || 'N/A'),
        date: formatDate(invoice.invoice_date),
        customerName: String(invoice.customer_name_snapshot || ''),
        customerAddress: invoice.customer_address_snapshot ? String(invoice.customer_address_snapshot) : undefined,
        customerPhone: invoice.customer_phone_snapshot ? String(invoice.customer_phone_snapshot) : undefined,
        customerEmail: invoice.customer_email_snapshot ? String(invoice.customer_email_snapshot) : undefined,
        firmName: String(invoice.firm_name_snapshot || ''),
        firmAddress: String(invoice.firm_address_snapshot || ''),
        firmPhone: String(invoice.firm_phone_snapshot || ''),
        firmGstin: String(invoice.firm_gstin_snapshot || ''),
        items: processedItems,
        subtotal: safeNumber(invoice.subtotal, 0, 99999999),
        gstPercentage: safeNumber(invoice.gst_percentage, 0, 100),
        gstAmount: safeNumber(invoice.gst_amount, 0, 99999999),
        total: safeNumber(invoice.grand_total, 0, 99999999),
      }
    } catch (error) {
      console.error('Error formatting invoice data:', error)
      return null
    }
  }, [invoice, invoiceItems])
  
  // Handle printing
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${invoice?.invoice_number}`,
  })
  
  // Show loading state or nothing while checking authentication
  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }
  
  // Show loading state while fetching data
  if (isLoading) {
    return (
      <>
        <div className="flex items-center">
          <Link href="/invoices">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Button>
          </Link>
          <Skeleton className="ml-4 h-8 w-48" />
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-[60vh] w-full" />
      </>
    )
  }
  
  // If no invoice found
  if (!invoice) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Invoice Not Found</h1>
        <p className="mb-4 text-muted-foreground">The requested invoice could not be found</p>
        <Link href="/invoices">
          <Button>Back to Invoices</Button>
        </Link>
      </div>
    )
  }
  
  return (
    <>
      <div className="flex items-center">
        <Link href="/invoices">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Button>
        </Link>
        <h1 className="ml-4 text-xl font-semibold md:text-2xl">
          Invoice #{invoice.invoice_number}
        </h1>
      </div>
      
      <div className="flex flex-wrap justify-end gap-2">
        {invoice.status !== 'paid' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={isUpdating}>
                <DollarSign className="mr-2 h-4 w-4" />
                Mark as Paid
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mark Invoice as Paid?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will update the invoice status to "Paid". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={markAsPaid}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        <Link href={`/invoices/${invoice.id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Invoice
          </Button>
        </Link>
        
        {isBrowser && (
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        )}
        
        {isBrowser && invoiceData && invoiceItems.length > 0 && (
          <PDFDownloadLinkWrapper
            invoiceData={invoiceData}
            onStartGeneration={() => setIsGeneratingPDF(true)}
            onFinishGeneration={() => setIsGeneratingPDF(false)}
          />
        )}
      </div>
      
      <div ref={invoiceRef}>
        {invoiceData && (
          <InvoicePreview invoiceData={invoiceData} />
        )}
      </div>
    </>
  )
} 