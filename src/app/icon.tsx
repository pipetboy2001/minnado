import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// A plain red circle on a warm off-white backdrop — the Hinomaru motif,
// instantly readable even at 16x16. Pure CSS shapes, no text: Satori (the
// renderer behind ImageResponse) only ships a Latin font by default, so
// anything needing real kanji would need a bundled font file to avoid
// rendering as blank boxes. Shapes sidestep that entirely.
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafaf9",
        borderRadius: 14,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "#c1272d",
        }}
      />
    </div>,
    size,
  );
}
