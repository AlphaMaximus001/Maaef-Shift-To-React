import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { translateLocalPost } from "@/lib/translatePosts";
import { buildMetadata, buildArticleJsonLd } from "@/lib/seo";
import BlogPostWrapper from "./BlogPostWrapper";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/** Shared helper — fetches and maps posts, used by both generateMetadata and the page */
async function getPostData(slug: string) {
  const localPosts = await getAllPosts();
  const activePosts = localPosts.filter((p) => !p.isArchived);
  const total = activePosts.length;
  const allPostsMapped = activePosts.map((p, idx) =>
    translateLocalPost(p, total - idx - 1)
  );
  const post = allPostsMapped.find((p) => p.slug === slug);
  return { post, allPostsMapped };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPostData(slug);

  if (!post) {
    return buildMetadata({ title: "Dispatch Not Found", noIndex: true });
  }

  const ogImage = post.mainImage?.url ?? undefined;

  return {
    ...buildMetadata({
      title: post.title,
      description: post.dek,
      path: `/blog/${slug}`,
      ogImage,
    }),
    openGraph: {
      ...buildMetadata({ title: post.title, description: post.dek, path: `/blog/${slug}`, ogImage }).openGraph,
      type: "article",
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      section: post.cat,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const { post, allPostsMapped } = await getPostData(slug);

  if (!post) {
    notFound();
  }

  const articleJsonLd = buildArticleJsonLd({
    title: post.title,
    slug: post.slug,
    description: post.dek,
    publishedAt: new Date(post.date).toISOString(),
    author: post.author,
    imageUrl: post.mainImage?.url,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogPostWrapper
        slug={slug}
        post={post}
        allPosts={allPostsMapped}
      />
    </>
  );
}
