import Link from "next/link"
import { FileText, Home, Package, Plus, Search, Filter, Grid, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { StockItemCard } from "@/app/stock/stock-item-card"
import { StockItemTable } from "@/app/stock/stock-item-table"
import { StockCategoryCard } from "@/app/stock/stock-category-card"

// Mock data for jewelry categories
const categories = [
  {
    id: "cat-1",
    name: "Necklace",
    count: 12,
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "cat-2",
    name: "Chain",
    count: 18,
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "cat-3",
    name: "Ladies Ring",
    count: 24,
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "cat-4",
    name: "Gents Ring",
    count: 15,
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "cat-5",
    name: "Bangles",
    count: 9,
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "cat-6",
    name: "Earrings",
    count: 21,
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "cat-7",
    name: "Pendant",
    count: 14,
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "cat-8",
    name: "Bracelet",
    count: 11,
    icon: "/placeholder.svg?height=40&width=40",
  },
]

// Mock data for jewelry items
const items = [
  {
    id: "JWL-NK-001",
    name: "Diamond Studded Gold Necklace",
    category: "Necklace",
    material: "Gold",
    purity: "22K",
    weight: 25.8,
    makingCharges: 12500,
    price: 145000,
    stock: 2,
    images: [
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
    ],
    description: "Elegant diamond studded gold necklace with intricate design",
    dateAdded: new Date("2023-04-15"),
  },
  {
    id: "JWL-CH-002",
    name: "Gold Chain with Pendant",
    category: "Chain",
    material: "Gold",
    purity: "22K",
    weight: 12.5,
    makingCharges: 5000,
    price: 78000,
    stock: 3,
    images: ["/placeholder.svg?height=300&width=300", "/placeholder.svg?height=300&width=300"],
    description: "Classic gold chain with elegant pendant",
    dateAdded: new Date("2023-04-18"),
  },
  {
    id: "JWL-LR-003",
    name: "Diamond Ladies Ring",
    category: "Ladies Ring",
    material: "Gold",
    purity: "18K",
    weight: 5.2,
    makingCharges: 3500,
    price: 45000,
    stock: 5,
    images: ["/placeholder.svg?height=300&width=300"],
    description: "Beautiful diamond ring for ladies with modern design",
    dateAdded: new Date("2023-04-20"),
  },
  {
    id: "JWL-BG-004",
    name: "Gold Bangles Set",
    category: "Bangles",
    material: "Gold",
    purity: "22K",
    weight: 30.5,
    makingCharges: 15000,
    price: 185000,
    stock: 1,
    images: [
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
    ],
    description: "Set of 4 traditional gold bangles with intricate carving",
    dateAdded: new Date("2023-04-22"),
  },
  {
    id: "JWL-ER-005",
    name: "Ruby Earrings",
    category: "Earrings",
    material: "Gold",
    purity: "22K",
    weight: 8.3,
    makingCharges: 4500,
    price: 65000,
    stock: 2,
    images: ["/placeholder.svg?height=300&width=300"],
    description: "Elegant ruby earrings with gold setting",
    dateAdded: new Date("2023-04-25"),
  },
  {
    id: "JWL-GR-006",
    name: "Men's Gold Ring",
    category: "Gents Ring",
    material: "Gold",
    purity: "22K",
    weight: 7.8,
    makingCharges: 3800,
    price: 52000,
    stock: 4,
    images: ["/placeholder.svg?height=300&width=300"],
    description: "Classic men's gold ring with minimal design",
    dateAdded: new Date("2023-04-28"),
  },
]

export default function StockPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl">Sethiya Gold</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Stock Management</h1>
            <p className="text-muted-foreground">Manage your jewelry inventory and track items</p>
          </div>
          <Link href="/stock/add">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search items by name, ID, or description..." className="pl-10" />
            </div>
            <Button variant="outline" size="icon" title="Filter">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by material" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Materials</SelectLabel>
                  <SelectItem value="all">All Materials</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <StockCategoryCard key={category.id} category={category} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">All Items</h2>
                <Badge variant="outline" className="ml-2">
                  {items.length} items
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Grid className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <StockItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table">
            <StockItemTable items={items} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
