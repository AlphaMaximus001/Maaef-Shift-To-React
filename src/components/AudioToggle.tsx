"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AudioToggle() {
  const [isMuted, setIsMuted] = useState(true);
  const [showLabel, setShowLabel] = useState(true);
  const pathname = usePathname();
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Monitor scrolling of snap container to track active section index
  useEffect(() => {
    if (pathname !== "/") return;

    let el = document.getElementById("homepage");
    const handleScroll = () => {
      const currentEl = document.getElementById("homepage") || el;
      if (!currentEl) return;
      const scrollTop = currentEl.scrollTop;
      const height = currentEl.clientHeight || window.innerHeight;
      const index = Math.round(scrollTop / height);
      setActiveSectionIndex(index);
    };

    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    const observer = new MutationObserver(() => {
      const currentEl = document.getElementById("homepage");
      if (currentEl && currentEl !== el) {
        if (el) el.removeEventListener("scroll", handleScroll);
        el = currentEl;
        el.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [pathname]);

  // Load user preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("maaef-muted");
    if (saved !== null) {
      const parsedMute = saved === "true";
      setIsMuted(parsedMute);
      (window as any).isAudioMuted = parsedMute;
    } else {
      (window as any).isAudioMuted = true;
    }
    window.dispatchEvent(new CustomEvent("audioChange"));
  }, []);

  // Update label fade timers
  useEffect(() => {
    setShowLabel(true);
    const timer = setTimeout(() => {
      setShowLabel(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isMuted, pathname, activeSectionIndex]);

  // Sync mute state to all video tags on the page
  const syncDOMVideos = (mutedState: boolean) => {
    const introVideo = document.getElementById("intro-bg-video") as HTMLVideoElement;
    if (introVideo) {
      // Intro is active: ONLY sync the intro video and keep all other videos strictly muted
      introVideo.muted = mutedState;
      if (!mutedState) {
        if (introVideo.readyState === 0) {
          introVideo.load();
        }
        const playPromise = introVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
      
      const otherVideos = document.querySelectorAll("video:not(#intro-bg-video)");
      otherVideos.forEach(v => {
        (v as HTMLVideoElement).muted = true;
      });
    } else {
      // Intro is done: sync all videos normally, respecting local data-keep-muted settings
      const videos = document.querySelectorAll("video");
      videos.forEach(v => {
        const keepMuted = v.getAttribute("data-keep-muted") === "true";
        v.muted = keepMuted ? true : mutedState;
        if (!v.muted) {
          if (v.readyState === 0) {
            v.load();
          }
          const playPromise = v.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        }
      });
    }
  };

  // Re-sync videos whenever DOM changes (e.g. page mounts, slides switch)
  useEffect(() => {
    syncDOMVideos(isMuted);
    
    // Listen for custom slide audio requests
    const handleAudioChange = () => {
      const globalState = (window as any).isAudioMuted ?? true;
      if (globalState !== isMuted) {
        setIsMuted(globalState);
      }
      syncDOMVideos(globalState);
    };

    window.addEventListener("audioChange", handleAudioChange);

    // Setup an observer to auto-sync dynamically loaded pages or elements
    const observer = new MutationObserver(() => {
      syncDOMVideos((window as any).isAudioMuted ?? true);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("audioChange", handleAudioChange);
      observer.disconnect();
    };
  }, [isMuted, pathname]);

  const toggleAudio = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    (window as any).isAudioMuted = nextState;
    localStorage.setItem("maaef-muted", String(nextState));
    window.dispatchEvent(new CustomEvent("audioChange"));
  };

  const isButtonMuted = isMuted || activeSectionIndex !== 0;

  if (pathname !== "/") return null;

  return (
    <div
      id="global-audio-toggle"
      onClick={toggleAudio}
      className="fixed z-[600] flex items-center gap-3 cursor-pointer py-2 transition-all duration-300 select-none hover-trigger"
      style={{
        bottom: "calc(var(--hud-offset-y) + 80px)",
        right: "var(--content-px)",
      }}
    >
      <span
        id="mute-label"
        className="maaef-mono text-[12px] text-white tracking-[0.1em] transition-opacity duration-500 pointer-events-none"
        style={{
          opacity: showLabel ? 1 : 0,
        }}
      >
        {isButtonMuted ? "AUDIO OFF" : "AUDIO ON"}
      </span>
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill={isButtonMuted ? "none" : "#7a0e0e"}
        stroke={isButtonMuted ? "#fff" : "#7a0e0e"}
        strokeWidth="2"
        id="mute-icon"
        style={{
          transition: "all 0.3s",
        }}
      >
        <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
        {isButtonMuted ? (
          <path id="mute-cross" d="M23 9l-6 6M17 9l6 6" strokeLinecap="round" strokeLinejoin="round" stroke="#fff" />
        ) : (
          <path id="mute-waves" d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" strokeLinejoin="round" stroke="#7a0e0e" />
        )}
      </svg>
    </div>
  );
}
