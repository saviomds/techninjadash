"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SettingsForm({ settings, setRefreshTrigger, darkMode }) {
  const [formState, setFormState] = useState(settings || {});
  const [logoFile, setLogoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSettingsUpdate(e) {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append("shopName", formState.shopName || "");
    formData.append("currency", formState.currency || "");

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    try {
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
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      darkMode ? "bg-slate-950" : "bg-slate-50"
    }`}>
      <div className={`w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 border transition-all ${
        darkMode 
          ? "bg-slate-900 border-slate-800 shadow-black/40" 
          : "bg-white border-slate-100 shadow-slate-200/50"
      }`}>
        
        {/* Header */}
        <div className="mb-10">
          <h2 className={`text-2xl font-black tracking-tight flex items-center gap-3 ${
            darkMode ? "text-white" : "text-slate-900"
          }`}>
            <span className="p-2 bg-blue-500/10 rounded-xl text-blue-500 text-lg">⚙️</span>
            Shop Settings
          </h2>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2 ml-12">
            Configure branding & regional registry defaults
          </p>
        </div>

        <form onSubmit={handleSettingsUpdate} className="space-y-8">

          {/* Shop Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Business Identity
            </label>
            <input
              className={`w-full px-5 py-4 rounded-2xl border text-sm font-semibold outline-none transition-all ${
                darkMode 
                  ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
                  : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-blue-500 focus:shadow-lg"
              }`}
              value={formState.shopName || ""}
              onChange={(e) =>
                setFormState({ ...formState, shopName: e.target.value })
              }
              placeholder="Enter your shop name"
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Local Currency Symbol
            </label>
            <input
              className={`w-full px-5 py-4 rounded-2xl border text-sm font-semibold outline-none transition-all ${
                darkMode 
                  ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
                  : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-blue-500 focus:shadow-lg"
              }`}
              value={formState.currency || ""}
              onChange={(e) =>
                setFormState({ ...formState, currency: e.target.value })
              }
              placeholder="e.g. Rs, $, €"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Brand Asset (Logo)
            </label>

            <div className={`p-6 rounded-2xl border-2 border-dashed transition-all ${
              darkMode 
                ? "bg-slate-800/50 border-slate-700 hover:border-blue-500/50" 
                : "bg-slate-50 border-slate-200 hover:border-blue-300"
            }`}>
              <div className="flex items-center gap-6">
                {/* Current Preview or New File Selection */}
                <div className="relative h-16 w-16 flex-shrink-0">
                  {logoFile ? (
                    <div className="h-full w-full bg-blue-500 rounded-xl flex items-center justify-center text-white text-xs font-black">
                      NEW
                    </div>
                  ) : formState.logo ? (
                    <Image
                      src={formState.logo}
                      fill
                      alt="logo"
                      className="rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className={`h-full w-full rounded-xl flex items-center justify-center border-2 border-slate-300 border-dotted ${darkMode ? "bg-slate-900" : "bg-white"}`}>
                      <span className="text-xs text-slate-400">NONE</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label 
                    htmlFor="logo-upload"
                    className={`inline-block px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                      darkMode 
                        ? "bg-slate-700 text-white hover:bg-slate-600" 
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {logoFile ? "Change Selection" : "Upload Image"}
                  </label>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">PNG, JPG or WEBP (Max 2MB)</p>
                </div>
              </div>
            </div>
          </div>
        
          {/* Action Footer */}
          <div className="pt-4 space-y-4">
            <button
              disabled={isSaving}
              className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50 ${
                darkMode 
                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-900/20" 
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200"
              }`}
            >
              {isSaving ? "Synchronizing..." : "Save Registry Settings"}
            </button>

            <div className="text-center">
              <Link 
                href="/forgetPwd" 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                  darkMode ? "text-slate-500 hover:text-blue-400" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Reset Administrative Access?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}