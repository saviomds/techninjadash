"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSyncExternalStore, useState } from "react";

// Helper to detect if we are on the client side
const emptySubscribe = () => () => {};
function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client value
    () => false  // Server value (Initial render)
  );
}

export default function SlideBar({ view, setView, settings, isOpen, onClose, darkMode }) {
  const router = useRouter();
  const hasMounted = useHasMounted(); 
  const [imgError, setImgError] = useState(false);
  const [prevLogo, setPrevLogo] = useState(settings?.logo);

  if (settings?.logo !== prevLogo) {
    setPrevLogo(settings?.logo);
    setImgError(false);
  }

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
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 md:hidden backdrop-blur-[2px] transition-colors duration-300 ${
            darkMode ? "bg-black/60" : "bg-slate-900/40"
          }`}
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 border-r transform transition-all duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}
        `}
      >
        {/* Header Section */}
        <div className={`h-20 px-6 border-b flex items-center justify-between transition-colors ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex-shrink-0">
              {hasMounted && settings?.logo && !imgError ? (
                <Image
                  src={settings.logo}
                  alt="Logo"
                  fill
                  sizes="36px"
                  className={`rounded-lg object-cover border ${
                    darkMode ? "border-slate-700" : "border-slate-100"
                  }`}
                  priority
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center rounded-lg text-xs font-black italic ${
                  darkMode ? "bg-blue-600 text-white" : "bg-slate-900 text-white"
                }`}>
                  {settings?.shopName?.substring(0, 2).toUpperCase() || "TN"}
                </div>
              )}
            </div>

            <div className="overflow-hidden">
              <h1 className={`font-bold text-sm truncate tracking-tight uppercase ${
                darkMode ? "text-white" : "text-slate-900"
              }`}>
                {settings?.shopName || "TechNinja"}
              </h1>
              <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mt-1 ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}>
                Management
              </p>
            </div>
          </div>

          <button onClick={onClose} className={`md:hidden p-2 rounded-lg transition-colors ${
            darkMode ? "text-slate-500 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-50"
          }`}>
            ✕
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 mt-2">
            Main Menu
          </p>

          {menuItems.map((item) => {
            const isActive = view === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  onClose();
                }}
                className={`
                  group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                  ${isActive
                      ? (darkMode 
                          ? "bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/20 shadow-sm" 
                          : "bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm shadow-blue-50")
                      : (darkMode
                          ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold capitalize tracking-tight">
                    {item.id}
                  </span>
                </div>
                {isActive && (
                  <div className={`w-1 h-4 rounded-full animate-in slide-in-from-right-1 duration-300 ${
                    darkMode ? "bg-blue-500" : "bg-blue-600"
                  }`} />
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer / Sign Out Section */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t transition-colors ${
          darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-50 bg-slate-50/30"
        }`}>
          <button
            onClick={logout}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
              darkMode 
                ? "text-slate-400 hover:text-red-400 hover:bg-red-950/30" 
                : "text-slate-500 hover:text-red-600 hover:bg-red-50"
            }`}
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