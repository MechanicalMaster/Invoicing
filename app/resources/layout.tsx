import type React from "react"
import Link from "next/link"
import { FileText } from "lucide-react"

import { Footer } from "@/app/components/footer/footer"

export default function ResourcesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-heading font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl">Sethiya Gold</span>
        </Link>
      </header>

      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>

      <Footer />
    </div>
  )
}
