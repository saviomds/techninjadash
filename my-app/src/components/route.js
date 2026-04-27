import { createClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function PUT(req, { params }) {
  try {
    // Next.js 16 requires awaiting params in dynamic routes
    const { table } = await params;
    
    const formData = await req.formData();
    const id = formData.get("id");

    if (!id) {
      return Response.json({ error: "Missing ID" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch existing record to safely delete the old image
    const { data: existingRecord } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    let imageUrl = existingRecord?.image || existingRecord?.logo || null;
    let imagePublicId = existingRecord?.image_public_id || existingRecord?.logo_public_id || null;

    // 2. Handle Cloudinary Image Upload
    const imageFile = formData.get("image") || formData.get("logo") || formData.get("file");
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Delete old image if it exists in Cloudinary
      if (imagePublicId) {
        try {
          await cloudinary.uploader.destroy(imagePublicId);
        } catch (cloudErr) {
          console.error("Cloudinary Cleanup Failed:", cloudErr.message);
        }
      }

      // Upload new image
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: table }, // Automatically puts images in 'customers', 'products', etc. folders!
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    // 3. Build data to update (excluding 'id' and all image fields)
    const updatedData = {};
    for (const [key, value] of formData.entries()) {
      if (!["id", "image", "logo", "file", "image_public_id", "logo_public_id"].includes(key)) {
        if (value !== "null" && value !== "undefined") {
          updatedData[key] = value;
        }
      }
    }

    // 4. Assign the correct image column dynamically
    if (imageUrl) {
      if (table === "customers" || table === "staff" || table === "settings") {
        updatedData.logo = imageUrl;
        updatedData.logo_public_id = imagePublicId;
      } else {
        updatedData.image = imageUrl;
        updatedData.image_public_id = imagePublicId;
      }
    }

    // 5. Update in Supabase
    const { data, error } = await supabase
      .from(table)
      .update(updatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, updatedItem: data });

  } catch (err) {
    console.error("Error updating record:", err);
    return Response.json({ error: "Failed to update record" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { table } = await params;
    const formData = await req.formData();

    const supabase = await createClient();

    let imageUrl = null;
    let imagePublicId = null;

    // Handle Cloudinary Image Upload for new records
    const imageFile = formData.get("image") || formData.get("logo") || formData.get("file");
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: table },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    // Build data to insert
    const newData = {};
    for (const [key, value] of formData.entries()) {
      if (!["id", "image", "logo", "file", "image_public_id", "logo_public_id"].includes(key)) {
        if (value !== "null" && value !== "undefined") {
          newData[key] = value;
        }
      }
    }

    // Assign the correct image column dynamically based on your table
    if (imageUrl) {
      if (table === "customers" || table === "staff" || table === "settings") {
        newData.logo = imageUrl;
        newData.logo_public_id = imagePublicId;
      } else {
        newData.image = imageUrl;
        newData.image_public_id = imagePublicId;
      }
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from(table)
      .insert([newData])
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, createdItem: data });

  } catch (err) {
    console.error("Error creating record:", err);
    return Response.json({ error: "Failed to create record" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

    const supabase = await createClient();

    const { data: existingRecord } = await supabase.from(table).select("*").eq("id", id).single();
    const imagePublicId = existingRecord?.image_public_id || existingRecord?.logo_public_id || null;

    if (imagePublicId) {
      try { await cloudinary.uploader.destroy(imagePublicId); } catch(e) {}
    }

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;

    return Response.json({ success: true });
  } catch (err) {
    console.error("Error deleting record:", err);
    return Response.json({ error: "Failed to delete record" }, { status: 500 });
  }
}