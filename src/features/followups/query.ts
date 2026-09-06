import "server-only";
import type { CurrentMember } from "@/features/auth/require-member";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface FollowupRow {
  id: string; lead_id: string; owner_id: string; due_at: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  cadence_name: string | null; cadence_position: number;
  lead: { company_name: string }; owner: { display_name: string };
}

export async function getFollowups(member: CurrentMember, status: FollowupRow["status"], page: number) {
  const db = await createServerSupabaseClient();
  const { data, error, count } = await db.from("followups")
    .select("id, lead_id, owner_id, due_at, status, cadence_name, cadence_position, lead:leads!followups_organization_id_lead_id_fkey(company_name), owner:profiles!followups_owner_id_fkey(display_name)", { count: "exact" })
    .eq("organization_id", member.organizationId).eq("status", status)
    .order("due_at", { ascending: true }).order("id")
    .range((page - 1) * 50, page * 50 - 1);
  if (error) throw error;
  return { rows: (data ?? []) as unknown as FollowupRow[], total: count ?? 0 };
}
