export function LoadingCard({ className = "h-64" }: { className?: string }) {
  return (
    <div
      className={`editorial-card animate-pulse bg-surface-container-lowest/80 ${className}`}
    />
  );
}
