import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Dispatches",
  description:
    "The Maaef writing space — essays, dispatches, and field notes from the studio floor on creativity, branding, culture, and what it means to engineer attention.",
  path: "/writingspace",
});

export default function WritingspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
