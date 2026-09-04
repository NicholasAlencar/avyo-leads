import Link from "next/link";

export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Visão geral</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Dashboard</h1>
      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-7">
        <h2 className="text-lg font-semibold text-slate-900">Base comercial pronta para configuração</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Nenhuma métrica é simulada. Os indicadores aparecerão aqui somente a partir dos registros persistidos da sua organização.
        </p>
        <Link
          className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          href="/configuracoes/integracoes"
        >
          Verificar integrações
        </Link>
      </div>
    </section>
  );
}
