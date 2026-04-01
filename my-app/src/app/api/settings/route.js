import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "db/db.json");

export async function POST(req) {
  try {
    const formData = await req.formData();

    const shopName = formData.get("shopName");
    const currency = formData.get("currency");
    const logoFile = formData.get("logo");

    // ✅ SAFE DB READ (PREVENT CRASH)
    let db;
    try {
      db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } catch (err) {
      return Response.json(
        { error: "Database file is corrupted JSON" },
        { status: 500 }
      );
    }

    let logoPath = db.settings?.logo || "/uploads/default.png";

    // 🖼️ HANDLE IMAGE UPLOAD
    if (logoFile && typeof logoFile !== "string") {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${logoFile.name}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");
      const uploadPath = path.join(uploadDir, fileName);

      // ✅ ensure folder exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // ✅ DELETE OLD LOGO FILE BEFORE SAVING NEW ONE
      if (db.settings?.logo?.startsWith("/uploads/")) {
        const oldLogoPath = path.join(process.cwd(), "public", db.settings.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      fs.writeFileSync(uploadPath, buffer);

      logoPath = `/uploads/${fileName}`;
    }

    // 🔄 UPDATE SETTINGS
    db.settings = {
      ...db.settings,
      shopName,
      currency,
      logo: logoPath,
    };

    // 💾 SAVE DB
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return Response.json({
      success: true,
      settings: db.settings,
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}