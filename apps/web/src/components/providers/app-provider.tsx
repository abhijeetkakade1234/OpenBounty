"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  coreWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { http } from "viem";
import { appConfig } from "@/lib/config";
import { getConfiguredChain } from "@/lib/chains";

const configuredChain = getConfiguredChain();

const wagmiConfig = getDefaultConfig({
  appName: appConfig.appName,
  appDescription: appConfig.appDescription,
  appUrl: appConfig.appUrl,
  projectId: appConfig.walletConnectProjectId,
  chains: [configuredChain],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        coreWallet,
        metaMaskWallet,
        coinbaseWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  transports: {
    [configuredChain.id]: http(appConfig.rpcUrl),
  },
  ssr: true,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={lightTheme({
            accentColor: "#7b532d",
            accentColorForeground: "#ffffff",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
