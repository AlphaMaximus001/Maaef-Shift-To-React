import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isGithubConfigured, commitBinaryFileToGithub } from "@/lib/github";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload
 * Handles multipart file uploads. Writes to the GitHub repository on Vercel,
 * and falls back to writing files directly to the public directory on localhost.
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

    // Sanitize filename and prep prefix timestamp to prevent overwrites
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `${timestamp}_${safeName}`;
    const relativeUrl = `/images/uploads/${filename}`;

    // Detect Vercel serverless environment
    if (process.env.VERCEL === "1") {
      if (isGithubConfigured()) {
        const filePath = `public/images/uploads/${filename}`;
        const commitMsg = `Upload image: ${filename}`;
        const committed = await commitBinaryFileToGithub(filePath, buffer, commitMsg);
        if (committed) {
          return NextResponse.json({ success: true, url: relativeUrl, isVercel: true });
        } else {
          return NextResponse.json({ error: "Failed to commit image to GitHub" }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: "GitHub integration not configured on Vercel" }, { status: 500 });
      }
    }

    // Local filesystem upload logic (e.g. on localhost)
    const uploadsDir = path.join(process.cwd(), "public", "images", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, filename);

    // Save to disk
    await fs.promises.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: relativeUrl });
  } catch (error) {
    console.error("Upload API failed:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}

