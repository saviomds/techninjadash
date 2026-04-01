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
  const [stats, setStats] = useState({ 
    revenue: 0, repairs: 0, products: 0, lowStock: 0, customers: 0, staff: 0,
    repairStats: { pending: 0, done: 0 }, recent: [] 
  });

  // PRESERVING ALL LOGIC
  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const res = await fetch("/api/data");
        const db = await res.json();
        if (ignore) return;
        setSettings(db.settings || {});
        setData(Array.isArray(db[view]) ? db[view] : []);
        if (view === "home") {
          const revenue = (db.orders || []).reduce((acc, curr) => acc + Number(curr.price || 0), 0);
          const pendingRepairs = (db.repairs || []).filter(r => r.status?.toLowerCase() === "pending").length;
          const doneRepairs = (db.repairs || []).filter(r => r.status?.toLowerCase() === "done").length;
          setStats({ 
            revenue, repairs: pendingRepairs, products: (db.products || []).length,
            lowStock: (db.products || []).filter(p => Number(p.stock) < 5).length,
            customers: (db.customers || []).length, staff: (db.staff || []).length,
            repairStats: { pending: pendingRepairs, done: doneRepairs },
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

  // ALL YOUR DATA STRUCTURES ARE HERE
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
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      
      <SlideBar 
        view={view} setView={setView} settings={settings} 
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 border-l border-slate-200">
        
        {/* HEADER */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">☰</button>
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
               TechNinja <span className="mx-2 text-slate-200">/</span> 
               <span className="text-slate-900">{view}</span>
            </h1>
          </div>
          <ProfileDropdown settings={settings} />
        </header>

        <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
          
          {/* VIEW TITLE & ADD BUTTON */}
          <div className="flex justify-between items-end mb-10">
            <div>
               <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 capitalize">{view}</h2>
               <p className="text-slate-500 text-sm mt-1">Operational overview and data management.</p>
            </div>
            {view !== "home" && view !== "settings" && (
                <button
                  onClick={() => setOpen(true)}
                  className="bg-slate-900 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-slate-200 active:scale-95"
                >
                  + Add {view.slice(0, -1)}
                </button>
            )}
          </div>

          {/* DYNAMIC VIEW SELECTOR */}
          {view === "home" ? (
            <div className="space-y-8">
              {/* STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", val: `${settings.currency || "Rs"} ${stats.revenue.toLocaleString()}`, sub: "Gross earnings" },
                  { label: "Active Repairs", val: stats.repairs, sub: "Pending pickup", color: "text-blue-600" },
                  { label: "Total Stock", val: stats.products, sub: "Inventory count" },
                  { label: "Critical Stock", val: stats.lowStock, sub: "Below 5 units", color: "text-red-600" },
                ].map((s, i) => (
                  <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <h3 className={`text-3xl font-black mt-2 ${s.color || "text-slate-900"}`}>{s.val}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* GRAPHS / TABLES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-8">Repair Progress</h3>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div className="bg-blue-600" style={{ width: `${(stats.repairStats.done / (stats.repairStats.pending + stats.repairStats.done || 1)) * 100}%` }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
                        <p className="text-xl font-black">{stats.repairStats.pending}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Completed</p>
                        <p className="text-xl font-black text-blue-600">{stats.repairStats.done}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Activity</span>
                   </div>
                   <Table data={stats.recent} view="orders" deleteItem={deleteItem} />
                </div>
              </div>
            </div>
          ) : view === 'settings' ? (
            /* ✅ FULL SETTINGS FORM SECTION */
            <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm max-w-3xl">
               <SettingsForm 
                 key={settings.shopName + settings.logo}
                 settings={settings} 
                 setSettings={setSettings} 
                 setRefreshTrigger={setRefreshTrigger} 
               />
            </div>
          ) : (
            /* ✅ FULL DATA TABLES FOR CUSTOMERS / STAFF / ETC */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2">
              <Table data={data} view={view} deleteItem={deleteItem} />
            </div>
          )}
        </main>
      </div>

      {/* ✅ PROFESSIONAL MODAL (WITH DYNAMIC INPUTS) */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Create New Record</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Type: {view.slice(0, -1)}</p>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition-colors">✕</button>
            </div>
            
            <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* ✅ THIS MAPS THE SCHEMAS FOR CUSTOMERS, STAFF, PRODUCTS, ETC. */}
              {currentSchema.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                  {field.type === 'file' ? (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-blue-400 transition-colors bg-slate-50/50">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-8 w-8 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-xs text-slate-600">
                          <label className="relative cursor-pointer bg-transparent rounded-md font-bold text-blue-600 hover:text-blue-500">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <input
                      className="w-full border border-slate-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-slate-50/30 transition-all"
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                      type={field.type}
                      value={form[field.key] || ''}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
              <button onClick={addItem} className="flex-[2] py-4 bg-slate-900 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-slate-200">
                Confirm & Save
              </button>
              <button onClick={() => setOpen(false)} className="flex-1 py-4 border border-slate-200 bg-white text-slate-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}