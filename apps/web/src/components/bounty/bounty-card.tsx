import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatAvax,
  formatFullDate,
  getRepoName,
  isExpired,
} from "@/lib/format";
import type { Bounty } from "@/lib/types";

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const expired =
    bounty.isOpen && !bounty.isCompleted && isExpired(bounty.deadline);
  const repoName = getRepoName(bounty.repoUrl);

  return (
    <Link
      href={`/bounties/${bounty.id}`}
      className="editorial-card group block p-6 transition hover:-translate-y-0.5 hover:shadow-[0px_12px_32px_rgba(123,83,45,0.08)]"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold text-on-surface-variant"
            title={repoName}
          >
            {repoName}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
            #{bounty.id.toString().padStart(3, "0")}
          </p>
        </div>
        <div className="rounded-2xl bg-surface-container-low px-4 py-3 sm:text-right">
          <p className="font-headline text-2xl font-extrabold text-primary">
            {formatAvax(bounty.reward)}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
            AVAX
          </p>
        </div>
      </div>
      <h3 className="mb-4 line-clamp-2 text-xl font-bold tracking-tight text-on-surface">
        {bounty.description}
      </h3>
      <div className="mb-5 flex items-center justify-between gap-4">
        <StatusBadge
          isCompleted={bounty.isCompleted}
          isOpen={bounty.isOpen}
          expired={expired}
        />
        <span className="text-right text-sm text-on-surface-variant">
          {formatFullDate(bounty.deadline)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-container">
        <div
          className={`h-full rounded-full ${bounty.isCompleted ? "bg-tertiary" : expired ? "bg-secondary" : "bg-primary"}`}
          style={{
            width: bounty.isCompleted ? "100%" : expired ? "68%" : "84%",
          }}
        />
      </div>
    </Link>
  );
}
