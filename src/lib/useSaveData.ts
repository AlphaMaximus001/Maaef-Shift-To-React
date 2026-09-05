"use client";

import { useEffect, useState } from "react";

type NetworkInformation = {
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

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
 * True when the visitor has Data Saver turned on — an explicit request not to
 * spend their bandwidth, so the decorative video is skipped entirely and the
 * poster stands in.
 *
 * Slow connections are no longer handled by withholding video: the two-tier
 * loading in useProgressiveVideo starts on a much smaller file instead, which
 * gives them a moving picture rather than a still one. Browsers without the
 * Network Information API report false and are unaffected.
 */
export function useSaveData(): boolean {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const connection = readConnection();
    if (!connection) return;

    const evaluate = () => setSaveData(Boolean(connection.saveData));
    evaluate();
    connection.addEventListener?.("change", evaluate);
    return () => connection.removeEventListener?.("change", evaluate);
  }, []);

  return saveData;
}
