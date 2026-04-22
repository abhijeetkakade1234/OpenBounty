"use client";

import { useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { appConfig } from "@/lib/config";
import {
  getFriendlyContractError,
  hasConfiguredContract,
  submitWork,
} from "@/lib/contracts/openbounty";

export function SubmitWorkForm({
  bountyId,
  disabled,
  isCreator,
}: {
  bountyId: number;
  disabled: boolean;
  isCreator?: boolean;
}) {
  const queryClient = useQueryClient();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [prLink, setPrLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const blockedReason = !hasConfiguredContract()
    ? "Contract address is not configured."
    : isCreator
      ? "You cannot apply to your own bounty."
      : !isConnected
        ? "Connect a wallet to submit work."
        : chainId !== appConfig.chainId
          ? `Switch your wallet to ${appConfig.chainLabel}.`
          : disabled
            ? "This bounty is no longer accepting submissions."
            : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!walletClient) {
      setFeedback("Connect a wallet before submitting work.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await submitWork({ walletClient, bountyId, prLink });
      setPrLink("");
      setFeedback("Submission added successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["bounty", bountyId] }),
        queryClient.invalidateQueries({
          queryKey: ["bounty-submissions", bountyId],
        }),
      ]);
    } catch (error) {
      setFeedback(getFriendlyContractError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="editorial-card p-6">
      <div className="mb-5">
        <h3 className="text-xl font-bold tracking-tight text-on-surface">
          Submit your PR
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          {isCreator
            ? "Creators manage submissions here but cannot submit to their own bounty."
            : "Share your pull request link to apply for this bounty."}
        </p>
      </div>
      <label className="field-label" htmlFor="prLink">
        Pull request URL
      </label>
      <input
        id="prLink"
        className="field-shell"
        placeholder="https://github.com/org/repo/pull/42"
        value={prLink}
        onChange={(event) => setPrLink(event.target.value)}
        required
      />
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-on-surface-variant">
          {blockedReason ??
            "Your submission appears here as soon as it is sent."}
        </p>
        <button
          className="btn-primary"
          type="submit"
          disabled={Boolean(blockedReason) || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit work"}
        </button>
      </div>
      {feedback ? (
        <p className="mt-4 text-sm text-on-surface-variant">{feedback}</p>
      ) : null}
    </form>
  );
}
