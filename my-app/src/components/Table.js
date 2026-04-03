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
      const searchString = `${item.name || ""} ${item.device || ""} ${item.customer || ""} ${item.id || ""} ${item.category || ""} ${item.description || ""}`.toLowerCase();
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

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      {/* LIGHTBOX */}
      {fullscreenImage && (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md transition-colors ${darkMode ? "bg-black/95" : "bg-slate-950/90"}`} onClick={() => setFullscreenImage(null)}>
          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            <Image src={fullscreenImage} alt="Preview" fill className="object-contain animate-in zoom-in-95" priority />
          </div>
        </div>
      )}

      {/* HEADER SECTION - Now fits tightly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="space-y-1">
          <h2 className={`text-xl font-black tracking-tight capitalize flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
            <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
            {view} <span className={darkMode ? "text-blue-400" : "text-blue-600"}>Registry</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3">{filteredData.length} Records found</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Quick search..."
            className={`w-full rounded-xl py-2.5 px-5 text-sm font-semibold transition-all outline-none border ${
              darkMode 
                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 shadow-sm"
            }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🔍</span>
        </div>
      </div>

      {/* CATEGORY CHIPS - Optimized for scrolling on mobile */}
      {categories.length > 0 && (
        <div className="overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-2 min-w-max px-1">
            <button
               onClick={() => setSearchQuery("")}
               className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${
                searchQuery === "" 
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20" 
                  : (darkMode ? "bg-slate-900 text-slate-400 border-slate-800 hover:text-white" : "bg-white text-slate-500 border-slate-200")
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchQuery(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${
                  searchQuery.toLowerCase() === cat.toLowerCase() 
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20" 
                    : (darkMode ? "bg-slate-900 text-slate-400 border-slate-800 hover:text-white" : "bg-white text-slate-500 border-slate-200")
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TABLE SECTION - Responsive container */}
      <div className={`overflow-hidden rounded-2xl border transition-colors ${darkMode ? "border-slate-800 bg-slate-950/20" : "border-slate-100 bg-white shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] font-black text-slate-400 uppercase tracking-widest border-b ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-50 bg-slate-50/50"}`}>
                <th className="px-6 py-4">Identity & Details</th>
                <th className="hidden md:table-cell px-6 py-4">Status / Category</th>
                <th className="px-6 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/10 transition-all">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`group transition-all cursor-pointer ${
                      darkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50/50"
                    }`} 
                    onClick={() => openModal(item)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 flex-shrink-0 group/img" onClick={(e) => { e.stopPropagation(); setFullscreenImage(getImageSrc(item)); }}>
                          <Image src={getImageSrc(item)} alt="item" fill className={`rounded-xl object-cover border transition-transform group-hover/img:scale-105 ${darkMode ? "border-slate-700" : "border-slate-100"}`} />
                        </div>
                        <div className="min-w-0">
                          <div className={`font-bold text-sm truncate max-w-[150px] sm:max-w-xs ${darkMode ? "text-white" : "text-slate-900"}`}>
                            {item.name || item.customer || item.device || "Unlabeled Entity"}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight font-mono">
                            ID: {String(item.id).slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
                      }`}>
                        {item.category || item.status || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className={`p-2 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-all ${darkMode ? "text-slate-400 hover:bg-slate-700" : "text-slate-400 hover:bg-slate-100"}`}>
                          👁️
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} 
                          className="p-2 text-red-500/60 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center">
                    <div className="text-slate-400 text-sm italic font-medium">No records found matching your criteria</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION - Now Sticky at bottom if data is long */}
      {totalPages > 1 && (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-2`}>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
            Displaying {currentItems.length} of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 border ${
                darkMode 
                  ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700" 
                  : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50 shadow-sm"
              }`}
            >
              Back
            </button>
            <div className={`px-4 text-[10px] font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 border shadow-lg ${
                darkMode 
                  ? "bg-blue-600 border-blue-500 text-white shadow-blue-900/20" 
                  : "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MODAL OVERLAY */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={closeModal}>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"></div>
          
          <div className={`relative w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ${
            darkMode ? "bg-slate-900 border border-slate-800" : "bg-white"
          }`} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="p-8 pb-6 flex justify-between items-start">
              <div className="flex items-center gap-5">
                <div 
                  className={`relative w-16 h-16 cursor-pointer rounded-2xl overflow-hidden ring-4 transition-all ${darkMode ? "ring-slate-800 hover:ring-blue-600" : "ring-slate-50 hover:ring-blue-100"}`}
                  onClick={() => setFullscreenImage(getImageSrc(formData))}
                >
                  <Image src={getImageSrc(formData)} alt="preview" fill className="object-cover" />
                </div>
                <div>
                  <h3 className={`font-black text-sm uppercase tracking-[0.15em] ${darkMode ? "text-white" : "text-slate-900"}`}>Record Details</h3>
                  <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">Management Console</p>
                </div>
              </div>
              <button onClick={closeModal} className={`p-3 rounded-full transition-colors ${darkMode ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-slate-50 text-slate-400 hover:text-slate-900"}`}>
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 pb-8 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(formData).map(([key, value]) => {
                  if (["image", "logo", "id"].includes(key)) return null;
                  const isLongText = String(value).length > 30;

                  return (
                    <div key={key} className={isLongText ? "sm:col-span-2" : ""}>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">{formatKey(key)}</label>
                      <div className={`p-4 rounded-2xl text-sm font-bold border transition-colors ${
                        darkMode 
                          ? "bg-slate-800/40 border-slate-800 text-slate-200" 
                          : "bg-slate-50/50 border-slate-100 text-slate-700"
                      }`}>
                        {value || <span className="opacity-30 italic">Not recorded</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-8 border-t flex gap-3 transition-colors ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-50 bg-slate-50"}`}>
               <button onClick={closeModal} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                  darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm"
                }`}>
                  Dismiss
                </button>
                <button onClick={() => setEditMode(true)} className="flex-[1.5] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all">
                  Edit Registry
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}