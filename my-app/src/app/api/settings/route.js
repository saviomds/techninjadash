import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "db/db.json");

export async function POST(req) {
  try {
    const formData = await req.formData();

    const shopName = formData.get("shopName");
    const currency = formData.get("currency");
    const logoFile = formData.get("logo");

    const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

    let logoPath = db.settings.logo;

    // HANDLE IMAGE UPLOAD
    if (logoFile && typeof logoFile !== "string") {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${logoFile.name}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

      fs.writeFileSync(uploadPath, buffer);

      logoPath = `/uploads/${fileName}`;
    }

    db.settings = {
      ...db.settings,
      shopName,
      currency,
      logo: logoPath
    };

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return Response.json({ success: true, settings: db.settings });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to update settings" }, { status: 500 });
  }
}