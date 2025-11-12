use crate::database::operations::*;
use crate::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize)]
pub struct CommandResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> CommandResult<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
        }
    }
}

// ===== System Commands =====

#[tauri::command]
pub fn is_first_time_setup(state: State<AppState>) -> CommandResult<bool> {
    let pool = state.db.lock().unwrap();
    let conn = match pool.get() {
        Ok(conn) => conn,
        Err(e) => return CommandResult::error(e.to_string()),
    };

    match crate::database::is_first_time_setup(&*pool) {
        Ok(is_first_time) => CommandResult::success(is_first_time),
        Err(e) => CommandResult::error(e.to_string()),
    }
}

#[tauri::command]
pub fn get_app_version() -> CommandResult<String> {
    CommandResult::success(env!("CARGO_PKG_VERSION").to_string())
}

// ===== User Settings Commands =====

#[tauri::command]
pub fn get_user_settings(state: State<AppState>) -> CommandResult<UserSettings> {
    let pool = state.db.lock().unwrap();
    let conn = match pool.get() {
        Ok(conn) => conn,
        Err(e) => return CommandResult::error(e.to_string()),
    };

    match get_user_settings(&conn) {
        Ok(Some(settings)) => CommandResult::success(settings),
        Ok(None) => {
            // Return default settings if none exist
            let default_settings = UserSettings {
                id: 1,
                user_id: "local".to_string(),
                firm_name: None,
                firm_address: None,
                firm_phone: None,
                firm_email: None,
                firm_website: None,
                firm_gstin: None,
                firm_establishment_date: None,
                invoice_default_prefix: Some("INV-".to_string()),
                invoice_next_number: Some(1),
                invoice_default_notes: None,
                sync_enabled: false,
                sync_mode: Some("disabled".to_string()),
                openai_api_key_stored: false,
                updated_at: chrono::Utc::now().to_rfc3339(),
            };
            CommandResult::success(default_settings)
        }
        Err(e) => CommandResult::error(e.to_string()),
    }
}

#[tauri::command]
pub fn save_user_settings(
    state: State<AppState>,
    settings: UserSettings,
) -> CommandResult<UserSettings> {
    let pool = state.db.lock().unwrap();
    let conn = match pool.get() {
        Ok(conn) => conn,
        Err(e) => return CommandResult::error(e.to_string()),
    };

    match upsert_user_settings(&conn, &settings) {
        Ok(_) => match get_user_settings(&conn) {
            Ok(Some(updated)) => CommandResult::success(updated),
            Ok(None) => CommandResult::error("Failed to retrieve saved settings".to_string()),
            Err(e) => CommandResult::error(e.to_string()),
        },
        Err(e) => CommandResult::error(e.to_string()),
    }
}

// ===== Customer Commands =====

#[tauri::command]
pub fn get_customers(
    state: State<AppState>,
    search: Option<String>,
) -> CommandResult<Vec<Customer>> {
    let pool = state.db.lock().unwrap();
    let conn = match pool.get() {
        Ok(conn) => conn,
        Err(e) => return CommandResult::error(e.to_string()),
    };

    match get_customers(&conn, search.as_deref()) {
        Ok(customers) => CommandResult::success(customers),
        Err(e) => CommandResult::error(e.to_string()),
    }
}

#[tauri::command]
pub fn get_customer(state: State<AppState>, id: String) -> CommandResult<Customer> {
    let pool = state.db.lock().unwrap();
    let conn = match pool.get() {
        Ok(conn) => conn,
        Err(e) => return CommandResult::error(e.to_string()),
    };

    match get_customer_by_id(&conn, &id) {
        Ok(Some(customer)) => CommandResult::success(customer),
        Ok(None) => CommandResult::error("Customer not found".to_string()),
        Err(e) => CommandResult::error(e.to_string()),
    }
}

#[tauri::command]
pub fn create_customer(state: State<AppState>, customer: Customer) -> CommandResult<Customer> {
    let pool = state.db.lock().unwrap();
    let conn = match pool.get() {
        Ok(conn) => conn,
        Err(e) => return CommandResult::error(e.to_string()),
    };

    match create_customer(&conn, &customer) {
        Ok(created) => CommandResult::success(created),
        Err(e) => CommandResult::error(e.to_string()),
    }
}

#[tauri::command]
pub fn update_customer(
    state: State<AppState>,
    id: String,
    customer: Customer,
) -> CommandResult<Customer> {
    let pool = state.db.lock().unwrap();
    let conn = match pool.get() {
        Ok(conn) => conn,
        Err(e) => return CommandResult::error(e.to_string()),
    };

    match update_customer(&conn, &id, &customer) {
        Ok(updated) => CommandResult::success(updated),
        Err(e) => CommandResult::error(e.to_string()),
    }
}

#[tauri::command]
pub fn delete_customer(state: State<AppState>, id: String) -> CommandResult<bool> {
    let pool = state.db.lock().unwrap();
    let conn = match pool.get() {
        Ok(conn) => conn,
        Err(e) => return CommandResult::error(e.to_string()),
    };

    match delete_customer(&conn, &id) {
        Ok(_) => CommandResult::success(true),
        Err(e) => CommandResult::error(e.to_string()),
    }
}

// ===== Stock Item Commands =====

#[tauri::command]
pub fn get_stock_items(
    state: State<AppState>,
    sold: Option<bool>,
) -> CommandResult<Vec<StockItem>> {
    let pool = state.db.lock().unwrap();
    let conn = match pool.get() {
        Ok(conn) => conn,
        Err(e) => return CommandResult::error(e.to_string()),
    };

    match get_stock_items(&conn, sold) {
        Ok(items) => CommandResult::success(items),
        Err(e) => CommandResult::error(e.to_string()),
    }
}

#[tauri::command]
pub fn create_stock_item(state: State<AppState>, item: StockItem) -> CommandResult<StockItem> {
    let pool = state.db.lock().unwrap();
    let conn = match pool.get() {
        Ok(conn) => conn,
        Err(e) => return CommandResult::error(e.to_string()),
    };

    match create_stock_item(&conn, &item) {
        Ok(created) => CommandResult::success(created),
        Err(e) => CommandResult::error(e.to_string()),
    }
}

// More commands for invoices, suppliers, etc. can be added here
