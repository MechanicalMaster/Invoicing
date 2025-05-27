"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Tables } from "@/lib/database.types"
import { Building, Mail, MapPin, Phone } from "lucide-react"

type Supplier = Tables<"suppliers">

interface SupplierCardProps {
  supplier: Supplier
}

export default function SupplierCard({ supplier }: SupplierCardProps) {
  const router = useRouter()

  return (
    <Card key={supplier.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{supplier.name}</CardTitle>
        {supplier.contact_person && (
          <CardDescription>Contact: {supplier.contact_person}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid gap-2">
          {supplier.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{supplier.phone}</span>
            </div>
          )}
          {supplier.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{supplier.email}</span>
            </div>
          )}
          {supplier.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-1">{supplier.address}</span>
            </div>
          )}
        </div>
      </CardContent>
      <div className="flex justify-end gap-2 border-t bg-secondary/20 p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/purchases/suppliers/${supplier.id}/edit`)}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/purchases/suppliers/${supplier.id}`)}
        >
          View Details
        </Button>
      </div>
    </Card>
  )
} 