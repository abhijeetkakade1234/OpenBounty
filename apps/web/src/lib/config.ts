import artifact from "@/lib/contracts/generated/openbounty.json";

const DEFAULT_CHAIN_ID = 43113;
const DEFAULTS_BY_CHAIN_ID: Record<
  number,
  { rpcUrl: string; appUrl: string; label: string }
> = {
  31337: {
    rpcUrl: "http://127.0.0.1:8545",
    appUrl: "http://localhost:3000",
    label: "Localhost",
  },
  43113: {
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    appUrl: "http://localhost:3000",
    label: "Avalanche Fuji",
  },
  43114: {
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    appUrl: "http://localhost:3000",
    label: "Avalanche",
  },
};

const chainId = Number(
  process.env.NEXT_PUBLIC_OPENBOUNTY_CHAIN_ID ??
    artifact.chainId ??
    DEFAULT_CHAIN_ID
);
const defaults =
  DEFAULTS_BY_CHAIN_ID[chainId] ?? DEFAULTS_BY_CHAIN_ID[DEFAULT_CHAIN_ID];

export const appConfig = {
  appName: "OpenBounty",
  appDescription:
    "A cleaner place to fund open source issues and reward great work.",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? defaults.appUrl,
  chainId,
  chainLabel: defaults.label,
  rpcUrl:
    process.env.NEXT_PUBLIC_OPENBOUNTY_RPC_URL ??
    process.env.NEXT_PUBLIC_FUJI_RPC_URL ??
    defaults.rpcUrl,
  contractAddress:
    process.env.NEXT_PUBLIC_OPENBOUNTY_CONTRACT_ADDRESS ??
    artifact.address ??
    "",
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
    "openbounty-dev-project-id",
};

export const walletConnectProjectIdMissing =
  !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
