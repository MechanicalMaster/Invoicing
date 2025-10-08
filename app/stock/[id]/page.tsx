"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Home, Edit, Printer, Trash2, Tag, ShoppingBag } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageGallery } from "@/app/stock/[id]/image-gallery"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import StockItemLabelDownloadWrapper from "../components/stock-item-label-download-wrapper"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

// Define the label settings type
type LabelSettings = {
  type: 'standard' | 'large' | 'small';
  copies: number;
  includeProductName: boolean;
  includePrice: boolean;
  includeBarcode: boolean;
  includeDate: boolean;
  includeMetal: boolean;
  includeWeight: boolean;
  includePurity: boolean;
  includeQrCode: boolean;
  qrErrorCorrection: 'L' | 'M' | 'Q' | 'H';
};

export default function StockItemDetailPage() {
  const params = useParams()
  const itemId = params.id
  if (!itemId || typeof itemId !== 'string') {
    throw new Error('Invalid item ID')
  }
  
  const router = useRouter()
  const { user } = useAuth()
  const [itemData, setItemData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLabelDownload, setShowLabelDownload] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMarkingAsSold, setIsMarkingAsSold] = useState(false)
  const [labelSettings, setLabelSettings] = useState<LabelSettings>({
    type: "standard",
    copies: 1,
    includeProductName: true,
    includePrice: true,
    includeBarcode: true,
    includeDate: true,
    includeMetal: true,
    includeWeight: true,
    includePurity: true,
    includeQrCode: true,
    qrErrorCorrection: "M"
  })

  // Fetch item data when component mounts or when user/params change
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    fetchItemData()
  }, [user, itemId])

  const fetchItemData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!user?.id) {
        throw new Error('User ID is required')
      }

      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_number', itemId)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        // Convert image paths to full Supabase URLs
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const imageUrls = data.image_urls && data.image_urls.length > 0
          ? data.image_urls.map((path: string) =>
              `${supabaseUrl}/storage/v1/object/public/stock_item_images/${path}`
            )
          : ["/placeholder.svg?height=600&width=600"]

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
          images: imageUrls,
          description: data.description || `${data.material} ${data.category} (${data.purity || 'N/A'})`,
          dateAdded: new Date(data.created_at),
          supplier: data.supplier || 'Not specified',
          purchaseDate: data.purchase_date ? new Date(data.purchase_date) : new Date(),
          purchasePrice: data.purchase_price,
          location: "Main Showcase", // Default value as not in schema
          is_sold: data.is_sold,
          sold_at: data.sold_at ? new Date(data.sold_at) : null,
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

  const handlePrintLabel = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to print labels.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fetch user settings to get label configuration
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          throw error;
        }
        // No settings found, use default
      } else if (data) {
        // Update label settings from user preferences
        setLabelSettings({
          type: data.label_type || labelSettings.type,
          copies: data.label_copies || labelSettings.copies,
          includeProductName: data.label_include_product_name ?? labelSettings.includeProductName,
          includePrice: data.label_include_price ?? labelSettings.includePrice,
          includeBarcode: data.label_include_barcode ?? labelSettings.includeBarcode,
          includeDate: data.label_include_date ?? labelSettings.includeDate,
          includeMetal: data.label_include_metal ?? labelSettings.includeMetal,
          includeWeight: data.label_include_weight ?? labelSettings.includeWeight,
          includePurity: data.label_include_purity ?? labelSettings.includePurity,
          includeQrCode: data.label_include_qr_code ?? labelSettings.includeQrCode,
          qrErrorCorrection: data.label_qr_error_correction || labelSettings.qrErrorCorrection
        });
      }
      
      // Show the label download component
      setShowLabelDownload(true);
    } catch (error: any) {
      console.error('Error fetching label settings:', error);
      toast({
        title: "Error loading label settings",
        description: error.message || "Failed to load label settings",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete items.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('stock_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_number', itemId);

      if (error) {
        throw error;
      }

      toast({
        title: "Item deleted",
        description: "The item has been successfully deleted",
      });

      // Redirect to the stock list
      router.push("/stock");
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error deleting item",
        description: error.message || "Failed to delete item",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsSold = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to mark items as sold.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsMarkingAsSold(true);
      
      const { error } = await supabase
        .from('stock_items')
        .update({
          is_sold: true,
          sold_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('item_number', itemId);

      if (error) {
        throw error;
      }

      toast({
        title: "Item marked as sold",
        description: "The item has been successfully marked as sold",
      });

      // Refresh the data
      await fetchItemData();
    } catch (error: any) {
      console.error('Error marking item as sold:', error);
      toast({
        title: "Error marking item as sold",
        description: error.message || "Failed to mark item as sold",
        variant: "destructive"
      });
    } finally {
      setIsMarkingAsSold(false);
    }
  };

  const handleMarkAsUnsold = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update items.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsMarkingAsSold(true);
      
      const { error } = await supabase
        .from('stock_items')
        .update({
          is_sold: false,
          sold_at: null,
        })
        .eq('user_id', user.id)
        .eq('item_number', itemId);

      if (error) {
        throw error;
      }

      toast({
        title: "Item marked as in stock",
        description: "The item has been returned to inventory",
      });

      // Refresh the data
      await fetchItemData();
    } catch (error: any) {
      console.error('Error marking item as unsold:', error);
      toast({
        title: "Error updating item",
        description: error.message || "Failed to update item",
        variant: "destructive"
      });
    } finally {
      setIsMarkingAsSold(false);
    }
  };

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <Link href="/stock">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Stock
              </Button>
            </Link>
            <h1 className="ml-4 text-xl font-semibold md:text-2xl">{itemData.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePrintLabel} size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print Label</span>
              <span className="sm:hidden">Print</span>
            </Button>

            {!itemData.is_sold ? (
              <ConfirmDialog
                trigger={
                  <Button size="sm" className="gap-2" variant="outline" disabled={isMarkingAsSold}>
                    <ShoppingBag className="h-4 w-4" />
                    <span className="hidden sm:inline">{isMarkingAsSold ? "Processing..." : "Mark as Sold"}</span>
                    <span className="sm:hidden">Sold</span>
                  </Button>
                }
                title="Mark Item as Sold"
                description="Are you sure you want to mark this item as sold? This will remove it from active inventory."
                actionText="Mark as Sold"
                onConfirm={handleMarkAsSold}
              />
            ) : (
              <ConfirmDialog
                trigger={
                  <Button size="sm" className="gap-2" variant="outline" disabled={isMarkingAsSold}>
                    <Tag className="h-4 w-4" />
                    <span className="hidden sm:inline">{isMarkingAsSold ? "Processing..." : "Return to Stock"}</span>
                    <span className="sm:hidden">Restock</span>
                  </Button>
                }
                title="Return Item to Stock"
                description="Are you sure you want to mark this item as in stock? This will return it to active inventory."
                actionText="Return to Stock"
                onConfirm={handleMarkAsUnsold}
              />
            )}

            <ConfirmDialog
              trigger={
                <Button size="sm" className="gap-2" variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete Item"}</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
              }
              title="Delete Item"
              description="Are you sure you want to delete this item? This action cannot be undone."
              actionText="Delete Item"
              variant="destructive"
              onConfirm={handleDeleteItem}
            />

            <Link href={`/stock/${itemId}/edit`}>
              <Button size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Item</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </Link>
          </div>
        </div>

        {showLabelDownload && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Print Label</CardTitle>
              <CardDescription>Download the label PDF and print it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <StockItemLabelDownloadWrapper 
                  itemData={itemData} 
                  labelSettings={labelSettings} 
                />
                <Button variant="outline" onClick={() => setShowLabelDownload(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                <Badge 
                  variant={itemData.is_sold ? "destructive" : "outline"} 
                  className="text-sm"
                >
                  {itemData.is_sold ? "Sold" : "In Stock"}
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
                  <div className="text-sm text-muted-foreground">Purchase Date</div>
                  <div className="font-medium">
                    {itemData.purchaseDate.toLocaleDateString()}
                  </div>
                </div>
              </div>

              {itemData.is_sold && itemData.sold_at && (
                <div>
                  <div className="text-sm text-muted-foreground">Sold Date</div>
                  <div className="font-medium">
                    {new Date(itemData.sold_at).toLocaleDateString()}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <div className="text-sm font-medium">Description</div>
                <div className="text-sm text-muted-foreground">
                  {itemData.description || "No description available."}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
