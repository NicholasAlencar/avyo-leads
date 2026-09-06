import Link from "next/link";
import { requireMember } from "@/features/auth/require-member";
import { getFollowups } from "@/features/followups/query";
import { FollowupList } from "@/features/followups/components/followup-list";

export default async function FollowupsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const params = await searchParams;
  const status = params.status === "COMPLETED" || params.status === "CANCELLED" ? params.status : "PENDING";
  const page = Math.max(1, Math.min(100000, Math.floor(Number(params.page) || 1)));
  const { rows, total } = await getFollowups(await requireMember(), status, page);
  return <section className="mx-auto max-w-6xl">
    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Próximas conversas</p><h1 className="mt-2 text-3xl font-bold">Follow-ups</h1>
    <p className="mt-2 text-sm text-slate-600">Acompanhe prazos e registre as tarefas concluídas. Nenhuma mensagem é enviada ao concluir uma tarefa.</p>
    <nav aria-label="Status de follow-ups" className="my-6 flex gap-2">{([['PENDING', 'Pendentes'], ['COMPLETED', 'Concluídos'], ['CANCELLED', 'Cancelados']] as const).map(([value, label]) => <Link key={value} aria-current={status === value ? "page" : undefined} href={`?status=${value}`} className={`rounded-lg px-4 py-2 text-sm font-semibold ${status === value ? 'bg-slate-950 text-white' : 'bg-white text-slate-600'}`}>{label}</Link>)}</nav>
    <FollowupList rows={rows} />
    <nav aria-label="Paginação de follow-ups" className="mt-5 flex gap-4 text-sm"><span>{total} registros · página {page}</span>{page > 1 ? <Link href={`?status=${status}&page=${page - 1}`}>Anterior</Link> : null}{page * 50 < total ? <Link href={`?status=${status}&page=${page + 1}`}>Próxima</Link> : null}</nav>
  </section>;
}
