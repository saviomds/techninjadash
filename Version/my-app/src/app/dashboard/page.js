"use client";

import { useEffect, useState } from "react";
import SlideBar from "@/components/SlideBar";
import SettingsForm from "@/components/SettingsForm";
import Table from "@/components/Table";

export default function Dashboard() {
  const [view, setView] = useState("home");
  const [data, setData] = useState([]);
  const [settings, setSettings] = useState({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null); // State for image file
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ 
    revenue: 0, 
    repairs: 0, 
    products: 0, 
    lowStock: 0, 
    customers: 0,
    staff: 0,
    repairStats: { pending: 0, done: 0 },
    recent: [] 
  });

  // ✅ CLEAN DATA LOADER (FIXED - NO LOOP BUG)
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const res = await fetch("/api/data");
        const db = await res.json();

        if (ignore) return;

        setSettings(db.settings || {});
        setData(Array.isArray(db[view]) ? db[view] : []);

        // Calculate Dashboard Stats
        if (view === "home") {
          const revenue = (db.orders || []).reduce((acc, curr) => acc + Number(curr.price || 0), 0);
          const pendingRepairs = (db.repairs || []).filter(r => r.status?.toLowerCase() === "pending").length;
          const doneRepairs = (db.repairs || []).filter(r => r.status?.toLowerCase() === "done").length;
          const products = (db.products || []).length;
          const lowStock = (db.products || []).filter(p => Number(p.stock) < 5).length;
          
          setStats({ 
            revenue, 
            repairs: pendingRepairs, 
            products, 
            lowStock, 
            customers: (db.customers || []).length,
            staff: (db.staff || []).length,
            repairStats: { pending: pendingRepairs, done: doneRepairs },
            recent: db.orders?.slice(-5).reverse() || [] 
          });
        }
      } catch (err) {
        console.log("LOAD ERROR:", err);
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [view, refreshTrigger]);

  // DELETE ITEM
  async function deleteItem(id) {
    await fetch(`/api/${view}/${id}`, {
      method: "DELETE",
    });

    // refresh
    setRefreshTrigger(prev => prev + 1);
  }

  // ADD ITEM
  async function addItem() {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imageFile) {
      formData.append('image', imageFile); // 'image' is the fieldname expected by the API
    }

    await fetch(`/api/${view}`, {
      method: "POST",
      body: formData,
    });

    setOpen(false);
    setForm({});
    setImageFile(null); // Clear image file after submission
    setRefreshTrigger(prev => prev + 1);
  }

  // Define schemas for dynamic form fields
  const schemas = {
    products: [
      { label: 'Product Name', key: 'name', type: 'text' },
      { label: 'Category', key: 'category', type: 'text' },
      { label: 'Price', key: 'price', type: 'number' },
      { label: 'Stock Quantity', key: 'stock', type: 'number' },
      { label: 'Description', key: 'description', type: 'text' },
      { label: 'Product Image', key: 'image', type: 'file' }
    ],
    repairs: [
      { label: 'Device Name', key: 'device', type: 'text' },
      { label: 'Customer Name', key: 'customer', type: 'text' },
      { label: 'Phone', key: 'phone', type: 'text' },
      { label: 'Issue', key: 'issue', type: 'text' },
      { label: 'Status (Pending/Done)', key: 'status', type: 'text' },
      { label: 'Cost', key: 'price', type: 'number' },
      { label: 'Description', key: 'description', type: 'text' },
      { label: 'Device Image', key: 'image', type: 'file' }
    ],
    orders: [
      { label: 'Product Name', key: 'name', type: 'text' },
      { label: 'Customer Name', key: 'customer', type: 'text' },
      { label: 'Phone', key: 'phone', type: 'text' },
      { label: 'Quantity', key: 'qty', type: 'number' },
      { label: 'Total Price', key: 'price', type: 'number' },
      { label: 'Payment Status', key: 'payment', type: 'text' },
      { label: 'Order Status', key: 'status', type: 'text' },
      { label: 'Description', key: 'description', type: 'text' },
      { label: 'Reference Image', key: 'image', type: 'file' }
    ],
    customers: [
      { label: 'Full Name', key: 'name', type: 'text' },
      { label: 'Phone', key: 'phone', type: 'text' },
      { label: 'Email', key: 'email', type: 'text' },
      { label: 'Address', key: 'address', type: 'text' },
      { label: 'Notes', key: 'description', type: 'text' },
      { label: 'Profile Image', key: 'image', type: 'file' }
    ],
    staff: [
      { label: 'Full Name', key: 'name', type: 'text' },
      { label: 'Role', key: 'role', type: 'text' },
      { label: 'Phone', key: 'phone', type: 'text' },
      { label: 'Email', key: 'email', type: 'text' },
      { label: 'Salary', key: 'salary', type: 'number' },
      { label: 'Notes', key: 'description', type: 'text' },
      { label: 'Staff Photo', key: 'image', type: 'file' }
    ],
    settings: [] // Settings handled by a separate component
  };

  const currentSchema = schemas[view] || [];

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">

      {/* SIDEBAR */}
      <SlideBar 
        view={view} 
        setView={setView} 
        settings={settings} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* MOBILE TOP NAV */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            ☰
          </button>
          <span className="font-bold">{settings?.shopName || "TechNinja"}</span>
          <div className="w-8" /> {/* Spacer */}
        </header>

        <main className="p-4 md:p-8 flex-1">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between mb-6 items-start sm:items-center gap-4">

            <h1 className="text-2xl font-bold">
              {view.toUpperCase()}
            </h1>

            {view !== "home" && view !== "settings" && (
              <button
                onClick={() => setOpen(true)}
                className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded shadow-lg active:scale-95 transition-transform"
              >
                + Add {view.slice(0, -1)}
              </button>
            )}

          </div>

          {/* CONTENT AREA */}
          {view === "home" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* STATS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-tight">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">{settings.currency || "Rs"} {stats.revenue.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-tight">Active Repairs</p>
                  <h3 className="text-2xl font-bold mt-1 text-orange-600">{stats.repairs}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-tight">Inventory Items</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.products}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm border-red-100 bg-red-50/30">
                  <p className="text-sm text-red-500 font-medium uppercase tracking-tight">Low Stock Alerts</p>
                  <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.lowStock}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* REPAIR DISTRIBUTION */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-center">
                  <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">📊 Repair Distribution</h2>
                  <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden flex shadow-inner">
                    <div 
                      className="bg-orange-400 transition-all duration-1000 ease-out" 
                      style={{ width: `${(stats.repairStats.pending / (stats.repairStats.pending + stats.repairStats.done || 1)) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-green-500 transition-all duration-1000 ease-out" 
                      style={{ width: `${(stats.repairStats.done / (stats.repairStats.pending + stats.repairStats.done || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-3 text-xs font-bold text-gray-500">
                    <span>PENDING: {stats.repairStats.pending}</span>
                    <span>COMPLETED: {stats.repairStats.done}</span>
                  </div>
                  <div className="mt-8 pt-6 border-t grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase">Customers</p>
                      <p className="text-xl font-bold">{stats.customers}</p>
                    </div>
                    <div className="text-center border-l">
                      <p className="text-xs text-gray-400 uppercase">Staff</p>
                      <p className="text-xl font-bold">{stats.staff}</p>
                    </div>
                  </div>
                </div>

                {/* RECENT ORDERS TABLE */}
                <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b bg-gray-50/50">
                    <h2 className="font-bold text-gray-700">Recent Transactions</h2>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <Table data={stats.recent} view="orders" deleteItem={deleteItem} />
                  </div>
                </div>
              </div>
            </div>
          ) : view === 'settings' ? (
            <SettingsForm 
              key={settings.shopName + settings.logo}
              settings={settings} 
              setSettings={setSettings} 
              setRefreshTrigger={setRefreshTrigger} 
            />
          ) : (
            <Table
              data={data}
              view={view}
              deleteItem={deleteItem}
            />
          )}

        </main>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">

          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">

            <h2 className="text-xl font-bold mb-4">
              Add {view}
            </h2>

            {currentSchema.map((field) => {
              if (field.type === 'file') {
                return (
                  <div key={field.key} className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <input
                      type="file"
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      accept="image/*"
                    />
                  </div>
                );
              } else {
                return (
                  <input
                    key={field.key}
                    className="w-full border p-2 mb-2"
                    placeholder={field.label}
                    type={field.type}
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  />
                );
              }
            })}

            <div className="flex gap-2 mt-4">

              <button
                onClick={addItem}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Save
              </button>

              <button
                onClick={() => setOpen(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}