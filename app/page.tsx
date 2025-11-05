import Link from "next/link"
import type { Metadata } from "next"
import { 
  ArrowRight, 
  ChevronRight, 
  Package, 
  Users, 
  FileText, 
  DollarSign, 
  BarChart4, 
  CreditCard, 
  Gem
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { AuthModal } from "@/app/components/auth-modal"

export const metadata: Metadata = {
  title: "Sethiya Gold - Premium Jewelry Management",
  description: "Streamline your jewelry business with our comprehensive management solution",
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden">
        {/* Background with Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70">
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
                 style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E')" 
            }}></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto flex flex-col items-center px-4 text-center">
          <div className="mb-3 inline-block rounded-full bg-gold-200/30 backdrop-blur-sm px-5 py-2 text-sm font-medium text-accent animate-fade-in shadow-sm border border-gold-300/30">
            Premium Jewelry Management Solution
          </div>
          <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl animate-fade-in" style={{animationDelay: "0.2s"}}>
            <span className="block drop-shadow-lg">Sethiya Gold</span>
            <span className="mt-3 block text-accent drop-shadow-md">Streamline Your Jewelry Business</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-gray-200 animate-fade-in animate-slide-up" style={{animationDelay: "0.3s"}}>
            The ultimate management tool for Indian jewelers. Effortlessly handle invoicing, inventory, and customer relationships with our comprehensive suite of tools.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 animate-fade-in" style={{animationDelay: "0.4s"}}>
            <AuthModal>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </AuthModal>
            <Link href="#features">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
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
          <div className="mb-12 text-center animate-fade-in">
            <h2 className="mb-4 font-heading text-3xl font-bold text-primary md:text-4xl">
              Powerful Features, Seamlessly Integrated
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Our jewelry management system combines powerful tools designed specifically for Indian jewelry businesses.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-gold-200 bg-card p-6 shadow-sm transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in animate-slide-up" style={{animationDelay: "0.1s"}}>
              <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-gold-100 to-gold-200 p-3 transition-transform duration-300 group-hover:scale-110">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-heading text-xl font-semibold text-primary">Premium Inventory Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track your precious inventory with precision. Manage gold, diamonds, and gemstones with ease.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-gold-200 bg-card p-6 shadow-sm transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in animate-slide-up" style={{animationDelay: "0.2s"}}>
              <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-gold-100 to-gold-200 p-3 transition-transform duration-300 group-hover:scale-110">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-heading text-xl font-semibold text-primary">Customer Relationship</h3>
              <p className="text-muted-foreground leading-relaxed">
                Build lasting relationships with your clients. Track preferences, purchases, and special occasions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-gold-200 bg-card p-6 shadow-sm transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in animate-slide-up" style={{animationDelay: "0.3s"}}>
              <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-gold-100 to-gold-200 p-3 transition-transform duration-300 group-hover:scale-110">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-heading text-xl font-semibold text-primary">Professional Invoicing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create elegant invoices that reflect your brand's premium quality. GST-compliant and customizable.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-gold-200 bg-card p-6 shadow-sm transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in animate-slide-up" style={{animationDelay: "0.4s"}}>
              <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-gold-100 to-gold-200 p-3 transition-transform duration-300 group-hover:scale-110">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-heading text-xl font-semibold text-primary">Real-time Gold Rates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Stay updated with the latest gold rates. Automatically calculate prices based on current market values.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-gold-200 bg-card p-6 shadow-sm transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in animate-slide-up" style={{animationDelay: "0.5s"}}>
              <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-gold-100 to-gold-200 p-3 transition-transform duration-300 group-hover:scale-110">
                <BarChart4 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-heading text-xl font-semibold text-primary">Business Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Gain insights into your business performance. Track sales trends, popular items, and customer
                preferences.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border border-gold-200 bg-card p-6 shadow-sm transition-all duration-300 hover:border-gold-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in animate-slide-up" style={{animationDelay: "0.6s"}}>
              <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-gold-100 to-gold-200 p-3 transition-transform duration-300 group-hover:scale-110">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-heading text-xl font-semibold text-primary">Secure Payments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Process payments securely. Support for multiple payment methods including UPI, cards, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="bg-gradient-to-br from-gold-50/30 to-gold-100/20 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-3xl font-bold text-primary md:text-4xl">
              Trusted by Jewelers Across India
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Hear from jewelry shop owners who have transformed their business with our system.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-2xl border border-gold-200 bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-primary">Rajesh Sharma</h4>
                  <p className="text-sm text-muted-foreground">Sharma Jewelers, Delhi</p>
                </div>
              </div>
              <p className="italic text-muted-foreground leading-relaxed">
                "This system has revolutionized how we manage our inventory. The real-time gold rate updates and
                professional invoicing have impressed our customers."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-2xl border border-gold-200 bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-primary">Priya Patel</h4>
                  <p className="text-sm text-muted-foreground">Patel Gold House, Mumbai</p>
                </div>
              </div>
              <p className="italic text-muted-foreground leading-relaxed">
                "The customer management features have helped us build stronger relationships with our clients. We can
                now track preferences and send personalized offers."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-2xl border border-gold-200 bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-primary">Anand Mehta</h4>
                  <p className="text-sm text-muted-foreground">Royal Jewels, Jaipur</p>
                </div>
              </div>
              <p className="italic text-muted-foreground leading-relaxed">
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
          <div className="h-full w-full bg-gradient-to-br from-primary via-primary/90 to-primary/80">
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
                 style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E')" 
            }}></div>
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center animate-fade-in">
          <h2 className="mb-4 font-heading text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
            Elevate Your Jewelry Business Today
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-200 drop-shadow-sm">
            Join hundreds of jewelry shop owners who have transformed their business with our premium management system.
          </p>
          <AuthModal>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl">
              Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AuthModal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center">
                <Gem className="mr-2 h-6 w-6 text-primary" />
                <span className="text-xl font-semibold text-primary">Sethiya Gold</span>
              </div>
              <p className="text-muted-foreground">Premium jewelry management system designed for Indian jewelers.</p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-primary">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Inventory Management</li>
                <li>Customer Relationship</li>
                <li>Professional Invoicing</li>
                <li>Real-time Gold Rates</li>
                <li>Business Analytics</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-primary">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/resources/documentation" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="/resources/tutorials" className="hover:text-primary transition-colors">Tutorials</Link></li>
                <li><Link href="/resources/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/resources/contact-us" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/resources/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-primary">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>info@sethiyagold.com</li>
                <li>+918454881721</li>
                <li>Mumbai, India</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Sethiya Gold. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
