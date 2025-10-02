"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home } from "lucide-react"

import { Footer } from "@/app/components/footer/footer"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export default function ResourcesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  // Navigation items for the resources section
  const resourceLinks = [
    {
      title: "Overview",
      href: "/resources",
      exact: true,
    },
    {
      title: "Documentation",
      href: "/resources/documentation",
    },
    {
      title: "Tutorials",
      href: "/resources/tutorials",
    },
    {
      title: "Blog",
      href: "/resources/blog",
    },
    {
      title: "Contact Us",
      href: "/resources/contact-us",
    },
    {
      title: "FAQ",
      href: "/resources/faq",
    },
    {
      title: "Terms & Conditions",
      href: "/resources/terms-and-conditions",
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/" className="flex items-center gap-2 font-heading font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl">Sethiya Gold</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <SidebarTrigger className="md:hidden" />
          </nav>
        </header>

        <div className="flex flex-1">
          <Sidebar className="border-r">
            <SidebarHeader className="flex items-center px-4 py-2">
              <h2 className="text-lg font-semibold text-amber-800">Resources</h2>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {resourceLinks.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        link.exact
                          ? pathname === link.href
                          : pathname === link.href || pathname.startsWith(`${link.href}/`)
                      }
                    >
                      <Link href={link.href}>
                        <span>{link.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="p-4">
                <div className="rounded-md bg-amber-50 p-3 text-sm">
                  <p className="font-medium text-amber-800">Need Help?</p>
                  <p className="mt-1 text-amber-600">Contact our support team for personalized assistance</p>
                  <Button className="mt-2 w-full bg-amber-600 hover:bg-amber-700" size="sm" asChild>
                    <Link href="/resources/contact-us">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <div className="flex flex-1 flex-col">
            <main className="flex-1 p-6 md:p-8">{children}</main>
            <Footer />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
