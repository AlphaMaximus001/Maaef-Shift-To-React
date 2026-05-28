"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";

interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  mainImage?: any;
  author?: {
    name: string;
    image?: any;
  };
  categories?: {
    title: string;
    slug?: {
      current: string;
    };
  }[];
  body?: any;
}

// Scramble text animation component for high-tech premium feel
function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalText = text;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  useEffect(() => {
    if (isHovered) {
      let iteration = 0;
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setDisplayText(
          originalText
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              if (index < iteration) {
                return originalText[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );

        if (iteration >= originalText.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        iteration += 1 / 3;
      }, 15);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayText(originalText);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, originalText]);

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{ display: "inline-block" }}
    >
      {displayText}
    </span>
  );
}

// Calculate reading time and excerpt helper
function getArticleStats(body: any[] | undefined) {
  if (!body || !Array.isArray(body)) {
    return { readingTime: 2, excerpt: "" };
  }

  let text = "";
  body.forEach((block) => {
    if (block._type === "block" && block.children && Array.isArray(block.children)) {
      block.children.forEach((child: any) => {
        if (child.text) {
          text += child.text + " ";
        }
      });
    }
  });

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200)); // 200 wpm
  let excerpt = text.trim();
  if (excerpt.length > 140) {
    excerpt = excerpt.substring(0, 137).trim() + "...";
  }

  return { readingTime, excerpt };
}

export default function BlogContent({ initialPosts }: { initialPosts: Post[] }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [filteredPosts, setFilteredPosts] = useState(initialPosts);

  // Extract all categories available in the posts list
  const allCategories = ["ALL"];
  initialPosts.forEach((post) => {
    post.categories?.forEach((cat) => {
      if (cat.title && !allCategories.includes(cat.title.toUpperCase())) {
        allCategories.push(cat.title.toUpperCase());
      }
    });
  });

  useEffect(() => {
    if (activeCategory === "ALL") {
      setFilteredPosts(initialPosts);
    } else {
      setFilteredPosts(
        initialPosts.filter((post) =>
          post.categories?.some((cat) => cat.title.toUpperCase() === activeCategory)
        )
      );
    }
  }, [activeCategory, initialPosts]);

  return (
    <div className="max-w-[1300px] mx-auto relative z-10 px-6 md:px-12 pt-44 pb-32 select-none">
      
      {/* 1. Minimalistic Editorial Header */}
      <div className="relative border-b border-white/10 pb-12 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 z-10">
        <div>
          <div className="font-mono text-[9px] text-red tracking-[0.24em] mb-4 uppercase">
            EDITORIAL JOURNAL
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tighter m-0 leading-none">
            Maaef <span className="text-red">Journal.</span>
          </h1>
          <p className="text-[13px] text-white/40 mt-4 max-w-[420px] leading-relaxed font-sans">
            Editorial records of brand strategy, visual design, independent cinema, and global culture.
          </p>
        </div>

        <div className="font-mono text-[9.5px] tracking-[0.16em] text-white/30 uppercase">
          RECORDS — {String(filteredPosts.length).padStart(2, "0")} / {String(initialPosts.length).padStart(2, "0")}
        </div>
      </div>

      {/* 2. Sleek Minimalist Category Filter Menu */}
      <div className="relative z-10 mb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="font-mono text-[9px] tracking-[0.2em] text-white/30 uppercase">
          FILTER DISPATCHES
        </div>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10.5px] tracking-[0.16em]">
          {allCategories.map((cat, i) => (
            <div key={cat} className="flex items-center">
              {i > 0 && <span className="text-white/10 mr-4">/</span>}
              <button
                onClick={() => setActiveCategory(cat)}
                className={`cursor-pointer transition-colors duration-300 uppercase ${
                  activeCategory === cat
                    ? "text-red font-semibold"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {cat}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Archives Directory Row List (Clean Editorial Style) */}
      <div className="relative z-10 flex flex-col">
        {filteredPosts.length === 0 ? (
          <div className="py-20 border border-white/5 rounded-xs flex flex-col justify-center items-center">
            <span className="font-mono text-[9.5px] text-red tracking-[0.2em] uppercase mb-2">
              [ NO MATCHING DISPATCHES ]
            </span>
            <span className="text-[11px] text-white/35 uppercase tracking-widest text-center leading-relaxed">
              No articles found matching the selected category.
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredPosts.map((post, idx) => {
              const stats = getArticleStats(post.body);
              const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              });
              const serial = String(idx + 1).padStart(2, "0");

              return (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug.current}`}
                  className="group block border-b border-white/10 py-10 sm:py-12 transition-all duration-300 hover:bg-white/[0.01] px-2 cursor-pointer no-underline text-inherit"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Index Serial & Category (Left Column) */}
                    <div className="md:col-span-2 lg:col-span-2 flex items-center gap-4">
                      <span className="font-mono text-xs text-red font-semibold tracking-wider">
                        CH-{serial}
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.16em] text-white/30 uppercase border border-white/10 px-2 py-0.5 rounded-sm">
                        {post.categories?.[0]?.title || "ARTICLE"}
                      </span>
                    </div>

                    {/* Title & Preview Excerpt (Center Column) */}
                    <div className="md:col-span-6 lg:col-span-7 flex flex-col">
                      <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-tighter m-0 leading-none text-white group-hover:text-red transition duration-300">
                        <ScrambleText text={post.title} />
                      </h2>
                      {stats.excerpt && (
                        <p className="text-[13px] text-white/40 font-light mt-3 leading-relaxed max-w-[550px] font-sans">
                          {stats.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Visual Cover Thumbnail (Optional Column - Hidden on Mobile) */}
                    <div className="hidden lg:block lg:col-span-2">
                      {post.mainImage ? (
                        <div className="w-32 h-18 bg-[#0d0d0d] rounded-xs overflow-hidden border border-white/5 relative">
                          <img
                            src={urlFor(post.mainImage).url()}
                            alt={post.mainImage.alt || post.title}
                            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-18 border border-dashed border-white/5 rounded-xs flex items-center justify-center">
                          <span className="font-mono text-[8px] text-white/10 uppercase tracking-widest">TEXT ONLY</span>
                        </div>
                      )}
                    </div>

                    {/* Date & Action Arrow (Right Column) */}
                    <div className="md:col-span-4 lg:col-span-1 flex items-center justify-between md:justify-end gap-6">
                      <div className="flex flex-col items-start md:items-end gap-1 font-mono text-[9px] text-white/30 uppercase tracking-widest">
                        <span className="text-[#f4f1ee]/50">{formattedDate}</span>
                        <span>{stats.readingTime} MIN READ</span>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red group-hover:bg-red transition-all duration-300 flex-shrink-0">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className="text-white group-hover:translate-x-0.5 transition-transform duration-300"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
