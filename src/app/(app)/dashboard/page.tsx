import Link from "next/link";
import { requireMember } from "@/features/auth/require-member";
import { getDashboard } from "@/features/dashboard/query";
import { calculateRates } from "@/features/dashboard/metrics";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const params = await searchParams;
  const days = params.days === "30" ? 30 : params.days === "90" ? 90 : null;
  const { counts, segments, approach } = await getDashboard(await requireMember(), days);
  const rates = calculateRates(counts);
  const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const cards = [["Encontrados", counts.found], ["Novos", counts.new], ["Qualificados (score ≥50)", counts.qualified], ["Quentes (score ≥65)", counts.hot], ["Abordados", counts.contacted], ["Respostas", counts.replies], ["Respostas positivas", counts.positive], ["Reuniões", counts.meetings], ["Propostas", counts.proposals], ["Clientes", counts.clients], ["Valor potencial", money(counts.potential)], ["Receita fechada", money(counts.revenue)]];
  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Visão geral</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Dashboard</h1>
      <p className="mt-3 text-sm text-slate-500">Resultados acumulados até hoje dos leads encontrados no período. Cada empresa é contada uma vez por etapa atingida.</p>
      <form method="get" className="mt-4 flex gap-2"><label className="text-sm">Período de descoberta<select name="days" defaultValue={days ?? "all"} className="ml-2 rounded-lg border border-slate-200 bg-white p-2"><option value="all">Todo o período</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select></label><button className="rounded-lg bg-slate-950 px-3 py-2 text-sm text-white">Aplicar</button></form>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label,value]) => <article className="rounded-xl border border-slate-200 bg-white p-4" key={label}><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p></article>)}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">{[["Resposta",rates.responseRate,"Respostas / abordados"],["Reunião",rates.meetingRate,"Reuniões / abordados"],["Fechamento",rates.closingRate,"Clientes / reuniões"],["Conversão",rates.conversionRate,"Clientes / encontrados"]].map(([label,value,definition]) => <article className="rounded-xl bg-slate-950 p-4 text-white" key={label}><p className="text-xs">Taxa de {label}</p><p className="mt-2 text-2xl font-bold">{value}%</p><p className="mt-1 text-xs text-slate-400">{definition}</p></article>)}</div>
      <section className="mt-8"><h2 className="text-xl font-bold">Abordar agora</h2><p className="mt-1 text-sm text-slate-500">Até cinco leads com score registrado, contato disponível e sem bloqueio ou contato nos últimos três dias.</p>{approach.length ? <div className="mt-4 grid gap-4 lg:grid-cols-3">{approach.map((lead) => <article key={lead.id} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">{lead.company_name} · {lead.score}/100</h3><p className="mt-3 text-sm text-slate-600">{lead.conclusion}</p>{lead.reasons?.length ? <ul className="mt-3 list-inside list-disc text-xs leading-6 text-slate-500">{lead.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : null}<Link className="mt-4 inline-block rounded-lg bg-slate-950 px-3 py-2 text-sm text-white" href={`/leads/${lead.id}`}>Abrir lead</Link></article>)}</div> : <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">Nenhum lead com score e contato elegível no momento.</p>}</section>
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-bold">Performance por segmento</h2>{segments.length ? <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="py-2">Segmento</th><th>Leads</th><th>Respostas</th><th>Clientes</th><th>Conversão</th></tr></thead><tbody>{segments.map((item) => <tr className="border-t border-slate-100" key={item.segment ?? "none"}><td className="py-3">{item.segment ?? "Não informado"}</td><td>{item.found}</td><td>{item.replies}</td><td>{item.clients}</td><td>{calculateRates(item).conversionRate}%</td></tr>)}</tbody></table></div> : <p className="mt-3 text-sm text-slate-500">Nenhum registro no período selecionado.</p>}</section>
    </section>
  );
}
