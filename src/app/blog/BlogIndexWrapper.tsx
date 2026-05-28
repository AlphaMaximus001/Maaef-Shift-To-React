"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlogIndex } from "@/blog";
import "@/blog/blog.css";

import Footer from "@/components/Footer";

interface BlogIndexWrapperProps {
  posts: any[];
  categories: string[];
}

export default function BlogIndexWrapper({ posts, categories }: BlogIndexWrapperProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__MAAEF_POSTS__ = posts;
    }
  }, [posts]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative select-none">
      
      {/* Noise Overlay for elegant editorial look */}
      <div className="noise-overlay pointer-events-none" />

      {/* Render the user's gorgeous packaged BlogIndex */}
      <BlogIndex
        posts={posts}
        categories={categories}
        LinkComponent={({ href, to, children, ...props }: any) => {
          const target = href || to;
          if (!target) {
            return <a {...props}>{children}</a>;
          }
          return (
            <Link href={target} {...props}>
              {children}
            </Link>
          );
        }}
        onSelectPost={(slug: string) => {
          router.push(`/blog/${slug}`);
        }}
      />
      
      {/* Global persistent Footer */}
      <Footer />
      
    </div>
  );
}
