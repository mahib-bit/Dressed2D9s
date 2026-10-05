export function CardSkeleton() {
  return (
    <div className="c22-card overflow-hidden">
      <div className="skeleton aspect-[2/3] w-full rounded-b-none" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
