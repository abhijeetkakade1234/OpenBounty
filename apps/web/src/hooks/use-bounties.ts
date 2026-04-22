"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchBountiesPage,
  hasConfiguredContract,
} from "@/lib/contracts/openbounty";

export function useBounties(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["bounties", page, pageSize],
    enabled: hasConfiguredContract(),
    queryFn: () => fetchBountiesPage(page, pageSize),
  });
}
