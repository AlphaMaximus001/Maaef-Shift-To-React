import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Services & Capabilities",
  description:
    "End-to-end capabilities across Maaef Group: Performance Marketing, Short-form Video, LLMO, Print & Visual Production (Maaef Studios), Community Networking (Afterhours), and GeM Government Procurement (Maaef Enterprises).",
  path: "/services",
});

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
