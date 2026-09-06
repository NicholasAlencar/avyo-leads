create view public.lead_directory with (security_invoker = true) as
select l.*, p.display_name as owner_name, s.score as current_score, s.conclusion as score_conclusion,
 ((nullif(l.website_url, '') is not null)::int + (nullif(l.instagram_url, '') is not null)::int + (nullif(l.linkedin_url, '') is not null)::int) as digital_presence
from public.leads l
left join public.profiles p on p.id = l.owner_id
left join public.lead_scores s on s.organization_id = l.organization_id and s.lead_id = l.id and s.is_current;
revoke all on public.lead_directory from public, anon, authenticated;
grant select on public.lead_directory to authenticated;

-- Date range selects a cohort; milestones count unique leads, not repeated events.
create function public.commercial_dashboard(p_organization_id uuid, p_start timestamptz, p_end timestamptz)
returns jsonb language sql stable security invoker set search_path = '' as $$
with cohort as (
 select l.*, a.contacted, a.replied, a.positive, a.meeting, a.proposal
 from public.lead_directory l left join lateral (
  select
   coalesce(bool_or(type = 'CONTACTED' or (type = 'STAGE_CHANGED' and metadata->>'to' = 'CONTACTED')), false) as contacted,
   coalesce(bool_or(type = 'RESPONDED' or (type = 'STAGE_CHANGED' and metadata->>'to' = 'RESPONDED')), false) as replied,
   coalesce(bool_or(type = 'RESPONDED' and metadata->>'positive' = 'true'), false) as positive,
   coalesce(bool_or(type = 'MEETING' or (type = 'STAGE_CHANGED' and metadata->>'to' = 'MEETING_SCHEDULED')), false) as meeting,
   coalesce(bool_or(type = 'PROPOSAL' or (type = 'STAGE_CHANGED' and metadata->>'to' = 'PROPOSAL')), false) as proposal
  from public.activities where organization_id = l.organization_id and lead_id = l.id
 ) a on true
 where l.organization_id = p_organization_id and l.created_at >= p_start and l.created_at < p_end
), metrics as (
 select grouping(segment) as is_total, segment, count(*) as found,
  count(*) filter (where pipeline_stage = 'NEW') as new,
  count(*) filter (where current_score >= 50) as qualified,
  count(*) filter (where current_score >= 65) as hot,
  count(*) filter (where contacted or contacted_at is not null) as contacted,
  count(*) filter (where replied) as replies, count(*) filter (where positive) as positive,
  count(*) filter (where meeting) as meetings, count(*) filter (where proposal) as proposals,
  count(*) filter (where pipeline_stage = 'CLIENT') as clients,
  coalesce(sum(potential_value) filter (where pipeline_stage not in ('CLIENT','LOST') and discarded_at is null),0) as potential,
  coalesce(sum(closed_revenue) filter (where pipeline_stage = 'CLIENT'),0) as revenue
 from cohort group by grouping sets ((), (segment))
), candidates as (
 select l.id, l.company_name, l.current_score as score, l.score_conclusion as conclusion,
  (select jsonb_agg(f.explanation order by f.contribution desc) from public.lead_score_factors f join public.lead_scores s on s.id = f.lead_score_id and s.organization_id = f.organization_id
   where s.organization_id = l.organization_id and s.lead_id = l.id and s.is_current and f.contribution > 0) as reasons
 from public.lead_directory l where l.organization_id = p_organization_id and l.current_score is not null
  and l.opted_out_at is null and l.discarded_at is null
  and l.pipeline_stage in ('NEW','ANALYZING','PRIORITY','CONTACT_PREPARED')
  and (l.phone is not null or l.email is not null or l.whatsapp is not null or l.linkedin_url is not null)
  and (l.contacted_at is null or l.contacted_at < now() - interval '3 days')
  and not exists (select 1 from public.activities a where a.organization_id = l.organization_id and a.lead_id = l.id and a.occurred_at >= now() - interval '3 days'
   and (a.type = 'CONTACTED' or (a.type = 'STAGE_CHANGED' and a.metadata->>'to' = 'CONTACTED')))
  and not exists (select 1 from public.contact_suppressions c where c.organization_id = l.organization_id and c.lead_id = l.id and c.removed_at is null)
 order by l.current_score desc, l.id limit 5
)
select jsonb_build_object(
 'counts', (select to_jsonb(m) - 'segment' - 'is_total' from metrics m where is_total = 1),
 'segments', coalesce((select jsonb_agg(to_jsonb(m) - 'is_total' order by found desc, segment) from metrics m where is_total = 0),'[]'::jsonb),
 'approach', coalesce((select jsonb_agg(to_jsonb(c) order by c.score desc, c.id) from candidates c),'[]'::jsonb));
$$;
revoke all on function public.commercial_dashboard(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.commercial_dashboard(uuid, timestamptz, timestamptz) to authenticated;
