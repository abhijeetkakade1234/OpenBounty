"use client";

import { useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { appConfig } from "@/lib/config";
import {
  approveSubmission,
  getFriendlyContractError,
} from "@/lib/contracts/openbounty";
import { formatAddress, formatFullDate } from "@/lib/format";
import type { PaginatedResult, Submission } from "@/lib/types";

export function SubmissionList({
  bountyId,
  submissions,
  canApprove,
  isCreator,
  onPreviousPage,
  onNextPage,
}: {
  bountyId: number;
  submissions: PaginatedResult<Submission>;
  canApprove: boolean;
  isCreator?: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  const queryClient = useQueryClient();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingSubmissionIndex, setPendingSubmissionIndex] = useState<
    number | null
  >(null);

  async function handleApprove(absoluteSubmissionIndex: number) {
    if (!walletClient || !isConnected || chainId !== appConfig.chainId) {
      setFeedback(
        `Connect the creator wallet on ${appConfig.chainLabel} before choosing a winner.`
      );
      return;
    }

    setPendingSubmissionIndex(absoluteSubmissionIndex);
    setFeedback(null);

    try {
      await approveSubmission({
        walletClient,
        bountyId,
        submissionIndex: absoluteSubmissionIndex,
      });
      setFeedback(
        `Submission ${absoluteSubmissionIndex + 1} selected as the winner.`
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["bounty", bountyId] }),
        queryClient.invalidateQueries({
          queryKey: ["bounty-submissions", bountyId],
        }),
        queryClient.invalidateQueries({ queryKey: ["bounties"] }),
      ]);
    } catch (error) {
      setFeedback(getFriendlyContractError(error));
    } finally {
      setPendingSubmissionIndex(null);
    }
  }

  if (!submissions.items.length) {
    return (
      <div className="editorial-card p-6 text-sm text-on-surface-variant">
        No submissions yet. Contributors can add PR links here once work is
        ready.
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {submissions.items.map((submission, relativeIndex) => {
          const absoluteIndex =
            (submissions.page - 1) * submissions.pageSize + relativeIndex;
          return (
            <div
              key={`${submission.submitter}-${submission.timestamp}-${absoluteIndex}`}
              className="editorial-card p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                    Submission {absoluteIndex + 1}
                  </p>
                  <a
                    href={submission.prLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-bold tracking-tight text-tertiary hover:underline"
                  >
                    {submission.prLink}
                  </a>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-on-surface-variant">
                    <span>
                      Contributor: {formatAddress(submission.submitter, 5)}
                    </span>
                    <span>{formatFullDate(submission.timestamp)}</span>
                  </div>
                </div>
                {canApprove ? (
                  <button
                    className="btn-primary"
                    onClick={() => void handleApprove(absoluteIndex)}
                    disabled={pendingSubmissionIndex === absoluteIndex}
                  >
                    {pendingSubmissionIndex === absoluteIndex
                      ? "Selecting..."
                      : "Choose winner"}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <PaginationControls
        page={submissions.page}
        totalPages={submissions.totalPages}
        canGoNext={submissions.page < submissions.totalPages}
        onPrevious={onPreviousPage}
        onNext={onNextPage}
      />
      {isCreator && submissions.items.length ? (
        <p className="mt-4 text-sm text-on-surface-variant">
          Choose the submission you want to reward. This closes the bounty and
          sends the payout to that contributor.
        </p>
      ) : null}
      {feedback ? (
        <p className="mt-4 text-sm text-on-surface-variant">{feedback}</p>
      ) : null}
    </div>
  );
}
