"use client";

import Image from "next/image";
import { useState, useMemo, useEffect } from "react";

export default function Table({ data, view, deleteItem, onUpdate }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for the Image Lightbox
  const [fullscreenImage, setFullscreenImage] = useState(null);
  
  // Feedback states for non-alert messaging
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- UNIQUE CATEGORY LOADER ---
  const categories = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const uniqueCategories = new Set();
    data.forEach(item => {
      if (item.category && typeof item.category === 'string') {
        const cleanCat = item.category.trim().toLowerCase();
        if (cleanCat) {
          uniqueCategories.add(cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1));
        }
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [data]);

  // Filter Logic
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const searchString = `${item.name} ${item.device} ${item.customer} ${item.id} ${item.category}`.toLowerCase();
      return searchString.includes(query);
    });
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const formatKey = (key) => key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const getImageSrc = (item) => item?.image || item?.logo || "/default-avatar.png";
  
  // Validation Helper: Checks if image/logo exists
  const isImageMissing = (item) => !item?.image && !item?.logo;

  const openModal = (item) => {
    setSelectedItem(item);
    setFormData(item);
    setEditMode(false);
    setStatus({ type: "", message: "" });
    setErrors([]);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setFormData({});
    setStatus({ type: "", message: "" });
    setErrors([]);
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors.includes(key)) {
      setErrors(prev => prev.filter(e => e !== key));
    }
  };

  const handleSave = async () => {
    // 1. Validation Logic: Check text fields
    const requiredFields = Object.keys(formData).filter(k => !["image", "logo", "id"].includes(k));
    const missingFields = requiredFields.filter(k => !formData[k] || formData[k].toString().trim() === "");

    // 2. Validation Logic: Check Image
    const missingImage = isImageMissing(formData);

    if (missingFields.length > 0 || missingImage) {
      setErrors(missingImage ? [...missingFields, "image_source"] : missingFields);
      setStatus({ 
        type: "error", 
        message: missingImage ? "An image or logo is required." : "Please fill in all required fields." 
      });
      return;
    }

    setStatus({ type: "loading", message: "Synchronizing with registry..." });

    try {
      const res = await fetch(`/api/items/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || "Failed to update record.");

      setStatus({ type: "success", message: "Registry updated successfully!" });
      if (onUpdate) onUpdate(result.data);
      
      setTimeout(() => {
        setSelectedItem(result.data);
        setEditMode(false);
        setStatus({ type: "", message: "" });
      }, 1500);

    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 px-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button className="absolute top-8 right-8 text-white/50 hover:text-white text-2xl font-light">✕ Close</button>
          <div className="relative w-full h-full max-w-4xl max-h-[80vh] animate-in zoom-in-95 duration-300">
            <Image 
              src={fullscreenImage} 
              alt="Fullscreen Preview" 
              fill 
              className="object-contain" 
              priority
            />
          </div>
        </div>
      )}

      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize">
            {view} <span className="text-blue-600">Registry</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {filteredData.length} Records found
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search records..."
            className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-2.5 pl-11 pr-10 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORY ASSISTANT */}
      {categories.length > 0 && (
        <div className="px-2">
          <div className="flex flex-wrap items-center gap-2 bg-slate-50/50 p-3 rounded-[1.5rem] border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Assistant:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchQuery(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all ${
                  searchQuery.toLowerCase() === cat.toLowerCase()
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="overflow-x-auto min-h-[400px]">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No matching records</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-3">Primary Entity</th>
                <th className="px-6 py-3 text-right">Management</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr
                  key={item.id}
                  className="group bg-white border border-slate-100 hover:border-blue-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openModal(item)}
                >
                  <td className="px-6 py-4 rounded-l-2xl border-y border-l border-slate-100 group-hover:border-blue-100">
                    <div className="flex items-center gap-4">
                      <div 
                        className="relative w-11 h-11 flex-shrink-0 group/img"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenImage(getImageSrc(item));
                        }}
                      >
                        <Image src={getImageSrc(item)} alt="item" fill className="rounded-xl object-cover border border-slate-100 shadow-sm transition-transform group-hover/img:scale-105" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 rounded-xl flex items-center justify-center transition-opacity text-white text-[10px]">🔍</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{item.name || item.device || item.customer || "Unlabeled"}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">REF: {String(item.id).slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl border-y border-r border-slate-100 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase">Page {currentPage} / {totalPages || 1}</span>
        <div className="flex gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 text-[10px] font-black bg-white border border-slate-200 rounded-xl disabled:opacity-30">Prev</button>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 text-[10px] font-black bg-slate-900 text-white rounded-xl disabled:opacity-30">Next</button>
        </div>
      </div>

      {/* DETAIL & EDIT MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div 
                  className={`cursor-zoom-in rounded-xl transition-all ${errors.includes('image_source') ? 'ring-4 ring-red-500 ring-offset-2' : ''}`} 
                  onClick={() => setFullscreenImage(getImageSrc(formData))}
                >
                  <Image src={getImageSrc(formData)} alt="preview" width={50} height={50} className="rounded-xl shadow-lg hover:scale-105 transition-transform" />
                </div>
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Record Profile</h3>
              </div>
              <button onClick={() => setEditMode(!editMode)} className="text-[10px] font-bold uppercase p-2 px-4 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                {editMode ? "Cancel Edit" : "Modify Record"}
              </button>
            </div>

            <div className="p-8 pt-0 space-y-4 max-h-[50vh] overflow-y-auto">
              {Object.entries(formData).map(([key, value]) => {
                if (["image", "logo", "id"].includes(key)) return null;
                const hasError = errors.includes(key);

                return (
                  <div key={key}>
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{formatKey(key)}</label>
                    {editMode ? (
                      <input
                        className={`w-full mt-1 p-3 border rounded-xl text-sm font-semibold outline-none transition-all ${
                          hasError ? "border-red-500 bg-red-50" : "border-slate-100 bg-slate-50 focus:border-blue-500"
                        }`}
                        value={value || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={`Enter ${formatKey(key)}...`}
                      />
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-700">{value || "—"}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* STATUS MESSAGE AREA */}
            {status.message && (
              <div className={`mx-8 mb-4 p-3 rounded-xl text-[10px] font-bold uppercase text-center animate-in slide-in-from-bottom-1 ${
                status.type === "error" ? "bg-red-100 text-red-600" : 
                status.type === "success" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
              }`}>
                {status.type === "loading" && <span className="inline-block animate-spin mr-2">⏳</span>}
                {status.message}
              </div>
            )}

            <div className="p-6 bg-slate-50 flex gap-3">
              {editMode ? (
                <button 
                  onClick={handleSave} 
                  disabled={status.type === "loading"}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {status.type === "loading" ? "Processing..." : "Commit Changes"}
                </button>
              ) : (
                <button onClick={closeModal} className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                  Close Inquiry
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}