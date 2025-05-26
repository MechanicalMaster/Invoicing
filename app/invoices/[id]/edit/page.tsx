"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function EditInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to edit this invoice",
        variant: "destructive",
      })
    }
  }, [user, authLoading, router, toast])

  // Show loading state or nothing while checking authentication
  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-amber-500" />
          <span className="text-xl">Sethiya Gold</span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <Link href={`/invoices/${params.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Invoice
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">Edit Invoice</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Invoice - Coming Soon</CardTitle>
            <CardDescription>
              The edit invoice functionality is currently under development and will be available soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="mb-6 text-center text-muted-foreground">
              This feature is planned for a future update. For now, you can view and print invoices,
              or create new ones.
            </p>
            <div className="flex gap-4">
              <Link href={`/invoices/${params.id}`}>
                <Button variant="outline">Return to Invoice</Button>
              </Link>
              <Link href="/invoices">
                <Button>Back to Invoice List</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 