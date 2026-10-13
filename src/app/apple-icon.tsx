import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same Hinomaru mark as icon.tsx, scaled up for iOS home-screen bookmarks.
// iOS applies its own corner mask, so this stays a plain filled square.
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafaf9",
      }}
    >
      <div
        style={{
          width: 104,
          height: 104,
          borderRadius: "50%",
          background: "#c1272d",
        }}
      />
    </div>,
    size,
  );
}
