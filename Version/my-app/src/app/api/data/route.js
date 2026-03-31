import { readDB } from "@/lib/db";

export async function GET() {
  try {
    const db = readDB();
    return Response.json(db);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}