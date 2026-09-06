import Link from "next/link";
import { Building2, ExternalLink, Search, Settings2, Target } from "@/components/ui/icons";
import { Badge, EmptyState, PageHeading, Surface } from "@/components/ui/primitives";
import { requireMember } from "@/features/auth/require-member";
import { searchGooglePlaces } from "@/features/search/google-places";
import { companySearchSchema } from "@/features/search/schema";

const field = "h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10";

export default async function FindCompaniesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireMember();
  const params = await searchParams;
  const attempted = params.buscar === "1";
  const parsed = companySearchSchema.safeParse({ state: params.state, city: params.city, district: params.district, segment: params.segment, keyword: params.keyword, limit: params.limit });
  const searchData = parsed.success ? parsed.data : null;
  const result = attempted && searchData ? await searchGooglePlaces(searchData) : null;

  return (
    <section className="mx-auto max-w-[1500px]">
      <PageHeading eyebrow="Descoberta de oportunidades" title="Encontrar empresas" description="Defina o mercado, consulte fontes oficiais e revise cada empresa antes de adicioná-la ao CRM." />
      <div className="mt-6 grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Surface className="h-fit p-5 xl:sticky xl:top-[92px]">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Search className="size-5" /></span><div><h2 className="text-sm font-semibold">Critérios da busca</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Localização e perfil comercial</p></div></div>
          <form className="mt-5 space-y-4">
            <input name="buscar" type="hidden" value="1" />
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">Estado<input className={`${field} mt-1.5`} defaultValue={typeof params.state === "string" ? params.state : "São Paulo"} name="state" required /></label>
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">Cidade<input className={`${field} mt-1.5`} defaultValue={typeof params.city === "string" ? params.city : ""} name="city" placeholder="Ex.: Mogi das Cruzes" required /></label>
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">Bairro<input className={`${field} mt-1.5`} defaultValue={typeof params.district === "string" ? params.district : ""} name="district" placeholder="Opcional" /></label>
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">Segmento<input className={`${field} mt-1.5`} defaultValue={typeof params.segment === "string" ? params.segment : ""} name="segment" placeholder="Clínicas odontológicas" required /></label>
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">Palavra-chave<input className={`${field} mt-1.5`} defaultValue={typeof params.keyword === "string" ? params.keyword : ""} name="keyword" placeholder="Opcional" /></label>
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">Quantidade<select className={`${field} mt-1.5`} defaultValue={typeof params.limit === "string" ? params.limit : "10"} name="limit"><option>5</option><option>10</option><option>20</option></select></label>
            <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,92,255,.2)] hover:bg-[var(--brand-primary-hover)]" type="submit"><Target className="size-[18px]" />Buscar leads</button>
          </form>
        </Surface>

        <div className="space-y-4">
          <Surface className="flex flex-wrap items-center justify-between gap-4 p-4"><div className="flex items-center gap-3"><span className={`size-2.5 rounded-full ${result?.ok ? "bg-emerald-500" : "bg-amber-400"}`} /><div><p className="text-xs font-semibold text-[var(--text-primary)]">Google Places / Maps</p><p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">Somente dados públicos retornados pela API oficial.</p></div></div><Badge tone={result?.ok ? "success" : "warning"}>{result?.ok ? "Fonte disponível" : "Verificação necessária"}</Badge></Surface>
          {attempted && !parsed.success ? <Surface className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Preencha estado, cidade e segmento corretamente.</Surface> : null}
          {result && !result.ok ? <Surface className="border-amber-200 p-6"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700"><Settings2 className="size-5" /></span><div><h2 className="font-semibold">{result.message}</h2><p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Adicione GOOGLE_MAPS_API_KEY no ambiente do servidor para ativar resultados reais.</p></div></div></Surface> : null}
          {!attempted ? <Surface><EmptyState icon={<Building2 className="size-5" />} title="Defina sua busca" description="Escolha localização e segmento para consultar empresas reais. Nada será salvo antes da sua revisão." /></Surface> : null}
          {result?.ok && searchData ? <Surface className="overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4"><div><h2 className="text-sm font-semibold">{result.data.length} empresas encontradas</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Revise a fonte antes de importar para o CRM.</p></div><Badge tone="info">Google Places</Badge></div><div className="divide-y divide-[var(--border)]">{result.data.map((place) => <article className="flex flex-col gap-4 px-5 py-4 hover:bg-[var(--surface-subtle)] lg:flex-row lg:items-center lg:justify-between" key={place.placeId}><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Building2 className="size-[18px]" /></span><div><h3 className="text-sm font-semibold">{place.companyName}</h3><p className="mt-1 text-xs text-[var(--text-secondary)]">{place.category ?? "Categoria não informada"} · {place.address ?? "Endereço não informado"}</p><p className="mt-1.5 text-xs">{place.rating ? `${place.rating.toFixed(1)} · ${place.reviewCount ?? 0} avaliações` : "Sem avaliação disponível"}{place.phone ? ` · ${place.phone}` : ""}</p></div></div><div className="flex gap-2">{place.googleMapsUrl ? <a className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 text-xs font-semibold" href={place.googleMapsUrl} rel="noreferrer" target="_blank">Maps<ExternalLink className="size-3.5" /></a> : null}<Link className="inline-flex h-9 items-center rounded-xl bg-[var(--brand-primary)] px-3 text-xs font-semibold text-white" href={`/leads/novo?companyName=${encodeURIComponent(place.companyName)}&segment=${encodeURIComponent(place.category ?? searchData.segment)}&city=${encodeURIComponent(place.city ?? searchData.city)}&stateCode=${encodeURIComponent(place.stateCode ?? "")}&phone=${encodeURIComponent(place.phone ?? "")}&websiteUrl=${encodeURIComponent(place.websiteUrl ?? "")}&googleMapsUrl=${encodeURIComponent(place.googleMapsUrl ?? "")}&googlePlaceId=${encodeURIComponent(place.placeId)}`}>Revisar e importar</Link></div></article>)}</div></Surface> : null}
        </div>
      </div>
    </section>
  );
}
