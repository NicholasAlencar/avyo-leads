"use client";

import { usePathname } from "next/navigation";
import { AvyoLogo } from "@/components/ui/avyo-logo";
import { Menu, X } from "@/components/ui/icons";
import { SidebarNav } from "./sidebar-nav";

export function MobileNavigation() {
  const path = usePathname();
  return (
    <details className="group relative lg:hidden">
      <summary aria-label="Abrir navegação" className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-[var(--border)] bg-white text-[var(--text-secondary)] marker:hidden">
        <Menu className="size-5 group-open:hidden" />
        <X className="hidden size-5 group-open:block" />
      </summary>
      <div className="fixed inset-x-3 top-[68px] z-50 max-h-[calc(100vh-84px)] overflow-y-auto rounded-2xl border border-white/10 bg-[var(--brand-midnight)] p-4 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-white/8 pb-4">
          <AvyoLogo className="h-auto w-[132px]" variant="light" />
          <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">VIO LEADS</span>
        </div>
        <SidebarNav currentPath={path} />
      </div>
    </details>
  );
}
