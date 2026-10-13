import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS applies its own corner mask over whatever shape we give it, so the
// rounded-square background in BrandMark is harmless here.
export default function AppleIcon() {
  return new ImageResponse(<BrandMark size={180} />, size);
}
