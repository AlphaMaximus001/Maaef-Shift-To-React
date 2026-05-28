export interface PortableTextBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h1" | "h2" | "h3" | "blockquote";
  children: {
    _type: "span";
    _key: string;
    text: string;
    marks?: string[];
  }[];
  listItem?: "bullet" | "number";
  level?: number;
  markDefs?: {
    _type: "link";
    _key: string;
    href: string;
  }[];
}

/**
 * Converts a raw Markdown string into a PortableText block array compatible with @portabletext/react.
 * Handles headings, paragraphs, blockquotes, bullet lists, ordered lists, bold, italic, code, and links.
 */
export function markdownToPortableText(markdown: string): PortableTextBlock[] {
  if (!markdown) return [];
  
  const blocks: PortableTextBlock[] = [];
  const lines = markdown.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      continue;
    }
    
    // Check headings
    if (trimmed.startsWith("# ")) {
      blocks.push(createBlock("h1", trimmed.slice(2)));
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(createBlock("h2", trimmed.slice(3)));
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(createBlock("h3", trimmed.slice(4)));
      continue;
    }
    
    // Check blockquote
    if (trimmed.startsWith("> ")) {
      blocks.push(createBlock("blockquote", trimmed.slice(2)));
      continue;
    }
    
    // Check unordered list item
    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      const content = bulletMatch[1];
      const block = createBlock("normal", content);
      block.listItem = "bullet";
      blocks.push(block);
      continue;
    }
    
    // Check ordered list item
    const numberMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      const content = numberMatch[1];
      const block = createBlock("normal", content);
      block.listItem = "number";
      blocks.push(block);
      continue;
    }
    
    // Normal paragraph (supports multi-line paragraphs)
    let paragraphContent = trimmed;
    while (
      i + 1 < lines.length &&
      lines[i + 1].trim() !== "" && 
      !lines[i + 1].trim().startsWith("# ") && 
      !lines[i + 1].trim().startsWith("## ") && 
      !lines[i + 1].trim().startsWith("### ") && 
      !lines[i + 1].trim().startsWith("> ") && 
      !lines[i + 1].trim().match(/^[-*]\s+/) && 
      !lines[i + 1].trim().match(/^\d+\.\s+/)
    ) {
      i++;
      paragraphContent += " " + lines[i].trim();
    }
    
    blocks.push(createBlock("normal", paragraphContent));
  }
  
  return blocks;
}

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

function createBlock(style: "normal" | "h1" | "h2" | "h3" | "blockquote", textContent: string): PortableTextBlock {
  const children: any[] = [];
  const markDefs: any[] = [];
  
  interface InlineToken {
    text: string;
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    linkUrl?: string;
  }
  
  let tokens: InlineToken[] = [{ text: textContent }];
  
  // Parse links [text](url)
  let newTokens: InlineToken[] = [];
  for (const token of tokens) {
    if (token.bold || token.italic || token.code || token.linkUrl) {
      newTokens.push(token);
      continue;
    }
    
    let lastIndex = 0;
    let match;
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    while ((match = regex.exec(token.text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        newTokens.push({ text: token.text.substring(lastIndex, matchIndex) });
      }
      newTokens.push({
        text: match[1],
        linkUrl: match[2]
      });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < token.text.length) {
      newTokens.push({ text: token.text.substring(lastIndex) });
    }
  }
  tokens = newTokens;
  
  // Parse bold (**text** or __text__)
  newTokens = [];
  for (const token of tokens) {
    if (token.bold || token.italic || token.code || token.linkUrl) {
      newTokens.push(token);
      continue;
    }
    
    let lastIndex = 0;
    let match;
    const regex = /(\*\*|__)(.*?)\1/g;
    while ((match = regex.exec(token.text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        newTokens.push({ text: token.text.substring(lastIndex, matchIndex) });
      }
      newTokens.push({
        text: match[2],
        bold: true
      });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < token.text.length) {
      newTokens.push({ text: token.text.substring(lastIndex) });
    }
  }
  tokens = newTokens;
  
  // Parse italic (*text* or _text_)
  newTokens = [];
  for (const token of tokens) {
    if (token.bold || token.italic || token.code || token.linkUrl) {
      newTokens.push(token);
      continue;
    }
    
    let lastIndex = 0;
    let match;
    const regex = /(\*|_)(.*?)\1/g;
    while ((match = regex.exec(token.text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        newTokens.push({ text: token.text.substring(lastIndex, matchIndex) });
      }
      newTokens.push({
        text: match[2],
        italic: true
      });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < token.text.length) {
      newTokens.push({ text: token.text.substring(lastIndex) });
    }
  }
  tokens = newTokens;
  
  // Parse inline code (`code`)
  newTokens = [];
  for (const token of tokens) {
    if (token.bold || token.italic || token.code || token.linkUrl) {
      newTokens.push(token);
      continue;
    }
    
    let lastIndex = 0;
    let match;
    const regex = /`([^`]+)`/g;
    while ((match = regex.exec(token.text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        newTokens.push({ text: token.text.substring(lastIndex, matchIndex) });
      }
      newTokens.push({
        text: match[1],
        code: true
      });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < token.text.length) {
      newTokens.push({ text: token.text.substring(lastIndex) });
    }
  }
  tokens = newTokens;
  
  // Build spans
  tokens.forEach((token) => {
    if (!token.text) return;
    
    const marks: string[] = [];
    if (token.bold) marks.push("strong");
    if (token.italic) marks.push("em");
    if (token.code) marks.push("code");
    
    if (token.linkUrl) {
      const linkKey = generateId("link");
      marks.push(linkKey);
      markDefs.push({
        _key: linkKey,
        _type: "link",
        href: token.linkUrl
      });
    }
    
    children.push({
      _type: "span",
      _key: generateId("span"),
      text: token.text,
      marks: marks.length > 0 ? marks : undefined
    });
  });
  
  // Fallback for completely plain blocks
  if (children.length === 0) {
    children.push({
      _type: "span",
      _key: generateId("span"),
      text: textContent
    });
  }
  
  const block: PortableTextBlock = {
    _type: "block",
    _key: generateId("block"),
    style,
    children
  };
  
  if (markDefs.length > 0) {
    block.markDefs = markDefs;
  }
  
  return block;
}
