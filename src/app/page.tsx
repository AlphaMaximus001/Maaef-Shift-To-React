"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import Footer from "@/components/Footer";

// SECTION METADATA FOR HUD PANEL SLIDES
const MAAEF_SECTIONS = [
  {
    id: "hero",
    ch: "00",
    kicker: "INDEX",
    label: "HERO",
    pre: "WE ENGINEER ATTENTION",
    titleLines: ["Maaef"],
    subtitleLines: ["Media House."],
    body: "We engineer attention. A new-era media house.",
    coords: "26.8467° N · 81.0307° E",
    tags: ["LUCKNOW · IN", "EST. 2024", "TZ +05:30"],
  },
  {
    id: "origin",
    ch: "01",
    kicker: "ORIGIN",
    label: "ORIGIN",
    pre: "WHY WE EXIST",
    titleLines: ["We started because", "our folks were stuck in digital fog"],
    redLine: 1,
    body: "Digital fog is dense. We were the illuminator that they wanted.",
    tags: ["EST. 2024", "INDEPENDENT", "NO INVESTORS"],
    coords: "26.8467° N · 81.0307° E",
  },
  {
    id: "edge",
    ch: "02",
    kicker: "EDGE",
    label: "EDGE",
    pre: "WHO MADE IT",
    titleLines: ["We know how to", "communicate"],
    italicLine: 1,
    body: "Remember that one person who has 10 versions of the same story. We are the person, and the story is yours.",
    tags: ["CLARITY", "TONE", "PERSONA"],
    coords: "26.8467° N · 81.0307° E",
  },
  {
    id: "vision",
    ch: "03",
    kicker: "VISION",
    label: "VISION",
    pre: "HOW WE THINK",
    titleLines: ["Ideas are cool,", "Executions are better", "Results are best"],
    redLine: 2,
    body: "You're churning every second to win the lap, and we are the pit crew you'd wish for.",
    tags: ["CRAFT", "DISCIPLINE", "OUTCOMES"],
    coords: "26.8467° N · 81.0307° E",
  },
  {
    id: "network",
    ch: "04",
    kicker: "NETWORK",
    label: "NETWORK",
    pre: "WHERE WE WORK",
    titleLines: ["Viability, Deliverability,", "feasibility, visibility,", "few more ibility"],
    body: "Others might not give a damn on all of these but we do.",
    tags: ["ETHICS", "PRACTICAL", "REACH"],
    coords: "26.8467° N · 81.0307° E",
  },
  {
    id: "outro",
    ch: "05",
    kicker: "CONTACT",
    label: "BECAME",
    pre: "WHAT IT BECAME",
    titleLines: ["That's what we are", "Maaef."],
    body: "Start a project. Or just say hi.",
    tags: ["HEY@MAAEF.IN", "IG @MAAEF", "LUCKNOW · IN"],
    coords: "26.8467° N · 81.0307° E",
  },
];

// Loop Status Ticker Sub-component
function Ticker({
  children,
  duration = 30,
  reverse = false,
}: {
  children: React.ReactNode;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        maskImage: "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
      }}
      className="w-full"
    >
      <div
        className="inline-block animate-[maaef-marquee_30s_linear_infinite]"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="pr-8">
            {children}
          </span>
        ))}
      </div>
    </div>
  );
}

// HUD corner badge sectors status indicators
function SectorBar() {
  const sectors = [0.62, 0.38, 0.84];
  return (
    <div className="flex gap-1 items-center">
      {sectors.map((v, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <div className="maaef-mono text-[8px] tracking-[0.14em] text-white/40">S{i + 1}</div>
          <div className="w-[38px] h-[3px] bg-white/10 relative">
            <div
              className={`absolute left-0 top-0 bottom-0 ${i === 1 ? "bg-red" : "bg-[#f4f1ee]"
                } origin-left animate-[maaef-bar_3s_ease-in-out_infinite]`}
              style={{
                width: `${v * 100}%`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function HudCorner({
  children,
  side = "tl",
}: {
  children: React.ReactNode;
  side?: "tl" | "tr" | "bl" | "br";
}) {
  const pos = {
    tl: { top: "var(--hud-offset-y)", left: "var(--hud-offset-x)" },
    tr: { top: "var(--hud-offset-y)", right: "var(--hud-offset-x)" },
    bl: { bottom: "calc(var(--hud-offset-y) + 28px)", left: "var(--hud-offset-x)" },
    br: { bottom: "calc(var(--hud-offset-y) + 28px)", right: "var(--hud-offset-x)" },
  }[side];

  return (
    <div
      className="maaef-mono text-[9px] tracking-[0.16em] uppercase flex gap-2 items-center z-10 text-[#f4f1ee]/40 pointer-events-none"
      style={{
        position: "absolute",
        ...pos,
      }}
    >
      {children}
    </div>
  );
}

// HERO SECTION PANELS (HUD Live broadcast feed overlay)
function HeroSlide({
  s,
  isMuted,
}: {
  s: typeof MAAEF_SECTIONS[0];
  isMuted: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);
  const [glitchText1, setGlitchText1] = useState("Maaef");
  const [glitchText2, setGlitchText2] = useState("Media House.");

  const original1 = "Maaef";
  const original2 = "Media House.";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+";

  useEffect(() => {
    setIsLaptop(window.innerWidth >= 1024);
    const handleResize = () => setIsLaptop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;

      const syncTime = () => {
        if (!videoRef.current) return;
        if (typeof window !== "undefined" && (window as any).introCurrentTime !== undefined) {
          try {
            videoRef.current.currentTime = (window as any).introCurrentTime;
            delete (window as any).introCurrentTime;
          } catch (e) {
            console.error("Failed to sync video time:", e);
          }
        }
      };

      if (videoRef.current.readyState >= 1) {
        syncTime();
      } else {
        videoRef.current.addEventListener("loadedmetadata", syncTime, { once: true });
      }

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { });
      }
    }
  }, [isMuted]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLaptop && isHovered) {
      interval = setInterval(() => {
        setGlitchText1(
          original1
            .split("")
            .map(() => chars[Math.floor(Math.random() * chars.length)])
            .join("")
        );
      }, 60);
    } else {
      setGlitchText1(original1);
      setGlitchText2(original2);
    }
    return () => clearInterval(interval);
  }, [isHovered, isLaptop]);

  const showBlur = isLaptop && !isHovered;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0405]">
      {/* Background Looped Video */}
      <video
        ref={videoRef}
        src="/videos/trailer.mp4?bg=1"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        data-keep-muted={isMuted ? "true" : "false"}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none"
        style={{ transform: isLaptop ? "scale(1.1)" : "none" }}
      />
      {isLaptop && (
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            opacity: showBlur ? 1 : 0,
            transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: "opacity"
          }}
        />
      )}

      <div className="absolute inset-0 pointer-events-none z-[3] bg-[radial-gradient(120%_80%_at_70%_40%,rgba(196,37,26,0.35),rgba(196,37,26,0.05)_55%,rgba(0,0,0,0)_80%)] opacity-40" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.25)_35%,rgba(0,0,0,0.85)_100%)] z-[3]" />

      {/* Sweep overlay lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[4]">
        <div className="absolute left-0 right-0 h-[24%] bg-[linear-gradient(180deg,transparent_0%,rgba(196,37,26,0.05)_50%,transparent_100%)] animate-[maaef-scan_9s_linear_infinite]" />
      </div>

      <HudCorner side="tl">N–01 / BROADCAST</HudCorner>
      <HudCorner side="tr">
        <span className="text-red">CH-00</span>
        <span className="text-[#f4f1ee]/40">/ HERO · BROADCAST LIVE</span>
      </HudCorner>

      <div className="absolute left-[var(--content-px)] right-[var(--content-px)] top-[calc(var(--hud-offset-y)+40px)] bottom-[calc(var(--hud-offset-y)+40px)] flex flex-col justify-center gap-6 z-[4]">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex flex-col gap-3 w-fit md:cursor-pointer cursor-default"
        >
          <h1
            className="maaef-h1 text-[#f4f1ee] m-0 select-none"
            style={{
              fontSize: "var(--h1-hero)",
            }}
          >
            <a
              href="https://www.instagram.com/maaef.media?igsh=MXJ2cnRwY3ZmdjlsZA=="
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline text-inherit"
              style={{
                display: "inline-block",
                animation: (isLaptop && isHovered) ? "maaef-glitch 0.2s linear infinite" : "none",
              }}
            >
              {glitchText1}
            </a>
            <span
              className="maaef-h1-italic block text-[#f4f1ee] mt-1.5 tracking-[0.04em] leading-[0.95]"
              style={{
                fontSize: "var(--h1-hero-sub)",
                animation: (isLaptop && isHovered) ? "maaef-glow 0.4s ease-in-out infinite" : "none",
              }}
            >
              {glitchText2}
            </span>
          </h1>
        </div>

        <div className="flex items-end gap-8 justify-start flex-wrap">
          <div
            className="text-[13px] text-[#f4f1ee] max-w-[320px] opacity-90 border-l-2 border-red leading-relaxed"
            style={{ paddingLeft: "20px" }}
          >
            Artists disguised as a Media House. A new-era media house
          </div>
        </div>
      </div>

      <HudCorner side="br">
        <div className="flex items-center gap-4.5 mr-[calc(var(--content-px)-var(--hud-offset-x))] mb-5 select-none">
          <SectorBar />
          <span className="text-[#f4f1ee]/40">{s.coords}</span>
        </div>
      </HudCorner>
    </div>
  );
}

// SLIDER MAIN GRAPHICS SHEETS
function ContentSlide({ s }: { s: typeof MAAEF_SECTIONS[0] }) {
  const titleSize =
    s.titleLines.length === 1
      ? "calc(var(--title-base) * 1.6)"
      : s.titleLines[0].length > 12
        ? "calc(var(--title-base) * 0.84)"
        : "var(--title-base)";

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050505]">
      {/* Background massive outlined lettering */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          className="maaef-h1 text-white/[0.025] tracking-[-0.05em] uppercase select-none leading-none"
          style={{
            fontSize: "var(--h1-bg)",
          }}
        >
          {s.label}
        </div>
      </div>

      {/* Sweep overlay lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[4]">
        <div className="absolute left-0 right-0 h-[24%] bg-[linear-gradient(180deg,transparent_0%,rgba(196,37,26,0.05)_50%,transparent_100%)] animate-[maaef-scan_9s_linear_infinite]" />
      </div>

      <HudCorner side="tr">
        <span className="text-red">CH-{s.ch}</span>
        <span className="text-[#f4f1ee]/40">/ {s.label} · {s.pre}</span>
      </HudCorner>

      <div className="absolute left-[var(--content-px)] right-[var(--content-px)] top-[calc(var(--hud-offset-y)+30px)] bottom-[calc(var(--hud-offset-y)+30px)] flex flex-col justify-center gap-6 lg:gap-10 z-[4] box-border">
        <div className="w-full select-none">
          <div className="maaef-mono text-[10px] md:text-[11px] text-[#f4f1ee]/70 font-semibold tracking-[0.24em] mb-3 uppercase">
            TARGETING — {s.kicker}
          </div>
          <h2
            className="maaef-h1 text-[#f4f1ee] m-0 leading-none overflow-wrap-break-word break-words"
            style={{ fontSize: titleSize }}
          >
            {s.titleLines.map((ln, i) => (
              <span
                key={i}
                className="block"
                style={{
                  color: i === s.redLine ? "#7a0e0e" : "#f4f1ee",
                  fontStyle: i === s.italicLine ? "italic" : "normal",
                  fontWeight: i === s.italicLine ? "600" : "700",
                }}
              >
                {ln}
              </span>
            ))}
          </h2>
        </div>

        <div className="flex flex-col gap-4 max-w-full md:max-w-[400px]">
          <div
            className="text-[14px] md:text-[16px] text-[#f4f1ee] font-medium opacity-95 border-l-2 border-red leading-relaxed"
            style={{ paddingLeft: "20px" }}
          >
            {s.body}
          </div>
          <div className="flex flex-wrap gap-2 select-none">
            {s.tags.map((t, i) => (
              <span
                key={i}
                className="maaef-mono text-[10px] md:text-[11.5px] tracking-[0.18em] text-[#f4f1ee]/75 font-semibold border border-[#f4f1ee]/25 px-3 py-1 rounded-[3px]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Metadata Grid & SectorBar Row */}
        <div className="w-full flex justify-between items-end gap-6 select-none">
          <div className="maaef-mono text-[10px] md:text-[11px] tracking-[0.14em] text-[#f4f1ee]/70 font-medium grid grid-cols-[auto_1fr_auto] gap-x-3.5 gap-y-1.5 w-full max-w-[340px] border-t border-[#f4f1ee]/20 pt-3.5">
            <span>CH</span>
            <span className="text-[#f4f1ee] font-bold">
              {s.ch}.{s.label}
            </span>
            <span>OK</span>
            <span>SIG</span>
            <span className="text-[#f4f1ee]">━━━━━━━━━━ </span>
            <span className="font-bold">1.00</span>
            <span>LAT</span>
            <span className="text-[#f4f1ee]">008ms · stable</span>
            <span className="text-red font-extrabold">LIVE</span>
          </div>

          {/* On Desktop: show SectorBar and coords aligned on same line */}
          <div className="hidden md:flex items-center gap-4.5 select-none text-[9px] tracking-[0.16em] uppercase font-mono text-[#f4f1ee]/40 pb-0.5 mb-1.5">
            <SectorBar />
            <span>{s.coords}</span>
          </div>
        </div>
      </div>

      {/* Fallback to standard HudCorner only on mobile */}
      <div className="md:hidden">
        <HudCorner side="br">
          <div className="flex items-center gap-4.5 mr-[calc(var(--content-px)-var(--hud-offset-x))] mb-5 select-none">
            <SectorBar />
            <span className="text-[#f4f1ee]/40">{s.coords}</span>
          </div>
        </HudCorner>
      </div>
    </div>
  );
}

// SLIDER OUTRO COMPONENT (glowing centered logotype)
function OutroSlide({ s }: { s: typeof MAAEF_SECTIONS[0] }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050505]">
      {/* Sweep overlay lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[4]">
        <div className="absolute left-0 right-0 h-[24%] bg-[linear-gradient(180deg,transparent_0%,rgba(196,37,26,0.05)_50%,transparent_100%)] animate-[maaef-scan_9s_linear_infinite]" />
      </div>

      <HudCorner side="tr">
        <span className="text-red">CH-{s.ch}</span>
        <span className="text-[#f4f1ee]/40">/ END · BROADCAST</span>
      </HudCorner>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 z-[4] px-[var(--content-px)] text-center select-none">
        <div className="maaef-h1-italic text-[clamp(1.5rem,6vw,4rem)] text-[#f4f1ee]/40 leading-[0.95]">
          That's what we are
        </div>
        <Image
          src="/images/logo.png"
          alt="Maaef Logo"
          width={280}
          height={90}
          className="h-[clamp(80px,20vw,180px)] w-auto object-contain animate-[maaef-pulse_3s_ease-in-out_infinite]"
        />
        <div className="maaef-mono text-[15px] text-[#f4f1ee]/40 tracking-[0.3em] uppercase">
          Hey@maaef.in
        </div>
        <div className="maaef-mono text-[15px] text-[#f4f1ee]/40 tracking-[0.3em] uppercase">
          #M2H
        </div>
      </div>

      <HudCorner side="br">
        <div className="flex items-center gap-4.5 mr-[calc(var(--content-px)-var(--hud-offset-x))] mb-5 select-none">
          <SectorBar />
          <span className="text-[#f4f1ee]/40">26.8467° N · 81.0307° E</span>
        </div>
      </HudCorner>
    </div>
  );
}

export default function HomePage() {
  const [done, setDone] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const logoRef = useRef<HTMLImageElement | null>(null);
  const redFloodRef = useRef<HTMLDivElement | null>(null);
  const introStageRef = useRef<HTMLDivElement | null>(null);
  const homepageRef = useRef<HTMLDivElement | null>(null);

  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Monitor scrolling of the snap container to mute audio when leaving the first slide
  useEffect(() => {
    const el = homepageRef.current;
    if (!el || !done) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const height = el.clientHeight || window.innerHeight;
      const index = Math.round(scrollTop / height);
      setActiveSectionIndex(index);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, [done]);

  // Check if session has already seen the intro
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAudioMuted((window as any).isAudioMuted ?? true);

      if (sessionStorage.getItem("maaef-seen")) {
        setDone(true);
        setIntroVisible(false);
        document.documentElement.classList.add("intro-done");
        document.body.classList.add("intro-done");
      } else {
        document.documentElement.classList.add("home-intro-active");
        document.body.classList.add("home-intro-active");
      }
    }
  }, []);

  // Update loop for listening audio settings
  useEffect(() => {
    const handleAudioChange = () => {
      setIsAudioMuted((window as any).isAudioMuted ?? true);
    };
    window.addEventListener("audioChange", handleAudioChange);
    return () => window.removeEventListener("audioChange", handleAudioChange);
  }, []);

  // Setup GSAP configs for Intro Stage
  useEffect(() => {
    if (done) return;
    if (logoRef.current) {
      gsap.set(logoRef.current, {
        opacity: 0,
        y: 200,
        rotateX: 32,
        rotateZ: -4,
        scale: 0.55,
        transformPerspective: 950,
        transformOrigin: "center bottom",
      });
    }
  }, [done]);

  const advance = () => {
    if (busy || done) return;
    setBusy(true);

    if (step === 0) {
      // Blur and darken bg on first interaction
      const bgVideo = document.getElementById("intro-bg-video") as HTMLVideoElement;
      const overlay = document.getElementById("intro-bg-overlay");
      if (bgVideo) bgVideo.style.filter = "blur(15px)";
      if (overlay) overlay.style.background = "rgba(0, 0, 0, 0.75)";

      // Unmute on first interaction if the user hasn't toggled sound manually
      if ((window as any).userHasInteracted !== true) {
        (window as any).isAudioMuted = false;
        (window as any).userHasInteracted = true;
        window.dispatchEvent(new CustomEvent("audioChange"));
      }

      setStep(1);
      setTimeout(() => setBusy(false), 1000);
    } else {
      // Explode beats timeline
      explode();
    }
  };

  const explode = () => {
    setBusy(true);
    setStep(2); // Transition text to 'out' state immediately
    const logoEl = logoRef.current;
    const redEl = redFloodRef.current;
    const introEl = introStageRef.current;
    const homeEl = homepageRef.current;

    if (!logoEl || !redEl || !introEl || !homeEl) return;

    const revealHomepage = () => {
      sessionStorage.setItem("maaef-seen", "1");
      const introVideo = document.getElementById("intro-bg-video") as HTMLVideoElement;
      if (introVideo && typeof window !== "undefined") {
        (window as any).introCurrentTime = introVideo.currentTime;
      }
      gsap.to(redEl, {
        opacity: 0,
        duration: 0.7,
        ease: "power2.inOut",
        onStart: () => {
          introEl.style.transition = "opacity 0.7s ease";
          introEl.style.opacity = "0";
          homeEl.style.opacity = "0";
          setDone(true);
          document.documentElement.classList.remove("home-intro-active");
          document.body.classList.remove("home-intro-active");
          document.documentElement.classList.add("intro-done");
          document.body.classList.add("intro-done");
        },
        onComplete: () => {
          introEl.style.display = "none";
          setIntroVisible(false);
          gsap.to(homeEl, { opacity: 1, duration: 0.5, ease: "power2.out" });
          setBusy(false);
          // Sync sound state
          window.dispatchEvent(new CustomEvent("audioChange"));
        },
      });
    };

    const tl = gsap.timeline({ onComplete: revealHomepage });
    const isDesktop = window.innerWidth >= 768;

    if (isDesktop) {
      tl.to(logoEl, { opacity: 1, y: 0, rotateX: 0, rotateZ: 0, scale: 1, duration: 1.35, ease: "power3.out", delay: 0.5 })
        .to(logoEl, { scale: 1.06, duration: 0.28, ease: "sine.inOut", yoyo: true, repeat: 1 })
        .to(logoEl, { scale: 1.18, duration: 0.32, ease: "power2.inOut" })
        .to(logoEl, { scale: 38, opacity: 0, filter: "blur(18px)", duration: 0.72, ease: "power4.in" })
        .to(redEl, { opacity: 1, duration: 0.35, ease: "none" }, "-=0.62")
        .to({}, { duration: 0.55 });
    } else {
      tl.to(logoEl, { opacity: 1, y: 0, rotateX: 0, rotateZ: 0, scale: 1, duration: 0.8, ease: "power2.out", delay: 0.3 })
        .to(logoEl, { scale: 12, opacity: 0, filter: "blur(10px)", duration: 0.5, ease: "power3.in" })
        .to(redEl, { opacity: 1, duration: 0.25, ease: "none" }, "-=0.4")
        .to({}, { duration: 0.3 });
    }
  };

  const skipIntro = () => {
    if (done) return;
    setBusy(true);

    const introEl = introStageRef.current;
    const homeEl = homepageRef.current;
    if (!introEl || !homeEl) return;

    gsap.to(introEl, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        const introVideo = document.getElementById("intro-bg-video") as HTMLVideoElement;
        if (introVideo) {
          if (typeof window !== "undefined") {
            (window as any).introCurrentTime = introVideo.currentTime;
          }
        }
        introEl.style.display = "none";
        setDone(true);
        setIntroVisible(false);
        document.documentElement.classList.remove("home-intro-active");
        document.body.classList.remove("home-intro-active");
        document.documentElement.classList.add("intro-done");
        document.body.classList.add("intro-done");
        sessionStorage.setItem("maaef-seen", "1");
        homeEl.style.opacity = "1";
        setBusy(false);
        window.dispatchEvent(new CustomEvent("audioChange"));
      },
    });
  };

  // Scroll listeners to advance intro stage beats
  useEffect(() => {
    if (done) return;

    let lastWheel = 0;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (busy) return;
      const now = Date.now();
      if (now - lastWheel < 750) return;
      if (e.deltaY < 0) return;
      lastWheel = now;
      advance();
    };

    let touchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (busy) return;
      if (touchY - e.changedTouches[0].clientY > 45) {
        advance();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (busy) return;
      if (["ArrowDown", "Space", "PageDown", "Enter"].includes(e.code)) {
        e.preventDefault();
        advance();
      }
      if (e.code === "Escape") {
        skipIntro();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [step, busy, done]);

  return (
    <>
      {introVisible && (
        <div
          ref={introStageRef}
          id="intro-stage"
          className="fixed inset-0 z-[500] bg-[#050505] overflow-hidden"
          style={{ display: introVisible ? "block" : "none" }}
        >
          <div id="intro-bg" className="absolute inset-0">
            <video
              id="intro-bg-video"
              src="/videos/trailer.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-all duration-[1000ms] ease-out select-none"
            />
            <div id="intro-bg-overlay" className="absolute inset-0 bg-black/55 transition-all duration-[1000ms] ease-out" />
          </div>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />

          {/* Scrolling hint indicators */}
          <div id="beats-wrap" className="absolute inset-0 flex items-center pl-[8vw] pr-[5vw] md:pl-[8vw] pointer-events-none select-none">
            <div
              id="beat-1"
              className={`beat ${step === 1 ? "in" : step > 1 ? "out" : ""}`}
            >
              <div className="beat-index font-mono text-[9px] tracking-[0.28em] uppercase text-white/18 mb-[1.4rem]"></div>
              <div className="beat-label text-[10px] tracking-[0.3em] uppercase text-white/25 mb-[1rem]">Intro</div>
              <h2 className="beat-head font-serif text-[clamp(1.8rem,7.5vw,7.2rem)] leading-[0.88] tracking-[-0.01em] text-white mb-[2rem]">
                We make things <br />
                <span className="text-red">worth looking at.</span>
              </h2>
              <p
                className="beat-body text-[clamp(0.9rem,1.4vw,1.1rem)] font-light text-white/35 border-l-2 border-red leading-relaxed max-w-[380px]"
                style={{ paddingLeft: "20px" }}
              >
                A media house for people with short attention spans
              </p>
            </div>
          </div>

          <div id="logo-stage" className="absolute inset-0 flex items-center justify-center perspective-[1000px] pointer-events-none select-none">
            <img
              id="logo-blast"
              ref={logoRef}
              src="/images/logo.png"
              alt="Maaef Logo"
              className="w-[40vw] max-w-[500px] h-auto opacity-0 transform translate-y-14"
            />
          </div>

          {/* Flash & Red backgrounds */}
          <div ref={redFloodRef} id="red-flood" className="absolute inset-0 bg-red opacity-0 pointer-events-none" />
          <div id="white-flash" className="absolute inset-0 bg-white opacity-0 pointer-events-none" />

          {step === 0 && (
            <div id="scroll-hint" className="absolute bottom-[3.5rem] left-1/2 -translate-x-1/2 flex flex-col items-center gap-[0.8rem] transition-opacity duration-300">
              <span className="text-[9px] tracking-[0.3em] uppercase text-white/30">Scroll to begin</span>
              <div className="hint-line w-[1px] h-[48px] bg-gradient-to-b from-transparent to-white/35 animate-[hintDrop_2s_ease_infinite]" />
            </div>
          )}

          <button
            id="skip-btn"
            onClick={skipIntro}
            className="absolute bottom-[3.5rem] right-[3rem] text-[9px] tracking-[0.25em] uppercase text-white/20 hover:text-white/50 border-none bg-transparent cursor-pointer transition-all duration-500"
            style={{
              opacity: step === 0 ? 1 : 0,
              pointerEvents: step === 0 ? "auto" : "none",
            }}
          >
            Skip ↓
          </button>

          <div
            id="step-bar"
            className="absolute bottom-0 left-0 h-[1px] bg-red transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: step === 0 ? "0%" : step === 1 ? "50%" : "100%" }}
          />
        </div>
      )}

      {/* ─── MAIN SLIDES AND HOMEPAGE ─── */}
      <div
        ref={homepageRef}
        id="homepage"
        className={`bg-[#050505] transition-opacity duration-500 overflow-x-hidden ${done ? "alive opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div id="react-root" className="w-full">
          {MAAEF_SECTIONS.map((s, i) => (
            <section
              key={s.id}
              className="relative w-full h-screen h-dvh bg-[#050505] overflow-hidden snap-start snap-always"
            >
              {i === 0 ? (
                <HeroSlide s={s} isMuted={!done || isAudioMuted || activeSectionIndex !== 0} />
              ) : i === MAAEF_SECTIONS.length - 1 ? (
                <OutroSlide s={s} />
              ) : (
                <ContentSlide s={s} />
              )}

              {/* Running Ticker at Slide Bottom */}
              <div className="absolute left-0 right-0 bottom-0 h-[22px] bg-[rgba(196,37,26,0.04)] border-t border-[rgba(196,37,26,0.18)] flex items-center z-[5] font-mono text-[9px] tracking-[0.16em] text-[#f4f1ee]/40 uppercase select-none">
                <Ticker duration={42}>
                  <span className="text-red">● LIVE</span> &nbsp;·&nbsp; CH 00–05 NOMINAL &nbsp;·&nbsp; LUCKNOW 26.8467° N 81.0307° E &nbsp;·&nbsp; LAP 12 / OUT &nbsp;·&nbsp; ATTENTION ENGINE v2.4 &nbsp;·&nbsp; SECTOR 1 PURPLE &nbsp;·&nbsp; SECTOR 2 GREEN &nbsp;·&nbsp; SECTOR 3 GREEN &nbsp;·&nbsp;
                </Ticker>
              </div>
            </section>
          ))}

          {/* snap boundaries Footer wrapper */}
          <div className="snap-start snap-always bg-[#050505] relative z-10 select-none">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
