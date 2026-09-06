-- Guards also cover writes made directly through the authenticated Data API.
create function private.guard_followup_write()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if (select auth.uid()) is null or not private.is_organization_member(new.organization_id) then
    raise exception 'Active membership required' using errcode = '42501';
  end if;
  perform 1 from public.leads where organization_id = new.organization_id and id = new.lead_id for update;
  if not found then raise exception 'Lead not found' using errcode = 'P0002'; end if;
  if not exists (select 1 from public.organization_members where organization_id = new.organization_id and user_id = new.owner_id and status = 'active') then
    raise exception 'Owner must be an active member' using errcode = '23514';
  end if;
  if tg_op = 'INSERT' then
    if new.status <> 'PENDING' or new.created_by is distinct from (select auth.uid()) or new.completed_at is not null or new.cancelled_at is not null then
      raise exception 'Invalid initial follow-up state' using errcode = '23514';
    end if;
  else
    if new.organization_id is distinct from old.organization_id or new.lead_id is distinct from old.lead_id or new.created_by is distinct from old.created_by then
      raise exception 'Follow-up identity is immutable' using errcode = '42501';
    end if;
    if old.status <> 'PENDING' then raise exception 'Follow-up already finished' using errcode = '40001'; end if;
    new.completed_at := case when new.status = 'COMPLETED' then now() else null end;
    new.cancelled_at := case when new.status = 'CANCELLED' then now() else null end;
  end if;
  return new;
end;
$$;
revoke all on function private.guard_followup_write() from public, anon, authenticated;
create trigger followups_guard before insert or update on public.followups for each row execute function private.guard_followup_write();

create function private.record_followup_activity()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.activities (organization_id, lead_id, actor_id, type, title, metadata)
  values (new.organization_id, new.lead_id, (select auth.uid()),
    case when tg_op = 'INSERT' then 'FOLLOWUP_CREATED'::public.activity_type
      when new.status = 'COMPLETED' then 'FOLLOWUP_COMPLETED'::public.activity_type
      else 'UPDATED'::public.activity_type end,
    case when tg_op = 'INSERT' then 'Follow-up agendado'
      when new.status = 'COMPLETED' then 'Follow-up concluído'
      when new.status = 'CANCELLED' then 'Follow-up cancelado' else 'Follow-up atualizado' end,
    jsonb_build_object('followup_id', new.id, 'status', new.status, 'due_at', new.due_at));
  update public.leads set last_activity_at = now(), next_followup_at = (
    select min(due_at) from public.followups where organization_id = new.organization_id and lead_id = new.lead_id and status = 'PENDING'
  ) where organization_id = new.organization_id and id = new.lead_id;
  return new;
end;
$$;
revoke all on function private.record_followup_activity() from public, anon, authenticated;
create trigger followups_activity after insert or update on public.followups for each row execute function private.record_followup_activity();

create function public.create_followup(p_organization_id uuid, p_lead_id uuid, p_owner_id uuid, p_due_at timestamptz, p_cadence_name text default null, p_cadence_position smallint default 0)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare result uuid;
begin
  if p_due_at is null or not isfinite(p_due_at) then raise exception 'Invalid due date' using errcode = '23514'; end if;
  if char_length(p_cadence_name) > 100 then raise exception 'Cadence name too long' using errcode = '23514'; end if;
  insert into public.followups (organization_id, lead_id, owner_id, due_at, cadence_name, cadence_position, created_by)
  values (p_organization_id, p_lead_id, p_owner_id, p_due_at, nullif(trim(p_cadence_name), ''), p_cadence_position, (select auth.uid())) returning id into result;
  return result;
end;
$$;

create function public.finish_followup(p_organization_id uuid, p_followup_id uuid, p_status public.followup_status)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare target_lead uuid;
begin
  if p_status is null or p_status not in ('COMPLETED', 'CANCELLED') then raise exception 'Invalid final state' using errcode = '23514'; end if;
  select lead_id into target_lead from public.followups where organization_id = p_organization_id and id = p_followup_id;
  if not found then raise exception 'Follow-up not found' using errcode = 'P0002'; end if;
  -- Lock parent first, consistent with create, to serialize next_followup_at updates.
  perform 1 from public.leads where organization_id = p_organization_id and id = target_lead for update;
  update public.followups set status = p_status where organization_id = p_organization_id and id = p_followup_id and status = 'PENDING';
  if not found then raise exception 'Follow-up already finished' using errcode = '40001'; end if;
  return target_lead;
end;
$$;
revoke all on function public.create_followup(uuid, uuid, uuid, timestamptz, text, smallint) from public, anon;
revoke all on function public.finish_followup(uuid, uuid, public.followup_status) from public, anon;
grant execute on function public.create_followup(uuid, uuid, uuid, timestamptz, text, smallint) to authenticated;
grant execute on function public.finish_followup(uuid, uuid, public.followup_status) to authenticated;
