"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SlideBar({ view, setView, settings, isOpen, onClose }) {
  const router = useRouter();

  // Mapping views to icons for a more professional look
  const menuItems = [
    { id: "home", icon: "📊" },
    { id: "products", icon: "📦" },
    { id: "repairs", icon: "🛠️" },
    { id: "orders", icon: "📝" },
    { id: "customers", icon: "👥" },
    { id: "staff", icon: "👔" },
    { id: "settings", icon: "⚙️" },
  ];

  function logout() {
    localStorage.removeItem("auth");
    router.push("/login");
  }

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER / LOGO SECTION */}
        <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex-shrink-0">
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt="Logo"
                  fill
                  className="rounded-lg object-cover border border-slate-100"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center rounded-lg text-xs font-black italic">
                  TN
                </div>
              )}
            </div>

            <div className="overflow-hidden">
              <h1 className="font-bold text-sm text-slate-900 truncate tracking-tight uppercase">
                {settings?.shopName || "TechNinja"}
              </h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mt-1">
                Management
              </p>
            </div>
          </div>

          <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-400">
            ✕
          </button>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="p-4 space-y-1">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 mt-2">
            Main Menu
          </p>

          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setView(item.id);
                onClose();
              }}
              className={`
                group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                ${
                  view === item.id
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm shadow-blue-50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg transition-transform duration-200 ${view === item.id ? 'scale-110' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold capitalize tracking-tight">
                  {item.id}
                </span>
              </div>

              {/* Active Indicator Bar */}
              {view === item.id && (
                <div className="w-1 h-4 bg-blue-600 rounded-full animate-in slide-in-from-right-1 duration-300" />
              )}
            </div>
          ))}
        </nav>

        {/* FOOTER / LOGOUT */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-50 bg-slate-50/30">
          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg opacity-60 group-hover:opacity-100">🚪</span>
              <span className="text-sm font-bold tracking-tight">Sign Out</span>
            </div>
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        </div>
      </aside>
    </>
  );
}