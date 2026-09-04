import Link from "next/link";

const navigation = [
  { href: "/dashboard", label: "Dashboard", marker: "D" },
  { href: "/leads", label: "Leads", marker: "L" },
  { href: "/pipeline", label: "Pipeline", marker: "P" },
  { href: "/follow-ups", label: "Follow-ups", marker: "F" },
  { href: "/configuracoes/integracoes", label: "Integrações", marker: "I" },
];

export function AppSidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-[#0d1821] px-4 py-4 text-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r lg:border-white/5 lg:px-5 lg:py-7">
      <Link className="flex items-center gap-3 px-2" href="/dashboard">
        <span className="grid size-9 place-items-center rounded-xl bg-[#bbff45] text-sm font-black text-[#0d1821]">
          V
        </span>
        <span>
          <span className="block text-sm font-bold tracking-[0.16em]">VIO LEADS</span>
          <span className="block text-[11px] text-slate-400">Inteligência comercial</span>
        </span>
      </Link>

      <nav aria-label="Navegação principal" className="mt-5 flex gap-1 overflow-x-auto lg:mt-10 lg:flex-col">
        {navigation.map((item) => (
          <Link
            className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
            href={item.href}
            key={item.href}
          >
            <span className="grid size-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-[11px] font-bold text-[#bbff45]">
              {item.marker}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto hidden rounded-2xl border border-white/8 bg-white/5 p-4 lg:block">
        <p className="text-xs font-semibold text-white">Dados públicos, uso responsável</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Privacy-by-design e rastreabilidade de fontes em todo o fluxo.
        </p>
      </div>
    </aside>
  );
}
