"use client";

import Image from "next/image";
import { useState, useMemo, useEffect } from "react";

export default function Table({ data, view, deleteItem, onUpdate }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  
  const [fullscreenImage, setFullscreenImage] = useState(null);
  
  // Feedback states for validation and status
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
    
    // MERGE UPDATE: Force description field for Orders and Customers
    let initialData = { ...item };
    if (view === "orders" || view === "customers") {
      if (!initialData.hasOwnProperty('description')) {
        initialData.description = ""; 
      }
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
    if (errors.includes(key)) {
      setErrors(prev => prev.filter(e => e !== key));
    }
  };

  const handleSave = async () => {
    // Validation: Description is now strictly required for Orders/Customers
    const requiredFields = Object.keys(formData).filter(k => !["image", "logo", "id"].includes(k));
    const missingFields = requiredFields.filter(k => !formData[k] || formData[k].toString().trim() === "");

    const missingImage = isImageMissing(formData);

    if (missingFields.length > 0 || missingImage) {
      setErrors(missingImage ? [...missingFields, "image_source"] : missingFields);
      setStatus({ 
        type: "error", 
        message: "Required fields are empty. Please check red highlighted areas." 
      });
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4" onClick={() => setFullscreenImage(null)}>
          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            <Image src={fullscreenImage} alt="Preview" fill className="object-contain animate-in zoom-in-95" priority />
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize">
            {view} <span className="text-blue-600">Registry</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredData.length} Records found</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <input
            type="text"
            placeholder="Search records..."
            className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-2.5 px-6 text-sm font-semibold focus:bg-white focus:border-blue-500 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORY ASSISTANT */}
      {categories.length > 0 && (
        <div className="px-2">
          <div className="flex flex-wrap items-center gap-2 bg-slate-50/50 p-3 rounded-[1.5rem] border border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchQuery(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                  searchQuery.toLowerCase() === cat.toLowerCase() ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200"
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
              <tr key={item.id} className="group bg-white border border-slate-100 hover:shadow-md transition-all cursor-pointer" onClick={() => openModal(item)}>
                <td className="px-6 py-4 rounded-l-2xl border-y border-l border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="relative w-11 h-11" onClick={(e) => { e.stopPropagation(); setFullscreenImage(getImageSrc(item)); }}>
                      <Image src={getImageSrc(item)} alt="item" fill className="rounded-xl object-cover border border-slate-100 shadow-sm" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 text-sm">{item.name || item.customer || item.device || "Unlabeled"}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">REF: {String(item.id).slice(-8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 rounded-r-2xl border-y border-r border-slate-100 text-right">
                  <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 pb-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div 
                  className={`cursor-pointer rounded-xl transition-all ${errors.includes('image_source') ? 'ring-4 ring-red-500' : ''}`}
                  onClick={() => setFullscreenImage(getImageSrc(formData))}
                >
                  <Image src={getImageSrc(formData)} alt="preview" width={50} height={50} className="rounded-xl shadow-md" />
                </div>
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Profile Editor</h3>
              </div>
              <button onClick={() => setEditMode(!editMode)} className="text-[10px] font-bold uppercase p-2 px-4 bg-slate-100 rounded-full">
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
                      key === "description" ? (
                        <textarea
                          className={`w-full mt-1 p-3 border rounded-xl text-sm font-semibold outline-none transition-all min-h-[100px] resize-none ${
                            isInvalid ? "border-red-500 bg-red-50" : "border-slate-100 bg-slate-50 focus:border-blue-500"
                          }`}
                          value={value || ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder="Provide a required description..."
                        />
                      ) : (
                        <input
                          className={`w-full mt-1 p-3 border rounded-xl text-sm font-semibold transition-all outline-none ${
                            isInvalid ? "border-red-500 bg-red-50" : "border-slate-100 bg-slate-50 focus:border-blue-500"
                          }`}
                          value={value || ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      )
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 whitespace-pre-wrap">{value || "—"}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* STATUS FEEDBACK */}
            {status.message && (
              <div className={`mx-8 mb-4 p-3 rounded-xl text-[10px] font-bold uppercase text-center ${
                status.type === "error" ? "bg-red-50 text-red-600" : 
                status.type === "success" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
              }`}>
                {status.message}
              </div>
            )}

            <div className="p-6 bg-slate-50 flex gap-3">
              {editMode ? (
                <button onClick={handleSave} disabled={status.type === "loading"} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50">
                  {status.type === "loading" ? "Saving..." : "Commit Changes"}
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