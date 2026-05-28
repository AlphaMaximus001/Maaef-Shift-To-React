import fs from "fs";
import path from "path";
import { markdownToPortableText, type PortableTextBlock } from "./markdownToPortableText";

export interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  mainImage?: {
    url: string;
    alt?: string;
  };
  author?: {
    name: string;
    image?: string;
  };
  categories?: {
    title: string;
    slug?: {
      current: string;
    };
  }[];
  body?: PortableTextBlock[];
  markdownBody?: string;
  isArchived?: boolean;
}

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

/**
 * Assures the posts directory exists.
 */
function ensureDirectoryExistence() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
}

/**
 * Custom parser for frontmatter metadata and body content from Markdown files.
 * Matches YAML blocks:
 * ---
 * title: Title Here
 * ...
 * ---
 * Body text...
 */
export function parseMarkdownFile(fileContent: string): { data: any; bodyContent: string } {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, bodyContent: fileContent };
  }

  const yamlBlock = match[1];
  const bodyContent = match[2];
  const data: any = {};

  yamlBlock.split(/\r?\n/).forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Clean up string quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Check if value is a JSON object or array
      if (value.startsWith("{") || value.startsWith("[")) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      } else {
        data[key] = value;
      }
    }
  });

  return { data, bodyContent };
}

/**
 * Stringifies post metadata and body to a Markdown file string.
 */
export function stringifyMarkdownFile(metadata: any, bodyContent: string): string {
  let yamlLines = "---\n";
  Object.entries(metadata).forEach(([key, value]) => {
    if (typeof value === "object") {
      yamlLines += `${key}: ${JSON.stringify(value)}\n`;
    } else {
      yamlLines += `${key}: "${value}"\n`;
    }
  });
  yamlLines += "---\n";
  return yamlLines + bodyContent.trim();
}

/**
 * Reads all posts from disk, parsed and formatted for the frontend.
 */
export async function getAllPosts(): Promise<Post[]> {
  ensureDirectoryExistence();
  try {
    const files = await fs.promises.readdir(POSTS_DIR);
    const markdownFiles = files.filter((file) => file.endsWith(".md"));
    
    const posts: Post[] = [];

    for (const file of markdownFiles) {
      const filePath = path.join(POSTS_DIR, file);
      const content = await fs.promises.readFile(filePath, "utf-8");
      const { data, bodyContent } = parseMarkdownFile(content);

      const slug = data.slug?.current || data.slug || path.basename(file, ".md");
      const id = data._id || slug;

      posts.push({
        _id: id,
        title: data.title || "Untitled Dispatch",
        slug: {
          current: slug,
        },
        publishedAt: data.publishedAt || new Date().toISOString(),
        mainImage: data.mainImage || undefined,
        author: data.author || undefined,
        categories: data.categories || [],
        body: markdownToPortableText(bodyContent),
        markdownBody: bodyContent,
        isArchived: !!data.isArchived,
      });
    }

    // Sort by publication date descending
    return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch (error) {
    console.error("Error reading local posts:", error);
    return [];
  }
}

/**
 * Retrieves a single post by its unique slug.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  ensureDirectoryExistence();
  const filePath = path.join(POSTS_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    const { data, bodyContent } = parseMarkdownFile(content);

    return {
      _id: data._id || slug,
      title: data.title || "Untitled Dispatch",
      slug: {
        current: slug,
      },
      publishedAt: data.publishedAt || new Date().toISOString(),
      mainImage: data.mainImage || undefined,
      author: data.author || undefined,
      categories: data.categories || [],
      body: markdownToPortableText(bodyContent),
      markdownBody: bodyContent,
      isArchived: !!data.isArchived,
    };
  } catch (error) {
    console.error(`Error reading local post for slug "${slug}":`, error);
    return null;
  }
}

/**
 * Saves or updates a post file on local disk.
 */
export async function savePost(slug: string, postData: Partial<Post>): Promise<boolean> {
  ensureDirectoryExistence();
  const filePath = path.join(POSTS_DIR, `${slug}.md`);

  try {
    const rawBody = postData.markdownBody || "";
    
    // Build metadata object (excluding raw body block fields)
    const metadata = {
      _id: postData._id || slug,
      title: postData.title || "Untitled Dispatch",
      slug: postData.slug || { current: slug },
      publishedAt: postData.publishedAt || new Date().toISOString(),
      mainImage: postData.mainImage || null,
      author: postData.author || null,
      categories: postData.categories || [],
      isArchived: !!postData.isArchived,
    };

    const fileContent = stringifyMarkdownFile(metadata, rawBody);
    await fs.promises.writeFile(filePath, fileContent, "utf-8");
    return true;
  } catch (error) {
    console.error(`Error saving local post for slug "${slug}":`, error);
    return false;
  }
}

/**
 * Deletes a post file from disk.
 */
export async function deletePost(slug: string): Promise<boolean> {
  ensureDirectoryExistence();
  const filePath = path.join(POSTS_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting local post slug "${slug}":`, error);
    return false;
  }
}
