export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 animate-pulse p-6">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="mt-2 mb-6 h-7 w-40 rounded bg-muted" />

      <div className="mb-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg border bg-muted/50" />
        ))}
      </div>
      <div className="mb-8 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg border bg-muted/50" />
        ))}
      </div>

      <div className="h-5 w-40 rounded bg-muted" />
      <div className="mt-3 flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
