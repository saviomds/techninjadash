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
    "settings"
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
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r p-5 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* CLOSE BUTTON MOBILE */}
        <button onClick={onClose} className="md:hidden absolute top-4 right-4 text-gray-500">
          ✕
        </button>

      {/* LOGO SECTION */}
      <div className="flex items-center gap-3 mb-8">
        {settings?.logo ? (
          <Image
            src={settings.logo}
            alt="Logo"
            width={40}
            height={40}
            className="rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded">
            TN
          </div>
        )}

        <h1 className="font-bold text-xl text-black">
          {settings?.shopName || "TechNinja"}
        </h1>
      </div>

      {/* MENU */}
      <nav className="space-y-2">
        {menuItems.map((v) => (
          <div
            key={v}
            onClick={() => {
              setView(v);
              onClose();
            }}
            className={`p-3 rounded-lg cursor-pointer transition ${
              view === v
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {v.toUpperCase()}
          </div>
        ))}

        <button
          onClick={logout}
          className="w-full text-left p-3 mt-10 text-red-500 hover:bg-red-50 rounded-lg"
        >
          LOGOUT
        </button>
      </nav>
    </aside>
    </>
  );
}