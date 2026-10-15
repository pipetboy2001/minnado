import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand-mark";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Next picks this up automatically for both og:image and (absent a
// twitter-image file) the Twitter card, which falls back to og:image
// when no twitter:image is present.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        background: "linear-gradient(135deg, #fafaf9 0%, #efe8de 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <BrandMark size={140} />
      <div
        style={{
          fontSize: 92,
          fontWeight: 700,
          color: "#18181b",
          letterSpacing: -2,
        }}
      >
        Minnado
      </div>
      <div style={{ fontSize: 32, color: "#52525b" }}>
        Aprende japonés N5 y N4 · basado en Minna no Nihongo
      </div>
    </div>,
    size,
  );
}
