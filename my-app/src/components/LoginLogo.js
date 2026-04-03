"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginLogo({ settings, darkMode }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [prevLogo, setPrevLogo] = useState(settings?.logo);

  // Sync state if settings logo changes externally
  if (settings?.logo !== prevLogo) {
    setPrevLogo(settings?.logo);
    setImgError(false);
  }

  return (
    <div className="flex items-center gap-3">
      {settings?.logo && !imgError ? (
        <div 
          className={`relative w-[42px] h-[42px] rounded-xl overflow-hidden border transition-all cursor-pointer hover:opacity-80 active:scale-95 ${
            darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
          }`}
          onClick={() => router.push("/")}
        >
          <Image
            src={settings.logo}
            alt="Logo"
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div 
          className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-xs tracking-tighter cursor-pointer transition-all active:scale-95 ${
            darkMode 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
              : "bg-slate-900 text-white shadow-md shadow-slate-200"
          }`}
          onClick={() => router.push("/")}
        >
          {settings?.shopName?.substring(0, 2).toUpperCase() || "TN"}
        </div>
      )}
    </div>
  )
}