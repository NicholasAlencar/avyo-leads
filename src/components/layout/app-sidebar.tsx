import Link from "next/link";
import { AvyoLogo } from "@/components/ui/avyo-logo";

const navigation = [
  { href: "/dashboard", label: "Visão geral", marker: "01" },
  { href: "/leads", label: "Leads", marker: "02" },
  { href: "/encontrar", label: "Encontrar empresas", marker: "03" },
  { href: "/pipeline", label: "Pipeline", marker: "04" },
  { href: "/follow-ups", label: "Follow-ups", marker: "05" },
  { href: "/configuracoes/integracoes", label: "Integrações", marker: "06" },
];

export function AppSidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-white/8 bg-[var(--avyo-midnight)] px-4 py-4 text-white lg:fixed lg:inset-y-0 lg:w-[276px] lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
      <Link className="flex items-center gap-3 rounded-2xl px-2" href="/dashboard">
        <AvyoLogo variant="light" />
      </Link>
      <p className="mt-8 hidden px-3 text-[10px] font-bold uppercase tracking-[.22em] text-slate-500 lg:block">Operação comercial</p>
      <nav aria-label="Navegação principal" className="mt-4 flex gap-1 overflow-x-auto lg:flex-col">
        {navigation.map((item) => (
          <Link
            className="group flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-[#075bff]/15 hover:text-white"
            href={item.href}
            key={item.href}
          >
            <span className="grid size-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-[10px] font-bold text-cyan-300 transition group-hover:border-blue-400/50 group-hover:bg-blue-500/20">
              {item.marker}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto hidden overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-br from-blue-500/15 to-cyan-400/5 p-4 lg:block">
        <span className="inline-flex rounded-full bg-blue-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-200">Intelligence</span>
        <p className="mt-3 text-sm font-semibold text-white">Menos volume. Mais fit.</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Decisões comerciais apoiadas por sinais públicos e contexto real.</p>
      </div>
    </aside>
  );
}
