begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

select has_table('public', 'organizations', 'organizations table exists');
select has_table('public', 'organization_members', 'organization_members table exists');
select has_table('public', 'leads', 'leads table exists');
select has_table('public', 'activities', 'activities table exists');
select has_table('public', 'audit_logs', 'audit_logs table exists');
select col_is_pk('public', 'leads', 'id', 'leads.id is the primary key');
select col_not_null('public', 'leads', 'organization_id', 'lead organization is required');
select col_not_null('public', 'leads', 'pipeline_stage', 'lead pipeline stage is required');

select * from finish();

rollback;
