"use client";

import { RefObject, useEffect, useRef, useState } from "react";

type Options = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Small, heavily compressed tier. Rendered first so a frame appears early. */
  lowSrc: string;
  /** Full quality tier, fetched in the background and swapped in when ready. */
  highSrc: string;
};

/** Data Saver is an explicit request not to spend bandwidth, so honour it. */
function saveDataEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return Boolean(connection?.saveData);
}

/**
 * Two-tier video loading, in the spirit of a streaming player's auto mode: the
 * low tier plays immediately, the high tier downloads behind it, and playback
 * moves across at the same timestamp once the high tier can play through.
 *
 * This is not adaptive bitrate streaming. There is no manifest and no segment
 * switching — it is one swap between two complete files, so the upgrade costs
 * the low tier's bytes on top of the high tier's. That is the trade: a frame
 * within a second or so instead of waiting out the full-quality download.
 *
 * Returns the src the element should render. The caller keeps the low tier in
 * its server-rendered markup, so the first frame does not wait for hydration.
 */
export function useProgressiveVideo({ videoRef, lowSrc, highSrc }: Options): string {
  const [src, setSrc] = useState(lowSrc);
  const [loadedPair, setLoadedPair] = useState(lowSrc);
  /** Timestamp captured from the low tier, restored once the high tier loads. */
  const resumeAtRef = useRef(0);

  // A new pair (the /work dial switching brands) restarts at the low tier.
  // Adjusted during render rather than in an effect so the element never gets
  // a frame pointed at the previous brand's source.
  if (loadedPair !== lowSrc) {
    setLoadedPair(lowSrc);
    setSrc(lowSrc);
    // resumeAtRef needs no reset here: onReady always writes a fresh timestamp
    // before the upgrade effect reads it.
  }

  // Warm the high tier in a detached element. Loading it here rather than
  // swapping the visible element straight away keeps the swap short: by the
  // time the src changes the file is already in the media cache.
  useEffect(() => {
    if (src !== lowSrc || saveDataEnabled()) return;

    const preloader = document.createElement("video");
    preloader.preload = "auto";
    preloader.muted = true;
    // Some browsers will not buffer a video that was never in the document.
    preloader.style.display = "none";

    const onReady = () => {
      resumeAtRef.current = videoRef.current?.currentTime ?? 0;
      setSrc(highSrc);
    };

    preloader.addEventListener("canplaythrough", onReady, { once: true });
    preloader.src = highSrc;
    document.body.appendChild(preloader);
    preloader.load();

    return () => {
      preloader.removeEventListener("canplaythrough", onReady);
      preloader.removeAttribute("src");
      preloader.load();
      preloader.remove();
    };
  }, [src, lowSrc, highSrc, videoRef]);

  // After the swap, pick playback back up where the low tier had reached.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || src !== highSrc) return;

    const resumeAt = resumeAtRef.current;
    const restore = () => {
      if (resumeAt > 0 && Number.isFinite(video.duration)) {
        try {
          video.currentTime = resumeAt % video.duration;
        } catch {
          // A seek can throw if the element was torn down mid-swap; the video
          // simply restarts from the beginning, which is fine for a loop.
        }
      }
      video.play().catch(() => {});
    };

    if (video.readyState >= 1) restore();
    else video.addEventListener("loadedmetadata", restore, { once: true });

    return () => video.removeEventListener("loadedmetadata", restore);
  }, [src, highSrc, videoRef]);

  return src;
}
