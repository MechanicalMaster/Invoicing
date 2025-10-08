import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I create my first invoice?",
      answer: "To create your first invoice, navigate to the 'Create Invoice' section from the dashboard. Fill in the customer details, add items from your inventory, apply any discounts or taxes, and click 'Generate Invoice'. You can then preview, edit if needed, and finalize the invoice for printing or sending electronically.",
    },
    {
      question: "Can I customize my invoice template?",
      answer: "Yes, Sethiya Gold allows full customization of invoice templates. Go to 'Settings > Invoice Templates' to add your shop logo, change colors, adjust layouts, and set default terms and conditions. You can create multiple templates for different types of sales or seasons.",
    },
    {
      question: "How does gold rate tracking work?",
      answer: "Our gold rate tracking feature automatically updates daily gold rates based on market prices. You can set up which markets to follow (MCX, IBJA, etc.) in 'Settings > Gold Rate Tracking'. The system will use these rates to calculate prices for items based on their weight and making charges.",
    },
    {
      question: "Is my data secure and backed up?",
      answer: "Absolutely. All your data is encrypted and stored securely in the cloud. We perform automatic backups daily, and you can also manually backup your data anytime from 'Settings > Backup & Restore'. Your business information never leaves our secure servers.",
    },
    {
      question: "How do I manage my jewelry inventory?",
      answer: "Manage your inventory by going to 'Stock > Inventory Management'. Here you can add new items with details like weight, purity, stone details, and images. The system tracks stock levels, shows low stock alerts, and updates automatically when sales are made.",
    },
    {
      question: "What payment methods are supported?",
      answer: "Sethiya Gold supports various payment methods including cash, credit/debit cards, UPI, bank transfers, and partial payments. You can configure these options in 'Settings > Payment Methods' and track outstanding balances for customers who make partial payments.",
    },
    {
      question: "Can I generate reports for my business?",
      answer: "Yes, comprehensive reporting is available under 'Reports'. You can generate sales reports, inventory valuation, customer purchase history, and tax summaries. Reports can be filtered by date ranges, categories, or customer segments and exported as PDF or Excel files.",
    },
    {
      question: "How do I get technical support?",
      answer: "For technical support, click on 'Help > Support' in the application or visit our Contact Us page. Our support team is available Monday-Friday, 9:00 AM - 6:00 PM IST, and Saturday, 10:00 AM - 4:00 PM IST. You can also email support@ratnainvoicing.com for assistance.",
    },
  ]

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">
          Find answers to common questions about Sethiya Gold
        </p>
      </div>

      <Card className="mb-8 transition-all hover:border-amber-300 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-amber-800">Common Questions</CardTitle>
          <CardDescription>Everything you need to know about our jewelry invoicing system</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-amber-800 hover:text-amber-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Separator className="my-8 bg-amber-100" />

      <div className="rounded-lg bg-amber-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-amber-800">Still Have Questions?</h2>
            <p className="text-amber-700">
              If you couldn't find an answer to your question, please reach out to our support team.
            </p>
          </div>
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/resources/contact-us">
              Contact Support
            </Link>
          </Button>
        </div>
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