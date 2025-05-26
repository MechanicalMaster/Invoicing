
**Planning Phase**

Here's the step-by-step implementation plan:

**a. Implementation Plan**

1.  **Make Settings Page Tabs Responsive (Mobile - Horizontal Scroll):**
    *   Modify the `TabsList` component in the settings page to allow horizontal scrolling on smaller screens, preventing the tabs from "jumbling up". The `grid-cols-6` class currently applied is too rigid for mobile.

2.  **Remove Settings Page Description Text:**
    *   Delete the paragraph of text "Manage your firm settings, notifications, and backups" that appears below the "Settings" heading.

3.  **Display User Name on Dashboard Header:**
    *   Update the dashboard header to show the user's full name. If the full name is not available, it should fall back to displaying the user's email address.

4.  **Update Brand Name on Customer Management Page:**
    *   Change the brand name from "Ratna Invoicing" to "Sethiya Gold" in the header of the Customer Management page.

**b. Affected Files and Specific Changes**

1.  **Step 1: Make Settings Page Tabs Responsive**
    *   **File:** `app/settings/page.tsx`
    *   **Changes:**
        *   Locate the `TabsList` component.
        *   Remove the `grid w-full grid-cols-6` classes.
        *   Add classes to enable horizontal scrolling and prevent wrapping, for example: `flex overflow-x-auto whitespace-nowrap`. You might also want to ensure `TabsTrigger`s have appropriate padding and don't shrink too much. A `max-w-full` or `w-full` on the `TabsList` along with `overflow-x-auto` should work.

2.  **Step 2: Remove Settings Page Description Text**
    *   **File:** `app/settings/page.tsx`
    *   **Changes:**
        *   Locate the `<p className="text-muted-foreground">Manage your firm settings, notifications, and backups</p>` element within the `div` containing the `h1` "Settings".
        *   Delete this entire `<p>` element.

3.  **Step 3: Display User Name on Dashboard Header**
    *   **File:** `app/dashboard/page.tsx`
    *   **Changes:**
        *   In the `DropdownMenuTrigger` for the user profile:
            *   Find the `<span>{user.email}</span>`.
            *   Replace it with `<span>{user.user_metadata?.full_name || user.email}</span>`.
            *   The `user` object is available via the `useAuth()` hook. Ensure `user.user_metadata.full_name` is the correct path if it's stored differently (e.g., `user.user_metadata.name`). Based on `app/components/auth-modal.tsx` and `app/profile/page.tsx`, `user.user_metadata.full_name` seems to be the correct path.

4.  **Step 4: Update Brand Name on Customer Management Page**
    *   **File:** `app/customers/page.tsx`
    *   **Changes:**
        *   Locate the header section:
            ```tsx
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-xl">Ratna Invoicing</span>
            </Link>
            ```
        *   Change the text within the `<span>` from "Ratna Invoicing" to "Sethiya Gold".

**c. Configuration or Database Migrations**

*   No configuration changes are required.
*   No database migrations are required for these UI changes.
