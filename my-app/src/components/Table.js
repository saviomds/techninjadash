"use client";

import Image from "next/image";
import { useState } from "react";

export default function Table({ data, view, deleteItem, onUpdate }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <span className="text-4xl mb-4 opacity-20">📂</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
          No records found in {view}
        </p>
      </div>
    );
  }

  const formatKey = (key) => key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const getImageSrc = (item) => item?.image || item?.logo || "/default-avatar.png";

  const openModal = (item) => {
    setSelectedItem(item);
    setFormData(item);
    setEditMode(false);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setFormData({});
    setEditMode(false);
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/items/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      if (onUpdate) onUpdate(result.data);
      setSelectedItem(result.data);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (e, value) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(value));
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <th className="px-6 py-3">Primary Entity</th>
              <th className="px-6 py-3">Registry Date</th>
              <th className="px-6 py-3 text-right">Management</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="group bg-white border border-slate-100 hover:border-blue-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => openModal(item)}
              >
                {/* ENTITY INFO */}
                <td className="px-6 py-4 rounded-l-2xl border-y border-l border-slate-100 group-hover:border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="relative w-11 h-11 flex-shrink-0">
                      <Image
                        src={getImageSrc(item)}
                        alt="item"
                        fill
                        className="rounded-xl object-cover border border-slate-100 shadow-sm"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {item.name || item.device || item.customer || "Unlabeled Entry"}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        REF: {String(item.id).slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* DATE */}
                <td className="px-6 py-4 border-y border-slate-100 group-hover:border-blue-100 text-xs font-semibold text-slate-500">
                  {item.date || "—"}
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4 rounded-r-2xl border-y border-r border-slate-100 group-hover:border-blue-100 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
          
          <div 
            className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="px-10 pt-10 pb-6 flex justify-between items-start">
              <div className="flex items-center gap-5">
                <Image
                  src={getImageSrc(formData)}
                  alt="preview"
                  width={64}
                  height={64}
                  className="rounded-2xl border-2 border-white shadow-xl object-cover"
                />
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Record Intelligence</h2>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">{view} Database</p>
                </div>
              </div>
              <button 
                onClick={() => setEditMode(!editMode)}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${
                  editMode ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {editMode ? "Exit Edit" : "Modify Record"}
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="px-10 pb-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(formData).map(([key, value]) => {
                  if (key === "image" || key === "logo" || key === "id") return null;

                  return (
                    <div key={key} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-colors hover:border-blue-200">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {formatKey(key)}
                        </label>
                        {!editMode && (
                          <button
                            onClick={(e) => copyToClipboard(e, value)}
                            className="text-[9px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            COPY
                          </button>
                        )}
                      </div>

                      {editMode ? (
                        <input
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={value || ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      ) : (
                        <div className="text-sm font-bold text-slate-800 break-all leading-relaxed">
                          {value || <span className="text-slate-300 font-normal italic">No data available</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4">
              {editMode ? (
                <button
                  onClick={handleSave}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                >
                  Commit Changes
                </button>
              ) : (
                <button
                  onClick={closeModal}
                  className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Close Inquiry
                </button>
              )}
              <button
                onClick={closeModal}
                className="flex-1 bg-white border border-slate-200 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}