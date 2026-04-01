import { readDB, writeDB } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import fs from "fs";
import path from "path";

export async function POST(req, { params }) {
  try {
    // ✅ Await params in Next.js 15+ to get the string value
    const { type } = await params;

    const db = await readDB();
    const form = await req.formData();

    const item = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    };

    // Process form data and handle files
    for (const [key, value] of form.entries()) {
      const isFile =
        value &&
        typeof value === "object" &&
        "arrayBuffer" in value &&
        value.size > 0;

      if (isFile) {
        const bytes = await value.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${value.name}`;
        
        // ✅ Dynamic subfolder: "logos" for settings, otherwise use the type (products, staff, etc.)
        const subFolder = type === "settings" ? "logos" : type;
        const uploadDir = path.join(process.cwd(), "public", "uploads", subFolder);

        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        item[key] = `/uploads/${subFolder}/${fileName}`;
      } else if (typeof value === "string" && value !== "[object Object]") {
        if ((key === "logo" || key === "image") && !value) continue;
        if (value === "undefined") continue;

        const isNumeric = ["price", "stock", "qty", "salary"].includes(key);
        item[key] = isNumeric ? Number(value) : value;
      }
    }

    // =========================
    // SETTINGS (LOGO REPLACE FIX)
    // =========================
    if (type === "settings") {
      // ✅ DELETE OLD LOGO IF NEW ONE UPLOADED
      if (item.logo && db.settings?.logo?.startsWith("/uploads/logos/")) {
        const oldLogoPath = path.join(
          process.cwd(),
          "public",
          db.settings.logo
        );

        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
          console.log("Old logo deleted:", oldLogoPath);
        }
      }

      // Prevent overwriting with undefined
      if (item.logo === undefined) delete item.logo;

      db.settings = { ...db.settings, ...item };

      delete db.settings.id;
      delete db.settings.date;
    } else {
      // Ensure collection exists
      if (!Array.isArray(db[type])) db[type] = [];

      db[type].push(item);
    }

    await writeDB(db);
    return Response.json({ success: true });
  } catch (err) {
    console.error("POST ERROR:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}