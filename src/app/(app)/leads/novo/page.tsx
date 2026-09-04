import Link from "next/link";
import { LeadForm } from "@/features/leads/components/lead-form";

export default function NewLeadPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" href="/leads">← Voltar para leads</Link>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Novo registro</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Adicionar lead</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Registre somente informações empresariais públicas e verificáveis. Campos não conhecidos devem permanecer vazios.</p>
      <div className="mt-7"><LeadForm /></div>
    </section>
  );
}
