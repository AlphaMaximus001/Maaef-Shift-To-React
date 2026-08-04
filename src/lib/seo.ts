import type { Metadata } from "next";

export const SITE_URL = "https://www.maaef.com";
export const SITE_NAME = "Maaef Group";
export const SITE_DESCRIPTION =
  "Maaef Group is a Lucknow-based sovereign collective — an integrated business group operating across 4 arms: Maaef Media House (Growth & Marketing), Maaef Studios (Print & Visual Production), Maaef Afterhours (Community), and Maaef Enterprises Pvt Ltd (Government Procurement).";
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
    : `${SITE_NAME} | Attention, Precision, Trust, Time`;

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
 * Builds the parent Organization JSON-LD schema for Maaef Group and its 4 operational arms.
 */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Maaef Group",
    legalName: "Maaef Group",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: `${SITE_URL}/images/logo.png`,
      caption: "Maaef Group Logo",
    },
    foundingDate: "2024",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    description: SITE_DESCRIPTION,
    values: "Attention, Precision, Trust, Time",
    subOrganization: [
      {
        "@type": "Organization",
        name: "Maaef Media House",
        description: "Creative growth, performance marketing, short-form video production, cold email infrastructure, and LLMO (Large Language Model Optimisation).",
      },
      {
        "@type": "Organization",
        name: "Maaef Studios",
        description: "Premium print production, brand films, lookbooks, 3D/AR product visualization tools, and print pricing tools.",
      },
      {
        "@type": "Organization",
        name: "Maaef Afterhours",
        description: "Curated in-person networking events and community building for founders and professionals.",
      },
      {
        "@type": "Organization",
        name: "Maaef Enterprises Pvt Ltd",
        description: "Government procurement via GeM portal, specializing in print materials and irrigation supplies.",
      },
    ],
    sameAs: [
      "https://www.instagram.com/maaef.media?igsh=MXJ2cnRwY3ZmdjlsZA==",
      "https://www.linkedin.com/showcase/maaef-media/",
      "https://x.com/maaefltd?s=11",
      "https://youtube.com/@maaef.mediahouse?si=1bWkSQZ68FeaCGCc",
    ],
  };
}

/**
 * Builds an Article JSON-LD schema object for blog posts.
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

/**
 * Builds a LocalBusiness JSON-LD schema for GEO (Generative Engine Optimization)
 * and Google Local Search optimization.
 */
export function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: DEFAULT_OG_IMAGE,
    description: SITE_DESCRIPTION,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "26.8467",
      longitude: "80.9462",
    },
    knowsAbout: [
      "Performance Marketing",
      "Paid Social Campaigns",
      "Short-form Video Production",
      "LLMO (Large Language Model Optimisation)",
      "Vernacular Content Creation",
      "Print Production & Design",
      "Brand Films",
      "3D/AR Product Visualization",
      "Founders Community & Networking",
      "Government Procurement (GeM Portal)",
    ],
    sameAs: [
      "https://www.instagram.com/maaef.media?igsh=MXJ2cnRwY3ZmdjlsZA==",
      "https://www.linkedin.com/showcase/maaef-media/",
      "https://x.com/maaefltd?s=11",
      "https://youtube.com/@maaef.mediahouse?si=1bWkSQZ68FeaCGCc",
    ],
  };
}

/**
 * Builds FAQPage JSON-LD schema for direct answer snippet capture in Google & AI Search (SearchGPT, Perplexity).
 */
export function buildFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
