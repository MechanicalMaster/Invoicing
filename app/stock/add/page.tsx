"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Home, Save, Upload, X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

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

export default function AddStockItemPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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

  const [images, setImages] = useState<{ preview: string; file?: File }[]>([
    { preview: "/placeholder.svg?height=300&width=300" },
  ])

  const generateItemNumber = (category: string): string => {
    // Take the first 3 letters of the category and convert to uppercase
    let prefix = category.substring(0, 3).toUpperCase()
    // Pad with 'X' if category is less than 3 letters
    while (prefix.length < 3) {
      prefix += 'X'
    }
    // Generate a random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000).toString()
    return `${prefix}${randomNum}`
  }

  // Update item number when category changes
  useEffect(() => {
    if (formData.category) {
      setItemNumber(generateItemNumber(formData.category))
    }
  }, [formData.category])

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
    if (images.length > 1) {
        newImages.splice(index, 1);
    } else {
        newImages[index] = { preview: "/placeholder.svg?height=300&width=300", file: undefined };
    }
    setImages(newImages);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add stock items.",
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
    
    // Validate if at least one image is uploaded (check if file exists)
    const hasUploadedImage = images.some(img => img.file);
    if (!hasUploadedImage) {
      toast({
        title: "Missing image",
        description: "Please upload at least one image for the item.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true)
    
    try {
      // Fetch user's compression settings
      let compressionLevel: 'none' | 'low' | 'medium' | 'high' = 'medium'; // Default
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('photo_compression_level')
          .eq('user_id', user.id)
          .single();
          
        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError; // PGRST116 means no row, use default
        if (settingsData && settingsData.photo_compression_level) {
          compressionLevel = settingsData.photo_compression_level;
        }
      } catch (error) {
        console.error("Error fetching compression settings:", error);
        // Continue with default compression
      }
      
      // Process and upload images
      const uploadedImageUrls: string[] = [];
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const imageUploadPromises = images
        .filter(img => img.file) // Process only images with an actual file
        .map(async (imageState, index) => {
          const fileToProcess = imageState.file!;
          const compressedFile = await compressImage(fileToProcess, compressionLevel);
          const fileExt = fileToProcess.name.split('.').pop();
          const fileName = `${Date.now()}_${index}.${fileExt}`; // Or use uuid
          const filePath = `${user.id}/${itemNumber}/${fileName}`;

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
          return uploadResult.path;
        });

      try {
        const urls = await Promise.all(imageUploadPromises);
        uploadedImageUrls.push(...urls);
      } catch (error: any) {
        toast({ 
          title: "Image Upload Failed", 
          description: error.message, 
          variant: "destructive" 
        });
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for database insertion
      const stockItemData = {
        user_id: user.id,
        item_number: itemNumber,
        category: formData.category,
        material: formData.material,
        purity: formData.purity || null,
        weight: formData.weight,
        description: formData.description || null,
        supplier: formData.supplier || null,
        purchase_date: formData.purchaseDate || null,
        purchase_price: formData.purchasePrice,
        image_urls: uploadedImageUrls
      };
      
      // Insert into Supabase
      const { data, error: dbError } = await supabase
        .from('stock_items')
        .insert([stockItemData])
        .select();
        
      if (dbError) {
        console.error("Database error:", dbError);
        toast({
          title: "Failed to save item",
          description: dbError.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Item added successfully",
        description: `Item ${itemNumber} has been added to inventory.`,
      });
      
      // Redirect to stock page
      router.push("/stock");
      
    } catch (error: any) {
      console.error("Error saving stock item:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="flex items-center">
          <Link href="/stock">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Stock
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">Add New Inventory Item</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Stock Item</CardTitle>
              <CardDescription>Enter the details of the jewelry item, including inventory specifics and purchase information.</CardDescription>
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
                  <Select value={formData.purity} onValueChange={(value) => handleSelectChange("purity", value)}>
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
                    placeholder="e.g., 10.5"
                    value={formData.weight}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add any additional details about the item"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier / Source</Label>
                  <Input
                    id="supplier"
                    name="supplier"
                    placeholder="e.g., Local Artisan, ABC Jewellers"
                    value={formData.supplier}
                    onChange={handleChange}
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="purchasePrice">
                    Purchase Price (₹ per item) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    min="0"
                    required
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
              </div>
              
              <Separator />

              <div>
                <Label className="text-lg font-medium">Item Images (Max 5)</Label>
                <p className="text-sm text-muted-foreground">
                  Upload clear images of the jewelry item. The first image will be the primary display image.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {images.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full rounded-md border object-cover shadow-sm"
                        width={150}
                        height={150}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <label
                          htmlFor={`image-upload-${index}`}
                          className="mb-2 cursor-pointer rounded-full bg-primary/80 p-2 text-primary-foreground hover:bg-primary"
                        >
                          <Upload className="h-5 w-5" />
                          <Input
                            id={`image-upload-${index}`}
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            className="sr-only"
                            onChange={(e) => handleImageChange(index, e)}
                          />
                        </label>
                        {(image.file || images.length > 1) && (
                             <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                                onClick={() => removeImage(index)}
                                >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove image</span>
                            </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={addImageSlot}
                      className="flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                    >
                      <Plus className="h-8 w-8" />
                      <span className="mt-1 text-xs">Add Image</span>
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-5">
              <Button variant="outline" type="button" onClick={() => router.push("/stock")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Item
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
