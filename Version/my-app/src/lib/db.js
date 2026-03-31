import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "db", "db.json");

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  fs.mkdirSync(dirname, { recursive: true });
}

// READ DB
export function readDB() {
  try {
    if (!fs.existsSync(filePath)) {
      return { products: [], repairs: [], orders: [], customers: [], staff: [], settings: {} };
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("DB Read Error:", err);
    return { products: [], repairs: [], orders: [], customers: [], staff: [], settings: {} };
  }
}

// WRITE DB
export function writeDB(data) {
  try {
    ensureDirectoryExistence(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("DB Write Error:", err);
  }
}