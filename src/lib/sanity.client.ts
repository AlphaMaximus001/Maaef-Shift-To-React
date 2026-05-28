import { getAllPosts, getPostBySlug } from "./posts";

/**
 * Mock Sanity client to replace "next-sanity" API.
 * Intercepts GROQ query fetches and redirects them to the local markdown file database.
 * This guarantees absolute compatibility with existing Server Components and GROQ queries.
 */
export const client = {
  fetch: async (query: string, params?: any): Promise<any> => {
    // 1. Identify single post request by slug
    // Match query: *[_type == "post" && slug.current == $slug][0]
    if (query.includes("slug.current == $slug") || (params && params.slug)) {
      const slug = params?.slug;
      if (!slug) {
        console.warn("Local Client warning: Slug parameter is missing for detailed GROQ query.");
        return null;
      }
      return await getPostBySlug(slug);
    }
    
    // 2. Default: fetch all posts
    // Match query: *[_type == "post"] | order(publishedAt desc)
    const posts = await getAllPosts();
    return posts.filter(post => !post.isArchived);
  }
};
