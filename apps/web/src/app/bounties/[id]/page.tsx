import { BountyDetailView } from "@/components/bounty/bounty-detail-view";

export default async function BountyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BountyDetailView bountyId={Number(id)} />;
}
