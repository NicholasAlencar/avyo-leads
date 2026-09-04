begin;

create extension if not exists pgtap with schema extensions;

select plan(4);

insert into auth.users (id, email, raw_user_meta_data)
values ('11000000-0000-4000-8000-000000000001', 'auditor@vio.local', '{}');

insert into public.profiles (id, display_name, email)
values ('11000000-0000-4000-8000-000000000001', 'Auditor', 'auditor@vio.local');

insert into public.organizations (id, name, slug)
values ('21000000-0000-4000-8000-000000000001', 'VIO Audit', 'vio-audit');

insert into public.organization_members (organization_id, user_id, role, status, joined_at)
values (
  '21000000-0000-4000-8000-000000000001',
  '11000000-0000-4000-8000-000000000001',
  'member',
  'active',
  now()
);

insert into public.leads (id, organization_id, company_name, normalized_name)
values (
  '31000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000001',
  'Audit Lead',
  'audit lead'
);

set local role authenticated;
set local request.jwt.claim.sub = '11000000-0000-4000-8000-000000000001';

update public.leads
set pipeline_stage = 'ANALYZING'
where id = '31000000-0000-4000-8000-000000000001';

select is(
  (select count(*) from public.audit_logs where entity_id = '31000000-0000-4000-8000-000000000001'),
  1::bigint,
  'an authenticated lead mutation creates one audit record'
);

select throws_ok(
  $$ update public.audit_logs set action = 'tampered' $$,
  '42501',
  'permission denied for table audit_logs',
  'authenticated members cannot update audit records'
);

select throws_ok(
  $$ delete from public.audit_logs $$,
  '42501',
  'permission denied for table audit_logs',
  'authenticated members cannot delete audit records'
);

select is(
  (
    select actor_id
    from public.audit_logs
    where entity_id = '31000000-0000-4000-8000-000000000001'
    limit 1
  ),
  '11000000-0000-4000-8000-000000000001'::uuid,
  'audit records retain the authenticated actor'
);

select * from finish();

rollback;
