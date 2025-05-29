import Link from "next/link"
import Image from "next/image"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StockCategoryCardProps {
  category: {
    name: string
    count: number
    totalValue: number
    images: string[]
  }
}

export function StockCategoryCard({ category }: StockCategoryCardProps) {
  // Create a small image gallery for the category
  const imagesToShow = category.images.slice(0, 4);
  const defaultImage = "/placeholder.svg?height=40&width=40";
  
  return (
    <Link href={`/stock?category=${category.name}`}>
      <Card className="overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {category.count} {category.count === 1 ? "item" : "items"}
              </p>
              <p className="text-sm font-medium mt-1">
                ₹{category.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1 w-20">
              {imagesToShow.map((image, index) => (
                <div key={index} className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={image || defaultImage}
                    alt={`${category.name} item ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {imagesToShow.length === 0 && (
                <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={defaultImage}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-3">
          <Badge variant="outline" className="w-full justify-center">
            View {category.name} Items
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}
