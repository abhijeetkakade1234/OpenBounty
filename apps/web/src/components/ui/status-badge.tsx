export function StatusBadge({
  isCompleted,
  isOpen,
  expired,
}: {
  isCompleted: boolean;
  isOpen: boolean;
  expired?: boolean;
}) {
  if (isCompleted) {
    return (
      <span className="status-pill bg-tertiary/12 text-tertiary">
        Completed
      </span>
    );
  }

  if (expired) {
    return (
      <span className="status-pill bg-secondary-container text-on-secondary-container">
        Expired
      </span>
    );
  }

  if (isOpen) {
    return (
      <span className="status-pill bg-primary-fixed text-primary">Open</span>
    );
  }

  return (
    <span className="status-pill bg-surface-container-high text-on-surface-variant">
      Closed
    </span>
  );
}
