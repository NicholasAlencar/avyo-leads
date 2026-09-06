"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FollowupRow } from "../query";
import { finishFollowup } from "../actions";

function FollowupItem({ row }: { row: FollowupRow }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  function finish(status: "COMPLETED" | "CANCELLED") {
    startTransition(async () => {
      setError("");
      try {
        const result = await finishFollowup(row.id, status);
        if (!result.ok) { setError(result.message); return; }
        router.refresh();
      } catch { setError("Não foi possível atualizar. Tente novamente."); }
    });
  }
  return <li className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
    <div><Link href={`/leads/${row.lead_id}`} className="font-semibold hover:underline">{row.lead.company_name}</Link>
      <p className="mt-1 text-sm text-slate-500">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(row.due_at))} (Brasília) · {row.owner.display_name}</p>
      {row.cadence_name ? <p className="text-xs text-slate-500">{row.cadence_name} · passo {row.cadence_position}</p> : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </div>
    {row.status === "PENDING" ? <div className="flex gap-2"><button disabled={pending} onClick={() => finish("COMPLETED")} className="rounded-lg bg-slate-950 px-3 py-2 text-sm text-white disabled:opacity-50">Concluir</button><button disabled={pending} onClick={() => finish("CANCELLED")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50">Cancelar</button></div> : null}
  </li>;
}

export function FollowupList({ rows }: { rows: FollowupRow[] }) {
  if (!rows.length) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-semibold">Nenhum follow-up neste status</h2><p className="mt-2 text-sm text-slate-500">Agende o próximo contato na ficha de um lead.</p><Link className="mt-4 inline-block text-sm font-semibold underline" href="/leads">Abrir leads</Link></div>;
  return <ul className="space-y-3">{rows.map((row) => <FollowupItem key={row.id} row={row} />)}</ul>;
}
