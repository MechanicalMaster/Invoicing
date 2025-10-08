# Build Fix - Next.js 15 Suspense Boundary Issue

## Issue
After adding the `RouteLogger` component, the build was failing with the following error:

```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/invoices".
Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
```

This is a Next.js 15 requirement where `useSearchParams()` must be wrapped in a Suspense boundary during static rendering.

## Solution
Wrapped the `RouteLogger` component with a Suspense boundary.

### Changes Made

**File:** `/components/route-logger.tsx`

1. **Added Suspense import:**
```tsx
import { useEffect, useRef, Suspense } from 'react'
```

2. **Renamed main component to `RouteLoggerInner`:**
```tsx
function RouteLoggerInner() {
  // ... existing code
}
```

3. **Created wrapper component with Suspense:**
```tsx
// Wrap with Suspense to fix Next.js 15 build error
export function RouteLogger() {
  return (
    <Suspense fallback={null}>
      <RouteLoggerInner />
    </Suspense>
  )
}
```

## Build Result

✅ **Build Successful!**

```
 ✓ Compiled successfully
 ✓ Linting and checking validity of types
 ✓ Collecting page data
 ✓ Generating static pages (37/37)
 ✓ Finalizing page optimization
 ✓ Collecting build traces
```

### Build Output:
- **Total Routes:** 46 (including API routes)
- **Static Pages:** 37
- **Dynamic Pages:** 9
- **First Load JS:** ~102 kB (shared)

## Why This Fix Works

In Next.js 15, when a page uses `useSearchParams()`, it opts out of static rendering because search params are only available at request time. By wrapping the component in a Suspense boundary, we tell Next.js:

1. The component can be rendered on the client
2. Show a fallback (in this case `null`) during server-side rendering
3. Hydrate the component properly on the client side with access to search params

This allows the rest of the page to be statically generated while the `RouteLogger` component waits for client-side hydration to access the search parameters.

## Impact

- **No functional changes:** The RouteLogger works exactly as before
- **Build now succeeds:** All pages can be properly generated
- **Performance:** No impact - the component still runs only on the client
- **User experience:** No visible changes

## Testing

Build tested successfully with:
```bash
rm -rf .next
pnpm run build
```

All 37 pages generated successfully without errors.

## References

- [Next.js 15 useSearchParams documentation](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)
- [React Suspense documentation](https://react.dev/reference/react/Suspense)
