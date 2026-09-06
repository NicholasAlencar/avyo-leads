create type public.organization_role as enum ('admin', 'manager', 'member');
create type public.membership_status as enum ('invited', 'active', 'suspended');
create type public.pipeline_stage as enum (
  'NEW',
  'ANALYZING',
  'PRIORITY',
  'CONTACT_PREPARED',
  'CONTACTED',
  'RESPONDED',
  'MEETING_SCHEDULED',
  'PROPOSAL',
  'NEGOTIATION',
  'CLIENT',
  'LOST'
);
create type public.confidence_level as enum ('HIGH', 'MEDIUM', 'LOW');
create type public.score_classification as enum (
  'VERY_HOT',
  'HOT',
  'PROMISING',
  'MONITOR',
  'LOW_PRIORITY'
);
create type public.activity_type as enum (
  'FOUND',
  'CREATED',
  'UPDATED',
  'ASSIGNED',
  'STAGE_CHANGED',
  'NOTE_ADDED',
  'TAGGED',
  'LISTED',
  'CONTACTED',
  'RESPONDED',
  'MEETING',
  'PROPOSAL',
  'WON',
  'LOST',
  'FOLLOWUP_CREATED',
  'FOLLOWUP_COMPLETED',
  'SUPPRESSED',
  'RESTORED'
);
create type public.message_channel as enum ('EMAIL', 'WHATSAPP', 'LINKEDIN');
create type public.message_status as enum (
  'DRAFT',
  'GENERATED',
  'REVIEWED',
  'APPROVED',
  'QUEUED',
  'SENT',
  'DELIVERED',
  'FAILED',
  'CANCELLED'
);
create type public.followup_status as enum ('PENDING', 'COMPLETED', 'CANCELLED');
create type public.integration_state as enum ('NOT_CONFIGURED', 'CONFIGURED', 'ERROR');
create type public.job_status as enum ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');
create type public.deduplication_status as enum ('UNIQUE', 'MATCHED', 'REVIEW_REQUIRED', 'IGNORED');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null check (char_length(trim(display_name)) between 2 and 120),
  email text not null check (email = lower(email) and position('@' in email) > 1),
  job_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_unique on public.profiles (lower(email));

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  role public.organization_role not null default 'member',
  status public.membership_status not null default 'invited',
  invited_by uuid references public.profiles(id) on delete set null,
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (organization_id, id),
  check ((status <> 'active') or joined_at is not null)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  company_name text not null check (char_length(trim(company_name)) between 2 and 200),
  normalized_name text not null check (char_length(normalized_name) > 0),
  legal_name text,
  trading_name text,
  segment text,
  category text,
  description text,
  cnpj text,
  normalized_cnpj text,
  state_code text check (state_code is null or state_code ~ '^[A-Z]{2}$'),
  city text,
  district text,
  address_line text,
  postal_code text,
  latitude numeric(9, 6) check (latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude between -180 and 180),
  phone text,
  normalized_phone text,
  whatsapp text,
  email text,
  website_url text,
  normalized_domain text,
  instagram_url text,
  linkedin_url text,
  google_maps_url text,
  google_place_id text,
  google_rating numeric(2, 1) check (google_rating between 0 and 5),
  google_review_count integer check (google_review_count is null or google_review_count >= 0),
  unit_count smallint check (unit_count is null or unit_count >= 1),
  size_estimate text,
  finance_structure_note text,
  pipeline_stage public.pipeline_stage not null default 'NEW',
  owner_id uuid references public.profiles(id) on delete set null,
  found_by uuid references public.profiles(id) on delete set null,
  potential_value numeric(14, 2) check (potential_value is null or potential_value >= 0),
  closed_revenue numeric(14, 2) check (closed_revenue is null or closed_revenue >= 0),
  is_favorite boolean not null default false,
  contacted_at timestamptz,
  last_activity_at timestamptz,
  next_followup_at timestamptz,
  opted_out_at timestamptz,
  opt_out_reason text,
  discarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  check ((opted_out_at is null) = (opt_out_reason is null))
);

create unique index leads_organization_place_unique
  on public.leads (organization_id, google_place_id)
  where google_place_id is not null;
create unique index leads_organization_cnpj_unique
  on public.leads (organization_id, normalized_cnpj)
  where normalized_cnpj is not null;
create index leads_organization_domain_idx
  on public.leads (organization_id, normalized_domain)
  where normalized_domain is not null;
create index leads_organization_phone_idx
  on public.leads (organization_id, normalized_phone)
  where normalized_phone is not null;
create index leads_organization_name_idx on public.leads (organization_id, normalized_name);
create index leads_organization_location_idx on public.leads (organization_id, state_code, city);
create index leads_organization_stage_idx on public.leads (organization_id, pipeline_stage);
create index leads_organization_owner_idx on public.leads (organization_id, owner_id);
create index leads_organization_created_idx on public.leads (organization_id, created_at desc);
create index leads_organization_followup_idx
  on public.leads (organization_id, next_followup_at)
  where next_followup_at is not null;

create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  source text not null check (char_length(trim(source)) between 2 and 80),
  source_url text not null check (source_url ~ '^https?://'),
  field_name text,
  claim text,
  confidence public.confidence_level not null,
  provider_reference text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  fetched_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict
);

create index lead_sources_lead_idx on public.lead_sources (organization_id, lead_id, fetched_at desc);

create table public.lead_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  full_name text,
  role_title text,
  email text,
  phone text,
  whatsapp text,
  linkedin_url text,
  is_primary boolean not null default false,
  source_id uuid,
  confidence public.confidence_level,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict,
  foreign key (organization_id, source_id)
    references public.lead_sources(organization_id, id) on delete restrict,
  check (email is not null or phone is not null or whatsapp is not null or linkedin_url is not null)
);

create unique index lead_contacts_primary_unique
  on public.lead_contacts (organization_id, lead_id)
  where is_primary;
create index lead_contacts_lead_idx on public.lead_contacts (organization_id, lead_id);

create table public.lead_research (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  version integer not null check (version >= 1),
  summary text,
  company_overview text,
  opportunity_reason text,
  hypothetical_pain text,
  recommended_service text,
  structured_findings jsonb not null default '{}'::jsonb check (jsonb_typeof(structured_findings) = 'object'),
  provider text,
  model text,
  researched_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, lead_id, version),
  unique (organization_id, id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict
);

create table public.lead_scores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  version integer not null check (version >= 1),
  score smallint not null check (score between 0 and 100),
  classification public.score_classification not null,
  conclusion text not null,
  rules_version text not null,
  is_current boolean not null default true,
  calculated_at timestamptz not null default now(),
  calculated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, lead_id, version),
  unique (organization_id, id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict
);

create unique index lead_scores_current_unique
  on public.lead_scores (organization_id, lead_id)
  where is_current;
create index lead_scores_ranking_idx
  on public.lead_scores (organization_id, score desc)
  where is_current;

create table public.lead_score_factors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_score_id uuid not null,
  factor_key text not null,
  label text not null,
  explanation text not null,
  contribution smallint not null check (contribution between -100 and 100),
  confidence public.confidence_level not null,
  source_id uuid,
  created_at timestamptz not null default now(),
  foreign key (organization_id, lead_score_id)
    references public.lead_scores(organization_id, id) on delete restrict,
  foreign key (organization_id, source_id)
    references public.lead_sources(organization_id, id) on delete restrict
);

create index lead_score_factors_score_idx
  on public.lead_score_factors (organization_id, lead_score_id);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  author_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict
);

create index lead_notes_lead_idx on public.lead_notes (organization_id, lead_id, created_at desc);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 50),
  color text not null default '#475569' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (organization_id, id)
);

create table public.lead_tags (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  tag_id uuid not null,
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (organization_id, lead_id, tag_id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict,
  foreign key (organization_id, tag_id)
    references public.tags(organization_id, id) on delete restrict
);

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 100),
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (organization_id, id)
);

create table public.lead_lists (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  list_id uuid not null,
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (organization_id, lead_id, list_id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict,
  foreign key (organization_id, list_id)
    references public.lists(organization_id, id) on delete restrict
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid,
  actor_id uuid references public.profiles(id) on delete set null,
  type public.activity_type not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict
);

create index activities_lead_idx on public.activities (organization_id, lead_id, occurred_at desc);
create index activities_organization_idx on public.activities (organization_id, occurred_at desc);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  title text not null check (char_length(trim(title)) between 2 and 200),
  potential_value numeric(14, 2) check (potential_value is null or potential_value >= 0),
  proposal_value numeric(14, 2) check (proposal_value is null or proposal_value >= 0),
  closed_revenue numeric(14, 2) check (closed_revenue is null or closed_revenue >= 0),
  probability smallint check (probability is null or probability between 0 and 100),
  proposed_at timestamptz,
  closed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict
);

create index opportunities_lead_idx on public.opportunities (organization_id, lead_id);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  provider_kind text not null,
  adapter text not null,
  state public.integration_state not null default 'NOT_CONFIGURED',
  capabilities text[] not null default '{}',
  display_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(display_metadata) = 'object'),
  secret_reference text,
  last_checked_at timestamptz,
  last_error_code text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider_kind, adapter),
  unique (organization_id, id)
);

create table public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  connection_id uuid not null,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  provider text not null check (provider in ('gmail', 'microsoft')),
  email_address text not null,
  display_name text,
  encrypted_token_reference text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider, email_address),
  unique (organization_id, id),
  foreign key (organization_id, connection_id)
    references public.integration_connections(organization_id, id) on delete restrict
);

create table public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  contact_id uuid,
  email_account_id uuid,
  channel public.message_channel not null,
  tone text not null check (tone in ('CONSULTATIVE', 'EXECUTIVE', 'DIRECT', 'PROFESSIONAL_INFORMAL', 'SHORT')),
  recipient text,
  subject text,
  body text not null check (char_length(trim(body)) > 0),
  cta text,
  evidence_source_ids uuid[] not null default '{}',
  status public.message_status not null default 'DRAFT',
  provider text,
  provider_message_id text,
  generation_model text,
  generated_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  sent_by uuid references public.profiles(id) on delete set null,
  sent_at timestamptz,
  error_code text,
  error_message text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict,
  foreign key (organization_id, contact_id)
    references public.lead_contacts(organization_id, id) on delete restrict,
  foreign key (organization_id, email_account_id)
    references public.email_accounts(organization_id, id) on delete restrict,
  check ((status not in ('APPROVED', 'QUEUED', 'SENT', 'DELIVERED')) or (approved_by is not null and approved_at is not null)),
  check ((status not in ('SENT', 'DELIVERED')) or sent_at is not null)
);

create index outreach_messages_lead_idx
  on public.outreach_messages (organization_id, lead_id, created_at desc);
create index outreach_messages_status_idx
  on public.outreach_messages (organization_id, status, created_at desc);

create table public.email_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  outreach_message_id uuid not null,
  event_type text not null,
  provider_event_id text,
  provider_timestamp timestamptz,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (organization_id, outreach_message_id)
    references public.outreach_messages(organization_id, id) on delete restrict
);

create unique index email_events_provider_unique
  on public.email_events (organization_id, provider_event_id)
  where provider_event_id is not null;

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  outreach_message_id uuid,
  status public.followup_status not null default 'PENDING',
  due_at timestamptz not null,
  cadence_name text,
  cadence_position smallint not null default 0 check (cadence_position >= 0),
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict,
  foreign key (organization_id, outreach_message_id)
    references public.outreach_messages(organization_id, id) on delete restrict,
  check ((status <> 'COMPLETED') or completed_at is not null),
  check ((status <> 'CANCELLED') or cancelled_at is not null)
);

create index followups_due_idx
  on public.followups (organization_id, status, due_at)
  where status = 'PENDING';

create table public.searches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  original_query text,
  filters jsonb not null default '{}'::jsonb check (jsonb_typeof(filters) = 'object'),
  provider text not null,
  status public.job_status not null default 'PENDING',
  result_count integer not null default 0 check (result_count >= 0),
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.search_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  search_id uuid not null,
  lead_id uuid,
  provider_result_id text,
  provider_payload jsonb not null default '{}'::jsonb check (jsonb_typeof(provider_payload) = 'object'),
  deduplication_status public.deduplication_status not null default 'UNIQUE',
  matched_lead_id uuid,
  created_at timestamptz not null default now(),
  foreign key (organization_id, search_id)
    references public.searches(organization_id, id) on delete restrict,
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict,
  foreign key (organization_id, matched_lead_id)
    references public.leads(organization_id, id) on delete restrict
);

create unique index search_results_provider_unique
  on public.search_results (organization_id, search_id, provider_result_id)
  where provider_result_id is not null;

create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid,
  search_id uuid,
  job_type text not null,
  status public.job_status not null default 'PENDING',
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  attempt_count smallint not null default 0 check (attempt_count >= 0),
  max_attempts smallint not null default 3 check (max_attempts between 1 and 10),
  available_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  error_code text,
  error_message text,
  correlation_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict,
  foreign key (organization_id, search_id)
    references public.searches(organization_id, id) on delete restrict
);

create index processing_jobs_available_idx
  on public.processing_jobs (status, available_at)
  where status = 'PENDING';

create table public.contact_suppressions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  scope text not null check (scope in ('company', 'channel', 'address')),
  channel public.message_channel,
  address text,
  reason text not null check (char_length(trim(reason)) > 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  removed_by uuid references public.profiles(id) on delete set null,
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, lead_id)
    references public.leads(organization_id, id) on delete restrict,
  check (
    (scope = 'company' and channel is null and address is null)
    or (scope = 'channel' and channel is not null and address is null)
    or (scope = 'address' and channel is not null and address is not null)
  )
);

create unique index contact_suppressions_active_unique
  on public.contact_suppressions (
    organization_id,
    lead_id,
    scope,
    channel,
    address
  ) nulls not distinct
  where removed_at is null;

create table public.rate_limit_events (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count >= 1),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id, action, window_start)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  request_id uuid not null,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx
  on public.audit_logs (organization_id, entity_type, entity_id, created_at desc);
create index audit_logs_request_idx on public.audit_logs (organization_id, request_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger organization_members_set_updated_at
  before update on public.organization_members
  for each row execute function public.set_updated_at();
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();
create trigger lead_contacts_set_updated_at
  before update on public.lead_contacts
  for each row execute function public.set_updated_at();
create trigger lead_notes_set_updated_at
  before update on public.lead_notes
  for each row execute function public.set_updated_at();
create trigger tags_set_updated_at
  before update on public.tags
  for each row execute function public.set_updated_at();
create trigger lists_set_updated_at
  before update on public.lists
  for each row execute function public.set_updated_at();
create trigger opportunities_set_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();
create trigger integration_connections_set_updated_at
  before update on public.integration_connections
  for each row execute function public.set_updated_at();
create trigger email_accounts_set_updated_at
  before update on public.email_accounts
  for each row execute function public.set_updated_at();
create trigger outreach_messages_set_updated_at
  before update on public.outreach_messages
  for each row execute function public.set_updated_at();
create trigger followups_set_updated_at
  before update on public.followups
  for each row execute function public.set_updated_at();
create trigger searches_set_updated_at
  before update on public.searches
  for each row execute function public.set_updated_at();
create trigger processing_jobs_set_updated_at
  before update on public.processing_jobs
  for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.leads enable row level security;
alter table public.lead_sources enable row level security;
alter table public.lead_contacts enable row level security;
alter table public.lead_research enable row level security;
alter table public.lead_scores enable row level security;
alter table public.lead_score_factors enable row level security;
alter table public.lead_notes enable row level security;
alter table public.tags enable row level security;
alter table public.lead_tags enable row level security;
alter table public.lists enable row level security;
alter table public.lead_lists enable row level security;
alter table public.activities enable row level security;
alter table public.opportunities enable row level security;
alter table public.integration_connections enable row level security;
alter table public.email_accounts enable row level security;
alter table public.outreach_messages enable row level security;
alter table public.email_events enable row level security;
alter table public.followups enable row level security;
alter table public.searches enable row level security;
alter table public.search_results enable row level security;
alter table public.processing_jobs enable row level security;
alter table public.contact_suppressions enable row level security;
alter table public.rate_limit_events enable row level security;
alter table public.audit_logs enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to authenticated;
