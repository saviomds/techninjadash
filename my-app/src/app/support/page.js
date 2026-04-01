'use client';

import { useState } from 'react';

// --- Icons ---
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-400"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);

export default function SystemSupportPage() {
  const [activeModal, setActiveModal] = useState(null);

  const adminCards = [
    { 
        id: 'start', 
        title: "Quick Start", 
        desc: "Configure your workshop dashboard in 5 mins.", 
        icon: "⚡", 
        color: "text-amber-500",
        longDesc: "Welcome to TechNinja. To get started, first sync your local inventory, then set up your custom repair statuses in the settings panel." 
    },
    { 
        id: 'flow', 
        title: "Repair Flow", 
        desc: "Master the lifecycle of a ticket.", 
        icon: "🛠️", 
        color: "text-blue-500",
        longDesc: "The flow moves from Pending -> Diagnosing -> Repairing -> Quality Check -> Fixed. You can bypass steps if needed." 
    },
    { 
        id: 'invoice', 
        title: "Invoicing", 
        desc: "Automate billing and manage tax.", 
        icon: "💳", 
        color: "text-emerald-500",
        longDesc: "Invoices are generated as PDFs automatically when a ticket is marked 'Fixed'. You can edit the template in the Finance tab." 
    },
    { 
        id: 'team', 
        title: "Team Access", 
        desc: "Control permissions and staff roles.", 
        icon: "👥", 
        color: "text-purple-500",
        longDesc: "Assign 'Technician' roles to staff to limit their view to assigned tasks only, while 'Admins' retain full dashboard control." 
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase bg-slate-900 text-white rounded-full">
            Internal Systems
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mt-6">
            Dashboard Resources
          </h1>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminCards.map((card) => (
            <div 
              key={card.id}
              onClick={() => setActiveModal(card)}
              className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-slate-900 group-hover:scale-110 transition-all duration-300">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-6">{card.title}</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">{card.desc}</p>
              
              <div className="mt-6 flex items-center text-[10px] font-bold text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Learn More <span className="ml-2">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ADVANCED MODAL POPUP --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blur Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-opacity"
            onClick={() => setActiveModal(null)}
          ></div>
          
          {/* Modal Box */}
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-white/20 transform transition-all animate-in zoom-in-95 fade-in duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
            >
              <CloseIcon />
            </button>

            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-4xl mb-6 shadow-inner">
                    {activeModal.icon}
                </div>
                <h2 className="text-3xl font-bold text-slate-900">{activeModal.title}</h2>
                <div className="h-1 w-12 bg-blue-500 rounded-full my-6"></div>
                
                <p className="text-slate-600 leading-relaxed text-lg font-light">
                    {activeModal.longDesc}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full mt-10">
                    <button className="py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                        Documentation
                    </button>
                    <button className="py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 shadow-xl shadow-blue-200 transition-all">
                        Try Feature
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}