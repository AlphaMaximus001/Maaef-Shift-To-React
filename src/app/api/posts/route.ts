import { NextResponse } from "next/server";
import { getAllPosts, savePost, stringifyMarkdownFile } from "@/lib/posts";
import { isGithubConfigured, commitFileToGithub } from "@/lib/github";

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

    // Detect Vercel serverless environment
    if (process.env.VERCEL === "1") {
      const metadata = {
        _id: postData._id || slug.current,
        title: postData.title || "Untitled Dispatch",
        slug: slug,
        publishedAt: postData.publishedAt || new Date().toISOString(),
        subheading: postData.subheading || null,
        mainImage: postData.mainImage || null,
        author: postData.author || null,
        categories: postData.categories || [],
        isArchived: !!postData.isArchived,
      };
      const fileContent = stringifyMarkdownFile(metadata, postData.markdownBody || "");
      const filePath = `src/content/posts/${slug.current}.md`;

      if (isGithubConfigured()) {
        const commitMsg = postData._id ? `Update dispatch: ${metadata.title}` : `Create dispatch: ${metadata.title}`;
        const committed = await commitFileToGithub(filePath, fileContent, commitMsg);
        if (committed) {
          return NextResponse.json({
            success: true,
            isVercel: true,
            committed: true,
            slug: slug.current
          });
        } else {
          return NextResponse.json({ error: "Failed to commit post to GitHub" }, { status: 500 });
        }
      }

      // Fallback: If GitHub integration is not configured, return raw content download details
      return NextResponse.json({
        isVercel: true,
        committed: false,
        filename: `${slug.current}.md`,
        fileContent: fileContent,
        slug: slug.current
      });
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
