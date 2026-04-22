export function SiteFooter() {
  return (
    <footer className="bg-surface-container-low">
      <div className="page-shell flex flex-col items-center justify-between gap-5 py-10 text-sm text-on-surface-variant md:flex-row">
        <div>
          <div className="font-headline text-lg font-extrabold text-primary">
            OpenBounty
          </div>
          <p>The digital archive of open source work.</p>
        </div>
        <div className="flex gap-6">
          <a
            href="https://testnet.snowtrace.io"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            Snowtrace
          </a>
          <a
            href="https://github.com/abhijeetkakade1234/OpenBounty"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            GitHub
          </a>
          <a
            href="https://faucet.avax.network"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            Wallet funds
          </a>
        </div>
      </div>
    </footer>
  );
}
