"use client";

import { useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { appConfig } from "@/lib/config";
import {
  getFriendlyContractError,
  refundBounty,
} from "@/lib/contracts/openbounty";

export function RefundButton({ bountyId }: { bountyId: number }) {
  const queryClient = useQueryClient();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleRefund() {
    if (!walletClient || !isConnected || chainId !== appConfig.chainId) {
      setFeedback(
        `Connect the creator wallet on ${appConfig.chainLabel} before refunding.`
      );
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await refundBounty({ walletClient, bountyId });
      setFeedback("Bounty refunded successfully.");
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
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        className="btn-secondary w-full"
        disabled={isSubmitting}
        onClick={() => void handleRefund()}
      >
        {isSubmitting ? "Refunding..." : "Refund bounty"}
      </button>
      {feedback ? (
        <p className="mt-4 text-sm text-on-surface-variant">{feedback}</p>
      ) : null}
    </div>
  );
}
