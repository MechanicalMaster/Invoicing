"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  Edit, 
  FileText, 
  Package, 
  ShoppingCart, 
  Trash2,
  Tag,
  DollarSign,
  ClipboardList,
  User,
  Mail
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import supabase from "@/lib/supabase"
import { Tables } from "@/lib/database.types"

type PurchaseInvoice = Tables<"purchase_invoices"> & {
  suppliers?: Tables<"suppliers"> | null
}

export default function PurchaseInvoiceDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to view purchase invoice details",
        variant: "destructive",
      })
      return
    }

    if (user) {
      fetchInvoice()
    }
  }, [user, authLoading, params.id])

  const fetchInvoice = async () => {
    setIsLoading(true)
    try {
      // Fetch invoice data with supplier details
      const { data, error } = await supabase
        .from("purchase_invoices")
        .select(`
          *,
          suppliers:supplier_id (
            id,
            name,
            contact_person,
            phone,
            email
          )
        `)
        .eq("id", params.id)
        .eq("user_id", user!.id)
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        toast({
          title: "Invoice not found",
          description: "The requested purchase invoice does not exist or you don't have access to it",
          variant: "destructive",
        })
        router.push("/purchases?tab=invoices")
        return
      }

      setInvoice(data)
    } catch (error: any) {
      console.error("Error fetching purchase invoice:", error)
      toast({
        title: "Error loading purchase invoice",
        description: error.message || "An error occurred while loading purchase invoice details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Received":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
      case "Cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "Partially Paid":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80"
      case "Unpaid":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
    }
  }

  const handleDeleteInvoice = async () => {
    if (!user || !invoice) return

    setIsDeleting(true)
    try {
      // First, delete file from storage if exists
      if (invoice.invoice_file_url) {
        try {
          // Extract file path from URL
          const url = new URL(invoice.invoice_file_url)
          const pathParts = url.pathname.split('/')
          const filename = pathParts[pathParts.length - 1]
          const filePath = `${user.id}/${filename}`
          
          const { error: storageError } = await supabase.storage
            .from('purchase-invoices')
            .remove([filePath])
          
          if (storageError) {
            console.error("Error deleting file:", storageError)
            // Continue with invoice deletion even if file deletion fails
          }
        } catch (fileError) {
          console.error("Error processing file deletion:", fileError)
          // Continue with invoice deletion even if file deletion fails
        }
      }

      // Delete invoice
      const { error } = await supabase
        .from("purchase_invoices")
        .delete()
        .eq("id", params.id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Purchase invoice deleted",
        description: "The purchase invoice has been successfully deleted",
      })
      router.push("/purchases?tab=invoices")
    } catch (error: any) {
      console.error("Error deleting purchase invoice:", error)
      toast({
        title: "Error deleting purchase invoice",
        description: error.message || "An error occurred while deleting the purchase invoice",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Purchase Invoice Details</h1>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="grid gap-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : invoice ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      Purchase #{invoice.purchase_number}
                      <Badge variant="outline" className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      Invoice #{invoice.invoice_number}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/purchases/invoices/${params.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete purchase invoice #{invoice.purchase_number} and any associated files.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteInvoice}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Invoice Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Invoice Details</h3>

                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Invoice Date</p>
                        <p className="text-muted-foreground">
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Amount</p>
                        <p className="text-muted-foreground">₹{invoice.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Tag className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Payment Status</p>
                        <Badge variant="outline" className={getPaymentStatusColor(invoice.payment_status)}>
                          {invoice.payment_status}
                        </Badge>
                      </div>
                    </div>

                    {invoice.number_of_items && (
                      <div className="flex items-start gap-3">
                        <Package className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Number of Items</p>
                          <p className="text-muted-foreground">{invoice.number_of_items}</p>
                        </div>
                      </div>
                    )}

                    {invoice.invoice_file_url && (
                      <div className="flex items-start gap-3">
                        <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Invoice File</p>
                          <a 
                            href={invoice.invoice_file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            View/Download Invoice
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supplier Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Supplier Details</h3>

                    {invoice.suppliers ? (
                      <>
                        <div className="flex items-start gap-3">
                          <ShoppingCart className="mt-0.5 h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Supplier Name</p>
                            <Link href={`/purchases/suppliers/${invoice.supplier_id}`} className="text-primary hover:underline">
                              {invoice.suppliers.name}
                            </Link>
                          </div>
                        </div>

                        {invoice.suppliers.contact_person && (
                          <div className="flex items-start gap-3">
                            <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Contact Person</p>
                              <p className="text-muted-foreground">{invoice.suppliers.contact_person}</p>
                            </div>
                          </div>
                        )}

                        {(invoice.suppliers.phone || invoice.suppliers.email) && (
                          <div className="flex items-start gap-3">
                            <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Contact Info</p>
                              {invoice.suppliers.phone && (
                                <p className="text-muted-foreground">{invoice.suppliers.phone}</p>
                              )}
                              {invoice.suppliers.email && (
                                <p className="text-muted-foreground">{invoice.suppliers.email}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="rounded-md border border-dashed p-4 text-center">
                        <p className="text-sm text-muted-foreground">No supplier associated with this invoice.</p>
                      </div>
                    )}

                    {/* Notes */}
                    {invoice.notes && (
                      <div className="flex items-start gap-3 mt-6">
                        <ClipboardList className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Notes</p>
                          <p className="text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 p-4">
                <div className="flex w-full items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Added on {new Date(invoice.created_at || "").toLocaleDateString()}
                  </div>
                  {invoice.updated_at && invoice.updated_at !== invoice.created_at && (
                    <div className="text-muted-foreground">
                      Last updated on {new Date(invoice.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => router.push("/purchases?tab=invoices")}>
                Back to Invoices
              </Button>
              {invoice.suppliers && (
                <Button variant="outline" asChild>
                  <Link href={`/purchases/suppliers/${invoice.supplier_id}`}>
                    View Supplier
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <h3 className="mb-2 text-lg font-medium">Purchase Invoice Not Found</h3>
            <p className="mb-6 text-center text-sm text-gray-500">
              The requested purchase invoice does not exist or you don't have access to it.
            </p>
            <Button asChild>
              <Link href="/purchases?tab=invoices">
                Back to Invoices
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
} 