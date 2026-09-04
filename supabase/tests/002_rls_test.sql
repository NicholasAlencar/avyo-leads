begin;

create extension if not exists pgtap with schema extensions;

select plan(5);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('10000000-0000-4000-8000-000000000001', 'member-a@vio.local', '{}'),
  ('10000000-0000-4000-8000-000000000002', 'member-b@vio.local', '{}'),
  ('10000000-0000-4000-8000-000000000003', 'admin-a@vio.local', '{}');

insert into public.profiles (id, display_name, email)
values
  ('10000000-0000-4000-8000-000000000001', 'Member A', 'member-a@vio.local'),
  ('10000000-0000-4000-8000-000000000002', 'Member B', 'member-b@vio.local'),
  ('10000000-0000-4000-8000-000000000003', 'Admin A', 'admin-a@vio.local');

insert into public.organizations (id, name, slug)
values
  ('20000000-0000-4000-8000-000000000001', 'VIO A', 'vio-a'),
  ('20000000-0000-4000-8000-000000000002', 'VIO B', 'vio-b');

insert into public.organization_members (organization_id, user_id, role, status, joined_at)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'member', 'active', now()),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'admin', 'active', now()),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'admin', 'active', now());

insert into public.leads (id, organization_id, company_name, normalized_name)
values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Lead A', 'lead a'),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Lead B', 'lead b');

insert into public.integration_connections (id, organization_id, provider_kind, adapter)
values ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'supabase', 'supabase');

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000001';

select results_eq(
  $$ select company_name from public.leads order by company_name $$,
  $$ values ('Lead A'::text) $$,
  'member sees only leads from an active organization membership'
);

select results_eq(
  $$ update public.leads set company_name = 'Blocked' where id = '30000000-0000-4000-8000-000000000002' returning id $$,
  $$ select id from public.leads where false $$,
  'member cannot update another organization lead'
);

select results_eq(
  $$ update public.integration_connections set adapter = 'blocked' returning id $$,
  $$ select id from public.integration_connections where false $$,
  'member cannot update organization integrations'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000003';

select results_eq(
  $$ update public.integration_connections set state = 'CONFIGURED' returning id $$,
  $$ values ('40000000-0000-4000-8000-000000000001'::uuid) $$,
  'organization admin can update integrations'
);

select is(
  (select count(*) from public.organization_members),
  2::bigint,
  'member listing stays scoped to the active organization'
);

select * from finish();

rollback;
