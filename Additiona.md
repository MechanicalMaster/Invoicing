
#### Step-by-Step Implementation Plan

1. **Update the Form Structure in the Add Stock Page**
   - Modify the `app/stock/add/page.tsx` file to combine the "Detailed Specifications" and "Images" sections into a single `Card` component titled "Stock Details."
   - Remove the separate `Card` components (or form groups) for "Detailed Specifications" and "Images."
   - Create a new `Card` component with a `CardHeader` (title: "Stock Details") and `CardContent` containing all fields from both sections, except the fields to be removed.
   - Ensure the form continues to use `react-hook-form` for state management and validation, integrating all remaining fields (e.g., stock name, category, quantity, image uploads) into the unified section.
   - Impacted Files:
     - `app/stock/add/page.tsx`
     - Potentially `components/ui/card.tsx` (if custom props or styling are needed, though likely reusable as-is)
   - Functions/Classes:
     - Main `AddStockPage` component in `app/stock/add/page.tsx`
     - `useForm` hook from `react-hook-form` for form management

2. **Remove Specified Fields from the Form**
   - Identify and remove the form fields for "Making Charges (₹)" (`makingCharges`), "Selling Price (₹) *" (`sellingPrice`), and "Storage Location" (`storageLocation`) from the form in `app/stock/add/page.tsx`.
   - Update the `react-hook-form` schema (likely using `zod` for validation, as seen in `package.json`) to exclude these fields from the form data and validation rules.
   - Remove any corresponding state management logic (e.g., `useState` or `useForm` field bindings) and UI elements (e.g., `Input` components) for these fields.
   - Ensure any calculations or derived values (e.g., total cost) that depended on these fields are either removed or adjusted to work without them.
   - Impacted Files:
     - `app/stock/add/page.tsx`
   - Functions/Classes:
     - Form schema definition (likely in `app/stock/add/page.tsx` or a separate utility file)
     - `useForm` hook configuration

3. **Integrate Image Upload Fields into the Merged Section**
   - Move the image upload field(s) (likely a file input or component like `Input` for file uploads) from the "Images" section to the new "Stock Details" `Card`.
   - Preserve existing image upload behavior, including any preview functionality (e.g., similar to `app/stock/[id]/image-gallery.tsx` if used).
   - Ensure the image field is properly registered with `react-hook-form` and maintains any existing validation (e.g., file type or size limits).
   - Adjust styling to ensure the image upload field integrates seamlessly with other form fields in the `CardContent` (e.g., consistent spacing, grid layout if used).
   - Impacted Files:
     - `app/stock/add/page.tsx`
     - Potentially `app/stock/[id]/image-gallery.tsx` (if shared components or logic are reused)
   - Functions/Classes:
     - Image upload handling logic in `AddStockPage`

4. **Update Form Submission Logic**
   - Adjust the form submission handler in `app/stock/add/page.tsx` to exclude the removed fields (`makingCharges`, `sellingPrice`, `storageLocation`) from the data sent to the API (if applicable).
   - Verify that the submission logic (likely using a `toast` notification for success, as seen in `app/bookings/create/page.tsx`) remains functional and provides appropriate feedback.
   - If the backend API expects these fields, ensure the submission payload omits them without breaking the API contract (assumed flexible based on your confirmation).
   - Impacted Files:
     - `app/stock/add/page.tsx`
     - Potentially `lib/utils.ts` (if shared form utilities are used)
   - Functions/Classes:
     - `handleSubmit` function in `AddStockPage`

5. **Ensure Consistent Styling and Layout**
   - Apply consistent Tailwind CSS classes (as defined in `styles/globals.css` and `tailwind.config.js`) to the merged "Stock Details" `Card` to match the styling of other form sections in the app (e.g., `app/bookings/create/page.tsx`).
   - Use a grid or flex layout within `CardContent` to organize form fields (e.g., `grid grid-cols-1 md:grid-cols-2` for responsiveness, as seen in other pages).
   - Verify that the merged section aligns with the app’s theme (e.g., using `data-theme` from `components/theme-provider.tsx`) and maintains accessibility (e.g., proper `Label` and `Input` associations).
   - Impacted Files:
     - `app/stock/add/page.tsx`
     - `styles/globals.css` (if new utility classes are needed, though unlikely)
   - Functions/Classes:
     - None directly; relies on Tailwind CSS and `Card` component

6. **Update Validation Schema (if Separate)**
   - If the form validation schema is defined in a separate file (e.g., a utility in `lib/` or a dedicated schema file), update it to remove `makingCharges`, `sellingPrice`, and `storageLocation` from the `zod` schema.
   - Ensure all remaining fields (e.g., stock name, category, quantity, images) retain their validation rules (e.g., required fields, file type checks for images).
   - Impacted Files:
     - `app/stock/add/page.tsx` (if schema is inline)
     - Potentially a new or existing file in `lib/` (e.g., `lib/stockSchema.ts` if modularized)
   - Functions/Classes:
     - `zod` schema definition

7. **Test and Verify Form Behavior**
   - Test the updated form to ensure all fields in the "Stock Details" section (except the removed ones) are correctly bound to `react-hook-form` and submit properly.
   - Verify that image uploads work as expected and integrate with the form submission payload.
   - Confirm that removing the specified fields does not break any UI or functionality (e.g., no console errors, no missing required fields causing submission failures).
   - Ensure toast notifications (via `components/ui/toast.tsx` and `hooks/use-toast.ts`) display appropriately on form submission success or validation errors.
   - Impacted Files:
     - `app/stock/add/page.tsx`
     - `components/ui/toast.tsx` (reused, no changes needed)
     - `hooks/use-toast.ts` (reused, no changes needed)
   - Functions/Classes:
     - `handleSubmit` and form rendering logic in `AddStockPage`

#### Configuration or Database Migrations Required

- **Configuration**:
  - No changes to `next.config.mjs`, `tailwind.config.js`, `postcss.config.mjs`, or `tsconfig.json` are required, as the changes are limited to the React component and form logic.
  - If a new validation schema file is created (e.g., `lib/stockSchema.ts`), ensure it’s included in the TypeScript compilation via `tsconfig.json` (already covered by `"include": ["**/*.ts"]`).

#### Notes on Architecture and Conventions

- The plan adheres to the codebase’s use of `react-hook-form` and `zod` for form management and validation, as seen in similar pages like `app/bookings/create/page.tsx`.
- Tailwind CSS classes and `Card` components are reused to maintain consistency with the app’s UI patterns (e.g., `grid`, `space-y`, `bg-background`).
- The `toast` notification system (via `components/ui/toast.tsx` and `hooks/use-toast.ts`) is leveraged for user feedback, following the pattern in `app/bookings/create/page.tsx`.
- Legacy data handling ensures compatibility with existing stock items, aligning with the app’s approach to displaying data (e.g., `app/bookings/page.tsx` ignores irrelevant fields).
- The changes are confined to the frontend, with no assumed backend dependencies, per your confirmation.
