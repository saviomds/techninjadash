import { readDB, writeDB } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function DELETE(req) {
  try {
    const url = new URL(req.url);

    const parts = url.pathname.split("/");

    const type = parts[2]; // api / products / id
    const id = parts[3];

    console.log("FIXED DELETE:", type, id);

    const db = readDB();

    if (!db[type] || !Array.isArray(db[type])) {
      return Response.json({ success: false }, { status: 400 });
    }

    const item = db[type].find(i => String(i.id) === String(id));

    if (item?.image) {
      const imagePath = path.join(process.cwd(), "public", item.image);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (item?.logo) {
      const logoPath = path.join(process.cwd(), "public", item.logo);

      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    db[type] = db[type].filter(i => String(i.id) !== String(id));

    writeDB(db);

    return Response.json({ success: true });

  } catch (err) {
    console.error(err);
    return Response.json({ success: false }, { status: 500 });
  }
}