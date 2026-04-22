"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { RefundButton } from "@/components/bounty/refund-button";
import { SubmissionList } from "@/components/bounty/submission-list";
import { SubmitWorkForm } from "@/components/bounty/submit-work-form";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { appConfig } from "@/lib/config";
import { hasConfiguredContract } from "@/lib/contracts/openbounty";
import {
  formatAddress,
  formatAvax,
  formatFullDate,
  formatRelativeTime,
  getRepoName,
  isExpired,
} from "@/lib/format";
import { useBountyDetail } from "@/hooks/use-bounty-detail";

const SUBMISSIONS_PAGE_SIZE = 5;

export function BountyDetailView({ bountyId }: { bountyId: number }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const [submissionPage, setSubmissionPage] = useState(1);
  const { bountyQuery, submissionsQuery } = useBountyDetail(
    bountyId,
    submissionPage,
    SUBMISSIONS_PAGE_SIZE
  );

  if (!hasConfiguredContract()) {
    return (
      <section className="page-shell py-16 md:py-20">
        <EmptyState
          title="Bounty details are not ready yet"
          description="Deploy the app contract before loading live bounty details here."
        />
      </section>
    );
  }

  if (bountyQuery.isLoading || submissionsQuery.isLoading) {
    return (
      <section className="page-shell py-16 md:py-20">
        <LoadingCard className="h-[36rem]" />
      </section>
    );
  }

  if (bountyQuery.isError || !bountyQuery.data) {
    return (
      <section className="page-shell py-16 md:py-20">
        <EmptyState
          title="Bounty unavailable"
          description={
            (bountyQuery.error as Error | undefined)?.message ??
            "Failed to load bounty details."
          }
        />
      </section>
    );
  }

  if (submissionsQuery.isError || !submissionsQuery.data) {
    return (
      <section className="page-shell py-16 md:py-20">
        <EmptyState
          title="Submissions unavailable"
          description={
            (submissionsQuery.error as Error | undefined)?.message ??
            "Failed to load submissions."
          }
        />
      </section>
    );
  }

  const { bounty } = bountyQuery.data;
  const submissions = submissionsQuery.data;
  const expired =
    bounty.isOpen && !bounty.isCompleted && isExpired(bounty.deadline);
  const isCreator = Boolean(
    address && bounty.creator.toLowerCase() === address.toLowerCase()
  );
  const canApprove = Boolean(
    isCreator &&
    bounty.isOpen &&
    !bounty.isCompleted &&
    chainId === appConfig.chainId
  );
  const canRefund = Boolean(
    isCreator &&
    bounty.isOpen &&
    !bounty.isCompleted &&
    expired &&
    chainId === appConfig.chainId
  );
  const repoName = getRepoName(bounty.repoUrl);

  return (
    <section className="page-shell py-12 md:py-16">
      <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/bounties" className="hover:text-primary">
          Bounties
        </Link>
        <span>/</span>
        <span className="truncate">{repoName}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] xl:gap-14">
        <div>
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <StatusBadge
                isCompleted={bounty.isCompleted}
                isOpen={bounty.isOpen}
                expired={expired}
              />
              <span className="text-sm text-on-surface-variant">
                {bounty.deadline
                  ? `Deadline ${formatRelativeTime(bounty.deadline)}`
                  : "No deadline set"}
              </span>
            </div>
            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-on-surface md:text-5xl">
              {bounty.description}
            </h1>
          </div>

          <div className="mb-12 grid gap-6 rounded-3xl bg-surface-container-low p-8 md:grid-cols-3">
            {[
              ["Reward", `${formatAvax(bounty.reward)} AVAX`],
              ["Deadline", formatFullDate(bounty.deadline)],
              [
                "Status",
                bounty.isCompleted ? "Completed" : expired ? "Expired" : "Open",
              ],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={
                  index === 0
                    ? ""
                    : "md:border-l md:border-outline-variant/20 md:pl-6"
                }
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  {label}
                </p>
                <p className="mt-2 font-headline text-2xl font-bold text-on-surface">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-12">
            <div>
              <h2 className="mb-6 text-xl font-bold text-on-surface">
                Overview
              </h2>
              <div className="space-y-4 text-base leading-8 text-on-surface-variant">
                <p>{bounty.description}</p>
                <p>
                  Repository issue:{" "}
                  <a
                    href={bounty.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tertiary hover:underline break-all"
                  >
                    {bounty.repoUrl}
                  </a>
                </p>
                <p>
                  Created by:{" "}
                  <span className="text-on-surface">
                    {formatAddress(bounty.creator, 6)}
                  </span>
                </p>
                {bounty.isCompleted ? (
                  <p>
                    Winner:{" "}
                    <span className="text-on-surface">
                      {formatAddress(bounty.winner, 6)}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="editorial-card overflow-hidden">
              <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_17rem]">
                <div className="p-8">
                  <h2 className="mb-4 text-xl font-bold text-on-surface">
                    What happens next
                  </h2>
                  <ul className="space-y-4 text-on-surface-variant">
                    <li>
                      Contributors can submit a pull request link while the
                      bounty is open.
                    </li>
                    <li>
                      The creator reviews submissions and chooses the one they
                      want to reward.
                    </li>
                    <li>
                      If the deadline passes without an approval, the creator
                      can refund the bounty.
                    </li>
                  </ul>
                </div>
                <div className="bg-surface-container-low p-8">
                  <div className="rounded-[1.75rem] bg-surface-container-lowest p-6 ring-1 ring-outline-variant/20">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                      Reward
                    </p>
                    <p className="mt-3 font-headline text-5xl font-extrabold text-primary">
                      {formatAvax(bounty.reward)}
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      Paid to the selected contributor
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                    Submissions
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {submissions.total} submission
                    {submissions.total === 1 ? "" : "s"} so far
                  </p>
                </div>
              </div>
              <SubmissionList
                bountyId={bountyId}
                submissions={submissions}
                canApprove={canApprove}
                isCreator={isCreator}
                onPreviousPage={() =>
                  setSubmissionPage((current) => Math.max(1, current - 1))
                }
                onNextPage={() =>
                  setSubmissionPage((current) =>
                    Math.min(submissions.totalPages, current + 1)
                  )
                }
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="editorial-card p-8 shadow-[0px_12px_32px_rgba(123,83,45,0.08)]">
            <h2 className="text-xl font-bold tracking-tight text-on-surface">
              Bounty details
            </h2>
            <div className="mt-6 space-y-5">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  Repository
                </p>
                <div className="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface break-all">
                  {repoName}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  Role
                </p>
                <div className="flex flex-wrap gap-2">
                  {isCreator ? (
                    <span className="rounded-full bg-primary-fixed px-3 py-1 text-sm font-medium text-primary">
                      Your bounty
                    </span>
                  ) : null}
                  {!isCreator ? (
                    <span className="rounded-full bg-surface-container-high px-3 py-1 text-sm font-medium text-on-surface">
                      Contributor view
                    </span>
                  ) : null}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  Creator wallet
                </p>
                <div className="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  {formatAddress(bounty.creator, 6)}
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <SubmitWorkForm
                bountyId={bountyId}
                disabled={!bounty.isOpen || bounty.isCompleted}
                isCreator={isCreator}
              />
              {canRefund ? <RefundButton bountyId={bountyId} /> : null}
              {isCreator ? (
                <p className="text-sm text-on-surface-variant">
                  As the creator, you can review submissions below, choose the
                  winner, or refund the bounty after the deadline.
                </p>
              ) : null}
              {!isCreator && address ? (
                <p className="text-sm text-on-surface-variant">
                  Only the bounty creator can choose the winner or trigger
                  refunds.
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
