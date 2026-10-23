export function LoadingSkeleton({ rows = 3, height = 120 }: { rows?: number; height?: number }) {
  return (
    <div className="grid grid--3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton" style={{ height }} />
      ))}
    </div>
  );
}
