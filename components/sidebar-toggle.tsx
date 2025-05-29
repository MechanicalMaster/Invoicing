'use client'

import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'

export function SidebarToggle() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
    // Dispatch custom event to communicate with sidebar component
    document.dispatchEvent(new CustomEvent('toggle-sidebar'))
  }
  
  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
} 