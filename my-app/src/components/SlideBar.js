"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SlideBar({ view, setView, settings, isOpen, onClose }) {
  const router = useRouter();

  const menuItems = [
    "home",
    "products",
    "repairs",
    "orders",
    "customers",
    "staff",
    "settings",
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r shadow-xl
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.logo ? (
              <Image
                src={settings.logo}
                alt="Logo"
                width={42}
                height={42}
                className="rounded-lg object-cover border"
              />
            ) : (
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-lg font-bold">
                TN
              </div>
            )}

            <div>
              <h1 className="font-bold text-lg text-gray-900 leading-tight">
                {settings?.shopName || "TechNinja"}
              </h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>

          {/* CLOSE BTN MOBILE */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* MENU */}
        <nav className="p-4 space-y-1">
          {menuItems.map((v) => (
            <div
              key={v}
              onClick={() => {
                setView(v);
                onClose();
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium capitalize
                ${
                  view === v
                    ? "bg-black text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {/* active indicator dot */}
              <div
                className={`w-2 h-2 rounded-full transition-all
                  ${view === v ? "bg-white" : "bg-gray-300 group-hover:bg-black"}
                `}
              />

              {v}
            </div>
          ))}

          {/* LOGOUT */}
          <div className="pt-6 mt-6 border-t">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition"
            >
              <div className="w-2 h-2 rounded-full bg-red-400" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}