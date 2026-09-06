import "server-only";
import { requireMember } from "@/features/auth/require-member";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getActionMember() {
  const member = await requireMember();
  const db = await createServerSupabaseClient();
  const { data, error } = await db.rpc("consume_mutation_budget", { p_organization_id: member.organizationId });
  if (error) throw error;
  if (!data) throw Object.assign(new Error("Limite de gravações atingido. Aguarde um minuto."), { code: "RATE_LIMITED" });
  return member;
}
