"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
      body: formData,
    });

    if (res.ok) {
      alert("Settings Saved!");
      setRefreshTrigger((prev) => prev + 1);
    } else {
      alert("Failed to save settings.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            ⚙️ Shop Settings
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your store configuration and branding
          </p>
        </div>

        <form onSubmit={handleSettingsUpdate} className="space-y-6">

          {/* Shop Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Shop Name
            </label>
            <input
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 
              focus:ring-2 focus:ring-black focus:border-black outline-none
              transition"
              value={formState.shopName || ""}
              onChange={(e) =>
                setFormState({ ...formState, shopName: e.target.value })
              }
              placeholder="Enter your shop name"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Currency
            </label>
            <input
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 
              focus:ring-2 focus:ring-black focus:border-black outline-none
              transition"
              value={formState.currency || ""}
              onChange={(e) =>
                setFormState({ ...formState, currency: e.target.value })
              }
              placeholder="e.g. Rs, $, €"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Logo
            </label>

            <div className="mt-2 flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:bg-black file:text-white
                hover:file:bg-gray-800 cursor-pointer"
              />
            </div>

            {/* Preview */}
            {formState.logo && typeof formState.logo === "string" && (
              <div className="mt-4 flex items-center gap-4">
                <Image
                  src={formState.logo}
                  width={70}
                  height={70}
                  alt="logo"
                  className="rounded-xl border"
                />
                <span className="text-sm text-gray-500">
                  Current logo
                </span>
              </div>
            )}
          </div>
        
          {/* Save Button */}
          <button
            className="w-full bg-black text-white py-3 rounded-xl font-semibold
            hover:bg-gray-900 transition active:scale-[0.99]"
          >
            Save Settings
          </button>

          <Link href="#" className="text-sm text-blue-600">
            Forgot Password?
          </Link>
        </form>
      </div>
    </div>
  );
}