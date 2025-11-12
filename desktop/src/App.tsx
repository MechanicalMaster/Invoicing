import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';

// Placeholder pages - we'll implement these next
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4 text-gold-600">Dashboard</h1>
    <p className="text-muted-foreground">Welcome to Jewelry Inventory Desktop App</p>
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold">Total Invoices</h3>
        <p className="text-2xl font-bold text-gold-600">0</p>
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold">Customers</h3>
        <p className="text-2xl font-bold text-gold-600">0</p>
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold">Stock Items</h3>
        <p className="text-2xl font-bold text-gold-600">0</p>
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold">Total Value</h3>
        <p className="text-2xl font-bold text-gold-600">₹0</p>
      </div>
    </div>
  </div>
);

const Invoices = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4 text-gold-600">Invoices</h1>
    <p className="text-muted-foreground">Invoice management coming soon...</p>
  </div>
);

const Customers = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4 text-gold-600">Customers</h1>
    <p className="text-muted-foreground">Customer management coming soon...</p>
  </div>
);

const Stock = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4 text-gold-600">Stock</h1>
    <p className="text-muted-foreground">Stock management coming soon...</p>
  </div>
);

const Settings = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4 text-gold-600">Settings</h1>
    <p className="text-muted-foreground">Settings coming soon...</p>
  </div>
);

function App() {
  const [greetMsg, setGreetMsg] = useState('');

  useEffect(() => {
    // Test Tauri command
    invoke<string>('greet', { name: 'Desktop App' })
      .then((result) => setGreetMsg(result))
      .catch(console.error);
  }, []);

  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-black text-white border-r border-gold-600">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gold-500">Jewelry Inventory</h1>
            <p className="text-sm text-gray-400 mt-1">Desktop Edition</p>
          </div>

          <nav className="mt-6">
            <Link
              to="/"
              className="block px-6 py-3 hover:bg-gold-600/10 hover:border-l-4 hover:border-gold-600 transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              to="/invoices"
              className="block px-6 py-3 hover:bg-gold-600/10 hover:border-l-4 hover:border-gold-600 transition-colors"
            >
              📄 Invoices
            </Link>
            <Link
              to="/customers"
              className="block px-6 py-3 hover:bg-gold-600/10 hover:border-l-4 hover:border-gold-600 transition-colors"
            >
              👥 Customers
            </Link>
            <Link
              to="/stock"
              className="block px-6 py-3 hover:bg-gold-600/10 hover:border-l-4 hover:border-gold-600 transition-colors"
            >
              💎 Stock
            </Link>
            <Link
              to="/settings"
              className="block px-6 py-3 hover:bg-gold-600/10 hover:border-l-4 hover:border-gold-600 transition-colors"
            >
              ⚙️ Settings
            </Link>
          </nav>

          {greetMsg && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-gold-600/20 rounded-lg text-xs">
              {greetMsg}
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-cream">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
