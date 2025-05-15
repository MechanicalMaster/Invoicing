import { ArrowRight, ArrowLeft, PlayCircle, Clock, Filter } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function TutorialsPage() {
  const tutorials = [
    {
      title: "Creating Your First Invoice",
      description: "Learn how to create, customize, and send a professional invoice to your customers",
      image: "/placeholder.svg?height=180&width=320",
      duration: "5 min",
      level: "Beginner",
      category: "Invoicing",
      href: "/resources/tutorials/creating-first-invoice",
    },
    {
      title: "Setting Up Gold Rate Tracking",
      description: "Configure automatic gold rate updates to keep your pricing accurate",
      image: "/placeholder.svg?height=180&width=320",
      duration: "7 min",
      level: "Intermediate",
      category: "Inventory",
      href: "/resources/tutorials/gold-rate-tracking",
    },
    {
      title: "Managing Customer Profiles",
      description: "Create detailed customer profiles to track preferences and purchase history",
      image: "/placeholder.svg?height=180&width=320",
      duration: "6 min",
      level: "Beginner",
      category: "Customer Management",
      href: "/resources/tutorials/customer-profiles",
    },
    {
      title: "Generating Sales Reports",
      description: "Learn how to create comprehensive sales reports for business analysis",
      image: "/placeholder.svg?height=180&width=320",
      duration: "8 min",
      level: "Intermediate",
      category: "Reports",
      href: "/resources/tutorials/sales-reports",
    },
    {
      title: "Setting Up Stock Categories",
      description: "Organize your jewelry inventory with customized categories",
      image: "/placeholder.svg?height=180&width=320",
      duration: "4 min",
      level: "Beginner",
      category: "Inventory",
      href: "/resources/tutorials/stock-categories",
    },
    {
      title: "PDF Invoice Customization",
      description: "Customize the layout and branding of your PDF invoices",
      image: "/placeholder.svg?height=180&width=320",
      duration: "10 min",
      level: "Advanced",
      category: "Invoicing",
      href: "/resources/tutorials/pdf-customization",
    },
  ]

  const categories = ["All", "Invoicing", "Inventory", "Customer Management", "Reports"]

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">Tutorials</h1>
        <p className="text-lg text-muted-foreground">
          Step-by-step video guides to help you make the most of Ratna Invoicing
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Filter className="h-5 w-5 text-amber-600" />
        <span className="mr-2 text-sm font-medium text-muted-foreground">Filter by:</span>
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === "All" ? "default" : "outline"}
            size="sm"
            className={category === "All" ? "bg-amber-600 hover:bg-amber-700" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.title} className="overflow-hidden transition-all hover:border-amber-300 hover:shadow-md">
            <div className="relative aspect-video">
              <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${tutorial.image})` }}>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/40">
                  <PlayCircle className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {tutorial.category}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" /> {tutorial.duration}
                </div>
              </div>
              <CardTitle className="line-clamp-1 text-lg text-amber-800">{tutorial.title}</CardTitle>
              <CardDescription className="line-clamp-2">{tutorial.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                <Link href={tutorial.href}>
                  Watch Tutorial <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Separator className="my-10 bg-amber-100" />

      <div className="rounded-lg bg-amber-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-amber-800">Request a Tutorial</h2>
            <p className="text-amber-700">
              Don't see what you're looking for? Let us know what tutorial would help your business.
            </p>
          </div>
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/resources/support#request-tutorial">
              Request a Topic <ArrowRight className="ml-2 h-4 w-4" />
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
