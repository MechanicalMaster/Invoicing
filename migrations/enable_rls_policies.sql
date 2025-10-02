-- Enable Row Level Security (RLS) on all tables
-- This migration implements strict security policies to ensure users can only access their own data

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own customers
CREATE POLICY "Users can view their own customers"
ON public.customers
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert only their own customers
CREATE POLICY "Users can insert their own customers"
ON public.customers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own customers
CREATE POLICY "Users can update their own customers"
ON public.customers
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own customers
CREATE POLICY "Users can delete their own customers"
ON public.customers
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- INVOICES TABLE
-- ============================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
ON public.invoices
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
ON public.invoices
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
ON public.invoices
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
ON public.invoices
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- INVOICE ITEMS TABLE
-- ============================================================
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Invoice items should be accessible only if the parent invoice belongs to the user
CREATE POLICY "Users can view their own invoice items"
ON public.invoice_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = invoice_items.invoice_id
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own invoice items"
ON public.invoice_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = invoice_items.invoice_id
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own invoice items"
ON public.invoice_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = invoice_items.invoice_id
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own invoice items"
ON public.invoice_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = invoice_items.invoice_id
    AND invoices.user_id = auth.uid()
  )
);

-- ============================================================
-- STOCK ITEMS TABLE
-- ============================================================
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stock items"
ON public.stock_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock items"
ON public.stock_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock items"
ON public.stock_items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stock items"
ON public.stock_items
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- STOCK CATEGORIES TABLE
-- ============================================================
ALTER TABLE public.stock_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stock categories"
ON public.stock_categories
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock categories"
ON public.stock_categories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock categories"
ON public.stock_categories
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stock categories"
ON public.stock_categories
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- SUPPLIERS TABLE
-- ============================================================
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suppliers"
ON public.suppliers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers"
ON public.suppliers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
ON public.suppliers
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
ON public.suppliers
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- PURCHASE INVOICES TABLE
-- ============================================================
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchase invoices"
ON public.purchase_invoices
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase invoices"
ON public.purchase_invoices
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase invoices"
ON public.purchase_invoices
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase invoices"
ON public.purchase_invoices
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
ON public.bookings
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- USER SETTINGS TABLE
-- ============================================================
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
ON public.user_settings
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- PUSH SUBSCRIPTIONS TABLE (if exists)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'push_subscriptions') THEN
    ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own push subscriptions"
    ON public.push_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own push subscriptions"
    ON public.push_subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own push subscriptions"
    ON public.push_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own push subscriptions"
    ON public.push_subscriptions
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- STORAGE BUCKET POLICIES
-- ============================================================

-- Make storage buckets private (this must be done manually in Supabase Dashboard or via API)
-- Then create policies for the buckets

-- Policy for purchase-invoices bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('purchase-invoices', 'purchase-invoices', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "Users can view their own purchase invoice files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'purchase-invoices'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own purchase invoice files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'purchase-invoices'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own purchase invoice files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'purchase-invoices'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own purchase invoice files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'purchase-invoices'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for stock-item-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('stock_item_images', 'stock_item_images', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "Users can view their own stock item images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'stock_item_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own stock item images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'stock_item_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own stock item images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'stock_item_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own stock item images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'stock_item_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- NOTES
-- ============================================================
-- After running this migration:
-- 1. All tables will have RLS enabled
-- 2. Users can only access their own data
-- 3. Storage buckets are set to private
-- 4. Storage policies enforce user-level access control
-- 5. Test thoroughly by attempting to access another user's data

