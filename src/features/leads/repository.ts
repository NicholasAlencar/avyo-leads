import "server-only";
import type { CurrentMember } from "@/features/auth/require-member";
import type { PipelineStage } from "@/features/pipeline/stages";
import { validateStageChange } from "@/features/pipeline/transitions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { LeadDetail, LeadFilters, LeadMutationInput, LeadSummary } from "./types";

interface LeadRow {
  id: string;
  company_name: string;
  legal_name: string | null;
  trading_name: string | null;
  segment: string | null;
  category: string | null;
  description: string | null;
  cnpj: string | null;
  state_code: string | null;
  city: string | null;
  district: string | null;
  address_line: string | null;
  postal_code: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  google_maps_url: string | null;
  google_place_id: string | null;
  pipeline_stage: PipelineStage;
  owner_id: string | null;
  potential_value: number | string | null;
  is_favorite: boolean;
  opted_out_at: string | null;
  discarded_at: string | null;
  last_activity_at: string | null;
  created_at: string;
  owner: { display_name: string } | null;
  lead_scores: Array<{ score: number; conclusion: string }> | null;
}

const leadSelect = `
  id, company_name, legal_name, trading_name, segment, category, description, cnpj,
  state_code, city, district, address_line, postal_code, phone, whatsapp, email,
  website_url, instagram_url, linkedin_url, google_maps_url, google_place_id,
  pipeline_stage, owner_id, potential_value, is_favorite, opted_out_at, discarded_at,
  last_activity_at, created_at,
  owner:profiles!leads_owner_id_fkey(display_name),
  lead_scores(score, conclusion)
`;

function toSummary(row: LeadRow): LeadSummary {
  const currentScore = row.lead_scores?.[0] ?? null;

  return {
    id: row.id,
    companyName: row.company_name,
    segment: row.segment,
    city: row.city,
    stateCode: row.state_code,
    phone: row.phone,
    email: row.email,
    websiteUrl: row.website_url,
    instagramUrl: row.instagram_url,
    linkedinUrl: row.linkedin_url,
    pipelineStage: row.pipeline_stage,
    ownerId: row.owner_id,
    ownerName: row.owner?.display_name ?? null,
    score: currentScore?.score ?? null,
    opportunityReason: currentScore?.conclusion ?? null,
    lastActivityAt: row.last_activity_at,
    createdAt: row.created_at,
  };
}

function toDetail(row: LeadRow): LeadDetail {
  return {
    ...toSummary(row),
    legalName: row.legal_name,
    tradingName: row.trading_name,
    category: row.category,
    description: row.description,
    cnpj: row.cnpj,
    district: row.district,
    addressLine: row.address_line,
    postalCode: row.postal_code,
    whatsapp: row.whatsapp,
    googleMapsUrl: row.google_maps_url,
    googlePlaceId: row.google_place_id,
    potentialValue: row.potential_value === null ? null : Number(row.potential_value),
    isFavorite: row.is_favorite,
    optedOutAt: row.opted_out_at,
    discardedAt: row.discarded_at,
  };
}

function serializableLead(input: LeadMutationInput): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(input).filter((entry): entry is [string, string | number] => {
      return entry[1] !== undefined;
    }),
  );
}

export async function listLeads(
  member: CurrentMember,
  filters: LeadFilters,
): Promise<{ leads: LeadSummary[]; total: number }> {
  const supabase = await createServerSupabaseClient();
  const start = (filters.page - 1) * filters.pageSize;
  const end = start + filters.pageSize - 1;
  let query = supabase
    .from("leads")
    .select(leadSelect, { count: "exact" })
    .eq("organization_id", member.organizationId)
    .eq("lead_scores.is_current", true)
    .is("discarded_at", null);

  if (filters.query) query = query.ilike("company_name", `%${filters.query.replace(/[%_]/g, "\\$&")}%`);
  if (filters.stage) query = query.eq("pipeline_stage", filters.stage);
  if (filters.ownerId) query = query.eq("owner_id", filters.ownerId);
  if (filters.stateCode) query = query.eq("state_code", filters.stateCode);
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.segment) query = query.eq("segment", filters.segment);

  if (filters.sort === "company_desc") {
    query = query.order("company_name", { ascending: false });
  } else if (filters.sort === "score_desc") {
    query = query.order("score", { ascending: false, referencedTable: "lead_scores" });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(start, end);
  if (error) throw error;

  return { leads: ((data ?? []) as unknown as LeadRow[]).map(toSummary), total: count ?? 0 };
}

export async function getLead(member: CurrentMember, leadId: string): Promise<LeadDetail | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .select(leadSelect)
    .eq("organization_id", member.organizationId)
    .eq("id", leadId)
    .eq("lead_scores.is_current", true)
    .maybeSingle();

  if (error) throw error;
  return data ? toDetail(data as unknown as LeadRow) : null;
}

export async function createLead(
  member: CurrentMember,
  input: LeadMutationInput,
): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("create_lead_with_activity", {
    p_organization_id: member.organizationId,
    p_actor_id: member.userId,
    p_lead: serializableLead(input),
  });
  if (error) throw error;
  return data as string;
}

export async function updateLead(
  member: CurrentMember,
  leadId: string,
  input: LeadMutationInput,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("update_lead_with_activity", {
    p_organization_id: member.organizationId,
    p_actor_id: member.userId,
    p_lead_id: leadId,
    p_lead: serializableLead(input),
  });
  if (error) throw error;
}

export async function assignLead(
  member: CurrentMember,
  leadId: string,
  ownerId: string | null,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("assign_lead_with_activity", {
    p_organization_id: member.organizationId,
    p_actor_id: member.userId,
    p_lead_id: leadId,
    p_owner_id: ownerId,
  });
  if (error) throw error;
}

export async function changeLeadStage(
  member: CurrentMember,
  leadId: string,
  from: PipelineStage,
  to: PipelineStage,
  confirmed = false,
): Promise<void> {
  validateStageChange({ from, to, confirmed });
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("change_lead_stage_with_activity", {
    p_organization_id: member.organizationId,
    p_actor_id: member.userId,
    p_lead_id: leadId,
    p_expected_stage: from,
    p_next_stage: to,
    p_confirmed: confirmed,
  });
  if (error) throw error;
}
