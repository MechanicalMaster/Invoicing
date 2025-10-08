"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart4, FileText, Home, ArrowLeft } from "lucide-react"
import { SalesReport } from "./components/sales-report"
import { PurchaseReport } from "./components/purchase-report"
import { StockReport } from "./components/stock-report"

export default function ReportsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("sales")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to access reports",
        variant: "destructive",
      })
    }
  }, [user, isLoading, router, toast])

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-2 font-heading font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl">Sethiya Gold</span>
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-gold-100 to-gold-200 p-3 shadow-sm">
              <BarChart4 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Reports
              </h1>
              <p className="text-muted-foreground">
                View detailed sales, purchase, and stock reports
              </p>
            </div>
          </div>
        </div>

        {/* Reports Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="sales" className="gap-2">
              <FileText className="h-4 w-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="purchase" className="gap-2">
              <FileText className="h-4 w-4" />
              Purchase
            </TabsTrigger>
            <TabsTrigger value="stock" className="gap-2">
              <BarChart4 className="h-4 w-4" />
              Stock
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-6">
            <SalesReport />
          </TabsContent>

          <TabsContent value="purchase" className="mt-6">
            <PurchaseReport />
          </TabsContent>

          <TabsContent value="stock" className="mt-6">
            <StockReport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
