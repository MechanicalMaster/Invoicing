import { ArrowLeft, BarChart3, TrendingUp, Users, Package, FileText, ShoppingCart, Bell, Plus, Eye } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardOverviewPage() {
  const dashboardSections = [
    {
      icon: BarChart3,
      title: "Overview Statistics",
      description: "Key performance indicators and business metrics",
      items: [
        "Total revenue for current month and year-to-date",
        "Number of invoices created this month",
        "Outstanding payment amounts",
        "Customer count and new customers added",
        "Low stock alerts and inventory value",
        "Recent activity summary"
      ]
    },
    {
      icon: TrendingUp,
      title: "Performance Charts",
      description: "Visual representation of business trends and growth",
      items: [
        "Monthly revenue trend chart",
        "Invoice volume over time",
        "Customer acquisition growth",
        "Top-selling item categories",
        "Payment method preferences",
        "Seasonal sales patterns"
      ]
    },
    {
      icon: FileText,
      title: "Recent Invoices",
      description: "Quick access to recently created and pending invoices",
      items: [
        "Last 5-10 invoices created",
        "Invoices pending customer approval",
        "Overdue invoices requiring follow-up",
        "High-value invoices for priority attention",
        "Draft invoices awaiting completion"
      ]
    },
    {
      icon: Users,
      title: "Customer Highlights",
      description: "Important customer information and activities",
      items: [
        "Customers with recent purchases",
        "VIP customers requiring special attention",
        "Customers with pending payments",
        "New customers added this month",
        "Customer feedback and ratings"
      ]
    },
    {
      icon: Package,
      title: "Inventory Status",
      description: "Current stock levels and inventory management alerts",
      items: [
        "Items running low on stock",
        "Recently sold items",
        "New items added to inventory",
        "Items requiring reordering",
        "Inventory valuation summary"
      ]
    }
  ]

  const quickActions = [
    {
      icon: Plus,
      title: "Create Invoice",
      description: "Start a new invoice for a customer",
      href: "/create-invoice",
      primary: true
    },
    {
      icon: Users,
      title: "Add Customer",
      description: "Register a new customer",
      href: "/customers/add",
      primary: false
    },
    {
      icon: Package,
      title: "Add Inventory",
      description: "Add new items to stock",
      href: "/stock/add",
      primary: false
    },
    {
      icon: Eye,
      title: "View Reports",
      description: "Generate business reports",
      href: "/reports",
      primary: false
    },
    {
      icon: FileText,
      title: "Purchase Invoice",
      description: "Record supplier purchases",
      href: "/purchases",
      primary: false
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Check recent alerts",
      href: "/notifications",
      primary: false
    }
  ]

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">Dashboard Overview</h1>
        <p className="text-lg text-muted-foreground">
          Understanding the main dashboard and its key features for effective business management
        </p>
      </div>

      <div className="mb-8">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Dashboard Purpose</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              The dashboard provides a centralized view of your jewelry business operations, offering quick insights into
              sales performance, customer management, inventory status, and important notifications. It's designed to help
              you make informed decisions and take timely actions.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {dashboardSections.map((section, index) => (
          <Card key={index} className="transition-all hover:border-amber-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-amber-800">
                <section.icon className="mr-2 h-5 w-5" />
                {section.title}
              </CardTitle>
              <CardDescription className="text-base">{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start">
                    <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-amber-600"></div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks accessible directly from the dashboard for efficient workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-3 rounded-lg border border-amber-200 bg-white p-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                    action.primary ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 rounded-lg bg-amber-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-amber-800">Customization Options</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-2 text-amber-800">Layout Preferences</h3>
            <ul className="space-y-1 text-sm text-amber-700">
              <li>• Rearrange dashboard widgets by drag and drop</li>
              <li>• Show/hide specific sections based on your needs</li>
              <li>• Set default date ranges for charts and reports</li>
              <li>• Configure refresh intervals for real-time data</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-amber-800">Notification Settings</h3>
            <ul className="space-y-1 text-sm text-amber-700">
              <li>• Choose which alerts appear on the dashboard</li>
              <li>• Set notification thresholds for inventory levels</li>
              <li>• Configure payment reminder preferences</li>
              <li>• Customize alert priorities and urgency levels</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button variant="outline" asChild className="text-amber-700 hover:bg-amber-50 hover:text-amber-800">
          <Link href="/resources/documentation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documentation
          </Link>
        </Button>
      </div>
    </>
  )
}
