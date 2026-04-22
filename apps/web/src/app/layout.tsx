import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WalletRouteGate } from "@/components/layout/wallet-route-gate";
import { AppProvider } from "@/components/providers/app-provider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenBounty",
  description:
    "A cleaner place to fund open source issues and reward great work.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <AppProvider>
          <div className="min-h-screen bg-surface text-on-background">
            <SiteHeader />
            <WalletRouteGate>{children}</WalletRouteGate>
            <SiteFooter />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
