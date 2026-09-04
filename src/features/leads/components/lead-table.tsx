"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { pipelineLabels } from "@/features/pipeline/stages";
import type { LeadSummary } from "../types";

interface LeadTableProps {
  leads: LeadSummary[];
}

function ExternalLink({ href, label }: { href: string | null; label: string }) {
  if (!href) return <span className="text-slate-300">—</span>;
  return (
    <a
      aria-label={`${label} (abre em nova aba)`}
      className="font-semibold text-slate-600 hover:text-slate-950"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      Abrir
    </a>
  );
}

export function LeadTable({ leads }: LeadTableProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const allSelected = leads.length > 0 && leads.every((lead) => selected.has(lead.id));
  const selectedCount = useMemo(
    () => leads.reduce((count, lead) => count + Number(selected.has(lead.id)), 0),
    [leads, selected],
  );

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((current) => {
      const next = new Set(current);
      leads.forEach((lead) => {
        if (allSelected) next.delete(lead.id);
        else next.add(lead.id);
      });
      return next;
    });
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Nenhum lead encontrado</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Ajuste os filtros ou registre uma empresa com informações públicas verificadas.
        </p>
        <Link
          className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          href="/leads/novo"
        >
          Adicionar primeiro lead
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex min-h-11 items-center border-b border-slate-100 px-4 text-xs font-semibold text-slate-500">
        {selectedCount > 0 ? `${selectedCount} selecionado${selectedCount > 1 ? "s" : ""}` : `${leads.length} nesta página`}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  aria-label="Selecionar todos os leads visíveis"
                  checked={allSelected}
                  className="size-4 accent-slate-950"
                  onChange={toggleAll}
                  type="checkbox"
                />
              </th>
              <th className="px-3 py-3"><Link href="?sort=score_desc">Score</Link></th>
              <th className="px-3 py-3">Empresa</th>
              <th className="px-3 py-3">Segmento</th>
              <th className="px-3 py-3">Cidade</th>
              <th className="px-3 py-3">Contato</th>
              <th className="px-3 py-3">Site</th>
              <th className="px-3 py-3">Instagram</th>
              <th className="px-3 py-3">LinkedIn</th>
              <th className="min-w-60 px-3 py-3">Motivo da oportunidade</th>
              <th className="px-3 py-3">Responsável</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3"><Link href="?sort=recent_desc">Última atividade</Link></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr className="align-top hover:bg-slate-50/70" key={lead.id}>
                <td className="px-4 py-4">
                  <input
                    aria-label={`Selecionar ${lead.companyName}`}
                    checked={selected.has(lead.id)}
                    className="size-4 accent-slate-950"
                    onChange={() => toggle(lead.id)}
                    type="checkbox"
                  />
                </td>
                <td className="px-3 py-4">
                  {lead.score === null ? (
                    <span className="whitespace-nowrap text-xs text-slate-400">Sem score</span>
                  ) : (
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 font-bold text-emerald-700">{lead.score}</span>
                  )}
                </td>
                <td className="px-3 py-4">
                  <Link className="font-semibold text-slate-950 hover:underline" href={`/leads/${lead.id}`}>
                    {lead.companyName}
                  </Link>
                </td>
                <td className="px-3 py-4 text-slate-600">{lead.segment ?? "—"}</td>
                <td className="px-3 py-4 text-slate-600">
                  {[lead.city, lead.stateCode].filter(Boolean).join("/") || "—"}
                </td>
                <td className="px-3 py-4 text-slate-600">{lead.phone ?? lead.email ?? "—"}</td>
                <td className="px-3 py-4"><ExternalLink href={lead.websiteUrl} label={`Site de ${lead.companyName}`} /></td>
                <td className="px-3 py-4"><ExternalLink href={lead.instagramUrl} label={`Instagram de ${lead.companyName}`} /></td>
                <td className="px-3 py-4"><ExternalLink href={lead.linkedinUrl} label={`LinkedIn de ${lead.companyName}`} /></td>
                <td className="px-3 py-4 text-xs leading-5 text-slate-600">
                  {lead.opportunityReason ?? "Ainda não analisado"}
                </td>
                <td className="px-3 py-4 text-slate-600">{lead.ownerName ?? "Não atribuído"}</td>
                <td className="px-3 py-4">
                  <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {pipelineLabels[lead.pipelineStage]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-500">
                  {lead.lastActivityAt
                    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(lead.lastActivityAt))
                    : "Sem atividade"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
