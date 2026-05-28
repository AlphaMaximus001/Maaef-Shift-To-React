"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";

interface PostDetail {
  title: string;
  publishedAt: string;
  mainImage?: any;
  author?: {
    name: string;
    image?: any;
  };
  categories?: {
    title: string;
  }[];
  body: any;
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
      }, 20);
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

// Custom serializers to bind PortableText rendering to theme design system
const portableTextComponents = {
  block: {
    h1: ({ children }: any) => (
      <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl mt-12 mb-5 text-white font-bold leading-tight select-text tracking-tight border-b border-white/5 pb-2">
        {children}
      </h2>
    ),
    h2: ({ children }: any) => (
      <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl mt-10 mb-4 text-white font-semibold leading-tight select-text tracking-tight">
        {children}
      </h3>
    ),
    h3: ({ children }: any) => (
      <h4 className="font-serif text-lg sm:text-xl mt-8 mb-4 text-white font-semibold leading-tight select-text tracking-tight">
        {children}
      </h4>
    ),
    normal: ({ children }: any) => (
      <p className="text-[15px] sm:text-[16px] md:text-[17px] text-[#f4f1ee]/85 font-light leading-relaxed mb-6 font-sans select-text tracking-wide">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l border-red pl-6 italic text-[16px] sm:text-[18px] my-8 text-white/90 bg-white/[0.01] py-4 pr-4 select-text font-sans">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-6 text-[#f4f1ee]/85 text-[15px] sm:text-[16px] flex flex-col gap-2 select-text font-sans">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-6 text-[#f4f1ee]/85 text-[15px] sm:text-[16px] flex flex-col gap-2 select-text font-sans">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li className="select-text">{children}</li>,
    number: ({ children }: any) => <li className="select-text">{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-semibold text-white select-text">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic select-text">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-white/[0.04] text-red px-1.5 py-0.5 rounded-sm font-mono text-xs select-text">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith("/") ? "noreferrer noopener" : undefined;
      return (
        <a
          href={value.href}
          rel={rel}
          target={!value.href.startsWith("/") ? "_blank" : undefined}
          className="text-red hover:underline underline-offset-4 decoration-1 decoration-red transition duration-300 font-medium select-text"
        >
          {children}
        </a>
      );
    },
  },
};

export default function BlogPostContent({ post }: { post: PostDetail }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const element = contentRef.current;
      const totalHeight = element.clientHeight - window.innerHeight;
      const windowScroll = window.scrollY - element.offsetTop;
      
      if (totalHeight > 0 && windowScroll > 0) {
        setScrollProgress(Math.min(100, (windowScroll / totalHeight) * 100));
      } else if (windowScroll <= 0) {
        setScrollProgress(0);
      } else {
        setScrollProgress(100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative z-10 select-none">
      {/* Local dropcap style for elegant editorial read */}
      <style dangerouslySetInnerHTML={{__html: `
        .article-body-content > p:first-of-type::first-letter {
          float: left;
          font-family: Panchang, serif;
          font-size: 3.2rem;
          font-weight: 700;
          color: #e40521;
          line-height: 0.82;
          margin-right: 0.6rem;
          margin-top: 0.15rem;
        }
      `}} />

      {/* 1. Thin Glowing Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] bg-red z-[9999] origin-left transition-transform duration-75"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />

      {/* 2. Cinematic cover / Hero Area */}
      <div className="relative w-full h-[50vh] min-h-[350px] sm:min-h-[420px] bg-[#070707] flex items-end border-b border-white/5 overflow-hidden">
        {post.mainImage ? (
          <>
            <img
              src={urlFor(post.mainImage).url()}
              alt={post.mainImage.alt || post.title}
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.7] opacity-60"
            />
            {/* Dark premium gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-[#050505]/60 z-[1]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c0405] via-[#050505] to-[#050505] flex items-center justify-center p-8">
            <div className="absolute inset-0 opacity-[0.015] border border-dashed border-white m-8" />
          </div>
        )}

        {/* Hero title container info */}
        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 pb-12 sm:pb-14 relative z-[3]">
          <div className="max-w-[800px]">
            <div className="font-mono text-[9px] text-red tracking-[0.24em] mb-4 uppercase">
              JOURNAL DISPATCH
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight m-0 leading-tight text-white mb-5">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[9.5px] font-mono text-white/40 uppercase tracking-widest">
              <span>{formattedDate}</span>
              <span className="text-white/15">/</span>
              <span className="text-red">{post.categories?.[0]?.title || "ARTICLE"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Reading Layout Columns */}
      <div ref={contentRef} className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 sm:py-20 relative z-10">
        
        {/* Navigation back and meta row */}
        <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-12 sm:mb-16">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1.5 font-mono text-[9.5px] text-white/40 hover:text-red tracking-[0.16em] uppercase no-underline cursor-pointer transition-colors duration-300"
          >
            ← back to journal
          </Link>

          {/* Inline Action Controls */}
          <button
            onClick={handleCopyLink}
            className="font-mono text-[9px] tracking-[0.16em] uppercase text-white/40 hover:text-white bg-transparent border-none p-0 transition-colors duration-300 cursor-pointer flex items-center gap-1.5"
          >
            {copied ? "copied" : "copy link"}
          </button>
        </div>

        {/* Dual Column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Monospace Sidebar Metadata (Marginalia) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28 h-fit flex flex-col gap-6 font-mono text-[9.5px] tracking-[0.16em] text-white/30 border-b lg:border-b-0 lg:border-r border-white/5 pb-8 lg:pb-0 lg:pr-8">
            <div className="flex flex-col gap-1">
              <span className="text-white/20">DATE</span>
              <span className="text-white/60">{formattedDate}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-white/20">STATION</span>
              <span className="text-white/60">LUCKNOW, IN</span>
            </div>

            {post.author?.name && (
              <div className="flex flex-col gap-1 border-t border-white/5 pt-5 mt-1">
                <span className="text-white/20">CONTRIBUTOR</span>
                <span className="text-white/60">{post.author.name}</span>
              </div>
            )}
          </aside>

          {/* Right Column: Beautiful Rich Article Text */}
          <main className="lg:col-span-8 lg:col-start-5 select-text article-body-content">
            {post.body ? (
              <PortableText value={post.body} components={portableTextComponents} />
            ) : (
              <p className="text-white/50 font-light italic font-sans text-base">This dispatch has no content.</p>
            )}
          </main>

        </div>

      </div>

    </div>
  );
}
