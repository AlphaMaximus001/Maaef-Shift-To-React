"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Footer() {
  const router = useRouter();
  const ctaRef = useRef<HTMLDivElement | null>(null);

  // Position dynamic skewed tapes
  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;

    const tapes = cta.querySelectorAll<HTMLDivElement>(".concept-tape[data-start]");

    const positionTapes = () => {
      const W = cta.clientWidth;
      const H = cta.clientHeight;

      tapes.forEach(el => {
        const startAttr = el.getAttribute("data-start");
        const endAttr = el.getAttribute("data-end");
        if (!startAttr || !endAttr) return;

        const [x1, y1] = startAttr.split(",").map(Number);
        const [x2, y2] = endAttr.split(",").map(Number);

        const dx = ((x2 - x1) / 100) * W;
        const dy = ((y2 - y1) / 100) * H;

        el.style.left = `${(x1 / 100) * W}px`;
        el.style.top = `${(y1 / 100) * H - el.offsetHeight / 2}px`;
        el.style.width = `${Math.hypot(dx, dy)}px`;
        el.style.transform = `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`;
      });
    };

    // Expose position globally so it can be re-run on hover or layout updates
    (window as any).positionMaaefStripes = positionTapes;

    // Run initial alignment
    positionTapes();
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(positionTapes);
    });

    // Run multiple deferred timeouts to ensure exact styling calculations after fonts and images load
    const timers = [100, 300, 600, 1000].map(delay => setTimeout(positionTapes, delay));

    window.addEventListener("resize", positionTapes);

    return () => {
      cancelAnimationFrame(frameId);
      timers.forEach(clearTimeout);
      delete (window as any).positionMaaefStripes;
      window.removeEventListener("resize", positionTapes);
    };
  }, []);

  return (
    <footer id="main-footer" className="relative bg-[#050505] pt-20 pb-8 overflow-hidden border-t border-white/[.05]">
      {/* Noise background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="inline-block hover-trigger mb-6">
              <Image
                src="/images/logo.png"
                alt="Maaef Logo"
                width={120}
                height={40}
                className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-gray-400 text-sm md:text-base max-w-sm font-light leading-relaxed border-l-2 border-red pl-4">
              We engineer attention.
              <br />A new-era media house.
            </p>
          </div>

          <div>
            <h3 className="serif text-white text-lg mb-6 tracking-wide opacity-90">Navigation</h3>
            <ul className="space-y-4 text-xs tracking-[0.2em] uppercase list-none p-0">
              <li>
                <Link href="/" className="text-gray-500 hover:text-white transition duration-300 hover-trigger inline-block no-underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-500 hover:text-white transition duration-300 hover-trigger inline-block no-underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="/work" className="text-gray-500 hover:text-white transition duration-300 hover-trigger inline-block no-underline">
                  Work
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-500 hover:text-white transition duration-300 hover-trigger inline-block no-underline">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-white transition duration-300 hover-trigger inline-block no-underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="serif text-white text-lg mb-6 tracking-wide opacity-90">Connect</h3>
            <ul className="space-y-4 text-xs tracking-[0.2em] uppercase list-none p-0">
              <li>
                <a
                  href="https://www.instagram.com/maaef.media"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-red-500 transition duration-300 hover-trigger inline-block no-underline"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/showcase/maaef-media/about/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-red-500 transition duration-300 hover-trigger inline-block no-underline"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-500 hover:text-white transition duration-300 hover-trigger inline-block no-underline"
                >
                  Blogs
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/contact"
                  className="text-red hover:text-red-500 transition duration-300 hover-trigger inline-block font-bold no-underline"
                >
                  Start Project
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Skewed Ribbon CTA */}
      <div
        ref={ctaRef}
        id="cta-block"
        className="footer-cta-hover relative w-full flex justify-center items-center h-[24vh] md:h-[44vh] bg-[#030303] border-y border-white/[.05] mb-8 overflow-hidden group cursor-pointer"
        onClick={() => router.push("/contact")}
        onMouseEnter={() => {
          if (typeof (window as any).positionMaaefStripes === "function") {
            (window as any).positionMaaefStripes();
          }
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(3,3,3,0.95)_100%)]" />

        <h2 className="maaef-footer-title serif text-[15vw] md:text-[11vw] leading-none text-transparent tracking-tighter transition-all duration-500 relative z-50 [-webkit-text-stroke:2px_#C41E3A] group-hover:text-black group-hover:[-webkit-text-stroke:2px_#C41E3A]">
          Maaef.
        </h2>

        {/* Skewed Ribbon Tapes */}
        <div className="concept-tape ct-1" data-start="0,-7.5" data-end="74,105">
          <div className="w-full bg-[#dc2626] py-2 shadow-[0_0_40px_rgba(220,38,38,0.5)]">
            <div
              className="marquee-content gap-8 text-white font-bold serif text-[10px] md:text-lg tracking-[0.3em]"
              style={{ animation: "slideRight 30s linear infinite" }}
            >
              <span>LET'S TALK</span>
              <span className="opacity-50 text-black">///</span>
              <span>START PROJECT</span>
              <span className="opacity-50 text-black">///</span>
              <span>LET'S TALK</span>
              <span className="opacity-50 text-black">///</span>
              <span>START PROJECT</span>
              <span className="opacity-50 text-black">///</span>
              <span>LET'S TALK</span>
              <span className="opacity-50 text-black">///</span>
              <span>START PROJECT</span>
              <span className="opacity-50 text-black">///</span>
            </div>
          </div>
        </div>

        <div className="concept-tape ct-2" data-start="2,45.5" data-end="86,-5.5">
          <div className="w-full bg-[#050505] py-1.5 border-y border-[#c0251a]">
            <div
              className="marquee-content gap-8 font-bold serif text-[10px] md:text-lg tracking-[0.3em]"
              style={{ color: "#dc2626", animation: "slideLeft 35s linear infinite" }}
            >
              <span>WAITING FOR YOU</span>
              <span className="opacity-30 text-white">///</span>
              <span>GET IN TOUCH</span>
              <span className="opacity-30 text-white">///</span>
              <span>WAITING FOR YOU</span>
              <span className="opacity-30 text-white">///</span>
              <span>GET IN TOUCH</span>
              <span className="opacity-30 text-white">///</span>
              <span>WAITING FOR YOU</span>
              <span className="opacity-30 text-white">///</span>
              <span>GET IN TOUCH</span>
              <span className="opacity-30 text-white">///</span>
            </div>
          </div>
        </div>

        <div className="concept-tape ct-3" data-start="2,56" data-end="96,80">
          <div className="w-full bg-[#dc2626] py-2 shadow-[0_0_40px_rgba(220,38,38,0.5)]">
            <div
              className="marquee-content gap-8 text-white font-bold serif text-[10px] md:text-lg tracking-[0.3em]"
              style={{ animation: "slideRight 32s linear infinite" }}
            >
              <span>START PROJECT</span>
              <span className="opacity-50 text-black">///</span>
              <span>LET'S TALK</span>
              <span className="opacity-50 text-black">///</span>
              <span>START PROJECT</span>
              <span className="opacity-50 text-black">///</span>
              <span>LET'S TALK</span>
              <span className="opacity-50 text-black">///</span>
              <span>START PROJECT</span>
              <span className="opacity-50 text-black">///</span>
              <span>LET'S TALK</span>
              <span className="opacity-50 text-black">///</span>
            </div>
          </div>
        </div>

        <div className="concept-tape ct-4" data-start="2,92" data-end="96,18">
          <div className="w-full bg-[#050505] py-1.5 border-y border-[#c0251a]">
            <div
              className="marquee-content gap-8 font-bold serif text-[10px] md:text-lg tracking-[0.3em]"
              style={{ color: "#dc2626", animation: "slideLeft 28s linear infinite" }}
            >
              <span>GET IN TOUCH</span>
              <span className="opacity-30 text-white">///</span>
              <span>WAITING FOR YOU</span>
              <span className="opacity-30 text-white">///</span>
              <span>GET IN TOUCH</span>
              <span className="opacity-30 text-white">///</span>
              <span>WAITING FOR YOU</span>
              <span className="opacity-30 text-white">///</span>
              <span>GET IN TOUCH</span>
              <span className="opacity-30 text-white">///</span>
              <span>WAITING FOR YOU</span>
              <span className="opacity-30 text-white">///</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-2">
          <span className="text-[10px] uppercase tracking-widest text-white/25">
            © {new Date().getFullYear()} Maaef Media House
          </span>

          <a
            href="https://dev-folio-wine.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-widest hover:text-white transition duration-300 hover-trigger group flex items-center gap-2 no-underline text-white/30"
          >
            Made with{" "}
            <span className="text-red group-hover:scale-125 transition-transform duration-300 inline-block">
              &#10084;
            </span>{" "}
            &amp; Coffee by Humans
          </a>

          <div className="flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-widest text-white/25">Lucknow, IN</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-[10px] uppercase tracking-widest hover:text-white transition cursor-pointer hover-trigger border-none bg-transparent text-white/25 focus:outline-none"
            >
              &#8593; Top
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        @keyframes slideLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .concept-tape {
          position: absolute;
          display: flex;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.6s ease, filter 0.6s ease, clip-path 0.8s cubic-bezier(0.7, 0, 0.3, 1);
          filter: blur(4px);
          transform-origin: 0% 50%;
          overflow: hidden;
          will-change: transform, clip-path;
        }
        .footer-cta-hover:hover .concept-tape {
          opacity: 0.95;
          filter: blur(0px);
          clip-path: inset(0 0 0 0);
        }
        .marquee-content {
          display: flex;
          width: max-content;
        }

        .ct-1 {
          z-index: 13;
          clip-path: inset(0 100% 0 0);
        }
        .ct-2 {
          z-index: 11;
          clip-path: inset(0 0 0 100%);
        }
        .ct-3 {
          z-index: 12;
          clip-path: inset(0 100% 0 0);
        }
        .ct-4 {
          z-index: 10;
          clip-path: inset(0 0 0 100%);
        }

        @media (max-width: 1023px) {
          .concept-tape {
            opacity: 0.95 !important;
            filter: blur(0px) !important;
            clip-path: inset(0 0 0 0) !important;
          }
        }
        @media (pointer: coarse) {
          .concept-tape {
            opacity: 0.95 !important;
            filter: blur(0px) !important;
            clip-path: inset(0 0 0 0) !important;
          }
        }

        .footer-cta-hover:hover .maaef-footer-title {
          animation: none !important;
          color: black !important;
          text-shadow: none !important;
        }
        @media (max-width: 767px) {
          .marquee-content {
            font-size: 10px !important;
          }
          .concept-tape > div {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
          }
        }
      `}</style>
    </footer>
  );
}
