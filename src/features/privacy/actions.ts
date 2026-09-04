"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMember } from "@/features/auth/require-member";
import { parseRelationId } from "@/features/leads/related-input";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function suppressLeadContact(leadId: string, formData: FormData) {
  const member = await requireMember();
  const parsedLeadId = parseRelationId(leadId);
  const reason = z.string().trim().min(3).max(500).parse(formData.get("reason"));
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("suppress_lead_contact_with_activity", {
    p_organization_id: member.organizationId,
    p_actor_id: member.userId,
    p_lead_id: parsedLeadId,
    p_reason: reason,
  });
  if (error) throw new Error("Não foi possível bloquear o contato.");
  revalidatePath(`/leads/${parsedLeadId}`);
}

export async function restoreLeadContact(leadId: string) {
  const member = await requireMember();
  const parsedLeadId = parseRelationId(leadId);
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("restore_lead_contact_with_activity", {
    p_organization_id: member.organizationId,
    p_actor_id: member.userId,
    p_lead_id: parsedLeadId,
  });
  if (error) throw new Error("Não foi possível restaurar o contato.");
  revalidatePath(`/leads/${parsedLeadId}`);
}
