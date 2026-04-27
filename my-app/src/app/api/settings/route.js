import { createClient } from "@/lib/supabase/server";
import cloudinary from "@/lib/cloudinary";
import { unlink, access, constants } from "fs/promises";
import path from "path";

// Configure Cloudinary with your environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req) {
  try {
    const formData = await req.formData();

    const shopName = formData.get("shopName");
    const currency = formData.get("currency");
    const logoFile = formData.get("logo");

    // Initialize Supabase client
    const supabase = await createClient();
    const { data: settingsData } = await supabase.from("settings").select("*").maybeSingle();

    let logoPath = settingsData?.logo || "https://res.cloudinary.com/du7wgettf/image/upload/v1/default.png";
    let logoPublicId = settingsData?.logo_public_id || "";

    // 🖼️ HANDLE IMAGE UPLOAD
    if (logoFile && typeof logoFile !== "string" && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ✅ Delete old Cloudinary logo if it exists
      if (logoPublicId) {
        try {
          await cloudinary.uploader.destroy(logoPublicId);
        } catch (cloudErr) {
          console.error("Cloudinary Cleanup Failed:", cloudErr.message);
        }
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
    const updatedSettings = {
      shopName: shopName || settingsData?.shopName,
      currency: currency || settingsData?.currency,
      logo: logoPath,
      logo_public_id: logoPublicId,
    };

    // 💾 SAVE TO SUPABASE
    if (settingsData?.id) {
      const { error: updateError } = await supabase
        .from("settings")
        .update(updatedSettings)
        .eq("id", settingsData.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("settings")
        .insert([{ ...updatedSettings, id: 1 }]);

      if (insertError) throw insertError;
    }

    return Response.json({
      success: true,
      settings: updatedSettings,
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}