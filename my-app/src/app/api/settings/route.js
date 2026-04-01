import { readDB, writeDB } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { unlink, access, constants } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const shopName = formData.get("shopName");
    const currency = formData.get("currency");
    const logoFile = formData.get("logo");

    const db = await readDB();
    let logoPath = db.settings?.logo || "https://res.cloudinary.com/du7wgettf/image/upload/v1/default.png";
    let logoPublicId = db.settings?.logo_public_id || "";

    // 🖼️ HANDLE IMAGE UPLOAD
    if (logoFile && typeof logoFile !== "string") {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ✅ Delete old Cloudinary logo if it exists
      if (logoPublicId) {
        await cloudinary.uploader.destroy(logoPublicId);
      }
      
      // ✅ Also clean up old local logo if it exists
      if (logoPath.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), "public", logoPath);
        try { await unlink(oldPath); } catch (e) {}
      }

      // ✅ Upload new logo to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "logos" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      logoPath = result.secure_url;
      logoPublicId = result.public_id;
    }

    // 🔄 UPDATE SETTINGS (KEEPING EXISTING FIELDS)
    db.settings = {
      ...db.settings,
      shopName: shopName || db.settings?.shopName,
      currency: currency || db.settings?.currency,
      logo: logoPath,
      logo_public_id: logoPublicId,
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