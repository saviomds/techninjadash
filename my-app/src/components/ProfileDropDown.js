'use client';

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

export default function ProfileDropdown({ settings }) {
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
          className="flex items-center gap-3 pl-1 pr-3 py-1 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 focus:outline-none group"
        >
          <div className="relative h-9 w-9">
            {settings?.logo && !imgError ? (
              <Image
                src={settings.logo}
                alt="Logo"
                width={36}
                height={36}
                className="rounded-xl object-cover border border-slate-50"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-9 h-9 bg-slate-900 text-white flex items-center justify-center rounded-xl font-black text-xs">
                {settings?.shopName?.substring(0, 2).toUpperCase() || "TN"}
              </div>
            )}
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-blue-500 border-2 border-white rounded-full"></span>
          </div>
          
          <div className="hidden md:block text-left">
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">
              {settings?.shopName || "TechNinja"}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">
              Administrator
            </p>
          </div>

          <ChevronDownIcon className={`text-slate-300 group-hover:text-blue-500 transition-all duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-3 w-60 origin-top-right rounded-[1.5rem] bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-5 py-5 border-b border-slate-50 bg-slate-50/30">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Account Settings</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Registry Management
              </p>
            </div>

            <div className="p-2">
              <MenuButton 
                icon={<InfoIcon />} 
                label="Support Center" 
                onClick={() => handleNav('/support')} 
              />
              
              {/* NEW NAVIGATION ITEM */}
              <MenuButton 
                icon={<GlobeIcon />} 
                label="TechNinja Page" 
                onClick={() => handleExternalNav('https://techninjaa.onrender.com/')} 
              />

              <div className="my-1 border-t border-slate-50" />
              
              <button 
                onClick={() => { setIsOpen(false); setShowLogoutModal(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowLogoutModal(false)} />
          
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOutIcon />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Terminate Session?</h3>
              <p className="text-sm font-semibold text-slate-500 mt-2 leading-relaxed">
                You will need to re-authenticate to access the registry dashboard.
              </p>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
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

function MenuButton({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all group"
    >
      <span className="text-slate-400 group-hover:text-blue-500 transition-colors">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}