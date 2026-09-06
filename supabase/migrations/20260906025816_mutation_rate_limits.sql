create function private.consume_mutation_budget(p_organization_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare actor uuid := (select auth.uid()); bucket timestamptz := date_trunc('minute', now()); used integer;
begin
 if actor is null or not private.is_organization_member(p_organization_id) then
  raise exception 'Active membership required' using errcode = '42501';
 end if;
 insert into public.rate_limit_events (organization_id,user_id,action,window_start,request_count)
 values (p_organization_id,actor,'crm_mutation',bucket,1)
 on conflict (organization_id,user_id,action,window_start) do update
 set request_count = public.rate_limit_events.request_count + 1, updated_at = now()
 where public.rate_limit_events.request_count < 60 returning request_count into used;
 return used is not null;
end;
$$;
revoke all on function private.consume_mutation_budget(uuid) from public, anon, authenticated;
grant execute on function private.consume_mutation_budget(uuid) to authenticated;
create function public.consume_mutation_budget(p_organization_id uuid)
returns boolean language sql security invoker set search_path = '' as $$
 select private.consume_mutation_budget(p_organization_id);
$$;
revoke all on function public.consume_mutation_budget(uuid) from public, anon;
grant execute on function public.consume_mutation_budget(uuid) to authenticated;
