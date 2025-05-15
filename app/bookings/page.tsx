import Link from "next/link"
import { Calendar, FileText, Home, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock data for bookings
const bookings = [
  {
    id: "BK-2023-001",
    customerName: "Priya Sharma",
    customerPhone: "+91 98765 43210",
    bookingDate: new Date("2023-05-15"),
    expectedDeliveryDate: new Date("2023-05-30"),
    itemDescription: "Gold Necklace with Diamond Pendant",
    estimatedAmount: 75000,
    advanceAmount: 25000,
    status: "pending",
  },
  {
    id: "BK-2023-002",
    customerName: "Amit Singh",
    customerPhone: "+91 87654 32109",
    bookingDate: new Date("2023-05-18"),
    expectedDeliveryDate: new Date("2023-06-05"),
    itemDescription: "Custom Wedding Ring Set",
    estimatedAmount: 45000,
    advanceAmount: 15000,
    status: "in-progress",
  },
  {
    id: "BK-2023-003",
    customerName: "Neha Gupta",
    customerPhone: "+91 76543 21098",
    bookingDate: new Date("2023-05-20"),
    expectedDeliveryDate: new Date("2023-06-10"),
    itemDescription: "Silver Dinner Set with Gold Plating",
    estimatedAmount: 35000,
    advanceAmount: 10000,
    status: "completed",
  },
  {
    id: "BK-2023-004",
    customerName: "Rajesh Mehta",
    customerPhone: "+91 65432 10987",
    bookingDate: new Date("2023-05-22"),
    expectedDeliveryDate: new Date("2023-06-15"),
    itemDescription: "Diamond Earrings with Matching Pendant",
    estimatedAmount: 65000,
    advanceAmount: 20000,
    status: "pending",
  },
]

import { Footer } from "@/app/components/footer/footer"

export default function BookingsPage() {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">Manage customer bookings and advance payments</p>
          </div>
          <Link href="/bookings/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search bookings..." className="pl-10" />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings
                .filter((booking) => booking.status === "pending")
                .map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
            </div>
          </TabsContent>
          <TabsContent value="in-progress" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings
                .filter((booking) => booking.status === "in-progress")
                .map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
            </div>
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings
                .filter((booking) => booking.status === "completed")
                .map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

interface BookingCardProps {
  booking: {
    id: string
    customerName: string
    customerPhone: string
    bookingDate: Date
    expectedDeliveryDate: Date
    itemDescription: string
    estimatedAmount: number
    advanceAmount: number
    status: string
  }
}

function BookingCard({ booking }: BookingCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Pending
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{booking.id}</CardTitle>
            <CardDescription>{booking.customerName}</CardDescription>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Booked: {booking.bookingDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Expected: {booking.expectedDeliveryDate.toLocaleDateString()}</span>
          </div>
          <div className="mt-2 line-clamp-2 text-muted-foreground">{booking.itemDescription}</div>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-md bg-secondary p-2">
            <div>
              <p className="text-xs text-muted-foreground">Estimated</p>
              <p className="font-medium">₹{booking.estimatedAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Advance</p>
              <p className="font-medium">₹{booking.advanceAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Link href={`/bookings/${booking.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        {booking.status !== "completed" && (
          <Link href={`/bookings/${booking.id}/edit`}>
            <Button variant="outline" size="sm">
              Update Status
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
