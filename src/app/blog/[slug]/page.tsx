import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { translateLocalPost } from "@/lib/translatePosts";
import { buildMetadata, buildArticleJsonLd } from "@/lib/seo";
import BlogPostWrapper from "./BlogPostWrapper";

// See the note in ../page.tsx — these are file-backed posts, not live data.
export const revalidate = 3600;

/** Prerender every published dispatch at build time; unknown slugs still
 *  render on demand via the default dynamicParams behaviour. */
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts
    .filter((p) => !p.isArchived)
    .map((p) => ({ slug: p.slug.current }));
}

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
      publishedTime: post.publishedAt || undefined,
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
    publishedAt: post.publishedAt,
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
