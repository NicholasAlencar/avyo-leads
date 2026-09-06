import Link from "next/link";
import { requireMember } from "@/features/auth/require-member";
import { getFollowups } from "@/features/followups/query";
import { FollowupList } from "@/features/followups/components/followup-list";
import { PageHeading } from "@/components/ui/primitives";
import { CalendarClock } from "@/components/ui/icons";

export default async function FollowupsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const params = await searchParams;
  const status = params.status === "COMPLETED" || params.status === "CANCELLED" ? params.status : "PENDING";
  const page = Math.max(1, Math.min(100000, Math.floor(Number(params.page) || 1)));
  const { rows, total } = await getFollowups(await requireMember(), status, page);
  return <section className="mx-auto max-w-6xl">
    <PageHeading eyebrow="Agenda comercial" title="Follow-ups" description="Priorize as próximas conversas e mantenha cada oportunidade em movimento. Concluir uma tarefa nunca envia mensagens automaticamente." actions={<span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"><CalendarClock className="size-3.5 text-[var(--brand-primary)]" />{total} registros</span>} />
    <nav aria-label="Status de follow-ups" className="my-7 inline-flex flex-wrap gap-1 rounded-2xl border border-[var(--border)] bg-white p-1 shadow-[var(--shadow-card)]">{([['PENDING', 'Pendentes'], ['COMPLETED', 'Concluídos'], ['CANCELLED', 'Cancelados']] as const).map(([value, label]) => <Link key={value} aria-current={status === value ? "page" : undefined} href={`?status=${value}`} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${status === value ? 'bg-[var(--brand-midnight)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]'}`}>{label}</Link>)}</nav>
    <FollowupList rows={rows} />
    <nav aria-label="Paginação de follow-ups" className="mt-5 flex items-center gap-3 text-xs text-[var(--text-secondary)]"><span>Página {page}</span>{page > 1 ? <Link className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 font-semibold text-[var(--text-primary)]" href={`?status=${status}&page=${page - 1}`}>Anterior</Link> : null}{page * 50 < total ? <Link className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 font-semibold text-[var(--text-primary)]" href={`?status=${status}&page=${page + 1}`}>Próxima</Link> : null}</nav>
  </section>;
}
