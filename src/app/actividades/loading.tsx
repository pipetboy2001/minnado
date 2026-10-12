export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 animate-pulse p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-40 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="h-9 w-28 rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg border bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
