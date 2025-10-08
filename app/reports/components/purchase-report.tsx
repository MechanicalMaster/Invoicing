"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import supabase from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DateRangeFilter } from "./date-range-filter"
import { ExportButton } from "./export-button"
import { formatCurrency, formatDate, type ExportData } from "@/lib/utils/excel-export"
import { format } from "date-fns"

interface PurchaseData {
  id: string
  purchase_number: string
  invoice_number: string
  invoice_date: string
  amount: number
  payment_status: string
  number_of_items: number | null
  status: string
  suppliers?: {
    name: string
  } | null
}

export function PurchaseReport() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [purchaseData, setPurchaseData] = useState<PurchaseData[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (user) {
      fetchPurchaseData()
    }
  }, [user, startDate, endDate])

  const fetchPurchaseData = async () => {
    if (!user) return

    try {
      setLoading(true)

      let query = supabase
        .from("purchase_invoices")
        .select("id, purchase_number, invoice_number, invoice_date, amount, payment_status, number_of_items, status, suppliers(name)")
        .eq("user_id", user.id)
        .order("invoice_date", { ascending: false })

      // Apply date filters
      if (startDate) {
        query = query.gte("invoice_date", format(startDate, "yyyy-MM-dd"))
      }
      if (endDate) {
        query = query.lte("invoice_date", format(endDate, "yyyy-MM-dd"))
      }

      const { data, error } = await query

      if (error) throw error

      setPurchaseData(data || [])
    } catch (error: any) {
      console.error("Error fetching purchase data:", error)
      toast({
        title: "Error fetching purchase data",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary statistics
  const totalPurchases = purchaseData.reduce((sum, item) => sum + item.amount, 0)
  const totalInvoices = purchaseData.length
  const paidCount = purchaseData.filter((item) => item.payment_status === "paid").length
  const pendingCount = purchaseData.filter((item) => item.payment_status === "pending").length

  // Prepare data for Excel export
  const exportData: ExportData[] = purchaseData.map((item) => ({
    "Purchase Number": item.purchase_number,
    "Invoice Number": item.invoice_number,
    "Date": formatDate(item.invoice_date),
    "Supplier Name": item.suppliers?.name || "N/A",
    "Amount": item.amount,
    "Payment Status": item.payment_status,
    "Number of Items": item.number_of_items || 0,
    "Status": item.status,
  }))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Date Range</CardTitle>
          <CardDescription>Select a date range to filter purchase data</CardDescription>
        </CardHeader>
        <CardContent>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPurchases)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Purchase Report</CardTitle>
            <CardDescription>
              {startDate && endDate
                ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                : "All time"}
            </CardDescription>
          </div>
          <ExportButton
            data={exportData}
            fileName={`purchase-report-${format(new Date(), "yyyy-MM-dd")}`}
            sheetName="Purchase Report"
            disabled={loading}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : purchaseData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No purchase data found for the selected period
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purchase Number</TableHead>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.purchase_number}</TableCell>
                      <TableCell>{item.invoice_number}</TableCell>
                      <TableCell>{formatDate(item.invoice_date)}</TableCell>
                      <TableCell>{item.suppliers?.name || "N/A"}</TableCell>
                      <TableCell className="text-right">{item.number_of_items || 0}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.payment_status === "paid"
                              ? "bg-green-100 text-green-800"
                              : item.payment_status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.payment_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
