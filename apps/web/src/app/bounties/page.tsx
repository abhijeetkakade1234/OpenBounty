"use client";

import Link from "next/link";
import { useState } from "react";
import { BountyCard } from "@/components/bounty/bounty-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { hasConfiguredContract } from "@/lib/contracts/openbounty";
import { useBounties } from "@/hooks/use-bounties";

const PAGE_SIZE = 6;

export default function BountiesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useBounties(page, PAGE_SIZE);

  return (
    <section className="page-shell py-16 md:py-20">
      <div className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Browse bounties
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight text-on-background">
            Marketplace bounties
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-on-surface-variant">
            Explore open work, review completed rewards, and find the bounties
            that match the kind of contributions you want to make.
          </p>
        </div>
        <div className="soft-panel grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-headline text-3xl font-extrabold text-primary">
              {data?.total ?? 0}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
              Total
            </p>
          </div>
          <div>
            <p className="font-headline text-3xl font-extrabold text-on-surface">
              {data?.items.filter(
                (bounty) => bounty.isOpen && !bounty.isCompleted
              ).length ?? 0}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
              This page
            </p>
          </div>
          <div>
            <p className="font-headline text-3xl font-extrabold text-tertiary">
              {data?.items.filter((bounty) => bounty.isCompleted).length ?? 0}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
              Completed
            </p>
          </div>
        </div>
      </div>

      {!hasConfiguredContract() ? (
        <EmptyState
          title="Marketplace not ready yet"
          description="Deploy the app contract before loading live bounties here."
        />
      ) : isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Unable to load bounties"
          description={(error as Error).message}
        />
      ) : data && data.items.length ? (
        <>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
          <PaginationControls
            page={data.page}
            totalPages={data.totalPages}
            canGoNext={data.page < data.totalPages}
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() =>
              setPage((current) => Math.min(data.totalPages, current + 1))
            }
          />
        </>
      ) : (
        <div className="editorial-card p-8">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">
            No bounties yet
          </h2>
          <p className="mt-3 max-w-xl text-on-surface-variant">
            No one has posted work yet. Create the first bounty and it will show
            up here as soon as it is published.
          </p>
          <Link href="/create" className="btn-primary mt-6">
            Create first bounty
          </Link>
        </div>
      )}
    </section>
  );
}
