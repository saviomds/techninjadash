import { readDB } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // Default TechNinja Credentials
    if (username === "admin" && password === "321") {
      return Response.json({ success: true });
    }

    return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  } catch (err) {
    console.error("Login API Error:", err);
    return Response.json({ success: false, error: "Malformed request" }, { status: 400 });
  }
}