"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Check, X } from "@/components/ui/icons";
import { Avatar, EmptyState, Surface } from "@/components/ui/primitives";
import type { FollowupRow } from "../query";
import { finishFollowup } from "../actions";

function dateKey(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function FollowupItem({ row }: { row: FollowupRow }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  function finish(status: "COMPLETED" | "CANCELLED") { startTransition(async () => { setError(""); try { const result = await finishFollowup(row.id, status); if (!result.ok) { setError(result.message); return; } router.refresh(); } catch { setError("Não foi possível atualizar. Tente novamente."); } }); }
  return <li className="flex flex-col gap-4 px-5 py-4 hover:bg-[var(--surface-subtle)] sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><Avatar className="size-9" name={row.lead.company_name} /><div><Link href={`/leads/${row.lead_id}`} className="text-sm font-semibold hover:text-blue-700">{row.lead.company_name}</Link><p className="mt-1 text-xs text-[var(--text-secondary)]">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(row.due_at))} · {row.owner.display_name}</p>{row.cadence_name ? <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">{row.cadence_name} · passo {row.cadence_position}</p> : null}{error ? <p role="alert" className="mt-1 text-xs text-red-700">{error}</p> : null}</div></div>{row.status === "PENDING" ? <div className="flex gap-2"><button disabled={pending} onClick={() => finish("COMPLETED")} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] px-3 text-xs font-semibold text-white disabled:opacity-50"><Check className="size-3.5" />Concluir</button><button disabled={pending} onClick={() => finish("CANCELLED")} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--text-secondary)] disabled:opacity-50"><X className="size-3.5" />Cancelar</button></div> : null}</li>;
}

export function FollowupList({ rows, now = new Date() }: { rows: FollowupRow[]; now?: Date }) {
  if (!rows.length) return <Surface><EmptyState actionHref="/leads" actionLabel="Abrir leads" icon={<CalendarClock className="size-5" />} title="Nenhum follow-up neste status" description="Agende o próximo contato na ficha de um lead." /></Surface>;
  const today = dateKey(now);
  const groups = rows[0]?.status === "PENDING" ? [
    { title: "Atrasados", rows: rows.filter((row) => dateKey(new Date(row.due_at)) < today), tone: "text-red-700" },
    { title: "Hoje", rows: rows.filter((row) => dateKey(new Date(row.due_at)) === today), tone: "text-blue-700" },
    { title: "Próximos", rows: rows.filter((row) => dateKey(new Date(row.due_at)) > today), tone: "text-[var(--text-primary)]" },
  ] : [{ title: "Registros", rows, tone: "text-[var(--text-primary)]" }];
  return <div className="space-y-5">{groups.filter((group) => group.rows.length).map((group) => <section key={group.title}><div className="mb-2 flex items-center gap-2 px-1"><h2 className={`text-xs font-semibold uppercase tracking-[.08em] ${group.tone}`}>{group.title}</h2><span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] ring-1 ring-[var(--border)]">{group.rows.length}</span></div><Surface className="overflow-hidden"><ul className="divide-y divide-[var(--border)]">{group.rows.map((row) => <FollowupItem key={row.id} row={row} />)}</ul></Surface></section>)}</div>;
}
