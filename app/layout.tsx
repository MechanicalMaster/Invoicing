import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { NotificationProvider } from '@/lib/providers/notification-provider'
import { ChatProvider } from '@/lib/contexts/chat-context'
import { ChatModeProvider } from '@/lib/ai/context/chat-mode-context'
import { Toaster } from "@/components/ui/toaster"
import { ChatFloatingButton } from '@/components/ai-chat/chat-floating-button'
import { ChatPanel } from '@/components/ai-chat/chat-panel'
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sethiya Gold - Premium Jewelry Management",
  description: "A premium invoicing system for Indian jewelry shops",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body className={cn('min-h-screen bg-background antialiased')}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ChatModeProvider>
                <ChatProvider>
                  {children}
                  <ChatFloatingButton />
                  <ChatPanel />
                  <Toaster />
                </ChatProvider>
              </ChatModeProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
