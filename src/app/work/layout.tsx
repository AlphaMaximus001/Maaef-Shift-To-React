import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Selected Work & Case Studies",
  description:
    "Explore how Maaef Group delivers strategy, production, and performance across restaurant, real estate, hospitality, and government sectors from Lucknow, India.",
  path: "/work",
});

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
