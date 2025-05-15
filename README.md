# Sethiya Gold - Jewelry Shop Management System

## Overview

Sethiya Gold is a comprehensive management system designed specifically for Indian jewelry shops. This Next.js application helps jewelry store owners streamline their business operations with robust invoicing, inventory management, customer relationship management, and reporting capabilities.

## Features

### 📋 Customer Management
- Store and manage detailed customer profiles with contact information
- Track purchase history and customer preferences
- Support for customer-specific pricing and discounts

### 💍 Inventory Tracking
- Real-time inventory updates
- Categorize items by type (rings, necklaces, etc.), material (gold, silver), and price range
- Detailed product information including images, weight, material, and gemstone details

### 📝 Advanced Invoicing
- Generate professional invoices with customizable templates
- Include GST calculations and tax compliance features
- Support for item-specific pricing and discounts
- Print and digital invoice options

### 📦 Order Management
- Track customer orders from placement to delivery
- Handle custom orders with specific requirements (engraving, resizing)
- Provide status updates to customers

### 📊 Analytics & Reporting
- Generate detailed sales reports (daily, monthly, yearly)
- Inventory turnover analysis
- Customer buying pattern insights
- Business performance dashboards

### 💾 Data Backup & Sync
- Cloud sync option with Supabase
- Local storage option for offline functionality
- Secure data export for backup purposes

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **State Management**: React Context, React Hook Form
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **PDF Generation**: @react-pdf/renderer
- **Icons**: Lucide React
- **Date Handling**: date-fns, React Day Picker
- **Form Validation**: Zod, @hookform/resolvers

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PNPM package manager (v10.10.0+)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/MechanicalMaster/Invoicing.git
   cd Invoicing
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```
pnpm build
pnpm start
```

## Key Workflows

### Creating an Invoice
1. Navigate to "Create Invoice" from the dashboard
2. Select a customer or add a new one
3. Add jewelry items from inventory or as custom entries
4. Apply taxes and discounts
5. Preview, print, or send the invoice

### Managing Inventory
1. Browse inventory by categories
2. Add new items with detailed specifications
3. Update stock quantities and pricing
4. Track inventory history and valuations

### Customer Bookings
1. Create new customer bookings with delivery dates
2. Collect advance payments
3. Track booking status
4. Convert bookings to invoices upon completion

## Roadmap

- [ ] Multi-language support with regional Indian languages
- [ ] Integration with accounting software (Tally, QuickBooks)
- [ ] E-commerce showcase feature
- [ ] Mobile app with push notifications
- [ ] AI-powered inventory recommendations
- [ ] Voice-activated assistance

## License

This project is proprietary software. All rights reserved.

## Support

For support, please contact [support@sethiyagold.com](mailto:support@sethiyagold.com)

---

Made with ❤️ for Indian jewelry businesses