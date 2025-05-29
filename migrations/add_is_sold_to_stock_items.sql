-- Add is_sold and sold_at columns to stock_items table
ALTER TABLE stock_items
ADD COLUMN is_sold BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN sold_at TIMESTAMPTZ NULL;

-- Create an index for faster querying of sold items
CREATE INDEX idx_stock_items_is_sold ON stock_items (is_sold); 