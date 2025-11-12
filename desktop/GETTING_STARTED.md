# Getting Started with Jewelry Inventory Desktop App

## Overview

This is a **local-first desktop application** for jewelry shop inventory management built with **Tauri 2.x** (Rust + WebView). It reuses components from the existing Next.js web application but works **100% offline** with optional cloud backup.

## What Has Been Built (Phase 1 - Foundation) ✅

### 1. Project Structure
- Tauri 2.x desktop framework configured for Windows and macOS
- React 19 + TypeScript + Vite frontend
- Rust backend with SQLite database
- Path aliases to reuse components from `../components/` and `../lib/`

### 2. Database (SQLite)
A complete schema with 12 tables:
- **user_settings**: Firm details, invoice settings, sync config, AI settings
- **customers**: Customer management with identity documents
- **suppliers**: Supplier contact information
- **stock_items**: Jewelry inventory with sold/unsold tracking
- **stock_item_images**: Multi-image support (original/display/thumbnail)
- **invoices**: Sales invoices with customer/firm snapshots
- **invoice_items**: Invoice line items
- **purchase_invoices**: Purchase tracking with file attachments
- **ai_chat_sessions**: AI chat history
- **ai_chat_messages**: Message storage with token tracking
- **ai_actions**: AI action execution logs
- **audit_logs**: Complete audit trail
- **sync_queue**: Pending cloud sync operations

### 3. Rust Backend
- **Database module**: Connection pooling, schema creation, CRUD operations
- **Commands module**: IPC handlers for frontend-backend communication
- **File storage module**: Image processing (3 versions per image)
- **Type-safe**: All data structures use Serde for serialization

### 4. Frontend Setup
- React Router for navigation
- Tailwind CSS with luxury gold/black theme
- Basic UI with sidebar navigation
- Placeholder pages for Dashboard, Invoices, Customers, Stock, Settings

### 5. File Management
- Automatic directory creation (`images/`, `exports/`, `backups/`)
- Image processing pipeline:
  - **Original**: Up to 10MB, converted to high-quality JPEG if needed
  - **Display**: Scaled to 1200px width, 85% quality
  - **Thumbnail**: Scaled to 300px width, 75% quality

## What Needs to Be Built Next

### Phase 2: Core Features (Week 1-2)
1. **Complete CRUD Operations**
   - Invoices (create, read, update, delete)
   - Suppliers (create, read, update, delete)
   - Purchase invoices (create, read, update, delete)
   - Image upload and management

2. **React Hooks for Tauri Commands**
   - `useTauriCommand<T>(command, args)`
   - `useCustomers()`
   - `useStockItems()`
   - `useInvoices()`
   - `useSettings()`

3. **Port Existing UI Components**
   - Customer form components
   - Stock item form components
   - Invoice form components
   - Data tables with search/filter
   - PDF preview components

4. **PDF Generation**
   - Reuse `@react-pdf/renderer` logic from web app
   - Invoice PDF with luxury gold/black theme
   - Stock item labels with QR codes

5. **Excel Export**
   - Reuse `xlsx` library from web app
   - Export customers, stock, invoices to Excel

### Phase 3: AI Features (Week 3-4)
6. **OpenAI API Integration**
   - Store API key in OS keychain (Windows Credential Manager / macOS Keychain)
   - Chat completion (GPT-4o-mini) for invoice assistance
   - Voice transcription (Whisper) for Hindi/Marathi/English
   - Bill OCR (GPT-4 Vision) for supplier invoice extraction
   - Monthly cost tracking and display

7. **AI Chat UI**
   - Port existing chat components from `../components/ai-chat/`
   - Session management
   - Action execution (create invoice from chat)
   - Voice input button

### Phase 4: Cloud Sync (Week 5-6)
8. **Supabase Integration**
   - Optional sync configuration in settings
   - Sync modes: Disabled, Metadata-only, Selective, Full
   - Background sync service (every 10 minutes or manual)
   - Conflict resolution (last-write-wins with manual override)
   - Sync queue management

### Phase 5: Polish (Week 7-8)
9. **First-Launch Wizard**
   - Welcome screen
   - Firm details setup
   - OpenAI API key (optional)
   - Supabase credentials (optional)
   - Import data from Excel (optional)

10. **Auto-Updater**
    - Tauri updater configuration
    - Check for updates on launch
    - Background download and install
    - GitHub releases integration

11. **Distribution**
    - Code signing certificates
    - Platform-specific installers (.msi, .dmg)
    - GitHub Actions for automated builds

## How to Run

### Prerequisites
- **Node.js 18+**: `node --version`
- **Rust 1.70+**: `cargo --version`
- **Platform tools**:
  - Windows: Microsoft Visual Studio C++ Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: `webkit2gtk`, `libayatana-appindicator3-dev`

### Development

```bash
# 1. Navigate to desktop directory
cd desktop

# 2. Install Node dependencies (already done)
npm install

# 3. Run in development mode
npm run tauri:dev
```

This will:
- Start Vite dev server on http://localhost:5173
- Compile Rust backend
- Launch the desktop app
- Enable hot reload for React changes

### Build for Production

```bash
# Build production app
npm run tauri:build
```

Output location: `src-tauri/target/release/bundle/`
- Windows: `jewelry-inventory_0.1.0_x64.msi`
- macOS: `Jewelry Inventory_0.1.0_aarch64.dmg` (Apple Silicon)
- macOS: `Jewelry Inventory_0.1.0_x64.dmg` (Intel)

## Project Structure

```
desktop/
├── src/                          # React frontend
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Main component with routing
│   ├── globals.css              # Tailwind styles
│   └── components/ (to add)     # Desktop-specific components
│
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   ├── lib.rs              # Main library with app setup
│   │   ├── main.rs             # Entry point
│   │   ├── commands.rs         # IPC command handlers
│   │   ├── database/
│   │   │   ├── mod.rs          # Database initialization & pooling
│   │   │   ├── schema.rs       # SQLite table creation
│   │   │   └── operations.rs  # CRUD operations
│   │   └── file_storage/
│   │       ├── mod.rs          # Directory management
│   │       └── images.rs       # Image processing (3 versions)
│   ├── Cargo.toml              # Rust dependencies
│   ├── tauri.conf.json         # Tauri configuration
│   └── build.rs                # Build script
│
├── package.json                # Node dependencies
├── vite.config.ts              # Vite bundler config
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── README.md                   # Project overview
├── IMPLEMENTATION_GUIDE.md     # Detailed implementation docs
└── GETTING_STARTED.md          # This file
```

## Available Tauri Commands

These are the Rust functions exposed to the frontend via IPC:

### System
```typescript
invoke('is_first_time_setup') → boolean
invoke('get_app_version') → string
```

### Settings
```typescript
invoke('get_user_settings') → UserSettings
invoke('save_user_settings', { settings }) → UserSettings
```

### Customers
```typescript
invoke('get_customers', { search?: string }) → Customer[]
invoke('get_customer', { id: string }) → Customer
invoke('create_customer', { customer }) → Customer
invoke('update_customer', { id, customer }) → Customer
invoke('delete_customer', { id }) → boolean
```

### Stock Items
```typescript
invoke('get_stock_items', { sold?: boolean }) → StockItem[]
invoke('create_stock_item', { item }) → StockItem
```

## How to Call Tauri Commands from React

```typescript
import { invoke } from '@tauri-apps/api/core';

// Example: Get all customers
const customers = await invoke<Customer[]>('get_customers', { search: null });

// Example: Create a customer
const newCustomer = await invoke<Customer>('create_customer', {
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    // ... other fields
  }
});

// Example: Get settings
const settings = await invoke<UserSettings>('get_user_settings');
```

## Reusing Existing Components

The project is configured to import components from the parent directories:

```typescript
// From desktop/src/SomeComponent.tsx

// Import existing UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Import existing utilities
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';

// Import types
import type { Customer } from '@/lib/database.types';
```

**Path aliases** (configured in `vite.config.ts` and `tsconfig.json`):
- `@/components/*` → `../components/*`
- `@/lib/*` → `../lib/*`
- `@/styles/*` → `../styles/*`

## Data Storage Locations

### Windows
```
C:\Users\<username>\AppData\Roaming\com.jewelryinventory.app\
├── database\
│   └── inventory.db          # SQLite database
├── images\
│   ├── stock-items\          # Stock item images
│   │   ├── {item-id}\
│   │   │   ├── original-001.jpg
│   │   │   ├── display-001.jpg
│   │   │   └── thumb-001.jpg
│   ├── customer-identity\    # Customer ID documents
│   └── purchase-invoices\    # Supplier invoice files
├── exports\                  # Excel/CSV exports
└── backups\                  # Database backups
```

### macOS
```
~/Library/Application Support/com.jewelryinventory.app/
(same structure as above)
```

## Key Differences from Web App

| Feature | Web App | Desktop App |
|---------|---------|-------------|
| **Authentication** | Supabase Auth (multi-user) | None (single-user local) |
| **Database** | PostgreSQL (cloud) | SQLite (local) |
| **Images** | Supabase Storage (URLs) | File system (paths) |
| **Offline** | No (requires internet) | Yes (100% functional) |
| **AI API Key** | Server-side (hidden) | User-provided (their cost) |
| **Sync** | Real-time | On-demand or scheduled |
| **Navigation** | Next.js App Router | React Router |
| **API Calls** | Fetch to Next.js routes | Tauri IPC commands |

## Development Tips

### 1. Hot Reload
React changes hot reload automatically. Rust changes require restart:
- Save Rust file → App restarts
- Save React file → UI updates instantly

### 2. Console Logging
- **Frontend logs**: Browser DevTools (Cmd+Option+I / F12)
- **Rust logs**: Terminal where you ran `npm run tauri:dev`

### 3. Database Inspection
Use a SQLite browser to inspect the database:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- Location: `~/AppData/Roaming/com.jewelryinventory.app/database/inventory.db`

### 4. Testing Changes
```bash
# Test Rust code
cd src-tauri
cargo test

# Test frontend (when tests are added)
npm test
```

### 5. Common Issues
- **"command not found: tauri"**: Run `npm install` first
- **Build fails**: Check Rust version (`cargo --version`)
- **Database locked**: Close all app instances
- **Port 5173 in use**: Kill process or change port in `vite.config.ts`

## Next Steps for Development

1. **Create React hooks** for Tauri commands (`src/hooks/useTauri.ts`)
2. **Port customer form** from `../app/customers/` to `src/pages/customers/`
3. **Port stock item form** from `../app/stock/` to `src/pages/stock/`
4. **Test image upload** with file picker and processing
5. **Implement invoice creation** with items and PDF generation

## Resources

- [Tauri Documentation](https://tauri.app/)
- [Tauri Guides](https://tauri.app/develop/)
- [Tauri Commands](https://tauri.app/develop/calling-rust/)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [Rust Book](https://doc.rust-lang.org/book/)

## Questions?

Refer to:
1. `IMPLEMENTATION_GUIDE.md` - Detailed technical documentation
2. `README.md` - Project overview
3. Existing web app code in `../app/`, `../components/`, `../lib/`

---

**Status**: Phase 1 Complete (Foundation) ✅
**Next**: Phase 2 - Core Features (CRUD, Forms, PDF, Excel)
**Version**: 0.1.0-alpha
**Last Updated**: 2025-11-12
