import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Maaef Group | Attention, Precision, Trust, Time";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#050505",
          padding: "80px",
          fontFamily: "sans-serif",
          color: "#ffffff",
          position: "relative",
        }}
      >
        {/* Subtle border outline */}
        <div
          style={{
            position: "absolute",
            inset: "30px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            pointerEvents: "none",
          }}
        />

        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#e53e3e",
            }}
          >
            MAAEF GROUP
          </div>
          <div
            style={{
              fontSize: "14px",
              letterSpacing: "0.15em",
              color: "#a0aec0",
              textTransform: "uppercase",
            }}
          >
            Lucknow, India
          </div>
        </div>

        {/* Center Title & Positioning */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "900px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            Sovereign Collective
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#a0aec0",
              lineHeight: 1.4,
              fontWeight: 400,
            }}
          >
            Maaef Media House • Maaef Studios • Maaef Afterhours • Maaef Enterprises
          </div>
        </div>

        {/* Bottom Values Footer */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "30px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#718096",
            }}
          >
            Attention • Precision • Trust • Time
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#e53e3e",
              fontWeight: 600,
            }}
          >
            www.maaef.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
