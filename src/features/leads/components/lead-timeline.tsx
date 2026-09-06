import type { LeadWorkspaceRelations } from "../workspace-query";

export function LeadTimeline({ activities }: { activities: LeadWorkspaceRelations["activities"] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-bold text-slate-950">Histórico</h2>
      {activities.length ? <ol className="mt-4 space-y-4 border-l border-slate-200 pl-5">{activities.map((activity) => <li className="relative" key={activity.id}><span className="absolute -left-[25px] top-1 size-2 rounded-full bg-blue-500" /><p className="text-sm font-semibold text-slate-800">{activity.title}</p>{activity.description ? <p className="mt-1 text-sm text-slate-500">{activity.description}</p> : null}<p className="mt-1 text-xs text-slate-400">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(activity.occurredAt))}{activity.actorName ? ` · ${activity.actorName}` : ""}</p></li>)}</ol> : <p className="mt-3 text-sm text-slate-500">Nenhuma atividade registrada.</p>}
    </section>
  );
}
