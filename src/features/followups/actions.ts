"use server";

import { revalidatePath } from "next/cache";
import { z, ZodError } from "zod";
import { getActionMember as requireMember } from "@/lib/security/action-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toSafeMutationMessage, type MutationResult } from "@/lib/security/audit";
import { parseFollowupInput } from "./schema";

export async function createFollowup(value: unknown): Promise<MutationResult<null>> {
  const member = await requireMember();
  try {
    const input = parseFollowupInput(value);
    const db = await createServerSupabaseClient();
    const { error } = await db.rpc("create_followup", {
      p_organization_id: member.organizationId, p_lead_id: input.leadId,
      p_owner_id: input.ownerId, p_due_at: input.dueAt,
      p_cadence_name: input.cadenceName || null, p_cadence_position: input.cadencePosition,
    });
    if (error) throw error;
    revalidatePath("/follow-ups"); revalidatePath(`/leads/${input.leadId}`);
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, message: error instanceof ZodError ? error.issues[0].message : toSafeMutationMessage(error) };
  }
}

export async function finishFollowup(id: string, status: "COMPLETED" | "CANCELLED"): Promise<MutationResult<null>> {
  const member = await requireMember();
  try {
    const db = await createServerSupabaseClient();
    const { data, error } = await db.rpc("finish_followup", {
      p_organization_id: member.organizationId, p_followup_id: z.uuid().parse(id),
      p_status: z.enum(["COMPLETED", "CANCELLED"]).parse(status),
    });
    if (error) throw error;
    revalidatePath("/follow-ups"); revalidatePath(`/leads/${data}`);
    return { ok: true, data: null };
  } catch (error) { return { ok: false, message: toSafeMutationMessage(error) }; }
}
