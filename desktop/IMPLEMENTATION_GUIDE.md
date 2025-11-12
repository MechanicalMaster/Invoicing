# Jewelry Inventory Desktop App - Implementation Guide

## Project Status

### ✅ Completed (Phase 1 - Foundation)

1. **Tauri 2.x Project Structure**
   - Initialized Tauri desktop framework
   - Configured for Windows and macOS builds
   - Set up application icons and metadata

2. **React Frontend Setup**
   - Vite + React 19 + TypeScript
   - Tailwind CSS with luxury gold/black theme
   - React Router for navigation
   - Basic UI layout with sidebar navigation
   - Path aliases configured to reuse existing components

3. **SQLite Database Schema**
   - Complete schema migration from PostgreSQL
   - Tables: user_settings, customers, suppliers, stock_items, stock_item_images, invoices, invoice_items, purchase_invoices, ai_chat_sessions, ai_chat_messages, ai_actions, voice_transcriptions, audit_logs, sync_queue
   - Indexes for performance optimization
   - Connection pooling (r2d2)
   - Foreign key constraints enabled

4. **Rust Backend with Tauri Commands**
   - Database operations module (CRUD for customers, stock, settings)
   - Command handlers for IPC communication
   - Type-safe data structures with Serde
   - Error handling with anyhow

5. **File System Storage**
   - Image processing pipeline (original → display → thumbnail)
   - Configurable compression and quality settings
   - Automatic directory structure creation
   - Support for JPEG, PNG, WebP formats

### 🚧 In Progress (Phase 2)

6. **OpenAI API Integration** (Next)
   - Chat completion (GPT-4o-mini)
   - Voice transcription (Whisper)
   - Bill OCR (GPT-4 Vision)
   - API key storage in OS keychain

7. **Cloud Sync Service** (Future)
   - Supabase integration for optional backup
   - Sync queue management
   - Conflict resolution
   - Selective sync modes

8. **First-Launch Wizard** (Future)
   - Firm details setup
   - OpenAI API key configuration
   - Supabase credentials (optional)
   - Data import from Excel

9. **Auto-Updater & Distribution** (Future)
   - Tauri updater configuration
   - Code signing setup
   - GitHub releases automation
   - Platform-specific installers (.msi, .dmg)

## Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│  - Components from existing web app     │
│  - Tailwind CSS styling                 │
│  - React Router navigation              │
└─────────────────┬───────────────────────┘
                  │ Tauri IPC
┌─────────────────▼───────────────────────┐
│         Rust Backend (Tauri)            │
│  ┌─────────────────────────────────┐   │
│  │  Database Module (SQLite)       │   │
│  │  - Schema creation              │   │
│  │  - CRUD operations              │   │
│  │  - Connection pooling           │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  File Storage Module            │   │
│  │  - Image processing             │   │
│  │  - 3 versions per image         │   │
│  │  - PDF/export management        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Commands Module                │   │
│  │  - IPC handlers                 │   │
│  │  - Error handling               │   │
│  │  - Type-safe responses          │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼──────────┐
│ SQLite DB      │  │ File System      │
│ ~/AppData/     │  │ ~/AppData/images/│
│  database/     │  │ ~/AppData/exports│
│  inventory.db  │  │ ~/AppData/backups│
└────────────────┘  └──────────────────┘
```

## Database Schema

### Core Tables

**user_settings** - Single row for local user configuration
- Firm details (name, address, GST, etc.)
- Invoice settings (prefix, next number)
- Label settings (QR codes, barcodes)
- Sync settings (Supabase credentials)
- AI settings (API key flag)

**customers** - Customer management
- Contact information
- Identity documents (stored as file paths)
- Referral tracking
- Sync status

**stock_items** - Jewelry inventory
- Item details (category, material, weight, purity)
- Purchase information
- Sold status and timestamp
- Sync status

**stock_item_images** - Image metadata (1:many with stock_items)
- Paths to original/display/thumbnail versions
- File size and dimensions
- Cloud URL (if synced)

**invoices** - Sales invoices
- Customer and firm snapshots (denormalized for history)
- Financial calculations
- Status tracking
- Sync status

**invoice_items** - Line items for invoices (1:many with invoices)
- Product details
- Quantity, weight, pricing

**suppliers** - Supplier management

**purchase_invoices** - Purchase tracking
- Supplier invoices
- Payment status
- File attachments

### AI Tables

**ai_chat_sessions** - Chat session tracking
**ai_chat_messages** - Message history with token usage
**ai_actions** - AI action execution logs
**voice_transcriptions** - Voice input history

### Utility Tables

**audit_logs** - Action audit trail
**sync_queue** - Pending sync operations

## File Structure

```
desktop/
├── src/                          # React frontend
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Main component with routing
│   ├── globals.css              # Tailwind styles
│   └── (components to be added)
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   ├── lib.rs              # Main library with setup
│   │   ├── main.rs             # Entry point
│   │   ├── commands.rs         # Tauri command handlers
│   │   ├── database/
│   │   │   ├── mod.rs          # Database initialization
│   │   │   ├── schema.rs       # Table creation
│   │   │   └── operations.rs  # CRUD operations
│   │   └── file_storage/
│   │       ├── mod.rs          # Storage initialization
│   │       └── images.rs       # Image processing
│   ├── Cargo.toml              # Rust dependencies
│   ├── tauri.conf.json         # Tauri configuration
│   └── build.rs                # Build script
├── package.json                # Node dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
└── README.md                   # Project documentation
```

## API Commands (Rust → Frontend)

### System
- `is_first_time_setup()` → `bool`
- `get_app_version()` → `string`

### User Settings
- `get_user_settings()` → `UserSettings`
- `save_user_settings(settings)` → `UserSettings`

### Customers
- `get_customers(search?)` → `Customer[]`
- `get_customer(id)` → `Customer`
- `create_customer(customer)` → `Customer`
- `update_customer(id, customer)` → `Customer`
- `delete_customer(id)` → `boolean`

### Stock Items
- `get_stock_items(sold?)` → `StockItem[]`
- `create_stock_item(item)` → `StockItem`

### To Be Implemented
- Invoice operations
- Supplier operations
- Purchase invoice operations
- Image upload/management
- PDF generation
- Excel export
- AI chat operations
- Voice transcription
- Bill OCR
- Sync operations

## Dependencies

### Rust (Cargo.toml)
```toml
# Core
tauri = "2"
serde = "1"
serde_json = "1"

# Database
rusqlite = { version = "0.33", features = ["bundled", "uuid", "chrono"] }
r2d2 = "0.8"
r2d2_sqlite = "0.25"

# Image processing
image = { version = "0.25", features = ["jpeg", "png", "webp"] }

# HTTP client
reqwest = { version = "0.12", features = ["json", "multipart"] }
tokio = { version = "1", features = ["full"] }

# Utilities
uuid = "1.11"
chrono = "0.4"
anyhow = "1.0"
keyring = "3.6"
```

### Node (package.json)
```json
{
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "react-router-dom": "^7",
    "@tauri-apps/api": "^2",
    "tailwindcss": "^3.4",
    "@radix-ui/react-*": "various",
    "lucide-react": "^0.454",
    "@react-pdf/renderer": "^4.3",
    "qrcode": "^1.5",
    "xlsx": "^0.18",
    "zod": "^3.24",
    "react-hook-form": "^7.54"
  }
}
```

## Next Steps

### Immediate (Week 1-2)
1. **Test the build** - Ensure everything compiles
2. **Complete CRUD operations** - Finish all database operations
3. **Create React hooks** - useTauri hooks for commands
4. **Reuse existing UI components** - Port from ../components/
5. **Implement image upload** - Add file picker and processing

### Short Term (Week 3-4)
6. **OpenAI integration** - Add AI features
7. **PDF generation** - Port from web app
8. **Excel export** - Reuse existing logic
9. **First-launch wizard** - Setup flow

### Medium Term (Week 5-8)
10. **Cloud sync** - Supabase integration
11. **Testing** - Unit and integration tests
12. **Platform builds** - macOS and Windows installers
13. **Code signing** - Developer certificates

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (hot reload)
npm run tauri:dev

# Build for production
npm run tauri:build

# Output: src-tauri/target/release/bundle/
# - Windows: .msi installer
# - macOS: .dmg disk image
```

## Testing

```bash
# Rust tests
cd src-tauri
cargo test

# Frontend (when implemented)
npm test
```

## Platform-Specific Notes

### Windows
- Requires Microsoft Visual Studio C++ Build Tools
- Installer: .msi (Windows Installer)
- App data: `%APPDATA%\com.jewelryinventory.app\`

### macOS
- Requires Xcode Command Line Tools
- Installer: .dmg (Disk Image)
- App data: `~/Library/Application Support/com.jewelryinventory.app/`
- Code signing: Requires Apple Developer ID ($99/year)

### Linux
- Requires webkit2gtk, libayatana-appindicator3-dev
- Package: .deb (Debian) or .AppImage
- App data: `~/.config/jewelry-inventory-desktop/`

## Security Considerations

1. **API Keys** - Stored in OS keychain (not in database)
2. **Local Storage** - Database file is not encrypted (user responsibility)
3. **File Permissions** - AppData directory restricted to user
4. **Network Requests** - Only to OpenAI and Supabase (if enabled)
5. **Code Signing** - Prevents tampering, verifies authenticity

## Performance Targets

- App launch: < 2 seconds
- Database queries: < 50ms
- Image processing: < 1 second per image
- PDF generation: < 2 seconds
- UI responsiveness: 60 FPS

## Known Limitations

1. **Single User** - No multi-user support in local mode
2. **No Real-time Sync** - Sync happens on-demand or scheduled
3. **Platform Support** - Windows and macOS only (Linux untested)
4. **Database Size** - SQLite handles up to 281 TB theoretically
5. **Image Formats** - JPEG, PNG, WebP supported (no HEIC)

## Troubleshooting

### Build Failures
- Check Rust version: `cargo --version` (need 1.70+)
- Check Node version: `node --version` (need 18+)
- Install platform dependencies (see Prerequisites)

### Database Issues
- Location: Check console output for database path
- Locked: Close app completely before manual edits
- Corruption: Restore from ~/AppData/backups/

### Image Processing
- Large files: Original > 10MB converted to JPEG
- Format: PNG automatically converted to save space
- Permissions: Ensure write access to AppData/images/

## Contributing

This is a proprietary project. All development is internal.

## License

Proprietary - All rights reserved

---

**Last Updated**: 2025-11-12
**Version**: 0.1.0 (Alpha)
**Status**: Phase 1 Complete, Phase 2 In Progress
