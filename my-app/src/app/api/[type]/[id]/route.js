import { readDB, writeDB } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { unlink, access, constants } from "fs/promises";
import path from "path";

export async function DELETE(req, { params }) {
  try {
    const { type, id } = await params;

    console.log("FIXED DELETE:", type, id);

    const db = await readDB();

    if (!db[type] || !Array.isArray(db[type])) {
      return Response.json({ success: false }, { status: 400 });
    }

    const item = db[type].find(i => String(i.id) === String(id));

    if (!item) {
      return Response.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    const deleteFile = async (itemData, fieldName) => {
      const filePath = itemData[fieldName];
      const publicId = itemData[`${fieldName}_public_id`];

      // ✅ Handle Cloudinary Deletion
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        return;
      }

      // ✅ Handle Local File Deletion
      if (!filePath || !filePath.startsWith("/uploads/")) return;
      const fullPath = path.join(process.cwd(), "public", filePath);
      try {
        await access(fullPath, constants.F_OK);
        await unlink(fullPath);
      } catch {}
    };

    await deleteFile(item, "image");
    await deleteFile(item, "logo");

    db[type] = db[type].filter(i => String(i.id) !== String(id));

    await writeDB(db);

    return Response.json({ success: true });

  } catch (err) {
    console.error(err);
    return Response.json({ success: false }, { status: 500 });
  }
}