import Link from "next/link"
import Image from "next/image"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StockCategoryCardProps {
  category: {
    id: string
    name: string
    count: number
    icon: string
  }
}

export function StockCategoryCard({ category }: StockCategoryCardProps) {
  return (
    <Link href={`/stock?category=${category.id}`}>
      <Card className="overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Image src={category.icon || "/placeholder.svg"} alt={category.name} width={40} height={40} />
            </div>
            <div>
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {category.count} {category.count === 1 ? "item" : "items"}
              </p>
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
