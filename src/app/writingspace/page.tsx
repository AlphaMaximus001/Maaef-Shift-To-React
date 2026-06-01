"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  markdownBody?: string;
  isArchived?: boolean;
  categories?: {
    title: string;
    slug?: {
      current: string;
    };
  }[];
}

export default function WritingSpace() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [markdownBody, setMarkdownBody] = useState("");
  const [categoryString, setCategoryString] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("System Ready");

  const [toaster, setToaster] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });

  const showToast = (message: string) => {
    setToaster({ message, visible: true });
  };

  useEffect(() => {
    if (toaster.visible) {
      const timer = setTimeout(() => {
        setToaster((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toaster.visible]);

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
      showToast("Access Granted");
    } else {
      setPasswordError("ACCESS DENIED: KEYCODE NOT RECOGNIZED");
      setPasswordInput("");
      showToast("Access Denied");
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        setStatusMessage("Failed to fetch dispatches.");
      }
    } catch (err) {
      setStatusMessage("Connection error reading posts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchPosts();
    }
  }, [isAuthorized]);

  const handleInitializeNew = () => {
    setSelectedPost(null);
    setTitle("");
    setMarkdownBody("");
    setCategoryString("");
    setIsArchived(false);
    setStatusMessage("Composing new post.");
    showToast("Form Cleared");
  };

  const loadPostIntoForm = (post: Post) => {
    setSelectedPost(post);
    setTitle(post.title);
    setMarkdownBody(post.markdownBody || "");
    setCategoryString(post.categories?.map((c) => c.title).join(", ") || "");
    setIsArchived(post.isArchived || false);
    setStatusMessage(`Loaded post: ${post.title}`);
    showToast("Post Loaded");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title before saving.");
      return;
    }

    setIsSaving(true);
    setStatusMessage("Saving post...");

    // Generate slug from title
    const generatedSlug = selectedPost
      ? selectedPost.slug.current
      : title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

    if (!generatedSlug) {
      alert("Could not generate a valid slug from the title.");
      setIsSaving(false);
      return;
    }

    // Parse category input
    const categoriesArray = categoryString
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((title) => ({
        title: title,
        slug: { current: title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim() }
      }));

    const postPayload = {
      _id: selectedPost?._id || generatedSlug,
      title: title.trim(),
      slug: { current: generatedSlug },
      publishedAt: selectedPost?.publishedAt || new Date().toISOString(),
      markdownBody: markdownBody,
      isArchived: isArchived,
      categories: categoriesArray,
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload),
      });

      if (res.ok) {
        setStatusMessage("Post saved successfully.");
        showToast("Post Saved Successfully");
        handleInitializeNew();
        await fetchPosts();
      } else {
        const errorData = await res.json();
        setStatusMessage(`Save failed: ${errorData.error}`);
        showToast("Save Failed");
        alert(`Save failed: ${errorData.error}`);
      }
    } catch (err) {
      setStatusMessage("Network error saving post.");
      showToast("Network Error Saving Post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (post: Post) => {
    const confirmDelete = window.confirm(`Permanently delete post: "${post.title}"?`);
    if (!confirmDelete) return;

    setStatusMessage("Deleting post...");

    try {
      const res = await fetch(`/api/posts/${post.slug.current}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStatusMessage("Post deleted successfully.");
        showToast("Post Deleted Successfully");
        if (selectedPost?.slug.current === post.slug.current) {
          handleInitializeNew();
        }
        await fetchPosts();
      } else {
        setStatusMessage("Failed to delete post.");
        showToast("Delete Failed");
      }
    } catch (err) {
      setStatusMessage("Network error deleting post.");
      showToast("Network Error Deleting Post");
    }
  };

  const handleToggleArchive = async (post: Post) => {
    const updatedPost = {
      ...post,
      isArchived: !post.isArchived,
    };

    setStatusMessage(`${updatedPost.isArchived ? "Archiving" : "Publishing"} post...`);

    try {
      const res = await fetch(`/api/posts/${post.slug.current}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });

      if (res.ok) {
        setStatusMessage(`Post successfully ${updatedPost.isArchived ? "archived" : "published"}.`);
        showToast(updatedPost.isArchived ? "Post Archived (Draft)" : "Post Published (Live)");
        await fetchPosts();
      } else {
        setStatusMessage("Failed to update status.");
        showToast("Status Update Failed");
      }
    } catch (err) {
      setStatusMessage("Network error toggling status.");
      showToast("Network Error Toggling Status");
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{
        backgroundColor: "#111",
        color: "#fff",
        fontFamily: "monospace",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <form onSubmit={handleAuthorize} style={{
          border: "1px solid #333",
          padding: "30px",
          backgroundColor: "#1c1c1c",
          maxWidth: "400px",
          width: "100%",
          boxSizing: "border-box"
        }}>
          <h2 style={{ marginTop: 0, borderBottom: "1px solid #333", paddingBottom: "10px" }}>AUTHORIZATION REQUIRED</h2>
          <p style={{ color: "#888", fontSize: "14px" }}>Enter password to access Writing Terminal</p>
          <input
            type="password"
            placeholder="PASSWORD"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              boxSizing: "border-box",
              backgroundColor: "#000",
              border: "1px solid #444",
              color: "#fff",
              fontSize: "16px",
              marginBottom: "15px",
              fontFamily: "monospace"
            }}
            autoFocus
          />
          {passwordError && (
            <p style={{ color: "red", fontSize: "12px", margin: "0 0 15px 0" }}>{passwordError}</p>
          )}
          <button type="submit" style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#fff",
            color: "#000",
            border: "none",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "monospace"
          }}>ACCESS TERMINAL</button>
        </form>

        {toaster.visible && (
          <div style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            color: "#000",
            padding: "12px 24px",
            fontFamily: "monospace",
            fontSize: "11px",
            fontWeight: "bold",
            border: "1px solid #333",
            boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#e40521",
              display: "inline-block"
            }} />
            <span>{toaster.message.toUpperCase()}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "#000",
      color: "#f4f1ee",
      fontFamily: "monospace",
      minHeight: "100vh",
      padding: "30px",
      boxSizing: "border-box"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #333",
        paddingBottom: "15px",
        marginBottom: "30px"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>MAAEF WRITING TERMINAL</h1>
          <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "11px" }}>PLAIN TEXT EDITING SPACE</p>
        </div>
        <div>
          <Link href="/blog" style={{
            color: "#888",
            textDecoration: "none",
            fontSize: "13px"
          }}>← Back to Blog</Link>
        </div>
      </div>

      {/* Main Body */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "30px"
      }}>
        {/* Editor Form */}
        <form onSubmit={handleSave} style={{
          border: "1px solid #222",
          padding: "20px",
          backgroundColor: "#0a0a0a"
        }}>
          <h3 style={{ margin: "0 0 20px 0", borderBottom: "1px solid #222", paddingBottom: "10px" }}>
            {selectedPost ? `EDITING: ${selectedPost.slug.current}` : "COMPOSE NEW POST"}
          </h3>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#888", fontSize: "12px" }}>TITLE</label>
            <input
              type="text"
              placeholder="Enter post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
                backgroundColor: "#111",
                border: "1px solid #333",
                color: "#fff",
                fontSize: "15px",
                fontFamily: "monospace"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#888", fontSize: "12px" }}>CATEGORIES (COMMA-SEPARATED)</label>
            <input
              type="text"
              placeholder="e.g. Design, Strategy, Cinema..."
              value={categoryString}
              onChange={(e) => setCategoryString(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
                backgroundColor: "#111",
                border: "1px solid #333",
                color: "#fff",
                fontSize: "15px",
                fontFamily: "monospace"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#888", fontSize: "12px" }}>BODY CONTENT (MARKDOWN)</label>
            <textarea
              placeholder="Type markdown content here..."
              value={markdownBody}
              onChange={(e) => setMarkdownBody(e.target.value)}
              rows={15}
              style={{
                width: "100%",
                padding: "12px",
                boxSizing: "border-box",
                backgroundColor: "#111",
                border: "1px solid #333",
                color: "#fff",
                fontSize: "14px",
                lineHeight: "1.6",
                fontFamily: "monospace",
                resize: "vertical"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="isArchived"
              checked={isArchived}
              onChange={(e) => setIsArchived(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="isArchived" style={{ color: "#888", fontSize: "13px", cursor: "pointer" }}>
              Save as Draft (Hide from public blog list)
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: "10px 20px",
                backgroundColor: "#e40521",
                color: "#fff",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "monospace"
              }}
            >
              {isSaving ? "SAVING..." : "SAVE POST"}
            </button>

            <button
              type="button"
              onClick={handleInitializeNew}
              style={{
                padding: "10px 20px",
                backgroundColor: "#222",
                color: "#ccc",
                border: "1px solid #333",
                cursor: "pointer",
                fontFamily: "monospace"
              }}
            >
              COMPOSE NEW
            </button>
          </div>
        </form>

        {/* Directory/List of Posts */}
        <div style={{
          border: "1px solid #222",
          padding: "20px",
          backgroundColor: "#0a0a0a"
        }}>
          <h3 style={{ margin: "0 0 20px 0", borderBottom: "1px solid #222", paddingBottom: "10px" }}>
            EDITORIAL ARCHIVES ({posts.length} POSTS)
          </h3>

          {isLoading ? (
            <p style={{ color: "#666" }}>Loading posts from local disk...</p>
          ) : posts.length === 0 ? (
            <p style={{ color: "#666" }}>No posts found. Start composing to add dispatches.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {posts.map((post) => (
                <div
                  key={post._id}
                  style={{
                    border: "1px solid #222",
                    padding: "15px",
                    backgroundColor: "#050505",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px"
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>{post.title}</h4>
                    <div style={{ display: "flex", gap: "15px", fontSize: "11px", color: "#666" }}>
                      <span>SLUG: {post.slug.current}</span>
                      <span>DATE: {new Date(post.publishedAt).toLocaleDateString()}</span>
                      <span style={{
                        color: post.isArchived ? "#ffcc00" : "#00ff66",
                        fontWeight: "bold"
                      }}>
                        {post.isArchived ? "[DRAFT]" : "[PUBLISHED]"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => loadPostIntoForm(post)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#fff",
                        color: "#000",
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontSize: "12px"
                      }}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleToggleArchive(post)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#222",
                        color: "#ccc",
                        border: "1px solid #333",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontSize: "12px"
                      }}
                    >
                      {post.isArchived ? "PUBLISH" : "ARCHIVE"}
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "transparent",
                        color: "#ff3333",
                        border: "1px solid #ff3333",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontSize: "12px"
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div style={{
        marginTop: "30px",
        borderTop: "1px solid #222",
        paddingTop: "15px",
        color: "#555",
        fontSize: "11px",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <span>SYSTEM LOG: {statusMessage}</span>
        <span>MAAEF WRITING SPACE V2.0.0</span>
      </div>

      {/* CSS keyframe animations style tag */}
      <style>{`
        @keyframes slideInUp {
          from { transform: translate(-50%, 100px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>

      {/* Minimal Toaster */}
      {toaster.visible && (
        <div style={{
          position: "fixed",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#fff",
          color: "#000",
          padding: "12px 24px",
          fontFamily: "monospace",
          fontSize: "11px",
          fontWeight: "bold",
          border: "1px solid #333",
          boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#e40521",
            display: "inline-block"
          }} />
          <span>{toaster.message.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
