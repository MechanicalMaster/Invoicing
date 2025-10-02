"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Mail, MapPin, Phone, Trash2, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

type SupplierWithInvoiceCount = Tables<"suppliers"> & {
  invoiceCount: number;
}

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [supplier, setSupplier] = useState<SupplierWithInvoiceCount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  // Unwrap params
  useEffect(() => {
    params.then(p => setSupplierId(p.id));
  }, [params]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to view supplier details",
        variant: "destructive",
      })
      return
    }

    if (user && supplierId) {
      fetchSupplier()
    }
  }, [user, authLoading, supplierId])

  const fetchSupplier = async () => {
    if (!supplierId) return;
    setIsLoading(true)
    try {
      // Fetch supplier data
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", supplierId)
        .eq("user_id", user!.id)
        .single()

      if (supplierError) {
        throw supplierError
      }

      if (!supplierData) {
        toast({
          title: "Supplier not found",
          description: "The requested supplier does not exist or you don't have access to it",
          variant: "destructive",
        })
        router.push("/purchases?tab=suppliers")
        return
      }

      // Get count of invoices associated with this supplier
      const { count, error: countError } = await supabase
        .from("purchase_invoices")
        .select("*", { count: 'exact', head: true })
        .eq("supplier_id", supplierId)
        .eq("user_id", user!.id)

      if (countError) {
        console.error("Error getting invoice count:", countError)
      }

      setSupplier({ ...supplierData, invoiceCount: count || 0 })
    } catch (error: any) {
      console.error("Error fetching supplier:", error)
      toast({
        title: "Error loading supplier",
        description: error.message || "An error occurred while loading supplier details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSupplier = async () => {
    if (!user || !supplierId) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", supplierId)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Supplier deleted",
        description: "The supplier has been successfully deleted",
      })
      router.push("/purchases?tab=suppliers")
    } catch (error: any) {
      console.error("Error deleting supplier:", error)
      toast({
        title: "Error deleting supplier",
        description: error.message || "An error occurred while deleting the supplier",
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Supplier Details</h1>
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
        ) : supplier ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{supplier.name}</CardTitle>
                    {supplier.contact_person && (
                      <CardDescription className="mt-1.5">
                        Contact: {supplier.contact_person}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/purchases/suppliers/${supplierId}/edit`}>
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
                            This will permanently delete the supplier {supplier.name}
                            {supplier.invoiceCount > 0 ? (
                              <strong className="mt-2 block text-destructive">
                                Warning: This supplier has {supplier.invoiceCount} purchase invoice(s) associated with it.
                                Deleting this supplier will remove the association from those invoices.
                              </strong>
                            ) : null}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteSupplier}
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
                <div className="grid gap-4">
                  {supplier.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">{supplier.phone}</p>
                      </div>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">{supplier.email}</p>
                      </div>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground whitespace-pre-line">{supplier.address}</p>
                      </div>
                    </div>
                  )}
                  {supplier.notes && (
                    <div className="flex items-start gap-3">
                      <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Notes</p>
                        <p className="text-muted-foreground whitespace-pre-line">{supplier.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 p-4">
                <div className="flex w-full items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Added on {new Date(supplier.created_at || "").toLocaleDateString()}
                  </div>
                  <div className="text-muted-foreground">
                    {supplier.invoiceCount} purchase invoice(s) with this supplier
                  </div>
                </div>
              </CardFooter>
            </Card>

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => router.push("/purchases?tab=suppliers")}>
                Back to Suppliers
              </Button>
              <Link href={`/purchases/invoices/add?supplier=${supplierId}`}>
                <Button>
                  Create Purchase Invoice
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <h3 className="mb-2 text-lg font-medium">Supplier Not Found</h3>
            <p className="mb-6 text-center text-sm text-gray-500">
              The requested supplier does not exist or you don't have access to it.
            </p>
            <Button asChild>
              <Link href="/purchases?tab=suppliers">
                Back to Suppliers
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
} 