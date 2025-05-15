import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function BlogPage() {
  const featuredPost = {
    title: "Gold Rate Trends for 2025: What Jewelry Shop Owners Need to Know",
    description: "Analysis of gold price forecasts and how jewelry businesses can adapt their pricing strategies",
    image: "/placeholder.svg?height=300&width=800",
    date: "May 8, 2025",
    author: "Priya Sharma",
    authorRole: "Industry Analyst",
    category: "Industry Insights",
    href: "/resources/blog/gold-rate-trends-2025",
  }

  const recentPosts = [
    {
      title: "5 Ways to Streamline Your Jewelry Inventory Management",
      description: "Tips to efficiently manage your jewelry stock and reduce overhead costs",
      image: "/placeholder.svg?height=180&width=320",
      date: "May 5, 2025",
      author: "Rahul Mehta",
      category: "Inventory Tips",
      href: "/resources/blog/streamline-jewelry-inventory",
    },
    {
      title: "GST Updates for Indian Jewelers: New Compliance Changes",
      description: "Recent changes to GST regulations that affect jewelry businesses in India",
      image: "/placeholder.svg?height=180&width=320",
      date: "May 2, 2025",
      author: "Ankit Jain",
      category: "Compliance",
      href: "/resources/blog/gst-updates-jewelers",
    },
    {
      title: "Building Customer Loyalty in the Luxury Jewelry Market",
      description: "Strategies to create lasting relationships with high-value jewelry customers",
      image: "/placeholder.svg?height=180&width=320",
      date: "April 29, 2025",
      author: "Neha Gupta",
      category: "Customer Relations",
      href: "/resources/blog/customer-loyalty-jewelry",
    },
  ]

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">Jewelry Blog</h1>
        <p className="text-lg text-muted-foreground">
          Industry insights, tips, and trends for jewelry business owners
        </p>
      </div>

      <div className="grid gap-8">
        {/* Featured post */}
        <Card className="overflow-hidden transition-all hover:border-amber-300 hover:shadow-md">
          <div className="relative h-[300px] w-full bg-cover bg-center" style={{ backgroundImage: `url(${featuredPost.image})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
              <div className="absolute bottom-0 left-0 p-6">
                <span className="mb-2 inline-block rounded-full bg-amber-600 px-3 py-1 text-xs font-medium text-white">
                  {featuredPost.category}
                </span>
                <h2 className="mb-2 text-2xl font-bold text-white">{featuredPost.title}</h2>
                <p className="mb-4 text-white/90">{featuredPost.description}</p>
                <div className="flex items-center text-white/80">
                  <span>{featuredPost.date}</span>
                  <span className="mx-2">•</span>
                  <span>
                    {featuredPost.author}, {featuredPost.authorRole}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <CardFooter className="flex justify-center bg-amber-50 p-4">
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href={featuredPost.href}>Read Full Article</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent posts */}
        <div className="grid gap-6 md:grid-cols-3">
          {recentPosts.map((post) => (
            <Card key={post.title} className="overflow-hidden transition-all hover:border-amber-300 hover:shadow-md">
              <div
                className="h-[180px] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${post.image})` }}
              />
              <CardHeader>
                <div className="mb-2 flex items-center">
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                  <span className="mx-2">•</span>
                  <span className="text-xs text-amber-600">{post.category}</span>
                </div>
                <CardTitle className="line-clamp-2 text-lg text-amber-800">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">{post.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full border-amber-200 text-amber-800 hover:bg-amber-50">
                  <Link href={post.href}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
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