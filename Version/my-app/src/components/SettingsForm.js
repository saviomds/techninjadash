"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SettingsForm({ settings, setRefreshTrigger }) {
  const [formState, setFormState] = useState(settings || {});
  const [logoFile, setLogoFile] = useState(null);

  async function handleSettingsUpdate(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("shopName", formState.shopName || "");
    formData.append("currency", formState.currency || "");

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    const res = await fetch("/api/settings", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      alert("Settings Saved!");
      setRefreshTrigger((prev) => prev + 1);
    } else {
      alert("Failed to save settings.");
    }
  }

  return (
    <div className="bg-white p-4 md:p-8 rounded-xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-black">
        Shop Configuration
      </h2>

      <form onSubmit={handleSettingsUpdate} className="space-y-4">
        {/* SHOP NAME */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shop Name</label>
          <input
            className="w-full border p-3 mt-1 rounded-lg text-black focus:ring-2 focus:ring-black outline-none transition-all"
            value={formState.shopName || ""}
            onChange={(e) =>
              setFormState({ ...formState, shopName: e.target.value })
            }
            placeholder="Enter Shop Name"
          />
        </div>

        {/* CURRENCY */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Currency Symbol</label>
          <input
            className="w-full border p-3 mt-1 rounded-lg text-black focus:ring-2 focus:ring-black outline-none transition-all"
            value={formState.currency || ""}
            onChange={(e) =>
              setFormState({ ...formState, currency: e.target.value })
            }
            placeholder="e.g. Rs, $, €"
          />
        </div>

        {/* LOGO */}
        <div className="py-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shop Logo</label>
          <input
            type="file"
            className="block w-full text-sm text-slate-500 mt-1
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-black file:text-white
              hover:file:bg-gray-800 cursor-pointer"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files[0])}
          />
        </div>

        {formState.logo && typeof formState.logo === 'string' && formState.logo.startsWith('/') && (
          <Image
            src={formState.logo}
            width={80}
            height={80}
            alt="logo"
            className="mt-3"
          />
        )}

        <button className="bg-black text-white px-4 py-2 mt-4 rounded">
          Save
        </button>
      </form>
    </div>
  );
}