mod database;
mod commands;
mod file_storage;

use database::{DbPool, get_db_path, init_pool, initialize_db};
use tauri::{Manager, State};
use std::sync::Mutex;

// Application state
pub struct AppState {
    pub db: Mutex<DbPool>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Initialize database
            let db_path = get_db_path(&app.handle())?;
            println!("Database path: {:?}", db_path);

            let pool = init_pool(db_path)?;
            initialize_db(&pool)?;

            // Check if first-time setup
            let is_first_time = database::is_first_time_setup(&pool)?;
            println!("First time setup: {}", is_first_time);

            // Store database pool in app state
            app.manage(AppState {
                db: Mutex::new(pool),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::is_first_time_setup,
            commands::get_user_settings,
            commands::save_user_settings,
            commands::get_customers,
            commands::get_customer,
            commands::create_customer,
            commands::update_customer,
            commands::delete_customer,
            commands::get_stock_items,
            commands::create_stock_item,
            commands::get_app_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
