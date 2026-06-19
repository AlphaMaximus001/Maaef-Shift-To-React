"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import FluidSimulation from "@/components/FluidSimulation";
import Footer from "@/components/Footer";

// Complete services dataset
const SERVICES_DATA = [
  {
    title: "Video",
    eyebrow: "Motion & Film",
    desc: "We create cinematic content that moves people — literally and emotionally. From brand films to social reels, every frame is crafted to communicate something true.",
    bgColor: "radial-gradient(ellipse, #c0251a 0%, #6b0d08 50%, transparent 75%)",
    imgSrc: "/images/f1-car-1.webp",
    services: [
      { name: "Brand Films", desc: "Long-form cinematic narratives that define how the world sees you." },
      { name: "Social Content", desc: "Scroll-stopping reels and shorts optimised for every platform." },
      { name: "Documentary", desc: "Real stories told with craft, restraint, and honesty." },
      { name: "Event Coverage", desc: "Capturing moments that deserve to be remembered." },
      { name: "Motion Graphics", desc: "Typography, data, and brand elements brought to life." },
    ],
  },
  {
    title: "Web",
    eyebrow: "Digital Presence",
    desc: "Digital experiences that feel inevitable — like they could never have been built any other way. We design and develop with equal obsession.",
    bgColor: "radial-gradient(ellipse, #c0251a 0%, #6b0d08 50%, transparent 75%)",
    imgSrc: "/images/f1-car-2.webp",
    services: [
      { name: "UI/UX Design", desc: "Interfaces rooted in behaviour and refined by intuition." },
      { name: "Development", desc: "Clean, performant code that lives up to the design." },
      { name: "Webflow / CMS", desc: "Powerful sites your team can actually manage." },
      { name: "E-Commerce", desc: "Stores built to convert without losing the brand." },
      { name: "Maintenance", desc: "Ongoing care so your site stays fast and current." },
    ],
  },
  {
    title: "Design",
    eyebrow: "Visual Identity",
    desc: "Identity systems that hold together across every touchpoint. We think in systems, not just symbols — because a logo is only as strong as what surrounds it.",
    bgColor: "radial-gradient(ellipse, #c0251a 0%, #6b0d08 50%, transparent 75%)",
    imgSrc: "/images/f1-car-3.webp",
    services: [
      { name: "Brand Identity", desc: "Logo, colour, type — the full visual language." },
      { name: "Print & Packaging", desc: "Tangible brand expressions that stand out on shelf." },
      { name: "Social Templates", desc: "Cohesive, editable systems for your team." },
      { name: "Presentations", desc: "Pitch decks and reports that actually get read." },
      { name: "Environmental", desc: "Wayfinding, signage, and space branding." },
    ],
  },
  {
    title: "Photo",
    eyebrow: "Stills & Stories",
    desc: "Photography that earns its place — no filler, no stock. Every shoot is a considered visual argument for why your brand deserves attention.",
    bgColor: "radial-gradient(ellipse, #c0251a 0%, #6b0d08 50%, transparent 75%)",
    imgSrc: "/images/f1-car-4.webp",
    services: [
      { name: "Product Photography", desc: "Clean, contextual images that drive purchase decisions." },
      { name: "Portrait & Team", desc: "Faces that humanise the brand, shot with respect." },
      { name: "Editorial", desc: "Magazine-quality stories for campaigns and press." },
      { name: "Architecture", desc: "Spaces photographed with patience and precision." },
      { name: "Events", desc: "Candid and directed coverage that captures the energy." },
    ],
  },
  {
    title: "Brand",
    eyebrow: "Strategy & Voice",
    desc: "Before any pixel is placed, the thinking has to be right. We help brands find — or reclaim — a clear, honest, and distinctive position in the world.",
    bgColor: "radial-gradient(ellipse, #c0251a 0%, #6b0d08 50%, transparent 75%)",
    imgSrc: "/images/f1-car-5.webp",
    services: [
      { name: "Brand Strategy", desc: "Positioning, purpose, and audience mapped with clarity." },
      { name: "Naming", desc: "Words that stick, travel, and own their space." },
      { name: "Tone of Voice", desc: "A writing style as recognisable as your logo." },
      { name: "Campaign Concepting", desc: "Big ideas that unify every medium and moment." },
      { name: "Brand Audits", desc: "Honest assessment of what is and is not working." },
    ],
  },
];

export default function ServicesPage() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [inViewTiles, setInViewTiles] = useState<boolean[]>([false, false, false, false, false]);

  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Detect mobile width on resize/mount
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // IntersectionObserver for mobile scroll reveals
  useEffect(() => {
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setInViewTiles(prev => {
              const next = [...prev];
              next[index] = true;
              return next;
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
    );

    tileRefs.current.forEach(tile => {
      if (tile) observer.observe(tile);
    });

    return () => observer.disconnect();
  }, [isMobile]);

  // Keyboard Escape listener to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && panelOpen) {
        closePanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panelOpen]);

  const openPanel = (idx: number) => {
    if (panelOpen) return;
    setSelectedIdx(idx);
    
    // Hide standard navbar, navigation links, and audio toggles
    const mainNav = document.getElementById("main-nav");
    if (mainNav) {
      mainNav.style.opacity = "0";
      mainNav.style.pointerEvents = "none";
      mainNav.style.visibility = "hidden";
    }
    const absoluteNav = document.getElementById("absolute-nav");
    if (absoluteNav) {
      absoluteNav.style.opacity = "0";
      absoluteNav.style.pointerEvents = "none";
      absoluteNav.style.visibility = "hidden";
    }

    setTimeout(() => {
      setPanelOpen(true);
    }, 200);
  };

  const closePanel = () => {
    setPanelOpen(false);
    
    // Restore standard navbar and toggles
    const mainNav = document.getElementById("main-nav");
    if (mainNav) {
      mainNav.style.opacity = "1";
      mainNav.style.pointerEvents = "";
      mainNav.style.visibility = "";
    }
    const absoluteNav = document.getElementById("absolute-nav");
    if (absoluteNav) {
      absoluteNav.style.opacity = "1";
      absoluteNav.style.pointerEvents = "";
      absoluteNav.style.visibility = "";
    }

    setTimeout(() => {
      setSelectedIdx(null);
    }, 600);
  };

  const activeService = selectedIdx !== null ? SERVICES_DATA[selectedIdx] : null;

  return (
    <>
      <div className="noise-overlay" />

      <main id="services-page-wrapper" className="relative w-full min-h-screen overflow-x-hidden bg-black select-none">
        
        {/* TILES AND PANEL PORT */}
        <section
          id="services-section"
          className={`relative bg-transparent transition-all duration-300 w-full overflow-hidden ${
            isMobile ? "h-auto" : "h-screen"
          }`}
        >
          {/* WebGL fluid animation running globally in background */}
          <FluidSimulation />

          {/* TILES GRID */}
          <div
            id="tiles"
            className={`absolute inset-0 flex transition-opacity duration-300 z-10 ${
              isMobile ? "relative flex-col h-auto pt-24" : "h-full w-full"
            }`}
          >
            {SERVICES_DATA.map((tile, i) => {
              // Calculate custom translation transforms when a panel is open
              let transformStyle = "";
              let opacityStyle = 1;

              if (selectedIdx !== null) {
                if (selectedIdx === i) {
                  transformStyle = isMobile ? "scaleY(0)" : "scaleX(0)";
                  opacityStyle = 0;
                } else {
                  const dir = i < selectedIdx ? -1 : 1;
                  transformStyle = isMobile
                    ? `translateY(${dir * 120}%)`
                    : `translateX(${dir * 120}%)`;
                  opacityStyle = 0;
                }
              }

              return (
                <div
                  key={i}
                  ref={el => { tileRefs.current[i] = el; }}
                  onClick={() => openPanel(i)}
                  className={`tile hover-trigger ${
                    isMobile && inViewTiles[i] ? "in-view" : ""
                  }`}
                  data-index={i}
                  style={{
                    transform: transformStyle,
                    opacity: opacityStyle,
                    transition:
                      selectedIdx !== null
                        ? "transform 0.7s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.5s ease"
                        : "transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s 0.1s ease",
                  }}
                >
                  <div className="tile-bg" />
                  
                  {/* F1 Car Image backdrop */}
                  <Image
                    src={tile.imgSrc}
                    alt={tile.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 20vw"
                    priority={i < 2}
                    className="object-cover grayscale blur-[4px] opacity-40 mix-blend-screen pointer-events-none"
                  />

                  <div className="tile-frost" />
                  
                  <div className="tile-content">
                    <span className="tile-label">{tile.title}</span>
                    <span className="tile-tagline">{tile.eyebrow}</span>
                  </div>
                  <span className="tile-number">0{i + 1}</span>
                </div>
              );
            })}
          </div>

          {/* SLIDEOUT DETAILED PANEL */}
          {activeService && (
            <>
              {/* Backglow Image panel */}
              <Image
                src={activeService.imgSrc}
                alt="Selected services background"
                fill
                className={`object-cover grayscale mix-blend-screen pointer-events-none z-10 transition-opacity duration-500`}
                style={{
                  opacity: panelOpen ? 0.4 : 0,
                }}
              />

              <div id="panel" className={`open z-[80]`}>
                <div
                  id="panelBg"
                  className="panel-bg"
                  style={{
                    background: activeService.bgColor,
                    display: "block",
                    opacity: panelOpen ? 0.95 : 0,
                  }}
                />

                {/* Left Title Column */}
                <div
                  className="panel-title-col"
                  style={{
                    opacity: panelOpen ? 1 : 0,
                    transition: "opacity 0.5s 0.15s ease",
                  }}
                >
                  <span className="panel-title">{activeService.title}</span>
                </div>

                {/* Close Trigger */}
                <button
                  onClick={closePanel}
                  aria-label="Close panel"
                  className="panel-close hover-trigger"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Right Checklist Column */}
                <div className="panel-inner">
                  <div
                    className="panel-eyebrow"
                    style={{
                      opacity: panelOpen ? 1 : 0,
                      transform: panelOpen ? "translateY(0)" : "translateY(14px)",
                      transition: "opacity 0.5s 0.2s ease, transform 0.5s 0.2s ease",
                    }}
                  >
                    {activeService.eyebrow}
                  </div>
                  <div
                    className="panel-divider"
                    style={{
                      width: panelOpen ? "48px" : "0px",
                      transition: "width 0.7s 0.35s cubic-bezier(0.77, 0, 0.18, 1)",
                    }}
                  />
                  <p
                    className="panel-desc"
                    style={{
                      opacity: panelOpen ? 1 : 0,
                      transform: panelOpen ? "translateY(0)" : "translateY(16px)",
                      transition: "opacity 0.55s 0.3s ease, transform 0.55s 0.3s ease",
                    }}
                  >
                    {activeService.desc}
                  </p>

                  <div className="services-grid">
                    {activeService.services.map((s, idx) => (
                      <div
                        key={idx}
                        className="service-item hover-trigger"
                        style={{
                          opacity: panelOpen ? 1 : 0,
                          transform: panelOpen ? "translateY(0)" : "translateY(16px)",
                          transition: `opacity 0.45s ease, transform 0.45s ease, background 0.25s ease, padding 0.25s ease`,
                          transitionDelay: panelOpen ? `${0.35 + idx * 0.07}s` : "0s",
                        }}
                      >
                        <span className="service-num">0{idx + 1}</span>
                        <div className="service-text">
                          <h3>{s.name}</h3>
                          <p>{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Global Footer (shown after sliders snap boundaries on desktop or scrolling on mobile) */}
        {selectedIdx === null && (
          <div className="relative z-20">
            <Footer />
          </div>
        )}
      </main>
    </>
  );
}
