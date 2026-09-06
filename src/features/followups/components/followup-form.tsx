"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFollowup } from "../actions";

export function FollowupForm({ leadId, members, defaultOwner }: {
  leadId: string; members: { userId: string; name: string }[]; defaultOwner: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  return <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="text-sm font-bold">Criar follow-up</h2>
    <form className="mt-3 space-y-3" onSubmit={(event) => {
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
      <label className="block text-xs font-semibold">Data e hora (fuso deste dispositivo)<input type="datetime-local" name="dueAt" required className="mt-1 w-full rounded-lg border border-slate-200 p-2" /></label>
      <label className="block text-xs font-semibold">Responsável<select name="ownerId" defaultValue={defaultOwner} className="mt-1 w-full rounded-lg border border-slate-200 p-2">{members.map((member) => <option key={member.userId} value={member.userId}>{member.name}</option>)}</select></label>
      <label className="block text-xs font-semibold">Cadência (opcional)<input name="cadenceName" maxLength={100} className="mt-1 w-full rounded-lg border border-slate-200 p-2" /></label>
      <label className="block text-xs font-semibold">Passo da cadência<input type="number" name="cadencePosition" defaultValue={0} min={0} max={32767} className="mt-1 w-full rounded-lg border border-slate-200 p-2" /></label>
      <button disabled={pending} type="submit" className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{pending ? "Agendando..." : "Agendar follow-up"}</button>
      {message ? <p role="status" className="text-xs text-slate-600">{message}</p> : null}
    </form>
  </section>;
}
