"use client";

import Image from "next/image";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <div className="noise-overlay" />

      {/* Main container with direct inline style top clearance to override all caching */}
      <main 
        className="relative z-10 text-white min-h-screen select-none overflow-x-hidden"
        style={{ paddingTop: "350px", paddingBottom: "96px" }}
      >
        
        {/* SEO Text Content Container */}
        <section 
          className="relative max-w-[900px] mx-auto flex flex-col gap-20 md:gap-28 z-10"
          style={{ width: "88%", maxWidth: "900px", marginLeft: "auto", marginRight: "auto" }}
        >
          
          {/* Centered Intro Section — Symmetrical, clear of the header, and spacious */}
          <div 
            className="flex flex-col gap-10"
            style={{ 
              display: "flex",
              flexDirection: "column",
              gap: "40px",
              textAlign: "center", 
              maxWidth: "800px", 
              marginLeft: "auto", 
              marginRight: "auto" 
            }}
          >
            {/* Paragraph 1 — Centered Editorial Statement */}
            <p 
              className="text-[clamp(1.15rem,2.8vw,1.9rem)] font-light leading-[1.65] tracking-wide text-white"
              style={{ 
                fontFamily: "var(--font-playfair), serif",
                textAlign: "center", 
                margin: "0 auto", 
                color: "#ffffff",
                lineHeight: "1.65"
              }}
            >
              Maaef Media House is a creative agency based in Lucknow, India. We build brands, produce content, and design experiences that make people stop scrolling and actually pay attention. We call it engineering attention — and it is the only thing we care about getting right.
            </p>
            
            {/* Paragraph 2 — Centered Secondary Narrative */}
            <p 
              className="text-neutral-400 text-sm sm:text-base md:text-lg font-light leading-[1.6]"
              style={{ 
                textAlign: "center", 
                margin: "0 auto", 
                maxWidth: "700px",
                lineHeight: "1.6"
              }}
            >
              Founded in Lucknow, we work with startups, SMEs, and growing brands who want their communications to actually work. Not just look good — work. That means a brand film that drives enquiries. A social media presence that builds trust. A website that converts. A visual identity that people remember the next day.
            </p>
          </div>

          {/* Capabilities List — Strictly aligned grid columns to ensure vertical start parity */}
          <div className="flex flex-col gap-10 border-t border-white/[0.08] pt-20">
            <h2 className="serif text-xl md:text-2xl uppercase tracking-wider text-[#7a0e0e]">
              What we do:
            </h2>
            <div className="flex flex-col list-none p-0">
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 py-6 border-b border-white/[0.04] transition-colors hover:border-[#7a0e0e]/40">
                <div className="serif text-lg md:text-xl text-white tracking-wide w-full md:w-[40%] flex-shrink-0 mb-1 md:mb-0">
                  - Video Production:
                </div>
                <div className="text-neutral-400 text-sm md:text-base font-light leading-relaxed w-full md:w-[60%] text-left">
                  Brand films, reels, product videos, documentaries, event coverage
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 py-6 border-b border-white/[0.04] transition-colors hover:border-[#7a0e0e]/40">
                <div className="serif text-lg md:text-xl text-white tracking-wide w-full md:w-[40%] flex-shrink-0 mb-1 md:mb-0">
                  - Brand Strategy:
                </div>
                <div className="text-neutral-400 text-sm md:text-base font-light leading-relaxed w-full md:w-[60%] text-left">
                  Positioning, messaging, visual identity, brand guidelines
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 py-6 border-b border-white/[0.04] transition-colors hover:border-[#7a0e0e]/40">
                <div className="serif text-lg md:text-xl text-white tracking-wide w-full md:w-[40%] flex-shrink-0 mb-1 md:mb-0">
                  - Graphic Design:
                </div>
                <div className="text-neutral-400 text-sm md:text-base font-light leading-relaxed w-full md:w-[60%] text-left">
                  Logos, marketing collateral, packaging, presentations
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 py-6 border-b border-white/[0.04] transition-colors hover:border-[#7a0e0e]/40">
                <div className="serif text-lg md:text-xl text-white tracking-wide w-full md:w-[40%] flex-shrink-0 mb-1 md:mb-0">
                  - Photography:
                </div>
                <div className="text-neutral-400 text-sm md:text-base font-light leading-relaxed w-full md:w-[60%] text-left">
                  Product, lifestyle, corporate, and editorial photography
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 py-6 border-b border-white/[0.04] transition-colors hover:border-[#7a0e0e]/40">
                <div className="serif text-lg md:text-xl text-white tracking-wide w-full md:w-[40%] flex-shrink-0 mb-1 md:mb-0">
                  - Web Design:
                </div>
                <div className="text-neutral-400 text-sm md:text-base font-light leading-relaxed w-full md:w-[60%] text-left">
                  Clean, functional websites built to represent your brand properly
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 py-6 border-b border-white/[0.04] transition-colors hover:border-[#7a0e0e]/40">
                <div className="serif text-lg md:text-xl text-white tracking-wide w-full md:w-[40%] flex-shrink-0 mb-1 md:mb-0">
                  - Social Media Content:
                </div>
                <div className="text-neutral-400 text-sm md:text-base font-light leading-relaxed w-full md:w-[60%] text-left">
                  Ongoing content creation, direction, and production for digital platforms
                </div>
              </div>
            </div>
          </div>

          {/* Paragraph 3 — Manifesto Block */}
          <div className="border-t border-white/[0.08] pt-20">
            <p className="text-neutral-300 text-lg md:text-xl font-light leading-relaxed max-w-[750px]">
              We are a small, committed team. We do not outsource strategy. We do not hand off creative direction. We sit with the brief, figure out what needs to be said, and then say it as powerfully as we can — in video, image, or design.
            </p>
          </div>

          {/* Paragraph 4 — Geography Highlight */}
          <div className="pt-4">
            <p 
              className="text-[#7a0e0e] text-xs md:text-sm font-bold uppercase tracking-[0.25em] font-mono leading-relaxed max-w-[750px]"
              style={{ color: "#7a0e0e" }}
            >
              Based in Lucknow, Uttar Pradesh, India. Working with clients across India and internationally.
            </p>
          </div>

          {/* Paragraph 5 — Ecosystem footer */}
          <div className="border-t border-white/[0.08] pt-20 pb-16">
            <p className="text-neutral-500 text-xs md:text-sm font-light leading-relaxed max-w-[750px]">
              Maaef Media House is part of the Maaef group of businesses, which includes Maaef Studios (print production), Maaef Afterhours (community events), and Maaef Enterprises Private Limited (government supply and tenders).
            </p>
          </div>

        </section>

        {/* FOOTER */}
        <Footer />
      </main>
    </>
  );
}
