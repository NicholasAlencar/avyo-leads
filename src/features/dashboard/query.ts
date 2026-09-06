import "server-only";
import type { CurrentMember } from "@/features/auth/require-member";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FunnelCounts } from "./metrics";
export interface DashboardData {
  counts: FunnelCounts;
  segments: (FunnelCounts & { segment: string | null })[];
  approach: { id: string; company_name: string; score: number; conclusion: string; reasons: string[] | null }[];
}
export async function getDashboard(member: CurrentMember, days: 30 | 90 | null) {
  const db = await createServerSupabaseClient();
  const { data, error } = await db.rpc("commercial_dashboard", {
    p_organization_id: member.organizationId,
    p_start: days ? new Date(Date.now() - days * 86400000).toISOString() : "1970-01-01T00:00:00Z",
    p_end: new Date().toISOString(),
  });
  if (error) throw error;
  return data as DashboardData;
}
