use anyhow::{Context, Result};
use image::{imageops::FilterType, DynamicImage, ImageFormat};
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;

pub struct ImageVersion {
    pub original_path: PathBuf,
    pub display_path: PathBuf,
    pub thumbnail_path: PathBuf,
    pub file_size: u64,
    pub width: u32,
    pub height: u32,
}

/// Image processing configuration
pub struct ImageConfig {
    /// Maximum width for display version (height auto-scaled)
    pub display_max_width: u32,
    /// Maximum width for thumbnail (height auto-scaled)
    pub thumbnail_max_width: u32,
    /// JPEG quality for display version (1-100)
    pub display_quality: u8,
    /// JPEG quality for thumbnail (1-100)
    pub thumbnail_quality: u8,
}

impl Default for ImageConfig {
    fn default() -> Self {
        Self {
            display_max_width: 1200,
            thumbnail_max_width: 300,
            display_quality: 85,
            thumbnail_quality: 75,
        }
    }
}

/// Process an image file and create 3 versions: original, display, thumbnail
pub fn process_image(
    source_path: &Path,
    dest_dir: &Path,
    config: &ImageConfig,
) -> Result<ImageVersion> {
    // Create unique ID for this image set
    let image_id = Uuid::new_v4().to_string();

    // Ensure destination directory exists
    fs::create_dir_all(dest_dir)?;

    // Load the original image
    let img = image::open(source_path).context("Failed to open source image")?;
    let (width, height) = img.dimensions();

    // Determine image format
    let format = ImageFormat::from_path(source_path).unwrap_or(ImageFormat::Jpeg);
    let ext = match format {
        ImageFormat::Png => "png",
        ImageFormat::WebP => "webp",
        _ => "jpg",
    };

    // 1. Copy original (or save as high-quality JPEG if too large)
    let original_filename = format!("original-{}.{}", image_id, ext);
    let original_path = dest_dir.join(&original_filename);

    // If original is PNG or very large, convert to high-quality JPEG
    let original_size = fs::metadata(source_path)?.len();
    if original_size > 10 * 1024 * 1024 || format == ImageFormat::Png {
        // Convert to JPEG with 95% quality
        img.save_with_format(&original_path, ImageFormat::Jpeg)?;
    } else {
        // Just copy the original
        fs::copy(source_path, &original_path)?;
    }

    // 2. Create display version (scaled down, optimized)
    let display_filename = format!("display-{}.jpg", image_id);
    let display_path = dest_dir.join(&display_filename);
    let display_img = if width > config.display_max_width {
        img.resize(config.display_max_width, u32::MAX, FilterType::Lanczos3)
    } else {
        img.clone()
    };
    save_jpeg(&display_img, &display_path, config.display_quality)?;

    // 3. Create thumbnail version (small, optimized)
    let thumbnail_filename = format!("thumb-{}.jpg", image_id);
    let thumbnail_path = dest_dir.join(&thumbnail_filename);
    let thumbnail_img = img.resize(config.thumbnail_max_width, u32::MAX, FilterType::Lanczos3);
    save_jpeg(&thumbnail_img, &thumbnail_path, config.thumbnail_quality)?;

    // Get final file size
    let file_size = fs::metadata(&original_path)?.len();

    Ok(ImageVersion {
        original_path,
        display_path,
        thumbnail_path,
        file_size,
        width,
        height,
    })
}

/// Save image as JPEG with specified quality
fn save_jpeg(img: &DynamicImage, path: &Path, quality: u8) -> Result<()> {
    let rgb_img = img.to_rgb8();
    let mut file = fs::File::create(path)?;

    let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut file, quality);
    encoder.encode(
        &rgb_img,
        rgb_img.width(),
        rgb_img.height(),
        image::ColorType::Rgb8,
    )?;

    Ok(())
}

/// Delete all versions of an image
pub fn delete_image_versions(original_path: &Path, display_path: &Path, thumbnail_path: &Path) -> Result<()> {
    // Ignore errors if files don't exist
    let _ = fs::remove_file(original_path);
    let _ = fs::remove_file(display_path);
    let _ = fs::remove_file(thumbnail_path);
    Ok(())
}

/// Get total size of all image versions
pub fn get_total_images_size(images_dir: &Path) -> Result<u64> {
    let mut total_size = 0u64;

    if images_dir.exists() {
        for entry in fs::read_dir(images_dir)? {
            let entry = entry?;
            let metadata = entry.metadata()?;
            if metadata.is_file() {
                total_size += metadata.len();
            } else if metadata.is_dir() {
                // Recursively calculate subdirectory sizes
                total_size += get_total_images_size(&entry.path())?;
            }
        }
    }

    Ok(total_size)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_image_config_defaults() {
        let config = ImageConfig::default();
        assert_eq!(config.display_max_width, 1200);
        assert_eq!(config.thumbnail_max_width, 300);
        assert_eq!(config.display_quality, 85);
        assert_eq!(config.thumbnail_quality, 75);
    }
}
