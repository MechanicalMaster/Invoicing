
**Planning Phase:**

**a. Implementation Plan & b. Impacted Files:**

**I. Frontend: Service Worker & Push Subscription Management (Notification System)**

1.  **Create Service Worker (`public/service-worker.js`):**
    *   Implement `install`, `activate` event listeners.
    *   Implement `push` event listener: Parse payload, use `self.registration.showNotification(title, options)`.
    *   Implement `notificationclick` event listener: Get URL from `event.notification.data.url`, use `clients.openWindow(url)`, close notification.
    *   *Files impacted:* `public/service-worker.js` (new file)

2.  **Implement Push Notification Utility Functions (`lib/push-notifications.ts`):**
    *   `registerServiceWorker()`: Registers `/service-worker.js`.
    *   `requestNotificationPermission()`: Uses `Notification.requestPermission()`.
    *   `subscribeUserToPush()`: Calls `registration.pushManager.subscribe()` with VAPID public key.
    *   `unsubscribeUserFromPush()`: Calls `subscription.unsubscribe()`.
    *   `sendSubscriptionToBackend(subscription)`: API call to store subscription.
    *   `removeSubscriptionFromBackend(subscription)`: API call to remove subscription.
    *   `isPushSupported()`: Checks for `PushManager`.
    *   *Files impacted:* `lib/push-notifications.ts` (new file)

3.  **Update `AuthProvider` or New Global Context/Hook for Push (`components/auth-provider.tsx` or `hooks/use-push-notifications.tsx`):**
    *   On user login/session hydration, if notifications were previously enabled (from `user_settings`), attempt to re-register service worker and re-subscribe.
    *   *Files impacted:* `components/auth-provider.tsx` (or new context/hook)

**II. Backend: Store Subscriptions & Send Notifications (Notification System)**

4.  **Create Supabase Edge Function: `store-push-subscription` (`supabase/functions/store-push-subscription/index.ts`):**
    *   Accepts `PushSubscription` and `user_id`.
    *   Upserts into `push_subscriptions` table.
    *   *Files impacted:* `supabase/functions/store-push-subscription/index.ts` (new file)

5.  **Create Supabase Edge Function: `remove-push-subscription` (`supabase/functions/remove-push-subscription/index.ts`):**
    *   Accepts `endpoint` and `user_id`.
    *   Deletes from `push_subscriptions` table.
    *   *Files impacted:* `supabase/functions/remove-push-subscription/index.ts` (new file)

6.  **Create Supabase Edge Function: `send-daily-gold-rate-notification` (`supabase/functions/send-daily-gold-rate-notification/index.ts`):**
    *   Scheduled daily.
    *   **Fetch User-Specific Gold Rate (Future Enhancement, for now Mock):** For now, use a mock gold rate as previously planned for the notification payload. *Eventually, this function would fetch the `current_gold_rate` from the user's `user_settings` or a global default if the user hasn't set one.*
    *   Construct payload (e.g., Title: "Update Today’s Gold Rate", Body: "Gold is ₹[RATE] per 10 grams. Tap to update.", Icon, Data URL: `/gold-rate`).
    *   Retrieve all active `PushSubscription` objects.
    *   Send push messages using `web-push` library with VAPID keys. Handle errors.
    *   *Files impacted:* `supabase/functions/send-daily-gold-rate-notification/index.ts` (new file)

7.  **Create Supabase Edge Function: `send-test-notification` (`supabase/functions/send-test-notification/index.ts`):**
    *   Accepts `user_id`.
    *   Retrieves user's `PushSubscription`(s).
    *   Sends a predefined test notification (Static payload as planned).
    *   *Files impacted:* `supabase/functions/send-test-notification/index.ts` (new file)

**III. Frontend: Gold Rate Management UI & Logic**

8.  **Modify Dashboard Page (`app/dashboard/page.tsx`):**
    *   **State:** Add state for `currentGoldRate` (number | null), `goldRateLastUpdated` (string | null), `isRateModalOpen` (boolean), `newRateInput` (string).
    *   **Fetch Rate:** In `useEffect` (after user auth check), fetch `current_gold_rate` and `gold_rate_last_updated` from `user_settings` for the logged-in user. Update component state.
    *   **Display:**
        *   Modify the "Current Gold Rate" footer section to display the fetched rate and last updated time.
        *   If rate is null, display "Rate not set" or similar.
        *   Format the "Updated" timestamp appropriately (e.g., "Updated: Today", "Updated: DD/MM/YYYY").
    *   **Update UI:**
        *   The "Update Rate" button should toggle `isRateModalOpen`.
        *   Implement a modal (e.g., using `AlertDialog` or `Dialog` from `components/ui/`) when `isRateModalOpen` is true.
        *   Modal should contain an `Input` for `newRateInput` and "Save" / "Cancel" buttons.
    *   **Save Logic:**
        *   On "Save" in modal:
            *   Validate `newRateInput`.
            *   Call a new Supabase Edge Function `update-user-gold-rate` (or directly update `user_settings` if RLS allows and it's simple enough) with the new rate.
            *   On success, update local state (`currentGoldRate`, `goldRateLastUpdated`), close modal, and show toast.
    *   *Files impacted:* `app/dashboard/page.tsx`, `lib/database.types.ts` (for `user_settings` type).

9.  **Create Gold Rate Page (`app/gold-rate/page.tsx`):**
    *   **State:** `currentGoldRate` (number | null), `goldRateLastUpdated` (string | null), `newRateInput` (string), `isSaving` (boolean).
    *   **Layout:** Basic page structure with a title like "Manage Gold Rate".
    *   **Fetch Rate:** In `useEffect`, fetch `current_gold_rate` and `gold_rate_last_updated` from `user_settings` for the logged-in user. Populate `newRateInput` with the current rate if available.
    *   **Display:** Show the current rate and last updated time.
    *   **Input:** An `Input` field for the new gold rate, pre-filled with `newRateInput`.
    *   **Save Button:**
        *   On click: Validate input.
        *   Call the same Supabase Edge Function `update-user-gold-rate` (or direct DB update).
        *   On success, update local state and show toast.
    *   *Files impacted:* `app/gold-rate/page.tsx` (new file)

**IV. Backend: Update Gold Rate (User Settings)**

10. **Create Supabase Edge Function (Optional) or Direct DB Update Logic for Gold Rate:**
    *   **Function `update-user-gold-rate` (`supabase/functions/update-user-gold-rate/index.ts`):**
        *   Accepts `new_rate` (numeric) and `user_id`.
        *   Updates `current_gold_rate` and `gold_rate_last_updated` (to `now()`) in the `user_settings` table for the given `user_id`.
        *   This function is preferable if there's any additional logic or validation needed beyond simple RLS.
    *   **Direct DB Update (Alternative):** If RLS policies on `user_settings` allow users to update their own `current_gold_rate` and `gold_rate_last_updated`, the frontend can call `supabase.from('user_settings').update(...)` directly.
    *   *Files impacted:* `supabase/functions/update-user-gold-rate/index.ts` (new file, if chosen) or client-side logic in `app/dashboard/page.tsx` and `app/gold-rate/page.tsx`.

**V. Frontend: Settings UI (Notification System)**

11. **Modify Settings Page (`app/settings/page.tsx`):**
    *   Add a new "Notifications" tab/section.
    *   **UI Elements:**
        *   `Switch`: "Enable Browser Notifications".
        *   `Button`: "Send Test Notification".
        *   Status display: "Subscribed since [Date]", "Not Subscribed", "Permission denied", etc.
    *   **Logic:**
        *   Toggle `Switch`: Manage `Notification.requestPermission()`, `subscribeUserToPush()`, `unsubscribeUserFromPush()`, calls to `sendSubscriptionToBackend`/`removeSubscriptionFromBackend`, and update `user_settings.notifications_browser_enabled`.
        *   "Send Test" button: Calls `send-test-notification` Supabase function.
        *   Read initial switch state from `user_settings.notifications_browser_enabled`.
        *   Check `Notification.permission` on load.
    *   *Files impacted:* `app/settings/page.tsx`, `lib/database.types.ts`.

**VI. Environment Variables & Configuration (Notification System)**

12. **Add VAPID Keys:**
    *   `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (client-accessible).
    *   `VAPID_PRIVATE_KEY` (Supabase Edge Function environment variable).
    *   *Files impacted:* `.env`, Supabase project settings.

**c. Database Migrations Required:**

1.  **Create `push_subscriptions` table (Notification System):**
    ```sql
    CREATE TABLE push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        subscription_details JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
        endpoint TEXT UNIQUE NOT NULL,
        CONSTRAINT unique_user_endpoint UNIQUE (user_id, endpoint)
    );

    -- RLS for push_subscriptions:
    ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage their own push subscriptions"
    ON push_subscriptions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Service role can access all push subscriptions"
    ON push_subscriptions
    FOR SELECT
    USING (true); -- Adjust if more specific role is used for backend functions
    ```
    *   *File impacted:* `migrations/XXXXXXXXXXXXXX_add_push_subscriptions_table.sql` (new file)

2.  **Update `user_settings` table (For Notifications & Gold Rate):**
    ```sql
    ALTER TABLE user_settings
    ADD COLUMN notifications_browser_enabled BOOLEAN DEFAULT false,
    ADD COLUMN push_subscription_last_updated TIMESTAMPTZ,
    ADD COLUMN current_gold_rate NUMERIC(10, 2) NULL,
    ADD COLUMN gold_rate_last_updated TIMESTAMPTZ NULL;
    ```
    *   *File impacted:* `migrations/XXXXXXXXXXXXXX_update_user_settings_for_notifications_gold_rate.sql` (new file)

This integrated plan addresses both the notification system and the interactive gold rate feature. The gold rate aspect primarily touches the dashboard, a new `/gold-rate` page, and the `user_settings` table, while leveraging the new `update-user-gold-rate` backend logic.


