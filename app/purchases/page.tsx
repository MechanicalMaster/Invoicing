"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building, Plus, Search, ArrowDownUp, FileText, ShoppingCart, Edit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabase"
import { Tables } from "@/lib/database.types"
import SupplierCard from "./components/supplier-card"
import { useSuppliers } from "@/lib/hooks/useSuppliers"

type PurchaseInvoice = Tables<"purchase_invoices"> & {
  suppliers?: {
    name: string
  } | null
}

type Supplier = Tables<"suppliers">

export default function PurchasesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("invoices")
  const [invoiceSearch, setInvoiceSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([])
  const [supplierSearch, setSupplierSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // Use new API for suppliers
  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
    refetch: refetchSuppliers
  } = useSuppliers({
    search: supplierSearch,
    autoFetch: activeTab === "suppliers"
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to access the purchases page",
        variant: "destructive",
      })
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, isLoading, router, toast, activeTab])

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    try {
      if (activeTab === "invoices") {
        const { data: invoices, error: invoicesError } = await supabase
          .from("purchase_invoices")
          .select("*, suppliers(name)")
          .eq("user_id", user.id)

        if (invoicesError) throw invoicesError
        setPurchaseInvoices(invoices as PurchaseInvoice[] || [])
      } else if (activeTab === "suppliers") {
        // Suppliers now fetched via useSuppliers hook
        await refetchSuppliers()
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error fetching data",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter purchase invoices based on search term and filters
  const filteredInvoices = purchaseInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.purchase_number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      (invoice.suppliers?.name || "").toLowerCase().includes(invoiceSearch.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesPaymentStatus = paymentStatusFilter === "all" || invoice.payment_status === paymentStatusFilter

    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  // Suppliers are now filtered by the hook via the search parameter
  // No need for client-side filtering

  // Show loading state
  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="default">
              <Link href="/purchases/invoices/add">
                <FileText className="mr-2 h-4 w-4" />
                New Invoice
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/purchases/invoices/upload-bill">
                <FileText className="mr-2 h-4 w-4" />
                Upload Bill Photo
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="invoices" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-6">
            {/* Search and filters for Invoices */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search purchases..."
                  className="pl-8"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Payment Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Statuses</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchData}>
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="mt-6 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purchase #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Amount (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.purchase_number}</TableCell>
                        <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.suppliers?.name || "-"}</TableCell>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>₹{invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              invoice.status === "Received"
                                ? "bg-green-100 text-green-800"
                                : invoice.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              invoice.payment_status === "Paid"
                                ? "bg-green-100 text-green-800"
                                : invoice.payment_status === "Partially Paid"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {invoice.payment_status}
                          </span>
                        </TableCell>
                        <TableCell>{invoice.number_of_items || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/purchases/invoices/${invoice.id}`)}
                              title="View"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/purchases/invoices/${invoice.id}/edit`)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No purchase invoices found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="mt-6">
            {/* Search for Suppliers */}
            <div className="relative mb-6 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search suppliers..."
                className="pl-8"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
              />
            </div>

            {/* Suppliers List */}
            {suppliersLoading ? (
              <div className="flex h-24 items-center justify-center">Loading...</div>
            ) : suppliersError ? (
              <div className="flex h-24 items-center justify-center text-red-500">{suppliersError}</div>
            ) : suppliers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier) => (
                  <SupplierCard key={supplier.id} supplier={supplier} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Building className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">No Suppliers Found</h3>
                <p className="mb-6 text-center text-sm text-gray-500">
                  Add your first supplier to get started with managing your supply chain.
                </p>
                <Button asChild>
                  <Link href="/purchases/suppliers/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Supplier
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 