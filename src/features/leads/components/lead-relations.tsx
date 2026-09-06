import { addLeadNote, addLeadTag, addLeadToList, assignLeadOwner } from "../related-actions";
import type { LeadDetail } from "../types";
import type { LeadWorkspaceRelations } from "../workspace-query";
import { restoreLeadContact, suppressLeadContact } from "@/features/privacy/actions";
import { ListFilter, Settings2, Tag, UserRound } from "lucide-react";

const inputClass = "w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-blue-500/10";
const buttonClass = "rounded-xl bg-[var(--brand-midnight)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--brand-primary)]";
const cardClass = "rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]";

function SectionTitle({ icon: Icon, children }: { icon: typeof UserRound; children: React.ReactNode }) {
  return <div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-xl bg-blue-50 text-[var(--brand-primary)]"><Icon className="size-4" /></span><h2 className="text-sm font-semibold text-[var(--text-primary)]">{children}</h2></div>;
}

export function LeadRelations({ lead, workspace }: { lead: LeadDetail; workspace: LeadWorkspaceRelations }) {
  return (
    <aside className="space-y-5">
      <section className={cardClass}>
        <SectionTitle icon={UserRound}>Responsável</SectionTitle>
        <form action={assignLeadOwner.bind(null, lead.id)} className="mt-3 flex gap-2">
          <select className={inputClass} defaultValue={lead.ownerId ?? ""} name="ownerId"><option value="">Não atribuído</option>{workspace.members.map((member) => <option key={member.userId} value={member.userId}>{member.name}</option>)}</select>
          <button className={buttonClass} type="submit">Salvar</button>
        </form>
      </section>

      <section className={cardClass}>
        <SectionTitle icon={Settings2}>Notas internas</SectionTitle>
        <form action={addLeadNote.bind(null, lead.id)} className="mt-3 space-y-2"><textarea className={`${inputClass} min-h-20`} maxLength={5000} name="body" placeholder="Registrar contexto comercial" required /><button className={buttonClass} type="submit">Adicionar nota</button></form>
        {workspace.notes.length ? <ul className="mt-4 space-y-3">{workspace.notes.map((note) => <li className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3" key={note.id}><p className="text-sm leading-5 text-[var(--text-secondary)]">{note.body}</p><p className="mt-2 text-[11px] text-[var(--text-tertiary)]">{note.authorName} · {new Intl.DateTimeFormat("pt-BR").format(new Date(note.createdAt))}</p></li>)}</ul> : <p className="mt-3 text-xs text-[var(--text-tertiary)]">Sem notas.</p>}
      </section>

      <section className={cardClass}>
        <SectionTitle icon={Tag}>Tags</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-2">{workspace.tags.map((tag) => <span className="rounded-full px-2.5 py-1 text-xs font-bold text-white" key={tag.id} style={{ backgroundColor: tag.color }}>{tag.name}</span>)}</div>
        <form action={addLeadTag.bind(null, lead.id)} className="mt-3 flex gap-2"><input className={inputClass} maxLength={50} name="name" placeholder="Ex.: EXPANSÃO" required /><button className={buttonClass} type="submit">Adicionar</button></form>
      </section>

      <section className={cardClass}>
        <SectionTitle icon={ListFilter}>Listas</SectionTitle>
        <p className="mt-3 text-xs text-[var(--text-secondary)]">{workspace.lists.map((list) => list.name).join(" · ") || "Nenhuma lista"}</p>
        <form action={addLeadToList.bind(null, lead.id)} className="mt-3 flex gap-2"><input className={inputClass} maxLength={100} name="name" placeholder="Ex.: Clínicas SP" required /><button className={buttonClass} type="submit">Adicionar</button></form>
      </section>

      <section className={`rounded-[var(--radius-panel)] border p-5 shadow-[var(--shadow-card)] ${lead.optedOutAt ? "border-red-200 bg-red-50" : "border-[var(--border)] bg-white"}`}>
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Privacidade e contato</h2>
        {lead.optedOutAt ? <><p className="mt-2 text-sm text-red-700">Contato bloqueado por opt-out.</p><form action={restoreLeadContact.bind(null, lead.id)} className="mt-3"><button className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700" type="submit">Restaurar permissão</button></form></> : <form action={suppressLeadContact.bind(null, lead.id)} className="mt-3 space-y-2"><input className={inputClass} maxLength={500} minLength={3} name="reason" placeholder="Motivo do bloqueio" required /><button className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700" type="submit">Bloquear contato</button></form>}
      </section>
    </aside>
  );
}
