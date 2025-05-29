import Link from "next/link"
import Image from "next/image"
import { Eye, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StockItemCardProps {
  item: {
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
    is_sold?: boolean
    sold_at?: string | null
  }
}

export function StockItemCard({ item }: StockItemCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={item.images[0] || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute right-2 top-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {item.category}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge 
              variant={item.is_sold ? "destructive" : "outline"} 
              className="bg-background/80 backdrop-blur-sm"
            >
              {item.is_sold ? "Sold" : "In Stock"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-medium line-clamp-1">{item.name}</h3>
        </div>
        <div className="mb-2 text-sm text-muted-foreground line-clamp-2">{item.description}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">ID</p>
            <p className="font-medium">{item.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Material</p>
            <p className="font-medium">
              {item.material} {item.purity}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Weight</p>
            <p className="font-medium">{item.weight}g</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-medium">₹{item.price.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/50 p-2">
        <Link href={`/stock/${item.id}`}>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>View</span>
          </Button>
        </Link>
        <Link href={`/stock/${item.id}/edit`}>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Edit className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
