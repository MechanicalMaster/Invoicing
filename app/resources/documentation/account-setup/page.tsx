import { ArrowLeft, User, Building2, FileText, Bell, CreditCard, Settings } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AccountSetupPage() {
  const setupSections = [
    {
      icon: User,
      title: "Profile Information",
      description: "Set up your personal and business profile details",
      items: [
        "Complete your user profile with name and contact information",
        "Upload a professional profile picture",
        "Set up two-factor authentication for enhanced security",
        "Configure notification preferences (email, SMS, push notifications)"
      ],
      priority: "High"
    },
    {
      icon: Building2,
      title: "Business Configuration",
      description: "Configure your jewelry business details for invoice generation",
      items: [
        "Enter your firm name and legal business name",
        "Add your GSTIN (Goods and Services Tax Identification Number)",
        "Set your business establishment date",
        "Configure business address and contact details",
        "Add business website and social media links (optional)"
      ],
      priority: "Critical"
    },
    {
      icon: FileText,
      title: "Invoice Settings",
      description: "Customize invoice templates and numbering preferences",
      items: [
        "Set up invoice numbering format and starting number",
        "Configure default GST rates for different item categories",
        "Set default payment terms and due dates",
        "Customize invoice templates with your logo and branding",
        "Configure invoice notes and terms & conditions"
      ],
      priority: "High"
    },
    {
      icon: Bell,
      title: "Notification Preferences",
      description: "Set up alerts for important business events",
      items: [
        "Enable email notifications for new invoices and payments",
        "Set up SMS alerts for urgent customer communications",
        "Configure low stock notifications",
        "Set quiet hours for notification delivery",
        "Enable push notifications for mobile devices"
      ],
      priority: "Medium"
    },
    {
      icon: CreditCard,
      title: "Payment Methods",
      description: "Configure accepted payment methods and billing",
      items: [
        "Set up accepted payment methods (cash, card, UPI, bank transfer)",
        "Configure payment processing fees if applicable",
        "Set up recurring billing for subscription services",
        "Configure payment reminders for overdue invoices"
      ],
      priority: "Medium"
    },
    {
      icon: Settings,
      title: "Advanced Settings",
      description: "Fine-tune system behavior and preferences",
      items: [
        "Configure label printing settings for jewelry items",
        "Set up photo compression levels for inventory images",
        "Configure data backup frequency and retention",
        "Set up user permissions for team members (if applicable)",
        "Customize dashboard layout and default views"
      ],
      priority: "Low"
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-600 hover:bg-red-700"
      case "High": return "bg-amber-600 hover:bg-amber-700"
      case "Medium": return "bg-blue-600 hover:bg-blue-700"
      case "Low": return "bg-gray-600 hover:bg-gray-700"
      default: return "bg-gray-600 hover:bg-gray-700"
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">Account Setup Guide</h1>
        <p className="text-lg text-muted-foreground">
          Complete guide to configure your Sethiya Gold account for optimal business operations
        </p>
      </div>

      <div className="mb-8">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Setup Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-4">
              Proper account setup ensures your invoices look professional, calculations are accurate, and you receive important notifications.
              We recommend completing these steps in order for the best experience.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-red-600 hover:bg-red-700">Critical</Badge>
              <Badge className="bg-amber-600 hover:bg-amber-700">High Priority</Badge>
              <Badge className="bg-blue-600 hover:bg-blue-700">Medium Priority</Badge>
              <Badge className="bg-gray-600 hover:bg-gray-700">Low Priority</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {setupSections.map((section, index) => (
          <Card key={index} className="transition-all hover:border-amber-300 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <section.icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <CardTitle className="text-xl text-amber-800">{section.title}</CardTitle>
                    <CardDescription className="text-base">{section.description}</CardDescription>
                  </div>
                </div>
                <Badge className={getPriorityColor(section.priority)}>
                  {section.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <div className="mr-3 mt-0.5 h-2 w-2 rounded-full bg-amber-600"></div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-lg bg-amber-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-amber-800">Quick Access</h2>
        <p className="mb-4 text-amber-700">
          Jump directly to specific settings from your dashboard. Most settings can be modified later as your business needs evolve.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button variant="outline" asChild className="justify-start">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start">
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile Management
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start">
            <Link href="/resources/contact-us">
              <Bell className="mr-2 h-4 w-4" />
              Get Help
            </Link>
          </Button>
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
