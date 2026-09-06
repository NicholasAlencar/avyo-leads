"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFollowup } from "../actions";
import { CalendarClock } from "@/components/ui/icons";

const inputClass = "mt-1.5 h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-blue-500/10";

export function FollowupForm({ leadId, members, defaultOwner }: {
  leadId: string; members: { userId: string; name: string }[]; defaultOwner: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  return <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
    <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-[var(--brand-primary)]"><CalendarClock className="size-4" /></span><div><h2 className="text-sm font-semibold text-[var(--text-primary)]">Criar follow-up</h2><p className="mt-0.5 text-xs text-[var(--text-tertiary)]">Defina o próximo movimento comercial.</p></div></div>
    <form className="mt-5 space-y-4" onSubmit={(event) => {
      event.preventDefault(); const form = event.currentTarget; const values = new FormData(form);
      const date = new Date(String(values.get("dueAt")));
      if (Number.isNaN(date.getTime())) { setMessage("Informe data e hora válidas."); return; }
      setMessage("");
      startTransition(async () => {
        try {
          const result = await createFollowup({ leadId, ownerId: values.get("ownerId"), dueAt: date.toISOString(), cadenceName: values.get("cadenceName"), cadencePosition: values.get("cadencePosition") });
          if (!result.ok) { setMessage(result.message); return; }
          setMessage("Follow-up agendado."); form.reset(); router.refresh();
        } catch { setMessage("Não foi possível agendar. Tente novamente."); }
      });
    }}>
      <label className="block text-xs font-semibold text-[var(--text-secondary)]">Data e hora<input type="datetime-local" name="dueAt" required className={inputClass} /></label>
      <label className="block text-xs font-semibold text-[var(--text-secondary)]">Responsável<select name="ownerId" defaultValue={defaultOwner} className={inputClass}>{members.map((member) => <option key={member.userId} value={member.userId}>{member.name}</option>)}</select></label>
      <div className="grid grid-cols-[1fr_82px] gap-2"><label className="block text-xs font-semibold text-[var(--text-secondary)]">Cadência (opcional)<input name="cadenceName" maxLength={100} placeholder="Ex.: Prospecção 7 dias" className={inputClass} /></label><label className="block text-xs font-semibold text-[var(--text-secondary)]">Passo<input type="number" name="cadencePosition" defaultValue={0} min={0} max={32767} className={inputClass} /></label></div>
      <button disabled={pending} type="submit" className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[var(--brand-primary)] px-3 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(24,92,255,.18)] transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50">{pending ? "Agendando..." : "Agendar follow-up"}</button>
      {message ? <p role="status" className="text-xs text-[var(--text-secondary)]">{message}</p> : null}
    </form>
  </section>;
}
