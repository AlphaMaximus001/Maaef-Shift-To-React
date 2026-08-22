import { getAllPosts } from "@/lib/posts";
import { translateLocalPost } from "@/lib/translatePosts";
import BlogIndexWrapper from "./BlogIndexWrapper";

// Posts are markdown files committed to the repo, so they only change on deploy.
// force-dynamic re-read and re-parsed every file on every request and disabled CDN
// caching entirely; ISR serves this from the edge instead.
export const revalidate = 3600;

export default async function BlogPage() {
  const localPosts = await getAllPosts();
  
  // Filter active posts only
  const activePosts = localPosts.filter((p) => !p.isArchived);
  
  // Map posts into the expected layout format
  const total = activePosts.length;
  const posts = activePosts.map((p, idx) => translateLocalPost(p, total - idx - 1));

  // Extract unique category listing
  const categoriesSet = new Set<string>(["ALL"]);
  posts.forEach((p) => {
    if (p.cat) categoriesSet.add(p.cat.toUpperCase());
  });
  const categories = Array.from(categoriesSet);

  return <BlogIndexWrapper posts={posts} categories={categories} />;
}
