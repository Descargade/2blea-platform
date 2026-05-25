"use client";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/10 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="premium-card space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="premium-card p-0 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <Skeleton className="h-10 w-64" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
