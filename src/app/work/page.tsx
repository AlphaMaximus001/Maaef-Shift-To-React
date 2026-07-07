"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import Footer from "@/components/Footer";

// Brand dial assets
const DIAL_LOGOS = [
  { index: 0, imgSrc: "/images/logo1.png", videoSrc: "/videos/studio-video1.mp4", label: "Brand 1" },
  { index: 1, imgSrc: "/images/logo2.png", videoSrc: "/videos/studio-video2.mp4", label: "Brand 2" },
  { index: 2, imgSrc: "/images/logo3.png", videoSrc: "/videos/studio-video3.mp4", label: "Brand 3" },
];

export default function AboutPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bgContainerRef = useRef<HTMLDivElement | null>(null);
  const brandDialRef = useRef<HTMLDivElement | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [videoSrc, setVideoSrc] = useState("/videos/studio-video1.mp4");
  const [isMuted, setIsMuted] = useState(true);
  const [inFullscreen, setInFullscreen] = useState(false);

  const dialAngleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartAngleRef = useRef(0);
  const dragDialStartRef = useRef(0);
  const loopCountRef = useRef(0);

  const LOGO_SPACING = 55; // degrees
  const ACTIVE_DEG = 225; // center visible arc
  const FULL_CYCLE = LOGO_SPACING * 3; // full rotation arc wrap

  // Setup ambient opacity and start video play on mount
  useEffect(() => {
    if (bgContainerRef.current) {
      gsap.set(bgContainerRef.current, { opacity: 1 });
    }
    if (videoRef.current) {
      videoRef.current.muted = (window as any).isAudioMuted ?? true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    }
  }, []);

  // Sync mute state on active video tag and listen to global audioChange
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMuted((window as any).isAudioMuted ?? true);
    }

    const handleAudioChange = () => {
      const globalMuted = (window as any).isAudioMuted ?? true;
      setIsMuted(globalMuted);
      if (videoRef.current) {
        videoRef.current.muted = globalMuted;
      }
    };

    window.addEventListener("audioChange", handleAudioChange);
    return () => window.removeEventListener("audioChange", handleAudioChange);
  }, []);

  // Set the video muted attribute when isMuted changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    (window as any).isAudioMuted = nextState;
    localStorage.setItem("maaef-muted", String(nextState));
    window.dispatchEvent(new CustomEvent("audioChange"));
  };

  // Wrap angle to full cycle bounds
  const wrapAngle = (a: number) => {
    return ((a % FULL_CYCLE) + FULL_CYCLE * 100) % FULL_CYCLE;
  };

  // Re-position logos along the circular arc
  const positionLogos = (currentAngle: number) => {
    const brandDial = brandDialRef.current;
    if (!brandDial) return;

    const logoElements = brandDial.querySelectorAll<HTMLDivElement>(".dial-logo");
    const DIAL_SIZE = brandDial.offsetWidth;
    const CENTER = DIAL_SIZE / 2;
    const LOGO_R = DIAL_SIZE * 0.36;

    logoElements.forEach((logo, i) => {
      const rawOffset = i * LOGO_SPACING + currentAngle;
      const wrappedOffset = wrapAngle(rawOffset);
      const centered = wrappedOffset - LOGO_SPACING; // range [-55, 110]
      const angle = ACTIVE_DEG + centered;
      const rad = (angle * Math.PI) / 180;

      logo.style.left = `${CENTER + LOGO_R * Math.cos(rad)}px`;
      logo.style.top = `${CENTER + LOGO_R * Math.sin(rad)}px`;
      logo.style.transform = "translate(-50%, -50%)";

      // Toggle active visual highlight state
      const atCenter =
        Math.abs(wrapAngle(rawOffset)) < 5 || Math.abs(wrapAngle(rawOffset) - FULL_CYCLE) < 5;
      logo.classList.toggle("active", atCenter);
    });
  };

  // Helper to compute angle from center of dial to pointer coords
  const getPointerAngle = (clientX: number, clientY: number) => {
    const brandDial = brandDialRef.current;
    if (!brandDial) return 0;
    const rect = brandDial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  };

  // Rotate to specific logo index with GSAP transitions (always rotating forward/clockwise: logos moving left to right)
  const rotateTo = (logoIndex: number) => {
    const targetMod = -logoIndex * LOGO_SPACING;
    let delta = targetMod - dialAngleRef.current;
    // Force delta to be positive so that the transition only rotates in the forward (left-to-right) direction
    delta = ((delta % FULL_CYCLE) + FULL_CYCLE) % FULL_CYCLE;
    const target = dialAngleRef.current + delta;

    const tempObj = { v: dialAngleRef.current };
    gsap.to(tempObj, {
      v: target,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: () => {
        dialAngleRef.current = tempObj.v;
        positionLogos(tempObj.v);
      },
      onComplete: () => {
        dialAngleRef.current = target;
        positionLogos(target);
        setActiveIndex(logoIndex);
        switchVideo(logoIndex);
      },
    });
  };

  // Switch video background with custom cross-fade opacity
  const switchVideo = (idx: number) => {
    const bgContainer = bgContainerRef.current;
    const video = videoRef.current;
    if (!bgContainer || !video) return;

    const targetSrc = DIAL_LOGOS[idx].videoSrc;
    loopCountRef.current = 0;

    gsap.to(bgContainer, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        // Direct DOM update ensures the new video loads instantly without timing lag or batching delays
        video.src = targetSrc;
        setVideoSrc(targetSrc);
        video.load();
        video.currentTime = 0;
        const p = video.play();
        if (p !== undefined) p.catch(() => {});
        gsap.to(bgContainer, { opacity: 1, duration: 0.6 });
      },
    });
  };

  // Dial Snap-to-closest logo spacing logic
  const snapDial = () => {
    const snap = Math.round(dialAngleRef.current / LOGO_SPACING) * LOGO_SPACING;
    const newIdx = (((-Math.round(snap / LOGO_SPACING)) % 3) + 3) % 3;

    const tempObj = { v: dialAngleRef.current };
    gsap.to(tempObj, {
      v: snap,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: () => {
        dialAngleRef.current = tempObj.v;
        positionLogos(tempObj.v);
      },
      onComplete: () => {
        dialAngleRef.current = snap;
        positionLogos(snap);
        setActiveIndex(newIdx);
        switchVideo(newIdx);
      },
    });
  };

  // Drag handlers (based purely on horizontal clientX distance for predictable left-to-right movement)
  const handleDragStart = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartAngleRef.current = clientX;
    dragDialStartRef.current = dialAngleRef.current;
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - dragStartAngleRef.current;
    
    // Ignore any dragging movement to the left of the drag start point
    if (deltaX <= 0) return;
    
    if (Math.abs(deltaX) > 5) {
      hasDraggedRef.current = true;
    }
    
    const targetAngle = dragDialStartRef.current + deltaX * 0.35;
    
    // Only allow the dial to rotate forward (increasing angle, logos moving left to right)
    if (targetAngle > dialAngleRef.current) {
      dialAngleRef.current = targetAngle;
      positionLogos(dialAngleRef.current);
    }
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    snapDial();
  };

  // Setup drag event listeners on window
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      handleDragEnd();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      handleDragEnd();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Initial positioning on mount
    positionLogos(0);

    const onResize = () => {
      positionLogos(dialAngleRef.current);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Listen for fullscreen toggle event changes
  useEffect(() => {
    const handleFSChange = () => {
      const isFS = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setInFullscreen(isFS);
      if (!isFS) {
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
        gsap.to(bgContainerRef.current, { opacity: 1, duration: 0.4 });
      }
    };

    document.addEventListener("fullscreenchange", handleFSChange);
    document.addEventListener("webkitfullscreenchange", handleFSChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFSChange);
      document.removeEventListener("webkitfullscreenchange", handleFSChange);
    };
  }, []);

  const triggerFullscreen = () => {
    const el = bgContainerRef.current;
    if (!el) return;

    const requestFS = el.requestFullscreen || (el as any).webkitRequestFullscreen;
    if (requestFS) {
      requestFS.call(el).then(() => {
        if (screen.orientation && (screen.orientation as any).lock) {
          (screen.orientation as any).lock("landscape").catch(() => {});
        }
      }).catch(() => {});
    } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
      (videoRef.current as any).webkitEnterFullscreen();
    }
  };

  const handleVideoEnded = () => {
    loopCountRef.current += 1;
    if (loopCountRef.current >= 2) {
      rotateTo((activeIndex + 1) % 3);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const next = e.deltaY > 0 ? (activeIndex + 1) % 3 : (activeIndex + 2) % 3;
    rotateTo(next);
  };

  return (
    <>
      <div className="noise-overlay" />

      <main>
        {/* PINHOLE BRAND SHOWCASE SECTION */}
        <section className="pinhole-section relative min-h-screen bg-brand-dark overflow-hidden flex flex-col items-center justify-center">
          <div id="pinhole-title-container" className="absolute top-[15%] left-0 w-full text-center z-[40] pointer-events-none px-6 select-none hidden">
            <h3 className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-red mb-3">
              Trusted Partners
            </h3>
            <h2 className="serif text-2xl md:text-4xl text-white mb-2 tracking-tight">
              Engineering Attention Globally
            </h2>
            <p className="text-gray-500 text-sm font-light uppercase tracking-wider">
              Explore Broadcast Works
            </p>
          </div>

          <div
            ref={bgContainerRef}
            id="pinhole-bg-container"
            className="absolute inset-0 z-1"
          >
            {/* Fullscreen Trigger */}
            <button
              onClick={triggerFullscreen}
              id="fullscreen-btn"
              title="Watch fullscreen"
              aria-label="Open video fullscreen"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5.5 py-2.5 bg-black/55 backdrop-blur-md border border-white/25 rounded-full text-white text-[10px] tracking-[0.2em] uppercase cursor-pointer hover:bg-white hover:text-black hover:border-white transition-all duration-300 select-none hover-trigger"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
              Watch Fullscreen
            </button>

            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover bg-black select-none"
            />
          </div>

          {/* BRAND DIAL — Circular Selector */}
          <div
            ref={brandDialRef}
            id="brand-dial"
            onWheel={handleWheel}
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            className="brand-dial"
          >
            <div className="dial-ring" />

            {/* Mute Center button */}
            <button
              onClick={toggleMute}
              id="pinhole-mute-btn"
              className="dial-mute hover-trigger"
              title="Toggle Sound"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isMuted ? "none" : "#1a1a1a"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {isMuted ? (
                  <>
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </>
                ) : (
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                )}
              </svg>
            </button>

            {/* Dial logos on the arc */}
            {DIAL_LOGOS.map((logo, i) => (
              <div
                key={logo.index}
                onClick={() => {
                  if (!hasDraggedRef.current) {
                    rotateTo(logo.index);
                  }
                }}
                className={`dial-logo hover-trigger ${
                  activeIndex === logo.index ? "active" : ""
                }`}
                data-index={logo.index}
                data-video={logo.videoSrc}
              >
                <Image
                  src={logo.imgSrc}
                  alt={logo.label}
                  width={40}
                  height={40}
                  className="w-[50%] h-[50%] object-contain select-none pointer-events-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <Footer />
      </main>
    </>
  );
}
