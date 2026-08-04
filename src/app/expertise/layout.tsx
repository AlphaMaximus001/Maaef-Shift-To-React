import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Expertise",
  description:
    "Maaef Media House's areas of expertise span creative direction, motion design, brand identity, photography, and digital strategy — built for brands ready to lead.",
  path: "/expertise",
});

export default function ExpertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
