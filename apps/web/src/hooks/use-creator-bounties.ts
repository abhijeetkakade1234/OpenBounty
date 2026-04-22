"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchBountiesPage,
  hasConfiguredContract,
} from "@/lib/contracts/openbounty";
import type { Bounty } from "@/lib/types";

const CREATOR_PAGE_SIZE = 50;

async function fetchCreatorBounties(creatorAddress: string): Promise<Bounty[]> {
  const matches: Bounty[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetchBountiesPage(page, CREATOR_PAGE_SIZE);
    matches.push(
      ...response.items.filter(
        (bounty) =>
          bounty.creator.toLowerCase() === creatorAddress.toLowerCase()
      )
    );
    totalPages = response.totalPages;
    page += 1;
  } while (page <= totalPages);

  return matches.sort((left, right) => right.id - left.id);
}

export function useCreatorBounties(creatorAddress?: string) {
  return useQuery({
    queryKey: ["creator-bounties", creatorAddress],
    enabled: hasConfiguredContract() && Boolean(creatorAddress),
    queryFn: () => fetchCreatorBounties(creatorAddress as string),
  });
}
