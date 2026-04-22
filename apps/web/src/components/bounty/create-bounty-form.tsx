"use client";

import { useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { appConfig } from "@/lib/config";
import {
  createBounty,
  getFriendlyContractError,
  hasConfiguredContract,
} from "@/lib/contracts/openbounty";

const initialForm = {
  repoUrl: "",
  description: "",
  reward: "",
  deadline: "",
};

export function CreateBountyForm() {
  const queryClient = useQueryClient();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canSubmit = Boolean(
    walletClient &&
    isConnected &&
    chainId === appConfig.chainId &&
    hasConfiguredContract()
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!walletClient) {
      setFeedback("Connect a wallet before creating a bounty.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await createBounty({ walletClient, ...form });
      setForm(initialForm);
      setFeedback("Bounty created successfully.");
      await queryClient.invalidateQueries({ queryKey: ["bounties"] });
    } catch (error) {
      setFeedback(getFriendlyContractError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="editorial-card p-8 md:p-10">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Reward setup
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">
            Create a new bounty
          </h2>
        </div>
        <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          Reward stays committed until you choose a winner or refund it after
          the deadline.
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="field-label" htmlFor="repoUrl">
            Repository URL
          </label>
          <input
            id="repoUrl"
            required
            className="field-shell"
            placeholder="https://github.com/org/repo"
            value={form.repoUrl}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                repoUrl: event.target.value,
              }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <label className="field-label" htmlFor="description">
            Issue description
          </label>
          <textarea
            id="description"
            required
            className="field-shell min-h-36 resize-y"
            placeholder="Describe the issue, acceptance criteria, and expected outcome."
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </div>
        <div>
          <label className="field-label" htmlFor="reward">
            Reward (AVAX)
          </label>
          <input
            id="reward"
            required
            min="0"
            step="0.01"
            type="number"
            className="field-shell"
            placeholder="1.25"
            value={form.reward}
            onChange={(event) =>
              setForm((current) => ({ ...current, reward: event.target.value }))
            }
          />
        </div>
        <div>
          <label className="field-label" htmlFor="deadline">
            Deadline
          </label>
          <input
            id="deadline"
            type="datetime-local"
            className="field-shell"
            value={form.deadline}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                deadline: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-outline-variant/20 pt-6 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-on-surface-variant">
          {!hasConfiguredContract()
            ? "Deploy the app contract before creating live bounties."
            : !isConnected
              ? "Connect a wallet to submit this transaction."
              : chainId !== appConfig.chainId
                ? `Switch your wallet to ${appConfig.chainLabel} before creating a bounty.`
                : "The reward will be committed as soon as this bounty is created."}
        </div>
        <button
          className="btn-primary min-w-44"
          type="submit"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Create bounty"}
        </button>
      </div>

      {feedback ? (
        <p className="mt-4 text-sm text-on-surface-variant">{feedback}</p>
      ) : null}
    </form>
  );
}
