import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maaef Group",
    short_name: "Maaef",
    description:
      "Maaef Group is a Lucknow-based sovereign collective operating across 4 arms: Maaef Media House, Maaef Studios, Maaef Afterhours, and Maaef Enterprises Pvt Ltd.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      {
        src: "/favicon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
