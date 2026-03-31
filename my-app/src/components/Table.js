import Image from "next/image";
import { useState } from "react";

export default function Table({ data, view, deleteItem, onUpdate }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-gray-500 text-center py-10">No items found in {view}.</p>;
  }

  const formatKey = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

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
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

const handleSave = async () => {
  try {
    const res = await fetch(`/api/items/${formData.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    if (onUpdate) onUpdate(data.data);

    setSelectedItem(data.data);
    setEditMode(false);

    alert("Saved successfully ✅");
  } catch (err) {
    alert("Error: " + err.message);
  }
};

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(String(value));
  };

  return (
    <>
      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-lg border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-700">Main Info</th>
              <th className="p-4 font-semibold text-gray-700">Date</th>
              <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openModal(item)}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={
                        item.image?.startsWith("/")
                          ? item.image
                          : item.logo?.startsWith("/")
                          ? item.logo
                          : "https://via.placeholder.com/40"
                      }
                      alt="item"
                      width={40}
                      height={40}
                      className="rounded-md object-cover border"
                    />

                    <div>
                      <div className="font-bold text-gray-900">
                        {item.name || item.device || item.customer || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">ID: {item.id}</div>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-gray-600 text-sm">
                  {item.date || "N/A"}
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Item Details</h2>

              <button
                onClick={() => setEditMode(!editMode)}
                className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                {editMode ? "View" : "Edit"}
              </button>
            </div>

            {/* IMAGE */}
            {(formData.image || formData.logo) && (
              <div className="mb-4">
                <Image
                  src={
                    formData.image?.startsWith("/")
                      ? formData.image
                      : formData.logo?.startsWith("/")
                      ? formData.logo
                      : "https://via.placeholder.com/80"
                  }
                  alt="preview"
                  width={80}
                  height={80}
                  className="rounded-lg border object-cover"
                />
              </div>
            )}

            {/* CONTENT */}
            <div className="space-y-3 text-sm">
              {Object.entries(formData).map(([key, value]) => {
                if (key === "image" || key === "logo") return null;

                return (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-600">
                        {formatKey(key)}
                      </span>

                      <button
                        onClick={() => copyToClipboard(value)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Copy
                      </button>
                    </div>

                    {editMode ? (
                      <input
                        className="border rounded p-2 text-sm w-full"
                        value={value || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    ) : (
                      <div className="text-gray-800 break-all">
                        {String(value)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ACTIONS */}
            <div className="mt-5 flex gap-2">
              {editMode && (
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
              )}

              <button
                onClick={closeModal}
                className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}