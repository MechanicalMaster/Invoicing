-- Migration: Add atomic operation functions for transactional integrity
-- Date: 2025-01-30
-- Purpose: Ensure multi-step operations (file + database) are atomic

-- ============================================
-- 1. INVOICE CREATION WITH ITEMS (ATOMIC)
-- ============================================

create or replace function create_invoice_with_items(
    p_user_id uuid,
    p_customer_id uuid,
    p_customer_name_snapshot text,
    p_customer_phone_snapshot text,
    p_customer_email_snapshot text,
    p_customer_address_snapshot text,
    p_firm_name_snapshot text,
    p_firm_address_snapshot text,
    p_firm_phone_snapshot text,
    p_firm_gstin_snapshot text,
    p_invoice_date date,
    p_subtotal numeric,
    p_gst_percentage numeric,
    p_gst_amount numeric,
    p_grand_total numeric,
    p_status text,
    p_notes text,
    p_items jsonb -- Array of items: [{name, quantity, weight, price_per_gram, total}]
)
returns table(invoice_id uuid, invoice_number text) as $$
declare
    v_invoice_id uuid;
    v_invoice_number text;
    v_next_number int;
    v_prefix text;
    v_item jsonb;
begin
    -- Get next invoice number (with lock to prevent race conditions)
    select invoice_next_number, invoice_default_prefix
    into v_next_number, v_prefix
    from public.user_settings
    where user_id = p_user_id
    for update; -- Lock the row

    if v_next_number is null then
        raise exception 'User settings not found';
    end if;

    -- Generate invoice number
    v_invoice_number := v_prefix || lpad(v_next_number::text, 4, '0');

    -- Insert invoice
    insert into public.invoices (
        user_id,
        customer_id,
        customer_name_snapshot,
        customer_phone_snapshot,
        customer_email_snapshot,
        customer_address_snapshot,
        firm_name_snapshot,
        firm_address_snapshot,
        firm_phone_snapshot,
        firm_gstin_snapshot,
        invoice_number,
        invoice_date,
        subtotal,
        gst_percentage,
        gst_amount,
        grand_total,
        status,
        notes
    ) values (
        p_user_id,
        p_customer_id,
        p_customer_name_snapshot,
        p_customer_phone_snapshot,
        p_customer_email_snapshot,
        p_customer_address_snapshot,
        p_firm_name_snapshot,
        p_firm_address_snapshot,
        p_firm_phone_snapshot,
        p_firm_gstin_snapshot,
        v_invoice_number,
        p_invoice_date,
        p_subtotal,
        p_gst_percentage,
        p_gst_amount,
        p_grand_total,
        p_status,
        p_notes
    ) returning id into v_invoice_id;

    -- Insert all invoice items
    for v_item in select * from jsonb_array_elements(p_items)
    loop
        insert into public.invoice_items (
            invoice_id,
            user_id,
            name,
            quantity,
            weight,
            price_per_gram,
            total
        ) values (
            v_invoice_id,
            p_user_id,
            v_item->>'name',
            (v_item->>'quantity')::numeric,
            (v_item->>'weight')::numeric,
            (v_item->>'price_per_gram')::numeric,
            (v_item->>'total')::numeric
        );
    end loop;

    -- Increment invoice number
    update public.user_settings
    set invoice_next_number = v_next_number + 1
    where user_id = p_user_id;

    return query select v_invoice_id, v_invoice_number;
end;
$$ language plpgsql security definer;

-- ============================================
-- 2. CUSTOMER DELETION WITH FILE CLEANUP
-- ============================================

create or replace function delete_customer_with_cleanup(
    p_user_id uuid,
    p_customer_id uuid
)
returns table(identity_doc_path text) as $$
declare
    v_identity_doc text;
    v_invoice_count int;
begin
    -- Check for existing invoices
    select count(*) into v_invoice_count
    from public.invoices
    where customer_id = p_customer_id
    and user_id = p_user_id;

    if v_invoice_count > 0 then
        raise exception 'Cannot delete customer with existing invoices';
    end if;

    -- Get identity doc path before deletion
    select identity_doc into v_identity_doc
    from public.customers
    where id = p_customer_id
    and user_id = p_user_id;

    -- Delete customer
    delete from public.customers
    where id = p_customer_id
    and user_id = p_user_id;

    if not found then
        raise exception 'Customer not found';
    end if;

    -- Return the file path so the API can delete it from storage
    return query select v_identity_doc;
end;
$$ language plpgsql security definer;

-- ============================================
-- 3. STOCK ITEM DELETION WITH FILE CLEANUP
-- ============================================

create or replace function delete_stock_item_with_cleanup(
    p_user_id uuid,
    p_item_id uuid
)
returns table(image_paths text[]) as $$
declare
    v_image_urls text[];
begin
    -- Get image URLs before deletion
    select image_urls into v_image_urls
    from public.stock_items
    where id = p_item_id
    and user_id = p_user_id;

    -- Delete stock item
    delete from public.stock_items
    where id = p_item_id
    and user_id = p_user_id;

    if not found then
        raise exception 'Stock item not found';
    end if;

    -- Return the file paths so the API can delete them from storage
    return query select v_image_urls;
end;
$$ language plpgsql security definer;

-- ============================================
-- 4. PURCHASE INVOICE DELETION WITH FILE CLEANUP
-- ============================================

create or replace function delete_purchase_invoice_with_cleanup(
    p_user_id uuid,
    p_invoice_id uuid
)
returns table(file_path text) as $$
declare
    v_file_url text;
begin
    -- Get file URL before deletion
    select invoice_file_url into v_file_url
    from public.purchase_invoices
    where id = p_invoice_id
    and user_id = p_user_id;

    -- Delete purchase invoice
    delete from public.purchase_invoices
    where id = p_invoice_id
    and user_id = p_user_id;

    if not found then
        raise exception 'Purchase invoice not found';
    end if;

    -- Return the file path so the API can delete it from storage
    return query select v_file_url;
end;
$$ language plpgsql security definer;

-- ============================================
-- 5. CHAT SESSION CREATION (ATOMIC)
-- ============================================

create or replace function create_new_chat_session(
    p_user_id uuid,
    p_title text
)
returns uuid as $$
declare
    v_session_id uuid;
begin
    -- Deactivate all existing sessions for this user
    update public.ai_chat_sessions
    set is_active = false
    where user_id = p_user_id
    and is_active = true;

    -- Create new active session
    insert into public.ai_chat_sessions (
        user_id,
        title,
        is_active
    ) values (
        p_user_id,
        p_title,
        true
    ) returning id into v_session_id;

    return v_session_id;
end;
$$ language plpgsql security definer;

-- ============================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================

grant execute on function create_invoice_with_items to authenticated;
grant execute on function delete_customer_with_cleanup to authenticated;
grant execute on function delete_stock_item_with_cleanup to authenticated;
grant execute on function delete_purchase_invoice_with_cleanup to authenticated;
grant execute on function create_new_chat_session to authenticated;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

comment on function create_invoice_with_items is 'Atomically creates an invoice with items and increments invoice number';
comment on function delete_customer_with_cleanup is 'Deletes customer and returns identity doc path for cleanup';
comment on function delete_stock_item_with_cleanup is 'Deletes stock item and returns image paths for cleanup';
comment on function delete_purchase_invoice_with_cleanup is 'Deletes purchase invoice and returns file path for cleanup';
comment on function create_new_chat_session is 'Atomically creates new chat session and deactivates old ones';
