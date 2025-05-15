import { ArrowRight, ArrowLeft, FileText, Search } from "lucide-react"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export default function DocumentationPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive guides and reference materials for Ratna Invoicing
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search documentation..." className="pl-10" />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Getting Started Section */}
        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800">Getting Started</CardTitle>
            <CardDescription>Essential guides to set up and use the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/resources/documentation/getting-started"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Quick Start Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/system-requirements"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  System Requirements
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/account-setup"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Account Setup
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/dashboard-overview"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Dashboard Overview
                </Link>
              </li>
            </ul>
            <Button variant="outline" asChild className="w-full mt-2">
              <Link href="/resources/documentation/getting-started">
                View All Getting Started Guides <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Invoicing Section */}
        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800">Invoicing</CardTitle>
            <CardDescription>Learn how to create and manage invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/resources/documentation/create-invoice"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Creating New Invoices
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/customizing-invoices"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Customizing Invoice Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/printing-invoices"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Printing and PDF Export
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/invoice-management"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Invoice History and Management
                </Link>
              </li>
            </ul>
            <Button variant="outline" asChild className="w-full mt-2">
              <Link href="/resources/documentation/invoicing">
                View All Invoicing Guides <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Inventory Management Section */}
        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800">Inventory Management</CardTitle>
            <CardDescription>Track your jewelry inventory effectively</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/resources/documentation/adding-items"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Adding New Items
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/inventory-categories"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Organizing by Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/tracking-gold-rates"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Gold Rate Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/inventory-reports"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Inventory Reports
                </Link>
              </li>
            </ul>
            <Button variant="outline" asChild className="w-full mt-2">
              <Link href="/resources/documentation/inventory">
                View All Inventory Guides <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Customer Management Section */}
        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800">Customer Management</CardTitle>
            <CardDescription>Build and maintain customer relationships</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/resources/documentation/adding-customers"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Adding Customer Records
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/customer-history"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Purchase History Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/customer-reminders"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Special Occasion Reminders
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/documentation/customer-communications"
                  className="flex items-center text-sm text-amber-700 hover:text-amber-900 hover:underline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Email Communications
                </Link>
              </li>
            </ul>
            <Button variant="outline" asChild className="w-full mt-2">
              <Link href="/resources/documentation/customers">
                View All Customer Guides <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-10 bg-amber-100" />

      <div className="mb-4">
        <h2 className="mb-2 text-2xl font-bold text-amber-800">API Documentation</h2>
        <p className="text-muted-foreground">For developers who want to integrate with Ratna Invoicing</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-amber-800">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Learn how to authenticate with our API using OAuth 2.0 and manage API keys.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/resources/documentation/api/authentication">
                View Authentication <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-amber-800">Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Comprehensive list of all API endpoints with examples and use cases.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/resources/documentation/api/endpoints">
                View Endpoints <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-amber-800">Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Set up webhooks to get real-time notifications for events in your account.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/resources/documentation/api/webhooks">
                View Webhooks <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button variant="outline" asChild className="text-amber-700 hover:bg-amber-50 hover:text-amber-800">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </>
  )
}
