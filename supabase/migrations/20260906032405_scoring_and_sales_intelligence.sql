create or replace function public.calculate_vio_lead_score(
  p_organization_id uuid,
  p_lead_id uuid
)
returns smallint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_lead public.leads%rowtype;
  v_score_id uuid;
  v_score smallint := 0;
  v_version integer;
  v_class public.score_classification;
begin
  if v_user is null or not private.is_organization_member(p_organization_id) then raise exception 'not authorized'; end if;
  select * into v_lead from public.leads where id=p_lead_id and organization_id=p_organization_id and discarded_at is null for update;
  if not found then raise exception 'lead not found'; end if;

  v_score := least(100,
    case when coalesce(v_lead.unit_count,0)>=3 then 25 when coalesce(v_lead.unit_count,0)=2 then 18 else 0 end +
    case when coalesce(v_lead.google_review_count,0)>=500 then 20 when coalesce(v_lead.google_review_count,0)>=100 then 12 when coalesce(v_lead.google_review_count,0)>=25 then 6 else 0 end +
    case when v_lead.website_url is not null then 8 else 0 end +
    case when v_lead.instagram_url is not null then 7 else 0 end +
    case when v_lead.linkedin_url is not null then 5 else 0 end +
    case when v_lead.phone is not null or v_lead.whatsapp is not null or v_lead.email is not null then 5 else 0 end +
    case when coalesce(v_lead.description,'') ~* '(expans|nova unidade|contrat|e-commerce|franquia|b2b)' then 20 else 0 end +
    case when coalesce(v_lead.description,'') ~* '(serviços|especialidades|unidades|canais)' then 10 else 0 end
  );
  v_class := case when v_score>=80 then 'VERY_HOT' when v_score>=65 then 'HOT' when v_score>=50 then 'PROMISING' when v_score>=30 then 'MONITOR' else 'LOW_PRIORITY' end;
  select coalesce(max(version),0)+1 into v_version from public.lead_scores where organization_id=p_organization_id and lead_id=p_lead_id;
  update public.lead_scores set is_current=false where organization_id=p_organization_id and lead_id=p_lead_id and is_current;
  insert into public.lead_scores(organization_id,lead_id,version,score,classification,conclusion,rules_version,calculated_by)
  values(p_organization_id,p_lead_id,v_version,v_score,v_class,
    'A nota representa potencial de contratação de consultoria financeira com base exclusivamente nos sinais públicos registrados. Não indica dificuldade financeira.',
    'vio-rules-1.0',v_user) returning id into v_score_id;

  if coalesce(v_lead.unit_count,0)>=2 then insert into public.lead_score_factors values(gen_random_uuid(),p_organization_id,v_score_id,'multiple_units','Operação multiunidade',format('%s unidades registradas aumentam a complexidade operacional.',v_lead.unit_count),case when v_lead.unit_count>=3 then 25 else 18 end,'HIGH',null,now()); end if;
  if coalesce(v_lead.google_review_count,0)>=25 then insert into public.lead_score_factors values(gen_random_uuid(),p_organization_id,v_score_id,'review_volume','Volume de avaliações',format('%s avaliações públicas sugerem operação com volume relevante.',v_lead.google_review_count),case when v_lead.google_review_count>=500 then 20 when v_lead.google_review_count>=100 then 12 else 6 end,'HIGH',null,now()); end if;
  if v_lead.website_url is not null then insert into public.lead_score_factors values(gen_random_uuid(),p_organization_id,v_score_id,'official_site','Site oficial','Possui site oficial registrado.',8,'HIGH',null,now()); end if;
  if v_lead.instagram_url is not null then insert into public.lead_score_factors values(gen_random_uuid(),p_organization_id,v_score_id,'instagram','Presença no Instagram','Possui perfil público registrado.',7,'HIGH',null,now()); end if;
  if v_lead.linkedin_url is not null then insert into public.lead_score_factors values(gen_random_uuid(),p_organization_id,v_score_id,'linkedin','Presença no LinkedIn','Possui página pública registrada.',5,'HIGH',null,now()); end if;
  if coalesce(v_lead.description,'') ~* '(expans|nova unidade|contrat|e-commerce|franquia|b2b)' then insert into public.lead_score_factors values(gen_random_uuid(),p_organization_id,v_score_id,'growth_signal','Sinal de crescimento','A descrição pública registrada contém sinal de expansão ou crescimento.',20,'MEDIUM',null,now()); end if;

  insert into public.lead_research(organization_id,lead_id,version,summary,company_overview,opportunity_reason,hypothetical_pain,recommended_service,structured_findings,provider,model,created_by)
  values(p_organization_id,p_lead_id,v_version,
    concat(v_lead.company_name,' atua em ',coalesce(v_lead.segment,v_lead.category,'segmento não informado'),coalesce(' em '||v_lead.city,''),'.'),
    coalesce(v_lead.description,'Visão geral limitada aos dados públicos atualmente registrados.'),
    'Os sinais registrados podem indicar necessidade de maior previsibilidade, controle e apoio à tomada de decisão financeira.',
    'Como hipótese, o crescimento ou a complexidade operacional podem ampliar a necessidade de controle de margem, fluxo de caixa, orçamento e indicadores.',
    case when coalesce(v_lead.unit_count,0)>=2 then 'Planejamento financeiro, análise de margem por unidade e orçamento.' else 'Diagnóstico financeiro, fluxo de caixa, DRE gerencial e indicadores.' end,
    jsonb_build_object('score',v_score,'rules_version','vio-rules-1.0'),'rules','vio-rules-1.0',v_user);
  insert into public.activities(organization_id,lead_id,actor_id,type,title,description) values(p_organization_id,p_lead_id,v_user,'UPDATED','VIO Lead Score calculado',format('Score explicável atualizado para %s/100.',v_score));
  return v_score;
end;
$$;

revoke all on function public.calculate_vio_lead_score(uuid,uuid) from public, anon;
grant execute on function public.calculate_vio_lead_score(uuid,uuid) to authenticated;
