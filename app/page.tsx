import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AuthModal } from "@/app/components/auth-modal"

export const metadata: Metadata = {
  title: "Sethiya Gold - Premium Indian Jewelry",
  description: "Exquisite handcrafted jewelry with traditional Indian craftsmanship",
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
              backgroundPosition: "center 30%",
            }}
          >
            <div className="h-full w-full bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto flex flex-col items-center px-4 text-center">
          <div className="mb-2 inline-block rounded-full bg-amber-500/20 px-4 py-1.5 text-sm font-medium text-amber-300">
            Premium Jewelry Management
          </div>
          <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            <span className="block">Sethiya Gold</span>
            <span className="mt-2 block text-amber-400">Timeless Elegance, Modern Management</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-gray-300">
            Experience the perfect blend of traditional craftsmanship and modern inventory management. Our system helps
            you manage your premium jewelry business with elegance and efficiency.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <AuthModal>
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </AuthModal>
            <Link href="#features">
              <Button variant="outline" size="lg" className="border-amber-500 text-amber-300 hover:bg-amber-950/50">
                Explore Features <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-amber-800 md:text-4xl">Crafted for Excellence</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our jewelry management system is designed with the same attention to detail that goes into crafting fine
              jewelry.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border border-amber-100 bg-white p-6 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-amber-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-amber-600"
                >
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l4-2.18L12 3z" />
                  <path d="M12 12l-3-1.6v3.6l3 1.6 3-1.6v-3.6L12 12z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-amber-800">Premium Inventory Management</h3>
              <p className="text-muted-foreground">
                Track your precious inventory with precision. Manage gold, diamonds, and gemstones with ease.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-amber-100 bg-white p-6 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-amber-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-amber-600"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-amber-800">Customer Relationship</h3>
              <p className="text-muted-foreground">
                Build lasting relationships with your clients. Track preferences, purchases, and special occasions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border border-amber-100 bg-white p-6 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-amber-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-amber-600"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-amber-800">Professional Invoicing</h3>
              <p className="text-muted-foreground">
                Create elegant invoices that reflect your brand's premium quality. GST-compliant and customizable.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border border-amber-100 bg-white p-6 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-amber-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-amber-600"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-amber-800">Real-time Gold Rates</h3>
              <p className="text-muted-foreground">
                Stay updated with the latest gold rates. Automatically calculate prices based on current market values.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg border border-amber-100 bg-white p-6 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-amber-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-amber-600"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-amber-800">Business Analytics</h3>
              <p className="text-muted-foreground">
                Gain insights into your business performance. Track sales trends, popular items, and customer
                preferences.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg border border-amber-100 bg-white p-6 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-amber-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-amber-600"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-amber-800">Secure Payments</h3>
              <p className="text-muted-foreground">
                Process payments securely. Support for multiple payment methods including UPI, cards, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="bg-amber-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-amber-800 md:text-4xl">
              Trusted by Jewelers Across India
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Hear from jewelry shop owners who have transformed their business with our system.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-lg border border-amber-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-amber-100">
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-amber-800">
                    RS
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800">Rajesh Sharma</h4>
                  <p className="text-sm text-muted-foreground">Sharma Jewelers, Delhi</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">
                "This system has revolutionized how we manage our inventory. The real-time gold rate updates and
                professional invoicing have impressed our customers."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-lg border border-amber-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-amber-100">
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-amber-800">
                    PP
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800">Priya Patel</h4>
                  <p className="text-sm text-muted-foreground">Patel Gold House, Mumbai</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">
                "The customer management features have helped us build stronger relationships with our clients. We can
                now track preferences and send personalized offers."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-lg border border-amber-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-amber-100">
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-amber-800">
                    AM
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800">Anand Mehta</h4>
                  <p className="text-sm text-muted-foreground">Royal Jewels, Jaipur</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">
                "The analytics have given us insights we never had before. We've been able to optimize our inventory and
                focus on our most profitable items."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16">
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/placeholder.svg?height=600&width=1920')",
              backgroundPosition: "center 40%",
            }}
          >
            <div className="h-full w-full bg-gradient-to-r from-black/80 via-black/70 to-black/80"></div>
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl">
            Ready to Transform Your Jewelry Business?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-300">
            Join hundreds of jewelry shop owners who have elevated their business with our premium management system.
          </p>
          <AuthModal>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
              Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AuthModal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-100 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-6 w-6 text-amber-600"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
                <span className="text-xl font-semibold text-amber-800">Sethiya Gold</span>
              </div>
              <p className="text-muted-foreground">Premium jewelry management system designed for Indian jewelers.</p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-amber-800">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Inventory Management</li>
                <li>Customer Relationship</li>
                <li>Professional Invoicing</li>
                <li>Real-time Gold Rates</li>
                <li>Business Analytics</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-amber-800">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/resources/documentation" className="hover:text-amber-600">Documentation</Link></li>
                <li><Link href="/resources/tutorials" className="hover:text-amber-600">Tutorials</Link></li>
                <li><Link href="/resources/blog" className="hover:text-amber-600">Blog</Link></li>
                <li><Link href="/resources/contact-us" className="hover:text-amber-600">Contact Us</Link></li>
                <li><Link href="/resources/faq" className="hover:text-amber-600">FAQ</Link></li>
                <li><Link href="/resources/terms-and-conditions" className="hover:text-amber-600">Terms & Conditions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-amber-800">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>info@sethiyagold.com</li>
                <li>+91 98765 43210</li>
                <li>Mumbai, India</li>
                <li><Link href="/resources/contact-us" className="hover:text-amber-600">Contact Page</Link></li>
              </ul>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-amber-600 hover:text-amber-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="text-amber-600 hover:text-amber-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="text-amber-600 hover:text-amber-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-amber-100 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Sethiya Gold. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
