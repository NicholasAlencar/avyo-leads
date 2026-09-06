import Link from "next/link";
import { requireMember } from "@/features/auth/require-member";
import { searchGooglePlaces } from "@/features/search/google-places";
import { companySearchSchema } from "@/features/search/schema";

export default async function FindCompaniesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireMember();
  const params = await searchParams;
  const attempted = params.buscar === "1";
  const parsed = companySearchSchema.safeParse({
    state: params.state, city: params.city, district: params.district, segment: params.segment,
    keyword: params.keyword, limit: params.limit,
  });
  const searchData = parsed.success ? parsed.data : null;
  const result = attempted && searchData ? await searchGooglePlaces(searchData) : null;

  return (
    <main className="space-y-6">
      <div><p className="text-sm font-semibold text-lime-600">PROSPECÇÃO</p><h1 className="text-3xl font-bold text-slate-950">Encontrar empresas</h1><p className="mt-1 text-slate-600">Pesquisa oficial no Google Places. Nenhum resultado é inventado.</p></div>
      <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <input name="buscar" type="hidden" value="1" />
        <label className="text-sm font-medium">Estado<input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={typeof params.state === "string" ? params.state : "São Paulo"} name="state" required /></label>
        <label className="text-sm font-medium">Cidade<input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={typeof params.city === "string" ? params.city : ""} name="city" required /></label>
        <label className="text-sm font-medium">Bairro<input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={typeof params.district === "string" ? params.district : ""} name="district" /></label>
        <label className="text-sm font-medium">Segmento<input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={typeof params.segment === "string" ? params.segment : ""} name="segment" placeholder="Clínicas odontológicas" required /></label>
        <label className="text-sm font-medium">Palavra-chave<input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={typeof params.keyword === "string" ? params.keyword : ""} name="keyword" /></label>
        <label className="text-sm font-medium">Resultados<select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={typeof params.limit === "string" ? params.limit : "10"} name="limit"><option>5</option><option>10</option><option>20</option></select></label>
        <button className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white md:col-span-3" type="submit">BUSCAR LEADS</button>
      </form>
      {attempted && !parsed.success && <p className="rounded-xl bg-amber-50 p-4 text-amber-900">Preencha estado, cidade e segmento corretamente.</p>}
      {result && !result.ok && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><strong>{result.message}</strong><p className="mt-1 text-sm text-amber-800">Adicione GOOGLE_MAPS_API_KEY no ambiente do servidor para ativar resultados reais.</p></div>}
      {result?.ok && searchData && <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{result.data.length} empresas encontradas</h2><span className="text-xs text-slate-500">Fonte: Google Places</span></div>{result.data.map((place) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={place.placeId}><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-lg font-bold">{place.companyName}</h3><p className="text-sm text-slate-600">{place.category ?? "Categoria não informada"} · {place.address ?? "Endereço não informado"}</p><p className="mt-2 text-sm">{place.rating ? `${place.rating.toFixed(1)} (${place.reviewCount ?? 0} avaliações)` : "Sem avaliação disponível"} {place.phone ? ` · ${place.phone}` : ""}</p></div><div className="flex gap-2">{place.googleMapsUrl && <a className="rounded-lg border px-3 py-2 text-sm" href={place.googleMapsUrl} rel="noreferrer" target="_blank">Maps</a>}<Link className="rounded-lg bg-[#bbff45] px-3 py-2 text-sm font-bold text-slate-950" href={`/leads/novo?companyName=${encodeURIComponent(place.companyName)}&segment=${encodeURIComponent(place.category ?? searchData.segment)}&city=${encodeURIComponent(place.city ?? searchData.city)}&stateCode=${encodeURIComponent(place.stateCode ?? "")}&phone=${encodeURIComponent(place.phone ?? "")}&websiteUrl=${encodeURIComponent(place.websiteUrl ?? "")}&googleMapsUrl=${encodeURIComponent(place.googleMapsUrl ?? "")}&googlePlaceId=${encodeURIComponent(place.placeId)}`}>Revisar e importar</Link></div></div></article>)}</section>}
    </main>
  );
}
