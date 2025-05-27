-- Migration: Remove Making Charges columns
-- Description: Removes the making_charges column from invoice_items and total_making_charges from invoices table

-- Drop making_charges column from invoice_items table
ALTER TABLE invoice_items DROP COLUMN IF EXISTS making_charges;

-- Drop total_making_charges column from invoices table
ALTER TABLE invoices DROP COLUMN IF EXISTS total_making_charges; 