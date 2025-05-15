#### Step-by-Step Implementation Plan

1. **Update the Identity Type Options in the Add Customer Form**
   - Modify the "Identity Information" section in the Add Customer form (`app/customers/add/page.tsx`) to include four radio button options under "Identity Type": "PAN Card," "Aadhaar Card," "Others," and "None."
   - Update the `RadioGroup` component to include these options, ensuring the selected value is captured in the form state (managed by `react-hook-form`).
   - Impacted Files:
     - `app/customers/add/page.tsx`
   - Functions/Classes:
     - `RadioGroup` and `RadioGroupItem` components from `components/ui/radio-group.tsx`
     - `useForm` hook from `react-hook-form` for form state management

2. **Add Conditional Fields for "Others" and "None"**
   - Add a new text input field for the reference number (e.g., labeled "Identity Reference Number") that appears only when "Others" is selected.
   - Ensure the existing file upload field (for identity document/photo) is visible and enabled when "PAN Card," "Aadhaar Card," or "Others" is selected, but hidden or disabled when "None" is selected.
   - Use `react-hook-form`’s `watch` method to monitor the `identity_type` field and conditionally render the reference number and upload fields based on the selected value.
   - Update form validation (likely using `zod`) to make the reference number and upload fields required when "Others" is selected, and optional/not required when "None" is selected.
   - Impacted Files:
     - `app/customers/add/page.tsx`
   - Functions/Classes:
     - `useForm` hook (specifically `watch` and `register` methods)
     - `Input` component from `components/ui/input.tsx` for the reference number field
     - `zod` schema for validation (likely inline in `app/customers/add/page.tsx`)

3. **Handle Document/Photo Upload and Storage**
   - Ensure the file upload field supports the requirements (PNG, JPG, PDF, up to 10MB, as shown in the screenshot).
   - Add logic to upload the file to Supabase Storage when the form is submitted (if "PAN Card," "Aadhaar Card," or "Others" is selected), and store the resulting URL in the form data as `identity_doc`.
   - If "None" is selected, ensure no file is uploaded, and `identity_doc` is set to `null`.
   - If a file is uploaded, validate the file type and size before uploading, showing an error toast (using `useToast`) if the file doesn’t meet requirements.
   - Impacted Files:
     - `app/customers/add/page.tsx`
     - `lib/supabase.ts` (for interacting with Supabase Storage)
   - Functions/Classes:
     - Form submission handler in `AddStockPage` (e.g., `handleSubmit`)
     - Supabase Storage API methods (e.g., `supabase.storage.from('identity_docs').upload`)
     - `useToast` hook from `components/ui/use-toast.tsx` for error notifications

4. **Create the Customers Table in Supabase**
   - Define a new `customers` table in Supabase with the existing fields from `lib/database.types.ts` (`id`, `created_at`, `name`, `email`, `phone`, `address`, `notes`, `user_id`), plus new fields:
     - `identity_type` (text, to store "pan_card," "aadhaar_card," "others," or "none")
     - `identity_reference` (text, to store the reference number when "Others" is selected; nullable)
     - `identity_doc` (text, to store the Supabase Storage URL; nullable)
   - Set up row-level security (RLS) policies to ensure users can only access their own customers (based on `user_id` matching the authenticated user’s ID).
   - Impacted Files:
     - None (this is a Supabase schema change)
   - Configuration/Database Migrations:
     - Create a migration script in Supabase:
       ```sql
       CREATE TABLE customers (
         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         name TEXT NOT NULL,
         email TEXT,
         phone TEXT,
         address TEXT,
         notes TEXT,
         user_id UUID NOT NULL REFERENCES auth.users(id),
         identity_type TEXT CHECK (identity_type IN ('pan_card', 'aadhaar_card', 'others', 'none')),
         identity_reference TEXT,
         identity_doc TEXT
       );
       ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
       CREATE POLICY "Users can access their own customers" ON customers
         FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
       ```

5. **Insert Dummy Customer During Initialization**
   - Add a migration script to insert a dummy customer named "First Customer" into the `customers` table.
   - Since `user_id` must reference a valid Supabase Auth user, assume a default user ID for the migration (this may need to be adjusted, or you can insert it programmatically after a user signs up).
   - Set `identity_type` to "none" for the dummy customer, with `identity_reference` and `identity_doc` as `null`.
   - Impacted Files:
     - None (this is a Supabase migration)
   - Configuration/Database Migrations:
     - Add to the migration script:
       ```sql
       INSERT INTO customers (name, user_id, identity_type)
       VALUES ('First Customer', 'default-user-id-uuid', 'none');
       ```
     - Replace `'default-user-id-uuid'` with a valid user ID from `auth.users`, or handle this programmatically.

6. **Update Form Submission to Save to Supabase**
   - Modify the form submission handler in `app/customers/add/page.tsx` to save the customer data to the `customers` table in Supabase.
   - Include the following fields in the submission:
     - `name`, `email`, `phone`, `address`, `notes` (from the form)
     - `user_id` (from the authenticated user via `useAuth`)
     - `identity_type` (one of "pan_card," "aadhaar_card," "others," or "none")
     - `identity_reference` (only if "Others" is selected; otherwise `null`)
     - `identity_doc` (URL from Supabase Storage if a file is uploaded; otherwise `null`)
   - Show a success toast notification on successful save, or an error toast on failure.
   - Impacted Files:
     - `app/customers/add/page.tsx`
     - `lib/supabase.ts`
   - Functions/Classes:
     - Form submission handler in `AddStockPage` (e.g., `handleSubmit`)
     - `supabase.from('customers').insert` method
     - `useToast` hook for notifications

7. **Implement Edit Customer Functionality**
   - Update the edit customer page (`app/customers/[id]/edit/page.tsx`) to fetch the customer record from Supabase using the customer `id` from the URL.
   - Prepopulate the form with the customer’s data, including `identity_type`, `identity_reference`, and `identity_doc`.
   - Apply the same conditional logic as in the add page: show the reference number and upload fields if `identity_type` is "pan_card," "aadhaar_card," or "others," and hide them if it’s "none."
   - Allow updating the customer record, including uploading a new document (replace the existing one in Supabase Storage if it exists).
   - Save the updated record to Supabase and show a success/error toast.
   - Impacted Files:
     - `app/customers/[id]/edit/page.tsx`
     - `lib/supabase.ts`
   - Functions/Classes:
     - Fetch logic (e.g., `supabase.from('customers').select`)
     - Update logic (e.g., `supabase.from('customers').update`)
     - `useToast` hook for notifications

8. **Implement Delete Customer Functionality**
   - Add a "Delete" button to the customer details page (`app/customers/[id]/page.tsx`).
   - Use the `AlertDialog` component to show a confirmation dialog before deleting.
   - On confirmation, delete the customer record from Supabase and the associated `identity_doc` file from Supabase Storage (if it exists).
   - Redirect to the customers list page (`app/customers/page.tsx`) after deletion, showing a success toast.
   - Impacted Files:
     - `app/customers/[id]/page.tsx`
     - `lib/supabase.ts`
   - Functions/Classes:
     - `AlertDialog` component from `components/ui/alert-dialog.tsx`
     - Delete logic (e.g., `supabase.from('customers').delete`)
     - `supabase.storage.from('identity_docs').remove` (to delete the file)
     - `useToast` hook for notifications

9. **Update Database Types**
   - Update the `lib/database.types.ts` file to reflect the new fields (`identity_type`, `identity_reference`, `identity_doc`) in the `customers` table schema.
   - Add the `identity_type` field with a union type of `'pan_card' | 'aadhaar_card' | 'others' | 'none'`.
   - Ensure `identity_reference` and `identity_doc` are nullable (type `string | null`).
   - Impacted Files:
     - `lib/database.types.ts`
   - Functions/Classes:
     - `Database` interface (update the `customers` table definition)

10. **Ensure Consistent Styling and Accessibility**
    - Ensure the updated "Identity Information" section (with new radio options and conditional fields) follows the app’s styling conventions (e.g., Tailwind CSS classes from `styles/globals.css`).
    - Use consistent spacing and layout (e.g., `space-y-4` for form fields, `grid grid-cols-1 md:grid-cols-2` for responsiveness, as seen in `app/bookings/create/page.tsx`).
    - Verify that all form fields are accessible (e.g., proper `Label` associations, ARIA attributes for conditional fields).
    - Impacted Files:
      - `app/customers/add/page.tsx`
      - `app/customers/[id]/edit/page.tsx`
    - Functions/Classes:
      - None directly; relies on Tailwind CSS and UI components

#### Configuration or Database Migrations Required

- **Database Migrations**:
  - Create the `customers` table in Supabase with the specified schema and RLS policies (Step 4).
  - Insert the dummy customer "First Customer" with `identity_type` set to "none" (Step 5).
  - Set up a Supabase Storage bucket for identity documents (e.g., named `identity_docs`) with appropriate permissions (e.g., users can upload and delete their own files).

- **Configuration**:
  - Update `lib/database.types.ts` to reflect the new table schema (Step 9).
  - No changes to `next.config.mjs`, `tailwind.config.js`, `postcss.config.mjs`, or `tsconfig.json` are required.

#### Notes on Architecture and Conventions

- The plan aligns with the codebase’s use of `react-hook-form` for form management and conditional rendering, as seen in `app/bookings/create/page.tsx`.
- Supabase Auth integration follows the pattern in `components/auth-provider.tsx`, ensuring `user_id` is tied to the authenticated user.
- The `toast` notification system is reused for user feedback, consistent with other pages (e.g., `app/bookings/create/page.tsx`).
- UI components (`RadioGroup`, `AlertDialog`, `Input`) and styling (Tailwind CSS) maintain consistency with the app’s patterns.
- Storing files in Supabase Storage with URLs in the database is a scalable approach and aligns with best practices.
- The conditional logic for "Others" and "None" ensures a clean user experience while maintaining form validation integrity.