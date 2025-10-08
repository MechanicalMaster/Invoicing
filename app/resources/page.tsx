import Link from "next/link"
import { ArrowRight, BookOpen, HelpCircle, Newspaper, FileBadge, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResourcesPage() {
  const resourceCards = [
    {
      title: "Documentation",
      description: "Comprehensive guides and references for Sethiya Gold",
      icon: BookOpen,
      href: "/resources/documentation",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Tutorials",
      description: "Step-by-step instructions for common tasks",
      icon: FileBadge,
      href: "/resources/tutorials",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Blog",
      description: "News, updates, and insights about jewelry management",
      icon: Newspaper,
      href: "/resources/blog",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Support",
      description: "Get help from our dedicated support team",
      icon: Users,
      href: "/resources/support",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "FAQ",
      description: "Answers to commonly asked questions",
      icon: HelpCircle,
      href: "/resources/faq",
      color: "bg-amber-50 text-amber-600",
    },
  ]

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">Resources</h1>
        <p className="text-lg text-muted-foreground">Everything you need to make the most of Sethiya Gold system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resourceCards.map((card) => (
          <Card key={card.title} className="transition-all hover:border-amber-300 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className={`mb-3 inline-flex rounded-md p-2 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-amber-800">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                <Link href={card.href}>
                  Explore {card.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h2 className="mb-4 text-2xl font-bold text-amber-800">Getting Started</h2>
        <p className="mb-4 text-amber-700">
          New to Sethiya Gold? Our quick start guide will help you set up your account and understand the basic
          features.
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800">
              1
            </div>
            <div>
              <h3 className="font-medium text-amber-800">Set up your business profile</h3>
              <p className="text-sm text-amber-600">
                Configure your business details, including your shop name, GST information, and contact details.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800">
              2
            </div>
            <div>
              <h3 className="font-medium text-amber-800">Add your inventory</h3>
              <p className="text-sm text-amber-600">
                Start adding your jewelry items to the inventory management system, including weights and prices.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800">
              3
            </div>
            <div>
              <h3 className="font-medium text-amber-800">Create your first invoice</h3>
              <p className="text-sm text-amber-600">
                Generate a professional invoice for your customer with just a few clicks.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/resources/documentation/getting-started">
              Read the full guide <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}
