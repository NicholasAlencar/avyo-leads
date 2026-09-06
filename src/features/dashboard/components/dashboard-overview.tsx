import Link from "next/link";
import { Activity, Building2, CalendarClock, CircleDollarSign, Sparkles, Target, TrendingUp, UsersRound } from "@/components/ui/icons";
import { Badge, EmptyState, PageHeading, Surface } from "@/components/ui/primitives";
import { calculateRates } from "../metrics";
import type { DashboardData } from "../query";
import { MetricCard } from "./metric-card";

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function DashboardOverview({ data, days }: { data: DashboardData; days: 30 | 90 | null }) {
  const { counts, segments, approach } = data;
  const rates = calculateRates(counts);
  const secondary = [
    ["Novos", counts.new], ["Abordados", counts.contacted], ["Respostas", counts.replies], ["Reuniões", counts.meetings], ["Propostas", counts.proposals], ["Clientes", counts.clients],
  ] as const;

  return (
    <section className="mx-auto max-w-[1480px] space-y-6">
      <PageHeading eyebrow="Comando comercial" title="Visão geral" description="Acompanhe as oportunidades que exigem atenção e o avanço real da operação." actions={<form className="flex items-center gap-2" method="get"><select aria-label="Período" className="h-10 rounded-xl border border-[var(--border-strong)] bg-white px-3 text-sm" defaultValue={days ?? "all"} name="days"><option value="all">Todo o período</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select><button className="h-10 rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm font-semibold hover:bg-[var(--surface-subtle)]">Aplicar</button></form>} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard detail={`${counts.qualified} qualificados`} emphasis icon={CircleDollarSign} label="Pipeline potencial" value={money(counts.potential)} />
        <MetricCard detail={`${counts.found} encontrados`} icon={Target} label="Leads quentes" value={counts.hot} />
        <MetricCard detail={`${counts.replies} respostas`} icon={TrendingUp} label="Taxa de resposta" value={`${rates.responseRate}%`} />
        <MetricCard detail={`${counts.clients} clientes`} icon={UsersRound} label="Receita fechada" value={money(counts.revenue)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Surface className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4"><div><p className="text-sm font-semibold">Prioridades</p><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Leads com score e contato disponíveis para avançar.</p></div><Badge tone="info">{approach.length} agora</Badge></div>
          {approach.length ? <div className="divide-y divide-[var(--border)]">{approach.map((lead) => <article className="grid gap-4 px-5 py-4 transition hover:bg-[var(--surface-subtle)] md:grid-cols-[1fr_auto] md:items-center" key={lead.id}><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Building2 className="size-[18px]" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold">{lead.company_name}</h2><Badge tone={lead.score >= 80 ? "danger" : "warning"}>{lead.score}/100</Badge></div><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{lead.conclusion}</p>{lead.reasons?.[0] ? <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-blue-700"><Sparkles className="size-3.5" />{lead.reasons[0]}</p> : null}</div></div><Link className="inline-flex h-9 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-3 text-xs font-semibold hover:border-blue-200 hover:text-blue-700" href={`/leads/${lead.id}`}>Abrir lead</Link></article>)}</div> : <EmptyState actionHref="/encontrar" actionLabel="Encontrar empresas" icon={<Target className="size-5" />} title="Nenhuma prioridade disponível" description="Busque empresas e gere o VIO Lead Score para montar sua fila de abordagem." />}
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Eficiência comercial</p><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Conversões acumuladas no período.</p></div><Activity className="size-5 text-blue-600" /></div>
          <div className="mt-5 space-y-4">{[["Resposta", rates.responseRate], ["Reunião", rates.meetingRate], ["Fechamento", rates.closingRate], ["Conversão total", rates.conversionRate]].map(([label, value]) => <div key={label}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-[var(--text-secondary)]">{label}</span><strong className="font-semibold tabular-nums">{value}%</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${Math.min(100, Number(value))}%` }} /></div></div>)}</div>
        </Surface>
      </div>

      <Surface className="overflow-hidden">
        <div className="grid divide-y divide-[var(--border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0 xl:grid-cols-6">{secondary.map(([label, value], index) => { const Icon = index === 0 ? Building2 : index === 1 ? Target : index === 2 ? Activity : index === 3 ? CalendarClock : index === 4 ? CircleDollarSign : UsersRound; return <div className="p-4" key={label}><Icon className="size-4 text-[var(--text-tertiary)]" /><p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{label}</p></div>; })}</div>
      </Surface>

      <Surface className="overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-4"><h2 className="text-sm font-semibold">Performance por segmento</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Compare volume, respostas e conversão para priorizar mercados.</p></div>
        {segments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[var(--surface-subtle)] text-[11px] uppercase tracking-[.08em] text-[var(--text-tertiary)]"><tr><th className="px-5 py-3 font-semibold">Segmento</th><th className="px-4 py-3 font-semibold">Leads</th><th className="px-4 py-3 font-semibold">Respostas</th><th className="px-4 py-3 font-semibold">Clientes</th><th className="px-5 py-3 font-semibold">Conversão</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{segments.map((item) => <tr className="hover:bg-[var(--surface-subtle)]" key={item.segment ?? "none"}><td className="px-5 py-3.5 font-medium">{item.segment ?? "Não informado"}</td><td className="px-4 py-3.5 tabular-nums">{item.found}</td><td className="px-4 py-3.5 tabular-nums">{item.replies}</td><td className="px-4 py-3.5 tabular-nums">{item.clients}</td><td className="px-5 py-3.5"><Badge tone="info">{calculateRates(item).conversionRate}%</Badge></td></tr>)}</tbody></table></div> : <EmptyState description="Os resultados aparecerão quando existirem leads no período selecionado." title="Sem dados por segmento" />}
      </Surface>
    </section>
  );
}
