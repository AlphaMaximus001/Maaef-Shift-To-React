import type { Metadata } from "next";

export const SITE_URL = "https://www.maaef.com";
export const SITE_NAME = "Maaef Media House";
export const SITE_DESCRIPTION =
  "Maaef Media House — a new-era creative collective engineering attention through video, design, photography, web, and brand strategy. Based in Lucknow, India.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`;
export const TWITTER_HANDLE = "@maaefltd";

/**
 * Builds a full Next.js Metadata object by merging page-specific overrides
 * with site-wide defaults. Covers title, description, canonical URL,
 * Open Graph, Twitter Card, and robots directives.
 */
export function buildMetadata(overrides: {
  title?: string;
  description?: string;
  /** Absolute path segment e.g. "/about" or "/blog/my-post" */
  path?: string;
  ogImage?: string;
  /** Set true for pages that should not be indexed (e.g. /api routes) */
  noIndex?: boolean;
  /** Extra fields to merge directly into the Metadata object */
  extra?: Partial<Metadata>;
}): Metadata {
  const {
    title,
    description = SITE_DESCRIPTION,
    path = "",
    ogImage = DEFAULT_OG_IMAGE,
    noIndex = false,
    extra = {},
  } = overrides;

  const pageTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Engineering Attention`;

  const canonicalUrl = `${SITE_URL}${path}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: [ogImage],
    },
    ...extra,
  };
}

/**
 * Builds an Article JSON-LD schema object for blog posts.
 * Inject this with:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(...)) }} />
 */
export function buildArticleJsonLd(post: {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  author?: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author || "Maaef Editorial",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    ...(post.imageUrl
      ? {
          image: {
            "@type": "ImageObject",
            url: post.imageUrl,
          },
        }
      : {}),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Dispatches",
          item: `${SITE_URL}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: `${SITE_URL}/blog/${post.slug}`,
        },
      ],
    },
  };
}

/**
 * Builds a WebPage JSON-LD schema for static pages.
 */
export function buildWebPageJsonLd(page: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${page.path}#webpage`,
    url: `${SITE_URL}${page.path}`,
    name: page.name,
    description: page.description,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
