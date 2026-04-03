"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/** --- Refined Icons --- **/
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
);
const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const ChevronDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9" /></svg>
);

export default function ProfileDropdown({ settings, darkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [prevLogo, setPrevLogo] = useState(settings?.logo);
  const dropdownRef = useRef(null);
  const router = useRouter();

  if (settings?.logo !== prevLogo) {
    setPrevLogo(settings?.logo);
    setImgError(false);
  }

  const handleNav = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleExternalNav = (url) => {
    setIsOpen(false);
    window.open(url, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="fixed top-6 right-8 z-[60]" ref={dropdownRef}>
        {/* Trigger Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 pl-1 pr-3 py-1 border rounded-2xl shadow-sm transition-all duration-200 focus:outline-none group ${
            darkMode 
              ? "bg-slate-900 border-slate-800 hover:border-blue-500 hover:shadow-blue-900/20" 
              : "bg-white border-slate-100 hover:shadow-md hover:border-blue-200"
          }`}
        >
          <div className="relative h-9 w-9">
            {settings?.logo && !imgError ? (
              <Image
                src={settings.logo}
                alt="Logo"
                width={36}
                height={36}
                className={`rounded-xl object-cover border ${darkMode ? "border-slate-700" : "border-slate-50"}`}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className={`w-9 h-9 flex items-center justify-center rounded-xl font-black text-xs ${
                darkMode ? "bg-blue-600 text-white" : "bg-slate-900 text-white"
              }`}>
                {settings?.shopName?.substring(0, 2).toUpperCase() || "TN"}
              </div>
            )}
            <span className={`absolute -top-0.5 -right-0.5 h-3 w-3 bg-blue-500 border-2 rounded-full ${
              darkMode ? "border-slate-900" : "border-white"
            }`}></span>
          </div>
          
          <div className="hidden md:block text-left">
            <p className={`text-[11px] font-black uppercase tracking-tight leading-none ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              {settings?.shopName || "TechNinja"}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">
              Administrator
            </p>
          </div>

          <ChevronDownIcon className={`transition-all duration-300 ${
            isOpen ? 'rotate-180 text-blue-500' : 'text-slate-300 group-hover:text-blue-500'
          }`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`absolute right-0 mt-3 w-60 origin-top-right rounded-[1.5rem] border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl ${
            darkMode 
              ? "bg-slate-900 border-slate-800 shadow-black/50" 
              : "bg-white border-slate-100 shadow-slate-200/50"
          }`}>
            <div className={`px-5 py-5 border-b ${
              darkMode ? "border-slate-800 bg-slate-800/30" : "border-slate-50 bg-slate-50/30"
            }`}>
              <p className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-900"}`}>Account Settings</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Registry Management
              </p>
            </div>

            <div className="p-2">
              <MenuButton 
                icon={<InfoIcon />} 
                label="Support Center" 
                onClick={() => handleNav('/support')} 
                darkMode={darkMode}
              />
              
              <MenuButton 
                icon={<GlobeIcon />} 
                label="TechNinja Page" 
                onClick={() => handleExternalNav('https://techninjaa.onrender.com/')} 
                darkMode={darkMode}
              />

              <div className={`my-1 border-t ${darkMode ? "border-slate-800" : "border-slate-50"}`} />
              
              <button 
                onClick={() => { setIsOpen(false); setShowLogoutModal(true); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors group ${
                  darkMode ? "text-red-400 hover:bg-red-950/30" : "text-red-500 hover:bg-red-50"
                }`}
              >
                <LogOutIcon />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className={`absolute inset-0 backdrop-blur-sm transition-opacity ${
            darkMode ? "bg-black/70" : "bg-slate-900/60"
          }`} onClick={() => setShowLogoutModal(false)} />
          
          <div className={`relative w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
            darkMode ? "bg-slate-900 border border-slate-800" : "bg-white"
          }`}>
            <div className="p-8 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                darkMode ? "bg-red-950/30 text-red-400" : "bg-red-50 text-red-500"
              }`}>
                <LogOutIcon />
              </div>
              <h3 className={`text-xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                Terminate Session?
              </h3>
              <p className={`text-sm font-semibold mt-2 leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                You will need to re-authenticate to access the registry dashboard.
              </p>
            </div>

            <div className={`p-6 border-t flex gap-3 ${
              darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50/50 border-slate-100"
            }`}>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest border rounded-xl transition-all ${
                  darkMode 
                    ? "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800" 
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white rounded-xl shadow-lg transition-all ${
                  darkMode ? "bg-red-600 hover:bg-red-700 shadow-red-900/20" : "bg-slate-900 hover:bg-slate-800 shadow-slate-200"
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MenuButton({ icon, label, onClick, darkMode }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all group ${
        darkMode 
          ? "text-slate-400 hover:bg-slate-800 hover:text-blue-400" 
          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
      }`}
    >
      <span className={`transition-colors ${
        darkMode ? "text-slate-600 group-hover:text-blue-400" : "text-slate-400 group-hover:text-blue-500"
      }`}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}