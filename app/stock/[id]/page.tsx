"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageGallery } from "@/app/stock/[id]/image-gallery"

// Mock data for a single jewelry item
const item = {
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
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
  ],
  description:
    "Elegant diamond studded gold necklace with intricate design. This beautiful piece features 32 diamonds totaling 2.5 carats set in 22K gold. Perfect for special occasions and celebrations.",
  dateAdded: new Date("2023-04-15"),
  supplier: "Mehta Jewelers",
  purchaseDate: new Date("2023-04-10"),
  purchasePrice: 125000,
  location: "Main Showcase",
  specifications: {
    length: "18 inches",
    clasp: "Lobster Clasp",
    diamonds: {
      count: 32,
      totalCarat: 2.5,
      clarity: "VS1",
      color: "F",
    },
  },
  transactions: [
    {
      type: "Purchase",
      date: new Date("2023-04-10"),
      quantity: 3,
      price: 125000,
      reference: "PO-2023-042",
    },
    {
      type: "Sale",
      date: new Date("2023-05-15"),
      quantity: 1,
      price: 145000,
      reference: "INV-2023-078",
    },
  ],
}

export default function StockItemDetailPage({ params }: { params: { id: string } }) {
  const [activeImage, setActiveImage] = useState(0)

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
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">{item.name}</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Image Gallery */}
          <Card className="md:col-span-2">
            <CardContent className="p-0">
              <ImageGallery images={item.images} />
            </CardContent>
          </Card>

          {/* Item Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>Item ID: {item.id}</CardDescription>
                </div>
                <Badge variant={item.stock > 0 ? "outline" : "destructive"} className="text-sm">
                  {item.stock > 0 ? `In Stock: ${item.stock}` : "Out of Stock"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="text-2xl font-bold text-primary">₹{item.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Selling Price</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-medium">{item.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Material</div>
                  <div className="font-medium">
                    {item.material} {item.purity}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Weight</div>
                  <div className="font-medium">{item.weight}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Making Charges</div>
                  <div className="font-medium">₹{item.makingCharges.toLocaleString()}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium\
