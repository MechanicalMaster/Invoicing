"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, FileText, Printer, Search, PlusCircle, ChevronLeft, ChevronRight, ArrowDownUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"

interface Invoice {
  id: string
  invoice_number: string
  customer_name_snapshot: string
  invoice_date: string
  grand_total: number
  status: string
}

export default function InvoicesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(10)

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to view invoices",
        variant: "destructive",
      })
    }
  }, [user, authLoading, router, toast])

  // Fetch invoices when dependencies change
  useEffect(() => {
    if (user) {
      fetchInvoices()
    }
  }, [user, currentPage, searchQuery, startDate, endDate, sortDirection])

  // Function to fetch invoices
  const fetchInvoices = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Calculate pagination range
      const from = (currentPage - 1) * pageSize
      const to = from + pageSize - 1

      // Start building the query
      let query = supabase
        .from('invoices')
        .select('id, invoice_number, customer_name_snapshot, invoice_date, grand_total, status', { count: 'exact' })
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: sortDirection === 'asc' })
        .range(from, to)

      // Apply search filter if provided
      if (searchQuery) {
        query = query.ilike('customer_name_snapshot', `%${searchQuery}%`)
      }

      // Apply date filters if provided
      if (startDate) {
        query = query.gte('invoice_date', startDate)
      }
      if (endDate) {
        query = query.lte('invoice_date', endDate)
      }

      // Execute the query
      const { data, error, count } = await query

      if (error) throw error

      setInvoices(data || [])
      setTotalCount(count || 0)
    } catch (error: any) {
      console.error("Error fetching invoices:", error)
      toast({
        title: "Failed to load invoices",
        description: error.message || "An error occurred while loading invoices",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
  }

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize)

  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = "bg-gray-100"
    let textColor = "text-gray-800"

    switch (status.toLowerCase()) {
      case 'paid':
        bgColor = "bg-green-100"
        textColor = "text-green-800"
        break
      case 'pending':
        bgColor = "bg-yellow-100"
        textColor = "text-yellow-800"
        break
      case 'cancelled':
        bgColor = "bg-red-100"
        textColor = "text-red-800"
        break
      case 'finalized':
        bgColor = "bg-blue-100"
        textColor = "text-blue-800"
        break
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status}
      </span>
    )
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <FileText className="h-6 w-6 text-amber-500" />
            <span className="text-xl">Sethiya Gold</span>
          </Link>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold md:text-2xl">Invoices</h1>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-20" />
          </div>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-14 flex-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Show loading state or nothing while checking authentication
  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-amber-500" />
          <span className="text-xl">Sethiya Gold</span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold md:text-2xl">Invoices</h1>
          <Link href="/create-invoice">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Invoice
            </Button>
          </Link>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by customer name..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-40"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>to</span>
            <Input
              type="date"
              className="w-40"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortDirection}
            title={`Sort by date ${sortDirection === 'asc' ? 'oldest first' : 'newest first'}`}
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Invoice List</CardTitle>
            <CardDescription>
              Showing {invoices.length} of {totalCount} invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.customer_name_snapshot}</TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>{formatCurrency(invoice.grand_total)}</TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/invoices/${invoice.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link href={`/invoices/${invoice.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous Page</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next Page</span>
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  )
} 