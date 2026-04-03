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
    /* Container ensures no overflow on mobile (iPhone/Android) */
    <div className="w-full max-w-full overflow-x-hidden py-4 px-2 sm:px-4 md:px-6">
      <div className={`w-full rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border transition-all duration-500 ${
        darkMode 
          ? "bg-slate-900 border-slate-800 shadow-2xl shadow-black/50" 
          : "bg-white border-slate-100 shadow-xl shadow-slate-200/40"
      }`}>
        
        {/* Header Section - Adaptive Padding */}
        <div className={`p-6 sm:p-8 md:p-12 pb-6 md:pb-8 border-b transition-colors ${
          darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-50 bg-slate-50/30"
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
              {/* Responsive Icon Size */}
              <div className="h-14 w-14 md:h-20 md:w-20 bg-blue-600 rounded-[1.25rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 flex-shrink-0">
                <span className="text-xl md:text-3xl">⚙️</span>
              </div>
              <div>
                <h2 className={`text-xl md:text-3xl font-black tracking-tight capitalize ${darkMode ? "text-white" : "text-slate-900"}`}>
                  Shop <span className={darkMode ? "text-blue-400" : "text-blue-600"}>Registry</span>
                </h2>
                <p className="text-[9px] md:text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 md:mt-2">Systems Configuration Terminal</p>
              </div>
            </div>
            
            {/* Hidden on small mobile to save space, visible on tablet up */}
            <div className={`hidden sm:flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-2xl border ${
              darkMode ? "bg-slate-950/50 border-slate-800 text-slate-500" : "bg-slate-50 border-slate-100 text-slate-400"
            }`}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Network Active</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSettingsUpdate} className="p-6 sm:p-8 md:p-12 space-y-8 md:space-y-14">
          
          {/* Grid: 1 column on mobile, 2 columns on Large screens (lg) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
            
            {/* Left Column: Core Identity */}
            <div className="space-y-6 md:space-y-10">
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.25em] ml-1 block text-center sm:text-left">
                  Business Identity
                </label>
                <input
                  className={`w-full px-6 md:px-8 py-4 md:py-6 rounded-[1.25rem] md:rounded-[2rem] border text-sm md:text-base font-bold outline-none transition-all duration-300 ${
                    darkMode 
                      ? "bg-slate-800/40 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-800" 
                      : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-blue-500 focus:shadow-2xl focus:shadow-blue-500/5"
                  }`}
                  value={formState.shopName || ""}
                  onChange={(e) => setFormState({ ...formState, shopName: e.target.value })}
                  placeholder="Official Shop Name"
                />
              </div>

              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.25em] ml-1 block text-center sm:text-left">
                  Regional Currency
                </label>
                <input
                  className={`w-full px-6 md:px-8 py-4 md:py-6 rounded-[1.25rem] md:rounded-[2rem] border text-sm md:text-base font-bold outline-none transition-all duration-300 ${
                    darkMode 
                      ? "bg-slate-800/40 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-800" 
                      : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-blue-500 focus:shadow-2xl focus:shadow-blue-500/5"
                  }`}
                  value={formState.currency || ""}
                  onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                  placeholder="e.g. Rs, $, €"
                />
              </div>
            </div>

            {/* Right Column: Asset Upload - Adaptive Heights */}
            <div className="space-y-4">
              <label className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.25em] ml-1 block text-center sm:text-left">
                Visual Branding (Logo)
              </label>
              <div className={`p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-dashed transition-all duration-500 ${
                darkMode 
                  ? "bg-slate-950/30 border-slate-800 hover:border-blue-500/40" 
                  : "bg-slate-50 border-slate-200 hover:border-blue-300"
              }`}>
                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                  <div className="relative h-20 w-20 md:h-32 md:w-32 flex-shrink-0">
                    {logoFile ? (
                      <div className="h-full w-full bg-blue-600 rounded-[1.25rem] md:rounded-[2rem] flex items-center justify-center text-white text-[9px] md:text-[12px] font-black shadow-2xl shadow-blue-600/40 animate-pulse">
                        PENDING
                      </div>
                    ) : formState.logo ? (
                      <Image
                        src={formState.logo}
                        fill
                        alt="logo"
                        className="rounded-[1.25rem] md:rounded-[2rem] object-cover border border-slate-200 shadow-xl"
                      />
                    ) : (
                      <div className={`h-full w-full rounded-[1.25rem] md:rounded-[2rem] flex items-center justify-center border-2 border-slate-300 border-dotted ${darkMode ? "bg-slate-900" : "bg-white"}`}>
                        <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Void</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center sm:text-left space-y-3 md:space-y-4 flex-1">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                      className="hidden"
                    />
                    <label 
                      htmlFor="logo-upload"
                      className={`inline-block px-6 md:px-8 py-3 md:py-4 rounded-[1rem] md:rounded-[1.25rem] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all border shadow-lg ${
                        darkMode 
                          ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700" 
                          : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {logoFile ? "Change Selection" : "Update Brand Asset"}
                    </label>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tighter opacity-50 block mt-2">PNG / WEBP (Max 2MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Action Footer - Adaptive Button Size */}
          <div className="pt-6 md:pt-12 border-t border-dashed border-slate-200/10">
            <button
              disabled={isSaving}
              className={`w-full py-5 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-[10px] md:text-[14px] uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all active:scale-[0.99] disabled:opacity-50 shadow-2xl ${
                darkMode 
                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/40" 
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
              }`}
            >
              {isSaving ? "Synchronizing..." : "Apply Registry Changes"}
            </button>

            {/* Bottom links stack on mobile, horizontal on tablet */}
            <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-2">
              <div className="flex gap-2 md:gap-3 order-2 md:order-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                ))}
              </div>
              <Link 
                href="/forgetPwd" 
                className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b border-transparent hover:border-blue-500 pb-1 order-1 md:order-2 ${
                  darkMode ? "text-slate-500 hover:text-blue-400" : "text-slate-400 hover:text-blue-600"
                }`}
              >
                Reset Administrative Credentials
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}