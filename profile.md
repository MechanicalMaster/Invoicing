### Planning Phase

#### Step-by-Step Implementation Plan

1. **Create the `profiles` Table in Supabase**  
   - Create a new `profiles` table in Supabase to store user profile information. Include fields: `id` (UUID, primary key), `updated_at` (timestamp), `full_name` (text, nullable), `avatar_url` (text, nullable), `phone_number` (text, nullable), and `email_address` (text, nullable).  
   - Set up row-level security (RLS) policies to ensure users can only access their own profile (based on `id` matching the authenticated user’s ID from Supabase Auth).  
   - Impacted Files:  
     - None (this is a Supabase schema change).  
   - Configuration/Database Migrations:  
     - Create a migration script in Supabase:  
       ```sql
       CREATE TABLE profiles (
         id UUID PRIMARY KEY,
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         full_name TEXT,
         avatar_url TEXT,
         phone_number TEXT,
         email_address TEXT
       );
       ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
       CREATE POLICY "Users can access their own profile" ON profiles
         FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
       ```

2. **Update the `profiles` Table Schema in the Codebase**  
   - Update the `profiles` table definition in `lib/database.types.ts` to include the new fields `phone_number` and `email_address` (both as `string | null`). The existing fields (`id`, `updated_at`, `full_name`, `avatar_url`) are already defined correctly.  
   - Impacted Files:  
     - `lib/database.types.ts`  
   - Functions/Classes:  
     - `Database` interface (update the `profiles` table definition).  

3. **Remove the "Appearance" Section and Theme Selection Functionality**  
   - In `app/profile/page.tsx`, remove the "Appearance" tab from the `Tabs` component (likely used based on the screenshot and similar patterns in `app/bookings/page.tsx`).  
   - Remove any associated UI components for theme selection, such as `ThemeSelector` (likely `components/ui/theme-selector.tsx`) or related form fields.  
   - Delete the `components/ui/theme-selector.tsx` file since theme selection is no longer needed.  
   - Remove the `theme` and `setTheme` state management from `components/theme-provider.tsx`, and hardcode the theme to "slate" (the default theme). Update the `ThemeProvider` to apply the "slate" theme directly without user selection.  
   - Clear any `localStorage` entries for "ui-theme" on app load to ensure consistency with the default theme.  
   - Impacted Files:  
     - `app/profile/page.tsx`  
     - `components/theme-provider.tsx`  
     - `components/ui/theme-selector.tsx` (to be deleted).  
   - Functions/Classes:  
     - `Tabs`, `TabsContent`, `TabsTrigger` in `app/profile/page.tsx`.  
     - `ThemeProvider`, `useTheme` in `components/theme-provider.tsx`.  

4. **Merge "Change Password" into the "Profile Information" Form**  
   - In `app/profile/page.tsx`, remove the "Change Password" tab from the `Tabs` component, and integrate its fields ("Current Password," "New Password," "Confirm New Password") into the "Profile Information" form (likely a `Card` component).  
   - Add the password fields as part of the existing form, using `react-hook-form` to manage the state of all fields (profile and password fields together).  
   - Ensure the form uses a single submission handler to save both profile updates and password changes.  
   - Add validation for password fields (e.g., minimum length for "New Password," matching "New Password" and "Confirm New Password") using `zod` (as inferred from `package.json`).  
   - Impacted Files:  
     - `app/profile/page.tsx`  
   - Functions/Classes:  
     - `Tabs`, `TabsContent`, `TabsTrigger` in `app/profile/page.tsx`.  
     - `useForm` hook from `react-hook-form` for form management.  
     - `Input` component from `components/ui/input.tsx` for password fields.  

5. **Remove Specified Fields from "Profile Information"**  
   - In `app/profile/page.tsx`, remove the form fields for "Business Name," "Address," "GSTIN," and "PAN Number" from the "Profile Information" section.  
   - Update the `react-hook-form` schema (likely using `zod`) to exclude these fields from validation and form data.  
   - Ensure the remaining fields ("Full Name," "Phone Number," "Email Address") are retained and properly bound to the form.  
   - Impacted Files:  
     - `app/profile/page.tsx`  
   - Functions/Classes:  
     - Form schema definition (likely in `app/profile/page.tsx`).  
     - `useForm` hook configuration.  

6. **Fetch and Save Profile Data to Supabase**  
   - In `app/profile/page.tsx`, add logic to fetch the user’s profile data from the `profiles` table on page load, using the authenticated user’s ID (`auth.uid()`). Populate the form fields ("Full Name," "Phone Number," "Email Address") with this data.  
   - If no profile exists, create a new record in the `profiles` table with the user’s ID and default values (e.g., `null` for all fields).  
   - Update the form submission handler to save the profile data (`full_name`, `phone_number`, `email_address`) to the `profiles` table using `supabase.from('profiles').upsert`.  
   - Impacted Files:  
     - `app/profile/page.tsx`  
     - `lib/supabase.ts`  
   - Functions/Classes:  
     - Fetch logic (e.g., `supabase.from('profiles').select`).  
     - Save logic (e.g., `supabase.from('profiles').upsert`).  

7. **Implement Password Update Logic**  
   - In the form submission handler in `app/profile/page.tsx`, add logic to update the user’s password using Supabase Auth (`supabase.auth.updateUser`) if the password fields are filled.  
   - Validate that "New Password" and "Confirm New Password" match before submission, and show an error toast (using `useToast`) if they don’t.  
   - Show a success toast on successful password update, or an error toast on failure.  
   - Impacted Files:  
     - `app/profile/page.tsx`  
     - `lib/supabase.ts`  
   - Functions/Classes:  
     - `handleSubmit` function in `app/profile/page.tsx`.  
     - `supabase.auth.updateUser` method.  
     - `useToast` hook from `components/ui/use-toast.tsx`.  

8. **Ensure Consistent Styling and Layout**  
   - In `app/profile/page.tsx`, ensure the merged form (with "Profile Information" and "Change Password" fields) uses consistent Tailwind CSS classes (e.g., `space-y-4` for form fields, `grid grid-cols-1 md:grid-cols-2` for layout, as seen in `app/bookings/create/page.tsx`).  
   - Verify that the form aligns with the app’s theme (now hardcoded to "slate") and maintains accessibility (e.g., proper `Label` and `Input` associations).  
   - Impacted Files:  
     - `app/profile/page.tsx`  
   - Functions/Classes:  
     - None directly; relies on Tailwind CSS and `Card`, `Input`, `Label` components.  

#### Configuration or Database Migrations Required

- **Database Migrations**:  
  - Create the `profiles` table in Supabase with the specified schema and RLS policies (Step 1).  
  - No additional migrations are required since the removed fields ("Business Name," "Address," "GSTIN," "PAN Number") were not part of the schema.  

- **Configuration**:  
  - Update `lib/database.types.ts` to reflect the new `profiles` table schema with `phone_number` and `email_address` (Step 2).  
  - No changes to `next.config.mjs`, `tailwind.config.js`, `postcss.config.mjs`, or `tsconfig.json` are required.  

#### Notes on Architecture and Conventions

- The plan aligns with the codebase’s use of `react-hook-form` and `zod` for form management and validation, as inferred from `package.json` and patterns in `app/bookings/create/page.tsx`.  
- Supabase Auth integration follows the pattern in `components/auth-provider.tsx`, ensuring profile data is tied to the authenticated user’s ID.  
- The `toast` notification system is reused for user feedback, consistent with other pages (e.g., `app/bookings/create/page.tsx`).  
- UI components (`Tabs`, `Card`, `Input`, `Label`) and styling (Tailwind CSS) maintain consistency with the app’s patterns.  
- Hardcoding the theme to "slate" ensures the app retains its visual consistency without user-configurable themes.  
- The merged form design ensures a streamlined user experience by combining profile updates and password changes into a single submission action.