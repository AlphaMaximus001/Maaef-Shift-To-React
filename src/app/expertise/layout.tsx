import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Areas of Expertise",
  description:
    "Integrated expertise in Growth Marketing, LLMO, High-Finish Print Production, 3D Product Visualizers, Founders Community Events, and GeM Government Bidding.",
  path: "/expertise",
});

export default function ExpertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
