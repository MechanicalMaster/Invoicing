-- Create enum type for QR error correction level
CREATE TYPE qr_error_correction_level_enum AS ENUM ('L', 'M', 'Q', 'H');

-- Add label_qr_error_correction column to user_settings table
ALTER TABLE user_settings
ADD COLUMN label_qr_error_correction qr_error_correction_level_enum DEFAULT 'M'; 