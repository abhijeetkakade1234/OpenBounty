import { avalanche, avalancheFuji, hardhat } from "wagmi/chains";
import { appConfig } from "@/lib/config";

export function getConfiguredChain() {
  switch (appConfig.chainId) {
    case avalanche.id:
      return avalanche;
    case avalancheFuji.id:
      return avalancheFuji;
    case hardhat.id:
      return hardhat;
    default:
      return avalancheFuji;
  }
}
