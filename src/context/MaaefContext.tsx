"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface MaaefContextValue {
  isAudioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  toggleAudio: () => void;
  introCurrentTime: number | null;
  setIntroCurrentTime: (t: number | null) => void;
  userHasInteracted: boolean;
  setUserHasInteracted: (v: boolean) => void;
}

const MaaefContext = createContext<MaaefContextValue | null>(null);

export function useMaaef(): MaaefContextValue {
  const ctx = useContext(MaaefContext);
  if (!ctx) throw new Error("useMaaef must be used within <MaaefProvider>");
  return ctx;
}

export function MaaefProvider({ children }: { children: ReactNode }) {
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [introCurrentTime, setIntroCurrentTime] = useState<number | null>(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("maaef-muted");
    if (saved !== null) {
      setIsAudioMuted(saved === "true");
    }
  }, []);

  const setAudioMuted = useCallback((muted: boolean) => {
    setIsAudioMuted(muted);
    localStorage.setItem("maaef-muted", String(muted));
    // Dispatch for any remaining vanilla DOM listeners (e.g. video sync)
    window.dispatchEvent(new CustomEvent("audioChange"));
  }, []);

  const toggleAudio = useCallback(() => {
    setIsAudioMuted(prev => {
      const next = !prev;
      localStorage.setItem("maaef-muted", String(next));
      window.dispatchEvent(new CustomEvent("audioChange"));
      return next;
    });
  }, []);

  return (
    <MaaefContext.Provider
      value={{
        isAudioMuted,
        setAudioMuted,
        toggleAudio,
        introCurrentTime,
        setIntroCurrentTime,
        userHasInteracted,
        setUserHasInteracted,
      }}
    >
      {children}
    </MaaefContext.Provider>
  );
}
