import { readDB, writeDB } from "@/lib/db";

export async function DELETE(req, { params }) {
  try {
    const { type, id } = await params;
    const db = readDB();

    if (db[type] && Array.isArray(db[type])) {
      db[type] = db[type].filter(i => i.id !== id);
      writeDB(db);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}