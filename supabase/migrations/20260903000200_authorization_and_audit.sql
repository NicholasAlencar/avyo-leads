create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.organization_members as membership
      where membership.organization_id = target_organization_id
        and membership.user_id = (select auth.uid())
        and membership.status = 'active'::public.membership_status
    );
$$;

create or replace function private.has_organization_role(
  target_organization_id uuid,
  allowed_roles public.organization_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.organization_members as membership
      where membership.organization_id = target_organization_id
        and membership.user_id = (select auth.uid())
        and membership.status = 'active'::public.membership_status
        and membership.role = any(allowed_roles)
    );
$$;

create or replace function private.can_read_profile(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    target_user_id = (select auth.uid())
    or exists (
      select 1
      from public.organization_members as current_membership
      join public.organization_members as target_membership
        on target_membership.organization_id = current_membership.organization_id
      where current_membership.user_id = (select auth.uid())
        and current_membership.status = 'active'::public.membership_status
        and target_membership.user_id = target_user_id
        and target_membership.status = 'active'::public.membership_status
    );
$$;

revoke all on function private.is_organization_member(uuid) from public, anon, authenticated;
revoke all on function private.has_organization_role(uuid, public.organization_role[]) from public, anon, authenticated;
revoke all on function private.can_read_profile(uuid) from public, anon, authenticated;
grant execute on function private.is_organization_member(uuid) to authenticated;
grant execute on function private.has_organization_role(uuid, public.organization_role[]) to authenticated;
grant execute on function private.can_read_profile(uuid) to authenticated;

grant select on public.organizations to authenticated;
grant update (name, slug, updated_at) on public.organizations to authenticated;

create policy organizations_select_members
on public.organizations
for select
to authenticated
using ((select private.is_organization_member(id)));

create policy organizations_update_admins
on public.organizations
for update
to authenticated
using ((select private.has_organization_role(id, array['admin']::public.organization_role[])))
with check ((select private.has_organization_role(id, array['admin']::public.organization_role[])));

grant select on public.profiles to authenticated;
grant update (display_name, job_title, updated_at) on public.profiles to authenticated;

create policy profiles_select_colleagues
on public.profiles
for select
to authenticated
using ((select private.can_read_profile(id)));

create policy profiles_update_self
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

grant select, insert, update, delete on public.organization_members to authenticated;

create policy organization_members_select_members
on public.organization_members
for select
to authenticated
using ((select private.is_organization_member(organization_id)));

create policy organization_members_insert_admins
on public.organization_members
for insert
to authenticated
with check ((select private.has_organization_role(organization_id, array['admin']::public.organization_role[])));

create policy organization_members_update_admins
on public.organization_members
for update
to authenticated
using ((select private.has_organization_role(organization_id, array['admin']::public.organization_role[])))
with check ((select private.has_organization_role(organization_id, array['admin']::public.organization_role[])));

create policy organization_members_delete_admins
on public.organization_members
for delete
to authenticated
using ((select private.has_organization_role(organization_id, array['admin']::public.organization_role[])));

grant select on
  public.leads,
  public.lead_sources,
  public.lead_contacts,
  public.lead_research,
  public.lead_scores,
  public.lead_score_factors,
  public.lead_notes,
  public.tags,
  public.lead_tags,
  public.lists,
  public.lead_lists,
  public.activities,
  public.opportunities,
  public.integration_connections,
  public.outreach_messages,
  public.email_events,
  public.followups,
  public.searches,
  public.search_results,
  public.processing_jobs,
  public.contact_suppressions,
  public.audit_logs
to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'leads',
    'lead_sources',
    'lead_contacts',
    'lead_research',
    'lead_scores',
    'lead_score_factors',
    'lead_notes',
    'tags',
    'lead_tags',
    'lists',
    'lead_lists',
    'activities',
    'opportunities',
    'integration_connections',
    'outreach_messages',
    'email_events',
    'followups',
    'searches',
    'search_results',
    'processing_jobs',
    'contact_suppressions',
    'audit_logs'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select private.is_organization_member(organization_id)))',
      table_name || '_select_members',
      table_name
    );
  end loop;
end;
$$;

grant insert, update on
  public.leads,
  public.lead_contacts,
  public.lead_notes,
  public.tags,
  public.lists,
  public.opportunities,
  public.followups,
  public.contact_suppressions
to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'leads',
    'lead_contacts',
    'lead_notes',
    'tags',
    'lists',
    'opportunities',
    'followups',
    'contact_suppressions'
  ]
  loop
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.is_organization_member(organization_id)))',
      table_name || '_insert_members',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.is_organization_member(organization_id))) with check ((select private.is_organization_member(organization_id)))',
      table_name || '_update_members',
      table_name
    );
  end loop;
end;
$$;

grant insert, delete on public.lead_tags, public.lead_lists to authenticated;

create policy lead_tags_insert_members
on public.lead_tags
for insert
to authenticated
with check ((select private.is_organization_member(organization_id)));

create policy lead_tags_delete_members
on public.lead_tags
for delete
to authenticated
using ((select private.is_organization_member(organization_id)));

create policy lead_lists_insert_members
on public.lead_lists
for insert
to authenticated
with check ((select private.is_organization_member(organization_id)));

create policy lead_lists_delete_members
on public.lead_lists
for delete
to authenticated
using ((select private.is_organization_member(organization_id)));

grant insert on public.activities to authenticated;

create policy activities_insert_members
on public.activities
for insert
to authenticated
with check (
  (select private.is_organization_member(organization_id))
  and actor_id = (select auth.uid())
);

grant select, insert, update, delete on public.integration_connections to authenticated;

create policy integration_connections_insert_admins
on public.integration_connections
for insert
to authenticated
with check ((select private.has_organization_role(organization_id, array['admin']::public.organization_role[])));

create policy integration_connections_update_admins
on public.integration_connections
for update
to authenticated
using ((select private.has_organization_role(organization_id, array['admin']::public.organization_role[])))
with check ((select private.has_organization_role(organization_id, array['admin']::public.organization_role[])));

create policy integration_connections_delete_admins
on public.integration_connections
for delete
to authenticated
using ((select private.has_organization_role(organization_id, array['admin']::public.organization_role[])));

grant select, insert, update, delete on public.email_accounts to authenticated;

create policy email_accounts_select_owner_or_admin
on public.email_accounts
for select
to authenticated
using (
  owner_id = (select auth.uid())
  or (select private.has_organization_role(organization_id, array['admin']::public.organization_role[]))
);

create policy email_accounts_insert_owner_or_admin
on public.email_accounts
for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  or (select private.has_organization_role(organization_id, array['admin']::public.organization_role[]))
);

create policy email_accounts_update_owner_or_admin
on public.email_accounts
for update
to authenticated
using (
  owner_id = (select auth.uid())
  or (select private.has_organization_role(organization_id, array['admin']::public.organization_role[]))
)
with check (
  owner_id = (select auth.uid())
  or (select private.has_organization_role(organization_id, array['admin']::public.organization_role[]))
);

create policy email_accounts_delete_owner_or_admin
on public.email_accounts
for delete
to authenticated
using (
  owner_id = (select auth.uid())
  or (select private.has_organization_role(organization_id, array['admin']::public.organization_role[]))
);

grant insert, update on public.outreach_messages to authenticated;

create policy outreach_messages_insert_drafts
on public.outreach_messages
for insert
to authenticated
with check (
  (select private.is_organization_member(organization_id))
  and created_by = (select auth.uid())
  and status in ('DRAFT', 'GENERATED', 'REVIEWED')
);

create policy outreach_messages_update_drafts
on public.outreach_messages
for update
to authenticated
using (
  (select private.is_organization_member(organization_id))
  and status in ('DRAFT', 'GENERATED', 'REVIEWED')
)
with check (
  (select private.is_organization_member(organization_id))
  and status in ('DRAFT', 'GENERATED', 'REVIEWED')
);

grant insert on public.searches to authenticated;

create policy searches_insert_members
on public.searches
for insert
to authenticated
with check (
  (select private.is_organization_member(organization_id))
  and requested_by = (select auth.uid())
);

create or replace function private.capture_audit_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  row_data jsonb;
  organization uuid;
  entity uuid;
  before_snapshot jsonb;
  after_snapshot jsonb;
begin
  if tg_op = 'DELETE' then
    row_data := to_jsonb(old);
  else
    row_data := to_jsonb(new);
  end if;

  organization := (row_data ->> 'organization_id')::uuid;

  if actor is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if not private.is_organization_member(organization) then
    raise exception 'Actor is not an active organization member' using errcode = '42501';
  end if;

  if row_data ? 'id' then
    entity := (row_data ->> 'id')::uuid;
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    before_snapshot := to_jsonb(old) - array[
      'secret_reference',
      'encrypted_token_reference',
      'error_message',
      'payload',
      'provider_payload'
    ];
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    after_snapshot := to_jsonb(new) - array[
      'secret_reference',
      'encrypted_token_reference',
      'error_message',
      'payload',
      'provider_payload'
    ];
  end if;

  insert into public.audit_logs (
    organization_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    before_data,
    after_data,
    request_id
  )
  values (
    organization,
    actor,
    lower(tg_op),
    tg_table_name,
    entity,
    before_snapshot,
    after_snapshot,
    gen_random_uuid()
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.capture_audit_event() from public, anon, authenticated;

create trigger organization_members_audit
  after insert or update or delete on public.organization_members
  for each row execute function private.capture_audit_event();
create trigger leads_audit
  after insert or update or delete on public.leads
  for each row execute function private.capture_audit_event();
create trigger lead_contacts_audit
  after insert or update or delete on public.lead_contacts
  for each row execute function private.capture_audit_event();
create trigger lead_notes_audit
  after insert or update or delete on public.lead_notes
  for each row execute function private.capture_audit_event();
create trigger tags_audit
  after insert or update or delete on public.tags
  for each row execute function private.capture_audit_event();
create trigger lead_tags_audit
  after insert or delete on public.lead_tags
  for each row execute function private.capture_audit_event();
create trigger lists_audit
  after insert or update or delete on public.lists
  for each row execute function private.capture_audit_event();
create trigger lead_lists_audit
  after insert or delete on public.lead_lists
  for each row execute function private.capture_audit_event();
create trigger opportunities_audit
  after insert or update or delete on public.opportunities
  for each row execute function private.capture_audit_event();
create trigger integration_connections_audit
  after insert or update or delete on public.integration_connections
  for each row execute function private.capture_audit_event();
create trigger email_accounts_audit
  after insert or update or delete on public.email_accounts
  for each row execute function private.capture_audit_event();
create trigger outreach_messages_audit
  after insert or update or delete on public.outreach_messages
  for each row execute function private.capture_audit_event();
create trigger followups_audit
  after insert or update or delete on public.followups
  for each row execute function private.capture_audit_event();
create trigger contact_suppressions_audit
  after insert or update or delete on public.contact_suppressions
  for each row execute function private.capture_audit_event();
