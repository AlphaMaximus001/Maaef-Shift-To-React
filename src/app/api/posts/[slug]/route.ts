import { NextResponse } from "next/server";
import { getPostBySlug, savePost, deletePost, stringifyMarkdownFile } from "@/lib/posts";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/posts/[slug]
 * Retrieves a detailed post by its slug.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("API GET /api/posts/[slug] failed:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

/**
 * PUT /api/posts/[slug]
 * Updates a detailed post by its slug.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Detect Vercel serverless environment
    if (process.env.VERCEL === "1") {
      const metadata = {
        _id: body._id || slug,
        title: body.title || "Untitled Dispatch",
        slug: body.slug || { current: slug },
        publishedAt: body.publishedAt || new Date().toISOString(),
        mainImage: body.mainImage || null,
        author: body.author || null,
        categories: body.categories || [],
        isArchived: !!body.isArchived,
      };
      const fileContent = stringifyMarkdownFile(metadata, body.markdownBody || "");
      return NextResponse.json({
        isVercel: true,
        filename: `${slug}.md`,
        fileContent: fileContent,
        slug: slug
      });
    }

    const success = await savePost(slug, body);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
  } catch (error) {
    console.error("API PUT /api/posts/[slug] failed:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

/**
 * DELETE /api/posts/[slug]
 * Deletes a post file by its slug.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Detect Vercel serverless environment
    if (process.env.VERCEL === "1") {
      return NextResponse.json({
        isVercel: true,
        error: "DELETE_BLOCKED",
        slug: slug
      });
    }

    const success = await deletePost(slug);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Post not found or deletion failed" }, { status: 404 });
    }
  } catch (error) {
    console.error("API DELETE /api/posts/[slug] failed:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
