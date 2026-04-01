import { readDB, writeDB } from "@/lib/db";
import { unlink, access, constants } from "fs/promises";
import path from "path";

export async function DELETE(req, { params }) {
  try {
    // ✅ Await params to fix ERR_INVALID_ARG_TYPE and avoid manual URL splitting
    const { type, id } = await params;

    console.log("FIXED DELETE:", type, id);

    // ✅ Await the database read
    const db = await readDB();

    if (!db[type] || !Array.isArray(db[type])) {
      return Response.json({ success: false }, { status: 400 });
    }

    const item = db[type].find(i => String(i.id) === String(id));

    // ✅ Helper function for async deletion
    const deleteFile = async (filePath) => {
      if (!filePath || !filePath.startsWith("/uploads/")) return;
      const fullPath = path.join(process.cwd(), "public", filePath);
      try {
        await access(fullPath, constants.F_OK);
        await unlink(fullPath);
        console.log("Deleted file:", fullPath);
      } catch (err) {
        console.log("File not found or skip delete:", filePath);
      }
    };

    if (item?.image?.startsWith("/uploads/")) {
      await deleteFile(item.image);
    }

    if (item?.logo?.startsWith("/uploads/")) {
      await deleteFile(item.logo);
    }

    db[type] = db[type].filter(i => String(i.id) !== String(id));

    // ✅ Await the database write
    await writeDB(db);

    return Response.json({ success: true });

  } catch (err) {
    console.error(err);
    return Response.json({ success: false }, { status: 500 });
  }
}