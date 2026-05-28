import { Post } from "./posts";

export interface TranslatedMaaefPost {
  n: string;
  slug: string;
  date: string;
  cat: string;
  title: string;
  dek: string;
  read: string;
  author: string;
  body: { type: "p" | "h" | "q"; text: string }[];
}

/**
 * Translates a local filesystem Post record to the shape expected by the new React Blog Package.
 * Parses the raw Markdown body string into paragraph, heading, and blockquote blocks,
 * generates appropriate excerpts (deks), counts reading times, formats dates, and numbers dispatches.
 */
export function translateLocalPost(post: Post, index: number): TranslatedMaaefPost {
  // 1. Format date as YY.MM.DD
  const d = new Date(post.publishedAt);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const dateStr = `${yy}.${mm}.${dd}`;

  // 2. Category and Author parameters
  const cat = post.categories?.[0]?.title?.toUpperCase() || "DISPATCH";
  const author = post.author?.name?.toUpperCase() || "MAAEF EDITORIAL";

  // 3. Parse Markdown body lines to structural blocks
  const bodyBlocks: { type: "p" | "h" | "q"; text: string }[] = [];
  const lines = (post.markdownBody || "").split(/\r?\n/);
  
  let firstParagraphText = "";

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      const text = trimmed.replace(/^#+\s+/, "");
      bodyBlocks.push({ type: "h", text });
    } else if (trimmed.startsWith("> ")) {
      const text = trimmed.slice(2);
      bodyBlocks.push({ type: "q", text });
    } else {
      bodyBlocks.push({ type: "p", text: trimmed });
      if (!firstParagraphText) {
        firstParagraphText = trimmed;
      }
    }
  });

  // 4. Generate subtitle / excerpt (dek)
  let dek = firstParagraphText;
  if (dek.length > 140) {
    dek = dek.substring(0, 137).trim() + "...";
  }
  if (!dek) {
    dek = "Dispatch from the studio floor.";
  }

  // 5. Calculate reading time (assuming 200 words per minute)
  const words = (post.markdownBody || "").trim().split(/\s+/).filter(Boolean).length;
  const readingTimeVal = Math.max(1, Math.ceil(words / 200));
  const read = `${String(readingTimeVal).padStart(2, "0")}m`;

  return {
    n: String(index + 1).padStart(2, "0"),
    slug: post.slug.current,
    date: dateStr,
    cat,
    title: post.title,
    dek,
    read,
    author,
    body: bodyBlocks,
  };
}
