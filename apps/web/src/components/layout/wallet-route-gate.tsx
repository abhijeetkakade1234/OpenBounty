"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

export function WalletRouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isConnected, status } = useAccount();

  const isProtectedRoute = pathname !== "/";

  if (!isProtectedRoute) {
    return <>{children}</>;
  }

  if (status === "connecting" || status === "reconnecting") {
    return (
      <main className="flex-1">
        <section className="page-shell py-20 md:py-24">
          <div className="editorial-card mx-auto max-w-2xl p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              Checking wallet access
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-on-background">
              Loading protected workspace
            </h1>
          </div>
        </section>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="flex-1">
        <section className="page-shell py-20 md:py-24">
          <div className="editorial-card mx-auto max-w-2xl p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              Wallet required
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-on-background">
              Connect your wallet to continue
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-on-surface-variant">
              Marketplace pages stay private until a wallet is connected.
              Connect first, then you can browse bounties, open details, and
              create rewards.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <ConnectButton
                showBalance={false}
                chainStatus="icon"
                accountStatus="address"
              />
              <Link
                href="/"
                className="btn-ghost rounded-xl border border-outline-variant/20 px-6 py-3"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return <main className="flex-1">{children}</main>;
}
