"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Eye, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface StockItem {
  id: string
  name: string
  category: string
  material: string
  weight: number
  purchasePrice: number
  supplier?: string
  is_sold?: boolean
  sold_at?: string | null
}

interface StockItemTableProps {
  items: StockItem[]
}

export function StockItemTable({ items }: StockItemTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "in-stock" | "sold">("all")
  
  // Filter items based on search term and status filter
  const filteredItems = items.filter(item => {
    // Apply text search filter
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "in-stock" && !item.is_sold) ||
      (statusFilter === "sold" && item.is_sold);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalItems = filteredItems.length;
  const totalValue = filteredItems.reduce((sum, item) => sum + item.purchasePrice, 0);
  const totalWeight = filteredItems.reduce((sum, item) => sum + item.weight, 0);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "all"}
                onCheckedChange={() => setStatusFilter("all")}
              >
                All Items
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "in-stock"}
                onCheckedChange={() => setStatusFilter("in-stock")}
              >
                In Stock
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "sold"}
                onCheckedChange={() => setStatusFilter("sold")}
              >
                Sold
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/stock/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex justify-between py-2 text-sm text-muted-foreground">
        <div>Showing {filteredItems.length} items</div>
        <div className="space-x-4">
          <span>Total Value: ₹{totalValue.toLocaleString()}</span>
          <span>Total Weight: {totalWeight.toFixed(2)}g</span>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.material}</TableCell>
                  <TableCell>{item.weight}g</TableCell>
                  <TableCell>₹{item.purchasePrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={item.is_sold ? "destructive" : "outline"}>
                      {item.is_sold ? "Sold" : "In Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/stock/${item.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
