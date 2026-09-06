import "server-only";
import type { CurrentMember } from "@/features/auth/require-member";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface LeadWorkspaceRelations {
  contacts: Array<{ id: string; fullName: string | null; roleTitle: string | null; email: string | null; phone: string | null; whatsapp: string | null; linkedinUrl: string | null; confidence: string | null }>;
  sources: Array<{ id: string; source: string; sourceUrl: string; fieldName: string | null; confidence: string; fetchedAt: string }>;
  notes: Array<{ id: string; body: string; authorName: string; createdAt: string }>;
  tags: Array<{ id: string; name: string; color: string }>;
  lists: Array<{ id: string; name: string }>;
  activities: Array<{ id: string; title: string; description: string | null; occurredAt: string; actorName: string | null }>;
  members: Array<{ userId: string; name: string }>;
  research: { summary: string | null; opportunityReason: string | null; hypotheticalPain: string | null; recommendedService: string | null } | null;
  scoreFactors: Array<{ id: string; explanation: string; contribution: number }>;
  messages: Array<{ id: string; channel: string; subject: string | null; body: string; status: string; createdAt: string }>;
}

function firstRelated<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export async function getLeadWorkspace(member: CurrentMember, leadId: string): Promise<LeadWorkspaceRelations> {
  const supabase = await createServerSupabaseClient();
  const organization = member.organizationId;
  const [contacts, sources, notes, tags, lists, activities, memberships, research, score, messages] = await Promise.all([
    supabase.from("lead_contacts").select("id, full_name, role_title, email, phone, whatsapp, linkedin_url, confidence").eq("organization_id", organization).eq("lead_id", leadId).order("is_primary", { ascending: false }),
    supabase.from("lead_sources").select("id, source, source_url, field_name, confidence, fetched_at").eq("organization_id", organization).eq("lead_id", leadId).order("fetched_at", { ascending: false }),
    supabase.from("lead_notes").select("id, body, created_at, author:profiles!lead_notes_author_id_fkey(display_name)").eq("organization_id", organization).eq("lead_id", leadId).order("created_at", { ascending: false }),
    supabase.from("lead_tags").select("tags(id, name, color)").eq("organization_id", organization).eq("lead_id", leadId),
    supabase.from("lead_lists").select("lists(id, name)").eq("organization_id", organization).eq("lead_id", leadId),
    supabase.from("activities").select("id, title, description, occurred_at, actor:profiles!activities_actor_id_fkey(display_name)").eq("organization_id", organization).eq("lead_id", leadId).order("occurred_at", { ascending: false }).limit(100),
    supabase.from("organization_members").select("user_id, profile:profiles!organization_members_user_id_fkey(display_name)").eq("organization_id", organization).eq("status", "active"),
    supabase.from("lead_research").select("summary, opportunity_reason, hypothetical_pain, recommended_service").eq("organization_id", organization).eq("lead_id", leadId).order("version", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("lead_scores").select("lead_score_factors(id, explanation, contribution)").eq("organization_id", organization).eq("lead_id", leadId).eq("is_current", true).maybeSingle(),
    supabase.from("outreach_messages").select("id, channel, subject, body, status, created_at").eq("organization_id", organization).eq("lead_id", leadId).order("created_at", { ascending: false }).limit(20),
  ]);

  const failed = [contacts, sources, notes, tags, lists, activities, memberships, research, score, messages].find((result) => result.error);
  if (failed?.error) throw failed.error;

  return {
    contacts: (contacts.data ?? []).map((row) => ({ id: row.id, fullName: row.full_name, roleTitle: row.role_title, email: row.email, phone: row.phone, whatsapp: row.whatsapp, linkedinUrl: row.linkedin_url, confidence: row.confidence })),
    sources: (sources.data ?? []).map((row) => ({ id: row.id, source: row.source, sourceUrl: row.source_url, fieldName: row.field_name, confidence: row.confidence, fetchedAt: row.fetched_at })),
    notes: (notes.data ?? []).map((row) => ({ id: row.id, body: row.body, authorName: firstRelated(row.author)?.display_name ?? "Usuário", createdAt: row.created_at })),
    tags: (tags.data ?? []).flatMap((row) => {
      const tag = firstRelated(row.tags);
      return tag ? [tag] : [];
    }),
    lists: (lists.data ?? []).flatMap((row) => {
      const list = firstRelated(row.lists);
      return list ? [list] : [];
    }),
    activities: (activities.data ?? []).map((row) => ({ id: row.id, title: row.title, description: row.description, occurredAt: row.occurred_at, actorName: firstRelated(row.actor)?.display_name ?? null })),
    members: (memberships.data ?? []).flatMap((row) => {
      const profile = firstRelated(row.profile);
      return profile ? [{ userId: row.user_id, name: profile.display_name }] : [];
    }),
    research: research.data ? { summary: research.data.summary, opportunityReason: research.data.opportunity_reason, hypotheticalPain: research.data.hypothetical_pain, recommendedService: research.data.recommended_service } : null,
    scoreFactors: (score.data?.lead_score_factors ?? []) as Array<{ id: string; explanation: string; contribution: number }>,
    messages: (messages.data ?? []).map((row) => ({ id: row.id, channel: row.channel, subject: row.subject, body: row.body, status: row.status, createdAt: row.created_at })),
  };
}
