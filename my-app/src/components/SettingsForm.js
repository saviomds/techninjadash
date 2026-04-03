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
    <div className="w-full max-w-full overflow-x-hidden py-4 px-2 sm:px-4 md:px-6">
      <div className={`w-full rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border transition-all duration-500 ${
        darkMode 
          ? "bg-slate-900 border-slate-800 shadow-2xl shadow-black/50" 
          : "bg-white border-slate-100 shadow-xl shadow-slate-200/40"
      }`}>
        
        {/* Header */}
        <div className={`p-8 md:p-14 pb-8 border-b transition-colors ${
          darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-50 bg-slate-50/30"
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="h-16 w-16 md:h-24 md:w-24 bg-blue-600 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 flex-shrink-0">
                <span className="text-2xl md:text-4xl">⚙️</span>
              </div>
              <div>
                <h2 className={`text-2xl md:text-4xl font-black tracking-tight capitalize ${darkMode ? "text-white" : "text-slate-900"}`}>
                  Shop <span className={darkMode ? "text-blue-400" : "text-blue-600"}>Registry</span>
                </h2>
                <p className="text-[10px] md:text-[13px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Systems Configuration Terminal</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSettingsUpdate} className="p-8 md:p-14 space-y-10 md:space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
            
            {/* Left Column: Inputs */}
            <div className="flex flex-col gap-8 md:gap-10">
              <div className="space-y-4">
                <label className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2 block">
                  Business Identity
                </label>
                <input
                  className={`w-full px-8 py-5 md:py-7 rounded-full border text-base md:text-lg font-bold outline-none transition-all duration-300 ${
                    darkMode 
                      ? "bg-slate-800/40 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-800" 
                      : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-blue-500 focus:shadow-2xl focus:shadow-blue-500/10"
                  }`}
                  value={formState.shopName || ""}
                  onChange={(e) => setFormState({ ...formState, shopName: e.target.value })}
                  placeholder="Official Shop Name"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2 block">
                  Regional Currency
                </label>
                <input
                  className={`w-full px-8 py-5 md:py-7 rounded-full border text-base md:text-lg font-bold outline-none transition-all duration-300 ${
                    darkMode 
                      ? "bg-slate-800/40 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-800" 
                      : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-blue-500 focus:shadow-2xl focus:shadow-blue-500/10"
                  }`}
                  value={formState.currency || ""}
                  onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                  placeholder="e.g. Rs, $, €"
                />
              </div>
            </div>

            {/* Right Column: FIXED UPLOAD AREA */}
            <div className="flex flex-col space-y-4">
              <label className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2 block">
                Visual Branding (Logo)
              </label>
              
              <div className={`p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center text-center ${
                darkMode 
                  ? "bg-slate-950/30 border-slate-800" 
                  : "bg-slate-50 border-slate-200 shadow-inner"
              }`}>
                
                {/* Logo Image - Large and Centered */}
                <div className="relative h-28 w-28 md:h-40 md:w-40 mb-8 flex-shrink-0">
                  {logoFile ? (
                    <div className="h-full w-full bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-[10px] font-black shadow-2xl animate-pulse">
                      PENDING
                    </div>
                  ) : formState.logo ? (
                    <Image
                      src={formState.logo}
                      fill
                      alt="logo"
                      className="rounded-[2rem] object-cover border border-slate-200 shadow-2xl"
                    />
                  ) : (
                    <div className={`h-full w-full rounded-[2rem] flex items-center justify-center border-2 border-slate-300 border-dotted ${darkMode ? "bg-slate-900" : "bg-white"}`}>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Asset</span>
                    </div>
                  )}
                </div>

                {/* Upload Section - Full Width inside the box */}
                <div className="w-full flex flex-col items-center gap-4">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label 
                    htmlFor="logo-upload"
                    className={`w-full max-w-[240px] px-6 py-4 rounded-2xl text-[11px] md:text-[13px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all border shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95 text-center ${
                      darkMode 
                        ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700" 
                        : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {logoFile ? "Change Selection" : "Update Asset"}
                  </label>
                  <p className={`text-[9px] md:text-[11px] font-bold uppercase tracking-tight opacity-50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    PNG / WEBP (MAX 2MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        
          {/* Action Footer */}
          <div className="pt-10 md:pt-16 border-t border-dashed border-slate-200/10 text-center">
            <button
              disabled={isSaving}
              className={`w-full py-6 md:py-10 rounded-full font-black text-[12px] md:text-[16px] uppercase tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xl ${
                darkMode 
                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/40" 
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
              }`}
            >
              {isSaving ? "Updating Registry..." : "Save Global Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}