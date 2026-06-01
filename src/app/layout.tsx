import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AudioToggle from "@/components/AudioToggle";

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
  title: "Maaef Media House | Engineering Attention",
  description:
    "Maaef Media House — a new-era creative collective engineering attention through video, design, photography, web, and brand strategy. Based in Lucknow, India.",
  icons: {
    icon: "/images/logo.png",
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
      </body>
    </html>
  );
}
