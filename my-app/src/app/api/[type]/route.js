import { readDB, writeDB } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";

export async function POST(req, { params }) {
  try {
    // ✅ Await params to fix Next.js 15 Promise error
    const { type } = await params;

    const db = await readDB();
    const form = await req.formData();

    const item = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    };

    for (const [key, value] of form.entries()) {
      const isFile =
        value &&
        typeof value === "object" &&
        "arrayBuffer" in value &&
        value.size > 0;

      if (isFile) {
        const bytes = await value.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: type === "settings" ? "logos" : type,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(buffer);
        });

        // store full cloud URL
        item[key] = result.secure_url;
        item[`${key}_public_id`] = result.public_id; // important for delete
      } else {
        if (typeof value === "string" && value !== "[object Object]") {
          if (value === "undefined") continue;

          const isNumeric = ["price", "stock", "qty", "salary"].includes(key);
          item[key] = isNumeric ? Number(value) : value;
        }
      }
    }

    if (!Array.isArray(db[type])) db[type] = [];
    db[type].push(item);

    await writeDB(db);

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false }, { status: 500 });
  }
}