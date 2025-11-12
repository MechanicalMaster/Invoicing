use anyhow::Result;
use rusqlite::Connection;

/// Create all database tables
pub fn create_tables(conn: &Connection) -> Result<()> {
    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON", [])?;

    // User settings table (single row for local user)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            user_id TEXT NOT NULL DEFAULT 'local',

            -- Firm details
            firm_name TEXT,
            firm_address TEXT,
            firm_phone TEXT,
            firm_email TEXT,
            firm_website TEXT,
            firm_gstin TEXT,
            firm_establishment_date TEXT,

            -- Invoice settings
            invoice_default_prefix TEXT DEFAULT 'INV-',
            invoice_next_number INTEGER DEFAULT 1,
            invoice_default_notes TEXT,
            invoice_custom_data TEXT,

            -- Label settings
            label_type TEXT DEFAULT 'standard',
            label_include_barcode INTEGER DEFAULT 1,
            label_include_qr_code INTEGER DEFAULT 1,
            label_include_weight INTEGER DEFAULT 1,
            label_include_price INTEGER DEFAULT 1,
            label_include_metal INTEGER DEFAULT 1,
            label_qr_error_correction TEXT DEFAULT 'M',
            label_copies INTEGER DEFAULT 1,

            -- Photo settings
            photo_compression_level TEXT DEFAULT 'medium',

            -- Notification settings
            notifications_email_enabled INTEGER DEFAULT 0,
            notifications_sms_enabled INTEGER DEFAULT 0,
            notifications_frequency TEXT DEFAULT 'instant',

            -- Cloud sync settings
            sync_enabled INTEGER DEFAULT 0,
            sync_mode TEXT DEFAULT 'disabled',
            supabase_url TEXT,
            supabase_anon_key TEXT,
            last_sync_at TEXT,

            -- AI settings
            openai_api_key_stored INTEGER DEFAULT 0,

            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Customers table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            identity_type TEXT DEFAULT 'none',
            identity_reference TEXT,
            identity_doc TEXT,
            referred_by TEXT,
            referral_notes TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            synced INTEGER DEFAULT 0,
            last_synced_at TEXT
        )",
        [],
    )?;

    // Suppliers table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS suppliers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            contact_person TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            synced INTEGER DEFAULT 0,
            last_synced_at TEXT
        )",
        [],
    )?;

    // Stock items table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS stock_items (
            id TEXT PRIMARY KEY,
            item_number TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL,
            material TEXT NOT NULL,
            weight REAL NOT NULL,
            purity TEXT,
            purchase_price REAL NOT NULL,
            description TEXT,
            supplier TEXT,
            purchase_date TEXT,
            is_sold INTEGER DEFAULT 0,
            sold_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            synced INTEGER DEFAULT 0,
            last_synced_at TEXT
        )",
        [],
    )?;

    // Stock item images table (separate for better management)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS stock_item_images (
            id TEXT PRIMARY KEY,
            stock_item_id TEXT NOT NULL,
            original_path TEXT NOT NULL,
            display_path TEXT NOT NULL,
            thumbnail_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            width INTEGER,
            height INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            synced INTEGER DEFAULT 0,
            cloud_url TEXT,
            FOREIGN KEY (stock_item_id) REFERENCES stock_items(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Invoices table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            invoice_number TEXT NOT NULL UNIQUE,
            invoice_date TEXT NOT NULL,
            customer_id TEXT,

            -- Customer snapshot
            customer_name_snapshot TEXT NOT NULL,
            customer_phone_snapshot TEXT,
            customer_email_snapshot TEXT,
            customer_address_snapshot TEXT,

            -- Firm snapshot
            firm_name_snapshot TEXT NOT NULL,
            firm_address_snapshot TEXT,
            firm_phone_snapshot TEXT,
            firm_gstin_snapshot TEXT,

            -- Financial details
            subtotal REAL NOT NULL,
            gst_percentage REAL NOT NULL,
            gst_amount REAL NOT NULL,
            grand_total REAL NOT NULL,

            status TEXT DEFAULT 'draft',
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            synced INTEGER DEFAULT 0,
            last_synced_at TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )",
        [],
    )?;

    // Invoice items table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS invoice_items (
            id TEXT PRIMARY KEY,
            invoice_id TEXT NOT NULL,
            name TEXT NOT NULL,
            quantity REAL NOT NULL,
            weight REAL NOT NULL,
            price_per_gram REAL NOT NULL,
            total REAL NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Purchase invoices table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS purchase_invoices (
            id TEXT PRIMARY KEY,
            purchase_number TEXT NOT NULL UNIQUE,
            invoice_number TEXT NOT NULL,
            invoice_date TEXT NOT NULL,
            supplier_id TEXT,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'Received',
            payment_status TEXT DEFAULT 'Unpaid',
            number_of_items INTEGER,
            notes TEXT,
            invoice_file_path TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            synced INTEGER DEFAULT 0,
            last_synced_at TEXT,
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        )",
        [],
    )?;

    // AI chat sessions table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ai_chat_sessions (
            id TEXT PRIMARY KEY,
            title TEXT,
            mode TEXT DEFAULT 'general',
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // AI chat messages table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ai_chat_messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            mode TEXT,
            tokens_used INTEGER,
            metadata TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // AI actions table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ai_actions (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            action_type TEXT NOT NULL,
            status TEXT NOT NULL,
            extracted_data TEXT,
            missing_fields TEXT,
            validation_errors TEXT,
            entity_id TEXT,
            error_message TEXT,
            executed_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id)
        )",
        [],
    )?;

    // Voice transcriptions table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS voice_transcriptions (
            id TEXT PRIMARY KEY,
            audio_file_path TEXT NOT NULL,
            transcribed_text TEXT NOT NULL,
            language TEXT,
            duration_seconds REAL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Audit logs table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            entity TEXT NOT NULL,
            action TEXT NOT NULL,
            entity_id TEXT,
            success INTEGER NOT NULL DEFAULT 1,
            metadata TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Sync queue table (for tracking pending syncs)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            operation TEXT NOT NULL,
            data TEXT NOT NULL,
            retry_count INTEGER DEFAULT 0,
            last_error TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Create indexes for better performance
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_stock_items_item_number ON stock_items(item_number)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_stock_items_is_sold ON stock_items(is_sold)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_stock_item_images_stock_item_id ON stock_item_images(stock_item_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_ai_messages_session_id ON ai_chat_messages(session_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id)",
        [],
    )?;

    Ok(())
}
