import Link from "next/link"
import { Eye, Edit, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StockItemTableProps {
  items: {
    id: string
    name: string
    category: string
    material: string
    purity: string
    weight: number
    makingCharges: number
    price: number
    stock: number
    images: string[]
    description: string
    dateAdded: Date
  }[]
}

export function StockItemTable({ items }: StockItemTableProps) {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-3 pl-4 pr-3 text-left text-sm font-medium">Item</th>
              <th className="px-3 py-3 text-left text-sm font-medium">ID</th>
              <th className="px-3 py-3 text-left text-sm font-medium">Category</th>
              <th className="px-3 py-3 text-left text-sm font-medium">Material</th>
              <th className="px-3 py-3 text-left text-sm font-medium">Weight</th>
              <th className="px-3 py-3 text-left text-sm font-medium">Price</th>
              <th className="px-3 py-3 text-left text-sm font-medium">Stock</th>
              <th className="px-3 py-3 text-left text-sm font-medium">Added</th>
              <th className="px-3 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">{item.id}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">{item.category}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  {item.material} {item.purity}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">{item.weight}g</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">₹{item.price.toLocaleString()}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <Badge variant={item.stock > 0 ? "outline" : "destructive"}>
                    {item.stock > 0 ? item.stock : "Out of Stock"}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  {item.dateAdded.toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-right text-sm">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/stock/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/stock/${item.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Item
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <span className="text-destructive">Delete Item</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
