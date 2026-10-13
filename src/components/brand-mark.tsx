// Shared mark for icon.tsx / apple-icon.tsx / opengraph-image.tsx. Not a
// real app component — just JSX that Satori (next/og's renderer) can draw,
// so it has to stick to the subset of HTML/SVG Satori supports and plain
// inline styles (no Tailwind classes, no hooks).
//
// The path data is lucide-react's "Languages" icon (the same one used in
// the actividades header) lifted verbatim from its source, redrawn in
// white on the brand-red Hinomaru circle instead of lucide's component.
export function BrandMark({ size }: { size: number }) {
  const glyphSize = size * 0.56;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: "#c1272d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={glyphSize}
        height={glyphSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fafaf9"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
    </div>
  );
}
