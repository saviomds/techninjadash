"use client";

import { useEffect, useState } from "react";
import SlideBar from "@/components/SlideBar";
import SettingsForm from "@/components/SettingsForm";
import Table from "@/components/Table";
import ProfileDropdown from "@/components/ProfileDropDown";

export default function Dashboard() {
  const [view, setView] = useState("home");
  const [data, setData] = useState([]);
  const [settings, setSettings] = useState({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- NEW: DARK MODE STATE ---
  const [darkMode, setDarkMode] = useState(false);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [stats, setStats] = useState({ 
    revenue: 0, repairs: 0, products: 0, lowStock: 0, customers: 0, staff: 0,
    repairStats: { pending: 0, done: 0 }, recent: [] 
  });

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const res = await fetch("/api/data");
        const db = await res.json();
        if (ignore) return;
        setSettings(db.settings || {});
        setData(Array.isArray(db[view]) ? db[view] : []);

        const alerts = [];
        if (db.orders?.length > 0) {
          alerts.push({ title: "New Order", desc: `Latest: ${db.orders[db.orders.length - 1].customer}`, type: "order" });
        }
        const pendingRepairs = (db.repairs || []).filter(r => r.status?.toLowerCase() === "pending");
        if (pendingRepairs.length > 0) {
          alerts.push({ title: "Pending Repairs", desc: `You have ${pendingRepairs.length} devices to fix`, type: "repair" });
        }
        if (db.customers?.length > 0) {
          alerts.push({ title: "New Customer", desc: `${db.customers[db.customers.length - 1].name} added`, type: "customer" });
        }
        const lowStock = (db.products || []).filter(p => Number(p.stock) < 5).length;
        if (lowStock > 0) {
          alerts.push({ title: "Low Stock", desc: `${lowStock} items need restocking`, type: "stock" });
        }
        setNotifications(alerts);

        if (view === "home") {
          const revenue = (db.orders || []).reduce((acc, curr) => acc + Number(curr.price || 0), 0);
          const pendingCount = pendingRepairs.length;
          const doneRepairs = (db.repairs || []).filter(r => r.status?.toLowerCase() === "done").length;
          setStats({ 
            revenue, repairs: pendingCount, products: (db.products || []).length,
            lowStock, customers: (db.customers || []).length, staff: (db.staff || []).length,
            repairStats: { pending: pendingCount, done: doneRepairs },
            recent: db.orders?.slice(-5).reverse() || [] 
          });
        }
      } catch (err) { console.log("LOAD ERROR:", err); }
    }
    fetchData();
    return () => { ignore = true; };
  }, [view, refreshTrigger]);

  async function deleteItem(id) {
    await fetch(`/api/${view}/${id}`, { method: "DELETE" });
    setRefreshTrigger(prev => prev + 1);
  }

  async function addItem() {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) formData.append('image', imageFile);
    const res = await fetch(`/api/${view}`, { method: "POST", body: formData });
    if (res.ok) { setOpen(false); setForm({}); setImageFile(null); setRefreshTrigger(prev => prev + 1); }
  }

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
      { label: 'Total Price', key: 'price', type: 'number' },
      { label: 'Order Status', key: 'status', type: 'text' },
      { label: 'Reference Image', key: 'image', type: 'file' }
    ],
    customers: [
      { label: 'Full Name', key: 'name', type: 'text' },
      { label: 'Phone', key: 'phone', type: 'text' },
      { label: 'Email', key: 'email', type: 'text' },
      { label: 'Profile Image', key: 'image', type: 'file' }
    ],
    staff: [
      { label: 'Full Name', key: 'name', type: 'text' },
      { label: 'Role', key: 'role', type: 'text' },
      { label: 'Staff Photo', key: 'image', type: 'file' }
    ],
    settings: []
  };

  const currentSchema = schemas[view] || [];

  return (
    <div className={`flex min-h-screen font-sans antialiased transition-colors duration-300 ${darkMode ? "bg-slate-950 text-white" : "bg-[#F8FAFC] text-slate-900"}`}>
      <SlideBar 
        view={view} setView={setView} settings={settings} 
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} 
        darkMode={darkMode} // Passing down if needed
      />

      <div className={`flex-1 flex flex-col min-w-0 border-l ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
        
        <header className={`flex items-center justify-between px-8 py-4 border-b sticky top-0 z-30 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          
          {/* LEFT SIDE */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 rounded-lg ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>☰</button>
              <h1 className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  TechNinja <span className="mx-2 text-slate-200">/</span> 
                  <span className={darkMode ? "text-white" : "text-slate-900"}>{view}</span>
              </h1>
            </div>

            {/* 🔔 Notifications */}
            <div className={`relative border-l pl-4 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl transition-colors relative flex items-center ${darkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                <span className="text-xl">🔔</span>
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>

              {showNotifications && (
                <div className={`absolute left-0 mt-3 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden border ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
                  <div className={`px-5 py-4 border-b ${darkMode ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50/50"}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerts Center</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n, i) => (
                        <div key={i} className={`p-4 border-b ${darkMode ? "border-slate-800 hover:bg-slate-800" : "border-slate-50 hover:bg-slate-50"}`}>
                          <p className={`text-[9px] font-bold uppercase mb-1 ${
                            n.type === 'repair' ? 'text-orange-500' : 
                            n.type === 'customer' ? 'text-green-500' : 
                            n.type === 'stock' ? 'text-red-500' : 'text-blue-500'
                          }`}>{n.title}</p>
                          <p className={`text-xs font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{n.desc}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs italic">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE: Quick Actions + Dark Mode Toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl transition-all border ${darkMode ? "bg-slate-800 border-slate-700 text-yellow-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}
              title="Toggle Theme"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <div className={`hidden lg:flex items-center gap-2 p-1 rounded-2xl border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100"}`}>
              <button 
                onClick={() => { setView("repairs"); setOpen(true); }}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${darkMode ? "text-slate-300 hover:text-white hover:bg-slate-700" : "text-slate-600 hover:text-blue-600 hover:bg-white"}`}
              >
                🛠️ Repair
              </button>
              <div className={`w-[1px] h-4 ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}></div>
              <button 
                onClick={() => { setView("customers"); setOpen(true); }}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${darkMode ? "text-slate-300 hover:text-white hover:bg-slate-700" : "text-slate-600 hover:text-blue-600 hover:bg-white"}`}
              >
                👤 Customer
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center">
            <ProfileDropdown settings={settings} darkMode={darkMode} />
          </div>
        </header>

        <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-10">
            <div>
               <h2 className={`text-4xl font-extrabold tracking-tight capitalize ${darkMode ? "text-white" : "text-slate-900"}`}>{view}</h2>
               <p className="text-slate-500 text-sm mt-1">Operational overview and data management.</p>
            </div>
            {view !== "home" && view !== "settings" && (
                <button
                  onClick={() => setOpen(true)}
                  className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 ${darkMode ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20" : "bg-slate-900 hover:bg-blue-700 text-white shadow-slate-200"}`}
                >
                  + Add {view.slice(0, -1)}
                </button>
            )}
          </div>

          {view === "home" ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", val: `${settings.currency || "Rs"} ${stats.revenue.toLocaleString()}`, sub: "Gross earnings" },
                  { label: "Active Repairs", val: stats.repairs, sub: "Pending pickup", color: "text-blue-500" },
                  { label: "Total Stock", val: stats.products, sub: "Inventory count" },
                  { label: "Critical Stock", val: stats.lowStock, sub: "Below 5 units", color: "text-red-500" },
                ].map((s, i) => (
                  <div key={i} className={`p-6 border rounded-2xl shadow-sm transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <h3 className={`text-3xl font-black mt-2 ${s.color || (darkMode ? "text-white" : "text-slate-900")}`}>{s.val}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`p-8 rounded-2xl border shadow-sm transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-8 ${darkMode ? "text-slate-400" : "text-slate-900"}`}>Repair Progress</h3>
                  <div className={`w-full h-3 rounded-full overflow-hidden flex ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                    <div className="bg-blue-600" style={{ width: `${(stats.repairStats.done / (stats.repairStats.pending + stats.repairStats.done || 1)) * 100}%` }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
                        <p className={`text-xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{stats.repairStats.pending}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Completed</p>
                        <p className="text-xl font-black text-blue-500">{stats.repairStats.done}</p>
                    </div>
                  </div>
                </div>
                <div className={`lg:col-span-2 rounded-2xl border shadow-sm overflow-hidden transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className={`px-6 py-4 border-b ${darkMode ? "border-slate-800 bg-slate-800/50" : "border-slate-50 bg-slate-50/50"}`}>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Activity</span>
                    </div>
                    <Table data={stats.recent} view="orders" deleteItem={deleteItem} darkMode={darkMode} />
                </div>
              </div>
            </div>
          ) : view === 'settings' ? (
            <div className={`p-10 rounded-2xl border shadow-sm max-w-3xl transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
               <SettingsForm 
                 key={settings.shopName + settings.logo}
                 settings={settings} 
                 setSettings={setSettings} 
                 setRefreshTrigger={setRefreshTrigger} 
                 darkMode={darkMode}
               />
            </div>
          ) : (
            <div className={`rounded-2xl border shadow-sm overflow-hidden p-2 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <Table data={data} view={view} deleteItem={deleteItem} darkMode={darkMode} />
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className={`absolute inset-0 backdrop-blur-sm ${darkMode ? "bg-black/80" : "bg-slate-900/60"}`} onClick={() => setOpen(false)}></div>
          <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className={`px-8 py-6 border-b flex justify-between items-center ${darkMode ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50/50"}`}>
                <div>
                  <h2 className={`font-black uppercase text-xs tracking-[0.2em] ${darkMode ? "text-white" : "text-slate-900"}`}>Create New Record</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Type: {view.slice(0, -1)}</p>
                </div>
                <button onClick={() => setOpen(false)} className={`w-8 h-8 flex items-center justify-center border rounded-full transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-400 hover:text-slate-900"}`}>✕</button>
            </div>
            <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
              {currentSchema.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                  {field.type === 'file' ? (
                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${darkMode ? "border-slate-700 bg-slate-800/50 hover:border-blue-500" : "border-slate-200 bg-slate-50/50 hover:border-blue-400"}`}>
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-8 w-8 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-xs">
                          <label className="relative cursor-pointer bg-transparent rounded-md font-bold text-blue-500 hover:text-blue-400">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <input
                      className={`w-full rounded-xl p-3.5 text-sm font-medium outline-none transition-all border ${darkMode ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" : "bg-slate-50/30 border-slate-200 text-slate-900 focus:border-blue-500"}`}
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                      type={field.type}
                      value={form[field.key] || ''}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className={`p-8 border-t flex gap-4 ${darkMode ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50/50"}`}>
              <button onClick={addItem} className={`flex-[2] py-4 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg ${darkMode ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20" : "bg-slate-900 hover:bg-blue-600 shadow-slate-200"}`}>
                Confirm & Save
              </button>
              <button onClick={() => setOpen(false)} className={`flex-1 py-4 border text-xs font-black uppercase tracking-widest rounded-xl transition-all ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}