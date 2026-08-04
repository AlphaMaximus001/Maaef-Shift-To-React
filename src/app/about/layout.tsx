import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Maaef Group",
  description:
    "Maaef Group is a Lucknow-based sovereign collective operating across four arms — Maaef Media House, Maaef Studios, Maaef Afterhours, and Maaef Enterprises Pvt Ltd. Grounded in Attention, Precision, Trust, and Time.",
  path: "/about",
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
