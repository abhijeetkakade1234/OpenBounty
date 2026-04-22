import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  parseEther,
  type Eip1193Provider,
  type InterfaceAbi,
} from "ethers";
import type { WalletClient } from "viem";
import { getConfiguredChain } from "@/lib/chains";
import artifact from "@/lib/contracts/generated/openbounty.json";
import { appConfig } from "@/lib/config";
import { extractErrorMessage } from "@/lib/errors";
import { getCursorFromPage, getTotalPages } from "@/lib/pagination";
import type { Bounty, PaginatedResult, Submission } from "@/lib/types";

export const OPENBOUNTY_ABI = artifact.abi as InterfaceAbi;
export const OPENBOUNTY_CHAIN = getConfiguredChain();
export const OPENBOUNTY_MAX_PAGE_SIZE = 50;

export type DeploymentMetadata = {
  address: string;
  implementationAddress?: string;
  chainId: number;
  abi: unknown[];
};

type RawBounty = {
  id: bigint;
  creator: string;
  repoUrl: string;
  description: string;
  reward: bigint;
  deadline: bigint;
  isOpen: boolean;
  isCompleted: boolean;
  winner: string;
};

type RawSubmission = {
  submitter: string;
  prLink: string;
  timestamp: bigint;
};

function getContractAddress() {
  if (!appConfig.contractAddress) {
    throw new Error(
      "NEXT_PUBLIC_OPENBOUNTY_CONTRACT_ADDRESS is not configured."
    );
  }

  return appConfig.contractAddress;
}

function getReadOnlyContract() {
  return new Contract(
    getContractAddress(),
    OPENBOUNTY_ABI,
    new JsonRpcProvider(appConfig.rpcUrl, appConfig.chainId)
  );
}

async function getSignerContract(walletClient: WalletClient) {
  const chain = walletClient.chain ?? OPENBOUNTY_CHAIN;
  const account = walletClient.account;
  if (!account) {
    throw new Error("Wallet account is unavailable.");
  }
  const provider = new BrowserProvider(
    walletClient.transport as unknown as Eip1193Provider,
    {
      chainId: chain.id,
      name: chain.name,
    }
  );
  const signer = await provider.getSigner(account.address);
  return new Contract(getContractAddress(), OPENBOUNTY_ABI, signer);
}

function normalizeBounty(raw: RawBounty): Bounty {
  return {
    id: Number(raw.id),
    creator: raw.creator,
    repoUrl: raw.repoUrl,
    description: raw.description,
    reward: BigInt(raw.reward.toString()),
    deadline: Number(raw.deadline),
    isOpen: raw.isOpen,
    isCompleted: raw.isCompleted,
    winner: raw.winner,
  };
}

function normalizeSubmission(raw: RawSubmission): Submission {
  return {
    submitter: raw.submitter,
    prLink: raw.prLink,
    timestamp: Number(raw.timestamp),
  };
}

export function hasConfiguredContract() {
  return Boolean(appConfig.contractAddress);
}

export async function fetchBountiesPage(
  page: number,
  pageSize: number
): Promise<PaginatedResult<Bounty>> {
  const contract = getReadOnlyContract();
  const cursor = getCursorFromPage(page, pageSize);
  const [totalResponse, pageResponse] = await Promise.all([
    contract.bountyCounter(),
    contract.getBountiesPaginated(cursor, pageSize),
  ]);

  const [items, nextCursor, hasMore] = pageResponse as [
    RawBounty[],
    bigint,
    boolean,
  ];
  const total = Number(totalResponse);

  return {
    items: items.map(normalizeBounty),
    page,
    pageSize,
    nextCursor: Number(nextCursor),
    hasMore,
    total,
    totalPages: getTotalPages(total, pageSize),
  };
}

export async function fetchBountyDetail(bountyId: number) {
  const contract = getReadOnlyContract();
  const [bountyResponse, submissionCountResponse] = await Promise.all([
    contract.getBounty(bountyId),
    contract.getSubmissionCount(bountyId),
  ]);

  return {
    bounty: normalizeBounty(bountyResponse as RawBounty),
    submissionCount: Number(submissionCountResponse),
  };
}

export async function fetchSubmissionPage(
  bountyId: number,
  page: number,
  pageSize: number
): Promise<PaginatedResult<Submission>> {
  const contract = getReadOnlyContract();
  const cursor = getCursorFromPage(page, pageSize);
  const [totalResponse, pageResponse] = await Promise.all([
    contract.getSubmissionCount(bountyId),
    contract.getSubmissionsPaginated(bountyId, cursor, pageSize),
  ]);

  const [items, nextCursor, hasMore] = pageResponse as [
    RawSubmission[],
    bigint,
    boolean,
  ];
  const total = Number(totalResponse);

  return {
    items: items.map(normalizeSubmission),
    page,
    pageSize,
    nextCursor: Number(nextCursor),
    hasMore,
    total,
    totalPages: getTotalPages(total, pageSize),
  };
}

export async function createBounty(input: {
  walletClient: WalletClient;
  repoUrl: string;
  description: string;
  reward: string;
  deadline: string;
}) {
  const contract = await getSignerContract(input.walletClient);
  const deadline = input.deadline
    ? Math.floor(new Date(input.deadline).getTime() / 1000)
    : 0;
  const transaction = await contract.createBounty(
    input.repoUrl,
    input.description,
    deadline,
    {
      value: parseEther(input.reward),
    }
  );
  await transaction.wait();
}

export async function submitWork(input: {
  walletClient: WalletClient;
  bountyId: number;
  prLink: string;
}) {
  const contract = await getSignerContract(input.walletClient);
  const transaction = await contract.submitWork(input.bountyId, input.prLink);
  await transaction.wait();
}

export async function approveSubmission(input: {
  walletClient: WalletClient;
  bountyId: number;
  submissionIndex: number;
}) {
  const contract = await getSignerContract(input.walletClient);
  const transaction = await contract.approveSubmission(
    input.bountyId,
    input.submissionIndex
  );
  await transaction.wait();
}

export async function refundBounty(input: {
  walletClient: WalletClient;
  bountyId: number;
}) {
  const contract = await getSignerContract(input.walletClient);
  const transaction = await contract.refund(input.bountyId);
  await transaction.wait();
}

export function getFriendlyContractError(error: unknown) {
  return extractErrorMessage(error);
}
