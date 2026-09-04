create or replace function public.add_lead_note_with_activity(
  p_organization_id uuid, p_actor_id uuid, p_lead_id uuid, p_body text
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare created_id uuid;
begin
  if (select auth.uid()) is null or p_actor_id <> (select auth.uid()) then
    raise exception 'Invalid actor' using errcode = '42501';
  end if;
  insert into public.lead_notes (organization_id, lead_id, body, author_id)
  values (p_organization_id, p_lead_id, trim(p_body), p_actor_id)
  returning id into created_id;
  insert into public.activities (organization_id, lead_id, actor_id, type, title)
  values (p_organization_id, p_lead_id, p_actor_id, 'NOTE_ADDED', 'Nota interna adicionada');
  return created_id;
end;
$$;

create or replace function public.attach_lead_tag_with_activity(
  p_organization_id uuid, p_actor_id uuid, p_lead_id uuid, p_name text
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare target_id uuid; inserted_count integer;
begin
  if (select auth.uid()) is null or p_actor_id <> (select auth.uid()) then
    raise exception 'Invalid actor' using errcode = '42501';
  end if;
  insert into public.tags (organization_id, name, created_by)
  values (p_organization_id, upper(trim(p_name)), p_actor_id)
  on conflict (organization_id, name) do update set name = excluded.name
  returning id into target_id;
  insert into public.lead_tags (organization_id, lead_id, tag_id, added_by)
  values (p_organization_id, p_lead_id, target_id, p_actor_id)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count > 0 then
    insert into public.activities (organization_id, lead_id, actor_id, type, title, metadata)
    values (p_organization_id, p_lead_id, p_actor_id, 'TAGGED', 'Tag adicionada', jsonb_build_object('tag_id', target_id));
  end if;
  return target_id;
end;
$$;

create or replace function public.attach_lead_list_with_activity(
  p_organization_id uuid, p_actor_id uuid, p_lead_id uuid, p_name text
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare target_id uuid; inserted_count integer;
begin
  if (select auth.uid()) is null or p_actor_id <> (select auth.uid()) then
    raise exception 'Invalid actor' using errcode = '42501';
  end if;
  insert into public.lists (organization_id, name, created_by)
  values (p_organization_id, trim(p_name), p_actor_id)
  on conflict (organization_id, name) do update set name = excluded.name
  returning id into target_id;
  insert into public.lead_lists (organization_id, lead_id, list_id, added_by)
  values (p_organization_id, p_lead_id, target_id, p_actor_id)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count > 0 then
    insert into public.activities (organization_id, lead_id, actor_id, type, title, metadata)
    values (p_organization_id, p_lead_id, p_actor_id, 'LISTED', 'Lead adicionado a uma lista', jsonb_build_object('list_id', target_id));
  end if;
  return target_id;
end;
$$;

create or replace function public.suppress_lead_contact_with_activity(
  p_organization_id uuid, p_actor_id uuid, p_lead_id uuid, p_reason text
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare suppression_id uuid;
begin
  if (select auth.uid()) is null or p_actor_id <> (select auth.uid()) then
    raise exception 'Invalid actor' using errcode = '42501';
  end if;
  insert into public.contact_suppressions (
    organization_id, lead_id, scope, reason, created_by
  ) values (p_organization_id, p_lead_id, 'company', trim(p_reason), p_actor_id)
  returning id into suppression_id;
  update public.leads set opted_out_at = now(), opt_out_reason = trim(p_reason), last_activity_at = now()
  where organization_id = p_organization_id and id = p_lead_id;
  insert into public.activities (organization_id, lead_id, actor_id, type, title, metadata)
  values (p_organization_id, p_lead_id, p_actor_id, 'SUPPRESSED', 'Contato bloqueado', jsonb_build_object('suppression_id', suppression_id));
  return suppression_id;
end;
$$;

create or replace function public.restore_lead_contact_with_activity(
  p_organization_id uuid, p_actor_id uuid, p_lead_id uuid
) returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  if (select auth.uid()) is null or p_actor_id <> (select auth.uid()) then
    raise exception 'Invalid actor' using errcode = '42501';
  end if;
  update public.contact_suppressions
  set removed_at = now(), removed_by = p_actor_id
  where organization_id = p_organization_id and lead_id = p_lead_id
    and scope = 'company' and removed_at is null;
  if not found then raise exception 'Active suppression not found' using errcode = 'P0002'; end if;
  update public.leads set opted_out_at = null, opt_out_reason = null, last_activity_at = now()
  where organization_id = p_organization_id and id = p_lead_id;
  insert into public.activities (organization_id, lead_id, actor_id, type, title)
  values (p_organization_id, p_lead_id, p_actor_id, 'RESTORED', 'Permissão de contato restaurada');
end;
$$;

revoke all on function public.add_lead_note_with_activity(uuid, uuid, uuid, text) from public, anon;
revoke all on function public.attach_lead_tag_with_activity(uuid, uuid, uuid, text) from public, anon;
revoke all on function public.attach_lead_list_with_activity(uuid, uuid, uuid, text) from public, anon;
revoke all on function public.suppress_lead_contact_with_activity(uuid, uuid, uuid, text) from public, anon;
revoke all on function public.restore_lead_contact_with_activity(uuid, uuid, uuid) from public, anon;
grant execute on function public.add_lead_note_with_activity(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.attach_lead_tag_with_activity(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.attach_lead_list_with_activity(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.suppress_lead_contact_with_activity(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.restore_lead_contact_with_activity(uuid, uuid, uuid) to authenticated;
