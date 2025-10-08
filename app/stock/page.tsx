"use client"

import { useState, useEffect, useMemo } from "react"
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
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Database } from "@/lib/database.types"

// Define types for stock items and categories
type StockItem = {
  id: string
  name: string
  category: string
  material: string
  purity: string
  weight: number
  makingCharges: number
  price: number
  purchasePrice: number
  stock: number
  images: string[]
  description: string
  dateAdded: Date
  is_sold: boolean
  sold_at: string | null
  supplier: string | null
}

type StockCategory = {
  id: string
  name: string
  count: number
  icon: string
}

type FilterCriteria = {
  category: string
  material: string
}

export default function StockPage() {
  const { user } = useAuth()
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [derivedCategories, setDerivedCategories] = useState<StockCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    category: "all",
    material: "all"
  })
  const [activeView, setActiveView] = useState("grid")
  const [error, setError] = useState<string | null>(null)

  // Fetch stock data when component mounts or user changes
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }
    
    fetchStockData()
  }, [user])

  // Fetch stock data from Supabase
  const fetchStockData = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      if (data) {
        // Generate signed URLs for images (private bucket)
        const mappedItemsPromises = data.map(async (item) => {
          let imageUrls = ["/placeholder.svg?height=300&width=300"];

          if (item.image_urls && item.image_urls.length > 0) {
            try {
              // Get the first image only for listing performance
              const firstImagePath = item.image_urls[0];
              const { data: signedData, error: signedError } = await supabase.storage
                .from('stock_item_images')
                .createSignedUrl(firstImagePath, 3600); // 1 hour expiry

              if (!signedError && signedData) {
                imageUrls = [signedData.signedUrl];
              }
            } catch (urlError) {
              console.error('Error generating signed URL for item:', item.item_number, urlError);
            }
          }

          return {
            id: item.item_number,
            name: item.description || `${item.material} ${item.category}`,
            category: item.category,
            material: item.material,
            purity: item.purity || 'N/A',
            weight: item.weight,
            makingCharges: 0, // Not in database, default to 0
            price: item.purchase_price,
            purchasePrice: item.purchase_price,
            stock: 1, // Assuming each row is one item
            images: imageUrls,
            description: item.description || `${item.material} ${item.category} (${item.purity || 'N/A'})`,
            dateAdded: new Date(item.created_at),
            is_sold: item.is_sold,
            sold_at: item.sold_at,
            supplier: item.supplier
          };
        });

        const mappedItems = await Promise.all(mappedItemsPromises);
        setStockItems(mappedItems);
      } else {
        setStockItems([]);
      }
    } catch (error: any) {
      console.error('Error fetching stock data:', error)
      setError(error.message)
      toast({
        title: "Error fetching stock data",
        description: error.message || "Could not load your stock items. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Process the stock data to derive categories and map for display
  const processStockData = (items: Database['public']['Tables']['stock_items']['Row'][]) => {
    // Create a map to count items by category
    const categoryCount: Record<string, number> = {}

    // Convert image paths to full Supabase URLs
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

    // Process each item
    const processedItems = items.map(item => {
      // Count by category
      if (categoryCount[item.category]) {
        categoryCount[item.category]++
      } else {
        categoryCount[item.category] = 1
      }

      // Map item to expected format for StockItemCard and StockItemTable
      return {
        id: item.item_number,
        name: item.description || `${item.material} ${item.category}`, // Use description as name, or fallback
        category: item.category,
        material: item.material,
        purity: item.purity || 'N/A',
        weight: item.weight,
        makingCharges: 0, // Not in schema, using default
        price: item.purchase_price,
        stock: 1, // Assuming each row is one item
        images: item.image_urls && item.image_urls.length > 0
          ? item.image_urls.map((path: string) =>
              `${supabaseUrl}/storage/v1/object/public/stock_item_images/${path}`
            )
          : ["/placeholder.svg?height=300&width=300"],
        description: item.description || `${item.material} ${item.category} (${item.purity || 'N/A'})`,
        dateAdded: new Date(item.created_at)
      } as StockItem
    })
    
    // Convert categories to expected format for StockCategoryCard
    const categories = Object.entries(categoryCount).map(([name, count]) => ({
      id: name,
      name,
      count,
      icon: "/placeholder.svg?height=40&width=40"
    }))
    
    setDerivedCategories(categories)
    return processedItems
  }

  // Apply search and filters to stock items
  const filteredStockItems = useMemo(() => {
    return stockItems.filter(item => {
      // Apply search filter
      const matchesSearch = searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Apply category filter
      const matchesCategory = filterCriteria.category === "all" || 
        item.category === filterCriteria.category
      
      // Apply material filter
      const matchesMaterial = filterCriteria.material === "all" ||
        item.material.toLowerCase() === filterCriteria.material.toLowerCase()
      
      return matchesSearch && matchesCategory && matchesMaterial
    })
  }, [stockItems, searchQuery, filterCriteria])

  // Extract unique materials for the material filter
  const uniqueMaterials = useMemo(() => {
    const materials = new Set(stockItems.map(item => item.material))
    return Array.from(materials)
  }, [stockItems])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setFilterCriteria(prev => ({
      ...prev,
      category: value
    }))
  }

  // Handle material filter change
  const handleMaterialChange = (value: string) => {
    setFilterCriteria(prev => ({
      ...prev,
      material: value
    }))
  }

  // Group items by category for the category view
  const groupedByCategory = stockItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, StockItem[]>)

  const categoryCards = Object.keys(groupedByCategory).map((category) => ({
    name: category,
    count: groupedByCategory[category].length,
    totalValue: groupedByCategory[category].reduce((sum, item) => sum + item.price, 0),
    images: groupedByCategory[category].slice(0, 4).map(item => item.images[0]),
  }))

  // Render loading skeletons for categories
  const renderCategorySkeletons = () => {
    return Array(8).fill(0).map((_, index) => (
      <div key={`category-skeleton-${index}`} className="rounded-md border p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="mt-4 h-8 w-full" />
      </div>
    ))
  }

  // Render loading skeletons for item cards
  const renderItemCardSkeletons = () => {
    return Array(8).fill(0).map((_, index) => (
      <div key={`item-skeleton-${index}`} className="rounded-md border">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div>
              <Skeleton className="h-2 w-10 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div>
              <Skeleton className="h-2 w-10 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div>
              <Skeleton className="h-2 w-10 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div>
              <Skeleton className="h-2 w-10 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <div className="border-t p-2 flex justify-between">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    ))
  }

  // Render loading skeleton for table
  const renderTableSkeleton = () => (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {Array(9).fill(0).map((_, index) => (
                <th key={`th-${index}`} className="p-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(5).fill(0).map((_, rowIndex) => (
              <tr key={`tr-${rowIndex}`} className="border-b">
                {Array(9).fill(0).map((_, cellIndex) => (
                  <td key={`td-${rowIndex}-${cellIndex}`} className="p-3">
                    <Skeleton className="h-4 w-full" />
                    {cellIndex === 0 && <Skeleton className="h-3 w-4/5 mt-1" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // Empty state component
  const EmptyState = ({ message, showAddButton = true }: { message: string; showAddButton?: boolean }) => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium">{message}</h3>
      <p className="text-muted-foreground mb-6">
        {showAddButton ? "Add your first item to start tracking your inventory" : "Try adjusting your filters or search query"}
      </p>
      {showAddButton && (
        <Link href="/stock/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </Link>
      )}
    </div>
  )

  // Render error state
  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl">Sethiya Gold</span>
          </Link>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8 text-center">
          <div className="text-destructive text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold">Error Loading Stock</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchStockData}>Retry</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-2 font-heading font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl">Sethiya Gold</span>
        </div>
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
              <Input 
                placeholder="Search items by name, ID, or description..." 
                className="pl-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button variant="outline" size="icon" title="Filter">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={filterCriteria.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <SelectItem value="all">All Categories</SelectItem>
                  {derivedCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select 
              value={filterCriteria.material} 
              onValueChange={handleMaterialChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by material" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Materials</SelectLabel>
                  <SelectItem value="all">All Materials</SelectItem>
                  {uniqueMaterials.map(material => (
                    <SelectItem key={material} value={material.toLowerCase()}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="grid" onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="category">Category View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">All Items</h2>
                <Badge variant="outline" className="ml-2">
                  {filteredStockItems.length} items
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
              {isLoading ? (
                renderItemCardSkeletons()
              ) : filteredStockItems.length > 0 ? (
                filteredStockItems.map((item) => (
                  <StockItemCard key={item.id} item={item} />
                ))
              ) : (
                <EmptyState 
                  message={stockItems.length > 0 ? "No items match your filters" : "No items found"} 
                  showAddButton={stockItems.length === 0}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="table">
            {isLoading ? (
              renderTableSkeleton()
            ) : filteredStockItems.length > 0 ? (
              <StockItemTable items={filteredStockItems} />
            ) : (
              <EmptyState 
                message={stockItems.length > 0 ? "No items match your filters" : "No items found"} 
                showAddButton={stockItems.length === 0}
              />
            )}
          </TabsContent>

          <TabsContent value="category" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {isLoading ? (
                renderCategorySkeletons()
              ) : categoryCards.length > 0 ? (
                categoryCards.map((category) => (
                  <StockCategoryCard key={category.name} category={category} />
                ))
              ) : (
                <EmptyState message="No categories found" />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
