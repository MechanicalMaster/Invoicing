# Route Tracking System

This document explains the route tracking and visualization tools available in this Next.js application.

## Overview

Three components have been created to help track and visualize navigation in the application:

1. **RouteLogger** - Console-based navigation logging
2. **RouteLoggerPersistent** - Navigation logging with localStorage persistence
3. **RouteVisualizer** - Visual on-screen route information display

## Components

### 1. RouteLogger (Basic)

**File:** `/components/route-logger.tsx`

A lightweight client-side navigation tracker that logs route changes to the browser console.

#### Features
- Logs all route changes with timestamps
- Shows previous and current routes
- Displays URL search parameters
- Calculates navigation duration
- Provides route metadata (type, category, auth requirements)
- Performance warnings for slow navigations (>1s)
- Colored console output for better readability

#### Usage

Add to your root layout:

```tsx
// app/layout.tsx
import { RouteLogger } from '@/components/route-logger'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RouteLogger />
        {children}
      </body>
    </html>
  )
}
```

#### Console API

When RouteLogger is active, these functions are available in the browser console:

```javascript
// Display route history as a table
window.getRouteHistory()

// Clear the route history
window.clearRouteHistory()

// Direct access to history array
window.__ROUTE_HISTORY__
```

#### Example Console Output

```
🧭 Route Change: /dashboard → /invoices
  Timestamp: 2025-10-08T10:30:45.123Z
  From: /dashboard
  To: /invoices
  Search Params: (none)
  Duration: 245ms
  Full URL: /invoices
  Route Info: { type: 'Protected', category: 'Invoices', auth: 'Required', ... }
  Total Navigations: 5
```

---

### 2. RouteLoggerPersistent (Advanced)

**File:** `/components/route-logger.tsx` (same file, exported separately)

An enhanced version that persists navigation history to localStorage across sessions.

#### Features
- All features of basic RouteLogger
- Persists navigation history to localStorage
- Stores additional metadata (user agent, screen size)
- Keeps last 100 navigation events
- Export history as JSON file
- Survives page refreshes and browser restarts

#### Usage

```tsx
// app/layout.tsx
import { RouteLoggerPersistent } from '@/components/route-logger'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RouteLoggerPersistent />
        {children}
      </body>
    </html>
  )
}
```

#### Console API

```javascript
// Display persistent route history
window.getRouteHistory()

// Clear persistent history
window.clearRouteHistory()

// Export history as JSON file
window.exportRouteHistory()
```

#### Use Cases
- Debugging navigation issues
- Analyzing user journey patterns
- Performance analysis
- Session replay and debugging
- QA testing and bug reports

---

### 3. RouteVisualizer (Visual)

**File:** `/components/route-visualizer.tsx`

A visual development tool that displays route information on-screen.

#### Features
- Visual breadcrumb of current route
- Route metadata display (type, category, auth)
- Expandable/collapsible interface
- Can be minimized to a corner button
- Shows possible actions for current route
- Dark mode support
- Only shows on non-landing pages

#### Usage

Recommended for development only:

```tsx
// app/layout.tsx
import { RouteVisualizer } from '@/components/route-visualizer'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {process.env.NODE_ENV === 'development' && <RouteVisualizer />}
        {children}
      </body>
    </html>
  )
}
```

#### Display Information
- **Breadcrumb:** Visual path from root to current route
- **Type:** Public or Protected
- **Category:** Dashboard, Invoices, Inventory, etc.
- **Auth:** Required or None
- **Description:** What the route does
- **Possible Actions:** What users can do on this route
- **Full Path:** Complete route pathname

#### Controls
- **Expand/Collapse:** Toggle detailed information
- **Close (X):** Minimize to corner button
- **Corner Button:** Click to restore visualizer

---

## Implementation Guide

### Option 1: Console Logging Only (Recommended for Production)

```tsx
// app/layout.tsx
import { RouteLogger } from '@/components/route-logger'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RouteLogger />
        {children}
      </body>
    </html>
  )
}
```

### Option 2: Development with Visual Aid

```tsx
// app/layout.tsx
import { RouteLogger } from '@/components/route-logger'
import { RouteVisualizer } from '@/components/route-visualizer'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RouteLogger />
        {process.env.NODE_ENV === 'development' && <RouteVisualizer />}
        {children}
      </body>
    </html>
  )
}
```

### Option 3: Full Debugging Suite

```tsx
// app/layout.tsx
import { RouteLoggerPersistent } from '@/components/route-logger'
import { RouteVisualizer } from '@/components/route-visualizer'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RouteLoggerPersistent />
        {process.env.NODE_ENV === 'development' && <RouteVisualizer />}
        {children}
      </body>
    </html>
  )
}
```

---

## Route Metadata

The tracking system automatically categorizes routes based on pathname:

### Categories
- **Landing** - `/` (public landing page)
- **Dashboard** - `/dashboard` (main hub)
- **Invoices** - `/invoices/*`, `/create-invoice`
- **Inventory** - `/stock/*`
- **Customers** - `/customers/*`
- **Bookings** - `/bookings/*`
- **Purchases** - `/purchases/*`
- **Resources** - `/resources/*` (public)
- **User** - `/profile`
- **Configuration** - `/settings`
- **Analytics** - `/reports`

### Auth Status
- **Required** - Protected routes requiring authentication
- **None** - Public routes accessible without login

---

## Performance Monitoring

### Navigation Duration Tracking

The logger tracks how long each navigation takes:

```javascript
// Example log output
Duration: 245ms  // Normal
⚠️ Slow Navigation: 1250ms  // Warning for navigations >1s
```

### Performance Tips

If you see slow navigation warnings:
1. Check for unnecessary data fetching in page components
2. Review loading states and suspense boundaries
3. Consider code splitting for large components
4. Optimize images and assets
5. Check network requests in DevTools

---

## Debugging Workflows

### Workflow 1: Track User Navigation Path

```javascript
// In browser console after user reports an issue:
window.getRouteHistory()

// Shows sequence of pages visited
// Helpful for reproducing bugs
```

### Workflow 2: Performance Analysis

```javascript
// Get history
const history = window.__ROUTE_HISTORY__

// Find slow navigations
const slowNavs = history.filter(nav => nav.duration > 500)
console.table(slowNavs)
```

### Workflow 3: Export for Bug Reports

```javascript
// Using persistent logger
window.exportRouteHistory()

// Downloads JSON file with complete navigation history
// Attach to bug reports or support tickets
```

---

## Advanced Customization

### Adding Custom Route Metadata

Edit `getRouteMetadata()` function in `route-logger.tsx`:

```tsx
function getRouteMetadata(pathname: string) {
  // Add your custom routes
  if (pathname === '/my-custom-route') {
    return {
      type: 'Protected',
      category: 'Custom',
      auth: 'Required',
      description: 'My custom route description',
    }
  }

  // ... existing code
}
```

### Custom Logging Logic

You can modify the `useEffect` hook in RouteLogger to add custom logic:

```tsx
useEffect(() => {
  // ... existing navigation detection code

  // Add custom logic here
  if (pathname.startsWith('/invoices')) {
    // Send analytics event
    analytics.track('invoice_page_view', { pathname })
  }

  // ... rest of the code
}, [pathname, searchParams])
```

---

## Integration with Analytics

### Google Analytics Example

```tsx
// route-logger.tsx
useEffect(() => {
  if (previousPathname.current !== pathname) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pathname,
      })
    }

    // ... rest of logging code
  }
}, [pathname, searchParams])
```

### Mixpanel Example

```tsx
// route-logger.tsx
useEffect(() => {
  if (previousPathname.current !== pathname) {
    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track('Page View', {
        page: pathname,
        referrer: previousPathname.current,
      })
    }

    // ... rest of logging code
  }
}, [pathname, searchParams])
```

---

## Troubleshooting

### Logger Not Working

**Problem:** No console logs appearing

**Solutions:**
1. Check that component is imported and rendered in layout
2. Verify it's a client component (`'use client'` directive)
3. Check browser console settings (ensure logs not filtered)
4. Look for JavaScript errors preventing execution

### Persistent Logger Not Saving

**Problem:** History cleared after browser restart

**Solutions:**
1. Check localStorage is enabled in browser
2. Verify localStorage quota not exceeded
3. Check for browser privacy/incognito mode
4. Look for localStorage clearing extensions

### Visualizer Not Showing

**Problem:** RouteVisualizer not visible

**Solutions:**
1. Verify it's only used in development mode
2. Check z-index conflicts with other elements
3. Ensure it's not hidden on landing page (by design)
4. Look for CSS conflicts

---

## Best Practices

### Development
✅ Use RouteVisualizer for quick visual feedback
✅ Use basic RouteLogger for lightweight tracking
✅ Check console regularly for performance issues

### Staging/QA
✅ Use RouteLoggerPersistent for session tracking
✅ Export histories for bug reports
✅ Monitor navigation patterns

### Production
✅ Use basic RouteLogger (low overhead)
❌ Don't use RouteVisualizer (visual clutter)
❌ Don't use persistent logger unless needed (privacy concerns)
✅ Integrate with real analytics platform

---

## Privacy Considerations

### Data Collected
- Route pathnames (may contain IDs)
- Timestamps
- Navigation duration
- Search parameters (may contain sensitive data)
- User agent (persistent logger only)
- Screen size (persistent logger only)

### Recommendations
1. Don't log PII (personally identifiable information)
2. Filter sensitive search parameters before logging
3. Use basic logger in production (no persistence)
4. Add data retention policies for persistent logger
5. Consider GDPR/CCPA compliance requirements

---

## Performance Impact

### RouteLogger (Basic)
- **Memory:** ~1-2MB for 1000 navigations
- **CPU:** Negligible (<1ms per navigation)
- **Network:** None
- **Recommended:** ✅ Production-safe

### RouteLoggerPersistent
- **Memory:** Same as basic + localStorage
- **CPU:** Slightly higher due to localStorage I/O
- **Storage:** ~500KB per 100 navigations
- **Recommended:** ⚠️ Use with caution in production

### RouteVisualizer
- **Memory:** ~100KB
- **CPU:** Minimal (only active on route change)
- **Render:** <16ms per navigation
- **Recommended:** ⚠️ Development only

---

## Future Enhancements

Potential improvements to the route tracking system:

1. **Route Analytics Dashboard** - Visual analytics page showing route usage statistics
2. **Heatmap Integration** - Visual heatmap of most-used routes
3. **Session Replay** - Replay user navigation sessions
4. **Error Boundary Integration** - Track routes where errors occur
5. **A/B Testing Support** - Track navigation in different variants
6. **Custom Event Tracking** - Track custom user actions on routes
7. **Export to CSV** - Alternative export format for analysis
8. **Filter by Date Range** - Query history by time period
9. **Real-time Dashboard** - Live view of current user navigations
10. **Integration with Monitoring Tools** - Send to Sentry, LogRocket, etc.

---

## Support

For questions or issues:
1. Check this documentation
2. Review console errors
3. Examine route-logger.tsx source code
4. Test in different browsers
5. Check Next.js App Router documentation

---

**Last Updated:** 2025-10-08
**Version:** 1.0.0
**Components:** RouteLogger, RouteLoggerPersistent, RouteVisualizer
