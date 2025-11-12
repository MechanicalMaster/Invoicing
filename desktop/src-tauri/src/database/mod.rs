pub mod schema;
pub mod operations;

use anyhow::Result;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::Connection;
use std::path::PathBuf;
use tauri::AppHandle;

pub type DbPool = Pool<SqliteConnectionManager>;

/// Get the database file path
pub fn get_db_path(app: &AppHandle) -> Result<PathBuf> {
    let app_data_dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&app_data_dir)?;

    let db_path = app_data_dir.join("database").join("inventory.db");
    std::fs::create_dir_all(db_path.parent().unwrap())?;

    Ok(db_path)
}

/// Initialize the database connection pool
pub fn init_pool(db_path: PathBuf) -> Result<DbPool> {
    let manager = SqliteConnectionManager::file(db_path);
    let pool = Pool::builder()
        .max_size(10)
        .build(manager)?;

    Ok(pool)
}

/// Initialize database schema if it doesn't exist
pub fn initialize_db(pool: &DbPool) -> Result<()> {
    let conn = pool.get()?;
    schema::create_tables(&conn)?;
    Ok(())
}

/// Check if this is a first-time setup
pub fn is_first_time_setup(pool: &DbPool) -> Result<bool> {
    let conn = pool.get()?;
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM user_settings",
        [],
        |row| row.get(0),
    )?;
    Ok(count == 0)
}
