'use client'

import Link from 'next/link'
import { Diamond as DiamondIcon } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { UserNav } from '@/components/user-nav'
import { SidebarToggle } from '@/components/sidebar-toggle'
import { NotificationBell } from '@/components/ui/notification-bell'

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarToggle />
        <Link href="/" passHref className="flex items-center gap-2">
          <DiamondIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">Jewelry Invoice</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  )
} 