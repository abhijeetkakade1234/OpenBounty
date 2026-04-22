export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="editorial-card p-8">
      <h2 className="text-2xl font-bold tracking-tight text-on-surface">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-on-surface-variant">{description}</p>
    </div>
  );
}
