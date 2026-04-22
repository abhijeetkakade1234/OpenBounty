"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { BountyCard } from "@/components/bounty/bounty-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { useCreatorBounties } from "@/hooks/use-creator-bounties";
import { hasConfiguredContract } from "@/lib/contracts/openbounty";
import { formatAddress } from "@/lib/format";

export default function ProfilePage() {
  const { address } = useAccount();
  const creatorBounties = useCreatorBounties(address);
  const items = creatorBounties.data ?? [];
  const openCount = items.filter(
    (bounty) => bounty.isOpen && !bounty.isCompleted
  ).length;
  const completedCount = items.filter((bounty) => bounty.isCompleted).length;

  return (
    <section className="page-shell py-16 md:py-20">
      <div className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Creator profile
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight text-on-background">
            Your bounties
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-on-surface-variant">
            Review the bounties you created, open each one to refund expired
            work, and select the winning submission when a contributor delivers.
          </p>
          {address ? (
            <p className="mt-4 text-sm text-on-surface-variant">
              Connected as {formatAddress(address, 6)}
            </p>
          ) : null}
        </div>
        <div className="soft-panel grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-headline text-3xl font-extrabold text-primary">
              {items.length}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
              Total
            </p>
          </div>
          <div>
            <p className="font-headline text-3xl font-extrabold text-on-surface">
              {openCount}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
              Open
            </p>
          </div>
          <div>
            <p className="font-headline text-3xl font-extrabold text-tertiary">
              {completedCount}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
              Completed
            </p>
          </div>
        </div>
      </div>

      {!hasConfiguredContract() ? (
        <EmptyState
          title="Contract not configured"
          description="Deploy the app contract before loading your creator workspace."
        />
      ) : creatorBounties.isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <LoadingCard key={key} />
          ))}
        </div>
      ) : creatorBounties.isError ? (
        <EmptyState
          title="Unable to load your bounties"
          description={(creatorBounties.error as Error).message}
        />
      ) : items.length ? (
        <>
          <div className="mb-8 rounded-3xl bg-surface-container-low p-6 text-sm leading-7 text-on-surface-variant">
            Open any bounty to manage it. If submissions exist, you can choose
            the winner there. If the deadline has passed and nothing is
            approved, you can refund it there too.
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {items.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        </>
      ) : (
        <div className="editorial-card p-8">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">
            No bounties created yet
          </h2>
          <p className="mt-3 max-w-xl text-on-surface-variant">
            You have not created a bounty from this wallet yet. Start one and it
            will appear here for management.
          </p>
          <Link href="/create" className="btn-primary mt-6">
            Create bounty
          </Link>
        </div>
      )}
    </section>
  );
}
