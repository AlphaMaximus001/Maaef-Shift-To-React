"use client";

import { useEffect } from "react";

export default function StudioActiveHandler() {
  useEffect(() => {
    document.body.classList.add("sanity-studio-active");
    // Also disable global browser-custom selections on studio elements to preserve admin input states
    document.body.classList.add("select-text");
    document.body.classList.remove("select-none");

    return () => {
      document.body.classList.remove("sanity-studio-active");
      document.body.classList.remove("select-text");
      document.body.classList.add("select-none");
    };
  }, []);

  return null;
}
