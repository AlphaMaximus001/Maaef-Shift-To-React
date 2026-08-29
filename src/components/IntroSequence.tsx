"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useMaaef } from "@/context/MaaefContext";

interface IntroSequenceProps {
  onComplete: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const logoRef = useRef<HTMLImageElement | null>(null);
  const redFloodRef = useRef<HTMLDivElement | null>(null);
  const introStageRef = useRef<HTMLDivElement | null>(null);

  const { setAudioMuted, setIntroCurrentTime, userHasInteracted, setUserHasInteracted } = useMaaef();

  // Setup GSAP configs for logo
  useEffect(() => {
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
  }, []);

  const advance = () => {
    if (busy) return;
    setBusy(true);

    if (step === 0) {
      // Blur and darken bg on first interaction
      const bgVideo = document.getElementById("intro-bg-video") as HTMLVideoElement;
      const overlay = document.getElementById("intro-bg-overlay");
      if (bgVideo) bgVideo.style.filter = "blur(15px)";
      if (overlay) overlay.style.background = "rgba(0, 0, 0, 0.75)";

      // Unmute on first interaction if the user hasn't toggled sound manually
      if (!userHasInteracted) {
        setAudioMuted(false);
        setUserHasInteracted(true);
      }

      setStep(1);
      setTimeout(() => setBusy(false), 1000);
    } else {
      explode();
    }
  };

  const explode = () => {
    setBusy(true);
    setStep(2);
    const logoEl = logoRef.current;
    const redEl = redFloodRef.current;
    const introEl = introStageRef.current;

    if (!logoEl || !redEl || !introEl) return;

    const revealHomepage = () => {
      sessionStorage.setItem("maaef-seen", "1");
      const introVideo = document.getElementById("intro-bg-video") as HTMLVideoElement;
      if (introVideo) {
        setIntroCurrentTime(introVideo.currentTime);
      }
      gsap.to(redEl, {
        opacity: 0,
        duration: 0.7,
        ease: "power2.inOut",
        onStart: () => {
          introEl.style.transition = "opacity 0.7s ease";
          introEl.style.opacity = "0";
          document.documentElement.classList.remove("home-intro-active");
          document.body.classList.remove("home-intro-active");
          document.documentElement.classList.add("intro-done");
          document.body.classList.add("intro-done");
        },
        onComplete: () => {
          introEl.style.display = "none";
          onComplete();
          setBusy(false);
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
    setBusy(true);
    const introEl = introStageRef.current;
    if (!introEl) return;

    gsap.to(introEl, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        const introVideo = document.getElementById("intro-bg-video") as HTMLVideoElement;
        if (introVideo) {
          setIntroCurrentTime(introVideo.currentTime);
        }
        introEl.style.display = "none";
        document.documentElement.classList.remove("home-intro-active");
        document.body.classList.remove("home-intro-active");
        document.documentElement.classList.add("intro-done");
        document.body.classList.add("intro-done");
        sessionStorage.setItem("maaef-seen", "1");
        onComplete();
        setBusy(false);
        window.dispatchEvent(new CustomEvent("audioChange"));
      },
    });
  };

  // Latest-value refs so the stall timer can read intro progress without restarting
  const stepRef = useRef(step);
  const busyRef = useRef(busy);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { busyRef.current = busy; }, [busy]);

  // Safety net: reveal the site if the intro video stalls
  useEffect(() => {
    const INTRO_STALL_TIMEOUT_MS = 8000;
    const timer = window.setTimeout(() => {
      if (stepRef.current !== 0 || busyRef.current) return;
      const introVideo = document.getElementById("intro-bg-video") as HTMLVideoElement | null;
      if (introVideo && introVideo.readyState >= 3) return;
      skipIntro();
    }, INTRO_STALL_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Scroll/touch/keyboard listeners to advance intro
  useEffect(() => {
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
  }, [step, busy]);

  return (
    <div
      ref={introStageRef}
      id="intro-stage"
      className="fixed inset-0 z-[500] bg-[#050505] overflow-hidden"
    >
      <div id="intro-bg" className="absolute inset-0">
        <video
          id="intro-bg-video"
          src="/videos/trailer.mp4"
          poster="/videos/trailer-poster.webp"
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
  );
}
