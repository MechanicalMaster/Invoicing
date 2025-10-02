import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function GettingStartedPage() {
  const steps = [
    {
      title: "Sign Up and Verify Your Account",
      description: "Create your Sethiya Gold account using your business email address. You'll receive a verification email to confirm your account.",
      details: [
        "Visit the signup page and enter your business details",
        "Check your email for the verification link",
        "Complete your profile with contact information"
      ]
    },
    {
      title: "Configure Your Business Profile",
      description: "Set up your firm details including GST information, business address, and contact details for invoice generation.",
      details: [
        "Go to Settings > Business Profile",
        "Enter your firm name, GSTIN, and establishment date",
        "Add your business address and contact information",
        "Configure invoice numbering preferences"
      ]
    },
    {
      title: "Add Your First Customer",
      description: "Create customer records to maintain purchase history and generate personalized invoices.",
      details: [
        "Navigate to Customers > Add Customer",
        "Enter customer name and contact details",
        "Add identity verification documents if required",
        "Save customer information for future invoices"
      ]
    },
    {
      title: "Set Up Your Inventory",
      description: "Add your jewelry items to track stock levels and generate accurate invoices.",
      details: [
        "Go to Stock > Add Item",
        "Enter item details: material, weight, purity, category",
        "Add photos of your jewelry items",
        "Set purchase price for inventory tracking"
      ]
    },
    {
      title: "Create Your First Invoice",
      description: "Generate a professional invoice with automatic GST calculations and itemized billing.",
      details: [
        "Click 'Create Invoice' from the dashboard",
        "Select customer and add items from inventory",
        "System automatically calculates GST and totals",
        "Preview, customize, and generate the invoice"
      ]
    }
  ]

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">Getting Started Guide</h1>
        <p className="text-lg text-muted-foreground">
          Complete guide to set up your Sethiya Gold account and start creating invoices
        </p>
      </div>

      <div className="mb-8">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <CheckCircle className="mr-2 h-5 w-5" />
              What You'll Accomplish
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              By the end of this guide, you'll have a fully configured Sethiya Gold account ready to create professional jewelry invoices,
              manage your inventory, and track customer relationships.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {steps.map((step, index) => (
          <Card key={index} className="transition-all hover:border-amber-300 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white text-sm font-bold">
                  {index + 1}
                </div>
                <CardTitle className="ml-4 text-xl text-amber-800">{step.title}</CardTitle>
              </div>
              <CardDescription className="ml-12 text-base">{step.description}</CardDescription>
            </CardHeader>
            <CardContent className="ml-12">
              <ul className="space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span className="text-sm text-muted-foreground">{detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-8 bg-amber-100" />

      <div className="rounded-lg bg-amber-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-amber-800">Need Help?</h2>
        <p className="mb-4 text-amber-700">
          If you encounter any issues during setup or need personalized assistance, our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/resources/contact-us">Contact Support</Link>
          </Button>
          <Button variant="outline" asChild className="text-amber-700 hover:bg-amber-50">
            <Link href="/resources/faq">View FAQ</Link>
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
