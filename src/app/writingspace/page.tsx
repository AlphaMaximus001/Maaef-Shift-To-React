"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { markdownToPortableText } from "@/lib/markdownToPortableText";
import BlogPostContent from "@/components/BlogPostContent";

interface Post {
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
  markdownBody?: string;
  isArchived?: boolean;
}

function getSafeDateString(dateStr: string) {
  if (!dateStr) return new Date().toISOString();
  const dateObj = new Date(dateStr);
  return isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
}

export default function StudioPage() {
  // Authorization Gate State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tab control: "archives" or "editor"
  const [activeView, setActiveView] = useState<"archives" | "editor">("archives");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Editor sub-tab: "write" or "preview"
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

  // Loading & upload states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [logMessage, setLogMessage] = useState("Ready");
  const [isSlugLocked, setIsSlugLocked] = useState(true);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainImageAlt, setMainImageAlt] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorImage, setAuthorImage] = useState("");
  const [categoryString, setCategoryString] = useState("");
  const [markdownBody, setMarkdownBody] = useState("");
  const [isArchived, setIsArchived] = useState(false);

  // Category and local backup states
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [backupDraft, setBackupDraft] = useState<any>(null);
  const [showBackupBanner, setShowBackupBanner] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const authorImageInputRef = useRef<HTMLInputElement | null>(null);

  // Check authorization on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("maaef_authorized");
      if (auth === "true") {
        setIsAuthorized(true);
      }
    }
  }, []);

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "maaef2026") {
      setIsAuthorized(true);
      sessionStorage.setItem("maaef_authorized", "true");
      setPasswordError("");
    } else {
      setPasswordError("ACCESS DENIED: KEYCODE NOT RECOGNIZED");
      setPasswordInput("");
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        setFilteredPosts(data);
      }
    } catch (err) {
      setLogMessage("Failed to fetch dispatches.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchPosts();
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredPosts(
        posts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.slug.current.toLowerCase().includes(q) ||
            p.categories?.some((c) => c.title.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, posts]);

  useEffect(() => {
    if (!isSlugLocked && title) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setSlug(autoSlug);
    }
  }, [title, isSlugLocked]);

  // 1. Aggregate unique categories from posts for typo-free recommendations
  useEffect(() => {
    if (posts.length > 0) {
      const catsSet = new Set<string>();
      posts.forEach((p) => {
        p.categories?.forEach((c) => {
          if (c.title) {
            catsSet.add(c.title.trim());
          }
        });
      });
      setSuggestedCategories(Array.from(catsSet).filter(Boolean));
    }
  }, [posts]);

  // 2. Check for unsaved local draft on page mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("maaef_draft_backup");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title || parsed.markdownBody) {
            setBackupDraft(parsed);
            setShowBackupBanner(true);
          }
        } catch (e) {
          // ignore corrupt data
        }
      }
    }
  }, []);

  // 3. Debounced local draft autosave on form state updates
  useEffect(() => {
    if (!title && !markdownBody && !slug) return;
    
    const saveTimer = setTimeout(() => {
      const draft = {
        title,
        slug,
        publishedAt,
        mainImageUrl,
        mainImageAlt,
        authorName,
        authorImage,
        categoryString,
        markdownBody,
        isArchived,
      };
      localStorage.setItem("maaef_draft_backup", JSON.stringify(draft));
      setLogMessage("Draft autosaved locally.");
    }, 1500);
    
    return () => clearTimeout(saveTimer);
  }, [title, slug, publishedAt, mainImageUrl, mainImageAlt, authorName, authorImage, categoryString, markdownBody, isArchived]);

  const loadPostIntoForm = (post: Post) => {
    setSelectedPost(post);
    setTitle(post.title);
    setSlug(post.slug.current);
    setPublishedAt(post.publishedAt ? post.publishedAt.substring(0, 16) : new Date().toISOString().substring(0, 16));
    setMainImageUrl(post.mainImage?.url || "");
    setMainImageAlt(post.mainImage?.alt || "");
    setAuthorName(post.author?.name || "");
    setAuthorImage(post.author?.image || "");
    setCategoryString(post.categories?.map((c) => c.title).join(", ") || "");
    setMarkdownBody(post.markdownBody || "");
    setIsArchived(post.isArchived || false);
    setIsSlugLocked(true);
    setEditorTab("write");
    setUploadStatus("");
    setActiveView("editor");
    setLogMessage(`Editing: ${post.title}`);
  };

  const handleInitializeNew = () => {
    setSelectedPost(null);
    setTitle("");
    setSlug("");
    setPublishedAt(new Date().toISOString().substring(0, 16));
    setMainImageUrl("");
    setMainImageAlt("");
    setAuthorName("Maaef Editorial Team");
    setAuthorImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop");
    setCategoryString("Design, Strategy");
    setMarkdownBody("");
    setIsArchived(false);
    setIsSlugLocked(false);
    setEditorTab("write");
    setUploadStatus("");
    setActiveView("editor");
    setLogMessage("Opened new dispatch sheet.");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Uploading visual...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMainImageUrl(data.url);
        setUploadStatus("Upload successful");
        setLogMessage("Image saved successfully.");
      } else {
        const errorData = await res.json();
        setUploadStatus(`Upload failed: ${errorData.error}`);
      }
    } catch (err) {
      setUploadStatus("Upload failed");
    }
  };

  const handleAuthorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Uploading author avatar...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAuthorImage(data.url);
        setUploadStatus("Avatar upload successful");
        setLogMessage("Author avatar saved successfully.");
      } else {
        const errorData = await res.json();
        setUploadStatus(`Avatar upload failed: ${errorData.error}`);
      }
    } catch (err) {
      setUploadStatus("Avatar upload failed");
    }
  };

  const handleRestoreBackup = () => {
    if (!backupDraft) return;
    
    setTitle(backupDraft.title || "");
    setSlug(backupDraft.slug || "");
    setPublishedAt(backupDraft.publishedAt || new Date().toISOString().substring(0, 16));
    setMainImageUrl(backupDraft.mainImageUrl || "");
    setMainImageAlt(backupDraft.mainImageAlt || "");
    setAuthorName(backupDraft.authorName || "");
    setAuthorImage(backupDraft.authorImage || "");
    setCategoryString(backupDraft.categoryString || "");
    setMarkdownBody(backupDraft.markdownBody || "");
    setIsArchived(backupDraft.isArchived || false);
    setIsSlugLocked(true);
    
    setActiveView("editor");
    setEditorTab("write");
    setShowBackupBanner(false);
    setLogMessage("Restored local draft successfully.");
  };

  const handleDiscardBackup = () => {
    const confirmDiscard = window.confirm("Discard the unsaved local backup? This cannot be undone.");
    if (!confirmDiscard) return;
    
    localStorage.removeItem("maaef_draft_backup");
    setBackupDraft(null);
    setShowBackupBanner(false);
    setLogMessage("Discarded local draft backup.");
  };

  const handleAddCategory = (cat: string) => {
    const trimmedCat = cat.trim();
    const currentCats = categoryString
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    
    if (!currentCats.includes(trimmedCat)) {
      const updated = [...currentCats, trimmedCat].join(", ");
      setCategoryString(updated);
      setLogMessage(`Added category: ${trimmedCat}`);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      alert("Please key in both Title and Slug before saving.");
      return;
    }

    setIsSaving(true);
    setLogMessage("Saving post...");

    const categoriesArray = categoryString
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((title) => ({
        title,
        slug: { current: title.toLowerCase().replace(/\s+/g, "-") },
      }));

    const postPayload = {
      title,
      slug: { current: slug },
      publishedAt: getSafeDateString(publishedAt),
      mainImage: mainImageUrl
        ? {
            url: mainImageUrl,
            alt: mainImageAlt || title,
          }
        : null,
      author: {
        name: authorName,
        image: authorImage,
      },
      categories: categoriesArray,
      markdownBody: markdownBody,
      isArchived: isArchived,
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload),
      });

      if (res.ok) {
        setLogMessage("Saved successfully.");
        setIsSlugLocked(true);
        
        // Purge draft backup on successful save
        localStorage.removeItem("maaef_draft_backup");
        setBackupDraft(null);
        setShowBackupBanner(false);
        
        await fetchPosts();
        setActiveView("archives");
      } else {
        const errorData = await res.json();
        setLogMessage(`Save failed: ${errorData.error}`);
        alert(`Save failed: ${errorData.error}`);
      }
    } catch (err) {
      setLogMessage("Connection failure.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleArchive = async (post: Post) => {
    const updatedPost = {
      ...post,
      isArchived: !post.isArchived,
    };

    setLogMessage(`${updatedPost.isArchived ? "Archiving" : "Publishing"} post...`);

    try {
      const res = await fetch(`/api/posts/${post.slug.current}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });

      if (res.ok) {
        setLogMessage(`Post successfully ${updatedPost.isArchived ? "archived" : "published"}.`);
        await fetchPosts();
      } else {
        setLogMessage("Failed to update status.");
      }
    } catch (err) {
      setLogMessage("Connection failure.");
    }
  };

  const handleDeleteFromList = async (post: Post) => {
    const confirmDelete = window.confirm(`Permanently delete post: "${post.title}"?\nThis removes the file on your local disk.`);
    if (!confirmDelete) return;

    setLogMessage("Deleting post...");

    try {
      const res = await fetch(`/api/posts/${post.slug.current}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLogMessage("Deleted successfully.");
        await fetchPosts();
      } else {
        setLogMessage("Failed to delete post.");
      }
    } catch (err) {
      setLogMessage("Connection failure.");
    }
  };

  const previewPost = {
    title,
    publishedAt: getSafeDateString(publishedAt),
    mainImage: mainImageUrl ? { url: mainImageUrl, alt: mainImageAlt || title } : undefined,
    author: {
      name: authorName,
      image: authorImage,
    },
    categories: categoryString
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((title) => ({ title })),
    body: markdownToPortableText(markdownBody),
  };

  // RENDER PASSWORD GATE SCREEN IF NOT AUTHORIZED
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#f4f1ee] font-sans flex flex-col items-center justify-center relative overflow-hidden select-none">
        {/* Passcode Lock Container */}
        <form onSubmit={handleAuthorize} className="w-full max-w-[400px] flex flex-col gap-8 p-10 border border-white/10 bg-[#0c0c0c] text-center">
          <div className="flex flex-col gap-3">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white m-0">
              System Authorization
            </h1>
            <p className="text-sm text-white/45">
              Enter keycode to access the writing terminal
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="KEYCODE"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 focus:border-white/30 focus:outline-none p-4 font-mono text-center text-lg text-white tracking-[0.2em] placeholder-white/20 transition rounded-sm"
              autoFocus
            />
            {passwordError && (
              <span className="text-xs font-mono text-red-500 uppercase tracking-wider block">
                {passwordError}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full font-mono text-xs uppercase tracking-widest bg-white text-black hover:bg-[#e40521] hover:text-white py-4 font-bold transition duration-300 cursor-pointer rounded-sm"
          >
            Authorize Access
          </button>
        </form>
      </div>
    );
  }

  // RENDER MAIN BLOG CMS WRITING ENVIRONMENT IF AUTHORIZED
  return (
    <div className="min-h-screen bg-[#070707] text-[#f4f1ee] font-sans flex flex-col h-screen max-h-screen overflow-hidden">
      
      {/* 1. Spacious Clean Header Navigation */}
      <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a] z-10 flex-shrink-0 relative select-none">
        
        {/* Left: Branding & Core Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/blog" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition duration-300 no-underline font-semibold">
            <span>← Public Blog</span>
          </Link>
          <span className="w-[1px] h-6 bg-white/10" />
          <h2 className="text-xl font-bold font-serif text-white tracking-tight">Writing Terminal</h2>
        </div>

        {/* Center: Separated View Navigation Buttons */}
        <div className="flex items-center gap-4 select-none">
          <button
            onClick={() => setActiveView("archives")}
            className={`px-6 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              activeView === "archives"
                ? "bg-white text-black font-bold"
                : "border border-white/10 text-white/50 hover:text-white hover:border-white/20"
            }`}
          >
            All Blogs
          </button>
          
          <button
            onClick={handleInitializeNew}
            className={`px-6 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              activeView === "editor"
                ? "bg-white text-black font-bold"
                : "border border-white/10 text-white/50 hover:text-white hover:border-white/20"
            }`}
          >
            {selectedPost ? "Edit Blog" : "New Blog +"}
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {activeView === "editor" ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveView("archives")}
                className="text-xs uppercase font-mono tracking-widest text-white/50 hover:text-white cursor-pointer transition py-2"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="font-mono text-xs uppercase tracking-widest bg-[#e40521] text-white hover:bg-[#ff0c2b] px-6 py-2.5 rounded-sm font-bold transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Post"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleInitializeNew}
              className="font-mono text-xs uppercase tracking-widest bg-[#e40521] text-white hover:bg-[#ff0c2b] px-6 py-2.5 rounded-sm font-bold transition duration-300 cursor-pointer"
            >
              Compose New +
            </button>
          )}
        </div>

      </header>

      {/* Restore backup banner */}
      {showBackupBanner && backupDraft && (
        <div className="bg-[#0f0f0f] border-b border-white/10 px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none animate-fadeIn flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#e40521] animate-pulse" />
            <p className="text-xs text-white/80 font-mono tracking-wide m-0">
              [UNSAVED LOCAL DRAFT DETECTED] &mdash; Last composed: <span className="text-white font-semibold">&ldquo;{backupDraft.title || "Untitled Post"}&rdquo;</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRestoreBackup}
              className="px-4 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-widest bg-white text-black font-bold transition hover:bg-white/90 cursor-pointer"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardBackup}
              className="px-4 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-widest border border-white/10 text-white/50 transition hover:text-white hover:border-white/20 cursor-pointer bg-transparent"
            >
              Discard Backup
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Dashboard Canvas */}
      <div className="flex-1 overflow-hidden relative z-10 min-h-0 bg-[#070707]">
        
        {/* VIEW 1: ALL BLOGS LIST & BOARD */}
        {activeView === "archives" ? (
          <div className="h-full flex flex-col p-8 sm:p-10 md:p-12 max-w-[1300px] mx-auto overflow-hidden">
            
            {/* Header filters and stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-8 mb-10 gap-6 select-none flex-shrink-0">
              <div>
                <h1 className="font-serif text-4xl font-bold tracking-tight mb-2">Editorial Archives</h1>
                <p className="text-sm text-white/50 font-sans leading-relaxed">
                  Archive dispatches to hide them from the public feed, or choose to edit and delete existing records.
                </p>
              </div>

              {/* Large search bar */}
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Search articles by title or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0b0b0b] border border-white/15 focus:border-white/30 focus:outline-none px-5 py-3 text-sm text-[#f4f1ee] placeholder-white/30 rounded-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white font-mono cursor-pointer"
                  >
                    [clear]
                  </button>
                )}
              </div>
            </div>

            {/* List and Grid Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
              {isLoading ? (
                <div className="py-44 text-center select-none">
                  <span className="text-sm text-white/30 animate-pulse tracking-[0.28em] uppercase">Reading dispatches from local disk...</span>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="py-32 border border-dashed border-white/10 p-10 text-center select-none rounded-sm">
                  <span className="font-mono text-xs text-white/30 uppercase tracking-widest block mb-3">NO DISPATCHES FOUND</span>
                  <p className="text-sm text-white/50 max-w-[380px] mx-auto font-sans leading-relaxed">
                    Create a new dispatch record to populate your editorial directory.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post, idx) => {
                    const serial = String(idx + 1).padStart(2, "0");
                    const coverUrl = post.mainImage?.url;
                    
                    return (
                      <div
                        key={post._id}
                        className={`border rounded-sm p-7 bg-[#0b0b0b] hover:bg-white/[0.005] hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[300px] ${
                          post.isArchived ? "border-white/5 opacity-50" : "border-white/10"
                        }`}
                      >
                        <div>
                          {/* Top Row Indicators */}
                          <div className="flex justify-between items-center mb-5 select-none">
                            <span className="text-xs text-white/40 font-semibold font-mono">#{serial}</span>
                            <span className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-sm border ${
                              post.isArchived 
                                ? "border-white/10 text-white/30 bg-transparent" 
                                : "border-red text-red bg-red/5 font-semibold"
                            }`}>
                              {post.isArchived ? "Archived" : "Published"}
                            </span>
                          </div>

                          {/* Cover Image Thumbnail Preview */}
                          {coverUrl && (
                            <div className="w-full h-36 bg-[#0a0a0a] border border-white/5 rounded-sm overflow-hidden mb-4 relative select-none">
                              <img
                                src={coverUrl}
                                alt={post.title}
                                className="absolute inset-0 w-full h-full object-cover grayscale brightness-95 hover:grayscale-0 transition duration-500"
                              />
                            </div>
                          )}

                          {/* Title & Categories */}
                          <h3 className="font-serif text-xl font-bold tracking-tight mb-3 line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 select-none mb-5">
                            {post.categories?.map((cat) => (
                              <span
                                key={cat.title}
                                className="text-[9px] font-mono tracking-widest text-white/40 uppercase border border-white/10 px-2.5 py-1 rounded-sm bg-[#070707]"
                              >
                                {cat.title}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Row Actions (Separated Spaced Buttons) */}
                        <div className="border-t border-white/5 pt-5 flex justify-between items-center mt-4 select-none">
                          <span className="text-xs font-mono text-white/35 uppercase">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "DRAFT"}
                          </span>
                          
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleArchive(post)}
                              className="text-[10px] font-mono uppercase tracking-widest border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-sm text-white/60 hover:text-white cursor-pointer transition bg-[#070707]"
                            >
                              {post.isArchived ? "Publish" : "Archive"}
                            </button>
                            <button
                              onClick={() => loadPostIntoForm(post)}
                              className="text-[10px] font-mono uppercase tracking-widest bg-white text-black hover:bg-white/90 px-3.5 py-1.5 rounded-sm cursor-pointer transition font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFromList(post)}
                              className="text-[10px] font-mono uppercase tracking-widest border border-white/10 text-white/30 hover:border-red hover:text-red px-3 py-1.5 rounded-sm cursor-pointer transition bg-transparent"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        ) : (
          
          /* VIEW 2: UNIFIED ENLARGED BLOG POST WRITER & EDITOR */
          <div className="h-full flex flex-col min-h-0 bg-[#070707]">
            
            {/* Editor Subheader Toggles */}
            <div className="h-14 border-b border-white/10 bg-[#0a0a0a] px-8 flex items-center justify-between select-none flex-shrink-0">
              <span className="text-xs font-mono tracking-widest text-white/40 uppercase">
                {selectedPost ? `EDITING DISPATCH RECORD :: ${slug}` : "NEW DISPATCH COMPOSITION BUFFER"}
              </span>

              {/* Write vs Preview Separated Buttons */}
              <div className="flex items-center gap-3 select-none">
                <button
                  onClick={() => setEditorTab("write")}
                  className={`px-4 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-wider cursor-pointer transition ${
                    editorTab === "write"
                      ? "bg-white text-black font-semibold"
                      : "border border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  Write Content
                </button>
                <button
                  onClick={() => setEditorTab("preview")}
                  className={`px-4 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-wider cursor-pointer transition ${
                    editorTab === "preview"
                      ? "bg-white text-black font-semibold"
                      : "border border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  Live Preview
                </button>
              </div>
            </div>            {/* TAB CONTENT: WRITING EDITOR WORKSPACE */}
            {editorTab === "write" ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 min-h-0 bg-[#050505]">
                <div className="max-w-[1350px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Post Composition (Col span 7 or 8) */}
                  <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                    
                    {/* Massive focused title */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest select-none">
                        POST TITLE
                      </label>
                      <input
                        type="text"
                        placeholder="Title of dispatch..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none font-serif text-2xl sm:text-3xl font-bold text-white placeholder-white/10 leading-tight border-b border-white/10 pb-4 focus:border-white/20 transition-colors"
                      />
                    </div>

                    {/* Large Content Editor Textarea */}
                    <div className="flex flex-col gap-2 min-h-[500px]">
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider select-none">
                        MARKDOWN BODY COMPOSITION
                      </label>
                      <textarea
                        placeholder="Start typing your editorial story here in standard Markdown..."
                        value={markdownBody}
                        onChange={(e) => setMarkdownBody(e.target.value)}
                        className="w-full bg-[#0b0b0b] border border-white/15 focus:border-white/30 focus:outline-none p-6 text-base leading-relaxed text-[#f4f1ee] placeholder-white/25 resize-none transition rounded-sm custom-scrollbar min-h-[600px] lg:min-h-[700px] font-sans"
                      />
                    </div>

                  </div>

                  {/* Right Column: Settings & Configuration Panel (Col span 5 or 4) */}
                  <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 select-none">
                    
                    {/* 1. Publishing Options Box */}
                    <div className="border border-white/10 rounded-sm p-5 bg-[#0b0b0b] flex flex-col gap-4">
                      <div className="text-xs font-mono text-white/40 uppercase tracking-widest select-none">
                        Publishing Status
                      </div>
                      <div className="flex items-center justify-between bg-[#070707] border border-white/10 p-3 rounded-sm">
                        <span className="text-xs font-mono text-white/60">Status</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                            isArchived 
                              ? "border-white/10 text-white/30 bg-transparent" 
                              : "border-[#e40521] text-[#e40521] bg-[#e40521]/5 font-semibold"
                          }`}>
                            {isArchived ? "Draft (Archived)" : "Live"}
                          </span>
                          
                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => setIsArchived(!isArchived)}
                            className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-white/10 bg-white/5 transition-colors duration-200 ease-in-out focus:outline-none"
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out mt-[1px] ml-[1px] ${
                                isArchived ? "translate-x-0 bg-white/40" : "translate-x-4 bg-[#e40521]"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 font-sans leading-normal m-0">
                        {isArchived 
                          ? "This post will be kept as a local draft/archive and will not be displayed on the public blog feed." 
                          : "This post will be live and accessible to the public immediately or at the scheduled date."}
                      </p>
                    </div>

                    {/* 2. Cover Photo Upload Box & Cover URL */}
                    <div className="border border-white/10 rounded-sm p-5 bg-[#0b0b0b]">
                      <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3 select-none">
                        Cover Visual
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      {mainImageUrl ? (
                        <div className="w-full h-36 rounded-sm border border-white/5 overflow-hidden relative select-none group">
                          <img
                            src={mainImageUrl}
                            alt="Cover preview"
                            className="absolute inset-0 w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-white text-black font-mono text-[9px] uppercase px-3 py-1.5 rounded-sm cursor-pointer transition font-semibold hover:bg-white/90 mr-2"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => setMainImageUrl("")}
                              className="bg-black/70 text-white font-mono text-[9px] uppercase px-3 py-1.5 rounded-sm cursor-pointer transition font-semibold hover:bg-red hover:text-white border border-white/10"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-24 border border-dashed border-white/10 hover:border-white/30 hover:bg-white/[0.005] transition-all duration-300 rounded-sm flex flex-col justify-center items-center cursor-pointer p-4"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white/40 mb-2"
                          >
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                          </svg>
                          <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                            {uploadStatus.includes("visual") ? uploadStatus : "Upload Cover Image"}
                          </span>
                        </button>
                      )}

                      <div className="flex flex-col gap-3 mt-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider select-none">
                            Cover Image Path URL
                          </label>
                          <input
                            type="text"
                            placeholder="Auto-filled or custom path"
                            value={mainImageUrl}
                            onChange={(e) => setMainImageUrl(e.target.value)}
                            className="bg-[#050505] border border-white/15 focus:border-white/30 focus:outline-none px-3 py-2 text-xs text-white rounded-sm placeholder-white/20"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider select-none">
                            Alt Description
                          </label>
                          <input
                            type="text"
                            placeholder="Alt text detail"
                            value={mainImageAlt}
                            onChange={(e) => setMainImageAlt(e.target.value)}
                            className="bg-[#050505] border border-white/15 focus:border-white/30 focus:outline-none px-3 py-2 text-xs text-white/80 rounded-sm placeholder-white/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Metadata Config Box */}
                    <div className="border border-white/10 rounded-sm p-5 bg-[#0b0b0b] flex flex-col gap-4">
                      <div className="text-xs font-mono text-white/40 uppercase tracking-widest select-none">
                        Metadata Config
                      </div>
                      
                      {/* Slug Input */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center w-full select-none">
                          <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">
                            SLUG PATH
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsSlugLocked(!isSlugLocked)}
                            className="font-mono text-[8px] text-[#e40521] hover:underline uppercase cursor-pointer bg-transparent border-none"
                          >
                            {isSlugLocked ? "Edit" : "Lock"}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="slug-path"
                          value={slug}
                          disabled={isSlugLocked}
                          onChange={(e) => setSlug(e.target.value)}
                          className="bg-[#050505] border border-white/15 focus:border-white/30 focus:outline-none px-3 py-2 text-xs text-white placeholder-white/25 rounded-sm disabled:opacity-60 transition"
                        />
                      </div>

                      {/* Publish Date Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider select-none">
                          PUBLISH DATE
                        </label>
                        <input
                          type="datetime-local"
                          value={publishedAt}
                          onChange={(e) => setPublishedAt(e.target.value)}
                          className="bg-[#050505] border border-white/15 focus:border-white/30 focus:outline-none px-3 py-2 text-xs text-white rounded-sm transition"
                        />
                      </div>
                    </div>

                    {/* 4. Taxonomy & Contributor Box */}
                    <div className="border border-white/10 rounded-sm p-5 bg-[#0b0b0b] flex flex-col gap-4">
                      <div className="text-xs font-mono text-white/40 uppercase tracking-widest select-none">
                        Taxonomy & Contributor
                      </div>
                      
                      {/* Categories */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider select-none">
                          CATEGORIES (CSV)
                        </label>
                        <input
                          type="text"
                          placeholder="Design, Strategy, Film"
                          value={categoryString}
                          onChange={(e) => setCategoryString(e.target.value)}
                          className="bg-[#050505] border border-white/15 focus:border-white/30 focus:outline-none px-3 py-2 text-xs text-white placeholder-white/25 rounded-sm transition uppercase tracking-wider"
                        />
                        {suggestedCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5 select-none">
                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest self-center mr-1">
                              Pills:
                            </span>
                            {suggestedCategories.map((cat) => {
                              const isActive = categoryString
                                .split(",")
                                .map((c) => c.trim())
                                .includes(cat);
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => handleAddCategory(cat)}
                                  className={`text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm border transition duration-200 cursor-pointer ${
                                    isActive
                                      ? "border-[#e40521] text-[#e40521] bg-[#e40521]/5 font-semibold"
                                      : "border-white/10 text-white/40 bg-[#050505] hover:border-white/30 hover:text-white"
                                  }`}
                                >
                                  {cat}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Contributor Avatar & Signature */}
                      <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                        <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider select-none">
                          CONTRIBUTOR
                        </label>
                        <div className="flex gap-3 items-center">
                          <div className="relative select-none flex-shrink-0">
                            <input
                              type="file"
                              accept="image/*"
                              ref={authorImageInputRef}
                              onChange={handleAuthorImageUpload}
                              className="hidden"
                            />
                            <div
                              onClick={() => authorImageInputRef.current?.click()}
                              className="w-10 h-10 rounded-full border border-white/10 hover:border-white/30 bg-[#050505] overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300 relative group"
                              title="Upload Avatar"
                            >
                              {authorImage ? (
                                <img
                                  src={authorImage}
                                  alt="Contributor Avatar"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="text-white/30 group-hover:text-white transition-colors"
                                >
                                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                                </svg>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <span className="text-[7px] font-mono text-white uppercase tracking-tighter">UP</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-1">
                            <input
                              type="text"
                              placeholder="Contributor name"
                              value={authorName}
                              onChange={(e) => setAuthorName(e.target.value)}
                              className="w-full bg-[#050505] border border-white/15 focus:border-white/30 focus:outline-none px-3 py-1.5 text-xs text-white/80 placeholder-white/25 rounded-sm transition"
                            />
                            <input
                              type="text"
                              placeholder="Avatar Path URL"
                              value={authorImage}
                              onChange={(e) => setAuthorImage(e.target.value)}
                              className="w-full bg-[#050505] border border-white/15 focus:border-white/30 focus:outline-none px-3 py-1 text-[10px] text-white/35 placeholder-white/20 rounded-sm transition"
                            />
                          </div>
                        </div>
                        {uploadStatus.includes("avatar") && (
                          <span className="text-[8px] font-mono text-[#e40521] uppercase tracking-wider block mt-1">
                            {uploadStatus}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            ) : (
              
              /* TAB CONTENT: PREVIEW WORKSPACE */
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505] min-h-0">
                <BlogPostContent post={previewPost} />
              </div>

            )}

          </div>
        )}

      </div>

      {/* Status Footer */}
      <footer className="h-10 border-t border-white/10 bg-[#0a0a0a] z-10 flex-shrink-0 flex items-center px-8 justify-between select-none">
        <div className="font-mono text-xs tracking-wide text-white/35 uppercase">
          Status: <span className="text-white/60">{logMessage}</span>
        </div>
      </footer>

    </div>
  );
}
