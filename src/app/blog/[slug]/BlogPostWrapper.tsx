"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/blog";
import "@/blog/blog.css";

import Footer from "@/components/Footer";

interface BlogPostWrapperProps {
  post: any;
  allPosts: any[];
  slug: string;
}

export default function BlogPostWrapper({ post, allPosts, slug }: BlogPostWrapperProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__MAAEF_POSTS__ = allPosts;
    }
  }, [allPosts]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative select-none">
      
      {/* Noise Overlay for elegant editorial look */}
      <div className="noise-overlay pointer-events-none" />

      {/* Render the user's gorgeous packaged BlogPost */}
      <BlogPost
        slug={slug}
        post={post}
        postLookup={undefined}
        onShare={undefined}
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
        onSelectPost={(nextSlug: string) => {
          router.push(`/blog/${nextSlug}`);
        }}
      />
      
      {/* Global persistent Footer */}
      <Footer />
      
    </div>
  );
}
