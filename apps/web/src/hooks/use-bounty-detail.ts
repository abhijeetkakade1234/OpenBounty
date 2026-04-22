"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchBountyDetail,
  fetchSubmissionPage,
  hasConfiguredContract,
} from "@/lib/contracts/openbounty";

export function useBountyDetail(
  bountyId: number,
  submissionPage: number,
  submissionPageSize: number
) {
  const bountyQuery = useQuery({
    queryKey: ["bounty", bountyId],
    enabled:
      hasConfiguredContract() && Number.isFinite(bountyId) && bountyId > 0,
    queryFn: () => fetchBountyDetail(bountyId),
  });

  const submissionsQuery = useQuery({
    queryKey: [
      "bounty-submissions",
      bountyId,
      submissionPage,
      submissionPageSize,
    ],
    enabled:
      hasConfiguredContract() && Number.isFinite(bountyId) && bountyId > 0,
    queryFn: () =>
      fetchSubmissionPage(bountyId, submissionPage, submissionPageSize),
  });

  return {
    bountyQuery,
    submissionsQuery,
  };
}
