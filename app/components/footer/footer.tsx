import Link from "next/link"
import { ChevronRight, FileText } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-stone-50">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <FileText className="h-5 w-5 text-amber-600" />
              <span className="text-lg text-amber-800">Sethiya Gold</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A premium invoicing system designed specifically for Indian jewelry shops.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-amber-800">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/resources/documentation" 
                  className="flex items-center text-muted-foreground hover:text-amber-600"
                >
                  <ChevronRight className="mr-1 h-3 w-3" />
                  Documentation
                </Link>
              </li>
              <li>
                <Link 
                  href="/resources/tutorials" 
                  className="flex items-center text-muted-foreground hover:text-amber-600"
                >
                  <ChevronRight className="mr-1 h-3 w-3" />
                  Tutorials
                </Link>
              </li>
              <li>
                <Link 
                  href="/resources/blog" 
                  className="flex items-center text-muted-foreground hover:text-amber-600"
                >
                  <ChevronRight className="mr-1 h-3 w-3" />
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-amber-800">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/resources/contact-us" 
                  className="flex items-center text-muted-foreground hover:text-amber-600"
                >
                  <ChevronRight className="mr-1 h-3 w-3" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/resources/faq" 
                  className="flex items-center text-muted-foreground hover:text-amber-600"
                >
                  <ChevronRight className="mr-1 h-3 w-3" />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-amber-800">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/resources/terms-and-conditions" 
                  className="flex items-center text-muted-foreground hover:text-amber-600"
                >
                  <ChevronRight className="mr-1 h-3 w-3" />
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-muted pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Sethiya Gold. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}