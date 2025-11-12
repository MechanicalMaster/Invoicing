use anyhow::{Context, Result};
use rusqlite::{params, Connection, Row};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserSettings {
    pub id: i32,
    pub user_id: String,
    pub firm_name: Option<String>,
    pub firm_address: Option<String>,
    pub firm_phone: Option<String>,
    pub firm_email: Option<String>,
    pub firm_website: Option<String>,
    pub firm_gstin: Option<String>,
    pub firm_establishment_date: Option<String>,
    pub invoice_default_prefix: Option<String>,
    pub invoice_next_number: Option<i32>,
    pub invoice_default_notes: Option<String>,
    pub sync_enabled: bool,
    pub sync_mode: Option<String>,
    pub openai_api_key_stored: bool,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Customer {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub identity_type: Option<String>,
    pub identity_reference: Option<String>,
    pub identity_doc: Option<String>,
    pub referred_by: Option<String>,
    pub referral_notes: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StockItem {
    pub id: String,
    pub item_number: String,
    pub category: String,
    pub material: String,
    pub weight: f64,
    pub purity: Option<String>,
    pub purchase_price: f64,
    pub description: Option<String>,
    pub supplier: Option<String>,
    pub purchase_date: Option<String>,
    pub is_sold: bool,
    pub sold_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Invoice {
    pub id: String,
    pub invoice_number: String,
    pub invoice_date: String,
    pub customer_id: Option<String>,
    pub customer_name_snapshot: String,
    pub customer_phone_snapshot: Option<String>,
    pub customer_email_snapshot: Option<String>,
    pub customer_address_snapshot: Option<String>,
    pub firm_name_snapshot: String,
    pub firm_address_snapshot: Option<String>,
    pub firm_phone_snapshot: Option<String>,
    pub firm_gstin_snapshot: Option<String>,
    pub subtotal: f64,
    pub gst_percentage: f64,
    pub gst_amount: f64,
    pub grand_total: f64,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InvoiceItem {
    pub id: String,
    pub invoice_id: String,
    pub name: String,
    pub quantity: f64,
    pub weight: f64,
    pub price_per_gram: f64,
    pub total: f64,
    pub created_at: String,
}

// ===== User Settings Operations =====

pub fn get_user_settings(conn: &Connection) -> Result<Option<UserSettings>> {
    let mut stmt = conn.prepare(
        "SELECT id, user_id, firm_name, firm_address, firm_phone, firm_email, firm_website,
                firm_gstin, firm_establishment_date, invoice_default_prefix, invoice_next_number,
                invoice_default_notes, sync_enabled, sync_mode, openai_api_key_stored, updated_at
         FROM user_settings WHERE id = 1",
    )?;

    let result = stmt.query_row([], |row| {
        Ok(UserSettings {
            id: row.get(0)?,
            user_id: row.get(1)?,
            firm_name: row.get(2)?,
            firm_address: row.get(3)?,
            firm_phone: row.get(4)?,
            firm_email: row.get(5)?,
            firm_website: row.get(6)?,
            firm_gstin: row.get(7)?,
            firm_establishment_date: row.get(8)?,
            invoice_default_prefix: row.get(9)?,
            invoice_next_number: row.get(10)?,
            invoice_default_notes: row.get(11)?,
            sync_enabled: row.get::<_, i32>(12)? != 0,
            sync_mode: row.get(13)?,
            openai_api_key_stored: row.get::<_, i32>(14)? != 0,
            updated_at: row.get(15)?,
        })
    });

    match result {
        Ok(settings) => Ok(Some(settings)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.into()),
    }
}

pub fn upsert_user_settings(conn: &Connection, settings: &UserSettings) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO user_settings (
            id, user_id, firm_name, firm_address, firm_phone, firm_email, firm_website,
            firm_gstin, firm_establishment_date, invoice_default_prefix, invoice_next_number,
            invoice_default_notes, sync_enabled, sync_mode, openai_api_key_stored, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, CURRENT_TIMESTAMP)",
        params![
            1, // Always id = 1 for single-user local app
            &settings.user_id,
            &settings.firm_name,
            &settings.firm_address,
            &settings.firm_phone,
            &settings.firm_email,
            &settings.firm_website,
            &settings.firm_gstin,
            &settings.firm_establishment_date,
            &settings.invoice_default_prefix,
            &settings.invoice_next_number,
            &settings.invoice_default_notes,
            if settings.sync_enabled { 1 } else { 0 },
            &settings.sync_mode,
            if settings.openai_api_key_stored { 1 } else { 0 },
        ],
    )?;
    Ok(())
}

pub fn increment_invoice_number(conn: &Connection) -> Result<i32> {
    let settings = get_user_settings(conn)?;
    let next_number = settings
        .and_then(|s| s.invoice_next_number)
        .unwrap_or(1);

    conn.execute(
        "UPDATE user_settings SET invoice_next_number = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
        params![next_number + 1],
    )?;

    Ok(next_number)
}

// ===== Customer Operations =====

pub fn get_customers(conn: &Connection, search: Option<&str>) -> Result<Vec<Customer>> {
    let mut query = String::from(
        "SELECT id, name, email, phone, address, identity_type, identity_reference,
                identity_doc, referred_by, referral_notes, notes, created_at, updated_at
         FROM customers"
    );

    if let Some(search_term) = search {
        query.push_str(" WHERE name LIKE ?1 OR phone LIKE ?1 OR email LIKE ?1");
    }

    query.push_str(" ORDER BY name ASC");

    let mut stmt = conn.prepare(&query)?;

    let rows = if let Some(search_term) = search {
        let search_pattern = format!("%{}%", search_term);
        stmt.query_map([search_pattern], map_customer)?
    } else {
        stmt.query_map([], map_customer)?
    };

    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn get_customer_by_id(conn: &Connection, id: &str) -> Result<Option<Customer>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, email, phone, address, identity_type, identity_reference,
                identity_doc, referred_by, referral_notes, notes, created_at, updated_at
         FROM customers WHERE id = ?1",
    )?;

    let result = stmt.query_row([id], map_customer);

    match result {
        Ok(customer) => Ok(Some(customer)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.into()),
    }
}

pub fn create_customer(conn: &Connection, customer: &Customer) -> Result<Customer> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO customers (id, name, email, phone, address, identity_type, identity_reference,
                                identity_doc, referred_by, referral_notes, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            &id,
            &customer.name,
            &customer.email,
            &customer.phone,
            &customer.address,
            &customer.identity_type,
            &customer.identity_reference,
            &customer.identity_doc,
            &customer.referred_by,
            &customer.referral_notes,
            &customer.notes,
        ],
    )?;

    get_customer_by_id(conn, &id)?.context("Failed to retrieve created customer")
}

pub fn update_customer(conn: &Connection, id: &str, customer: &Customer) -> Result<Customer> {
    conn.execute(
        "UPDATE customers SET
            name = ?1, email = ?2, phone = ?3, address = ?4, identity_type = ?5,
            identity_reference = ?6, identity_doc = ?7, referred_by = ?8, referral_notes = ?9,
            notes = ?10, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?11",
        params![
            &customer.name,
            &customer.email,
            &customer.phone,
            &customer.address,
            &customer.identity_type,
            &customer.identity_reference,
            &customer.identity_doc,
            &customer.referred_by,
            &customer.referral_notes,
            &customer.notes,
            id,
        ],
    )?;

    get_customer_by_id(conn, id)?.context("Failed to retrieve updated customer")
}

pub fn delete_customer(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM customers WHERE id = ?1", [id])?;
    Ok(())
}

// Helper function to map database row to Customer struct
fn map_customer(row: &Row) -> rusqlite::Result<Customer> {
    Ok(Customer {
        id: row.get(0)?,
        name: row.get(1)?,
        email: row.get(2)?,
        phone: row.get(3)?,
        address: row.get(4)?,
        identity_type: row.get(5)?,
        identity_reference: row.get(6)?,
        identity_doc: row.get(7)?,
        referred_by: row.get(8)?,
        referral_notes: row.get(9)?,
        notes: row.get(10)?,
        created_at: row.get(11)?,
        updated_at: row.get(12)?,
    })
}

// ===== Stock Item Operations =====

pub fn get_stock_items(conn: &Connection, sold_filter: Option<bool>) -> Result<Vec<StockItem>> {
    let mut query = String::from(
        "SELECT id, item_number, category, material, weight, purity, purchase_price,
                description, supplier, purchase_date, is_sold, sold_at, created_at, updated_at
         FROM stock_items"
    );

    if let Some(is_sold) = sold_filter {
        query.push_str(" WHERE is_sold = ?1");
    }

    query.push_str(" ORDER BY created_at DESC");

    let mut stmt = conn.prepare(&query)?;

    let rows = if let Some(is_sold) = sold_filter {
        stmt.query_map([if is_sold { 1 } else { 0 }], map_stock_item)?
    } else {
        stmt.query_map([], map_stock_item)?
    };

    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn create_stock_item(conn: &Connection, item: &StockItem) -> Result<StockItem> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO stock_items (id, item_number, category, material, weight, purity,
                                  purchase_price, description, supplier, purchase_date, is_sold)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            &id,
            &item.item_number,
            &item.category,
            &item.material,
            item.weight,
            &item.purity,
            item.purchase_price,
            &item.description,
            &item.supplier,
            &item.purchase_date,
            if item.is_sold { 1 } else { 0 },
        ],
    )?;

    get_stock_item_by_id(conn, &id)?.context("Failed to retrieve created stock item")
}

pub fn get_stock_item_by_id(conn: &Connection, id: &str) -> Result<Option<StockItem>> {
    let mut stmt = conn.prepare(
        "SELECT id, item_number, category, material, weight, purity, purchase_price,
                description, supplier, purchase_date, is_sold, sold_at, created_at, updated_at
         FROM stock_items WHERE id = ?1",
    )?;

    let result = stmt.query_row([id], map_stock_item);

    match result {
        Ok(item) => Ok(Some(item)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.into()),
    }
}

fn map_stock_item(row: &Row) -> rusqlite::Result<StockItem> {
    Ok(StockItem {
        id: row.get(0)?,
        item_number: row.get(1)?,
        category: row.get(2)?,
        material: row.get(3)?,
        weight: row.get(4)?,
        purity: row.get(5)?,
        purchase_price: row.get(6)?,
        description: row.get(7)?,
        supplier: row.get(8)?,
        purchase_date: row.get(9)?,
        is_sold: row.get::<_, i32>(10)? != 0,
        sold_at: row.get(11)?,
        created_at: row.get(12)?,
        updated_at: row.get(13)?,
    })
}

// More operations for invoices, suppliers, etc. can be added here
