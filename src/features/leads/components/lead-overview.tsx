import type { LeadDetail } from "../types";
import type { LeadWorkspaceRelations } from "../workspace-query";

function Fact({ label, value }: { label: string; value: string | number | null }) {
  return <div><dt className="text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--text-tertiary)]">{label}</dt><dd className="mt-1.5 text-sm font-medium text-[var(--text-primary)]">{value ?? "Não informado"}</dd></div>;
}

export function LeadOverview({ lead, workspace }: { lead: LeadDetail; workspace: LeadWorkspaceRelations }) {
  return (
    <div className="space-y-5">
      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Dados da empresa</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Segmento" value={lead.segment} />
          <Fact label="Localização" value={[lead.city, lead.stateCode].filter(Boolean).join("/") || null} />
          <Fact label="Telefone" value={lead.phone} />
          <Fact label="WhatsApp" value={lead.whatsapp} />
          <Fact label="E-mail" value={lead.email} />
          <Fact label="CNPJ público" value={lead.cnpj} />
          <Fact label="Valor potencial" value={lead.potentialValue === null ? null : lead.potentialValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
          <Fact label="Responsável" value={lead.ownerName} />
        </dl>
        {lead.description ? <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-6 text-slate-600">{lead.description}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {[[lead.websiteUrl, "Site"], [lead.instagramUrl, "Instagram"], [lead.linkedinUrl, "LinkedIn"], [lead.googleMapsUrl, "Google Maps"]].map(([url, label]) => url ? <a className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50" href={url} key={label} rel="noreferrer" target="_blank">{label}</a> : null)}
        </div>
      </section>

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">VIO Sales Intelligence</h2>
        {workspace.research ? (
          <dl className="mt-5 grid gap-5 md:grid-cols-2">
            <Fact label="Resumo" value={workspace.research.summary} />
            <Fact label="Por que é interessante" value={workspace.research.opportunityReason} />
            <Fact label="Possível dor (hipótese)" value={workspace.research.hypotheticalPain} />
            <Fact label="Serviço recomendado" value={workspace.research.recommendedService} />
          </dl>
        ) : <p className="mt-3 text-sm text-slate-500">Nenhuma análise persistida. O sistema não gera conclusões sem uma fonte de IA configurada e pesquisa real.</p>}
      </section>

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Fontes e confiança</h2>
        {workspace.sources.length ? <ul className="mt-4 divide-y divide-slate-100">{workspace.sources.map((source) => <li className="flex items-center justify-between gap-4 py-3" key={source.id}><div><p className="text-sm font-semibold text-slate-800">{source.source}</p><p className="text-xs text-slate-500">{source.fieldName ?? "Informação consolidada"} · confiança {source.confidence.toLowerCase()}</p></div><a className="text-xs font-bold text-blue-600" href={source.sourceUrl} rel="noreferrer" target="_blank">Abrir fonte</a></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Nenhuma fonte de enriquecimento registrada.</p>}
      </section>
    </div>
  );
}
