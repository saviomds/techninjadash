import { readDB, writeDB } from "@/lib/db";

// UPDATE item
export async function PATCH(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    const body = await req.json();

    const db = await readDB();

    const collections = ["products", "repairs", "orders", "customers", "staff"];

    let updatedItem = null;

    for (const key of collections) {
      if (!db[key]) continue;

      const index = db[key].findIndex(
        (item) => String(item.id) === String(id)
      );

      if (index !== -1) {
        db[key][index] = {
          ...db[key][index],
          ...body,
        };

        updatedItem = db[key][index];
        break;
      }
    }

    if (!updatedItem) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    await writeDB(db);

    return Response.json({ success: true, data: updatedItem });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE item (optional but useful)
export async function DELETE(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    const db = await readDB();
    const collections = ["products", "repairs", "orders", "customers", "staff"];

    let deleted = false;

    for (const key of collections) {
      if (!db[key]) continue;

      const index = db[key].findIndex((item) => String(item.id) === String(id));

      if (index !== -1) {
        db[key].splice(index, 1);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    await writeDB(db);

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}