import Image from "next/image";

export default function Table({ data, view, deleteItem }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-gray-500 text-center py-10">No items found in {view}.</p>;
  }

  return (
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
            <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Image 
                    src={
                      (typeof item.image === 'string' && item.image.startsWith('/')) 
                        ? item.image 
                        : (typeof item.logo === 'string' && item.logo.startsWith('/'))
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
                  onClick={() => deleteItem(item.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}