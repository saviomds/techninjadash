import { readFile, writeFile, mkdir, unlink, access, constants } from "fs/promises";
import path from "path";
import { readDB, writeDB } from "@/lib/db";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const shopName = formData.get("shopName");
    const currency = formData.get("currency");
    const logoFile = formData.get("logo");

    const db = await readDB();
    let logoPath = db.settings?.logo || "/uploads/logos/default.png";

    // 🖼️ HANDLE IMAGE UPLOAD
    if (logoFile && typeof logoFile !== "string") {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${logoFile.name}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
      const uploadPath = path.join(uploadDir, fileName);

      // ✅ ensure folder exists
      await mkdir(uploadDir, { recursive: true });

      // ✅ DELETE OLD LOGO FILE BEFORE SAVING NEW ONE
      if (db.settings?.logo?.startsWith("/uploads/logos/")) {
        const oldLogoPath = path.join(process.cwd(), "public", db.settings.logo);
        try {
          await access(oldLogoPath, constants.F_OK); // Check if file exists
          await unlink(oldLogoPath);
          console.log("Old logo deleted:", oldLogoPath);
        } catch (unlinkErr) {
          if (unlinkErr.code === 'ENOENT') {
            console.log("Old logo file not found, skipping deletion.");
          } else {
            console.error("Failed to delete old logo:", unlinkErr);
          }
        }
      }

      await writeFile(uploadPath, buffer);

      logoPath = `/uploads/logos/${fileName}`;
    }

    // 🔄 UPDATE SETTINGS (KEEPING EXISTING FIELDS)
    db.settings = {
      ...db.settings,
      shopName: shopName || db.settings?.shopName,
      currency: currency || db.settings?.currency,
      logo: logoPath,
    };

    // 💾 SAVE DB
    await writeDB(db);

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