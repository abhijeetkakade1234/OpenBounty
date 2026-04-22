"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BountyCard } from "@/components/bounty/bounty-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { hasConfiguredContract } from "@/lib/contracts/openbounty";
import { formatAvax } from "@/lib/format";
import { useBounties } from "@/hooks/use-bounties";

const FEATURED_PAGE_SIZE = 3;

export default function HomePage() {
  const [page] = useState(1);
  const { data, isLoading, isError, error } = useBounties(
    page,
    FEATURED_PAGE_SIZE
  );
  const featured = useMemo(() => data?.items ?? [], [data]);
  const spotlight = featured[0];

  return (
    <>
      <section className="page-shell grid gap-16 py-20 md:grid-cols-[minmax(0,1fr)_32rem] md:py-24">
        <div className="space-y-8">
          <div className="inline-flex rounded-full bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            The digital archive of open source work
          </div>
          <div className="space-y-6">
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-on-background md:text-7xl">
              Get paid for fixing{" "}
              <span className="text-primary">open source issues</span>
            </h1>
            <p className="max-w-xl text-lg leading-8 text-on-surface-variant">
              OpenBounty gives maintainers a cleaner way to fund important
              issues and gives contributors a direct path to submit work, earn
              rewards, and build proof of impact.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/create" className="btn-primary px-8 py-4 text-base">
              Create bounty
            </Link>
            <Link
              href="/bounties"
              className="btn-ghost rounded-xl border border-outline-variant/20 px-8 py-4 text-base"
            >
              View bounties
            </Link>
          </div>
          <div className="grid max-w-3xl gap-5 pt-6 md:grid-cols-3">
            {[
              [
                "Fund work with confidence",
                "Each bounty starts with the reward already committed, so contributors can see the payout is real before they begin.",
              ],
              [
                "Review stays organized",
                "Every pull request submission stays attached to the bounty, so maintainers can compare work without losing context.",
              ],
              [
                "Reward the best solution",
                "Once a creator approves a submission, the payout is released directly without extra negotiation or paperwork.",
              ],
            ].map(([title, text]) => (
              <div key={title} className="soft-panel">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  {title}
                </p>
                <p className="text-sm leading-6 text-on-surface">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="editorial-card p-8 shadow-[0px_12px_32px_rgba(123,83,45,0.08)]">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-bold text-on-background"
                  title={
                    spotlight
                      ? spotlight.repoUrl.replace(/^https?:\/\//, "")
                      : "github.com/facebook/react"
                  }
                >
                  {spotlight
                    ? spotlight.repoUrl.replace(/^https?:\/\//, "")
                    : "github.com/facebook/react"}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {spotlight
                    ? `Bounty #${spotlight.id}`
                    : "Featured opportunity"}
                </p>
              </div>
              <span className="status-pill w-fit shrink-0 bg-primary-fixed text-primary">
                Active
              </span>
            </div>
            <h2 className="mb-6 max-w-[24rem] text-3xl font-extrabold tracking-tight text-on-background">
              {spotlight?.description ??
                "Fix memory leak in concurrent rendering mode"}
            </h2>
            <div className="mb-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                <span>Reward already committed</span>
                <span className="text-outline">/</span>
                <span>
                  {spotlight
                    ? "Submission window open"
                    : "Manual PR submission"}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                <div className="h-full w-2/3 rounded-full bg-primary" />
              </div>
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-outline-variant/10 pt-6">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  Current bounty
                </p>
                <p className="font-headline text-5xl font-extrabold text-primary">
                  {spotlight ? formatAvax(spotlight.reward) : "2.45"}
                </p>
                <p className="text-sm text-on-surface-variant">
                  Reward ready for the winning submission
                </p>
              </div>
              <Link
                href={spotlight ? `/bounties/${spotlight.id}` : "/bounties"}
                className="btn-primary h-12 w-12 shrink-0 rounded-xl p-0 text-lg"
              >
                {">"}
              </Link>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 -z-10 h-full w-full rounded-[1.75rem] border border-outline-variant/30" />
        </div>
      </section>

      <section className="bg-surface-container-low py-20 md:py-24">
        <div className="page-shell">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                Marketplace feed
              </p>
              <h2 className="text-4xl font-extrabold tracking-tight text-on-background">
                Active bounties
              </h2>
            </div>
            <Link
              href="/bounties"
              className="text-sm font-bold text-primary hover:underline"
            >
              Browse all bounties
            </Link>
          </div>
          {!hasConfiguredContract() ? (
            <EmptyState
              title="Marketplace not ready yet"
              description="Deploy the app contract before loading live bounties here."
            />
          ) : isLoading ? (
            <div className="grid gap-8 md:grid-cols-3">
              {[0, 1, 2].map((key) => (
                <LoadingCard key={key} />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="Unable to load bounties"
              description={(error as Error).message}
            />
          ) : featured.length ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No bounties yet"
              description="No work has been posted yet. Create the first bounty and it will appear here right away."
            />
          )}
        </div>
      </section>

      <section id="how-it-works" className="page-shell py-20 md:py-24">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Workflow
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-background">
            How it works
          </h2>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {[
            [
              "01",
              "Create and fund",
              "Repository owners post an issue, set the reward, and fund the bounty up front so contributors can trust the opportunity.",
            ],
            [
              "02",
              "Submit a PR link",
              "Contributors attach a GitHub pull request URL to the bounty. Every submission stays visible so reviews stay organized.",
            ],
            [
              "03",
              "Approve and release",
              "The creator selects the winning solution and the payout is released directly, with refunds available after expiry.",
            ],
          ].map(([step, title, text]) => (
            <div key={step} className="space-y-5">
              <div className="font-headline text-7xl font-extrabold leading-none text-surface-container-high">
                {step}
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">
                {title}
              </h3>
              <p className="max-w-sm leading-7 text-on-surface-variant">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="trust"
        className="border-y border-outline-variant/10 bg-surface py-20 md:py-24"
      >
        <div className="page-shell text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-3xl font-bold text-primary">
              OB
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-background">
              Security in every payout path
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-8 text-on-surface-variant">
              Bounties are funded before work begins, submissions stay visible
              for review, and rewards move only after the creator approves the
              final result.
            </p>
            <div className="grid gap-4 pt-4 text-left md:grid-cols-3">
              {[
                [
                  "Visible funding",
                  "Contributors can see there is real value committed before they spend time solving the issue.",
                ],
                [
                  "Clear review trail",
                  "Every bounty keeps its submissions and approval history attached to a single record.",
                ],
                [
                  "Controlled release",
                  "Funds move only after approval, with a clear refund path once the deadline has passed.",
                ],
              ].map(([title, text]) => (
                <div key={title} className="soft-panel">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                    {title}
                  </p>
                  <p className="text-sm leading-6 text-on-surface">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-24 md:py-32">
        <div className="relative overflow-hidden rounded-[2rem] bg-surface-container px-8 py-16 text-center md:px-16 md:py-20">
          <div className="absolute top-0 right-0 text-[10rem] leading-none text-outline-variant/20">
            {"/ /"}
          </div>
          <div className="relative mx-auto max-w-2xl space-y-8">
            <h2 className="text-4xl font-extrabold tracking-tight text-on-background md:text-5xl">
              Ready to build the future?
            </h2>
            <p className="text-lg leading-8 text-on-surface-variant">
              Join the developers funding and solving meaningful open source
              work with a cleaner workflow from bounty creation to payout.
            </p>
            <div className="flex justify-center">
              <Link href="/create" className="btn-primary px-10 py-5 text-base">
                Start building
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
