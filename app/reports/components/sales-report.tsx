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

interface SalesData {
  id: string
  invoice_number: string
  invoice_date: string
  customer_name_snapshot: string
  subtotal: number
  gst_amount: number
  grand_total: number
  status: string
  items_count?: number
}

export function SalesReport() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (user) {
      fetchSalesData()
    }
  }, [user, startDate, endDate])

  const fetchSalesData = async () => {
    if (!user) return

    try {
      setLoading(true)

      let query = supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, customer_name_snapshot, subtotal, gst_amount, grand_total, status")
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

      // Fetch items count for each invoice
      const invoicesWithCounts = await Promise.all(
        (data || []).map(async (invoice) => {
          const { count } = await supabase
            .from("invoice_items")
            .select("*", { count: "exact", head: true })
            .eq("invoice_id", invoice.id)

          return {
            ...invoice,
            items_count: count || 0,
          }
        })
      )

      setSalesData(invoicesWithCounts)
    } catch (error: any) {
      console.error("Error fetching sales data:", error)
      toast({
        title: "Error fetching sales data",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary statistics
  const totalSales = salesData.reduce((sum, item) => sum + item.grand_total, 0)
  const totalInvoices = salesData.length
  const totalGST = salesData.reduce((sum, item) => sum + item.gst_amount, 0)

  // Prepare data for Excel export
  const exportData: ExportData[] = salesData.map((item) => ({
    "Invoice Number": item.invoice_number,
    "Date": formatDate(item.invoice_date),
    "Customer Name": item.customer_name_snapshot,
    "Items Count": item.items_count || 0,
    "Subtotal": item.subtotal,
    "GST Amount": item.gst_amount,
    "Grand Total": item.grand_total,
    "Status": item.status,
  }))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Date Range</CardTitle>
          <CardDescription>Select a date range to filter sales data</CardDescription>
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total GST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGST)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sales Report</CardTitle>
            <CardDescription>
              {startDate && endDate
                ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                : "All time"}
            </CardDescription>
          </div>
          <ExportButton
            data={exportData}
            fileName={`sales-report-${format(new Date(), "yyyy-MM-dd")}`}
            sheetName="Sales Report"
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
          ) : salesData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sales data found for the selected period
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Grand Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.invoice_number}</TableCell>
                      <TableCell>{formatDate(item.invoice_date)}</TableCell>
                      <TableCell>{item.customer_name_snapshot}</TableCell>
                      <TableCell className="text-right">{item.items_count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.gst_amount)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.grand_total)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
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
