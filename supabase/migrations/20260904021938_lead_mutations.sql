create or replace function public.create_lead_with_activity(
  p_organization_id uuid,
  p_actor_id uuid,
  p_lead jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_id uuid;
begin
  if (select auth.uid()) is null or p_actor_id <> (select auth.uid()) then
    raise exception 'Invalid actor' using errcode = '42501';
  end if;

  insert into public.leads (
    organization_id, company_name, normalized_name, legal_name, trading_name,
    segment, category, description, cnpj, normalized_cnpj, state_code, city,
    district, address_line, postal_code, phone, normalized_phone, whatsapp,
    email, website_url, normalized_domain, instagram_url, linkedin_url,
    google_maps_url, google_place_id, potential_value, found_by
  ) values (
    p_organization_id,
    p_lead ->> 'companyName',
    p_lead ->> 'normalizedName',
    p_lead ->> 'legalName',
    p_lead ->> 'tradingName',
    p_lead ->> 'segment',
    p_lead ->> 'category',
    p_lead ->> 'description',
    p_lead ->> 'cnpj',
    p_lead ->> 'normalizedCnpj',
    p_lead ->> 'stateCode',
    p_lead ->> 'city',
    p_lead ->> 'district',
    p_lead ->> 'addressLine',
    p_lead ->> 'postalCode',
    p_lead ->> 'phone',
    p_lead ->> 'normalizedPhone',
    p_lead ->> 'whatsapp',
    p_lead ->> 'email',
    p_lead ->> 'websiteUrl',
    p_lead ->> 'normalizedDomain',
    p_lead ->> 'instagramUrl',
    p_lead ->> 'linkedinUrl',
    p_lead ->> 'googleMapsUrl',
    p_lead ->> 'googlePlaceId',
    nullif(p_lead ->> 'potentialValue', '')::numeric,
    p_actor_id
  )
  returning id into created_id;

  insert into public.activities (
    organization_id, lead_id, actor_id, type, title, metadata
  ) values (
    p_organization_id,
    created_id,
    p_actor_id,
    'CREATED',
    'Lead criado',
    jsonb_build_object('source', 'manual')
  );

  return created_id;
end;
$$;

create or replace function public.update_lead_with_activity(
  p_organization_id uuid,
  p_actor_id uuid,
  p_lead_id uuid,
  p_lead jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or p_actor_id <> (select auth.uid()) then
    raise exception 'Invalid actor' using errcode = '42501';
  end if;

  update public.leads set
    company_name = p_lead ->> 'companyName',
    normalized_name = p_lead ->> 'normalizedName',
    legal_name = p_lead ->> 'legalName',
    trading_name = p_lead ->> 'tradingName',
    segment = p_lead ->> 'segment',
    category = p_lead ->> 'category',
    description = p_lead ->> 'description',
    cnpj = p_lead ->> 'cnpj',
    normalized_cnpj = p_lead ->> 'normalizedCnpj',
    state_code = p_lead ->> 'stateCode',
    city = p_lead ->> 'city',
    district = p_lead ->> 'district',
    address_line = p_lead ->> 'addressLine',
    postal_code = p_lead ->> 'postalCode',
    phone = p_lead ->> 'phone',
    normalized_phone = p_lead ->> 'normalizedPhone',
    whatsapp = p_lead ->> 'whatsapp',
    email = p_lead ->> 'email',
    website_url = p_lead ->> 'websiteUrl',
    normalized_domain = p_lead ->> 'normalizedDomain',
    instagram_url = p_lead ->> 'instagramUrl',
    linkedin_url = p_lead ->> 'linkedinUrl',
    google_maps_url = p_lead ->> 'googleMapsUrl',
    google_place_id = p_lead ->> 'googlePlaceId',
    potential_value = nullif(p_lead ->> 'potentialValue', '')::numeric,
    last_activity_at = now()
  where id = p_lead_id and organization_id = p_organization_id;

  if not found then
    raise exception 'Lead not found' using errcode = 'P0002';
  end if;

  insert into public.activities (
    organization_id, lead_id, actor_id, type, title
  ) values (p_organization_id, p_lead_id, p_actor_id, 'UPDATED', 'Dados do lead atualizados');
end;
$$;

create or replace function public.assign_lead_with_activity(
  p_organization_id uuid,
  p_actor_id uuid,
  p_lead_id uuid,
  p_owner_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or p_actor_id <> (select auth.uid()) then
    raise exception 'Invalid actor' using errcode = '42501';
  end if;

  if p_owner_id is not null and not exists (
    select 1 from public.organization_members
    where organization_id = p_organization_id
      and user_id = p_owner_id
      and status = 'active'
  ) then
    raise exception 'Owner is not an active organization member' using errcode = '23514';
  end if;

  update public.leads
  set owner_id = p_owner_id, last_activity_at = now()
  where id = p_lead_id and organization_id = p_organization_id;

  if not found then
    raise exception 'Lead not found' using errcode = 'P0002';
  end if;

  insert into public.activities (
    organization_id, lead_id, actor_id, type, title, metadata
  ) values (
    p_organization_id,
    p_lead_id,
    p_actor_id,
    'ASSIGNED',
    case when p_owner_id is null then 'Responsável removido' else 'Responsável alterado' end,
    jsonb_build_object('owner_id', p_owner_id)
  );
end;
$$;

create or replace function public.change_lead_stage_with_activity(
  p_organization_id uuid,
  p_actor_id uuid,
  p_lead_id uuid,
  p_expected_stage public.pipeline_stage,
  p_next_stage public.pipeline_stage,
  p_confirmed boolean default false
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or p_actor_id <> (select auth.uid()) then
    raise exception 'Invalid actor' using errcode = '42501';
  end if;

  if p_expected_stage = p_next_stage then
    raise exception 'Lead is already in this stage' using errcode = '23514';
  end if;

  if not (
    (p_expected_stage = 'NEW' and p_next_stage = any(array['ANALYZING', 'PRIORITY', 'LOST']::public.pipeline_stage[])) or
    (p_expected_stage = 'ANALYZING' and p_next_stage = any(array['NEW', 'PRIORITY', 'LOST']::public.pipeline_stage[])) or
    (p_expected_stage = 'PRIORITY' and p_next_stage = any(array['ANALYZING', 'CONTACT_PREPARED', 'LOST']::public.pipeline_stage[])) or
    (p_expected_stage = 'CONTACT_PREPARED' and p_next_stage = any(array['PRIORITY', 'CONTACTED', 'LOST']::public.pipeline_stage[])) or
    (p_expected_stage = 'CONTACTED' and p_next_stage = any(array['CONTACT_PREPARED', 'RESPONDED', 'LOST']::public.pipeline_stage[])) or
    (p_expected_stage = 'RESPONDED' and p_next_stage = any(array['CONTACTED', 'MEETING_SCHEDULED', 'LOST']::public.pipeline_stage[])) or
    (p_expected_stage = 'MEETING_SCHEDULED' and p_next_stage = any(array['RESPONDED', 'PROPOSAL', 'LOST']::public.pipeline_stage[])) or
    (p_expected_stage = 'PROPOSAL' and p_next_stage = any(array['MEETING_SCHEDULED', 'NEGOTIATION', 'LOST']::public.pipeline_stage[])) or
    (p_expected_stage = 'NEGOTIATION' and p_next_stage = any(array['PROPOSAL', 'CLIENT', 'LOST']::public.pipeline_stage[])) or
    (p_expected_stage = 'CLIENT' and p_next_stage = 'LOST') or
    (p_expected_stage = 'LOST' and p_next_stage = any(array['ANALYZING', 'PRIORITY']::public.pipeline_stage[]))
  ) then
    raise exception 'Pipeline transition is not allowed' using errcode = '23514';
  end if;

  if p_expected_stage = 'CLIENT' and p_next_stage = 'LOST' and not p_confirmed then
    raise exception 'Explicit confirmation is required' using errcode = '23514';
  end if;

  update public.leads
  set
    pipeline_stage = p_next_stage,
    last_activity_at = now(),
    contacted_at = case
      when p_next_stage = 'CONTACTED' and contacted_at is null then now()
      else contacted_at
    end
  where id = p_lead_id
    and organization_id = p_organization_id
    and pipeline_stage = p_expected_stage;

  if not found then
    raise exception 'Lead changed or was not found' using errcode = '40001';
  end if;

  insert into public.activities (
    organization_id, lead_id, actor_id, type, title, metadata
  ) values (
    p_organization_id,
    p_lead_id,
    p_actor_id,
    'STAGE_CHANGED',
    'Etapa do pipeline alterada',
    jsonb_build_object('from', p_expected_stage, 'to', p_next_stage)
  );
end;
$$;

revoke all on function public.create_lead_with_activity(uuid, uuid, jsonb) from public, anon;
revoke all on function public.update_lead_with_activity(uuid, uuid, uuid, jsonb) from public, anon;
revoke all on function public.assign_lead_with_activity(uuid, uuid, uuid, uuid) from public, anon;
revoke all on function public.change_lead_stage_with_activity(uuid, uuid, uuid, public.pipeline_stage, public.pipeline_stage, boolean) from public, anon;

grant execute on function public.create_lead_with_activity(uuid, uuid, jsonb) to authenticated;
grant execute on function public.update_lead_with_activity(uuid, uuid, uuid, jsonb) to authenticated;
grant execute on function public.assign_lead_with_activity(uuid, uuid, uuid, uuid) to authenticated;
grant execute on function public.change_lead_stage_with_activity(uuid, uuid, uuid, public.pipeline_stage, public.pipeline_stage, boolean) to authenticated;
