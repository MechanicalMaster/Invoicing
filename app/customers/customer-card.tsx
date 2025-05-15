import Link from "next/link"
import { Calendar, Edit, Phone, Mail, MapPin, CreditCard, User } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface CustomerTransaction {
  id: string
  date: Date
  amount: number
  type: string
  description: string
}

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  identityType: string
  identityNumber: string
  referredBy?: string
  createdAt: Date
  lastTransaction?: CustomerTransaction
}

interface CustomerCardProps {
  customer: Customer
}

export function CustomerCard({ customer }: CustomerCardProps) {
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card className="overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-muted">
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">Customer since {customer.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
          {customer.referredBy && (
            <Badge variant="outline" className="ml-auto">
              Referred
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{customer.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span>
              {customer.identityType}: {customer.identityNumber}
            </span>
          </div>
          {customer.referredBy && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Referred by: {customer.referredBy}</span>
            </div>
          )}
        </div>

        {customer.lastTransaction && (
          <div className="mt-4 rounded-md bg-secondary p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Last Transaction</span>
            </div>
            <div className="mt-1 text-sm">
              <div className="font-medium">₹{customer.lastTransaction.amount.toLocaleString("en-IN")}</div>
              <div className="text-muted-foreground">
                {customer.lastTransaction.description} - {customer.lastTransaction.date.toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Link href={`/customers/${customer.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        <Link href={`/customers/${customer.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-3 w-3" />
            Edit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
