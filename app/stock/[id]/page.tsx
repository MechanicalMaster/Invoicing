"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Home, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageGallery } from "@/app/stock/[id]/image-gallery"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export default function StockItemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [itemData, setItemData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch item data when component mounts or when user/params change
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    fetchItemData()
  }, [user, params.id])

  const fetchItemData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', user?.id)
        .eq('item_number', params.id)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        // Map Supabase data to the format expected by UI
        const mappedItem = {
          id: data.item_number,
          name: data.description || `${data.material} ${data.category}`,
          category: data.category,
          material: data.material,
          purity: data.purity || 'N/A',
          weight: data.weight,
          makingCharges: 0, // Not in schema, default to 0
          price: data.purchase_price,
          stock: 1, // Assuming each row is one item
          images: data.image_urls && data.image_urls.length > 0 
            ? data.image_urls 
            : ["/placeholder.svg?height=600&width=600"],
          description: data.description || `${data.material} ${data.category} (${data.purity || 'N/A'})`,
          dateAdded: new Date(data.created_at),
          supplier: data.supplier || 'Not specified',
          purchaseDate: data.purchase_date ? new Date(data.purchase_date) : new Date(),
          purchasePrice: data.purchase_price,
          location: "Main Showcase", // Default value as not in schema
          // Add other fields with default values or from data if available
          specifications: {
            length: "N/A",
            clasp: "N/A",
            diamonds: {
              count: 0,
              totalCarat: 0,
              clarity: "N/A",
              color: "N/A",
            },
          },
          transactions: [],
          // Keep a reference to the original data
          _original: data
        }
        
        setItemData(mappedItem)
      } else {
        setError("Item not found")
      }
    } catch (error: any) {
      console.error('Error fetching item data:', error)
      setError(error.message || "Failed to load item data")
      toast({
        title: "Error",
        description: error.message || "Failed to load item data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="ml-auto">
            <Skeleton className="h-8 w-24" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="ml-4 h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Skeleton className="aspect-square md:col-span-2" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <div className="grid grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-0.5 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Render error state
  if (error || !itemData) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl">Sethiya Gold</span>
          </Link>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8 text-center">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Item Not Found</h1>
          <p className="text-muted-foreground">{error || "The requested item could not be found."}</p>
          <Link href="/stock">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stock
            </Button>
          </Link>
        </main>
      </div>
    )
  }

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
          <div className="flex items-center">
            <Link href="/stock">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Stock
              </Button>
            </Link>
            <h1 className="ml-4 text-xl font-semibold md:text-2xl">{itemData.name}</h1>
          </div>
          <Link href={`/stock/${params.id}/edit`}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Item
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Image Gallery */}
          <Card className="md:col-span-2">
            <CardContent className="p-0">
              <ImageGallery images={itemData.images} />
            </CardContent>
          </Card>

          {/* Item Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{itemData.name}</CardTitle>
                  <CardDescription>Item ID: {itemData.id}</CardDescription>
                </div>
                <Badge variant={itemData.stock > 0 ? "outline" : "destructive"} className="text-sm">
                  {itemData.stock > 0 ? `In Stock: ${itemData.stock}` : "Out of Stock"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="text-2xl font-bold text-primary">₹{itemData.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Selling Price</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-medium">{itemData.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Material</div>
                  <div className="font-medium">
                    {itemData.material} {itemData.purity}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Weight</div>
                  <div className="font-medium">{itemData.weight}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Supplier</div>
                  <div className="font-medium">{itemData.supplier}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium">Description</div>
                <div className="text-sm text-muted-foreground">{itemData.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Purchase Date</div>
                  <div className="font-medium">
                    {itemData.purchaseDate.toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Purchase Price</div>
                  <div className="font-medium">₹{itemData.purchasePrice.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
