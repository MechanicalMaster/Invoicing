pub mod images;

use anyhow::Result;
use std::path::PathBuf;
use tauri::AppHandle;

/// Get the images directory path
pub fn get_images_dir(app: &AppHandle) -> Result<PathBuf> {
    let app_data_dir = app.path().app_data_dir()?;
    let images_dir = app_data_dir.join("images");
    std::fs::create_dir_all(&images_dir)?;
    Ok(images_dir)
}

/// Get the exports directory path
pub fn get_exports_dir(app: &AppHandle) -> Result<PathBuf> {
    let app_data_dir = app.path().app_data_dir()?;
    let exports_dir = app_data_dir.join("exports");
    std::fs::create_dir_all(&exports_dir)?;
    Ok(exports_dir)
}

/// Get the backups directory path
pub fn get_backups_dir(app: &AppHandle) -> Result<PathBuf> {
    let app_data_dir = app.path().app_data_dir()?;
    let backups_dir = app_data_dir.join("backups");
    std::fs::create_dir_all(&backups_dir)?;
    Ok(backups_dir)
}
