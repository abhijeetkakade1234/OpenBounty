import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";

function getSelectedNetwork() {
  const networkIndex = process.argv.findIndex((arg) => arg === "--network");
  return networkIndex >= 0 ? process.argv[networkIndex + 1] : "hardhat";
}

function getEnvFilePath(networkName: string) {
  if (networkName === "hardhat" || networkName === "localhost") {
    return "../.env.local";
  }

  return `../.env.${networkName}`;
}

dotenv.config({ path: getEnvFilePath(getSelectedNetwork()) });
dotenv.config({ path: "../.env" });
dotenv.config();

const privateKey = process.env.DEPLOYER_PRIVATE_KEY ?? "";
const fujiRpcUrl =
  process.env.FUJI_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc";
const mainnetRpcUrl =
  process.env.MAINNET_RPC_URL ?? "https://api.avax.network/ext/bc/C/rpc";
const localRpcUrl = process.env.LOCAL_RPC_URL ?? "http://127.0.0.1:8545";
const configuredAccounts = privateKey ? [privateKey] : undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: localRpcUrl,
      chainId: 31337,
      accounts: configuredAccounts,
    },
    fuji: {
      url: fujiRpcUrl,
      chainId: 43113,
      accounts: configuredAccounts,
    },
    mainnet: {
      url: mainnetRpcUrl,
      chainId: 43114,
      accounts: configuredAccounts,
    },
  },
};

export default config;
