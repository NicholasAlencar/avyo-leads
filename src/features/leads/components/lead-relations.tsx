import { addLeadNote, addLeadTag, addLeadToList, assignLeadOwner } from "../related-actions";
import type { LeadDetail } from "../types";
import type { LeadWorkspaceRelations } from "../workspace-query";
import { restoreLeadContact, suppressLeadContact } from "@/features/privacy/actions";

const inputClass = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm";
const buttonClass = "rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white";

export function LeadRelations({ lead, workspace }: { lead: LeadDetail; workspace: LeadWorkspaceRelations }) {
  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-950">Responsável</h2>
        <form action={assignLeadOwner.bind(null, lead.id)} className="mt-3 flex gap-2">
          <select className={inputClass} defaultValue={lead.ownerId ?? ""} name="ownerId"><option value="">Não atribuído</option>{workspace.members.map((member) => <option key={member.userId} value={member.userId}>{member.name}</option>)}</select>
          <button className={buttonClass} type="submit">Salvar</button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-950">Notas internas</h2>
        <form action={addLeadNote.bind(null, lead.id)} className="mt-3 space-y-2"><textarea className={`${inputClass} min-h-20`} maxLength={5000} name="body" placeholder="Registrar contexto comercial" required /><button className={buttonClass} type="submit">Adicionar nota</button></form>
        {workspace.notes.length ? <ul className="mt-4 space-y-3">{workspace.notes.map((note) => <li className="rounded-xl bg-slate-50 p-3" key={note.id}><p className="text-sm leading-5 text-slate-700">{note.body}</p><p className="mt-2 text-[11px] text-slate-400">{note.authorName} · {new Intl.DateTimeFormat("pt-BR").format(new Date(note.createdAt))}</p></li>)}</ul> : <p className="mt-3 text-xs text-slate-400">Sem notas.</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-950">Tags</h2>
        <div className="mt-3 flex flex-wrap gap-2">{workspace.tags.map((tag) => <span className="rounded-full px-2.5 py-1 text-xs font-bold text-white" key={tag.id} style={{ backgroundColor: tag.color }}>{tag.name}</span>)}</div>
        <form action={addLeadTag.bind(null, lead.id)} className="mt-3 flex gap-2"><input className={inputClass} maxLength={50} name="name" placeholder="Ex.: EXPANSÃO" required /><button className={buttonClass} type="submit">Adicionar</button></form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-950">Listas</h2>
        <p className="mt-2 text-xs text-slate-500">{workspace.lists.map((list) => list.name).join(" · ") || "Nenhuma lista"}</p>
        <form action={addLeadToList.bind(null, lead.id)} className="mt-3 flex gap-2"><input className={inputClass} maxLength={100} name="name" placeholder="Ex.: Clínicas SP" required /><button className={buttonClass} type="submit">Adicionar</button></form>
      </section>

      <section className={`rounded-2xl border p-5 ${lead.optedOutAt ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
        <h2 className="text-sm font-bold text-slate-950">Privacidade e contato</h2>
        {lead.optedOutAt ? <><p className="mt-2 text-sm text-red-700">Contato bloqueado por opt-out.</p><form action={restoreLeadContact.bind(null, lead.id)} className="mt-3"><button className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700" type="submit">Restaurar permissão</button></form></> : <form action={suppressLeadContact.bind(null, lead.id)} className="mt-3 space-y-2"><input className={inputClass} maxLength={500} minLength={3} name="reason" placeholder="Motivo do bloqueio" required /><button className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700" type="submit">Bloquear contato</button></form>}
      </section>
    </aside>
  );
}
