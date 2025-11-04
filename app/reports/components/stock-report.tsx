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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StockData {
  id: string
  item_number: string
  category: string
  material: string
  purity: string | null
  weight: number
  purchase_price: number
  purchase_date: string | null
  supplier: string | null
  is_sold: boolean
  sold_at: string | null
  created_at: string | null
}

type StatusFilter = "all" | "available" | "sold"

export function StockReport() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stockData, setStockData] = useState<StockData[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  useEffect(() => {
    if (user) {
      fetchStockData()
    }
  }, [user, startDate, endDate, statusFilter])

  const fetchStockData = async () => {
    if (!user) return

    try {
      setLoading(true)

      let query = supabase
        .from("stock_items")
        .select("id, item_number, category, material, purity, weight, purchase_price, purchase_date, supplier, is_sold, sold_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      // Apply date filters on purchase_date
      if (startDate) {
        query = query.gte("purchase_date", format(startDate, "yyyy-MM-dd"))
      }
      if (endDate) {
        query = query.lte("purchase_date", format(endDate, "yyyy-MM-dd"))
      }

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("is_sold", statusFilter === "sold")
      }

      const { data, error } = await query

      if (error) throw error

      setStockData(data || [])
    } catch (error: any) {
      console.error("Error fetching stock data:", error)
      toast({
        title: "Error fetching stock data",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary statistics
  const totalItems = stockData.length
  const availableItems = stockData.filter((item) => !item.is_sold).length
  const soldItems = stockData.filter((item) => item.is_sold).length
  const totalValue = stockData
    .filter((item) => !item.is_sold)
    .reduce((sum, item) => sum + item.purchase_price, 0)
  const totalWeight = stockData
    .filter((item) => !item.is_sold)
    .reduce((sum, item) => sum + item.weight, 0)

  // Prepare data for Excel export
  const exportData: ExportData[] = stockData.map((item) => ({
    "Item Number": item.item_number,
    "Category": item.category,
    "Material": item.material,
    "Purity": item.purity || "N/A",
    "Weight (g)": item.weight,
    "Purchase Price": item.purchase_price,
    "Purchase Date": formatDate(item.purchase_date || ""),
    "Supplier": item.supplier || "N/A",
    "Status": item.is_sold ? "Sold" : "Available",
    "Sold Date": item.sold_at ? formatDate(item.sold_at) : "N/A",
  }))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>Filter stock data by purchase date and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{soldItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeight.toFixed(2)}g</div>
            <p className="text-xs text-muted-foreground">Available stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Available stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Stock Report</CardTitle>
            <CardDescription>
              {startDate && endDate
                ? `Purchase dates: ${formatDate(startDate)} - ${formatDate(endDate)}`
                : "All items"}{" "}
              • {statusFilter === "all" ? "All statuses" : statusFilter === "available" ? "Available only" : "Sold only"}
            </CardDescription>
          </div>
          <ExportButton
            data={exportData}
            fileName={`stock-report-${format(new Date(), "yyyy-MM-dd")}`}
            sheetName="Stock Report"
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
          ) : stockData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stock data found for the selected filters
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Purity</TableHead>
                    <TableHead className="text-right">Weight (g)</TableHead>
                    <TableHead className="text-right">Purchase Price</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sold Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item_number}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.material}</TableCell>
                      <TableCell>{item.purity || "N/A"}</TableCell>
                      <TableCell className="text-right">{item.weight.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.purchase_price)}
                      </TableCell>
                      <TableCell>{formatDate(item.purchase_date || "")}</TableCell>
                      <TableCell>{item.supplier || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_sold ? "secondary" : "default"}>
                          {item.is_sold ? "Sold" : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.sold_at ? formatDate(item.sold_at) : "-"}</TableCell>
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
