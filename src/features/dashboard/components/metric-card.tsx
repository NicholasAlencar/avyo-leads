import type { LucideIcon } from "lucide-react";

export function MetricCard({ label, value, detail, icon: Icon, emphasis = false }: { label: string; value: string | number; detail?: string; icon: LucideIcon; emphasis?: boolean }) {
  return (
    <article className={`relative overflow-hidden rounded-[18px] border p-5 ${emphasis ? "border-blue-500/15 bg-[var(--brand-navy)] text-white shadow-[0_16px_34px_rgba(7,20,38,.16)]" : "border-[var(--border)] bg-white text-[var(--text-primary)] shadow-[var(--shadow-card)]"}`}>
      <div className="flex items-start justify-between gap-4"><p className={`text-xs font-medium ${emphasis ? "text-slate-300" : "text-[var(--text-secondary)]"}`}>{label}</p><span className={`grid size-9 place-items-center rounded-xl ${emphasis ? "bg-white/8 text-cyan-300" : "bg-blue-50 text-blue-600"}`}><Icon className="size-[18px]" strokeWidth={1.8} /></span></div>
      <p className="mt-5 text-[1.65rem] font-semibold tracking-[-.04em] tabular-nums">{value}</p>
      {detail ? <p className={`mt-1 text-xs ${emphasis ? "text-slate-400" : "text-[var(--text-tertiary)]"}`}>{detail}</p> : null}
    </article>
  );
}
