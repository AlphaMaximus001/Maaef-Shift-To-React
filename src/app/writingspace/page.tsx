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
    <div className="min-h-screen bg-[#050505] text-[#f4f1ee] font-sans flex flex-col h-screen max-h-screen overflow-hidden antialiased">
      
      {/* 1. Spacious Premium Header Navigation */}
      <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#090909]/95 backdrop-blur-md z-20 flex-shrink-0 relative select-none">
        
        {/* Left: Branding & Core Navigation */}
        <div className="flex items-center gap-10">
          <Link href="/blog" className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all duration-300 no-underline">
            <span className="text-xs">←</span>
            <span>Public Blog</span>
          </Link>
          <span className="w-[1px] h-6 bg-white/10" />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold font-serif text-white tracking-tight leading-none m-0">Writing Terminal</h2>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-1">MAAEF EDITORIAL SYSTEM</span>
          </div>
        </div>

        {/* Center: Separated View Navigation Buttons */}
        <div className="flex items-center gap-6 select-none bg-[#050505] border border-white/5 p-1 rounded-sm">
          <button
            onClick={() => setActiveView("archives")}
            className={`px-8 py-2.5 rounded-sm font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${
              activeView === "archives"
                ? "bg-white text-black font-bold shadow-lg"
                : "text-white/40 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            All Blogs
          </button>
          
          <button
            onClick={handleInitializeNew}
            className={`px-8 py-2.5 rounded-sm font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${
              activeView === "editor"
                ? "bg-white text-black font-bold shadow-lg"
                : "text-white/40 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            {selectedPost ? "Edit Blog" : "New Blog +"}
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {activeView === "editor" ? (
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveView("archives")}
                className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/45 hover:text-white cursor-pointer transition-colors py-2"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="font-mono text-[10px] uppercase tracking-[0.2em] bg-[#e40521] text-white hover:bg-[#ff0c2b] px-8 py-3 rounded-sm font-bold transition-all duration-300 cursor-pointer disabled:opacity-50 hover:shadow-[0_0_20px_rgba(228,5,33,0.3)]"
              >
                {isSaving ? "Saving..." : "Save Post"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleInitializeNew}
              className="font-mono text-[10px] uppercase tracking-[0.2em] bg-[#e40521] text-white hover:bg-[#ff0c2b] px-8 py-3 rounded-sm font-bold transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(228,5,33,0.3)]"
            >
              Compose New +
            </button>
          )}
        </div>

      </header>

      {/* Restore backup banner */}
      {showBackupBanner && backupDraft && (
        <div className="bg-[#0c0c0c] border-b border-white/5 px-12 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none animate-fadeIn flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#e40521] animate-pulse" />
            <p className="text-[10px] text-white/50 font-mono tracking-[0.15em] uppercase m-0">
              [UNSAVED LOCAL DRAFT] &mdash; &ldquo;{backupDraft.title || "Untitled Post"}&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRestoreBackup}
              className="px-5 py-2 rounded-sm font-mono text-[9px] uppercase tracking-[0.15em] bg-white text-black font-bold transition hover:bg-white/90 cursor-pointer"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardBackup}
              className="px-5 py-2 rounded-sm font-mono text-[9px] uppercase tracking-[0.15em] border border-white/10 text-white/55 transition hover:text-white hover:border-white/20 cursor-pointer bg-transparent"
            >
              Discard Backup
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Dashboard Canvas */}
      <div className="flex-1 overflow-hidden relative z-10 min-h-0 bg-[#050505]">
        
        {/* VIEW 1: ALL BLOGS LIST & BOARD */}
        {activeView === "archives" ? (
          <div className="h-full flex flex-col px-12 py-10 md:px-16 md:py-14 max-w-[1400px] mx-auto overflow-hidden">
            
            {/* Header filters and stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/5 pb-10 mb-10 gap-6 select-none flex-shrink-0">
              <div>
                <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-white">Editorial Archives</h1>
                <p className="text-xs text-white/40 font-sans tracking-wide leading-relaxed max-w-xl">
                  Manage dispatches across the MAAEF platform. Archive dispatches to hide them from public streams, or edit and remove records.
                </p>
              </div>

              {/* Large search bar */}
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Search articles by title or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 focus:border-white/20 focus:outline-none px-6 py-3.5 text-xs text-[#f4f1ee] placeholder-white/20 rounded-sm font-mono tracking-wider transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] text-white/30 hover:text-white font-mono cursor-pointer transition-colors"
                  >
                    [clear]
                  </button>
                )}
              </div>
            </div>

            {/* List and Grid Container */}
            <div className="flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar-thin">
              {isLoading ? (
                <div className="py-44 text-center select-none">
                  <span className="text-[10px] text-white/30 animate-pulse tracking-[0.3em] font-mono uppercase">READING DISPATCHES FROM LOCAL STORAGE...</span>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="py-36 border border-dashed border-white/5 p-12 text-center select-none rounded-sm bg-[#080808]/50">
                  <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.25em] block mb-4">NO DISPATCHES FOUND</span>
                  <p className="text-xs text-white/45 max-w-[340px] mx-auto font-sans leading-relaxed">
                    Start new dispatch records to populate your editorial directory.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-10">
                  {filteredPosts.map((post, idx) => {
                    const serial = String(idx + 1).padStart(2, "0");
                    const coverUrl = post.mainImage?.url;
                    
                    return (
                      <div
                        key={post._id}
                        className={`border rounded-sm px-8 py-8 bg-[#090909] hover:bg-[#0c0c0c] hover:border-white/15 transition-all duration-500 flex flex-col justify-between min-h-[320px] shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 ${
                          post.isArchived ? "border-white/5 opacity-40 hover:opacity-75" : "border-white/5"
                        }`}
                      >
                        <div>
                          {/* Top Row Indicators */}
                          <div className="flex justify-between items-center mb-6 select-none">
                            <span className="text-[10px] text-white/30 font-semibold font-mono tracking-wider">#{serial}</span>
                            <span className={`text-[8px] font-mono uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm border ${
                              post.isArchived 
                                ? "border-white/5 text-white/30 bg-transparent" 
                                : "border-[#e40521] text-[#e40521] bg-[#e40521]/5 font-semibold"
                            }`}>
                              {post.isArchived ? "Archived" : "Published"}
                            </span>
                          </div>

                          {/* Cover Image Thumbnail Preview */}
                          {coverUrl && (
                            <div className="w-full h-40 bg-[#050505] border border-white/5 rounded-sm overflow-hidden mb-5 relative select-none">
                              <img
                                src={coverUrl}
                                alt={post.title}
                                className="absolute inset-0 w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-700 hover:scale-105"
                              />
                            </div>
                          )}

                          {/* Title & Categories */}
                          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight mb-4 text-white line-clamp-2 leading-tight">
                            {post.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 select-none mb-6">
                            {post.categories?.map((cat) => (
                              <span
                                key={cat.title}
                                className="text-[8px] font-mono tracking-[0.2em] text-white/35 uppercase border border-white/5 px-3 py-1 rounded-sm bg-[#050505]"
                              >
                                {cat.title}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Row Actions */}
                        <div className="border-t border-white/5 pt-6 flex justify-between items-center mt-5 select-none">
                          <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.15em]">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "DRAFT"}
                          </span>
                          
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleArchive(post)}
                              className="text-[9px] font-mono uppercase tracking-[0.15em] border border-white/10 hover:border-white/30 px-3.5 py-2 rounded-sm text-white/60 hover:text-white cursor-pointer transition-colors bg-[#050505]"
                            >
                              {post.isArchived ? "Publish" : "Archive"}
                            </button>
                            <button
                              onClick={() => loadPostIntoForm(post)}
                              className="text-[9px] font-mono uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 px-4 py-2 rounded-sm cursor-pointer transition-colors font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFromList(post)}
                              className="text-[9px] font-mono uppercase tracking-[0.15em] border border-white/10 text-white/30 hover:border-[#e40521] hover:text-[#e40521] px-3.5 py-2 rounded-sm cursor-pointer transition-colors bg-transparent"
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
          /* VIEW 2: UNIFIED COMPACT BEAUTIFULLY SPACED BLOG POST WRITER & EDITOR */
          <div className="h-full flex flex-col min-h-0 bg-[#050505]">
            
            {/* Editor Subheader Toggles */}
            <div className="h-16 border-b border-white/5 bg-[#090909] px-12 flex items-center justify-between select-none flex-shrink-0">
              <span className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">
                {selectedPost ? `EDITING DISPATCH :: ${slug}` : "NEW DISPATCH COMPOSITION BUFFER"}
              </span>

              {/* Write vs Preview Separated Buttons */}
              <div className="flex items-center gap-3 select-none">
                <button
                  onClick={() => setEditorTab("write")}
                  className={`px-5 py-2 rounded-sm font-mono text-[9px] uppercase tracking-[0.15em] cursor-pointer transition-all duration-300 ${
                    editorTab === "write"
                      ? "bg-white text-black font-bold shadow-md"
                      : "border border-white/5 text-white/40 hover:text-white hover:bg-white/[0.01]"
                  }`}
                >
                  Write Content
                </button>
                <button
                  onClick={() => setEditorTab("preview")}
                  className={`px-5 py-2 rounded-sm font-mono text-[9px] uppercase tracking-[0.15em] cursor-pointer transition-all duration-300 ${
                    editorTab === "preview"
                      ? "bg-white text-black font-bold shadow-md"
                      : "border border-white/5 text-white/40 hover:text-white hover:bg-white/[0.01]"
                  }`}
                >
                  Live Preview
                </button>
              </div>
            </div>

            {/* TAB CONTENT: WRITING EDITOR WORKSPACE */}
            {editorTab === "write" ? (
              <div className="flex-1 overflow-y-auto pr-2 p-12 sm:p-16 md:p-20 min-h-0 bg-[#050505] custom-scrollbar-thin">
                <div className="max-w-[850px] mx-auto flex flex-col gap-12">
                  
                  {/* Status Toggle (Publish/Draft Option) */}
                  <div className="border border-white/5 rounded-sm p-8 bg-[#090909] flex flex-col gap-4 select-none shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Publishing Status</span>
                        <span className="text-xs text-white/50 font-sans tracking-wide">
                          {isArchived ? "Draft (Keep this dispatch private/archived)" : "Publish (Make this dispatch live immediately)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[9px] font-mono uppercase tracking-[0.15em] px-3 py-1 rounded-sm border ${
                          isArchived 
                            ? "border-white/10 text-white/30 bg-transparent" 
                            : "border-[#e40521] text-[#e40521] bg-[#e40521]/5 font-semibold"
                        }`}>
                          {isArchived ? "Draft" : "Published"}
                        </span>
                        
                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => setIsArchived(!isArchived)}
                          className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border border-white/10 bg-white/5 transition-colors duration-300 ease-in-out focus:outline-none"
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-lg ring-0 transition duration-300 ease-in-out mt-[3px] ml-[3px] ${
                              isArchived ? "translate-x-0 bg-white/30" : "translate-x-5 bg-[#e40521]"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Massive focused title */}
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] select-none">
                      POST TITLE
                    </label>
                    <input
                      type="text"
                      placeholder="Title of dispatch..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none font-serif text-4xl sm:text-5xl font-bold text-white placeholder-white/5 leading-tight border-b border-white/5 pb-5 focus:border-white/20 transition-all duration-300"
                    />
                  </div>

                  {/* Large Content Editor Textarea */}
                  <div className="flex flex-col gap-4 min-h-[500px]">
                    <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] select-none">
                      MARKDOWN BODY COMPOSITION
                    </label>
                    <textarea
                      placeholder="Start typing your editorial story here in standard Markdown..."
                      value={markdownBody}
                      onChange={(e) => setMarkdownBody(e.target.value)}
                      className="w-full bg-[#090909] border border-white/5 focus:border-white/15 focus:outline-none p-10 text-base leading-relaxed text-[#f4f1ee] placeholder-white/15 resize-none transition-all duration-300 rounded-sm min-h-[600px] font-sans shadow-[0_4px_30px_rgba(0,0,0,0.3)] focus:shadow-[0_8px_40px_rgba(0,0,0,0.4)] animate-fadeIn"
                    ></textarea>
                  </div>

                </div>
              </div>
            ) : (
              /* TAB CONTENT: PREVIEW WORKSPACE */
              <div className="flex-1 overflow-y-auto pr-2 p-12 sm:p-16 md:p-20 min-h-0 bg-[#050505] custom-scrollbar-thin">
                <div className="max-w-[850px] mx-auto animate-fadeIn">
                  <BlogPostContent post={previewPost} />
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Status Footer */}
      <footer className="h-12 border-t border-white/5 bg-[#090909] z-20 flex-shrink-0 flex items-center px-12 justify-between select-none">
        <div className="font-mono text-[10px] tracking-[0.15em] text-white/30 uppercase">
          SYSTEM STATUS: <span className="text-white/60 font-semibold">{logMessage}</span>
        </div>
        <div className="font-mono text-[9px] tracking-[0.15em] text-white/20 uppercase">
          MAAEF OS V1.0.0
        </div>
      </footer>

    </div>
  );
}

