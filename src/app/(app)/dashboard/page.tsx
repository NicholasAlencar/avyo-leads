import { requireMember } from "@/features/auth/require-member";
import { getDashboard } from "@/features/dashboard/query";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const params = await searchParams;
  const days = params.days === "30" ? 30 : params.days === "90" ? 90 : null;
  return <DashboardOverview data={await getDashboard(await requireMember(), days)} days={days} />;
}
