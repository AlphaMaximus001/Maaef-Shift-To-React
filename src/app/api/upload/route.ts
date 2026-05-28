import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload
 * Handles multipart file uploads and writes files directly to the public directory.
 * Returns the local relative URL of the saved file.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file was selected" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Assure destination uploads folder exists in public directory
    const uploadsDir = path.join(process.cwd(), "public", "images", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Sanitize filename and prep prefix timestamp to prevent overwrites
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `${timestamp}_${safeName}`;
    const filePath = path.join(uploadsDir, filename);

    // Save to disk
    await fs.promises.writeFile(filePath, buffer);

    const relativeUrl = `/images/uploads/${filename}`;
    return NextResponse.json({ success: true, url: relativeUrl });
  } catch (error) {
    console.error("Local Upload API failed:", error);
    return NextResponse.json({ error: "File write failed" }, { status: 500 });
  }
}
