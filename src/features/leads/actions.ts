"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z, ZodError } from "zod";
import { getActionMember as requireMember } from "@/lib/security/action-context";
import { pipelineStages } from "@/features/pipeline/stages";
import { toSafeMutationMessage, type MutationResult } from "@/lib/security/audit";
import { assignLead, changeLeadStage, createLead, updateLead } from "./repository";
import { parseLeadInput } from "./schema";

const uuidSchema = z.uuid("Identificador inválido.");
const stageSchema = z.enum(pipelineStages);

export async function createLeadAction(
  _previousState: MutationResult<{ leadId: string }> | null,
  formData: FormData,
): Promise<MutationResult<{ leadId: string }>> {
  try {
    const member = await requireMember();
    const input = parseLeadInput(Object.fromEntries(formData));
    const leadId = await createLead(member, input);
    redirect(`/leads/${leadId}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    if (error instanceof ZodError) {
      return { ok: false, message: error.issues[0]?.message ?? "Dados inválidos." };
    }
    return { ok: false, message: toSafeMutationMessage(error) };
  }
}

export async function updateLeadAction(leadId: string, value: unknown): Promise<MutationResult<null>> {
  try {
    const member = await requireMember();
    const parsedLeadId = uuidSchema.parse(leadId);
    await updateLead(member, parsedLeadId, parseLeadInput(value));
    revalidatePath(`/leads/${parsedLeadId}`);
    revalidatePath("/leads");
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, message: toSafeMutationMessage(error) };
  }
}

export async function assignLeadAction(
  leadId: string,
  ownerId: string | null,
): Promise<MutationResult<null>> {
  try {
    const member = await requireMember();
    const parsedLeadId = uuidSchema.parse(leadId);
    const parsedOwnerId = ownerId === null ? null : uuidSchema.parse(ownerId);
    await assignLead(member, parsedLeadId, parsedOwnerId);
    revalidatePath(`/leads/${parsedLeadId}`);
    revalidatePath("/leads");
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, message: toSafeMutationMessage(error) };
  }
}

export async function changeLeadStageAction(value: {
  leadId: string;
  from: string;
  to: string;
  confirmed: boolean;
}): Promise<MutationResult<null>> {
  const member = await requireMember();
  try {
    const leadId = uuidSchema.parse(value.leadId);
    const from = stageSchema.parse(value.from);
    const to = stageSchema.parse(value.to);
    await changeLeadStage(member, leadId, from, to, z.boolean().parse(value.confirmed));
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/leads");
    revalidatePath("/pipeline");
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, message: toSafeMutationMessage(error) };
  }
}
