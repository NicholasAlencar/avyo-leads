"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import type { CurrentMember } from "@/features/auth/require-member";
import { AvyoLogo } from "@/components/ui/avyo-logo";
import { Avatar } from "@/components/ui/primitives";
import { ChevronRight } from "@/components/ui/icons";
import { SidebarNav } from "./sidebar-nav";

const roleLabels = { admin: "Administrador", manager: "Gestor", member: "Membro" } as const;

export function AppSidebar({ member }: { member: CurrentMember }) {
  const currentPath = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-white/[.07] bg-[var(--brand-midnight)] px-4 py-5 text-white lg:flex">
      <Link className="flex h-12 items-center rounded-xl px-2" href="/dashboard">
        <AvyoLogo className="h-auto w-[134px]" variant="light" />
      </Link>
      <div className="mt-7 flex-1 overflow-y-auto px-1"><SidebarNav currentPath={currentPath} /></div>
      <div className="mt-5 border-t border-white/[.07] pt-4">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-2 marker:hidden hover:bg-white/[.055]">
            <Avatar className="size-9" name={member.name} />
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-white">{member.name}</span><span className="mt-0.5 block text-[11px] text-slate-500">{roleLabels[member.role]}</span></span>
            <ChevronRight className="size-4 text-slate-600 transition group-open:rotate-90" />
          </summary>
          <form action={logoutAction} className="mt-1">
            <button className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-400 hover:bg-white/[.055] hover:text-white" type="submit">Sair da conta</button>
          </form>
        </details>
      </div>
    </aside>
  );
}
