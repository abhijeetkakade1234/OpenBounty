export function PaginationControls({
  page,
  totalPages,
  canGoNext,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      <button
        className="btn-ghost border border-outline-variant/20"
        onClick={onPrevious}
        disabled={page <= 1}
      >
        Previous
      </button>
      <div className="text-sm text-on-surface-variant">
        Page {page} of {totalPages}
      </div>
      <button
        className="btn-ghost border border-outline-variant/20"
        onClick={onNext}
        disabled={!canGoNext}
      >
        Next
      </button>
    </div>
  );
}
