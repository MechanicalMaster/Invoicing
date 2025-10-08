"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Home, Save, Upload, X, Plus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"
import { compressImage } from "@/lib/imageUtils"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditStockItemPage() {
  // Use useParams hook instead of accessing params directly
  const params = useParams()
  const itemId = params.id
  if (!itemId || typeof itemId !== 'string') {
    throw new Error('Invalid item ID')
  }
  
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    category: "",
    material: "Gold",
    purity: "22K",
    weight: 0,
    description: "",
    supplier: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchasePrice: 0,
  })

  const [itemNumber, setItemNumber] = useState("")

  const [images, setImages] = useState<{ 
    preview: string; 
    file?: File; 
    existingUrl?: string; 
    toBeDeleted?: boolean 
  }[]>([
    { preview: "/placeholder.svg?height=300&width=300" },
  ])

  // Fetch item data when component mounts
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
        // Populate form data with fetched item details
        setFormData({
          category: data.category || "",
          material: data.material || "Gold",
          purity: data.purity || "22K",
          weight: data.weight || 0,
          description: data.description || "",
          supplier: data.supplier || "",
          purchaseDate: data.purchase_date 
            ? new Date(data.purchase_date).toISOString().split("T")[0] 
            : new Date().toISOString().split("T")[0],
          purchasePrice: data.purchase_price || 0,
        })

        setItemNumber(data.item_number)

        // Handle existing images - generate signed URLs for private bucket
        if (data.image_urls && data.image_urls.length > 0) {
          try {
            const imagePromises = data.image_urls.map(async (path: string) => {
              const { data: signedData, error: signedError } = await supabase.storage
                .from('stock_item_images')
                .createSignedUrl(path, 3600); // 1 hour expiry

              return {
                preview: signedError ? "/placeholder.svg?height=300&width=300" : signedData.signedUrl,
                existingUrl: path, // Keep the original path for database storage
                toBeDeleted: false
              };
            });

            const existingImages = await Promise.all(imagePromises);
            setImages(existingImages);
          } catch (urlError) {
            console.error('Error generating signed URLs:', urlError);
            setImages([{ preview: "/placeholder.svg?height=300&width=300" }]);
          }
        } else {
          setImages([{ preview: "/placeholder.svg?height=300&width=300" }])
        }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ["weight", "purchasePrice"].includes(name)
        ? Number.parseFloat(value) || 0
        : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        const newImages = [...images]
        newImages[index] = {
          preview: event.target?.result as string,
          file,
        }
        setImages(newImages)
      }

      reader.readAsDataURL(file)
    }
  }

  const addImageSlot = () => {
    if (images.length < 5) {
      setImages([...images, { preview: "/placeholder.svg?height=300&width=300" }])
    } else {
      toast({
        title: "Maximum images reached",
        description: "You can upload a maximum of 5 images per item.",
        variant: "destructive",
      })
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    
    // If it's an existing image, mark it for deletion
    if (newImages[index].existingUrl) {
      newImages[index] = { 
        ...newImages[index], 
        toBeDeleted: true,
        preview: "/placeholder.svg?height=300&width=300" 
      }
    } else if (images.length > 1) {
      // If it's a new image, just remove it
      newImages.splice(index, 1)
    } else {
      // If it's the only image, reset to placeholder
      newImages[index] = { preview: "/placeholder.svg?height=300&width=300", file: undefined }
    }
    
    setImages(newImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to edit stock items.",
        variant: "destructive",
      })
      return
    }

    // Validate form
    if (!formData.category || !formData.material) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields: Category, Material.",
        variant: "destructive",
      })
      return
    }
    
    // Check if at least one image will be available after updating
    const willHaveImage = images.some(img => img.file || (img.existingUrl && !img.toBeDeleted))
    if (!willHaveImage) {
      toast({
        title: "Missing image",
        description: "Please upload at least one image for the item.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Fetch user's compression settings
      let compressionLevel: 'none' | 'low' | 'medium' | 'high' = 'medium' // Default
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('photo_compression_level')
          .eq('user_id', user.id)
          .single()
          
        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError // PGRST116 means no row, use default
        if (settingsData && settingsData.photo_compression_level) {
          compressionLevel = settingsData.photo_compression_level
        }
      } catch (error) {
        console.error("Error fetching compression settings:", error)
        // Continue with default compression
      }
      
      // Process images
      let finalImageUrls: string[] = []
      
      // 1. Handle image deletions
      for (const img of images) {
        if (img.existingUrl && img.toBeDeleted) {
          // Extract path from URL for deletion
          try {
            const url = new URL(img.existingUrl)
            const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/stock_item_images\/(.*)/)
            if (pathMatch && pathMatch[1]) {
              const storagePath = decodeURIComponent(pathMatch[1])
              await supabase.storage.from('stock_item_images').remove([storagePath])
            }
          } catch (error) {
            console.error('Error parsing URL or removing image:', error)
          }
        }
      }
      
      // 2. Keep existing images that shouldn't be deleted
      images.forEach(img => {
        if (img.existingUrl && !img.toBeDeleted) {
          finalImageUrls.push(img.existingUrl)
        }
      })
      
      // 3. Upload new images
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const newImagePromises = images
        .filter(img => img.file) // Only process images with a file (new uploads)
        .map(async (imageState, index) => {
          const fileToProcess = imageState.file!
          const compressedFile = await compressImage(fileToProcess, compressionLevel)
          const fileExt = fileToProcess.name.split('.').pop()
          const fileName = `${Date.now()}_${index}.${fileExt}` // Or use uuid
          const filePath = `${user.id}/${itemNumber}/${fileName}`

          // Use secure upload API
          const formData = new FormData()
          formData.append('file', compressedFile)
          formData.append('bucket', 'stock_item_images')
          formData.append('path', filePath)

          const response = await fetch('/api/storage/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || `Failed to upload image ${fileToProcess.name}`)
          }

          const uploadResult = await response.json()
          // Return just the path without bucket name (bucket is specified when constructing URLs)
          return uploadResult.path
        })

      try {
        const newImageUrls = await Promise.all(newImagePromises)
        finalImageUrls.push(...newImageUrls)
      } catch (error: any) {
        toast({ 
          title: "Image Upload Failed", 
          description: error.message, 
          variant: "destructive" 
        })
        setIsSubmitting(false)
        return
      }
      
      // Prepare data for database update
      const stockItemData = {
        category: formData.category,
        material: formData.material,
        purity: formData.purity || null,
        weight: formData.weight,
        description: formData.description || null,
        supplier: formData.supplier || null,
        purchase_date: formData.purchaseDate || null,
        purchase_price: formData.purchasePrice,
        image_urls: finalImageUrls
      }
      
      // Update in Supabase
      const { data, error: dbError } = await supabase
        .from('stock_items')
        .update(stockItemData)
        .eq('item_number', itemId)
        .eq('user_id', user.id)
        .select()
        
      if (dbError) {
        console.error("Database error:", dbError)
        toast({
          title: "Failed to update item",
          description: dbError.message,
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Item updated successfully",
        description: `Item ${itemNumber} has been updated.`,
      })
      
      // Redirect to item view page
      router.push(`/stock/${itemId}`)
      
    } catch (error: any) {
      console.error("Error updating stock item:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
          <Skeleton className="h-[600px] w-full rounded-md" />
        </main>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-2 font-heading font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl">Sethiya Gold</span>
          </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8 text-center">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Item Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
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
        <div className="flex items-center">
          <Link href="/stock">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Stock
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">Edit Inventory Item</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Stock Item</CardTitle>
              <CardDescription>Edit the details of this jewelry item.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="itemNumber">Item Number</Label>
                  <Input
                    id="itemNumber"
                    name="itemNumber"
                    value={itemNumber}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Jewelry</SelectLabel>
                        <SelectItem value="Necklace">Necklace</SelectItem>
                        <SelectItem value="Chain">Chain</SelectItem>
                        <SelectItem value="Ladies Ring">Ladies Ring</SelectItem>
                        <SelectItem value="Gents Ring">Gents Ring</SelectItem>
                        <SelectItem value="Bangles">Bangles</SelectItem>
                        <SelectItem value="Earrings">Earrings</SelectItem>
                        <SelectItem value="Pendant">Pendant</SelectItem>
                        <SelectItem value="Bracelet">Bracelet</SelectItem>
                        <SelectItem value="Anklet">Anklet</SelectItem>
                        <SelectItem value="Nose Pin">Nose Pin</SelectItem>
                        <SelectItem value="Mangalsutra">Mangalsutra</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="material">
                    Material <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.material}
                    onValueChange={(value) => handleSelectChange("material", value)}
                    required
                  >
                    <SelectTrigger id="material">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Metals & Stones</SelectLabel>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Platinum">Platinum</SelectItem>
                        <SelectItem value="Diamond">Diamond</SelectItem>
                        <SelectItem value="Gemstone">Gemstone</SelectItem>
                        <SelectItem value="Mixed">Mixed Materials</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purity">Purity / Type</Label>
                  <Select 
                    value={formData.purity} 
                    onValueChange={(value) => handleSelectChange("purity", value)}
                  >
                    <SelectTrigger id="purity">
                      <SelectValue placeholder="Select purity or type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Gold Purity</SelectLabel>
                        <SelectItem value="24K">24K (99.9%)</SelectItem>
                        <SelectItem value="22K">22K (91.6%)</SelectItem>
                        <SelectItem value="18K">18K (75.0%)</SelectItem>
                        <SelectItem value="14K">14K (58.3%)</SelectItem>
                        <SelectLabel>Silver Purity</SelectLabel>
                        <SelectItem value="925 Silver">925 Sterling Silver</SelectItem>
                        <SelectLabel>Diamond Type</SelectLabel>
                        <SelectItem value="Natural Diamond">Natural Diamond</SelectItem>
                        <SelectItem value="Lab-Grown Diamond">Lab-Grown Diamond</SelectItem>
                        <SelectLabel>Other</SelectLabel>
                        <SelectItem value="N/A">Not Applicable</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">
                    Weight (grams) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the item's details, craftsmanship, or any special features..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    placeholder="Name of supplier or vendor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    name="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">
                    Purchase Price (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>
                  Item Images <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <div className={`aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 overflow-hidden ${img.toBeDeleted ? 'opacity-30' : ''}`}>
                        <img
                          src={img.preview}
                          alt={`Product ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(index, e)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          disabled={img.toBeDeleted}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 opacity-0 transition-opacity hover:opacity-100">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="mt-2 text-xs font-medium">
                            {img.file || img.existingUrl ? "Replace" : "Upload"}
                          </span>
                        </div>
                      </div>
                      {(img.file || img.existingUrl) && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove image</span>
                        </Button>
                      )}
                      {img.toBeDeleted && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="rounded bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground">
                            To be deleted
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {images.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="aspect-square h-auto flex-col rounded-md border-2 border-dashed"
                      onClick={addImageSlot}
                    >
                      <Plus className="h-8 w-8" />
                      <span className="mt-2">Add Image</span>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload up to 5 images. First image will be used as the thumbnail.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Link href="/stock">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="gap-1">
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  )
} 