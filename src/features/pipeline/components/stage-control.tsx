"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeLeadStageAction } from "@/features/leads/actions";
import { getAllowedTransitions } from "../transitions";
import { pipelineLabels, type PipelineStage } from "../stages";

export function StageControl({ leadId, stage }: { leadId: string; stage: PipelineStage }) {
  const [target, setTarget] = useState<PipelineStage | "">("");
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form className="mt-3 space-y-2" onSubmit={(event) => {
      event.preventDefault();
      if (!target) return;
      setMessage(null);
      startTransition(async () => {
        try {
          const result = await changeLeadStageAction({ leadId, from: stage, to: target, confirmed });
          if (!result.ok) { setMessage(result.message); return; }
          setTarget(""); setConfirmed(false); setMessage("Etapa atualizada."); router.refresh();
        } catch { setMessage("Não foi possível alterar a etapa. Tente novamente."); }
      });
    }}>
      <label className="block text-xs font-semibold text-slate-600">
        Mover para
        <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm" value={target} disabled={pending} onChange={(event) => { setTarget(event.target.value as PipelineStage); setConfirmed(false); }}>
          <option value="">Selecione uma etapa</option>
          {getAllowedTransitions(stage).map((item) => <option key={item} value={item}>{pipelineLabels[item]}</option>)}
        </select>
      </label>
      {stage === "CLIENT" && target === "LOST" ? <label className="flex gap-2 text-xs text-slate-600"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} required />Confirmo a retirada deste cliente.</label> : null}
      <button type="submit" disabled={pending || !target} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{pending ? "Salvando..." : "Mover lead"}</button>
      {message ? <p role="status" className="text-xs text-slate-600">{message}</p> : null}
    </form>
  );
}
