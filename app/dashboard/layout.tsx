import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Sethiya Gold",
  description: "A premium invoicing system for Indian jewelry shops",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 