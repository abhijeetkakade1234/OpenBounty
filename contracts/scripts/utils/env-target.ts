import { readFile, writeFile } from "fs/promises";
import path from "path";

type EnvTarget = "local" | "fuji" | "mainnet";

type DeploymentEnvInput = {
  address: string;
  chainId: number;
  networkName: string;
};

const TARGET_BY_NETWORK: Record<string, EnvTarget> = {
  hardhat: "local",
  localhost: "local",
  fuji: "fuji",
  mainnet: "mainnet",
};

const DEFAULTS: Record<EnvTarget, { rpcUrl: string; appUrl: string }> = {
  local: {
    rpcUrl: "http://127.0.0.1:8545",
    appUrl: "http://localhost:3000",
  },
  fuji: {
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    appUrl: "http://localhost:3000",
  },
  mainnet: {
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    appUrl: "http://localhost:3000",
  },
};

export function resolveEnvTarget(
  networkName: string,
  chainId: number
): EnvTarget {
  if (TARGET_BY_NETWORK[networkName]) {
    return TARGET_BY_NETWORK[networkName];
  }

  if (chainId === 31337) {
    return "local";
  }

  if (chainId === 43113) {
    return "fuji";
  }

  if (chainId === 43114) {
    return "mainnet";
  }

  throw new Error(
    `Unsupported deployment target for network "${networkName}" and chainId "${chainId}".`
  );
}

function getRootEnvPath(target: EnvTarget) {
  return path.resolve(__dirname, `../../../.env.${target}`);
}

function getWebEnvPath(target: EnvTarget) {
  return path.resolve(__dirname, `../../../apps/web/.env.${target}`);
}

function upsertEnvLine(content: string, key: string, value: string) {
  const normalized = content.replace(/\r\n/g, "\n");
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedKey}=.*$`, "m");
  const line = `${key}=${value}`;

  if (pattern.test(normalized)) {
    return normalized.replace(pattern, line);
  }

  const suffix =
    normalized.length > 0 && !normalized.endsWith("\n") ? "\n" : "";
  return `${normalized}${suffix}${line}\n`;
}

async function updateEnvFile(
  filePath: string,
  updates: Record<string, string>
) {
  let content = "";

  try {
    content = await readFile(filePath, "utf8");
  } catch {
    content = "";
  }

  let next = content;
  for (const [key, value] of Object.entries(updates)) {
    next = upsertEnvLine(next, key, value);
  }

  await writeFile(filePath, next, "utf8");
}

export async function writeDeploymentEnvFiles(input: DeploymentEnvInput) {
  const target = resolveEnvTarget(input.networkName, input.chainId);
  const defaults = DEFAULTS[target];
  const rootEnvPath = getRootEnvPath(target);
  const webEnvPath = getWebEnvPath(target);

  await updateEnvFile(rootEnvPath, {
    OPENBOUNTY_PROXY_ADDRESS: input.address,
    NEXT_PUBLIC_OPENBOUNTY_CONTRACT_ADDRESS: input.address,
    NEXT_PUBLIC_OPENBOUNTY_CHAIN_ID: String(input.chainId),
    NEXT_PUBLIC_OPENBOUNTY_RPC_URL: defaults.rpcUrl,
    NEXT_PUBLIC_APP_URL: defaults.appUrl,
  });

  await updateEnvFile(webEnvPath, {
    NEXT_PUBLIC_OPENBOUNTY_CONTRACT_ADDRESS: input.address,
    NEXT_PUBLIC_OPENBOUNTY_CHAIN_ID: String(input.chainId),
    NEXT_PUBLIC_OPENBOUNTY_RPC_URL: defaults.rpcUrl,
    NEXT_PUBLIC_APP_URL: defaults.appUrl,
  });

  return { target, rootEnvPath, webEnvPath };
}
