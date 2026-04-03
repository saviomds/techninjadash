"use client";

import Image from "next/image";
import { useState, useMemo, useEffect } from "react";

export default function Table({ data, view, deleteItem, onUpdate, darkMode }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState([]);

  // --- PAGINATION LOGIC ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const searchString = `${item.name} ${item.device} ${item.customer} ${item.id} ${item.category} ${item.description || ""}`.toLowerCase();
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
  const isImageMissing = (item) => !item?.image && !item?.logo;

  const openModal = (item) => {
    setSelectedItem(item);
    let initialData = { ...item };
    if (view === "orders" || view === "customers") {
      if (!initialData.hasOwnProperty('description')) initialData.description = ""; 
    }
    setFormData(initialData);
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
    if (errors.includes(key)) setErrors(prev => prev.filter(e => e !== key));
  };

  const handleSave = async () => {
    const requiredFields = Object.keys(formData).filter(k => !["image", "logo", "id"].includes(k));
    const missingFields = requiredFields.filter(k => !formData[k] || formData[k].toString().trim() === "");
    const missingImage = isImageMissing(formData);

    if (missingFields.length > 0 || missingImage) {
      setErrors(missingImage ? [...missingFields, "image_source"] : missingFields);
      setStatus({ type: "error", message: "Required fields are empty." });
      return;
    }

    setStatus({ type: "loading", message: "Synchronizing..." });
    try {
      const res = await fetch(`/api/items/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Update failed.");

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
      {/* LIGHTBOX */}
      {fullscreenImage && (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md transition-colors ${darkMode ? "bg-black/95" : "bg-slate-950/90"}`} onClick={() => setFullscreenImage(null)}>
          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            <Image src={fullscreenImage} alt="Preview" fill className="object-contain animate-in zoom-in-95" priority />
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className={`text-xl font-black tracking-tight capitalize ${darkMode ? "text-white" : "text-slate-900"}`}>
            {view} <span className={darkMode ? "text-blue-400" : "text-blue-600"}>Registry</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredData.length} Records found</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <input
            type="text"
            placeholder="Search records..."
            className={`w-full border border-transparent rounded-2xl py-2.5 px-6 text-sm font-semibold transition-all outline-none ${
              darkMode 
                ? "bg-slate-800 text-white focus:bg-slate-900 focus:border-blue-500" 
                : "bg-slate-100/50 text-slate-900 focus:bg-white focus:border-blue-500"
            }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORY ASSISTANT */}
      {categories.length > 0 && (
        <div className="px-2">
          <div className={`flex flex-wrap items-center gap-2 p-3 rounded-[1.5rem] border transition-colors ${
            darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50/50 border-slate-100"
          }`}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchQuery(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                  searchQuery.toLowerCase() === cat.toLowerCase() 
                    ? "bg-blue-600 text-white" 
                    : (darkMode ? "bg-slate-900 text-slate-400 border border-slate-700 hover:text-white" : "bg-white text-slate-500 border border-slate-200")
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-3">Primary Entity</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id} className={`group border transition-all cursor-pointer ${
                darkMode ? "bg-slate-900/50 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-100 hover:shadow-md"
              }`} onClick={() => openModal(item)}>
                <td className={`px-6 py-4 rounded-l-2xl border-y border-l transition-colors ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                  <div className="flex items-center gap-4">
                    <div className="relative w-11 h-11" onClick={(e) => { e.stopPropagation(); setFullscreenImage(getImageSrc(item)); }}>
                      <Image src={getImageSrc(item)} alt="item" fill className={`rounded-xl object-cover border shadow-sm ${darkMode ? "border-slate-700" : "border-slate-100"}`} />
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>{item.name || item.customer || item.device || "Unlabeled"}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">REF: {String(item.id).slice(-8)}</div>
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 rounded-r-2xl border-y border-r transition-colors ${darkMode ? "border-slate-800 text-right" : "border-slate-100 text-right"}`}>
                  <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-between px-2 py-4 border-t transition-colors ${
          darkMode ? "border-slate-800" : "border-slate-100"
        }`}>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 ${
                darkMode 
                  ? "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700" 
                  : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 ${
                darkMode 
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20" 
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MODAL (unchanged but wrapped in darkMode logic) */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}>
          <div className={`relative w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 ${
            darkMode ? "bg-slate-900 border border-slate-800" : "bg-white"
          }`} onClick={(e) => e.stopPropagation()}>
            {/* Modal Content - (Same as previous implementation) */}
            <div className="p-8 pb-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div 
                  className={`cursor-pointer rounded-xl transition-all ${errors.includes('image_source') ? 'ring-4 ring-red-500' : ''}`}
                  onClick={() => setFullscreenImage(getImageSrc(formData))}
                >
                  <Image src={getImageSrc(formData)} alt="preview" width={50} height={50} className={`rounded-xl shadow-md ${darkMode ? "border border-slate-700" : ""}`} />
                </div>
                <h3 className={`font-black text-xs uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-900"}`}>Profile Editor</h3>
              </div>
              <button onClick={() => setEditMode(!editMode)} className={`text-[10px] font-bold uppercase p-2 px-4 rounded-full transition-colors ${
                darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}>
                {editMode ? "Cancel" : "Modify"}
              </button>
            </div>

            <div className="p-8 pt-0 space-y-4 max-h-[50vh] overflow-y-auto">
              {Object.entries(formData).map(([key, value]) => {
                if (["image", "logo", "id"].includes(key)) return null;
                const isInvalid = errors.includes(key);

                return (
                  <div key={key}>
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{formatKey(key)}</label>
                    {editMode ? (
                      <input
                        className={`w-full mt-1 p-3 border rounded-xl text-sm font-semibold transition-all outline-none ${
                          darkMode 
                            ? (isInvalid ? "border-red-500 bg-red-950/20 text-white" : "border-slate-800 bg-slate-800 text-white focus:border-blue-500") 
                            : (isInvalid ? "border-red-500 bg-red-50 text-slate-900" : "border-slate-100 bg-slate-50 focus:border-blue-500")
                        }`}
                        value={value || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    ) : (
                      <div className={`p-3 rounded-xl text-sm font-bold whitespace-pre-wrap ${
                        darkMode ? "bg-slate-800/50 text-slate-300" : "bg-slate-50 text-slate-700"
                      }`}>{value || "—"}</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={`p-6 flex gap-3 transition-colors ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}>
               <button onClick={closeModal} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                  darkMode ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}>
                  Close Inquiry
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}