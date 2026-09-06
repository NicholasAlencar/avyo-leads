import type { CurrentMember } from "@/features/auth/require-member";
import Link from "next/link";
import { MobileNavigation } from "./mobile-navigation";
import { Plus, Search } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/primitives";

interface AppHeaderProps {
  member: CurrentMember;
}

export function AppHeader({ member }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-[var(--border)] bg-white/88 px-4 backdrop-blur-xl lg:px-7">
      <MobileNavigation />
      <form action="/leads" className="relative hidden w-full max-w-md md:block" method="get">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input aria-label="Buscar leads" className="h-10 w-full rounded-xl border border-transparent bg-[var(--surface-subtle)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-blue-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10" name="q" placeholder="Buscar empresa, cidade ou segmento..." />
      </form>
      <div className="ml-auto flex items-center gap-1.5">
        <Link className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-3.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,92,255,.2)] hover:bg-[var(--brand-primary-hover)]" href="/leads/novo"><Plus className="size-4" /><span className="hidden sm:inline">Novo lead</span></Link>
        <div className="ml-1 flex items-center gap-2 border-l border-[var(--border)] pl-3 lg:hidden"><Avatar name={member.name} /></div>
      </div>
    </header>
  );
}
