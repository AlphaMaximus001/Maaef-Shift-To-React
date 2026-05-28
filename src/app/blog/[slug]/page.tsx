import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { translateLocalPost } from "@/lib/translatePosts";
import BlogPostWrapper from "./BlogPostWrapper";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  
  // 1. Fetch posts from local database once
  const localPosts = await getAllPosts();
  const activePosts = localPosts.filter((p) => !p.isArchived);

  // 2. Find indices and map posts dynamically
  const total = activePosts.length;
  const allPostsMapped = activePosts.map((p, idx) => translateLocalPost(p, total - idx - 1));
  
  // Find the translated post corresponding to the current slug
  const translatedPost = allPostsMapped.find((p) => p.slug === slug);
  if (!translatedPost) {
    notFound();
  }

  return (
    <BlogPostWrapper
      slug={slug}
      post={translatedPost}
      allPosts={allPostsMapped}
    />
  );
}
