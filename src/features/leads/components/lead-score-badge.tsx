export function scoreMeta(score: number | null) {
  if (score === null) return { label: "Sem score", className: "bg-slate-100 text-slate-500" };
  if (score >= 80) return { label: "Muito quente", className: "bg-red-50 text-red-700 ring-red-100" };
  if (score >= 65) return { label: "Quente", className: "bg-orange-50 text-orange-700 ring-orange-100" };
  if (score >= 50) return { label: "Promissor", className: "bg-amber-50 text-amber-800 ring-amber-100" };
  if (score >= 30) return { label: "Acompanhar", className: "bg-slate-100 text-slate-700 ring-slate-200" };
  return { label: "Baixa prioridade", className: "bg-slate-900 text-white ring-slate-900" };
}

export function LeadScoreBadge({ score }: { score: number | null }) {
  const meta = scoreMeta(score);
  return <div className="flex min-w-[94px] items-center gap-2"><span className={`grid size-9 place-items-center rounded-xl text-sm font-bold tabular-nums ring-1 ring-inset ${meta.className}`}>{score ?? "—"}</span><span className="text-[11px] font-medium leading-4 text-[var(--text-secondary)]">{meta.label}</span></div>;
}
