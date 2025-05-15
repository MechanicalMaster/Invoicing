"use client"

import type React from "react"

import { useState } from "react"
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

export default function AddStockItemPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    material: "Gold",
    purity: "22K",
    weight: 0,
    stock: 1,
    description: "",
    supplier: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchasePrice: 0,
  })

  const [images, setImages] = useState<{ preview: string; file?: File }[]>([
    { preview: "/placeholder.svg?height=300&width=300" },
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ["weight", "stock", "purchasePrice"].includes(name)
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

  const generateItemId = () => {
    const categoryCode = formData.category ? formData.category.substring(0, 2).toUpperCase() : "XX"
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `JWL-${categoryCode}-${randomNum}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.category || !formData.material) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields: Item Name, Category, Material.",
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


    // Generate item ID
    const itemId = generateItemId()

    // In a real app, you would submit the form data and images to your API here
    console.log("Form Data:", formData)
    console.log(
      "Images:",
      images.map((img) => img.file?.name || "placeholder")
    )

    toast({
      title: "Item added successfully",
      description: `Item ${itemId} (${formData.name}) has been added to inventory.`,
    })

    // Redirect to stock page
    router.push("/stock")
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
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">Add New Inventory Item</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of the jewelry item.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Item Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Gold Necklace 22K"
                    value={formData.name}
                    onChange={handleChange}
                    required
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Details</CardTitle>
              <CardDescription>
                Manage inventory specifics, purchase information, and item images.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock">
                    Quantity in Stock <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
          </Card>

          <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
              <Save className="mr-2 h-4 w-4" /> Add Item to Inventory
            </Button>
          </CardFooter>
        </form>
      </main>
    </div>
  )
}
