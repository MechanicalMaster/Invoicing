
## Implementation Plan: In-App Notification System

### A. Step-by-step Implementation Plan

1.  **Database Schema: `notifications` Table**
    *   **Action**: Create a new SQL migration file to define the `notifications` table.
    *   **Details**:
        *   Table name: `notifications`
        *   Columns:
            *   `id` (UUID, primary key, default `uuid_generate_v4()`)
            *   `user_id` (UUID, foreign key referencing `auth.users(id)` or `profiles(id)`, indexed)
            *   `type` (TEXT, e.g., 'gold_rate_update', indexed)
            *   `title` (TEXT, not null)
            *   `message` (TEXT, not null)
            *   `created_at` (TIMESTAMPTZ, default `now()`, indexed)
            *   `read_at` (TIMESTAMPTZ, nullable)
            *   `action_url` (TEXT, nullable)
        *   Enable Row Level Security (RLS) on the table.
        *   Create RLS policies:
            *   Allow users to `SELECT` their own notifications.
            *   Allow users to `UPDATE` (specifically the `read_at` column) their own notifications.
            *   (Backend function will handle `INSERT` with service role key).
    *   **Post-Action**: Update `lib/database.types.ts` by running the Supabase CLI command to generate types or by manually adding the `notifications` table definition.

2.  **Backend: Daily Notification Generation (Supabase Cron Job & Edge Function)**
    *   **Action**: Create a new Supabase Edge Function responsible for generating daily gold rate reminders.
    *   **Details**:
        *   Function Name: `generate-daily-gold-rate-reminders`
        *   Logic:
            1.  Will be triggered by a cron job.
            2.  Fetch all `user_id`s from the `profiles` table (or `auth.users` if `profiles` might not exist for all users).
            3.  For each `user_id`:
                *   Check if a 'gold_rate_update' notification for the current day (e.g., `created_at` >= today's start and `created_at` < tomorrow's start) already exists for this user.
                *   If no such notification exists, insert a new notification record:
                    *   `user_id`: current user's ID
                    *   `type`: 'gold_rate_update'
                    *   `title`: "Reminder: Update Gold Rate"
                    *   `message`: "Don't forget to update today's gold rate to ensure accurate invoicing."
                    *   `action_url`: `/settings` (or the clarified gold rate page path).
                    *   `created_at`: current timestamp.
        *   Use a Supabase client initialized with the service role key for database operations within this function.
    *   **Scheduling**: Configure a Supabase cron job (via `pg_cron`) to execute this Edge Function daily at 01:30 UTC (approximates 7:00 AM IST). Cron expression: `30 1 * * *`.

3.  **Frontend: Header UI - Notification Bell & Badge**
    *   **Action**: Modify the main application header to include a notification bell icon and an unread count badge.
    *   **Details**:
        *   Add a bell icon (e.g., `Bell` from `lucide-react`) to the header.
        *   The icon will be a trigger for the notifications dropdown/panel.
        *   Display a small badge (e.g., red circle with a number) on the bell icon, showing the count of unread notifications.
        *   If the unread count is zero, the badge should be hidden.
        *   Add a tooltip to the bell icon (e.g., "Notifications. X unread.").

4.  **Frontend: UI - Notifications Dropdown/Panel**
    *   **Action**: Create a new React component for the notifications dropdown/panel.
    *   **Details**:
        *   Component Name: `NotificationsDropdown`
        *   Triggered by clicking the bell icon (from step 3).
        *   Layout:
            *   Header: "Notifications" title.
            *   Scrollable list area for notification items.
            *   Footer (optional): "Mark all as read" button.
        *   Each notification item (`NotificationItem` sub-component) should display:
            *   Title
            *   Message (can be truncated with a "read more" option if long)
            *   Timestamp (e.g., "10m ago", "Yesterday", "Oct 20")
            *   Visual indication of read/unread status (e.g., a dot, background color).

5.  **Frontend: State Management & Data Fetching for Notifications**
    *   **Action**: Implement logic to fetch, store, and manage notification data in the frontend.
    *   **Details**:
        *   Create a `useNotifications` custom hook or a context provider (`NotificationsProvider`).
        *   **Fetching**:
            *   On initial app load (e.g., in a layout component like `app/dashboard/layout.tsx` or the main `app/layout.tsx`), call a Supabase query to fetch the user's notifications.
            *   Query `notifications` table, `SELECT * WHERE user_id = current_user_id AND read_at IS NULL ORDER BY created_at DESC LIMIT 50` (to get unread count and recent unread).
            *   Also fetch a limited number of recent notifications (e.g., last 14 days, N-8), `SELECT * WHERE user_id = current_user_id AND created_at >= (NOW() - INTERVAL '14 days') ORDER BY created_at DESC LIMIT 50`.
        *   **State**:
            *   Store the list of displayed notifications.
            *   Store the count of unread notifications.
        *   Provide functions to:
            *   Refresh notifications.
            *   Mark a notification as read.
            *   Mark all notifications as read.

6.  **Frontend: Notification Interaction Logic**
    *   **Action**: Implement interactivity for the notifications dropdown.
    *   **Details**:
        *   **Clicking a Notification**:
            *   When a 'gold_rate_update' notification item is clicked:
                1.  Call the `markAsRead` function (from the `useNotifications` hook). This function will make a `PATCH` request to `/rest/v1/notifications?id=eq.{notification_id}` with `{"read_at": "now()"}`.
                2.  Update the local state: decrease unread count, mark the notification as read in the local list.
                3.  Navigate the user to the `action_url` specified in the notification (e.g., `/settings`).
        *   **"Mark all as read" Button (if implemented)**:
            *   Call a `markAllAsRead` function. This will make a `PATCH` request to `/rest/v1/notifications?user_id=eq.{user_id}&read_at=is.null` with `{"read_at": "now()"}`.
            *   Update local state: set unread count to 0, mark all displayed notifications as read.
        *   The bell icon's badge should update reactively based on the unread count.

7.  **Data Retention (Query-based)**
    *   **Action**: Ensure only recent notifications (last 7-14 days) are fetched and displayed.
    *   **Details**: Modify the Supabase query in the `useNotifications` hook (step 5) to include a `created_at` filter: `gte.{current_date_minus_14_days}`. This addresses requirement N-8 for display purposes. Actual deletion of older records can be a future enhancement via a separate cron job.

### B. Files and Functions/Classes to be Impacted

1.  **Database:**
    *   `migrations/YYYYMMDDHHMMSS_create_notifications_table.sql` (New)
    *   `lib/database.types.ts` (Updated via Supabase CLI or manually)

2.  **Supabase Edge Functions:**
    *   `supabase/functions/generate-daily-gold-rate-reminders/index.ts` (New) - Handles daily notification creation.

3.  **Frontend - Core Layout/Providers:**
    *   `app/dashboard/layout.tsx` (or `app/layout.tsx` or relevant shared header component): To integrate the `NotificationBell` component and potentially the `NotificationsProvider`.
    *   `components/auth-provider.tsx`: Might be a place to initialize notification fetching after user logs in, if not using a dedicated `NotificationsProvider`.

4.  **Frontend - New UI Components:**
    *   `components/ui/notification-bell.tsx` (New) - Bell icon with badge.
    *   `components/ui/notifications-dropdown.tsx` (New) - Dropdown/panel UI.
    *   `components/ui/notification-item.tsx` (New) - Individual notification display.

5.  **Frontend - Hooks/State Management:**
    *   `hooks/use-notifications.ts` (New) - Custom hook for notification logic.
    *   (Alternatively) `components/notifications-provider.tsx` (New) - If using context.

6.  **Frontend - Navigation/Target Page:**
    *   `app/settings/page.tsx` (or the specified gold rate update page): No direct code changes needed for this feature, but it's the target of the `action_url`.

7.  **Supabase Client:**
    *   `lib/supabase.ts` (Existing) - Will be used by the `useNotifications` hook and Edge Functions.

### C. Configuration or Database Migrations Required

1.  **Database Migration:**
    *   The SQL script from **A.1** needs to be created and applied to your Supabase instance.
    *   After migration, regenerate or update `lib/database.types.ts`.

2.  **Supabase Cron Job:**
    *   Configure the cron job in the Supabase dashboard (Database > Cron Jobs) or via Supabase CLI (`supabase functions deploy generate-daily-gold-rate-reminders --schedule "30 1 * * *"`).
    *   The Edge Function `generate-daily-gold-rate-reminders` needs to be deployed.

3.  **No new environment variables are anticipated for this feature.**
