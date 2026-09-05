"use client";

import { useEffect, useState } from "react";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

/** effectiveType values we treat as too constrained for a background video. */
const SLOW_EFFECTIVE_TYPES = ["slow-2g", "2g", "3g"];

function readConnection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  const nav = navigator as Navigator & {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

/**
 * True only when the browser positively reports a constrained connection —
 * Data Saver enabled, or an effective type of 3g or worse.
 *
 * Deliberately starts false and only flips after mount. The videos keep their
 * src in the server-rendered HTML so playback still starts immediately for the
 * common case; on a slow connection the source is dropped a moment later and
 * the poster takes over, costing a few wasted KB rather than several minutes
 * of buffering. Safari and Firefox do not implement the Network Information
 * API, so an absent reading means "assume a good connection" and nothing
 * changes for those visitors.
 */
export function useSlowConnection(): boolean {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const connection = readConnection();
    if (!connection) return;

    const evaluate = () =>
      setIsSlow(
        Boolean(connection.saveData) ||
          SLOW_EFFECTIVE_TYPES.includes(connection.effectiveType ?? "")
      );

    evaluate();
    connection.addEventListener?.("change", evaluate);
    return () => connection.removeEventListener?.("change", evaluate);
  }, []);

  return isSlow;
}
