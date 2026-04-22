"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { walletConnectProjectIdMissing } from "@/lib/config";

const links = [
  { href: "/bounties", label: "Bounties" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#trust", label: "Trust" },
  { href: "/create", label: "Create" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const { isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm">
      {walletConnectProjectIdMissing ? (
        <div className="bg-secondary-container px-4 py-2 text-center text-xs text-on-secondary-container">
          `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is not set. Core and
          WalletConnect need a valid project id in production.
        </div>
      ) : null}
      <nav className="page-shell flex items-center justify-between py-5">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="font-headline text-xl font-extrabold tracking-tight text-primary"
          >
            OpenBounty
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => {
              const active =
                !("external" in link) &&
                (pathname === link.href ||
                  (link.href !== "/" &&
                    pathname.startsWith(link.href) &&
                    !link.href.includes("#")));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target={"external" in link ? "_blank" : undefined}
                  rel={"external" in link ? "noreferrer" : undefined}
                  className={`text-sm font-medium transition ${active ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isConnected ? (
              <Link
                href="/profile"
                className={`text-sm font-medium transition ${pathname === "/profile" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
              >
                Profile
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onHome && !isConnected ? (
            <Link
              href="/create"
              className="btn-primary hidden px-5 py-2.5 md:inline-flex"
            >
              Get started
            </Link>
          ) : null}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="address"
          />
        </div>
      </nav>
    </header>
  );
}
