"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMember } from "@/features/auth/require-member";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseNoteInput, parseRelationId } from "./related-input";

const nameSchema = z.string().trim().min(1).max(100);

async function callWorkspaceRpc(
  name: string,
  leadId: string,
  extra: Record<string, string | null>,
) {
  const member = await requireMember();
  const parsedLeadId = parseRelationId(leadId);
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc(name, {
    p_organization_id: member.organizationId,
    p_actor_id: member.userId,
    p_lead_id: parsedLeadId,
    ...extra,
  });
  if (error) throw new Error("Não foi possível atualizar a ficha do lead.");
  revalidatePath(`/leads/${parsedLeadId}`);
}

export async function addLeadNote(leadId: string, formData: FormData) {
  await callWorkspaceRpc("add_lead_note_with_activity", leadId, {
    p_body: parseNoteInput(formData.get("body")),
  });
}

export async function addLeadTag(leadId: string, formData: FormData) {
  await callWorkspaceRpc("attach_lead_tag_with_activity", leadId, {
    p_name: nameSchema.max(50).parse(formData.get("name")),
  });
}

export async function addLeadToList(leadId: string, formData: FormData) {
  await callWorkspaceRpc("attach_lead_list_with_activity", leadId, {
    p_name: nameSchema.parse(formData.get("name")),
  });
}

export async function assignLeadOwner(leadId: string, formData: FormData) {
  const value = formData.get("ownerId");
  await callWorkspaceRpc("assign_lead_with_activity", leadId, {
    p_owner_id: value ? parseRelationId(value) : null,
  });
  revalidatePath("/leads");
}
