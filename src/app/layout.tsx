import type { Metadata } from "next";
import { buildMetadata, buildOrganizationJsonLd, buildLocalBusinessJsonLd } from "@/lib/seo";
import { Inter, Playfair_Display } from "next/font/google";
import Image from "next/image";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AudioToggle from "@/components/AudioToggle";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  ...buildMetadata({ path: "/" }),
  icons: {
    icon: "/favicon.png",
  },
  verification: {
    google: [
      "jga1FV1840zurRbgUvSSgr5udPO0Kmciu9sak28uIe0",
      "JyqmwrfKTATksuzReAITsAbfQeyX2VsvA3rXKjDI6Qg",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <head>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T787MQ3X0V"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T787MQ3X0V');
          `}
        </Script>
        {/* Structured Data / JSON-LD for Search Engines & LLM Crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessJsonLd()) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col relative antialiased select-none bg-[#050505] text-white"
        suppressHydrationWarning={true}
      >
        {/* Universal grain noise overlay */}
        <div className="noise-overlay" />

        {/* Global Centered Watermark Backdrop — Fixed on all pages without scroll jitter */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <Image
            src="/images/logo.png"
            alt="Maaef Logo Watermark"
            width={600}
            height={200}
            className="w-[55%] sm:w-[45%] md:w-[32%] max-w-[360px] h-auto object-contain opacity-[0.015] select-none filter brightness-0 invert"
            priority
          />
        </div>

        {/* Global Navigation Hamburger and Kinetic draw menu */}
        <Navigation />

        {/* Dynamic page content wrapper */}
        <main className="flex-grow z-10">{children}</main>

        {/* Global persistent sound toggle */}
        <AudioToggle />

        {/* Vercel Speed Insights */}
        <SpeedInsights />
      </body>
    </html>
  );
}
