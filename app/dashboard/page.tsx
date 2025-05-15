"use client"

import type { Metadata } from "next"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Box,
  FileText,
  Home,
  Package,
  Plus,
  Users,
  User,
  LogOut,
  Lock,
  ChevronDown,
  BarChart4,
  ShoppingBag,
  Receipt,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import supabase from "@/lib/supabase"

// Remove the metadata export since this is now a client component
// export const metadata: Metadata = {
//   title: "Dashboard - Sethiya Gold",
//   description: "A premium invoicing system for Indian jewelry shops",
// }

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to access the dashboard",
        variant: "destructive",
      })
    }
  }, [user, isLoading, router, toast])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  // Show loading state or nothing while checking authentication
  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
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
              Home
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Lock className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome to Sethiya Gold</h1>
          <p className="text-muted-foreground">Select an option to get started</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Sales Card */}
          <Card className="col-span-1 overflow-hidden border-2 transition-all duration-200 hover:border-primary/30 hover:shadow-md md:col-span-2 lg:col-span-3">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-2">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Sales
              </CardTitle>
              <CardDescription>Manage invoices, bookings, and sales transactions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Create Invoice */}
                <Link href="/create-invoice" className="group">
                  <Card className="h-full overflow-hidden border transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Receipt className="h-4 w-4 text-primary" />
                        Create Invoice
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex h-20 items-center justify-center rounded-md bg-secondary p-4 text-primary transition-colors group-hover:bg-secondary/70">
                        <Plus className="h-8 w-8" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Create, preview, and print customer invoices</p>
                    </CardContent>
                  </Card>
                </Link>

                {/* View Invoices */}
                <Link href="/invoices" className="group">
                  <Card className="h-full overflow-hidden border transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4 text-primary" />
                        View Invoices
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex h-20 items-center justify-center rounded-md bg-secondary p-4 text-primary transition-colors group-hover:bg-secondary/70">
                        <FileText className="h-8 w-8" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Search, view, and print existing invoices</p>
                    </CardContent>
                  </Card>
                </Link>

                {/* Create Booking */}
                <Link href="/bookings/create" className="group">
                  <Card className="h-full overflow-hidden border transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-4 w-4 text-primary" />
                        Create Booking
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex h-20 items-center justify-center rounded-md bg-secondary p-4 text-primary transition-colors group-hover:bg-secondary/70">
                        <Calendar className="h-8 w-8" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Create advance bookings with payment details</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stock Tile */}
          <Link href="/stock" className="group">
            <Card className="h-full overflow-hidden border-2 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
              <CardHeader className="bg-gradient-to-r from-secondary to-secondary/70 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Stock
                </CardTitle>
                <CardDescription>Manage your inventory</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex h-24 items-center justify-center rounded-md bg-secondary p-4 text-primary transition-colors group-hover:bg-secondary/70">
                  <Box className="h-12 w-12" />
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Track jewelry items, update prices, and manage stock
              </CardFooter>
            </Card>
          </Link>

          {/* Customer Tile */}
          <Link href="/customers" className="group">
            <Card className="h-full overflow-hidden border-2 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
              <CardHeader className="bg-gradient-to-r from-secondary to-secondary/70 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Customer
                </CardTitle>
                <CardDescription>Manage customer relationships</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex h-24 items-center justify-center rounded-md bg-secondary p-4 text-primary transition-colors group-hover:bg-secondary/70">
                  <Users className="h-12 w-12" />
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Add customers, view history, and manage details
              </CardFooter>
            </Card>
          </Link>

          {/* Reports Tile */}
          <Link href="/reports" className="group">
            <Card className="h-full overflow-hidden border-2 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
              <CardHeader className="bg-gradient-to-r from-secondary to-secondary/70 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-primary" />
                  Reports
                </CardTitle>
                <CardDescription>View business analytics</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex h-24 items-center justify-center rounded-md bg-secondary p-4 text-primary transition-colors group-hover:bg-secondary/70">
                  <BarChart4 className="h-12 w-12" />
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Generate sales reports and analyze business performance
              </CardFooter>
            </Card>
          </Link>


        </div>

        <div className="mt-4 rounded-lg border border-border bg-secondary p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/80 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-primary"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Current Gold Rate</h3>
              <p className="text-sm text-muted-foreground">₹6,450 per 10 grams (22K) | Updated: Today</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Update Rate
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
