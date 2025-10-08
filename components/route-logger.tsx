'use client'

import { useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * RouteLogger Component
 *
 * A client-side navigation tracking component for Next.js App Router.
 * Logs all route changes with detailed information including:
 * - Timestamp
 * - Previous and current routes
 * - URL search parameters
 * - Navigation duration
 * - Route metadata
 *
 * @example
 * // Add to root layout (app/layout.tsx):
 * import { RouteLogger } from '@/components/route-logger'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <RouteLogger />
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 */
function RouteLoggerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPathname = useRef<string>('')
  const navigationStartTime = useRef<number>(Date.now())
  const navigationHistory = useRef<Array<{
    from: string
    to: string
    timestamp: string
    duration: number
    params: string
  }>>([])

  useEffect(() => {
    const currentTime = Date.now()
    const duration = currentTime - navigationStartTime.current
    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    const timestamp = new Date().toISOString()

    // Only log if the route actually changed
    if (previousPathname.current !== pathname) {
      const navigationEvent = {
        from: previousPathname.current || '(initial)',
        to: pathname,
        timestamp,
        duration,
        params: searchParams.toString(),
      }

      // Add to history
      navigationHistory.current.push(navigationEvent)

      // Console logging with styled output
      console.groupCollapsed(
        `%c🧭 Route Change: ${previousPathname.current || '(initial)'} → ${pathname}`,
        'color: #10b981; font-weight: bold; font-size: 12px;'
      )

      console.log('%cTimestamp:', 'color: #6366f1; font-weight: bold;', timestamp)
      console.log('%cFrom:', 'color: #ef4444; font-weight: bold;', previousPathname.current || '(initial load)')
      console.log('%cTo:', 'color: #10b981; font-weight: bold;', pathname)

      if (searchParams.toString()) {
        console.log('%cSearch Params:', 'color: #f59e0b; font-weight: bold;', searchParams.toString())
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })
        console.table(params)
      }

      console.log('%cDuration:', 'color: #8b5cf6; font-weight: bold;', `${duration}ms`)
      console.log('%cFull URL:', 'color: #06b6d4; font-weight: bold;', currentUrl)

      // Log route metadata
      const routeMetadata = getRouteMetadata(pathname)
      if (routeMetadata) {
        console.log('%cRoute Info:', 'color: #ec4899; font-weight: bold;', routeMetadata)
      }

      // Performance hints
      if (duration > 1000) {
        console.warn('%c⚠️ Slow Navigation:', 'color: #f59e0b; font-weight: bold;', `${duration}ms`)
      }

      // Log navigation history summary
      console.log(
        `%cTotal Navigations: ${navigationHistory.current.length}`,
        'color: #64748b; font-style: italic;'
      )

      console.groupEnd()

      // Update refs
      previousPathname.current = pathname
      navigationStartTime.current = currentTime
    }

    // Make navigation history available globally for debugging
    if (typeof window !== 'undefined') {
      ;(window as any).__ROUTE_HISTORY__ = navigationHistory.current
      ;(window as any).getRouteHistory = () => {
        console.table(navigationHistory.current)
        return navigationHistory.current
      }
      ;(window as any).clearRouteHistory = () => {
        navigationHistory.current = []
        console.log('%c✅ Route history cleared', 'color: #10b981; font-weight: bold;')
      }
    }
  }, [pathname, searchParams])

  // Don't render anything
  return null
}

/**
 * Get metadata about a route based on its pathname
 */
function getRouteMetadata(pathname: string): {
  type: string
  category: string
  auth: string
  description: string
} | null {
  // Landing page
  if (pathname === '/') {
    return {
      type: 'Public',
      category: 'Landing',
      auth: 'None',
      description: 'Main landing page with features and CTA',
    }
  }

  // Dashboard
  if (pathname === '/dashboard') {
    return {
      type: 'Protected',
      category: 'Dashboard',
      auth: 'Required',
      description: 'Main application dashboard',
    }
  }

  // Resources (public)
  if (pathname.startsWith('/resources')) {
    return {
      type: 'Public',
      category: 'Resources',
      auth: 'None',
      description: 'Public resources and documentation',
    }
  }

  // Invoices
  if (pathname.startsWith('/invoice')) {
    return {
      type: 'Protected',
      category: 'Invoices',
      auth: 'Required',
      description: 'Invoice management and creation',
    }
  }

  // Create invoice
  if (pathname === '/create-invoice') {
    return {
      type: 'Protected',
      category: 'Invoices',
      auth: 'Required',
      description: 'Create new invoice',
    }
  }

  // Stock
  if (pathname.startsWith('/stock')) {
    return {
      type: 'Protected',
      category: 'Inventory',
      auth: 'Required',
      description: 'Stock and inventory management',
    }
  }

  // Customers
  if (pathname.startsWith('/customers')) {
    return {
      type: 'Protected',
      category: 'Customers',
      auth: 'Required',
      description: 'Customer relationship management',
    }
  }

  // Bookings
  if (pathname.startsWith('/bookings')) {
    return {
      type: 'Protected',
      category: 'Bookings',
      auth: 'Required',
      description: 'Booking and appointment management',
    }
  }

  // Purchases
  if (pathname.startsWith('/purchases')) {
    return {
      type: 'Protected',
      category: 'Purchases',
      auth: 'Required',
      description: 'Purchase orders and supplier management',
    }
  }

  // Profile
  if (pathname === '/profile') {
    return {
      type: 'Protected',
      category: 'User',
      auth: 'Required',
      description: 'User profile settings',
    }
  }

  // Settings
  if (pathname === '/settings') {
    return {
      type: 'Protected',
      category: 'Configuration',
      auth: 'Required',
      description: 'Application settings',
    }
  }

  // Reports (if exists)
  if (pathname === '/reports') {
    return {
      type: 'Protected',
      category: 'Analytics',
      auth: 'Required',
      description: 'Business reports and analytics',
    }
  }

  // Default fallback
  return {
    type: 'Unknown',
    category: 'Other',
    auth: 'Unknown',
    description: 'Route not categorized',
  }
}

/**
 * Advanced Route Logger with localStorage persistence
 *
 * This version stores navigation history in localStorage for persistence
 * across sessions. Useful for debugging user navigation patterns.
 */
export function RouteLoggerPersistent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPathname = useRef<string>('')
  const navigationStartTime = useRef<number>(Date.now())

  useEffect(() => {
    const currentTime = Date.now()
    const duration = currentTime - navigationStartTime.current
    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    const timestamp = new Date().toISOString()

    if (previousPathname.current !== pathname) {
      const navigationEvent = {
        from: previousPathname.current || '(initial)',
        to: pathname,
        timestamp,
        duration,
        params: searchParams.toString(),
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
      }

      // Get existing history from localStorage
      let history: any[] = []
      try {
        const stored = localStorage.getItem('__ROUTE_HISTORY__')
        if (stored) {
          history = JSON.parse(stored)
        }
      } catch (e) {
        console.warn('Failed to parse route history from localStorage:', e)
      }

      // Add new event
      history.push(navigationEvent)

      // Keep only last 100 events to prevent localStorage bloat
      if (history.length > 100) {
        history = history.slice(-100)
      }

      // Save back to localStorage
      try {
        localStorage.setItem('__ROUTE_HISTORY__', JSON.stringify(history))
      } catch (e) {
        console.warn('Failed to save route history to localStorage:', e)
      }

      // Console logging (same as basic version)
      console.groupCollapsed(
        `%c🧭 Route Change: ${previousPathname.current || '(initial)'} → ${pathname}`,
        'color: #10b981; font-weight: bold; font-size: 12px;'
      )
      console.log('%cTimestamp:', 'color: #6366f1; font-weight: bold;', timestamp)
      console.log('%cFrom:', 'color: #ef4444; font-weight: bold;', previousPathname.current || '(initial load)')
      console.log('%cTo:', 'color: #10b981; font-weight: bold;', pathname)
      console.log('%cDuration:', 'color: #8b5cf6; font-weight: bold;', `${duration}ms`)
      console.groupEnd()

      // Update refs
      previousPathname.current = pathname
      navigationStartTime.current = currentTime

      // Global helpers
      if (typeof window !== 'undefined') {
        ;(window as any).getRouteHistory = () => {
          try {
            const stored = localStorage.getItem('__ROUTE_HISTORY__')
            const history = stored ? JSON.parse(stored) : []
            console.table(history)
            return history
          } catch (e) {
            console.error('Failed to get route history:', e)
            return []
          }
        }
        ;(window as any).clearRouteHistory = () => {
          localStorage.removeItem('__ROUTE_HISTORY__')
          console.log('%c✅ Route history cleared', 'color: #10b981; font-weight: bold;')
        }
        ;(window as any).exportRouteHistory = () => {
          try {
            const stored = localStorage.getItem('__ROUTE_HISTORY__')
            const history = stored ? JSON.parse(stored) : []
            const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `route-history-${new Date().toISOString()}.json`
            a.click()
            URL.revokeObjectURL(url)
            console.log('%c✅ Route history exported', 'color: #10b981; font-weight: bold;')
          } catch (e) {
            console.error('Failed to export route history:', e)
          }
        }
      }
    }
  }, [pathname, searchParams])

  return null
}

// Wrap with Suspense to fix Next.js 15 build error
export function RouteLogger() {
  return (
    <Suspense fallback={null}>
      <RouteLoggerInner />
    </Suspense>
  )
}

/**
 * Global functions available in browser console when RouteLogger is active:
 *
 * - window.getRouteHistory() - Display route history in console table
 * - window.clearRouteHistory() - Clear the route history
 * - window.exportRouteHistory() - Export history as JSON file (persistent version only)
 * - window.__ROUTE_HISTORY__ - Direct access to history array (basic version only)
 */
