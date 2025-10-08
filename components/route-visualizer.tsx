'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'

/**
 * RouteVisualizer Component
 *
 * A development tool that shows a visual breadcrumb of the current route
 * and displays route metadata. Only visible in development mode.
 *
 * @example
 * // Add to root layout during development:
 * import { RouteVisualizer } from '@/components/route-visualizer'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {process.env.NODE_ENV === 'development' && <RouteVisualizer />}
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 */
export function RouteVisualizer() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  // Don't show on landing page
  if (pathname === '/') {
    return null
  }

  if (!isVisible) {
    // Show minimized toggle button
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-purple-600 px-4 py-2 text-xs text-white shadow-lg hover:bg-purple-700 transition-colors"
        title="Show route visualizer"
      >
        🗺️ Routes
      </button>
    )
  }

  const segments = pathname.split('/').filter(Boolean)
  const routeInfo = getRouteInfo(pathname)

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="rounded-lg border border-purple-200 bg-white shadow-xl dark:border-purple-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 bg-purple-50 px-4 py-2 dark:border-purple-900 dark:bg-purple-950">
          <div className="flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            <span className="font-semibold text-purple-900 dark:text-purple-100">Route Visualizer</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Breadcrumb */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Route</div>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="rounded bg-purple-100 px-2 py-1 text-xs font-mono text-purple-900 dark:bg-purple-900 dark:text-purple-100">
                /
              </span>
              {segments.map((segment, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className="text-purple-400">→</span>
                  <span className="rounded bg-purple-100 px-2 py-1 text-xs font-mono text-purple-900 dark:bg-purple-900 dark:text-purple-100">
                    {segment}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Route Info */}
          {routeInfo && (
            <div className="space-y-2 border-t border-purple-100 pt-3 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                  routeInfo.auth === 'Required'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                }`}>
                  {routeInfo.type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Category</span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                  {routeInfo.category}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Auth</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-100">
                  {routeInfo.auth}
                </span>
              </div>
            </div>
          )}

          {/* Expanded Info */}
          {isExpanded && routeInfo && (
            <div className="mt-3 border-t border-purple-100 pt-3 dark:border-purple-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</div>
              <p className="text-xs text-gray-700 dark:text-gray-300">{routeInfo.description}</p>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 mb-1">Full Path</div>
              <code className="block rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-800 dark:bg-gray-800 dark:text-gray-200 break-all">
                {pathname}
              </code>

              {routeInfo.possibleActions && (
                <>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 mb-1">Possible Actions</div>
                  <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
                    {routeInfo.possibleActions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer with helpful tips */}
        <div className="border-t border-purple-100 bg-purple-50 px-4 py-2 dark:border-purple-900 dark:bg-purple-950">
          <p className="text-xs text-purple-600 dark:text-purple-400">
            💡 Check console for detailed route logs
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Get detailed information about a route
 */
function getRouteInfo(pathname: string): {
  type: string
  category: string
  auth: string
  description: string
  possibleActions?: string[]
} | null {
  // Dashboard
  if (pathname === '/dashboard') {
    return {
      type: 'Protected',
      category: 'Dashboard',
      auth: 'Required',
      description: 'Main application dashboard with navigation tiles for all major features',
      possibleActions: [
        'Navigate to Create Invoice',
        'Navigate to Invoices',
        'Navigate to Stock',
        'Navigate to Customers',
        'Navigate to Purchases',
        'Navigate to Settings',
        'View Profile',
        'Logout',
      ],
    }
  }

  // Landing page
  if (pathname === '/') {
    return {
      type: 'Public',
      category: 'Landing',
      auth: 'None',
      description: 'Main landing page with features, testimonials, and call-to-action',
      possibleActions: [
        'Sign In/Sign Up',
        'Navigate to Resources',
        'Navigate to Documentation',
        'Navigate to Contact',
      ],
    }
  }

  // Invoices
  if (pathname === '/invoices') {
    return {
      type: 'Protected',
      category: 'Invoices',
      auth: 'Required',
      description: 'List of all invoices with search and filter capabilities',
      possibleActions: ['Create new invoice', 'View invoice details', 'Edit invoice', 'Delete invoice'],
    }
  }

  if (pathname === '/create-invoice') {
    return {
      type: 'Protected',
      category: 'Invoices',
      auth: 'Required',
      description: 'Create new invoice with customer selection, item addition, and PDF generation',
      possibleActions: [
        'Select customer',
        'Add invoice items',
        'Calculate totals',
        'Generate PDF',
        'Save invoice',
      ],
    }
  }

  if (pathname.match(/^\/invoices\/[^/]+$/)) {
    return {
      type: 'Protected',
      category: 'Invoices',
      auth: 'Required',
      description: 'View invoice details and download PDF',
      possibleActions: ['Download PDF', 'Edit invoice', 'Delete invoice', 'Back to list'],
    }
  }

  if (pathname.match(/^\/invoices\/[^/]+\/edit$/)) {
    return {
      type: 'Protected',
      category: 'Invoices',
      auth: 'Required',
      description: 'Edit existing invoice',
      possibleActions: ['Update invoice details', 'Save changes', 'Cancel', 'Delete invoice'],
    }
  }

  // Stock
  if (pathname === '/stock') {
    return {
      type: 'Protected',
      category: 'Inventory',
      auth: 'Required',
      description: 'Stock inventory management with category and table views',
      possibleActions: [
        'Add new stock item',
        'View by category',
        'View as table',
        'Search items',
        'Filter by category',
      ],
    }
  }

  if (pathname === '/stock/add') {
    return {
      type: 'Protected',
      category: 'Inventory',
      auth: 'Required',
      description: 'Add new stock item with images and specifications',
      possibleActions: ['Upload images', 'Enter details', 'Set pricing', 'Save item'],
    }
  }

  if (pathname.match(/^\/stock\/[^/]+$/)) {
    return {
      type: 'Protected',
      category: 'Inventory',
      auth: 'Required',
      description: 'View stock item details with image gallery',
      possibleActions: ['Edit item', 'Delete item', 'Print label', 'Back to stock list'],
    }
  }

  if (pathname.match(/^\/stock\/[^/]+\/edit$/)) {
    return {
      type: 'Protected',
      category: 'Inventory',
      auth: 'Required',
      description: 'Edit stock item details',
      possibleActions: ['Update details', 'Upload new images', 'Save changes', 'Cancel'],
    }
  }

  // Customers
  if (pathname === '/customers') {
    return {
      type: 'Protected',
      category: 'Customers',
      auth: 'Required',
      description: 'Customer database with contact information and purchase history',
      possibleActions: ['Add new customer', 'View customer details', 'Edit customer', 'Delete customer'],
    }
  }

  if (pathname === '/customers/add') {
    return {
      type: 'Protected',
      category: 'Customers',
      auth: 'Required',
      description: 'Add new customer to database',
      possibleActions: ['Enter customer details', 'Save customer'],
    }
  }

  if (pathname.match(/^\/customers\/[^/]+$/)) {
    return {
      type: 'Protected',
      category: 'Customers',
      auth: 'Required',
      description: 'View customer profile and purchase history',
      possibleActions: [
        'Edit customer',
        'Create invoice for customer',
        'View purchase history',
        'Delete customer',
      ],
    }
  }

  if (pathname.match(/^\/customers\/[^/]+\/edit$/)) {
    return {
      type: 'Protected',
      category: 'Customers',
      auth: 'Required',
      description: 'Edit customer information',
      possibleActions: ['Update details', 'Save changes', 'Cancel'],
    }
  }

  // Bookings
  if (pathname === '/bookings') {
    return {
      type: 'Protected',
      category: 'Bookings',
      auth: 'Required',
      description: 'Booking and appointment management',
      possibleActions: ['Create booking', 'View bookings', 'Edit booking', 'Cancel booking'],
    }
  }

  if (pathname === '/bookings/create') {
    return {
      type: 'Protected',
      category: 'Bookings',
      auth: 'Required',
      description: 'Create new booking or appointment',
      possibleActions: ['Select date', 'Enter booking details', 'Save booking'],
    }
  }

  // Purchases
  if (pathname === '/purchases') {
    return {
      type: 'Protected',
      category: 'Purchases',
      auth: 'Required',
      description: 'Purchase order and supplier management hub',
      possibleActions: [
        'Add purchase invoice',
        'Add supplier',
        'View invoices',
        'View suppliers',
        'Edit purchases',
      ],
    }
  }

  if (pathname.startsWith('/purchases/invoices')) {
    return {
      type: 'Protected',
      category: 'Purchases',
      auth: 'Required',
      description: 'Purchase invoice management',
      possibleActions: ['Add invoice', 'View details', 'Edit invoice', 'Delete invoice'],
    }
  }

  if (pathname.startsWith('/purchases/suppliers')) {
    return {
      type: 'Protected',
      category: 'Purchases',
      auth: 'Required',
      description: 'Supplier management',
      possibleActions: ['Add supplier', 'View details', 'Edit supplier', 'Delete supplier'],
    }
  }

  // Resources
  if (pathname.startsWith('/resources')) {
    return {
      type: 'Public',
      category: 'Resources',
      auth: 'None',
      description: 'Public resources, documentation, and support',
      possibleActions: ['Browse documentation', 'View tutorials', 'Contact support', 'Read FAQ'],
    }
  }

  // Profile & Settings
  if (pathname === '/profile') {
    return {
      type: 'Protected',
      category: 'User',
      auth: 'Required',
      description: 'User profile and account settings',
      possibleActions: ['Edit profile', 'Change password', 'Update preferences'],
    }
  }

  if (pathname === '/settings') {
    return {
      type: 'Protected',
      category: 'Configuration',
      auth: 'Required',
      description: 'Application configuration and settings',
      possibleActions: ['Update settings', 'Configure preferences', 'Manage integrations'],
    }
  }

  // Reports
  if (pathname === '/reports') {
    return {
      type: 'Protected',
      category: 'Analytics',
      auth: 'Required',
      description: 'Business reports and analytics dashboard',
      possibleActions: ['View sales reports', 'Generate reports', 'Export data', 'View analytics'],
    }
  }

  return null
}
