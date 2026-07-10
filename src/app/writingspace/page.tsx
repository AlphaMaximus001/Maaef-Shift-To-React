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
  subheading?: string;
  mainImage?: {
    url: string;
    alt?: string;
  };
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
  const [subheading, setSubheading] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("System Ready");

  const [vercelData, setVercelData] = useState<{
    filename: string;
    fileContent: string;
    slug: string;
    action: "create" | "edit" | "archive" | "publish" | "delete";
  } | null>(null);
  const [showVercelModal, setShowVercelModal] = useState(false);
  const [showVercelSuccessModal, setShowVercelSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");

  const [toaster, setToaster] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });

  const showToast = (message: string) => {
    setToaster({ message, visible: true });
  };

  const downloadMarkdownFile = () => {
    if (!vercelData || !vercelData.fileContent) return;
    const blob = new Blob([vercelData.fileContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", vercelData.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded Markdown File");
  };

  const copyFileContent = () => {
    if (!vercelData || !vercelData.fileContent) return;
    navigator.clipboard.writeText(vercelData.fileContent);
    showToast("Copied to Clipboard");
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
    setSubheading("");
    setImageUrl("");
    setPreviewUrl("");
    setImageAlt("");
    setStatusMessage("Composing new post.");
    showToast("Form Cleared");
  };

  const loadPostIntoForm = (post: Post) => {
    setSelectedPost(post);
    setTitle(post.title);
    setMarkdownBody(post.markdownBody || "");
    setCategoryString(post.categories?.map((c) => c.title).join(", ") || "");
    setIsArchived(post.isArchived || false);
    setSubheading(post.subheading || "");
    setImageUrl(post.mainImage?.url || "");
    setPreviewUrl(post.mainImage?.url || "");
    setImageAlt(post.mainImage?.alt || "");
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
      subheading: subheading.trim(),
      mainImage: imageUrl.trim() ? { url: imageUrl.trim(), alt: imageAlt.trim() } : null,
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
        const data = await res.json();
        if (data.isVercel) {
          if (data.committed) {
            setSuccessModalMessage(`Your dispatch "${title.trim()}" has been successfully committed to your GitHub repository. Vercel is now rebuilding the site. The changes will appear live in approximately 1 to 2 minutes.`);
            setShowVercelSuccessModal(true);
            setStatusMessage("Saved directly to GitHub repo. Redeployment triggered in background (changes will appear in 1-2 mins).");
            showToast("Committed to Git");
            handleInitializeNew();
          } else {
            setVercelData({
              filename: data.filename,
              fileContent: data.fileContent,
              slug: data.slug,
              action: selectedPost ? "edit" : "create"
            });
            setShowVercelModal(true);
            setStatusMessage("Vercel Serverless Mode: Post content compiled.");
            showToast("Post Compiled Successfully");
          }
        } else {
          setStatusMessage("Post saved successfully.");
          showToast("Post Saved Successfully");
          handleInitializeNew();
          await fetchPosts();
        }
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
        const data = await res.json();
        if (data.isVercel) {
          if (data.committed) {
            setSuccessModalMessage(`The dispatch "${post.title}" has been successfully deleted from your GitHub repository. Vercel is now rebuilding the site. The post will be removed from your live website list in approximately 1 to 2 minutes.`);
            setShowVercelSuccessModal(true);
            setStatusMessage("Deleted from GitHub repo. Redeployment triggered in background (changes will appear in 1-2 mins).");
            showToast("Deleted from Git");
            if (selectedPost?.slug.current === post.slug.current) {
              handleInitializeNew();
            }
          } else {
            setVercelData({
              filename: `${post.slug.current}.md`,
              fileContent: "",
              slug: post.slug.current,
              action: "delete"
            });
            setShowVercelModal(true);
            setStatusMessage("Vercel Serverless Mode: Deletion instructions displayed.");
            showToast("Deletion Blocked");
          }
        } else {
          setStatusMessage("Post deleted successfully.");
          showToast("Post Deleted Successfully");
          if (selectedPost?.slug.current === post.slug.current) {
            handleInitializeNew();
          }
          await fetchPosts();
        }
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
        const data = await res.json();
        if (data.isVercel) {
          if (data.committed) {
            const actionStr = updatedPost.isArchived ? "Archived (Draft)" : "Published (Live)";
            setSuccessModalMessage(`The status of "${post.title}" has been successfully updated to ${actionStr} in GitHub. Vercel is now rebuilding the site. The changes will appear live in approximately 1 to 2 minutes.`);
            setShowVercelSuccessModal(true);
            setStatusMessage(`Status updated in GitHub repo. Redeployment triggered in background (changes will appear in 1-2 mins).`);
            showToast(`Status Committed: ${actionStr}`);
          } else {
            setVercelData({
              filename: data.filename,
              fileContent: data.fileContent,
              slug: data.slug,
              action: updatedPost.isArchived ? "archive" : "publish"
            });
            setShowVercelModal(true);
            setStatusMessage("Vercel Serverless Mode: Post content compiled.");
            showToast("Status Update Compiled");
          }
        } else {
          setStatusMessage(`Post successfully ${updatedPost.isArchived ? "archived" : "published"}.`);
          showToast(updatedPost.isArchived ? "Post Archived (Draft)" : "Post Published (Live)");
          await fetchPosts();
        }
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
              backgroundColor: "#7a0e0e",
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
            <label style={{ display: "block", marginBottom: "5px", color: "#888", fontSize: "12px" }}>SUBHEADING</label>
            <textarea
              placeholder="Enter dedicated subheading..."
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
                backgroundColor: "#111",
                border: "1px solid #333",
                color: "#fff",
                fontSize: "14px",
                lineHeight: "1.4",
                fontFamily: "monospace",
                resize: "vertical"
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

          <div style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", color: "#888", fontSize: "12px" }}>IMAGE URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg or select file below..."
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  boxSizing: "border-box",
                  backgroundColor: "#111",
                  border: "1px solid #333",
                  color: "#fff",
                  fontSize: "14px",
                  fontFamily: "monospace"
                }}
              />
              <div style={{ marginTop: "8px" }}>
                <input
                  type="file"
                  accept="image/*"
                  id="image-upload"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const localUrl = URL.createObjectURL(file);
                    setPreviewUrl(localUrl);
                    setStatusMessage("Uploading image...");
                    const formData = new FormData();
                    formData.append("file", file);
                    try {
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setImageUrl(data.url);
                        setStatusMessage("Image uploaded successfully.");
                        showToast("Image Uploaded");
                      } else {
                        const errorData = await res.json();
                        setStatusMessage(`Upload failed: ${errorData.error}`);
                        showToast("Upload Failed");
                        setPreviewUrl(imageUrl); // revert to original url on failure
                      }
                    } catch (err) {
                      setStatusMessage("Image upload error.");
                      showToast("Upload Error");
                      setPreviewUrl(imageUrl); // revert to original url on failure
                    }
                  }}
                />
                <label
                  htmlFor="image-upload"
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    backgroundColor: "#222",
                    color: "#ccc",
                    border: "1px solid #333",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}
                >
                  UPLOAD IMAGE FILE
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", color: "#888", fontSize: "12px" }}>IMAGE ALT / CAPTION</label>
              <input
                type="text"
                placeholder="Description of the image..."
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  boxSizing: "border-box",
                  backgroundColor: "#111",
                  border: "1px solid #333",
                  color: "#fff",
                  fontSize: "14px",
                  fontFamily: "monospace"
                }}
              />
              {previewUrl && (
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={previewUrl}
                    alt={imageAlt || "Preview"}
                    style={{
                      height: "40px",
                      width: "60px",
                      objectFit: "cover",
                      border: "1px solid #333"
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#666" }}>Preview</span>
                </div>
              )}
            </div>
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
                backgroundColor: "#7a0e0e",
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

      {/* Vercel Serverless Assistant Modal */}
      {showVercelModal && vercelData && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#0d0d0d",
            border: "2px solid #7a0e0e",
            maxWidth: "680px",
            width: "100%",
            padding: "30px",
            boxSizing: "border-box",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9)",
            fontFamily: "monospace",
            color: "#f4f1ee"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #333",
              paddingBottom: "15px",
              marginBottom: "20px"
            }}>
              <h3 style={{ margin: 0, color: "#7a0e0e", fontSize: "16px", letterSpacing: "1px" }}>
                ▲ VERCEL SERVERLESS PIPELINE
              </h3>
              <button
                onClick={() => {
                  setShowVercelModal(false);
                  setVercelData(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  fontSize: "18px",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>

            {vercelData.action === "delete" ? (
              <div>
                <p style={{ margin: "0 0 15px 0", color: "#7a0e0e", fontWeight: "bold" }}>
                  ALERT: DIRECT DISK DELETIONS BLOCKED IN PRODUCTION
                </p>
                <p style={{ margin: "0 0 15px 0", color: "#ccc", fontSize: "13px", lineHeight: "1.6" }}>
                  Vercel operates in a read-only serverless hosting environment. Because the files are checked into your GitHub repository, deleting them here won't persist.
                </p>
                <div style={{
                  backgroundColor: "#111",
                  border: "1px solid #333",
                  padding: "15px",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  color: "#aaa",
                  marginBottom: "20px"
                }}>
                  <strong style={{ color: "#fff" }}>To delete this dispatch permanently:</strong>
                  <ol style={{ margin: "10px 0 0 20px", padding: 0 }}>
                    <li>Open your codebase or GitHub repository.</li>
                    <li>Navigate to: <code style={{ color: "#7a0e0e" }}>src/content/posts/{vercelData.filename}</code></li>
                    <li>Delete the file.</li>
                    <li>Commit and push the change to trigger a redeploy on Vercel.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ margin: "0 0 15px 0", color: "#00ff66", fontWeight: "bold" }}>
                  DISPATCH COMPILED SUCCESSFULLY
                </p>
                <p style={{ margin: "0 0 15px 0", color: "#ccc", fontSize: "13px", lineHeight: "1.6" }}>
                  Your post has been successfully generated and formatted. Since Vercel uses a read-only serverless filesystem, you can apply this change to your blog by saving this file directly into your Git repository:
                </p>

                <div style={{ marginBottom: "15px" }}>
                  <span style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "5px" }}>
                    RECOMMENDED TARGET LOCATION:
                  </span>
                  <div style={{
                    backgroundColor: "#111",
                    padding: "8px 12px",
                    border: "1px solid #333",
                    fontSize: "12px",
                    color: "#fff"
                  }}>
                    src/content/posts/{vercelData.filename}
                  </div>
                </div>

                <div style={{ marginBottom: "25px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ fontSize: "11px", color: "#888" }}>COMPILED MARKDOWN CONTENT:</span>
                    <button
                      onClick={copyFileContent}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#00ff66",
                        cursor: "pointer",
                        fontSize: "11px",
                        padding: 0,
                        fontFamily: "monospace",
                        textDecoration: "underline"
                      }}
                    >
                      COPY TO CLIPBOARD
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={vercelData.fileContent}
                    rows={8}
                    style={{
                      width: "100%",
                      backgroundColor: "#111",
                      border: "1px solid #333",
                      color: "#aaa",
                      fontFamily: "monospace",
                      padding: "10px",
                      fontSize: "11px",
                      boxSizing: "border-box",
                      resize: "none"
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              borderTop: "1px solid #333",
              paddingTop: "20px"
            }}>
              {vercelData.action !== "delete" && (
                <>
                  <button
                    onClick={copyFileContent}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#222",
                      color: "#fff",
                      border: "1px solid #333",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    COPY CONTENT
                  </button>
                  <button
                    onClick={downloadMarkdownFile}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#7a0e0e",
                      color: "#fff",
                      border: "none",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    DOWNLOAD .MD
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowVercelModal(false);
                  setVercelData(null);
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "transparent",
                  color: "#888",
                  border: "1px solid #333",
                  fontFamily: "monospace",
                  cursor: "pointer"
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vercel Success Pipeline Modal */}
      {showVercelSuccessModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#0d0d0d",
            border: "2px solid #00ff66", // Green border for success
            maxWidth: "500px",
            width: "100%",
            padding: "25px",
            boxSizing: "border-box",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9)",
            fontFamily: "monospace",
            color: "#f4f1ee"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #333",
              paddingBottom: "12px",
              marginBottom: "15px"
            }}>
              <h3 style={{ margin: 0, color: "#00ff66", fontSize: "15px", letterSpacing: "1px" }}>
                ▲ PIPELINE COMMIT COMPLETE
              </h3>
              <button
                onClick={() => setShowVercelSuccessModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  fontSize: "18px",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ margin: "0 0 20px 0", color: "#ccc", fontSize: "13px", lineHeight: "1.6" }}>
              {successModalMessage}
            </p>

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              borderTop: "1px solid #333",
              paddingTop: "15px"
            }}>
              <button
                onClick={() => setShowVercelSuccessModal(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#00ff66",
                  color: "#000",
                  border: "none",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        </div>
      )}

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
            backgroundColor: "#7a0e0e",
            display: "inline-block"
          }} />
          <span>{toaster.message.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
