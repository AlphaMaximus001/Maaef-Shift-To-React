"use client";

import { MaaefProvider } from "@/context/MaaefContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <MaaefProvider>{children}</MaaefProvider>;
}
