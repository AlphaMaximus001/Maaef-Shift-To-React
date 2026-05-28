import { NextResponse } from "next/server";
import { getAllPosts, savePost } from "@/lib/posts";

export const dynamic = "force-dynamic";

/**
 * GET /api/posts
 * Retrieves all local posts on disk.
 */
export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("API GET /api/posts failed:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

/**
 * POST /api/posts
 * Saves or updates a post locally.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, ...postData } = body;

    if (!slug || !slug.current) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const success = await savePost(slug.current, {
      slug,
      ...postData
    });

    if (success) {
      return NextResponse.json({ success: true, slug: slug.current });
    } else {
      return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
    }
  } catch (error) {
    console.error("API POST /api/posts failed:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
