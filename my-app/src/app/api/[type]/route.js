import { readDB, writeDB } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req, { params }) {
  try {
    const { type } = await params;
    const db = await readDB();
    const form = await req.formData();

    const item = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    };

    // Process form data and handle files
    for (const [key, value] of form.entries()) {
      // Robust check for File/Blob objects
      const isFile = value && typeof value === 'object' && 'arrayBuffer' in value && value.size > 0;

      if (isFile) {
        const bytes = await value.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${value.name}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);
        
        item[key] = `/uploads/${fileName}`;
      } else if (typeof value === 'string' && value !== '[object Object]') {
        // Skip empty strings if it's a logo/image field to prevent overwriting with nothing
        if ((key === 'logo' || key === 'image') && !value) continue;
        
        // If the value is literally the string "undefined", skip it
        if (value === 'undefined') continue;

        const isNumeric = ['price', 'stock', 'qty', 'salary'].includes(key);
        item[key] = isNumeric ? Number(value) : value;
      }
    }

    if (type === 'settings') {
      if (item.logo === undefined) delete item.logo; // Don't overwrite if no new logo provided
      // Update settings object instead of pushing to an array
      db.settings = { ...db.settings, ...item };
      delete db.settings.id;
      delete db.settings.date;
    } else {
      // Ensure the collection exists and is an array
      if (!Array.isArray(db[type])) db[type] = [];
      db[type].push(item);
    }

    await writeDB(db);
    return Response.json({ success: true });
  } catch (err) {
    console.error("POST ERROR:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}