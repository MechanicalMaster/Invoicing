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
  Settings,
  ShoppingCart,
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
        <div className="flex items-center gap-2 font-heading font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl">Sethiya Gold</span>
        </div>
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
                <span>{user.user_metadata?.full_name || user.email}</span>
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
        <div className="flex flex-col animate-fade-in">
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Welcome to Sethiya Gold</h1>
          <p className="mt-2 text-muted-foreground">Manage your jewelry business with elegance and efficiency</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up" style={{animationDelay: "0.1s"}}>
          {/* Sales Card */}
          <Card className="col-span-1 overflow-hidden transition-all duration-300 hover:border-gold-300 hover:shadow-lg group md:col-span-2 lg:col-span-3">
            <CardHeader className="bg-gradient-to-r from-gold-50 to-gold-100/50 pb-2 border-b border-gold-200/30">
              <CardTitle className="font-heading flex items-center gap-2 text-primary">
                <ShoppingBag className="h-5 w-5 text-accent transition-transform group-hover:scale-110 duration-300" />
                Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Create Invoice */}
                <Link href="/create-invoice" className="group">
                  <Card className="h-full overflow-hidden border transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="pb-2 bg-gradient-to-br from-gold-50/50 to-transparent">
                      <CardTitle className="font-heading flex items-center gap-2 text-base">
                        <Receipt className="h-4 w-4 text-accent transition-all group-hover:text-primary group-hover:rotate-6 duration-300" />
                        Create Invoice
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex h-20 items-center justify-center rounded-xl bg-gradient-to-br from-gold-100/40 to-gold-50/30 p-4 text-primary transition-all duration-300 group-hover:from-gold-200/50 group-hover:to-gold-100/40">
                        <Plus className="h-8 w-8 transition-transform group-hover:scale-110 duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* View Invoices */}
                <Link href="/invoices" className="group">
                  <Card className="h-full overflow-hidden border transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="pb-2 bg-gradient-to-br from-gold-50/50 to-transparent">
                      <CardTitle className="font-heading flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4 text-accent transition-all group-hover:text-primary group-hover:rotate-6 duration-300" />
                        View Invoices
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex h-20 items-center justify-center rounded-xl bg-gradient-to-br from-gold-100/40 to-gold-50/30 p-4 text-primary transition-all duration-300 group-hover:from-gold-200/50 group-hover:to-gold-100/40">
                        <FileText className="h-8 w-8 transition-transform group-hover:scale-110 duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Create Booking */}
                <Link href="/bookings/create" className="group">
                  <Card className="h-full overflow-hidden border transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="pb-2 bg-gradient-to-br from-gold-50/50 to-transparent">
                      <CardTitle className="font-heading flex items-center gap-2 text-base">
                        <Calendar className="h-4 w-4 text-accent transition-all group-hover:text-primary group-hover:rotate-6 duration-300" />
                        Create Booking
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex h-20 items-center justify-center rounded-xl bg-gradient-to-br from-gold-100/40 to-gold-50/30 p-4 text-primary transition-all duration-300 group-hover:from-gold-200/50 group-hover:to-gold-100/40">
                        <Calendar className="h-8 w-8 transition-transform group-hover:scale-110 duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stock Tile */}
          <Link href="/stock" className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-gold-50 to-gold-100/50 pb-2 border-b border-gold-200/30">
                <CardTitle className="font-heading flex items-center gap-2 text-primary">
                  <Package className="h-5 w-5 text-accent transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300" />
                  Stock
                </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-gold-100/40 to-gold-50/30 p-4 text-primary transition-all duration-300 group-hover:from-gold-200/50 group-hover:to-gold-100/40">
                    <Box className="h-12 w-12 transition-transform group-hover:scale-110 duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

          {/* Purchases Tile */}
          <Link href="/purchases" className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-gold-50 to-gold-100/50 pb-2 border-b border-gold-200/30">
                <CardTitle className="font-heading flex items-center gap-2 text-primary">
                  <ShoppingCart className="h-5 w-5 text-accent transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300" />
                  Purchases
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-gold-100/40 to-gold-50/30 p-4 text-primary transition-all duration-300 group-hover:from-gold-200/50 group-hover:to-gold-100/40">
                  <ShoppingCart className="h-12 w-12 transition-transform group-hover:scale-110 duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Customer Tile */}
          <Link href="/customers" className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-gold-50 to-gold-100/50 pb-2 border-b border-gold-200/30">
                <CardTitle className="font-heading flex items-center gap-2 text-primary">
                  <Users className="h-5 w-5 text-accent transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-gold-100/40 to-gold-50/30 p-4 text-primary transition-all duration-300 group-hover:from-gold-200/50 group-hover:to-gold-100/40">
                  <Users className="h-12 w-12 transition-transform group-hover:scale-110 duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Reports Tile */}
          <Link href="/reports" className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-gold-50 to-gold-100/50 pb-2 border-b border-gold-200/30">
                <CardTitle className="font-heading flex items-center gap-2 text-primary">
                  <BarChart4 className="h-5 w-5 text-accent transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300" />
                  Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-gold-100/40 to-gold-50/30 p-4 text-primary transition-all duration-300 group-hover:from-gold-200/50 group-hover:to-gold-100/40">
                  <BarChart4 className="h-12 w-12 transition-transform group-hover:scale-110 duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Settings Tile */}
          <Link href="/settings" className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-gold-50 to-gold-100/50 pb-2 border-b border-gold-200/30">
                <CardTitle className="font-heading flex items-center gap-2 text-primary">
                  <Settings className="h-5 w-5 text-accent transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-gold-100/40 to-gold-50/30 p-4 text-primary transition-all duration-300 group-hover:from-gold-200/50 group-hover:to-gold-100/40">
                  <Settings className="h-12 w-12 transition-transform group-hover:scale-110 duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

        </div>

        <Card className="mt-4 overflow-hidden border-gold-200 animate-fade-in" style={{animationDelay: "0.3s"}}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-br from-gold-100 to-gold-200 p-3 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-5 w-5 text-accent"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-primary">Current Gold Rate</h3>
                <p className="text-sm text-muted-foreground">₹6,450 per 10 grams (22K) | Updated: Today</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto border-gold-300 hover:bg-gold-50 hover:text-primary">
                Update Rate
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
