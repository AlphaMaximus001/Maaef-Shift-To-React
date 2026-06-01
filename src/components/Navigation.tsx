"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface PathSegment {
  points: { x: number; y: number }[];
  state: "drawing" | "pulsing" | "fading";
  opacity: number;
  pulseVal: number;
  pulseDir: number;
  pulseCount: number;
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isBlog = pathname?.startsWith("/blog");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const pathsRef = useRef<PathSegment[]>([]);
  const animationFrameId = useRef<number | null>(null);
  
  const [liveTime, setLiveTime] = useState<string>("0000000000000");

  const toggleMenu = () => {
    setIsOpen(prev => {
      const nextState = !prev;
      if (nextState) {
        document.documentElement.classList.add("menu-open");
        document.body.classList.add("menu-open");
        // Clear old paths
        pathsRef.current = [];
      } else {
        document.documentElement.classList.remove("menu-open");
        document.body.classList.remove("menu-open");
      }
      return nextState;
    });
  };

  // Listen to custom toggle menu events from decoupled channel bars
  useEffect(() => {
    const handleToggle = () => {
      toggleMenu();
    };
    window.addEventListener("MAAEF_TOGGLE_MENU", handleToggle);
    return () => window.removeEventListener("MAAEF_TOGGLE_MENU", handleToggle);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false);
    document.documentElement.classList.remove("menu-open");
    document.body.classList.remove("menu-open");
  }, [pathname]);

  // Live time ticker
  useEffect(() => {
    const updateTime = () => setLiveTime(Date.now().toString());
    const interval = setInterval(updateTime, 33);
    updateTime();
    return () => clearInterval(interval);
  }, []);

  // Drawing Canvas logic inside kinetic overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const addPoint = (x: number, y: number) => {
      const paths = pathsRef.current;
      if (paths.length === 0) return;
      paths[paths.length - 1].points.push({ x, y });
    };

    const handleMouseDown = (e: MouseEvent) => {
      drawingRef.current = true;
      pathsRef.current.push({
        points: [{ x: e.clientX, y: e.clientY }],
        state: "drawing",
        opacity: 1,
        pulseVal: 0,
        pulseDir: 1,
        pulseCount: 0,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!drawingRef.current) return;
      addPoint(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      drawingRef.current = false;
      const paths = pathsRef.current;
      if (paths.length > 0) {
        paths[paths.length - 1].state = "pulsing";
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      drawingRef.current = true;
      pathsRef.current.push({
        points: [{ x: touch.clientX, y: touch.clientY }],
        state: "drawing",
        opacity: 1,
        pulseVal: 0,
        pulseDir: 1,
        pulseCount: 0,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!drawingRef.current) return;
      const touch = e.touches[0];
      addPoint(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      drawingRef.current = false;
      const paths = pathsRef.current;
      if (paths.length > 0) {
        paths[paths.length - 1].state = "pulsing";
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    // Animation loop
    const animateDrawing = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "#C41E3A";

      const paths = pathsRef.current;

      for (let i = paths.length - 1; i >= 0; i--) {
        const path = paths[i];
        if (path.points.length < 2) continue;

        if (path.state === "pulsing") {
          path.pulseVal += 0.08 * path.pulseDir;
          if (path.pulseVal >= 1) {
            path.pulseVal = 1;
            path.pulseDir = -1;
          }
          if (path.pulseVal <= 0) {
            path.pulseVal = 0;
            path.pulseDir = 1;
            path.pulseCount++;
          }
          if (path.pulseCount >= 2) path.state = "fading";
        } else if (path.state === "fading") {
          path.opacity -= 0.02;
        }

        let currentWidth = 3;
        let currentBlur = 10;
        if (path.state === "drawing" || path.state === "pulsing") {
          currentWidth += path.pulseVal * 5;
          currentBlur += path.pulseVal * 25;
        }

        ctx.lineWidth = currentWidth;
        ctx.shadowBlur = currentBlur;
        ctx.strokeStyle = `rgba(255, 255, 255, ${path.opacity})`;

        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let j = 1; j < path.points.length; j++) {
          ctx.lineTo(path.points[j].x, path.points[j].y);
        }
        ctx.stroke();

        if (path.opacity <= 0) {
          paths.splice(i, 1);
        }
      }

      animationFrameId.current = requestAnimationFrame(animateDrawing);
    };

    animateDrawing();

    // Hover mouse classes
    const hoverTriggers = document.querySelectorAll(".hover-trigger");
    const handleEnter = () => document.body.classList.add("hovering");
    const handleLeave = () => document.body.classList.remove("hovering");

    hoverTriggers.forEach(trigger => {
      trigger.addEventListener("mouseenter", handleEnter);
      trigger.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      
      hoverTriggers.forEach(trigger => {
        trigger.removeEventListener("mouseenter", handleEnter);
        trigger.removeEventListener("mouseleave", handleLeave);
      });

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isOpen]);

  // Handle pointer hovering logic in standard DOM links
  useEffect(() => {
    const hoverTriggers = document.querySelectorAll(".hover-trigger");
    const handleEnter = () => document.body.classList.add("hovering");
    const handleLeave = () => document.body.classList.remove("hovering");

    hoverTriggers.forEach(trigger => {
      trigger.addEventListener("mouseenter", handleEnter);
      trigger.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      hoverTriggers.forEach(trigger => {
        trigger.removeEventListener("mouseenter", handleEnter);
        trigger.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, [pathname]);

  if (pathname?.startsWith("/writingspace")) {
    return null;
  }

  const isHome = pathname === "/";
  const isAbout = pathname === "/about";
  const isWork = pathname === "/work";
  const isExpertise = pathname === "/expertise";

  if (isExpertise && !isOpen) {
    return (
      <nav
        className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-10 z-[200] mix-blend-normal transition-opacity duration-300"
        id="main-nav"
      >
        <div className="logo serif text-[22px] font-bold tracking-[-0.02em] text-white">
          Maaef<span className="text-[#e40521]">.</span>
        </div>
        <div className="nav-right flex items-center gap-8">
          <Link
            href="/contact"
            className="nav-label text-[11px] font-semibold tracking-[0.15em] uppercase text-white/85 hover:text-[#e40521] transition hover-trigger no-underline"
          >
            Start Project
          </Link>
          <div
            onClick={toggleMenu}
            className="nav-lines flex flex-col gap-[5px] cursor-pointer hover-trigger p-2"
          >
            <span className="block w-[22px] h-[1px] bg-white"></span>
            <span className="block w-[22px] h-[1px] bg-white"></span>
            <span className="block w-3.5 h-[1px] bg-white"></span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[60] px-6 md:px-12 py-8 flex justify-between items-center text-white transition-opacity duration-500 ${
          isWork ? "mix-blend-difference" : ""
        }`}
        id="main-nav"
      >
        <Link href="/" className="hover-trigger relative z-[60] nav-logo-link transition-opacity duration-300">
          {!isHome && (
            <Image
              src="/images/logo.png"
              alt="Maaef Logo"
              width={80}
              height={24}
              style={{ height: 'auto' }}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          )}
        </Link>

        {(isAbout || isWork) && (
          <div className={`hidden md:flex items-center gap-8 z-[60] transition-opacity duration-300 ${isOpen ? "opacity-0 pointer-events-none" : ""}`}>
            <Link
              href="/"
              className="text-[11px] uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors duration-300 hover-trigger"
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 hover-trigger ${
                isAbout ? "text-white font-bold hover:text-[#e40521]" : "text-white/60 hover:text-white"
              }`}
            >
              About
            </Link>
            <Link
              href="/work"
              className={`text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 hover-trigger ${
                isWork ? "text-white font-bold hover:text-[#e40521]" : "text-white/60 hover:text-white"
              }`}
            >
              Work
            </Link>
            <Link
              href="/services"
              className="text-[11px] uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors duration-300 hover-trigger"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="text-[11px] uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors duration-300 hover-trigger"
            >
              Contact
            </Link>
          </div>
        )}

        <div className="flex items-center gap-6 z-[60]">
          {!isHome && (
            <Link
              href="/contact"
              className={`hidden md:block text-xs uppercase tracking-widest hover:text-[#e40521] transition hover-trigger font-bold no-underline text-white mr-4 transition-opacity duration-300 ${isOpen ? "opacity-0 pointer-events-none" : ""}`}
            >
              Start Project
            </Link>
          )}
          <button
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            className="group relative flex flex-col items-center justify-center w-12 h-12 hover-trigger border-none bg-transparent cursor-pointer focus:outline-none z-[70]"
          >
            <div className="relative w-6 h-6 flex flex-col items-center justify-center">
              <span
                className={`block absolute h-[2px] bg-white transition-all duration-300 ${
                  isOpen ? "w-6 rotate-45" : "w-6 -translate-y-[5px] group-hover:w-4"
                }`}
              />
              <span
                className={`block absolute h-[2px] bg-white transition-all duration-300 ${
                  isOpen ? "w-6 -rotate-45" : "w-4 translate-y-[5px] group-hover:w-6"
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Drawing Canvas Overlay Ticker Menu */}
      <div
        id="kinetic-menu"
        style={{
          isolation: "isolate",
          willChange: "transform",
          transform: isOpen ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.8s cubic-bezier(0.7, 0, 0.3, 1)",
        }}
        className="fixed inset-0 z-[55] bg-[#050505] flex flex-col justify-center items-center overflow-hidden"
      >
        <canvas ref={canvasRef} id="drawing-canvas"></canvas>
        
        {/* Grain backdrop */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Links */}
        <div className="flex flex-col gap-4 text-center relative z-10 pointer-events-none">
          <Link
            href="/"
            onClick={toggleMenu}
            className="menu-link group relative overflow-hidden inline-block hover-trigger cursor-pointer pointer-events-auto py-2"
          >
            <span className="serif text-[10vw] md:text-8xl lg:text-9xl text-white pb-2 md:pb-6 block">
              Home
            </span>
            <span className="absolute top-0 left-0 serif text-[10vw] md:text-8xl lg:text-9xl text-red-600 w-full pb-2 md:pb-6 block">
              Home
            </span>
          </Link>

          <Link
            href="/work"
            onClick={toggleMenu}
            className="menu-link group relative overflow-hidden inline-block hover-trigger cursor-pointer pointer-events-auto py-2"
          >
            <span className="serif text-[10vw] md:text-8xl lg:text-9xl text-white pb-2 md:pb-6 block">
              Work
            </span>
            <span className="absolute top-0 left-0 serif text-[10vw] md:text-8xl lg:text-9xl text-red-600 w-full pb-2 md:pb-6 block">
              Work
            </span>
          </Link>
          <Link
            href="/services"
            onClick={toggleMenu}
            className="menu-link group relative overflow-hidden inline-block hover-trigger cursor-pointer pointer-events-auto py-2"
          >
            <span className="serif text-[10vw] md:text-8xl lg:text-9xl text-white pb-2 md:pb-6 block">
              Services
            </span>
            <span className="absolute top-0 left-0 serif text-[10vw] md:text-8xl lg:text-9xl text-red-600 w-full pb-2 md:pb-6 block">
              Services
            </span>
          </Link>
          <Link
            href="/contact"
            onClick={toggleMenu}
            className="menu-link group relative overflow-hidden inline-block hover-trigger cursor-pointer pointer-events-auto py-2"
          >
            <span className="serif text-[10vw] md:text-8xl lg:text-9xl text-white pb-2 md:pb-6 block">
              Contact
            </span>
            <span className="absolute top-0 left-0 serif text-[10vw] md:text-8xl lg:text-9xl text-red-600 w-full pb-2 md:pb-6 block">
              Contact
            </span>
          </Link>
        </div>

        {/* Trace HUD details */}
        <div className="absolute bottom-28 text-[10px] uppercase tracking-[0.3em] text-neutral-700 animate-pulse pointer-events-none">
          [ LEAVE A TRACE ]
        </div>
        <div className="absolute bottom-12 flex justify-between w-full px-12 font-mono text-[13px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none">
          <span>26.86478567352451, 81.0101077355821</span>
          <span id="live-clock">{liveTime}</span>
        </div>
      </div>
    </>
  );
}
