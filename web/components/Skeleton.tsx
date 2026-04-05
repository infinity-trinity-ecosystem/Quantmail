"use client";

export function SkeletonLine({ width = "100%", height = "14px" }: { width?: string; height?: string }) {
  return (
    <div
      className="rounded-md animate-pulse"
      style={{
        width,
        height,
        background: "rgba(255,255,255,0.06)",
      }}
    />
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} width={i === 0 ? "60%" : i === rows - 1 ? "40%" : "90%"} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={3} />
      ))}
    </div>
  );
}
