# Jewelry Inventory Desktop App

Local-first jewelry inventory management system built with Tauri 2.x + React 19.

## Features

- 🔒 **100% Offline** - Works without internet connection
- 💎 **High-Quality Image Storage** - Store original, display, and thumbnail versions
- 🤖 **AI Features** - Voice-to-invoice, chat, OCR (requires OpenAI API key)
- ☁️ **Optional Cloud Sync** - Backup to Supabase (optional)
- 📄 **PDF Generation** - Beautiful luxury gold & black themed invoices
- 📊 **Reports & Analytics** - Track sales, inventory, and customers
- 🏷️ **QR Codes & Barcodes** - Generate product labels
- 📤 **Excel Export** - Export data to Excel/CSV

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS + Shadcn UI
- **Desktop**: Tauri 2.x (Rust + WebView)
- **Database**: SQLite (local-first)
- **Image Storage**: File system (3 versions per image)
- **AI**: OpenAI API (user-provided key)
- **Cloud Sync**: Supabase (optional)

## Development

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Platform-specific dependencies:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **Linux**: `webkit2gtk`, `libayatana-appindicator3-dev`

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

## Directory Structure

```
desktop/
├── src/                 # React frontend
│   ├── main.tsx        # Entry point
│   ├── App.tsx         # Main app component
│   └── globals.css     # Global styles
├── src-tauri/          # Rust backend
│   ├── src/            # Rust source code
│   ├── Cargo.toml      # Rust dependencies
│   └── tauri.conf.json # Tauri configuration
├── public/             # Static assets
└── package.json        # Node dependencies
```

## Building for Distribution

```bash
# Build installer for your platform
npm run tauri:build

# Output will be in src-tauri/target/release/bundle/
```

## License

Proprietary - All rights reserved
